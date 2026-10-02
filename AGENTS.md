# AGENTS.md

Directions for AI agents working on this repository.

## Project

Deno/JSR library (`@halvardm/comicinfo`) for parsing, validating, and
stringifying ComicInfo.xml metadata for specification versions v1.0, v2.0, and
v2.1. Zod schemas + a class-based API. The XML is validated against the official
XSD in both directions: input is validated when parsing, output is validated
when stringifying.

## Commands

```sh
deno task check     # format check + lint + type check (run before finishing)
deno task test      # tests with coverage
deno task fix       # auto-fix format and lint
deno task dev       # tests in watch mode
deno publish --dry-run --allow-slow-types  # publish dry run
```

CI (`.github/workflows/ci.yml`) runs format check, lint, tests, and the publish
dry run. Publishing is manual via the `publish.yml` workflow; the version bump
in `deno.json` is done manually before publishing. Slow types are accepted
(`--allow-slow-types`, excluded from lint) — do not annotate the exported Zod
schemas to please the checker.

## Architecture

- `utils.ts` — internal base `ComicInfo` class. **Not part of the public API.**
  Users only import from the version files or `mod.ts`. All behavior lives in
  protected statics so subclasses configure through inheritance:
  - `COMIC_INFO_DATA_SCHEMA` / `COMIC_INFO_VALIDATOR` — Zod schema and XSD
    validator used for validation.
  - `COMIC_INFO_SCHEMA_LOCATION` — XSD URL advertised in the generated XML.
  - `COMIC_INFO_SEQUENCED_ORDER` — element order of the generated XML, per the
    XSD sequence. `undefined` means data insertion order.
  - `COMIC_INFO_TO_XML_NODE_FNS` / `COMIC_INFO_PARSE_XML_NODE_FNS` — registries
    of field conversion functions.
- `v1_0.ts` → `v2_0.ts` → `v2_1.ts` — versioned classes, each extending the
  previous one: schema via `V<n>ComicInfoSchema.extend({...})`, class via
  `extends`, registries by spreading the parent's registry and adding fields.
  Types that a version does not change are re-exported from the previous version
  instead of redeclared.
- `mod.ts` — the public surface: the three version namespaces plus the latest
  version's exports. Internal helper types are not re-exported.

### Static field ordering

Static fields initialize in declaration order. Registries that reference other
static fields (`this._parsePagesNode`, etc.) must be declared **after** those
fields, and the class name must not be used in its own static field initializers
(TDZ) — use `this`. Module-level consts referenced by class fields must be
declared before the class.

## Specification ground truth

The XSD files in `xsd/` are the specification. The Zod schemas, sequenced order,
and parse registries must match them exactly (field set, order, types). When
changing schema code, verify the XSD against the official anansi schema first.
Official sources:

- https://github.com/anansi-project/comicinfo/blob/main/schema/v1.0/ComicInfo.xsd
- https://github.com/anansi-project/comicinfo/blob/main/schema/v2.0/ComicInfo.xsd
- https://github.com/anansi-project/comicinfo/blob/main/drafts/v2.1/ComicInfo.xsd

## Conventions

- Enum values that are the XSD default (`"Unknown"` for `BlackAndWhite`,
  `Manga`, `AgeRating`) map to `undefined` via a schema transform; stringifying
  omits the element, which reads back as the XSD default — lossless round trip.
- Multi-value fields (`Writer`, etc.) are arrays in data and comma-separated
  strings in XML (`StringArraySchema`). Empty arrays are omitted from output.
- Constructor takes only data; `parse` takes only the XML string. The only
  options surface is `stringify(options?: XmlStringifyOptions)` (e.g. `indent`).
  There are deliberately no per-call override or customization options.
- Exported schema consts and their inferred types share a name
  (`ComicInfoSchema` const + type). Follow the existing pattern.
- `data` is a public field; `_dataSchema`/`_comicInfoValidator` are protected.

## Testing

- One test file per module. Version test suites assert **exact** XML output
  byte-for-byte, including element order and the advertised schema URL — these
  lock the XSD sequence. Verify expected XML against the XSD, not just against
  previous output.
- Shared fixtures live in `test_assets/objects.ts`. Never import fixtures from a
  `*.test.ts` file — importing a test module re-registers its tests.
- `utils.test.ts` tests the internal base class through a `TestComicInfo`
  subclass that provides the schema/validator statics; direct base-class
  `parse`/`stringify` is not usable (the base has no statics).
- Rejection behavior (bad values, wrong sequence, duplicates) is covered by
  tests that expect throws — keep them passing when touching validation.

## Adding a new version

1. Add the official XSD to `xsd/` (verify it against the source repo).
2. Create `v<version>.ts`: extend the previous schema and class, override the
   statics (schema location, sequenced order, validator, registries), declare
   new fields' parse functions in the registry spread.
3. Extend the shared test fixture in `test_assets/objects.ts` and write a test
   file following the existing suites (exact XML, all-fields parse, rejection
   tests, round trip).
4. Add the export path to `deno.json` and the namespace/exports to `mod.ts`.
