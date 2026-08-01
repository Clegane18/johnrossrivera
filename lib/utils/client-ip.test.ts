import { describe, it, expect } from "vitest";
import { getClientIp } from "@/lib/utils/client-ip";

function request(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/test", { headers });
}

describe("getClientIp", () => {
  it("prefers x-vercel-forwarded-for over every other header", () => {
    const ip = getClientIp(
      request({
        "x-vercel-forwarded-for": "1.1.1.1",
        "x-real-ip": "2.2.2.2",
        "x-forwarded-for": "3.3.3.3",
      })
    );
    expect(ip).toBe("1.1.1.1");
  });

  it("takes the first entry of a comma-separated x-vercel-forwarded-for", () => {
    const ip = getClientIp(
      request({ "x-vercel-forwarded-for": "1.1.1.1, 9.9.9.9" })
    );
    expect(ip).toBe("1.1.1.1");
  });

  it("falls back to x-real-ip when x-vercel-forwarded-for is absent", () => {
    const ip = getClientIp(
      request({ "x-real-ip": "2.2.2.2", "x-forwarded-for": "3.3.3.3" })
    );
    expect(ip).toBe("2.2.2.2");
  });

  it("falls back to the first entry of x-forwarded-for when the other two are absent", () => {
    const ip = getClientIp(request({ "x-forwarded-for": "3.3.3.3, 4.4.4.4" }));
    expect(ip).toBe("3.3.3.3");
  });

  it("returns 'unknown' when no IP header is present", () => {
    expect(getClientIp(request({}))).toBe("unknown");
  });
});
