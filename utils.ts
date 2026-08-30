import {
  parse as xmlParse,
  type ParseOptions as XmlParseOptions,
  stringify as xmlStringify,
  type StringifyOptions as XmlStringifyOptions,
  type XmlDocument,
  type XmlElement,
  type XmlName,
  type XmlNode,
  type XmlTextNode,
} from "@std/xml";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import {
  isStandardSchemaV1,
  parse as standardSchemaParse,
} from "@stdext/validation";

export type ElementNodeOptions = {
  attributes?: XmlElement["attributes"];
  children?: XmlElement["children"];
};

export function elementNode(
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

export function textNode(
  name: string,
  text: unknown,
  options?: Pick<ElementNodeOptions, "attributes">,
): XmlElement | undefined {
  if (text == null) return;

  const textN: XmlTextNode = {
    type: "text",
    text: text.toString(),
  };
  return elementNode(name, { children: [textN], ...options });
}

export function createXmlDocument(
  schema: string,
  rootChildren: XmlElement["children"],
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
    root: elementNode("ComicInfo", {
      attributes: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:noNamespaceSchemaLocation": schema,
      },
      children: rootChildren,
    }),
  };
}

export type StringifyOverrideParseFn = (value: unknown) => XmlNode | undefined;

export interface StringifyOptions extends XmlStringifyOptions {
  schema?: string;
  overrideParse?: Record<string, StringifyOverrideParseFn | undefined>;
  order?: ReadonlyArray<string>;
  validate?: StandardSchemaV1;
}

export function stringify(
  input: Record<string, unknown>,
  options?: StringifyOptions,
): string {
  const parsed =
    (isStandardSchemaV1(options?.validate)
      ? standardSchemaParse(options.validate, input)
      : input) as Record<string, unknown>;

  const children: XmlNode[] = [];

  const keys = options?.order ?? Object.keys(parsed);

  for (const key of keys) {
    const val = parsed[key];

    if (options?.overrideParse?.[key]) {
      const res = options.overrideParse[key](val);
      if (res) {
        children.push(res);
      }
    } else {
      const res = textNode(key, val);
      if (res) {
        children.push(res);
      }
    }
  }

  return xmlStringify(
    createXmlDocument(
      options?.schema ??
        "https://github.com/anansi-project/comicinfo/raw/refs/heads/main/schema/v1.0/ComicInfo.xsd",
      children,
    ),
    options,
  );
}

export type ParserFn<V = unknown> = (
  value: XmlNode,
) => { name: string; value: V };

export const parseTextNode: ParserFn<string> = (input) => {
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

export const parseIntNode: ParserFn<number> = (input) => {
  const { name, value } = parseTextNode(input);

  const parsedValue = parseInt(value);

  if (Number.isSafeInteger(parsedValue)) {
    throw new TypeError(
      `Expected value to be an integer, was ${parsedValue}, original ${value}`,
    );
  }

  return { name, value: parsedValue };
};

export const parseFloatNode: ParserFn<number> = (input) => {
  const { name, value } = parseTextNode(input);

  const parsedValue = parseFloat(value);

  if (Number.isFinite(parsedValue)) {
    throw new TypeError(
      `Expected value to be an float, was ${parsedValue}, original ${value}`,
    );
  }

  return { name, value: parsedValue };
};

export const parseStringArrayNode: ParserFn<string[]> = (input) => {
  const { name, value } = parseTextNode(input);

  const parsedValue = value.split(",");

  return { name, value: parsedValue };
};

export type ParseOverrideParseFn<V = unknown> = (
  value: XmlNode,
) => { name: string; value: V } | undefined;

export interface ParseOptions extends XmlParseOptions {
  overrideParse?: Record<string, ParseOverrideParseFn | undefined>;
  validate?: StandardSchemaV1;
}

export function parse(
  input: string,
  options?: ParseOptions,
): Record<string, unknown> {
  const combinedOptions: ParseOptions = {
    ignoreComments: true,
    ignoreWhitespace: true,
    ...options,
  };
  const res = xmlParse(input, combinedOptions);

  if (res.root.name.local !== "ComicInfo") {
    throw new TypeError("XML Document does not seem to be of type ComicInfo");
  }

  const comicInfoObject: Record<string, unknown> = {};

  for (const child of res.root.children) {
    if (child.type === "element") {
      const name = child.name.local;

      if (combinedOptions?.overrideParse?.[name]) {
        const res = combinedOptions.overrideParse[name](child);
        if (res) {
          comicInfoObject[res.name] = res.value;
        }
      } else {
        const res = parseTextNode(child);
        comicInfoObject[res.name] = res.value;
      }
    }
  }

  return comicInfoObject;
}
