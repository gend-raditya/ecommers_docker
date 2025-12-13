const express = require("express");
const app = express();

app.use(express.json());

// Dummy data pengguna
let users = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "customer" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "seller" },
  { id: 3, name: "Charlie", email: "charlie@example.com", role: "admin" }
];

// GET /users
app.get("/users", (req, res) => {
  res.json(users);
});

// GET /users/:id
app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

// POST /users
app.post("/users", (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role)
    return res.status(400).json({ message: "Missing fields" });

  const newUser = {
    id: users.length + 1,
    name,
    email,
    role
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

app.listen(4000, () => {
  console.log("User service running on port 4000");
});
