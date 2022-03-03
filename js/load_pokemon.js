let allPokemonNames = [];
let loadedPokemons = [];
let pokedexIndex = 0;
let loadingPokemon = false;

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
  document.getElementById('header').classList.remove('d-none');
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
  loadMorePokemonforBigScreen();
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

