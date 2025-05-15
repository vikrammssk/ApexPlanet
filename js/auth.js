document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const registerMessageEl = document.getElementById('register-message');
    const loginMessageEl = document.getElementById('login-message');

    // --- REGISTRATION ---
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value; // In a real app, hash this!

            // Basic validation (can be more extensive)
            if (!username || !email || !password) {
                showMessage(registerMessageEl, 'All fields are required.', 'error-message');
                return;
            }

            let users = JSON.parse(localStorage.getItem('learnsphere_users')) || [];
            
            // Check if user already exists (by username or email)
            if (users.find(user => user.username === username || user.email === email)) {
                showMessage(registerMessageEl, 'Username or email already exists.', 'error-message');
                return;
            }

            users.push({ username, email, password }); // Store password plaintext for demo
            localStorage.setItem('learnsphere_users', JSON.stringify(users));
            
            showMessage(registerMessageEl, 'Registration successful! You can now login.', 'success-message');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }

    // --- LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const usernameOrEmail = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            if (!usernameOrEmail || !password) {
                showMessage(loginMessageEl, 'All fields are required.', 'error-message');
                return;
            }

            let users = JSON.parse(localStorage.getItem('learnsphere_users')) || [];
            const user = users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);

            if (user) {
                localStorage.setItem('learnsphere_currentUser', JSON.stringify({ username: user.username, email: user.email }));
                showMessage(loginMessageEl, 'Login successful! Redirecting...', 'success-message');
                setTimeout(() => {
                    window.location.href = 'dashboard.html'; // Or index.html
                }, 1000);
            } else {
                showMessage(loginMessageEl, 'Invalid username/email or password.', 'error-message');
            }
        });
    }
});

// --- UTILITY FUNCTIONS (can be in main.js or here) ---
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('learnsphere_currentUser'));
}

function isLoggedIn() {
    return !!getCurrentUser();
}

function logoutUser() {
    localStorage.removeItem('learnsphere_currentUser');
    // Potentially clear enrolled courses for the user if stored per-user and not globally
    // For this example, enrolled courses might be tied to the "currentUser" key or a separate one
    alert('You have been logged out.');
    window.location.href = 'index.html';
}

function showMessage(element, message, typeClass) {
    if (!element) return;
    element.textContent = message;
    element.className = typeClass; // 'success-message' or 'error-message'
    setTimeout(() => {
        element.textContent = '';
        element.className = '';
    }, 3000);
}

// Expose functions to be callable from main.js or HTML event handlers
window.auth = {
    getCurrentUser,
    isLoggedIn,
    logoutUser
};
