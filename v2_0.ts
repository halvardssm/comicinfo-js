/**
 * ComicInfo for specification version v2.0.
 *
 * Extends the v1.0 module with the v2.0 fields — `Day`, `Characters`, `Teams`,
 * `Locations`, `ScanInformation`, `StoryArc`, `SeriesGroup`, `AgeRating`,
 * `CommunityRating`, `MainCharacterOrTeam`, `Review`, the direction-aware
 * `MangaSchema`, and the `Bookmark` page attribute — and defines the v2.0
 * `ComicInfo` class. The shared v1.0 schemas are re-exported.
 *
 * @module
 */
import { z } from "@zod/zod";
import { XMLValidator } from "@stdx/xml";
import {
  ComicInfo as V1ComicInfo,
  ComicInfoSchema as V1ComicInfoSchema,
  type ComicInfoSchemaInput as V1ComicInfoSchemaInput,
  ComicPageInfoInputSchema as V1ComicPageInfoInputSchema,
  ComicPageTypeSchema,
  StringArraySchema,
  type StringifyOptions,
  YesNoSchema,
} from "./v1_0.ts";
import type {
  ComicInfoOptions as BaseComicInfoOptions,
  ParseXmlNodeFn,
} from "./utils.ts";
import comicInfoXsd from "./xsd/2_0.xsd" with { type: "text" };

const comicInfoValidator = new XMLValidator(comicInfoXsd);

/**
 * SCHEMAS
 */

/**
 * Describes each page of the book, extending the v1.0 page with a bookmark.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#pages--comicpageinfo|Pages / ComicPageInfo}
 */
export const ComicPageInfoInputSchema = V1ComicPageInfoInputSchema.extend({
  /**
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#pages--comicpageinfo|Pages / ComicPageInfo}
   */
  Bookmark: z.string().optional(),
});

/**
 * Describes each page of the book, extending the v1.0 page with a bookmark.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#pages--comicpageinfo|Pages / ComicPageInfo}
 */
export type ComicPageInfoInputSchema = z.infer<typeof ComicPageInfoInputSchema>;

/**
 * Whether the book is a manga, with optional reading direction. The XML value "Unknown" maps to undefined, meaning the value is unknown.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#manga|Manga}
 */
export const MangaSchema = z.literal([
  "Unknown",
  "No",
  "Yes",
  "YesAndRightToLeft",
]).transform((v) => v === "Unknown" ? undefined : v);

/**
 * Whether the book is a manga, with optional reading direction.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#manga|Manga}
 */
export type MangaSchema = z.infer<typeof MangaSchema>;

/**
 * Age rating of the book. The XML value "Unknown" maps to undefined, meaning the value is unknown.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#agerating|AgeRating}
 */
export const AgeRatingSchema = z.literal([
  "Unknown",
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
]).transform((v) => v === "Unknown" ? undefined : v);

/**
 * Age rating of the book.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#agerating|AgeRating}
 */
export type AgeRatingSchema = z.infer<typeof AgeRatingSchema>;

/**
 * The main ComicInfo schema for v2.0, extending v1.0 with additional fields.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export const ComicInfoSchema = V1ComicInfoSchema.extend({
  /**
   * Release day of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#year--month--day|Year / Month / Day}
   */
  Day: z.number().optional(),
  /**
   * Whether the book is a manga, with optional reading direction.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#manga|Manga}
   */
  Manga: MangaSchema.optional(),
  /**
   * Characters present in the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#characters|Characters}
   */
  Characters: StringArraySchema.optional(),
  /**
   * Teams present in the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#teams|Teams}
   */
  Teams: StringArraySchema.optional(),
  /**
   * Locations mentioned in the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#locations|Locations}
   */
  Locations: StringArraySchema.optional(),
  /**
   * A free text field, usually used to store information about who scanned the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#scaninformation|ScanInformation}
   */
  ScanInformation: z.string().optional(),
  /**
   * The story arc that books belong to.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#storyarc|StoryArc}
   */
  StoryArc: StringArraySchema.optional(),
  /**
   * A group or collection the series belongs to.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#seriesgroup|SeriesGroup}
   */
  SeriesGroup: StringArraySchema.optional(),
  /**
   * Age rating of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#agerating|AgeRating}
   */
  AgeRating: AgeRatingSchema.optional(),
  /**
   * Community rating of the book, between 0 and 5 with at most 2 fraction digits.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#communityrating|CommunityRating}
   */
  CommunityRating: z.number().optional(),
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
  /**
   * Describes each page of the book, extending the v1.0 page with a bookmark.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#pages--comicpageinfo|Pages / ComicPageInfo}
   */
  Pages: ComicPageInfoInputSchema.array().optional(),
});

