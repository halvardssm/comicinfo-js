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

/**
 * The main ComicInfo schema for v2.1, extending v2.0 with additional fields.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export const ComicInfo = V2ComicInfo.extend({
  /**
   * A person or organization who renders a text from one language into another.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#translator|Translator}
   */
  Translator: StringArray.optional(),
  /**
   * Tags of the book or series.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#tags|Tags}
   */
  Tags: StringArray.optional(),
  /**
   * Story arc number for reading order.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#storyarcnumber|StoryArcNumber}
   */
  StoryArcNumber: StringArray.optional(),
  /**
   * A Global Trade Item Number identifying the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#gtin|GTIN}
   */
  GTIN: z.string().optional(),
});

/**
 * The main ComicInfo type for v2.1, extending v2.0 with additional fields.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export type ComicInfo = z.infer<typeof ComicInfo>;

/**
 * parser and stringify
 */

/**
 * Options for stringifying ComicInfo to XML.
 */
export interface StringifyOptions<C = ComicInfo>
  extends V2StringifyOptions<C> {}

/**
 * Stringifies ComicInfo to XML format.
 * @param input - The input to stringify.
 * @param options - Options for stringifying.
 * @returns The XML string.
 */
export function stringify(input: unknown, options?: StringifyOptions): string {
  const parsed = ComicInfo.parse(input);

  const combinedOptions: StringifyOptions = {
    schema:
      "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/drafts/v2.1/ComicInfo.xsd",
    ...options,
  };

  return v2Stringify(parsed, combinedOptions);
}
