// Netlify equivalent of api/music-charts.js.
// Uses the same private LASTFM_API_KEY and LASTFM_USER environment variables.
const ALLOWED_ORIGIN = "https://mosesxd.github.io";
const PAGE_SIZE = 200;
const MAX_PAGES = 10;
const CACHE_TTL = 5 * 60 * 1000;
let cached = null;
let cachedAt = 0;

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Accept",
      "Vary": "Origin"
    },
    body: JSON.stringify(body)
  };
}
function getArtwork(images) {
  if (!Array.isArray(images)) return "";
  const item = images.slice().reverse().find(image => image && image["#text"]);
  return item ? item["#text"] : "";
}
function getArtist(track) {
  return typeof track.artist === "string" ? track.artist :
    track.artist && track.artist["#text"] ? track.artist["#text"] : "";
}
function normalize(value) { return String(value || "").trim().toLocaleLowerCase(); }

async function fetchWindow(apiKey, user, from, to) {
  const totals = new Map();
  let totalPages = 1;
  let pagesRead = 0;
  for (let page = 1; page <= Math.min(MAX_PAGES, totalPages); page++) {
    const params = new URLSearchParams({
      method: "user.getrecenttracks", user, api_key: apiKey, format: "json",
      from: String(from), to: String(to), limit: String(PAGE_SIZE), page: String(page)
    });
    const result = await fetch("https://ws.audioscrobbler.com/2.0/?" + params.toString(), {
      headers: { "User-Agent": "MosesHub/1.0" },
      signal: AbortSignal.timeout(6500)
    });
    const data = await result.json().catch(() => null);
    if (!result.ok || !data || data.error || !data.recenttracks) {
      throw new Error(data && data.message ? String(data.message).slice(0, 160) : "Last.fm returned an unexpected response");
    }
    const meta = data.recenttracks["@attr"] || {};
    totalPages = Math.max(1, Number(meta.totalPages) || 1);
    pagesRead++;
    const raw = data.recenttracks.track;
    const tracks = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const track of tracks) {
      const timestamp = Number(track.date && track.date.uts);
      if (!Number.isFinite(timestamp) || timestamp < from || timestamp > to) continue;
      const artist = getArtist(track), name = track.name || "";
      if (!artist || !name) continue;
      const key = normalize(artist) + "::" + normalize(name);
      const item = totals.get(key) || { name, artist, plays: 0, artwork: getArtwork(track.image) };
      item.plays++;
      if (!item.artwork) item.artwork = getArtwork(track.image);
      totals.set(key, item);
    }
    if (tracks.length < PAGE_SIZE || page >= totalPages) break;
  }
  return {
    tracks: Array.from(totals.values()).sort((a, b) => b.plays - a.plays || a.name.localeCompare(b.name)).slice(0, 10),
    complete: pagesRead >= totalPages,
    pagesRead,
    capped: totalPages > MAX_PAGES && pagesRead === MAX_PAGES
  };
}

exports.handler = async event => {
  if (event.httpMethod === "OPTIONS") {
    if (event.headers.origin && event.headers.origin !== ALLOWED_ORIGIN) return response(403, { error: "Origin not allowed" });
    return { statusCode: 204, headers: response(204, {}).headers, body: "" };
  }
  if (event.httpMethod !== "GET") return response(405, { error: "Method not allowed" });
  if (event.headers.origin && event.headers.origin !== ALLOWED_ORIGIN) return response(403, { error: "Origin not allowed" });
  if (cached && Date.now() - cachedAt < CACHE_TTL) return response(200, cached);

  const apiKey = process.env.LASTFM_API_KEY, user = process.env.LASTFM_USER;
  if (!apiKey || !user) return response(503, { error: "Music charts are not configured yet" });
  const now = Math.floor(Date.now() / 1000);
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  try {
    const [weekly, monthly] = await Promise.all([
      fetchWindow(apiKey, user, now - 7 * 86400, now),
      fetchWindow(apiKey, user, Math.floor(monthAgo.getTime() / 1000), now)
    ]);
    cached = {
      generatedAt: new Date().toISOString(),
      periods: {
        weekly: { label: "Last 7 days", ...weekly },
        monthly: { label: "Last 30 days", ...monthly }
      }
    };
    cachedAt = Date.now();
    return response(200, cached);
  } catch (error) {
    return response(502, { error: "Could not load Last.fm charts", detail: String(error && error.message || "").slice(0, 160) });
  }
};
