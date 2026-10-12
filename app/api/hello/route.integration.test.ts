import { env } from "cloudflare:workers";
import { expect, test } from "vitest";

test("GET /api/hello", async () => {
  const res = await env.APP.fetch("http://localhost/api/hello");

  expect(await res.json()).toEqual({ message: "Hello from vinext on Cloudflare Workers" });
});
