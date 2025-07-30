import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json()); // to parse JSON bodies
app.use(cors()); // Add this line

// Set up MySQL connection
const db = mysql.createConnection({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1); // Exit the app if DB connection fails
  } else {
    console.log("Connected to MySQL database");
  }
});

// Create a contact
app.post("/contacts", (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required." });
  }

  console.log(`INSERT INTO contacts (name, phone) VALUES (${name}, ${phone})`);

  const query = "INSERT INTO contacts (name, phone) VALUES (?, ?)";
  db.query(query, [name, phone], (err, results) => {
    if (err) {
      console.error("Error inserting contact:", err);
      return res.status(500).json({ message: "Error inserting contact." });
    }
    res.status(201).json({ id: results.insertId, name, phone });
  });
});

// Get all contacts
app.get("/contacts", (req, res) => {
  const query = "SELECT * FROM contacts";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching contacts:", err);
      return res.status(500).json({ message: "Error fetching contacts." });
    }

    console.log("Results: ", results);

    res.status(200).json(results);
  });
});

// Get a contact by ID
app.get("/contacts/:id", (req, res) => {
  const contactId = req.params.id;
  const query = "SELECT * FROM contacts WHERE id = ?";

  db.query(query, [contactId], (err, results) => {
    if (err) {
      console.error("Error fetching contact:", err);
      return res.status(500).json({ message: "Error fetching contact." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Contact not found." });
    }

    console.log("Results (One Contact): ", results[0]);

    res.status(200).json(results[0]);
  });
});

// Update a contact
app.put("/contacts/:id", (req, res) => {
  const contactId = req.params.id;
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required." });
  }

  const query = "UPDATE contacts SET name = ?, phone = ? WHERE id = ?";

  db.query(query, [name, phone, contactId], (err, results) => {
    if (err) {
      console.error("Error updating contact:", err);
      return res.status(500).json({ message: "Error updating contact." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Contact not found." });
    }

    res.status(200).json({ id: contactId, name, phone });
  });
});

// Delete a contact
app.delete("/contacts/:id", (req, res) => {
  const contactId = req.params.id;
  const query = "DELETE FROM contacts WHERE id = ?";

  db.query(query, [contactId], (err, results) => {
    if (err) {
      console.error("Error deleting contact:", err);
      return res.status(500).json({ message: "Error deleting contact." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Contact not found." });
    }

    res.status(200).json({ message: "Contact deleted successfully." });
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "API is up and running.",
  });
});

// Set up server to listen on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
