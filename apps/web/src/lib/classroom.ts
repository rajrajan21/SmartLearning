import { useEffect, useState } from "react";
import { ClassroomIndex, PublicClassroom } from "@studysmart/shared";
import { useLessonRequest, type Load } from "./curriculum";

export function useClassroom(board: string, cls: string, subject: string, chapter: string, topic: string, enabled: boolean, attempt = 0, voice = ""): Load<PublicClassroom | null> {
  const url = `/api/v1/classroom/${board}/${cls}/${subject}/${chapter}/${topic}${voice ? `?voice=${encodeURIComponent(voice)}` : ""}`;
  return useLessonRequest(url, PublicClassroom.parse, enabled, attempt);
}

export function useClassroomIndex(enabled: boolean, attempt = 0): Load<ClassroomIndex> {
  const [state, setState] = useState<Load<ClassroomIndex>>({ status: "loading" });
  useEffect(() => {
    if (!enabled) { setState({ status: "ready", data: { items: [], voices: [], defaultVoice: "malar" } }); return; }
    let alive = true;
    fetch("/api/v1/classroom/index")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((raw) => { if (alive) setState({ status: "ready", data: ClassroomIndex.parse(raw) }); })
      .catch(() => { if (alive) setState({ status: "error" }); });
    return () => { alive = false; };
  }, [enabled, attempt]);
  return state;
}
