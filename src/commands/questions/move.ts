import { ChatInputCommandInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';

export default async function moveCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const id = interaction.options.getInteger('id');
	const position = interaction.options.getInteger('position');

	const questions = await currentForm.$get('question');
	const question = await questions.find((q) => q.question_id === id);
	const questionAtPosition = await questions.find((q) => q.order === position);
	if (!question || !questionAtPosition) {
		await interaction.reply({ content: 'Il n y a aucun doute avec cet identifiant ou cette position configurée pour ce formulaire !', ephemeral: true });
		return;
	}

	// swap the order of the questions
	await interaction.deferReply({ ephemeral: true });
	try {
		await questionAtPosition.update({
			order: question.order,
		});

		await question.update({
			order: position,
		});

		await interaction.followUp({ content: `La question a été déplacée vers la position ${position}!`, ephemeral: true });
	} catch (error) {
		console.error(error);
		await interaction.followUp({ content: 'Une erreur s est produite lors du déplacement de la question !', ephemeral: true });
	}
}