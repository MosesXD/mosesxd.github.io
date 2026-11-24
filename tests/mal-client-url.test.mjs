import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { getMalApiUrl } = require("../api/mal/client-url.js");

test("uses the deployment's same-origin API on Vercel production and previews", () => {
  assert.equal(
    getMalApiUrl("mosesxdgithubio.vercel.app", "https://mosesxdgithubio.vercel.app"),
    "https://mosesxdgithubio.vercel.app/api/mal/animelist"
  );
  assert.equal(
    getMalApiUrl(
      "mosesxdgithubio-git-fix-mal-dashboard-reliability-mosesxd.vercel.app",
      "https://mosesxdgithubio-git-fix-mal-dashboard-reliability-mosesxd.vercel.app"
    ),
    "https://mosesxdgithubio-git-fix-mal-dashboard-reliability-mosesxd.vercel.app/api/mal/animelist"
  );
});

test("uses the production API from GitHub Pages and local non-Vercel hosts", () => {
  const expected = "https://mosesxdgithubio.vercel.app/api/mal/animelist";
  assert.equal(getMalApiUrl("mosesxd.github.io", "https://mosesxd.github.io"), expected);
  assert.equal(getMalApiUrl("localhost", "http://localhost:3000"), expected);
});

test("does not treat a lookalike hostname as a Vercel host", () => {
  assert.equal(
    getMalApiUrl("mosesxd.vercel.app.evil.example", "https://mosesxd.vercel.app.evil.example"),
    "https://mosesxdgithubio.vercel.app/api/mal/animelist"
  );
});
