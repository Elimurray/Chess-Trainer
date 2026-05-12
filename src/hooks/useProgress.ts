import { useState, useCallback } from 'react';
import type { ProgressRecord, ProgressStore } from '../types/opening';

const STORAGE_KEY = 'opening-progress';

function loadStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: ProgressStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Silently ignore storage errors (private browsing, quota exceeded, etc.)
  }
}

function defaultRecord(): ProgressRecord {
  return { attempts: 0, completions: 0, lastPlayed: '', masteryLevel: 0, consecutiveClean: 0 };
}

function bumpMastery(
  current: ProgressRecord['masteryLevel'],
  consecutive: number,
): ProgressRecord['masteryLevel'] {
  if (consecutive >= 3 && current < 3) return (current + 1) as ProgressRecord['masteryLevel'];
  return current;
}

export interface UseProgressResult {
  getProgress: (openingId: string) => ProgressRecord;
  recordResult: (openingId: string, clean: boolean) => void;
  store: ProgressStore;
}

export function useProgress(): UseProgressResult {
  const [store, setStore] = useState<ProgressStore>(loadStore);

  const recordResult = useCallback((openingId: string, clean: boolean) => {
    setStore((prev) => {
      const record = prev[openingId] ?? defaultRecord();
      const consecutive = clean ? record.consecutiveClean + 1 : 0;
      const updated: ProgressRecord = {
        attempts: record.attempts + 1,
        completions: record.completions + 1,
        lastPlayed: new Date().toISOString(),
        consecutiveClean: consecutive,
        masteryLevel: bumpMastery(record.masteryLevel, consecutive),
      };
      const next = { ...prev, [openingId]: updated };
      saveStore(next);
      return next;
    });
  }, []);

  const getProgress = useCallback(
    (openingId: string): ProgressRecord => store[openingId] ?? defaultRecord(),
    [store],
  );

  return { getProgress, recordResult, store };
}
