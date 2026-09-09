const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();
    loadTrades();
});

function checkUserAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navElement = document.getElementById('navMenu') || document.querySelector('nav');

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

function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

async function loadTrades() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const receivedContainer = document.getElementById('receivedTradesContainer');
    const sentContainer = document.getElementById('sentTradesContainer');

    if (!token) {
        alert("Please login first!");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/trades`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const trades = await response.json();

        if (receivedContainer) receivedContainer.innerHTML = '';
        if (sentContainer) sentContainer.innerHTML = '';

        if (!Array.isArray(trades) || trades.length === 0) {
            if (receivedContainer) receivedContainer.innerHTML = '<p class="empty-state">No received trade requests.</p>';
            if (sentContainer) sentContainer.innerHTML = '<p class="empty-state">No sent trade requests.</p>';
            return;
        }

        let hasReceived = false;
        let hasSent = false;

        trades.forEach(trade => {
            const currentUserId = user._id || user.id;
            const requesterId = trade.requester ? (trade.requester._id || trade.requester) : null;
            
            const isSender = (requesterId === currentUserId);
            const statusLower = (trade.status || 'pending').toLowerCase();

            const tradeCard = document.createElement('div');
            tradeCard.className = 'skill-card trade-card';

            if (isSender) {
                hasSent = true;
                tradeCard.innerHTML = `
                    <div>
                        <h3>Skill: ${trade.skill ? trade.skill.title : 'Skill Request'}</h3>
                        <p><strong>Message:</strong> ${trade.message || 'No message provided'}</p>
                        <p style="margin-top: 10px;">
                            <strong>Status:</strong> 
                            <span class="badge badge-${statusLower}">${trade.status}</span>
                        </p>
                    </div>
                `;
                if (sentContainer) sentContainer.appendChild(tradeCard);
            } else {
                hasReceived = true;
                const senderName = trade.requester ? (trade.requester.name || 'User') : 'User';
                
                tradeCard.innerHTML = `
                    <div>
                        <h3>Requested Skill: ${trade.skill ? trade.skill.title : 'Skill'}</h3>
                        <p><strong>From:</strong> ${senderName}</p>
                        <p><strong>Message:</strong> ${trade.message || 'No message provided'}</p>
                        <p style="margin-top: 10px;">
                            <strong>Status:</strong> 
                            <span class="badge badge-${statusLower}">${trade.status}</span>
                        </p>
                    </div>
                    ${statusLower === 'pending' ? `
                        <div class="action-buttons">
                            <button onclick="updateTradeStatus('${trade._id}', 'Accepted')" class="btn-action btn-accept">Accept</button>
                            <button onclick="updateTradeStatus('${trade._id}', 'Rejected')" class="btn-action btn-reject">Reject</button>
                        </div>
                    ` : ''}
                `;
                if (receivedContainer) receivedContainer.appendChild(tradeCard);
            }
        });

        if (!hasReceived && receivedContainer) receivedContainer.innerHTML = '<p class="empty-state">No received trade requests.</p>';
        if (!hasSent && sentContainer) sentContainer.innerHTML = '<p class="empty-state">No sent trade requests.</p>';

    } catch (error) {
        console.error('Error fetching trades:', error);
        if (receivedContainer) receivedContainer.innerHTML = '<p class="empty-state">Failed to load trade requests.</p>';
        if (sentContainer) sentContainer.innerHTML = '<p class="empty-state">Failed to load trade requests.</p>';
    }
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
            alert(`Trade request ${status.toLowerCase()} successfully!`);
            loadTrades();
        } else {
            const data = await response.json();
            alert(`Error: ${data.message || 'Failed to update status'}`);
        }
    } catch (error) {
        console.error('Update status error:', error);
    }
}