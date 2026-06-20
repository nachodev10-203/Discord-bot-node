import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import type { Command } from "./index.js";
import { getBoostMessage } from "../storage.js";
import { DEFAULT_BOOST_MESSAGE } from "../boost.js";

export const BOOST_MESSAGE_MODAL_ID = "boost_message_modal";
export const BOOST_MESSAGE_INPUT_ID = "boost_message_input";

export const setboostmessageCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("setboostmessage")
    .setDescription("Customize the boost announcement message (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) {
      await interaction.reply({ content: "This command must be used in a server.", ephemeral: true });
      return;
    }

    const current = await getBoostMessage(interaction.guildId) ?? DEFAULT_BOOST_MESSAGE;

    const modal = new ModalBuilder()
      .setCustomId(BOOST_MESSAGE_MODAL_ID)
      .setTitle("Customize Boost Message");

    const input = new TextInputBuilder()
      .setCustomId(BOOST_MESSAGE_INPUT_ID)
      .setLabel("Boost Message")
      .setStyle(TextInputStyle.Paragraph)
      .setValue(current)
      .setPlaceholder("Use {user} for the booster's mention and {boostsAdded} for the count.")
      .setMinLength(1)
      .setMaxLength(1000)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));

    await interaction.showModal(modal);
  },
};
