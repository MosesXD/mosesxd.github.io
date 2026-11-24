"use strict";

const ALLOWED_ORIGINS = new Set([
  "https://mosesxd.github.io",
  "https://mosesxdgithubio.vercel.app",
  "https://mosesxdgithubio-git-feature-about-watching-anime-6322a2-mosesxd.vercel.app",
  "https://mosesxdgithubio-git-fix-mal-dashboard-reliability-mosesxd.vercel.app"
]);

function isAllowedOrigin(origin) {
  return typeof origin === "string" && ALLOWED_ORIGINS.has(origin);
}

module.exports = { isAllowedOrigin };
