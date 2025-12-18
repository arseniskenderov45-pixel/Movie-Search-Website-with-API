const API_KEY = 'a8beddf2'; // Твой ключ
const searchInput = document.getElementById('search-input');
const container = document.getElementById('movies-container');
const countLabel = document.getElementById('count-label');
const emptyState = document.getElementById('empty-state');
let currentView = 'grid'; // 'grid' или 'list'

// 1. Функция поиска
async function searchMovies(query) {
    if (!query) return;

    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
        const data = await res.json();

        if (data.Response === "True") {
            renderMovies(data.Search);
            emptyState.classList.add('hidden');
        } else {
            container.innerHTML = '';
            countLabel.innerText = "0 movies found";
            emptyState.classList.remove('hidden');
        }
    } catch (err) {
        console.error(err);
    }
}

// 2. Отрисовка фильмов
function renderMovies(movies) {
    container.innerHTML = '';
    countLabel.innerText = `${movies.length} movies found`;

    movies.forEach(movie => {
        const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image';
        
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => openDetails(movie.imdbID);

        card.innerHTML = `
            <img src="${poster}" alt="${movie.Title}">
            <div class="card-content">
                <div class="card-title">${movie.Title}</div>
                <div class="card-meta">
                    <span class="badge">${movie.Year}</span>
                    <span class="badge" style="background:#DCFCE7; color:#166534">${movie.Type.toUpperCase()}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 3. Переключение Grid / List
function setView(view) {
    currentView = view;
    
    // Обновляем классы контейнера
    if (view === 'list') {
        container.classList.remove('movies-grid');
        container.classList.add('movies-list');
    } else {
        container.classList.remove('movies-list');
        container.classList.add('movies-grid');
    }

    // Обновляем кнопки
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${view}`).classList.add('active');
}

// 4. Поиск при вводе (с задержкой, чтобы не спамить API)
let timeoutId;
searchInput.addEventListener('input', (e) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        if (e.target.value.length > 2) {
            searchMovies(e.target.value);
        }
    }, 500); // Ждет 0.5 сек после остановки печати
});

// 5. Модальное окно (Детали)
const modal = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');

async function openDetails(id) {
    modal.classList.remove('hidden');
    modalContent.innerHTML = '<p>Loading details...</p>';

    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`);
    const movie = await res.json();

    modalContent.innerHTML = `
        <h2 style="font-size:24px; margin-bottom:10px;">${movie.Title}</h2>
        <div style="display:flex; gap:10px; margin-bottom:15px; color:#555;">
            <span>⭐ ${movie.imdbRating}</span>
            <span>• ${movie.Genre}</span>
            <span>• ${movie.Runtime}</span>
        </div>
        <p style="line-height:1.6">${movie.Plot}</p>
    `;
}

document.getElementById('close-btn').onclick = () => modal.classList.add('hidden');
window.onclick = (e) => {
    if (e.target === modal) modal.classList.add('hidden');
};

// Запуск начального поиска для красоты
searchMovies('Inception');