// Public MyAnimeList v2 list proxy for Moses' Hub.
// Set MAL_CLIENT_ID in the Vercel project environment; never commit credentials.
const ALLOWED_ORIGINS = new Set([
  "https://mosesxd.github.io",
  "https://mosesxdgithubio.vercel.app"
]);
const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map();
const FIELDS = [
  "list_status{status,score,num_episodes_watched,is_rewatching,updated_at,start_date,finish_date}",
  "num_episodes",
  "genres",
  "mean",
  "media_type",
  "status",
  "start_season"
].join(",");

function send(res, status, body) {
  return res.status(status).json(body);
}

module.exports = async function malAnimelist(req, res) {
  const origin = req.headers.origin || "";
  res.setHeader("Vary", "Origin");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=60");
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Accept");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") {
    if (!ALLOWED_ORIGINS.has(origin)) return res.status(403).end();
    return res.status(204).end();
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "Method not allowed" });
  }

  const clientId = process.env.MAL_CLIENT_ID;
  if (!clientId) return send(res, 503, { error: "MyAnimeList is not configured yet", code: "MAL_NOT_CONFIGURED" });

  const username = "Mosess";
  const allowedStatuses = new Set(["watching", "completed", "on_hold", "dropped", "plan_to_watch"]);
  const allowedSorts = new Set(["list_updated_at", "list_score", "anime_title", "anime_start_date"]);
  const status = String(req.query.status || "");
  const sort = String(req.query.sort || "list_updated_at");
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
  const offset = Math.min(10000, Math.max(0, Number.parseInt(req.query.offset, 10) || 0));

  if (status && !allowedStatuses.has(status)) return send(res, 400, { error: "Invalid list status" });
  if (!allowedSorts.has(sort)) return send(res, 400, { error: "Invalid sort option" });

  const cacheKey = [username, status, sort, limit, offset].join(":");
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL) return send(res, 200, cached.value);

  const params = new URLSearchParams({
    fields: FIELDS,
    sort,
    limit: String(limit),
    offset: String(offset)
  });
  if (status) params.set("status", status);

  try {
    const upstream = await fetch(
      "https://api.myanimelist.net/v2/users/" + encodeURIComponent(username) + "/animelist?" + params.toString(),
      {
        headers: {
          "X-MAL-CLIENT-ID": clientId,
          "Accept": "application/json",
          "User-Agent": "MosesHub/1.0"
        },
        signal: AbortSignal.timeout(10000)
      }
    );
    const payload = await upstream.json().catch(() => null);
    if (!upstream.ok || !payload || !Array.isArray(payload.data)) {
      const upstreamCode = upstream.status;
      const message = payload && typeof payload.message === "string" ? payload.message.slice(0, 160) : "";
      const statusCode = upstreamCode === 404 ? 404 : upstreamCode === 403 ? 403 : 502;
      return send(res, statusCode, {
        error: upstreamCode === 403
          ? "The MAL list may be private or the API rejected the request."
          : upstreamCode === 404
            ? "The MAL profile could not be found."
            : "MyAnimeList returned an unexpected response.",
        upstreamStatus: upstreamCode,
        detail: message
      });
    }

    const result = {
      username,
      data: payload.data,
      paging: {
        hasNext: Boolean(payload.paging && payload.paging.next),
        offset,
        limit
      },
      cachedAt: new Date().toISOString()
    };
    cache.set(cacheKey, { at: Date.now(), value: result });
    if (cache.size > 80) cache.delete(cache.keys().next().value);
    return send(res, 200, result);
  } catch (error) {
    return send(res, 502, { error: "Could not reach MyAnimeList. Please try again shortly." });
  }
};
