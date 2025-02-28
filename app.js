const express = require("express");
const userRoute = require("./routes/user.routes");
const dotenv = require("dotenv");
dotenv.config();
const connectToDB = require("./config/db");
connectToDB();
const cookieParser = require("cookie-parser");
const app = express();
const indexRoute = require("./routes/index.routes");
const createSupabaseClient = require("./config/supabase");

async function startApp() {
  const supabase = await createSupabaseClient();
  console.log("Supabase initialized:", supabase);
}
startApp();

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRoute);
app.use("/user", userRoute);

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
