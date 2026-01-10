const NEWCASTLE_TEAM_ID = '134777';
const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';

async function checkMatchDay() 
{
    const resultDiv = document.getElementById('result');
    try {
        var homeTeamID = NEWCASTLE_TEAM_ID;
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
            displayMatchDay(todayMatch);
        } else {
            displayNotMatchDay(data.events[0]);
        }

    } 
    catch (error) {
        resultDiv.innerHTML = `<strong>Error:</strong> ${error.message}<br>Unable to check match status. Please try again.`;
    }
}

function displayMatchDay(match) {
    const resultDiv = document.getElementById('result');
    const matchDiv = document.getElementById('match');

    resultDiv.innerHTML='YES';
    matchDiv.innerHTML= getMatchInfoString(match);
}

function displayNotMatchDay(nextMatch) {
    const resultDiv = document.getElementById('result');
    const matchDiv = document.getElementById('match');

    const date = new Date(nextMatch.dateEvent);
    const options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
    const matchInfo = getMatchInfoString(nextMatch);

    resultDiv.innerHTML = 'NO'
    matchDiv.innerHTML = `Next Match: ${date.toLocaleDateString('en-GB', options)}<br>${matchInfo}`;
}

function getMatchInfoString(match, homeTeamID) {
    // Determine if home or away
    const isHome = match.idHomeTeam === homeTeamID;
    const homeTeam = isHome? match.strHomeTeam : match.strAwayTeam;
    var opponent = isHome ? match.strAwayTeam : match.strHomeTeam;
    const venue = isHome ? 'At Home' : 'Away';
    
    if (opponent.match(/Sunderland/gi)) {
        opponent = "<span class=\"sunderland\">" + opponent + "</span>";
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

    return `${homeTeam} vs ${opponent}<br>Playing ${venue} at ${matchTime}`;
}

// Check on page load
checkMatchDay();