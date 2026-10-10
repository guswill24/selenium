import { useSyncExternalStore } from 'react';
import { readJson, storageKeys, writeJson } from '../utils/storage.ts';

/**
 * Text size (WCAG 2.1, 1.4.4 Resize text): scales the root font size, so every rem-based size
 * (text, spacing, controls) grows up to 200 %. A percentage keeps the size the user already chose
 * in the browser settings as the base.
 */
export const FONT_SCALES = [100, 115, 130, 150, 175, 200] as const;
export type FontScale = (typeof FONT_SCALES)[number];

const listeners = new Set<() => void>();

function isFontScale(value: unknown): value is FontScale {
  return FONT_SCALES.includes(value as FontScale);
}

function apply(scale: FontScale) {
  document.documentElement.style.fontSize = scale === 100 ? '' : `${scale}%`;
}

let current: FontScale = 100;

/** Applies the saved size before the first render, so the page never flashes at 100 %. */
export function initFontScale() {
  const saved = readJson<unknown>(storageKeys.fontScale);
  current = isFontScale(saved) ? saved : 100;
  apply(current);
}

export function setFontScale(scale: FontScale) {
  current = scale;
  apply(scale);
  writeJson(storageKeys.fontScale, scale);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFontScale() {
  const scale = useSyncExternalStore(subscribe, () => current);
  const index = FONT_SCALES.indexOf(scale);
  return {
    scale,
    canDecrease: index > 0,
    canIncrease: index < FONT_SCALES.length - 1,
    decrease: () => setFontScale(FONT_SCALES[Math.max(0, index - 1)] ?? 100),
    increase: () => setFontScale(FONT_SCALES[Math.min(FONT_SCALES.length - 1, index + 1)] ?? 200),
    reset: () => setFontScale(100),
  };
}
