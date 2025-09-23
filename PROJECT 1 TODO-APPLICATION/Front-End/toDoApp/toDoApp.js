const API_URL = "http://localhost:8080/api/auth";

// ==================== REGISTER ====================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // clear old error messages
    document.getElementById("usernameError").textContent = "";
    document.getElementById("emailError").textContent = "";

    const data = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      username: document.getElementById("username").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value.trim(),
      confirmPassword: document.getElementById("confirmPassword").value.trim()
    };

    
    if (data.password.length < 6) {
      alert("⚠️ Password must be at least 6 characters long.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorData = await res.json();
        const message = errorData.message || "Registration failed";

        // map backend messages to fields
        if (message.toLowerCase().includes("username")) {
          document.getElementById("usernameError").textContent = message;
        } else if (message.toLowerCase().includes("email")) {
          document.getElementById("emailError").textContent = message;
        } else {
          alert("❌ Registration failed: " + message);
        }
        return;
      }

      const registeredUser = await res.json();

      alert(`🎉 Registration successful! Welcome, ${registeredUser.username}`);

      localStorage.setItem("userId", registeredUser.id);
      localStorage.setItem("username", registeredUser.username);

      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Registration error:", err);
      alert("❌ Registration failed: " + err.message);
    }
  });
}

// ==================== LOGIN ====================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // clear old error messages 
    document.getElementById("usernameLoginError").textContent = "";
    document.getElementById("passwordLoginError").textContent = "";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const errorData = await res.json();
        const message = errorData.message || "Login failed";

        // map backend messages to fields
        if (message.toLowerCase().includes("username")) {
          document.getElementById("usernameLoginError").textContent = message;
        } else if (message.toLowerCase().includes("password")) {
          document.getElementById("passwordLoginError").textContent = message;
        } else {
          alert("❌ Login failed: " + message);
        }
        return;
      }

      const loggedInUser = await res.json();

      localStorage.setItem("userId", loggedInUser.id);
      localStorage.setItem("username", loggedInUser.username);

      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Login error:", err);
      alert("❌ Login failed: " + err.message);
    }
  });
}

// ==================== FORGOT PASSWORD ====================
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.getElementById("forgotEmailError").textContent = "";

    const email = document.getElementById("email").value.trim();
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const errorData = await res.json();
        const message = errorData.message || "Request failed";
        document.getElementById("forgotEmailError").textContent = message;
        return;
      }

      alert("✅ Reset token sent to your email (for dev, check backend logs)");
    } catch (err) {
      console.error("Forgot error:", err);
      alert("❌ Error: " + err.message);
    }
  });
}

// ==================== RESET PASSWORD ====================
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.getElementById("resetTokenError").textContent = "";
    document.getElementById("resetNewPassError").textContent = "";
    document.getElementById("resetConfirmPassError").textContent = "";

    const data = {
      token: document.getElementById("token").value.trim(),
      newPassword: document.getElementById("newPassword").value.trim(),
      confirmNewPassword: document.getElementById("confirmNewPassword").value.trim()
    };

    
    if (data.newPassword.length < 6) {
      alert("⚠️ Password must be at least 6 characters long.");
      return;
    }

    if (data.newPassword !== data.confirmNewPassword) {
      document.getElementById("resetConfirmPassError").textContent = "Passwords do not match";
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorData = await res.json();
        const message = errorData.message || "Reset failed";

        if (message.toLowerCase().includes("token")) {
          document.getElementById("resetTokenError").textContent = message;
        } else if (message.toLowerCase().includes("password")) {
          document.getElementById("resetNewPassError").textContent = message;
        } else {
          alert("❌ " + message);
        }
        return;
      }

      alert("✅ Password reset successful! Please login.");
      window.location.href = "login.html";
    } catch (err) {
      console.error("Reset error:", err);
      alert("❌ Error: " + err.message);
    }
  });
}
