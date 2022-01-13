let activeTab = 'tab-1';

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

function getPokemonImage(currentPokemon) {
  let pokemonImg = currentPokemon['sprites']['other']['official-artwork']['front_default'];
  if (!pokemonImg) {
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
  return `<div id="${pokemonName}-${renderContainer}" onclick="showSelectedPokemon('${pokemonName}','${renderContainer}')" class="pokedex-card">
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
  document.body.style.overflowY = 'hidden';
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
    source.setAttribute('src', './img/bg-vid1.mp4');
  } else if (['bug', 'grass', 'fairy', 'flying'].some((type) => pokeTypes.includes(type))) {
    source.setAttribute('src', './img/bg-vid2.mp4');
  } else {
    source.setAttribute('src', './img/bg-vid3.mp4');
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
  document.body.style.overflowY = 'visible';
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