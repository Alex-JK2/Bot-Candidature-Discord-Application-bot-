import { ChatInputCommandInteraction, Message, ModalSubmitInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';
import { formEmbed, formTutorialEmbed } from '../../utils/embeds.js';

export default async function helpCommand(interaction: ChatInputCommandInteraction) {
	//await formTutorialEmbed();
	await interaction.reply(formTutorialEmbed());
}
