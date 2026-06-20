import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import type { Command } from "./index.js";
import { setBoostChannel } from "../storage.js";

export const setboostchannelCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("setboostchannel")
    .setDescription("Set the channel where boost announcements are sent (admin only)")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The text channel to send boost messages in")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel("channel", true);

    if (!interaction.guildId) {
      await interaction.reply({
        content: "This command must be used in a server.",
        ephemeral: true,
      });
      return;
    }

    await setBoostChannel(interaction.guildId, channel.id);

    await interaction.reply({
      content: `✅ Boost announcements will now be sent to <#${channel.id}>`,
      ephemeral: true,
    });
  },
};
