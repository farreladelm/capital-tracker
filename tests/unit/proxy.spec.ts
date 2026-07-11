import { describe, expect, it, vi } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";

vi.mock("next-auth", () => ({
  default: () => ({ auth: (handler: unknown) => handler }),
}));

import { config } from "../../proxy";

describe("proxy matcher", () => {
  it.each(["/sw.js", "/manifest.json", "/icon.jpg"]) (
    "skips the static asset %s",
    (url) => {
      expect(
        unstable_doesMiddlewareMatch({
          config,
          nextConfig: {},
          url,
        })
      ).toBe(false);
    }
  );

  it("runs for protected app routes", () => {
    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: "/history",
      })
    ).toBe(true);
  });
});
