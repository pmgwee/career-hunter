import { Suspense } from "react";
import { FollowupsView } from "@/components/followups/followups-view";
import { loadFollowupsResponse } from "@/lib/followups-cloud";

export const dynamic = "force-dynamic"; // cadence is computed fresh per request

export default async function FollowupsPage() {
  const initialData = await loadFollowupsResponse(true);
  return (
    <Suspense>
      <FollowupsView initialData={initialData} />
    </Suspense>
  );
}
