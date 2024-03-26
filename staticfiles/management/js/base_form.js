import {
    toggleModal,
    checkInputVisual,
    showVerdictToUser,
    postRessource,
    buildRessourcePath,
    checkValidInputs,
    buildArticleCard
} from 'functions';

// LES VARIABLES
const info_card = document.querySelector('.bf-warn');
const close_infoCard = document.querySelector('.bf-closeInfoCard');
const success_card = document.querySelector('.bf-success');
const error_card = document.querySelector('.bf-error');
const name_input = document.querySelector('.pseudo');
const email_input = document.querySelector('.email');
const back_in_navigation_arrow = document.querySelector('#bf-back');
const signUpForm = document.querySelector('.form-signUp');
const maxLengthUsername = 16;
const maxLengthPassword = 12;
const askUserToWaitPanel = document.querySelector('.bf-ask-user-to-wait');
const backend_message = document.querySelector('.bf-backend-message');
const modify_user_data_form = document.querySelector('.form-modify-user-data');
const all_icons_for_right_form = document.querySelectorAll('.md-btn');

// FONCTIONS LOCALES
function leadUserToProposeArticle(data){
    // Créer une carte d'article
    const cardReplacer = buildArticleCard(data,[
        back_in_navigation_arrow,
        signUpForm,
        info_card
    ])
    // Remplacer le contenu du body
    // par cette carte
    document.body.prepend(cardReplacer)
}

function userWait_Propose_Modale(wait,fn1,fn2,fn3){
   
    const firstAction = new Promise((resolve,reject)=>{
        resolve(fn1());
    })

    firstAction
    ?.then(()=>{
        fn2()
    })
    .then(()=>{
        setTimeout(()=>{
            fn3()
        },wait)
    })
}

function askUserToWait(decision){
    if(decision===true){
        askUserToWaitPanel.classList.add('bf-ask-user-to-wait-js');
    } else {
        askUserToWaitPanel.classList.remove('bf-ask-user-to-wait-js');
    }
}

// Afficher la carte qui donne des renseignements 
// sur les formulaires et la cacher encore
// toggleModal(
//     info_card,
//     'bf-warn-js',
//     4000,
//     14000
// )


// Cacher le message de Django
// trois secondes après qu'il est apparu
setTimeout(()=>{
    backend_message?.classList.add('bf-backend-message-js')
},3000)
setTimeout(()=>{
    document.querySelector('.md-messages')?.classList.add('md-messages-js');
},3000)


// Cacher la carte des renseignements au clic 
// sur l'icône de fermeture
// if(close_infoCard){
//     close_infoCard.onclick = function(){
//         info_card.classList.remove('bf-warn-js')
//     }
// }

close_infoCard?.addEventListener('click',function(){
    info_card.classList.remove('bf-warn-js')
}) 


// Rentre à la page précédente
// si l'utilisateur ne veut plus continuer
// avec le formulaire
// en cliquant sur l'icône de flèche
// à gauche
back_in_navigation_arrow?.addEventListener('click',function(evt){
    evt.preventDefault();
    history.back();
    return 
})

// Vérifier que l'utilisateur ne dépasse
// pas un certain nombre de caractères
// dans les champs de saisies des données
checkInputVisual(name_input,16,'bf-error-input');



