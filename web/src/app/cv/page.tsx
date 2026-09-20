import { CvEditor } from "@/components/cv-editor";
import { loadCareerWorkspace } from "@/lib/workspace/snapshot";

export const dynamic = "force-dynamic";

export default async function CvPage() {
  const snapshot = await loadCareerWorkspace({ includeFilePaths: ["cv.md"] });
  return <CvEditor initialContent={snapshot.files.get("cv.md") ?? ""} initialExists={snapshot.files.has("cv.md")} />;
}
