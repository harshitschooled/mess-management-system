const API_URL = "https://mess-management-backend-karn.onrender.com";

// ---------------- LOGIN ----------------
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.message;
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "student.html";
    }

  } catch (err) {
    msg.innerText = "Server error";
  }
}

// ---------------- STUDENT ----------------
async function markAttendance(willEat) {
  const token = localStorage.getItem("token");
  const msg = document.getElementById("msg");

  try {
    const res = await fetch(`${API_URL}/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ willEat })
    });

    const data = await res.json();
    msg.innerText = data.message;

  } catch {
    msg.innerText = "Error submitting attendance";
  }
}

// ---------------- ADMIN ----------------
async function getSummary() {
  const token = localStorage.getItem("token");
  const box = document.getElementById("summary");

  try {
    const res = await fetch(`${API_URL}/admin/summary`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    box.innerHTML = `
      <p><b>Date:</b> ${data.date}</p>
      <p><b>Total:</b> ${data.totalStudentsResponded}</p>
      <p><b>Eating:</b> ${data.studentsEating}</p>
      <p><b>Not Eating:</b> ${data.studentsNotEating}</p>
    `;
  } catch {
    box.innerText = "Failed to load data";
  }
}

// ---------------- LOGOUT ----------------
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
