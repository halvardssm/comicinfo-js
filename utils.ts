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
import type { AnyConstructor } from "@stdext/types";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { parse as standardSchemaParse } from "@stdext/validation";

export class ComicInfo {
  protected _data: Record<string, unknown>;
  protected _dataSchema: ComicInfoOptions["dataSchema"];
  protected _comicInfoValidator: ComicInfoOptions["comicInfoValidator"];

  constructor(data: Record<string, unknown>, options: ComicInfoOptions) {
    this._data = data;
    this._dataSchema = options.dataSchema;
    this._comicInfoValidator = options.comicInfoValidator;
  }

  stringify(options?: StringifyOptions): string {
    const parsed = standardSchemaParse(this._dataSchema, this._data);

    const children: XmlNode[] = [];

    const keys = options?.order ?? Object.keys(parsed);

    for (const key of keys) {
      const val = parsed[key];

      if (options?.overrideToXmlNode?.[key]) {
        const res = options.overrideToXmlNode[key](val);
        if (res) {
          children.push(res);
        }
      } else {
        const res = ComicInfo._textNode(key, val);
        if (res) {
          children.push(res);
        }
      }
    }

    const xmlDocument = ComicInfo._documentWrapper(children, {
      attributes: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:noNamespaceSchemaLocation":
          "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd",
      },
    });
    const res = XML.parse(xmlDocument).stringify(options);

    this._comicInfoValidator.validate(res);

    return res;
  }

  static parse(
    data: string,
    options: ParseOptions,
  ): ComicInfo {
    const parsed = XML.parse(data);

    const comicInfoObject: Record<string, unknown> = {};

    for (const child of parsed.root.children) {
      if (child.type === "element") {
        const name = child.name.local;

        if (options?.overrideParseXmlNode?.[name]) {
          const res = options.overrideParseXmlNode[name](child);
          if (res) {
            comicInfoObject[res.name] = res.value;
          }
        } else {
          const res = this._parseTextNode(child);
          comicInfoObject[res.name] = res.value;
        }
      }
    }

    const validated = standardSchemaParse(options.dataSchema, comicInfoObject);

    return options.ComicInfoClass
      ? new options.ComicInfoClass(validated, {
        comicInfoValidator: options.comicInfoValidator,
        dataSchema: options.dataSchema,
      })
      : new ComicInfo(validated, {
        comicInfoValidator: options.comicInfoValidator,
        dataSchema: options.dataSchema,
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
    if (text == null) return;

    const textN: XmlTextNode = {
      type: "text",
      text: text.toString(),
    };
    return this._elementNode(name, { children: [textN], ...options });
  }

  protected static _createComicInfoDocument(
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
      root: this._elementNode("ComicInfo", {
        attributes: options?.attributes,
        children: rootChildren,
      }),
    };
  }

  protected static _parseTextNode: ParseXmlNodeFn<string> = (input) => {
    if (input.type !== "element") {
      throw new TypeError(`Input is not an XMLElement, found ${input.type}`);
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

    const parsedValue = value.split(",");

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

export interface StringifyOptions extends XmlStringifyOptions {
  overrideToXmlNode?: Record<string, ToXmlNodeFn | undefined>;
  order?: ReadonlyArray<string>;
}

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

export interface ParseOptions {
  dataSchema: ComicInfoOptions["dataSchema"];
  comicInfoValidator: XMLValidator;
  overrideParseXmlNode?: Record<string, OverrideParseXmlNodeFn | undefined>;
  ComicInfoClass?: AnyConstructor<
    ComicInfo,
    ConstructorParameters<typeof ComicInfo>
  >;
}
