import { createClient } from "@libsql/client";
//import { NextResponse } from 'next/server';

const searchIcon = document.getElementById('searchIcon');
const searchPanel = document.getElementById('searchPanel');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');
const input = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Open search panel
function openSearch() {
    if (searchPanel.classList.contains('active'))
    {
        closeSearch();
        return;
    }

    searchPanel.classList.add('active');
    overlay.classList.add('active');
    // Auto-focus the search input
    setTimeout(() => searchInput.focus(), 300);
}

// Close search panel
function closeSearch() {
    searchPanel.classList.remove('active');
    overlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '<div class="no-results">Start typing to search for teams</div>';
}

// Event listeners
searchIcon.addEventListener('click', openSearch);
closeBtn.addEventListener('click', closeSearch);
overlay.addEventListener('click', closeSearch);

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchPanel.classList.contains('active')) {
        closeSearch();
    }
});

const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('searchResults');

let searchTimeout;

// Search as user types
searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    // Clear results if input is empty
    if (query.length === 0) {
        resultsContainer.innerHTML = '';
        return;
    }

    // Show loading state
    if (query.length >= 2) {

        // Debounce - wait 300ms after user stops typing
        searchTimeout = setTimeout(() => {
            searchTeamsAsync(query);
        }, 300);
    }
});

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function searchTeamsAsync(query) {
    console.log('Searching for:', query);
    const result = await client.execute(`SELECT * FROM FootballTeams WHERE TeamName LIKE ` + `'%${query.replace(/'/g, "''")}%' LIMIT 10;`);

    const values = result.rows;
    resultsContainer.innerHTML = '';

    let resultsDiv = document.createElement('div');
    resultsDiv.classList.add('results-list');

    values.forEach(team => {
        const resultItem = setupSearchResultItem(team.TeamName, team.TeamID);
        resultsDiv.appendChild(resultItem);
    });

    resultsContainer.appendChild(resultsDiv);

    console.log(result);
}

function setupSearchResultItem(teamName, teamID){
    var itemDiv = document.createElement('div');
    itemDiv.classList.add('result-item');
    itemDiv.onclick = function() { selectTeam(teamID); };

    var widthDiv = document.createElement('div');
    widthDiv.style.width = '40px';

    var infoDiv = document.createElement('div');
    infoDiv.classList.add('team-info');

    var nameDiv = document.createElement('div');
    nameDiv.classList.add('team-name');
    nameDiv.innerHTML = teamName;

    itemDiv.appendChild(widthDiv);
    itemDiv.appendChild(infoDiv);
    infoDiv.appendChild(nameDiv);

    return itemDiv;
}

function selectTeam(teamID) {
    console.log('Selected team ID:', teamID);
    homeTeamID = teamID;
    checkMatchDay(teamID);
    closeSearch();
}