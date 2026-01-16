const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const userAuthRoutes = require("./routes/userAuth");
const shopAuthRoutes = require("./routes/shopAuth");
const staffRoutes = require("./routes/staff");
const productRoutes = require("./routes/products");
const {logs} = require("./middleware/logs.middleware");
const shopSettingsRoutes = require("./routes/shopSettings");
const logsRoutes = require("./routes/logs");
const app = express();

app.use(cors());
app.use(express.json());
app.use(logs);

// Serve static folders
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 🔥 REQUIRED

// APIs
app.use("/api/users", userAuthRoutes);
app.use("/api/shops", shopAuthRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/products", productRoutes);
app.use("/api/shops/settings", shopSettingsRoutes);
app.use("/api/logs", logsRoutes);
const multer = require("multer");

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "One of the images is too large (max 5MB per image)",
      });
    }

    return res.status(400).json({
      message: err.message,
    });
  }

  next(err);
});


app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
