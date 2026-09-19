import { parseReport } from "@/lib/format";
import { readReport, type Application } from "@/lib/career-ops";

export type AnalyticsApplication = Application & {
  archetype: string;
  location: string;
  workMode: string;
  payMax: number;
  paySource: "POSTED" | "est" | "";
};

// Keep suffixes token-bound so a requisition such as `340741BR` cannot be
// misread as `340741B` (the same false-positive guard as the TUI parser).
const MONEY = /(?:[$€£¥₹₺₩]|USD|EUR|GBP|PLN|CHF|SGD|AUD|CAD)?\s*(\d[\d,]*(?:\.\d+)?)\s*([KkMmBb])?(?![A-Za-z])(?:\s*[-–]\s*(?:[$€£¥₹₺₩]|USD|EUR|GBP|PLN|CHF|SGD|AUD|CAD)?\s*(\d[\d,]*(?:\.\d+)?)\s*([KkMmBb])?(?![A-Za-z]))?/g;

function scalar(source: string, key: string): string {
  const match = source.match(new RegExp(`^${key}:\\s*(.+)$`, "im"));
  if (!match) return "";
  return match[1].trim().replace(/^['"]|['"]$/g, "").replace(/^null$/i, "");
}

function moneyNumber(value: string, suffix = ""): number {
  const numeric = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return 0;
  if (suffix.toLowerCase() === "k") return numeric * 1_000;
  if (suffix.toLowerCase() === "m") return numeric * 1_000_000;
  if (suffix.toLowerCase() === "b") return numeric * 1_000_000_000;
  return numeric;
}

function highestMoney(text: string, allowBare = false): { value: number; source: "POSTED" | "est" | "" } {
  let highest = 0;
  let source: "POSTED" | "est" | "" = "";
  for (const match of text.matchAll(MONEY)) {
    const hasCurrency = Boolean(match[0].match(/[$€£¥₹₺₩]|\b(?:USD|EUR|GBP|PLN|CHF|SGD|AUD|CAD)\b/));
    const hasCurrencyOrSuffix = Boolean(match[0].match(/[$€£¥₹₺₩]|\b(?:USD|EUR|GBP|PLN|CHF|SGD|AUD|CAD)\b|[KkMmBb]/));
    if (!allowBare && !hasCurrencyOrSuffix) continue;
    const value = Math.max(moneyNumber(match[1], match[2]), moneyNumber(match[3] ?? "0", match[4] ?? ""));
    const after = text.slice((match.index ?? 0) + match[0].length);
    if (/^\s*(?:valuation|(?:total\s+)?raised|series\s|round\b)/i.test(after)) continue;
    // Bare M/B values in prose are usually company scale or valuation, not
    // compensation (for example, "1,079.2M devices"). Keep currency-backed
    // values, but do not let those metrics become a salary datapoint.
    if (!hasCurrency && /[MmBb]/.test(`${match[2] ?? ""}${match[4] ?? ""}`)) continue;
    if (!hasCurrency && value > 500_000) continue;
    if (value > highest) {
      highest = value;
      const context = text.slice(Math.max(0, (match.index ?? 0) - 24), Math.min(text.length, (match.index ?? 0) + match[0].length + 40)).toLowerCase();
      source = /posted/.test(context) ? "POSTED" : /\best\b|estimate|market/.test(context) ? "est" : "";
    }
  }
  return { value: highest, source };
}

function normalizeWorkMode(raw: string, text: string): string {
  const explicit = String(raw ?? "").toLowerCase().trim();
  if (explicit) {
    if (explicit.includes("hybrid")) return "Hybrid";
    if (explicit.includes("remote") && explicit.includes("flex")) return "RemoteFlex";
    if (explicit.includes("remote")) return "Remote";
    if (explicit.includes("onsite") || explicit.includes("on-site") || explicit.includes("in-office")) return "Full";
  }
  const value = text.toLowerCase();
  if (value.includes("hybrid")) return "Hybrid";
  if (value.includes("remote") && (value.includes("flex") || value.includes("remote-first") || value.includes("remote first"))) return "RemoteFlex";
  if (value.includes("remote")) return "Remote";
  if (value.includes("onsite") || value.includes("on-site") || value.includes("in-office")) return "Full";
  return "";
}

function fallbackLocation(text: string): string {
  const cityState = text.match(/\b([A-Z][A-Za-z.'-]+(?: [A-Z][A-Za-z.'-]+){0,2}),? (?:A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])\b/);
  if (cityState?.[1]) return cityState[1];
  const cities = text.match(/\b(Porto|Lisbon|London|Berlin|Munich|München|Hamburg|Frankfurt|Cologne|Düsseldorf|Dusseldorf|Stuttgart|Zurich|Zürich|Geneva|Lausanne|Basel|Dublin|Cork|Amsterdam|Rotterdam|Eindhoven|Utrecht|Paris|Lyon|Madrid|Barcelona|Valencia|Stockholm|Gothenburg|Malmö|Malmo|Copenhagen|Oslo|Helsinki|Milan|Rome|Turin|Vienna|Brussels|Ghent|Antwerp|Luxembourg|Warsaw|Kraków|Krakow|Wrocław|Wroclaw|Tallinn|Riga|Vilnius|Prague|Brno|Budapest|Bucharest|Sofia|Athens|Bengaluru|Bangalore|Singapore|Sydney|Toronto|Vancouver|Tel Aviv|São Paulo|Sao Paulo|Kuala Lumpur|Petaling Jaya|Cyberjaya)\b/i);
  return cities?.[1] ?? "";
}

