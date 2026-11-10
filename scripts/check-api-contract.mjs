import fs from "node:fs";
import { execFileSync } from "node:child_process";
const spec = JSON.parse(
  fs.readFileSync("packages/contracts/openapi.json", "utf8"),
);
const routes = JSON.parse(
  execFileSync(
    "docker",
    [
      "compose",
      "exec",
      "-T",
      "api",
      "php",
      "artisan",
      "route:list",
      "--path=api/v1",
      "--json",
    ],
    {
      cwd: ".",
      encoding: "utf8",
    },
  ),
);
const actual = routes.flatMap((r) =>
  r.method
    .split("|")
    .filter((m) => m !== "HEAD")
    .map((m) => m.toLowerCase() + " /" + r.uri),
);
const documented = Object.entries(spec.paths).flatMap(([path, methods]) =>
  Object.keys(methods).map((method) => method + " " + path),
);
for (const route of new Set([...actual, ...documented]))
  if (!actual.includes(route) || !documented.includes(route))
    throw new Error("Contract/route mismatch: " + route);
const version = fs
  .readFileSync("packages/contracts/src/index.ts", "utf8")
  .match(/SCHEMA_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1];
if (version !== spec.info.version) throw new Error("Schema version mismatch");
console.log(
  "OpenAPI matches " +
    actual.length +
    " API operations and the shared version.",
);
