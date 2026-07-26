const OWO_ID = "408785106942164992";

const ITEM_ACTIONS = {
  "050": "owo lb all",
  "049": "owo lbf",
  "100": "owo wc all",
};

module.exports = function startGemItemWatcher(client, channelId) {
  if (!channelId) return;

  client.on("messageCreate", async (msg) => {
    if (msg.author.id !== OWO_ID) return;
    if (msg.channel.id !== channelId) return;
    if (!msg.content.includes("Inventory =")) return;

    const channel = msg.channel;
    const content = msg.content;

    const values = [];
    const regex  = /`([^`]+)`/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      values.push(match[1]);
    }

    for (const [code, command] of Object.entries(ITEM_ACTIONS)) {
      if (values.includes(code)) {
        console.log(`[${channel.name}] found ${code} → ${command}`);
        await channel.send(command);
      }
    }
  });
};
