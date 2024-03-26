import {
    buildRessourcePath,
    postRessource,
    showVerdictToUser,
    backToTop,
    buildImage,
    getRessource
} from 'functions';

// VARIABLES
const btn_upload_image = document.getElementById('image-btn') ?? document.getElementById('image-icon') ;
const input_upload_image = document.getElementById('id_image');
const img_preview = document.querySelector('.car-preview-img');
const filter_hashtags = document.getElementById('car-filter-hashtags');
const options_hashtag = document.querySelectorAll('.car-hashtag');
const hashtag_select = document.getElementById('car-hashtags-selector');
const options_list_hashtags = document.getElementById('hashtags-options-list');
let numberOfHashtags = options_hashtag.length;
const add_hashtag_btn = document.querySelector('.car-add-btn');
const meata_input = document.querySelectorAll('.car-input');
const contains_hashtags_on_image = document.querySelector('.car-chosen-hashtags');
const search_form = document.querySelector('.car-search-form');
const close_search_form = document.querySelector('.car-hide-search-form');
const display_search_form = document.getElementById('car-display-search-form');
const wrap_images_to_choose_from = document.querySelector('.dash-wrap');
const display_all_images = document.getElementById('display-all-images');
const all_images_picker = document.querySelector('.dash-all-images');
const close_image_picker = document.querySelector('.dash-close-image-picker');
const preview_image_to_validate = document.querySelector('.dash-preview-img');
const preview_image_height = document.getElementById('dash-height');
const preview_image_width = document.getElementById('dash-width');
const preview_image_name = document.getElementById('dash-name');
const note_if_image_not_validated = document.querySelector('.dash-note');
const general_show_if_image_validated = document.querySelector('.validate-img');
let imgValidated = undefined;
const normalHeight = 410;
const normalHeightMin = 407;
const normalWidth = 612;
const normalWidthMin = 610;

