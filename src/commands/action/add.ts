import { ChatInputCommandInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';

export default async function addCommand(interaction: ChatInputCommandInteraction, currentForm: Form, action: string) {
	const name = interaction.options.getString('name');
	const when = interaction.options.getString('when');
	
	const actions = await currentForm.$get('action');
	const existingAction = actions.find((a) => a.name === name);
	if (existingAction) {
		await interaction.reply({ content: 'Il existe déjà une action portant ce nom configurée pour ce formulaire !', ephemeral: true });
		return;
	}

	try {
		switch (action) {
		case 'removerole':
		case 'addrole': {
			const role = interaction.options.getRole('role');

			await currentForm.$create('action', {
				name: name,
				when: when,
				do: action,
				role_id: role!.id,
			});

			await interaction.reply({ content: `L'action ${name} a été ajoutée à ce formulaire !`, ephemeral: true });

			break;
		}
		case 'ban':
		case 'kick': {
			const reason = interaction.options.getString('reason');
			await currentForm.$create('action', {
				name: name,
				when: when,
				do: action,
				reason: reason,
			});

			await interaction.reply({ content: `L'action ${name} a été ajoutée à ce formulaire !`, ephemeral: true });

			break;
		}
		case 'sendmessage': {
			const channel = interaction.options.getChannel('channel');
			const message = interaction.options.getString('message');
			currentForm.$create('action', {
				name: name,
				when: when,
				do: action,
				message_channel_id: channel!.id,
				message: message,
			});

			await interaction.reply({ content: `L'action ${name} a été ajoutée à ce formulaire !`, ephemeral: true });
			break;
		}
		case 'sendmessagedm': {
			const message = interaction.options.getString('message');

			await currentForm.$create('action', {
				name: name,
				when: when,
				do: action,
				message: message,
			});

			await interaction.reply({ content: `L'action ${name} a été ajoutée à ce formulaire !`, ephemeral: true });

			break;
		}
		case 'delete': {
			await currentForm.$create('action', {
				name: name,
				when: when,
				do: action,
			});
			await interaction.reply({ content: `L'action ${name} a été ajoutée à ce formulaire !`, ephemeral: true });
			break;
		}
		default: {
			await interaction.reply({ content: 'Ce n est pas une action valable !', ephemeral: true });
			break;
		}
		}
	} catch (err) {
		console.error(err);
		await interaction.reply({ content: 'Une erreur s est produite lors de la création de l action !', ephemeral: true });
		return;
	}
}