const API_URL = 'http://localhost:5000/api';

// Local cache for skills to enable instant search & filtering
let allSkills = [];

document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();
    loadSkills();

    // Event listeners for real-time search & filter
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterAndRenderSkills);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAndRenderSkills);
    }
});

// Check auth status and render header nav
function checkUserAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navElement = document.querySelector('nav');

    if (!navElement) return;

    if (token && user && user.name) {
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
    } else {
        navElement.innerHTML = `
            <a href="index.html">Home</a>
            <a href="login.html">Login</a>
        `;
    }
}

// Logout
function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

// Fetch all skills from backend
async function loadSkills() {
    const skillsContainer = document.getElementById('skillsContainer');
    if (!skillsContainer) return;

    try {
        const response = await fetch(`${API_URL}/skills`);
        const skills = await response.json();

        if (!Array.isArray(skills)) {
            skillsContainer.innerHTML = '<p>Failed to load skills list.</p>';
            return;
        }

        allSkills = skills; // Store fetched skills locally
        filterAndRenderSkills(); // Render initial list
    } catch (error) {
        console.error('Error loading skills:', error);
        skillsContainer.innerHTML = '<p>Failed to load skills. Please check backend connection.</p>';
    }
}

// Filter skills by Title/Keyword and Category
function filterAndRenderSkills() {
    const skillsContainer = document.getElementById('skillsContainer');
    if (!skillsContainer) return;

    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const selectedCategory = document.getElementById('categoryFilter')?.value || 'All';

    // Apply Filter Criteria
    const filteredSkills = allSkills.filter(skill => {
        const titleMatch = (skill.title || '').toLowerCase().includes(searchTerm) || 
                           (skill.description || '').toLowerCase().includes(searchTerm);
        
        const categoryMatch = selectedCategory === 'All' || skill.category === selectedCategory;

        return titleMatch && categoryMatch;
    });

    skillsContainer.innerHTML = '';

    if (filteredSkills.length === 0) {
        skillsContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #64748b; font-size: 1.1rem; padding: 2rem;">No matching skills found.</p>';
        return;
    }

    // Render Filtered Skills
    filteredSkills.forEach(skill => {
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card';
        
        const ownerName = skill.user ? (skill.user.name || 'User') : 'Anonymous';
        const skillId = skill._id;

        skillCard.innerHTML = `
            <div>
                <h3>${skill.title || 'Untitled Skill'}</h3>
                <p><strong>Category:</strong> ${skill.category || 'General'}</p>
                <p><strong>Description:</strong> ${skill.description || 'No description provided.'}</p>
                <small>Offered by: ${ownerName}</small>
            </div>
            <button onclick="requestSwap('${skillId}')" class="btn-swap">Request Swap</button>
        `;

        skillsContainer.appendChild(skillCard);
    });
}

// Request Swap
async function requestSwap(skillId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Please login first to send a trade request!");
        window.location.href = 'login.html';
        return;
    }

    const message = prompt("Enter a message for the trade request:");
    if (message === null) return;

    try {
        const response = await fetch(`${API_URL}/trades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                skillId: skillId,
                message: message
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Trade request sent successfully!");
        } else {
            alert(`Error: ${data.message || 'Failed to send request'}`);
        }
    } catch (error) {
        console.error("Request Failed:", error);
        alert("Failed to send trade request. Check console for details.");
    }
}