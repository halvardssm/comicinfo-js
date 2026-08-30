import { z } from "@zod/zod";
import type { XmlNode } from "@std/xml";
import {
  elementNode,
  parse as baseParse,
  parseIntNode,
  type ParseOptions as BaseParseOptions,
  type ParseOverrideParseFn,
  parseStringArrayNode,
  stringify as baseStringify,
  type StringifyOptions as BaseStringifyOptions,
  type StringifyOverrideParseFn,
} from "./utils.ts";

/**
 * Type of a comic page.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#type|Type}
 */
export const ComicPageType = z.literal([
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
export type ComicPageType = z.infer<typeof ComicPageType>;

/**
 * Describes each page of the book.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#pages--comicpageinfo|Pages / ComicPageInfo}
 */
export const ComicPageInfo = z.object({
  /**
   * Page number.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#image|Image}
   */
  Image: z.number(),
  /**
   * Type of the page.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#type|Type}
   */
  Type: ComicPageType.optional(),
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
export type ComicPageInfo = z.infer<typeof ComicPageInfo>;

/**
 * A yes/no value.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#blackandwhite|BlackAndWhite}
 */
export const YesNo = z.literal(["Yes", "No"]);

/**
 * A yes/no value.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#blackandwhite|BlackAndWhite}
 */
export type YesNo = z.infer<typeof YesNo>;

/**
 * A comma-separated array of strings.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#creator-fields|Creator fields}
 */
export const StringArray = z
  .string()
  .array()
  .transform((s) => s.join(","));

/**
 * A comma-separated array of strings.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#creator-fields|Creator fields}
 */
export type StringArray = z.infer<typeof StringArray>;

/**
 * The main ComicInfo schema.
 * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md|Schema documentation}
 */
export const ComicInfo = z.object({
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
  Writer: StringArray.optional(),
  /**
   * Person or organization responsible for drawing the art.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#penciller|Penciller}
   */
  Penciller: StringArray.optional(),
  /**
   * Person or organization responsible for inking the pencil art.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#inker|Inker}
   */
  Inker: StringArray.optional(),
  /**
   * Person or organization responsible for applying color to drawings.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#colorist|Colorist}
   */
  Colorist: StringArray.optional(),
  /**
   * Person or organization responsible for drawing text and speech bubbles.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#letterer|Letterer}
   */
  Letterer: StringArray.optional(),
  /**
   * Person or organization responsible for drawing the cover art.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#coverartist|CoverArtist}
   */
  CoverArtist: StringArray.optional(),
  /**
   * A person or organization contributing to a resource by revising or elucidating the content.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#editor|Editor}
   */
  Editor: StringArray.optional(),
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
  Genre: StringArray.optional(),
  /**
   * A URL pointing to a reference website for the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#web|Web}
   */
  Web: StringArray.optional(),
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
  BlackAndWhite: YesNo.optional(),
  /**
   * Whether the book is a manga.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#manga|Manga}
   */
  Manga: YesNo.optional(),
  /**
   * Describes each page of the book.
   * @see {@link https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md#pages--comicpageinfo|Pages / ComicPageInfo}
   */
  Pages: ComicPageInfo.array().optional(),
});

/**
 * The main ComicInfo type.
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

/**
 * Options for stringifying ComicInfo to XML.
 */
export interface StringifyOptions<C = ComicInfo> extends BaseStringifyOptions {
  /**
   * Override parse functions for specific fields.
   */
  overrideParse?: Partial<
    Record<keyof C, StringifyOverrideParseFn | undefined>
  >;
}

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
      "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd",
    order: COMIC_INFO_SEQUENCED_ORDER,
    validate: ComicInfo,
    ...options,
    overrideParse: {
      Pages: (value) => {
        if (value !== undefined) {
          if (!Array.isArray(value)) {
            throw new TypeError("Value of Pages must be an array");
          }

          const pages: XmlNode[] = [];

          for (const page of value) {
            pages.push(
              elementNode("Page", {
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
          return elementNode("Pages", { children: pages });
        }
        return undefined;
      },
      ...options?.overrideParse,
    },
  };

  return baseStringify(input, combinedOptions);
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
      Count: parseIntNode,
      Volume: parseIntNode,
      AlternateCount: parseIntNode,
      Year: parseIntNode,
      Month: parseIntNode,
      PageCount: parseIntNode,
      Writer: parseStringArrayNode,
      Penciller: parseStringArrayNode,
      Inker: parseStringArrayNode,
      Colorist: parseStringArrayNode,
      Letterer: parseStringArrayNode,
      CoverArtist: parseStringArrayNode,
      Editor: parseStringArrayNode,
      Genre: parseStringArrayNode,
      Web: parseStringArrayNode,
      Pages: (input) => {
        if (input.type !== "element" || input.name.local !== "Pages") {
          throw new TypeError(
            `Input is not an Pages XMLElement, found ${input.type}`,
          );
        }

        const pages: ComicPageInfo[] = [];

        for (const child of input.children) {
          if (
            child.type === "element" && child.name.local === "Page" &&
            child.attributes.Image !== undefined
          ) {
            const page = ComicPageInfo.parse({
              Image: parseInt(child.attributes.Image),
              Type: child.attributes.Type,
              DoublePage: child.attributes.DoublePage === "true" ? true : false,
              ImageSize: child.attributes.ImageSize
                ? parseInt(child.attributes.ImageSize)
                : undefined,
              Key: child.attributes.Key,
              ImageWidth: child.attributes.ImageWidth
                ? parseInt(child.attributes.ImageWidth)
                : undefined,
              ImageHeight: child.attributes.Type
                ? parseInt(child.attributes.Type)
                : undefined,
            });

            pages.push(page);
          }
        }

        return { name: input.name.local, value: pages };
      },
      ...options?.overrideParse,
    },
  };

  return baseParse(input, combinedOptions);
}
