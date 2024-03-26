import {
    updateRessource,
    buildRessourcePath,
    deleteRessource,
    showVerdictToUser,
    backToTop,
    toggleOnOutLine,
    getRessource,
    postRessource,
    buildArtCardEdSpace
} from 'functions';
import { formatDate } from 'functions';

// LES VARIABLES
const table = document.getElementById('dash-user-table');
const checkboxes = document.querySelectorAll('.checker.checker-for-request');
const comments = document.querySelector('.dash-comment-cards');
const delete_category_btns = document.querySelectorAll('.dash-delete-category');
const opinion_cards = document.querySelector(".dash-list-opinions");
const sidebar = document.querySelector('.dash-sidebar');
const menu_hamburger = document.querySelector('.dash-menu-hamburger');
const main = document.querySelector('.dash-main');
const messages_cards = document.querySelector('.dash-list-messages');
const change_article_status = document.querySelectorAll('.dash-status-btn');
const show_draft = document.querySelectorAll('.dash-draft-show');
const draft_panel = document.querySelector('.dash-draft');
const hide_draft = document.querySelector('.dash-close-draft');
const for_editor_all_cards = document.querySelectorAll('.dash-card-for-editor-filtering-purpose');
const contains_draft_cards = document.querySelector('.dash-contains-cards');
const page_content = document.querySelector('.dash-page-content');
const main_container = document.querySelector('main');
const search_form = document.querySelector('.dash-form');
const wrap_cards_filterd_in_editor_space = document.querySelector('.dash-results-cards');
const search_form_editor_space_statut = document.querySelector('.gen-status');
const editor_space_search_input = document.getElementById('search-input');


// FONCTIONS LOCALES
function decrementCounter(id){
    const counter = document.getElementById(id);
    let counter_value = parseInt(counter.innerHTML);
    -- counter_value 
    counter.innerHTML = counter_value;
}

function checkboxToggle(e,funct=undefined){
    if(
        e.target.nodeName === "INPUT"
        &&
        e.target.matches('input.checker.checker-for-request')
    ) {
        let el = e.target;
        let id = el.getAttribute('data-id');

        if(el.checked){
            document.getElementById(id).classList.add("dash-check-js");
            // PREMIER ACTION - si CHECKBOX is True, que faire ?
            funct(el);

        } else {
            document.getElementById(id).classList.remove("dash-check-js");
            // DEUXIEME ACTION - si CHECKBOX is False, que faire ?
            funct(el)
        }

        /**
         * Chaque fois, on recevra une réponse Json du Backend
         * Cette réponse contiendra l'URL qui effectue l'action contraire
         * De celle qu'on vient d'effectuer.
         * Quand on autorise de poster un avis public,
         * le backend va nous renvoyer un lien pour 
         * enlever cette autorisation. Ce sera à nous ensuite,
         * de passer ce lien au frontend pour qu'on prochain clic
         * c-à-d quand le checkbox qui de l'état coché à l'état décoché
         * l'action contraire qui est celle d'enlever l'autorisation de post
         * soit exécutée.
         * Et ainsi de suite.
         * Cette URL de l'action contraire sera stocké dans la propriété URL
         * de l'objet Json reçu en réponse.
         */
    }
}


// Scroller automatiquement jusqu'au haut de la page
backToTop()

// Ajouter ou Retirer un utilisateur
// du groupe des rédacteurs
// sur toggle d'une checkbox AJAX
function addEditorOrRemove(element){
    const link = element.getAttribute('data-linkToEditor');
    const toRessourcePath = buildRessourcePath(link);
    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value 
    const marker = element.getAttribute("data-forMarker");
    const showMarker = document.getElementById(marker);



    updateRessource(toRessourcePath,csrf_token)
    .then(response=>{
        if(response.ok === true){
            response.json()
            .then(JsonData=>{
                let {URL} = JsonData;
                element.setAttribute('data-linkToEditor',URL);

                if(element.checked) {
                    showMarker.innerHTML = "<span class='fa-solid fa-certificate dash-isEditor'></span>"
                } else{
                    showMarker.innerHTML = "<span class='fa-solid fa-certificate dash-not-editor'></span>"
                }
            })
        } else{
            showVerdictToUser(false,100,2000,"Echec d'ajouter au groupe des éditeurs !")
        }
    })

}


