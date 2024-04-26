import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel, ThreadChannel, roleMention } from 'discord.js';
import { loadConfig } from '../index.js';
import Form from '../models/Form.model.js';
import Question from '../models/Question.model.js';
import Role from '../models/Role.model.js';

export function formEmbed(interaction: BaseInteraction, formData: Form) {
	const { color } = loadConfig();
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle(formData.title);

	if (formData.description) embed.setDescription(formData.description);

	const formButton = new ButtonBuilder()
		.setCustomId(`form-${interaction.channel!.id}`)
		.setLabel(formData.button_text || 'New Application')
		.setStyle(ButtonStyle.Primary);

	const buttonRow = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(formButton);

	return { embeds: [embed], components: [buttonRow] };
}

function decomposerTexte(longTexte: string) {
	const longueurMax = 1000;
	const listeDeTextes = [];
	for (let i = 0; i < longTexte.length; i += longueurMax) {
	  const texteDecoupe = longTexte.substring(i, i + longueurMax);
	  listeDeTextes.push(texteDecoupe);
	}
	return listeDeTextes;
  }

  export function formSubmittedEmbed(originalChannel: TextChannel, rolePermissions: Role[], answers: string[], interaction: BaseInteraction, questions : string[], identifier: string, title : string) {
	const { color } = loadConfig();
	const embed = new EmbedBuilder()
		.setColor(color)
		.setAuthor({ name: title, iconURL: 'https://cdn.discordapp.com/attachments/' });
	embed.addFields({ name: 'User', value: `<@${interaction.user.id}> (${interaction.user.id}) / (${interaction.user.username})` });
    embed.setThumbnail(interaction.user.displayAvatarURL());
	var size = 0;
	var pointer = 0;
	let embedList = [];
	const secondEmbed = new EmbedBuilder()
		.setColor(color)
		.setAuthor({ name: title, iconURL: 'https://cdn.discordapp.com/attachments/' });
	secondEmbed.addFields({ name: 'User', value: `<@${interaction.user.id}> (${interaction.user.id}) / (${interaction.user.username})` });
	const thirdEmbed = new EmbedBuilder()
		.setColor(color)
		.setAuthor({ name: title, iconURL: 'https://cdn.discordapp.com/attachments/' });
	thirdEmbed.addFields({ name: 'User', value: `<@${interaction.user.id}> (${interaction.user.id}) / (${interaction.user.username})` });
	const fourthEmbed = new EmbedBuilder()
		.setColor(color)
		.setAuthor({ name: title, iconURL: 'https://cdn.discordapp.com/attachments/' });
	fourthEmbed.addFields({ name: 'User', value: `<@${interaction.user.id}> (${interaction.user.id}) / (${interaction.user.username})` });
	let secondEmbedNeeded = false;
	let thirdEmbedNeeded = false;
	let fourthEmbedNeeded = false;

	answers.forEach((answer, index) => {
		size = size + answer.length;
		if (answer.length > 1000) {
			var liste_text = decomposerTexte(answer);
			if (questions[index]) {
				liste_text.forEach((part_answer, index2) => {
					pointer = pointer + 1;
					if (pointer < 6) {
						embed.addFields({ name: questions[index] + ` (Partie ${index2 + 1}/${liste_text.length})`, value: part_answer });
					} else if (pointer < 11) {
						secondEmbedNeeded = true;
						secondEmbed.addFields({ name: questions[index] + ` (Partie ${index2 + 1}/${liste_text.length})`, value: part_answer });
					} else if (pointer < 16) {
						thirdEmbedNeeded = true;
						thirdEmbed.addFields({ name: questions[index] + ` (Partie ${index2 + 1}/${liste_text.length})`, value: part_answer });
					} else {
						fourthEmbedNeeded = true;
						fourthEmbed.addFields({ name: questions[index] + ` (Partie ${index2 + 1}/${liste_text.length})`, value: part_answer });
					}
				});
			} else {
				liste_text.forEach((part_answer, index2) => {
					pointer = pointer + 1;
					if (pointer < 6) {
						embed.addFields({ name: `Question ${index + 1}`, value: part_answer[index2] });
					} else if (pointer < 11) {
						secondEmbedNeeded = true;
						secondEmbed.addFields({ name: `Question ${index + 1}`, value: part_answer[index2] });
					} else if (pointer < 16) {
						thirdEmbedNeeded = true;
						thirdEmbed.addFields({ name: `Question ${index + 1}`, value: part_answer[index2] });
					} else {
						fourthEmbedNeeded = true;
						fourthEmbed.addFields({ name: `Question ${index + 1}`, value: part_answer[index2] });
					}
				});
			}
		} else {
			if (questions[index]) {
				pointer = pointer + 1;
				if (pointer < 6) {
					embed.addFields({ name: questions[index], value: answer });
				} else if (pointer < 11) {
					secondEmbedNeeded = true;
					secondEmbed.addFields({ name: questions[index], value: answer });
				} else if (pointer < 16) {
					thirdEmbedNeeded = true;
					thirdEmbed.addFields({ name: questions[index], value: answer });
				} else {
					fourthEmbedNeeded = true;
					fourthEmbed.addFields({ name: questions[index], value: answer });
				}
			} else {
				pointer = pointer + 1;
				if (pointer < 6) {
					embed.addFields({ name: `Question ${index + 1}`, value: answer });
				} else if (pointer < 11) {
					secondEmbedNeeded = true;
					secondEmbed.addFields({ name: `Question ${index + 1}`, value: answer });
				} else if (pointer < 16) {
					thirdEmbedNeeded = true;
					thirdEmbed.addFields({ name: `Question ${index + 1}`, value: answer });
				} else {
					fourthEmbedNeeded = true;
					fourthEmbed.addFields({ name: `Question ${index + 1}`, value: answer });
				}
			}
		}
	});
    const submissionDate = new Date();
    embed.setTimestamp(submissionDate);
	secondEmbed.setTimestamp(submissionDate);
	const approveButton = new ButtonBuilder()
		.setCustomId(`approve-${originalChannel.id}-${identifier}-${pointer}`)
		.setLabel('Accepter')
		.setStyle(ButtonStyle.Success);
	const denyButton = new ButtonBuilder()
		.setCustomId(`deny-${originalChannel.id}-${identifier}-${pointer}`)
		.setLabel('Refuser')
		.setStyle(ButtonStyle.Danger);
	const buttonRow = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(approveButton, denyButton);
	let roleMentionsMsg = '';
	if (rolePermissions.length > 0) {
		for (const rolePermission of rolePermissions) {
			if (rolePermission.permission === 'view') {
				roleMentionsMsg += `${rolePermission.permission} : ${roleMention(rolePermission.role_id)} `;
			} else if (rolePermission.permission === 'action') {
				roleMentionsMsg += `${rolePermission.permission} : ${rolePermission.role_id} `;
			}
		}
	}
	if (fourthEmbedNeeded) {
		embedList.push({ content: roleMentionsMsg, embeds: [embed] });
		embedList.push({ embeds: [secondEmbed] });
		embedList.push({ embeds: [thirdEmbed] });
		embedList.push({ embeds: [fourthEmbed], components: [buttonRow] });
	} else if (thirdEmbedNeeded){
		embedList.push({ content: roleMentionsMsg, embeds: [embed] });
		embedList.push({ embeds: [secondEmbed] });
		embedList.push({ embeds: [thirdEmbed], components: [buttonRow] });
	} else if (secondEmbedNeeded){
		embedList.push({ content: roleMentionsMsg, embeds: [embed] });
		embedList.push({ embeds: [secondEmbed], components: [buttonRow] });
	} else  if (!secondEmbedNeeded && !thirdEmbedNeeded && !fourthEmbedNeeded) {
		embedList.push({ content: roleMentionsMsg, embeds: [embed], components: [buttonRow] });
	}
	
	return embedList;
}

