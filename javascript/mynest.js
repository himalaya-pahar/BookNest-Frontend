document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  // UI Elements
  const profileName = document.querySelector(".profile-name");
  const profileEmail = document.querySelectorAll(".profile-detail")[1];
  const profileAvatar = document.querySelector(".profile-avatar span");
  const bookGrid = document.querySelector(".book-grid");
  const statsPosted = document.querySelector(".stat-number"); // First stat box

  // 1. Load User Profile Data
  async function loadProfile() {
    try {
      const response = await fetch("http://127.0.0.1:8000/user/", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const user = await response.json();
        profileName.textContent = user.name;
        profileEmail.innerHTML = `<strong>Email:</strong> ${user.email}`;
        const initials = user.name.substring(0, 2).toUpperCase();
        profileAvatar.textContent = initials;
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }

  // 2. Load User's Bookshelf and Check Marketplace Status
  async function loadBookshelf() {
    bookGrid.innerHTML =
      '<p style="text-align:center; width:100%;">Loading your bookshelf...</p>';

    try {
      const booksResponse = await fetch("http://127.0.0.1:8000/book/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // We check the booklogs to see which of our books are "Public"
      const logsResponse = await fetch("http://127.0.0.1:8000/booklog/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (booksResponse.status === 404) {
        bookGrid.innerHTML =
          '<p style="text-align: center; width: 100%;">Your bookshelf is empty.</p>';
        statsPosted.textContent = "0";
        return;
      }

      const myBooks = await booksResponse.json();
      const activeLogs = logsResponse.ok ? await logsResponse.json() : [];

      // Create a list of IDs that are already in the marketplace
      const activeIds = activeLogs.map((log) => log.book_id);

      statsPosted.textContent = myBooks.length;
      bookGrid.innerHTML = "";

      myBooks.forEach((book) => {
        const isActive = activeIds.includes(book.id);
        const card = document.createElement("div");
        card.className = "book-card";

        card.innerHTML = `
                    <div class="card-img-container">
                        <span class="condition-badge">${book.genre}</span>
                        <img src="https://placehold.co/200x300/2c5e50/FFF?text=${encodeURIComponent(book.name)}" alt="Cover" class="book-cover">
                    </div>
                    <div class="card-body">
                        <h3 class="book-title">${book.name}</h3>
                        <p class="book-author">${book.author}</p>
                        <div class="owner-info">Status: 
                            <span style="color:${isActive ? "#27ae60" : "#7A6050"}; font-weight:bold;">
                                ${isActive ? "Active in Marketplace" : "Private (In Nest)"}
                            </span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 15px;">
                            ${
                              !isActive
                                ? `<button class="btn btn-sm btn-primary" onclick="listInMarketplace(${book.id})">List in Marketplace</button>`
                                : `<button class="btn btn-sm btn-outline" disabled>Listed</button>`
                            }
                            <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.id})">Delete Book</button>
                        </div>
                    </div>
                `;
        bookGrid.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading bookshelf:", error);
    }
  }

  // 3. Function to move a book to the marketplace
  window.listInMarketplace = async (bookId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/booklog/${bookId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        alert("Book is now live in the Marketplace!");
        loadBookshelf(); // Refresh the list
      }
    } catch (error) {
      alert("Failed to list book.");
    }
  };

  // 4. Function to delete a book (You need to add this to your backend later!)
  window.deleteBook = async (bookId) => {
    if (confirm("Are you sure you want to delete this book?")) {
      alert("Delete functionality needs a Backend Route first!");
      // Once your friend adds a DELETE route, you can call it here.
    }
  };

  // Initial calls
  loadProfile();
  loadBookshelf();
  const addModal = document.getElementById("add-book-modal");
  const postBtn = document.querySelector(".section-title .btn-primary");
  const closeAddBtn = document.getElementById("close-add-modal");
  const addBookForm = document.getElementById("add-book-form");

  // Open Modal
  postBtn.addEventListener("click", () => (addModal.style.display = "flex"));
  closeAddBtn.addEventListener(
    "click",
    () => (addModal.style.display = "none"),
  );

  // Handle Form Submit
  addBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bookData = {
      name: document.getElementById("new-book-title").value,
      author: document.getElementById("new-book-author").value,
      genre: document.getElementById("new-book-genre").value,
    };

    const response = await fetch("http://127.0.0.1:8000/book/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookData),
    });

    if (response.ok) {
      addModal.style.display = "none";
      addBookForm.reset();
      loadBookshelf(); // Refresh UI
    }
  });
});
