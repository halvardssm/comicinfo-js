import { z } from "@zod/zod";
import { type XmlNode, XMLValidator } from "@stdext/xml";
import {
  ComicInfo as BaseComicInfo,
  type ComicInfoOptions as BaseComicInfoOptions,
  type ParseOptions as BaseParseOptions,
  type ParseXmlNodeFn,
  type StringifyOptions as BaseStringifyOptions,
  type ToXmlNodeFn,
} from "./utils.ts";
import comicInfoXsd from "./xsd/1_0.xsd" with { type: "text" };

const comicInfoValidator = new XMLValidator(comicInfoXsd);

/**
 * SCHEMAS
 */

/**
 * Type of a comic page.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#type|Type}
 */
export const ComicPageTypeSchema = z.literal([
  "FrontCover",
  "InnerCover",
  "Roundup",
  "Story",
  "Advertisement",
  "Editorial",
  "Letters",
  "Preview",
  "BackCover",
  "Other",
  "Deleted",
]);

/**
 * Type of a comic page.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#type|Type}
 */
export type ComicPageTypeSchema = z.infer<typeof ComicPageTypeSchema>;

/**
 * Describes each page of the book.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#pages--comicpageinfo|Pages / ComicPageInfo}
 */
export const ComicPageInfoInputSchema = z.object({
  /**
   * Page number.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#image|Image}
   */
  Image: z.number(),
  /**
   * Type of the page.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#type|Type}
   */
  Type: ComicPageTypeSchema.optional(),
  /**
   * Whether the page is a double spread.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#doublepage|DoublePage}
   */
  DoublePage: z.boolean().optional(),
  /**
   * File size of the image, supposedly in bytes.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#imagesize|ImageSize}
   */
  ImageSize: z.number().optional(),
  /**
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#key|Key}
   */
  Key: z.string().optional(),
  /**
   * Width of the image in pixels.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#imagewidth--imageheight|ImageWidth / ImageHeight}
   */
  ImageWidth: z.number().optional(),
  /**
   * Height of the image in pixels.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#imagewidth--imageheight|ImageWidth / ImageHeight}
   */
  ImageHeight: z.number().optional(),
});

/**
 * Describes each page of the book.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#pages--comicpageinfo|Pages / ComicPageInfo}
 */
export type ComicPageInfoInputSchema = z.infer<typeof ComicPageInfoInputSchema>;

/**
 * A yes/no value. The XML value "Unknown" maps to undefined, meaning the value is unknown.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#blackandwhite|BlackAndWhite}
 */
export const YesNoSchema = z.literal(["Unknown", "No", "Yes"]).transform((v) =>
  v === "Unknown" ? undefined : v
);

/**
 * A yes/no value.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#blackandwhite|BlackAndWhite}
 */
export type YesNoSchema = z.infer<typeof YesNoSchema>;

/**
 * A comma-separated array of strings.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#creator-fields|Creator fields}
 */
export const StringArraySchema = z
  .union([z.string(), z.string().array()])
  .transform((val) =>
    typeof val === "string" ? (val === "" ? [] : val.split(",")) : val
  );

/**
 * A comma-separated array of strings.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#creator-fields|Creator fields}
 */
export type StringArraySchema = z.infer<typeof StringArraySchema>;

