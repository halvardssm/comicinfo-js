import {
  ComicInfo as V1ComicInfo,
  ComicPageInfo,
  ComicPageType,
  StringArray,
  stringify as v1Stringify,
  type StringifyOptions as V1StringifyOptions,
  YesNo,
} from "./v1_0.ts";
import { z } from "@zod/zod";

export { ComicPageInfo, ComicPageType, StringArray, YesNo };

export const ComicInfoManga = z.union([YesNo, z.literal("YesAndRightToLeft")]);

export type ComicInfoManga = z.infer<typeof ComicInfoManga>;

export const AgeRating = z.literal([
  "Adults Only 18+",
  "Early Childhood",
  "Everyone",
  "Everyone 10+",
  "G",
  "Kids to Adults",
  "M",
  "MA15+",
  "Mature 17+",
  "PG",
  "R18+",
  "Rating Pending",
  "Teen",
  "X18+",
]);

export type AgeRating = z.infer<typeof AgeRating>;

export const ComicInfo = V1ComicInfo.extend({
  Manga: ComicInfoManga.optional(),
  Characters: StringArray.optional(),
  Teams: StringArray.optional(),
  Locations: StringArray.optional(),
  ScanInformation: z.string().optional(),
  StoryArc: StringArray.optional(),
  SeriesGroup: StringArray.optional(),
  AgeRating: AgeRating.optional(),
  Day: z.number().optional(),
  MainCharacterOrTeam: z.string().optional(),
  Review: z.string().optional(),
});

export type ComicInfo = z.infer<typeof ComicInfo>;

/**
 * parser and stringify
 */

export interface StringifyOptions<C = ComicInfo>
  extends V1StringifyOptions<C> {}

export function stringify(input: unknown, options?: StringifyOptions): string {
  const parsed = ComicInfo.parse(input);

  const combinedOptions: StringifyOptions = {
    schema:
      "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v2.0/ComicInfo.xsd",
    ...options,
  };

  return v1Stringify(parsed, combinedOptions);
}
