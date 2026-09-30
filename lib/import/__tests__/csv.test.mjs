import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, toCsv } from "../csv.js";

describe("parseCsv", () => {
  it("parses headers and rows", () => {
    const { headers, records } = parseCsv(
      "date,metric,value\n2026-01,Revenue,18200\n2026-02,Revenue,21500\n"
    );
    assert.deepEqual(headers, ["date", "metric", "value"]);
    assert.equal(records.length, 2);
    assert.equal(records[0].metric, "Revenue");
    assert.equal(records[0].value, "18200");
  });

  it("handles quoted commas", () => {
    const { records } = parseCsv('title,description\n"Hello, world","A, B"\n');
    assert.equal(records[0].title, "Hello, world");
    assert.equal(records[0].description, "A, B");
  });

  it("round-trips via toCsv", () => {
    const csv = toCsv(["a", "b"], [{ a: "1", b: 'say "hi"' }]);
    const { records } = parseCsv(csv);
    assert.equal(records[0].a, "1");
    assert.equal(records[0].b, 'say "hi"');
  });
});
