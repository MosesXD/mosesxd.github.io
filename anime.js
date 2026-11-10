/* MyAnimeList public list UI. Data is requested from the Vercel server function. */
(function () {
  "use strict";
  const API = "https://mosesxdgithubio.vercel.app/api/mal/animelist";
  const listEl = document.getElementById("malList");
  if (!listEl) return;

  const state = { status: "", sort: "list_updated_at", search: "", offset: 0, items: [], hasNext: false, loading: false };
  const $ = id => document.getElementById(id);
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[ch]));
  const statusNames = { watching:"Watching", completed:"Completed", on_hold:"On Hold", dropped:"Dropped", plan_to_watch:"Plan to Watch" };
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;

  function updateStats() {
    const counts = { watching:0, completed:0 };
    let scoreSum = 0, scored = 0;
    state.items.forEach(item => {
      const status = item.list_status && item.list_status.status;
      if (counts[status] !== undefined) counts[status]++;
      const score = number(item.list_status && item.list_status.score);
      if (score > 0) { scoreSum += score; scored++; }
    });
    $("malTotal").textContent = state.items.length;
    $("malCompleted").textContent = counts.completed;
    $("malWatching").textContent = counts.watching;
    $("malScore").textContent = scored ? (scoreSum / scored).toFixed(2) + " / 10" : "—";
    $("malStatsNote").textContent = "Based on " + state.items.length + " entries loaded so far; not full lifetime profile totals.";
  }

  function render() {
    const filtered = state.items.filter(item => {
      const title = item.node && item.node.title || "";
      return title.toLowerCase().includes(state.search.toLowerCase());
    });
    if (!filtered.length) {
      listEl.innerHTML = '<div class="mal-empty">No anime found for this filter.</div>';
      return;
    }
    listEl.innerHTML = filtered.map(item => {
      const anime = item.node || {};
      const entry = item.list_status || {};
      const image = anime.main_picture && (anime.main_picture.large || anime.main_picture.medium) || "";
      const watched = number(entry.num_episodes_watched);
      const total = number(anime.num_episodes);
      const progress = total > 0 ? Math.min(100, watched / total * 100) : 0;
      const genre = (anime.genres || []).slice(0,3).map(g => g.name).join(" · ");
      const episodeText = total ? watched + " / " + total + " episodes" : watched + " episodes watched";
      return '<article class="mal-entry">' +
        (image ? '<img loading="lazy" src="' + esc(image) + '" alt="" referrerpolicy="no-referrer">' : '<div class="mal-entry-art"></div>') +
        '<div><div class="mal-entry-top"><h2>' + esc(anime.title || "Untitled") + '</h2><span class="mal-chip">' + esc(entry.score ? entry.score + "/10" : "Unrated") + '</span></div>' +
        '<p>' + esc(statusNames[entry.status] || "List entry") + ' · ' + esc(episodeText) + '</p>' +
        (genre ? '<p>' + esc(genre) + '</p>' : '') +
        '<div class="mal-entry-meta"><span class="mal-chip">' + esc(anime.media_type || "Anime") + '</span>' +
        (anime.mean ? '<span class="mal-chip">MAL ' + esc(anime.mean) + '</span>' : '') + '</div>' +
        (entry.status === "watching" && total ? '<div class="mal-progress" aria-label="' + Math.round(progress) + '% complete"><span style="width:' + progress + '%"></span></div>' : '') +
        '<p><a class="mal-profile-link" href="https://myanimelist.net/anime/' + encodeURIComponent(anime.id) + '" target="_blank" rel="noopener noreferrer">View on MAL ↗</a></p></div></article>';
    }).join("");
  }

  async function load(reset) {
    if (state.loading) return;
    if (reset) { state.offset = 0; state.items = []; state.hasNext = false; listEl.innerHTML = ""; }
    state.loading = true;
    $("malStatus").textContent = "Loading anime from MyAnimeList…";
    $("malLoadMore").hidden = true;
    const params = new URLSearchParams({ limit:"100", offset:String(state.offset), sort:state.sort });
    if (state.status) params.set("status", state.status);
    try {
      const response = await fetch(API + "?" + params.toString(), { headers:{ Accept:"application/json" } });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload || !Array.isArray(payload.data)) {
        throw new Error(payload && payload.error || "The anime list could not be loaded.");
      }
      const next = payload.data.map(row => row && row.node ? row : null).filter(Boolean);
      state.items = state.items.concat(next);
      state.offset += next.length;
      state.hasNext = Boolean(payload.paging && payload.paging.hasNext);
      updateStats();
      render();
      $("malStatus").textContent = state.items.length ? "Showing " + state.items.length + " anime entries." : "No public anime entries were returned.";
      $("malLoadMore").hidden = !state.hasNext;
    } catch (error) {
      $("malStatus").textContent = error.message + " Check that the Vercel MAL_CLIENT_ID environment variable is set and the profile list is public.";
    } finally {
      state.loading = false;
    }
  }

  document.querySelectorAll("[data-status]").forEach(button => button.addEventListener("click", () => {
    state.status = button.dataset.status;
    document.querySelectorAll("[data-status]").forEach(tab => tab.setAttribute("aria-pressed", tab === button ? "true" : "false"));
    load(true);
  }));
  $("malSort").addEventListener("change", event => { state.sort = event.target.value; load(true); });
  $("malSearch").addEventListener("input", event => { state.search = event.target.value; render(); });
  $("malLoadMore").addEventListener("click", () => load(false));
  load(true);
})();