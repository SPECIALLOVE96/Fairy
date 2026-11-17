/**
 * 把 assets/ 里的图 + pet.config.json 打进 lib/client.js。
 *
 *   node build.mjs
 *
 * 规则：
 *  - assets/character.{png,webp,jpg,jpeg,svg} 存在 → 用图片（内联为 data URI）
 *  - assets/character-blink.* 也存在 → 做眨眼（两帧切换）
 *  - 都没有 → 用内置手绘 SVG 鱼
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const MIME = { png: "image/png", webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml" };
const EXTS = Object.keys(MIME);

function findAsset(base) {
  for (const ext of EXTS) {
    const p = path.join(root, "assets", `${base}.${ext}`);
    if (fs.existsSync(p)) {
      const buf = fs.readFileSync(p);
      return { path: p, uri: `data:${MIME[ext]};base64,${buf.toString("base64")}`, bytes: buf.length };
    }
  }
  return null;
}

const config = JSON.parse(read("pet.config.json"));

const main = findAsset("character");
const blink = findAsset("character-blink");

let art;
if (main) {
  art = { mode: "img", src: main.uri, blinkSrc: blink ? blink.uri : null };
  console.log(`art  : 图片 ${path.basename(main.path)} (${(main.bytes / 1024).toFixed(0)} KB)`);
  if (blink) console.log(`blink: ${path.basename(blink.path)} (${(blink.bytes / 1024).toFixed(0)} KB)`);
  else console.log("blink: 无（不做眨眼；放一张 character-blink.* 就有了）");
} else {
  art = { mode: "svg" };
  console.log("art  : 内置手绘 SVG 鱼（assets/character.* 不存在）");
}

const template = read("src/client.template.js");
if (!template.includes("__CONFIG__") || !template.includes("__ART__")) {
  throw new Error("模板缺少 __CONFIG__ / __ART__ 占位符");
}

const out = template
  .replace("__CONFIG__", JSON.stringify(config))
  .replace("__ART__", JSON.stringify(art));

// 输出名可覆盖：插件被 DSH 占用时（硬链接锁定）改写成 client.v2.js
const outName = process.env.FAIRY_OUT || "client.js";
const outPath = path.join(root, "lib", outName);
fs.writeFileSync(outPath, out);
console.log(`wrote: lib/${outName} (${(out.length / 1024).toFixed(1)} KB)`);
