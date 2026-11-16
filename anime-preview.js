(function () {
  "use strict";
  const target = document.getElementById("malPreviewList");
  if (!target) return;
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
  const labels = { watching:"Watching", completed:"Completed", on_hold:"On hold", dropped:"Dropped", plan_to_watch:"Plan to watch" };

  fetch("https://mosesxdgithubio.vercel.app/api/mal/animelist?limit=12&sort=list_score", {
    headers: { Accept:"application/json" }
  })
    .then(response => response.ok ? response.json() : Promise.reject(new Error("MAL unavailable")))
    .then(payload => {
      if (!Array.isArray(payload.data) || !payload.data.length) throw new Error("No public entries");
      target.innerHTML = payload.data.slice(0, 12).map(row => {
        const anime = row.node || {};
        const entry = row.list_status || {};
        const image = anime.main_picture && (anime.main_picture.medium || anime.main_picture.large) || "";
        const score = Number(entry.score) > 0 ? Number(entry.score) + "/10" : "Unrated";
        const status = labels[entry.status] || "On my list";
        return '<article class="mal-mini">' +
          (image ? '<img loading="lazy" src="' + esc(image) + '" alt="" referrerpolicy="no-referrer">' : '<div class="mal-mini-art" aria-hidden="true"></div>') +
          '<div class="mal-mini-copy"><strong>' + esc(anime.title || "Untitled") + '</strong>' +
          '<small>' + esc(score) + ' · ' + esc(status) + '</small></div></article>';
      }).join("");
      target.setAttribute("aria-label", "Up to 12 highest-rated anime, sorted by score");
    })
    .catch(() => {
      target.innerHTML = '<p class="mal-muted">Anime activity is temporarily unavailable. Visit my <a href="https://myanimelist.net/profile/Mosess">MyAnimeList profile</a>.</p>';
    });
})();