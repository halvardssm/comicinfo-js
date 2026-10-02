import { assertArrayIncludes, assertEquals, assertThrows } from "@std/assert";
import { ComicInfo, ComicInfoSchema } from "./v1_0.ts";
import type { z } from "@zod/zod";

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

const TEST_XML =
  `<?xml version="1.0" encoding="utf-8"?><ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd"><Title>The Amazing Spider-Man</Title><Series>The Amazing Spider-Man</Series><Number>42</Number><Count>100</Count><Volume>1</Volume><AlternateSeries>Spider-Man</AlternateSeries><AlternateNumber>1</AlternateNumber><AlternateCount>50</AlternateCount><Summary>Spider-Man fights Green Goblin</Summary><Notes>Digital version</Notes><Year>2024</Year><Month>5</Month><Writer>Dan Slott</Writer><Penciller>John Romita</Penciller><Inker>Jazon</Inker><Colorist>Justin Ponsor</Colorist><Letterer>Joe Caramagna</Letterer><CoverArtist>Alex Ross</CoverArtist><Editor>Nick Lowe</Editor><Publisher>Marvel Comics</Publisher><Imprint>Marvel</Imprint><Genre>Superhero</Genre><Web>https://marvel.com</Web><PageCount>32</PageCount><LanguageISO>en-US</LanguageISO><Format>Comic</Format><BlackAndWhite>No</BlackAndWhite><Manga>No</Manga><Pages><Page Image="1" Type="FrontCover" DoublePage="true" ImageSize="1024" Key="cover" ImageWidth="800" ImageHeight="1200"/><Page Image="2"/></Pages></ComicInfo>`;

// ============================================================================
// stringify tests
// ============================================================================

Deno.test("v1.0/stringify: handles all v1.0 fields", () => {
  assertEquals(new ComicInfo(TEST_OBJECT_V1).stringify(), TEST_XML);
});

Deno.test("v1.0/stringify: omits empty Pages array", () => {
  const result = new ComicInfo({ Title: "Test", Pages: [] }).stringify();

  assertEquals(result.includes("<Title>Test</Title>"), true);
  assertEquals(result.includes("<Pages"), false);
});

Deno.test("v1.0/stringify: skips undefined fields", () => {
  const result = new ComicInfo({ Title: "Test", Series: undefined })
    .stringify();

  assertEquals(result.includes("<Title>Test</Title>"), true);
  assertEquals(result.includes("<Series"), false);
});

Deno.test("v1.0/stringify: omits Unknown yes/no values", () => {
  const result = new ComicInfo({
    Title: "Test",
    BlackAndWhite: "Unknown",
  }).stringify();

  assertEquals(result.includes("<Title>Test</Title>"), true);
  assertEquals(result.includes("<BlackAndWhite"), false);
});

// ============================================================================
// parse tests
// ============================================================================

Deno.test("v1.0/parse: handles all v1.0 fields", () => {
  assertEquals(ComicInfo.parse(TEST_XML).data, TEST_OBJECT_V1);
});

Deno.test("v1.0/parse: handles empty Pages element", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd">
  <Title>Test</Title>
  <Pages></Pages>
</ComicInfo>`;

  const result = ComicInfo.parse(xml);

  assertEquals(result.data.Title, "Test");
  assertEquals(result.data.Pages, []);
});

Deno.test("v1.0/parse: handles missing optional fields", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd">
  <Title>Test</Title>
</ComicInfo>`;

  const result = ComicInfo.parse(xml);

  assertEquals(result.data.Title, "Test");
  assertEquals(result.data.Series, undefined);
  assertEquals(result.data.Number, undefined);
  assertEquals(result.data.Count, undefined);
});

Deno.test("v1.0/parse: handles string array fields with multiple values", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd">
  <Title>Test</Title>
  <Writer>Dan Slott,John Romita</Writer>
  <Genre>Superhero,Action</Genre>
</ComicInfo>`;

  const result = ComicInfo.parse(xml);

  assertEquals(result.data.Title, "Test");
  assertEquals(result.data.Writer, ["Dan Slott", "John Romita"]);
  assertEquals(result.data.Genre, ["Superhero", "Action"]);
});

Deno.test("v1.0/parse: handles empty string array element", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd">
  <Title>Test</Title>
  <Writer></Writer>
</ComicInfo>`;

  const result = ComicInfo.parse(xml);

  assertEquals(result.data.Writer, []);
});

Deno.test("v1.0/parse: handles Page with minimal attributes", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd">
  <Title>Test</Title>
  <Pages>
    <Page Image="1"/>
    <Page Image="2" Type="Story"/>
    <Page Image="3" Type="BackCover" DoublePage="true"/>
  </Pages>
</ComicInfo>`;

  const result = ComicInfo.parse(xml);

  assertArrayIncludes(result.data.Pages as unknown[], [
    { Image: 1 },
    { Image: 2, Type: "Story" },
    { Image: 3, Type: "BackCover", DoublePage: true },
  ]);
});

Deno.test("v1.0/parse: accepts 1 and 0 as DoublePage values", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd">
  <Pages>
    <Page Image="1" DoublePage="1"/>
    <Page Image="2" DoublePage="0"/>
  </Pages>
</ComicInfo>`;

  const pages = ComicInfo.parse(xml).data.Pages as Array<
    { DoublePage?: boolean }
  >;

  assertEquals(pages[0].DoublePage, true);
  assertEquals(pages[1].DoublePage, false);
});

Deno.test("v1.0/parse: maps Unknown yes/no values to undefined", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd">
  <Title>Test</Title>
  <BlackAndWhite>Unknown</BlackAndWhite>
  <Manga>Unknown</Manga>
</ComicInfo>`;

  const result = ComicInfo.parse(xml);

  assertEquals(result.data.BlackAndWhite, undefined);
  assertEquals(result.data.Manga, undefined);
});

Deno.test("v1.0/parse: throws on invalid XML", () => {
  assertThrows(() => ComicInfo.parse("not valid xml"));
});

Deno.test("v1.0/parse: throws on non-ComicInfo XML", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<NotComicInfo>
  <Title>Test</Title>
</NotComicInfo>`;

  assertThrows(() => ComicInfo.parse(xml), Error, "NotComicInfo");
});

Deno.test("v1.0/parse: throws on Page missing the Image attribute", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Pages>
    <Page Image="1"/>
    <Page xsi:nil="true"/>
  </Pages>
</ComicInfo>`;

  assertThrows(() => ComicInfo.parse(xml), TypeError, "Image attribute");
});

Deno.test("v1.0/parse: throws on multiple page types", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <Pages>
    <Page Image="1" Type="FrontCover Story"/>
  </Pages>
</ComicInfo>`;

  assertThrows(() => ComicInfo.parse(xml), TypeError, "Multiple page types");
});

// ============================================================================
// roundtrip tests
// ============================================================================

Deno.test("v1.0/roundtrip: parse and stringify are inverse operations", () => {
  const xml = new ComicInfo(TEST_OBJECT_V1).stringify();
  const parsed = ComicInfo.parse(xml);

  assertEquals(parsed.data, TEST_OBJECT_V1);
});
