"use strict";

(function (root) {
  function getMalApiUrl(hostname, origin) {
    const host = String(hostname || "").toLowerCase();
    if (host.endsWith(".vercel.app")) {
      return String(origin || "").replace(/\/$/, "") + "/api/mal/animelist";
    }
    return "https://mosesxdgithubio.vercel.app/api/mal/animelist";
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { getMalApiUrl };
  } else {
    root.getMalApiUrl = getMalApiUrl;
  }
})(typeof window !== "undefined" ? window : globalThis);
