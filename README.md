# dsh-pet-fairy · fairy

> 一只会看你的眼睛。给 DeepSeek Harness 用的桌面宠物插件。

![npm](https://img.shields.io/npm/v/dsh-pet-fairy)
![license](https://img.shields.io/npm/l/dsh-pet-fairy)

它不只是一段循环动画：**它真的知道你正在工作**——模型输出时，它会把眼皮垂下来、一道扫描光从上往下走一遍。

> **装了觉得还行？** 去 [GitHub 点个 ⭐](https://github.com/SPECIALLOVE96/Fairy)，或者留一条 [issue](https://github.com/SPECIALLOVE96/Fairy/issues) 说说哪里别扭。
> 一个人做的小插件，一颗星、一句反馈，就是它继续更新的理由。

## 特性

| | |
|---|---|
| **三种状态** | 待机 / 工作（半睁 + 扫描）/ 眨眼（深色圆 + 细弧） |
| **跟随鼠标** | 虹膜与瞳孔整组微移，最多 3.2px |
| **拖动换位置** | 按住拖到任意位置，松手记住 |
| **5 套配色** | 右键呼出面板：宝石蓝 / 墨紫 / 青碧 / 琥珀金 / 灰白 |
| **光效跟随主色** | 外圈光、背景光晕、方框波纹、小气泡都由主色推导 |
| **信号花屏** | 每 6 秒一次，6 帧抖动，非工作态才触发 |
| **零依赖** | 无 React、无构建依赖，`lib/` 直接可跑 |

## 安装

```sh
# npm
dsh plugin --profile desktop add dsh-pet-fairy

# 本地 tarball
dsh plugin --profile desktop add file:/path/to/dsh-pet-fairy-0.4.0.tgz
```

装完**完全重启** DSH（主进程那半只在启动时加载）。

## 使用

| 操作 | 效果 |
|---|---|
| 点一下 | 随机一句台词 |
| **按住拖动** | 换位置（自动记住） |
| **右键** | 打开配色面板 |
| `Ctrl+Alt+J` | 在四个角落间循环（会清除拖动位置） |
| `Ctrl+Alt+K` | 预览"工作状态" 20 秒 |

## 它是怎么工作的

```
AI 每输出一个字 → 主进程半记一笔"正在工作"
        ↓
界面每 0.9 秒问一次 /fairy/state
        ↓
是 → 垂下眼皮 + 扫描；不是 → 抬起
```

- **主进程半**（`lib/index.js`）：订阅 `agent/assistant-stream`，暴露 `GET /fairy/state`
- **浏览器半**（`lib/client.js`）：轮询状态，负责全部绘制与动画
- 留了 2.6 秒缓冲：AI 调工具时会有几秒空档，不缓冲眼皮会一闪一闪

## 配置

`pet.config.json`（构建时内联进 `lib/client.js`）：

```json
{
  "name": "fairy",
  "width": 152, "height": 130,
  "left": 26, "bottom": 118,
  "anchor": "bl",
  "hotkey": "ctrl+alt+j",
  "bobPx": 6, "bobSec": 3.6,
  "blink": { "sec": 5.2, "jitterPct": 40, "doubleChance": 0.22 },
  "lines": ["检测到点击。可惜没有奖励。"]
}
```

改完重新构建：

```sh
node build.mjs
```

## 换图

把图放进 `assets/`：`character.png`（主图）、`character-blink.png`（闭眼帧，可选），再跑 `node build.mjs`，图片会被内联成 data URI。没有图时使用内置的手绘 SVG。

## 更新日志

### 0.2.0
- 新增：拖动换位置（记住坐标）
- 新增：5 套预设配色，右键呼出面板
- 新增：光效颜色跟随主色（`color-mix` 推导）
- 新增：方框波纹、小气泡跟随配色
- 调整：琥珀金调暖（色相 44° → 40°）

### 0.1.0
- 首个公开版本：三态视觉、扫描、花屏、跟随鼠标、噪点、角色化气泡

## 已知限制

- 状态是**全局**的：任何会话在输出，宠物都会进入工作态
- 花屏依赖 CSS `filter`，极少数 GPU 上可能掉帧
- 设置页里还不能调（需要在 DSH 设置中注册卡片，计划中）

## License

MIT © SPECIALLOVE96
