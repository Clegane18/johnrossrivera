"use client";

import { useCallback, useEffect, useState } from "react";

// Opt-in UI sound. Deliberately mirrors hooks/useTheme.ts — same storage key shape, same CustomEvent
// sync so two toggles (desktop + mobile nav) stay in step without a context, same isReady guard
// against a hydration mismatch. Following the established pattern beats inventing a second one.
//
// DEFAULT OFF, and that is a product decision rather than a technical one: a recruiter opening this
// in an open-plan office and being startled costs far more than the delight of a tick sound gains.
// The toggle sits next to the theme switch so the feature is still discoverable.

const SOUND_STORAGE_KEY = "portfolio-sound";
const SOUND_CHANGE_EVENT = "portfolio-sound-change";

export type SoundName = "hover" | "click" | "toggle-on" | "toggle-off" | "send";

const SOUND_SRC: Record<SoundName, string> = {
  hover: "/audio/hover.wav",
  click: "/audio/click.wav",
  "toggle-on": "/audio/toggle-on.wav",
  "toggle-off": "/audio/toggle-off.wav",
  send: "/audio/send.wav",
};

// Per-sound volume on top of the file's own normalised peak. Hover fires on every pointer pass, so
// it sits far below the click — the goal is something you feel, not something you notice.
const SOUND_VOLUME: Record<SoundName, number> = {
  hover: 0.55,
  click: 0.9,
  "toggle-on": 0.9,
  "toggle-off": 0.9,
  send: 0.85,
};

// Sweeping a cursor across a nav can fire a dozen hover events in a few hundred ms. Without a floor
// between plays they overlap into a rattle, which is the opposite of the intended feel.
const HOVER_THROTTLE_MS = 60;

// Module-level cache so each clip is fetched once and reused, not re-created per play. Populated
// lazily on first playback — audio must never sit on the critical path for a page whose Lighthouse
// score is part of the pitch.
const audioCache = new Map<SoundName, HTMLAudioElement>();

function getAudio(name: SoundName): HTMLAudioElement | null {
  if (typeof window === "undefined") {
    return null;
  }

  const cached = audioCache.get(name);
  if (cached) {
    return cached;
  }

  const audio = new Audio(SOUND_SRC[name]);
  audio.preload = "auto";
  audio.volume = SOUND_VOLUME[name];
  audioCache.set(name, audio);

  return audio;
}

let lastHoverAt = 0;

export function useSound() {
  const [enabled, setEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SOUND_STORAGE_KEY);

    // No system preference to fall back on — unlike theme, silence is the only safe default.
    setEnabled(stored === "on");
    setIsReady(true);
  }, []);

  useEffect(() => {
    function handleSoundChange(event: Event) {
      const customEvent = event as CustomEvent<boolean>;

      if (typeof customEvent.detail === "boolean") {
        setEnabled(customEvent.detail);
      }
    }

    window.addEventListener(SOUND_CHANGE_EVENT, handleSoundChange);

    return () => {
      window.removeEventListener(SOUND_CHANGE_EVENT, handleSoundChange);
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "on" : "off");
  }, [enabled, isReady]);

  const play = useCallback(
    (name: SoundName) => {
      if (!enabled || !isReady) {
        return;
      }

      if (name === "hover") {
        const now = Date.now();

        if (now - lastHoverAt < HOVER_THROTTLE_MS) {
          return;
        }

        lastHoverAt = now;
      }

      const audio = getAudio(name);
      if (!audio) {
        return;
      }

      // Rewind before replaying so rapid clicks retrigger cleanly instead of being swallowed while
      // the previous playback is still running.
      audio.currentTime = 0;

      // Every trigger follows a user gesture, so autoplay policy is satisfied — but a rejected
      // promise here must never surface to the user. Silence is an acceptable failure mode for a
      // decorative effect; an unhandled rejection in the console is not.
      void audio.play().catch(() => {});
    },
    [enabled, isReady]
  );

  const setSoundEnabled = useCallback((next: boolean) => {
    setEnabled(next);
    window.dispatchEvent(
      new CustomEvent<boolean>(SOUND_CHANGE_EVENT, { detail: next })
    );
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(!enabled);
  }, [enabled, setSoundEnabled]);

  return { enabled, isReady, play, setSoundEnabled, toggleSound };
}