/**
 * The main ComicInfo schema.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export const ComicInfoSchema = z.object({
  /**
   * Title of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#title|Title}
   */
  Title: z.string().optional(),
  /**
   * Title of the series the book is part of.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#series|Series}
   */
  Series: z.string().optional(),
  /**
   * Number of the book in the series.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#number|Number}
   */
  Number: z.string().optional(),
  /**
   * The total number of books in the series.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#count|Count}
   */
  Count: z.number().optional(),
  /**
   * Volume containing the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#volume|Volume}
   */
  Volume: z.number().optional(),
  /**
   * Alternate series for cross-over story arcs.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#alternateseries--alternatenumber--alternatecount|AlternateSeries / AlternateNumber / AlternateCount}
   */
  AlternateSeries: z.string().optional(),
  /**
   * Alternate number for cross-over story arcs.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#alternateseries--alternatenumber--alternatecount|AlternateSeries / AlternateNumber / AlternateCount}
   */
  AlternateNumber: z.string().optional(),
  /**
   * Alternate count for cross-over story arcs.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#alternateseries--alternatenumber--alternatecount|AlternateSeries / AlternateNumber / AlternateCount}
   */
  AlternateCount: z.number().optional(),
  /**
   * A description or summary of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#summary|Summary}
   */
  Summary: z.string().optional(),
  /**
   * A free text field, usually used to store information about the application that created the ComicInfo.xml file.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#notes|Notes}
   */
  Notes: z.string().optional(),
  /**
   * Release year of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#year--month--day|Year / Month / Day}
   */
  Year: z.number().optional(),
  /**
   * Release month of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#year--month--day|Year / Month / Day}
   */
  Month: z.number().optional(),
  /**
   * Person or organization responsible for creating the scenario.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#writer|Writer}
   */
  Writer: StringArraySchema.optional(),
  /**
   * Person or organization responsible for drawing the art.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#penciller|Penciller}
   */
  Penciller: StringArraySchema.optional(),
  /**
   * Person or organization responsible for inking the pencil art.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#inker|Inker}
   */
  Inker: StringArraySchema.optional(),
  /**
   * Person or organization responsible for applying color to drawings.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#colorist|Colorist}
   */
  Colorist: StringArraySchema.optional(),
  /**
   * Person or organization responsible for drawing text and speech bubbles.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#letterer|Letterer}
   */
  Letterer: StringArraySchema.optional(),
  /**
   * Person or organization responsible for drawing the cover art.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#coverartist|CoverArtist}
   */
  CoverArtist: StringArraySchema.optional(),
  /**
   * A person or organization contributing to a resource by revising or elucidating the content.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#editor|Editor}
   */
  Editor: StringArraySchema.optional(),
  /**
   * A person or organization responsible for publishing, releasing, or issuing a resource.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#publisher|Publisher}
   */
  Publisher: z.string().optional(),
  /**
   * An imprint is a group of publications under the umbrella of a larger imprint or a Publisher.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#imprint|Imprint}
   */
  Imprint: z.string().optional(),
  /**
   * Genre of the book or series.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#genre|Genre}
   */
  Genre: StringArraySchema.optional(),
  /**
   * A URL pointing to a reference website for the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#web|Web}
   */
  Web: StringArraySchema.optional(),
  /**
   * The number of pages in the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#pagecount|PageCount}
   */
  PageCount: z.number().optional(),
  /**
   * A language code describing the language of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#languageiso|LanguageISO}
   */
  LanguageISO: z.string().optional(),
  /**
   * The original publication's binding format for scanned physical books or presentation format for digital sources.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#format|Format}
   */
  Format: z.string().optional(),
  /**
   * Whether the book is in black and white.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#blackandwhite|BlackAndWhite}
   */
  BlackAndWhite: YesNoSchema.optional(),
  /**
   * Whether the book is a manga.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#manga|Manga}
   */
  Manga: YesNoSchema.optional(),
  /**
   * Describes each page of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#pages--comicpageinfo|Pages / ComicPageInfo}
   */
  Pages: ComicPageInfoInputSchema.array().optional(),
});

/**
 * The main ComicInfo type.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export type ComicInfoSchema = z.infer<typeof ComicInfoSchema>;

/**
 * Input type of the main ComicInfo schema, allowing comma-separated strings for array fields.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export type ComicInfoSchemaInput = z.input<typeof ComicInfoSchema>;

/**
 * CLASSES
 */

export class ComicInfo extends BaseComicInfo {
  protected static COMIC_INFO_SEQUENCED_ORDER: ReadonlyArray<string> = [
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
    "Pages",
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
      ...options,
      overrideToXmlNode: {
        Pages: ComicInfo._toPagesNode,
        ...options?.overrideToXmlNode,
      },
    };

