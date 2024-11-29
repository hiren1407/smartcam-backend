const express = require("express");
require('dotenv').config()
const cors = require("cors");
const auth = require("./routes/auth");
const admin = require("./routes/admin");
const faculty = require("./routes/faculty");
const db = require("./config/connection")
const path = require('path');

const PORT = process.env.PORT || 5050;
const app = express();
const cookieParser = require('cookie-parser');

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());


app.use(cookieParser());
// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", auth);
app.use("/api/admin", admin);
app.use('/api/faculty', faculty);




db().then(() => {
  console.log("Database connection established...");
  app.listen(5050, () => {
    console.log("Server is successfully listening on port 5050...");
  });
})
  .catch((err) => {
    console.log("Error connecting to the database:", err.message);
    console.error("Database cannot be connected!!");
  });
