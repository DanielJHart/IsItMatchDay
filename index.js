const NEWCASTLE_TEAM_ID = '134777';
var homeTeamID = NEWCASTLE_TEAM_ID; 

var cookieTeamID = getCookie('LastTeamID');
if (cookieTeamID) {
    homeTeamID = cookieTeamID;
}

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('id')) {
    const teamID = urlParams.get('id');
    homeTeamID = teamID;
}

const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';

async function checkMatchDay(teamID)
{
    const resultDiv = document.getElementById('result');
    const matchDiv = document.getElementById('match');

    try {
        // Get next event for Newcastle
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=${teamID}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch match data');
        }

        const data = await response.json();

        document.cookie = "LastTeamID=" + teamID;

        if (data.events == null) {
            displayNoEvents();
            return;
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Check if any match is today
        const todayMatch = data.events.find(event => event.dateEvent === todayStr);
        const eventDate = new Date(Date.parse(todayMatch.dateEvent));

        if (todayMatch) {
            displayMatchDay(todayMatch, teamID);
        } else {

            // If someone has not reloaded the page since yesterday, and the match was yesterday, reload
            if (eventDate < today) {
                console.log("Hit, reloading");
                window.location.reload();
                return;
            }

            displayNotMatchDay(data.events[0], teamID);
        }

    } 
    catch (error) {
        resultDiv.innerHTML = "Whoops.";
        matchDiv.innerHTML = "Something went wrong.";
    }
}

function displayMatchDay(match, teamID) {
    const resultDiv = document.getElementById('result');
    const matchDiv = document.getElementById('match');

    resultDiv.innerHTML='YES';
    matchDiv.innerHTML= getMatchInfoString(match, teamID);
}

function displayNotMatchDay(nextMatch, teamID) {
    const resultDiv = document.getElementById('result');
    const matchDiv = document.getElementById('match');

    const date = new Date(nextMatch.dateEvent);
    const options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
    const matchInfo = getMatchInfoString(nextMatch, teamID);

    resultDiv.innerHTML = 'NO';
    matchDiv.innerHTML = `Next Match: ${date.toLocaleDateString('en-GB', options)}<br>${matchInfo}`;
}

function displayNoEvents() {
    const resultDiv = document.getElementById('result');
    const matchDiv = document.getElementById('match');
    resultDiv.innerHTML = 'NO';
    matchDiv.innerHTML = `Next Match: TBC`;
}

function getMatchInfoString(match, teamID) {
    // Determine if home or away
    const isHome = match.idHomeTeam == teamID;
    const homeTeamStr = isHome? match.strHomeTeam : match.strAwayTeam;
    var opponentStr = isHome ? match.strAwayTeam : match.strHomeTeam;
    const venueStr = isHome ? 'At Home' : 'Away';
    
    if (opponentStr.match(/Sunderland/gi) 
        && teamID === NEWCASTLE_TEAM_ID) {
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

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

// Check on page load
checkMatchDay(homeTeamID);