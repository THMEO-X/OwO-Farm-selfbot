// Copyright (c) 2026 HT. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is prohibited.
// This software is proprietary and confidential.
// Contact the author for licensing information.

const OWO_ID = "408785106942164992";
const delay  = (ms) => new Promise((res) => setTimeout(res, ms));

const GEM_CODES = {
  gem1: ["057", "056", "055", "054", "053", "052", "051"],
  gem3: ["071", "070", "069", "068", "067", "066", "065"],
  gem4: ["078", "077", "076", "075", "074", "073", "072"],
};

const GEM_PREFIXES = ["cgem", "ugem", "rgem", "egem", "mgem", "lgem", "fgem"];

const ITEM_MAP = [
  { code: "050", key: "lb",      cmd: "lb"             },
  { code: "049", key: "lotboxf", cmd: "lootbox fabled" },
  { code: "100", key: "wc",      cmd: "wc"             },
];

function hasGemInContent(content, gemNumber) {
  return GEM_PREFIXES.some((prefix) =>
    content.includes(`${prefix}${gemNumber}:`)
  );
}

async function useItems(client, channel, values, invConfig) {
  for (const item of ITEM_MAP) {
    if (!invConfig[item.key]) continue;
    if (!values.includes(item.code)) continue;
    await channel.send(`owo ${item.cmd} all`);
    await delay(2500);
  }
}

async function fetchAndUseGems(client, channel, global, config, missingGems, invMsgId) {
  const invReply = await waitForInvReply(client, channel, invMsgId);

  if (!invReply) {
    global.gemChecking = false;
    return;
  }

  const values = [];

  const backtickRegex = /`([^`]+)`/g;
  let match;
  while ((match = backtickRegex.exec(invReply.content)) !== null) {
    const code = match[1].trim().slice(0, 3);
    if (!values.includes(code)) values.push(code);
  }

  if (values.length === 0) {
    const invMatch = invReply.content.match(/Inventory:\s*([\d,\s]+)/);
    if (invMatch) {
      invMatch[1].split(",").forEach((c) => {
        const code = c.trim().slice(0, 3);
        if (code && !values.includes(code)) values.push(code);
      });
    }
  }

  const invConfig = config?.inv ?? {};
  await useItems(client, channel, values, invConfig);

  let gemsToUse = "";
  for (const gemName of missingGems) {
    const codes = GEM_CODES[gemName];
    for (const code of codes) {
      if (values.includes(code)) {
        gemsToUse += `${code} `;
        break;
      }
    }
  }

  if (!gemsToUse.trim()) {
    global.gemChecking = false;
    return;
  }

  await delay(1000);
  await channel.send(`owo use ${gemsToUse.trim()}`);

  await delay(2000);
  global.gemChecking = false;
}

function waitForInvReply(client, channel, invMsgId) {
  return new Promise((resolve) => {
    let done = false;

    const listener = (msg) => {
      if (
        msg.author.id === OWO_ID &&
        msg.channel.id === channel.id &&
        msg.id > invMsgId &&
        msg.content.includes("Inventory")
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

module.exports = function startGemWatcher(client, channelId, global, config) {
  if (!channelId) return;

  client.on("messageCreate", async (message) => {
    if (message.author.id !== OWO_ID) return;
    if (message.channel.id !== channelId) return;
    if (global.gemChecking) return;

    const channel = message.channel;
    const content = message.content;

    if (content.includes("and caught an")) {
      global.gemChecking = true;
      global.hunt        = false;
      global.battle      = false;

      await delay(1000);
      const invMsg = await channel.send("owo inv");
      await fetchAndUseGems(client, channel, global, config, ["gem1", "gem3", "gem4"], invMsg.id);
      return;
    }

    if (!content.includes("hunt is empowered by")) return;

    const hasGem1 = hasGemInContent(content, "1");
    const hasGem3 = hasGemInContent(content, "3");
    const hasGem4 = hasGemInContent(content, "4");

    const missingGems = [];
    if (!hasGem1) missingGems.push("gem1");
    if (!hasGem3) missingGems.push("gem3");
    if (!hasGem4) missingGems.push("gem4");

    if (missingGems.length === 0) return;

    global.gemChecking = true;
    global.hunt        = false;
    global.battle      = false;

    await delay(1000);
    const invMsg = await channel.send("owo inv");
    await fetchAndUseGems(client, channel, global, config, missingGems, invMsg.id);
  });
};