export function formReviewedEmbed(answers: string[], memmber_id: String, questions : string[], approved :boolean, guild: any, title : string) {
	const color = approved ? '#00ff00' : '#ff0000';
	const member = guild.members.cache.get(memmber_id);
	const embed = new EmbedBuilder()
		.setDescription('La candidature a été acceptée !')
		.setColor(color)
		.setAuthor({ name: title, iconURL: 'https://cdn.discordapp.com/attachments/' });
	embed.addFields({ name: 'User', value: `<@${memmber_id}> (${memmber_id}) / (${member.user.username})` });
	embed.setThumbnail(member.user.displayAvatarURL());
	answers.forEach((answer, index) => {
		if (questions[index]) {
			embed.addFields({ name: questions[index], value: answer });
		} else {
			embed.addFields({ name: `Question ${index + 1}`, value: answer });
		}
	});
	const submissionDate = new Date();
	embed.setTimestamp(submissionDate);
	return {embeds: [embed] };
}
export function formFinishedEmbed(approved: boolean) {
	const color = approved ? '#00ff00' : '#ff0000';
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle('Candidature traitée')
		.setDescription(`Cette candidature a été ${approved ? 'approuvée' : 'refusée'}.`);

	return { embeds: [embed] };
}

export function questionRemoveEmbed(question: Question) {
	const { color } = loadConfig();
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle(`Êtes-vous sûr de vouloir supprimer la question avec l'ID #${question.question_id} ?`)
		.setDescription("Cela supprimera définitivement la question ainsi que toutes ses réponses de ce formulaire !");

	const confirmButton = new ButtonBuilder()
		.setCustomId(`confirm-remove-question-${question.question_id}`)
		.setLabel('Confirm')
		.setStyle(ButtonStyle.Danger);

	const cancelButton = new ButtonBuilder()
		.setCustomId(`cancel-remove-question-${question.question_id}`)
		.setLabel('Cancel')
		.setStyle(ButtonStyle.Secondary);

	const buttonRow = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(confirmButton, cancelButton);

	return { embeds: [embed], components: [buttonRow], ephemeral: true };
}

