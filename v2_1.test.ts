import { parse as xmlParse } from "@std/xml";
import { assertObjectMatch } from "@std/assert";
import { type ComicInfo, stringify } from "./v2_1.ts";
import type { z } from "@zod/zod";

const TEST_OBJECT = {
  Translator: ["Some translator"],
  Tags: ["action"],
  StoryArcNumber: ["1"],
  GTIN: "asdf",
} satisfies z.input<typeof ComicInfo>;

Deno.test("stringify: handles all v2.1 fields", () => {
  const result = stringify(TEST_OBJECT);

  const parsed = xmlParse(result);

  assertObjectMatch(
    parsed,
    {
      declaration: {
        column: 1,
        encoding: "utf-8",
        line: 1,
        offset: 0,
        type: "declaration",
        version: "1.0",
      },
      root: {
        attributes: {
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "xsi:noNamespaceSchemaLocation":
            "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/drafts/v2.1/ComicInfo.xsd",
        },
        children: [
          {
            attributes: {},
            children: [
              {
                text: "Some translator",
                type: "text",
              },
            ],
            name: {
              local: "Translator",
              raw: "Translator",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "action",
                type: "text",
              },
            ],
            name: {
              local: "Tags",
              raw: "Tags",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "1",
                type: "text",
              },
            ],
            name: {
              local: "StoryArcNumber",
              raw: "StoryArcNumber",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "asdf",
                type: "text",
              },
            ],
            name: {
              local: "GTIN",
              raw: "GTIN",
            },
            type: "element",
          },
        ],
      },
    },
  );
});
