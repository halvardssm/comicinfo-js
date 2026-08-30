import type { z } from "@zod/zod";
import { type ComicInfo, stringify } from "./v1_0.ts";

const node: z.input<typeof ComicInfo> = {
  Title: "a",
  Series: "b",
  Number: "c",
  Count: 1,
  Volume: 2,
  AlternateSeries: "d",
  AlternateNumber: "e",
  AlternateCount: 3,
  Summary: "f",
  Notes: "g",
  Year: 4,
  Month: 5,
  Writer: ["h"],
  Penciller: ["i"],
  Inker: ["j"],
  Colorist: ["k"],
  Letterer: ["l"],
  CoverArtist: ["m"],
  Editor: ["n"],
  Publisher: "o",
  Imprint: "p",
  Genre: ["q"],
  Web: ["r"],
  PageCount: 7,
  LanguageISO: "s",
  Format: "t",
  BlackAndWhite: "Yes",
  Manga: "Yes",
  Pages: [
    {
      Image: 8,
      Type: "FrontCover",
      DoublePage: true,
      ImageSize: 9,
      Key: "aa",
      ImageWidth: 10,
      ImageHeight: 11,
    },
  ],
};

if (import.meta.main) {
  Deno.writeTextFileSync("./tt.xml", stringify(node, { indent: "  " }));
}
