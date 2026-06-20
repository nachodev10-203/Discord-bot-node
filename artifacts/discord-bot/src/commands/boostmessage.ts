import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import type { Command } from "./index.js";
import { handleBoost } from "../boost.js";

export const boostmessageCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("boostmessage")
    .setDescription("Preview the boost message (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await handleBoost(interaction.member as GuildMember);
    await interaction.reply({
      content: "✅ Boost message preview sent to your boost channel!",
      ephemeral: true,
    });
  },
};
