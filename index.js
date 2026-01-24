const NEWCASTLE_TEAM_ID = '134777';
var homeTeamID = NEWCASTLE_TEAM_ID; 
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('id')) {
    const teamID = urlParams.get('id');
    homeTeamID = teamID;
}

const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';

async function checkMatchDay() 
{
    const resultDiv = document.getElementById('result');
    try {
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
        displayAllTeams();
        
    } catch (error) {
        console.error('❌ Error loading database:', error);
    }
}

function displayAllTeams() {
    const results = db.exec('SELECT * FROM FootballTeams;');
    console.log(results);
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
            searchTeams(query);
        }, 300);
    }
});

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
    checkMatchDay();
    closeSearch();
}

// Check on page load
checkMatchDay();