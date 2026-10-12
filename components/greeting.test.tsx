import { renderToReadableStream } from "react-dom/server";
import { expect, test } from "vitest";
import { Greeting } from "./greeting";

// React 19's server renderer awaits async components, so server components (and any client
// components they render) can be rendered to HTML directly. This is plain SSR, not the RSC
// protocol: see app/page.integration.test.ts for testing the real RSC payload.
test("renders an async server component", async () => {
  const stream = await renderToReadableStream(<Greeting name="Ada" />);
  await stream.allReady;
  const html = await new Response(stream).text();

  expect(html).toContain("<h2>Hello, Ada</h2>");
  expect(html).toContain(">1</span>");
});
