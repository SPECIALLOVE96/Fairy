/**
 * dsh-pet-dafeiyu — host half.
 *
 * 职责：把"模型正在流式输出"这个真实状态，通过 /fairy/state 暴露给浏览器半。
 *
 * 关键点：必须显式 `export const inject = ["webServer"]`，cordis 才会在
 * apply 之前把 webServer 服务准备好（不声明的话 ctx.webServer 是 undefined）。
 */

import fs from "node:fs";
import util from "node:util";
import os from "node:os";
import path from "node:path";

/** 最后一次流式输出之后，还认为"在思考"的持续时间（毫秒） */
const HOLD_MS = 2600;

const LOG = path.join(os.tmpdir(), "fairy-host.log");

/** 悬浮窗投递进来的文字，暂存在这个文件里，由浏览器半取走 */
const INBOX = path.join(os.tmpdir(), "fairy-inbox.json");
/** 宿主写给悬浮窗的桥接文件：最近一次流式事件的内容 */
const BRIDGE = path.join(os.tmpdir(), "fairy-bridge.json");

function log(message) {
  try {
    fs.appendFileSync(LOG, `${new Date().toISOString()} ${message}\n`);
  } catch {}
}

export const name = "dsh-pet-dafeiyu";
export const inject = ["webServer"];

export function apply(ctx) {
  log("apply 开始");
  log(`ctx.webServer = ${typeof ctx.webServer} / register=${typeof ctx.webServer?.register}`);

  let busyUntil = 0;
  let timer = null;
  let off = null;
  let registered = null;
  let bridgeSeq = 0;

  const isBusy = () => Date.now() < busyUntil;

  /** 从一条会话日志里取助手正文 */
  const textFromEntry = (entry) => {
    try {
      if (!entry || entry.type !== "assistant/message") return "";
      const content = entry?.data?.message?.content;
      if (typeof content === "string") return content.trim();
      if (!Array.isArray(content)) return "";
      const parts = [];
      for (const block of content) {
        if (!block) continue;
        if (typeof block === "string") { parts.push(block); continue; }
        const kind = typeof block.type === "string" ? block.type : "";
        // 跳过思考/推理块（模型草稿，不该出现在对话里）
        if (/reason|think|analysis|cot/i.test(kind)) continue;
        if (kind === "text" || kind === "") {
          if (typeof block.text === "string") parts.push(block.text);
          else if (block.text && typeof block.text.value === "string") parts.push(block.text.value);
          else if (typeof block.content === "string") parts.push(block.content);
        }
      }
      return parts.join("").trim();
    } catch {
      return "";
    }
  };

  const pickText = (payload) => {
    try {
      const log = payload?.agent?.session?.log;
      if (!Array.isArray(log)) return "";
      for (let i = log.length - 1; i >= 0 && i > log.length - 16; i--) {
        const t = textFromEntry(log[i]);
        if (t.length > 0) return t;
      }
      return "";
    } catch {
      return "";
    }
  };
  const bump = (payload) => {
    busyUntil = Date.now() + HOLD_MS;
    if (timer === null) {
      timer = setTimeout(() => {
        timer = null;
      }, HOLD_MS + 50);
    }
    try {
      // 只在"一轮结束"时发布，避免流式过程中重复推送
      const frameType = payload?.frame?.type;
      if (frameType !== "end") return;
      bridgeSeq += 1;
      let raw = "";
      try { raw = util.inspect(payload, { depth: 3, maxStringLength: 240, breakLength: 180, compact: true }); }
      catch { raw = String(payload); }
      let lastLog = "";
      try {
        const log2 = payload?.agent?.session?.log;
        if (Array.isArray(log2) && log2.length > 0) {
          lastLog = util.inspect(log2[log2.length - 1], { depth: 2, maxStringLength: 300, breakLength: 200, compact: true }).slice(0, 900);
        }
      } catch {}
      fs.writeFileSync(BRIDGE, JSON.stringify({
        lastLog,
        seq: bridgeSeq,
        at: Date.now(),
        text: pickText(payload),
        raw: (raw || "").slice(0, 1600),
      }));
    } catch (error) {
      try { fs.appendFileSync(LOG, "bridge write failed " + String(error?.message ?? error) + "\n"); } catch {}
    }
  };

  try {
    if (typeof ctx.on === "function") {
      off = ctx.on("agent/assistant-stream", bump);
      log("已订阅 agent/assistant-stream");
    } else {
      log("ctx.on 不可用");
    }
  } catch (error) {
    log(`订阅失败: ${error?.message ?? error}`);
  }

  try {
    registered = ctx.webServer.register({
      kind: "prefix",
      path: "/fairy/state",
      handler: (req, res) => {
        log(`命中 ${req.method} ${req.url}`);
        res.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        });
        res.end(JSON.stringify({ busy: isBusy() }));
      },
    });
    log("路由注册成功 /fairy/state");
  } catch (error) {
    log(`路由注册失败: ${error?.message ?? error}`);
  }

  // 取走悬浮窗投递的文字（取完即删，避免重复注入）
  let inboxRoute = null;
  try {
    inboxRoute = ctx.webServer.register({
      kind: "prefix",
      path: "/fairy/inbox",
      handler: (req, res) => {
        res.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        });
        let payload = { text: "" };
        try {
          if (fs.existsSync(INBOX)) {
            const raw = fs.readFileSync(INBOX, "utf8");
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.text === "string") payload = { text: parsed.text };
            fs.unlinkSync(INBOX);
            log(`inbox 取出 ${payload.text.length} 字`);
          }
        } catch (error) {
          log(`inbox 读取失败: ${error?.message ?? error}`);
        }
        res.end(JSON.stringify(payload));
      },
    });
    log("路由注册成功 /fairy/inbox");
  } catch (error) {
    log(`inbox 路由注册失败: ${error?.message ?? error}`);
  }

  try {
    ctx.effect(() => () => {
      off?.();
      registered?.();
      inboxRoute?.();
      if (timer !== null) clearTimeout(timer);
      log("已清理");
    }, "dsh-pet-dafeiyu: state route");
  } catch (error) {
    log(`effect 注册失败: ${error?.message ?? error}`);
  }
}
