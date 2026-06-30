import assert from "node:assert/strict";
import test from "node:test";
import { parseAssessArgs, InvalidAssessCommandError } from "../src/app/command-args.ts";

test("parses bare assess command with auto mode", () => {
  const result = parseAssessArgs("assess claims-batch");
  assert.deepEqual(result, { moduleId: "claims-batch", mode: "auto" });
});

test("parses demo alias", () => {
  const result = parseAssessArgs("demo");
  assert.deepEqual(result, { moduleId: "claims-batch", mode: "auto" });
});

test("parses --agent flag", () => {
  const result = parseAssessArgs("assess claims-batch --agent");
  assert.deepEqual(result, { moduleId: "claims-batch", mode: "agent" });
});

test("parses --fixture flag", () => {
  const result = parseAssessArgs("assess claims-batch --fixture");
  assert.deepEqual(result, { moduleId: "claims-batch", mode: "fixture" });
});

test("parses demo with mode flag", () => {
  const result = parseAssessArgs("demo --agent");
  assert.deepEqual(result, { moduleId: "claims-batch", mode: "agent" });
});

test("is case-insensitive and whitespace-tolerant", () => {
  const result = parseAssessArgs("  ASSESS   Claims-Batch   --AGENT  ");
  assert.deepEqual(result, { moduleId: "claims-batch", mode: "agent" });
});

test("throws on empty text", () => {
  assert.throws(() => parseAssessArgs(""), InvalidAssessCommandError);
  assert.throws(() => parseAssessArgs(undefined), InvalidAssessCommandError);
});

test("throws on unrecognized command", () => {
  assert.throws(() => parseAssessArgs("frobnicate"), InvalidAssessCommandError);
});

test("throws on assess with no module id", () => {
  assert.throws(() => parseAssessArgs("assess"), InvalidAssessCommandError);
});