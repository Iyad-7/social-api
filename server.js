const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const socialFile = path.join(__dirname, "data", "social.json");

app.use(cors());
app.use(express.json());

// Read socials
function readSocials() {
  try {
    return JSON.parse(fs.readFileSync(socialFile, "utf-8"));
  } catch {
    return [];
  }
}

// Write socials
function writeSocials(socials) {
  fs.writeFileSync(socialFile, JSON.stringify(socials, null, 2));
}

// ✅ Create Social Post
app.post("/api/social", (req, res) => {
  const { content, author, tags } = req.body;

  if (!content || !author) {
    return res.status(400).json({ error: "Content and author are required." });
  }
  if (content.length < 1 || content.length > 280) {
    return res.status(400).json({ error: "Content must be 1–280 characters." });
  }
  if (tags && (!Array.isArray(tags) || tags.length > 5)) {
    return res.status(400).json({ error: "Tags must be an array (max 5)." });
  }

  const newSocial = {
    socialId: Date.now(),
    content,
    author,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    likes: 0,
    status: "published"
  };

  const socials = readSocials();
  socials.push(newSocial);
  writeSocials(socials);

  res.status(201).json(newSocial);
});

// ✅ Get All Socials
app.get("/api/social", (req, res) => {
  const socials = readSocials();
  const sorted = socials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
