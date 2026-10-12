import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import type { Plugin } from "vite";
import { configDefaults, defineConfig } from "vitest/config";
import { responseStoreServiceBinding } from "./cloudflare.config.ts";

type PoolOptions = Exclude<Parameters<typeof cloudflareTest>[0], Function>;
type AuxiliaryWorker = NonNullable<NonNullable<PoolOptions["miniflare"]>["workers"]>[number];

/** Lists every `.js` file under `dir` as an ES module, with `entry` first (Miniflare's main module). */
function esModules(dir: string, entry: string) {
  const files = readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".js") && path.join(dir, file) !== entry)
    .map((file) => path.join(dir, file));
  return [entry, ...files].map((file) => ({ type: "ESModule" as const, path: file }));
}

/**
 * The `RESPONSE_STORE` service binding in cloudflare.config.ts points at a second Worker that
 * `@cloudflare/vite-plugin` normally runs as an auxiliary Worker. The test pool only loads the
 * main Worker's config, so define the response-store Worker for Miniflare here.
 */
function responseStoreWorker(): AuxiliaryWorker {
  const entry = fileURLToPath(import.meta.resolve("@cloudflare/workers-response-store/service"));
  const dir = path.dirname(entry);
  return {
    name: responseStoreServiceBinding.name,
    modulesRoot: dir,
    modules: esModules(dir, entry),
    compatibilityDate: responseStoreServiceBinding.compatibilityDate,
    compatibilityFlags: responseStoreServiceBinding.compatibilityFlags,
    r2Buckets: ["CACHE_BODIES"],
    durableObjects: { CACHE_METADATA: { className: "CacheMetadata", useSQLite: true } },
  };
}

const appOutputDir = path.resolve(".cloudflare/output/v0/workers/default");

/**
 * The production build of the vinext app (`vite build`), so tests can fetch
 * real RSC/HTML responses.
 */
function builtAppWorker(): AuxiliaryWorker {
  const bundleDir = path.join(appOutputDir, "bundle");
  if (!existsSync(bundleDir)) {
    throw new Error("Integration tests need a production build. Run `npm run build` first.");
  }
  const workerConfig = JSON.parse(readFileSync(path.join(appOutputDir, "worker.config.json"), "utf8"));
  return {
    name: workerConfig.name,
    modulesRoot: bundleDir,
    modules: esModules(bundleDir, path.join(bundleDir, workerConfig.manifest.mainModule)),
    compatibilityDate: workerConfig.compatibilityDate,
    compatibilityFlags: workerConfig.compatibilityFlags,
    assets: {
      directory: path.join(appOutputDir, "assets"),
      binding: "ASSETS",
      routerConfig: { has_user_worker: true },
      assetConfig: { not_found_handling: workerConfig.assets.notFoundHandling },
    },
    images: { binding: "IMAGES" },
    versionMetadata: "CF_VERSION_METADATA",
    serviceBindings: {
      RESPONSE_STORE: { name: responseStoreServiceBinding.name, entrypoint: "ResponseStoreService" },
    },
  };
}

/**
 * There's no real `next` package: the vinext plugin in vite.config.ts redirects `next/*` imports
 * (and `server-only`/`client-only`) to its shims, but that config isn't loaded by Vitest. Every
 * shim follows the same naming rule (`next/font/google` -> `vinext/shims/font-google`), so apply
 * it here.
 */
function nextShims(): Plugin {
  return {
    name: "next-shims",
    enforce: "pre",
    resolveId(id, importer) {
      if (id === "server-only" || id === "client-only") {
        return this.resolve(`vinext/shims/${id}`, importer, { skipSelf: true });
      }
      const match = /^next\/(.+)$/.exec(id);
      if (!match) return;
      return this.resolve(`vinext/shims/${match[1].replaceAll("/", "-")}`, importer, { skipSelf: true });
    },
  };
}

const sharedExclude = [...configDefaults.exclude, ".cloudflare/**", "dist/**"];

export default defineConfig({
  plugins: [nextShims()],
  resolve: { tsconfigPaths: true },
  test: {
    setupFiles: ["test/setup-next.ts"],
    projects: [
      {
        extends: true,
        plugins: [
          cloudflareTest({
            experimental: { newConfig: true },
            miniflare: { workers: [responseStoreWorker()] },
          }),
        ],
        test: {
          name: "unit",
          env: { NODE_ENV: "test" },
          include: ["**/*.test.{ts,tsx}"],
          exclude: [...sharedExclude, "**/*.dom.test.{ts,tsx}", "**/*.integration.test.{ts,tsx}"],
        },
      },
      {
        // Client component tests with React Testing Library. These run in Node
        // with happy-dom, because DOM implementations can't run in workerd (and
        // client components run in the browser anyway), so Cloudflare bindings
        // aren't available here.
        extends: true,
        test: {
          name: "dom",
          include: ["**/*.dom.test.{ts,tsx}"],
          exclude: sharedExclude,
          environment: "happy-dom",
          setupFiles: ["test/setup-dom.ts"],
        },
      },
      {
        // Integration tests run against the production build of the vinext app.
        // Requires the app to be built first (`npm run build`).
        extends: true,
        plugins: [
          cloudflareTest(() => ({
            experimental: { newConfig: true },
            miniflare: {
              // Exposed to tests as `env.APP`.
              serviceBindings: { APP: "vinext-test" },
              workers: [responseStoreWorker(), builtAppWorker()],
            },
          })),
        ],
        test: {
          name: "integration",
          include: ["**/*.integration.test.{ts,tsx}"],
          exclude: sharedExclude,
        },
      },
    ],
  },
});
