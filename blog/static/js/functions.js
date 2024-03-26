// Fonction d'affichage et de disparition
// d'une carte modale -- une petite carte
// qui apparaît et disparaît de soi
// après un temps donné

function toggleModal(element,className,delay1,delay2){

    // Montrer la carte modale
    const show = new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve(element?.classList.add(className));
        },delay1);
    })

    // Cacher la carte modale
    show?.then(()=>{
        setTimeout(()=>{
            element?.classList.remove(className);
        },delay2)
    })
}


// Fonction de validation visuelle de champs de formulaire
function checkInputVisual(input,number_of_chars,className){
    input?.addEventListener('input',function(){
       let data = this.value.toString().trim();
       if(data.length > number_of_chars){
            input.classList.add(className);
       } else {
            input.classList.remove(className);
       }
    })
}

// Fonction qui scroll directement jusqu'au bas de la page
function scrollToBottom(element){
    element.scrollTop = element.scrollHeight;
}

// FONCTION QUI RECUPERE DES DONNEES 
async function getRessource(url,csrf_token,data){
    const response = await fetch(url,{
        method:'GET',
        mode:'same-origin',
        redirect:'follow',
        headers:{
            'X-CSRFToken':csrf_token,
            'x-requested-with':'XMLHttpRequest',
            'Content-Type':"application/json"
        },
        body:JSON.stringify(data)
    })

    return response;
}

// FONCTION DE SUPPRESSION D'UNE RESSOURCE
async function deleteRessource(url,csrf_token){
    const response = await fetch(url,{
        method:'DELETE',
        mode:'same-origin',
        redirect:'follow',
        headers:{
            'X-CSRFToken':csrf_token,
            'x-requested-with':'XMLHttpRequest'
        }
    })

    return response;
}

// FONCTION D'ENVOIE D'UNE RESSOURCE
async function postRessource(url,csrf_token,data){
    const response = await fetch(url,{
        method:"POST",
        mode:"same-origin",
        redirect:"follow",
        headers:{
            'X-CSRFToken':csrf_token,
            'x-requested-with':'XMLHttpRequest',
            'Content-Type':'application/json',
        },
        body:JSON.stringify(data)    
    })

    return response;
}

// FONCTION DE MISE A JOUR D'UNE RESSOURCE
async function updateRessource(url,csrf_token){
    const response = await fetch(url,{
        method:'POST',
        mode:'same-origin',
        redirect:'follow',
        headers:{
            'X-CSRFToken':csrf_token,
            'x-requested-with':'XMLHttpRequest',
            'Content-Type':"application/json"
        },
        
    })

    return response;
}

// Fonction qui construit une URL
function buildRessourcePath(path){
    const requestOrigin = document.location.origin;
    const ressourceAdress = path;
    const fullURL = requestOrigin.concat(ressourceAdress);

    return fullURL;
}

// Fonction de toggle de carte modale
// pour le succès ou l'échec
function showVerdictToUser(useCase,d1=100,d2=1500,whatMessage){

    // Sélectionner les éléments à partir d'ici
    const success_card = document.querySelector('.gen-success');
    const error_card = document.querySelector('.gen-error');

    // Gérer le cas de succès ou d'erreur
    let choseCard;
    let className;
    let message;

    if(useCase===true){
        choseCard=success_card;
        message = whatMessage ?? 'Avec succès'
        className= 'gen-success-js';
    } else{
        choseCard=error_card;
        message = whatMessage ?? 'Une erreur est survenue'
        className= 'gen-error-js';
    }

    // Ajouter le message
    choseCard.innerHTML = `<p>${message}</p>`;

    // Appeler la fonction de toggle
    toggleModal(choseCard,className,d1,d2);
}

// Fonction qui crée une carte de commentaire
// et la met sur l'écran
function buildCommentCard(data){

    // Créer la carte
    const card = document.createElement('div');
    card.className="da-comment";
    card.id = `comment-${data.id}`;
    
    // Créer son contenu
    const cardContent = `
        <div class="da-icons">
            <span class="fa-solid fa-comment da-green"></span>
            <a href="${data.toDelete}" class="fa-solid fa-trash da-delete" data-forDeleting="comment-${data.id}"></a>
        </div>

        <div class="da-text">
            <p>
                ${data.content}
            </p>

            <span class="da-commentor da-green">${data.whoPost}</span>
            <span class="da-date">${formatDate()}</span>
        </div>                    
    `

    // Remplir la carte
    card.innerHTML=cardContent;

    return card;
}

