// IMPORT DE FONCTIONS
import {scrollToBottom} from 'functions';

// LES VARIABLES
const chatBoxesContainer = document.querySelector('.cr-wrap-chatboxes');
const reply_box_mobile_icon = document.querySelector('.cr-display-reply-box');
const bfr_content = document.querySelector('.bfr-content');

// Aller automatiquement au bas de la page
// chaBoxesContainer.scrollTop = chaBoxesContainer.scrollHeight;
scrollToBottom(chatBoxesContainer);
window.onscroll = function(){
    console.log(chatBoxesContainer.scrollTop);
    console.log(chatBoxesContainer.scrollHeight);
};


/**
 * PROBLEME
 * A l'ajout de nouvelles chabox, la page ne restera pas au bottom
 * il faut trouver un moyen de régler ça.
 * Trouver un moyen par exemple que les nouvelles boîtes
 * poussent les anciennes boîtes plus haut.
 * 
 * SOLUTION(essayée, pas efficace)
 * Chaque fois qu'un nouveau message est ajouté
 * On met le premier en display none
 * ce qui fait qu'on ne reste qu'avec quelque cinq chatbox sur l'écran.
 * Si l'utilisateur remonte, alors on affiche les premiers.
 * On peut utiliser l'IntersectionObserver si elle se révèle idoine à la situation.
 */


// Faire apparaître la boîte qui contient
// le champ de saisie pour l'envoie des répliques
// sur mobile
reply_box_mobile_icon?.addEventListener('click',function(){
    bfr_content.classList.toggle('bfr-content-js');
})