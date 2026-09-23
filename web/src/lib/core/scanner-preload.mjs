// The root scanner is spawned as a separate Node process on Vercel. Its bare
// `js-yaml` imports cannot resolve web/node_modules from the repository root.
// Register a resolver before the scanner's entry point is loaded.
import { createRequire, register } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
register("./scanner-resolve.mjs", {
  parentURL: import.meta.url,
  data: { yamlUrl: pathToFileURL(require.resolve("js-yaml")).href },
});
