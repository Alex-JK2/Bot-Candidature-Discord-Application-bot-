import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { loadConfig } from '../index.js';
import { formEmbed, formTutorialEmbed } from '../utils/embeds.js';
import helpCommand from './help/explain.js';

export const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription("Permet d'avoir de l'aide pour configurer un formulaire")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	
export async function execute(interaction: ChatInputCommandInteraction) {
	await helpCommand(interaction);
}

export default {
	data,
	execute,
};