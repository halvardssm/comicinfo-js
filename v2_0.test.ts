import { assertEquals, assertThrows } from "@std/assert";
import { ComicInfo } from "./v2_0.ts";
import { TEST_OBJECT_V2 } from "./test_assets/objects.ts";

const TEST_XML =
  `<?xml version="1.0" encoding="utf-8"?><ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v2.0/ComicInfo.xsd"><Title>The Amazing Spider-Man</Title><Series>The Amazing Spider-Man</Series><Number>42</Number><Count>100</Count><Volume>1</Volume><AlternateSeries>Spider-Man</AlternateSeries><AlternateNumber>1</AlternateNumber><AlternateCount>50</AlternateCount><Summary>Spider-Man fights Green Goblin</Summary><Notes>Digital version</Notes><Year>2024</Year><Month>5</Month><Day>13</Day><Writer>Dan Slott</Writer><Penciller>John Romita</Penciller><Inker>Jazon</Inker><Colorist>Justin Ponsor</Colorist><Letterer>Joe Caramagna</Letterer><CoverArtist>Alex Ross</CoverArtist><Editor>Nick Lowe</Editor><Publisher>Marvel Comics</Publisher><Imprint>Marvel</Imprint><Genre>Superhero</Genre><Web>https://marvel.com</Web><PageCount>32</PageCount><LanguageISO>en-US</LanguageISO><Format>Comic</Format><BlackAndWhite>No</BlackAndWhite><Manga>YesAndRightToLeft</Manga><Characters>Spider-Man</Characters><Teams>Avengers</Teams><Locations>Brooklyn</Locations><ScanInformation>Some scanner</ScanInformation><StoryArc>Main story</StoryArc><SeriesGroup>Spider-Man</SeriesGroup><AgeRating>PG</AgeRating><Pages><Page Image="1" Type="FrontCover" DoublePage="true" ImageSize="1024" Key="cover" ImageWidth="800" ImageHeight="1200"/><Page Image="2"/></Pages><CommunityRating>4.5</CommunityRating><MainCharacterOrTeam>Spider-Man</MainCharacterOrTeam><Review>good soup.</Review></ComicInfo>`;

// ============================================================================
// stringify tests
// ============================================================================

Deno.test("v2.0/stringify: handles all v2.0 fields", () => {
  assertEquals(new ComicInfo(TEST_OBJECT_V2).stringify(), TEST_XML);
});

Deno.test("v2.0/stringify: sequences v2.0 fields per the XSD", () => {
  const result = new ComicInfo(TEST_OBJECT_V2).stringify();

  // Day follows Month, and CommunityRating follows Pages, per the v2.0 XSD.
  assertEquals(
    result.indexOf("<Month>5</Month>") < result.indexOf("<Day>13</Day>"),
    true,
  );
  assertEquals(
    result.indexOf("<Pages>") < result.indexOf("<CommunityRating>"),
    true,
  );
});

Deno.test("v2.0/stringify: omits Unknown manga values", () => {
  const result = new ComicInfo({ Title: "Test", Manga: "Unknown" })
    .stringify();

  assertEquals(result.includes("<Title>Test</Title>"), true);
  assertEquals(result.includes("<Manga"), false);
});

Deno.test("v2.0/stringify: omits Unknown age rating values", () => {
  const result = new ComicInfo({ Title: "Test", AgeRating: "Unknown" })
    .stringify();

  assertEquals(result.includes("<Title>Test</Title>"), true);
  assertEquals(result.includes("<AgeRating"), false);
});

// ============================================================================
// parse tests
// ============================================================================

Deno.test("v2.0/parse: handles all v2.0 fields", () => {
  assertEquals(ComicInfo.parse(TEST_XML).data, TEST_OBJECT_V2);
});

Deno.test("v2.0/parse: maps Unknown manga and age rating values to undefined", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <Title>Test</Title>
  <Manga>Unknown</Manga>
  <AgeRating>Unknown</AgeRating>
</ComicInfo>`;

  const result = ComicInfo.parse(xml);

  assertEquals(result.data.Manga, undefined);
  assertEquals(result.data.AgeRating, undefined);
});

Deno.test("v2.0/parse: handles Bookmark page attribute", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <Pages>
    <Page Image="1" Bookmark="chapter-1"/>
  </Pages>
</ComicInfo>`;

  const result = ComicInfo.parse(xml);

  assertEquals(result.data.Pages, [{ Image: 1, Bookmark: "chapter-1" }]);
});

Deno.test("v2.0/parse: parses CommunityRating as float", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <CommunityRating>4.25</CommunityRating>
</ComicInfo>`;

  const result = ComicInfo.parse(xml);

  assertEquals(result.data.CommunityRating, 4.25);
});

Deno.test("v2.0/parse: throws on CommunityRating out of range", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <CommunityRating>6</CommunityRating>
</ComicInfo>`;

  assertThrows(() => ComicInfo.parse(xml), Error, "maxInclusive");
});

Deno.test("v2.0/parse: throws on invalid Manga value", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <Manga>Maybe</Manga>
</ComicInfo>`;

  assertThrows(() => ComicInfo.parse(xml), Error, "allowed values");
});

Deno.test("v2.0/parse: throws on out-of-sequence elements", () => {
  // Day must follow Month directly, not appear after AgeRating.
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <Month>5</Month>
  <AgeRating>PG</AgeRating>
  <Day>15</Day>
</ComicInfo>`;

  assertThrows(() => ComicInfo.parse(xml), Error, "Unexpected element");
});

Deno.test("v2.0/parse: throws on duplicate elements", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <SeriesGroup>Marvel</SeriesGroup>
  <SeriesGroup>Marvel</SeriesGroup>
</ComicInfo>`;

  assertThrows(() => ComicInfo.parse(xml), Error, "Unexpected element");
});

// ============================================================================
// roundtrip tests
// ============================================================================

Deno.test("v2.0/roundtrip: parse and stringify are inverse operations", () => {
  const xml = new ComicInfo(TEST_OBJECT_V2).stringify();
  const parsed = ComicInfo.parse(xml);

  assertEquals(parsed.data, TEST_OBJECT_V2);
});
