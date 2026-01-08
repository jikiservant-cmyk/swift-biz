"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

export function CashBookPage() {
  const [headers, setHeaders] = useState(["Header 1", "Header 2", "Header 3"]);
  const [gridData, setGridData] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);

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

  const addRow = () => {
    setGridData([...gridData, Array(headers.length).fill("")]);
  };

  const addColumn = () => {
    setHeaders([...headers, `Header ${headers.length + 1}`]);
    setGridData(gridData.map(row => [...row, ""]));
  };

  return (
    <>
      <PageHeader title="Cash Book" />
      <Card>
        <CardHeader>
          <CardTitle>Data Grid</CardTitle>
          <CardDescription>An editable grid for your cash book data. Add rows and columns as needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={addRow}>
              <Plus className="mr-2 h-4 w-4" /> Add Row
            </Button>
            <Button onClick={addColumn} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Column
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, colIndex) => (
                    <TableHead key={colIndex}>
                       <Input
                        type="text"
                        value={header}
                        onChange={(e) => handleHeaderChange(e, colIndex)}
                        className="font-bold"
                      />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {gridData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <TableCell key={colIndex}>
                        <Input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(e, rowIndex, colIndex)}
                          placeholder="Enter data..."
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
