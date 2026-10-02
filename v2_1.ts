import { z } from "@zod/zod";
import { XMLValidator } from "@stdext/xml";
import {
  ComicInfo as V2ComicInfo,
  ComicInfoSchema as V2ComicInfoSchema,
  StringArray,
} from "./v2_0.ts";
import type {
  ComicInfoOptions as BaseComicInfoOptions,
  ParseOptions as BaseParseOptions,
  ParseXmlNodeFn,
  StringifyOptions as BaseStringifyOptions,
  ToXmlNodeFn,
} from "./utils.ts";
import comicInfoXsd from "./xsd/2_1.xsd" with { type: "text" };

const comicInfoValidator = new XMLValidator(comicInfoXsd);

const COMIC_INFO_SCHEMA_LOCATION =
  "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/drafts/v2.1/ComicInfo.xsd";

/**
 * SCHEMAS
 */

/**
 * The main ComicInfo schema for v2.1, extending v2.0 with additional fields.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export const ComicInfoSchema = V2ComicInfoSchema.extend({
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
export type ComicInfoSchema = z.infer<typeof ComicInfoSchema>;

/**
 * Input type of the main ComicInfo schema for v2.1, allowing comma-separated strings for array fields.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export type ComicInfoSchemaInput = z.input<typeof ComicInfoSchema>;

export {
  AgeRatingSchema,
  ComicPageInfo,
  ComicPageType,
  MangaSchema,
  StringArray,
  YesNo,
} from "./v2_0.ts";

/**
 * CLASSES
 */

export class ComicInfo extends V2ComicInfo {
  protected static override COMIC_INFO_SEQUENCED_ORDER = [
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

  constructor(data: ComicInfoSchemaInput, options?: ComicInfoOptions) {
    const combinedOptions: BaseComicInfoOptions = {
      dataSchema: ComicInfoSchema,
      comicInfoValidator,
      ...options,
    };
    super(data, combinedOptions);
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
        Translator: this._parseStringArrayNode,
        Tags: this._parseStringArrayNode,
        StoryArcNumber: this._parseStringArrayNode,
        ...options?.overrideParseXmlNode,
      },
    };

    return super.parse(data, combinedOptions);
  }
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
   * Validator used to validate the input XML. Defaults to the v2.1 ComicInfo XSD.
   */
  comicInfoValidator?: BaseParseOptions["comicInfoValidator"];
  /**
   * Class used to construct the parsed ComicInfo. Defaults to the v2.1 ComicInfo class.
   */
  ComicInfoClass?: BaseParseOptions["ComicInfoClass"];
  /**
   * Override parse functions for specific fields.
   */
  overrideParseXmlNode?: Partial<Record<keyof C, ParseXmlNodeFn | undefined>>;
}
