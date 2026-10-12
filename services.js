// services.js  (new file, only the Services page uses it)
// Switches the prices between TTD and USD. Prices are FIXED numbers you type
// into the page (data-ttd and data-usd). Nothing is converted live.
(function () {
  try {
    var KEY = "mh-currency";
    var buttons = document.querySelectorAll("[data-currency]");
    var prices = document.querySelectorAll("[data-ttd]");
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    var current = saved === "usd" || saved === "ttd" ? saved : "ttd";

    function show(currency) {
      current = currency;
      Array.prototype.forEach.call(prices, function (el) {
        el.textContent = el.getAttribute("data-" + currency);
      });
      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-currency") === currency ? "true" : "false");
      });
      try { localStorage.setItem(KEY, currency); } catch (e) {}
    }

    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener("click", function () { show(b.getAttribute("data-currency")); });
    });
    show(current);
  } catch (error) {
    console.warn("Services block skipped:", error);
  }
})();
