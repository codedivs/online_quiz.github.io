"use strict";

fetch("/games_in_library.json")
  .then(response => {
    if (!response.ok) throw new Error("Unable to load games library.");
    return response.json();
  })
  .then(games => {
    const container = document.getElementById("main_div");
    if (!container) return;

    // Optional: Structured data for SEO
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Online Games Library",
      "description": "Free browser-based educational and brain-training games.",
      "itemListElement": []
    };

    games.forEach((game, index) => {
      const card = document.createElement("section");
      card.className = "game-card";

      card.innerHTML = `
        <img src="${game.game_icon}" alt="${game.game_name} icon" loading="lazy">
        <h2>${game.game_name}</h2>
        <a href="/game.html?g=${game.game_id}" class="play-button">Play Now</a>
      `;

      container.appendChild(card);

      // Add to schema.org structured data
      schemaData.itemListElement.push({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://yourdomain.com/game.html?g=${game.game_id}`, // change domain if needed
        "name": game.game_name,
        "image": game.game_icon
      });
    });

    // Optional: inject schema (uncomment if you have <script type="application/ld+json" id="game-schema"> in your layout)
    /*
    let schemaScript = document.getElementById("game-schema");
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schema.type = "application/ld+json";
      schema.id = "game-schema";
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaData, null, 2);
    */
  })
  .catch(err => {
    console.error(err);
    console.error(err);
    document.getElementById("main_div").innerHTML = 
      `<p style="color:red;text-align:center;">Failed to load games. Please try again later.</p>`;
  });
