import {
  type StringifyOptions as XmlStringifyOptions,
  XML,
  type XmlDocument,
  type XmlElement,
  type XmlName,
  type XmlNode,
  type XmlTextNode,
  type XMLValidator,
} from "@stdx/xml";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { parse as standardSchemaParse } from "@stdx/validation";

/**
 * Base class shared by the versioned ComicInfo classes. Not part of the
 * public API; use the versioned classes from the version modules instead.
 */
export class ComicInfo {
  /**
   * The ComicInfo data.
   */
  data: Record<string, unknown>;
  protected _dataSchema: ComicInfoOptions["dataSchema"];
  protected _comicInfoValidator: ComicInfoOptions["comicInfoValidator"];

  /**
   * Zod schema used to validate data.
   */
  protected static COMIC_INFO_DATA_SCHEMA: ComicInfoOptions["dataSchema"];

  /**
   * Validator used to validate XML against the XSD.
   */
  protected static COMIC_INFO_VALIDATOR: XMLValidator;

  /**
   * Location of the XSD advertised by the generated XML.
   */
  protected static COMIC_INFO_SCHEMA_LOCATION =
    "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd";

  /**
   * Order of the elements in the generated XML, as specified by the schema.
   * When undefined, the data insertion order is used.
   */
  protected static COMIC_INFO_SEQUENCED_ORDER:
    | ReadonlyArray<string>
    | undefined = undefined;

  /**
   * Functions used to convert specific data fields to XML nodes. Overriding
   * classes must declare this field after any static fields it references,
   * as static fields are initialized in declaration order.
   */
  protected static COMIC_INFO_TO_XML_NODE_FNS: Record<
    string,
    ToXmlNodeFn
  > = {};

  /**
   * Functions used to parse specific XML elements. Overriding classes must
   * declare this field after any static fields it references, as static
   * fields are initialized in declaration order.
   */
  protected static COMIC_INFO_PARSE_XML_NODE_FNS: Record<
    string,
    ParseXmlNodeFn
  > = {};

  constructor(data: Record<string, unknown>) {
    const cls = this.constructor as typeof ComicInfo;
    this.data = data;
    this._dataSchema = cls.COMIC_INFO_DATA_SCHEMA;
    this._comicInfoValidator = cls.COMIC_INFO_VALIDATOR;
  }

  /**
   * Stringifies the ComicInfo data to an XML string, validating the output
   * against the XSD.
   *
   * @param options - Serialization options, as defined by the XML
   * stringifier. For example, `{ indent: "  " }` pretty-prints the output.
   * @returns The XML string.
   * @throws If the data does not conform to the XSD.
   *
   * @example
   * ```ts
   * const xml = comic.stringify();
   * const pretty = comic.stringify({ indent: "  " });
   * ```
   */
  stringify(options?: StringifyOptions): string {
    const cls = this.constructor as typeof ComicInfo;

    const parsed = standardSchemaParse(this._dataSchema, this.data);

    const children: XmlNode[] = [];

    const keys = cls.COMIC_INFO_SEQUENCED_ORDER ?? Object.keys(parsed);

    for (const key of keys) {
      const val = parsed[key];
      const override = cls.COMIC_INFO_TO_XML_NODE_FNS[key];
      const res = override ? override(val) : ComicInfo._textNode(key, val);
      if (res) {
        children.push(res);
      }
    }

    const xmlDocument = ComicInfo._documentWrapper(children, {
      attributes: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:noNamespaceSchemaLocation": cls.COMIC_INFO_SCHEMA_LOCATION,
      },
    });
    const res = XML.parse(xmlDocument).stringify(options);

    this._comicInfoValidator.parse(res);

