import {
    showVerdictToUser,
    buildRessourcePath,
    deleteRessource,
    watchForClipboardCopy,
    backToTop,
    toggleOnOutLine
} from 'functions';

// LES VARIABLES
const search_icon = document.querySelector('.far-search-btn');
const search_form = document.querySelector('.search-form')
const search_form_classlist= search_form.classList;
const search_by_hashtag = document.querySelector('.gen-search-by-hashtag');
const close_search_by_hashtag = document.querySelector('.gen-quadra');
const search_by_hashtag_icons = document.querySelectorAll('.far-search-by-hashtag');
const hashtag_input = document.getElementById('gen-input-hashtag');
const search_by_hashtag_form = document.querySelector('.gen-search-form');
const found_articles_cards = document.querySelector('.far-cards');
const all_copy_links = document.querySelectorAll('.gen-copy-link')
const articles_container = document.querySelector('.far-cards');
const put_online_outline_btns = document.querySelectorAll('.far-toggle-io');

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

// Faire apparaître sur demande
// le formulaire de recherche
// par hashtags
Array.from(search_by_hashtag_icons)
.forEach((icon)=>{
    icon.addEventListener('click',function(){
        search_by_hashtag.classList.add('gen-search-by-hashtag-js');
    })
})


// Le cacher
close_search_by_hashtag.addEventListener('click',function(){
    search_by_hashtag.classList.remove('gen-search-by-hashtag-js');
})

// Empecher l'utilisateur d'écrire
// un hashtag avec des espaces
hashtag_input.addEventListener('input',function(){
    if (this.value.endsWith(' ')){
        showVerdictToUser(false,0,1000,"Pas d'espace");
        this.value = ' '.trim()
    }
})

// Empêcher de soumettre le formulaire
// s'il n'y a rien dedans
search_by_hashtag_form.addEventListener('submit',function(event){

    const input = new FormData(this).get('hashtag-search').trim();
    
    if (input === ''){
        event.preventDefault()
        showVerdictToUser(false,0,1500,"Vous n'avez rien écrit")
    } else{
        this.submit()
    }
})

// SUPPRIMER UN ARTICLE EN AJAX
found_articles_cards.addEventListener('click',function(e){

    if(
        (e.target.nodeName === "A"
        &&
        e.target.matches("#far-delete-article-for-ajax"))
       
    ) {
        e.preventDefault();

        const element = e.target;
        const link = element.getAttribute('href');
        const pathToRessource = buildRessourcePath(link);
        const csrf_token = document.querySelector("input[name='csrfmiddlewaretoken']").value;
        const id = element.getAttribute('data-id');

        deleteRessource(pathToRessource,csrf_token)
        .then(response=>{
            if(response.ok === true){
                document.getElementById(id).remove()
                showVerdictToUser(true,100,2000,"Article supprimé !")
            } else{
                showVerdictToUser(false,100,2000,"Eched de suppression !")
                return 
            }
        })    
    }
})
// Copier le lien d'un artice dans le presse-papier
watchForClipboardCopy(articles_container);

// Scroller automatiquement jusqu'au haut de la page
backToTop()

// Mettre un article un ligne
// Ou le sortir de ligne
put_online_outline_btns.forEach(btn=>{
    btn.addEventListener('click',(e)=>{
        toggleOnOutLine(e,btn)
    })
})