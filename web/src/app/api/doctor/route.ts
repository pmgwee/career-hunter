import { loadCareerWorkspace } from "@/lib/workspace/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Orchestrates the core's own cold-start check (doctor.mjs --json) — the SAME
// source of truth the CLI uses to decide onboarding. We never reimplement the
// prerequisite list; we read the core's verdict.
export async function GET() {
  try {
    const snapshot = await loadCareerWorkspace();
    return Response.json({ available: true, onboardingNeeded: snapshot.onboardingNeeded, missing: snapshot.missing, warnings: [] });
  } catch {
    return Response.json({ available: false, onboardingNeeded: false, missing: [], warnings: [] });
  }
}
