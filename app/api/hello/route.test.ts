import { env } from "cloudflare:workers";
import { expect, test } from "vitest";
import { GET } from "./route";

test("tests run in workerd with the bindings from cloudflare.config.ts", () => {
  expect(navigator.userAgent).toBe("Cloudflare-Workers");
  expect(env.RESPONSE_STORE).toBeDefined();
  expect(env.IMAGES).toBeDefined();
});

test("GET /api/hello", async () => {
  const res = GET();

  expect(await res.json()).toEqual({ message: "Hello from vinext on Cloudflare Workers" });
});
