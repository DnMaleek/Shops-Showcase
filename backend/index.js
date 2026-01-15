const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const userAuthRoutes = require("./routes/userAuth");
const shopAuthRoutes = require("./routes/shopAuth");
const staffRoutes = require("./routes/staff");
const productRoutes = require("./routes/products");

const app = express();

app.use(cors());
app.use(express.json());

// 👉 Serve public folder
app.use(express.static(path.join(__dirname, "public")));

// APIs
app.use("/api/users", userAuthRoutes);
app.use("/api/shops", shopAuthRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/products", productRoutes);

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
