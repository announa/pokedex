let allPokemonNames = [];
let loadedPokemons = [];
let pokedexIndex = 0;
let searchIsOpen = false;
let searchTimer;
let activeTab = 'tab-1';
let loadingPokemon = false;
let currentScrollPosition = 0;

/**
 * Shows the Pokemon-Logo and initiats the loading of all Pokemon names.
 */
function init() {
  document.getElementById('logo').classList.remove('d-none');
  loadAllPokemonNames();
}

/* -------------------  LOAD POKEMON  --------------------- */

/**
 * Loads the names of all Pokemons from the Poke-API and pushes them into allPokemonNames.
 */
async function loadAllPokemonNames() {
  let url = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=1118';
  let response = await fetch(url);
  response = await response.json();
  response.results.forEach((pokemon) => allPokemonNames.push(pokemon.name));
}

/**
 * Hides the Pokemon-Logo and shows the Pokedex. Initiats the loading of the first 20 Pokemon to the Pokedex.
 */
function loadPokedex() {
  document.getElementById('logo').classList.add('d-none');
  document.getElementById('search-container').classList.remove('d-none');
  document.getElementById('search-input').value = '';
  load20Pokemon();
}

/**
 * Loads 20 Pokemons to the Pokédex. Sets the variable loadingPokemon on true while loading for avoiding simultaneous loading when scrolling to the bottom of the page (which initiats the loading of 20 more Pokemons).
 */
async function load20Pokemon() {
  loadingPokemon = true;
  for (let i = 0; i < 20; i++) {
    let currentPokemon = await getPokemon();
    loadedPokemons.push(currentPokemon);
    addPokemonCard(currentPokemon, 'pokedex');
    pokedexIndex++;
  }
  loadingPokemon = false;
}

/**
 * Gets the name and the object of the current Pokemon for the Pokédex-cards or the search-result (-> query). Checks if the current Pokemon has already been loaded to loadedPokemons and if not, gets it from the Poke-API.
 *
 * @param {string} query - The user-input into the search-field if input is a number. If the input is text, it is one of the Pokemon names that contain the user input. Only existent if the function as been called because of user-input in the search input-field.
 * @returns {object} - The object of the Pokemon that currently will be rendered.
 */
async function getPokemon(query) {
  let pokemonName = allPokemonNames[pokedexIndex];
  if (query) {
    pokemonName = getSearchedPokemonName(query);
  }
  let currentPokemon = checkAlreadyLoadedPokemon(pokemonName);
  if (!currentPokemon) {
    currentPokemon = await getPokemonFromUrl(pokemonName);
  }
  return currentPokemon;
}

/**
 * Gets the name of the Pokemon that matches query.
 *
 * @param {string} query - The user-input into the search-field if input is a number. If the input is text, it is one of the Pokemon names that contain the user input.
 * @returns {string} - The Pokemon name that matches the user-input.
 */
function getSearchedPokemonName(query) {
  let pokemonName;
  if (Number(query)) {
    pokemonName = allPokemonNames[query - 1];
  } else if (isNaN(query)) {
    pokemonName = query;
  }
  return pokemonName;
}

/**
 * Checks if loadedPokemons contains a Pokemon-object with pokemonName and if so, returns this object.
 *
 * @param {string} pokemonName - The name of the current Pokemon.
 * @returns {object} - The object of the current Pokemon.
 */
function checkAlreadyLoadedPokemon(pokemonName) {
  return loadedPokemons.find((pokemon) => pokemon.name === pokemonName);
}

/**
 * Gets the current Pokemon-object from the Poke-API based on the name of the current Pokemon.
 *
 * @param {string} pokemonName - The name of the current Pokemon.
 * @returns {object} - The current Pokemon-object.
 */
async function getPokemonFromUrl(pokemonName) {
  let url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
  let response = await fetch(url);
  let currentPokemon = await response.json();
  return currentPokemon;
}

/* -----------------  RENDER POKÉDEX OR SEARCH RESULTS ------------------ */

/**
 * Adds the card of the currentPokemon to the active container (Pokédex or search-result) and loads the animations.
 *
 * @param {object} currentPokemon - The Pokemon that will be rendered.
 * @param {string} renderContainer - The container in which the currentPokemon will be rendered (Pokedex or search-result).
 */
