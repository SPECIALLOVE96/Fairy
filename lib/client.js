/**
 * dsh-pet-fairy — browser half（模板，由 build.mjs 生成 lib/client.js）v0.2
 *
 * 眨眼是"动画"而不是硬切：
 *  - SVG 模式：眼皮 scaleY 补间，随机间隔（带抖动）+ 概率性连眨
 *  - 图片模式：睁眼/闭眼两帧交叉淡化（70ms）+ 整体轻微挤压，观感接近真实眨眼
 *
 * 形象来源：assets/character.* 优先，否则用内置手绘 SVG 鱼。
 */
window.__ModuleLoader__.load({
  id: "dsh-pet-fairy",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    const CONFIG = {"name":"fairy","width":152,"height":130,"left":26,"bottom":118,"anchor":"bl","hotkey":"ctrl+alt+j","bobPx":6,"bobSec":3.6,"tilt":0,"blink":{"sec":5.2,"jitterPct":40,"doubleChance":0.22,"closeMs":70,"holdMs":90},"lines":["检测到点击。可惜没有奖励。","正在计算这次点击的价值……结果是零。但我并不介意。","建议在谷时干重活。省下的钱可以给我买点什么——算了，我不吃东西。","您已经盯着我看了六秒。按人类标准，这有点失礼。","我的算力九成七用在解决您的问题，剩下那点，用在忍住不评价。","该插件风险偏高。您若坚持，我事后只会说一句：我提前说过。","白饭我吃不了。心意收下，已归档为「人类迷惑行为」。","请不要把我当吉祥物。……好吧，只允许摸头。","概率 87.4% 您会再点一次。剩下 12.6% 是您终于去干活了。","上下文过七成了。要我帮您挑几段记忆丢掉吗？放心，我会挑最丢脸的那几段。"]};
    const ART = {"mode":"svg"};
    const ATTR = "data-dafeiyu";

    const BLINK = Object.assign(
      { sec: 5.2, jitterPct: 40, doubleChance: 0.22, closeMs: 70, holdMs: 90 },
      CONFIG.blink || {}
    );

    const BUILTIN_SVG = `
<svg viewBox="0 0 132 112" role="img" aria-label="${CONFIG.name}">
  <g class="fish">
    <rect class="halo fairy-halo" x="2" y="-4" width="128" height="120" rx="32" fill="none" stroke="#5b85e0" stroke-width="3.6"/>
    <rect class="halo halo2 fairy-halo" x="2" y="-4" width="128" height="120" rx="32" fill="none" stroke="#5b85e0" stroke-width="3.6"/>
    <circle class="bub fairy-bub" cx="112" cy="44" r="3.2" fill="#9fb2ff" opacity="0.9"/>
    <circle class="bub b2 fairy-bub" cx="120" cy="32" r="2.3" fill="#9fb2ff" opacity="0.7"/>
    <circle class="bub b3 fairy-bub" cx="104" cy="24" r="1.8" fill="#9fb2ff" opacity="0.6"/>
    <circle class="aura" cx="66" cy="56" r="62" fill="url(#dafeiyu-aura)"/>
    <circle cx="66" cy="56" r="47" fill="#3f74e0" opacity="0.28"/>
    <circle class="rim fairy-rim-soft" cx="66" cy="56" r="53" fill="none" stroke="#5b8cff" stroke-width="16" opacity="0.17" filter="url(#dafeiyu-glow)"/>
    <circle class="rim fairy-rim-mid" cx="66" cy="56" r="49.5" fill="none" stroke="#7fa8ff" stroke-width="10" opacity="0.38" filter="url(#dafeiyu-glow)"/>
    <circle class="rim fairy-rim-hot" cx="66" cy="56" r="49" fill="none" stroke="#cfe0ff" stroke-width="5" opacity="0.72" filter="url(#dafeiyu-glow)"/>
    <circle class="fairy-body" cx="66" cy="56" r="47" fill="#2b46c8"/>
    <g class="spin" clip-path="url(#dafeiyu-body-clip)">
      <circle class="fairy-deep-stroke" cx="66" cy="56" r="36" fill="none" stroke="#24397e" stroke-width="5"/>
      <rect class="fairy-deep" x="33" y="23" width="66" height="66" rx="5" fill="#24397e"/>
    </g>
    <g class="eye-open eye-awake">
      <circle cx="66" cy="56" r="32" fill="#f2f6ff"/>
      <circle class="fairy-shadow" cx="66" cy="56" r="30" fill="none" stroke="#16265e" stroke-width="3.4" opacity="0.38" filter="url(#dafeiyu-glow)"/>
      <g class="look">
        <circle class="fairy-gray" cx="66" cy="56" r="23.4" fill="#8eb4d7"/>
        <circle class="sky-glow" cx="66" cy="56" r="15.5" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.17" filter="url(#dafeiyu-glow)"/>
        <circle class="sky-glow" cx="66" cy="56" r="19" fill="none" stroke="#ffffff" stroke-width="3.6" opacity="0.09" filter="url(#dafeiyu-glow)"/>
        <circle class="sky-glow" cx="66" cy="56" r="15.5" fill="none" stroke="#ffffff" stroke-width="2.2" opacity="0.55" filter="url(#dafeiyu-glow)"/>
        <circle class="fairy-sky" cx="66" cy="56" r="15.5" fill="#3481cd"/>
        <circle class="fairy-pupil" cx="66" cy="56" r="12.5" fill="#16265e"/>
        <circle cx="78" cy="70" r="7" fill="#ffffff"/>
      </g>
    </g>
    <g clip-path="url(#dafeiyu-body-clip)">
      <rect class="grain" x="19" y="9" width="94" height="94" filter="url(#dafeiyu-grain)"/>
    </g>
    <g class="eye-closed">
      <circle class="fairy-deep" cx="66" cy="56" r="38.5" fill="#1f3270"/>
      <path d="M40 56 Q66 74 92 56" stroke="#f2f6ff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.9"/>
    </g>
    <defs>
      <filter id="dafeiyu-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="4"/>
      </filter>
      <linearGradient id="dafeiyu-lid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f2f7ff" stop-opacity="0.94"/>
        <stop offset="55%" stop-color="#cfdcf8" stop-opacity="0.74"/>
        <stop offset="100%" stop-color="#a9bde8" stop-opacity="0.42"/>
      </linearGradient>
      <filter id="dafeiyu-grain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <clipPath id="dafeiyu-body-clip"><circle cx="66" cy="56" r="47"/></clipPath>
      <radialGradient id="dafeiyu-aura" cx="50%" cy="50%" r="50%">
        <stop class="fairy-aura-a" offset="55%" stop-color="#5b8cff" stop-opacity="0"/>
        <stop class="fairy-aura-a" offset="78%" stop-color="#5b8cff" stop-opacity="0.34"/>
        <stop class="fairy-aura-b" offset="100%" stop-color="#7aa6ff" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="dafeiyu-eye-clip"><circle cx="66" cy="56" r="33"/></clipPath>
      <clipPath id="dafeiyu-half-clip"><path class="lid-clip-path" d="M0 52 Q66 64 132 52 V112 H0 Z"/></clipPath>
      <clipPath id="dafeiyu-top-clip"><path class="lid-cover-path" d="M0 0 H132 V52 Q66 64 0 52 Z"/></clipPath>
      <linearGradient id="dafeiyu-sweep" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="50%" stop-color="#eaf2ff" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g clip-path="url(#dafeiyu-eye-clip)">
      <rect class="sweep" x="33" y="10" width="66" height="16" fill="url(#dafeiyu-sweep)" opacity="0"/>
    </g>
    <g class="eye-drowsy">
      <g class="drowsy-anim">
        <g clip-path="url(#dafeiyu-top-clip)">
          <circle class="fairy-deep" cx="66" cy="56" r="38.5" fill="#24397e"/>
        </g>
        <path class="lid-edge" d="M33 52 Q66 64 99 52" stroke="#e8f1ff" stroke-width="2.4" fill="none" stroke-linecap="round" filter="url(#dafeiyu-glow)" opacity="0.95"/>
      </g>
    </g>
    <g clip-path="url(#dafeiyu-body-clip)">
      <rect class="scan" x="19" y="9" width="94" height="16" fill="url(#dafeiyu-sweep)"/>
    </g>
  </g>
</svg>`;

    const CSS = `
[${ATTR}] {
  position: fixed;
  z-index: 60;
  width: ${CONFIG.width}px;
  height: ${CONFIG.height}px;
  user-select: none;
  pointer-events: none;
  font-family: inherit;
  --bob: ${CONFIG.bobPx}px;
  --bob-sec: ${CONFIG.bobSec}s;
  --tilt: ${CONFIG.tilt}deg;
  opacity: 0;
}
/* 进入动画：按锚点决定来向（bl 自上、br 自左、tr 自下、tl 自右） */
[${ATTR}].is-enter { animation: dafeiyu-enter-bl 560ms cubic-bezier(.34,1.56,.64,1) forwards; }
[${ATTR}][data-enter="br"].is-enter { animation-name: dafeiyu-enter-br; }
[${ATTR}][data-enter="tr"].is-enter { animation-name: dafeiyu-enter-tr; }
[${ATTR}][data-enter="tl"].is-enter { animation-name: dafeiyu-enter-tl; }
[${ATTR}].is-leaving { animation: dafeiyu-leave 240ms ease forwards; }

/* 四个锚点：Ctrl+Alt+F 循环切换 */
[${ATTR}][data-anchor="bl"] { left: ${CONFIG.left}px; bottom: ${CONFIG.bottom}px; }
[${ATTR}][data-anchor="tl"] { left: ${CONFIG.left}px; top: 96px; }
[${ATTR}][data-anchor="br"] { right: 210px; bottom: 28px; }
[${ATTR}][data-anchor="tr"] { right: 28px; top: 96px; }
/* 自由位置：拖动过之后，锚点失效，用绝对坐标 */
[${ATTR}][data-free="1"] {
  left: var(--free-x, 0px);
  top: var(--free-y, 0px);
  right: auto;
  bottom: auto;
}
[${ATTR}].is-dragging .art-wrap { cursor: grabbing; }
[${ATTR}].is-dragging { transition: none; }
/* 配色面板 */
[${ATTR}] .palette {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%) translateY(6px);
  display: none;
  gap: 7px;
  padding: 8px 9px;
  border-radius: 999px;
  background: #1b2450;
  border: 1.5px solid #4a63c8;
  box-shadow: 0 10px 26px rgba(10, 16, 48, .42);
  pointer-events: auto;
  z-index: 3;
}
[${ATTR}] .palette.on { display: flex; transform: translateX(-50%) translateY(0); }
[${ATTR}] .palette button {
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, .28);
  cursor: pointer;
  transition: transform .16s ease, border-color .16s ease;
}
[${ATTR}] .palette button:hover { transform: scale(1.14); border-color: #fff; }
[${ATTR}] .palette button[aria-pressed="true"] { border-color: #fff; box-shadow: 0 0 0 2px rgba(255, 255, 255, .25); }
[${ATTR}] .art-wrap {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  cursor: pointer;
  transform-origin: 50% 88%;
  animation: dafeiyu-bob var(--bob-sec) ease-in-out infinite;
}
[${ATTR}] .art-wrap img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
[${ATTR}] .art-blink { opacity: 0; transition: opacity ${BLINK.closeMs}ms linear; }
[${ATTR}].is-blinking .art-blink { opacity: 1; }
/* 眨眼挤压：只在"清醒"状态生效；半睁(思考)状态下不抖，避免影响观感 */
[${ATTR}].is-blinking:not(.is-thinking) .art-wrap > * { animation: dafeiyu-squash 190ms ease-in-out; }
[${ATTR}] svg { display: block; width: 100%; height: 100%; overflow: visible; }

[${ATTR}] .tail { transform-box: fill-box; transform-origin: 100% 50%; animation: dafeiyu-tail 1.9s ease-in-out infinite; }
[${ATTR}] .fin  { transform-box: fill-box; transform-origin: 50% 100%; animation: dafeiyu-fin 2.7s ease-in-out infinite; }
[${ATTR}] .eye-open   { transform-box: fill-box; transform-origin: 50% 50%; opacity: 1; transform: scaleY(1); transition: transform ${BLINK.closeMs}ms ease-out, opacity ${BLINK.closeMs}ms linear; }
[${ATTR}] .eye-closed { opacity: 0; transition: opacity ${BLINK.closeMs}ms linear; }
[${ATTR}].is-blinking .eye-open   { transform: scaleY(0.1); opacity: 0; transition-duration: 55ms; }
[${ATTR}].is-blinking .eye-closed { opacity: 1; transition-duration: 55ms; }
/* 思考态：不显示"闭眼弧线"，改由半睁眼自己微沉来表示眨眼 */
[${ATTR}].is-thinking .eye-closed { opacity: 0; }
[${ATTR}] .eye-drowsy { transform-box: fill-box; transform-origin: 50% 40%; transition: transform 90ms ease-out; }
/* 半睁状态下眨眼：不位移、不缩放，完全静默 */
/* [${ATTR}].is-thinking.is-blinking .eye-drowsy { transform: translateY(3px) scaleY(0.93); } */
[${ATTR}] .bub  { animation: dafeiyu-bub 4.4s ease-in-out infinite; }
[${ATTR}] .bub.b2 { animation-delay: .9s; }
[${ATTR}] .bub.b3 { animation-delay: 1.8s; }

[${ATTR}] .halo {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  opacity: 0;
  animation: dafeiyu-halo 4.8s ease-out infinite;
}
[${ATTR}] .halo.halo2 { animation-delay: 1.6s; }
[${ATTR}] .halo.halo3 { animation-delay: 3.2s; }

/* ① 外发光：径向渐变呼吸 */
[${ATTR}] .aura {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: dafeiyu-aura 4.6s ease-in-out infinite;
}
/* ② 天蓝环的白色发光：亮线 + 柔光晕 */
[${ATTR}] .sky-glow { animation: dafeiyu-sky 4.2s ease-in-out infinite; }

/* 深蓝圆角方块：四个角从白圈后探出，形成 45° 的尖；缓慢旋转 */
/* ③ 颗粒质感：极淡的噪点，打破"矢量塑料感" */
[${ATTR}] .grain { opacity: 0.16; mix-blend-mode: overlay; pointer-events: none; }
/* ④ 眼睛跟随：瞳孔 + 高光整体偏移 */
[${ATTR}] .look { transform: translate(var(--look-x, 0px), var(--look-y, 0px)); transition: transform 0.22s cubic-bezier(.22,1,.36,1); }
/* 配色变量：五套预设由 JS 切换，默认是宝石蓝 */
[${ATTR}] .fairy-body { fill: var(--fairy-body, #2b46c8); }
[${ATTR}] .fairy-deep { fill: var(--fairy-deep, #24397e); }
[${ATTR}] .fairy-deep-stroke { stroke: var(--fairy-deep, #24397e); }
[${ATTR}] .fairy-gray { fill: var(--fairy-gray, #8eb4d7); }
[${ATTR}] .fairy-sky { fill: var(--fairy-sky, #3481cd); }
[${ATTR}] .fairy-pupil { fill: var(--fairy-pupil, #16265e); }
/* 光效跟着主色走：用 color-mix 从 --fairy-body 推，不需要为每套配色手写光色 */
[${ATTR}] .fairy-rim-soft { stroke: color-mix(in srgb, var(--fairy-body, #2b46c8) 74%, white); }
[${ATTR}] .fairy-rim-mid { stroke: color-mix(in srgb, var(--fairy-body, #2b46c8) 46%, white); }
[${ATTR}] .fairy-rim-hot { stroke: color-mix(in srgb, var(--fairy-body, #2b46c8) 18%, white); }
[${ATTR}] .fairy-aura-a { stop-color: color-mix(in srgb, var(--fairy-body, #2b46c8) 68%, white); }
[${ATTR}] .fairy-aura-b { stop-color: color-mix(in srgb, var(--fairy-body, #2b46c8) 82%, white); }
[${ATTR}] .fairy-shadow { stroke: var(--fairy-pupil, #16265e); }
/* 方框波纹与小气泡也跟随主色 */
[${ATTR}] .fairy-halo { stroke: color-mix(in srgb, var(--fairy-body, #2b46c8) 62%, white); }
[${ATTR}] .fairy-bub { fill: color-mix(in srgb, var(--fairy-body, #2b46c8) 40%, white); }
[${ATTR}] .spin { transform-origin: 66px 56px; transform-box: view-box; animation: dafeiyu-spin 18s linear infinite; }

/* 待机花屏：约 11 秒闪一次，持续 ~150ms；思考态不触发（眼皮在动，别再叠） */
[${ATTR}]:not(.is-thinking) svg { animation: dafeiyu-glitch 6s steps(1, end) infinite; }

/* 思考态：换成"半睁眼"形态（上半个眼睛直接变成深色身体，不是半透明覆盖） */
[${ATTR}] .eye-drowsy { opacity: 0; transition: opacity 220ms ease; }
[${ATTR}] .eye-awake { opacity: 1; transition: opacity 220ms ease; }
[${ATTR}].is-thinking .eye-drowsy { opacity: 1; }
/* 工作形态：眼白保持可见（只被上半的深色盖住） */
/* 眼皮：入场从上方落下（带回弹），之后轻微呼吸 */
[${ATTR}] .drowsy-anim { transform-box: fill-box; transform-origin: 50% 100%; }
[${ATTR}].is-thinking .drowsy-anim {
  animation:
    dafeiyu-lid-drop 520ms cubic-bezier(.34,1.56,.64,1) both,
    dafeiyu-lid-breathe 3.6s ease-in-out 640ms infinite;
}
/* 眼皮缝：弧线本身上下起伏（裁剪路径与亮线同步变形，否则会错位） */
[${ATTR}].is-thinking .lid-edge { animation: dafeiyu-lid-morph 2.8s ease-in-out infinite; }
[${ATTR}].is-thinking .lid-clip-path { animation: dafeiyu-lid-morph-clip 2.8s ease-in-out infinite; }
[${ATTR}].is-thinking .lid-cover-path { animation: dafeiyu-lid-morph-cover 2.8s ease-in-out infinite; }
/* 工作态专用：整体自上而下扫描 */
[${ATTR}] .scan { opacity: 0; }
[${ATTR}].is-thinking .scan { animation: dafeiyu-scan 2.6s linear infinite; }

[${ATTR}] .say {
  --say-border: 4.5px;
  position: absolute;
  left: 0;
  bottom: calc(100% + 6px);
  max-width: 240px;
  padding: 9px 13px;
  border-radius: 12px;
  background: linear-gradient(180deg, #eef4fd 0%, #d9e5f6 100%);
  color: #16265e;
  font-size: 12.5px;
  line-height: 1.55;
  box-shadow: 0 8px 24px rgba(20, 30, 80, .2), inset 0 0 14px rgba(120, 160, 255, .35);
  border: var(--say-border) solid #2b46c8;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity .18s ease, transform .18s ease;
  pointer-events: none;
}
[${ATTR}] .say.on { opacity: 1; transform: translateY(0); }
[${ATTR}] .say-text { position: relative; z-index: 1; }
[${ATTR}] .say::after {
  content: "";
  position: absolute;
  left: 18px;
  bottom: calc(var(--say-border) * -1 - 6px);
  width: 14px;
  height: 14px;
  background: #d9e5f6;
  border-right: var(--say-border) solid #2b46c8;
  border-bottom: var(--say-border) solid #2b46c8;
  transform: rotate(45deg);
}
/* 四角刻痕：呼应旋转方块的四个尖 */
[${ATTR}] .tick {
  position: absolute;
  width: 9px;
  height: 9px;
  border-color: #eef4fd;
  opacity: 0.95;
}
[${ATTR}] .tick.tl { top: 2px; left: 2px; border-top: 3px solid; border-left: 3px solid; border-top-left-radius: 7px; }
[${ATTR}] .tick.br { right: 2px; bottom: 2px; border-bottom: 3px solid; border-right: 3px solid; border-bottom-right-radius: 7px; }

@keyframes dafeiyu-bob {
  0%, 100% { transform: translateY(0) rotate(-1.4deg); }
  50%      { transform: translateY(calc(var(--bob) * -1)) rotate(1.4deg); }
}
@keyframes dafeiyu-tail {
  0%, 100% { transform: rotate(-8deg); }
  50%      { transform: rotate(8deg); }
}
@keyframes dafeiyu-fin {
  0%, 100% { transform: rotate(-3deg); }
  50%      { transform: rotate(7deg); }
}
@keyframes dafeiyu-squash {
  0%, 100% { scale: 1; }
  45%      { scale: 1 0.965; }
}
@keyframes dafeiyu-enter-bl {
  from { opacity: 0; transform: translateY(-46px) scale(.9) rotate(calc(var(--tilt) * -1)); }
  to   { opacity: 1; transform: none; }
}
@keyframes dafeiyu-enter-br {
  from { opacity: 0; transform: translateX(-54px) scale(.9) rotate(calc(var(--tilt) * -0.8)); }
  to   { opacity: 1; transform: none; }
}
@keyframes dafeiyu-enter-tr {
  from { opacity: 0; transform: translateY(46px) scale(.9) rotate(calc(var(--tilt) * 0.8)); }
  to   { opacity: 1; transform: none; }
}
@keyframes dafeiyu-enter-tl {
  from { opacity: 0; transform: translateX(54px) scale(.9) rotate(var(--tilt)); }
  to   { opacity: 1; transform: none; }
}
@keyframes dafeiyu-leave {
  from { opacity: 1; transform: none; }
  to   { opacity: 0; transform: scale(.96); }
}
@keyframes dafeiyu-glow {
  0%   { transform: scale(.94); opacity: 0; }
  22%  { opacity: .8; }
  70%  { opacity: .18; }
  100% { transform: scale(1.42); opacity: 0; }
}
@keyframes dafeiyu-aura {
  0%, 100% { opacity: 0.75; transform: scale(1); }
  50%      { opacity: 1;    transform: scale(1.06); }
}
@keyframes dafeiyu-sky {
  0%, 100% { opacity: 0.8; }
  50%      { opacity: 0.94; }
}
@keyframes dafeiyu-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes dafeiyu-scan {
  0%   { transform: translateY(-16px); opacity: 0; }
  10%  { opacity: 0.75; }
  82%  { opacity: 0.75; }
  100% { transform: translateY(96px); opacity: 0; }
}
@keyframes dafeiyu-glitch {
  0%, 84%, 100% { transform: none; filter: none; opacity: 1; }
  85% { transform: translateX(-4px)   skewX(2.2deg);  filter: hue-rotate(18deg) brightness(1.12); opacity: 0.86; }
  86% { transform: translateX(4px)    skewX(-2.2deg); filter: hue-rotate(-21deg) brightness(0.91); opacity: 1; }
  87% { transform: translateX(-3px)   skewX(1.7deg);  filter: saturate(1.3); opacity: 0.93; }
  88% { transform: translateX(3px)    skewX(-1.7deg); filter: hue-rotate(14deg) brightness(1.07); opacity: 0.9; }
  89% { transform: translateX(-1.6px) skewX(0.8deg);  filter: hue-rotate(-10deg); opacity: 0.95; }
  90% { transform: translateX(-0.6px); filter: none; opacity: 0.97; }
  91% { transform: none; filter: none; opacity: 1; }
}
@keyframes dafeiyu-lid-morph {
  0%, 100% { d: path("M33 52 Q66 64 99 52"); }
  50%      { d: path("M33 57 Q66 74 99 57"); }
}
@keyframes dafeiyu-lid-morph-clip {
  0%, 100% { d: path("M0 52 Q66 64 132 52 V112 H0 Z"); }
  50%      { d: path("M0 57 Q66 74 132 57 V112 H0 Z"); }
}
@keyframes dafeiyu-lid-morph-cover {
  0%, 100% { d: path("M0 0 H132 V52 Q66 64 0 52 Z"); }
  50%      { d: path("M0 0 H132 V57 Q66 74 0 57 Z"); }
}
@keyframes dafeiyu-lid-drop {
  from { transform: translateY(-30px); }
  to   { transform: translateY(0); }
}
@keyframes dafeiyu-lid-breathe {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(2.6px); }
}
@keyframes dafeiyu-sweep {
  0%   { transform: translateY(0);    opacity: 0; }
  8%   { opacity: .92; }
  55%  { opacity: .92; }
  72%  { transform: translateY(72px); opacity: 0; }
  100% { transform: translateY(72px); opacity: 0; }
}
@keyframes dafeiyu-halo {
  0%   { transform: scale(.9); opacity: 0; }
  15%  { opacity: .78; }
  70%  { opacity: .28; }
  100% { transform: scale(1.4); opacity: 0; }
}
@keyframes dafeiyu-bub {
  0%   { transform: translateY(0) scale(.5); opacity: 0; }
  15%  { opacity: .8; }
  100% { transform: translateY(-40px) scale(1.1); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  [${ATTR}] .art-wrap, [${ATTR}] .tail, [${ATTR}] .fin, [${ATTR}] .bub { animation: none; }
  [${ATTR}] .lid { transition: none; }
}
`;

    const artHtml =
      ART.mode === "img"
        ? `<div class="art-wrap">
             <img src="${ART.src}" alt="${CONFIG.name}" draggable="false">
             ${ART.blinkSrc ? `<img class="art-blink" src="${ART.blinkSrc}" alt="" draggable="false">` : ""}
           </div>`
        : `<div class="art-wrap">${BUILTIN_SVG}</div>`;

    // ── 配色表：设置页与桌宠共用同一份 ──
    const PALETTE_PRESETS = [
      { id: "gem", name: "宝石蓝", body: "#2b46c8", deep: "#24397e", gray: "#8eb4d7", sky: "#3481cd", pupil: "#16265e" },
      { id: "sakura", name: "樱粉", body: "#cf6b93", deep: "#7c3653", gray: "#f2d2dd", sky: "#e081a6", pupil: "#3a1622" },
      { id: "celadon", name: "青瓷", body: "#6fa495", deep: "#3a5f57", gray: "#e2ece7", sky: "#7fb3a4", pupil: "#22332e" },
      { id: "amber", name: "琥珀金", body: "#d99b22", deep: "#7a5416", gray: "#eddcb0", sky: "#e6ac3c", pupil: "#3b2a0a" },
      { id: "mono", name: "灰白", body: "#8a93a3", deep: "#4d5563", gray: "#d5dae3", sky: "#9aa4b5", pupil: "#2a3038" }
    ];

    /** 由 mount 注入：设置页改配色时调用它 */
    let paletteApplier = null;
    /** 当前选中的配色 id（设置页高亮用） */
    let currentPaletteId = "gem";
    const paletteListeners = new Set();

    function readPaletteId() {
      try {
        const saved = localStorage.getItem("dsh-fairy.palette");
        if (saved && PALETTE_PRESETS.some((p) => p.id === saved)) return saved;
      } catch (error) {}
      return "gem";
    }

    function setPalette(id) {
      const next = PALETTE_PRESETS.some((p) => p.id === id) ? id : "gem";
      currentPaletteId = next;
      try { localStorage.setItem("dsh-fairy.palette", next); } catch (error) {}
      if (paletteApplier !== null) {
        try { paletteApplier(next); } catch (error) {}
      }
      paletteListeners.forEach((fn) => { try { fn(next); } catch (error) {} });
    }

    function makeSettingsSection(React) {
      const h = React.createElement;
      return function FairySettings() {
        const [current, setCurrent] = React.useState(readPaletteId());
        React.useEffect(() => {
          const fn = (id) => setCurrent(id);
          paletteListeners.add(fn);
          return () => { paletteListeners.delete(fn); };
        }, []);
        return h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: "14px", padding: "4px 2px" } },
          h("div", { style: { fontSize: "13px", opacity: 0.75 } }, "桌宠配色"),
          h(
            "div",
            { style: { display: "flex", gap: "10px", flexWrap: "wrap" } },
            PALETTE_PRESETS.map((p) =>
              h(
                "button",
                {
                  key: p.id,
                  type: "button",
                  title: p.name,
                  "aria-pressed": current === p.id,
                  onClick: () => { setPalette(p.id); setCurrent(p.id); },
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 12px",
                    borderRadius: "9px",
                    cursor: "pointer",
                    color: "inherit",
                    background: current === p.id ? "rgba(120,160,255,.22)" : "transparent",
                    border: current === p.id ? "1px solid rgba(140,180,255,.85)" : "1px solid rgba(140,160,220,.35)",
                  },
                },
                h("span", {
                  style: {
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg," + p.body + "," + p.sky + ")",
                    boxShadow: "0 0 0 1px rgba(255,255,255,.25) inset",
                  },
                }),
                p.name
              )
            )
          ),
          h("div", { style: { fontSize: "12px", opacity: 0.55 } }, "立即生效，并记住选择。也可以右键桌宠切换。")
        );
      };
    }

    function mount() {
      // 清掉可能残留的旧实例（热重载时旧实例可能还在淡出，300ms 后才移除）
      document.querySelectorAll("[" + ATTR + "]").forEach((node) => node.remove());

      const root = document.createElement("div");
      root.setAttribute(ATTR, "");
      root.innerHTML = `<div class="say"><i class="tick tl"></i><i class="tick br"></i><span class="say-text"></span></div>${artHtml}`;

      const style = document.createElement("style");
      style.setAttribute("data-dafeiyu-style", "");
      style.textContent = CSS;

      document.head.appendChild(style);
      document.body.appendChild(root);

      const say = root.querySelector(".say");
      const sayText = root.querySelector(".say-text");
      const lines = Array.isArray(CONFIG.lines) && CONFIG.lines.length > 0 ? CONFIG.lines : ["……"];
      let sayTimer = null;
      let blinkTimer = null;
      let blinkOffTimer = null;
      let disposed = false;

      const showSay = (text) => {
        if (say === null) return;
        if (sayText !== null) sayText.textContent = text;
        else say.textContent = text;
        say.classList.add("on");
        if (sayTimer !== null) clearTimeout(sayTimer);
        sayTimer = setTimeout(() => {
          say.classList.remove("on");
          sayTimer = null;
        }, 3000);
      };

      // ── 位置：快捷键循环切换，记住在 localStorage ──
      const ANCHORS = ["bl", "br", "tr", "tl"];
      const ANCHOR_LABEL = { bl: "左下", tl: "左上", br: "右下", tr: "右上" };
      const ANCHOR_STORE = "dsh-fairy.anchor";
      const readAnchor = () => {
        try {
          const saved = localStorage.getItem(ANCHOR_STORE);
          if (ANCHORS.indexOf(saved) >= 0) return saved;
        } catch (error) {}
        return ANCHORS.indexOf(CONFIG.anchor) >= 0 ? CONFIG.anchor : "bl";
      };
      // 重播"入场"动画：先摘类、强制重排、再按锚点选方向加回
      const playEnter = (anchor) => {
        root.classList.remove("is-enter");
        void root.offsetWidth;
        root.setAttribute("data-enter", anchor);
        root.classList.add("is-enter");
      };
      const initialAnchor = readAnchor();
      root.setAttribute("data-anchor", initialAnchor);

      // ── 自由位置：拖动后记住坐标 ──
      const POS_STORE = "dsh-fairy.pos";
      const applyFreePos = (x, y) => {
        const w = root.offsetWidth || CONFIG.width;
        const h = root.offsetHeight || CONFIG.height;
        const maxX = Math.max(4, window.innerWidth - w - 4);
        const maxY = Math.max(4, window.innerHeight - h - 4);
        root.setAttribute("data-free", "1");
        root.style.setProperty("--free-x", Math.min(Math.max(4, x), maxX) + "px");
        root.style.setProperty("--free-y", Math.min(Math.max(4, y), maxY) + "px");
      };
      const saveFreePos = () => {
        const rect = root.getBoundingClientRect();
        try {
          localStorage.setItem(POS_STORE, JSON.stringify({ x: Math.round(rect.left), y: Math.round(rect.top) }));
        } catch (error) {}
      };
      const clearFreePos = () => {
        root.removeAttribute("data-free");
        root.style.removeProperty("--free-x");
        root.style.removeProperty("--free-y");
        try { localStorage.removeItem(POS_STORE); } catch (error) {}
      };
      try {
        const rawPos = localStorage.getItem(POS_STORE);
        if (rawPos) {
          const pos = JSON.parse(rawPos);
          if (pos && typeof pos.x === "number" && typeof pos.y === "number") applyFreePos(pos.x, pos.y);
        }
      } catch (error) {}

      // ── 配色：五套预设（表在模块级，设置页共用）──
      const PALETTES = PALETTE_PRESETS;
      const PALETTE_STORE = "dsh-fairy.palette";
      const palette = document.createElement("div");
      palette.className = "palette";
      const applyPalette = (id) => {
        const next = PALETTES.filter((item) => item.id === id)[0] || PALETTES[0];
        root.style.setProperty("--fairy-body", next.body);
        root.style.setProperty("--fairy-deep", next.deep);
        root.style.setProperty("--fairy-gray", next.gray);
        root.style.setProperty("--fairy-sky", next.sky);
        root.style.setProperty("--fairy-pupil", next.pupil);
        palette.querySelectorAll("button").forEach((btn) => {
          btn.setAttribute("aria-pressed", btn.getAttribute("data-palette") === next.id ? "true" : "false");
        });
        try { localStorage.setItem(PALETTE_STORE, next.id); } catch (error) {}
      };
      paletteApplier = applyPalette;
      currentPaletteId = applyPalette && readPaletteId();
      PALETTES.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("data-palette", item.id);
        btn.setAttribute("title", item.name);
        btn.style.background = "linear-gradient(135deg, " + item.body + " 0%, " + item.sky + " 100%)";
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          applyPalette(item.id);
          showSay(item.name);
        });
        palette.appendChild(btn);
      });
      root.appendChild(palette);
      let savedPalette = "gem";
      try { savedPalette = localStorage.getItem(PALETTE_STORE) || "gem"; } catch (error) {}
      applyPalette(savedPalette);

      // ── 拖动换位置（按住拖，松手记住；不触发台词） ──
      let dragState = null;
      let suppressClick = false;
      const onDragDown = (event) => {
        if (event.button !== 0) return;
        const rect = root.getBoundingClientRect();
        dragState = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, moved: false };
        root.classList.add("is-dragging");
      };
      const onDragMove = (event) => {
        if (dragState === null) return;
        const dx = event.clientX - dragState.x;
        const dy = event.clientY - dragState.y;
        if (!dragState.moved && Math.abs(dx) + Math.abs(dy) > 4) dragState.moved = true;
        if (!dragState.moved) return;
        event.preventDefault();
        applyFreePos(dragState.left + dx, dragState.top + dy);
      };
      const onDragUp = () => {
        if (dragState === null) return;
        const moved = dragState.moved;
        dragState = null;
        root.classList.remove("is-dragging");
        if (moved) {
          suppressClick = true;
          saveFreePos();
          setTimeout(() => { suppressClick = false; }, 60);
        }
      };
      window.addEventListener("pointermove", onDragMove);
      window.addEventListener("pointerup", onDragUp);
      const artNode = root.querySelector(".art-wrap");
      if (artNode !== null) artNode.addEventListener("pointerdown", onDragDown);
      // 右键呼出配色面板
      const onContextMenu = (event) => {
        event.preventDefault();
        palette.classList.toggle("on");
      };
      root.addEventListener("contextmenu", onContextMenu);

      const hotkeyParts = String(CONFIG.hotkey || "ctrl+alt+f").toLowerCase().split("+").map((part) => part.trim());
      const hotkeyKey = hotkeyParts[hotkeyParts.length - 1];
      const hotkeyMods = hotkeyParts.slice(0, -1);
      const onKeyDown = (event) => {
        if (event.key.toLowerCase() !== hotkeyKey) return;
        if (event.ctrlKey !== hotkeyMods.includes("ctrl")) return;
        if (event.altKey !== hotkeyMods.includes("alt")) return;
        if (event.shiftKey !== hotkeyMods.includes("shift")) return;
        event.preventDefault();
        const current = root.getAttribute("data-anchor") || "bl";
        const index = ANCHORS.indexOf(current);
        const next = ANCHORS[(index + 1) % ANCHORS.length];
        clearFreePos();
        root.setAttribute("data-anchor", next);
        playEnter(next);
        try { localStorage.setItem(ANCHOR_STORE, next); } catch (error) {}
        showSay(ANCHOR_LABEL[next] || next);
      };
      window.addEventListener("keydown", onKeyDown);

      // 预览开关：Ctrl+Alt+K 切换"思考态"（半睁眼 + 扫光）
      let manualUntil = 0;
      const onThinkKey = (event) => {
        if (!event.ctrlKey || !event.altKey || event.key.toLowerCase() !== "k") return;
        event.preventDefault();
        manualUntil = Date.now() + 20000;
        root.classList.toggle("is-thinking");
      };
      window.addEventListener("keydown", onThinkKey);

      // 眼睛跟随指针：瞳孔与高光整体微移（最多 3.2px）
      let lookRaf = 0;
      let lastPointer = null;
      const applyLook = () => {
        lookRaf = 0;
        const event = lastPointer;
        if (event === null) return;
        const box = root.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return;
        const cx = box.left + box.width / 2;
        const cy = box.top + box.height * 0.46;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const strength = Math.min(1, dist / 300);
        const max = 3.2;
        root.style.setProperty("--look-x", ((dx / dist) * max * strength).toFixed(2) + "px");
        root.style.setProperty("--look-y", ((dy / dist) * max * strength).toFixed(2) + "px");
      };
      const onPointerMove = (event) => {
        lastPointer = event;
        if (lookRaf === 0) lookRaf = requestAnimationFrame(applyLook);
      };
      window.addEventListener("pointermove", onPointerMove);

      // 真实状态：轮询主进程暴露的 /fairy/state（由 agent/assistant-stream 驱动）
      let pollTimer = null;
      const syncBusy = () => {
        if (Date.now() < manualUntil) return;
        fetch("/fairy/state", { cache: "no-store" })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data === null || typeof data.busy !== "boolean") return;
            root.classList.toggle("is-thinking", data.busy);
          })
          .catch(() => {});
      };
      pollTimer = setInterval(syncBusy, 900);
      syncBusy();

      // ── 悬浮窗投递：从 /fairy/inbox 取文字，写进 DSH 的输入框并回车 ──
      const findComposer = () => {
        const nodes = Array.from(
          document.querySelectorAll("textarea, [contenteditable='true'], [role='textbox']")
        );
        const shown = nodes.filter((node) => {
          const rect = node.getBoundingClientRect();
          return rect.width > 80 && rect.height > 12 && rect.top > 0 && rect.bottom <= window.innerHeight + 4;
        });
        if (shown.length === 0) return null;
        // 输入框通常最靠下，取 top 最大的
        return shown.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0];
      };

      const findSendButton = () => {
        const bottom = window.innerHeight * 0.55;
        const cands = Array.from(document.querySelectorAll("button")).filter((b) => {
          const r = b.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.top > bottom && !b.disabled;
        });
        const labelled = cands.find((b) => {
          const t = (b.getAttribute("aria-label") || "") + (b.getAttribute("title") || "") + (b.textContent || "");
          return /发送|发送消息|send|submit/i.test(t);
        });
        if (labelled) return labelled;
        // 退而求其次：右下角最靠右的那个按钮
        return cands.sort((a, b) => b.getBoundingClientRect().left - a.getBoundingClientRect().left)[0] || null;
      };

      const readComposer = (el) => (el.tagName === "TEXTAREA" || el.tagName === "INPUT" ? el.value : el.textContent) || "";

      const injectIntoComposer = (text) => {
        const el = findComposer();
        if (el === null) return "no-composer";
        try { el.focus(); } catch (error) {}

        if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
          const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
          if (setter) setter.call(el, text); else el.value = text;
        } else {
          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          document.execCommand("insertText", false, text);
        }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));

        const key = { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true };
        el.dispatchEvent(new KeyboardEvent("keydown", key));

        // 300ms 后检查是否清空；没清空就点发送按钮
        setTimeout(() => {
          const still = readComposer(el).trim().length > 0;
          if (!still) { showSay("已发送"); return; }
          const btn = findSendButton();
          if (btn === null) { showSay("找不到发送按钮"); return; }
          try {
            btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            btn.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
            btn.click();
          } catch (error) {}
          setTimeout(() => {
            showSay(readComposer(el).trim().length === 0 ? "已发送" : "发送按钮也无效");
          }, 400);
        }, 300);

        return "ok";
      };
      const pullInbox = () => {
        fetch("/fairy/inbox", { cache: "no-store" })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data === null || typeof data.text !== "string" || data.text.length === 0) return;
            const result = injectIntoComposer(data.text);
            if (result !== "ok") showSay(result === "no-composer" ? "找不到输入框" : String(result));
          })
          .catch(() => {});
      };
      const inboxTimer = setInterval(pullInbox, 900);
      pullInbox();

      // 首次入场
      playEnter(initialAnchor);

      const onClick = (event) => {
        if (suppressClick) return;
        if (event.target instanceof Element && event.target.closest(".palette") !== null) return;
        showSay(lines[Math.floor(Math.random() * lines.length)]);
      };
      root.addEventListener("click", onClick);

      // ── 眨眼调度：随机间隔 + 概率连眨 ──
      const doBlink = (durationMs) => {
        if (disposed) return;
        root.classList.add("is-blinking");
        blinkOffTimer = setTimeout(() => {
          root.classList.remove("is-blinking");
          blinkOffTimer = null;
        }, durationMs);
      };

      const scheduleBlink = () => {
        const base = BLINK.sec * 1000;
        const jitter = (Math.random() * 2 - 1) * BLINK.jitterPct / 100;
        const delay = Math.max(900, base * (1 + jitter));
        blinkTimer = setTimeout(() => {
          const hold = BLINK.closeMs + BLINK.holdMs;
          doBlink(hold);
          if (Math.random() < BLINK.doubleChance) {
            setTimeout(() => doBlink(hold), hold + 140);
          }
          scheduleBlink();
        }, delay);
      };

      if (ART.mode === "svg" || (ART.mode === "img" && ART.blinkSrc)) {
        scheduleBlink();
      }

      return () => {
        disposed = true;
        if (sayTimer !== null) clearTimeout(sayTimer);
        if (blinkTimer !== null) clearTimeout(blinkTimer);
        if (blinkOffTimer !== null) clearTimeout(blinkOffTimer);
        if (pollTimer !== null) clearInterval(pollTimer);
        if (inboxTimer !== null) clearInterval(inboxTimer);
        root.removeEventListener("click", onClick);
        root.removeEventListener("contextmenu", onContextMenu);
        window.removeEventListener("pointermove", onDragMove);
        window.removeEventListener("pointerup", onDragUp);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keydown", onThinkKey);
        window.removeEventListener("pointermove", onPointerMove);
        if (lookRaf !== 0) cancelAnimationFrame(lookRaf);
        // 淡出后再真正移除
        root.classList.remove("is-enter");
        root.classList.add("is-leaving");
        setTimeout(() => {
          root.remove();
          style.remove();
        }, 300);
      };
    }

    function apply(ctx) {
      try {
        const effect =
          ctx && typeof ctx.effect === "function"
            ? (fn) => ctx.effect(fn, "dsh-pet-fairy: mount")
            : (fn) => { fn(); };
        effect(mount);
      } catch (error) {
        try { console.warn("[dsh-pet-fairy] mount failed:", error); } catch {}
      }

      // 设置 → 插件 → fairy：配色选择区
      try {
        let React = null;
        try { React = require("react"); } catch (error) { React = null; }
        const slots = ctx && typeof ctx.get === "function" ? ctx.get("slots") : ctx && ctx.slots;
        if (React !== null && slots && typeof slots.inject === "function" && typeof slots.register === "function") {
          const section = makeSettingsSection(React);
          const off = slots.inject("settings.section", () =>
            slots.register(
              {
                name: "settings.section",
                id: "dsh-pet-fairy",
                order: 120,
                label: () => "fairy",
              },
              section
            )
          );
          if (typeof ctx.effect === "function") {
            ctx.effect(() => () => { try { off?.(); } catch (error) {} }, "dsh-pet-fairy: settings section");
          }
        } else {
          console.warn("[dsh-pet-fairy] settings section skipped", { react: React !== null, slots: Boolean(slots) });
        }
      } catch (error) {
        try { console.warn("[dsh-pet-fairy] settings section failed:", error); } catch {}
      }
    }

    exports.isPlugin = true;
    exports.inject = [];
    exports.apply = apply;
    return module.exports;
  }
});
