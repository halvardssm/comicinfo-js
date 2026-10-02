import { assert, assertEquals, assertThrows } from "@std/assert";
import { XML, XMLValidator, type XmlElement } from "@stdext/xml";
import { z } from "@zod/zod";
import { ComicInfo } from "./utils.ts";

/**
 * Minimal ComicInfo-like schema and XSD used to test the base class in isolation.
 */
const testXsd = `<?xml version="1.0" encoding="utf-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="ComicInfo">
    <xs:complexType>
      <xs:sequence>
        <xs:element minOccurs="0" maxOccurs="1" name="Title" type="xs:string"/>
        <xs:element minOccurs="0" maxOccurs="1" name="Series" type="xs:string"/>
        <xs:element minOccurs="0" maxOccurs="1" name="Year" type="xs:int"/>
        <xs:element minOccurs="0" maxOccurs="1" name="CustomField" type="xs:string"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>`;

const testSchema = z.object({
  Title: z.string().optional(),
  Series: z.string().optional(),
  Year: z.number().optional(),
  CustomField: z.string().optional(),
});

const testOptions = {
  dataSchema: testSchema,
  comicInfoValidator: new XMLValidator(testXsd),
};

/**
 * Exposes the protected static helpers of the base class for testing.
 */
class TestComicInfo extends ComicInfo {
  static elementNode = ComicInfo._elementNode;
  static textNode = ComicInfo._textNode;
  static documentWrapper = ComicInfo._documentWrapper;
  static parseTextNode = ComicInfo._parseTextNode;
  static parseIntNode = ComicInfo._parseIntNode;
  static parseStringArrayNode = ComicInfo._parseStringArrayNode;
}

// ============================================================================
// elementNode tests
// ============================================================================

Deno.test("elementNode: creates element with string name", () => {
  const result = TestComicInfo.elementNode("TestElement");

  assert(result.type === "element");
  assertEquals(result.name, { raw: "TestElement", local: "TestElement" });
  assertEquals(result.attributes, {});
  assertEquals(result.children, []);
});

Deno.test("elementNode: creates element with XmlName object", () => {
  const name = { raw: "TestElement", local: "TestElement" };
  const result = TestComicInfo.elementNode(name);

  assert(result.type === "element");
  assertEquals(result.name, name);
  assertEquals(result.attributes, {});
  assertEquals(result.children, []);
});

Deno.test("elementNode: creates element with attributes", () => {
  const result = TestComicInfo.elementNode("TestElement", {
    attributes: { id: "123", class: "test" },
  });

  assertEquals(result.attributes, { id: "123", class: "test" });
});

Deno.test("elementNode: creates element with children", () => {
  const child = TestComicInfo.elementNode("Child");
  const result = TestComicInfo.elementNode("Parent", {
    children: [child],
  });

  assertEquals(result.children, [child]);
});

Deno.test("elementNode: creates element with both attributes and children", () => {
  const child = TestComicInfo.elementNode("Child");
  const result = TestComicInfo.elementNode("Parent", {
    attributes: { id: "parent" },
    children: [child],
  });

  assertEquals(result.attributes, { id: "parent" });
  assertEquals(result.children, [child]);
});

// ============================================================================
// textNode tests
// ============================================================================

Deno.test("textNode: returns undefined for null value", () => {
  const result = TestComicInfo.textNode("Test", null);
  assert(result === undefined);
});

Deno.test("textNode: returns undefined for undefined value", () => {
  const result = TestComicInfo.textNode("Test", undefined);
  assert(result === undefined);
});

Deno.test("textNode: returns undefined for empty array value", () => {
  const result = TestComicInfo.textNode("Test", []);
  assert(result === undefined);
});

Deno.test("textNode: creates text element with string value", () => {
  const result = TestComicInfo.textNode("Test", "hello");

  assert(result !== undefined);
  assert(result.type === "element");
  assertEquals(result.name, { raw: "Test", local: "Test" });
  assertEquals(result.children.length, 1);
  assertEquals(result.children[0].type, "text");
  assertEquals((result.children[0] as { text: string }).text, "hello");
});

Deno.test("textNode: converts number to string", () => {
  const result = TestComicInfo.textNode("Test", 42);

  assert(result !== undefined);
  const resultTextNode = result.children[0] as { text: string };
  assertEquals(resultTextNode.text, "42");
});

Deno.test("textNode: converts boolean to string", () => {
  const result = TestComicInfo.textNode("Test", true);

  assert(result !== undefined);
  const resultTextNode = result.children[0] as { text: string };
  assertEquals(resultTextNode.text, "true");
});