function addPokemonCard(currentPokemon, renderContainer) {
  renderPokemonCard(currentPokemon, renderContainer);
  renderPokemonTypes(currentPokemon, renderContainer);
  showLightReflexAnimation();
  if (renderContainer === 'pokedex') {
    showLoadingCardAnimation(currentPokemon['name']);
  }
}

/**
 * Renders the card of the current Pokemon to the active container (Pokédex or search-result).
 *
 * @param {object} currentPokemon - The Pokemon that will be rendered.
 * @param {string} renderContainer - The container in which the currentPokemon will be rendered (Pokedex or
 */
function renderPokemonCard(currentPokemon, renderContainer) {
  let pokemonName = currentPokemon['name'];
  let pokemonImg = getPokemonImage(currentPokemon);
  // prettier-ignore
  document.getElementById(renderContainer).insertAdjacentHTML('beforeend',
  createAdjacentHTML(pokemonName, renderContainer, pokemonImg));
}

function getPokemonImage(currentPokemon){
  let pokemonImg = currentPokemon['sprites']['other']['official-artwork']['front_default'];
  if(!pokemonImg){
    pokemonImg = './img/default_img.svg';
  }
  return pokemonImg;
}

/**
 * Creates the HTML-content that will be inserted in the renderContainer.
 *
 * @param {string} pokemonName - The name of the current Pokemon.
 * @param {string} renderContainer - The container in which the currentPokemon will be rendered (Pokedex or search-result).
 * @param {string} pokemonImg - The URL of the Pokemon image.
 */
function createAdjacentHTML(pokemonName, renderContainer, pokemonImg) {
  return `<div id="${pokemonName}-${renderContainer}" onclick="showSelectedPokemon('${pokemonName}','${renderContainer}')" class="pokedex-view">
  <div class="light-anim-layer"></div>
  <img class="bg-pokeball" src="./img/bg-pokeball.svg">
  <h1 id="pokename-${pokemonName}-${renderContainer}" class="pokename z-1">${pokemonName}</h1>
  <div id="types-${pokemonName}-${renderContainer}" class="poketypes--gallery flex-centered col z-1"></div>
  <img class="pokedex-img z-1" src="${pokemonImg}">
  </div>`;
}

/**
 * Renders the types the current Pokemon has and sets the background color of the current Pokemon-card in the Pokédex.
 * @param {object} currentPokemon - The Pokemon that is beeing rendered in the active container.
 * @param {string} renderContainer - The container in which the currentPokemon is beeing rendered (Pokedex or search-result).
 */
function renderPokemonTypes(currentPokemon, renderContainer) {
  let pokemonTypes = getPokemonTypes(currentPokemon);
  let pokemonName = currentPokemon['name'];
  let id1 = pokemonName + '-' + renderContainer;
  let id2 = 'types-' + pokemonName + '-' + renderContainer;
  document.getElementById(id1).classList.add('bg-' + pokemonTypes[0]);
  pokemonTypes.forEach((type) => (document.getElementById(id2).innerHTML += `<span class="poketype">${type}</span>`));
}

/**
 * Gets the types of the Pokemon that is beeing rendered.
 */
function getPokemonTypes(currentPokemon) {
  return currentPokemon['types'].map((type) => {
    return type['type']['name'];
  });
}

/* ---------------  SHOW SELECTED POKEMON  --------------- */

/**
 * Shows the selected Pokemon.
 *
 * @param {string} pokemonName - The name of the selected Pokemon.
 */
function showSelectedPokemon(pokemonName) {
  let selectedPokemon = checkAlreadyLoadedPokemon(pokemonName);
  let pokemonTypes = getPokemonTypes(selectedPokemon, 'pokecard-header');

  openPokemonCard(pokemonTypes);
  renderHeaderArea(selectedPokemon, pokemonTypes);
  showProperties(selectedPokemon);
}

/**
 * Opens the Pokemon-card and shows the background-video.
 *
 * @param {array} pokemonTypes - The types of the selected Pokemon.
 */
