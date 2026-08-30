import { z } from "@zod/zod";
import {
  AgeRating,
  ComicInfo as V2ComicInfo,
  ComicInfoManga,
  ComicPageInfo,
  ComicPageType,
  StringArray,
  stringify as v2Stringify,
  type StringifyOptions as V2StringifyOptions,
  YesNo,
} from "./v2_0.ts";

export { AgeRating, ComicInfoManga, ComicPageInfo, ComicPageType, YesNo };

export const ComicInfo = V2ComicInfo.extend({
  Translator: StringArray.optional(),
  Tags: StringArray.optional(),
  StoryArcNumber: StringArray.optional(),
  GTIN: z.string().optional(),
});

export type ComicInfo = z.infer<typeof ComicInfo>;

/**
 * parser and stringify
 */

export interface StringifyOptions<C = ComicInfo>
  extends V2StringifyOptions<C> {}

export function stringify(input: unknown, options?: StringifyOptions): string {
  const parsed = ComicInfo.parse(input);

  const combinedOptions: StringifyOptions = {
    schema:
      "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/drafts/v2.1/ComicInfo.xsd",
    ...options,
  };

  return v2Stringify(parsed, combinedOptions);
}
