let allPokemonNames = [];
let loadedPokedexPokemons = [];
let searchIsOpen = false;
let searchResultPokemons = [];
let activeTab = 'tab-1';
let activeType;
let searchTimer;

function showLogo() {
  document.getElementById('logo').classList.remove('d-none');
}

function loadPokedex() {
  document.getElementById('logo').classList.add('d-none');
  document.getElementById('search-container').classList.remove('d-none');
  document.getElementById('search-input').value = '';
  loadPokemon();
  loadAllPokemonNames();
}

async function loadPokemon() {
  await getPokemon();
  showCardAnimation();
}

/**
 * Gets the Pokemon-data for the Pokemon-cards in the Pokedex.
 */
async function getPokemon() {
  for (let i = 1; i <= 20; i++) {
    let url = `https://pokeapi.co/api/v2/pokemon/${loadedPokedexPokemons.length + 1}`;
    let response = await fetch(url);
    let currentPokemon = await response.json();
    loadedPokedexPokemons.push(currentPokemon);
    addPokemonCard(currentPokemon, 'pokedex');
  }
}

/**
 * Shows the light-reflex-animation when loading new Pokemon-cards.
 */
function showCardAnimation() {
  let cardAnimLayers = Array.from(document.getElementsByClassName('card-anim-layer'));
  cardAnimLayers.forEach((layer) => {
    layer.classList.add('card-animation');
  });
}

/**
 * Loads the names of all Pokemons for the search-function.
 */
async function loadAllPokemonNames() {
  let url = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=1118';
  let response = await fetch(url);
  response = await response.json();
  response.results.forEach((pokemon) => allPokemonNames.push(pokemon.name));
}

/* -----------------  LOAD POKEDÉX  ------------------ */

/**
 * Adds the card of the currentPokemon to the active container (Pokedexor search-result).
 * @param {object} currentPokemon - The Pokemon that is beeing rendered in the active container.
 * @param {string} renderContainer - The container in which the currentPokemon is beeing rendered (Pokedex or search-result).
 */
function addPokemonCard(currentPokemon, renderContainer, searchResultIndex) {
  let pokeIndex = setCurrentIndex(renderContainer, searchResultIndex);
  let pokemonImg = currentPokemon['sprites']['other']['official-artwork']['front_default'];

  renderPokemonCard(currentPokemon, pokeIndex, renderContainer, pokemonImg);

  // prettier-ignore
  getTypes(currentPokemon, 'types-' + pokeIndex + '-' +
  renderContainer, 'pokemon-' + pokeIndex + '-' + renderContainer);
  showLoadingAnimation(pokeIndex, renderContainer);
}

function setCurrentIndex(renderContainer, searchResultIndex) {
  if (renderContainer === 'search-result') pokeIndex = searchResultIndex;
  else pokeIndex = loadedPokedexPokemons.length - 1;
  return pokeIndex;
}

function renderPokemonCard(currentPokemon, pokeIndex, renderContainer, pokemonImg) {
  document.getElementById(renderContainer).insertAdjacentHTML(
    'beforeend',
    `
  <div id="pokemon-${pokeIndex}-${renderContainer}" onclick="showPokemon(${pokeIndex},'${renderContainer}')" class="pokecard--gallery-view">
  <div class="card-anim-layer"></div>
  <img class="bg-pokeball" src="./img/bg-pokeball.svg">
  <h1 id="pokename-${pokeIndex}-${renderContainer}" class="pokename z-1">${currentPokemon['name']}</h1>
  <div id="types-${pokeIndex}-${renderContainer}" class="poketypes--gallery flex-centered col z-1"></div>
  <img class="pokemon-gallery-img z-1" src="${pokemonImg}">
  </div>
  `
  );
}

function showLoadingAnimation(pokeIndex, renderContainer) {
  if (pokeIndex > 19)
    document.getElementById('pokemon-' + pokeIndex + '-' + renderContainer).classList.add('loading-animation');
}

/**
 * Gets the types of the Pokemon that is beeing rendered and sets the color of it's card (Pokedex-card or header of about-view).
 */
function getTypes(currentPokemon, id1, id2) {
  let pokeTypes = [];
  currentPokemon.types.forEach((type, currentTypeOrder) => {
    pokeTypes.push(type.type.name);
    document.getElementById(id1).innerHTML += `<span class="poketype">${pokeTypes[currentTypeOrder]}</span>`;

    setTypeColor(currentTypeOrder, pokeTypes[0], id2);
  });
  return pokeTypes;
}

/**
 * Sets the color of the Pokemon Card in the Gallery view or the header of the Pokemon beeing viewed depending on the Pokemons first type.
 * @param {number} currentTypeOrder - The order of the current type of the Pokemon.
 * @param {string} firstType - The first type of the Pokemon.
 * @param {string} colorContainer - The element the color is beeing applied to.
 */
