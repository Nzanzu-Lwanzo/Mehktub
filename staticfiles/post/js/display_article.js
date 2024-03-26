import {
    checkInputVisual,
    postRessource,
    buildRessourcePath,
    showVerdictToUser,
    buildCommentCard,
    scrollToBottom,
    checkValidInputs,
    toggleModal,
    deleteRessource,
    updateRessource,
    backToTop,

    validatePhoneNumber,
    validateEmailAdress,
} from 'functions';


// LES VARIABLES
const header = document.querySelector('.da-header');
const breadcrumb = document.querySelector('.da-article-breadcrumb');
const content = document.querySelector('.da-content');
const more = document.querySelector('.da-more');
const card_topic = document.querySelector('.da-topic');
const footer = document.querySelector('.da-footer');
const title_more = document.querySelector('.da-more-section .da-section-title');
const search_icon = document.querySelector('.da-search');
const search_cancel = document.querySelector('.da-hide-form');
const search_form = document.querySelector('.search-form');
const about_me = document.querySelector('.da-about-me');
const menu_icon = document.querySelector('.da-icons .da-menu');
const sidebar = document.querySelector('.da-header .da-links');
const menu_bars = document.querySelector('.da-bars');
const article = document.querySelector(".da-article");
const html = document.querySelector('html');
const comment_field = document.getElementById('comment');
const pseudo_field = document.getElementById('pseudo');
const email_field = document.getElementById('email');
const comment_form = document.getElementById('da-comment-form');
const show_topic_card = document.querySelector('.da-contains-topics');
const comments = document.getElementById('da-comments');
const comment_section = document.querySelector('.da-comments-section');
const comments_placeholder = document.getElementById('gen-placeholder');
const search_form_classlist = search_form.classList;
const delete_comment_btns = document.querySelectorAll('.da-delete');
const comment_post_success = document.querySelector('.da-success');
const comment_post_failure = document.querySelector('.da-failure');
const like_btn = document.getElementById('da-like-btn');


// Pour tracer l'utilisateur
// et savoir s'il a commenté à tel ou tel autre article
const current_article = document.body.getAttribute('data-article');
const current_userID = document.body.getAttribute('data-currentSession');

// Nombre maximal des caractères 
// dans un commentaire
let maxCommentLength = 216;

// Petit text au-dessus du formulaire
// pour les erreurs
const comment_field_error = document.getElementById('da-error-message');
const comment_field_error_element = document.querySelector('.da-message').classList;

// Vérifier s'il a déjà commenté
// et enlever le formulaire
/**
 * C'est mieux d'utiliser les cookies
 * En utilisant le localStorage
 * dès que l'utilisateur se déconnecte
 * on perd les données gardées dedans 
 * et du coup on ne sait plus s'il a déjà commenté ou pas.
 */
function hideIfInLocalStorage(element,storedData,check){
    const fromLocalStorage = JSON.parse(window.localStorage.getItem(storedData));
    const toArray = [];

    fromLocalStorage?.forEach((oneDict)=>{
        toArray.push(JSON.parse(oneDict));
    })

    const verdict = toArray.some(check);

    if(verdict){
        element.style.display = "none";
    }    
}

hideIfInLocalStorage(
    comment_form,
    'hasCommented',
    (record)=>{
        const cond1 = record.whoPostId == current_userID;
        const cond2 = record.whatArticleId == current_article;
        return cond1&&cond2
    }
);

// Faire apparaître et disparaître le formulaire de recherche
// Selon que l'utilisateur clique sur l'icône de recherche
// ou sur celle de dissimulation du formulaire
search_icon.addEventListener('click',function(){
    search_form_classlist.toggle('search-form-js');

    if(search_form_classlist.contains('search-form-js')){
        this.innerHTML = `<span class="fa-solid fa-arrow-up"></span>`
    } else{
        this.innerHTML = `<span class="fa-solid fa-search"></span>`
    }
})

// Faire apparaître  et disparaître le sidebar
// lorsqu'on clique sur l'icône menu
menu_icon.addEventListener('click',function(e){
    sidebar.classList.toggle('da-links-js');
    menu_bars.classList.toggle('da-bars-js');
    search_icon.classList.toggle('da-search-js');
    html.classList.toggle('html-js');
})

// Quand on clique sur l'icône de contact
// on fait disparaître la sidebar
// parce que la section de contact
// est accessible à travers une ancre
document.querySelector('.da-contact').onclick = function(event){
    sidebar.classList.remove('da-links-js');
    menu_bars.classList.remove('da-bars-js');
    search_icon.classList.remove('da-search-js');
    html.classList.remove('html-js');
}


