// Vercel serverless function for Last.fm Now Playing.
// Configure LASTFM_API_KEY and LASTFM_USER in Vercel Project Settings.
// Never expose the API key to browser JavaScript or commit it to the repository.

function getArtwork(images) {
  if (!Array.isArray(images)) return "";
  const preferred = images.slice().reverse().find(image => image && image["#text"]);
  return preferred ? preferred["#text"] : "";
}

module.exports = async function nowPlaying(req, res) {
  const allowedOrigin = "https://mosesxd.github.io";
  const origin = req.headers.origin || "";
  res.setHeader("Vary", "Origin");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, s-maxage=0");
  if (origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Accept");
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  if (req.method === "OPTIONS") {
    if (origin !== allowedOrigin) return res.status(403).end();
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.LASTFM_API_KEY;
  const user = process.env.LASTFM_USER;

  if (!apiKey || !user) {
    return res.status(500).json({ error: "Not set up yet" });
  }

  const params = new URLSearchParams({
    method: "user.getrecenttracks",
    user,
    api_key: apiKey,
    format: "json",
    limit: "1"
  });

  try {
    const response = await fetch(
      "https://ws.audioscrobbler.com/2.0/?" + params.toString(),
      {
        headers: { "User-Agent": "MosesHub/1.0" },
        signal: AbortSignal.timeout(8000)
      }
    );

    const data = await response.json().catch(() => null);

    // Last.fm commonly returns API errors inside a JSON response.
    // Expose only its numeric error code and public message, never credentials.
    if (!response.ok || !data || data.error || !data.recenttracks) {
      return res.status(502).json({
        error: "Last.fm problem",
        lastfmCode: data && Number.isInteger(data.error) ? data.error : null,
        detail: data && typeof data.message === "string"
          ? data.message.slice(0, 180)
          : "Last.fm returned an unexpected response"
      });
    }

    const tracks = data.recenttracks.track;
    const track = Array.isArray(tracks) ? tracks[0] : tracks;

    if (!track) {
      return res.status(200).json({ track: null });
    }

    const artist = typeof track.artist === "string"
      ? track.artist
      : track.artist && track.artist["#text"]
        ? track.artist["#text"]
        : "";

    return res.status(200).json({
      playing: Boolean(track["@attr"] && track["@attr"].nowplaying === "true"),
      track: track.name || "",
      artist,
      album: track.album && track.album["#text"] ? track.album["#text"] : "",
      artwork: getArtwork(track.image)
    });
  } catch (error) {
    return res.status(502).json({ error: "Could not reach Last.fm" });
  }
};
