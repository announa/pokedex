let searchIsOpen = false;
let searchTimer;

/* ------------------  SEARCH INPUT FIELD  ------------------ */

/**
 * Opens the search input-field when it's not yet opened and shows a search-hint. Closes the search input-field when it's already opened.
 */
function toggleSearchField() {
  if (searchIsOpen === false) {
    openSearchField();
    showSearchHint('Search by name: Type at least 3 letters');
  } else {
    closeSearchField();
  }
}

/**
 * Shows a hint above the search input-field. If there is already an open hint, this one will be deleted before showing the next hint. The content of the hint is specified in the parameter.
 *
 * @param {string} hintText - The text the search-hint will show.
 */
function showSearchHint(hintText) {
  removeSearchHint();
  // prettier-ignore
  document.getElementById('search-container').insertAdjacentHTML('beforeend',
    `<div id="search-hint">${hintText}</div>`
  );
}

function removeSearchHint() {
  let searchHint = document.getElementById('search-hint');

  if (searchHint) {
    searchHint.remove();
  }
}

/**
 * Opens the search input-field and adds an eventlistener to the body for closing the search input-field.
 */
function openSearchField() {
  searchIsOpen = true;
  if(window.innerWidth < 700){
    document.getElementById('header-logo').style.width = '0px';
  }
/*   document.getElementById('search-container').style.background = 'rgba(255,255,255,.8)'; */

document.getElementById('search-input').classList.remove('d-none');
  document.getElementById('search-input').focus();
  setTimeout(() => {
    document.getElementById('search-input').style.transform = 'scaleX(100%)';
  }, 50);
  addCloseSearchEventToBody();
}

/**
 * Adds a click-event to the body for closing the search-input when clicking somewhere outside the search-field.
 * With timeout for avoiding adding and firing this onclick-event at the same time when opening the search-container by clicking on the search-icon.
 */
function addCloseSearchEventToBody() {
  setTimeout(() => {
    document.body.addEventListener('click', (event) => {
      let exclude = ['search-container', 'search-btn', 'search-icon', 'search-input'];
      if (!exclude.includes(event.target.id)) {
        closeSearchField();
      }
    });
  }, 10);
}

/**
 * Closes the search input-field.
 */
function closeSearchField() {
  searchIsOpen = false;
  let searchContainer = document.getElementById('search-container');
  removeSearchHint();
  document.getElementById('search-input').style.transform = 'scaleX(0%)';
  setTimeout(() => {
    document.getElementById('search-input').classList.add('d-none');
  }, 225);

  if(window.innerWidth < 700){
    document.getElementById('header-logo').style.width = '';
  }

  setTimeout(() => {
    searchContainer.style.background = '';
  }, 80);
}

/* ------------------  SEARCH  ------------------ */

/**
 * Starts a new search when user stopped typing into the input-field for at least 300ms.
 */
function startSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    search();
  }, 300);
}

/**
 * Gets the users search-input and checks if the input is a number, text or void (= the user deleted his input) for calling the corresponding search-function or closing the search-result. Saves scrollposition in Pokedex.
 */
async function search() {
  getCurrentScrollPosition();
  let query = document.getElementById('search-input').value;

  if (Number(query) || query === '0') {
    searchByNumber(query);
  } else if (isNaN(query) && query.length >= 3) {
    searchByName(query);
  } else if (query.length === 0) {
    closeSearchResult();
  }
}

/**
 * Deletes the old search result, searches for the Pokemon with the number from the user-input and renders it if the number is between 0 and 1118 (number of existing Pokemons). If the user-input is beyond these numbers, a search-hint is shown that there are no matches found.
 *
 * @param {string} query - The user-input (digit).
 */
async function searchByNumber(query) {
  removeLastSearchResult();
  if (query > 0 && query < 1118) {
    let matchingPokemon = await getPokemon(query);
    showSearchResultContainer();
    addPokemonCard(matchingPokemon, 'search-result');
  } else {
    showSearchHint('No matches found');
  }
}

function removeLastSearchResult() {
  document.getElementById('search-result').innerHTML = '';
}

