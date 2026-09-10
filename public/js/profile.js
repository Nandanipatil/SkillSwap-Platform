const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();
    loadUserProfile();
    loadUserSkills();
});

function checkUserAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login first!");
        window.location.href = 'login.html';
    }
}

function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    const avatarEl = document.getElementById('userAvatar');

    if (user.name) {
        nameEl.innerText = user.name;
        avatarEl.innerText = user.name.charAt(0).toUpperCase();
    } else {
        nameEl.innerText = 'User';
        avatarEl.innerText = 'U';
    }

    if (user.email) {
        emailEl.innerText = user.email;
    } else {
        emailEl.innerText = 'No email available';
    }
}

function getSkillImage(title, category, imageUrl) {
    if (imageUrl && imageUrl.trim() !== '') return imageUrl;

    const lowerTitle = (title || '').toLowerCase();

    if (lowerTitle.includes('html') || lowerTitle.includes('css') || lowerTitle.includes('web')) {
        return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500';
    }
    if (lowerTitle.includes('python')) {
        return 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=500';
    }
    if (lowerTitle.includes('sql') || lowerTitle.includes('database')) {
        return 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500';
    }
    if (lowerTitle.includes('c ') || lowerTitle.includes('c++') || lowerTitle.includes('java') || lowerTitle.includes('c language')) {
        return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500';
    }

    const categoryImages = {
        'Programming': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
        'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
        'Language': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500',
        'Music': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
        'Other': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500'
    };

    return categoryImages[category] || categoryImages['Other'];
}

async function loadUserSkills() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('mySkillsContainer');

    try {
        const response = await fetch(`${API_URL}/skills`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const skills = await response.json();

        if (!response.ok || !Array.isArray(skills)) {
            container.innerHTML = '<p>Failed to load skills.</p>';
            return;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = user._id || user.id;

        const mySkills = skills.filter(s => (s.user?._id || s.user) === currentUserId);

        container.innerHTML = '';

        if (mySkills.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; background: #ffffff; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 40px; text-align: center;">
                    <i class="fa-solid fa-folder-plus" style="font-size: 2.5rem; color: #94a3b8; margin-bottom: 10px;"></i>
                    <h3 style="color: #334155; margin-bottom: 5px;">No Skills Listed Yet</h3>
                    <p style="color: #64748b; font-size: 0.9rem;">Start sharing your knowledge by adding your first skill!</p>
                </div>`;
            return;
        }

        mySkills.forEach(skill => {
            const card = document.createElement('div');
            card.className = 'skill-card';

            const cardImg = getSkillImage(skill.title, skill.category, skill.imageUrl);

            card.innerHTML = `
                <div>
                    <img src="${cardImg}" alt="${skill.title}" style="width: 100%; height: 160px; object-fit: cover; border-bottom: 1px solid #e2e8f0;">
                    <div style="padding: 16px;">
                        <h3 style="margin: 0 0 6px 0; color: #0f172a; font-size: 1.1rem;">${skill.title}</h3>
                        <p style="margin: 0 0 8px 0; color: #2563eb; font-size: 0.85rem; font-weight: 600;">Category: ${skill.category}</p>
                        <p style="margin: 0; color: #475569; font-size: 0.9rem;">${skill.description}</p>
                    </div>
                </div>
                <div style="padding: 16px; padding-top: 0; display: flex; gap: 10px;">
                    <button class="btn-edit" onclick="editSkill('${skill._id}')" style="flex: 1;"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="btn-delete" onclick="deleteSkill('${skill._id}')" style="flex: 1;"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading user skills:", err);
        container.innerHTML = '<p>Failed to connect to server.</p>';
    }
}

async function deleteSkill(skillId) {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/skills/${skillId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadUserSkills();
        } else {
            const data = await response.json();
            alert(`Error: ${data.message || 'Failed to delete skill'}`);
        }
    } catch (err) {
        console.error("Error deleting skill:", err);
    }
}

function editSkill(skillId) {
    alert("Edit functionality can be connected to an edit form modal or page.");
}

function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}