/* Shape-Bayes project page: math, theme, nav, comparison sliders, charts, tabs, lightbox. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------------- data (from the paper's tables) ---------------- */
  // [base, +Shape-Bayes]; min = minNME@100 of +Shape-Bayes; null = not evaluated.
  const XARCH = [
    { name: "HR-noSA", native: false, d: {
      "300W": { idr: [66.6, 100], occ: [9.03, 7.91], all: [6.31, 5.90], min: 5.49, fr: [11.8, 9.4], auc: [41.3, 44.3] },
      "WFLW": { idr: [81, 100], occ: [12.34, 11.35], all: [9.12, 8.79], min: 8.36, fr: [25.6, 23.4], auc: [27.9, 29.8] },
      "COFW": { idr: [96, 100], occ: [10.28, 9.16], all: [7.40, 7.08], min: 6.41, fr: [16.0, 13.2], auc: [33.3, 35.3] } } },
    { name: "LUVLi", native: true, d: {
      "300W": { idr: [83, 100], occ: [9.87, 8.86], all: [7.06, 6.67], min: 6.17, fr: [11.8, 9.9], auc: [36.8, 39.5] },
      "WFLW": { idr: [90, 100], occ: [12.27, 11.33], all: [9.08, 8.73], min: 7.97, fr: [23.3, 22.0], auc: [30.9, 32.3] },
      "COFW": null } },
    { name: "DSLPT", native: true, d: {
      "300W": null,
      "WFLW": { idr: [98, 100], occ: [12.08, 11.46], all: [8.81, 8.66], min: 8.25, fr: [25.3, 24.6], auc: [28.3, 29.4] },
      "COFW": null } },
    { name: "ORFormer", native: false, d: {
      "300W": { idr: [78, 100], occ: [10.36, 9.06], all: [7.07, 6.75], min: 6.33, fr: [14.4, 12.3], auc: [36.5, 39.6] },
      "WFLW": { idr: [84, 100], occ: [10.49, 10.13], all: [8.24, 8.07], min: 7.57, fr: [21.3, 20.2], auc: [33.0, 33.8] },
      "COFW": { idr: [100, 100], occ: [9.56, 8.93], all: [6.61, 6.48], min: 5.97, fr: [10.8, 9.1], auc: [37.1, 38.0] } } },
    { name: "STAR", native: false, d: {
      "300W": { idr: [63, 100], occ: [11.80, 9.70], all: [8.47, 7.51], min: 6.87, fr: [26.6, 18.6], auc: [27.3, 34.1] },
      "WFLW": { idr: [85, 100], occ: [11.38, 10.69], all: [8.41, 8.18], min: 7.69, fr: [21.4, 20.0], auc: [31.5, 32.9] },
      "COFW": { idr: [100, 100], occ: [10.75, 9.53], all: [8.15, 7.79], min: 7.08, fr: [21.1, 18.3], auc: [27.1, 29.1] } } },
    { name: "PiPNet", native: false, d: {
      "300W": { idr: [75, 100], occ: [14.88, 11.72], all: [10.43, 8.76], min: 8.23, fr: [41.2, 27.5], auc: [18.3, 25.3] },
      "WFLW": { idr: [92, 100], occ: [11.07, 9.90], all: [8.40, 8.00], min: 7.33, fr: [21.4, 19.3], auc: [31.3, 33.8] },
      "COFW": { idr: [100, 100], occ: [10.56, 9.51], all: [8.50, 7.81], min: 7.17, fr: [19.7, 16.0], auc: [28.8, 31.2] } } },
  ];
  const PARTS = [
    ["Jaw", 11.2, 10.1], ["Mouth", 10.2, 8.9], ["Left brow", 7.6, 7.0], ["Right brow", 7.0, 6.4],
    ["Nose", 6.6, 5.8], ["Left eye", 5.8, 5.1], ["Right eye", 5.2, 4.5],
  ];
  const CALIB = [ // name, NLL [b, sb], ECE [b, sb]
    ["LUVLi*", [6.08, 6.07], [0.90, 0.86]],
    ["HR-noSA", [6.48, 6.34], [7.56, 1.97]],
    ["ORFormer", [6.50, 6.35], [4.87, 2.07]],
    ["PiPNet", [6.95, 6.55], [3.36, 1.09]],
    ["STAR", [6.81, 6.60], [7.10, 1.95]],
  ];
  const ABLATION = [
    ["Base deterministic regression", 9.03, 9.03, 32.15, 25.81],
    ["Deterministic manifold projection", 8.85, 8.85, 31.57, 26.97],
    ["Static prior + distilled uncertainty", 8.08, 6.79, 25.69, 30.61],
    ["Dynamic prior, uniform uncertainty", 8.00, 6.68, 25.47, 30.80],
    ["Shape-Bayes: dynamic prior + distilled uncertainty", 7.91, 6.60, 24.67, 31.53],
  ];

  /* ---------------- math ---------------- */
  function renderMath() {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(document.body, {
      delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }],
      trust: ctx => ctx.command === "\\htmlClass",
      strict: false, throwOnError: false,
    });
  }

  /* ---------------- theme ---------------- */
  function initTheme() {
    const btn = $("#theme-toggle"), root = document.documentElement;
    const current = () => root.getAttribute("data-theme") || "dark";
    btn.addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("sb-theme", next); } catch (e) {}
    });
  }

  /* ---------------- nav ---------------- */
  function initNav() {
    const nav = $("#nav"), links = $$(".nav-links a");
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    const byId = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { links.forEach(a => a.classList.remove("active")); const a = byId.get(e.target.id); if (a) a.classList.add("active"); }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------------- comparison sliders ---------------- */
  function initCompare() {
    $$("[data-compare]").forEach(fig => {
      const input = $("input", fig);
      const set = v => fig.style.setProperty("--pos", v + "%");
      input.addEventListener("input", () => set(input.value));
      set(input.value);
    });
  }

  /* ---------------- dumbbell charts ---------------- */
  const tip = document.createElement("div");
  tip.className = "tip"; tip.hidden = true;
  function showTip(card, evt, html) {
    if (tip.parentElement !== card) card.appendChild(tip);
    tip.innerHTML = html; tip.hidden = false;
    const r = card.getBoundingClientRect();
    const x = Math.min(evt.clientX - r.left + 14, r.width - 270);
    tip.style.left = Math.max(8, x) + "px"; tip.style.top = (evt.clientY - r.top + 16) + "px";
  }
  function hideTip() { tip.hidden = true; }

  const fmt = (v, d) => v == null ? "–" : d === "auto" ? (Number.isInteger(v) ? String(v) : v.toFixed(1)) : v.toFixed(d);
  const niceStep = span => { const raw = span / 4, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p; return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p; };

  /**
   * rows: [{label, a, b, note?}] (a = base, b = Shape-Bayes; null rows render as "not evaluated")
   * opts: {lower: bool, digits, unit, domain:[lo,hi]?}
   */
  const charts = new Map();
  function dumbbell(svg, rows, opts) {
    charts.set(svg, () => dumbbell(svg, rows, opts));
    // Draw at the element's real width so text stays at its CSS size on every screen.
    const W = Math.round(svg.getBoundingClientRect().width) || 540;
    const narrow = W < 420;
    const labelW = narrow ? 76 : 104, valW = narrow ? 100 : 124, rowH = 32, top = 8, axisH = 26;
    const H = top + rows.length * rowH + axisH;
    const vals = rows.flatMap(r => r.a == null ? [] : [r.a, r.b]);
    let [lo, hi] = opts.domain || [Math.min(...vals), Math.max(...vals)];
    if (!opts.domain) { const pad = (hi - lo) * 0.12 || 1; lo -= pad; hi += pad; }
    const step = niceStep(hi - lo);
    lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
    const x0 = labelW, x1 = W - valW, x = v => x0 + (v - lo) / (hi - lo) * (x1 - x0);
    let g = "";
    for (let t = lo; t <= hi + 1e-9; t += step) {
      const xx = x(t).toFixed(1);
      g += `<line class="grid" x1="${xx}" x2="${xx}" y1="${top}" y2="${top + rows.length * rowH}"/>`;
      g += `<text class="axis" x="${xx}" y="${top + rows.length * rowH + 17}" text-anchor="middle">${+t.toFixed(2)}</text>`;
    }
    rows.forEach((r, i) => {
      const cy = top + i * rowH + rowH / 2;
      g += `<rect class="hit" data-i="${i}" x="0" y="${top + i * rowH + 2}" width="${W}" height="${rowH - 4}" rx="5"/>`;
      g += `<text x="0" y="${cy + 4}" style="pointer-events:none">${r.label}</text>`;
      if (r.a == null) {
        g += `<text class="axis" x="${x0}" y="${cy + 4}" style="pointer-events:none">not evaluated</text>`;
        return;
      }
      const xa = x(r.a), xb = x(r.b);
      g += `<line class="conn" x1="${xa}" x2="${xb}" y1="${cy}" y2="${cy}" style="pointer-events:none"/>`;
      g += `<circle class="pt-base" cx="${xa}" cy="${cy}" r="5.5" style="pointer-events:none"/>`;
      g += `<circle class="pt-sb" cx="${xb}" cy="${cy}" r="6.5" style="pointer-events:none"/>`;
      g += `<text class="num" x="${W - valW + (narrow ? 44 : 60)}" y="${cy + 4}" text-anchor="end" style="pointer-events:none">${fmt(r.a, opts.digits)}</text>`;
      g += `<text class="num" x="${W - valW + (narrow ? 58 : 74)}" y="${cy + 4}" text-anchor="middle" style="pointer-events:none;fill:var(--muted)">→</text>`;
      g += `<text class="num sb" x="${W}" y="${cy + 4}" text-anchor="end" style="pointer-events:none">${fmt(r.b, opts.digits)}</text>`;
    });
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = g;
    const card = svg.closest(".chart-card");
    svg.onpointermove = e => {
      const i = e.target.dataset ? e.target.dataset.i : undefined;
      if (i == null) { hideTip(); return; }
      const r = rows[+i];
      if (r.a == null) { showTip(card, e, `<b>${r.label}</b><br>Not evaluated on this benchmark`); return; }
      const rel = (r.b - r.a) / r.a * 100;
      const change = opts.lower ? `${rel.toFixed(1)}% relative` : `${(r.b - r.a >= 0 ? "+" : "")}${(r.b - r.a).toFixed(1)} points`;
      showTip(card, e, `<b>${r.label}</b>${r.note ? ` · ${r.note}` : ""}<br>Base ${fmt(r.a, opts.digits)}${opts.unit || ""} → Shape-Bayes <b>${fmt(r.b, opts.digits)}${opts.unit || ""}</b><br>${change}`);
    };
    svg.onpointerleave = hideTip;
  }

  /* ---------------- cross-architecture block ---------------- */
  function cell(pair, d, lower) {
    if (!pair) return `<span class="na">–</span>`;
    const [a, b] = pair;
    const delta = lower ? `<span class="delta">${((b - a) / a * 100).toFixed(1)}%</span>` : "";
    return `<span class="b">${fmt(a, d)}</span><span class="arrow">→</span><span class="sb">${fmt(b, d)}</span>${delta}`;
  }
  function renderXarch(ds) {
    const rows = XARCH.map(m => ({ m, r: m.d[ds] }));
    dumbbell($("#chart-idr"), rows.map(({ m, r }) => ({ label: m.name, a: r ? r.idr[0] : null, b: r ? r.idr[1] : null, note: m.native ? "native uncertainty" : "" })),
      { lower: false, digits: "auto", unit: "%", domain: [60, 100] });
    dumbbell($("#chart-occ"), rows.map(({ m, r }) => ({ label: m.name, a: r ? r.occ[0] : null, b: r ? r.occ[1] : null, note: m.native ? "native uncertainty" : "" })),
      { lower: true, digits: 2 });
    $("#table-xarch tbody").innerHTML = rows.map(({ m, r }) => {
      const name = `<td class="m">${m.name}${m.native ? '<span class="tag-native">NATIVE</span>' : ""}</td>`;
      if (!r) return `<tr>${name}<td colspan="6" class="na" style="text-align:left">Not evaluated on ${ds}</td></tr>`;
      return `<tr>${name}<td>${cell(r.idr, "auto", false)}</td><td>${cell(r.occ, 2, true)}</td><td>${cell(r.all, 2, true)}</td>` +
        `<td><span class="sb">${fmt(r.min, 2)}</span></td><td>${cell(r.fr, 1, true)}</td><td>${cell(r.auc, 1, false)}</td></tr>`;
    }).join("");
  }
  function initXarch() {
    const tabs = $$("#xarch [data-ds]");
    tabs.forEach(t => t.addEventListener("click", () => {
      tabs.forEach(b => b.setAttribute("aria-selected", String(b === t)));
      renderXarch(t.dataset.ds);
    }));
    tabKeys(tabs);
    renderXarch("300W");
  }

  /* ---------------- other charts and tables ---------------- */
  function initStatic() {
    dumbbell($("#chart-parts"), PARTS.map(([l, a, b]) => ({ label: l, a, b })), { lower: true, digits: 1, domain: [4, 12] });
    dumbbell($("#chart-ece"), CALIB.map(([l, , e]) => ({ label: l, a: e[0], b: e[1] })), { lower: true, digits: 2, domain: [0, 8] });
    $("#calib-body").innerHTML = CALIB.map(([l, n, e]) => `<tr><td class="m">${l}</td><td>${cell(n, 2, false)}</td><td>${cell(e, 2, true)}</td></tr>`).join("");
    const maxN = 9.03, minN = 7.6;
    $("#ablation-body").innerHTML = ABLATION.map(([l, n, mn, fr, auc], i) => {
      const w = Math.round(14 + (n - minN) / (maxN - minN) * 70);
      const last = i === ABLATION.length - 1;
      return `<tr class="${last ? "ours" : ""}"><td class="${last ? "m" : ""}"><span class="lvl">${i ? "+" : ""}</span>${l}</td>` +
        `<td><span class="bar" style="width:${w}px"></span>${n.toFixed(2)}</td><td>${mn.toFixed(2)}</td><td>${fr.toFixed(2)}%</td><td>${auc.toFixed(2)}%</td></tr>`;
    }).join("");
  }

  /* ---------------- gallery tabs ---------------- */
  function tabKeys(tabs) {
    tabs.forEach((t, i) => t.addEventListener("keydown", e => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return; e.preventDefault();
      const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); n.click();
    }));
  }
  function initGallery() {
    const tabs = $$("[data-g]");
    tabs.forEach(t => t.addEventListener("click", () => {
      tabs.forEach(b => { b.setAttribute("aria-selected", String(b === t)); document.getElementById(b.dataset.g).hidden = b !== t; });
    }));
    tabKeys(tabs);
  }

  /* ---------------- lightbox ---------------- */
  function initLightbox() {
    const dlg = $("#lightbox"), img = $("img", dlg);
    if (!dlg.showModal) return;
    $$(".zoomable").forEach(el => {
      el.tabIndex = 0; el.setAttribute("role", "button");
      const open = () => { img.src = el.currentSrc || el.src; img.alt = el.alt; dlg.showModal(); };
      el.addEventListener("click", open);
      el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    $(".close", dlg).addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  }

  /* ---------------- citation ---------------- */
  function initCopy() {
    const btn = $("#copy-bib"), pre = $("#bibtex");
    btn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(pre.textContent); btn.textContent = "Copied"; }
      catch (e) { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Selected, press Ctrl+C"; }
      setTimeout(() => (btn.textContent = "Copy"), 2200);
    });
  }

  /* ---------------- hero videos ---------------- */
  function initVideos() {
    const vids = $$("video");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { vids.forEach(v => { v.removeAttribute("autoplay"); v.pause(); }); return; }
    // Play only while visible, to save battery and CPU.
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause(); }), { threshold: 0.15 });
    vids.forEach(v => io.observe(v));
  }

  function initResize() {
    if (!window.ResizeObserver) return;
    const ro = new ResizeObserver(entries => entries.forEach(e => {
      const w = Math.round(e.contentRect.width);
      if (w && Math.abs(w - (e.target._w || 0)) > 2) { e.target._w = w; const redraw = charts.get(e.target); if (redraw) redraw(); }
    }));
    charts.forEach((_, svg) => ro.observe(svg));
  }

  function init() {
    renderMath(); initTheme(); initNav(); initCompare(); initXarch(); initStatic(); initGallery(); initLightbox(); initCopy(); initVideos(); initResize();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
