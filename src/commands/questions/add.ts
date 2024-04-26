import { ChatInputCommandInteraction, Message, ModalSubmitInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';
import { editQuestionModal } from '../../utils/modals.js';
export default async function addCommand(interaction: ChatInputCommandInteraction, currentForm: Form, type: string) {
	//const required = interaction.options.getBoolean('required') ?? false;
	//let min = interaction.options.getInteger('min');
	//let max = interaction.options.getInteger('max');
	const questions = await currentForm.$get('question');
	const questionOrder = questions.length + 1;
	if (questionOrder >= 6){
		await interaction.reply({ content: 'Il ne peut y avoir que 5 questions au maximum', ephemeral: true });
		return;
	}
	await editQuestionModal(interaction);
	const modalFilter = (i: ModalSubmitInteraction) => i.customId.startsWith(`edit_question-${interaction.channel!.id}`);
	const modalInteraction = await interaction.awaitModalSubmit({ time: 43_200_000, filter: modalFilter })
		.catch(() => {
			interaction.followUp({ content: 'Création de la question annulée ou une erreur s\'est produite!', ephemeral: true });
		});
	if (!modalInteraction) return;
	const questionTitle = modalInteraction.fields.getTextInputValue(`question_title-${interaction.channel!.id}`);
	const questionDescription = modalInteraction.fields.getTextInputValue(`question_description-${interaction.channel!.id}`) ?? '';
	try {
		switch (type) {
		case 'add': {
			await currentForm.$create('question', {
				type: type,
				title: questionTitle,
				description: questionDescription,
				required: false,
				min: 1,
				max: 4000,
				order: questionOrder,
			});
			await modalInteraction.reply({ content: 'La question a été ajoutée à ce formulaire!', ephemeral: true });
			break;
		}
		default: {
			await modalInteraction.reply({ content: 'Vous n\'avez pas saisi un type de question valide!', ephemeral: true });
			return;
		}
		}
	} catch (error) {
		console.error(error);
		await interaction.followUp({ content: 'Une erreur s\'est produite lors de l\'ajout de la question!', ephemeral: true });
	}
}
