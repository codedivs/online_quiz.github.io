  "use strict";

  const container = document.getElementById("main_div");
  const categoryChips = document.getElementById("category-chips");
  const searchBox = document.getElementById("search-box");
  const suggestionsBox = document.getElementById("search-suggestions");

  let allGames = [];
  let allCategories = new Set();

  // Render all games (or filtered ones)
  function renderGames(gamesToShow) {
    container.innerHTML = gamesToShow.length === 0
      ? `<p style="text-align:center; padding:2rem; color:#666;">No games found matching your search.</p>`
      : "";

    const fragment = document.createDocumentFragment();

    gamesToShow.forEach((game, index) => {
      const playUrl = `/game.html?g=${encodeURIComponent(game.game_id)}`;
      const stars = "⭐".repeat(Math.min(Math.max(game.stars || 3, 1), 5));
      const difficulty = (game.difficulty || "medium").toLowerCase();

      const card = document.createElement("section");
      card.className = "game-card";
      card.dataset.category = game.category || "Uncategorized";
      card.dataset.title = game.game_name.toLowerCase();

      card.innerHTML = `
        <article class="game-card-inner" tabindex="0">
          <h2 class="game-title">${escapeHtml(game.game_name)}</h2>
          <img src="${escapeHtml(game.game_icon)}" 
               alt="${escapeHtml(game.game_name)} icon" 
               loading="lazy" 
               class="game-icon"
               onerror="this.src='assets/img/fallback.png'">
          <div class="game-footer">
            <span class="game-category-chip">${escapeHtml(game.category || "General")}</span>
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

  // Create category filter chips
  function createCategoryChips() {
    categoryChips.innerHTML = `
      <span class="chip active" data-category="all">All Games</span>
    `;

    // Sort categories alphabetically
    [...allCategories].sort().forEach(cat => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = cat;
      chip.dataset.category = cat;
      chip.onclick = () => filterByCategory(cat);
      categoryChips.appendChild(chip);
    });
  }

  // Filter by category
  function filterByCategory(selectedCat) {
    document.querySelectorAll("#category-chips .chip").forEach(c => {
      c.classList.toggle("active", c.dataset.category === selectedCat || (selectedCat === "all" && c.dataset.category === "all"));
    });

    const filtered = selectedCat === "all"
      ? allGames
      : allGames.filter(g => (g.category || "General") === selectedCat);

    renderGames(filtered);
  }

  // Search functionality
  function performSearch() {
    const query = searchBox.value.trim().toLowerCase();
    suggestionsBox.innerHTML = "";

    if (!query) {
      renderGames(allGames);
      suggestionsBox.style.display = "none";
      return;
    }

    const matches = allGames.filter(game => {
      const name = game.game_name.toLowerCase();
      const category = (game.category || "").toLowerCase();
      return name.includes(query) || category.includes(query);
    });

    // Show suggestions dropdown
    if (matches.length > 0) {
      suggestionsBox.style.display = "block";
      matches.slice(0, 6).forEach(game => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent = `${game.game_name} ${game.category ? '· ' + game.category : ''}`;
        item.onclick = () => {
          searchBox.value = game.game_name;
          suggestionsBox.style.display = "none";
          renderGames([game]);
        };
        suggestionsBox.appendChild(item);
      });
    } else {
      suggestionsBox.style.display = "block";
      suggestionsBox.innerHTML = "<div class='suggestion-item'>No games found</div>";
    }

    renderGames(matches);
  }

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchBox.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = "none";
    }
  });

  // Load games
  fetch('games_in_library.json')
    .then(r => {
      if (!r.ok) throw new Error("Failed to load games");
      return r.json();
    })
    .then(games => {
      allGames = games;

      // Extract all unique categories
      games.forEach(game => {
        const cat = game.category || "General";
        allCategories.add(cat);
      });

      // Initial render
      renderGames(allGames);
      createCategoryChips();

      // Activate search
      searchBox.addEventListener("input", performSearch);
      searchBox.addEventListener("focus", performSearch);
      searchBox.placeholder = `Search ${games.length} games...`;
      searchBox.disabled = false;
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<p style="color:red;text-align:center;">Failed to load games: ${escapeHtml(err.message)}</p>`;
    });

  // Utility: Escape HTML
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
