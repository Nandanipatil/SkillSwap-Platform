const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
});

async function loadUserProfile() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.name) {
        window.location.href = 'login.html';
        return;
    }

    // Set User Details
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email || 'Student/Developer';
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();

    // Fetch Skills Created By Current User
    try {
        const res = await fetch(`${API_URL}/skills`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const skills = await res.json();

        const mySkillsGrid = document.getElementById('mySkillsGrid');
        mySkillsGrid.innerHTML = '';

        const mySkills = skills.filter(s => s.user && (s.user._id === user.id || s.user === user.id));

        if (mySkills.length === 0) {
            mySkillsGrid.innerHTML = '<p style="color: #64748b; grid-column: 1/-1;">You have not posted any skills yet.</p>';
            return;
        }

        mySkills.forEach(skill => {
            const card = document.createElement('div');
            card.className = 'skill-card';
            card.innerHTML = `
                <div class="card-content">
                    <span class="category-tag"><i class="fa-solid fa-tag"></i> ${skill.category}</span>
                    <h3 class="card-title">${skill.title}</h3>
                    <p class="card-description">${skill.description}</p>
                </div>
            `;
            mySkillsGrid.appendChild(card);
        });

    } catch (err) {
        console.error('Error loading profile skills:', err);
    }
}