function openPokemonCard(pokemonTypes) {
  document.getElementById('selected-pokemon--bg').classList.remove('d-none');
  setBgVideo(pokemonTypes);
}

/**
 * Sets the background-video for the selected Pokemon depending on its types.
 *
 * @param {array} pokeTypes - The types of the selected Pokemon.
 */
function setBgVideo(pokeTypes) {
  // prettier-ignore
  document.getElementById('selected-pokemon--bg').insertAdjacentHTML('afterbegin',
  `<video autoplay muted loop id="bg-video"></video>`);
  let source = document.createElement('source');
  if (['fire', 'fighting'].some((type) => pokeTypes.includes(type))) {
    source.setAttribute('src', 'img/bg-vid1.mp4');
  } else if (['bug', 'grass', 'fairy', 'flying'].some((type) => pokeTypes.includes(type))) {
    source.setAttribute('src', 'img/bg-vid2.mp4');
  } else {
    source.setAttribute('src', 'img/bg-vid3.mp4');
  }
  document.getElementById('bg-video').appendChild(source);
}

/**
 * Renders the header and the image of the pokemon-card.
 *
 * @param {object} selectedPokemon - The pokemon that is beeing rendered.
 */
function renderHeaderArea(selectedPokemon, pokemonTypes) {
  let pokemonImg = getPokemonImage(selectedPokemon);
  /* let pokemonImg = selectedPokemon['sprites']['other']['official-artwork']['front_default']; */
  document.getElementById('selected-pokemon-img').src = pokemonImg;
  document.getElementById('selected-pokemon-h1').innerHTML = selectedPokemon['name'];
  insertPokemonTypesInHeader(pokemonTypes);
  setHeaderColor(pokemonTypes[0]);
}

/**
 * Inserts the Pokemon's types in the header.
 *
 * @param {array} pokemonTypes - The types of the selected Pokemon.
 */
function insertPokemonTypesInHeader(pokemonTypes) {
  let id2 = 'types--selected-pokemon';
  pokemonTypes.forEach((type) => (document.getElementById(id2).innerHTML += `<span class="poketype">${type}</span>`));
}

/**
 * Sets the header-color of the selected Pokemon depending on the first Pokemon-type.
 *
 * @param {string} type - The first type of the selected Pokemon.
 */
function setHeaderColor(type) {
  let bg2 = `linear-gradient(rgba(var(--bg-${type}-numbers),0.6), rgba(var(--bg-${type}-numbers),.3))`;
  document.getElementById('pokecard-header').style.background = bg2;
  document.body.style.setProperty('--active-color', `var(--bg-${type})`);
}

/**
 * Shows the Pokemon's properties in the tables in the about-section and in the Base Stats-section.
 *
 * @param {object} selectedPokemon
 */
function showProperties(selectedPokemon) {
  fillAboutTable(selectedPokemon);
  fillStatsTable(selectedPokemon);
}

/**
 * Fills the tables in the about-section with information.
 *
 * @param {object} selectedPokemon - Object of the selected Pokemon the user wants to open.
 */
function fillAboutTable(selectedPokemon) {
  getSpecies(selectedPokemon);
  getDimensions(selectedPokemon);
  getAbilities(selectedPokemon);
}

async function getSpecies(selectedPokemon) {
  let url = selectedPokemon.species.url;
  let response = await fetch(url);
  responseJson = await response.json();
  let species = responseJson.genera[7].genus;
  document.getElementById('species').innerHTML = species;
}

function getDimensions(selectedPokemon) {
  document.getElementById('weight').innerHTML = selectedPokemon.weight / 10 + ' kg';
  document.getElementById('height').innerHTML = selectedPokemon.height / 10 + ' m';
}

function getAbilities(selectedPokemon) {
  selectedPokemon.abilities.forEach((ability, index) => {
    if (index > 0) {
      document.getElementById('abilities').innerHTML += '<br>';
    }
    let abilityName = ability.ability.name;
    document.getElementById('abilities').innerHTML += abilityName[0].toUpperCase() + abilityName.substring(1);
  });
}

/**
 * Fills the table in the Base Stats-section with information.
 *
 * @param {object} selectedPokemon - Object of the selected Pokemon the user wants to open.
 */
