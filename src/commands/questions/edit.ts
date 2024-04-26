import { ChatInputCommandInteraction, Message, ModalSubmitInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';
import { editQuestionModal } from '../../utils/modals.js';

export default async function editCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const id = interaction.options.getInteger('id');

	const questions = await currentForm.$get('question');
	const existingQuestion = questions.find((q) => q.question_id === id);
	if (!existingQuestion) {
		await interaction.reply({ content: "Il n'y a aucune question avec cet ID configurée pour ce formulaire !", ephemeral: true });
		return;
	}

	// get the question title and description via a modal
	await editQuestionModal(interaction);
	const modalFilter = (i: ModalSubmitInteraction) => i.customId.startsWith(`edit_question-${interaction.channel!.id}`);
	const modalInteraction = await interaction.awaitModalSubmit({ time: 43_200_000, filter: modalFilter })
		.catch(() => {
			interaction.followUp({ content: "La mise à jour de la question a été annulée ou quelque chose s'est mal passé !", ephemeral: true });
		});

	if (!modalInteraction) return;

	const questionTitle = modalInteraction.fields.getTextInputValue(`question_title-${interaction.channel!.id}`);
	const questionDescription = modalInteraction.fields.getTextInputValue(`question_description-${interaction.channel!.id}`) ?? '';
	const type = existingQuestion.type;

	try {
		switch (type) {
		case 'text':
		//case 'number':
		//case 'fileupload': 
		{
			await existingQuestion.update({
				title: questionTitle,
				description: questionDescription,
			});

			await modalInteraction.reply({ content: 'Cette question a été mise à jour !', ephemeral: true });

			break;
		}
		default: {
			await interaction.followUp({ content: 'Error with the question selection', ephemeral: true });
			return;
		}
		}
	} catch (error) {
		console.error(error);
		await interaction.followUp({ content: 'Une erreur s\'est produite lors de la mise à jour de la question !', ephemeral: true });
	}
}