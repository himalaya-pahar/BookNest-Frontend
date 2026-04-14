document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signin-form');
    const errorMsg = document.getElementById('signin-error');
    
    if(signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;

            let users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if(user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'marketplace.html';
            } else {
                errorMsg.style.display = 'block';
            }
        });
    }
});
