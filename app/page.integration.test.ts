import { env } from "cloudflare:workers";
import { expect, test } from "vitest";

test("server-renders HTML", async () => {
  const res = await env.APP.fetch("http://localhost/");

  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("text/html");
  expect(await res.text()).toContain("Build Next.js-style apps with Vite");
});

test("returns the RSC payload", async () => {
  const res = await env.APP.fetch("http://localhost/", { headers: { RSC: "1" } });
  const payload = await res.text();

  expect(res.headers.get("content-type")).toContain("text/x-component");
  expect(payload).toContain('"page:/"');
  expect(payload).toContain("Build Next.js-style apps with Vite");
});
