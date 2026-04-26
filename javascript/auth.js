// javascript/auth.js
document.addEventListener("DOMContentLoaded", () => {
  // Look for the real JWT token from the backend
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("currentUserEmail");
  const protectedPages = [
    "marketplace",
    "mynest",
    "message",
    "history",
    "wishlist",
  ];

  const isProtected = protectedPages.some((page) =>
    window.location.pathname.includes(page + ".html"),
  );

  // If no token and on a protected page, kick to sign in
  if (!token && isProtected) {
    window.location.href = "signin.html";
    return;
  }

  // If logged in, update the header navigation
  if (token) {
    const userActions = document.querySelector(".user-actions");
    if (userActions) {
      // Get first two letters of email for the avatar (e.g., test@ -> TE)
      const initials = email ? email.substring(0, 2).toUpperCase() : "ME";
      userActions.innerHTML = `
                <div class="header-avatar" style="width: 35px; height: 35px; background-color: var(--primary-green); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${initials}</div>
                <a href="#" class="btn btn-sm btn-outline" id="logout-btn">Log Out</a>
            `;

      // Real Logout Logic
      document.getElementById("logout-btn").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("currentUserEmail");

        if (isProtected) {
          window.location.href = "index.html";
        } else {
          window.location.reload();
        }
      });
    }
  }
});
