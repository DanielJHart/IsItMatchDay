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
    checkMatchDay(team[0]);
    closeSearch();
}