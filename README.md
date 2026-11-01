# dsh-pet-dafeiyu · fairy

> 一只会看你的眼睛。给 DeepSeek Harness 用的桌面宠物插件。

![npm](https://img.shields.io/npm/v/dsh-pet-dafeiyu)
![license](https://img.shields.io/npm/l/dsh-pet-dafeiyu)

它不只是一段循环动画：**它真的知道你正在工作**——模型输出时，它会把眼皮垂下来、一道扫描光从上往下走一遍。

## 特性

| | |
|---|---|
| **三种状态** | 待机 / 工作（半睁 + 扫描）/ 眨眼（深色圆 + 细弧） |
| **跟随鼠标** | 虹膜与瞳孔整组微移，最多 3.2px |
| **信号花屏** | 每 6 秒一次，6 帧抖动，非工作态才触发 |
| **噪点质感** | 极淡颗粒，去掉矢量塑料感 |
| **零依赖** | 无 React、无构建依赖，`lib/` 直接可跑 |

## 安装

```sh
# npm
dsh plugin --profile desktop add dsh-pet-dafeiyu

# 本地 tarball
dsh plugin --profile desktop add file:/path/to/dsh-pet-dafeiyu-0.1.0.tgz
```

装完**完全重启** DSH（主进程那半只在启动时加载）。

## 使用

| 操作 | 效果 |
|---|---|
| 点一下 | 随机一句台词 |
| `Ctrl+Alt+J` | 在四个角落间循环 |
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

## 更新日志

### 0.1.0
- 首个公开版本：三态视觉（睁眼 / 工作 / 眨眼）
- 工作态：上半眼皮压下 + 自上而下扫描
- 待机：呼吸浮动、随机眨眼、6 秒一次信号花屏
- 虹膜跟随鼠标
- 角色化对话气泡（宝石蓝粗框 + 圆角刻痕）

## 已知限制

- 状态是**全局**的：任何会话在输出，宠物都会进入工作态
- 花屏依赖 CSS `filter`，极少数 GPU 上可能掉帧
- 暂不支持拖动换位置与配色切换（计划中）
- 设置页里还不能调（需要在 DSH 设置中注册卡片，计划中）

## License

MIT © SPECIALLOVE96
