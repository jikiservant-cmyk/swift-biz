import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { AIAlerts } from "@/components/dashboard/AIAlerts";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <PageHeader 
        title="Dashboard"
        actionButton={
          <Button>
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Create New
          </Button>
        }
      />
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <AIAlerts />
      </Suspense>
      <OverviewCards />
      <div className="mt-8">
        <RecentActivity />
      </div>
    </div>
  );
}
