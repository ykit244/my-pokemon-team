
const offensiveChart = {
    normal: { superEffective: [], notVeryEffective: ['rock', 'steel'], noEffect: ['ghost'] },
    fire: { superEffective: ['grass', 'ice', 'bug', 'steel'], notVeryEffective: ['fire', 'water', 'rock', 'dragon'], noEffect: [] },
    water: { superEffective: ['fire', 'ground', 'rock'], notVeryEffective: ['water', 'grass', 'dragon'], noEffect: [] },
    electric: { superEffective: ['water', 'flying'], notVeryEffective: ['electric', 'grass', 'dragon'], noEffect: ['ground'] },
    grass: { superEffective: ['water', 'ground', 'rock'], notVeryEffective: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], noEffect: [] },
    ice: { superEffective: ['grass', 'ground', 'flying', 'dragon'], notVeryEffective: ['fire', 'water', 'ice', 'steel'], noEffect: [] },
    fighting: { superEffective: ['normal', 'ice', 'rock', 'dark', 'steel'], notVeryEffective: ['poison', 'flying', 'psychic', 'bug', 'fairy'], noEffect: ['ghost'] },
    poison: { superEffective: ['grass', 'fairy'], notVeryEffective: ['poison', 'ground', 'rock', 'ghost'], noEffect: ['steel'] },
    ground: { superEffective: ['fire', 'electric', 'poison', 'rock', 'steel'], notVeryEffective: ['grass', 'bug'], noEffect: ['flying'] },
    flying: { superEffective: ['grass', 'fighting', 'bug'], notVeryEffective: ['electric', 'rock', 'steel'], noEffect: [] },
    psychic: { superEffective: ['fighting', 'poison'], notVeryEffective: ['psychic', 'steel'], noEffect: ['dark'] },
    bug: { superEffective: ['grass', 'psychic', 'dark'], notVeryEffective: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'], noEffect: [] },
    rock: { superEffective: ['fire', 'ice', 'flying', 'bug'], notVeryEffective: ['fighting', 'ground', 'steel'], noEffect: [] },
    ghost: { superEffective: ['psychic', 'ghost'], notVeryEffective: ['dark'], noEffect: ['normal'] },
    dragon: { superEffective: ['dragon'], notVeryEffective: ['steel'], noEffect: ['fairy'] },
    dark: { superEffective: ['psychic', 'ghost'], notVeryEffective: ['fighting', 'dark', 'fairy'], noEffect: [] },
    steel: { superEffective: ['ice', 'rock', 'fairy'], notVeryEffective: ['fire', 'water', 'electric', 'steel'], noEffect: [] },
    fairy: { superEffective: ['fighting', 'dragon', 'dark'], notVeryEffective: ['fire', 'poison', 'steel'], noEffect: [] }
};

const defensiveChart = {
    normal: { weak: ['fighting'], resistant: [], immune: ['ghost'] },
    fire: { weak: ['water', 'ground', 'rock'], resistant: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [] },
    water: { weak: ['electric', 'grass'], resistant: ['fire', 'water', 'ice', 'steel'], immune: [] },
    electric: { weak: ['ground'], resistant: ['electric', 'flying', 'steel'], immune: [] },
    grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resistant: ['water', 'electric', 'grass', 'ground'], immune: [] },
    ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resistant: ['ice'], immune: [] },
    fighting: { weak: ['flying', 'psychic', 'fairy'], resistant: ['bug', 'rock', 'dark'], immune: [] },
    poison: { weak: ['ground', 'psychic'], resistant: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [] },
    ground: { weak: ['water', 'grass', 'ice'], resistant: ['poison', 'rock'], immune: ['electric'] },
    flying: { weak: ['electric', 'ice', 'rock'], resistant: ['grass', 'fighting', 'bug'], immune: ['ground'] },
    psychic: { weak: ['bug', 'ghost', 'dark'], resistant: ['fighting', 'psychic'], immune: [] },
    bug: { weak: ['fire', 'flying', 'rock'], resistant: ['grass', 'fighting', 'ground'], immune: [] },
    rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resistant: ['normal', 'fire', 'poison', 'flying'], immune: [] },
    ghost: { weak: ['ghost', 'dark'], resistant: ['poison', 'bug'], immune: ['normal', 'fighting'] },
    dragon: { weak: ['ice', 'dragon', 'fairy'], resistant: ['fire', 'water', 'electric', 'grass'], immune: [] },
    dark: { weak: ['fighting', 'bug', 'fairy'], resistant: ['ghost', 'dark'], immune: ['psychic'] },
    steel: { weak: ['fire', 'fighting', 'ground'], resistant: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'] },
    fairy: { weak: ['poison', 'steel'], resistant: ['fighting', 'bug', 'dark'], immune: ['dragon'] }
};

let allPokemon = [];
let party = [];
let waitingList = [];
let opponent = null;
let currentSearchPokemon = null;
let selectedGym = null;

let draggedIndex = null;
let dragSource = null;
let replaceCallback = null;

const gyms = {
    brock: { name: 'Brock', type: 'rock', color: '#B8A038' },
    misty: { name: 'Misty', type: 'water', color: '#6890F0' },
    surge: { name: 'Lt. Surge', type: 'electric', color: '#F8D030' },
    erika: { name: 'Erika', type: 'grass', color: '#78C850' },
    koga: { name: 'Koga', type: 'poison', color: '#A040A0' },
    sabrina: { name: 'Sabrina', type: 'psychic', color: '#F85888' },
    blaine: { name: 'Blaine', type: 'fire', color: '#F08030' },
    giovanni: { name: 'Giovanni', type: 'ground', color: '#E0C068' }
};