Deno.test("textNode: includes attributes", () => {
  const result = TestComicInfo.textNode("Test", "value", {
    attributes: { id: "test-id" },
  });

  assert(result !== undefined);
  assertEquals(result.attributes, { id: "test-id" });
});

// ============================================================================
// documentWrapper tests
// ============================================================================

Deno.test("documentWrapper: creates document with declaration", () => {
  const result = TestComicInfo.documentWrapper([]);

  assert(result.declaration !== undefined);
  assertEquals(result.declaration.version, "1.0");
  assertEquals(result.declaration.encoding, "utf-8");
  assertEquals(result.declaration.type, "declaration");
});

Deno.test("documentWrapper: creates root element with ComicInfo name", () => {
  const result = TestComicInfo.documentWrapper([]);

  assert(result.root !== undefined);
  assertEquals(result.root.name, { raw: "ComicInfo", local: "ComicInfo" });
});

Deno.test("documentWrapper: includes attributes in root", () => {
  const attributes = {
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "xsi:noNamespaceSchemaLocation": "http://example.com/schema.xsd",
  };
  const result = TestComicInfo.documentWrapper([], { attributes });

  assertEquals(result.root.attributes, attributes);
});

Deno.test("documentWrapper: includes children in root", () => {
  const child = TestComicInfo.elementNode("Child");
  const result = TestComicInfo.documentWrapper([child]);

  assertEquals(result.root.children, [child]);
});

// ============================================================================
// stringify tests
// ============================================================================

Deno.test("stringify: returns valid XML string", () => {
  const result = new ComicInfo({ Title: "Test Comic" }, testOptions)
    .stringify();

  const parsed = XML.parse(result);

  assert(parsed.declaration !== undefined);
  assertEquals(parsed.declaration.type, "declaration");
  assertEquals(parsed.root.name, { raw: "ComicInfo", local: "ComicInfo" });
  assertEquals(
    parsed.root.attributes["xmlns:xsi"],
    "http://www.w3.org/2001/XMLSchema-instance",
  );
  assert("xsi:noNamespaceSchemaLocation" in parsed.root.attributes);
  assertEquals(parsed.root.children, [
    {
      type: "element",
      name: { raw: "Title", local: "Title" },
      attributes: {},
      children: [
        {
          type: "text",
          text: "Test Comic",
        },
      ],
    },
  ]);
});

Deno.test("stringify: converts numbers to strings", () => {
  const result = new ComicInfo({ Year: 2024 }, testOptions).stringify();

  const parsed = XML.parse(result);

  assertEquals(parsed.root.children, [
    {
      type: "element",
      name: { raw: "Year", local: "Year" },
      attributes: {},
      children: [
        {
          type: "text",
          text: "2024",
        },
      ],
    },
  ]);
});

Deno.test("stringify: handles special characters in values", () => {
  const result = new ComicInfo({ Title: 'Test & <Comic> "Quotes"' },
    testOptions).stringify();

  const parsed = XML.parse(result);
  const titleElement = parsed.root.children[0] as XmlElement;

  assertEquals((titleElement.children[0] as { text: string }).text, 'Test & <Comic> "Quotes"');
});

Deno.test("stringify: handles empty input object", () => {
  const result = new ComicInfo({}, testOptions).stringify();

  const parsed = XML.parse(result);

  assert(parsed.declaration !== undefined);
  assertEquals(parsed.root.name, { raw: "ComicInfo", local: "ComicInfo" });
  assertEquals(parsed.root.children, []);
});

Deno.test("stringify: uses order option to sequence elements", () => {
  // The data is in reverse sequence order; the order option restores it.
  const result = new ComicInfo({ Series: "Test Series", Title: "Test" },
    testOptions).stringify({ order: ["Title", "Series"] });

  const parsed = XML.parse(result);

  assertEquals(
    parsed.root.children.map((child) => (child as XmlElement).name.local),
    ["Title", "Series"],
  );
});

Deno.test("stringify: uses overrideToXmlNode for custom element handling", () => {
  const result = new ComicInfo({ Title: "Test" }, testOptions).stringify({
    overrideToXmlNode: {
      Title: (val) =>
        TestComicInfo.elementNode("CustomField", {
          children: [
            { type: "text", text: `custom-${val}` } as const,
          ],
        }),
    },
  });

  const parsed = XML.parse(result);

  assertEquals(parsed.root.children, [
    {
      type: "element",
      name: { raw: "CustomField", local: "CustomField" },
      attributes: {},
      children: [
        {
          type: "text",
          text: "custom-Test",
        },
      ],
    },
  ]);
});

