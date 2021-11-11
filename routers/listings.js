const express = require("express");
const mysql = require("mysql2");

const router = express.Router();
const connection = require("../config/database");

router.use(express.json());

router.get("/listings", (req, res) => {
  res.send("Listings");
});

router.post("/search", (req, res) => {
  connection().query(
    "SELECT * FROM listings, listing_car WHERE listings.location = ? AND listing_car.seats = ? AND listings.host_id IN (SELECT id FROM accounts)",
    [req.body.locationSearch, req.body.seatSearch],
    function (error, results, fields) {
      res.render("carlistings");
    }
  );
});
module.exports = router;
