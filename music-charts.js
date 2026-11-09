// Personal Last.fm top tracks popup for Moses' Hub.
(function () {
  const card = document.getElementById("nowPlayingCard");
  if (!card) return;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "music-charts-trigger";
  trigger.textContent = "♫ My music charts";
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-controls", "musicChartsDialog");
  card.insertAdjacentElement("afterend", trigger);

  const dialog = document.createElement("dialog");
  dialog.className = "music-charts-dialog";
  dialog.id = "musicChartsDialog";
  dialog.setAttribute("aria-labelledby", "musicChartsTitle");
  dialog.innerHTML = `
    <div class="music-charts-shell">
      <div class="music-charts-heading">
        <div><p class="eyebrow">LAST.FM · PERSONAL CHARTS</p><h2 id="musicChartsTitle">Your listening charts</h2></div>
        <button class="music-charts-close" type="button" aria-label="Close charts">×</button>
      </div>
      <div class="music-charts-tabs" role="group" aria-label="Chart period">
        <button type="button" data-period="weekly" aria-pressed="true">This week</button>
        <button type="button" data-period="monthly" aria-pressed="false">This month</button>
      </div>
      <p class="music-charts-period">Top 10 tracks · Rolling last 7 days</p>
      <div class="music-charts-status" role="status" aria-live="polite">Loading your charts…</div>
      <ol class="music-charts-list"></ol>
      <p class="music-charts-footnote">Based on your Last.fm listening history. Updated when opened, with a short cache.</p>
    </div>`;
  document.body.appendChild(dialog);

  const status = dialog.querySelector(".music-charts-status");
  const list = dialog.querySelector(".music-charts-list");
  const periodLabel = dialog.querySelector(".music-charts-period");
  const tabs = Array.from(dialog.querySelectorAll("[data-period]"));
  let data = null;
  let loading = false;
  let selected = "weekly";
  let lastLoaded = 0;

  function render() {
    const period = data && data.periods && data.periods[selected];
    periodLabel.textContent = selected === "weekly"
      ? "Top 10 tracks · Rolling last 7 days"
      : "Top 10 tracks · Rolling last month";
    tabs.forEach(tab => tab.setAttribute("aria-pressed", String(tab.dataset.period === selected)));
    list.replaceChildren();
    if (!period || !Array.isArray(period.tracks) || period.tracks.length === 0) {
      status.hidden = false;
      status.textContent = "No scrobbles were returned from your Last.fm history for this date range.";
      if (data && data.generatedAt) status.textContent += " Last checked: " + new Date(data.generatedAt).toLocaleString() + ".";
      return;
    }
    status.hidden = false;
    status.textContent = period.capped
      ? "Showing the top tracks from the most recent 2,000 scrobbles in this period."
      : period.complete ? "Your top tracks for this period." : "Showing the available recent listening history.";
    period.tracks.forEach((track, index) => {
      const item = document.createElement("li");
      item.className = "music-chart-row";
      const rank = document.createElement("span");
      rank.className = "music-chart-rank";
      rank.textContent = String(index + 1).padStart(2, "0");
      const cover = document.createElement("img");
      cover.className = "music-chart-art";
      cover.alt = "";
      cover.loading = "lazy";
      if (track.artwork) cover.src = track.artwork;
      else cover.classList.add("is-empty");
      cover.addEventListener("error", () => { cover.removeAttribute("src"); cover.classList.add("is-empty"); });
      const copy = document.createElement("span");
      copy.className = "music-chart-copy";
      const title = document.createElement("strong");
      title.textContent = track.name;
      const artist = document.createElement("small");
      artist.textContent = track.artist;
      copy.append(title, artist);
      const plays = document.createElement("span");
      plays.className = "music-chart-plays";
      plays.textContent = track.plays + (track.plays === 1 ? " play" : " plays");
      item.append(rank, cover, copy, plays);
      list.appendChild(item);
    });
  }

  async function load(force) {
    if (loading || (!force && data && Date.now() - lastLoaded < 5 * 60 * 1000)) {
      if (data) render();
      return;
    }
    loading = true;
    status.hidden = false;
    status.textContent = "Loading your charts…";
    list.replaceChildren();
    try {
      const endpoint = window.location.hostname === "mosesxd.github.io"
        ? "https://mosesxdgithubio.vercel.app/api/music-charts"
        : window.location.hostname.endsWith(".netlify.app")
          ? "/.netlify/functions/music-charts"
          : "/api/music-charts";
      const response = await fetch(endpoint, { headers: { Accept: "application/json" }, cache: "no-store" });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result || !result.periods) {
        const message = result && result.error ? result.error : "Charts are temporarily unavailable.";
        const detail = result && result.detail ? " — " + result.detail : "";
        throw new Error(message + detail);
      }
      data = result;
      lastLoaded = Date.now();
      render();
    } catch (error) {
      status.hidden = false;
      status.textContent = error.message || "Could not load your charts. Please try again later.";
    } finally {
      loading = false;
    }
  }

  trigger.addEventListener("click", () => {
    dialog.showModal();
    load(false);
  });
  dialog.querySelector(".music-charts-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  tabs.forEach(tab => tab.addEventListener("click", () => {
    selected = tab.dataset.period;
    render();
  }));
})();
