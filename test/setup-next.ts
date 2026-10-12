import { vi } from "vitest";

// This config replicates vinext's build transform that turns `import { Inter }
// from "next/font/google"` into self-hosted font CSS. Without it, the shim has
// no named exports and injects a live Google Fonts <link>, so stub every font
// loader with a predictable result instead.
vi.mock("next/font/google", () => {
  const loadFont = (family: string) => (options: { variable?: string } = {}) => ({
    className: `font-${family}`,
    style: { fontFamily: family },
    ...(options.variable ? { variable: `font-${family}-variable` } : {}),
  });

  return new Proxy({} as Record<string, unknown>, {
    get: (_, name) => (typeof name === "string" && name !== "then" ? loadFont(name) : undefined),
    has: (_, name) => typeof name === "string" && name !== "then",
  });
});
