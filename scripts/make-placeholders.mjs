// Generates clearly-marked placeholder visuals for work that hasn't been supplied yet.
// Replace the files in public/work/** with real screenshots, screens, posters and reel covers,
// then point content/*.json at them. Run: npm run placeholders
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../public/work/", import.meta.url).pathname;
for (const d of ["apps", "web", "posters", "reels", "ai"]) mkdirSync(OUT + d, { recursive: true });

const palettes = [
  ["#04052B", "#1A1680", "#6A55C8", "#B9A8E8"],
  ["#0B1B4A", "#3A63B8", "#6A55C8", "#DDD7F2"],
  ["#120C2E", "#46416B", "#B9A8E8", "#F4F4F2"],
  ["#04052B", "#2B2470", "#3A63B8", "#9FB6F0"],
  ["#1A1680", "#6A55C8", "#B9A8E8", "#FFFFFF"],
  ["#0B0B0F", "#1F1E27", "#6A55C8", "#B9AEE6"],
];

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (a) => a[Math.floor(rnd() * a.length)];

const tag = (w, h, text, dark = true) => {
  const fs = Math.round(w * 0.032);
  const pad = Math.round(w * 0.05);
  const tw = Math.round(text.length * fs * 0.62 + fs * 1.4);
  return `<g font-family="ui-monospace,Menlo,monospace" font-size="${fs}" letter-spacing="1">
    <rect x="${pad}" y="${h - pad - fs * 2}" width="${tw}" height="${fs * 2}" rx="${fs}" fill="${dark ? "rgba(255,255,255,.14)" : "rgba(4,5,43,.08)"}" stroke="${dark ? "rgba(255,255,255,.35)" : "rgba(4,5,43,.25)"}" stroke-dasharray="4 4"/>
    <text x="${pad + fs * 0.7}" y="${h - pad - fs * 0.62}" fill="${dark ? "#fff" : "#04052B"}">${text}</text></g>`;
};

const grad = (id, p, angle = 135) =>
  `<linearGradient id="${id}" gradientTransform="rotate(${angle - 90} .5 .5)"><stop offset="0" stop-color="${p[0]}"/><stop offset=".55" stop-color="${p[1]}"/><stop offset=".85" stop-color="${p[2]}"/><stop offset="1" stop-color="${p[3]}"/></linearGradient>`;

const icon = (x, y, s, fill = "#fff", op = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s / 329})" opacity="${op}"><path transform="translate(-68.48 -69.44)" fill="${fill}" d="M357.45 119.52A144.84 144.84 0 1 0 150.55 322.27L185.84 286.97A94.93 94.93 0 1 1 322.15 154.82ZM184.68 288.05L287.17 185.56L322.43 220.81L255.19 288.05L324.35 357.22L289.1 392.47Z"/></g>`;

const svg = (w, h, body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${defs}</defs>${body}</svg>`;

// ---------- App screen (9:19.5) ----------
function appScreen(i, tall = false) {
  const w = 390, h = tall ? 1690 : 845;
  const p = palettes[i % palettes.length];
  const light = i % 3 !== 0;
  const bg = light ? "#F4F4F2" : p[0];
  const ink = light ? "#1A1A1A" : "#F2F2F4";
  const soft = light ? "#E4E2EE" : "rgba(255,255,255,.08)";
  let b = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  b += `<rect x="24" y="70" width="140" height="18" rx="9" fill="${ink}" opacity=".85"/><circle cx="${w - 44}" cy="78" r="18" fill="${p[2]}"/>`;
  b += `<rect x="24" y="104" width="220" height="12" rx="6" fill="${ink}" opacity=".35"/>`;
  b += `<rect x="24" y="140" width="${w - 48}" height="190" rx="24" fill="url(#g)"/>`;
  b += icon(w - 120, 170, 70, "#fff", 0.35);
  b += `<rect x="48" y="270" width="120" height="14" rx="7" fill="#fff" opacity=".9"/><rect x="48" y="294" width="80" height="10" rx="5" fill="#fff" opacity=".55"/>`;
  let y = 356;
  while (y < h - 140) {
    const kind = Math.floor(rnd() * 3);
    if (kind === 0) {
      b += `<rect x="24" y="${y}" width="${(w - 60) / 2}" height="120" rx="20" fill="${soft}"/><rect x="${w / 2 + 6}" y="${y}" width="${(w - 60) / 2}" height="120" rx="20" fill="${soft}"/>`;
      b += `<circle cx="56" cy="${y + 36}" r="14" fill="${p[2]}" opacity=".8"/><rect x="40" y="${y + 70}" width="90" height="12" rx="6" fill="${ink}" opacity=".6"/>`;
      b += `<circle cx="${w / 2 + 38}" cy="${y + 36}" r="14" fill="${p[1]}" opacity=".8"/><rect x="${w / 2 + 22}" y="${y + 70}" width="80" height="12" rx="6" fill="${ink}" opacity=".6"/>`;
      y += 140;
    } else if (kind === 1) {
      for (let r = 0; r < 3; r++) {
        b += `<rect x="24" y="${y}" width="${w - 48}" height="64" rx="16" fill="${soft}"/><circle cx="56" cy="${y + 32}" r="16" fill="${pick(p.slice(1))}"/>`;
        b += `<rect x="84" y="${y + 20}" width="${120 + rnd() * 80}" height="10" rx="5" fill="${ink}" opacity=".7"/><rect x="84" y="${y + 38}" width="${60 + rnd() * 60}" height="8" rx="4" fill="${ink}" opacity=".35"/>`;
        y += 76;
      }
      y += 10;
    } else {
      b += `<rect x="24" y="${y}" width="${w - 48}" height="150" rx="20" fill="${soft}"/>`;
      let px = 48;
      for (let k = 0; k < 8; k++) {
        const bh = 30 + rnd() * 80;
        b += `<rect x="${px}" y="${y + 125 - bh}" width="22" height="${bh}" rx="6" fill="${k % 2 ? p[2] : p[1]}" opacity=".85"/>`;
        px += 38;
      }
      y += 170;
    }
  }
  b += `<rect x="0" y="${h - 96}" width="${w}" height="96" fill="${light ? "#fff" : "rgba(0,0,0,.25)"}"/>`;
  for (let k = 0; k < 4; k++) b += `<circle cx="${60 + k * 90}" cy="${h - 52}" r="10" fill="${k === 0 ? p[2] : ink}" opacity="${k === 0 ? 1 : 0.3}"/>`;
  b += tag(w, h - 96, "PLACEHOLDER · APP SCREEN", !light);
  return svg(w, h, b, grad("g", p));
}

