// Copyright (c) 2026 HT. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is prohibited.
// This software is proprietary and confidential.
// Contact the author for licensing information.

// FARM/inv.js
const OWO_ID = "408785106942164992";
const delay  = (ms) => new Promise((res) => setTimeout(res, ms));

const GEM_CODES = {
  gem1: ["057", "056", "055", "054", "053", "052", "051"],
  gem3: ["071", "070", "069", "068", "067", "066", "065"],
  gem4: ["078", "077", "076", "075", "074", "073", "072"],
};

const GEM_PREFIXES = ["cgem", "ugem", "rgem", "egem", "mgem", "lgem", "fgem"];

function hasGemInContent(content, gemNumber) {
  return GEM_PREFIXES.some((prefix) =>
    content.includes(`${prefix}${gemNumber}:`)
  );
}

function resumeFarm(global, channelName) {
  global.gemChecking = false;
  console.log(`[${channelName}] ✅ Resume farm`);
}

async function fetchAndUseGems(client, channel, global, missingGems, invMsgId) {
  try {
    const invReply = await waitForInvReply(client, channel, invMsgId);

    if (!invReply) {
      console.log(`[${channel.name}] Không nhận được inv, resume farm`);
      resumeFarm(global, channel.name);
      return;
    }

    const values = [];
    const regex  = /`([^`]+)`/g;
    let match;
    while ((match = regex.exec(invReply.content)) !== null) {
      values.push(match[1]);
    }

    console.log(`[${channel.name}] Inventory: ${values.join(", ")}`);

    let gemsToUse = "";
    for (const gemName of missingGems) {
      const codes = GEM_CODES[gemName];
      for (const code of codes) {
        if (values.includes(code)) {
          gemsToUse += `${code} `;
          console.log(`[${channel.name}] Dùng ${gemName}: ${code}`);
          break;
        }
      }
    }

    if (!gemsToUse.trim()) {
      console.log(`[${channel.name}] Không có gem nào để dùng`);
      resumeFarm(global, channel.name);
      return;
    }

    await delay(1000);
    await channel.send(`owo use ${gemsToUse.trim()}`);
    console.log(`[${channel.name}] Đã dùng: ${gemsToUse.trim()}`);

    await delay(2000);
    resumeFarm(global, channel.name);
  } catch (err) {
    console.error(`[${channel.name}] Lỗi fetchAndUseGems:`, err);
    resumeFarm(global, channel.name);
  }
}

function waitForInvReply(client, channel, invMsgId) {
  return new Promise((resolve) => {
    let done = false;

    const listener = (msg) => {
      if (
        msg.author.id === OWO_ID &&
        msg.channel.id === channel.id &&
        msg.id > invMsgId &&
        msg.content.includes("Inventory =")
      ) {
        if (!done) {
          done = true;
          client.off("messageCreate", listener);
          resolve(msg);
        }
      }
    };

    client.on("messageCreate", listener);

    setTimeout(() => {
      if (!done) {
        done = true;
        client.off("messageCreate", listener);
        resolve(null);
      }
    }, 8000);
  });
}

module.exports = function startGemWatcher(client, channelId, global) {
  if (!channelId) return;

  console.log(`Gem watcher channel: ${channelId}`);

  client.on("messageCreate", async (message) => {
    if (message.author.id !== OWO_ID) return;
    if (message.channel.id !== channelId) return;
    if (global.gemChecking) return;

    const channel = message.channel;
    const content = message.content;

    // ─── Trigger 1: bắt được animal ──────────────────────────────
    if (content.includes("and caught an")) {
      global.gemChecking = true;

      console.log(`[${channel.name}] Bắt được animal`);
      await delay(1000);
      const invMsg = await channel.send("owo inv");
      await fetchAndUseGems(client, channel, global, ["gem1", "gem3", "gem4"], invMsg.id);
      return;
    }

    // ─── Trigger 2: hunt is empowered by ─────────────────────────
    if (!content.includes("hunt is empowered by")) return;

    const hasGem1 = hasGemInContent(content, "1");
    const hasGem3 = hasGemInContent(content, "3");
    const hasGem4 = hasGemInContent(content, "4");

    const missingGems = [];
    if (!hasGem1) missingGems.push("gem1");
    if (!hasGem3) missingGems.push("gem3");
    if (!hasGem4) missingGems.push("gem4");

    console.log(
      `[${channel.name}] Gem hiện tại: ${
        [hasGem1 && "gem1", hasGem3 && "gem3", hasGem4 && "gem4"]
          .filter(Boolean)
          .join(", ") || "không có"
      }`
    );

    if (missingGems.length === 0) {
      console.log(`[${channel.name}] Đủ gem rồi`);
      return;
    }

    global.gemChecking = true;

    console.log(`[${channel.name}] Thiếu gem: ${missingGems.join(", ")}`);
    await delay(1000);
    const invMsg = await channel.send("owo inv");
    await fetchAndUseGems(client, channel, global, missingGems, invMsg.id);
  });
};
