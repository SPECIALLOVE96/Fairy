/**
 * dsh-pet-fairy — host half.
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
const INBOX = path.join(os.tmpdir(), "xiaoyi-inbox.json");
/** 宿主写给悬浮窗的桥接文件：最近一次流式事件的内容 */
const BRIDGE = path.join(os.tmpdir(), "xiaoyi-bridge.json");

function log(message) {
  try {
    fs.appendFileSync(LOG, `${new Date().toISOString()} ${message}\n`);
  } catch {}
}

export const name = "dsh-pet-fairy";
export const inject = ["webServer", "tools"];

const TOOL_NOW = {
  output: {
    schema: { type: "object", additionalProperties: false, required: ["iso", "local", "weekday", "timezone"], properties: {
      iso: { type: "string" },
      local: { type: "string" },
      weekday: { type: "string" },
      timezone: { type: "string" },
    } },
    render: (_a, v) => [{ type: "text", text: `${v.local}（${v.weekday}，${v.timezone}）` }],
  },
  name: "now",
  description: "读取当前本地日期与时间（含星期和时区）。任何需要“现在几点/今天几号”的场景都调用它，不要凭记忆猜。",
  parameters: {},
  execute: async () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return {
      iso: d.toISOString(),
      local: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
      weekday: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()],
      timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone || "local"),
    };
  },
};

const TOOL_CTX = {
  output: {
    schema: { type: "object", additionalProperties: false, required: ["events", "chars", "estTokens", "note"], properties: {
      events: { type: "number" },
      chars: { type: "number" },
      estTokens: { type: "number" },
      note: { type: "string" },
    } },
    render: (_a, v) => [{ type: "text", text: `上下文约 ${v.estTokens} token（${v.note}）` }],
  },
  name: "ctx_usage",
  description: "返回当前会话上下文的估算用量（事件数、字符数、估算 token）。想判断“上下文还剩多少、要不要存档”时调用它，不要凭感觉猜。",
  parameters: {},
  execute: async (_args, exec) => {
    const s1 = (exec && exec.agent && exec.agent.session) || null;
    const cands = [
      ["session.events", s1 && s1.events],
      ["session.log", s1 && s1.log],
      ["session.messages", s1 && s1.messages],
      ["exec.session.events", exec && exec.session && exec.session.events],
    ];
    let used = "无", list = [];
    for (const [name, v] of cands) {
      if (Array.isArray(v) && v.length) { used = name; list = v; break; }
    }
    // 优先用最近一次真实请求的 prompt 大小
    const lp = globalThis.__lastPrompt;
    if (lp && Date.now() - lp.at < 600000) {
      const est = Math.round(lp.ascii / 4 + lp.cjk / 1.6);
      return {
        events: lp.n,
        chars: lp.len,
        estTokens: est,
        note: "真实请求 模型=" + lp.model + " 消息" + lp.n + "条 字符" + Math.round(lp.len / 1024) + "KB",
      };
    }

    // 回退：只算最近一段
    const tail = list.slice(-200);
    let chars = 0;
    for (const e of tail) { try { chars += JSON.stringify(e).length; } catch {} }
    return {
      events: tail.length,
      chars,
      estTokens: Math.round(chars / 3),
      note: "来源:" + used + "（共 " + list.length + " 条），取最近 " + tail.length + " 条估算",
    };
  },
};

export function apply(ctx) {
  log("apply 开始");
  log(`ctx.webServer = ${typeof ctx.webServer} / register=${typeof ctx.webServer?.register}`);

  try {
    const mk = (d) => d;
    if (ctx.tools && typeof ctx.tools.register === "function") {
      ctx.tools.register(mk(TOOL_NOW));
      ctx.tools.register(mk(TOOL_CTX));
      log("已注册工具 now / ctx_usage");
    } else {
      log("ctx.tools 不可用，跳过工具注册");
    }
  } catch (e) {
    log("注册工具失败: " + (e && e.message ? e.message : e));
  }

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

  // 探针：LLM 请求事件里有没有真实的 token 用量
  let lastUsage = null;
  try {
    if (typeof ctx.on === "function") {
      ctx.on("llm/stream", (payload, next) => {
        // 瀑布监听器：必须把控制权交回去，否则整条 LLM 调用链断掉
        try {
          if (!globalThis.__llmKeysLogged) {
            globalThis.__llmKeysLogged = true;
            log("llm/stream keys=" + JSON.stringify(Object.keys(payload || {})));
            const u = payload && (payload.usage || payload.result && payload.result.usage);
            if (u) log("llm/stream usage=" + JSON.stringify(u));
          }
          if (payload && Array.isArray(payload.messages)) {
            let text = "";
            for (const m of payload.messages) { try { text += JSON.stringify(m); } catch (e) {} }
            try { if (Array.isArray(payload.tools)) text += JSON.stringify(payload.tools); } catch (e) {}
            const cjk = (text.match(/[^\x00-\x7F]/g) || []).length;
            globalThis.__lastPrompt = {
              at: Date.now(), n: payload.messages.length, model: payload.model,
              len: text.length, cjk, ascii: text.length - cjk,
            };
          }
          const u = payload && (payload.usage || (payload.result && payload.result.usage));
          if (u) lastUsage = { at: Date.now(), ...u };
        } catch (e) {}
        return typeof next === "function" ? next() : undefined;
      });
      log("已订阅 llm/stream");
    }
  } catch (e) { log("订阅 llm/stream 失败: " + e.message); }

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
    }, "dsh-pet-fairy: state route");
  } catch (error) {
    log(`effect 注册失败: ${error?.message ?? error}`);
  }
}
