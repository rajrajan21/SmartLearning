// Preview tool (not part of the site): renders each step of recipe-compiled lessons as SVG pictures.
// Run: PREVIEW_DIR=/tmp/pilot-out PREVIEW_OUT=/tmp/prev pnpm --filter @studysmart/web exec vitest run src/_preview
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { it } from "vitest";
import { sceneAt, estimateDurationMs } from "@studysmart/shared";
import { ClassBoard } from "../components/ClassBoard";

it("renders previews", () => {
  const dir = process.env.PREVIEW_DIR, out = process.env.PREVIEW_OUT;
  if (!dir || !out) return;
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
    const lesson = JSON.parse(readFileSync(`${dir}/${f}`, "utf8"));
    lesson.steps.forEach((s: { id: string; narration: { en: string }; check?: unknown }, i: number) => {
      const scene = sceneAt(lesson, i, 1e9, { durMs: estimateDurationMs(s.narration.en), instant: true, lang: "en" });
      const svg = renderToStaticMarkup(<ClassBoard objects={lesson.objects} scene={scene} style="white" show3d clock={0} yaw={0} label="x" quiet={false} />).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
      writeFileSync(`${out}/${f.replace(".json", "")}-${String(i + 1).padStart(2, "0")}-${s.id}.svg`, svg);
    });
  }
});
