import { GuildMember, TextChannel, EmbedBuilder } from "discord.js";

const BOOST_CHANNEL_NAME = "general";

export async function handleBoost(member: GuildMember): Promise<void> {
  const guild = member.guild;

  const channel =
    guild.channels.cache.find(
      (ch) =>
        ch.name === BOOST_CHANNEL_NAME && ch.isTextBased()
    ) as TextChannel | undefined;

  if (!channel) {
    console.warn(
      `⚠️  Boost channel "${BOOST_CHANNEL_NAME}" not found. Create a channel named "${BOOST_CHANNEL_NAME}" or update BOOST_CHANNEL_NAME in src/boost.ts.`
    );
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xf47fff)
    .setTitle("🚀 New Server Boost!")
    .setDescription(
      `**${member.displayName}** just boosted the server! Thank you so much for your support! 💖`
    )
    .setThumbnail(member.displayAvatarURL({ size: 256 }))
    .addFields(
      {
        name: "Booster",
        value: `<@${member.id}>`,
        inline: true,
      },
      {
        name: "Total Boosts",
        value: `${guild.premiumSubscriptionCount ?? 0}`,
        inline: true,
      },
      {
        name: "Server Level",
        value: `Level ${guild.premiumTier}`,
        inline: true,
      }
    )
    .setFooter({ text: guild.name, iconURL: guild.iconURL() ?? undefined })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}
