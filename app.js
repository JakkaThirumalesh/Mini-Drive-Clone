const express = require("express");
const userRoute = require("./routes/user.routes");

const app = express();

app.use("/user", userRoute);

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
