/**
 * dsh-pet-dafeiyu — host half.
 *
 * 职责：把"模型正在流式输出"这个真实状态，通过 /fairy/state 暴露给浏览器半。
 *
 * 关键点：必须显式 `export const inject = ["webServer"]`，cordis 才会在
 * apply 之前把 webServer 服务准备好（不声明的话 ctx.webServer 是 undefined）。
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** 最后一次流式输出之后，还认为"在思考"的持续时间（毫秒） */
const HOLD_MS = 2600;

const LOG = path.join(os.tmpdir(), "fairy-host.log");

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

  const isBusy = () => Date.now() < busyUntil;

  const bump = () => {
    busyUntil = Date.now() + HOLD_MS;
    if (timer === null) {
      timer = setTimeout(() => {
        timer = null;
      }, HOLD_MS + 50);
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

  try {
    ctx.effect(() => () => {
      off?.();
      registered?.();
      if (timer !== null) clearTimeout(timer);
      log("已清理");
    }, "dsh-pet-dafeiyu: state route");
  } catch (error) {
    log(`effect 注册失败: ${error?.message ?? error}`);
  }
}
