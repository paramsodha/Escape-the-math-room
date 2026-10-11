import { audio, type Sfx } from "./audio";

/** Play a realm-flavoured sound effect. Volume/mute come from settings (see MotionSync). */
export function play(sfx: Sfx, enabled = true) {
  if (!enabled) return;
  audio.sfx(sfx);
}
