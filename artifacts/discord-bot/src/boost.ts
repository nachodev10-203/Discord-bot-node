import { GuildMember, TextChannel, EmbedBuilder } from "discord.js";
import { getBoostChannel } from "./storage.js";

const FALLBACK_CHANNEL_NAME = "general";

export async function handleBoost(member: GuildMember): Promise<void> {
  const guild = member.guild;

  const storedChannelId = await getBoostChannel(guild.id);

  let channel: TextChannel | undefined;

  if (storedChannelId) {
    const found = guild.channels.cache.get(storedChannelId);
    if (found?.isTextBased()) {
      channel = found as TextChannel;
    } else {
      console.warn(
        `⚠️  Stored boost channel (${storedChannelId}) not found or not a text channel. Falling back to "${FALLBACK_CHANNEL_NAME}".`
      );
    }
  }

  if (!channel) {
    channel = guild.channels.cache.find(
      (ch) => ch.name === FALLBACK_CHANNEL_NAME && ch.isTextBased()
    ) as TextChannel | undefined;
  }

  if (!channel) {
    console.warn(
      `⚠️  No boost channel configured and fallback "${FALLBACK_CHANNEL_NAME}" not found. Use /setboostchannel to configure one.`
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
      { name: "Booster", value: `<@${member.id}>`, inline: true },
      { name: "Total Boosts", value: `${guild.premiumSubscriptionCount ?? 0}`, inline: true },
      { name: "Server Level", value: `Level ${guild.premiumTier}`, inline: true }
    )
    .setFooter({ text: guild.name, iconURL: guild.iconURL() ?? undefined })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}
