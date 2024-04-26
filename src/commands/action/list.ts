import { ChatInputCommandInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';

export default async function listCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const actions = await currentForm.$get('action');
	if (actions.length === 0) {
		await interaction.reply({ content: 'Aucune action n est configurée pour ce formulaire !', ephemeral: true });
	} else {
		let message = 'Les actions suivantes sont configurées pour ce formulaire :\n';
		for (const action of actions) {
			message += `${action.name} - ${action.when} - ${action.do}\n`;
		}
		await interaction.reply({ content: message, ephemeral: true });
	}
}