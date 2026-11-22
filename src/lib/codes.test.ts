import { describe, expect, it } from "vitest";
import {
  codeStatus,
  computeNewExpiry,
  FREE_DAILY_LIMIT,
  generateActivationCode,
  isValidCode,
  normalizeCode,
  PRO_PRICE_DT,
} from "./codes";

const DAY = 24 * 60 * 60 * 1000;

describe("activation codes", () => {
  it("generates codes in the TN-XXXX-XXXX format with capitals and digits", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateActivationCode()).toMatch(/^TN-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    }
  });

  it("rejects lowercase or malformed codes", () => {
    expect(isValidCode("TN-AB12-CD34")).toBe(true);
    expect(isValidCode("tn-ab12-cd34")).toBe(false);
    expect(isValidCode("TN-AB12CD34")).toBe(false);
  });

  it("normalizes typed input into the code format", () => {
    expect(normalizeCode("tn ab12 cd34")).toBe("TN-AB12-CD34");
  });

  it("gives 30 days from activation when there is no running subscription", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(computeNewExpiry(null, now).getTime()).toBe(now.getTime() + 30 * DAY);
  });

  it("adds 30 days on top of the remaining time when renewing early", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const current = new Date(now.getTime() + 10 * DAY);
    expect(computeNewExpiry(current, now).getTime()).toBe(now.getTime() + 40 * DAY);
  });

  it("starts from now when the previous subscription already ended", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const past = new Date(now.getTime() - 5 * DAY);
    expect(computeNewExpiry(past, now).getTime()).toBe(now.getTime() + 30 * DAY);
  });

  it("reports code status", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    const base = { revoked: false, device_id: null, activated_at: null, expires_at: null };
    expect(codeStatus(base, now)).toBe("unused");
    expect(codeStatus({ ...base, revoked: true }, now)).toBe("revoked");
    expect(
      codeStatus({ ...base, device_id: "d1", activated_at: "2026-01-01", expires_at: "2026-01-31" }, now),
    ).toBe("active");
    expect(
      codeStatus({ ...base, device_id: "d1", activated_at: "2025-12-01", expires_at: "2025-12-31" }, now),
    ).toBe("expired");
  });

  it("allows 3 free tries per day and costs 15 DT per month", () => {
    expect(FREE_DAILY_LIMIT).toBe(3);
    expect(PRO_PRICE_DT).toBe(15);
  });
});
