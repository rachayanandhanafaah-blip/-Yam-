// Yam7 PWA · ตัวควบคุมหน้าเว็บ: แสดง dashboardHTML ใน iframe · รับลิงก์ yam:// · เมนูแบบเว็บ · ติดตั้ง/อัปเดต
(function (g) {
  "use strict";
  // ข้อความที่ใช้กับ Scriptable เท่านั้น → ปรับให้เข้ากับเว็บ (ไม่แตะผลคำนวณ)
  const webFix = h => h
    .replace(/<div class="lnk" style="margin-top:-4px">จับยามใหม่แล้ว ปิดหน้านี้ \(Close\)[^<]*<\/div>/, "")
    .replace("⚙️ เมนู / ตั้งค่าปฏิทิน (แตะแล้วกด Close)", "⚙️ เมนู / ตั้งค่า");
  const st = () => readJSON(F_SETTINGS) || {};
  // v7.9.6 โหมดมืด/สว่าง: ตัวหน้าเว็บ (หน้าโหลด เมนู) ตามค่าเดียวกับหน้าแอปใน iframe
  const applyTheme = () => { try { const t = themeSet(); if (t === "auto") g.document.documentElement.removeAttribute("data-theme"); else g.document.documentElement.setAttribute("data-theme", t); } catch (e) {} };
  const setSt = o => writeJSON(F_SETTINGS, Object.assign(st(), o));
  const escH = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  g.Y7W = { webFix };
  const D = g.document, $ = id => D.getElementById(id);
  if (!D || !$("dash")) return;   // โหมดทดสอบใน node

  applyTheme();
  const frame = $("dash"), boot = $("boot"), sheet = $("sheet"), sbody = $("sbody"), stitle = $("stitle"), toast = $("toast");
  let cur = null, installEvt = null, busy = false, upd = false;

  const curTab = () => { try { return +frame.contentWindow.YTAB || 0; } catch (e) { return 0; } };
  function render(snap, tab, keep) {
    let y = 0, h = 1;
    if (keep) { try { const w = frame.contentWindow; y = w.pageYOffset || 0; h = w.document.documentElement.scrollHeight || 1; } catch (e) {} }
    cur = snap;
    frame.onload = () => {
      const w = frame.contentWindow, d = w.document;
      d.addEventListener("click", onFrameClick, true);
      if (tab) { try { w.showTab(tab); } catch (e) {} }
      if (keep) { const h2 = d.documentElement.scrollHeight || h; w.scrollTo(0, Math.round(y * h2 / h)); }
      boot.hidden = true;
    };
    frame.srcdoc = webFix(dashboardHTML(snap));
  }
  async function refresh(when, src) {
    if (busy) return; busy = true;
    const tab = cur ? curTab() : 0;
    try { render(await computeAll(when || new Date(), { source: src || "app" }), tab); }
    catch (e) { fail(e); }
    finally { busy = false; }
  }
  function fail(e) {
    boot.hidden = false;
    boot.innerHTML = `<div class="bx"><b>เกิดข้อผิดพลาด</b><pre>${escH((e && (e.stack || e.message)) || e)}</pre><button id="rt">ลองใหม่</button></div>`;
    $("rt").onclick = () => location.reload();
  }
  function onFrameClick(ev) {
    const a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null; if (!a) return;
    const u = a.getAttribute("href") || "";
    if (u.indexOf("yam://") !== 0) { if (/^https?:/.test(u)) { ev.preventDefault(); g.open(u, "_blank", "noopener"); } return; }
    ev.preventDefault(); ev.stopPropagation();
    if (u.indexOf("yam://refresh") === 0) refresh();
    else if (u.indexOf("yam://t2mode") === 0) { setSt({ t2Mode: normT2M(st().t2Mode) === "24" ? "12" : "24" }); refresh(); }
    else if (u.indexOf("yam://fsz") === 0) { const m = /[?&]l=(\d)/.exec(u); setSt({ fontLevel: normFS(m ? m[1] : 1) }); if (cur) render(cur, curTab(), true); }
    else if (u.indexOf("yam://theme") === 0) { const m = /[?&]m=(\w+)/.exec(u); setSt({ theme: normTM(m ? m[1] : "auto") }); applyTheme(); if (cur) render(cur, curTab(), true); }
    else if (u.indexOf("yam://menu") === 0) openMenu();
  }

  // ---------- เมนู ----------
  const openSheet = (title, html) => { stitle.textContent = title; sbody.innerHTML = html; sheet.hidden = false; sbody.scrollTop = 0; };
  const closeSheet = () => { sheet.hidden = true; };
  $("sclose").onclick = closeSheet;
  sheet.addEventListener("click", e => { if (e.target === sheet) closeSheet(); });
  const showText = (title, text, share) => {
    text = thaiAll(text); title = thaiAll(title);   // v3.9.0 เลขไทยทุกจุด
    openSheet(title, `${share ? `<div class="row"><button data-a="copy">📋 คัดลอก</button>${navigator.share ? `<button data-a="share">📤 แชร์</button>` : ""}</div>` : ""}<pre class="txt">${escH(text)}</pre>`);
    const b = sbody.querySelector('[data-a="copy"]'), s = sbody.querySelector('[data-a="share"]');
    if (b) b.onclick = async () => { try { await navigator.clipboard.writeText(text); say("คัดลอกแล้ว"); } catch (e) { say("คัดลอกไม่ได้"); } };
    if (s) s.onclick = () => navigator.share({ title: APP, text }).catch(() => {});
  };
  const pad = n => String(n).padStart(2, "0");
  const localIso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  function openMenu() {
    const s = st(), t2 = normT2M(s.t2Mode), fl = fsSet();
    const seg = (key, opts, curV) => `<div class="seg">${opts.map(([v, l]) => `<button data-${key}="${v}" class="${String(v) === String(curV) ? "on" : ""}">${l}</button>`).join("")}</div>`;
    openSheet(`🔮 ${APP} ${thaiAll("v" + VERSION)}`, `
<button class="it" data-a="now">🔮 จับยามตอนนี้</button>
<div class="grp"><div class="lb">✍️ จับยามตามเวลาที่เลือก</div><div class="row"><input type="datetime-local" id="mt" value="${localIso(new Date())}"><button data-a="manual">จับยาม</button></div></div>
<button class="it" data-a="full">📄 ข้อความเต็มของผลล่าสุด (คัดลอก/แชร์)</button>
<div class="grp"><div class="lb">🕐 ตั้งยามสัตตเลขปริเฉท</div>${seg("t2", [["12", T2MODE_TH["12"]], ["24", T2MODE_TH["24"]]], t2)}</div>
<div class="grp"><div class="lb">🔠 ขนาดตัวอักษร</div>${seg("fs", FS_TH.map((x, i) => [i, x]), fl)}</div>
<div class="grp"><div class="lb">🌗 โหมดสี</div>${seg("th", [["auto", "ตามระบบ"], ["light", "สว่าง"], ["dark", "มืด"]], themeSet())}</div>
${installEvt ? `<button class="it" data-a="install">📲 ติดตั้งเป็นแอปบนหน้าจอหลัก</button>` : ""}
<button class="it" data-a="lunar">📖 ตรวจจันทรคติ</button>
<button class="it" data-a="clear">🗑 ล้างประวัติการจับยาม</button>
<button class="it" data-a="about">ℹ️ เกี่ยวกับเว็บแอปนี้</button>`);
    sbody.querySelectorAll("[data-t2]").forEach(b => b.onclick = () => { setSt({ t2Mode: b.dataset.t2 }); closeSheet(); refresh(); say(`สัตตเลขปริเฉทใช้${T2MODE_TH[b.dataset.t2]}`); });
    sbody.querySelectorAll("[data-fs]").forEach(b => b.onclick = () => { setSt({ fontLevel: +b.dataset.fs }); closeSheet(); if (cur) render(cur, curTab(), true); });
    sbody.querySelectorAll("[data-th]").forEach(b => b.onclick = () => { setSt({ theme: normTM(b.dataset.th) }); applyTheme(); closeSheet(); if (cur) render(cur, curTab(), true); });
    const act = {
      now: () => { closeSheet(); refresh(); },
      manual: () => { const v = $("mt").value, d = v ? new Date(v) : null; if (!d || isNaN(d)) return say("เลือกวันเวลาก่อน"); closeSheet(); refresh(d, "manual-time"); },
      full: () => { const s2 = readJSON(F_SNAPSHOT); showText("📄 ข้อความเต็ม", s2 && s2.display ? s2.display.full : "ยังไม่มีผล", true); },
      install: async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; closeSheet(); },
      lunar: async () => showText("📖 ตรวจจันทรคติ", await lunarProbeText()),
      clear: () => { if (!confirm("ล้างประวัติการจับยามในเครื่องนี้?")) return; const s2 = readJSON(F_SNAPSHOT); if (s2) { s2.history = []; writeJSON(F_SNAPSHOT, s2); if (cur) { cur.history = []; render(cur, curTab(), true); } } closeSheet(); say("ล้างประวัติแล้ว"); },
      about: () => showText("ℹ️ เกี่ยวกับ", [
        `${APP} ${verLine()} · เว็บแอป`,
        `${CREDIT.line} · © ${CREDIT.year}`,
        `ออฟไลน์: ${navigator.serviceWorker && navigator.serviceWorker.controller ? "พร้อม (เก็บไฟล์ในเครื่องแล้ว)" : "ยังไม่พร้อม (เปิดออนไลน์ครั้งแรกให้ครบก่อน)"}`,
        `จันทรคติ: ตารางในตัว ${LUN_RANGE}`,
        "", "ต่างจากแอป Scriptable:",
        "• ไม่มีวิเจ็ตและคำสั่งลัด · ใช้ “ข้อความเต็ม” คัดลอกหรือแชร์แทน",
        "• อ่านปฏิทินในเครื่องไม่ได้ ฤกษ์พรหมประสิทธิ์และทิศพระกาฬจรจึงใช้ตาราง CSV ในตัว (ป้าย อัตถรจนา)",
        "• ตั้งค่าและประวัติเก็บในเบราว์เซอร์ของเครื่องนี้เท่านั้น",
        "", "สูตรและคะแนนเป็นชุดเดียวกับ Scriptable รุ่นเดียวกัน"].join("\n"))
    };
    sbody.querySelectorAll("[data-a]").forEach(b => { const f = act[b.dataset.a]; if (f) b.onclick = f; });
  }
  let tt = null;
  function say(msg, btn, fn) {
    toast.innerHTML = `<span>${escH(msg)}</span>${btn ? `<button>${escH(btn)}</button>` : ""}`;
    toast.hidden = false; clearTimeout(tt);
    if (btn) toast.querySelector("button").onclick = () => { toast.hidden = true; fn(); };
    else tt = setTimeout(() => { toast.hidden = true; }, 2500);
  }

  // ---------- กลับมาเปิดแอป: ถ้าเลยช่วงยามแล้ว จับยามใหม่ (แบบเดียวกับเปิดสคริปต์ใหม่) ----------
  D.addEventListener("visibilitychange", () => {
    if (D.visibilityState === "visible" && cur && sheet.hidden && Date.now() > new Date(cur.validUntil).getTime()) refresh();
  });

  // ---------- ติดตั้ง + ออฟไลน์ + อัปเดต ----------
  g.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; });
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").then(reg => {
      const ask = w => say("มีรุ่นใหม่ของแอป", "อัปเดต", () => { upd = true; w.postMessage("skipWaiting"); });
      if (reg.waiting && navigator.serviceWorker.controller) ask(reg.waiting);
      reg.addEventListener("updatefound", () => { const w = reg.installing; if (w) w.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) ask(w); }); });
      D.addEventListener("visibilitychange", () => { if (D.visibilityState === "visible") reg.update().catch(() => {}); });
    }).catch(() => {});
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (upd) { upd = false; location.reload(); } });
  }

  // ---------- ตรวจรุ่นใหม่ของ yam7.js (แทนที่ไฟล์บน GitHub แล้วเว็บจะเห็นเองเมื่อออนไลน์ ไม่ต้องแก้ build/sw) ----------
  let chk = false;
  async function checkUpdate() {
    if (chk || !g.Y7L || !g.Y7_HASH) return; chk = true;
    try { const r = await fetch("yam7.js", { cache: "no-cache" }); if (r.ok) { const h = g.Y7L.hash(await r.text()); if (h !== g.Y7_HASH) say("มีรุ่นใหม่ของแอป", "อัปเดต", () => location.reload()); } } catch (e) {}
    chk = false;
  }
  setTimeout(checkUpdate, 4000);
  D.addEventListener("visibilitychange", () => { if (D.visibilityState === "visible") checkUpdate(); });

  refresh();
})(window);
