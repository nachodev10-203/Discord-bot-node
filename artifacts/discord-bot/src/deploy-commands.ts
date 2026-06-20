import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error("❌ DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID must be set.");
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(token);

const body = commands.map((c) => c.data.toJSON());

console.log(`📡 Registering ${body.length} slash commands globally...`);

try {
  await rest.put(Routes.applicationCommands(clientId), { body });
  console.log("✅ Slash commands registered successfully!");
  for (const cmd of commands) {
    console.log(`  /${cmd.data.name} — ${cmd.data.description}`);
  }
} catch (error) {
  console.error("❌ Failed to register commands:", error);
  process.exit(1);
}
