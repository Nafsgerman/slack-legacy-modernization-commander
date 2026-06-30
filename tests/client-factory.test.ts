import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveAnalysisClient,
  AgentModeUnavailableError,
} from "../src/domain/client-factory.ts";
import { deterministicLegacyAnalysisClient } from "../src/domain/orchestrator.ts";

const withEnv = (key: string, value: string | undefined, fn: () => void) => {
  const original = process.env[key];
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
  try {
    fn();
  } finally {
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
};

test("fixture mode always returns deterministic client regardless of key", () => {
  withEnv("ANTHROPIC_API_KEY", "sk-test-fake", () => {
    const resolved = resolveAnalysisClient("fixture");
    assert.equal(resolved.mode, "fixture");
    assert.equal(resolved.client, deterministicLegacyAnalysisClient);
    assert.equal(resolved.model, undefined);
  });
});

test("agent mode throws when no key present", () => {
  withEnv("ANTHROPIC_API_KEY", undefined, () => {
    assert.throws(() => resolveAnalysisClient("agent"), AgentModeUnavailableError);
  });
});

test("agent mode succeeds and reports model when key present", () => {
  withEnv("ANTHROPIC_API_KEY", "sk-test-fake", () => {
    const resolved = resolveAnalysisClient("agent");
    assert.equal(resolved.mode, "agent");
    assert.equal(resolved.model, "claude-sonnet-4-6");
  });
});

test("auto falls back to fixture with no key", () => {
  withEnv("ANTHROPIC_API_KEY", undefined, () => {
    const resolved = resolveAnalysisClient("auto");
    assert.equal(resolved.mode, "fixture");
  });
});

test("auto selects agent when key present", () => {
  withEnv("ANTHROPIC_API_KEY", "sk-test-fake", () => {
    const resolved = resolveAnalysisClient("auto");
    assert.equal(resolved.mode, "agent");
  });
});

test("default requested mode (no arg) behaves as auto", () => {
  withEnv("ANTHROPIC_API_KEY", undefined, () => {
    const resolved = resolveAnalysisClient();
    assert.equal(resolved.mode, "fixture");
  });
});