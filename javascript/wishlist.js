// Javascript for wishlist
// Authentication Check & Header Logic
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const protectedPages = ['mynest', 'message', 'history', 'wishlist'];

    // Simple path check
    const isProtected = protectedPages.some(page => window.location.pathname.includes(page + '.html'));

    // If not logged in and on protected page, kick to sign in
    if (!currentUser && isProtected) {
        window.location.href = 'signin.html';
        return;
    }

    // If logged in, update header
    if (currentUser) {
        const userActions = document.querySelector('.user-actions');
        if (userActions) {
            const initials = (currentUser.fname[0] + currentUser.lname[0]).toUpperCase();
            userActions.innerHTML = `
                <div class="header-avatar" style="width: 35px; height: 35px; background-color: var(--primary-green); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${initials}</div>
                <a href="#" class="btn btn-sm btn-outline" id="logout-btn">Log Out</a>
            `;

            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');

                // If on protected page, kick out now, otherwise just refresh page so header updates back
                if (isProtected) {
                    window.location.href = 'get-started.html';
                } else {
                    window.location.reload();
                }
            });
        }
    }
});
