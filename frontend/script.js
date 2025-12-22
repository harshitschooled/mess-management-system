const API_URL = "https://mess-management-backend-karn.onrender.com";

/* ================= LOGIN ================= */
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
    if (!res.ok) return msg.innerText = data.message;

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    window.location.href =
      data.role === "admin" ? "admin.html" : "student.html";

  } catch {
    msg.innerText = "Backend not reachable";
  }
}

/* ================= ADMIN ADD USER ================= */
async function addUser() {
  const token = localStorage.getItem("token");
  const msg = document.getElementById("msg");

  const body = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    role: document.getElementById("role").value
  };

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.innerText = data.message;

  } catch {
    msg.innerText = "Failed to add user";
  }
}

/* ================= STUDENT ATTENDANCE ================= */
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
    msg.innerText = "Attendance failed";
  }
}

/* ================= ADMIN SUMMARY ================= */
async function getSummary() {
  const token = localStorage.getItem("token");
  const box = document.getElementById("summary");

  const res = await fetch(`${API_URL}/admin/summary`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const d = await res.json();
  box.innerHTML = `
    <p>Date: ${d.date}</p>
    <p>Total: ${d.totalStudentsResponded}</p>
    <p>Eating: ${d.studentsEating}</p>
    <p>Not Eating: ${d.studentsNotEating}</p>
  `;
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