table?.addEventListener('click',(e)=>{
    checkboxToggle(e,addEditorOrRemove);
});


// IDEM - Poster ou enlever de la page d'accueil
// un avis utilisateur
function postOpinionOrNOT(element){
    const link = element.getAttribute("data-toUpdate");
    const toRessourcePath = buildRessourcePath(link);
    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value 

    updateRessource(toRessourcePath,csrf_token)
    .then(response=>{
        if(response.ok === true){
            response.json()
            .then(JsonData=>{
                let {URL} = JsonData;
                element.setAttribute('data-toUpdate',URL);                
            })
        } else{
            showVerdictToUser(false,100,2000,"N'a pas pu poster l'avis")
        }
    })
}

opinion_cards?.addEventListener('change',(e)=>{
    checkboxToggle(e,postOpinionOrNOT);
});


// IDEM - Marquer un message comme lu
// l'inverse n'arrivera pas
function messageRead(element) {
    const link = element.getAttribute("data-linkToMessage");
    const toRessourcePath = buildRessourcePath(link);
    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value 
    const id = element.getAttribute('data-id');

    updateRessource(toRessourcePath,csrf_token)
    .then(response=>{
        if(response.ok === true){
            response.json()
            .then(JsonData=>{
                showVerdictToUser(true,100,2000,"Message Lu !");
                document.getElementById(id).remove();
            })
        } else{
            showVerdictToUser(false,100,2000,"N'a pas pu lire le message !")
        }
    })
}

messages_cards?.addEventListener('change',(e)=>{
    checkboxToggle(e,messageRead)
})

// Supprimer message en AJAX
messages_cards?.addEventListener('click',function(e){
    if(
        e.target.nodeName === "A"
        &&
        e.target.matches("a.dash-delete-message")
    ) {
        e.preventDefault();
        const element = e.target;
        const link = element.getAttribute('href');
        const toRessourcePath = buildRessourcePath(link);
        const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value   
        const id = element.getAttribute("data-id"); 

        deleteRessource(toRessourcePath,csrf_token)
        .then(response=>{
            if(response.ok === true){
                document.getElementById(`card-${id}`).remove()
                showVerdictToUser(true,100,2000,"Message supprimé !")
                decrementCounter("dash-count-messages");
            } else{
                showVerdictToUser(false,100,2000,"Echec de suppression !")
            }
        })

    }
})


// DELEGATION SUPPRIMER UTILISATEURS
// SUR LE SERVEUR
table?.addEventListener('click',function(e){

        const btn = e.target;

        if (
            btn.nodeName === "A"
            &&
            btn.matches('a.dash-disable-enable')    
        ){
            e.preventDefault();
            const link = btn.getAttribute('href');
            const toRessourcePath = buildRessourcePath(link);
            const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value 

            updateRessource(toRessourcePath,csrf_token)
            .then(response=>{
                
                if (response.ok === true){

                    // GESTION DES ICONES

                    if (btn.classList.contains('fa-trash')) {
                        btn.classList.remove('fa-trash');
                        btn.classList.add('fa-user-plus');
                        btn.classList.add('dash-success');

                    } else if(btn.classList.contains('fa-user-plus')){
                        btn.classList.remove('fa-user-plus');
                        btn.classList.remove('dash-success');
                        btn.classList.add('fa-trash');
                    }

                    // RECUPERER LE JSON 
                    // POUR AVOIR LE LIEN DE REACTIVATION
                    // DU COMPTE
                    response.json()
                    .then(jsonData=>{
                        const {URL} = jsonData;
                        btn.setAttribute('href',URL.toString())
                    })

                } else{
                    // AFFICHER MESSAGE SUR L'INTERFACE
                    // QUE LE PROCESSUS A ECHOUE




                }
            })
        }
})


