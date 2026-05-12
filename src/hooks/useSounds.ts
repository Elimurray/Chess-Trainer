// Uses Lichess open-source sounds (public/sounds/).
// Run `node scripts/download-sounds.mjs` once to fetch the files.

function load(src: string, volume = 0.55): HTMLAudioElement {
  const a = new Audio(src);
  a.preload = 'auto';
  a.volume = volume;
  return a;
}

// Preload on first import so the first move has no delay.
const SFX = {
  move:     load('/sounds/Move.mp3'),
  capture:  load('/sounds/Capture.mp3'),
  check:    load('/sounds/Check.mp3'),
  notify:   load('/sounds/GenericNotify.mp3'),
};

/** Play without blocking; handles browsers that restrict autoplay. */
function play(a: HTMLAudioElement) {
  // Clone so rapid successive sounds can overlap.
  const clone = a.cloneNode() as HTMLAudioElement;
  clone.volume = a.volume;
  void clone.play().catch(() => {});
}

export const sounds = {
  move()      { play(SFX.move); },
  capture()   { play(SFX.capture); },
  check()     { play(SFX.check); },
  deviation() { play(SFX.notify); },
  complete()  { play(SFX.notify); },
};

export function useSounds() {
  return sounds;
}