// Fonction qui renvoie une écriture formattée
// de la date du jour courant
function formatDate(givenDate=new Date()){

    const numDay = givenDate.getDate();
    const numMonth = givenDate.getMonth();
    const numYear = givenDate.getFullYear();
    const numHour = givenDate.getHours();
    const numMinutes = givenDate.getMinutes();
    let formattedMin;

    if (numMinutes.toString().length===1){
        formattedMin = `0${numMinutes}`
    } else{
        formattedMin = numMinutes;
    }

    const monthString = [
        'janvier','fevrier','mars',
        'avril','mai','juin',
        'juillet','août','septembre',
        'octobre','novembre','décembre',]

    const formatted = `${numDay} ${monthString[numMonth]} ${numYear} ${numHour}:${formattedMin}`;

    return formatted;
}


// Fonction qui construit une carte
// d'article
function buildArticleCard(data,elementsToDelete){

    // Supprimer certains élément
    elementsToDelete.forEach((element)=>{
        element.remove()
    })

    const card = document.createElement('div');
    card.className = 'form-replace-card';


    // Les hashtags 
    let allHashtags = '';

    const hashtags = data.hashtags;

    hashtags.forEach((hashtag)=>{
        allHashtags += `<span class="gen-hashtag">#${hashtag}</span>`;
    })

    const card_content = `
        <a href="${data.homepage}" id="bf-back">
            <span class="fa-solid fa-home"></span>
        </a>

        <div class="form-replace-card-img">
            <img src="${data.image}" alt="${data.imageAlt}">
            <span class="gen-hashtags">
               ${allHashtags}
            </span>
        </div>
        <div class="form-replace-sum-article">
            <h3>${data.title}</h3>
            <p>
                ${data.sumItUp}
            </p>
            <span class="form-replace-date">Lisez notre dernier article</span>
            <a href="${data.location}" class="form-replace-read">
                <span>Lire</span>
                <span class="fa-solid fa-arrow-right"></span>
            </a>
        </div>
    `

    card.innerHTML = card_content;
    return card;
}

// Vérifier que les données du formulaire
// sont valide à la soumission
// VISUEL ET PROGRAMMATONNEL
// Fonction qui vérifier qu'un champ est bien rempli
// ou ne dépasse pas un certain nombre de caractères
function checkValidInputs(value,l){
    let no_empty = value.trim().toString().length !== 0;
    let no_long = value.trim().toString().length <= l;
    
    return no_empty && no_long;
}


// Fonction qui valide un numéro de téléphone
function validatePhoneNumber(string){
    const expression = /^\+?\d{1,3}-\d{3}-\d{3}-\d{3}$/;
    const verdict = expression.test(string);

    return verdict;
}

// Fonction qui valide une adress e-mail 
function validateEmailAdress(string){
    const expression = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const verdict = expression.test(string);

    return verdict;
}

// Fonction qui copie un Text dans le clipboard de l'utilisateur
async function copyToClipboard(element){
    const link = buildRessourcePath(element?.getAttribute('data-articleLink'));

    if(link){
        await navigator.clipboard.writeText(link);
        element.classList.replace('fa-copy','fa-check');
    }
}

function watchForClipboardCopy(container){
    container.addEventListener('click',function(e){
        if(
            e.target.nodeName==="SPAN"
            &&
            e.target.matches("span.gen-copy-link")
        ) {
            copyToClipboard(e.target);
        }
    })
}

// Fonction qui scrole jusqu'au haut de la page
function backToTop(){
    window.addEventListener('scroll',function(){
        const back_to_top = document.querySelector('.gen-back-to-top');
        
        if (this.scrollY > 2000){
            back_to_top?.classList.add('gen-back-to-top-js')
        } else {
            back_to_top?.classList.remove('gen-back-to-top-js')
        }
    })    
}

