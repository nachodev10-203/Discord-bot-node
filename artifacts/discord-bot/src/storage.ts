import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data"
);
const settingsPath = path.join(dataDir, "guild-settings.json");

interface GuildSettings {
  boostChannelId?: string;
}

type Settings = Record<string, GuildSettings>;

async function readSettings(): Promise<Settings> {
  try {
    const raw = await readFile(settingsPath, "utf-8");
    return JSON.parse(raw) as Settings;
  } catch {
    return {};
  }
}

async function writeSettings(settings: Settings): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
}

export async function getBoostChannel(guildId: string): Promise<string | undefined> {
  const settings = await readSettings();
  return settings[guildId]?.boostChannelId;
}

export async function setBoostChannel(guildId: string, channelId: string): Promise<void> {
  const settings = await readSettings();
  settings[guildId] = { ...settings[guildId], boostChannelId: channelId };
  await writeSettings(settings);
}
