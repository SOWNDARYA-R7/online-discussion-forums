const API_URL = "http://localhost:3000";

// --- Authentication (Login/Register) ---
document.getElementById("btn")?.addEventListener("click", function() {
    const email = document.querySelector("input[name='email']").value;
    const password = document.querySelector("input[name='password']").value;

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.username) {
            localStorage.setItem("username", data.username);
            window.location.href = "feed.html";
        }
    })
    .catch(err => console.error(err));
});

document.getElementById("btn2")?.addEventListener("click", function() {
    const username = document.querySelector("input[name='username']").value;
    const email = document.querySelector("input[name='email']").value;
    const password = document.querySelector("input[name='password']").value;

    fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.username) {
            localStorage.setItem("username", data.username);
            window.location.href = "feed.html";
        }
    })
    .catch(err => console.error(err));
});

// --- General Navigation & Session ---
const loggedInUser = localStorage.getItem("username");

if (document.getElementById("usernameDisplay")) {
    document.getElementById("usernameDisplay").innerText = `Welcome, ${loggedInUser || 'Guest'}!`;
}

document.querySelectorAll("#logoutBtn, #logout").forEach(btn => {
    btn.addEventListener("click", () => {
        localStorage.removeItem("username");
        window.location.href = "home.html";
    });
});

document.getElementById("homeBtn")?.addEventListener("click", () => {
    window.location.href = "feed.html";
});

document.getElementById("profileBtn")?.addEventListener("click", () => {
    window.location.href = "create_post.html";
});

document.getElementById("backBtn")?.addEventListener("click", () => {
    window.location.href = "feed.html";
});

// --- Dashboard / Create Post ---
if (window.location.pathname.includes("create_post.html")) {
    if (loggedInUser) {
        // Fetch current user details including profile picture
        fetch(`${API_URL}/api/user/${loggedInUser}`)
            .then(res => res.json())
            .then(user => {
                if (user.profilePicture) {
                    document.getElementById("icon").src = user.profilePicture;
                }
            })
            .catch(err => console.error("Error fetching user data:", err));
    }

    // Profile Picture Upload Handler
    const profilePicUpload = document.getElementById("profilePicUpload");
    if (profilePicUpload) {
        profilePicUpload.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64String = event.target.result;
                    fetch(`${API_URL}/api/user/${loggedInUser}/profile-picture`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ profilePicture: base64String })
                    })
                    .then(res => res.json())
                    .then(data => {
                        alert(data.message);
                        document.getElementById("icon").src = data.profilePicture;
                    })
                    .catch(err => console.error("Error uploading profile pic:", err));
                };
                reader.readAsDataURL(file);
            }
        });
    }

    document.getElementById("createPostForm")?.addEventListener("submit", function(e) {
        e.preventDefault();
        if (!loggedInUser) return alert("Please log in first!");

        const title = document.getElementById("postTitle").value;
        const content = document.getElementById("postContent").value;

        fetch(`${API_URL}/api/posts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, author: loggedInUser })
        })
        .then(res => res.json())
        .then(data => {
            alert("Post created!");
            window.location.href = "feed.html";
        })
        .catch(err => console.error(err));
    });
}

// --- Feed ---
if (window.location.pathname.includes("feed.html")) {
    fetch(`${API_URL}/api/posts`)
        .then(res => res.json())
        .then(posts => {
            const list = document.getElementById("postsList");
            list.innerHTML = "";
            if (posts.length === 0) {
                list.innerHTML = "<p style='text-align:center;'>No discussions yet.</p>";
                return;
            }
            posts.forEach(post => {
                const card = document.createElement("div");
                card.className = "post-card";
                card.onclick = () => window.location.href = `view_post.html?id=${post._id}`;
                
                const date = new Date(post.timestamp).toLocaleString();
                card.innerHTML = `
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-meta">By ${post.author} on ${date} | Comments: ${post.comments.length}</div>
                    <p class="post-preview">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
                `;
                list.appendChild(card);
            });
        })
        .catch(err => console.error("Error fetching posts:", err));
}

// --- View Post ---
if (window.location.pathname.includes("view_post.html")) {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");

    if (!postId) {
        document.getElementById("postDetails").innerHTML = "<h2>Post not found</h2>";
    } else {
        fetch(`${API_URL}/api/posts/${postId}`)
            .then(res => res.json())
            .then(post => {
                if (post.error) return document.getElementById("postDetails").innerHTML = `<h2>${post.error}</h2>`;
                
                document.getElementById("vpTitle").innerText = post.title;
                const date = new Date(post.timestamp).toLocaleString();
                document.getElementById("vpMeta").innerText = `By ${post.author} on ${date}`;
                document.getElementById("vpContent").innerText = post.content;

                const commentsList = document.getElementById("commentsList");
                commentsList.innerHTML = "";
                if (post.comments.length === 0) {
                    commentsList.innerHTML = "<p>No comments yet. Be the first!</p>";
                } else {
                    post.comments.forEach(c => {
                        const cDate = new Date(c.timestamp).toLocaleString();
                        commentsList.innerHTML += `
                            <div class="comment-card">
                                <div class="comment-meta"><b>${c.author}</b> on ${cDate}</div>
                                <p class="comment-text">${c.content}</p>
                            </div>
                        `;
                    });
                }
            })
            .catch(err => console.error("Error fetching post details:", err));

        document.getElementById("commentForm")?.addEventListener("submit", function(e) {
            e.preventDefault();
            if (!loggedInUser) return alert("Please log in first!");

            const content = document.getElementById("commentContent").value;

            fetch(`${API_URL}/api/posts/${postId}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author: loggedInUser, content })
            })
            .then(res => res.json())
            .then(data => {
                window.location.reload();
            })
            .catch(err => console.error(err));
        });
    }
}