// Yam7 PWA · ชั้นแทน Scriptable API ในเบราว์เซอร์ (yam7.js คือไฟล์แอปเดียวกับ Scriptable ไม่ต้องแก้)
// FileManager → localStorage · ปฏิทินในเครื่องไม่มีในเว็บ (ใช้ตารางจันทรคติในตัวแทน) · วิเจ็ต/คำสั่งลัดไม่มีในเว็บ
(function (g) {
  "use strict";
  g.Y7_WEB = true;   // yam7.js เห็นค่านี้แล้วไม่เข้าทางเข้า Scriptable (v7.9.6)
  const PFX = "yam7fs:", ls = (() => { try { const k = PFX + "t"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return localStorage; } catch (e) { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; } })();
  const fm = {
    documentsDirectory: () => "/docs", libraryDirectory: () => "/lib", temporaryDirectory: () => "/tmp",
    joinPath: (a, b) => String(a).replace(/\/+$/, "") + "/" + String(b).replace(/^\/+/, ""),
    fileExists: p => ls.getItem(PFX + p) !== null || ls.getItem(PFX + "dir:" + p) !== null,
    isDirectory: p => ls.getItem(PFX + "dir:" + p) !== null,
    createDirectory: p => ls.setItem(PFX + "dir:" + p, "1"),
    readString: p => ls.getItem(PFX + p),
    writeString: (p, s) => { try { ls.setItem(PFX + p, String(s)); } catch (e) { console.warn("บันทึกไม่ได้", e); } },
    remove: p => { ls.removeItem(PFX + p); ls.removeItem(PFX + "dir:" + p); },
    listContents: () => [], fileName: (p, ext) => { const n = String(p).split("/").pop(); return ext ? n : n.replace(/\.[^.]*$/, ""); },
    isFileStoredIniCloud: () => false, downloadFileFromiCloud: async () => {}
  };
  g.FileManager = { local: () => fm, iCloud: () => fm };
  const noCal = async () => { throw new Error("เว็บแอปเข้าถึงปฏิทินในเครื่องไม่ได้"); };
  g.Calendar = { forEvents: async () => [], presentPicker: noCal, findOrCreate: noCal, forEventsByTitle: noCal, defaultForEvents: noCal };
  g.CalendarEvent = { between: async () => [] };
  g.Device = {
    isUsingDarkAppearance: () => !(g.matchMedia && g.matchMedia("(prefers-color-scheme: light)").matches),
    screenSize: () => ({ width: g.innerWidth || 390, height: g.innerHeight || 844 }), locale: () => "th"
  };
  g.Timer = { schedule: (ms, rep, fn) => { const id = rep ? setInterval(fn, ms) : setTimeout(fn, ms); return { invalidate: () => (rep ? clearInterval(id) : clearTimeout(id)) }; } };
  g.config = { runsInWidget: false, runsWithSiri: false, runsInApp: true, widgetFamily: null };
  g.args = { queryParameters: {}, shortcutParameter: null, widgetParameter: null };
  g.Script = { complete() {}, setWidget() {}, setShortcutOutput() {}, name: () => "yam7" };
  g.URLScheme = { forRunningScript: () => (g.location ? g.location.href : "") };
  // วัตถุของวิเจ็ต (ไม่ได้ใช้ในเว็บ · กันโค้ดส่วนวิเจ็ตพังถ้าถูกเรียก)
  const any = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => "" : any()), apply: () => any(), construct: () => any() });
  ["Font", "Color", "Size", "Point", "Rect", "LinearGradient", "DrawContext", "ListWidget", "Data", "WebView", "Alert"].forEach(k => { if (!(k in g)) g[k] = any(); });
})(typeof window !== "undefined" ? window : globalThis);
