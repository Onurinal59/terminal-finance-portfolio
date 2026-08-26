import { describe, expect, it } from "vitest";
import { buildContactMailto } from "./contactMailto";

describe("contact mailto", () => {
  it("creates a safely encoded email draft and preserves the sender name", () => {
    const url = new URL(buildContactMailto("onurinal815@gmail.com", "Rapor & iş birliği", "Ayşe Yılmaz", "Merhaba, konuşmak isterim."));
    expect(url.protocol).toBe("mailto:");
    expect(url.pathname).toBe("onurinal815@gmail.com");
    expect(url.searchParams.get("subject")).toBe("Rapor & iş birliği");
    expect(url.searchParams.get("body")).toContain("Gönderen: Ayşe Yılmaz");
  });

  it("uses a clear fallback subject and sender when fields are blank", () => {
    const url = new URL(buildContactMailto("onurinal815@gmail.com", "", "", "Selam"));
    expect(url.searchParams.get("subject")).toBe("Portfolio üzerinden iletişim");
    expect(url.searchParams.get("body")).toContain("Gönderen: İsimsiz ziyaretçi");
  });
});
