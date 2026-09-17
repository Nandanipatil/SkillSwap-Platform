const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadTrades();
});

async function loadTrades() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/trades`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            renderTrades(data.received || [], 'receivedTrades', true);
            renderTrades(data.sent || [], 'sentTrades', false);
        }
    } catch (err) {
        console.error('Error loading trades:', err);
    }
}

function renderTrades(trades, containerId, isReceived) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (trades.length === 0) {
        container.innerHTML = `<p style="color: #64748b;">No ${isReceived ? 'received' : 'sent'} trade requests found.</p>`;
        return;
    }

    trades.forEach(trade => {
        const card = document.createElement('div');
        card.className = 'trade-card';

        const statusClass = `status-${trade.status.toLowerCase()}`;
        const partnerName = isReceived ? (trade.sender?.name || 'User') : (trade.receiver?.name || 'User');
        const skillTitle = trade.skill?.title || 'Requested Skill';

        let actionButtons = '';
        if (isReceived && trade.status === 'Pending') {
            actionButtons = `
                <div class="action-btns">
                    <button onclick="updateTradeStatus('${trade._id}', 'Accepted')" class="btn-accept"><i class="fa-solid fa-check"></i> Accept</button>
                    <button onclick="updateTradeStatus('${trade._id}', 'Rejected')" class="btn-reject"><i class="fa-solid fa-xmark"></i> Reject</button>
                </div>`;
        }

        card.innerHTML = `
            <span class="status-badge ${statusClass}">${trade.status}</span>
            <h3 class="trade-title">${skillTitle}</h3>
            <p class="trade-detail"><i class="fa-solid fa-user"></i> ${isReceived ? 'From' : 'To'}: <strong>${partnerName}</strong></p>
            <div class="trade-message">"${trade.message || 'No custom message.'}"</div>
            ${actionButtons}
        `;

        container.appendChild(card);
    });
}

async function updateTradeStatus(tradeId, status) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/trades/${tradeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (res.ok) {
            alert(`Trade ${status.toLowerCase()} successfully!`);
            loadTrades();
        }
    } catch (err) {
        console.error(err);
    }
}