function fillStatsTable(selectedPokemon) {
  let sum = 0;
  let tableCells = Array.from(document.getElementsByClassName('stat-table-td'));

  for (let i = 0; i < 6; i++) {
    let currentValue = selectedPokemon.stats[i].base_stat;
    tableCells[i].innerHTML = currentValue;
    sum += currentValue;
  }
  document.getElementById('total').innerHTML = sum;
}

function hidePokemon() {
  document.getElementById('selected-pokemon--bg').classList.add('d-none');
  ['types--selected-pokemon', 'species', 'abilities'].forEach(
    (element) => (document.getElementById(element).innerHTML = '')
  );
  document.getElementById('bg-video').remove();
  document.getElementById('pokecard-header').style.background = '';
}

/* ----------------  SWITCH POKEMON INFO TABS  ----------------- */

/**
 * Switches between the two tabs in the Pokemon-card.
 *
 * @param {string} selectedTab - The id of the tab the user has clicked on.
 */
function switchTab(selectedTab) {
  if (selectedTab != activeTab) {
    Array.from(document.getElementsByClassName('pokeinfo-tab')).forEach((tab) => tab.classList.toggle('active-tab'));
    Array.from(document.getElementsByTagName('table')).forEach((table) => table.classList.toggle('d-none'));
    activeTab = selectedTab;
  }
}

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
  document.getElementById('search-container').style.background = 'rgba(255,255,255,.8)';
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
 * Gets the users search-input and checks if the input is a number, text or void (= the user deleted his input) for calling the corresponding search-function or closing the search-result.
 */
async function search() {
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
 * Shows the search-result-container and hides the Pokedex. Saves scrollposition in Pokedex.
 */
function showSearchResultContainer() {
  getCurrentScrollPosition();
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
 * Loads the Pokemon-objects that belong to the Pokemon names which match the user-input. Renders the matching Pokemons into the search-result-container.
 *
 * @param {array} matchingPokemonNames - Array with the Pokemon names that contain the user-input in the search-field.
 */
async function renderSearchResult(matchingPokemonNames) {
  let searchResultPokemons = await loadMatchingPokemons(matchingPokemonNames);
  hideLoadingCircle();
  searchResultPokemons.forEach((pokemon) => addPokemonCard(pokemon, 'search-result'));
  goToTop()
  loadingPokemon = false;
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

/* -----------------  LOADING ANIMATIONS  ----------------- */


/**
 * Shows a animation with a blue border around the new rendered cards in the Pokédex for indicating to the user which cards have been new loaded after scrolling to the bottom of the page.
 *
 * @param {string} pokemonName - The name of the current Pokemon.
 */
 function showLoadingCardAnimation(pokemonName) {
  if (pokedexIndex > 19) document.getElementById(pokemonName + '-pokedex').classList.add('loading-animation');
}

/**
 * Shows the light-reflex-animation when loading Pokemon-cards.
 */
function showLightReflexAnimation() {
  let cardAnimLayers = Array.from(document.getElementsByClassName('light-anim-layer'));
  cardAnimLayers.forEach((layer) => {
    layer.classList.add('light-animation');
  });
}

/**
 * Shows the rotating-circle-animation for signalising that data is beeing loaded.
 */
 function showLoadingCircle() {
  document.getElementById('loading-circle-bg').classList.remove('d-none');
}

function hideLoadingCircle() {
  document.getElementById('loading-circle-bg').classList.add('d-none');
}

/* -----------------   WINDOW FUNCTIONS  ----------------- */

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
function toggleToTopButton(){
  if (window.scrollY > window.innerHeight) {
    document.getElementById('to-top-btn').classList.remove('d-none');
  } else {
    document.getElementById('to-top-btn').classList.add('d-none');
  }
}

/**
 * Checks if the end of document is reached and, if so, loads more Pokemon.
 */
function loadMorePokemon(){
  if (
    window.scrollY + window.innerHeight >= document.body.offsetHeight &&
    loadingPokemon === false &&
    !document.getElementById('pokedex').classList.contains('d-none')
  ) {
    load20Pokemon();
  }
}

/**
 * Scrolls to the top of the page without scroll-behaviour: smooth;
 */
function goToTop(){
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
