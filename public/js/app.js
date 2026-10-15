document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. FLOATING CHATBOT WIDGET LOGIC
    // ==========================================
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotBox = document.getElementById('chatbotBox');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotMessages = document.getElementById('chatbotMessages');

    // Toggle Chatbot Window (Open/Close)
    if (chatbotToggle && chatbotBox) {
        chatbotToggle.addEventListener('click', () => {
            chatbotBox.classList.toggle('hidden');
        });
    }

    if (chatbotClose && chatbotBox) {
        chatbotClose.addEventListener('click', () => {
            chatbotBox.classList.add('hidden');
        });
    }

    // Function to Add Message to Chat UI
    function appendMessage(text, sender) {
        if (!chatbotMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-msg', sender);
        msgDiv.textContent = text;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Bot Auto-Response Rules
    function getBotResponse(input) {
        const query = input.toLowerCase();
        if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
            return "Hello! How can I help you find or swap skills today?";
        } else if (query.includes('skill') || query.includes('learn')) {
            return "You can search for skills in the search bar above or check out 'Explore Categories'!";
        } else if (query.includes('trade') || query.includes('swap')) {
            return "To start a trade, browse active listings and click 'Request Trade'. You can track your trades in 'My Trades'.";
        } else if (query.includes('account') || query.includes('profile')) {
            return "You can view and edit your profile details by clicking 'Profile' in the navigation bar.";
        } else {
            return "I'm SkillSwap Assistant! Try asking about how to learn skills, start trades, or edit your profile.";
        }
    }

    // Handle Sending Message
    function handleSendMessage() {
        if (!chatbotInput) return;
        const messageText = chatbotInput.value.trim();
        if (messageText === '') return;

        // Display User Message
        appendMessage(messageText, 'user');
        chatbotInput.value = '';

        // Simulate Bot Reply after brief delay
        setTimeout(() => {
            const botReply = getBotResponse(messageText);
            appendMessage(botReply, 'bot');
        }, 500);
    }

    if (chatbotSend) {
        chatbotSend.addEventListener('click', handleSendMessage);
    }

    if (chatbotInput) {
        chatbotInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }

    // ==========================================
    // 2. DYNAMIC SKILL LISTINGS FETCH
    // ==========================================
    const skillsGrid = document.getElementById('skillsGrid');
    if (skillsGrid) {
        fetch('/api/trades')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data.length > 0) {
                    skillsGrid.innerHTML = data.data.map(trade => `
                        <div class="category-card" style="text-align: left;">
                            <div class="cat-icon"><i class="fa-solid fa-arrows-rotate"></i></div>
                            <h3>${trade.skillOffered} &rarr; ${trade.skillRequested}</h3>
                            <p><strong>Offered by:</strong> ${trade.requester}</p>
                            <span class="hero-badge" style="margin-top: 10px; display: inline-block;">Status: ${trade.status}</span>
                        </div>
                    `).join('');
                }
            })
            .catch(err => console.error('Error fetching skills:', err));
    }
});