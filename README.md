# crew-band · 输入框上方很忙的小克

一个 Claude Code mod：Claude 在工作的时候，输入框上方那一小排会出现小克。它走一段路，停下来做一整套动作，然后再走、再做。它做什么动作，就是 Claude 现在在做什么。

| 小克在做什么 | Claude 在做什么 |
|---|---|
| 戴巫师帽挥魔杖、冒星星 | 在想 |
| 戴侦探帽、弯腰拿放大镜找 | 在读档（Read / Grep / Glob） |
| 举望远镜扫一圈 | 在上网查（WebSearch / WebFetch） |
| 对着笔电打字 | 在改档（Edit / Write） |
| 戴厨师帽翻锅 | 在跑命令（Bash） |
| 戴贝雷帽看夹板、指派 | 在派分身（subagent） |
| 跑到最前面指着你 | 等你回（问你问题、要你按允许） |
| 被骂缩一下、冒汗，弹一句通知 | 出错了 |
| 戴耳机听歌、冒音符，弹一句通知 | 做完了 |
| 书盖在头上睡觉 | 在整理记忆（上下文压缩） |
| 摊手 | 在用其他工具 |

- Claude 派分身出去的时候，前两个分身也会变成小克，各做各的；再多出来的分身，会变成小机器人，在小克身边跑来跑去。
- 换状态时原地切换，不会瞬移。
- 指令：`/crew-demo` 让小克把每种状态轮流演一遍 · `/crew-off` 在这个窗口收起来 · `/crew-on` 叫回来。
- 不调用模型（0 token），每 1.5 秒在本机看一次有哪些 agent 在跑。

## 安装

需要 Claude Code v2.1.287 以上（桌面 app 的 Code 分页要 v2.1.286 以上）。在 Claude Code 里打：

```
/plugin marketplace add suiyang-meta/crew-band
```

```
/plugin install crew-band@crew-band
```

然後打 `/reload-plugins`，再打 `/crew-demo` 看一遍。

**懒得打指令**：把这一页的网址丢给你的 Claude Code，跟它说「帮我装这个 mod」。

**装之前先看它会碰什么**（装任何别人做的 mod 都建议这样做）：跟 Claude 说「帮我看这个 mod 会碰我电脑的什么」，或自己跑 `claude plugin validate <这个夹>`。这个 mod 只用到这几样：看有哪些 agent 在跑、听工具调用和回合开始 / 结束、在输入框上方画图、弹一句通知、注册三个指令。它不读你的档、不联网。

## 移除

```
/plugin uninstall crew-band@crew-band
```

## 自己改

- 哪个工具对应哪个状态、做完和出错停多久：`hooks/states.ts`
- 每个状态做哪套动作、散步路线、小机器人：`hooks/crabs.ts`
- 小克本人和动作库：`hooks/vendor/clawd-lib.js`
- 跑 `node check/preview-all.mjs out.html` 可以在浏览器一次看完全部状态

## 授权

程式码用 MIT（见 `LICENSE`）。

小克的样子照的是 Anthropic 的吉祥物 Clawd，角色形象属于 Anthropic，不在这份授权里面。

---

# crew-band · a busy Clawd above your prompt (English)

A Claude Code mod. While Claude is working, Clawd shows up in the small row above the prompt. It walks a bit, stops to do a full routine, then walks on. The routine tells you what Claude is doing right now: wizard hat and wand while it thinks, a chef's pan while it runs a command, headphones once it is done, pointing at you when it is waiting for your answer. The first two subagents also show up as Clawds, and any more appear as little robots running around next to it.

```
/plugin marketplace add suiyang-meta/crew-band
/plugin install crew-band@crew-band
```

Then run `/reload-plugins` and `/crew-demo`. To remove it: `/plugin uninstall crew-band@crew-band`. It makes no model calls and reads none of your files. The code is MIT licensed. The Clawd character design belongs to Anthropic and is not covered by that license.
