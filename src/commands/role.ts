import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import Form from '../models/Form.model.js';
import Role from '../models/Role.model.js';
import { loadConfig } from '../index.js';

export const data = new SlashCommandBuilder()
	.setName('role')
	.setDescription('Configure les rôles')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addSubcommand(subcommand => subcommand.setName('list')
		.setDescription('Liste tous les rôles avec les permissions'),
	)
	.addSubcommand(subcommand => subcommand.setName('set')
		.setDescription('Définit un rôle pour voir, agir ou modifier un formulaire')
		.addRoleOption(option => option.setName('role')
			.setDescription('Le rôle pour lequel définir les permissions')
			.setRequired(true),
		)
		.addStringOption(option => option.setName('permission')
			.setDescription('Choisir la permission')
			.setRequired(true)
			.addChoices(
				{ name: 'Etre mentionner sur les nouvelles candidatures', value: 'view' },
				{ name: 'Agir sur les candidatures', value: 'action' },
			),
		),
	)
	.addSubcommand(subcommand => subcommand.setName('remove')
		.setDescription('Supprime un rôle et toutes ses permissions')
		.addRoleOption(option => option.setName('role')
			.setDescription('Le rôle pour lequel supprimer toutes les permissions')
			.setRequired(true),
		),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const subcommand = interaction.options.getSubcommand();
	const currentForm = await Form.findOne({ where: { form_channel_id: interaction.channel!.id } });
	if (!currentForm) {
		await interaction.reply({ content: 'Ce canal n\'est pas un canal de formulaire!', ephemeral: true });
		return;
	}

	switch (subcommand) {
	case 'list': {
		const roles = await currentForm.$get('role');
		if (roles.length === 0) {
			await interaction.reply({ content: "Aucun rôle n'a de permissions pour ce formulaire!", ephemeral: true });
		} else {
			const { color } = loadConfig();
			const embed = new EmbedBuilder()
				.setTitle('Rôles avec des permissions pour ce formulaire')
				.setColor(color);
			// set up embed fields with roles and permissions
			roles.forEach((role) => {
				const roleObj = interaction.guild!.roles.cache.get(role.role_id);
				let rolePermissions = 'Aucune permission définie pour ce rôle';
				if (role.permission === 'view') rolePermissions = 'Peut voir les candidatures';
				if (role.permission === 'action') rolePermissions = 'Peut voir et agir sur les candidatures';
				embed.addFields({
					name: `${roleObj!.name}`,
					value: rolePermissions,
				});
			});
			await interaction.reply({ embeds: [embed], ephemeral: true });
		}
		break;
	}
	case 'set': {
		const role = await interaction.options.getRole('role');
		const permission = await interaction.options.getString('permission');
		Role.upsert({
			form_channel_id: currentForm.form_channel_id,
			role_id: role!.id,
			permission: permission,
		})
			.then(() => interaction.reply({ content: `Permissions définies pour <@&${role!.id}>`, ephemeral: true }))
			.catch((err: Error) => {
				console.error(err);
				interaction.reply({ content: 'Une erreur s\'est produite!', ephemeral: true });
			});
		break;
	}
	case 'remove': {
		const roleToRemove = await interaction.options.getRole('role');
		Role.destroy({ where: { form_channel_id: currentForm.form_channel_id, role_id: roleToRemove!.id } })
			.then(() => interaction.reply({ content: `Toutes les permissions ont été supprimées pour <@&${roleToRemove!.id}>`, ephemeral: true }))
			.catch(() => interaction.reply({ content: 'Une erreur s\'est produite!', ephemeral: true }));
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
	execute,
};