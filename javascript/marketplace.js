document.addEventListener("DOMContentLoaded", () => {
  const bookGrid = document.querySelector(".book-grid");
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-container .btn-primary");
  const filterTags = document.querySelectorAll(".filter-tag");
  // --- MODAL ELEMENTS ---
  const swapModal = document.getElementById("swap-modal");
  const closeModal = document.getElementById("close-modal");
  const wantedBookTitleEl = document.getElementById("wanted-book-title");
  const offeredBookSelect = document.getElementById("offered-book-select");
  const confirmSwapBtn = document.getElementById("confirm-swap-btn");
  const swapError = document.getElementById("swap-error");

  let currentGenre = "All"; // Default genre
  let wantedBookId = null;
  // 1. The main function to load books
  async function loadBooks(searchQuery = "", genreFilter = "All") {
    const token = localStorage.getItem("token");
    bookGrid.innerHTML =
      '<p style="text-align:center; width:100%;">Loading...</p>';

    try {
      // Build the URL with the Query Parameters!
      let url = new URL("http://127.0.0.1:8000/book/all");
      if (searchQuery) url.searchParams.append("q", searchQuery);
      if (genreFilter !== "All") url.searchParams.append("genre", genreFilter);

      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        bookGrid.innerHTML =
          '<p style="text-align: center; color: red;">Your session expired. Please log in.</p>';
        return;
      }
      if (response.status === 404) {
        bookGrid.innerHTML =
          '<p style="text-align: center; width: 100%; color: var(--text-light);">No books match your search.</p>';
        return;
      }

      const books = await response.json();
      bookGrid.innerHTML = ""; // Clear loading text

      // Draw the cards
      books.forEach((book) => {
        const initial = book.owner_name
          ? book.owner_name.charAt(0).toUpperCase()
          : "?";
        const card = document.createElement("div");
        card.className = "book-card";

        card.innerHTML = `
                    <div class="card-img-container">
                        <span class="condition-badge">${book.genre}</span>
                        <img src="https://placehold.co/200x300/2c5e50/FFF?text=${encodeURIComponent(book.name)}" alt="Book Cover" class="book-cover">
                    </div>
                    <div class="card-body">
                        <h3 class="book-title">${book.name}</h3>
                        <p class="book-author">${book.author}</p>
                        <div class="owner-info">
                            <span class="avatar" style="display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${initial}</span> 
                            by ${book.owner_name}
                        </div>
                        <button class="swap-btn" onclick="openSwapModal(${book.id}, '${book.name.replace(/'/g, "\\'")}')">Request Swap</button>
                    </div>
                `;
        bookGrid.appendChild(card);
      });
    } catch (error) {
      console.error("Error fetching books:", error);
      bookGrid.innerHTML =
        '<p style="text-align: center; color: red;">Failed to load marketplace.</p>';
    }
  }

  // --- 2. Open Modal & Load User's Books ---
  // We attach this to the window object so the inline onclick="" in the HTML can find it
  window.openSwapModal = async function (bookId, bookTitle) {
    const token = localStorage.getItem("token");
    wantedBookId = bookId;
    wantedBookTitleEl.textContent = bookTitle;
    swapError.style.display = "none";

    // Show modal
    swapModal.style.display = "flex";

    // Fetch the CURRENT USER'S books to populate the dropdown
    try {
      const response = await fetch("http://127.0.0.1:8000/book/", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const myBooks = await response.json();
        offeredBookSelect.innerHTML =
          '<option value="">-- Choose a book to offer --</option>';

        myBooks.forEach((book) => {
          const option = document.createElement("option");
          option.value = book.id;
          option.textContent = `${book.name} (by ${book.author})`;
          offeredBookSelect.appendChild(option);
        });

        if (myBooks.length === 0) {
          offeredBookSelect.innerHTML =
            '<option value="">You have no books to offer!</option>';
          confirmSwapBtn.disabled = true;
        } else {
          confirmSwapBtn.disabled = false;
        }
      }
    } catch (error) {
      offeredBookSelect.innerHTML =
        '<option value="">Error loading your books</option>';
    }
  };

  // --- 3. Confirm Swap Button ---
  confirmSwapBtn.addEventListener("click", async () => {
    const offeredBookId = offeredBookSelect.value;
    const token = localStorage.getItem("token");

    if (!offeredBookId) {
      swapError.textContent = "Please select a book to offer.";
      swapError.style.display = "block";
      return;
    }

    try {
      // Your backend uses query parameters for POST /booklog/request
      const response = await fetch(
        `http://127.0.0.1:8000/booklog/request?offered_book=${offeredBookId}&wanted_book=${wantedBookId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        alert("Swap request sent successfully!");
        swapModal.style.display = "none";
      } else {
        const errorData = await response.json();
        swapError.textContent = errorData.detail || "Failed to send request.";
        swapError.style.display = "block";
      }
    } catch (error) {
      swapError.textContent = "Network error occurred.";
      swapError.style.display = "block";
    }
  });

  // Close Modal when clicking X or outside the box
  closeModal.addEventListener(
    "click",
    () => (swapModal.style.display = "none"),
  );
  window.addEventListener("click", (e) => {
    if (e.target === swapModal) swapModal.style.display = "none";
  });

  // 2. Listen for Search Button Clicks
  searchBtn.addEventListener("click", () => {
    const query = searchInput.value;
    loadBooks(query, currentGenre);
  });

  // Optional: Make "Enter" key work on the search bar
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loadBooks(searchInput.value, currentGenre);
    }
  });

  // 3. Listen for Genre Filter Tag Clicks
  filterTags.forEach((tag) => {
    tag.addEventListener("click", (e) => {
      // Remove 'active' class from all tags
      filterTags.forEach((t) => t.classList.remove("active"));
      // Add 'active' class to the one clicked
      e.target.classList.add("active");

      // Get the text inside the tag (e.g., "Sci-Fi")
      currentGenre = e.target.innerText;

      // Reload the books with the new filter!
      loadBooks(searchInput.value, currentGenre);
    });
  });

  // 4. Load all books when the page first opens
  loadBooks();
});
