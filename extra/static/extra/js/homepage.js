import {
    postRessource,
    validatePhoneNumber,
    validateEmailAdress,
    checkValidInputs,
    buildRessourcePath,
    toggleModal,
    backToTop
} from 'functions';


// LES VARIABLES
const topbar = document.querySelector('.hm-header');
const menu_icon = document.querySelector('.hm-menu-hamburger');
const sidebar_menu = document.querySelector('.hm-links-text');
const search_form = document.querySelector('.hm-search-form');
const search_icon = document.querySelector('.hm-search');
const hero = document.querySelector('.hm-hero');
const contact_link = document.querySelector('.hm-contact-link');
const home_link = document.querySelector('.hm-home-link');
const all_icons_before_text_fields = document.querySelectorAll('.da-icon');
const contact_form_submitter = document.querySelector('.da-submit-btn-contactMe');
const all_input_for_contact = document.querySelectorAll('.input-for-contact')


// Scroller automatiquement jusqu'au haut de la page
backToTop()

// EFFET FADE IN SUR LE HERO
const welcome_phrase = document.querySelector('.hm-welcome');
const present_text = document.querySelector('.hm-present');
const hero_btn = document.querySelector('.hm-hero-btn');

const oneAfterAnother = new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve(welcome_phrase?.classList.add('fadeIn-js'))
    },300)
})
oneAfterAnother.then(()=>{
    setTimeout(()=>{
        present_text?.classList.add('fadeIn-js');
    },800)
})
.then(()=>{
    setTimeout(()=>{
        hero_btn?.classList.add('fadeIn-js')
    },1500)
})

// L'EFFET FADE SUR LES CARTES DE CATEGORIES ET D'ARTICLES
const categories_and_articles_cards = document.querySelectorAll('.hm-card');

// L'OBSERVEUR POUR LES CARTES
const toRevealElements = new IntersectionObserver((entries)=>{

    entries.forEach(element=>{
        if(element.isIntersecting){
            element.target.classList.add('fadeIn-js');
        }
    })

})
function fadeIn(element){
    toRevealElements.observe(element);
}

// OBSERVER LES CARTES DE CATEGORIES ET D'ARTICLES
categories_and_articles_cards.forEach(element=>fadeIn(element));



// Le topbar reste visible
// mais de couleur de fond au scroll
window.addEventListener('scroll',function(){
    if (this.scrollY > 50){
        topbar.classList.add('hm-header-js');
    } else {
        topbar.classList.remove('hm-header-js');
    }
})

// Faire apparaître le menu 
// quand on clique sur l'îcone
menu_icon.addEventListener('click',function(){
    this.classList.toggle('with-sidebar');
    document.body.classList.toggle('body-js');
    sidebar_menu.classList.toggle('hm-links-text-js');

    if (this.classList.contains('with-sidebar')){
        this.innerHTML=`<span class="fa-solid fa-close hm-menu"></span>`;
        topbar.classList.add('hm-header-js');
    } else{
        this.innerHTML = `<span class="fa-solid fa-bars hm-menu"></span>`;
    }
})

// Faire disparaître la sidebar
// quand on clique sur le lien de contact
// et scroller automatiquement
// jusqu'à la section de contact
contact_link.onclick = function(){
    menu_icon.classList.remove('with-sidebar');
    document.body.classList.remove('body-js');
    sidebar_menu.classList.remove('hm-links-text-js');
    menu_icon.innerHTML = `<span class="fa-solid fa-bars hm-menu"></span>`;
}

// Faire disparaître la sidebar
// quand on clique sur le lien accueil
// et scroller automatiquement
// jusqu'au hero
home_link.onclick = ()=>{
    menu_icon.classList.remove('with-sidebar');
    document.body.classList.remove('body-js');
    sidebar_menu.classList.remove('hm-links-text-js');
    menu_icon.innerHTML = `<span class="fa-solid fa-bars hm-menu"></span>`;
}


// Faire apparaître la barre de recherche
// quand on clique sur l'icône de recherhe
search_icon.addEventListener('click',function(){
    search_form.classList.toggle('hm-search-form-js');
    this.classList.toggle('search-form-appeared');

    if (this.classList.contains('search-form-appeared')){
        this.innerHTML = `<li class="hm-icon hm-search"><span class="fa-solid fa-arrow-up"></span></li>`;
    } else{
        this.innerHTML = `<li class="hm-icon hm-search"><span class="fa-solid fa-search"></span></li>`;
    }
})


// COPY-PASTE dans d'autres scripts JS
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
                document.querySelector('.for-subject')?.classList.add('da-icon-fail');
            } 
        else if(!checkValidInputs(sender,64))
            {
                document.querySelector('.for-sender')?.classList.add('da-icon-fail');
            }
        else if(
            !checkValidInputs(usermail,100)
            ||
            !validateEmailAdress(usermail)
        )
            {
                document.querySelector('.for-email')?.classList.add('da-icon-fail');
            }
        else if(
            !checkValidInputs(phoneTel,16)
            ||
            !validatePhoneNumber(phoneTel)
        )
            {
                document.querySelector('.for-phone')?.classList.add('da-icon-fail');
            }
        else if(!content.trim() !== ' '.trim())
            {
                // RIEN POUR LE MOMENT
            }

        return 
    }
})

// S'il y a erreur, on met les icônes
// qui précèdent les champs en rouge.
// Mais si l'utilisateur se met dans ces champs
// pour écrire, on doit les enlever
all_input_for_contact.forEach(field=>{

    field.addEventListener('input',function(){
        const id = field.getAttribute('data-id');
        document.getElementById(id).classList.remove('da-icon-fail')
    })   
})