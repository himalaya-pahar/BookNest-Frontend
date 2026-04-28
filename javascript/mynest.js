document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  // UI Elements
  const profileName = document.querySelector(".profile-name");
  const profileEmail = document.getElementById("profile-email");
  const profilePhone = document.getElementById("profile-phone");
  const profileAddress = document.getElementById("profile-address");
  const profileAvatar = document.getElementById("avatar-initials");

  const statPosted = document.getElementById("stat-posted");
  const statSwaps = document.getElementById("stat-swaps");
  const statPending = document.getElementById("stat-pending");

  const bookGrid = document.querySelector(".book-grid");

  // 1. Load User Profile Data
  async function loadProfile() {
    try {
      const response = await fetch("http://127.0.0.1:8000/user/", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const user = await response.json();

        // Inject Text
        profileName.textContent = user.name;
        profileEmail.textContent = user.email;

        // If phone/address is null, show a placeholder
        profilePhone.textContent = user.phone_no
          ? user.phone_no
          : "Not added yet";
        profileAddress.textContent = user.address
          ? user.address
          : "Not added yet";

        // Avatar
        profileAvatar.textContent = user.name.substring(0, 2).toUpperCase();
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }
  // 2. Load Stats (Books Posted, Pending Requests)
  async function loadStats(myBooksCount) {
    // Update Posted Stat
    statPosted.textContent = myBooksCount;

    try {
      // Fetch Pending Requests
      const pendingRes = await fetch("http://127.0.0.1:8000/booklog/request", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (pendingRes.ok) {
        const pendingRequests = await pendingRes.json();
        statPending.textContent = pendingRequests.length;
      } else {
        statPending.textContent = "0"; // 404 means 0 requests
      }

      // Note: Successful swaps route doesn't exist in backend yet, keeping it at 0
      statSwaps.textContent = "0";
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }

  // 3. Load Bookshelf
  async function loadBookshelf() {
    bookGrid.innerHTML =
      '<p style="text-align:center; width:100%;">Loading your bookshelf...</p>';

    try {
      const booksResponse = await fetch("http://127.0.0.1:8000/book/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const logsResponse = await fetch("http://127.0.0.1:8000/booklog/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (booksResponse.status === 404) {
        bookGrid.innerHTML =
          '<p style="text-align: center; width: 100%;">Your bookshelf is empty.</p>';
        loadStats(0); // 0 books posted
        return;
      }

      const myBooks = await booksResponse.json();
      const activeLogs = logsResponse.ok ? await logsResponse.json() : [];

      // Create a list of IDs that are already in the marketplace
      const activeIds = activeLogs.map((log) => log.book_id || log.id);

      // 1. Filter your books to only count the ones that are in the activeIds list
      const marketplaceBooks = myBooks.filter((book) =>
        activeIds.includes(book.id),
      );

      // 2. Update the stats with ONLY the marketplace count!
      loadStats(marketplaceBooks.length);

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

  function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`; // type can be "success" or "error"
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Remove it from the HTML after the animation finishes (3 seconds total)
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  // --- FUNCTION: Move to Marketplace ---
  window.listInMarketplace = async (bookId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/booklog/${bookId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast("Book is now live in the Marketplace!", "success"); // <-- Replaced alert!
        loadBookshelf();
      } else {
        showToast("Failed to list book.", "error");
      }
    } catch (error) {
      showToast("Network error occurred.", "error");
    }
  };

  // --- FUNCTION: Delete Book Logic ---
  const confirmModal = document.getElementById("confirm-modal");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
  let bookToDeleteId = null; // Store the ID temporarily

  // Triggered when user clicks "Delete Book" on the card
  window.deleteBook = (bookId) => {
    bookToDeleteId = bookId;
    confirmModal.style.display = "flex"; // Show custom modal
  };

  // If they click Cancel
  cancelDeleteBtn.addEventListener("click", () => {
    confirmModal.style.display = "none";
    bookToDeleteId = null;
  });

  // If they click Yes, Delete
  confirmDeleteBtn.addEventListener("click", async () => {
    if (!bookToDeleteId) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/book/${bookToDeleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        confirmModal.style.display = "none";
        showToast("Book deleted successfully", "success"); // <-- Beautiful popup
        loadBookshelf(); // Refresh UI
      } else {
        showToast("Failed to delete book", "error");
      }
    } catch (error) {
      showToast("Network error", "error");
    }
  });

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

  // --- EDIT PROFILE MODAL LOGIC ---
  const editModal = document.getElementById("edit-profile-modal");
  const editBtn = document.querySelector(".profile-info .btn-outline"); // The "Edit Profile" button
  const closeEditBtn = document.getElementById("close-edit-modal");
  const editProfileForm = document.getElementById("edit-profile-form");

  // 1. Open Modal & Pre-fill current data
  editBtn.addEventListener("click", () => {
    document.getElementById("edit-name").value = profileName.textContent;

    // If it says "Not added yet", leave the input blank. Otherwise, put their current phone/address in.
    document.getElementById("edit-phone").value =
      profilePhone.textContent === "Not added yet"
        ? ""
        : profilePhone.textContent;
    document.getElementById("edit-address").value =
      profileAddress.textContent === "Not added yet"
        ? ""
        : profileAddress.textContent;

    editModal.style.display = "flex";
  });

  // 2. Close Modal
  closeEditBtn.addEventListener(
    "click",
    () => (editModal.style.display = "none"),
  );

  // 3. Submit the updated data to the Backend
  editProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updateData = {
      name: document.getElementById("edit-name").value,
      phone_no: document.getElementById("edit-phone").value,
      address: document.getElementById("edit-address").value,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/user/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        editModal.style.display = "none";
        loadProfile(); // Instantly refresh the UI with new data!
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  });
});
