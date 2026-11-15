import { useEffect, useState } from "react";
import { ClassroomIndex, PublicClassroom } from "@studysmart/shared";
import type { Load } from "./curriculum";

export function useClassroom(board: string, cls: string, subject: string, chapter: string, topic: string, enabled: boolean, attempt = 0): Load<PublicClassroom | null> {
  const [state, setState] = useState<Load<PublicClassroom | null>>({ status: "loading" });
  useEffect(() => {
    if (!enabled) { setState({ status: "ready", data: null }); return; }
    let alive = true;
    setState({ status: "loading" });
    fetch(`/api/v1/classroom/${board}/${cls}/${subject}/${chapter}/${topic}`)
      .then((r) => (r.status === 404 ? null : r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((raw) => { if (alive) setState({ status: "ready", data: raw ? PublicClassroom.parse(raw) : null }); })
      .catch(() => { if (alive) setState({ status: "error" }); });
    return () => { alive = false; };
  }, [board, cls, subject, chapter, topic, enabled, attempt]);
  return state;
}

export function useClassroomIndex(enabled: boolean, attempt = 0): Load<ClassroomIndex> {
  const [state, setState] = useState<Load<ClassroomIndex>>({ status: "loading" });
  useEffect(() => {
    if (!enabled) { setState({ status: "ready", data: { items: [] } }); return; }
    let alive = true;
    fetch("/api/v1/classroom/index")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((raw) => { if (alive) setState({ status: "ready", data: ClassroomIndex.parse(raw) }); })
      .catch(() => { if (alive) setState({ status: "error" }); });
    return () => { alive = false; };
  }, [enabled, attempt]);
  return state;
}
