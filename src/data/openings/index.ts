import type { OpeningLine } from '../../types/opening';
import { sicilianNajdorf } from './sicilianNajdorf';
import { jobavaLondonVariations, jobavaLondon } from './jobavaLondon';

export const allOpenings: OpeningLine[] = [
  sicilianNajdorf,
  ...jobavaLondonVariations,
];

export { sicilianNajdorf, jobavaLondon };
export * from './jobavaLondon';
