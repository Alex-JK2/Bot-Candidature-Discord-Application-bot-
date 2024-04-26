import { ChannelType, channelMention, SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import Form from '../models/Form.model.js';
import setupCommand from './form/setup.js';
import editCommand from './form/edit.js';
import eraseCommand from './form/erase.js';
import submitCommand from './form/submit.js';
import exportCommand from './form/export.js';
import setMaxCommand from './form/setmax.js';

export const data = new SlashCommandBuilder()
	.setName('form')
	.setDescription('Commandes de formulaire')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addSubcommand(subcommand => subcommand.setName('submit')
		.setDescription('Activer ou désactiver les soumissions de nouvelles candidatures')
		.addBooleanOption(option => option.setName('state')
			.setDescription('L\'état à définir')
			.setRequired(true),
		),
	)
	.addSubcommand(subcommand => subcommand.setName('setup')
		.setDescription('Démarre le processus de création d\'un nouveau formulaire')
		.addChannelOption(option => option.setName('submit_channel')
			.setDescription('Le canal où envoyer les candidatures répondues')
			.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
			.setRequired(true),
		),
	)
	.addSubcommand(subcommand => subcommand.setName('export')
		.setDescription('Exporte toutes les candidatures du formulaire actuel dans un fichier .csv'),
	)
	.addSubcommand(subcommand => subcommand.setName('erase')
		.setDescription('Efface le formulaire actuel'),
	)
	.addSubcommand(subcommand => subcommand.setName('edit')
		.setDescription('Modifier la question de candidature'),
	)
	.addSubcommand(subcommand => subcommand.setName('list')
		.setDescription('Liste tous les formulaires et leurs canaux respectifs'),
	)
	.addSubcommand(subcommand => subcommand.setName('setmax')
		.setDescription('Définit le nombre maximum de candidatures par candidat')
		.addIntegerOption(option => option.setName('max')
			.setDescription('Nombre maximum de candidatures par candidat (par défaut : Pas de limite)')
			.setMinValue(1),
		),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const subcommand = await interaction.options.getSubcommand();
	const currentForm = await Form.findOne({ where: { form_channel_id: interaction.channel!.id } });

	if (currentForm === null && !['list', 'setup'].includes(subcommand)) {
		await interaction.reply({ content: "Ce channel ne contient pas de formulaire!", ephemeral: true });
		return;
	}

	switch (subcommand) {
	case 'submit': {
		await submitCommand(interaction, currentForm!);
		break;
	}
	case 'setup': {
		if (currentForm) {
			await interaction.reply({ content: 'Ce channel contient déjà un formulaire', ephemeral: true });
		} else {
			await setupCommand(interaction);
		}
		break;
	}
	case 'export': {
		await exportCommand(interaction, currentForm!);
		break;
	}
	case 'erase': {
		await eraseCommand(interaction, currentForm!);
		break;
	}
	case 'edit': {
		await editCommand(interaction, currentForm!);
		break;
	}
	case 'list': {
		const forms = await Form.findAll();
		if (forms.length === 0) {
			await interaction.reply({ content: 'Aucun formulaire trouvé!', ephemeral: true });
		} else {
			const formsList = forms.map((form) => `${channelMention(form.form_channel_id)} - ${form.title}`);
			await interaction.reply({ content: formsList.join('\n'), ephemeral: true });
		}
		break;
	}
	case 'setmax': {
		await setMaxCommand(interaction, currentForm!);
		break;
	}
	default: {
		await interaction.reply({ content: 'Non reconnu!', ephemeral: true });
		break;
	}
	}
}

export default {
	data,
	execute,
};