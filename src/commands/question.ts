import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import Form from '../models/Form.model.js';
import editCommand from './questions/edit.js';
import addCommand from './questions/add.js';
import removeCommand from './questions/remove.js';
import listCommand from './questions/list.js';
import moveCommand from './questions/move.js';

export const data = new SlashCommandBuilder()
	.setName('question')
	.setDescription('Commandes de question')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addSubcommand(subcommand => subcommand.setName('edit')
		.setDescription('Modifier une question dans le formulaire de candidature')
		.addIntegerOption(option => option.setName('id')
			.setDescription('L\'identifiant de la question')
			.setRequired(true)
			.setAutocomplete(true),
		),
	)
	.addSubcommand(subcommand => subcommand.setName('list')
		.setDescription('Liste toutes les questions dans le formulaire de candidature'),
	)
	.addSubcommand(subcommandGroup => subcommandGroup.setName('add')
		.setDescription('Ajouter une question au formulaire de candidature')
	)
	.addSubcommand(subcommand => subcommand.setName('remove')
		.setDescription('Supprimer une question du formulaire de candidature')
		.addIntegerOption(option => option.setName('id')
			.setDescription('L\'identifiant de la question')
			.setRequired(true)
			.setAutocomplete(true),
		),
	)
	.addSubcommand(subcommand => subcommand.setName('move')
		.setDescription('Déplacer une question dans le formulaire de candidature')
		.addIntegerOption(option => option.setName('id')
			.setDescription('L\'identifiant de la question')
			.setRequired(true),
		)
		.addIntegerOption(option => option.setName('position')
			.setDescription('La position vers laquelle déplacer la question')
			.setRequired(true),
		),
	);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const subcommand = interaction.options.getSubcommand();
	const currentForm = await Form.findOne({ where: { form_channel_id: interaction.channel!.id } });

	if (!currentForm) {
		return await interaction.respond([]);
	} else if (subcommand === 'remove' || subcommand === 'edit') {
		// autocomplete question ID for remove and edit subcommands
		const questions = await currentForm.$get('question');
		const focusedValue = interaction.options.getFocused();
		const filtered = questions.filter((question) => {
			const questionId = question.question_id;
			return String(questionId).startsWith(focusedValue);
		}).slice(0, 25);
		await interaction.respond(
			filtered.map((question) => ({ name: question.title, value: question.question_id })),
		);
	}
}
export async function execute(interaction: ChatInputCommandInteraction) {
	const subcommand = interaction.options.getSubcommand();
	const currentForm = await Form.findOne({ where: { form_channel_id: interaction.channel!.id } });

	if (!currentForm) {
		await interaction.reply({ content: "Ce channel ne contient pas de formulaire!", ephemeral: true });
		return;
	}

	switch (subcommand) {
	case 'edit': {
		await editCommand(interaction, currentForm);
		break;
	}
	case 'list': {
		await listCommand(interaction, currentForm);
		break;
	}
	case 'add': {
			await addCommand(interaction, currentForm, subcommand);
			break;
		}
	case 'remove': {
		await removeCommand(interaction, currentForm);
		break;
	}
	case 'move': {
		await moveCommand(interaction, currentForm);
		break;
	}
	default: {
		await interaction.reply('sous commande inconnue');
		break;
	}
	}
}

export default {
	data,
	autocomplete,
	execute,
};