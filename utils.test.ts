import { assert, assertEquals } from "@std/assert";
import { parse as xmlParse, type XmlElement } from "@std/xml";
import {
  createXmlDocument,
  elementNode,
  stringify,
  textNode as createTextNode,
} from "./utils.ts";

// ============================================================================
// elementNode tests
// ============================================================================

Deno.test("elementNode: creates element with string name", () => {
  const result = elementNode("TestElement");

  assert(result.type === "element");
  assertEquals(result.name, { raw: "TestElement", local: "TestElement" });
  assertEquals(result.attributes, {});
  assertEquals(result.children, []);
});

Deno.test("elementNode: creates element with XmlName object", () => {
  const name = { raw: "TestElement", local: "TestElement" };
  const result = elementNode(name);

  assert(result.type === "element");
  assertEquals(result.name, name);
  assertEquals(result.attributes, {});
  assertEquals(result.children, []);
});

Deno.test("elementNode: creates element with attributes", () => {
  const result = elementNode("TestElement", {
    attributes: { id: "123", class: "test" },
  });

  assertEquals(result.attributes, { id: "123", class: "test" });
});

Deno.test("elementNode: creates element with children", () => {
  const child = elementNode("Child");
  const result = elementNode("Parent", {
    children: [child],
  });

  assertEquals(result.children, [child]);
});

Deno.test("elementNode: creates element with both attributes and children", () => {
  const child = elementNode("Child");
  const result = elementNode("Parent", {
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
  const result = createTextNode("Test", null);
  assert(result === undefined);
});

Deno.test("textNode: returns undefined for undefined value", () => {
  const result = createTextNode("Test", undefined);
  assert(result === undefined);
});

Deno.test("textNode: creates text element with string value", () => {
  const result = createTextNode("Test", "hello");

  assert(result !== undefined);
  assert(result.type === "element");
  assertEquals(result.name, { raw: "Test", local: "Test" });
  assertEquals(result.children.length, 1);
  assertEquals(result.children[0].type, "text");
  assertEquals((result.children[0] as { text: string }).text, "hello");
});

Deno.test("textNode: converts number to string", () => {
  const result = createTextNode("Test", 42);

  assert(result !== undefined);
  const resultTextNode = result.children[0] as { text: string };
  assertEquals(resultTextNode.text, "42");
});

Deno.test("textNode: converts boolean to string", () => {
  const result = createTextNode("Test", true);

  assert(result !== undefined);
  const resultTextNode = result.children[0] as { text: string };
  assertEquals(resultTextNode.text, "true");
});

Deno.test("textNode: includes attributes", () => {
  const result = createTextNode("Test", "value", {
    attributes: { id: "test-id" },
  });

  assert(result !== undefined);
  assertEquals(result.attributes, { id: "test-id" });
});

// ============================================================================
// createXmlDocument tests
// ============================================================================

Deno.test("createXmlDocument: creates document with declaration", () => {
  const result = createXmlDocument("http://example.com/schema.xsd", []);

  assert(result.declaration !== undefined);
  assertEquals(result.declaration.version, "1.0");
  assertEquals(result.declaration.encoding, "utf-8");
  assertEquals(result.declaration.type, "declaration");
});

Deno.test("createXmlDocument: creates root element with ComicInfo name", () => {
  const result = createXmlDocument("http://example.com/schema.xsd", []);

  assert(result.root !== undefined);
  assertEquals(result.root.name, { raw: "ComicInfo", local: "ComicInfo" });
});

Deno.test("createXmlDocument: includes schema location in root attributes", () => {
  const schemaUrl = "http://example.com/schema.xsd";
  const result = createXmlDocument(schemaUrl, []);

  assert(result.root.attributes !== undefined);
  assertEquals(
    result.root.attributes["xmlns:xsi"],
    "http://www.w3.org/2001/XMLSchema-instance",
  );
  assertEquals(
    result.root.attributes["xsi:noNamespaceSchemaLocation"],
    schemaUrl,
  );
});

Deno.test("createXmlDocument: includes children in root", () => {
  const child = elementNode("Child");
  const result = createXmlDocument("http://example.com/schema.xsd", [child]);

  assertEquals(result.root.children, [child]);
});

// ============================================================================
// stringify tests
// ============================================================================

Deno.test("stringify: returns valid XML string", () => {
  const result = stringify({ Title: "Test Comic" });

  const parsed = xmlParse(result);

  assertEquals(parsed, {
    declaration: {
      type: "declaration",
      version: "1.0",
      line: 1,
      column: 1,
      offset: 0,
      encoding: "utf-8",
    },
    root: {
      type: "element",
      name: { raw: "ComicInfo", local: "ComicInfo" },
      attributes: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:noNamespaceSchemaLocation":
          "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd",
      },
      children: [
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
      ],
    },
  });
});

Deno.test("stringify: includes input data as XML elements", () => {
  const result = stringify({
    Title: "Test Comic",
    Series: "Test Series",
  });

  const parsed = xmlParse(result);

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
    {
      type: "element",
      name: { raw: "Series", local: "Series" },
      attributes: {},
      children: [
        {
          type: "text",
          text: "Test Series",
        },
      ],
    },
  ]);
});

