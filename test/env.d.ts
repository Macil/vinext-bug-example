declare namespace Cloudflare {
  interface Env {
    /** The built vinext app Worker, bound in vitest.config.ts for integration tests. */
    APP: Fetcher;
  }
}
