const API_URL = 'http://localhost:5000/api';

// Local cache for skills
let allSkills = [];

document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();
    
    // URL se category parameter handle karna
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');

    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (categoryParam && categoryFilter) {
        categoryFilter.value = categoryParam;
    }

    if (searchInput) searchInput.addEventListener('input', filterAndRenderSkills);
    if (categoryFilter) categoryFilter.addEventListener('change', filterAndRenderSkills);

    loadSkills();
});

// Check Auth status
function checkUserAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navLinks = document.getElementById('navLinks');

    if (!navLinks) return;

    if (token && user && user.name) {
        navLinks.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="categories.html">Categories</a></li>
            <li><a href="trades.html">My Trades</a></li>
            <li><a href="add-skill.html">Add Skill</a></li>
            <li><a href="profile.html">Profile</a></li>
            <li><a href="#" onclick="logout(event)">Logout</a></li>
        `;
    } else {
        navLinks.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="categories.html">Categories</a></li>
            <li><a href="login.html">Login / Register</a></li>
        `;
    }
}

// Logout function
function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

// Load Skills from Backend
async function loadSkills() {
    const skillsContainer = document.getElementById('skillsContainer');
    if (!skillsContainer) return;

    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}/skills`, { headers });
        const skills = await response.json();

        if (!Array.isArray(skills)) {
            skillsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 3rem;">Failed to load skills list.</p>';
            return;
        }

        allSkills = skills;
        filterAndRenderSkills();
    } catch (error) {
        console.error('Error loading skills:', error);
        skillsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 3rem;">Failed to load skills. Please check backend connection.</p>';
    }
}

// Topic-Specific Tech & UI/UX Unsplash Image Resolver
function getSkillImage(title, category, imageUrl) {
    if (imageUrl && imageUrl.trim() !== '') return imageUrl;

    const lowerTitle = (title || '').toLowerCase();
    const lowerCategory = (category || '').toLowerCase();

    if (lowerTitle.includes('python')) {
        return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop';
    }

    if (lowerTitle.includes('c ') || lowerTitle.includes('c++') || lowerTitle.includes('java') || lowerTitle.includes('c language')) {
        return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop';
    }

    if (lowerTitle.includes('sql') || lowerTitle.includes('database') || lowerTitle.includes('mongo')) {
        return 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop';
    }

    if (lowerTitle.includes('html') || lowerTitle.includes('css') || lowerTitle.includes('web') || lowerTitle.includes('react') || lowerTitle.includes('node')) {
        return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop';
    }

    if (lowerTitle.includes('ui') || lowerTitle.includes('ux') || lowerTitle.includes('design') || lowerCategory.includes('design')) {
        return 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop';
    }

    const categoryImages = {
        'Programming': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop',
        'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop',
        'Language': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop',
        'Music': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop',
        'Other': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop'
    };

    return categoryImages[category] || categoryImages['Other'];
}

// Filter and Render Skills with Glowing AI Match Badge
function filterAndRenderSkills() {
    const skillsContainer = document.getElementById('skillsContainer');
    if (!skillsContainer) return;

    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const selectedCategory = document.getElementById('categoryFilter')?.value || 'All';

    const filteredSkills = allSkills.filter(skill => {
        const titleMatch = (skill.title || '').toLowerCase().includes(searchTerm) || 
                           (skill.description || '').toLowerCase().includes(searchTerm);
        const categoryMatch = selectedCategory === 'All' || skill.category === selectedCategory;
        return titleMatch && categoryMatch;
    });

    skillsContainer.innerHTML = '';

    if (filteredSkills.length === 0) {
        skillsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 4rem 1rem;">
                <i class="fa-regular fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <p style="font-size: 1.1rem;">No matching skills found. Try searching for another topic!</p>
            </div>`;
        return;
    }

    filteredSkills.forEach((skill, index) => {
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card';

        const ownerName = skill.user ? (skill.user.name || 'User') : 'Anonymous';
        const skillId = skill._id;
        const cardImage = getSkillImage(skill.title, skill.category, skill.imageUrl);

        const matchScores = [95, 88, 92, 85, 90];
        const displayScore = skill.matchScore || matchScores[index % matchScores.length];

        skillCard.innerHTML = `
            <div class="card-img-wrapper">
                <div class="ai-badge">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> ${displayScore}% Match
                </div>
                <img src="${cardImage}" alt="${skill.title || 'Skill'}">
            </div>
            <div class="card-content">
                <span class="category-tag"><i class="fa-solid fa-tag"></i> ${skill.category || 'General'}</span>
                <h3 class="card-title">${skill.title || 'Untitled Skill'}</h3>
                <p class="card-description">${skill.description || 'No description provided.'}</p>
                
                <div class="card-footer">
                    <span class="owner-info">Offered by <strong>${ownerName}</strong></span>
                    <button onclick="requestSwap('${skillId}')" class="btn-swap">
                        <i class="fa-solid fa-arrow-right-arrow-left"></i> Swap
                    </button>
                </div>
            </div>
        `;

        skillsContainer.appendChild(skillCard);
    });
}

// Request Swap Function with Expiry Handling
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
            body: JSON.stringify({ skillId, message })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Trade request sent successfully!");
        } else {
            if (data.message && (data.message.includes('Token') || response.status === 401)) {
                alert("Your session has expired. Please login again!");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            } else {
                alert(`Error: ${data.message || 'Failed to send request'}`);
            }
        }
    } catch (error) {
        console.error("Request Failed:", error);
        alert("Failed to send trade request. Check console for details.");
    }
}

/* --- Floating AI Chatbot Handlers --- */
function toggleChat() {
    const chatWin = document.getElementById('chat-window');
    if (chatWin) {
        chatWin.classList.toggle('hidden');
    }
}

function handleChatKey(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    if (!input || !messages) return;

    const text = input.value.trim();
    if (!text) return;

    // Render User Message
    const userDiv = document.createElement('div');
    userDiv.className = 'user-msg';
    userDiv.innerText = text;
    messages.appendChild(userDiv);
    input.value = '';

    messages.scrollTop = messages.scrollHeight;

    // AI Dynamic Smart Assistant Logic
    const botDiv = document.createElement('div');
    botDiv.className = 'bot-msg';

    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('python')) {
        botDiv.innerText = "Python seekhne ke liye Home page par Nandani Patil ka 'Python' card check karein aur Swap click karke request bhejein!";
    } else if (lowerText.includes('sql') || lowerText.includes('database')) {
        botDiv.innerText = "SQL database management skills available hain. Aap 'Categories' me 'Programming' section filter kar sakti hain.";
    } else if (lowerText.includes('swap') || lowerText.includes('trade')) {
        botDiv.innerText = "Skill Swap karne ke liye: 1) Home page par skill choose karein 2) 'Swap' button click karein 3) Note likhkar Send karein. Unke accept karte hi roadmap generate ho jayega!";
    } else if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey')) {
        botDiv.innerText = "Hello! Main SkillSwap AI Bot hu. Aaj aap kaunsi new skill learn ya teach karna chahte hain?";
    } else {
        botDiv.innerText = `SkillSwap AI: Maine aapka query samjha ("${text}"). Aap homepage search bar me keyword search karke related skills find kar sakti hain!`;
    }

    setTimeout(() => {
        messages.appendChild(botDiv);
        messages.scrollTop = messages.scrollHeight;
    }, 400);
}