Deno.test("stringify: converts numbers to strings", () => {
  const result = stringify({
    Year: 2024,
    Count: 10,
  });

  const parsed = xmlParse(result);

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
    {
      type: "element",
      name: { raw: "Count", local: "Count" },
      attributes: {},
      children: [
        {
          type: "text",
          text: "10",
        },
      ],
    },
  ]);
});

Deno.test("stringify: converts booleans to strings", () => {
  const result = stringify({
    BlackAndWhite: true,
    Manga: false,
  });

  const parsed = xmlParse(result);

  assertEquals(parsed.root.children, [
    {
      type: "element",
      name: { raw: "BlackAndWhite", local: "BlackAndWhite" },
      attributes: {},
      children: [
        {
          type: "text",
          text: "true",
        },
      ],
    },
    {
      type: "element",
      name: { raw: "Manga", local: "Manga" },
      attributes: {},
      children: [
        {
          type: "text",
          text: "false",
        },
      ],
    },
  ]);
});

Deno.test("stringify: uses overrideParse for custom element handling", () => {
  const result = stringify(
    { CustomField: "value" },
    {
      overrideParse: {
        CustomField: (val) => {
          if (val === "value") {
            return elementNode("CustomElement", {
              children: [
                { type: "text", text: "custom-value" } as const,
              ],
            });
          }
          return undefined;
        },
      },
    },
  );

  const parsed = xmlParse(result);

  assertEquals(parsed.root.children, [
    {
      type: "element",
      name: { raw: "CustomElement", local: "CustomElement" },
      attributes: {},
      children: [
        {
          type: "text",
          text: "custom-value",
        },
      ],
    },
  ]);
});

Deno.test("stringify: overrideParse can return undefined to skip field", () => {
  const result = stringify(
    { SkipField: "value" },
    {
      overrideParse: {
        SkipField: () => undefined,
      },
    },
  );

  assert(!result.includes("SkipField"));
});

Deno.test("stringify: includes xmlns:xsi and xsi:noNamespaceSchemaLocation", () => {
  const result = stringify({ Title: "Test" });

  const parsed = xmlParse(result);

  assertEquals(
    parsed.root.attributes["xmlns:xsi"],
    "http://www.w3.org/2001/XMLSchema-instance",
  );
  assert(
    "xsi:noNamespaceSchemaLocation" in parsed.root.attributes,
  );
});

Deno.test("stringify: handles empty input object", () => {
  const result = stringify({});

  const parsed = xmlParse(result);

  assert(parsed.declaration !== undefined);
  assertEquals(parsed.declaration.type, "declaration");
  assertEquals(parsed.root.name, { raw: "ComicInfo", local: "ComicInfo" });
  assertEquals(parsed.root.children, []);
});

Deno.test("stringify: handles special characters in values", () => {
  const result = stringify({
    Title: 'Test & <Comic> "Quotes"',
  });

  const parsed = xmlParse(result);
  const titleElement = parsed.root.children[0] as XmlElement;

  assertEquals(
    (titleElement.children[0] as { text: string }).text,
    'Test & <Comic> "Quotes"',
  );
});
