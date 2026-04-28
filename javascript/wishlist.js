document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Fetch and display books as soon as the page loads
    loadWishlistBooks();

    // 2. Form submit event for adding a new book
    const addForm = document.getElementById('addWishlistForm');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevents page reload
            
            const title = document.getElementById('bookTitle').value;
            const author = document.getElementById('bookAuthor').value;
            const condition = document.getElementById('bookCondition').value;
            
            // Calling the addToWishlist function
            addToWishlist(title, author, condition);
        });
    }
});

// Function to fetch books from the database and show them in the grid
function loadWishlistBooks() {
    const grid = document.getElementById("wishlistGrid");
    
    // Check if the grid exists in the HTML to prevent null errors
    if (!grid) {
        console.error("Error: Could not find 'wishlistGrid' in HTML.");
        return;
    }

    // Fetching data from the GET endpoint
    fetch("http://127.0.0.1:8000/wishlist")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch wishlist data!");
            }
            return response.json();
        })
        .then(books => {
            // Clearing the "Loading..." text from the grid
            grid.innerHTML = "";

            // If the database is empty, show a message
            if (books.length === 0) {
                grid.innerHTML = "<p style='color: #666; text-align: center; width: 100%;'>Your wishlist is empty. Add some books!</p>";
                return;
            }

            // Looping through each book and creating an HTML card
            books.forEach(book => {
                const bookCard = `
                    <div class="book-card" data-id="${book.id}">
                      <div class="card-img-container">
                        <span class="condition-badge">${book.condition}</span>
                        <img
                          src="https://placehold.co/200x300/444/FFF?text=Book"
                          alt="Book Cover"
                          class="book-cover"
                        />
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
                
                // Adding the card to the grid
                grid.insertAdjacentHTML("beforeend", bookCard);
            });
        })
        .catch(error => {
            console.error("Error loading books:", error);
            grid.innerHTML = "<p style='color: red; text-align: center; width: 100%;'>Failed to load wishlist from the server.</p>";
        });
}

// Function to add a new book to the database
function addToWishlist(title, author, condition) {
    
    const newWishlistItem = {
        title: title,
        author: author,
        condition: condition,
        user_id: 1 // Dummy User ID 
    };

    fetch("http://127.0.0.1:8000/wishlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(newWishlistItem) 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok!");
        }
        return response.json();
    })
    .then(data => {
        console.log("Success! Book added to the wishlist:", data);
        
        // Clearing the form inputs safely
        const form = document.getElementById('addWishlistForm');
        if(form) form.reset();

        // Refresh the grid instantly without reloading the page
        loadWishlistBooks();
    })
    .catch(error => {
        console.error("Caught an error:", error);
        alert("Caught an error! Is the backend running?");
    });
}