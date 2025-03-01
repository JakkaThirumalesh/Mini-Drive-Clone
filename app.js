const express = require("express");
const userRoute = require("./routes/user.routes");
const dotenv = require("dotenv");
dotenv.config();
const connectToDB = require("./config/db");
connectToDB();
const cookieParser = require("cookie-parser");
const app = express();
const indexRoute = require("./routes/index.routes");

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRoute);
app.use("/user", userRoute);
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception");
  console.log(err);
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
