"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calculator } from "lucide-react";

export function CashBookPage() {
  const { toast } = useToast();
  const [calculation, setCalculation] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    try {
      // Basic validation to prevent unsafe evaluation
      if (!/^[0-9+\-*/.\s()]*$/.test(calculation)) {
        throw new Error("Invalid characters in calculation.");
      }
      // WARNING: Using eval is generally unsafe. This is a simple implementation
      // for demonstration purposes. In a real app, you'd use a proper math expression parser.
      const calculatedResult = eval(calculation);
      setResult(calculatedResult);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: "Please enter a valid mathematical expression.",
      });
      setResult(null);
    }
  };

  return (
    <>
      <PageHeader title="Cash Book" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calculator</CardTitle>
            <CardDescription>Enter a mathematical expression to calculate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., (150 + 25) * 2 - 50"
              value={calculation}
              onChange={(e) => setCalculation(e.target.value)}
              rows={5}
            />
            <Button onClick={handleCalculate}>
              <Calculator className="mr-2 h-4 w-4" />
              Calculate
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>The result of your calculation will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
              {result !== null ? (
                <p className="text-4xl font-bold">{result.toLocaleString()}</p>
              ) : (
                <p className="text-muted-foreground">Awaiting calculation...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
