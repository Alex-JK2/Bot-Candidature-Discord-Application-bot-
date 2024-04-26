import { ChatInputCommandInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';

export default async function removeCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const name = await interaction.options.getString('name');
	currentForm.$get('action')
		.then(async (actions) => {
			const action = actions.find((a) => a.name === name);
			if (action === null || action === undefined) {
				await interaction.reply({ content: 'Aucune action portant ce nom n est configurée pour ce formulaire !', ephemeral: true });
			} else {
				await action.destroy();
				await interaction.reply({ content: `L'action ${name} a été supprimée de ce formulaire !`, ephemeral: true });
			}
		})
		.catch(async () => {
			await interaction.reply({ content: 'Une erreur s est produite lors de la suppression de l action !', ephemeral: true });
		});
}