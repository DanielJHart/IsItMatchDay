const NEWCASTLE_TEAM_ID = '134777';
var homeTeamID = NEWCASTLE_TEAM_ID;
const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';

async function checkMatchDay() 
{
    const resultDiv = document.getElementById('result');
    try {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('id')) {
            const teamID = urlParams.get('id');
            homeTeamID = teamID;
        }

        // Get next event for Newcastle
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=${homeTeamID}`);

        if (!response.ok) {
            throw new Error('Failed to fetch match data');
        }

        const data = await response.json();
        
        if (!data.events || data.events.length === 0) {
            displayNotMatchDay();
            return;
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Check if any match is today
        const todayMatch = data.events.find(event => event.dateEvent === todayStr);

        if (todayMatch) {
            displayMatchDay(todayMatch, homeTeamID);
        } else {
            displayNotMatchDay(data.events[0], homeTeamID);
        }

    } 
    catch (error) {
        resultDiv.innerHTML = `<strong>Error:</strong> ${error.message}<br>Unable to check match status. Please try again.`;
    }
}

function displayMatchDay(match, homeTeamID) {
    const resultDiv = document.getElementById('result');
    const matchDiv = document.getElementById('match');

    resultDiv.innerHTML='YES';
    matchDiv.innerHTML= getMatchInfoString(match, homeTeamID);
}

function displayNotMatchDay(nextMatch, homeTeamID) {
    const resultDiv = document.getElementById('result');
    const matchDiv = document.getElementById('match');

    const date = new Date(nextMatch.dateEvent);
    const options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
    const matchInfo = getMatchInfoString(nextMatch, homeTeamID);

    resultDiv.innerHTML = 'NO'
    matchDiv.innerHTML = `Next Match: ${date.toLocaleDateString('en-GB', options)}<br>${matchInfo}`;
}

function getMatchInfoString(match, homeTeamID) {
    // Determine if home or away
    const isHome = match.idHomeTeam === homeTeamID;
    const homeTeamStr = isHome? match.strHomeTeam : match.strAwayTeam;
    var opponentStr = isHome ? match.strAwayTeam : match.strHomeTeam;
    const venueStr = isHome ? 'At Home' : 'Away';
    
    if (opponentStr.match(/Sunderland/gi)) {
        opponentStr = "<span class=\"sunderland\">" + opponentStr + "</span>";
    }
    
    // Format time (strTime is in HH:MM:SS format)
    let matchTime = 'TBD';
    if (match.strTime) {
        const timeParts = match.strTime.split(':');
        matchTime = `${timeParts[0]}:${timeParts[1]}`;
    } else if (match.strTimestamp) {
        const date = new Date(match.strTimestamp);
        matchTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }

    return `${homeTeamStr} vs ${opponentStr}<br>Playing ${venueStr} at ${matchTime}`;
}

async function AccessDB()
{
    /*
    const client = createClient({
    url: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Njg1OTAwNTMsImlkIjoiYjg4M2E3MmQtYzMxZS00OWM3LTg5OWMtOWYxM2MzZWY0ZjUwIiwicmlkIjoiYmQ5ZjI2M2EtNmZiYy00MTU2LThjYzItYjM0Yjc2ZWQzYzFiIn0.gs7mTi9T4795nN-jLvD8g1oUIPKUwqrkkQ9--no2TFnI_fGdLPdlVCUUBqopRMBR-CG2ZcboiXQbT8Ipm2lKAw",
    authToken: "libsql://is-it-match-day-vercel-icfg-bth9fa9tnqbrb7rd1bzriivq.aws-eu-west-1.turso.io"
    });

    //export const POST = async () => {
    // Fetch data from SQLite
    const result = await client.execute("SELECT * FROM FootballTeams;");
    console.log(result);*/
    //};
}



let searchTimeout;

const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const selectedTeamDiv = document.getElementById('selectedTeam');

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
        resultsContainer.innerHTML = `
            <div class="results-list">
                <div class="loading">
                    <div class="spinner"></div>
                    Searching...
                </div>
            </div>
        `;

        // Debounce - wait 300ms after user stops typing
        searchTimeout = setTimeout(() => {
            searchTeams(query);
        }, 300);
    }
});
//const fs = require('fs');

async function searchTeams(query) {
    try {
        const Database = require('better-sqlite3');
        const db = new Database('C:\\Users\\Daniel\\Documents\\Programming\\IsItMatchDay\\Database\\IsItMatchDayDB.db');
        console.log('✅ Connected to database successfully!');

        const search = db.prepare(`SELECT * FROM FootballTeams WHERE TeamName LIKE ? LIMIT 20`);
        var result = search.run(`%${query}%`);
        db.close();
        //testAPI();

        /*
        const response = await fetch(`https://www.thesportsdb.com/api/v2/json/search/team/newcastle`, {
            headers: { 
                'Authorization': 'Bearer 367454'
            }
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }
        
        const data = await response.json();
        displayResults(data.teams);
        */

    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="results-list">
                <div class="no-results">
                    ❌ Error searching teams<br>
                    <small>${error.message}</small>
                </div>
            </div>`;
    }
}

function displayResults(teams) {
    if (!teams || teams.length === 0) {
        resultsContainer.innerHTML = `
            <div class="results-list">
                <div class="no-results">
                    No teams found. Try a different search term.
                </div>
            </div>`;
        return;
    }

    let html = '<div class="results-list">';

    teams.forEach(team => {
        const badge = team.strBadge || team.strTeamBadge || '';
        const league = team.strLeague || 'Unknown League';
        const sport = team.strSport || '';
        
        // Only show football/soccer teams
        if (sport.toLowerCase() === 'soccer') {
            html += `
                <div class="result-item" onclick='selectTeam(${JSON.stringify(team)})'>
                    ${badge ? `<img src="${badge}" alt="${team.strTeam}" class="team-badge">` : '<div style="width: 40px;"></div>'}
                    <div class="team-info">
                        <div class="team-name">${team.strTeam}</div>
                        <div class="team-league">${league}</div>
                    </div>
                </div>`;
        }
    });

    html += '</div>';
    resultsContainer.innerHTML = html;
}

function selectTeam(team) {
    // Clear search
    searchInput.value = '';
    resultsContainer.innerHTML = '';

    // Display selected team
    const badge = team.strBadge || team.strTeamBadge || '';
    
    selectedTeamDiv.innerHTML = `
        <div class="selected-team">
            <h3>✅ Selected Team</h3>
            
            ${badge ? `<div style="text-align: center; margin-bottom: 20px;">
                <img src="${badge}" alt="${team.strTeam}" style="max-width: 100px; max-height: 100px;">
            </div>` : ''}
            
            <div class="team-detail">
                <span class="detail-label">Team:</span>
                <span class="detail-value">${team.strTeam}</span>
            </div>
            
            <div class="team-detail">
                <span class="detail-label">ID:</span>
                <span class="detail-value">${team.idTeam}</span>
            </div>
            
            <div class="team-detail">
                <span class="detail-label">League:</span>
                <span class="detail-value">${team.strLeague || 'N/A'}</span>
            </div>
            
            <div class="team-detail">
                <span class="detail-label">Country:</span>
                <span class="detail-value">${team.strCountry || 'N/A'}</span>
            </div>
            
            <div class="team-detail">
                <span class="detail-label">Stadium:</span>
                <span class="detail-value">${team.strStadium || 'N/A'}</span>
            </div>
            
            ${team.strStadiumThumb ? `
                <div style="margin-top: 15px; text-align: center;">
                    <img src="${team.strStadiumThumb}" alt="Stadium" style="max-width: 100%; border-radius: 8px;">
                </div>`
            : ''}
        </div>
    `;

    // Log to console for development
    console.log('Selected Team:', team);
    console.log('Team ID:', team.idTeam);
    
    // You can do something with the selected team here
    // For example, redirect to another page or fetch more data
    // window.location.href = `/team?id=${team.idTeam}`;
}

// Close results when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-wrapper') && !e.target.closest('.results-container')) {
        if (!selectedTeamDiv.innerHTML) {
            resultsContainer.innerHTML = '';
        }
    }
});

async function testAPI() {
    try {
        const response = await fetch(`https://www.thesportsdb.com/api/v2/json/search/team/manchester_united`, {
            headers: { 
                'X-API-KEY': '367454',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        
        const text = await response.text();
        console.log('Response:', text);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

AccessDB();

// Check on page load
checkMatchDay();