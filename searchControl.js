import { createClient } from "@libsql/client";
import { NextResponse } from 'next/server';

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

let db;

async function loadDatabase() {
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        const response = await fetch('IsItMatchDayDB.db');
        const buffer = await response.arrayBuffer();
        db = new SQL.Database(new Uint8Array(buffer));
        
        console.log('✅ Database loaded!');
        
    } catch (error) {
        console.error('❌ Error loading database:', error);
    }
}

loadDatabase();

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

const TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Njg1OTAwNTMsImlkIjoiYjg4M2E3MmQtYzMxZS00OWM3LTg5OWMtOWYxM2MzZWY0ZjUwIiwicmlkIjoiYmQ5ZjI2M2EtNmZiYy00MTU2LThjYzItYjM0Yjc2ZWQzYzFiIn0.gs7mTi9T4795nN-jLvD8g1oUIPKUwqrkkQ9--no2TFnI_fGdLPdlVCUUBqopRMBR-CG2ZcboiXQbT8Ipm2lKAw";
const TURSO_DATABASE_URL = "libsql://is-it-match-day-vercel-icfg-bth9fa9tnqbrb7rd1bzriivq.aws-eu-west-1.turso.io";

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

/*
export const POST = async () => {
  // Fetch data from SQLite
  const result = await client.execute(`SELECT * FROM FootballTeams WHERE TeamName LIKE ` + `'%${query.replace(/'/g, "''")}%' LIMIT 10;`);
};*/

async function searchTeamsAsync(query) {
    console.log('Searching for:', query);
    const result = await client.execute(`SELECT * FROM FootballTeams WHERE TeamName LIKE ` + `'%${query.replace(/'/g, "''")}%' LIMIT 10;`);

    console.log(result);
}


function searchTeams(query) {
    const searchResult = db.exec(`SELECT * FROM FootballTeams WHERE TeamName LIKE ` + `'%${query.replace(/'/g, "''")}%' LIMIT 10;`);
    
    const values = searchResult[0].values;
    resultsContainer.innerHTML = '';
    let html = '<div class="results-list">';

    values.forEach(team => {
        const teamID = team[0];
        const teamName = team[1];

        html += `
            <div class="result-item" onclick='selectTeam(${JSON.stringify(team)})'>
                <div style="width: 40px;"></div>
                <div class="team-info">
                    <div class="team-name">${teamName}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultsContainer.innerHTML = html;
}

function selectTeam(team) {
    homeTeamID = team[0];
    checkMatchDay(team[0]);
    closeSearch();
}