// FONCTIONS LOCALES
function fromImageToBytesArray(){
    const img = document.querySelector('.car-preview-img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img,0,0,img.width,img.height);

    const imageData = ctx.getImageData(0,0,img.width,img.height).data;

    return imageData;
}


// CHARGER L'IMAGE PRINCIPALE DE L'ARTICLE
// EN PERMETTANT A L'EDITEUR DE LE VOIR
const createAndDisplayMessage = (message) =>{
    const p = document.createElement('p');
    p.innerHTML = message;
    return p;
}
const validateImage = (imgHeight,imgWidth)=>{

    if((normalHeightMin > imgHeight) || (normalHeight<imgHeight)) {
        preview_image_height.classList.add('dash-no-validated');
        general_show_if_image_validated.classList.add('dash-non-valid');
        imgValidated=false;
        note_if_image_not_validated
        .appendChild(
            createAndDisplayMessage(`** La hauteur d'une image doit être entre ${normalHeightMin}px minimum et ${normalHeight}px maximum !`)
        )
    } 
    if((normalWidthMin > imgWidth) || (normalWidth < imgWidth)) {
        preview_image_width.classList.add('dash-no-validated');
        general_show_if_image_validated.classList.add('dash-non-valid');
        imgValidated=false;
        note_if_image_not_validated
        .appendChild(
            createAndDisplayMessage(`** La largeur d'une image doit être entre ${normalWidthMin}px minimum et ${normalWidth}px maximum !`)
        )
    }

    if(
        (normalHeightMin <= imgHeight) && (normalHeight >= imgHeight)
        &&
        (normalWidthMin <= imgWidth) && (normalWidth >= imgWidth)
    ) {
        general_show_if_image_validated.classList.add('dash-valid');
        imgValidated=true;
    }

    // Présenter les données dans le tableau
    preview_image_height.innerHTML = imgHeight+'px';
    preview_image_width.innerHTML = imgWidth+'px';

}

const resetValidations = () => {
    preview_image_height.classList.remove('dash-no-validated');
    preview_image_width.classList.remove('dash-no-validated');
    general_show_if_image_validated.classList.remove('dash-non-valid');
    general_show_if_image_validated.classList.remove('dash-valid');
    imgValidated=undefined;
    note_if_image_not_validated.innerHTML = "";
}


btn_upload_image?.addEventListener('click',function(e){
    input_upload_image.click();
})

input_upload_image.addEventListener('change',function(e){
    const chosenImage = this.files[0];
    if(chosenImage){
        const reader = new FileReader();

        reader.addEventListener('load',function(){
            // Voir l'image avant de la valider, d'abord
            preview_image_to_validate.setAttribute('src',reader.result);
            // Reset les validations :
            // si une image n'a pas été validée, disons sa hauteur,
            // on donnera à l'élément qui présente cette donnée une classe
            // or quand on choisira une nouvelle image, même si elle respecte la validation,
            // on continuera à avoir la donnée soulignée en rouge. 
            // Il faut donc reste avant d'appliquer de nouvelles validations ou disons
            // avant de présenter les données d'une nouvelle image et de montrer 
            // si elles sont validées ou pas.
            resetValidations()
            // Présenter les caractéristiques de l'image
            setTimeout(()=>{
                preview_image_name.innerHTML = chosenImage.name;
                const imgHeight = preview_image_to_validate.naturalHeight;
                const imgWidth = preview_image_to_validate.naturalWidth;
                validateImage(imgHeight,imgWidth);
            },100)


            // L'image a été choisie, la montrer la deuxième boîte de prévisualisation
            img_preview.classList.add('car-preview-img-js');
            img_preview.setAttribute('src',reader.result);
        })

        reader.readAsDataURL(chosenImage);
    }
})

// FILTRER LES HASHTAGS SELON CE QUE L'UTILISATEUR ENTRE
filter_hashtags.addEventListener('input',function(e){
    let input_value = this.value.toLowerCase();
    let numberOfHiddenOptions = 0;

    options_hashtag.forEach(option=>{
        if(!option.innerText.toLowerCase().startsWith(input_value)){
            option.classList.add("option-hide-js");
            ++numberOfHiddenOptions;
        } else{
            option.classList.remove("option-hide-js");
            --numberOfHiddenOptions;
        }
    })

    if(
       numberOfHashtags===numberOfHiddenOptions
    ) {
        add_hashtag_btn.classList.add('car-add-btn-js');
    } else{
        add_hashtag_btn.classList.remove('car-add-btn-js');
    }

})

// AFFICHER LES HASHTAGS SELECTIONNES
// AU DESSUS DE L'IMAGE - DELEGATION 
// D'EVENEMENTS PARCE QU'IL Y A DES HASHTAGS
// QU'ON AJOUTE A LA VOLEE
function createHashtagWrapper(text,id){
    const span = document.createElement('span');
    span.className = "car-hashtag";
    span.setAttribute('id',`hashtag-${id}`);
    span.innerText = `#${text}`;

    return span;
}

options_list_hashtags.addEventListener('change',function(e){

    // Vider le conteneur des hashtags
    contains_hashtags_on_image.innerHTML = "";

    // Récupérer les hashtags choisis
    const options = Array.from(e.currentTarget.selectedOptions);

    // Les insérer au-dessus de l'image
    options.forEach(option=>{
        let hashtag = option.innerText;
        let id = option.getAttribute('value');
        let spanHashtag = createHashtagWrapper(hashtag,id);
        contains_hashtags_on_image.insertAdjacentElement('afterbegin',spanHashtag);
    })

    // Si on a déjà trois hashtags sur l'image
    // c'est qu'on en a déjà séléctionné trois
    // empêcher de séléctionner plus
    if(contains_hashtags_on_image.childElementCount===3){
        return;
    }

})


// CREER UN HASHTAG SUR EN BACKEND
// AVEC AJAX ET L'AJOUTER PARMI
// LES OPTIONS A SELECTION
// COMME ELEMENT SELECTIONNE D'AVANCE
add_hashtag_btn.addEventListener('click',function(e){

    const dataToPost = {
        hashtag:filter_hashtags.value
    };
    const link = this.getAttribute('data-linkToAddHastag');
    const linkToAddHastag = buildRessourcePath(link);
    const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value   
    
    postRessource(linkToAddHastag,csrf_token,dataToPost)
    .then(response=>{
        if(response.ok === true){
            response.json()
            .then(JsonRsponse=>{
                const {id,message} = JsonRsponse;

                // Montrer un mesae à l'utlisateur
                showVerdictToUser(true,100,2000,message);

                // Créer une nouvelle option
                const option = document.createElement('option');
                option.setAttribute('value',id);
                option.className = 'car-hashtag';
                option.innerText = filter_hashtags.value;
                option.setAttribute('selected','selected')
                options_list_hashtags.insertAdjacentElement('afterbegin',option)

                // Ajouter ce hashtag dans le preview
                const span = createHashtagWrapper(filter_hashtags.value,id);
                contains_hashtags_on_image.insertAdjacentElement('afterbegin',span);

                // Reset le champ
                filter_hashtags.value=' '.trim();

                // Ramener tous les éléments options
                options_hashtag.forEach(option=>{
                    option.classList.remove("option-hide-js");
                })
                
            })

        } else{
            showVerdictToUser(false,10,1000,"Echec de création du hashtag !")
        }
    })
})


// POUR LES INPUTS DES INFORMATIONS
// SUPPLENTAIRES SUR L'ARTICLE
// OUTLINE LES INPUTS QUAND IL Y A QUELQUE CHOSE DEDANS
meata_input.forEach(element=>{
    element.addEventListener('input',function(e){
        const data = this.value;
        this.classList.add('outline-js');

        if(data.length === 0){
            this.classList.remove('outline-js');
        }
    })
})


// Afficher et faire disparaître le formulaire
// de recherche
const showSearchForm = ()=>{
    search_form.classList.add('car-search-form-js');
}

const hideSearchForm = ()=>{
    search_form.classList.remove('car-search-form-js');
}

const toggleSearchForm = ()=>{
    search_form.classList.toggle('car-search-form-js');
}

display_search_form?.addEventListener('click',showSearchForm)
close_search_form?.addEventListener('click',hideSearchForm)

document.addEventListener('keydown',(e)=>{
    if(
        e.ctrlKey===true && 
        (e.key==="f" 
        ||
        e.key==="F")
    ) {
        e.preventDefault()
        toggleSearchForm()
    }
})

// Afficher le panneau de choix d'images
display_all_images.addEventListener('click',function(e){
    all_images_picker.classList.add('dash-all-images-js');
})
// Cacher le panneau de choix d'images
close_image_picker.addEventListener('click',function(e){
    if((imgValidated===true) || (imgValidated===undefined)) {
        all_images_picker.classList.remove('dash-all-images-js');
    } else if(imgValidated===false) {
        showVerdictToUser(false,100,3000,"Vous devez d'abord choisir une image valide !")
    }
})



// REQUETER
// fetch(buildRessourcePath("/site-administration/get-all-images/"))
// .then(response=>{
//     response.json()
//     .then(JsonRsponse=>{
//         JsonRsponse.forEach(img=>{
//             wrap_images_to_choose_from.append(buildImage(img));
//         })
//     })
// })

wrap_images_to_choose_from?.addEventListener('dblclick',function(e){

    // L'image sur laquelle on clique pour la choisir
    const currentImage = e.target;
    const imgLink = e.target.getAttribute('raw-image-url');
    img_preview.classList.add("car-preview-img-js");
    img_preview.setAttribute('src',imgLink);

    // Créer le fichier dans le input file
    // pour envoyer un fichier au back-end
    const newImage = fromImageToBytesArray();



    // A chaque double clic,
    // on transformera l'icône d'image
    // qui est dans le cercle de selection
    // en un check.
    // Mais il se peut que l'utilisateur 
    // hésite entre plusieurs images et aille
    // en les séléctionnant par plusieurs.
    // Dans ce cas, pour lui montrer qu'une image vient
    // d'être séléctionnée, on mettra le check.
    // Et pour qu'il garder
    // une trace des images qu'il a choisies
    // on leur mettra un point vert.
    
    // Initialiser les check pour qu'il n'y ait qu'une seule image checkée
    // donc une seule image séléctionnée
    document.querySelectorAll('.selector').forEach(el=>{
        el.classList.replace('fa-check','fa-image');
    })

    // Initialiser tous les points verts
    // même raison.
    document.querySelectorAll('.chosen')?.forEach(el=>{
        el.classList.remove('chosen-js');
    })

    // Mettre le check
    currentImage?.classList.replace('fa-image','fa-check');

    // Mettre le point vert
    document.getElementById(currentImage.getAttribute('chosen'))?.classList.add('chosen-js');
})