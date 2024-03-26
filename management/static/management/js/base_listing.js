// IMPORTER DES FONCTIONS
import {
    deleteRessource,
    showVerdictToUser,
    buildRessourcePath,
    postRessource,
    validatePhoneNumber,
    validateEmailAdress,
    checkValidInputs,
    toggleModal,
    watchForClipboardCopy,
    backToTop,
    toggleOnOutLine
} from 'functions';

// LES VARIABLES
const site_pusher = document.querySelector('.bl-site-pusher');
const menu_btn = document.querySelector('.bl-menu-icon');
const sidebar = document.querySelector('.bl-menu .bl-links');
const inside_menu_btn = document.querySelector('.bl-menu-hamburger');
const blurer = document.querySelector('.bl-blurer');
const BDY_classList = document.body.classList;

const search_icon = document.querySelector('.bl-search-icon');
const search_form = document.querySelector('.bl-search-form');
const SRCHF_classList = search_form.classList;
const inside_search_icon = document.querySelector('.bl-loupe');

const rubriques_link = document.querySelector('.bl-rubriques-link');
const rubriques_list_title = document.querySelector('.da-title');
const footer = document.querySelector('.da-footer');

const delete_icons = document.querySelectorAll('.bl-delete');
const verdict_delete_yes = document.querySelector('.gen-yes');
const verdict_delete_no = document.querySelector('.gen-no');
const modal_card_title = document.getElementById('gen-modal-card-title');

const callUserGoDown = document.querySelector('.bl-arrow-down');
const pageContent = document.querySelector('.bl-content');

const articles_container = document.querySelector('.bl-cards');

const all_btns_to_togge_online_outline = document.querySelectorAll('.bl-toggle-io');

// Envoi message en Ajax
const all_icons_before_text_fields = document.querySelectorAll('.da-icon');
const contact_form_submitter = document.querySelector('.da-submit-btn-contactMe');

// Faire disparaître l'icône qui incite
// l'utilisateur à scroller
// dès que la section des cartes d'articles
// apparaît
const for_callUserGoDown = new IntersectionObserver(function(entries){
    for(let entry of entries){
        if(entry.isIntersecting){
            callUserGoDown?.remove()
        }
    }
},{
    threshold:.05
})

for_callUserGoDown.observe(pageContent);


// Faire apparaître le menu
// quand on clique sur l'icône de menu
menu_btn.addEventListener('click',function(){
    BDY_classList.toggle('body-js');
    search_icon.classList.toggle('bl-search-icon-js');
    if(BDY_classList.contains('body-js')){
        inside_menu_btn.className = "fa-solid fa-close bl-menu-hamburger";

        // Si la sidebar est visible, quoi qu'il arrive,
        // le champ de recherche doit être chaché
        SRCHF_classList.remove('bl-search-form-js');
        // Et l'icône de recherche doit revenir à être une loupe
        inside_search_icon.classList = "fa-solid fa-search bl-loupe";
    } else{
        inside_menu_btn.className = "fa-solid fa-bars bl-menu-hamburger";
    }
})
blurer.addEventListener('click',function(){
    BDY_classList.remove('body-js');
    search_icon.classList.remove('bl-search-icon-js');
    inside_menu_btn.className = "fa-solid fa-bars bl-menu-hamburger";
})

// Faire apparaître le formulaire de recherche
// quand on clique sur la loupe
search_icon.addEventListener('click',function(){
    SRCHF_classList.toggle('bl-search-form-js');

    if (SRCHF_classList.contains('bl-search-form-js')){
        inside_search_icon.classList = "fa-solid fa-arrow-up bl-loupe"
    } else{
        inside_search_icon.classList = "fa-solid fa-search bl-loupe";
    }
})

// Faire confirmer chaque fois
// qu'on veut supprimer un élément
delete_icons.forEach((del_icon)=>{
    del_icon.addEventListener('click',function(event){
        event.preventDefault();

        // RECUPERER LE TITRE DE L'ARTICLE A SUPPRIMER
        const to_delet_article = this.getAttribute('data-article');
        
        // LE METTRE DANS LA BOITE MODALE
        modal_card_title.innerText = to_delet_article;

        // BLURER LA PAGE ET FAIRE APPARAITRE CARTE MODALE
        document.querySelector('html').classList.add('ask-before-deleting');

        // LES DEUX FONCTIONS DE VERDICT
        const yes_delete = ()=>{
            // Supprimer en AJAX et quitter
            
            // - Récupérer le lien de suppression
            const fullAdress = buildRessourcePath(this.getAttribute('href'));
            
            // - Récupérer le CSRF Token
            const csrf_token = document.querySelector("input[type='hidden']").value
            
            // Effectuer une requête Fetch
            deleteRessource(fullAdress,csrf_token)
            .then((response)=>{
                if(response.ok===true){
                    // Enlever l'article de la page

                    // - Chercher la carte qui a le même data-id
                    // - que ce lien et le retirer du DOM
                    const linkDataId = this.getAttribute('data-id');
                    document.getElementById(linkDataId).remove();
                    
                    // Carte modale disant que l'article a été supprimé
                    showVerdictToUser(true);

                    // Ajouter un autre article dans le DOM
                    
                } else{

                    // Carte modale disant que 
                    // la suppression a échoué
                    showVerdictToUser(false);
                }
            })

            document.querySelector('html').classList.remove('ask-before-deleting');
        }

        const delete_not = ()=>{
             // Quitter tout simplement
             document.querySelector('html').classList.remove('ask-before-deleting');
        }

        verdict_delete_yes.onclick = (e)=>{
            yes_delete();
        }

        verdict_delete_no.onclick = (e)=>{
            delete_not();
        }
    })
})

// Faire disparaître la sidebar
// quand on clique sur le lien de rubriques
// et scroller directement vers le footer
// où les rubriques sont listées
rubriques_link.onclick = function(){
    BDY_classList.remove('body-js');
    search_icon.classList.remove('bl-search-icon-js');
    inside_menu_btn.className = "fa-solid fa-bars bl-menu-hamburger";
    inside_search_icon.classList = "fa-solid fa-search bl-loupe";
}


// ENVOYER UN MESSAGE AU PANEL
// D'ADMINISTRATION EN AJAX

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

// Copier le lien d'un article dans le clipboard
watchForClipboardCopy(articles_container);


// Scroller automatiquement jusqu'au haut de la page
backToTop()


// SORTIR UN ARTICLE DE LIGNE
// OU LE METTRE EN LIGNE
all_btns_to_togge_online_outline.forEach(btn=>{
    btn.addEventListener('click',(e)=>{
        toggleOnOutLine(e,btn);
    })
})



// Quand l'utilisateur clique sur rubriques
// il sera redirigé vers le footer
// mais il faut surligner la partie du footer 
// dont il a besoin pour qu'il sache que c'est 
// ce qu'il cherche effectivement.

