import { describe, expect, it } from "vitest";
import { getAutoScrollDelta, movePanelOrder, placePanelBefore } from "./panelOrder";

describe("panel order helpers", () => {
  const order = ["profile", "chart", "summary", "archive"] as const;

  it("drops a dragged panel before its target without losing another panel", () => {
    expect(placePanelBefore(order, "archive", "chart")).toEqual(["profile", "archive", "chart", "summary"]);
  });

  it("moves a panel one step for touch controls and keeps boundary panels stable", () => {
    expect(movePanelOrder(order, "chart", -1)).toEqual(["chart", "profile", "summary", "archive"]);
    expect(movePanelOrder(order, "profile", -1)).toEqual([...order]);
    expect(movePanelOrder(order, "archive", 1)).toEqual([...order]);
  });

  it("scrolls only when a desktop drag enters the viewport edge zones", () => {
    expect(getAutoScrollDelta(30, 800)).toBe(-18);
    expect(getAutoScrollDelta(400, 800)).toBe(0);
    expect(getAutoScrollDelta(780, 800)).toBe(18);
  });
});
