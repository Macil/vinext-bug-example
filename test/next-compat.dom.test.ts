import "client-only";
import { Inter } from "next/font/google";
import { expect, test } from "vitest";
import { HomeLink } from "@/app/components/home-link";

// Checks the vinext behaviour replicated in vitest.config.ts and test/setup-next.ts (happy-dom).
test("resolves tsconfig path aliases", () => {
  expect(HomeLink).toBeTypeOf("function");
});

test("stubs next/font/google loaders", () => {
  expect(Inter({ subsets: ["latin"], variable: "--font-inter" })).toEqual({
    className: "font-Inter",
    style: { fontFamily: "Inter" },
    variable: "font-Inter-variable",
  });
});

test("defines NODE_ENV", () => {
  expect(process.env.NODE_ENV).toBe("test");
});
