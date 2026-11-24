import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { isAllowedOrigin } = require("../api/mal/origin-policy.js");

test("allows the public site origins", () => {
  assert.equal(isAllowedOrigin("https://mosesxd.github.io"), true);
  assert.equal(isAllowedOrigin("https://mosesxdgithubio.vercel.app"), true);
});

test("allows only the exact About and dashboard preview deployments", () => {
  assert.equal(isAllowedOrigin("https://mosesxdgithubio-git-feature-about-watching-anime-6322a2-mosesxd.vercel.app"), true);
  assert.equal(isAllowedOrigin("https://mosesxdgithubio-git-fix-mal-dashboard-reliability-mosesxd.vercel.app"), true);
});

test("rejects arbitrary Vercel preview hosts and origin lookalikes", () => {
  assert.equal(isAllowedOrigin("https://mosesxdgithubio-git-untrusted-branch-mosesxd.vercel.app"), false);
  assert.equal(isAllowedOrigin("https://evil.example"), false);
  assert.equal(isAllowedOrigin("http://mosesxd.github.io"), false);
  assert.equal(isAllowedOrigin("https://mosesxd.github.io.evil.example"), false);
  assert.equal(isAllowedOrigin(""), false);
  assert.equal(isAllowedOrigin(null), false);
});
