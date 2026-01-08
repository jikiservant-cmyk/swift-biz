
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Save, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export function CashBookPage() {
  const { toast } = useToast();
  const [headers, setHeaders] = useState<string[]>([]);
  const [gridData, setGridData] = useState<string[][]>([]);
  const [viewData, setViewData] = useState<string[][]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedCols, setSelectedCols] = useState<Set<number>>(new Set());
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    try {
      const savedHeaders = localStorage.getItem("cashBookHeaders");
      const savedGridData = localStorage.getItem("cashBookGridData");
      if (savedHeaders) {
        setHeaders(JSON.parse(savedHeaders));
      } else {
        setHeaders(["Header 1", "Header 2", "Header 3"]);
      }
      if (savedGridData) {
        const data = JSON.parse(savedGridData);
        setGridData(data);
      } else {
        setGridData([
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
        ]);
      }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setHeaders(["Header 1", "Header 2", "Header 3"]);
        setGridData([
            ["", "", ""],
            ["", "", ""],
            ["", "", ""],
        ]);
    }
  }, []);

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
      const result = eval(expression);
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
    newData[rowIndex][colIndex] = e.target.value;
    setGridData(newData);
  };

  const handleCellFocus = (e: React.FocusEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    e.target.value = gridData[rowIndex][colIndex];
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
    try {
      localStorage.setItem("cashBookHeaders", JSON.stringify(headers));
      localStorage.setItem("cashBookGridData", JSON.stringify(gridData));
      toast({
        title: "Data Saved!",
        description: "Your cash book has been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
      toast({
        title: "Error",
        description: "Could not save your data.",
        variant: "destructive",
      });
    }
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

  const handleGenerateChart = () => {
    if (selectedRows.size === 0 || selectedCols.size < 2) {
      toast({
        title: "Not enough data selected",
        description: "Please select at least one row and two columns (one for labels, one for values).",
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
        });

        return chartEntry;
    });

    setChartData(data);
  };

  const chartColors = useMemo(() => ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"], []);
  const selectedDataHeaders = useMemo(() => {
      if (selectedCols.size < 2) return [];
      const selCols = Array.from(selectedCols).sort((a, b) => a - b);
      return selCols.slice(1).map(colIndex => headers[colIndex] || `Column ${colIndex + 1}`);
  }, [selectedCols, headers]);


  return (
    <>
      <PageHeader title="Cash Book" />
      <Card>
        <CardHeader>
          <CardTitle>Data Grid</CardTitle>
          <CardDescription>
            An editable grid for your cash book data. You can perform calculations by starting a cell with '=' (e.g., =A1+B2). Select rows and columns to generate a chart.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={addRow}>
              <Plus className="mr-2 h-4 w-4" /> Add Row
            </Button>
            <Button onClick={addColumn} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Column
            </Button>
            <Button onClick={saveData} variant="secondary">
              <Save className="mr-2 h-4 w-4" /> Save Data
            </Button>
            <Button onClick={handleGenerateChart} variant="default">
              <BarChart className="mr-2 h-4 w-4" /> Generate Chart
            </Button>
          </div>
          <div className="overflow-x-auto">
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
                    {row.map((cell, colIndex) => (
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
          </div>
        </CardContent>
      </Card>
      
      {chartData.length > 0 && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Chart Analysis</CardTitle>
                <CardDescription>
                    Bar chart of your selected data. The first selected column is used for labels, and subsequent selected columns are used for values.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData}>
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
                        {selectedDataHeaders.map((header, index) => (
                          <Bar key={header} dataKey={header} fill={chartColors[index % chartColors.length]} />
                        ))}
                    </RechartsBarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      )}
    </>
  );
}
