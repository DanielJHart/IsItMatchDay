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