// Load Pokemon list on page load
(async function() {
    try {
        console.log('Loading Pokémon list...');
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        allPokemon = data.results.map(p => p.name);
        console.log('Successfully loaded', allPokemon.length, 'Pokémon');
        
        document.getElementById('searchInput').placeholder = 'Type to search...';
        document.getElementById('oppSearchInput').placeholder = 'Search opponent...';
        
        // Load default party and waiting list
        await loadDefaultTeam();
    } catch (err) {
        console.error('Failed to load Pokémon:', err);
        document.getElementById('searchInput').placeholder = 'Error loading data';
        document.getElementById('oppSearchInput').placeholder = 'Error loading data';
    }
})();

async function loadDefaultTeam() {
    console.log('Loading default team...');
    
    // Hard-coded party
    const partyNames = ['pikachu', 'charizard', 'blastoise', 'venusaur', 'pidgeot'];
    for (const name of partyNames) {
        const pokemon = await fetchPokemon(name);
        if (pokemon) {
            party.push(pokemon);
        }
    }
    
    // Hard-coded waiting list
    const waitingNames = ['snorlax', 'lapras', 'butterfree'];
    for (const name of waitingNames) {
        const pokemon = await fetchPokemon(name);
        if (pokemon) {
            waitingList.push(pokemon);
        }
    }
    
    renderParty();
    renderWaitingList();
    console.log('Default team loaded!');
}

// Search input handler
document.getElementById('searchInput').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase().trim();
    const suggestions = document.getElementById('searchSuggestions');
    
    if (query.length < 1) {
        suggestions.classList.remove('show');
        return;
    }

    if (allPokemon.length === 0) {
        suggestions.innerHTML = '<div class="suggestion-item" style="color: #999;">Loading...</div>';
        suggestions.classList.add('show');
        return;
    }

    const matches = allPokemon.filter(name => name.includes(query)).slice(0, 10);
    
    if (matches.length > 0) {
        suggestions.innerHTML = matches.map(name => 
            `<div class="suggestion-item" onclick="selectSearchPokemon('${name}')">${capitalize(name)}</div>`
        ).join('');
        suggestions.classList.add('show');
    } else {
        suggestions.innerHTML = '<div class="suggestion-item" style="color: #999;">No matches</div>';
        suggestions.classList.add('show');
    }
});

// Opponent search input handler
document.getElementById('oppSearchInput').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase().trim();
    const suggestions = document.getElementById('oppSearchSuggestions');
    
    if (query.length < 1) {
        suggestions.classList.remove('show');
        return;
    }

    if (allPokemon.length === 0) {
        suggestions.innerHTML = '<div class="suggestion-item" style="color: #999;">Loading...</div>';
        suggestions.classList.add('show');
        return;
    }

    const matches = allPokemon.filter(name => name.includes(query)).slice(0, 10);
    
    if (matches.length > 0) {
        suggestions.innerHTML = matches.map(name => 
            `<div class="suggestion-item" onclick="selectOpponentPokemon('${name}')">${capitalize(name)}</div>`
        ).join('');
        suggestions.classList.add('show');
    } else {
        suggestions.innerHTML = '<div class="suggestion-item" style="color: #999;">No matches</div>';
        suggestions.classList.add('show');
    }
});

// Close suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-box')) {
        document.querySelectorAll('.suggestions').forEach(s => s.classList.remove('show'));
    }
});

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Make functions globally accessible
window.selectSearchPokemon = selectSearchPokemon;
window.selectOpponentPokemon = selectOpponentPokemon;
window.addToParty = addToParty;
window.addToWaiting = addToWaiting;
window.removeFromParty = removeFromParty;
window.removeFromWaiting = removeFromWaiting;
window.removeOpponent = removeOpponent;
window.showMyDetails = showMyDetails;
window.confirmReplace = confirmReplace;
window.selectGym = selectGym;
window.resetGym = resetGym;
window.refreshMatchup = refreshMatchup;
window.checkMatchup = checkMatchup;

async function selectSearchPokemon(name) {
    console.log('Selected:', name);
    document.getElementById('searchInput').value = capitalize(name);
    document.getElementById('searchSuggestions').classList.remove('show');
    
    const pokemon = await fetchPokemon(name);
    if (pokemon) {
        currentSearchPokemon = pokemon;
        alert(`${capitalize(name)} selected! Click "Add to Party" or "Add to Waiting".`);
    }
}

async function selectOpponentPokemon(name) {
    console.log('=== SELECT OPPONENT POKEMON CALLED ===');
    console.log('Selected opponent:', name);
    document.getElementById('oppSearchInput').value = '';
    document.getElementById('oppSearchSuggestions').classList.remove('show');
    
    const pokemon = await fetchPokemon(name);
    if (pokemon) {
        opponent = pokemon;
        console.log('Opponent set successfully:', opponent.name, opponent.types);
        renderOpponent();
        displayPokemonDetails(opponent, 'oppDetailsView');
        console.log('About to call analyzeOpponentMatchup...');
        analyzeOpponentMatchup();
        console.log('analyzeOpponentMatchup finished');
    }
}

