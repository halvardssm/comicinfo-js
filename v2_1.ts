import { z } from "@zod/zod";
import { XMLValidator } from "@stdext/xml";
import {
  ComicInfo as V2ComicInfo,
  ComicInfoSchema as V2ComicInfoSchema,
  StringArray,
  type StringifyOptions,
} from "./v2_0.ts";
import type { ComicInfoOptions as BaseComicInfoOptions } from "./utils.ts";
import comicInfoXsd from "./xsd/2_1.xsd" with { type: "text" };

const comicInfoValidator = new XMLValidator(comicInfoXsd);

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
  /**
   * Location of the XSD advertised by the generated XML.
   */
  protected static override COMIC_INFO_SCHEMA_LOCATION =
    "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/drafts/v2.1/ComicInfo.xsd";

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
    super(data);
  }

  /**
   * Functions used to parse specific XML elements.
   */
  protected static override COMIC_INFO_PARSE_XML_NODE_FNS = {
    ...V2ComicInfo.COMIC_INFO_PARSE_XML_NODE_FNS,
    Translator: this._parseStringArrayNode,
    Tags: this._parseStringArrayNode,
    StoryArcNumber: this._parseStringArrayNode,
  };
}

/**
 * TYPES
 */

export type { StringifyOptions };
