import { assertEquals, assertThrows } from "@std/assert";
import { ComicInfo } from "./v2_1.ts";
import { TEST_OBJECT_V2_1 } from "./test_assets/objects.ts";

const TEST_XML =
  `<?xml version="1.0" encoding="utf-8"?><ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://github.com/anansi-project/comicinfo/raw/refs/heads/main/drafts/v2.1/ComicInfo.xsd"><Title>The Amazing Spider-Man</Title><Series>The Amazing Spider-Man</Series><Number>42</Number><Count>100</Count><Volume>1</Volume><AlternateSeries>Spider-Man</AlternateSeries><AlternateNumber>1</AlternateNumber><AlternateCount>50</AlternateCount><Summary>Spider-Man fights Green Goblin</Summary><Notes>Digital version</Notes><Year>2024</Year><Month>5</Month><Day>13</Day><Writer>Dan Slott</Writer><Penciller>John Romita</Penciller><Inker>Jazon</Inker><Colorist>Justin Ponsor</Colorist><Letterer>Joe Caramagna</Letterer><CoverArtist>Alex Ross</CoverArtist><Editor>Nick Lowe</Editor><Translator>Some translator</Translator><Publisher>Marvel Comics</Publisher><Imprint>Marvel</Imprint><Genre>Superhero</Genre><Tags>action</Tags><Web>https://marvel.com</Web><PageCount>32</PageCount><LanguageISO>en-US</LanguageISO><Format>Comic</Format><BlackAndWhite>No</BlackAndWhite><Manga>YesAndRightToLeft</Manga><Characters>Spider-Man</Characters><Teams>Avengers</Teams><Locations>Brooklyn</Locations><ScanInformation>Some scanner</ScanInformation><StoryArc>Main story</StoryArc><StoryArcNumber>1</StoryArcNumber><SeriesGroup>Spider-Man</SeriesGroup><AgeRating>PG</AgeRating><Pages><Page Image="1" Type="FrontCover" DoublePage="true" ImageSize="1024" Key="cover" ImageWidth="800" ImageHeight="1200"/><Page Image="2"/></Pages><CommunityRating>4.5</CommunityRating><MainCharacterOrTeam>Spider-Man</MainCharacterOrTeam><Review>good soup.</Review><GTIN>00123456789012</GTIN></ComicInfo>`;

// ============================================================================
// stringify tests
// ============================================================================

Deno.test("v2.1/stringify: handles all v2.1 fields", () => {
  assertEquals(new ComicInfo(TEST_OBJECT_V2_1).stringify(), TEST_XML);
});

Deno.test("v2.1/stringify: sequences v2.1 fields per the XSD", () => {
  const result = new ComicInfo(TEST_OBJECT_V2_1).stringify();

  // Translator follows Editor, Tags follows Genre, StoryArcNumber follows
  // StoryArc, and GTIN comes last, per the v2.1 XSD.
  assertEquals(
    result.indexOf("<Editor>Nick Lowe</Editor>") <
      result.indexOf("<Translator>"),
    true,
  );
  assertEquals(
    result.indexOf("<Genre>Superhero</Genre>") < result.indexOf("<Tags>"),
    true,
  );
  assertEquals(
    result.indexOf("<StoryArc>Main story</StoryArc>") <
      result.indexOf("<StoryArcNumber>"),
    true,
  );
  assertEquals(
    result.indexOf("<GTIN>") > result.indexOf("<Review>"),
    true,
  );
});

// ============================================================================
// parse tests
// ============================================================================

Deno.test("v2.1/parse: handles all v2.1 fields", () => {
  assertEquals(ComicInfo.parse(TEST_XML).data, TEST_OBJECT_V2_1);
});

Deno.test("v2.1/parse: handles string array fields with multiple values", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <Translator>Dan Slott,John Romita</Translator>
  <Tags>action,adventure</Tags>
  <StoryArcNumber>1,2</StoryArcNumber>
</ComicInfo>`;

  const result = ComicInfo.parse(xml);

  assertEquals(result.data.Translator, ["Dan Slott", "John Romita"]);
  assertEquals(result.data.Tags, ["action", "adventure"]);
  assertEquals(result.data.StoryArcNumber, ["1", "2"]);
});

Deno.test("v2.1/parse: throws on CommunityRating with two fraction digits", () => {
  // The v2.1 XSD restricts CommunityRating to one fraction digit.
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <CommunityRating>4.25</CommunityRating>
</ComicInfo>`;

  assertThrows(() => ComicInfo.parse(xml), Error, "fractionDigits");
});

Deno.test("v2.1/parse: throws on invalid XML", () => {
  assertThrows(() => ComicInfo.parse("not valid xml"));
});

// ============================================================================
// roundtrip tests
// ============================================================================

Deno.test("v2.1/roundtrip: parse and stringify are inverse operations", () => {
  const xml = new ComicInfo(TEST_OBJECT_V2_1).stringify();
  const parsed = ComicInfo.parse(xml);

  assertEquals(parsed.data, TEST_OBJECT_V2_1);
});
