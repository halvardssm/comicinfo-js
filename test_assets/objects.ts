import type { z } from "@zod/zod";
import { ComicInfoSchema } from "../v1_0.ts";
import { ComicInfoSchema as V2ComicInfoSchema } from "../v2_0.ts";

/**
 * Test object covering all v1.0 fields.
 */
export const TEST_OBJECT_V1 = {
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
} satisfies z.input<typeof ComicInfoSchema>;

/**
 * Test object covering all v2.0 fields.
 */
export const TEST_OBJECT_V2 = {
  ...TEST_OBJECT_V1,
  Manga: "YesAndRightToLeft",
  Day: 13,
  Characters: ["Spider-Man"],
  Teams: ["Avengers"],
  Locations: ["Brooklyn"],
  ScanInformation: "Some scanner",
  StoryArc: ["Main story"],
  SeriesGroup: ["Spider-Man"],
  AgeRating: "PG",
  CommunityRating: 4.5,
  MainCharacterOrTeam: "Spider-Man",
  Review: "good soup.",
} satisfies z.input<typeof V2ComicInfoSchema>;
