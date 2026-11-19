const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Demo data: listings reset whenever the server restarts.
// A database will be added in a later development step.
let listings = [
  {
    id: 1,
    title: "Pre-loved denim jacket",
    price: 18,
    condition: "Good",
    category: "Clothing",
    description: "A comfortable denim jacket in good condition.",
    location: "Cham, Germany"
  },
  {
    id: 2,
    title: "Desk lamp",
    price: 10,
    condition: "Very good",
    category: "Home",
    description: "Working desk lamp. Selling because I no longer need it.",
    location: "Regensburg, Germany"
  }
];

app.get("/api/listings", (req, res) => {
  res.json(listings);
});

app.post("/api/listings", (req, res) => {
  const { title, price, condition, category, description, location } = req.body;

  if (!title || !Number.isFinite(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: "Please provide a title and a valid price." });
  }

  const listing = {
    id: Date.now(),
    title: String(title).trim(),
    price: Number(price),
    condition: condition || "Used",
    category: category || "Other",
    description: description || "",
    location: location || ""
  };

  listings.unshift(listing);
  res.status(201).json(listing);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`SwapThrift is running at http://localhost:${PORT}`);
});
