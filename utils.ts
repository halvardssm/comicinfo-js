import {
  stringify as xmlStringify,
  type StringifyOptions as XmlStringifyOptions,
  type XmlDocument,
  type XmlElement,
  type XmlName,
  type XmlNode,
  type XmlTextNode,
} from "@std/xml";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { isStandardSchemaV1, parse } from "@stdext/validation";

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

export type OverrideParseFn = (value: unknown) => XmlNode | undefined;

export interface StringifyOptions extends XmlStringifyOptions {
  schema?: string;
  overrideParse?: Record<string, OverrideParseFn | undefined>;
  order?: ReadonlyArray<string>;
  validate?: StandardSchemaV1;
}

export function stringify(
  input: Record<string, unknown>,
  options?: StringifyOptions,
): string {
  const parsed =
    (isStandardSchemaV1(options?.validate)
      ? parse(options.validate, input)
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