function setTypeColor(currentTypeOrder, firstType, colorContainer) {
  if (currentTypeOrder === 0 && colorContainer != 'pokecard-header') {
    document.getElementById(colorContainer).classList.add('bg-' + firstType);
  }
  if (currentTypeOrder === 0 && colorContainer == 'pokecard-header') {
    setHeaderInShowPokemon(firstType);
  }
}

/* ---------------  SHOW SELECTED POKEMON  --------------- */

/**
 * Sets the header color of the card of the selected Pokemon.
 * @param {string} type - The first type of the selected Pokemon.
 */
function setHeaderInShowPokemon(type) {
  let bg2 = `linear-gradient(rgba(var(--bg-${type}-numbers),0.6), rgba(var(--bg-${type}-numbers),.3))`;
  document.getElementById('pokecard-header').style.background = bg2;
  document.body.style.setProperty('--active-color', `var(--bg-${type})`);
}

/**
 * Shows the selected Pokemon.
 * @param {number} pokeIndex - The index of the selected Pokemon.
 * @param {string} sourceContainer - The container from which the Pokemon was selected (Pokedex or Search-results).
 */
function showPokemon(pokeIndex, sourceContainer) {
  let pokemon;
  if (sourceContainer === 'search-result') pokemon = searchResultPokemons[pokeIndex];
  else pokemon = loadedPokedexPokemons[pokeIndex];

  let pokemonImg = pokemon['sprites']['other']['official-artwork']['front_default'];
  document.getElementById('pokecard--about-bg').classList.remove('d-none');
  document.getElementById('about-pokemon-img').src = pokemonImg;
  document.getElementById('about-pokemon-h1').innerHTML = pokemon['name'];

  loadproperties(pokemon);
}

function loadproperties(selectedPokemon) {
  let pokeTypes = getTypes(selectedPokemon, 'types--about', 'pokecard-header');
  setBgVideo(pokeTypes);
  fillAboutTable(selectedPokemon);
  fillStatsTable(selectedPokemon);
}

/**
 * Sets the background video for the selected Pokemon depending of it's types.
 * @param {array} pokeTypes - The types of the selected Pokemon.
 */
function setBgVideo(pokeTypes) {
  // prettier-ignore
  document.getElementById('pokecard--about-bg').insertAdjacentHTML('afterbegin',
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
 * Fills the table in the about-section with information.
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
 * @param {object} selectedPokemon - Object of the selected Pokemon the user wants to open.
 */
function fillStatsTable(selectedPokemon) {
  let sum = 0;
  let statCells = Array.from(document.getElementsByClassName('stat-table-td'));
  statCells.forEach((cell, index) => {
    if (index < 6) {
      cell.innerHTML = selectedPokemon.stats[index].base_stat;
      sum += selectedPokemon.stats[index].base_stat;
    }
  });
  document.getElementById('total').innerHTML = sum;
}

function hidePokemon() {
  document.getElementById('pokecard--about-bg').classList.add('d-none');
  ['types--about', 'species', 'abilities'].forEach((element) => (document.getElementById(element).innerHTML = ''));
  document.getElementById('bg-video').remove();
  document.getElementById('pokecard-header').style.background = '';
}

/* ----------------  SWITCH POKEMON INFO TABS  ----------------- */

/**
 * Switches between the two tabs in the Pokemon-card.
 * @param {string} selectedTab - The id of the tab the user has clicked on.
 */
function switchTab(selectedTab) {
  if (selectedTab != activeTab) {
    Array.from(document.getElementsByClassName('pokeinfo-tab')).forEach((tab) => tab.classList.toggle('active-tab'));
    Array.from(document.getElementsByTagName('table')).forEach((table) => table.classList.toggle('d-none'));
    activeTab = selectedTab;
  }
}

/* ------------------  SEARCH  ------------------ */

function openCloseSearchField() {
  if (searchIsOpen === false) {
    openSearchField();
  } else {
    closeSearchField();
  }
}

function showSearchHint() {
  // prettier-ignore
  document.getElementById('search-container').insertAdjacentHTML('beforeend',
    `<div id="search-hint">Search by name: Type at least 3 letters</div>`
  );
}

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
 * Adds a click-event to the body for closing the search-input when clicking somewhere. -> For mobile-devices.
 * With timeout for avoiding firing this onclick-event when opening the search-container.
 */
function addCloseSearchEventToBody() {
  // prettier-ignore
  setTimeout(() => {
    document.body.addEventListener('click', (event) => {
        let exclude = ['search-container', 'search-btn', 'search-icon', 'search-input'];
        if (!exclude.includes(event.target.id)) {
          console.log('close search field', event.target)
          closeSearchField();
        }
      }
    );
  }, 10);
}

function closeSearchField() {
  searchIsOpen = false;
  let searchContainer = document.getElementById('search-container');
  let searchHint = document.getElementById('search-hint');

  if (searchHint) searchHint.remove();
  document.getElementById('search-input').style.transform = 'scaleX(0%)';

  setTimeout(() => {
    searchContainer.style.background = '';
  }, 80);
}

/**
 * Removes the last search results and starts a new search.
 */
function startSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    search();
  }, 200);
}