    return super.stringify(combinedOptions);
  }

  static override parse(data: string, options?: ParseOptions): ComicInfo {
    const combinedOptions: BaseParseOptions = {
      dataSchema: ComicInfoSchema,
      comicInfoValidator,
      ComicInfoClass: ComicInfo,
      ...options,
      overrideParseXmlNode: {
        Count: this._parseIntNode,
        Volume: this._parseIntNode,
        AlternateCount: this._parseIntNode,
        Year: this._parseIntNode,
        Month: this._parseIntNode,
        PageCount: this._parseIntNode,
        Writer: this._parseStringArrayNode,
        Penciller: this._parseStringArrayNode,
        Inker: this._parseStringArrayNode,
        Colorist: this._parseStringArrayNode,
        Letterer: this._parseStringArrayNode,
        CoverArtist: this._parseStringArrayNode,
        Editor: this._parseStringArrayNode,
        Genre: this._parseStringArrayNode,
        Web: this._parseStringArrayNode,
        Pages: this._parsePagesNode,
        ...options?.overrideParseXmlNode,
      },
    };

    return super.parse(data, combinedOptions);
  }

  /**
   * HELPERS
   */

  protected static _parsePagesNode: ParseXmlNodeFn<ComicPageInfoInputSchema[]> =
    (
      input,
    ) => {
      if (input.type !== "element" || input.name.local !== "Pages") {
        throw new TypeError(
          `Input is not an Pages XMLElement, found ${input.type}`,
        );
      }

      const pages: ComicPageInfoInputSchema[] = [];

      for (const child of input.children) {
        if (child.type === "element" && child.name.local === "Page") {
          if (child.attributes.Image === undefined) {
            throw new TypeError(
              "Page element is missing the required Image attribute (nil pages are not supported)",
            );
          }

          const pageData: Record<string, unknown> = {
            Image: parseInt(child.attributes.Image),
          };

          if (child.attributes.Type !== undefined) {
            const types = child.attributes.Type.trim().split(/\s+/);
            if (types.length > 1) {
              throw new TypeError(
                `Multiple page types are not supported, found "${child.attributes.Type}"`,
              );
            }
            pageData.Type = types[0];
          }
          if (child.attributes.DoublePage !== undefined) {
            pageData.DoublePage = child.attributes.DoublePage === "true" ||
              child.attributes.DoublePage === "1";
          }
          if (child.attributes.ImageSize !== undefined) {
            pageData.ImageSize = parseInt(child.attributes.ImageSize);
          }
          if (child.attributes.Key !== undefined) {
            pageData.Key = child.attributes.Key;
          }
          if (child.attributes.ImageWidth !== undefined) {
            pageData.ImageWidth = parseInt(child.attributes.ImageWidth);
          }
          if (child.attributes.ImageHeight !== undefined) {
            pageData.ImageHeight = parseInt(child.attributes.ImageHeight);
          }

          const page = ComicPageInfoInputSchema.parse(pageData);
          pages.push(page);
        }
      }

      return { name: input.name.local, value: pages };
    };

  protected static _toPagesNode: ToXmlNodeFn = (
    input,
  ) => {
    if (input !== undefined) {
      if (!Array.isArray(input)) {
        throw new TypeError("Value of Pages must be an array");
      }
      if (input.length === 0) return undefined;

      const pages: XmlNode[] = [];

      for (const page of input) {
        pages.push(
          ComicInfo._elementNode("Page", {
            attributes: (
              Object.keys(page) as Array<keyof typeof page>
            ).reduce(
              (acc, curr) => {
                if (typeof curr === "string" && page[curr] != null) {
                  acc[curr] = page[curr].toString();
                }
                return acc;
              },
              {} as Record<string, string>,
            ),
          }),
        );
      }
      return ComicInfo._elementNode("Pages", { children: pages });
    }
    return undefined;
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
   * Validator used to validate the input XML. Defaults to the v1.0 ComicInfo XSD.
   */
  comicInfoValidator?: BaseParseOptions["comicInfoValidator"];
  /**
   * Class used to construct the parsed ComicInfo. Defaults to the v1.0 ComicInfo class.
   */
  ComicInfoClass?: BaseParseOptions["ComicInfoClass"];
  /**
   * Override parse functions for specific fields.
   */
  overrideParseXmlNode?: Partial<Record<keyof C, ParseXmlNodeFn | undefined>>;
}
