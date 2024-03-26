// LES VARIABLES
const search_icons = document.querySelectorAll('.ls-search-icon');
const search_form = document.querySelector('.ls-search-form');

// Faire apparaître la barre de recherce
// au clic sur l'icône de recherche
for (let search_icon of search_icons){
    search_icon?.addEventListener('click',function(){
        search_form.classList.toggle('ls-search-form-js');
    })
}