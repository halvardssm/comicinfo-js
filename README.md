# ComicInfo

[![CI](https://github.com/halvardssm/comicinfo-js/actions/workflows/ci.yml/badge.svg)](https://github.com/halvardssm/comicinfo-js/actions/workflows/ci.yml)
[![JSR](https://jsr.io/badges/@halvardm/comicinfo)](https://jsr.io/@halvardm/comicinfo)
[![JSR Score](https://jsr.io/badges/@halvardm/comicinfo/score)](https://jsr.io/@halvardm/comicinfo/score)

A module for working with ComicInfo metadata. ComicInfo is an XML-based metadata
format used by comic book readers to store information about comic books.

This module provides Zod schemas and a class-based API for parsing, validating,
and stringifying ComicInfo metadata for versions v1.0, v2.0, and v2.1 of the
specification. The XML is validated against the official XSD in both directions:
input is validated when parsing, and output is validated when stringifying.

## Installation

```sh
deno add jsr:@halvardm/comicinfo
```

## Usage

### Creating and stringifying

```typescript
import { ComicInfo } from "@halvardm/comicinfo";

const comic = new ComicInfo({
  Title: "The Amazing Spider-Man",
  Series: "The Amazing Spider-Man",
  Number: "42",
  Publisher: "Marvel Comics",
  Year: 2024,
  Month: 5,
  Writer: ["Dan Slott", "Christos Gage"], // or "Dan Slott,Christos Gage"
  Summary: "Spider-Man faces his greatest challenge yet!",
});

const xml = comic.stringify();
console.log(xml);
```

The data is available as the public `data` property:

```typescript
console.log(comic.data.Title);
comic.data.Title = "New Title";
```

### Parsing

```typescript
import { ComicInfo } from "@halvardm/comicinfo";

const comic = ComicInfo.parse(xml);
console.log(comic.data.Writer); // ["Dan Slott", "Christos Gage"]
```

Parsing validates the XML against the version's XSD before reading it, so files
that do not conform to the specification are rejected.

### Versioned imports

The root module exports the latest version (v2.1). Specific versions are
available under their own export paths, or as namespaces:

```typescript
import { ComicInfo as V1ComicInfo } from "@halvardm/comicinfo/v1";
import { ComicInfo as V2ComicInfo } from "@halvardm/comicinfo/v2";
import { ComicInfo as V2_1ComicInfo } from "@halvardm/comicinfo/v2_1";

import { v1, v2, v2_1 } from "@halvardm/comicinfo";
```

### Schemas

Each version exports its Zod schema, which can be used for validation
independently of the class-based API:

```typescript
import { ComicInfoSchema } from "@halvardm/comicinfo";

const result = ComicInfoSchema.safeParse(someData);
if (!result.success) {
  console.error(result.error.issues);
}
```

### Semantics

- The XSD default value `"Unknown"` (used by `BlackAndWhite`, `Manga`, and
  `AgeRating`) maps to `undefined`, and stringifying `undefined` omits the
  element — which reads back as `"Unknown"` per the XSD default, so the round
  trip is lossless.
- Fields with multiple values (such as `Writer`) are stored as arrays and
  serialized as comma-separated strings.
- Values are validated against the specification on both `parse` and
  `stringify`, and invalid data throws.

## API Reference

- [JSR documentation](https://jsr.io/@halvardm/comicinfo/doc)
- [ComicInfo specification](https://github.com/anansi-project/comicinfo)
