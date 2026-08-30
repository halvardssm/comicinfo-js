import {
  parseIntNode,
  type ParseOverrideParseFn,
  parseStringArrayNode,
} from "./utils.ts";
import {
  ComicInfo as V1ComicInfo,
  ComicPageInfo,
  ComicPageType,
  parse as baseParse,
  type ParseOptions as BaseParseOptions,
  StringArray,
  stringify as v1Stringify,
  type StringifyOptions as V1StringifyOptions,
  YesNo,
} from "./v1_0.ts";
import { z } from "@zod/zod";

export { ComicPageInfo, ComicPageType, StringArray, YesNo };

/**
 * Whether the book is a manga, with optional reading direction.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#manga|Manga}
 */
export const ComicInfoManga = z.union([YesNo, z.literal("YesAndRightToLeft")]);

/**
 * Whether the book is a manga, with optional reading direction.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#manga|Manga}
 */
export type ComicInfoManga = z.infer<typeof ComicInfoManga>;

/**
 * Age rating of the book.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#agerating|AgeRating}
 */
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

/**
 * Age rating of the book.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#agerating|AgeRating}
 */
export type AgeRating = z.infer<typeof AgeRating>;

/**
 * The main ComicInfo schema for v2.0, extending v1.0 with additional fields.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export const ComicInfo = V1ComicInfo.extend({
  /**
   * Whether the book is a manga, with optional reading direction.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#manga|Manga}
   */
  Manga: ComicInfoManga.optional(),
  /**
   * Characters present in the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#characters|Characters}
   */
  Characters: StringArray.optional(),
  /**
   * Teams present in the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#teams|Teams}
   */
  Teams: StringArray.optional(),
  /**
   * Locations mentioned in the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#locations|Locations}
   */
  Locations: StringArray.optional(),
  /**
   * A free text field, usually used to store information about who scanned the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#scaninformation|ScanInformation}
   */
  ScanInformation: z.string().optional(),
  /**
   * The story arc that books belong to.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#storyarc|StoryArc}
   */
  StoryArc: StringArray.optional(),
  /**
   * A group or collection the series belongs to.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#seriesgroup|SeriesGroup}
   */
  SeriesGroup: StringArray.optional(),
  /**
   * Age rating of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#agerating|AgeRating}
   */
  AgeRating: AgeRating.optional(),
  /**
   * Release day of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#year--month--day|Year / Month / Day}
   */
  Day: z.number().optional(),
  /**
   * Main character or team mentioned in the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#maincharacterorteam|MainCharacterOrTeam}
   */
  MainCharacterOrTeam: z.string().optional(),
  /**
   * Review of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#review|Review}
   */
  Review: z.string().optional(),
});

/**
 * The main ComicInfo type for v2.0, extending v1.0 with additional fields.
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
  "Publisher",
  "Imprint",
  "Genre",
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
  "SeriesGroup",
  "AgeRating",
  "Pages",
  "CommunityRating",
  "MainCharacterOrTeam",
  "Review",
] as const;

/**
 * Options for stringifying ComicInfo to XML.
 */
export interface StringifyOptions<C = ComicInfo>
  extends V1StringifyOptions<C> {}

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
      "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v2.0/ComicInfo.xsd",
    order: COMIC_INFO_SEQUENCED_ORDER,
    validate: ComicInfo,
    ...options,
  };

  return v1Stringify(input, combinedOptions);
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
      Characters: parseStringArrayNode,
      Teams: parseStringArrayNode,
      Locations: parseStringArrayNode,
      StoryArc: parseStringArrayNode,
      SeriesGroup: parseStringArrayNode,
      Day: parseIntNode,
      ...options?.overrideParse,
    },
  };

  return baseParse(input, combinedOptions);
}
