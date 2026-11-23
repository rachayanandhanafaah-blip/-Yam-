// host_test.js · จำลองเบราว์เซอร์ (vm) โหลดตามลำดับของ index.html: shim.js → yam7.js ตัดที่ const PARAM → build.js → app.js
// ใช้: node host_test.js <yam7.js> · ตรวจ: โหลดได้ · หน้าแท็บ ๔ แท็บ · บันทึกดวง/ประวัติ · ลิงก์ yam:// ไม่ error · theme/fsz/refresh/menu · ไม่มี undefined/NaN
const fs = require("fs"), vm = require("vm"), path = require("path");
const dir = path.resolve(__dirname, ".."), yamPath = path.resolve(process.argv[2] || path.join(dir, "yam7.js"));
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log("✗", m); } else console.log("✓", m); };
const mkEl = id => ({ id, hidden: false, innerHTML: "", textContent: "", onclick: null, dataset: {}, style: {}, _ev: {}, addEventListener(t, f) { (this._ev[t] = this._ev[t] || []).push(f); },
  querySelector() { return null; }, querySelectorAll() { return []; }, appendChild() {}, setAttribute() {}, removeAttribute() {}, scrollTop: 0, closest() { return null; } });
const els = {}; ["dash", "boot", "sheet", "sbody", "stitle", "toast", "sclose"].forEach(i => els[i] = mkEl(i));
const htmlEl = mkEl("html"); htmlEl.attrs = {}; htmlEl.setAttribute = (k, v) => { htmlEl.attrs[k] = v; }; htmlEl.removeAttribute = k => { delete htmlEl.attrs[k]; };
const fw = { YTAB: 0, pageYOffset: 0, showTab(n) { fw.YTAB = n; }, scrollTo() {}, document: { documentElement: { scrollHeight: 1000 }, _ev: {}, addEventListener(t, f) { (fw.document._ev[t] = fw.document._ev[t] || []).push(f); } } };
els.dash.contentWindow = fw;
const vis = []; const mem = {}; const doc = { getElementById: i => els[i] || null, documentElement: htmlEl, visibilityState: "visible", addEventListener(t, f) { if (t === "visibilitychange") vis.push(f); }, createElement: () => mkEl("x"), body: mkEl("body") };
const sb = { console, setTimeout, clearTimeout, setInterval, clearInterval, Date, Math, JSON, Promise, Proxy, Symbol, Object, Array, String, Number, RegExp, Error, Map, Set, URL,
  document: doc, navigator: {}, location: { protocol: "https:", href: "https://x/", reload() {} }, localStorage: { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } },
  matchMedia: q => ({ matches: /dark/.test(q) }), innerWidth: 390, innerHeight: 844, addEventListener() {}, open() {}, confirm: () => true };
