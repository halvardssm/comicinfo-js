/**
 * The ComicInfo package root, exporting the latest specification version
 * (v2.1) directly, and all versions — `v1`, `v2`, and `v2_1` — as namespaces.
 * Specific versions are also available under their own export paths:
 * `@halvardm/comicinfo/v1`, `@halvardm/comicinfo/v2`, and
 * `@halvardm/comicinfo/v2_1`.
 *
 * @module
 */
export * as v1 from "./v1_0.ts";
export * as v2 from "./v2_0.ts";
export * as v2_1 from "./v2_1.ts";

export * from "./v2_1.ts";
