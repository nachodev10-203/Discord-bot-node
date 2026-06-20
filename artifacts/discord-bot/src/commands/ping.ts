import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { Command } from "./index.js";

export const pingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot latency"),

  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;

    await interaction.editReply(
      `🏓 Pong!\n> **Round-trip latency:** ${latency}ms\n> **WebSocket heartbeat:** ${wsLatency}ms`
    );
  },
};
