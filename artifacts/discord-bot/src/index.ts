import {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  GuildMember,
} from "discord.js";
import { commands } from "./commands/index.js";
import { handleBoost } from "./boost.js";

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

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN is not set.");
  process.exit(1);
}

client.login(token);
