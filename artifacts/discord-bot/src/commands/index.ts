import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { pingCommand } from "./ping.js";
import { boostmessageCommand } from "./boostmessage.js";
import { serverinfoCommand } from "./serverinfo.js";
import { booststatsCommand } from "./booststats.js";
import { setboostchannelCommand } from "./setboostchannel.js";
import { setboostmessageCommand } from "./setboostmessage.js";

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export const commands: Command[] = [
  pingCommand,
  boostmessageCommand,
  serverinfoCommand,
  booststatsCommand,
  setboostchannelCommand,
  setboostmessageCommand,
];