export function formTutorialEmbed() {
	const { color } = loadConfig();
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle('Comment setup le formulaire ?')
		.setDescription(' Pour configurer le bot, il faut commencer par faire la commande ```/form setup submit_channel:``` en choisissant le channel où les réponses seront postées, par la suite il faudra rajouter des questions et éventuellement des actions, puis setup des roles qui pourront répondre pour chaque formulaire. Une fois que vous avez terminé, vous pouvez commencer à accepter de nouvelles candidatures avec la commande ```/form submit state:True```'+"\n"+"\n"+" Les commandes si dessous doivent être faites dans le channel du formulaire correspondant")
		.addFields(
			{ name: '*==========================*`/question`*==========================*', value: 'Gérez les questions de ce formulaire.' },
			{ name: '¤ add', value: 'Permet de rajouter une question', inline: true },
			{ name: '¤ edit', value: "Permet d'éditer une quetion ", inline: true },
			{ name: '¤ list', value: 'Permet de lister les questions ', inline: true },
			{ name: '¤ move', value: "Permet de changer l'ordre des questions", inline: true },
			{ name: '¤ remove', value: 'Permet de delete une question', inline: true },
			{ name: '\u200B', value: '\u200B' },
			{ name: '*==========================*`/action`*==========================*', value: "Gérer les actions à entreprendre en cas d'acceptation/refus de la candidature" },
			{ name: '¤ add', value: 'Permet de rajouter différentes actions en fonction des sous catégories', inline: true },
			{ name: '¤ list', value: 'liste les actions', inline: true },
			{ name: '¤ remove', value: 'Permet de delete une action', inline: true },
			{ name: '\u200B', value: '\u200B' },
			{ name: '*==========================*`/role`*==========================*', value: 'Gérer les autorisations pour des rôles spécifiques' },
			{ name: '¤ set', value: 'Permet de gérer les autorisations sur les réponses', inline: true },
			{ name: '¤ list', value: 'Liste les roles qui ont des autorisations', inline: true },
			{ name: '¤ remove', value: 'Permet de delete des autorisations a des rôles', inline: true },
			{ name: '\u200B', value: '\u200B' },
			{ name: '*==========================*`/form`*==========================*', value: 'Gérer le form lui-même' },
			{ name: '¤ setup', value: 'Permet de créer un formulaire', inline: true },
			{ name: '¤ erase', value: 'Efface toutes les données du formulaire', inline: true },
			{ name: '¤ export', value: "Permet d'extraire toutes les réponses du formulaire en .csv", inline: true },
			{ name: '¤ submit', value: "Permet d'ouvrir le formulaire", inline: true },
			{ name: '¤ list', value: 'Liste tous les formulaires sur tous les discords', inline: true },
			{ name: '¤ setmax', value: 'Permet de mettre un nombre limite de réponse', inline: true },
			{ name: '¤ edit', value: 'Permet de modifier un formulaire', inline: true },
		);


	return { embeds: [embed], ephemeral: true };
}