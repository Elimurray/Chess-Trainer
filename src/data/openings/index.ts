import type { OpeningLine } from "../../types/opening";
// import { sicilianNajdorf } from "./sicilianNajdorf";
import { jobavaLondonVariations } from "./jobavaLondon";
import { sicilianDefenseAcceleratedDragonVariations } from "./acceleratedDragon";

export const allOpenings: OpeningLine[] = [
  // sicilianNajdorf,
  ...sicilianDefenseAcceleratedDragonVariations,
  ...jobavaLondonVariations,
];

// export { sicilianNajdorf };
export * from "./jobavaLondon";
export * from "./acceleratedDragon";
