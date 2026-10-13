// ======================================================================
// ads.js  =  your ad control panel  (new file, upload it next to index.html)
//
// HOW TO USE
//  1. Find the ad you want in the list below.
//  2. Change  active: false  to  active: true  to switch it ON.
//     Change it back to false to switch it OFF. Nothing else to touch.
//  3. Want it to stop by itself? Add  end: "2026-12-31"  (year-month-day).
//     Want it to start later? Add  start: "2026-12-01".
//  4. To make another ad, copy one whole { ... }, paste it after the last
//     one (keep the comma between them) and change the words.
//
// SAFETY BUILT IN (you can't switch these off by accident)
//  - Every ad shows a label: Partner, Featured, Services or Ad.
//  - Paid ads (paid: true) always get the "sponsored" tag on the link.
//  - Only https:// links, or one of your own pages like services.html.
//  - Pictures must be saved inside your own site, in a folder called images.
//  - An ad that still has [square brackets] or REPLACE-ME in it is skipped,
//    so a half-finished ad can never go live.
//  - No code from other sites runs here. Ads are just text, a picture, a link.
// ======================================================================

// "one" = show a single ad (a different one each visit if several are on)
// "all" = show every ad that is on
window.MH_ADS_SETTINGS = { home: "one", partners: "all", services: "one" };

window.MH_ADS = [
  {
    id: "my-services",            // short name, used to count clicks in Umami
    slot: "home",                 // where it appears: home, partners or services
    label: "Services",            // Partner, Featured, Services or Ad
    title: "Websites for small businesses and creators",
    text: "Simple, mobile-friendly sites built to a clear brief. See what I offer and what it costs.",
    url: "services.html",
    cta: "See services",
    active: false                 // switch to true when your prices are final
  },
  {
    id: "triniskills",            // your brother's site
    slot: "partners",
    label: "Partner",
    title: "TriniSkills",
    text: "Connects skilled people in Trinidad and Tobago with customers who need their services.",
    url: "https://triniskills.onhercules.app/",
    cta: "Visit site",
    active: true                 // switch to true once your brother says the wording is OK
  },
  {
    id: "gabrielle clothing",
    slot: "partners",
    label: "Featured",
    title: "Work shopping",
    text: "Thinking brain storming.",
    url: "https//mosesxd.github.io/oops",
    cta: "Visit",
    // image: "images/ads/friend-business-1.jpg",   // optional. Remove the // to use. Wide 16:9 picture.
    // alt: "Describe the picture",
    // paid: true,                                  // for a paid spot
    active: true
  },
  {
    id: "kevan-law-photography",
    slot: "home",
    label: "Ad",
    title: "Kevan Law Photography",
    text: "Professional photography in Trinidad and Tobago.",
    url: "https://instagram.com/kevan_law_photography",
    cta: "Visit",
    image: "/images/ads/sunset.webp",
    alt: "Sunset photography by Kevan Law",
    paid: true,
    active: true
  }
];

// ---------------------- the part that shows the ads ----------------------
(function () {
  try {
    var LABELS = ["Partner", "Featured", "Services", "Ad"];
    var today = new Date().toISOString().slice(0, 10);
    var settings = window.MH_ADS_SETTINGS || {};
    var ads = window.MH_ADS || [];

    // Returns { href, external } for a safe link, or null
    function safeLink(url) {
      if (typeof url !== "string") { return null; }
      if (/^https:\/\/[^\s"'<>]+$/i.test(url)) { return { href: url, external: true }; }
      if (/^[a-z0-9_-]+\.html$/i.test(url)) { return { href: url, external: false }; }
      return null;
    }
    // Pictures must live in your own images folder (no hotlinking other sites)
    function safeImage(path) {
      var ok = /^images\/[a-z0-9_\-\/]+\.(jpg|jpeg|png|webp|gif|svg)$/i;
      return typeof path === "string" && ok.test(path) ? path : null;
    }
    function unfinished(ad) {
      var words = String(ad.title) + " " + String(ad.text || "") + " " + String(ad.url);
      return /\[|\]|REPLACE-ME/i.test(words);
    }
    function eligible(ad, slot) {
      if (!ad || ad.slot !== slot || ad.active !== true) { return false; }
      if (typeof ad.title !== "string" || !ad.title) { return false; }
      if (ad.start && today < ad.start) { return false; }
      if (ad.end && today > ad.end) { return false; }
      if (!safeLink(ad.url)) { return false; }
      return !unfinished(ad);
    }

    function make(tag, className, text) {
      var node = document.createElement(tag);
      if (className) { node.className = className; }
      if (text) { node.textContent = text; }   // textContent: never treated as code
      return node;
    }

    function buildCard(ad) {
      var label = LABELS.indexOf(ad.label) > -1 ? ad.label : "Ad";
      if (ad.paid && label !== "Ad" && label !== "Featured") { label = "Ad"; }
      var link = safeLink(ad.url);

      var card = make("article", "card ad-card");
      card.appendChild(make("span", "badge" + (label === "Featured" || label === "Ad" ? " featured" : ""), label.toUpperCase()));

      var picture = safeImage(ad.image);
      if (picture) {
        var img = make("img", "ad-image");
        img.setAttribute("src", picture);
        img.setAttribute("alt", ad.alt || ad.title);
        img.setAttribute("loading", "lazy");
        card.appendChild(img);
      }

      card.appendChild(make("h3", "", ad.title));
      if (ad.text) { card.appendChild(make("p", "", ad.text)); }

      var a = make("a", "button primary", (ad.cta || "Learn more") + (link.external ? " ↗" : ""));
      a.setAttribute("href", link.href);
      if (link.external) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", ad.paid ? "sponsored noopener noreferrer" : "noopener noreferrer");
      }
      // Lets Umami count clicks on this ad
      a.setAttribute("data-umami-event", "ad-click");
      a.setAttribute("data-umami-event-ad", String(ad.id || ad.title));
      card.appendChild(a);
      return card;
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-slot]"), function (slot) {
      var name = slot.getAttribute("data-slot");
      var list = ads.filter(function (ad) { return eligible(ad, name); });

      if (!list.length) {
        // Nothing is switched on. Slots marked data-hide-empty hide their whole section.
        if (slot.hasAttribute("data-hide-empty")) {
          var box = slot.closest ? slot.closest(".section") : null;
          if (box) { box.hidden = true; }
        }
        return;   // otherwise the fallback text inside the slot stays
      }

      if ((settings[name] || "all") === "one") {
        list = [list[Math.floor(Math.random() * list.length)]];
      }

      while (slot.firstChild) { slot.removeChild(slot.firstChild); }
      var wrap = make("div", list.length > 1 ? "cards" : "ad-one");
      list.forEach(function (ad) { wrap.appendChild(buildCard(ad)); });
      slot.appendChild(wrap);
    });
  } catch (error) {
    console.warn("Ads block skipped:", error);
  }
})();
