const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();

    const form = document.getElementById('addSkillForm');
    if (form) {
        form.addEventListener('submit', handleAddSkill);
    }
});

function checkUserAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login first to post a skill!");
        window.location.href = 'login.html';
    }
}

async function handleAddSkill(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const imageUrl = document.getElementById('imageUrl').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!title || !category || !description) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, category, imageUrl, description })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Skill added successfully!");
            window.location.href = 'index.html';
        } else {
            alert(`Error: ${data.message || 'Failed to add skill'}`);
        }
    } catch (err) {
        console.error("Error adding skill:", err);
        alert("Failed to connect to the server.");
    }
}

function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}