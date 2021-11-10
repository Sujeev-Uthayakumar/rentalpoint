const express = require("express");

const router = express.Router();

router.get("/listings", (req, res) => {
  res.send("Listings");
});

module.exports = router;
