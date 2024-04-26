# Bot Candidature Discord (Application bot)


Créez des formulaires, recevez des candidatures et choisissez qui approuver, le tout au sein de votre propre serveur Discord. Chaque formulaire est géré dans un seul canal où les candidatures sont répondues à l'intérieur des fils de discussion.

## Fonctionnalités Clés

* Permet d'édit totalement les formulaires sous form d'embed
* Utilise les fonctionnalités d'embed et de modals de discord
* Permet de rajouter des actions et des limitations pour chaque candidature
* Limité par l'API discord à 5 questions avec 4000 charactères max par réponse et par formulaire
* Un formulaire par channel
* Réactivité



## Installation

1. Installez Node.js (version recommandée 18 ou plus récente)
2. Clonez ce repository
3. Dans un terminal à l'intérieur du répertoire du dépôt, exécutez la commande `npm install`.
4. Exécutez la commande `node --loader ts-node/esm src/index.ts` (commande expérimentale qui risque de ne plus être supporté mais permettant de load correctement)
5. Elle générera le fichier `config.json` et vous invitera à configurer le token et l'ID client du bot dans le fichier `config.json`.
6. Exécutez à nouveau `node --loader ts-node/esm src/index.ts` pour démarrer le bot.
7. Invitez le bot sur votre serveur


## Usage

* Il est possible d'executer la commande  `/help` qui décrit les commandes

Une fois que vous êtes satisfait de la configuration, la dernière commande à exécuter est `/form submit True` pour activer les soumissions de formulaire.

## Crédits
Repris de @JuanDelPueblo pour la gestion database et commandes et modifié sous forme de modals discord 
