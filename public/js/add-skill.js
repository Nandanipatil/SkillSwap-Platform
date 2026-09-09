const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();

    const addSkillForm = document.getElementById('addSkillForm');
    if (addSkillForm) {
        addSkillForm.addEventListener('submit', handleAddSkill);
    }
});

function checkUserAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navElement = document.getElementById('navMenu');

    if (!token) {
        alert("Please login first to add a skill!");
        window.location.href = 'login.html';
        return;
    }

    if (navElement && user && user.name) {
        navElement.innerHTML = `
            <span style="color: white; font-weight: 600; margin-right: 15px;">
                Welcome, ${user.name}
            </span>
           <a href="index.html">Home</a>
<a href="trades.html">My Trades</a>
<a href="add-skill.html">Add Skill</a>
<a href="profile.html">Profile</a>
<a href="#" onclick="logout(event)">Logout</a>
        `;
    }
}

async function handleAddSkill(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;

    try {
        const response = await fetch(`${API_URL}/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, category, description })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Skill posted successfully!");
            window.location.href = 'index.html';
        } else {
            alert(`Error: ${data.message || 'Failed to add skill'}`);
        }
    } catch (error) {
        console.error('Error adding skill:', error);
        alert("Failed to submit request. Check server status.");
    }
}

function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}