// ENVOYER LES DONNES DE L'UTILISATEUR
// 1 - Pour créer un compte
const signUnFormAction = signUpForm?.getAttribute('action');
const toSignUp = buildRessourcePath(signUnFormAction)
signUpForm?.addEventListener('submit',function(evt){

    // OBLIGATOIRE D'ENVOYER LE FORMULAIRE
    // EN AJAX
    evt.preventDefault()
    console.log(this)

    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;

    const FORM_DATAS = new FormData(this);

    // DONNEES TEXTUELLES
    const username = FORM_DATAS.get('username');
    const email = FORM_DATAS.get('email');
    const password = FORM_DATAS.get('password');
    // DONNEES BOOLEENES
    const keepChecked = parseInt(FORM_DATAS.get('keepChecked'));
    const joinNewsletter = parseInt(FORM_DATAS.get('joinNewsletter'));

    const dataToSend = {
        'username':username.replace(' ','-'),
        'email':email,
        'password':password,
        'keepChecked': keepChecked === 1 ? true:false,
        'joinNewsletter': joinNewsletter === 1 ? true:false

    }

    // VERIFIER LA VALIDITE DES DONNES TEXTUELLES
    let ok_username = checkValidInputs(username,maxLengthUsername);
    let ok_email = checkValidInputs(email,100);
    let ok_password = checkValidInputs(password,maxLengthPassword);


    if(
        ok_username && ok_email && ok_password
    ) {
        
        // DEMANDER A L'UTILISATEUR D'ATTENDRE
        askUserToWait(true)

        // SOUMETTRE LE FORMULAIRE
        postRessource(toSignUp,csrf_token,dataToSend)
        .then((response)=>{

            // VOIR LE MESSAGE JSON
            // RECU DU SERVEUR
            response.json()
            .then((JSONResponse)=>{

                console.log(JSONResponse)
                // RECUPERER LE MESSAGE ET LE CODE
                const codeFromServer = parseInt(JSONResponse?.status);
                const messageFromServer = JSONResponse?.message;
                const lastArticle = JSONResponse?.lastArticle;

                // SI C'EST UN CODE 200, C'EST QUE LE COMPTE EXISTE DEJA
                // C'EST LE COMPTE DE L'UTILISATEUR QUI ENGAGE LA REQUETE
                // L'UTILISATEUR ESSAIE D'EN CREER UN AUTRE
                // AVEC LE MEME NOM D'UTILISATEUR
                if( codeFromServer === 301){
                    
                    const messageDuration = 4000;
                    const redirectionURL = JSONResponse?.redirectURL;

                    // ENLEVER LA CARDE QUI DEMANDE DE PATIENTER
                    askUserToWait(false)

                    // LE REDIRIGER VERS LA PAGE DE CONNEXION
                    window.location.href = redirectionURL;
                
                }
                // SINON, LE NOM D'UTILISATEUR
                // EXISTE DEJA MAIS LE COMPTE
                // ASSOCIE N'APPARTIENT PAS A L'UTILISATEUR
                // QUI ENGAGE LA REQUETE
                else if(codeFromServer===500){
                    askUserToWait(false)
                    showVerdictToUser(false,100,3000,messageFromServer);
                }   
                // SI C'EST CODE 201, C'EST QUE LA CREATION
                // S'EST FAITE AVEC SUCCES
                else if(codeFromServer === 201){

                    const messageDuration = 2000;

                    // ENLEVER LA CARDE QUI DEMANDE DE PATIENTER
                    const dontWait = ()=>{
                        askUserToWait(false)
                    }
                    // Carte modale de succès de création du compte
                    const firstModal = ()=>{
                        showVerdictToUser(true,100,messageDuration,'Compte créé avec succès !')
                    }
                    // Remplacer le contenu du body par 
                    // la carte du nouvel article proposé
                    const lastPropose = ()=>{
                        leadUserToProposeArticle(lastArticle)
                    }                    

                    // Fonction qui fait ces deux opérations en ordre
                    userWait_Propose_Modale(200,dontWait,lastPropose,firstModal);
                }
            })
            .catch((e)=>{
                
            })
        })


    } else{

        // MONTRER A L'UTILISATEUR OU
        // LE PROBLEME SE TROUVE
        let message;

        if(! ok_username){
            message = "Erreur dans le nom d'utilisateur !";
        } else if( ! ok_password ){
            message = "Erreur dans le mot de passe !";
        } else if (! ok_email){
            message = "Erreur dans l'email !"
        } 

        showVerdictToUser(false,100,2000,message);


        // STYLISER LES CARTES MODALES
        // POUR MOBILE
        // CE SERONT DES CARTES QUI VIENDRONT
        // DU HAUT DE LA PAGE
        // BACKGROUND BLANC
        // ECRITS ROUGES OU VERTS
    }
})

// Gérer le cas d'envoie des checkbox
// au backend. Si la case est cochée,
// alors on donnera la valeur 1 checkbox
// sinon on donnera 0. Comme cela, on passera
// deux valeurs au backend
const keep_checked = document.getElementById('keep_checked');
const newsletter= document.getElementById('newsletter');
const formBooleanValues = [
    keep_checked,
    newsletter
]

		
formBooleanValues?.forEach((checkableField)=>{
    checkableField?.addEventListener('change',function(){
        if(this.checked){
            this.setAttribute('value',1)
        } else{
            this.setAttribute('value',0)
        }
    })
})


// Afficher les bon formulaire de mise-à-jour
// des données selon le boutton sur lequel on clique
function resetAll(){
    all_icons_for_right_form.forEach(element=>{
        element.classList.remove('active-js');
        const id = element.getAttribute('form-id');
        document.getElementById(id).classList.remove('active-js');
    })
}
all_icons_for_right_form.forEach(element=>{
    
    element.addEventListener('click',function(e){
        resetAll();
        const id = this.getAttribute('form-id');
        this.classList.add('active-js');
        document.getElementById(id).classList.add('active-js');

    })
})