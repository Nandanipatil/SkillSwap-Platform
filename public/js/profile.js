const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();
    loadUserProfile();
    loadMySkills();
});

function checkUserAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navElement = document.getElementById('navMenu');

    if (!token) {
        alert("Please login first!");
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

async function loadUserProfile() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    document.getElementById('userName').innerText = user.name || 'N/A';
    document.getElementById('userEmail').innerText = user.email || 'N/A';

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            document.getElementById('userName').innerText = data.name;
            document.getElementById('userEmail').innerText = data.email;
        }
    } catch (err) {
        console.error("Error fetching user profile:", err);
    }
}

async function loadMySkills() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const container = document.getElementById('mySkillsContainer');

    try {
        const response = await fetch(`${API_URL}/skills`);
        const skills = await response.json();

        container.innerHTML = '';

        const currentUserId = user._id || user.id;
        const mySkills = skills.filter(skill => {
            const skillUserId = skill.user ? (skill.user._id || skill.user) : null;
            return skillUserId === currentUserId;
        });

        if (mySkills.length === 0) {
            container.innerHTML = '<p class="empty-state">You have not listed any skills yet.</p>';
            return;
        }

        mySkills.forEach(skill => {
            const card = document.createElement('div');
            card.className = 'skill-card';
            card.innerHTML = `
                <div>
                    <h3>${skill.title}</h3>
                    <p><strong>Category:</strong> ${skill.category}</p>
                    <p><strong>Description:</strong> ${skill.description}</p>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button onclick="editSkill('${skill._id}', '${skill.title}', '${skill.category}', \`${skill.description}\`)" class="btn-action btn-accept" style="background-color: #f59e0b; border: none; padding: 6px 12px; border-radius: 4px; color: white; cursor: pointer;">Edit</button>
                    <button onclick="deleteSkill('${skill._id}')" class="btn-action btn-reject" style="background-color: #ef4444; border: none; padding: 6px 12px; border-radius: 4px; color: white; cursor: pointer;">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading user skills:", err);
        container.innerHTML = '<p class="empty-state">Failed to load skills.</p>';
    }
}

async function editSkill(skillId, currentTitle, currentCategory, currentDescription) {
    const title = prompt("Update Skill Title:", currentTitle);
    if (!title) return;

    const category = prompt("Update Category (Programming, Design, Language, Music, Other):", currentCategory);
    if (!category) return;

    const description = prompt("Update Description:", currentDescription);
    if (!description) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/skills/${skillId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, category, description })
        });

        if (response.ok) {
            alert("Skill updated successfully!");
            loadMySkills();
        } else {
            const data = await response.json();
            alert(`Error: ${data.message || 'Failed to update skill'}`);
        }
    } catch (err) {
        console.error("Error updating skill:", err);
    }
}

async function deleteSkill(skillId) {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/skills/${skillId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("Skill deleted successfully!");
            loadMySkills();
        } else {
            const data = await response.json();
            alert(`Error: ${data.message || 'Failed to delete skill'}`);
        }
    } catch (err) {
        console.error("Error deleting skill:", err);
    }
}

function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}