let token = "";
let role = "";

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!data.token) {
    alert("Login failed");
    return;
  }

  token = data.token;
  role = data.role;

  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("userRole").textContent =
    role === "admin" ? "Admin" : "Student";

  if (role === "student") {
    document.getElementById("studentBox").classList.remove("hidden");
  } else {
    document.getElementById("adminBox").classList.remove("hidden");
  }
}

async function markAttendance(willEat) {
  const res = await fetch("http://localhost:5000/attendance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ willEat }),
  });

  const data = await res.json();
  alert(data.message);
}

async function loadSummary() {
  const res = await fetch("http://localhost:5000/admin/summary", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();
  document.getElementById("summary").textContent =
    JSON.stringify(data, null, 2);
}

function logout() {
  token = "";
  role = "";

  document.getElementById("loginBox").classList.remove("hidden");
  document.getElementById("studentBox").classList.add("hidden");
  document.getElementById("adminBox").classList.add("hidden");
  document.getElementById("userRole").textContent = "Not logged in";
}
