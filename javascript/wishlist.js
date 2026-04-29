document.addEventListener("DOMContentLoaded", () => {
    // 1. Load books instantly
    loadWishlistBooks();

    // 2. Form submission handler
    const addForm = document.getElementById('addWishlistForm');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const title = document.getElementById('bookTitle').value;
            const author = document.getElementById('bookAuthor').value;
            const condition = document.getElementById('bookCondition').value;
            
            addToWishlist(title, author, condition);
        });
    }
});

function loadWishlistBooks() {
    const grid = document.getElementById("wishlistGrid");
    const token = localStorage.getItem("token"); // Getting the exact token from auth
    
    console.log("Current Token:", token); // For debugging in console

    if (!token) {
        grid.innerHTML = "<p style='color: red; text-align: center; width: 100%;'>Please log in first to see your wishlist!</p>";
        return;
    }

    fetch("https://booknest-backend-fastapi-1.onrender.com/wishlist/", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) throw new Error("Unauthorized: Invalid or expired token!");
            throw new Error("Failed to fetch wishlist data from backend!");
        }
        return response.json();
    })
    .then(books => {
        grid.innerHTML = ""; // Clear loading text

        if (books.length === 0) {
            grid.innerHTML = "<p style='color: #666; text-align: center; width: 100%;'>Your wishlist is empty. Add some books!</p>";
            return;
        }

        books.forEach(book => {
            const bookCard = `
                <div class="book-card" data-id="${book.id}">
                  <div class="card-img-container">
                    <span class="condition-badge">${book.condition}</span>
                    <img src="https://placehold.co/200x300/444/FFF?text=Book" alt="Book Cover" class="book-cover" />
                  </div>
                  <div class="card-body">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <button class="btn btn-sm btn-outline remove-btn" style="width: 100%; margin-top: 15px; border-color: #999; color: #666;">
                      Remove
                    </button>
                  </div>
                </div>
            `;
            grid.insertAdjacentHTML("beforeend", bookCard);
        });
    })
    .catch(error => {
        console.error("Error loading books:", error);
        grid.innerHTML = `<p style='color: red; text-align: center; width: 100%;'>${error.message}</p>`;
    });
}

function addToWishlist(title, author, condition) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to add books.");
        return;
    }

    const newWishlistItem = {
        title: title,
        author: author,
        condition: condition
    };

    fetch("https://booknest-backend-fastapi-1.onrender.com/wishlist/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(newWishlistItem) 
    })
    .then(response => {
        if (!response.ok) throw new Error("Backend rejected the request.");
        return response.json();
    })
    .then(data => {
        console.log("Book successfully added:", data);
        document.getElementById('addWishlistForm').reset();
        loadWishlistBooks(); // Reload the grid
    })
    .catch(error => {
        console.error("Error adding book:", error);
        alert("Failed to add book. Is the backend running?");
    });
}