// Faire apparaître ou disparaître
// la petite carte menu
// qui contient les rubriques
show_topic_card.addEventListener('click',function(){
    this.classList.toggle('da-show-topics-js');
})

// Afficher le boutton de retour au début de la page
// après un certain niveau
backToTop();


// Surligner un champ
// lorsqu'il a le focus
function beenFocused(element){
    element.addEventListener('mouseenter',function(){
        this.classList.add('da-got-focus');
    })
    element.addEventListener('mouseleave',function(){
        this.classList.remove('da-got-focus');
    })
    
}

// Vérifier que le nombre de caractères entrés 
// dans un champ est correcte
// sinon prendre une décision visuelle (pour l'utilisateur)
// VISUEL SEULEMENT
checkInputVisual(comment_field,maxCommentLength,'da-input-error');

// SOUMETTRE UN COMMENTAIRE
comment_form.addEventListener('submit',function(event){
    event.preventDefault()
    const FORM_DATAS = new FormData(this);

    let content = FORM_DATAS.get('content').trim();
    let whoPost = FORM_DATAS.get('whoPost');    

    if(
        checkValidInputs(content,maxCommentLength)
    ) {
        // ENVOYER LES DONNES EN AJAX
        const dataToSend = {
            'content':content,
            'articleID':this.getAttribute('data-articleID'),
            'userID':this.getAttribute('data-userID')
        }

        // - Construire l'URL
        const formAction = this.getAttribute('action');
        const fullURL = buildRessourcePath(formAction);
        const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;

        // Envoyer les données
        postRessource(fullURL,csrf_token,dataToSend)
        .then((response)=>{
            if (response.ok === true){

                // Confirmer l'envoie du post
                toggleModal(
                    comment_post_success,
                    'da-mark',
                    100,
                    1500
                )

                response.json()
                .then((JsonResponse)=>{
                    // Vider le formulaire
                    comment_form.reset()

                    // S'il y a déjà douze cartes dans le conteneur
                    // enlever la dernière carte pour rajouter
                    // celle de l'utilisateur actuel
                    const commentsNumber = comments.children.length;

                    if(commentsNumber>=12){
                        comments.firstElementChild.remove();
                    } 

                    // Enlever le placeholder qui dit
                    // qu'il n'y a encore aucun commentaire
                    // s'il y en a 
                    comments_placeholder?.remove()
                    
                    // Construire et ajouter la carte à la page
                    const commentCard = buildCommentCard(JsonResponse);

                    comments.append(commentCard);

                    // Scroller jusqu'à la section des commentaires
                    
                    // supprimer le formulaire de commentaire
                    scrollToBottom(comments);
                    
                })
                
            } else{
                // Signifier à l'utilisateur
                // que le commentaire n'a pas été
                // posté
                toggleModal(
                    comment_post_failure,
                    'da-mark',
                    100,
                    1500
                )
            }
        })

    } else{
        // SURLIGNER LE CHAMP A ERREUR
        // Carte modale - erreur

        let verdict;
        if(comment_field.value.trim() === ''){
            comment_field_error_element.add('da-message-js');
            verdict = '**Un champ vide ne peut pas être soumis !';
        } else if(comment_field.value.trim().length > maxCommentLength){
            comment_field_error_element.add('da-message-js');
            verdict = `**Le commentaire doit être d'au plus ${maxCommentLength} caractères!`;
        } else{
            comment_field_error_element.remove('da-message-js');
        }

        comment_field_error.innerText = verdict;
        comment_field.classList.add('da-input-error');
        return
    }
})


