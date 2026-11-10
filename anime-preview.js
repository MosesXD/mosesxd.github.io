(function () {
  const target = document.getElementById("malPreviewList");
  if (!target) return;
  fetch("https://mosesxdgithubio.vercel.app/api/mal/animelist?limit=3&sort=list_updated_at", { headers:{ Accept:"application/json" } })
    .then(response => response.ok ? response.json() : Promise.reject(new Error("MAL unavailable")))
    .then(payload => {
      if (!Array.isArray(payload.data) || !payload.data.length) throw new Error("No public entries");
      const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[ch]));
      const labels = { watching:"Watching", completed:"Completed", on_hold:"On Hold", dropped:"Dropped", plan_to_watch:"Plan to Watch" };
      target.innerHTML = payload.data.map(row => {
        const anime = row.node || {}, status = row.list_status || {};
        const image = anime.main_picture && (anime.main_picture.medium || anime.main_picture.large) || "";
        return '<article class="mal-mini">' + (image ? '<img loading="lazy" src="' + esc(image) + '" alt="" referrerpolicy="no-referrer">' : '') +
          '<div><strong>' + esc(anime.title || "Untitled") + '</strong><small>' + esc(labels[status.status] || "On my list") + (status.score ? " · " + esc(status.score) + "/10" : "") + '</small></div></article>';
      }).join("");
    })
    .catch(() => { target.innerHTML = '<p class="mal-muted">Anime activity is temporarily unavailable. Visit my <a href="https://myanimelist.net/profile/Mosess">MyAnimeList profile</a>.</p>'; });
})();