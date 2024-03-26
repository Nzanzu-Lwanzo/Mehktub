// LES VARIABLES
const hidden_img_picker = document.querySelector('.fileChooser');
const btn_img_picker = document.querySelector('.bfr-changeImage');
const profile_box = document.querySelector('.bfr-profileBox');
const profile_sidebar = document.querySelector('.bfr-profile');
const profile_img = document.getElementById('bfr-profile-img');
const filter_btn = document.querySelector('.bfr-default');
const filter_options = document.querySelector('.bfr-options');
const filter_tag = document.querySelector('.bfr-value');
const filter_icon = document.querySelector('.bfr-down');

// Changer la photo de profil
btn_img_picker?.addEventListener('click',function(){
    // Au clic sur notre custom boutton, c'est l'input de fichiers caché qui est cliqué
    hidden_img_picker.click()
    
    // Lorsque son état change, récupérer l'image séléctionnée
    hidden_img_picker.addEventListener('change',function(){
        const chosen_img = this.files[0];

        // Si une image a bien été séléctionnée
        if (chosen_img){
            // Créer un lecteur de fichier;
            const fileReader = new FileReader();

            //Lire le fichier et fournir son URL
            fileReader.readAsDataURL(chosen_img);

            // Lorsque le lecteur aura lu le fichier
            fileReader.addEventListener('load',function(){

                // Il attribuera son résultat (qui sera une URL) 
                // à l'attribut src de l'élément img destiné à recevoir
                // l'image de profil
                profile_img.src = fileReader.result;

                /**
                 * RESTE A FAIRE MONTER CE FICHIER
                 * A LA BASE DE DONNEES.
                 * 
                 * JE CROIS QU'ON LIRA LE FICHIER EN TANT QUE URL POUR LE FRONTEND 
                 * i.e LE CHANGEMENT VISUEL
                 * 
                 * MAIS POUR LE TRANSFERT DU FICHIER VERS LE BACKEND
                 * JE CROIS QU'ON LIRA LE FICHIER EN TANT QUE TABLEAU D'OCTETS (ArrayBuffer)
                 * OU UN BLOB
                 */
            })
        }
    })
})

// Faire apparaître la sidebar
// du profil de l'utilisateur
// quand il clique sur la petit icône
// de son profile
profile_box?.addEventListener('click',function(){
    profile_sidebar.classList.toggle('bfr-profile-js');
})

// Faire apparaître la boîte des options de filtrage
filter_btn?.addEventListener('click',function(){
    const filtopClass = filter_options.classList;
    filtopClass.toggle('bfr-options-js');

    if (filtopClass.contains('bfr-options-js')){
        filter_icon.setAttribute('class','fa-solid fa-angle-down bfr-down')
    } else{
        filter_icon.setAttribute('class','fa-solid fa-angle-right bfr-down')
    }
},true)


// Changer le texte qui est dans le boutton filtrer
// quand l'utilisateur choisit une option

if (filter_tag && filter_options && filter_icon){
    function choseOption(){
        filter_tag.innerText = this?.innerText;
        filter_options?.classList.remove('bfr-options-js');
        filter_icon?.setAttribute('class','fa-solid fa-angle-right bfr-down')
    }
    
    for(let li of filter_options.children){
        li?.addEventListener('click',choseOption)
    }    
}