/**
 * The main ComicInfo type for v2.0, extending v1.0 with additional fields.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export type ComicInfoSchema = z.infer<typeof ComicInfoSchema>;

/**
 * Input type of the main ComicInfo schema for v2.0, allowing comma-separated strings for array fields.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export type ComicInfoSchemaInput = z.input<typeof ComicInfoSchema>;

export {
  ComicPageInfoInputSchema as ComicPageInfo,
  ComicPageTypeSchema as ComicPageType,
  StringArraySchema as StringArray,
  YesNoSchema as YesNo,
};

/**
 * CLASSES
 */

/**
 * ComicInfo for specification version v2.0.
 *
 * @example
 * ```ts
 * import { ComicInfo } from "@halvardm/comicinfo/v2";
 *
 * const comic = new ComicInfo({
 *   Title: "The Amazing Spider-Man",
 *   Manga: "YesAndRightToLeft",
 *   AgeRating: "PG",
 *   Pages: [{ Image: 1, Bookmark: "cover" }],
 * });
 *
 * const xml = comic.stringify();
 * const parsed = ComicInfo.parse(xml);
 * console.log(parsed.data.Title);
 * ```
 */
export class ComicInfo extends V1ComicInfo {
  /**
   * Location of the XSD advertised by the generated XML.
   */
  protected static override COMIC_INFO_SCHEMA_LOCATION =
    "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v2.0/ComicInfo.xsd";

  protected static override COMIC_INFO_SEQUENCED_ORDER: ReadonlyArray<
    string
  > = [
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
   * Zod schema used to validate data.
   */
  protected static override COMIC_INFO_DATA_SCHEMA:
    BaseComicInfoOptions["dataSchema"] = ComicInfoSchema;

  /**
   * Validator used to validate XML against the XSD.
   */
  protected static override COMIC_INFO_VALIDATOR = comicInfoValidator;

  constructor(data: ComicInfoSchemaInput) {
    // The v1.0 constructor narrows the input type; the v2.0 input is a
    // superset of it and is validated by the v2.0 schema.
    super(data as V1ComicInfoSchemaInput);
  }

  /**
   * HELPERS
   */

  protected static override _parsePagesNode: ParseXmlNodeFn<
    ComicPageInfoInputSchema[]
  > = (input) => {
    if (input.type !== "element" || input.name.local !== "Pages") {
      throw new TypeError(
        `Input is not a Pages XMLElement, found ${input.type}`,
      );
    }

    const { name, value } = V1ComicInfo._parsePagesNode(input);

    // The v1.0 parser produces one page per Page element, so indexes align.
    const pages: ComicPageInfoInputSchema[] = [];
    let index = 0;
    for (const child of input.children) {
      if (child.type === "element" && child.name.local === "Page") {
        pages.push(
          child.attributes.Bookmark !== undefined
            ? { ...value[index], Bookmark: child.attributes.Bookmark }
            : value[index],
        );
        index++;
      }
    }

    return { name, value: pages };
  };

  /**
   * Functions used to parse specific XML elements.
   */
  protected static override COMIC_INFO_PARSE_XML_NODE_FNS = {
    ...V1ComicInfo.COMIC_INFO_PARSE_XML_NODE_FNS,
    Day: this._parseIntNode,
    Characters: this._parseStringArrayNode,
    Teams: this._parseStringArrayNode,
    Locations: this._parseStringArrayNode,
    StoryArc: this._parseStringArrayNode,
    SeriesGroup: this._parseStringArrayNode,
    CommunityRating: this._parseFloatNode,
    Pages: this._parsePagesNode,
  };
}

/**
 * TYPES
 */

export type { StringifyOptions };
