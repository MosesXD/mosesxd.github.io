// netlify/functions/now-playing.js
//
// Runs on Netlify's servers, not in the visitor's browser.
// The key and username come from Netlify's Environment variables, so
// NOTHING secret is written in this file. Set these two in Netlify:
//   LASTFM_API_KEY  = (your key from last.fm/api/account/create)
//   LASTFM_USER     = (your Last.fm username)

exports.handler = async () => {
  const apiKey = process.env.LASTFM_API_KEY;
  const user = process.env.LASTFM_USER;

  // If the two settings are missing, stop here (and never reveal details)
  if (!apiKey || !user) {
    return reply(500, { error: "Not set up yet" });
  }

  const url =
    "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks" +
    "&user=" + encodeURIComponent(user) +
    "&api_key=" + encodeURIComponent(apiKey) +
    "&format=json&limit=1";

  try {
    const response = await fetch(url, { headers: { "User-Agent": "MosesHub/1.0" } });
    const data = await response.json();

    // Last.fm sends { error, message } if something is wrong (like a bad key)
    if (data.error || !data.recenttracks) {
      return reply(502, { error: "Last.fm problem" });
    }

    // While you're listening it can send a list; otherwise a single item
    const tracks = data.recenttracks.track;
    const track = Array.isArray(tracks) ? tracks[0] : tracks;
    if (!track) {
      return reply(200, { track: null });
    }

    // Send the page only what it needs. Never the key.
    return reply(200, {
      playing: Boolean(track["@attr"] && track["@attr"].nowplaying === "true"),
      track: track.name,
      artist: track.artist["#text"],
    });
  } catch (error) {
    return reply(502, { error: "Could not reach Last.fm" });
  }
};

function reply(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30", // reuse the answer for 30 seconds
    },
    body: JSON.stringify(body),
  };
}
