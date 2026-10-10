import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

export type SpeechStatus = 'idle' | 'playing' | 'paused';

const SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
// Only Colombian Spanish voices are offered: the students are in Colombia.
export const SPEECH_LANG = 'es-CO';
const NO_VOICES: SpeechSynthesisVoice[] = [];

// getVoices() returns a new array on every call; keep one reference until the list really changes,
// as useSyncExternalStore requires a stable snapshot.
let voiceCache: SpeechSynthesisVoice[] = NO_VOICES;
function readColombianVoices(): SpeechSynthesisVoice[] {
  if (!SUPPORTED) return NO_VOICES;
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.replace('_', '-').toLowerCase() === SPEECH_LANG.toLowerCase());
  const changed = voices.length !== voiceCache.length || voices.some((voice, index) => voice.voiceURI !== voiceCache[index]?.voiceURI);
  if (changed) voiceCache = voices;
  return voiceCache;
}

function subscribeVoices(onChange: () => void) {
  if (!SUPPORTED) return () => undefined;
  window.speechSynthesis.addEventListener('voiceschanged', onChange);
  return () => window.speechSynthesis.removeEventListener('voiceschanged', onChange);
}

function defaultVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices[0];
}

/**
 * Reads a list of text segments aloud with the browser's speech synthesis (no audio files, no server).
 * Each segment is its own utterance: `currentIndex` tells which one is being read, so the page can
 * highlight it. Pause cancels and resume re-reads the current segment, which behaves the same in
 * every browser (the native pause/resume is unreliable with some voices).
 */
export function useSpeech(segments: readonly { text: string }[]) {
  const voices = useSyncExternalStore(subscribeVoices, readColombianVoices, () => NO_VOICES);
  const [voiceURI, setVoiceURI] = useState('');
  const [rate, setRateState] = useState(1);
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const voice = useMemo(() => voices.find((candidate) => candidate.voiceURI === voiceURI) ?? defaultVoice(voices), [voices, voiceURI]);

  // Every start/stop bumps the generation, so events from cancelled utterances are ignored.
  const generation = useRef(0);
  const indexRef = useRef(-1);
  const rateRef = useRef(1);
  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined);
  // Holding the utterance avoids a Chrome bug where a collected utterance never fires `end`.
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);

  const halt = useCallback(() => {
    generation.current += 1;
    if (SUPPORTED) window.speechSynthesis.cancel();
  }, []);

  const playFrom = useCallback(
    (start: number) => {
      if (!SUPPORTED) return;
      halt();
      const run = generation.current;
      const synth = window.speechSynthesis;
      synth.resume();
      setError(null);

      const speakAt = (index: number) => {
        if (run !== generation.current) return;
        const segment = segments[index];
        indexRef.current = segment ? index : -1;
        setCurrentIndex(indexRef.current);
        if (!segment) {
          setStatus('idle');
          return;
        }
        setStatus('playing');
        const utterance = new SpeechSynthesisUtterance(segment.text);
        const selected = voiceRef.current;
        if (selected) utterance.voice = selected;
        // Without a Colombian voice installed, the browser picks its own voice for es-CO.
        utterance.lang = SPEECH_LANG;
        utterance.rate = rateRef.current;
        utterance.onend = () => speakAt(index + 1);
        utterance.onerror = (event) => {
          if (run !== generation.current || event.error === 'interrupted' || event.error === 'canceled') return;
          generation.current += 1;
          setStatus('idle');
          setError(event.error === 'not-allowed' ? 'El navegador bloqueó el audio. Presiona Escuchar de nuevo.' : 'No fue posible leer el texto en voz alta en este navegador.');
        };
        utteranceRef.current = utterance;
        synth.speak(utterance);
      };

      speakAt(Math.max(0, start));
    },
    [halt, segments],
  );

  const pause = useCallback(() => {
    halt();
    setStatus('paused');
  }, [halt]);

  const resume = useCallback(() => playFrom(indexRef.current), [playFrom]);

  const stop = useCallback(() => {
    halt();
    indexRef.current = -1;
    setCurrentIndex(-1);
    setStatus('idle');
  }, [halt]);

  const setRate = useCallback(
    (next: number) => {
      rateRef.current = next;
      setRateState(next);
      // Apply the new speed right away by re-reading the current segment.
      if (status === 'playing') playFrom(indexRef.current);
    },
    [playFrom, status],
  );

  const selectVoice = useCallback(
    (uri: string) => {
      setVoiceURI(uri);
      voiceRef.current = voices.find((candidate) => candidate.voiceURI === uri) ?? defaultVoice(voices);
      if (status === 'playing') playFrom(indexRef.current);
    },
    [playFrom, status, voices],
  );

  // Leaving the page must silence it.
  useEffect(() => halt, [halt]);

  return { supported: SUPPORTED, voices, voice, status, currentIndex, rate, error, playFrom, pause, resume, stop, setRate, selectVoice };
}