async function fetchPokemon(name) {
    try {
        console.log('Fetching:', name);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        console.log('Fetched successfully:', data.name);
        return data;
    } catch (err) {
        console.error('Fetch error:', err);
        alert('Pokémon not found!');
        return null;
    }
}

function addToParty() {
    if (!currentSearchPokemon) {
        alert('Please search and select a Pokémon first!');
        return;
    }
    if (party.length >= 6) {
        alert('Party is full! Maximum 6 Pokémon.');
        return;
    }
    if (party.find(p => p.id === currentSearchPokemon.id)) {
        alert('This Pokémon is already in your party!');
        return;
    }
    
    party.push(currentSearchPokemon);
    document.getElementById('searchInput').value = '';
    currentSearchPokemon = null;
    renderParty();
}

function addToWaiting() {
    if (!currentSearchPokemon) {
        alert('Please search and select a Pokémon first!');
        return;
    }
    if (waitingList.find(p => p.id === currentSearchPokemon.id)) {
        alert('This Pokémon is already in your waiting list!');
        return;
    }
    
    waitingList.push(currentSearchPokemon);
    document.getElementById('searchInput').value = '';
    currentSearchPokemon = null;
    renderWaitingList();
}

function renderParty() {
    const container = document.getElementById('party');
    if (party.length === 0) {
        container.innerHTML = '<div class="empty-message">Party is empty</div>';
        return;
    }
    
    container.innerHTML = party.map((p, i) => `
        <div class="pokemon-slot" draggable="true" data-index="${i}" data-source="party" data-pokemon-id="${p.id}" onclick="showMyDetails(${i})">
            <button class="remove-btn" onclick="event.stopPropagation(); removeFromParty(${i})">×</button>
            <img src="${p.sprites.front_default}" alt="${p.name}">
            <div class="name">${p.name}</div>
        </div>
    `).join('');
    
    setupDragAndDrop();
}

function renderWaitingList() {
    const container = document.getElementById('waitingList');
    if (waitingList.length === 0) {
        container.innerHTML = '<div class="empty-message">Waiting list is empty</div>';
        return;
    }
    
    container.innerHTML = waitingList.map((p, i) => `
        <div class="pokemon-slot" draggable="true" data-index="${i}" data-source="waiting" data-pokemon-id="${p.id}" onclick="showMyDetails(${i}, true)">
            <button class="remove-btn" onclick="event.stopPropagation(); removeFromWaiting(${i})">×</button>
            <img src="${p.sprites.front_default}" alt="${p.name}">
            <div class="name">${p.name}</div>
        </div>
    `).join('');
    
    setupDragAndDrop();
}

function renderOpponent() {
    const container = document.getElementById('opponentSlot');
    const refreshBtn = document.getElementById('refreshBtn');
    
    if (opponent) {
        container.innerHTML = `
            <div class="pokemon-slot" style="width: 100px; height: 100px;">
                <button class="remove-btn" onclick="event.stopPropagation(); removeOpponent()">×</button>
                <img src="${opponent.sprites.front_default}" alt="${opponent.name}">
                <div class="name">${opponent.name}</div>
            </div>
        `;
        // Show refresh button when opponent exists
        if (refreshBtn) refreshBtn.style.display = 'block';
    } else {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px; font-size: 12px;">No opponent</div>';
        // Hide refresh button when no opponent
        if (refreshBtn) refreshBtn.style.display = 'none';
    }
}

function removeOpponent() {
    opponent = null;
    renderOpponent();
    document.getElementById('oppDetailsView').innerHTML = '<div class="empty-state">Set opponent to view details</div>';
    document.getElementById('oppRecommendation').innerHTML = '';
    clearRecommendations();
}

function removeFromParty(index) {
    party.splice(index, 1);
    renderParty();
}

function removeFromWaiting(index) {
    waitingList.splice(index, 1);
    renderWaitingList();
}

function setupDragAndDrop() {
    const slots = document.querySelectorAll('.pokemon-slot[draggable="true"]');
    
    slots.forEach(slot => {
        slot.ondragstart = function(e) {
            draggedIndex = parseInt(this.dataset.index);
            dragSource = this.dataset.source;
            this.classList.add('dragging');
        };

        slot.ondragend = function() {
            this.classList.remove('dragging');
        };

        slot.ondragover = function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        };

        slot.ondragleave = function() {
            this.classList.remove('drag-over');
        };

        slot.ondrop = function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            const targetIndex = parseInt(this.dataset.index);
            const targetSource = this.dataset.source;
            
            if (dragSource === targetSource) {
                // Swap within same list
                if (dragSource === 'party') {
                    [party[draggedIndex], party[targetIndex]] = [party[targetIndex], party[draggedIndex]];
                    renderParty();
                } else {
                    [waitingList[draggedIndex], waitingList[targetIndex]] = [waitingList[targetIndex], waitingList[draggedIndex]];
                    renderWaitingList();
                }
            } else {
                // Different lists - handle replacement
                if (dragSource === 'waiting' && targetSource === 'party') {
                    // Ask for replacement - swap the pokemon
                    const draggedPokemon = waitingList[draggedIndex];
                    const targetPokemon = party[targetIndex];
                    showReplaceModal(draggedPokemon, targetPokemon, () => {
                        // Swap: put party pokemon into waiting list at dragged position
                        waitingList[draggedIndex] = targetPokemon;
                        // Put waiting list pokemon into party at target position
                        party[targetIndex] = draggedPokemon;
                        renderParty();
                        renderWaitingList();
                    });
                } else if (dragSource === 'party' && targetSource === 'waiting') {
                    // Move from party to waiting
                    const pokemon = party.splice(draggedIndex, 1)[0];
                    waitingList.push(pokemon);
                    renderParty();
                    renderWaitingList();
                }
            }
        };
    });

    // Allow drop on empty containers
    const partyContainer = document.getElementById('party');
    const waitingContainer = document.getElementById('waitingList');

    [partyContainer, waitingContainer].forEach(container => {
        container.ondragover = function(e) {
            e.preventDefault();
        };

        container.ondrop = function(e) {
            e.preventDefault();
            
            // Only if dropping on empty area
            if (e.target === this) {
                const targetSource = this.id === 'party' ? 'party' : 'waiting';
                
                if (dragSource !== targetSource) {
                    if (dragSource === 'party' && targetSource === 'waiting') {
                        const pokemon = party.splice(draggedIndex, 1)[0];
                        waitingList.push(pokemon);
                        renderParty();
                        renderWaitingList();
                    } else if (dragSource === 'waiting' && targetSource === 'party') {
                        if (party.length < 6) {
                            const pokemon = waitingList.splice(draggedIndex, 1)[0];
                            party.push(pokemon);
                            renderParty();
                            renderWaitingList();
                        } else {
                            alert('Party is full!');
                        }
                    }
                }
            }
        };
    });
}

