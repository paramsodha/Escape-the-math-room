import { useEffect } from "react";
import { useGame } from "./store";
import { audio } from "./audio";

/** Applies reduced-motion and audio volume settings app-wide. */
export function MotionSync() {
  const { settings: s, hydrated } = useGame();
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", s.reducedMotion);
  }, [s.reducedMotion]);
  useEffect(() => {
    if (!hydrated) return;
    audio.configure({
      music: s.muted ? 0 : s.musicVolume,
      sfx: s.muted || !s.sound ? 0 : s.sfxVolume,
    });
  }, [hydrated, s.muted, s.musicVolume, s.sfxVolume, s.sound]);
  return null;
}
