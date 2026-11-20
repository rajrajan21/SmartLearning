import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceKey = "in_female" | "in_male" | "us_female";

export interface StepVoiceEntry {
  url: string;
  durationSec: number;
}

export interface ManifestStep {
  label: string;
  text: string;
  voices: Record<VoiceKey, StepVoiceEntry>;
}

export interface AudioManifest {
  lessonId: string;
  defaultVoice: VoiceKey;
  steps: Record<string, ManifestStep>;
}

export interface UseLessonVoiceOptions {
  manifestUrl: string;
  stepKey: string;
  voice: VoiceKey;
  rate: number;
  enabled: boolean;
  onEnded?: () => void;
}

export function useLessonVoicePlayer({
  manifestUrl,
  stepKey,
  voice,
  rate,
  enabled,
  onEnded,
}: UseLessonVoiceOptions) {
  const [manifest, setManifest] = useState<AudioManifest | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const stepPauseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch(manifestUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AudioManifest | null) => {
        if (active && data) setManifest(data);
      })
      .catch(() => {
        if (active) setManifest(null);
      });
    return () => {
      active = false;
    };
  }, [manifestUrl]);

  const clearTimers = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (fallbackTimerRef.current !== null) {
      window.clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (stepPauseTimerRef.current !== null) {
      window.clearTimeout(stepPauseTimerRef.current);
      stepPauseTimerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, [clearTimers]);

  const currentStep = manifest?.steps?.[stepKey];
  const voiceEntry = currentStep?.voices?.[voice];

  const tickAudioProgress = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    const dur = el.duration && Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 4;
    const p = Math.min(1, Math.max(0, el.currentTime / dur));
    setProgress(p);
    if (!el.paused && !el.ended) {
      rafRef.current = requestAnimationFrame(tickAudioProgress);
    }
  }, []);

  const play = useCallback(
    (startFromProgress = 0) => {
      if (!enabled) return;
      clearTimers();
      setProgress(startFromProgress);
      setIsPlaying(true);

      const textToSpeak = currentStep?.text ?? "";
      const audioUrl = voiceEntry?.url;

      if (audioUrl) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        const el = audioRef.current;
        if (el.src !== new URL(audioUrl, window.location.origin).href) {
          el.src = audioUrl;
        }
        el.playbackRate = rate;
        el.onloadedmetadata = () => {
          const dur = el.duration && Number.isFinite(el.duration) ? el.duration : 4;
          el.currentTime = Math.min(dur * 0.99, Math.max(0, startFromProgress * dur));
        };
        el.onended = () => {
          clearTimers();
          setProgress(1);
          setIsPlaying(false);
          // 0.5s step transition pause before advancing if requested
          stepPauseTimerRef.current = window.setTimeout(() => {
            onEnded?.();
          }, 500);
        };
        el.onerror = () => {
          // Offline or missing file fallback to Web Speech API
          if ("speechSynthesis" in window && textToSpeak) {
            const utter = new SpeechSynthesisUtterance(textToSpeak);
            utter.rate = rate;
            utter.onend = () => {
              setProgress(1);
              setIsPlaying(false);
              stepPauseTimerRef.current = window.setTimeout(() => onEnded?.(), 500);
            };
            window.speechSynthesis.speak(utter);
          } else {
            const totalMs = 4000 / Math.max(0.5, rate);
            const startMs = performance.now() - startFromProgress * totalMs;
            fallbackTimerRef.current = window.setInterval(() => {
              const p = Math.min(1, (performance.now() - startMs) / totalMs);
              setProgress(p);
              if (p >= 1) {
                clearTimers();
                setIsPlaying(false);
                stepPauseTimerRef.current = window.setTimeout(() => onEnded?.(), 500);
              }
            }, 50);
          }
        };
        el.play()
          .then(() => {
            const dur = el.duration && Number.isFinite(el.duration) ? el.duration : 4;
            if (startFromProgress > 0 && dur > 0) {
              el.currentTime = startFromProgress * dur;
            }
            rafRef.current = requestAnimationFrame(tickAudioProgress);
          })
          .catch(() => {
            el.onerror?.(new Event("error"));
          });
        return;
      }

      // Fallback timer if manifest is still loading
      const totalMs = 4000 / Math.max(0.5, rate);
      const startMs = performance.now() - startFromProgress * totalMs;
      fallbackTimerRef.current = window.setInterval(() => {
        const p = Math.min(1, (performance.now() - startMs) / totalMs);
        setProgress(p);
        if (p >= 1) {
          clearTimers();
          setIsPlaying(false);
          stepPauseTimerRef.current = window.setTimeout(() => onEnded?.(), 500);
        }
      }, 50);
    },
    [clearTimers, currentStep?.text, enabled, onEnded, rate, tickAudioProgress, voiceEntry?.url]
  );

  const seek = useCallback(
    (nextProgress: number) => {
      const clamped = Math.min(1, Math.max(0, nextProgress));
      setProgress(clamped);
      if (audioRef.current && audioRef.current.duration && Number.isFinite(audioRef.current.duration)) {
        audioRef.current.currentTime = clamped * audioRef.current.duration;
      }
    },
    []
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, [rate]);

  useEffect(() => {
    setProgress(0);
    return () => {
      clearTimers();
    };
  }, [stepKey, voice, clearTimers]);

  return {
    manifest,
    currentText: currentStep?.text ?? "",
    isPlaying,
    progress,
    play,
    stop,
    seek,
    setProgress,
  };
}