// SUPPRIMER COMMENTAIRE EN AJAX
// DELEGATION D'EVENEMENTS
comments?.addEventListener('click',function(event){

    if(
        event.target.nodeName === "A"
        &&
        event.target.matches("a.dash-delete")
    ) {
        event.preventDefault()

        const eventInitiater = event.target;
        const ressourceLocation = eventInitiater.getAttribute('href');
        const deletionLink = buildRessourcePath(ressourceLocation);
        const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
        const card = eventInitiater?.getAttribute('data-forDeleting');

        deleteRessource(deletionLink,csrf_token)
        .then((response)=>{
            if(response.ok === true){
                // Supprimer la carte de commentaire.
                // this se réfère à l'écouteur de l'événement
                this.querySelector(`#${card}`).remove()

                // DECREMENTER LE COMPTEUR DES COMMENTAIRES
                decrementCounter("dash-count-comments")

                // Carte modale réussite de suppression d'éléments
                showVerdictToUser(true,100,2000,"Commentaire supprimé !")
            } else{
                // Carte modale d'échec de suppression
                showVerdictToUser(false,100,2000,"Echec de suppression !")
            }
        })
    }

})

// DEMANDER LA CONFIRMATION
// AVANT DE SUPPRIMER UN COMMENTAIRE
delete_category_btns?.forEach(btn=>{
    btn.addEventListener('click',function(event){
        event.preventDefault();
        // Récupérer le lien 
        const link = this.getAttribute('href');

        // Récupérer le data-id du lien afin
        // de trouver la carte de confirmation
        // qui correspond
        const id = this.getAttribute('data-id');
        const card_confirm = document.getElementById(id);
        const card_category = document.getElementById(`card-${id}`)
        

        // AFFICHER LA CARTE DE CONFIRMATION
        card_confirm.classList.add('dash-ask-before-delete-js');

        // LUI ATTACHER UN EVENEMENT
        // DETECTER PAR DELEGATION D'EVENEMENTS
        // QUAND LE BOUTTON DISMISS OU DELETE
        // ONT ETE CLIQUEE
        card_confirm.addEventListener('click',function(event){
            if (
                event.target.nodeName === "BUTTON"
            ) {
                if(event.target.matches('button.false')){
                    // NE PAS SUPPRIMER
                    // ENLEVER LA CARTE DE SUPPRESSION
                    card_confirm.classList.remove('dash-ask-before-delete-js');
                } else if(event.target.matches('button.true')){

                    // SINON, LANCER LA REQUETE
                    const toRessourcePath = buildRessourcePath(link);
                    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
                    
                    deleteRessource(toRessourcePath,csrf_token)
                    .then(response=>{
                        if(response.ok === true){
                            card_category.remove()
                            // DECREMENTER LE COMPTEUR DES CATEGORIES
                            decrementCounter("dash-count-categories")
                            showVerdictToUser(true,100,2000,"Catégorie supprimée !")
                        } else{
                            showVerdictToUser(false,100,2000,"Erreur de suppression !")
                        }
                    })
                }
            }
        })

        
    })
})

// SUPPRIMER AVIS EN AJAX
opinion_cards?.addEventListener('click',function(e){
    if(
        e.target.nodeName === "A"
        &&
        e.target.matches("a.dash-delete.delete-opinion")
    ) {
        e.preventDefault();
        const btn = e.target;
        const id = btn.getAttribute('data-id');
        const link = btn.getAttribute("href");
        const toRessourcePath = buildRessourcePath(link);
        const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;

        deleteRessource(toRessourcePath,csrf_token)
        .then(response=>{
            if(response.ok === true){
                document.getElementById(id).remove();
                decrementCounter("dash-count-opinions")
            } else{
                showVerdictToUser(false,100,2000,"Echec de suppression de l'avis public !")
            }
        })
    }
})


