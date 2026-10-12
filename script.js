const year = document.getElementById("year");
year.textContent = new Date().getFullYear();

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

document.querySelectorAll("#navLinks a").forEach(link => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// ---------- Now playing (Last.fm) ----------
// Asks our Netlify Function what you're listening to. The function holds the
// secret key, so no key ever appears in this file.
const nowPlayingEl = document.getElementById("nowPlaying");
const nowPlayingLabel = document.getElementById("nowPlayingLabel");

// Only runs on pages that have the "nowPlaying" element (the About page)
if (nowPlayingEl && nowPlayingLabel) {
  fetch("/.netlify/functions/now-playing")
    .then(response => (response.ok ? response.json() : Promise.reject()))
    .then(data => {
      if (!data.track) return; // nothing to show, so keep the default text
      nowPlayingLabel.textContent = data.playing ? "Listening now" : "Last played";
      // textContent (not innerHTML) keeps odd characters in song names safe
      nowPlayingEl.textContent = data.track + " – " + data.artist;
    })
    .catch(() => {
      // If anything goes wrong, the page just keeps the text written in the HTML
    });
}

// ---------- v3.5 Motion (paste at the very BOTTOM of script.js) ----------
// Wrapped in try/catch so a mistake here can never break your menu above.
(function () {
  try {
    // 1) Header shadow after you scroll (fine even with reduced motion)
    var nav = document.querySelector(".nav");
    if (nav) {
      var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 8); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // 2) Scroll reveal. Skipped if the visitor prefers reduced motion.
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;

    var targets = document.querySelectorAll(
      ".section .eyebrow, .section h2, .section .notice, .section .currently > div, " +
      ".card, .gallery-placeholder, .preview-frame, .faq details"
    );

    var watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          watcher.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    Array.prototype.forEach.call(targets, function (el) {
      // Items in the same row/group appear one after another
      var position = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty("--i", Math.min(position, 6));
      el.classList.add("reveal");
      watcher.observe(el);
    });
  } catch (error) {
    console.warn("Motion block skipped:", error);
  }
})();

// ---------- v3.6 Themes (paste at the very BOTTOM of script.js, after the motion block) ----------
// Builds a little "make it yours" panel: Dark / Light / Pink / Auto, an accent color,
// and a background style. Choices are saved on the visitor's own device only.
// Wrapped in try/catch so a mistake here can never break your menu above.
(function () {
  try {
    var root = document.documentElement;
    var KEYS = { theme: "mh-theme", accent: "mh-accent", bg: "mh-bg" };
    var THEMES = ["dark", "light", "pink", "auto"];
    var BGS = ["glow", "solid", "dots", "grid"];
    var PAGE_BG = { dark: [7, 9, 16], light: [246, 248, 252], pink: [18, 6, 15] };
    var DEFAULT_ACCENT = { dark: "#78e8ff", light: "#07768f", pink: "#ff7ac8" };
    var ACCENT_VARS = ["--cyan", "--glow-1", "--accent-line", "--bubble", "--spot"];
    var lightQuery = window.matchMedia("(prefers-color-scheme: light)");

    // Saving can fail (private browsing), so every save is wrapped
    function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
    function write(key, value) {
      try {
        if (value === null) { localStorage.removeItem(key); } else { localStorage.setItem(key, value); }
      } catch (e) {}
    }

    var savedTheme = read(KEYS.theme), savedBg = read(KEYS.bg), savedAccent = read(KEYS.accent);
    var state = {
      theme: THEMES.indexOf(savedTheme) > -1 ? savedTheme : "dark",
      bg: BGS.indexOf(savedBg) > -1 ? savedBg : "glow",
      accent: /^#[0-9a-f]{6}$/i.test(savedAccent || "") ? savedAccent.toLowerCase() : null
    };

    // --- color helpers ---
    function hexToRgb(hex) {
      var n = parseInt(hex.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function luminance(rgb) {
      var c = rgb.map(function (v) {
        v = v / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }
    function contrast(a, b) {
      var la = luminance(a), lb = luminance(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    }
    function mix(rgb, target, amount) {
      return rgb.map(function (v, i) { return v + (target[i] - v) * amount; });
    }
    // Nudges a chosen color lighter or darker until text in that color is easy to read
    function readable(hex, pageRgb) {
      var rgb = hexToRgb(hex);
      var target = luminance(pageRgb) > 0.5 ? [0, 0, 0] : [255, 255, 255];
      var tries = 0;
      while (contrast(rgb, pageRgb) < 4.5 && tries < 25) { rgb = mix(rgb, target, 0.1); tries++; }
      return rgb.map(Math.round);
    }
    // --- end color helpers ---

    function currentTheme() {
      return state.theme === "auto" ? (lightQuery.matches ? "light" : "dark") : state.theme;
    }

    function apply() {
      var theme = currentTheme();
      root.setAttribute("data-theme", theme);
      root.setAttribute("data-bg", state.bg);
      if (state.accent) {
        var c = readable(state.accent, PAGE_BG[theme]).join(",");
        root.style.setProperty("--cyan", "rgb(" + c + ")");
        root.style.setProperty("--glow-1", "rgba(" + c + ",.10)");
        root.style.setProperty("--accent-line", "rgba(" + c + ",.35)");
        root.style.setProperty("--bubble", "rgba(" + c + ",.22)");
        root.style.setProperty("--spot", "rgba(" + c + ",.12)");
      } else {
        ACCENT_VARS.forEach(function (name) { root.style.removeProperty(name); });
      }
      syncPanel();
    }

    // --- build the panel (static text only, nothing from visitors) ---
    function make(tag, className, text) {
      var node = document.createElement(tag);
      if (className) { node.className = className; }
      if (text) { node.textContent = text; }
      return node;
    }

    var fab = make("button", "theme-fab", "🎨");
    fab.type = "button";
    fab.setAttribute("aria-label", "Theme settings");
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-controls", "themePanel");

    var panel = make("div", "theme-panel");
    panel.id = "themePanel";
    panel.hidden = true;
    panel.appendChild(make("p", "theme-title", "Make it yours"));

    function group(label, items, key) {
      panel.appendChild(make("p", "theme-label", label));
      var row = make("div", "theme-row");
      items.forEach(function (item) {
        var button = make("button", "", item[1]);
        button.type = "button";
        button.setAttribute("data-key", key);
        button.setAttribute("data-value", item[0]);
        button.addEventListener("click", function () {
          state[key] = item[0];
          write(KEYS[key], item[0]);
          apply();
        });
        row.appendChild(button);
      });
      panel.appendChild(row);
    }

    group("Theme", [["dark", "Dark"], ["light", "Light"], ["pink", "Pink"], ["auto", "Auto"]], "theme");

    panel.appendChild(make("p", "theme-label", "Accent color"));
    var accentRow = make("div", "theme-row");
    var picker = make("input");
    picker.type = "color";
    picker.setAttribute("aria-label", "Accent color");
    picker.addEventListener("input", function () {
      state.accent = picker.value.toLowerCase();
      write(KEYS.accent, state.accent);
      apply();
    });
    var reset = make("button", "", "Reset");
    reset.type = "button";
    reset.addEventListener("click", function () {
      state.accent = null;
      write(KEYS.accent, null);
      apply();
    });
    accentRow.appendChild(picker);
    accentRow.appendChild(reset);
    panel.appendChild(accentRow);

    group("Background", [["glow", "Glow"], ["solid", "Solid"], ["dots", "Dots"], ["grid", "Grid"]], "bg");

    function syncPanel() {
      Array.prototype.forEach.call(panel.querySelectorAll("button[data-key]"), function (button) {
        var on = state[button.getAttribute("data-key")] === button.getAttribute("data-value");
        button.setAttribute("aria-pressed", on ? "true" : "false");
      });
      picker.value = state.accent || DEFAULT_ACCENT[currentTheme()];
    }

    function setOpen(open) {
      panel.hidden = !open;
      fab.setAttribute("aria-expanded", open ? "true" : "false");
    }
    fab.addEventListener("click", function () { setOpen(panel.hidden); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setOpen(false); } });
    document.addEventListener("click", function (e) {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== fab) { setOpen(false); }
    });

    document.body.appendChild(panel);
    document.body.appendChild(fab);

    // "Auto" follows the phone's own light/dark setting, even if it changes while the page is open
    if (lightQuery.addEventListener) { lightQuery.addEventListener("change", apply); }
    else if (lightQuery.addListener) { lightQuery.addListener(apply); }

    apply();
  } catch (error) {
    console.warn("Theme block skipped:", error);
  }
})();

// ---------- v3.8 Signature effects (paste at the very BOTTOM of script.js) ----------
// Mouse devices only. Phones and reduced-motion visitors skip all of it.
(function () {
  try {
    var mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!mouse || calm) return;

    // Spotlight that follows the mouse (pages that have a .hero)
    var hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener("pointermove", function (e) {
        var box = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", (e.clientX - box.left) + "px");
        hero.style.setProperty("--my", (e.clientY - box.top) + "px");
      });
    }

    // Tilt on project and game cards
    Array.prototype.forEach.call(document.querySelectorAll(".project-card, .game-card"), function (card) {
      card.setAttribute("data-tilt", "");
      card.addEventListener("pointermove", function (e) {
        var box = card.getBoundingClientRect();
        var x = (e.clientX - box.left) / box.width - 0.5;
        var y = (e.clientY - box.top) / box.height - 0.5;
        card.style.setProperty("--ry", (x * 8) + "deg");
        card.style.setProperty("--rx", (-y * 8) + "deg");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  } catch (error) {
    console.warn("Signature block skipped:", error);
  }
})();