/**
 * Gets the users search-input and checks if the input is a number, text or void. If it's a number, the Pokemon with that number will be loaded from the IPA. If it's a string, it checks for matching Pokemon-names from 3 characters on. If it's void (= the user deleted his input), the search-results will be closed.
 */
async function search() {
  let query = document.getElementById('search-input').value;
  console.log(Number(query));

  if (Number(query)) {
    removeLastSearchResult();
    let matchingPokemon = await getSearchedPokemon(query);
    renderSearchResult(matchingPokemon);
  } else if (isNaN(query) && query.length >= 3) {
    removeLastSearchResult();
    query = query.toLowerCase();
    findMatchingPokemons(query);
  } else if (query.length === 0) {
    closeSearchResult();
  }
}

function removeLastSearchResult() {
  document.getElementById('search-result').innerHTML = '';
  searchResultPokemons = [];
}

/**
 * Finds the Pokemon-names that matches the users input in the searchfield.
 * @param {string} query - The users input in the searchfield.
 */
async function findMatchingPokemons(query) {
  let matchingPokemonNames = filterAllPokemonNames(query);
  if (matchingPokemonNames) {
    for (let i = 0; i < matchingPokemonNames.length; i++) {
      let currentName = matchingPokemonNames[i];
      let matchingPokemon = checkAlreadyLoadedPokemon(currentName);
      if (!matchingPokemon) {
        matchingPokemon = await getSearchedPokemon(currentName);
      }
      searchResultPokemons.push(matchingPokemon);
      renderSearchResult(matchingPokemon, i);
    }
  }
}

/**
 * Filters allPokemonNames for the users input in the searchfield and returns the matching Pokemons as array.
 * @param {string} query - The users input in the searchfield.
 * @returns {array} - Contains the Pokemon-names which contain the query.
 */
function filterAllPokemonNames(query) {
  return allPokemonNames.filter((name) => name.includes(query));
}

function checkAlreadyLoadedPokemon(result) {
  let matchingPokemonNames = loadedPokedexPokemons.filter((pokemon) => pokemon.name.includes(result));
  matchingPokemonNames = matchingPokemonNames[0];
  return matchingPokemonNames;
}

/**
 * Gets the Pokemon-data of the searched Pokemon for the Pokemon-cards in the search-result-container.
 * @param {string or number} searchResult - The name or index of the currently searched Pokemon.
 */
async function getSearchedPokemon(pokemon) {
  if (pokemon) {
    let url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`;
    let response = await fetch(url);
    let currentSearchedPokemon = await response.json();
    /* renderSearchResult(currentSearchedPokemon, resultIndex); */
    return currentSearchedPokemon;
  }
}

function renderSearchResult(currentSearchedPokemon, resultIndex) {
  document.getElementById('pokedex').classList.add('d-none');
  ['search-result', 'close-search-result-btn'].forEach((element) =>
    document.getElementById(element).classList.remove('d-none')
  );
  addPokemonCard(currentSearchedPokemon, 'search-result', resultIndex);
}

function closeSearchResult() {
  document.getElementById('pokedex').classList.remove('d-none');
  ['search-result', 'close-search-result-btn'].forEach((element) =>
    document.getElementById(element).classList.add('d-none')
  );
  document.getElementById('search-input').value = '';
}

/* -----------------   GENERAL FUNCTIONS  ----------------- */

/**
 * Checks if the end of document is reached and, if so, loads more Pokemon
 */
window.onscroll = function () {
  if (window.scrollY > window.innerHeight) {
    document.getElementById('to-top-btn').classList.remove('d-none');
  } else {
    document.getElementById('to-top-btn').classList.add('d-none');
  }
  if (window.scrollY + window.innerHeight >= document.body.offsetHeight) {
    loadPokemon();
  }
};

/**
 * Scrolls to the top of the page
 */
function scrollToTop() {
  document.documentElement.scrollTop = 0;
}

window.onresize = function () {
  checkWindowSize();
};

/**
 * Adds or removes the onclick-event for hiding the shown Pokemon to the pokemon-image of the shown Pokemon depending on the window-size.
 */
function checkWindowSize() {
  if (window.innerHeight < 570) {
    document.getElementById('about-pokemon-img').removeEventListener('click', hidePokemon);
  } else if (window.innerWidth < 700) {
    document.getElementById('about-pokemon-img').removeEventListener('click', hidePokemon);
  } else {
    document.getElementById('about-pokemon-img').addEventListener('click', hidePokemon);
  }
}
