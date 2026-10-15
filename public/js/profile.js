document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
});

async function loadUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Aap logged in nahi hain! Please login first.");
        window.location.href = 'login.html';
        return;
    }

    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
        try {
            const user = JSON.parse(userDataStr);
            document.getElementById('userName').innerText = user.name || user.userName || 'SkillSwap Member';
            document.getElementById('userEmail').innerText = user.email || 'Registered User';
        } catch (e) {
            console.error("Local user data parsing error:", e);
        }
    }

    // Load User's Skills
    fetchUserSkills(token);
}

async function fetchUserSkills(token) {
    const userSkillsGrid = document.getElementById('userSkillsGrid');
    
    try {
        const response = await fetch('http://localhost:5000/api/skills');
        const allSkills = await response.json();

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = currentUser.id || currentUser._id;

        if (response.ok && Array.isArray(allSkills)) {
            // Filter skills created by current user
            const mySkills = allSkills.filter(skill => {
                if (!skill.user) return false;
                const skillUserId = typeof skill.user === 'object' ? skill.user._id : skill.user;
                return skillUserId === currentUserId;
            });

            document.getElementById('totalSkillsCount').innerText = mySkills.length;
            renderMySkills(mySkills);
        } else {
            userSkillsGrid.innerHTML = '<div class="loading-card">Failed to fetch skills.</div>';
        }
    } catch (error) {
        console.error("Error fetching my skills:", error);
        userSkillsGrid.innerHTML = '<div class="loading-card">Error loading skills.</div>';
    }
}

function renderMySkills(skills) {
    const userSkillsGrid = document.getElementById('userSkillsGrid');
    userSkillsGrid.innerHTML = '';

    if (skills.length === 0) {
        userSkillsGrid.innerHTML = '<div class="loading-card">Aapne abhi tak koi skill add nahi ki hai. Add New par click karein!</div>';
        return;
    }

    skills.forEach(skill => {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.innerHTML = `
            <div>
                <span class="skill-badge">${skill.category || 'General'}</span>
                <h3>${skill.title}</h3>
                <p>${skill.description}</p>
            </div>
            <div class="skill-card-footer">
                <span style="font-size:0.8rem; color:var(--primary-cyan);">Active Offer</span>
            </div>
        `;
        userSkillsGrid.appendChild(card);
    });
}