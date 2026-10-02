import {
  type StringifyOptions as XmlStringifyOptions,
  XML,
  type XmlDocument,
  type XmlElement,
  type XmlName,
  type XmlNode,
  type XmlTextNode,
  type XMLValidator,
} from "@stdext/xml";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { parse as standardSchemaParse } from "@stdext/validation";

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
   * Functions used to convert specific data fields to XML nodes.
   */
  protected static COMIC_INFO_TO_XML_NODE_OVERRIDES: Record<
    string,
    ToXmlNodeFn
  > = {};

  /**
   * Functions used to parse specific XML elements.
   */
  protected static COMIC_INFO_PARSE_XML_NODE_OVERRIDES: Record<
    string,
    OverrideParseXmlNodeFn
  > = {};

  constructor(data: Record<string, unknown>, options: ComicInfoOptions) {
    this.data = data;
    this._dataSchema = options.dataSchema;
    this._comicInfoValidator = options.comicInfoValidator;
  }

  stringify(options?: StringifyOptions): string {
    const cls = this.constructor as typeof ComicInfo;

    const parsed = standardSchemaParse(this._dataSchema, this.data);

    const children: XmlNode[] = [];

    const keys = cls.COMIC_INFO_SEQUENCED_ORDER ?? Object.keys(parsed);

    for (const key of keys) {
      const val = parsed[key];
      const override = cls.COMIC_INFO_TO_XML_NODE_OVERRIDES[key];
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

  static parse(data: string): ComicInfo {
    const cls = this as typeof ComicInfo;

    const parsed = new XML(cls.COMIC_INFO_VALIDATOR.parse(data));

    const comicInfoObject: Record<string, unknown> = {};

    for (const child of parsed.root.children) {
      if (child.type === "element") {
        const name = child.name.local;
        const override = cls.COMIC_INFO_PARSE_XML_NODE_OVERRIDES[name];

        if (override) {
          const res = override(child);
          if (res) {
            comicInfoObject[res.name] = res.value;
          }
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

    return new cls(validated, {
      comicInfoValidator: cls.COMIC_INFO_VALIDATOR,
      dataSchema: cls.COMIC_INFO_DATA_SCHEMA,
    });
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
        `Expected value to be an float, was ${parsedValue}, original ${value}`,
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

export type OverrideParseXmlNodeFn<V = unknown> = (
  value: XmlNode,
) => { name: string; value: V } | undefined;
