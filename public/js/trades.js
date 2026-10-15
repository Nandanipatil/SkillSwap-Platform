const API_URL = 'http://localhost:5000/api';
let socket;
let currentActiveSwapId = null;
let currentTab = 'incoming';
let allTrades = { incoming: [], outgoing: [] };

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Aap logged in nahi hain! Please login first.");
        window.location.href = 'login.html';
        return;
    }

    // Initialize Socket connection
    socket = io('http://localhost:5000');

    socket.on('receiveMessage', (message) => {
        if (message.swapId === currentActiveSwapId) {
            appendMessageBubble(message);
        }
    });

    loadTrades();
});

function switchTab(tabName, element) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    currentTab = tabName;
    renderTradesList();
}

async function loadTrades() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/trades`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            allTrades.incoming = data.incoming || [];
            allTrades.outgoing = data.outgoing || [];
            renderTradesList();
        } else {
            document.getElementById('tradesContainer').innerHTML = '<div class="loading-card">Failed to load trades.</div>';
        }
    } catch (error) {
        console.error("Error loading trades:", error);
        document.getElementById('tradesContainer').innerHTML = '<div class="loading-card">Server connection error.</div>';
    }
}

function renderTradesList() {
    const container = document.getElementById('tradesContainer');
    container.innerHTML = '';

    const list = allTrades[currentTab];

    if (!list || list.length === 0) {
        container.innerHTML = `<div class="loading-card">No ${currentTab} trade requests found.</div>`;
        return;
    }

    list.forEach(trade => {
        const card = document.createElement('div');
        card.className = 'trade-item-card';

        const otherUser = currentTab === 'incoming' ? (trade.sender?.name || 'User') : (trade.receiver?.name || 'User');
        const skillTitle = trade.wantedSkill?.title || trade.offeredSkill?.title || 'Skill Exchange';

        let actionButtons = '';
        if (currentTab === 'incoming' && trade.status === 'pending') {
            actionButtons = `
                <div class="trade-actions">
                    <button class="btn-accept" onclick="updateTradeStatus('${trade._id}', 'accepted')">Accept</button>
                    <button class="btn-reject" onclick="updateTradeStatus('${trade._id}', 'rejected')">Reject</button>
                </div>
            `;
        } else if (trade.status === 'accepted') {
            actionButtons = `
                <div class="trade-actions">
                    <button class="btn-chat-open" onclick="openChat('${trade._id}', '${otherUser}')"><i class="fa-solid fa-comments"></i> Open Chat</button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="trade-meta-row">
                <h4>${otherUser}</h4>
                <span class="skill-badge">${trade.status}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Skill: <strong>${skillTitle}</strong></p>
            ${actionButtons}
        `;
        container.appendChild(card);
    });
}

async function updateTradeStatus(tradeId, status) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/trades/${tradeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert(`Trade request ${status} successfully!`);
            loadTrades();
        } else {
            alert("Failed to update status.");
        }
    } catch (error) {
        console.error("Error updating trade:", error);
    }
}

async function openChat(swapId, otherUserName) {
    currentActiveSwapId = swapId;
    document.getElementById('activeChatTitle').innerText = `Chat with ${otherUserName}`;
    document.getElementById('chatSwapStatus').innerText = 'Status: Active Session';
    document.getElementById('chatForm').style.display = 'flex';

    socket.emit('joinRoom', { swapId });

    // Load past messages
    const token = localStorage.getItem('token');
    const msgBody = document.getElementById('chatMessages');
    msgBody.innerHTML = '<div class="loading-card"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading chat history...</div>';

    try {
        const response = await fetch(`${API_URL}/messages/${swapId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const messages = await response.json();

        msgBody.innerHTML = '';
        if (response.ok && Array.isArray(messages)) {
            if (messages.length === 0) {
                msgBody.innerHTML = '<div class="chat-placeholder-msg"><p>Start the conversation with your exchange partner!</p></div>';
            } else {
                messages.forEach(msg => appendMessageBubble(msg));
            }
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
        msgBody.innerHTML = '<div class="loading-card">Failed to load messages.</div>';
    }
}

function appendMessageBubble(message) {
    const msgBody = document.getElementById('chatMessages');
    const placeholder = msgBody.querySelector('.chat-placeholder-msg');
    if (placeholder) placeholder.remove();

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id || currentUser._id;
    const isOutgoing = message.sender === currentUserId || message.sender._id === currentUserId;

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`;
    bubble.innerText = message.text;
    msgBody.appendChild(bubble);
    msgBody.scrollTop = msgBody.scrollHeight;
}

function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chatMessageInput');
    const text = input.value.trim();
    if (!text || !currentActiveSwapId) return;

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const senderId = currentUser.id || currentUser._id;

    socket.emit('sendMessage', {
        swapId: currentActiveSwapId,
        senderId: senderId,
        text: text
    });

    input.value = '';
}