import { ChatInputCommandInteraction } from "discord.js";
import Form from "../../models/Form.model.js";

export default async function setMaxCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const max = await interaction.options!.getInteger('max');
	await currentForm.update({ max });
	if (max) {
		await interaction.reply({ content: `Fixe le nombre maximum de candidatures par candidat à ${max}.`, ephemeral: true });
	} else {
		await interaction.reply({ content: 'Suppression de la limite du nombre de candidatures par candidat.', ephemeral: true });
	}
}