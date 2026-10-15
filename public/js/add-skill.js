// Global API_URL fallback (Redeclaration SyntaxError se bachne ke liye)
if (typeof API_URL === 'undefined') {
    var API_URL = 'http://localhost:5000/api';
}

document.addEventListener('DOMContentLoaded', () => {
    const addSkillForm = document.getElementById('addSkillForm');

    if (!addSkillForm) {
        console.error("Form element 'addSkillForm' HTML me nahi mila!");
        return;
    }

    addSkillForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. LocalStorage se Authentication Token check karein
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Aap logged in nahi hain! Kripya pehale Login karein.");
            window.location.href = 'login.html';
            return;
        }

        // 2. Form Values collect karein
        const title = document.getElementById('title').value.trim();
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();
        const imageUrlInput = document.getElementById('imageUrl');
        const imageUrl = imageUrlInput ? imageUrlInput.value.trim() : '';

        // 3. Backend API call
        try {
            const response = await fetch(`${API_URL}/skills`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, category, description, imageUrl })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Success: Skill Added Successfully!");
                // Direct homepage par redirect
                window.location.href = 'index.html';
            } else {
                alert("Error: " + (data.message || "Skill add nahi ho saki"));
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Server connection failed! Check karein ki backend server running hai ya nahi.");
        }
    });
});