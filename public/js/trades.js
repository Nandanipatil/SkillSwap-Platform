const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();
    loadTrades();
});

function checkUserAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login first!");
        window.location.href = 'login.html';
    }
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => btn.classList.remove('active'));

    const receivedSection = document.getElementById('receivedSection');
    const sentSection = document.getElementById('sentSection');

    if (tabName === 'received') {
        receivedSection.style.display = 'block';
        sentSection.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        receivedSection.style.display = 'none';
        sentSection.style.display = 'block';
        tabs[1].classList.add('active');
    }
}

async function loadTrades() {
    const token = localStorage.getItem('token');
    const receivedContainer = document.getElementById('receivedRequests');
    const sentContainer = document.getElementById('sentRequests');

    try {
        const response = await fetch(`${API_URL}/trades`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const trades = await response.json();

        if (!response.ok) {
            receivedContainer.innerHTML = '<p>Error loading trades.</p>';
            sentContainer.innerHTML = '<p>Error loading trades.</p>';
            return;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = user._id || user.id;

        // Calculate Stats
        let pendingCount = 0;
        let acceptedCount = 0;
        let rejectedCount = 0;

        trades.forEach(t => {
            if (t.status === 'pending') pendingCount++;
            if (t.status === 'accepted') acceptedCount++;
            if (t.status === 'rejected') rejectedCount++;
        });

        document.getElementById('statTotal').innerText = trades.length;
        document.getElementById('statPending').innerText = pendingCount;
        document.getElementById('statAccepted').innerText = acceptedCount;
        document.getElementById('statRejected').innerText = rejectedCount;

        // Filter Received vs Sent
        const received = trades.filter(t => (t.recipient?._id || t.recipient) === currentUserId);
        const sent = trades.filter(t => (t.requester?._id || t.requester) === currentUserId);

        renderTradesList(receivedContainer, received, true);
        renderTradesList(sentContainer, sent, false);

    } catch (err) {
        console.error("Error fetching trades:", err);
        receivedContainer.innerHTML = '<p>Failed to connect to server.</p>';
        sentContainer.innerHTML = '<p>Failed to connect to server.</p>';
    }
}

function renderTradesList(container, trades, isReceived) {
    container.innerHTML = '';

    if (trades.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; background: #ffffff; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 40px; text-align: center;">
                <i class="fa-regular fa-folder-open" style="font-size: 2.5rem; color: #94a3b8; margin-bottom: 10px;"></i>
                <h3 style="color: #334155; margin-bottom: 5px;">No Trade Records Found</h3>
                <p style="color: #64748b; font-size: 0.9rem;">${isReceived ? 'You have not received any swap offers yet.' : 'You have not sent any swap requests yet.'}</p>
            </div>`;
        return;
    }

    trades.forEach(trade => {
        const card = document.createElement('div');
        card.style.cssText = `
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        `;

        const skillTitle = trade.skill ? trade.skill.title : 'Skill Unavailable';
        const otherPerson = isReceived 
            ? (trade.requester ? trade.requester.name : 'Unknown User')
            : (trade.recipient ? trade.recipient.name : 'Unknown User');

        let statusBg = '#fef3c7';
        let statusColor = '#d97706';
        if (trade.status === 'accepted') { statusBg = '#d1fae5'; statusColor = '#059669'; }
        if (trade.status === 'rejected') { statusBg = '#fee2e2'; statusColor = '#dc2626'; }

        card.innerHTML = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">${skillTitle}</h3>
                    <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
                        ${trade.status}
                    </span>
                </div>
                <p style="margin: 0 0 8px 0; color: #475569; font-size: 0.9rem;">
                    <strong><i class="fa-solid fa-user"></i> ${isReceived ? 'From' : 'To'}:</strong> ${otherPerson}
                </p>
                <div style="background: #f8fafc; border-left: 3px solid #3b82f6; padding: 10px 12px; border-radius: 4px; margin: 10px 0;">
                    <p style="margin: 0; color: #334155; font-size: 0.88rem; font-style: italic;">
                        "${trade.message || 'No message attached.'}"
                    </p>
                </div>
            </div>

            ${isReceived && trade.status === 'pending' ? `
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button onclick="updateTradeStatus('${trade._id}', 'accepted')" style="flex: 1; padding: 8px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;"><i class="fa-solid fa-check"></i> Accept</button>
                    <button onclick="updateTradeStatus('${trade._id}', 'rejected')" style="flex: 1; padding: 8px; background: #ef4444; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;"><i class="fa-solid fa-xmark"></i> Reject</button>
                </div>
            ` : ''}
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
            loadTrades();
        } else {
            const data = await response.json();
            alert(`Error: ${data.message || 'Failed to update trade'}`);
        }
    } catch (err) {
        console.error("Error updating trade:", err);
    }
}

function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}