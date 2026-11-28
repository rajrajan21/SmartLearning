import { useEffect, useState } from "react";
import { ClassroomIndex, PublicClassroom } from "@studysmart/shared";
import { useLessonRequest, type Load } from "./curriculum";
import { publicResource } from "./publicResource";

const index = publicResource<ClassroomIndex>();

export function useClassroom(board: string, cls: string, subject: string, chapter: string, topic: string, enabled: boolean, attempt = 0, voice = ""): Load<PublicClassroom | null> {
  const url = `/api/v1/classroom/${board}/${cls}/${subject}/${chapter}/${topic}${voice ? `?voice=${encodeURIComponent(voice)}` : ""}`;
  return useLessonRequest(url, PublicClassroom.parse, enabled, attempt);
}

export function useClassroomIndex(enabled: boolean, attempt = 0): Load<ClassroomIndex> {
  const [state, setState] = useState<Load<ClassroomIndex>>(() => {
    const cached = enabled ? index.peek("index") : undefined;
    return cached ? { status: "ready", data: cached } : { status: "loading" };
  });
  useEffect(() => {
    if (!enabled) { setState({ status: "ready", data: { items: [], voices: [], defaultVoice: "malar" } }); return; }
    let alive = true;
    index.read("index", () => fetch("/api/v1/classroom/index")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(raw => ClassroomIndex.parse(raw)), attempt > 0)
      .then((data) => { if (alive) setState({ status: "ready", data }); })
      .catch(() => {
        if (!alive) return;
        const cached = index.peek("index");
        setState(cached ? { status: "ready", data: cached } : { status: "error" });
      });
    return () => { alive = false; };
  }, [enabled, attempt]);
  return state;
}
