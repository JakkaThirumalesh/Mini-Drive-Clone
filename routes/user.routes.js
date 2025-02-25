const express = require("express");
const router = express.Router();

router.get("/text", (req, res) => {
  res.send("user text route");
});

module.exports = router;