Deno.test("stringify: overrideToXmlNode can return undefined to skip field", () => {
  const result = new ComicInfo({ Title: "Test" }, testOptions).stringify({
    overrideToXmlNode: {
      Title: () => undefined,
    },
  });

  const parsed = XML.parse(result);

  assertEquals(parsed.root.children, []);
});

// ============================================================================
// parse tests
// ============================================================================

Deno.test("parse: returns ComicInfo instance with parsed text fields", () => {
  const result = ComicInfo.parse(
    `<?xml version="1.0" encoding="utf-8"?><ComicInfo><Title>Test</Title><Series>Test Series</Series></ComicInfo>`,
    testOptions,
  );

  assert(result instanceof ComicInfo);
  assertEquals(result.data, { Title: "Test", Series: "Test Series" });
});

Deno.test("parse: uses overrideParseXmlNode for custom value handling", () => {
  const result = ComicInfo.parse(
    `<?xml version="1.0" encoding="utf-8"?><ComicInfo><Year>2024</Year></ComicInfo>`,
    {
      ...testOptions,
      overrideParseXmlNode: { Year: TestComicInfo.parseIntNode },
    },
  );

  assertEquals(result.data, { Year: 2024 });
});

Deno.test("parse: uses ComicInfoClass to construct the result", () => {
  class MyComicInfo extends ComicInfo {}

  const result = ComicInfo.parse(
    `<?xml version="1.0" encoding="utf-8"?><ComicInfo><Title>Test</Title></ComicInfo>`,
    { ...testOptions, ComicInfoClass: MyComicInfo },
  );

  assert(result instanceof MyComicInfo);
});

Deno.test("parse: throws on invalid XML", () => {
  assertThrows(() => ComicInfo.parse("not valid xml", testOptions));
});

Deno.test("parse: throws on XML not matching the XSD", () => {
  assertThrows(
    () =>
      ComicInfo.parse(
        `<?xml version="1.0" encoding="utf-8"?><NotComicInfo><Title>Test</Title></NotComicInfo>`,
        testOptions,
      ),
    Error,
    "NotComicInfo",
  );
});

// ============================================================================
// parse helper tests
// ============================================================================

Deno.test("parseTextNode: returns name and text value", () => {
  const input = TestComicInfo.elementNode("Title", {
    children: [{ type: "text", text: "hello" }],
  });

  assertEquals(TestComicInfo.parseTextNode(input), {
    name: "Title",
    value: "hello",
  });
});

Deno.test("parseTextNode: returns empty string for element without children", () => {
  const input = TestComicInfo.elementNode("Title");

  assertEquals(TestComicInfo.parseTextNode(input), {
    name: "Title",
    value: "",
  });
});

Deno.test("parseTextNode: throws on non-text child", () => {
  const input = TestComicInfo.elementNode("Title", {
    children: [TestComicInfo.elementNode("Child")],
  });

  assertThrows(() => TestComicInfo.parseTextNode(input), TypeError);
});

Deno.test("parseIntNode: returns parsed integer", () => {
  const input = TestComicInfo.elementNode("Year", {
    children: [{ type: "text", text: "42" }],
  });

  assertEquals(TestComicInfo.parseIntNode(input), { name: "Year", value: 42 });
});

Deno.test("parseIntNode: throws on non-integer value", () => {
  const input = TestComicInfo.elementNode("Year", {
    children: [{ type: "text", text: "not a number" }],
  });

  assertThrows(() => TestComicInfo.parseIntNode(input), TypeError);
});

Deno.test("parseStringArrayNode: splits comma-separated values", () => {
  const input = TestComicInfo.elementNode("Writer", {
    children: [{ type: "text", text: "Dan Slott,John Romita" }],
  });

  assertEquals(TestComicInfo.parseStringArrayNode(input), {
    name: "Writer",
    value: ["Dan Slott", "John Romita"],
  });
});

Deno.test("parseStringArrayNode: returns empty array for empty value", () => {
  const input = TestComicInfo.elementNode("Writer", {
    children: [{ type: "text", text: "" }],
  });

  assertEquals(TestComicInfo.parseStringArrayNode(input), {
    name: "Writer",
    value: [],
  });
});

// ============================================================================
// data accessor tests
// ============================================================================

Deno.test("data: returns the ComicInfo data", () => {
  const comicInfo = new ComicInfo({ Title: "Test" }, testOptions);

  assertEquals(comicInfo.data, { Title: "Test" });
});