// SUPPRIMER UN COMMENTAIRE - EVENT DELEGATION
// POUR QUE LES CARTES AJOUTEES APRES COUP
// AIENT L'ECOUTEUR D'EVENEMENT DE LEUR PARENT
comments.addEventListener('click',function(event){

    event.preventDefault();

    /**
     * 
     * Vu que nous utilisons la délégation d'événements
     * le simple fait de cliquer sur un élément enfant
     * revient à cliquer sur l'élément parent
     * et le simple fait de cliquer sur un élément parent
     * revient à cliquer sur un élément enfant.
     * En gros, où que l'on clique dans l'élement 
     * stocké dans la variable comments
     * on aura cliqué sur l'élément de suppression
     * et la requête sera effectuée. On risquerait de
     * supprimer tous les commentaires, rien qu'au scroll 
     * dans l'élément parent.
     * Pour rémédier à cela, on va faire un peu de magie.
     * 
     * On va récupérer tous les éléments enfants
     * qui son les liens de suppression.
     * Chaque fois on vérifiera si l'élément qui a enclenché 
     * l'évenement (rendu par la propriété target de l'objet event) 
     * fait partie de ces liens de suppression. 
     * Si oui, c'est que l'utilisateur a vraiment
     * cliqué sur l'icône de suppression.
     * Et là, on pourra supprimer le commentaire 
     * et supprimer la carte du DOM
     */
    

    // Tous les éléments enfants
    //  qui permettent de supprimer
    const deleter = this.querySelectorAll('.da-delete');

    // Vérifier que le target de l'évenement
    // fait partie de ces suppresseurs
    if (Array.from(deleter).includes(event.target))
    {
        const eventInitiater = event.target;
        const ressourceLocation = eventInitiater.getAttribute('href');
        const deletionLink = buildRessourcePath(ressourceLocation);
        const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
        const card = eventInitiater?.getAttribute('data-forDeleting');

        deleteRessource(deletionLink,csrf_token)
        .then((response)=>{
            if(response.ok === true){
                
                // Supprimer la carte de commentaire
                // this se réfère à l'écouteur de l'événement
                this.querySelector(`#${card}`).remove()

                // Réquêter un autre commentaire 
                // et le rajouter au DOM

            } else{

            }
        })

    }
})



// Formulaire d'envoie de message au panel d'administration
// par AJAX
const contactForm = document.getElementById('da-form-contact-to-me');

contactForm.addEventListener('submit',function(e){
    e.preventDefault()

    const FORM_DATA = new FormData(this);

    // RECUPERER LES DONNES DU FORMULAIRE
    const subject = FORM_DATA.get('subject');
    const sender = FORM_DATA.get('sender');
    const usermail = FORM_DATA.get('usermail');
    const phoneTel = FORM_DATA.get('phoneTel');
    const content = FORM_DATA.get('message');

    // LE DICTIONNAIRE A ENVOYER
    const dataToSend = {
        "subject":subject,
        "sender":sender,
        "usermail":usermail,
        "phoneTel":phoneTel,
        "content":content
    }

    // ENVOYER
    if (
        checkValidInputs(subject,64)
        &&
        checkValidInputs(sender,64)
        &&
        checkValidInputs(usermail,100)
        &&
        validateEmailAdress(usermail)
        &&
        checkValidInputs(phoneTel,16)
        &&
        validatePhoneNumber(phoneTel)
        &&
        content.trim() !== ' '.trim()
        
    ) {
        
        const toSendURL = buildRessourcePath(this.getAttribute('action'));
        const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;

        postRessource(toSendURL,csrf_token,dataToSend)
        .then(response=>{

            if(response.ok === true){
                // MONTRER QUE LES DONNES ONT ETE VALIDEES
                all_icons_before_text_fields.forEach(icon=>{
                    toggleModal(icon,'da-icon-success',100,2000)
                })
                // DIRE MERCI A L'UTILISATEUR
                contact_form_submitter.setAttribute('type','button');
                contact_form_submitter.innerHTML = "Merci de me contacter ! Je réponds en moins de 24h !"
                document.querySelectorAll('.required-message').forEach(el=>{
                    el.remove();
                })
                // RESET TOUS LES CHAMPS
                contactForm.reset();

            } else{
                // SINON, SIGNALER A L'UTILISATEUR
                // QUE L'ENVOI A ECHOUE
        
                
            }
        })
    } else{
        // SURLIGNER LE CHAMP A PROBLEME
        if(!checkValidInputs(subject,64))
            {
                document.querySelector('.for-subject').classList.add('da-icon-fail');
            } 
        else if(!checkValidInputs(sender,64))
            {
                document.querySelector('.for-sender').classList.add('da-icon-fail');
            }
        else if(
            !checkValidInputs(usermail,100)
            ||
            !validateEmailAdress(usermail)
        )
            {
                document.querySelector('.for-email').classList.add('da-icon-fail');
            }
        else if(
            !checkValidInputs(phoneTel,16)
            ||
            !validatePhoneNumber(phoneTel)
        )
            {
                document.querySelector('.for-phone').classList.add('da-icon-fail');
            }
        else if(!content.trim() !== ' '.trim())
            {
                // RIEN POUR LE MOMENT
            }

        return 
    }
})

// LIKER L'ARTICLE
// EN AJAX
like_btn?.addEventListener('click',function(e){
    e.preventDefault()
    const link = this.getAttribute('href');
    const toRessourcePath = buildRessourcePath(link);
    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
    
    updateRessource(toRessourcePath,csrf_token)
    .then(response=>{
        if (response.ok === true){
            this.classList.add('da-like-btn-js');
        } else{

        }
    })
})