function showReplaceModal(draggedPokemon, targetPokemon, callback) {
    const modal = document.getElementById('replaceModal');
    const message = document.getElementById('replaceMessage');
    message.textContent = `Do you want to replace ${capitalize(targetPokemon.name)} with ${capitalize(draggedPokemon.name)}?`;
    modal.style.display = 'block';
    replaceCallback = callback;
}

function confirmReplace(confirmed) {
    const modal = document.getElementById('replaceModal');
    modal.style.display = 'none';
    
    if (confirmed && replaceCallback) {
        replaceCallback();
    }
    
    replaceCallback = null;
}

function showMyDetails(index, isWaiting = false) {
    const pokemon = isWaiting ? waitingList[index] : party[index];
    if (pokemon) {
        displayPokemonDetails(pokemon, 'myDetailsView');
    }
}

function displayPokemonDetails(data, targetId) {
    if (!data) return;
    
    const types = data.types.map(t => t.type.name);
    const name = capitalize(data.name);
    const imageUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;

    const matchups = calculateTypeMatchups(types);

    let html = `
        <div class="pokemon-details">
            <div class="pokemon-image">
                <img src="${imageUrl}" alt="${name}">
            </div>
            <h3 style="text-align: center; font-size: 1.5em; margin-bottom: 8px;">${name}</h3>
            <div class="type-badges">
                ${types.map(type => `<span class="type-badge ${type}">${type}</span>`).join('')}
            </div>

            <div class="offense-defense">
                <div class="matchup-box">
                    <h3>⚔️ OFFENSE</h3>
                    
                    <div class="matchup-category">
                        <h4>✅ Super Effective (2x):</h4>
                        <div class="matchup-list">
                            ${Array.from(matchups.offensive.superEffective).sort().map(t => 
                                `<span class="type-badge ${t}">${t}</span>`
                            ).join('') || '<span style="color: #999; font-size: 11px;">None</span>'}
                        </div>
                    </div>

                    <div class="matchup-category">
                        <h4>➖ Normal (1x):</h4>
                        <div class="matchup-list">
                            ${matchups.normalOffensive.sort().map(t => 
                                `<span class="type-badge ${t}">${t}</span>`
                            ).join('')}
                        </div>
                    </div>

                    <div class="matchup-category">
                        <h4>⚠️ Not Very Effective (0.5x):</h4>
                        <div class="matchup-list">
                            ${Array.from(matchups.offensive.notVeryEffective).sort().map(t => 
                                `<span class="type-badge ${t}">${t}</span>`
                            ).join('') || '<span style="color: #999; font-size: 11px;">None</span>'}
                        </div>
                    </div>

                    <div class="matchup-category">
                        <h4>❌ No Effect (0x):</h4>
                        <div class="matchup-list">
                            ${Array.from(matchups.offensive.noEffect).sort().map(t => 
                                `<span class="type-badge ${t}">${t}</span>`
                            ).join('') || '<span style="color: #999; font-size: 11px;">None</span>'}
                        </div>
                    </div>
                </div>

                <div class="matchup-box">
                    <h3>🛡️ DEFENSE</h3>
                    
                    <div class="matchup-category">
                        <h4>⚠️ Weak To (2x taken):</h4>
                        <div class="matchup-list">
                            ${Array.from(matchups.defensive.weak).sort().map(t => 
                                `<span class="type-badge ${t}">${t}</span>`
                            ).join('') || '<span style="color: #999; font-size: 11px;">None</span>'}
                        </div>
                    </div>

                    <div class="matchup-category">
                        <h4>➖ Normal (1x taken):</h4>
                        <div class="matchup-list">
                            ${matchups.normalDefensive.sort().map(t => 
                                `<span class="type-badge ${t}">${t}</span>`
                            ).join('')}
                        </div>
                    </div>

                    <div class="matchup-category">
                        <h4>💪 Resistant (0.5x taken):</h4>
                        <div class="matchup-list">
                            ${Array.from(matchups.defensive.resistant).sort().map(t => 
                                `<span class="type-badge ${t}">${t}</span>`
                            ).join('') || '<span style="color: #999; font-size: 11px;">None</span>'}
                        </div>
                    </div>

                    <div class="matchup-category">
                        <h4>🛡️ Immune (0x taken):</h4>
                        <div class="matchup-list">
                            ${Array.from(matchups.defensive.immune).sort().map(t => 
                                `<span class="type-badge ${t}">${t}</span>`
                            ).join('') || '<span style="color: #999; font-size: 11px;">None</span>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById(targetId).innerHTML = html;
}

function calculateTypeMatchups(types) {
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    
    let offensive = { superEffective: new Set(), notVeryEffective: new Set(), noEffect: new Set() };
    let defensive = { weak: new Set(), resistant: new Set(), immune: new Set() };

    types.forEach(attackerType => {
        const chart = offensiveChart[attackerType];
        if (chart) {
            if (chart.superEffective) chart.superEffective.forEach(t => offensive.superEffective.add(t));
            if (chart.notVeryEffective) chart.notVeryEffective.forEach(t => offensive.notVeryEffective.add(t));
            if (chart.noEffect) chart.noEffect.forEach(t => offensive.noEffect.add(t));
        }
    });

    types.forEach(defenderType => {
        const chart = defensiveChart[defenderType];
        if (chart) {
            if (chart.weak) chart.weak.forEach(t => defensive.weak.add(t));
            if (chart.resistant) chart.resistant.forEach(t => defensive.resistant.add(t));
            if (chart.immune) chart.immune.forEach(t => defensive.immune.add(t));
        }
    });

    const normalOffensive = allTypes.filter(t => 
        !offensive.superEffective.has(t) && 
        !offensive.notVeryEffective.has(t) && 
        !offensive.noEffect.has(t)
    );

    const normalDefensive = allTypes.filter(t => 
        !defensive.weak.has(t) && 
        !defensive.resistant.has(t) && 
        !defensive.immune.has(t)
    );

    return { offensive, defensive, normalOffensive, normalDefensive };
}

function selectGym(gymId) {
    selectedGym = gymId;
    const gym = gyms[gymId];
    
    // Update button states
    document.querySelectorAll('.gym-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById(`gym-${gymId}`).classList.add('selected');
    
    // Get type advantages
    const strongAgainst = getStrongAgainstGym(gym.type);
    const weakAgainst = getWeakAgainstGym(gym.type);
    
    // Show gym info
    const gymInfo = document.getElementById('gymInfo');
    gymInfo.innerHTML = `
        <div style="font-size: 13px; text-align: left;">
            <div style="text-align: center; margin-bottom: 10px;">
                <strong style="font-size: 15px;">${gym.name}</strong><br>
                <span class="type-badge ${gym.type}" style="display: inline-block; margin-top: 5px;">${gym.type}</span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #2e7d32;">✅ Strong Against:</strong><br>
                <div style="margin-top: 4px;">
                    ${strongAgainst.map(t => `<span class="type-badge ${t}" style="font-size: 10px; padding: 3px 8px; margin: 2px;">${t}</span>`).join('')}
                </div>
            </div>
            <div>
                <strong style="color: #c62828;">⚠️ Weak Against:</strong><br>
                <div style="margin-top: 4px;">
                    ${weakAgainst.map(t => `<span class="type-badge ${t}" style="font-size: 10px; padding: 3px 8px; margin: 2px;">${t}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function resetGym() {
    selectedGym = null;
    
    // Clear button selection
    document.querySelectorAll('.gym-btn').forEach(btn => btn.classList.remove('selected'));
    
    // Clear gym info
    document.getElementById('gymInfo').innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Select a gym to see details</div>';
    
    // Clear opponent
    removeOpponent();
}

function refreshMatchup() {
    if (opponent) {
        console.log('Refreshing matchup analysis...');
        analyzeOpponentMatchup();
    }
}

function getStrongAgainstGym(gymType) {
    // Find which types the gym type is super effective against
    const chart = offensiveChart[gymType];
    return chart ? chart.superEffective : [];
}

function getWeakAgainstGym(gymType) {
    // Find which types are super effective against the gym type
    const weakTypes = [];
    Object.keys(offensiveChart).forEach(type => {
        if (offensiveChart[type].superEffective.includes(gymType)) {
            weakTypes.push(type);
        }
    });
    return weakTypes;
}

function checkMatchup() {
    if (!selectedGym) {
        alert('Please select a gym first!');
        return;
    }

    if (party.length === 0) {
        alert('Your party is empty!');
        return;
    }

    const gym = gyms[selectedGym];
    const gymType = gym.type;

    // Lists for recommendations
    let recommendedInParty = [];
    let recommendedInWaiting = [];

    // --- PARTY POKÉMON EVALUATION ---
    party.forEach((p, index) => {
        const types = p.types.map(t => t.type.name);
        let offensiveScore = 0;
        let defensiveScore = 0;
        let reasons = [];

        // --- Offensive scoring (Your Pokémon → Gym type) ---
        types.forEach(myType => {
            const chart = offensiveChart[myType];
            if (chart.superEffective.includes(gymType)) {
                offensiveScore += 2;
                reasons.push(`${capitalize(myType)} attacks deal 2x damage to ${capitalize(gymType)}.`);
            } else if (chart.notVeryEffective.includes(gymType)) {
                offensiveScore -= 1;
                reasons.push(`${capitalize(myType)} attacks are not very effective vs ${capitalize(gymType)}.`);
            } else if (chart.noEffect.includes(gymType)) {
                offensiveScore -= 2;
                reasons.push(`${capitalize(myType)} attacks have no effect on ${capitalize(gymType)}.`);
            }
        });

        // --- Defensive scoring (Gym type → Your Pokémon) ---
        const gymOffensiveChart = offensiveChart[gymType];
        types.forEach(myType => {
            if (gymOffensiveChart.noEffect.includes(myType)) {
                defensiveScore += 3;
                reasons.push(`Immune to ${capitalize(gymType)} attacks (0x damage taken).`);
            } else if (gymOffensiveChart.notVeryEffective.includes(myType)) {
                defensiveScore += 2;
                reasons.push(`Resists ${capitalize(gymType)} attacks (0.5x damage taken).`);
            } else if (gymOffensiveChart.superEffective.includes(myType)) {
                defensiveScore -= 2;
                reasons.push(`Weak to ${capitalize(gymType)} attacks (2x damage taken).`);
            }
        });

        const totalScore = (offensiveScore * 10) + defensiveScore;

        // --- Debug log ---
        console.log(`${p.name}: offensive=${offensiveScore}, defensive=${defensiveScore}, total=${totalScore}`);
        console.log(`Reasons:`, reasons);

        // --- Updated highlight rule ---
        if (totalScore >= 20) {
            recommendedInParty.push({
                pokemon: p,
                index: index,
                score: totalScore,
                reasons: reasons
            });
        }
    });

    // --- WAITING LIST EVALUATION ---
    waitingList.forEach((p, index) => {
        const types = p.types.map(t => t.type.name);
        let offensiveScore = 0;
        let defensiveScore = 0;
        let reasons = [];

        // --- Offensive scoring (Your Pokémon → Gym type) ---
        types.forEach(myType => {
            const chart = offensiveChart[myType];
            if (chart.superEffective.includes(gymType)) {
                offensiveScore += 2;
                reasons.push(`${capitalize(myType)} attacks deal 2x damage to ${capitalize(gymType)}.`);
            } else if (chart.notVeryEffective.includes(gymType)) {
                offensiveScore -= 1;
                reasons.push(`${capitalize(myType)} attacks are not very effective vs ${capitalize(gymType)}.`);
            } else if (chart.noEffect.includes(gymType)) {
                offensiveScore -= 2;
                reasons.push(`${capitalize(myType)} attacks have no effect on ${capitalize(gymType)}.`);
            }
        });

        // --- Defensive scoring (Gym type → Your Pokémon) ---
        const gymOffensiveChart = offensiveChart[gymType];
        types.forEach(myType => {
            if (gymOffensiveChart.noEffect.includes(myType)) {
                defensiveScore += 3;
                reasons.push(`Immune to ${capitalize(gymType)} attacks (0x damage taken).`);
            } else if (gymOffensiveChart.notVeryEffective.includes(myType)) {
                defensiveScore += 2;
                reasons.push(`Resists ${capitalize(gymType)} attacks (0.5x damage taken).`);
            } else if (gymOffensiveChart.superEffective.includes(myType)) {
                defensiveScore -= 2;
                reasons.push(`Weak to ${capitalize(gymType)} attacks (2x damage taken).`);
            }
        });

        const totalScore = (offensiveScore * 10) + defensiveScore;

        // --- Debug log ---
        console.log(`${p.name}: offensive=${offensiveScore}, defensive=${defensiveScore}, total=${totalScore}`);
        console.log(`Reasons:`, reasons);

        // --- Updated highlight rule ---
        if (totalScore >= 20) {
            recommendedInWaiting.push({
                pokemon: p,
                index: index,
                score: totalScore,
                reasons: reasons
            });
        }
    });

    // Sort by total score for readability
    recommendedInParty.sort((a, b) => b.score - a.score);
    recommendedInWaiting.sort((a, b) => b.score - a.score);

    // Clear previous highlights
    clearRecommendations();

    // --- Highlight and display recommendations ---
    if (recommendedInParty.length > 0) {
        // Highlight all recommended party Pokémon
        recommendedInParty.forEach(rec => {
            const slot = document.querySelector(`[data-source="party"][data-index="${rec.index}"]`);
            if (slot) slot.classList.add('recommended');
            console.log(`✅ Highlighting Party Pokémon: ${capitalize(rec.pokemon.name)} (Total=${rec.score})`);
        });

        const names = recommendedInParty.map(r => capitalize(r.pokemon.name)).join(', ');
        document.getElementById('myRecommendation').innerHTML = `
            <div class="recommendation-panel">
                <h3>✅ Good Match-ups in Party!</h3>
                <p><strong>${names}</strong> ${recommendedInParty.length > 1 ? 'have' : 'has'} type advantage against ${gym.name}'s ${gym.type}-type Pokémon.</p>
            </div>
        `;
    } else if (recommendedInWaiting.length > 0) {
        // Highlight all recommended waiting-list Pokémon
        recommendedInWaiting.forEach(rec => {
            const slot = document.querySelector(`[data-source="waiting"][data-index="${rec.index}"]`);
            if (slot) slot.classList.add('recommended');
            console.log(`✅ Highlighting Waiting Pokémon: ${capitalize(rec.pokemon.name)} (Total=${rec.score})`);
        });

        const names = recommendedInWaiting.map(r => capitalize(r.pokemon.name)).join(', ');
        document.getElementById('myRecommendation').innerHTML = `
            <div class="recommendation-panel" style="background: #fff3e0; border-color: #FF9800;">
                <h3 style="color: #E65100;">⚠️ Consider Switching!</h3>
                <p>No Pokémon in your party has a strong type advantage. Consider adding <strong>${names}</strong> from your waiting list. ${recommendedInWaiting.length > 1 ? 'They have' : 'It has'} advantage against ${gym.type}-type.</p>
            </div>
        `;
    } else {
        const weakAgainst = getWeakAgainstGym(gymType);
        document.getElementById('myRecommendation').innerHTML = `
            <div class="recommendation-panel" style="background: #ffebee; border-color: #f44336;">
                <h3 style="color: #c62828;">❌ No Type Advantage</h3>
                <p>None of your Pokémon have type advantage against ${gym.name}'s ${gym.type}-type. Consider catching ${weakAgainst.slice(0, 3).join(', ')}-type Pokémon.</p>
            </div>
        `;
    }
}


// VERSION 2.0 - Updated logic
function analyzeOpponentMatchup() {
    console.log('=== VERSION 2.0 - analyzeOpponentMatchup START ===');
    
    if (!opponent || party.length === 0) {
        console.log('Cannot analyze: opponent or party missing');
        return;
    }

    console.log('Analyzing matchup against', opponent.name);

    // Clear ALL highlights FIRST, before any analysis
    clearRecommendations();

    const oppTypes = opponent.types.map(t => t.type.name);
    console.log('Opponent types:', oppTypes);
    
    // Find which of our pokemon are best against opponent
    let recommendations = [];
    
    party.forEach((p, index) => {
        const myTypes = p.types.map(t => t.type.name);
        let offensiveScore = 0;
        let defensiveScore = 0;
        let reasons = [];
        
        // Check offensive advantage (Can I damage the opponent effectively?)
        myTypes.forEach(myType => {
            const myOffensiveChart = offensiveChart[myType];
            oppTypes.forEach(oppType => {
                if (myOffensiveChart.superEffective.includes(oppType)) {
                    offensiveScore += 2;
                    reasons.push(`${capitalize(myType)} attacks deal 2x damage to ${capitalize(oppType)}`);
                } else if (myOffensiveChart.notVeryEffective.includes(oppType)) {
                    offensiveScore -= 1;
                } else if (myOffensiveChart.noEffect.includes(oppType)) {
                    offensiveScore -= 2;
                }
            });
        });
        
        // Check defensive advantage (Can the opponent damage me?)
        oppTypes.forEach(oppType => {
            const oppOffensiveChart = offensiveChart[oppType];
            myTypes.forEach(myType => {
                if (oppOffensiveChart.noEffect.includes(myType)) {
                    defensiveScore += 3; // Immunity is best
                    reasons.push(`Immune to ${capitalize(oppType)} attacks (0x damage taken)`);
                } else if (oppOffensiveChart.notVeryEffective.includes(myType)) {
                    defensiveScore += 2; // Resistance is good
                    reasons.push(`Resists ${capitalize(oppType)} attacks (0.5x damage taken)`);
                } else if (oppOffensiveChart.superEffective.includes(myType)) {
                    defensiveScore -= 2; // Weakness is bad
                    reasons.push(`Weak to ${capitalize(oppType)} attacks (2x damage taken)`);
                }
            });
        });
        
        // Calculate priority score based on your logic:
        // Priority 1: 2x dealt + 0x taken (offensive + immune) = highest
        // Priority 2: 2x dealt + 0.5x taken (offensive + resistant)
        // Priority 3: 2x dealt + 1x taken (offensive + neutral)
        // Priority 4: 2x dealt + 2x taken (offensive + weak) = lowest
        
        const totalScore = (offensiveScore * 10) + defensiveScore;
        
        console.log(`${p.name}: offensive=${offensiveScore}, defensive=${defensiveScore}, total=${totalScore}`);
        console.log(`Reasons:`, reasons);
        
        if (totalScore >= 20) {
            recommendations.push({ 
                pokemon: p, 
                index: index, 
                offensiveScore: offensiveScore,
                defensiveScore: defensiveScore,
                totalScore: totalScore,
                reasons: reasons 
            });
        }
    });

    // Sort by total score (offensive weighted higher, but defense matters)
    recommendations.sort((a, b) => b.totalScore - a.totalScore);
    console.log('Recommendations:', recommendations);

    if (recommendations.length > 0) {
        // Highlight ALL Pokemon with score >= 20
        console.log('All recommendations:', recommendations);
        
        recommendations.forEach(rec => {
            const slot = document.querySelector(`[data-source="party"][data-index="${rec.index}"]`);
            console.log('Highlighting slot at index', rec.index, 'with score', rec.totalScore, slot);
            if (slot) slot.classList.add('recommended');
        });

        // Show the best picks in the panel
        const topScore = recommendations[0].totalScore;
        const topPicks = recommendations.filter(r => r.totalScore === topScore);
        const names = topPicks.map(r => capitalize(r.pokemon.name)).join(' or ');
        const uniqueReasons = [...new Set(topPicks[0].reasons)].slice(0, 3).join('; ');
        
        // Create detailed score breakdown
        let scoreDetails = '<div style="margin-top: 10px; font-size: 11px; color: #555;">';
        scoreDetails += '<strong>Score Breakdown:</strong><br>';
        topPicks.forEach(rec => {
            scoreDetails += `• ${capitalize(rec.pokemon.name)}: Offensive=${rec.offensiveScore}, Defensive=${rec.defensiveScore}, Total=${rec.totalScore}<br>`;
        });
        
        // Show all recommendations with scores
        if (recommendations.length > topPicks.length) {
            scoreDetails += '<br><strong>Other Options:</strong><br>';
            recommendations.slice(topPicks.length).slice(0, 3).forEach(rec => {
                scoreDetails += `• ${capitalize(rec.pokemon.name)}: Offensive=${rec.offensiveScore}, Defensive=${rec.defensiveScore}, Total=${rec.totalScore}<br>`;
            });
        }
        scoreDetails += '</div>';
        
        document.getElementById('oppRecommendation').innerHTML = `
            <div class="recommendation-panel">
                <h3>✅ Best Choice: ${names}</h3>
                <p><strong>Why?</strong> ${uniqueReasons}.</p>
                ${scoreDetails}
            </div>
        `;
    } else {
        document.getElementById('oppRecommendation').innerHTML = `
            <div class="recommendation-panel" style="background: #fff3e0; border-color: #FF9800;">
                <h3 style="color: #E65100;">⚠️ No Clear Advantage</h3>
                <p>None of your party Pokémon have a strong type advantage against ${capitalize(opponent.name)}. Be careful!</p>
            </div>
        `;
    }
    
    // Also check waiting list for better options
    checkWaitingListForOpponent(oppTypes);
}

function checkWaitingListForOpponent(oppTypes) {
    if (waitingList.length === 0) return;
    
    let waitingRecommendations = [];
    
    waitingList.forEach((p, index) => {
        const myTypes = p.types.map(t => t.type.name);
        let offensiveScore = 0;
        let defensiveScore = 0;
        
        myTypes.forEach(myType => {
            const myOffensiveChart = offensiveChart[myType];
            oppTypes.forEach(oppType => {
                if (myOffensiveChart.superEffective.includes(oppType)) {
                    offensiveScore += 2;
                } else if (myOffensiveChart.notVeryEffective.includes(oppType)) {
                    offensiveScore -= 1;
                } else if (myOffensiveChart.noEffect.includes(oppType)) {
                    offensiveScore -= 2;
                }
            });
        });
        
        oppTypes.forEach(oppType => {
            const oppOffensiveChart = offensiveChart[oppType];
            myTypes.forEach(myType => {
                if (oppOffensiveChart.noEffect.includes(myType)) {
                    defensiveScore += 3;
                } else if (oppOffensiveChart.notVeryEffective.includes(myType)) {
                    defensiveScore += 2;
                } else if (oppOffensiveChart.superEffective.includes(myType)) {
                    defensiveScore -= 2;
                }
            });
        });
        
        const totalScore = (offensiveScore * 10) + defensiveScore;
        
        if (totalScore >= 20) {
            waitingRecommendations.push({ 
                pokemon: p, 
                index: index, 
                totalScore: totalScore
            });
        }
    });
    
    if (waitingRecommendations.length > 0) {
        waitingRecommendations.sort((a, b) => b.totalScore - a.totalScore);
        
        // Check if waiting list has better pokemon than party
        const bestWaiting = waitingRecommendations[0];
        
        // Highlight in waiting list
        waitingRecommendations.forEach(rec => {
            const slot = document.querySelector(`[data-source="waiting"][data-index="${rec.index}"]`);
            if (slot) slot.classList.add('recommended');
        });
        
        // Add waiting list info to recommendation panel
        const currentPanel = document.getElementById('oppRecommendation').innerHTML;
        
        // Check if panel shows "No Clear Advantage"
        if (currentPanel && currentPanel.includes('No Clear Advantage')) {
            // Party has no advantages, but waiting list does - show waiting list options prominently
            const waitingInfo = `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">
                    <strong style="color: #FF9800;">💡 Better Options in Waiting List:</strong><br>
                    ${waitingRecommendations.map(rec => 
                        `• ${capitalize(rec.pokemon.name)}: Total Score=${rec.totalScore}`
                    ).join('<br>')}
                    <p style="font-size: 12px; margin-top: 10px; color: #666;">Consider swapping these into your party!</p>
                </div>
            `;
            document.getElementById('oppRecommendation').innerHTML = currentPanel.replace('</div>', waitingInfo + '</div>');
        } else if (currentPanel && !currentPanel.includes('No Clear Advantage')) {
            // Party has advantages, also show waiting list
            const waitingInfo = `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">
                    <strong style="color: #FF9800;">📋 Also in Waiting List:</strong><br>
                    ${waitingRecommendations.map(rec => 
                        `• ${capitalize(rec.pokemon.name)}: Total Score=${rec.totalScore}`
                    ).join('<br>')}
                </div>
            `;
            document.getElementById('oppRecommendation').innerHTML = currentPanel.replace('</div>', waitingInfo + '</div>');
        }
    }
}

function clearRecommendations() {
    document.querySelectorAll('.pokemon-slot').forEach(slot => {
        slot.classList.remove('recommended');
        slot.classList.remove('recommended-risky');
    });
}