// ---------- Website full page (1440 wide) ----------
function webPage(i) {
  const w = 1440, h = 4200;
  const p = palettes[(i + 1) % palettes.length];
  let b = `<rect width="${w}" height="${h}" fill="#FFFFFF"/>`;
  b += `<rect width="${w}" height="88" fill="#fff"/><rect x="64" y="32" width="160" height="24" rx="12" fill="${p[0]}"/>`;
  for (let k = 0; k < 4; k++) b += `<rect x="${760 + k * 120}" y="38" width="80" height="12" rx="6" fill="#1A1A1A" opacity=".5"/>`;
  b += `<rect x="1240" y="26" width="136" height="36" rx="18" fill="${p[2]}"/>`;
  b += `<rect y="88" width="${w}" height="820" fill="url(#g)"/>`;
  b += `<rect x="120" y="300" width="720" height="64" rx="12" fill="#fff"/><rect x="120" y="384" width="560" height="64" rx="12" fill="#fff" opacity=".9"/>`;
  b += `<rect x="120" y="490" width="480" height="18" rx="9" fill="#fff" opacity=".6"/><rect x="120" y="522" width="400" height="18" rx="9" fill="#fff" opacity=".6"/>`;
  b += `<rect x="120" y="590" width="200" height="56" rx="28" fill="#fff"/><rect x="340" y="590" width="200" height="56" rx="28" fill="none" stroke="#fff" stroke-width="2"/>`;
  b += `<rect x="900" y="220" width="420" height="560" rx="28" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.4)"/>` + icon(1010, 400, 200, "#fff", 0.5);
  b += tag(w, 908, "PLACEHOLDER · WEBSITE SCREENSHOT", true);
  let y = 1000;
  b += `<rect x="120" y="${y}" width="420" height="40" rx="10" fill="#1A1A1A"/>`;
  y += 100;
  for (let k = 0; k < 3; k++) {
    b += `<rect x="${120 + k * 410}" y="${y}" width="380" height="440" rx="24" fill="#F4F4F2"/><rect x="${150 + k * 410}" y="${y + 30}" width="320" height="220" rx="16" fill="${p[(k % 3) + 1]}" opacity=".85"/>`;
    b += `<rect x="${150 + k * 410}" y="${y + 280}" width="220" height="20" rx="10" fill="#1A1A1A"/><rect x="${150 + k * 410}" y="${y + 320}" width="300" height="12" rx="6" fill="#1A1A1A" opacity=".4"/><rect x="${150 + k * 410}" y="${y + 344}" width="260" height="12" rx="6" fill="#1A1A1A" opacity=".4"/>`;
  }
  y += 560;
  b += `<rect y="${y}" width="${w}" height="700" fill="${p[0]}"/>`;
  b += `<rect x="120" y="${y + 120}" width="600" height="48" rx="10" fill="#fff"/><rect x="120" y="${y + 200}" width="480" height="16" rx="8" fill="#fff" opacity=".5"/>`;
  for (let k = 0; k < 4; k++) b += `<rect x="${120 + k * 310}" y="${y + 320}" width="280" height="260" rx="20" fill="rgba(255,255,255,.08)"/><circle cx="${180 + k * 310}" cy="${y + 380}" r="28" fill="${p[2]}"/>`;
  y += 800;
  for (let r = 0; r < 3; r++) {
    const left = r % 2 === 0;
    b += `<rect x="${left ? 120 : 760}" y="${y}" width="560" height="380" rx="24" fill="${p[(r % 3) + 1]}" opacity=".75"/>`;
    b += `<rect x="${left ? 760 : 120}" y="${y + 100}" width="440" height="36" rx="10" fill="#1A1A1A"/><rect x="${left ? 760 : 120}" y="${y + 160}" width="520" height="14" rx="7" fill="#1A1A1A" opacity=".4"/><rect x="${left ? 760 : 120}" y="${y + 186}" width="480" height="14" rx="7" fill="#1A1A1A" opacity=".4"/>`;
    y += 460;
  }
  b += `<rect y="${h - 380}" width="${w}" height="380" fill="#111114"/><rect x="120" y="${h - 280}" width="340" height="28" rx="8" fill="#fff"/>`;
  return svg(w, h, b, grad("g", p, 120));
}

