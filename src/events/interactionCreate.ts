import {Events, ChannelType, BaseInteraction, TextChannel, ThreadChannel, ModalBuilder, TextInputBuilder,ActionRowBuilder, TextInputStyle, APIEmbed, Message  } from 'discord.js';
import Form from '../models/Form.model.js';
import Discord from 'discord.js';
import Answer from '../models/Answer.model.js';
import { formSubmittedEmbed, formFinishedEmbed, formReviewedEmbed } from '../utils/embeds.js';
import executeAction from '../utils/actions.js';
import roleCommand from '../commands/role.js';
import questionCommand from '../commands/question.js';
import actionCommand from '../commands/action.js';
import formCommand from '../commands/form.js';
import helpcommand from '../commands/help.js';

export const name = Events.InteractionCreate;
export async function execute(interaction: BaseInteraction) {
	if (interaction.isChatInputCommand()) {
		const command = interaction.commandName;
		if (!['role', 'help', 'question', 'action', 'form'].includes(command)) {
			console.error(`Aucune commande correspondante à ${interaction.commandName} n'a été trouvée.`);
			return;
		}
		try {
			switch (command) {
				case 'role':
					await roleCommand.execute(interaction);
					break;
				case 'help':
					await helpcommand.execute(interaction);
					break;
				case 'question':
					await questionCommand.execute(interaction);
					break;
				case 'action':
					await actionCommand.execute(interaction);
					break;
				case 'form':
					await formCommand.execute(interaction);
					break;
			}
		} catch (error) {
			console.error(`Erreur lors de l'exécution de ${interaction.commandName}`);
			console.error(error);
		}
	} else if (interaction.isButton()) {
		const button = interaction.customId;
		if (button.startsWith('form-')) { 
			try {
				const formChannelId = button.split('-')[1];
				const form = await Form.findOne({
					where: { form_channel_id: formChannelId },
				});

				if (form === null) {
					return interaction.reply({ content: 'Impossible de trouver le formulaire pour cette application.', ephemeral: true });
				}

				if (!form.enabled) {
					return interaction.reply({ content: 'Ce formulaire n\'est actuellement pas ouvert aux soumissions.', ephemeral: true });
				}

				if (form.max) {
					const applications = await form.$get('application', { where: { form_channel_id: formChannelId, user_id: interaction.user.id } });
					if (applications.length >= form.max) {
						return interaction.reply({ content: `Vous ne pouvez pas soumettre plus de ${form.max} candidatures à la fois!`, ephemeral: true });
					}
				}

				//await interaction.deferUpdate();
				const questions = await form.$get('question', { order: [['order', 'ASC']] });
				var nombre_questions = questions.length;

				try {
					const modal = new ModalBuilder()
						.setCustomId(button)
						.setTitle('Candidature');
					for (let i = 0; i < nombre_questions; i++) {
						const currentQuestion = questions[i];
						const question = new TextInputBuilder()
							.setCustomId(`${i + 1}`)
							.setLabel(currentQuestion.title)
							.setPlaceholder(currentQuestion.description)
							.setStyle(TextInputStyle.Paragraph);
						const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(question);
						modal.addComponents(actionRow);
					}
					await interaction.showModal(modal);
				} catch (error) {
					console.error(error);
				}
			} catch (error) {
				if (error.message === 'Unknown Channel') {
					return interaction.reply({ content: 'Votre candidature a été supprimée manuellement ou en raison d\'une inactivité.', ephemeral: true });
				}
				console.error(error);
				return interaction.reply({ content: 'Impossible de créer le thread d\'application.', ephemeral: true });
			}
		} else if (button.startsWith('approve-') || button.startsWith('deny-')) { // approuver ou refuser une candidature
			try {
				const approved = button.startsWith('approve-');
				let originalChannelid = "";
				let idWithSuffix =""
				let numberend = 0;
				if (button.startsWith('approve-')) {
					originalChannelid = button.replace(/^approve-(\d+).*/, "$1");
					idWithSuffix = button.replace(/^approve-(\d+)-(.*)/, "$2");
					let match = idWithSuffix.match(/^(.*?)-(\d+)$/);
					if (match) {
						numberend = parseInt(match[2], 10);
						idWithSuffix = match[1];
					}
				} else if (button.startsWith('deny-')) {
					originalChannelid = button.replace(/^deny-(\d+).*/, "$1");
					idWithSuffix = button.replace(/^deny-(\d+)-(.*)/, "$2");
					let match = idWithSuffix.match(/^(.*?)-(\d+)$/);
					if (match) {
						numberend = parseInt(match[2], 10);
						idWithSuffix = match[1];
					}
				}
				const thread = interaction.channel as ThreadChannel;
				const form = await Form.findOne({
					where: { form_channel_id: originalChannelid },
				});
				if (form === null) {
					return interaction.reply({ content: 'Unable to find form for this application.', ephemeral: true });
				}
				// check if the user has permission to approve/deny applications
				const rolePermissions = await form.$get('role');
				const roles = await Promise.all(rolePermissions
					.filter(r => r.permission === 'action')
					.map(async role => await interaction.guild!.roles.fetch(role.role_id)));
				const member = await interaction.guild!.members.fetch(interaction.user.id);
				let hasPermission = false;
				for (const role of roles) {
					if (role === undefined || role === null) continue;
					if (member.roles.cache.some(r => r.name === role!.name)) {
						hasPermission = true;
					}
				}
				if (!hasPermission) {
					await interaction.deferUpdate();
					return;
				}
				const applications = await form.$get('application', {
					where: { form_channel_id: originalChannelid },
				});
				let applicationTrouvee = applications[applications.length - 1];
				applications.forEach((application) => {
				  if (application.thread_id === idWithSuffix) {
					applicationTrouvee = application;
					return; 
				  }
				});
				
				await applicationTrouvee.update({
					approved,
				});
				var existingThread = false;
				const channel2 = interaction.channel as TextChannel;
				if (channel2 instanceof TextChannel) {
					const threads = await channel2.threads.fetch();
					threads.threads.forEach(async (thread) => {
						if (thread instanceof ThreadChannel && !thread.archived) {
							if (thread.id == interaction.message.id){
								existingThread = true;
								await thread.send(formFinishedEmbed(approved));
							}
						}
					});
				}else{
					console.log("Erreur lors de la récupération du canal");
				}
				if (existingThread==false) {
					const threadChannel = await channel2.threads.create({
						name: `Application Approval Thread`,
						autoArchiveDuration: 60,
						startMessage: interaction.message,
					});
					await threadChannel.send(formFinishedEmbed(approved));
				}
				const guild = interaction.guild;

				var messagesToEditBefore = 0;
				if (numberend > 5 && numberend < 11) {
					messagesToEditBefore = 1;
				} else if (numberend > 10 && numberend < 16) {
					messagesToEditBefore = 2;
				} else if (numberend > 15) {
					messagesToEditBefore = 3;
				}else{
					//console.log("numberend : ", numberend);
					//console.log("need to replace one messages");
				}
				const interactionmessage = interaction.message;
				const messageChannel = interactionmessage.channel;

				async function getAnswersFromMessage(message: Message): Promise<{ [key: string]: string }> {
					const answers: { [key: string]: string } = {};
					if (message.embeds.length > 0 && message.embeds[0].fields.length > 0) {
						for (let i = 1; i < message.embeds[0].fields.length; i++) {
							const field = message.embeds[0].fields[i];
							answers[field.name] = field.value;
						}
					}

					return answers;
				}

				if (messagesToEditBefore > 0) {
					await messageChannel.messages.fetch({ before: interactionmessage.id, limit: messagesToEditBefore })
						.then(messages => {
							messages.forEach(async (msg: Message) => {
								try {
									const currentAnswers = await getAnswersFromMessage(msg);
									const keys: string[] = Object.keys(currentAnswers);
									await msg.edit({
										content: "",
										components: [],
										embeds: [
											formReviewedEmbed(
												Object.values(currentAnswers),
												applicationTrouvee.user_id,
												keys,
												approved,
												guild,
												form.title
											).embeds[0]
										]
									});
								} catch (err) {
									console.error(`Erreur lors de l'édition du message ${msg.id} :`, err);
								}
							});
						})
						.catch(err => {
							console.error("Erreur lors de la récupération des messages à éditer :", err);
						});
				}
				try {
					const currentAnswers2 = await getAnswersFromMessage(interactionmessage);
					const keys: string[] = Object.keys(currentAnswers2);
					const values: string[] = Object.values(currentAnswers2);
					await interactionmessage.edit({
						content: "",
						components: [],
						embeds: [
							formReviewedEmbed(
								Object.values(currentAnswers2) as string[],
								applicationTrouvee.user_id,
								keys,
								approved,
								guild,
								form.title
							).embeds[0],
						],
					});
				} catch (error) {
					console.error("Erreur lors de la récupération des messages à éditer :", error);
				}
				const actions = await form.$get("action");
				if (actions.length === 0) {
					return interaction.reply({ content: "Ce form n'a pas d'actions de setup.", ephemeral: true });
				}
				const appMember = await interaction.guild!.members.fetch(applicationTrouvee.user_id);
				if (appMember === null) {
					return interaction.reply({ content: "Impossible de trouver le membre pour cette candidature. Impossible d'exécuter des actions si le membre n'est pas présent dans la guilde.", ephemeral: true });
				}
				// execute actions
				await Promise.all(actions.map(async action => {
					if (action.when === 'approved' && approved) {
						await executeAction(interaction, appMember, action);
					} else if (action.when === 'rejected' && !approved) {
						await executeAction(interaction, appMember, action);
					}
				}));
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'Une erreur s\'est produite lors du traitement de votre demande.', ephemeral: true });
			}
		}
	} else if (interaction.isAutocomplete()) {
		const command = interaction.commandName;
		if (!command) return;
		try {
			switch (command) {
			case 'action':
				await actionCommand.autocomplete(interaction);
			case 'question':
				await questionCommand.autocomplete(interaction);
			}
		} catch (error) {
			console.error(error);
		}
	} else if (interaction.isModalSubmit()){
		if (interaction.customId.startsWith('form-')) {
			// await interaction.reply({ content: `Votre soumission a été reçue avec succès!`, ephemeral: true });
			const formChannelId = interaction.customId.split('-')[1];
			const form = await Form.findOne({
				where: { form_channel_id: formChannelId },
			});
			if (form === null) {
				return interaction.reply({ content: 'Impossible de trouver le formulaire pour cette soumission.', ephemeral: true });
			}
			var questions = await form.$get('question', { order: [['order', 'ASC']] });
			const rolePermissions = await form.$get('role');
			const submitChannelId = form.dataValues.submit_channel; 
			let submitChannel = interaction.guild!.channels.cache.get(submitChannelId);
			if (!submitChannel || !(submitChannel instanceof Discord.TextChannel)) {
			return console.error("Le canal n'existe pas ou le bot n'a pas accès à ce canal.");
			}
			let originalChannel = interaction.guild!.channels.cache.get(interaction.channel!.id);
			if (!originalChannel || !(originalChannel instanceof Discord.TextChannel)) {
				return console.error("Le canal n'existe pas ou le bot n'a pas accès à ce canal.");
				}
			const answers = [];
			const questions_list = [];
			var nombre_questions = questions.length;
			for (let i = 0; i < nombre_questions; i++) {
				var response = interaction.fields.getTextInputValue(`${i + 1}`);
				answers.push(response);
				let currentQuestion = questions[i].title;
				questions_list.push(currentQuestion);
			}
			let result = '';
			const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			const charactersLength = characters.length;
			for (let i = 0; i < 36; i++) {
			  result += characters.charAt(Math.floor(Math.random() * charactersLength));
			}
			const application = await form.$create('application', {
				form_channel_id: interaction.channel!.id,
				thread_id: result,
				user_id: interaction.user.id,
				submitted: false,
			});
			var embeds_list = formSubmittedEmbed(originalChannel, rolePermissions, answers, interaction, questions_list, result, form.title);
			for (const embeds of embeds_list) {
				await submitChannel.send(embeds);
			}
			await application.update({
				submitted: true,
				submitted_at: new Date(),});
			for (let i = 0; i < questions.length; i++) {
				const question = questions[i];
				const questionId = question.question_id;
				const answer = answers[i];
				await Answer.create({
					thread_id: result,
					question_id: questionId,
					answer: {
						type: 'text',
						content: answer,
				  	},
				});
			}
			await interaction.reply({ content: `Votre soumission a été reçue avec succès!`, ephemeral: true });
		}
	}
}