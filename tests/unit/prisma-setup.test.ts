import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("Prisma setup", () => {
  it("generates the Prisma client during install", () => {
    const packageJsonPath = resolve(__dirname, "../../package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    const scripts = packageJson.scripts ?? {};

    expect(scripts.postinstall ?? "").toContain("prisma generate");
  });
});
