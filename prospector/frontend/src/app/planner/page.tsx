import { Suspense } from "react";
import { MissionPlannerView } from "@/components/planner/MissionPlannerView";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Mission Planner — PROSPECTOR",
  description: "Evaluate NHATS accessible launch windows and mission feasibility.",
};

export default function PlannerPage() {
  return (
    <div className="min-h-screen bg-space-950 text-white font-sans">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      }>
        <MissionPlannerView />
      </Suspense>
    </div>
  );
}
