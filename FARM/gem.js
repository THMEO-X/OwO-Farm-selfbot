// Copyright (c) 2026 HT. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is prohibited.
// This software is proprietary and confidential.
// Contact the author for licensing information
const fs   = require("fs");
const path = require("path");

const OWO_ID = "408785106942164992";
const delay  = (ms) => new Promise((res) => setTimeout(res, ms));

// item code -> { configKey, command }
const ITEM_ACTIONS = {
  "050": { configKey: "lb",      command: "owo lb all" },
  "049": { configKey: "lotboxf", command: "owo lb f"   },
  "100": { configKey: "wc",      command: "owo wc all" },
};

function loadGemConfig() {
  try {
    const configPath = path.join(__dirname, "../config.json");
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed.gem || {};
  } catch (err) {
    console.log(`[gem.js]  config.json: ${err.message}`);
    return {};
  }
}

module.exports = function startGemItemWatcher(client, channelId) {
  if (!channelId) return;

  console.log(`gem item watcher channel: ${channelId}`);

  client.on("messageCreate", async (message) => {
    if (message.author.id !== OWO_ID) return;
    if (message.channel.id !== channelId) return;
    if (!message.content.includes("Inventory =")) return;

    const channel = message.channel;
    const content = message.content;

    const values = [];
    const regex  = /`([^`]+)`/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      values.push(match[1]);
    }

    if (!values.length) return;

    console.log(`[${channel.name}] gem.js thấy inv: ${values.join(", ")}`);

    const gemConfig = loadGemConfig();

    for (const code of Object.keys(ITEM_ACTIONS)) {
      if (!values.includes(code)) continue;

      const { configKey, command } = ITEM_ACTIONS[code];

      if (!gemConfig[configKey]) {
        console.log(`[${channel.name}] có item ${code} nhưng config.gem.${configKey} = false, bỏ qua`);
        continue;
      }

      await delay(1000);
      await channel.send(command);
      console.log(`[${channel.name}] item ${code} → gửi: ${command}`);
      await delay(2000);
    }
  });
};
    
