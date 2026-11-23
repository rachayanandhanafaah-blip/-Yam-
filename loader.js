// Yam7 PWA · ตัวโหลด yam7.js (ไฟล์เดียวกับ Scriptable · แทนที่ไฟล์นี้บน GitHub ได้เลยเมื่อมีรุ่นใหม่ ไม่ต้องแก้ไฟล์อื่น)
// yam7.js ท้ายไฟล์มีทางเข้า Scriptable ที่ใช้ await ระดับบนสุด เบราว์เซอร์อ่านเป็นสคริปต์ปกติไม่ได้
// → โหลดเป็นข้อความ · ตัดที่บรรทัด "const PARAM" (แบบเดียวกับ tests/run.py) · รันส่วนบน · ตั้งรหัสรุ่น Y7_BUILD = VERSION + แฮชของไฟล์ · โหลด app.js
(function (g) {
  "use strict";
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, "0"); };
  const cut = t => { const k = t.indexOf("\nconst PARAM"); return k < 0 ? t : t.slice(0, t.indexOf("\n", k + 1) + 1); };
  const boot = (t, inject) => {
    inject(cut(t));
    if (typeof computeAll !== "function") throw new Error("yam7.js โหลดแล้วแต่ไม่พบ computeAll (ไฟล์ไม่ครบหรือมี syntax error)");
    g.Y7_HASH = hash(t); g.Y7_BUILD = (typeof VERSION === "string" ? VERSION : "?") + "-" + g.Y7_HASH;
  };
  g.Y7L = { hash, cut, boot };
  if (g.Y7_TEST) return;   // โหมดทดสอบ (host_test.js) ไม่เริ่มโหลดเอง
  const D = g.document;
  const add = src => new Promise((ok, no) => { const s = D.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => no(new Error("โหลด " + src + " ไม่ได้")); D.body.appendChild(s); });
  function fail(e) {
    const b = D.getElementById("boot"); b.hidden = false; b.innerHTML = "";
    const bx = D.createElement("div"); bx.className = "bx";
    const h = D.createElement("b"); h.textContent = "เกิดข้อผิดพลาด";
    const p = D.createElement("pre"); p.textContent = String((e && (e.stack || e.message)) || e);
    const r = D.createElement("button"); r.textContent = "ลองใหม่"; r.onclick = () => g.location.reload();
    bx.appendChild(h); bx.appendChild(p); bx.appendChild(r); b.appendChild(bx);
  }
  g.fetch("yam7.js", { cache: "no-cache" }).then(r => { if (!r.ok) throw new Error("yam7.js HTTP " + r.status); return r.text(); }).then(t => {
    boot(t, code => { const s = D.createElement("script"); s.text = code; D.body.appendChild(s); });
    return add("app.js");
  }).catch(fail);
})(window);
