import { GuildMember, TextChannel, EmbedBuilder } from "discord.js";
import { getBoostChannel } from "./storage.js";

const FALLBACK_CHANNEL_NAME = "general";

export async function handleBoost(member: GuildMember, boostsAdded = 1): Promise<void> {
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
    .setThumbnail(member.displayAvatarURL({ size: 256 }))
    .setDescription(
      [
        `✨ Muito obrigado <@${member.id}> pelo boost!`,
        `🚀 Você acabou de adicionar **${boostsAdded}** boost(s) ao servidor.`,
        `🎖️ Seu apoio ajuda o servidor a crescer cada vez mais.`,
        `❤️ Aproveite seus benefícios exclusivos de Booster.`,
      ].join("\n")
    )
    .setFooter({ text: guild.name, iconURL: guild.iconURL() ?? undefined })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}
