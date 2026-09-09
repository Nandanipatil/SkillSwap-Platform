const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Login Form Submit Event
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Token aur User Details Save Karein
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user || { name: data.name || 'User' }));
                    alert("Login successful!");
                    window.location.href = 'index.html';
                } else {
                    alert(`Error: ${data.message || 'Login failed'}`);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert("Login request failed. Server is not responding.");
            }
        });
    }

    // Register Form Submit Event
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const bio = document.getElementById('regBio') ? document.getElementById('regBio').value : '';

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, bio })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Registration successful! Please login.");
                    registerForm.reset();
                } else {
                    alert(`Error: ${data.message || 'Registration failed'}`);
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert("Registration request failed.");
            }
        });
    }
});