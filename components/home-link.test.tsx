import { renderToReadableStream } from "react-dom/server";
import { expect, test } from "vitest";
import { HomeLink } from "./home-link";

// `next/link` resolves to vinext's shim via the `nextShims` plugin in vitest.config.ts.
test("server-renders a next/link", async () => {
  const stream = await renderToReadableStream(<HomeLink />);
  await stream.allReady;
  const html = await new Response(stream).text();

  expect(html).toContain('<a href="/">Back to home</a>');
});
