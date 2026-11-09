// Rolling personal Last.fm charts for Moses' Hub.
// Uses the same private LASTFM_API_KEY and LASTFM_USER as now-playing.js.

const ALLOWED_ORIGIN = "https://mosesxd.github.io";
const PAGE_SIZE = 200;
const MAX_PAGES = 10;
const CACHE_TTL = 5 * 60 * 1000;
let cached = null;
let cachedAt = 0;

function reply(res, status, body) {
  return res.status(status).json(body);
}

function artwork(images) {
  if (!Array.isArray(images)) return "";
  const image = images.slice().reverse().find(item => item && item["#text"]);
  return image ? image["#text"] : "";
}

function trackArtist(track) {
  if (typeof track.artist === "string") return track.artist;
  return track.artist && track.artist["#text"] ? track.artist["#text"] : "";
}

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

async function fetchWindow(apiKey, user, from, to) {
  const totals = new Map();
  let totalPages = 1;
  let pagesRead = 0;

  for (let page = 1; page <= Math.min(MAX_PAGES, totalPages); page++) {
    const params = new URLSearchParams({
      method: "user.getrecenttracks",
      user,
      api_key: apiKey,
      format: "json",
      from: String(from),
      to: String(to),
      limit: String(PAGE_SIZE),
      page: String(page)
    });

    const response = await fetch("https://ws.audioscrobbler.com/2.0/?" + params.toString(), {
      headers: { "User-Agent": "MosesHub/1.0" },
      signal: AbortSignal.timeout(6500)
    });
    const data = await response.json().catch(() => null);

    if (!response.ok || !data || data.error || !data.recenttracks) {
      const message = data && typeof data.message === "string" ? data.message.slice(0, 160) : "Last.fm returned an unexpected response";
      throw new Error(message);
    }

    const meta = data.recenttracks["@attr"] || {};
    totalPages = Math.max(1, Number(meta.totalPages) || 1);
    pagesRead++;

    const raw = data.recenttracks.track;
    const tracks = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const track of tracks) {
      // A now-playing item has no timestamp and is not a completed play.
      const timestamp = Number(track.date && track.date.uts);
      if (!Number.isFinite(timestamp) || timestamp < from || timestamp > to) continue;
      const artist = trackArtist(track);
      const name = track.name || "";
      if (!name || !artist) continue;

      const key = normalize(artist) + "::" + normalize(name);
      const current = totals.get(key) || {
        name,
        artist,
        plays: 0,
        artwork: artwork(track.image)
      };
      current.plays++;
      if (!current.artwork) current.artwork = artwork(track.image);
      totals.set(key, current);
    }

    if (tracks.length < PAGE_SIZE || page >= totalPages) break;
  }

  const tracks = Array.from(totals.values())
    .sort((a, b) => b.plays - a.plays || a.name.localeCompare(b.name))
    .slice(0, 10);

  return {
    tracks,
    complete: pagesRead >= totalPages,
    pagesRead,
    scannedPages: pagesRead,
    capped: totalPages > MAX_PAGES && pagesRead === MAX_PAGES
  };
}

module.exports = async function musicCharts(req, res) {
  const origin = req.headers.origin || "";
  res.setHeader("Vary", "Origin");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=60");
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Accept");
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  if (req.method === "OPTIONS") {
    if (origin !== ALLOWED_ORIGIN) return res.status(403).end();
    return res.status(204).end();
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return reply(res, 405, { error: "Method not allowed" });
  }

  if (cached && Date.now() - cachedAt < CACHE_TTL) {
    return reply(res, 200, cached);
  }

  const apiKey = process.env.LASTFM_API_KEY;
  const user = process.env.LASTFM_USER;
  if (!apiKey || !user) return reply(res, 503, { error: "Music charts are not configured yet" });

  const now = Math.floor(Date.now() / 1000);
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const windows = {
    weekly: { from: now - 7 * 24 * 60 * 60, to: now },
    monthly: { from: Math.floor(monthAgo.getTime() / 1000), to: now }
  };

  try {
    const [weekly, monthly] = await Promise.all([
      fetchWindow(apiKey, user, windows.weekly.from, windows.weekly.to),
      fetchWindow(apiKey, user, windows.monthly.from, windows.monthly.to)
    ]);

    cached = {
      generatedAt: new Date().toISOString(),
      periods: {
        weekly: { label: "Last 7 days", ...weekly },
        monthly: { label: "Last month", ...monthly }
      }
    };
    cachedAt = Date.now();
    return reply(res, 200, cached);
  } catch (error) {
    return reply(res, 502, { error: "Could not load Last.fm charts", detail: String(error && error.message || "").slice(0, 160) });
  }
};
