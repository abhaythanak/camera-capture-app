const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Ensure /images folder exists
const imagesDir = path.join(__dirname, "images");
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

// Serve static images
app.use("/images", express.static(imagesDir));

// Save image
app.post("/save-image", (req, res) => {
  const { imageData } = req.body;
  const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
  const filename = `snapshot_${Date.now()}.png`;
  const filePath = path.join(imagesDir, filename);

  fs.writeFile(filePath, base64Data, "base64", (err) => {
    if (err) return res.status(500).send("Failed to save image");
    const imageUrl = `https://camera-capture-app-i6fd.onrender.com/images/${filename}`;
    res.json({ message: "Image saved", imageUrl, filename });
  });
});

// Get all saved images
app.get("/all-images", (req, res) => {
  fs.readdir(imagesDir, (err, files) => {
    if (err) return res.status(500).send("Failed to list images");
    const imageList = files
      .filter((file) => file.endsWith(".png"))
      .map((file) => ({
        filename: file,
        url: `https://camera-capture-app-i6fd.onrender.com/images/${file}`,
      }));
    res.json(imageList);
  });
});

// Delete image
app.delete("/delete-image/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(imagesDir, filename);

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).send("Failed to delete image");
    res.send("Image deleted");
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