// ---------- Poster ----------
function poster(i, ratio) {
  const w = 1000, h = ratio === "9:16" ? 1778 : ratio === "1:1" ? 1000 : 1250;
  const p = palettes[(i + 2) % palettes.length];
  const kind = i % 3;
  let b = `<rect width="${w}" height="${h}" fill="url(#g)"/>`;
  if (kind === 0) {
    b += `<circle cx="${w * 0.62}" cy="${h * 0.42}" r="${w * 0.32}" fill="${p[3]}" opacity=".35"/><circle cx="${w * 0.62}" cy="${h * 0.42}" r="${w * 0.2}" fill="#fff" opacity=".85"/>`;
    b += `<rect x="${w * 0.52}" y="${h * 0.3}" width="${w * 0.2}" height="${w * 0.26}" rx="24" fill="${p[1]}"/>`;
  } else if (kind === 1) {
    for (let k = 0; k < 6; k++) b += `<rect x="${-100 + k * 200}" y="${h * 0.1 + k * 60}" width="160" height="${h * 0.6}" rx="80" fill="#fff" opacity="${0.06 + k * 0.04}" transform="rotate(-18 ${w / 2} ${h / 2})"/>`;
    b += icon(w * 0.3, h * 0.25, w * 0.4, "#fff", 0.9);
  } else {
    b += `<rect x="${w * 0.1}" y="${h * 0.1}" width="${w * 0.8}" height="${h * 0.55}" rx="40" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.5)" stroke-width="3"/>`;
    b += `<polygon points="${w * 0.2},${h * 0.6} ${w * 0.45},${h * 0.3} ${w * 0.62},${h * 0.48} ${w * 0.72},${h * 0.38} ${w * 0.8},${h * 0.6}" fill="${p[3]}" opacity=".8"/>`;
  }
  b += `<rect x="${w * 0.08}" y="${h * 0.74}" width="${w * 0.6}" height="${w * 0.07}" rx="12" fill="#fff"/><rect x="${w * 0.08}" y="${h * 0.74 + w * 0.1}" width="${w * 0.42}" height="${w * 0.035}" rx="8" fill="#fff" opacity=".6"/>`;
  b += tag(w, h, `PLACEHOLDER · POSTER ${ratio}`, true);
  return svg(w, h, b, grad("g", p, 150 + i * 20));
}

// ---------- Reel / AI video cover (9:16) ----------
function reel(i, ai) {
  const w = 540, h = 960;
  const p = palettes[(i + 3) % palettes.length];
  let b = `<rect width="${w}" height="${h}" fill="url(#g)"/>`;
  b += `<circle cx="${w / 2}" cy="${h * 0.42}" r="${w * 0.3}" fill="#fff" opacity=".1"/><circle cx="${w / 2}" cy="${h * 0.42}" r="56" fill="#fff" opacity=".9"/>`;
  b += `<polygon points="${w / 2 - 16},${h * 0.42 - 26} ${w / 2 - 16},${h * 0.42 + 26} ${w / 2 + 28},${h * 0.42}" fill="${p[1]}"/>`;
  b += `<rect x="36" y="${h * 0.7}" width="${w * 0.62}" height="26" rx="8" fill="#fff"/><rect x="36" y="${h * 0.7 + 42}" width="${w * 0.44}" height="16" rx="6" fill="#fff" opacity=".6"/>`;
  b += tag(w, h, ai ? "PLACEHOLDER · AI VIDEO" : "PLACEHOLDER · REEL", true);
  return svg(w, h, b, grad("g", p, 160 + i * 23));
}

const write = (path, s) => writeFileSync(OUT + path, s);
for (let i = 1; i <= 12; i++) write(`apps/placeholder-app-${i}.svg`, appScreen(i));
for (let i = 1; i <= 3; i++) write(`apps/placeholder-tall-${i}.svg`, appScreen(i + 20, true));
for (let i = 1; i <= 6; i++) write(`web/placeholder-web-${i}.svg`, webPage(i));
const ratios = ["4:5", "9:16", "1:1", "4:5", "4:5", "1:1", "9:16", "4:5", "1:1", "4:5", "9:16", "4:5"];
ratios.forEach((r, i) => write(`posters/placeholder-poster-${i + 1}.svg`, poster(i, r)));
for (let i = 1; i <= 8; i++) write(`reels/placeholder-reel-${i}.svg`, reel(i, false));
for (let i = 1; i <= 4; i++) write(`ai/placeholder-ai-${i}.svg`, reel(i + 10, true));
console.log("placeholders written to", OUT);
