import {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  GuildMember,
} from "discord.js";
import { commands } from "./commands/index.js";
import { handleBoost } from "./boost.js";
import {
  BOOST_MESSAGE_MODAL_ID,
  BOOST_MESSAGE_INPUT_ID,
} from "./commands/setboostmessage.js";
import { setBoostMessage } from "./storage.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commandCollection = new Collection<string, (typeof commands)[number]>();
for (const command of commands) {
  commandCollection.set(command.data.name, command);
}

const guildBoostCache = new Map<string, number>();

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Bot is online as ${readyClient.user.tag}`);
  for (const guild of readyClient.guilds.cache.values()) {
    guildBoostCache.set(guild.id, guild.premiumSubscriptionCount ?? 0);
  }
});

client.on(Events.Error, (error) => {
  console.error("⚠️  Discord client error (connection kept):", error.message);
});

client.on(Events.ShardError, (error, shardId) => {
  console.error(`⚠️  Shard ${shardId} WebSocket error (will auto-reconnect):`, error.message);
});

client.on(Events.Warn, (message) => {
  console.warn("⚠️  Discord warning:", message);
});

client.on(Events.Invalidated, () => {
  console.error("❌ Session invalidated — exiting so the process restarts.");
  process.exit(1);
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const wasBooster =
    oldMember.premiumSince === null || oldMember.premiumSince === undefined;
  const isBooster =
    newMember.premiumSince !== null && newMember.premiumSince !== undefined;

  if (wasBooster && isBooster) {
    const guildId = newMember.guild.id;
    const prevCount = guildBoostCache.get(guildId) ?? 0;
    const newCount = newMember.guild.premiumSubscriptionCount ?? 0;
    const boostsAdded = Math.max(1, newCount - prevCount);

    guildBoostCache.set(guildId, newCount);

    await handleBoost(newMember as GuildMember, boostsAdded);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isModalSubmit()) {
    if (interaction.customId === BOOST_MESSAGE_MODAL_ID) {
      const guildId = interaction.guildId;
      if (!guildId) {
        await interaction.reply({ content: "Could not determine server.", ephemeral: true });
        return;
      }

      const newMessage = interaction.fields.getTextInputValue(BOOST_MESSAGE_INPUT_ID);
      await setBoostMessage(guildId, newMessage);

      await interaction.reply({
        content: [
          "✅ Boost message updated! Here's a preview:",
          "```",
          newMessage
            .replace(/\{user\}/g, "@Username")
            .replace(/\{boostsAdded\}/g, "2"),
          "```",
          "Use `/boostmessage` to send a live preview to your boost channel.",
        ].join("\n"),
        ephemeral: true,
      });
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commandCollection.get(interaction.commandName);
  if (!command) {
    console.error(`Unknown command: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    const reply = { content: "There was an error executing this command.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

process.on("unhandledRejection", (reason) => {
  console.error("⚠️  Unhandled promise rejection (bot kept running):", reason);
});

process.on("uncaughtException", (error) => {
  console.error("⚠️  Uncaught exception (bot kept running):", error.message);
});

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN is not set.");
  process.exit(1);
}

client.login(token);
