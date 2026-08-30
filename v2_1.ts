import { z } from "@zod/zod";
import {
  AgeRating,
  ComicInfo as V2ComicInfo,
  ComicInfoManga,
  ComicPageInfo,
  ComicPageType,
  parse as baseParse,
  type ParseOptions as BaseParseOptions,
  StringArray,
  stringify as v2Stringify,
  type StringifyOptions as V2StringifyOptions,
  YesNo,
} from "./v2_0.ts";
import { type ParseOverrideParseFn, parseStringArrayNode } from "./utils.ts";

export {
  AgeRating,
  ComicInfoManga,
  ComicPageInfo,
  ComicPageType,
  StringArray,
  YesNo,
};

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
 * Order of the keys as the schema specifies a schema
 */
export const COMIC_INFO_SEQUENCED_ORDER = [
  "Title",
  "Series",
  "Number",
  "Count",
  "Volume",
  "AlternateSeries",
  "AlternateNumber",
  "AlternateCount",
  "Summary",
  "Notes",
  "Year",
  "Month",
  "Day",
  "Writer",
  "Penciller",
  "Inker",
  "Colorist",
  "Letterer",
  "CoverArtist",
  "Editor",
  "Translator",
  "Publisher",
  "Imprint",
  "Genre",
  "Tags",
  "Web",
  "PageCount",
  "LanguageISO",
  "Format",
  "BlackAndWhite",
  "Manga",
  "Characters",
  "Teams",
  "Locations",
  "ScanInformation",
  "StoryArc",
  "StoryArcNumber",
  "SeriesGroup",
  "AgeRating",
  "Pages",
  "CommunityRating",
  "MainCharacterOrTeam",
  "Review",
  "GTIN",
] as const;

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
export function stringify(
  input: Record<string, unknown>,
  options?: StringifyOptions,
): string {
  const combinedOptions: StringifyOptions = {
    schema:
      "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/drafts/v2.1/ComicInfo.xsd",
    order: COMIC_INFO_SEQUENCED_ORDER,
    validate: ComicInfo,
    ...options,
  };

  return v2Stringify(input, combinedOptions);
}

/**
 * Options for stringifying ComicInfo to XML.
 */
export interface ParseOptions<C = ComicInfo> extends BaseParseOptions {
  /**
   * Override parse functions for specific fields.
   */
  overrideParse?: Partial<Record<keyof C, ParseOverrideParseFn | undefined>>;
}

export function parse(input: string, options?: ParseOptions): ComicInfo {
  const combinedOptions: ParseOptions = {
    validate: ComicInfo,
    ...options,
    overrideParse: {
      Translator: parseStringArrayNode,
      Tags: parseStringArrayNode,
      StoryArcNumber: parseStringArrayNode,
      ...options?.overrideParse,
    },
  };

  return baseParse(input, combinedOptions);
}
