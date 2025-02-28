const express = require("express");
const createSupabaseClient = require("../config/supabase");

const router = express.Router();

router.get("/home", (req, res) => {
  res.render("home");
});

module.exports = router;
