import { ChannelType, SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import Form from '../models/Form.model.js';
import listCommand from './action/list.js';
import addCommand from './action/add.js';
import removeCommand from './action/remove.js';

export const data = new SlashCommandBuilder()
	.setName('action')
	.setDescription('Configure les actions pour le formulaire actuel')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addSubcommand(subcommand => subcommand.setName('list')
		.setDescription('Liste les actions pour le formulaire actuel'),
	)
	.addSubcommandGroup(subcommandGroup => subcommandGroup.setName('add')
		.setDescription('Ajoute une action à effectuer en cas d\'approbation ou de rejet')
		.addSubcommand(subcommand => subcommand.setName('addrole')
			.setDescription('Ajoute un rôle à l\'utilisateur')
			.addStringOption(option => option.setName('name')
				.setDescription('Nom pour identifier l\'action')
				.setRequired(true),
			)
			.addStringOption(option => option.setName('when')
				.setDescription('Quand effectuer l\'action')
				.setRequired(true)
				.addChoices(
					{ name: 'Approuvé', value: 'approved' },
					{ name: 'Rejeté', value: 'rejected' },
				),
			)
			.addRoleOption(option => option.setName('role')
				.setDescription('Le rôle à ajouter')
				.setRequired(true),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('removerole')
			.setDescription('Supprime un rôle de l\'utilisateur')
			.addStringOption(option => option.setName('name')
				.setDescription('Nom pour identifier l\'action')
				.setRequired(true),
			)
			.addStringOption(option => option.setName('when')
				.setDescription('Quand effectuer l\'action')
				.setRequired(true)
				.addChoices(
					{ name: 'Approuvé', value: 'approved' },
					{ name: 'Rejeté', value: 'rejected' },
				),
			)
			.addRoleOption(option => option.setName('role')
				.setDescription('Le rôle à supprimer')
				.setRequired(true),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('sendmessage')
			.setDescription('Envoyer un message dans un canal')
			.addStringOption(option => option.setName('name')
				.setDescription('Nom pour identifier l\'action')
				.setRequired(true),
			)
			.addStringOption(option => option.setName('when')
				.setDescription('Quand effectuer l\'action')
				.setRequired(true)
				.addChoices(
					{ name: 'Approuvé', value: 'approved' },
					{ name: 'Rejeté', value: 'rejected' },
				),
			)
			.addChannelOption(option => option.setName('channel')
				.setDescription('Le canal où envoyer le message')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
			)
			.addStringOption(option => option.setName('message')
				.setDescription('Le message à envoyer (utilisez {user} pour mentionner l\'utilisateur)')
				.setRequired(true),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('sendmessagedm')
			.setDescription('Envoyer un message à l\'utilisateur')
			.addStringOption(option => option.setName('name')
				.setDescription('Nom pour identifier l\'action')
				.setRequired(true),
			)
			.addStringOption(option => option.setName('when')
				.setDescription('Quand effectuer l\'action')
				.setRequired(true)
				.addChoices(
					{ name: 'Approuvé', value: 'approved' },
					{ name: 'Rejeté', value: 'rejected' },
				),
			)
			.addStringOption(option => option.setName('message')
				.setDescription('Le message à envoyer')
				.setRequired(true),
			),
		)
	)
	.addSubcommand(subcommand => subcommand.setName('remove')
		.setDescription('Supprime une action à effectuer en cas d\'approbation ou de rejet')
		.addStringOption(option => option.setName('name')
			.setDescription('Nom qui identifie l\'action')
			.setRequired(true)
			.setAutocomplete(true),
		),
	);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const subcommand = interaction.options.getSubcommand();
	const currentForm = await Form.findOne({ where: { form_channel_id: interaction.channel!.id } });

	if (!currentForm) {
		return await interaction.respond([]);
	}

	if (subcommand === 'remove') {
		// autocomplete action names
		const actions = await currentForm.$get('action');
		const focusedValue = interaction.options.getFocused();
		const filtered = actions.filter((action) => action.name.startsWith(focusedValue)).slice(0, 25);
		await interaction.respond(
			filtered.map((action) => ({ name: action.name, value: action.name })),
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
	case 'list': {
		await listCommand(interaction, currentForm);
		break;
	}
	case 'addrole':
	case 'removerole':
	case 'sendmessage':
	case 'sendmessagedm': {
		await addCommand(interaction, currentForm, subcommand);
		break;
	}
	case 'remove': {
		await removeCommand(interaction, currentForm);
		break;
	}
	default: {
		await interaction.reply('Non reconnu!');
		break;
	}
	}
}

export default {
	data,
	autocomplete,
	execute,
};