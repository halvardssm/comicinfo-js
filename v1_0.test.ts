import { parse as xmlParse } from "@std/xml";
import {
  assertArrayIncludes,
  assertEquals,
  assertObjectMatch,
} from "@std/assert";
import { type ComicInfo, stringify } from "./v1_0.ts";
import type { z } from "@zod/zod";

const TEST_OBJECT = {
  Title: "The Amazing Spider-Man",
  Series: "The Amazing Spider-Man",
  Number: "42",
  Count: 100,
  Volume: 1,
  AlternateSeries: "Spider-Man",
  AlternateNumber: "1",
  AlternateCount: 50,
  Summary: "Spider-Man fights Green Goblin",
  Notes: "Digital version",
  Year: 2024,
  Month: 5,
  Writer: ["Dan Slott"],
  Penciller: ["John Romita"],
  Inker: ["Jazon"],
  Colorist: ["Justin Ponsor"],
  Letterer: ["Joe Caramagna"],
  CoverArtist: ["Alex Ross"],
  Editor: ["Nick Lowe"],
  Publisher: "Marvel Comics",
  Imprint: "Marvel",
  Genre: ["Superhero"],
  Web: ["https://marvel.com"],
  PageCount: 32,
  LanguageISO: "en-US",
  Format: "Comic",
  BlackAndWhite: "No",
  Manga: "No",
  Pages: [
    {
      Image: 1,
      Type: "FrontCover",
      DoublePage: true,
      ImageSize: 1024,
      Key: "cover",
      ImageWidth: 800,
      ImageHeight: 1200,
    },
    {
      Image: 2,
    },
  ],
} as const satisfies z.input<typeof ComicInfo>;

Deno.test("v1.0/stringify: handles all v1.0 fields", () => {
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
            "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd",
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
          {
            attributes: {},
            children: [
              {
                text: "The Amazing Spider-Man",
                type: "text",
              },
            ],
            name: {
              local: "Series",
              raw: "Series",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "42",
                type: "text",
              },
            ],
            name: {
              local: "Number",
              raw: "Number",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "100",
                type: "text",
              },
            ],
            name: {
              local: "Count",
              raw: "Count",
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
              local: "Volume",
              raw: "Volume",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Spider-Man",
                type: "text",
              },
            ],
            name: {
              local: "AlternateSeries",
              raw: "AlternateSeries",
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
              local: "AlternateNumber",
              raw: "AlternateNumber",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "50",
                type: "text",
              },
            ],
            name: {
              local: "AlternateCount",
              raw: "AlternateCount",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Spider-Man fights Green Goblin",
                type: "text",
              },
            ],
            name: {
              local: "Summary",
              raw: "Summary",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Digital version",
                type: "text",
              },
            ],
            name: {
              local: "Notes",
              raw: "Notes",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "2024",
                type: "text",
              },
            ],
            name: {
              local: "Year",
              raw: "Year",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "5",
                type: "text",
              },
            ],
            name: {
              local: "Month",
              raw: "Month",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Dan Slott",
                type: "text",
              },
            ],
            name: {
              local: "Writer",
              raw: "Writer",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "John Romita",
                type: "text",
              },
            ],
            name: {
              local: "Penciller",
              raw: "Penciller",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Jazon",
                type: "text",
              },
            ],
            name: {
              local: "Inker",
              raw: "Inker",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Justin Ponsor",
                type: "text",
              },
            ],
            name: {
              local: "Colorist",
              raw: "Colorist",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Joe Caramagna",
                type: "text",
              },
            ],
            name: {
              local: "Letterer",
              raw: "Letterer",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Alex Ross",
                type: "text",
              },
            ],
            name: {
              local: "CoverArtist",
              raw: "CoverArtist",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Nick Lowe",
                type: "text",
              },
            ],
            name: {
              local: "Editor",
              raw: "Editor",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Marvel Comics",
                type: "text",
              },
            ],
            name: {
              local: "Publisher",
              raw: "Publisher",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Marvel",
                type: "text",
              },
            ],
            name: {
              local: "Imprint",
              raw: "Imprint",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Superhero",
                type: "text",
              },
            ],
            name: {
              local: "Genre",
              raw: "Genre",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "https://marvel.com",
                type: "text",
              },
            ],
            name: {
              local: "Web",
              raw: "Web",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "32",
                type: "text",
              },
            ],
            name: {
              local: "PageCount",
              raw: "PageCount",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "en-US",
                type: "text",
              },
            ],
            name: {
              local: "LanguageISO",
              raw: "LanguageISO",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "Comic",
                type: "text",
              },
            ],
            name: {
              local: "Format",
              raw: "Format",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "No",
                type: "text",
              },
            ],
            name: {
              local: "BlackAndWhite",
              raw: "BlackAndWhite",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                text: "No",
                type: "text",
              },
            ],
            name: {
              local: "Manga",
              raw: "Manga",
            },
            type: "element",
          },
          {
            attributes: {},
            children: [
              {
                attributes: {
                  DoublePage: "true",
                  Image: "1",
                  ImageHeight: "1200",
                  ImageSize: "1024",
                  ImageWidth: "800",
                  Key: "cover",
                  Type: "FrontCover",
                },
                children: [],
                name: {
                  local: "Page",
                  raw: "Page",
                },
                type: "element",
              },
              {
                attributes: {
                  Image: "2",
                },
                children: [],
                name: {
                  local: "Page",
                  raw: "Page",
                },
                type: "element",
              },
            ],
            name: {
              local: "Pages",
              raw: "Pages",
            },
            type: "element",
          },
        ],
        name: {
          local: "ComicInfo",
          raw: "ComicInfo",
        },
        type: "element",
      },
    },
  );
});

Deno.test("v1.0/stringify: handles empty Pages array", () => {
  const result = stringify({
    Title: "Test",
    Pages: [],
  });

  const parsed = xmlParse(result);

  assertArrayIncludes(parsed.root.children, [{
    attributes: {},
    children: [
      {
        text: "Test",
        type: "text",
      },
    ],
    name: {
      local: "Title",
      raw: "Title",
    },
    type: "element",
  }]);
});

Deno.test("v1.0/stringify: skips undefined fields", () => {
  const result = stringify({
    Title: "Test",
    Series: undefined,
  });

  const parsed = xmlParse(result);

  assertEquals(parsed.root.children, [
    {
      attributes: {},
      children: [
        {
          text: "Test",
          type: "text",
        },
      ],
      name: {
        local: "Title",
        raw: "Title",
      },
      type: "element",
    },
  ]);
});