sb.Y7_TEST = true; sb.fetch = async () => ({ ok: true, text: async () => sb.__yamText }); sb.window = sb; sb.globalThis = sb; vm.createContext(sb);
sb.__inj = code => vm.runInContext(code, sb, { filename: "yam7.js(cut)" });
const run = (code, name) => vm.runInContext(code, sb, { filename: name });
const yam = fs.readFileSync(yamPath, "utf8"), k = yam.indexOf("\nconst PARAM");
ok(k > 0, "พบจุดตัด const PARAM");
(async () => { try {
  run(fs.readFileSync(path.join(dir, "shim.js"), "utf8"), "shim.js");
  try { new vm.Script(yam); ok(false, "(ข้อมูล) ไฟล์เต็มไม่ควรอ่านเป็นสคริปต์ปกติได้"); } catch (e) { ok(true, "ไฟล์เต็มอ่านเป็นสคริปต์ปกติไม่ได้ (ต้องตัดตามตัวโหลดใน index.html) · " + e.message); }
  sb.__yamText = yam; run(fs.readFileSync(path.join(dir, "loader.js"), "utf8"), "loader.js");
  run("Y7L.boot(__yamText, code => { (0, eval)(code); })".replace("(0, eval)(code)", "__inj(code)"), "boot"); 
  ok(run("typeof computeAll", "t") === "function" && run("typeof dashboardHTML", "t") === "function", "computeAll/dashboardHTML นิยามแล้ว");
  ok(/^\d+\.\d+\.\d+-[0-9a-f]{8}$/.test(sb.Y7_BUILD), "Y7_BUILD = รุ่น-แฮช: " + sb.Y7_BUILD);
  run(fs.readFileSync(path.join(dir, "app.js"), "utf8"), "app.js");
  await new Promise(r => setTimeout(r, 400));
  ok(typeof els.dash.srcdoc === "string" && els.dash.srcdoc.length > 50000, "ขึ้นหน้าแอปใน iframe (srcdoc " + (els.dash.srcdoc || "").length + ")");
  const sd = () => els.dash.srcdoc;
  ok((sd().match(/data-tab="\d"/g) || []).length === 4, "มี ๔ แท็บ");
  ok(!/undefined|NaN|\[object/.test(sd().slice(sd().indexOf("<body")).replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ")), "ไม่มี undefined/NaN");
  ok(/ฤกษ์พรหมประสิทธิ์: <b>/.test(sd()) && /เลี่ยงทิศ/.test(sd()), "แสดงฤกษ์/ทิศ จาก CSV บนเว็บ");
  ok(!/จับยามใหม่แล้ว ปิดหน้านี้/.test(sd()), "webFix ตัดข้อความ Close");
  ok(/บันทึก|history|ประวัติ/.test(sd()), "มีส่วนประวัติ");
  ok(Object.keys(mem).some(x => /yam7fs:/.test(x)), "บันทึกผลลงที่เก็บ (localStorage) แล้ว");
  const click = href => { const h = (fw.document._ev.click || [])[0]; if (!h) return false; let prevented = false; h({ target: { closest: () => ({ getAttribute: () => href }) }, preventDefault() { prevented = true; }, stopPropagation() {} }); return prevented; };
  els.dash.onload && els.dash.onload();
  ok((fw.document._ev.click || []).length >= 1, "ผูกตัวจับคลิกลิงก์ใน iframe");
  const th = (m, exp) => { const p = click("yam://theme?m=" + m); const s = JSON.parse(mem["yam7fs:" + run("F_SETTINGS", "t")] || "{}"); return p && s.theme === exp; };
  for (const [m, e] of [["light", "light"], ["dark", "dark"], ["auto", "auto"], ["zzz", "auto"]]) { const before = sd(); const r = th(m, e); await new Promise(r2 => setTimeout(r2, 30)); ok(r, "yam://theme?m=" + m + " บันทึก theme=" + e); }
  click("yam://theme?m=light"); els.dash.onload && els.dash.onload();
  ok(/<style id="ltcss" media="all">/.test(sd()) && htmlEl.attrs["data-theme"] === "light", "โหมดสว่าง → media=all และ data-theme=light");
  click("yam://theme?m=dark"); ok(/<style id="ltcss" media="not all">/.test(sd()) && htmlEl.attrs["data-theme"] === "dark", "โหมดมืด → media=not all");
  click("yam://fsz?l=2"); ok(/<body class="fs2">/.test(sd()), "yam://fsz?l=2 → body.fs2");
  const t0 = sd(); click("yam://menu"); ok(els.sheet.hidden === false && /โหมดสี/.test(els.sbody.innerHTML) && /ขนาดตัวอักษร/.test(els.sbody.innerHTML), "เมนูเปิด มีโหมดสี + ขนาดอักษร");
  click("yam://t2mode"); await new Promise(r => setTimeout(r, 200)); ok(sd().length > 50000, "yam://t2mode จับใหม่ไม่ error");
  click("yam://refresh"); await new Promise(r => setTimeout(r, 200)); ok(sd().length > 50000, "yam://refresh จับใหม่ไม่ error");
  // ตรวจรุ่นใหม่: ไฟล์เหมือนเดิม = ไม่เตือน · ไฟล์เปลี่ยน = เตือน "มีรุ่นใหม่"
  els.toast.innerHTML = ""; vis.forEach(f => f()); await new Promise(r => setTimeout(r, 50));
  ok(!/มีรุ่นใหม่/.test(els.toast.innerHTML), "ไฟล์ yam7.js ไม่เปลี่ยน → ไม่เตือนรุ่นใหม่");
  sb.__yamText = yam + "\n// แก้เล็กน้อย"; vis.forEach(f => f()); await new Promise(r => setTimeout(r, 50));
  ok(/มีรุ่นใหม่/.test(els.toast.innerHTML), "ไฟล์ yam7.js เปลี่ยน → เตือน มีรุ่นใหม่ของแอป");
  const hrefs = [...new Set((sd().match(/href="[^"]*"/g) || []).map(x => x.slice(6, -1)))]; const unk = hrefs.filter(h => !/^(#|yam:\/\/(refresh|t2mode|fsz|theme|menu))/.test(h)); ok(unk.length === 0, "ลิงก์ทั้งหมดรู้จัก " + (unk.length ? JSON.stringify(unk) : ""));
} catch (e) { bad++; console.log("ERR", e.stack); }
console.log(bad ? "❌ host_test ไม่ผ่าน " + bad : "✅ host_test ผ่านทั้งหมด"); process.exitCode = bad ? 1 : 0; })();
