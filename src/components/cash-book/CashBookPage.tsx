
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Save, BarChart, LineChart as LineChartIcon, AreaChart as AreaChartIcon, Wand2, Upload, PieChart as PieChartIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyzeCashBookData } from "@/ai/flows/cash-book-analysis";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from 'xlsx';
import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import type { CashBook } from "@/lib/types";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";


export function CashBookPage() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const [headers, setHeaders] = useState<string[]>([]);
  const [gridData, setGridData] = useState<string[][]>([]);
  const [viewData, setViewData] = useState<string[][]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedCols, setSelectedCols] = useState<Set<number>>(new Set());
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line" | "area" | "pie">("bar");
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cashbookDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid, 'cashbooks', 'main') : null),
    [firestore, user]
  );
  const { data: cashbookData, isLoading: isCashbookLoading } = useDoc<CashBook>(cashbookDocRef);

  useEffect(() => {
    if (cashbookData) {
      const loadedHeaders = cashbookData.headers || ["Header 1", "Header 2", "Header 3"];
      setHeaders(loadedHeaders);
      
      if(cashbookData.gridData) {
        // Convert from array of objects back to 2D array for the UI
        const loadedGridData = cashbookData.gridData.map(rowObj => {
          const rowArray: string[] = [];
          // Ensure we iterate in the same order as headers to maintain column integrity
          for(let i=0; i<loadedHeaders.length; i++) {
              rowArray[i] = rowObj[`col_${i}`] || "";
          }
          return rowArray;
        });
        setGridData(loadedGridData);
      } else {
        setGridData([["", "", ""], ["", "", ""], ["", "", ""]]);
      }

    } else if (!isCashbookLoading) {
      // Set initial data if no data exists
      const initialHeaders = ["Header 1", "Header 2", "Header 3"];
      setHeaders(initialHeaders);
      setGridData([
        Array(initialHeaders.length).fill(''),
        Array(initialHeaders.length).fill(''),
        Array(initialHeaders.length).fill(''),
      ]);
    }
  }, [cashbookData, isCashbookLoading]);


  const getCellValue = useCallback((cellId: string): number => {
    const colChar = cellId.match(/[A-Z]+/)?.[0];
    const rowNum = cellId.match(/\d+/)?.[0];
    
    if (!colChar || !rowNum) return NaN;

    const colIndex = colChar.charCodeAt(0) - 'A'.charCodeAt(0);
    const rowIndex = parseInt(rowNum, 10) - 1;

    if (rowIndex >= 0 && rowIndex < gridData.length && colIndex >= 0 && colIndex < headers.length) {
      const cellValue = gridData[rowIndex][colIndex];
      if (cellValue.startsWith('=')) {
          return NaN; 
      }
      const num = parseFloat(cellValue);
      return isNaN(num) ? 0 : num;
    }
    return NaN;
  }, [gridData, headers.length]);


  const evaluateFormula = useCallback((formula: string): string => {
    if (!formula.startsWith('=')) return formula;

    let expression = formula.substring(1);

    expression = expression.replace(/[A-Z]+\d+/g, (match) => {
        const value = getCellValue(match);
        return isNaN(value) ? '0' : value.toString();
    });

    try {
      // Using a safer evaluation method than direct eval
      const result = new Function(`return ${expression}`)();
      return String(result);
    } catch (e) {
      return "#ERROR";
    }
  }, [getCellValue]);

  useEffect(() => {
    const newViewData = gridData.map(row => 
      row.map(cell => {
        if (cell && cell.startsWith('=')) {
          return evaluateFormula(cell);
        }
        return cell;
      })
    );
    setViewData(newViewData);
  }, [gridData, evaluateFormula]);


  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>, colIndex: number) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = e.target.value;
    setHeaders(newHeaders);
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const newData = [...gridData];
    if(!newData[rowIndex]) newData[rowIndex] = [];
    newData[rowIndex][colIndex] = e.target.value;
    setGridData(newData);
  };

  const handleCellFocus = (e: React.FocusEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    e.target.value = gridData[rowIndex]?.[colIndex] ?? '';
  };

  const handleCellBlur = (e: React.FocusEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
     e.target.value = viewData[rowIndex]?.[colIndex] ?? '';
  };


  const addRow = () => {
    setGridData([...gridData, Array(headers.length).fill("")]);
  };

  const addColumn = () => {
    setHeaders([...headers, `Header ${headers.length + 1}`]);
    setGridData(gridData.map(row => [...row, ""]));
  };

  const saveData = () => {
    if (!cashbookDocRef) {
      toast({ title: "Error", description: "You must be logged in to save.", variant: "destructive" });
      return;
    }
    
    // Convert 2D array to an array of objects for Firestore
    const gridDataForFirestore = gridData.map(row => {
      const rowObj: {[key: string]: string} = {};
      row.forEach((cell, index) => {
        rowObj[`col_${index}`] = cell;
      });
      return rowObj;
    });

    const dataToSave = { id: 'main', headers, gridData: gridDataForFirestore };
    
    setDocumentNonBlocking(cashbookDocRef, dataToSave, { merge: true });

    toast({
      title: "Data Saved!",
      description: "Your cash book has been saved to the cloud.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        if (jsonData.length > 0) {
          const newHeaders = jsonData[0];
          const newGridData = jsonData.slice(1);
          setHeaders(newHeaders);
          setGridData(newGridData);
          toast({
            title: "File Uploaded",
            description: "Data from the Excel file has been loaded. Click 'Save Data' to persist changes.",
          });
        }
      } catch (error) {
        console.error("Failed to parse Excel file", error);
        toast({
          title: "Upload Error",
          description: "Could not parse the uploaded file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };


  const getColumnName = (index: number) => {
      return String.fromCharCode('A'.charCodeAt(0) + index);
  }

  const toggleRowSelection = (rowIndex: number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowIndex)) {
      newSelection.delete(rowIndex);
    } else {
      newSelection.add(rowIndex);
    }
    setSelectedRows(newSelection);
  };

  const toggleColSelection = (colIndex: number) => {
    const newSelection = new Set(selectedCols);
    if (newSelection.has(colIndex)) {
      newSelection.delete(colIndex);
    } else {
      newSelection.add(colIndex);
    }
    setSelectedCols(newSelection);
  };

  const getSelectedData = useCallback(() => {
    if (selectedRows.size === 0 || selectedCols.size === 0) {
      return [];
    }

    const selCols = Array.from(selectedCols).sort((a, b) => a - b);
    
    const data = Array.from(selectedRows).map(rowIndex => {
        const row = viewData[rowIndex];
        const entry: {[key: string]: string} = {};

        selCols.forEach(colIndex => {
            const header = headers[colIndex] || `Column ${colIndex + 1}`;
            entry[header] = row[colIndex];
        });

        return entry;
    });

    return data;

  }, [selectedRows, selectedCols, headers, viewData]);

  const handleGenerateChart = useCallback(() => {
    if (selectedRows.size === 0 || selectedCols.size < 2) {
      setChartData([]); // Clear chart data if selection is invalid
      return;
    }

    if (chartType === 'pie' && selectedCols.size > 2) {
      setChartData([]);
      toast({
        title: "Invalid selection for Pie Chart",
        description: "Please select one column for labels and one column for values for a pie chart.",
        variant: "destructive",
      });
      return;
    }

    const selCols = Array.from(selectedCols).sort((a, b) => a - b);
    const labelColumnIndex = selCols[0];
    const dataColumnIndices = selCols.slice(1);

    const data = Array.from(selectedRows).map(rowIndex => {
        const row = viewData[rowIndex];
        const chartEntry: {[key: string]: string | number} = {
            name: row[labelColumnIndex] || `Row ${rowIndex + 1}`
        };

        dataColumnIndices.forEach(colIndex => {
            const header = headers[colIndex] || `Column ${colIndex + 1}`;
            const value = parseFloat(row[colIndex]);
            chartEntry[header] = isNaN(value) ? 0 : value;
            if (chartType === 'pie') {
                chartEntry['value'] = isNaN(value) ? 0 : value;
            }
        });
        return chartEntry;
    });

    setChartData(data);
  }, [selectedRows, selectedCols, viewData, headers, chartType, toast]);

  const handleAiAnalysis = useCallback(async () => {
    const selectedData = getSelectedData();
    if (selectedData.length === 0) {
      setAiAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeCashBookData({ jsonData: JSON.stringify(selectedData, null, 2) });
      setAiAnalysis(result.analysis);
    } catch (e) {
      console.error(e);
      setAiAnalysis("There was an error while analyzing the data.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [getSelectedData]);
  
  // Effect for real-time chart updates
  useEffect(() => {
    if (chartData.length > 0) {
      handleGenerateChart();
    }
  }, [viewData, selectedRows, selectedCols, chartType, handleGenerateChart, chartData.length]);

  // Effect for real-time AI analysis
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (aiAnalysis !== null) {
        handleAiAnalysis();
      }
    }, 500); // Debounce to avoid excessive API calls while typing

    return () => clearTimeout(debounceTimeout);
  }, [viewData, selectedRows, selectedCols, handleAiAnalysis, aiAnalysis]);


  const chartColors = useMemo(() => ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"], []);
  const selectedDataHeaders = useMemo(() => {
      if (selectedCols.size < 2) return [];
      const selCols = Array.from(selectedCols).sort((a, b) => a - b);
      return selCols.slice(1).map(colIndex => headers[colIndex] || `Column ${colIndex + 1}`);
  }, [selectedCols, headers]);

  const renderChart = () => {
    const commonProps = {
        data: chartData,
        margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };
    const commonComps = (
      <>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
            contentStyle={{ 
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))"
            }}
        />
        <Legend />
      </>
    );
    
    switch(chartType) {
        case 'bar':
            return (
                <RechartsBarChart {...commonProps}>
                    {commonComps}
                    {selectedDataHeaders.map((header, index) => (
                      <Bar key={header} dataKey={header} fill={chartColors[index % chartColors.length]} />
                    ))}
                </RechartsBarChart>
            );
        case 'line':
            return (
                <LineChart {...commonProps}>
                    {commonComps}
                    {selectedDataHeaders.map((header, index) => (
                      <Line key={header} type="monotone" dataKey={header} stroke={chartColors[index % chartColors.length]} />
                    ))}
                </LineChart>
            );
        case 'area':
            return (
                <AreaChart {...commonProps}>
                    {commonComps}
                    {selectedDataHeaders.map((header, index) => (
                      <Area key={header} type="monotone" dataKey={header} stroke={chartColors[index % chartColors.length]} fill={chartColors[index % chartColors.length]} fillOpacity={0.3} />
                    ))}
                </AreaChart>
            );
        case 'pie':
            return (
                <RechartsPieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))"
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
            );
        default:
            return null;
    }
  };
  
  const handleInitialChartGeneration = () => {
    if (selectedRows.size === 0 || selectedCols.size < 2) {
      toast({
        title: "Not enough data selected",
        description: "Please select at least one row and two columns (one for labels, one for values).",
        variant: "destructive",
      });
      return;
    }
    handleGenerateChart();
  };

  const handleInitialAiAnalysis = () => {
     if (selectedRows.size === 0 || selectedCols.size === 0) {
      toast({
        title: "No data selected",
        description: "Please select some rows and columns to analyze.",
        variant: "destructive"
      });
      return;
    }
    handleAiAnalysis();
  };


  return (
    <>
      <PageHeader title="Cash Book" />
      <Card>
        <CardHeader>
          <CardTitle>Data Grid</CardTitle>
          <CardDescription>
            An editable grid for your cash book data. This data is now saved in real-time. You can perform calculations by starting a cell with '=' (e.g., =A1+B2). Select rows and columns to generate a chart or AI analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
             <Button onClick={addRow}>
              <Plus className="mr-2 h-4 w-4" /> Add Row
            </Button>
            <Button onClick={addColumn} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Column
            </Button>
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".xlsx, .xls"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Upload Excel
            </Button>
            <Button onClick={saveData} variant="secondary">
              <Save className="mr-2 h-4 w-4" /> Save Data
            </Button>
            <Button onClick={handleInitialChartGeneration} variant="default">
              <BarChart className="mr-2 h-4 w-4" /> Generate Chart
            </Button>
            <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">
                  <div className="flex items-center"><BarChart className="mr-2 h-4 w-4" />Bar Chart</div>
                </SelectItem>
                <SelectItem value="line">
                  <div className="flex items-center"><LineChartIcon className="mr-2 h-4 w-4" />Line Chart</div>
                </SelectItem>
                <SelectItem value="area">
                   <div className="flex items-center"><AreaChartIcon className="mr-2 h-4 w-4" />Area Chart</div>
                </SelectItem>
                <SelectItem value="pie">
                   <div className="flex items-center"><PieChartIcon className="mr-2 h-4 w-4" />Pie Chart</div>
                </SelectItem>
              </SelectContent>
            </Select>
             <Button onClick={handleInitialAiAnalysis} disabled={isAnalyzing}>
              <Wand2 className="mr-2 h-4 w-4" /> {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </div>
          <div className="overflow-x-auto">
            {isCashbookLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead className="w-12 sticky left-0 bg-card z-10"></TableHead>
                  {headers.map((header, colIndex) => (
                    <TableHead key={colIndex} className="text-center">
                        <div className="flex items-center gap-2 justify-center">
                         <Checkbox
                            checked={selectedCols.has(colIndex)}
                            onCheckedChange={() => toggleColSelection(colIndex)}
                          />
                         <Input
                          type="text"
                          value={header}
                          onChange={(e) => handleHeaderChange(e, colIndex)}
                          className="font-bold text-center"
                          placeholder={getColumnName(colIndex)}
                        />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {gridData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="font-bold text-center text-muted-foreground sticky left-0 bg-card z-10">
                      <div className="flex items-center gap-2 justify-center">
                        <Checkbox
                          checked={selectedRows.has(rowIndex)}
                          onCheckedChange={() => toggleRowSelection(rowIndex)}
                        />
                        {rowIndex + 1}
                      </div>
                    </TableCell>
                    {headers.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Input
                          type="text"
                          defaultValue={viewData[rowIndex]?.[colIndex] ?? ''}
                          onFocus={(e) => handleCellFocus(e, rowIndex, colIndex)}
                          onBlur={(e) => handleCellBlur(e, rowIndex, colIndex)}
                          onChange={(e) => handleCellChange(e, rowIndex, colIndex)}
                          placeholder={`${getColumnName(colIndex)}${rowIndex + 1}`}
                          className={selectedRows.has(rowIndex) || selectedCols.has(colIndex) ? 'bg-accent/20' : ''}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </div>
        </CardContent>
      </Card>
      
      {chartData.length > 0 && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Chart Analysis</CardTitle>
                <CardDescription>
                    {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart of your selected data. The chart will update in real-time as you edit the grid or change your selection.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </CardContent>
        </Card>
      )}

      {(isAnalyzing || aiAnalysis) && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" /> AI Analysis
                </CardTitle>
                <CardDescription>
                    AI-powered insights based on your selected data. This analysis will update in real-time as you edit the grid.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isAnalyzing ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-foreground dark:prose-invert whitespace-pre-wrap">
                    {aiAnalysis}
                  </div>
                )}
            </CardContent>
        </Card>
      )}
    </>
  );
}

    