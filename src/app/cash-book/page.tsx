
'use client';

import { CashBookPage as CashBookPageComponent } from "@/components/cash-book/CashBookPage";

export default function CashBookPage() {
    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <CashBookPageComponent />
        </div>
    );
}
