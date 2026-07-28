// Copyright (c) 2026 HT. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is prohibited.
// This software is proprietary and confidential.
// Contact the author for licensing information
const OWO_ID = "408785106942164992";
const delay  = (ms) => new Promise((res) => setTimeout(res, ms));

// "You need to wait **2H 48M 2S**" -> 2*3600 + 48*60 + 2 (giây)
function parseWaitSeconds(content) {
  const match = content.match(
    /You need to wait \*\*(?:(\d+)H)?\s*(?:(\d+)M)?\s*(?:(\d+)S)?\*\*/i
  );
  if (!match) return null;

  const h = parseInt(match[1] || "0", 10);
  const m = parseInt(match[2] || "0", 10);
  const s = parseInt(match[3] || "0", 10);

  if (!h && !m && !s) return null;
  return h * 3600 + m * 60 + s;
}

module.exports = function startDailyTimer(client, channelId) {
  if (!channelId) return { onHuntSuccess: () => {} };

  const state = {
    huntCount: 0,
    pending:   false, // true = đang chờ owo daily xử lý (chờ reply hoặc chờ cooldown)
  };

  async function sendDaily(channel) {
    try {
      await delay(1000);
      await channel.send("owo daily");
      console.log(`[${channel.name}] daily.js: đã gửi owo daily`);
    } catch (err) {
      console.log(`[${channel.name}] daily.js: lỗi gửi owo daily: ${err.message}`);
      state.pending = false; // cho phép thử lại vào lần hunt x3 tiếp theo
    }
  }

  client.on("messageCreate", (message) => {
    if (message.author.id !== OWO_ID) return;
    if (message.channel.id !== channelId) return;
    if (!state.pending) return;

    const channel = message.channel;
    const content = message.content;

    if (content.includes("Here is your daily")) {
      console.log(`[${channel.name}] daily.js: claim daily thành công`);
      state.pending   = false;
      state.huntCount = 0;
      return;
    }

    const waitSeconds = parseWaitSeconds(content);
    if (waitSeconds !== null) {
      console.log(`[${channel.name}] daily.js: cần đợi ${waitSeconds}s (${content.match(/\*\*(.+?)\*\*/)?.[1] || ""}), sẽ tự gửi lại đúng lúc`);
      setTimeout(() => {
        sendDaily(channel);
      }, waitSeconds * 1000);
    }
  });

  return {
    // gọi hàm này từ farm.js mỗi khi hunt gửi thành công
    onHuntSuccess(channel) {
      if (state.pending) return; // đang xử lý daily, không đếm hunt lúc này

      state.huntCount++;
      console.log(`[${channel.name}] daily.js: hunt count = ${state.huntCount}/3`);

      if (state.huntCount >= 3) {
        state.huntCount = 0;
        state.pending    = true;
        sendDaily(channel);
      }
    },
  };
};
    
