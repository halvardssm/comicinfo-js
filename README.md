# ComicInfo

A module for working with ComicInfo metadata. ComicInfo is an XML-based metadata
format used by comic book readers to store information about comic books.

This module provides TypeScript schemas and utilities for parsing, validating,
and stringifying ComicInfo metadata for versions v1.0, v2.0, and v2.1 of the
specification.

## Installation

See [JSR](https://jsr.io/@halvardm/comicinfo)

## Usage

### Importing

```typescript
// Import the latest version (v2.1)
import { ComicInfo, stringify, v1, v2, v2_1 } from "@halvardm/comicinfo";

// Or import specific versions
import {
  ComicInfo as V1ComicInfo,
  stringify as v1Stringify,
} from "@halvardm/comicinfo/v1";
import {
  ComicInfo as V2ComicInfo,
  stringify as v2Stringify,
} from "@halvardm/comicinfo/v2";
import {
  ComicInfo as V2_1ComicInfo,
  stringify as v2_1Stringify,
} from "@halvardm/comicinfo/v2_1";
```

### Basic Example

```typescript
import { ComicInfo, stringify } from "@halvardm/comicinfo";

const comic: ComicInfo = {
  Title: "The Amazing Spider-Man",
  Series: "The Amazing Spider-Man",
  Number: "#42",
  Publisher: "Marvel Comics",
  Year: 2024,
  Month: 5,
  Writer: ["Dan Slott"],
  Penciller: ["Humberto Ramos"],
  Summary: "Spider-Man faces his greatest challenge yet!",
};

const xml = stringify(comic);
console.log(xml);
```

### Validation

The module uses Zod for runtime validation. Invalid data will throw an error:

```typescript
import { ComicInfo } from "@halvardm/comicinfo";

try {
  const comic = ComicInfo.parse({
    Title: "Valid Comic",
    Year: "not a number", // This will fail validation
  });
} catch (error) {
  console.error("Validation error:", error.message);
  // Validation error: Year must be a number
}
```

## API Reference

See the
[full documentation](https://github.com/anansi-project/comicinfo/blob/main/DOCUMENTATION.md)
for detailed information about all fields.
