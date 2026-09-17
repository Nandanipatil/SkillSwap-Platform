const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first!');
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('addSkillForm');
    if (form) {
        form.addEventListener('submit', handleAddSkill);
    }
});

async function handleAddSkill(e) {
    e.preventDefault();

    const title = document.getElementById('skillTitle').value;
    const category = document.getElementById('skillCategory').value;
    const description = document.getElementById('skillDescription').value;
    const imageUrl = document.getElementById('skillImageUrl').value;

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, category, description, imageUrl })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Skill added successfully!');
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Failed to add skill');
        }
    } catch (err) {
        console.error(err);
        alert('Error connecting to backend server.');
    }
}