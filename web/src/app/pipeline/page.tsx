import { Suspense } from "react";
import { PipelineView } from "@/components/pipeline-view";
import { loadCareerWorkspace } from "@/lib/workspace/snapshot";

export const dynamic = "force-dynamic"; // always read fresh local files

export default async function PipelinePage() {
  const { inbox, applications } = await loadCareerWorkspace();
  return (
    <Suspense>
      <PipelineView applications={applications} inbox={inbox} />
    </Suspense>
  );
}