    return res;
  }

  /**
   * Parses an XML string into a ComicInfo instance of the called class,
   * validating the input against the XSD.
   *
   * @param data - The ComicInfo XML string.
   * @returns The parsed ComicInfo instance.
   * @throws If the XML does not conform to the XSD.
   *
   * @example
   * ```ts
   * const comic = ComicInfo.parse(xml);
   * console.log(comic.data.Title);
   * ```
   */
  static parse(data: string): ComicInfo {
    const cls = this as typeof ComicInfo;

    const parsed = new XML(cls.COMIC_INFO_VALIDATOR.parse(data));

    const comicInfoObject: Record<string, unknown> = {};

    for (const child of parsed.root.children) {
      if (child.type === "element") {
        const name = child.name.local;
        const override = cls.COMIC_INFO_PARSE_XML_NODE_FNS[name];

        if (override) {
          const res = override(child);
          comicInfoObject[res.name] = res.value;
        } else {
          const res = this._parseTextNode(child);
          comicInfoObject[res.name] = res.value;
        }
      }
    }

    const validated = standardSchemaParse(
      cls.COMIC_INFO_DATA_SCHEMA,
      comicInfoObject,
    );

    return new cls(validated);
  }

  /**
   * HELPERS
   */

  protected static _documentWrapper(
    rootChildren: XmlElement["children"],
    options?: DocumentWrapperOptions,
  ): XmlDocument {
    return {
      declaration: {
        version: "1.0",
        encoding: "utf-8",
        type: "declaration",
        line: 0,
        column: 0,
        offset: 0,
      },
      root: ComicInfo._elementNode("ComicInfo", {
        attributes: options?.attributes,
        children: rootChildren,
      }),
    };
  }

  protected static _elementNode(
    name: string | XmlName,
    options?: ElementNodeOptions,
  ): XmlElement {
    const nodeName: XmlName = typeof name !== "string" ? name : {
      raw: name,
      local: name,
    };
    return {
      type: "element",
      name: nodeName,
      attributes: options?.attributes ?? {},
      children: options?.children ?? [],
    } satisfies XmlElement;
  }

  protected static _textNode(
    name: string,
    text: unknown,
    options?: Pick<ElementNodeOptions, "attributes">,
  ): XmlElement | undefined {
    if (text == null || (Array.isArray(text) && text.length === 0)) return;

    const textN: XmlTextNode = {
      type: "text",
      text: text.toString(),
    };
    return this._elementNode(name, { children: [textN], ...options });
  }

  protected static _parseTextNode: ParseXmlNodeFn<string> = (input) => {
    if (input.type !== "element") {
      throw new TypeError(`Input is not an XMLElement, found ${input.type}`);
    }

    if (input.children.length === 0) {
      return { name: input.name.local, value: "" };
    }

    if (input.children[0].type !== "text") {
      throw new TypeError(
        `Input is not an XMLElement->XmlTextNode, found ${
          input.children[0].type
        }`,
      );
    }

    return { name: input.name.local, value: input.children[0].text };
  };

  protected static _parseIntNode: ParseXmlNodeFn<number> = (input) => {
    const { name, value } = this._parseTextNode(input);

    const parsedValue = parseInt(value);

    if (!Number.isSafeInteger(parsedValue)) {
      throw new TypeError(
        `Expected value to be an integer, was ${parsedValue}, original ${value}`,
      );
    }

    return { name, value: parsedValue };
  };

  protected static _parseFloatNode: ParseXmlNodeFn<number> = (input) => {
    const { name, value } = this._parseTextNode(input);

    const parsedValue = parseFloat(value);

    if (!Number.isFinite(parsedValue)) {
      throw new TypeError(
        `Expected value to be a float, was ${parsedValue}, original ${value}`,
      );
    }

    return { name, value: parsedValue };
  };

  protected static _parseStringArrayNode: ParseXmlNodeFn<string[]> = (
    input,
  ) => {
    const { name, value } = this._parseTextNode(input);

    const parsedValue = value === "" ? [] : value.split(",");

    return { name, value: parsedValue };
  };
}

/**
 * TYPES
 */

export type ElementNodeOptions = {
  attributes?: XmlElement["attributes"];
  children?: XmlElement["children"];
};

export type DocumentWrapperOptions = {
  attributes?: XmlElement["attributes"];
};

export type ToXmlNodeFn = (value: unknown) => XmlNode | undefined;

export type StringifyOptions = XmlStringifyOptions;

export type ComicInfoOptions = {
  dataSchema: StandardSchemaV1<Record<string, unknown>>;
  comicInfoValidator: XMLValidator;
};

export type ParseXmlNodeFn<V = unknown> = (
  value: XmlNode,
) => { name: string; value: V };
