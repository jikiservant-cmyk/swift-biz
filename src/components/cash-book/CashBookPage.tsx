"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CashBookPage() {
  const { toast } = useToast();
  const [headers, setHeaders] = useState<string[]>([]);
  const [gridData, setGridData] = useState<string[][]>([]);
  const [viewData, setViewData] = useState<string[][]>([]);

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
      // Check for circular reference
      if (cellValue.startsWith('=')) {
          return NaN; // Or handle error appropriately
      }
      const num = parseFloat(cellValue);
      return isNaN(num) ? 0 : num;
    }
    return NaN;
  }, [gridData, headers.length]);


  const evaluateFormula = useCallback((formula: string): string => {
    if (!formula.startsWith('=')) return formula;

    let expression = formula.substring(1);

    // Replace cell references (e.g., A1, B2) with their values
    expression = expression.replace(/[A-Z]+\d+/g, (match) => {
        const value = getCellValue(match);
        return isNaN(value) ? '0' : value.toString();
    });

    try {
      // Be careful with eval. For a real app, use a safer expression parser.
      // This is a simplified example.
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
     e.target.value = viewData[rowIndex][colIndex];
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

  return (
    <>
      <PageHeader title="Cash Book" />
      <Card>
        <CardHeader>
          <CardTitle>Data Grid</CardTitle>
          <CardDescription>
            An editable grid for your cash book data. You can perform calculations by starting a cell with '=' (e.g., =A1+B2).
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
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead className="w-12"></TableHead>
                  {headers.map((header, colIndex) => (
                    <TableHead key={colIndex}>
                       <Input
                        type="text"
                        value={header}
                        onChange={(e) => handleHeaderChange(e, colIndex)}
                        className="font-bold text-center"
                        placeholder={getColumnName(colIndex)}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {gridData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="font-bold text-center text-muted-foreground">{rowIndex + 1}</TableCell>
                    {row.map((cell, colIndex) => (
                      <TableCell key={colIndex}>
                        <Input
                          type="text"
                          defaultValue={viewData[rowIndex]?.[colIndex] ?? ''}
                          onFocus={(e) => handleCellFocus(e, rowIndex, colIndex)}
                          onBlur={(e) => handleCellBlur(e, rowIndex, colIndex)}
                          onChange={(e) => handleCellChange(e, rowIndex, colIndex)}
                          placeholder={`${getColumnName(colIndex)}${rowIndex + 1}`}
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
    </>
  );
}
