import { z } from "@zod/zod";
import { XMLValidator } from "@stdext/xml";
import {
  ComicInfo as V1ComicInfo,
  ComicInfoSchema as V1ComicInfoSchema,
  type ComicInfoSchemaInput as V1ComicInfoSchemaInput,
  ComicPageInfoInputSchema as V1ComicPageInfoInputSchema,
  ComicPageTypeSchema,
  StringArraySchema,
  YesNoSchema,
} from "./v1_0.ts";
import type {
  ComicInfoOptions as BaseComicInfoOptions,
  ParseOptions as BaseParseOptions,
  ParseXmlNodeFn,
  StringifyOptions as BaseStringifyOptions,
  ToXmlNodeFn,
} from "./utils.ts";
import comicInfoXsd from "./xsd/2_0.xsd" with { type: "text" };

const comicInfoValidator = new XMLValidator(comicInfoXsd);

const COMIC_INFO_SCHEMA_LOCATION =
  "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v2.0/ComicInfo.xsd";

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

export class ComicInfo extends V1ComicInfo {
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

  constructor(data: ComicInfoSchemaInput, options?: ComicInfoOptions) {
    const combinedOptions: BaseComicInfoOptions = {
      dataSchema: ComicInfoSchema,
      comicInfoValidator,
      ...options,
    };
    // The v1.0 constructor narrows the input type; the v2.0 input is a
    // superset of it and is validated by the v2.0 schema.
    super(data as V1ComicInfoSchemaInput, combinedOptions);
  }

  override stringify(options?: StringifyOptions): string {
    const combinedOptions: StringifyOptions = {
      order: ComicInfo.COMIC_INFO_SEQUENCED_ORDER,
      schemaLocation: COMIC_INFO_SCHEMA_LOCATION,
      ...options,
    };

    return super.stringify(combinedOptions);
  }

  static override parse(data: string, options?: ParseOptions): ComicInfo {
    const combinedOptions: ParseOptions = {
      dataSchema: ComicInfoSchema,
      comicInfoValidator,
      ComicInfoClass: ComicInfo,
      ...options,
      overrideParseXmlNode: {
        Day: this._parseIntNode,
        Characters: this._parseStringArrayNode,
        Teams: this._parseStringArrayNode,
        Locations: this._parseStringArrayNode,
        StoryArc: this._parseStringArrayNode,
        SeriesGroup: this._parseStringArrayNode,
        CommunityRating: this._parseFloatNode,
        Pages: ComicInfo._parsePagesNode,
        ...options?.overrideParseXmlNode,
      },
    };

    return super.parse(data, combinedOptions);
  }

  /**
   * HELPERS
   */

  protected static override _parsePagesNode: ParseXmlNodeFn<
    ComicPageInfoInputSchema[]
  > = (input) => {
    if (input.type !== "element" || input.name.local !== "Pages") {
      throw new TypeError(
        `Input is not an Pages XMLElement, found ${input.type}`,
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
}

/**
 * TYPES
 */

export interface ComicInfoOptions extends Partial<BaseComicInfoOptions> {
}

/**
 * Options for stringifying ComicInfo to XML.
 */
export interface StringifyOptions<C = ComicInfoSchema>
  extends BaseStringifyOptions {
  /**
   * Override to-XML node functions for specific fields.
   */
  overrideToXmlNode?: Partial<
    Record<keyof C, ToXmlNodeFn | undefined>
  >;
}

/**
 * Options for parsing XML to ComicInfo.
 */
export interface ParseOptions<C = ComicInfoSchema> {
  /**
   * Data schema used to validate the parsed data. Defaults to {@link ComicInfoSchema}.
   */
  dataSchema?: BaseParseOptions["dataSchema"];
  /**
   * Validator used to validate the input XML. Defaults to the v2.0 ComicInfo XSD.
   */
  comicInfoValidator?: BaseParseOptions["comicInfoValidator"];
  /**
   * Class used to construct the parsed ComicInfo. Defaults to the v2.0 ComicInfo class.
   */
  ComicInfoClass?: BaseParseOptions["ComicInfoClass"];
  /**
   * Override parse functions for specific fields.
   */
  overrideParseXmlNode?: Partial<Record<keyof C, ParseXmlNodeFn | undefined>>;
}
