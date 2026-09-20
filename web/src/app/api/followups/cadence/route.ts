import * as yaml from "js-yaml";
import { DEFAULT_CADENCE } from "../../../../../../followup-cadence.mjs";
import { PROFILE_CADENCE_KEYS, type ProfileCadenceKey } from "@/lib/followups";
import { loadCareerWorkspace } from "@/lib/workspace/snapshot";
import { writeWorkspaceFiles } from "@/lib/workspace/write-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isObj(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function profileOverrides(profile: Record<string, unknown>): Partial<Record<ProfileCadenceKey, number>> {
  const source = isObj(profile.followup_cadence) ? profile.followup_cadence : {};
  const overrides: Partial<Record<ProfileCadenceKey, number>> = {};
  for (const key of PROFILE_CADENCE_KEYS) {
    const raw = source[key];
    const number = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
    if (Number.isInteger(number) && number >= 0) overrides[key] = number;
  }
  return overrides;
}

function webDefaults(): Record<ProfileCadenceKey, number> {
  return Object.fromEntries(
    PROFILE_CADENCE_KEYS.map((key) => {
      const coreKey = key === "applied_max_followups" ? key : key.replace(/_days$/, "");
      return [key, DEFAULT_CADENCE[coreKey as keyof typeof DEFAULT_CADENCE]];
    }),
  ) as Record<ProfileCadenceKey, number>;
}

export async function GET() {
  const snapshot = await loadCareerWorkspace({ includeFilePaths: ["config/profile.yml"] });
  let profile: Record<string, unknown> = {};
  try {
    const parsed = yaml.load(snapshot.files.get("config/profile.yml") ?? "");
    profile = isObj(parsed) ? parsed : {};
  } catch {
    // Read is best-effort; preserve the canonical defaults.
  }
  const defaults = webDefaults();
  const overrides = profileOverrides(profile);
  return Response.json({ defaults, defaultsAvailable: true, overrides, effective: { ...defaults, ...overrides } });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }

  const cadence: Partial<Record<ProfileCadenceKey, number>> = {};
  for (const key of PROFILE_CADENCE_KEYS) {
    if (body[key] == null) continue;
    const raw = String(body[key]);
    if (!/^\d+$/.test(raw)) {
      return Response.json({ error: `${key} must be a non-negative integer` }, { status: 400 });
    }
    cadence[key] = Number.parseInt(raw, 10);
  }
  if (Object.keys(cadence).length === 0) return Response.json({ error: "nothing to write" }, { status: 400 });

  const snapshot = await loadCareerWorkspace({ includeFilePaths: ["config/profile.yml"] });
  const existing = snapshot.files.get("config/profile.yml") ?? "";
  let base: Record<string, unknown> = {};
  try {
    const parsed = yaml.load(existing);
    base = isObj(parsed) ? parsed : {};
  } catch {
    return Response.json(
      { error: "config/profile.yml exists but could not be read as YAML — refusing to overwrite it." },
      { status: 409 },
    );
  }
  const merged = {
    ...base,
    followup_cadence: { ...(isObj(base.followup_cadence) ? base.followup_cadence : {}), ...cadence },
  };
  try {
    await writeWorkspaceFiles(snapshot, [
      {
        path: "config/profile.yml",
        content: yaml.dump(merged, { lineWidth: 100, noRefs: true }),
        contentType: "application/yaml; charset=utf-8",
      },
    ]);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "write failed" }, { status: 500 });
  }
  return Response.json({ ok: true, followup_cadence: merged.followup_cadence });
}
