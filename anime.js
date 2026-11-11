/* MyAnimeList public list UI. Data is requested from the Vercel server function. */
(function () {
  "use strict";
  const API = "https://mosesxdgithubio.vercel.app/api/mal/animelist";
  const listEl = document.getElementById("malList");
  if (!listEl) return;

  const state = {
    status: "",
    sort: "list_updated_at",
    search: "",
    offset: 0,
    items: [],
    hasNext: false,
    loading: false,
    requestId: 0
  };
  const $ = id => document.getElementById(id);
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
  const statusNames = {
    watching:"Watching", completed:"Completed", on_hold:"On Hold",
    dropped:"Dropped", plan_to_watch:"Plan to Watch"
  };
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;

  function updateStats() {
    const counts = { watching:0, completed:0 };
    let scoreSum = 0, scored = 0;
    const genres = new Map();

    state.items.forEach(item => {
      const status = item.list_status && item.list_status.status;
      if (counts[status] !== undefined) counts[status]++;
      const score = number(item.list_status && item.list_status.score);
      if (score > 0) { scoreSum += score; scored++; }

      const seenOnEntry = new Set();
      (item.node && Array.isArray(item.node.genres) ? item.node.genres : []).forEach(genre => {
        const name = String(genre && genre.name || "").trim();
        if (!name || seenOnEntry.has(name)) return;
        seenOnEntry.add(name);
        genres.set(name, (genres.get(name) || 0) + 1);
      });
    });

    $("malTotal").textContent = state.items.length;
    $("malCompleted").textContent = counts.completed;
    $("malWatching").textContent = counts.watching;
    $("malScore").textContent = scored ? (scoreSum / scored).toFixed(2) + " / 10" : "—";
    $("malStatsNote").textContent =
      "Based on " + state.items.length + " entries loaded so far; not full lifetime profile totals.";

    const genreTarget = $("malGenreBreakdown");
    if (genreTarget) {
      const topGenres = Array.from(genres.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 8);
      genreTarget.innerHTML = topGenres.length
        ? topGenres.map(([name, count]) =>
            '<span class="mal-genre-chip"><strong>' + esc(name) +
            '</strong><small>' + count + (count === 1 ? " title" : " titles") + '</small></span>'
          ).join("")
        : '<span class="mal-muted">Genre information will appear as anime entries load.</span>';
    }
  }

  function render() {
    const query = state.search.trim().toLocaleLowerCase();
    const filtered = state.items.filter(item => {
      const title = item.node && item.node.title || "";
      return title.toLocaleLowerCase().includes(query);
    });

    if (!filtered.length) {
      listEl.innerHTML = '<div class="mal-empty">' +
        (state.items.length ? "No loaded anime titles match your search." : "No anime entries are available for this filter.") +
        '</div>';
      if (state.items.length) {
        $("malStatus").textContent = "No matches among " + state.items.length + " loaded entries.";
      }
      return;
    }

    listEl.innerHTML = filtered.map(item => {
      const anime = item.node || {};
      const entry = item.list_status || {};
      const image = anime.main_picture && (anime.main_picture.large || anime.main_picture.medium) || "";
      const watched = number(entry.num_episodes_watched);
      const total = number(anime.num_episodes);
      const progress = total > 0 ? Math.min(100, watched / total * 100) : 0;
      const genre = (Array.isArray(anime.genres) ? anime.genres : [])
        .slice(0, 3).map(g => g && g.name).filter(Boolean).join(" · ");
      const episodeText = total ? watched + " / " + total + " episodes" : watched + " episodes watched";
      const animeId = encodeURIComponent(anime.id == null ? "" : anime.id);

      return '<article class="mal-entry">' +
        (image ? '<img loading="lazy" src="' + esc(image) + '" alt="" referrerpolicy="no-referrer">' : '<div class="mal-entry-art" aria-hidden="true"></div>') +
        '<div><div class="mal-entry-top"><h2>' + esc(anime.title || "Untitled") + '</h2><span class="mal-chip">' +
        esc(entry.score ? entry.score + "/10" : "Unrated") + '</span></div>' +
        '<p>' + esc(statusNames[entry.status] || "List entry") + ' · ' + esc(episodeText) + '</p>' +
        (genre ? '<p>' + esc(genre) + '</p>' : '') +
        '<div class="mal-entry-meta"><span class="mal-chip">' + esc(anime.media_type || "Anime") + '</span>' +
        (anime.mean ? '<span class="mal-chip">MAL ' + esc(anime.mean) + '</span>' : '') + '</div>' +
        (entry.status === "watching" && total
          ? '<div class="mal-progress" role="progressbar" aria-label="Episode progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
            Math.round(progress) + '"><span style="width:' + progress + '%"></span></div>'
          : '') +
        (animeId ? '<p><a class="mal-profile-link" href="https://myanimelist.net/anime/' + animeId +
          '" target="_blank" rel="noopener noreferrer">View on MAL ↗</a></p>' : '') +
        '</div></article>';
    }).join("");

    $("malStatus").textContent = "Showing " + filtered.length + " of " + state.items.length +
      " loaded anime entries" + (state.hasNext ? " · more available" : "") + ".";
  }

  async function load(reset) {
    if (!reset && state.loading) return;

    if (reset) {
      state.items = [];
      state.offset = 0;
      state.hasNext = false;
      updateStats();
      listEl.innerHTML = "";
    }

    const requestId = ++state.requestId;
    state.loading = true;
    $("malStatus").textContent = "Loading anime from MyAnimeList…";
    $("malLoadMore").hidden = true;
    $("malLoadMore").textContent = "Load more anime";

    const params = new URLSearchParams({
      limit: "100",
      offset: String(state.offset),
      sort: state.sort
    });
    if (state.status) params.set("status", state.status);

    try {
      const response = await fetch(API + "?" + params.toString(), {
        headers: { Accept: "application/json" }
      });
      const payload = await response.json().catch(() => null);

      // A newer filter/sort request supersedes this response.
      if (requestId !== state.requestId) return;
      if (!response.ok || !payload || !Array.isArray(payload.data)) {
        throw new Error(payload && payload.error || "The anime list could not be loaded.");
      }

      const next = payload.data.map(row => row && row.node ? row : null).filter(Boolean);
      const existingIds = new Set(state.items.map(item => String(item.node && item.node.id)));
      state.items = state.items.concat(next.filter(item => !existingIds.has(String(item.node.id))));
      state.offset += next.length;
      state.hasNext = Boolean(payload.paging && payload.paging.hasNext);
      updateStats();
      render();

      if (!state.items.length) {
        $("malStatus").textContent = "No public anime entries were returned for this filter.";
      }
      $("malLoadMore").hidden = !state.hasNext;
    } catch (error) {
      if (requestId !== state.requestId) return;
      $("malStatus").textContent = error.message +
        " Check the Vercel MAL_CLIENT_ID setting and that your MAL list is public.";
      // Keep pagination retryable when a later page fails.
      $("malLoadMore").hidden = !(state.items.length && state.hasNext);
      if (!reset && state.hasNext) $("malLoadMore").textContent = "Retry loading more";
    } finally {
      if (requestId === state.requestId) state.loading = false;
    }
  }

  document.querySelectorAll("[data-status]").forEach(button => button.addEventListener("click", () => {
    state.status = button.dataset.status;
    document.querySelectorAll("[data-status]").forEach(tab =>
      tab.setAttribute("aria-pressed", tab === button ? "true" : "false")
    );
    load(true);
  }));

  $("malSort").addEventListener("change", event => {
    state.sort = event.target.value;
    load(true);
  });
  $("malSearch").addEventListener("input", event => {
    state.search = event.target.value;
    render();
  });
  $("malLoadMore").addEventListener("click", () => load(false));
  load(true);
})();
