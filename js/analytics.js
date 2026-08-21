/**
 * Cult Group site analytics — Яндекс.Метрика (бесплатно).
 * Зависимость: analytics.config.js → window.CULT_METRIKA_ID
 *
 * Даёт: визиты, источники, UTM, карта кликов, вебвизор, цели (reachGoal).
 */
(function () {
  "use strict";

  var id = Number(window.CULT_METRIKA_ID || 0);
  if (!id) {
    if (typeof console !== "undefined" && console.info) {
      console.info("[Cult analytics] CULT_METRIKA_ID не задан — счётчик не грузится.");
    }
    window.cultReachGoal = function () {};
    return;
  }

  window.dataLayer = window.dataLayer || [];

  var tagSrc = "https://mc.yandex.ru/metrika/tag.js?id=" + id;

  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) return;
    }
    (k = e.createElement(t)), (a = e.getElementsByTagName(t)[0]);
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document, "script", tagSrc, "ym");

  ym(id, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });

  // noscript-пиксель (если ещё нет)
  if (!document.querySelector('img[src*="mc.yandex.ru/watch/' + id + '"]')) {
    var ns = document.createElement("noscript");
    ns.innerHTML =
      '<div><img src="https://mc.yandex.ru/watch/' +
      id +
      '" style="position:absolute;left:-9999px;" alt=""/></div>';
    document.body.appendChild(ns);
  }

  /** Цель в Метрике: JavaScript-событие с тем же именем. */
  window.cultReachGoal = function (name, params) {
    if (!name) return;
    try {
      if (params) ym(id, "reachGoal", name, params);
      else ym(id, "reachGoal", name);
    } catch (err) {
      /* ignore */
    }
  };

  function bindDelegatedGoals() {
    document.addEventListener(
      "click",
      function (e) {
        var el = e.target && e.target.closest ? e.target.closest("[data-ym-goal]") : null;
        if (!el) return;
        var goal = el.getAttribute("data-ym-goal");
        if (!goal) return;
        var params = {};
        var raw = el.getAttribute("data-ym-params");
        if (raw) {
          try {
            params = JSON.parse(raw);
          } catch (err2) {
            params = { label: raw };
          }
        }
        var href = el.getAttribute("href");
        if (href) params.href = href;
        window.cultReachGoal(goal, params);
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindDelegatedGoals);
  } else {
    bindDelegatedGoals();
  }
})();
