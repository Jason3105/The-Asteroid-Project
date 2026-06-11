import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AsteroidDetailView } from "@/components/asteroid/AsteroidDetailView";

export const metadata = {
  title: "Asteroid Detail — PROSPECTOR",
};

interface Props {
  params: { designation: string };
}

export default function AsteroidPage({ params }: Props) {
  if (!params.designation) return notFound();

  const designation = decodeURIComponent(params.designation);

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner />
        </div>
      }>
        <AsteroidDetailView designation={designation} />
      </Suspense>
    </div>
  );
}
