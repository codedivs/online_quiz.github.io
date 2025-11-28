  "use strict";

  const container       = document.getElementById("main_div");
  const categoryChips   = document.getElementById("category-chips");
  const searchBox       = document.getElementById("search-box");
  const suggestionsBox  = document.getElementById("search-suggestions");

  let allGames = [];
  let allCategories = new Set();

  // ------------------------------------------------------------------
  // Render games (filtered or all)
  // ------------------------------------------------------------------
  function renderGames(gamesToShow) {
    container.innerHTML = gamesToShow.length === 0
      ? `<p style="text-align:center;padding:3rem;color:#888;">No games found.</p>`
      : "";

    const fragment = document.createDocumentFragment();

    gamesToShow.forEach(game => {
      const playUrl   = `/game.html?g=${encodeURIComponent(game.game_id)}`;
      const stars     = "⭐".repeat(Math.min(Math.max(game.stars || 3, 1), 5));
      const difficulty = (game.difficulty || "medium").toLowerCase();

      const card = document.createElement("section");
      card.className = "game-card";
      card.dataset.category = game.category || "General";
      card.dataset.title    = game.game_name.toLowerCase();

      card.innerHTML = `
        <article class="game-card-inner" tabindex="0">
          <h2 class="game-title">${escapeHtml(game.game_name)}</h2>
          <img src="${escapeHtml(game.game_icon)}"
               alt="${escapeHtml(game.game_name)} icon"
               loading="lazy" class="game-icon"
               onerror="this.src='assets/img/fallback.png'">
          <div class="game-footer">
            <span class="game-difficulty ${difficulty}">
              ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <a href="${playUrl}" class="play-btn">Play Now</a>
            <span class="game-stars" title="${game.stars || 3} stars">${stars}</span>
          </div>
        </article>
      `;
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  }

  // ------------------------------------------------------------------
  // Create the category chips (including "All Games")
  // ------------------------------------------------------------------
  function createCategoryChips() {
    categoryChips.innerHTML = ""; // clear first

    const allChip = document.createElement("span");
    allChip.className = "chip active";
    allChip.textContent = "All Games";
    allChip.dataset.category = "all";
    allChip.onclick = () => filterByCategory("all");
    categoryChips.appendChild(allChip);

    // sorted categories
    [...allCategories].sort().forEach(cat => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = cat;
      chip.dataset.category = cat;
      chip.onclick = () => filterByCategory(cat);
      categoryChips.appendChild(chip);
    });
  }

  // ------------------------------------------------------------------
  // FILTER BY CATEGORY – THIS IS THE FIXED VERSION
  // ------------------------------------------------------------------
  function filterByCategory(selectedCat) {
    // 1. Update active class on chips
    document.querySelectorAll("#category-chips .chip").forEach(chip => {
      chip.classList.toggle("active", chip.dataset.category === selectedCat);
    });

    // 2. Actually filter the games
    const filtered = (selectedCat === "all")
      ? allGames
      : allGames.filter(g => (g.category || "General") === selectedCat);

    renderGames(filtered);
  }

  // ------------------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------------------
  function performSearch() {
    const query = searchBox.value.trim().toLowerCase();
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "none";

    if (!query) {
      renderGames(allGames);
      return;
    }

    const matches = allGames.filter(game => {
      return game.game_name.toLowerCase().includes(query) ||
             (game.category || "").toLowerCase().includes(query);
    });

    if (matches.length) {
      suggestionsBox.style.display = "block";
      matches.slice(0, 7).forEach(game => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = `${game.game_name} ${game.category ? "· " + game.category : ""}`;
        div.onclick = () => {
          searchBox.value = game.game_name;
          suggestionsBox.style.display = "none";
          renderGames([game]);
        };
        suggestionsBox.appendChild(div);
      });
    } else {
      suggestionsBox.style.display = "block";
      suggestionsBox.innerHTML = `<div class="suggestion-item">No games found</div>`;
    }

    renderGames(matches);
  }

  // hide suggestions when clicking outside
  document.addEventListener("click", e => {
    if (!searchBox.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = "none";
    }
  });

  // ------------------------------------------------------------------
  // LOAD GAMES
  // ------------------------------------------------------------------
  fetch('games_in_library.json')
    .then(r => { if (!r.ok) throw new Error("Failed to load games"); return r.json(); })
    .then(games => {
      allGames = games;

      games.forEach(game => allCategories.add(game.category || "General"));

      renderGames(allGames);
      createCategoryChips();

      searchBox.addEventListener("input", performSearch);
      searchBox.addEventListener("focus", performSearch);
      searchBox.placeholder = `Search ${games.length} games...`;
      searchBox.disabled = false;
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<p style="color:#f55;text-align:center;padding:3rem;">
        Failed to load games: ${escapeHtml(err.message)}
      </p>`;
    });

  // ------------------------------------------------------------------
  // Helper
  // ------------------------------------------------------------------
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
