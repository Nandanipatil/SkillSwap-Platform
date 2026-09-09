const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();
    loadSkills();
});

// User auth status check karke Navigation Header update karna
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

// Logout Function
function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

// Fetch and display all skills
async function loadSkills() {
    const skillsContainer = document.getElementById('skillsContainer');
    if (!skillsContainer) return;

    try {
        const response = await fetch(`${API_URL}/skills`);
        const skills = await response.json();

        skillsContainer.innerHTML = '';

        if (!Array.isArray(skills) || skills.length === 0) {
            skillsContainer.innerHTML = '<p>No skills available at the moment.</p>';
            return;
        }

        skills.forEach(skill => {
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
    } catch (error) {
        console.error('Error loading skills:', error);
        skillsContainer.innerHTML = '<p>Failed to load skills. Please check backend connection.</p>';
    }
}

// Function to handle Trade Swap Request
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