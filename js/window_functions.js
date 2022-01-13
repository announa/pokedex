let currentScrollPosition = 0;

/* -----------------  WINDOW FUNCTIONS  ---------------- */

/**
 * Initiats the functions toggleToTopButton() and loadMorePokemon() on scrolling.
 */
window.onscroll = function () {
  toggleToTopButton();
  loadMorePokemon();
};

/**
 * Shows or hides the to-top-button dependong on the scroll-position.
 */
function toggleToTopButton() {
  if (window.scrollY > window.innerHeight) {
    document.getElementById('to-top-btn').classList.remove('d-none');
  } else {
    document.getElementById('to-top-btn').classList.add('d-none');
  }
}

/**
 * Checks if the end of document is reached and, if so, loads more Pokemon.
 */
function loadMorePokemon() {
  if (
    document.documentElement.scrollHeight + document.documentElement.clientHeight >= document.documentElement.offsetHeight &&
    loadingPokemon === false &&
    !document.getElementById('pokedex').classList.contains('d-none')
  ) {
    load20Pokemon();
  }
}

/**
 * Scrolls to the top of the page without scroll-behaviour: smooth;
 */
function goToTop() {
  window.scrollTo(0, 0);
}

/**
 * Scrolls to the top of the page.
 */
function scrollToTop() {
  document.documentElement.style.scrollBehavior = 'smooth';
  setTimeout(() => {
    goToTop();
    document.documentElement.style.scrollBehavior = 'auto';
  }, 10);
}

/**
 * Gets the current scroll-position in the Pokedex before rendering the search-result.
 */
function getCurrentScrollPosition() {
  if (!document.getElementById('pokedex').classList.contains('d-none')) {
    currentScrollPosition = window.scrollY;
  }
}

/**
 * Resets the last scroll-position in the Pokedex after closing the search-container.
 */
function resetLastScrollPosition() {
  document.documentElement.scrollTop = currentScrollPosition;
}

/**
 * Calls adjustPokeImgToWindowSize() when the user resized the window.
 */
window.onresize = function () {
  adjustPokeImgToWindowSize();
};

/**
 * Adds or removes the hidePokemon-onclick-event to the pokemon-image of the shown Pokemon depending on the window-size and therefore on the position of the image in the card or next to it.
 */
function adjustPokeImgToWindowSize() {
  if (window.innerHeight < 570) {
    document.getElementById('selected-pokemon-img').removeEventListener('click', hidePokemon);
  } else if (window.innerWidth < 700) {
    document.getElementById('selected-pokemon-img').removeEventListener('click', hidePokemon);
  } else {
    document.getElementById('selected-pokemon-img').addEventListener('click', hidePokemon);
  }
}

/**
 * Loads more Pokemon for big screens if in the last row of Pokedex-cards more than half of the card height is visible.
 * Problem: screen resolution: 2560 x 1440 Pixel, used resolution in Windows: 1280 x 1440 Pixel
 */
function loadMorePokemonforBigScreen(){
  console.log('loadMorePokemonforBigScreen')
  if(document.documentElement.scrollHeight < +document.documentElement.clientHeight + +window.getComputedStyle(document.body).paddingBottom.slice(0,-2) + (+document.getElementById('bulbasaur-pokedex').offsetHeight / 2)){
    console.log('load')
    load20Pokemon();
  }
}