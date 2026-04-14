document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    if(signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const fname = document.getElementById('signup-fname').value;
            const lname = document.getElementById('signup-lname').value;
            const password = document.getElementById('signup-password').value;

            let users = JSON.parse(localStorage.getItem('users') || '[]');
            users.push({email, fname, lname, password});
            localStorage.setItem('users', JSON.stringify(users));

            window.location.href = 'signin.html';
        });
    }
});
