import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import type { Command } from "./index.js";

export const booststatsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("booststats")
    .setDescription("Show boost statistics for this server"),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command must be used in a server.", ephemeral: true });
      return;
    }

    await guild.members.fetch();

    const boosters = guild.members.cache.filter(
      (m): m is GuildMember => m.premiumSince !== null
    );

    const boosterList =
      boosters.size > 0
        ? boosters
            .sort((a, b) =>
              (a.premiumSince?.getTime() ?? 0) - (b.premiumSince?.getTime() ?? 0)
            )
            .map(
              (m, _) =>
                `<@${m.id}> — since <t:${Math.floor((m.premiumSince?.getTime() ?? 0) / 1000)}:R>`
            )
            .slice(0, 10)
            .join("\n")
        : "No boosters yet.";

    const embed = new EmbedBuilder()
      .setColor(0xf47fff)
      .setTitle(`💎 Boost Stats — ${guild.name}`)
      .addFields(
        { name: "Boost Level", value: `Level ${guild.premiumTier}`, inline: true },
        { name: "Total Boosts", value: `${guild.premiumSubscriptionCount ?? 0}`, inline: true },
        { name: "Boosters", value: `${boosters.size}`, inline: true },
        { name: "Top Boosters (up to 10)", value: boosterList }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