// FONCTION QUI MET UN ARTICLE EN LIGNE OU L'EN SORT
function setCardState(btn,status){
    let id = btn.getAttribute('data-cardId');
    const el = document.getElementById(id);

    el.setAttribute('data-isOnline',status.toString());
}
function toggleOnOutLine (e,btn){
    
    e.preventDefault();

    const link = btn.getAttribute('href');
    const pathToRessource = buildRessourcePath(link);
    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;

    updateRessource(pathToRessource,csrf_token)
    .then(response=>{
        
        if(response.ok === true){

            response.json()
            .then(JsonData=>{
                const {URL} = JsonData;
                btn.setAttribute('href',URL);
                
                if(btn.classList.contains('gen-online')){
                    btn.classList.replace("gen-online","gen-outline");
                } else if(btn.classList.contains('gen-outline')){
                    btn.classList.replace("gen-outline","gen-online");
                }
            })

        } else {
            showVerdictToUser(false,100,2000,"Echec de l'opération !")
        }
    })
}

// FONCTION QUI CONSTRUIT UNE CARTE
// POUR L'ESPACE EDITEUR
function buildArtCardEdSpace(article){

    const card = document.createElement('div');
    card.className = `dash-card dash-card-for-editor-filtering-purpose article-${article.id}`;
    let state = article.online ? "gen-outline":"gen-online";

    const content = `
        <div class="dash-img">
            <img src="${article.image}" alt="${article.imageAlt}">

            <div class="dash-wrap-link">
                <a href="${article.readLink}" class="dash-link">
                    ${article.title}
                </a>
            </div>

            <a href="${article.linkStatus}" class="dash-status-btn ${state}">
                <span class="fa-solid fa-wifi dash-status dash-status-for-editor-space"></span>
            </a>

            <div class="dash-ed-del">
                <a href="${article.updateLink}" class="fa-solid fa-edit dash-edit-article dash-icb"></a>
                <a href="${article.deleteLink}" class="fa-solid fa-trash dash-delete-article dash-icb" data-articleId="article-${article.id}"></a>
            </div>
        </div>
        

        <div class="dash-info">
            <div class="dash-placeholder"></div>
            <div class="dash-data">
            
                <div class="dash-u">
                    <span class="d-i">
                        <a style="color:inherit;" href="${article.sameDate}">
                            ${article.saveDate}
                        </a>
                    </span>
                </div>
                <span class="d-i d-c">
                    <a style="color:inherit;"  href="${article.comments}">
                        ${article.countComments} commentaires
                    </a>
                </span>
                <span class="d-i d-c">
                    ${article.likes } likes
                </span> 
                <span class="d-i d-c d-last">
                    ${article.updateDate}
                </span>       
            </div>
        </div>
    `

    card.innerHTML = content;
    return card;
}

// POUR PERMETTRE DE CHOISIR PARMI LES IMAGES EXISTANTES
function buildImage(image){
    const div = document.createElement('div');
    div.className = "dash-image-card";

    const chosen = document.createElement('span');
    chosen.className = "chosen";
    chosen.id = `img-${image.id}`;

    const img = document.createElement('img');
    img.className = "dash-image";
    img.src = `${image.url}`;
    img.style.height = "100%";
    img.style.width = "100%";

    const blurer = document.createElement('div');
    blurer.className = "blurer";
    blurer.innerHTML = `<span>${image.name}</span>`;
    
    const selector = document.createElement('span');
    selector.className = "fa-solid fa-image selector";
    selector.setAttribute('raw-image-url',image.url);
    selector.setAttribute('chosen',`img-${image.id}`);
    
    div.appendChild(img);
    div.appendChild(chosen);
    div.appendChild(blurer);
    blurer.appendChild(selector);

    return div;
}


export {
    toggleModal,
    checkInputVisual,
    scrollToBottom,
    deleteRessource,
    showVerdictToUser,
    postRessource,
    buildRessourcePath,
    buildCommentCard,
    formatDate,
    checkValidInputs,
    buildArticleCard,
    validatePhoneNumber,
    validateEmailAdress,
    updateRessource,
    copyToClipboard,
    watchForClipboardCopy,
    backToTop,
    toggleOnOutLine,
    getRessource,
    buildArtCardEdSpace,
    buildImage
};