/**
 *  Deletes the old search result, searches for the Pokemon names who contain the user-input and shows the matching Pokemons. If there is no Pokemon name that contains the user-input, a search-hint is shown that there are no matches found.
 *
 * @param {string} query - The user-input (letters).
 */
async function searchByName(query) {
  removeLastSearchResult();
  let matchingPokemonNames = filterAllPokemonNames(query.toLowerCase());
  if (matchingPokemonNames.length > 0) {
    showSearchResultContainer();
    showLoadingCircle();
    await renderSearchResult(matchingPokemonNames);
  } else {
    showSearchHint('No matches found');
  }
}

/**
 * Shows the search-result-container and hides the Pokedex.
 */
function showSearchResultContainer() {
  document.getElementById('pokedex').classList.add('d-none');
  ['search-result', 'close-search-result-btn'].forEach((element) =>
    document.getElementById(element).classList.remove('d-none')
  );
}

/**
 * Filters allPokemonNames for the user-input in the searchfield and returns the matching Pokemon names as array.
 *
 * @param {string} query - The user-input in the searchfield.
 * @returns {array} - Contains the Pokemon-names which matches the query.
 */
function filterAllPokemonNames(query) {
  return allPokemonNames.filter((name) => name.includes(query));
}

/**
 * Loads the pokemon-objects that belong to the Pokemon names which match the user-input and pushes them into the array searchResultPokemons and into loadedPokemons.
 *
 * @param {array} matchingPokemonNames - Array with the Pokemon names that contain the user-input in the search-field.
 * @returns {Promise<array>} - Array that contains the Pokemon-objects that match the user-input in the search-field.
 */
async function loadMatchingPokemons(matchingPokemonNames) {
  let searchResultPokemons = [];
  let matchingPokemon;
  for (let i = 0; i < matchingPokemonNames.length; i++) {
    matchingPokemon = await getMatchingPokemon(matchingPokemonNames[i]);
    searchResultPokemons.push(matchingPokemon);
    loadedPokemons.push(matchingPokemon);
  }
  return searchResultPokemons;
}

/**
 * Gets the matching pokemon-object. Checks if it has already been loaded to the global variable loadedPokemons. If not, gets it from the API.
 *
 * @param {string} matchingPokemonName - The name of the currently checked Pokemon.
 * @returns {object} - The pokemon-object corresponging to matchingPokemonName.
 */
async function getMatchingPokemon(matchingPokemonName) {
  let matchingPokemon = checkAlreadyLoadedPokemon(matchingPokemonName);
  if (!matchingPokemon) {
    matchingPokemon = await getPokemon(matchingPokemonName);
  }
  return matchingPokemon;
}

/**
 * Loads the Pokemon-objects that belong to the Pokemon names which match the user-input. Renders the matching Pokemons into the search-result-container.
 *
 * @param {array} matchingPokemonNames - Array with the Pokemon names that contain the user-input in the search-field.
 */
 async function renderSearchResult(matchingPokemonNames) {
  let searchResultPokemons = await loadMatchingPokemons(matchingPokemonNames);
  hideLoadingCircle();
  searchResultPokemons.forEach((pokemon) => addPokemonCard(pokemon, 'search-result'));
  goToTop();
  loadingPokemon = false;
}

/**
 * Closes the search-result container and shows the Pokédex at the las scroll-position.
 */
function closeSearchResult() {
  document.getElementById('pokedex').classList.remove('d-none');
  ['search-result', 'close-search-result-btn'].forEach((element) =>
    document.getElementById(element).classList.add('d-none')
  );
  document.getElementById('search-input').value = '';
  resetLastScrollPosition();
}

/* ----------------  LOADING ANIMATION - CIRCLE  ----------------- */

/**
 * Shows the rotating-circle-animation for signalising that data is beeing loaded.
 */
 function showLoadingCircle() {
  document.getElementById('loading-circle-bg').classList.remove('d-none');
}

function hideLoadingCircle() {
  document.getElementById('loading-circle-bg').classList.add('d-none');
}