// DELEGATION D'EVENEMENTS
// CHANGER LE STATUT D'UN ARTICLE
// MIS EN LIGNE OU 

const toggleIo = (e)=>{
    if(
        e.target.nodeName == "SPAN"
        &&
        e.target.matches('span.dash-status-for-editor-space')
    ) {
        e.preventDefault();
        const btn = e.target.parentElement;
        
        if(
            btn.nodeName === "A"
            &&
            btn.matches('a.dash-status-btn')
        ) {
            toggleOnOutLine(e,btn);
            return;
        } else{
            showVerdictToUser(false,100,3000,"Erreur de Séléction JS !")
            return;
        }
        
    }
}

const deleteArticle = (e)=>{
    if(
        e.target.nodeName == "A"
        &&
        e.target.matches('.dash-delete-article')
    ) {
        e.preventDefault();
        const link = e.target.getAttribute('href');
        const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value 

        deleteRessource(link,csrf_token)
        .then(response=>{
            if (response.ok === true){
                let id = e.target.getAttribute('data-articleId');
                document.getElementById(id)?.remove()
                document.getElementsByClassName(id)[0].remove()

                showVerdictToUser(true,100,2000,"Supprimé avec succès !")
                return;
            } else{
                showVerdictToUser(false,100,2000,"Echec de suppression !");
                return;
            }
        })
    }
}
main_container.addEventListener('click',function(e){
    toggleIo(e);
    deleteArticle(e);
})


// Faire apparaître ou disparaître
// la sidebar
menu_hamburger?.addEventListener('click',function(){
    sidebar.classList.toggle('dash-sidebar-js');
})

// Montrer les articles mis en brouillon
show_draft?.forEach(btn=>{
    btn.addEventListener('click',function(e){
        e.preventDefault();
        draft_panel.classList.add('dash-draft-js');
        let link = this.getAttribute('data-href');
        let toRequest = buildRessourcePath(link)
        search_form.setAttribute('action',toRequest);

        if(this.getAttribute('data-status') == 1){
            search_form_editor_space_statut.classList.remove('gen-outline');
            search_form_editor_space_statut.classList.add('gen-online');
            editor_space_search_input.placeholder = "Cherchez un article en ligne";
        } else{
            search_form_editor_space_statut.classList.remove('gen-online');
            search_form_editor_space_statut.classList.add('gen-outline');
            editor_space_search_input.placeholder = "Cherchez un article en brouillon";
        }
    })
})
// Cacher les articles mis en brouillon
hide_draft?.addEventListener('click',function(){
    draft_panel.classList.remove('dash-draft-js');
    wrap_cards_filterd_in_editor_space.innerHTML = "";
})

// Chercher par des articles
const requestArticles = (toRequest,csrf_token,data)=>{
    postRessource(toRequest,csrf_token,data)
    .then(response=>{
        if (response.ok === true) {
            response.json()
            .then(JsonData=>{
            if(JsonData?.length !== 0) search_form.reset()
                contains_draft_cards.classList.remove("dash-contains-cards-js");
                JsonData.forEach(article=>{
                    wrap_cards_filterd_in_editor_space.append(buildArtCardEdSpace(article));
                })
            })
        } else{
            showVerdictToUser(false,100,2000,"Echec du contact avec le serveur !")
        }
    })
}

search_form.addEventListener('submit',function(e){
    // Récupérer les articles qui ont le statut outline
    e.preventDefault()
    const toRequest = this.action;
    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
    const data = new FormData(this).get('search-input');

    if (data.trim() !== " ".trim()){
        contains_draft_cards.classList.add("dash-contains-cards-js")
        wrap_cards_filterd_in_editor_space.innerHTML = "";
        requestArticles(toRequest,csrf_token,data);
    } else{
        showVerdictToUser(false,100,2000,"No request made !")
    }
})
