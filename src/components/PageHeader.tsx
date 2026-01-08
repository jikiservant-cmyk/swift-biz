'use client';
import { SidebarTrigger } from "@/components/ui/sidebar";

type PageHeaderProps = {
  title: string;
  actionButton?: React.ReactNode;
};

export function PageHeader({ title, actionButton }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-3xl font-headline text-foreground">{title}</h1>
        </div>
        {actionButton}
    </div>
  );
}
