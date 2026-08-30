import { parse as xmlParse } from "@std/xml";
import { assertObjectMatch } from "@std/assert";
import { type ComicInfo, stringify } from "./v2_0.ts";
import type { z } from "@zod/zod";

const TEST_OBJECT = {
  Title: "The Amazing Spider-Man",
  Manga: "YesAndRightToLeft",
  Characters: ["Spider-Man"],
  Teams: ["Avengers"],
  Locations: ["Brooklyn"],
  ScanInformation: "Some scanner",
  StoryArc: ["Main story"],
  SeriesGroup: ["Spider-Man"],
  AgeRating: "PG",
  Day: 13,
  MainCharacterOrTeam: "Spider-Man",
  Review: "good soup.",
} satisfies z.input<typeof ComicInfo>;

Deno.test("stringify: handles all v2.0 fields", () => {
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
            "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v2.0/ComicInfo.xsd",
        },
        children: [
          {
            attributes: {},
            children: [
              {
                text: "The Amazing Spider-Man",
                type: "text",
              },
            ],
            name: {
              local: "Title",
              raw: "Title",
            },
            type: "element",
          },
        ],
      },
    },
  );
});
