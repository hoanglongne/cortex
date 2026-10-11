/*
 * Pure helpers shared by the Threads content script, the popup and the tests.
 * Loaded as a classic script in the extension (window.LexicaExtract) and with
 * require() in tests.
 */
(function (root) {
  "use strict";

  var MAX_TEXT = 2000;

  /** Threads post link without query or hash, or null if it is not one. */
  function postUrl(href, base) {
    try {
      var u = new URL(href, base);
      var host = u.hostname.replace(/^www\./, "");
      if (host !== "threads.net" && host !== "threads.com") return null;
      var m = u.pathname.match(/^\/(@[\w.]+)\/post\/([\w-]+)/);
      if (!m) return null;
      return u.origin + "/" + m[1] + "/post/" + m[2];
    } catch (e) {
      return null;
    }
  }

  function authorFromUrl(url) {
    var m = /\/(@[\w.]+)\/post\//.exec(url || "");
    return m ? m[1] : null;
  }

  /** "1,2K" / "3,4 N" / "12.5K" / "2 Tr" → number. */
  function parseCount(s) {
    var m = String(s)
      .trim()
      .match(/^(\d+(?:[.,]\d+)?)\s*(k|n|m|tr|b)?$/i);
    if (!m) return null;
    var n = parseFloat(m[1].replace(",", "."));
    var unit = (m[2] || "").toLowerCase();
    if (unit === "k" || unit === "n") n *= 1e3;
    else if (unit === "m" || unit === "tr") n *= 1e6;
    else if (unit === "b") n *= 1e9;
    return Math.round(n);
  }

  // Lines that are UI chrome, not the post: relative times, buttons, labels.
  var TIME =
    /^(\d+\s*(s|m|h|d|w|y|giây|phút|giờ|ngày|tuần|năm)|vừa xong|just now|\d{1,2}\/\d{1,2}\/\d{2,4})$/i;
  var CHROME = new Set([
    "thích",
    "like",
    "trả lời",
    "reply",
    "đăng lại",
    "repost",
    "chia sẻ",
    "share",
    "dịch",
    "translate",
    "xem bản dịch",
    "see translation",
    "theo dõi",
    "follow",
    "thêm",
    "more",
    "đã chỉnh sửa",
    "edited",
    "tác giả",
    "author",
    "·",
    "+ lexica",
    "đã gửi",
    "xem thêm",
    "see more",
    "ghim",
    "pinned",
  ]);

  /**
   * Turns a post's innerText into the post text and the trailing counters
   * (likes, replies, reposts, shares, in the order Threads shows them).
   */
  function cleanPostText(innerText, author) {
    var handle = (author || "").replace(/^@/, "").toLowerCase();
    var lines = String(innerText || "")
      .split(/\n+/)
      .map(function (l) {
        return l.replace(/\s+/g, " ").trim();
      })
      .filter(Boolean);

    var counts = [];
    while (lines.length && parseCount(lines[lines.length - 1]) !== null) {
      counts.unshift(parseCount(lines.pop()));
    }

    var text = lines
      .map(function (l) {
        // "mai.vy · 2 giờ" / "mai.vy 3h": the header row on one line.
        if (handle && l.toLowerCase().indexOf(handle + " ") === 0) {
          return l.slice(handle.length).replace(/^[\s·•]+/, "");
        }
        return l;
      })
      .filter(function (l) {
        if (!l) return false;
        var low = l.toLowerCase();
        if (handle && (low === handle || low === "@" + handle)) return false;
        if (TIME.test(l) || CHROME.has(low)) return false;
        if (/^\d+\s*\/\s*\d+$/.test(l)) return false; // carousel "1/4"
        return true;
      });

    var metrics = {};
    ["likes", "replies", "reposts", "shares"].forEach(function (k, i) {
      if (typeof counts[i] === "number") metrics[k] = counts[i];
    });
    return {
      text: text.join("\n").slice(0, MAX_TEXT),
      metrics: metrics,
    };
  }

  /** Body for POST /capture. Empty fields are left out. */
  function buildPayload(input) {
    var out = {};
    ["url", "text", "author", "note"].forEach(function (k) {
      var v = input[k];
      if (typeof v === "string" && v.trim()) out[k] = v.trim();
    });
    if (out.text) out.text = out.text.slice(0, MAX_TEXT);
    if (out.note) out.note = out.note.slice(0, 500);
    if (input.metrics && Object.keys(input.metrics).length)
      out.metrics = input.metrics;
    return out;
  }

  /** Accepts "api.example.com" or "https://api.example.com/" → origin URL. */
  function normalizeApiUrl(raw) {
    var s = String(raw || "")
      .trim()
      .replace(/\/+$/, "");
    if (!s) return "";
    if (!/^https?:\/\//i.test(s)) s = "https://" + s;
    return s;
  }

  var api = {
    postUrl: postUrl,
    authorFromUrl: authorFromUrl,
    parseCount: parseCount,
    cleanPostText: cleanPostText,
    buildPayload: buildPayload,
    normalizeApiUrl: normalizeApiUrl,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LexicaExtract = api;
})(typeof self !== "undefined" ? self : this);
