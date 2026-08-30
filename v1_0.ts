import { z } from "@zod/zod";
import type { XmlNode } from "@std/xml";
import {
  elementNode,
  type OverrideParseFn,
  stringify as baseStringify,
  type StringifyOptions as BaseStringifyOptions,
} from "./utils.ts";

/**
 * Schemas
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

export type ComicPageType = z.infer<typeof ComicPageType>;

export const ComicPageInfo = z.object({
  Image: z.number(),
  Type: ComicPageType.optional(),
  DoublePage: z.boolean().optional(),
  ImageSize: z.number().optional(),
  Key: z.string().optional(),
  ImageWidth: z.number().optional(),
  ImageHeight: z.number().optional(),
});

export type ComicPageInfo = z.infer<typeof ComicPageInfo>;

export const YesNo = z.literal(["Yes", "No"]);

export type YesNo = z.infer<typeof YesNo>;

export const StringArray = z
  .string()
  .array()
  .transform((s) => s.join(","));

export type StringArray = z.infer<typeof StringArray>;

export const ComicInfo = z.object({
  Title: z.string().optional(),
  Series: z.string().optional(),
  Number: z.string().optional(),
  Count: z.number().optional(),
  Volume: z.number().optional(),
  AlternateSeries: z.string().optional(),
  AlternateNumber: z.string().optional(),
  AlternateCount: z.number().optional(),
  Summary: z.string().optional(),
  Notes: z.string().optional(),
  Year: z.number().optional(),
  Month: z.number().optional(),
  Writer: StringArray.optional(),
  Penciller: StringArray.optional(),
  Inker: StringArray.optional(),
  Colorist: StringArray.optional(),
  Letterer: StringArray.optional(),
  CoverArtist: StringArray.optional(),
  Editor: StringArray.optional(),
  Publisher: z.string().optional(),
  Imprint: z.string().optional(),
  Genre: StringArray.optional(),
  Web: StringArray.optional(),
  PageCount: z.number().optional(),
  LanguageISO: z.string().optional(),
  Format: z.string().optional(),
  BlackAndWhite: YesNo,
  Manga: YesNo,
  Pages: ComicPageInfo.array().optional(),
});

export type ComicInfo = z.infer<typeof ComicInfo>;

/**
 * parser and stringify
 */

export interface StringifyOptions<C = ComicInfo> extends BaseStringifyOptions {
  overrideParse?: Partial<Record<keyof C, OverrideParseFn | undefined>>;
}

export function stringify(input: unknown, options?: StringifyOptions): string {
  const parsed = ComicInfo.parse(input);

  const combinedOptions: StringifyOptions = {
    schema:
      "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd",
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

  return baseStringify(parsed, combinedOptions);
}
