document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("signupForm").addEventListener("submit", async e => {
    e.preventDefault();
    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;

    const res = await fetch("/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", username);
      window.location.href = "profile.html";
    } else {
      alert("Signup failed");
    }
  });

  document.getElementById("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", username);
      window.location.href = "profile.html";
    } else {
      alert("Login failed");
    }
  });
});