function reportFields(content: string, fallbackArchetype: string) {
  const meta = parseReport(content);
  const machine = content.match(/##\s+Machine Summary[\s\S]*?```(?:yaml)?\s*([\s\S]*?)```/i)?.[1] ?? content;
  const archetypeTable = content.match(/\*\*(?:Archetype detected|Archetype)\*\*\s*\|\s*([^|\n]+)/i)?.[1]?.replace(/\*+/g, "").trim() ?? "";
  const archetype = scalar(machine, "archetype_primary") || scalar(machine, "archetype") || archetypeTable || meta.fields.find((field) => field.label === "Archetype")?.value || fallbackArchetype;
  const explicitLocation = /\|\s*Location(?:s)?(?: field)?\s*\|\s*([^|\n]+)/i.exec(content)?.[1]?.trim()
    ?? /\*\*Location\*\*\s*[:|]\s*([^|\n]+)/i.exec(content)?.[1]?.trim()
    ?? "";
  const location = scalar(machine, "location") || explicitLocation || fallbackLocation(content);
  const workMode = normalizeWorkMode(scalar(machine, "work_mode"), "");
  const compensation = [scalar(machine, "advertised_comp"), scalar(machine, "comp_estimate_myr_month"), scalar(machine, "compensation")].filter(Boolean).join(" ");
  const pay = highestMoney(compensation, true);
  return { archetype, location, workMode, payMax: pay.value, paySource: pay.source };
}

function fromApplication(app: Application, cloudReports?: ReadonlyMap<string, { content: string }>): AnalyticsApplication {
  const report = cloudReports?.get(app.n) ?? readReport(app.n);
  const notes = app.notes ?? "";
  const content = report?.content ?? "";
  const derived = reportFields(content, "");
  const notePay = highestMoney(notes);
  const combinedText = `${app.role} ${notes}`;
  const noteLocation = fallbackLocation(`${app.role} ${notes}`);
  return {
    ...app,
    archetype: derived.archetype,
    location: derived.location || noteLocation,
    workMode: derived.workMode || normalizeWorkMode("", combinedText) || (noteLocation ? "Full" : ""),
    payMax: notePay.value || derived.payMax,
    paySource: notePay.value ? notePay.source : derived.paySource,
  };
}

/** Read-only enrichment of tracker rows for Analytics. */
export function analyticsApplications(applications: Application[], cloudReports?: ReadonlyMap<string, { content: string }>): AnalyticsApplication[] {
  return applications.map((application) => fromApplication(application, cloudReports));
}
