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
    "SELECT * FROM listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id  WHERE full_listings.location = ? AND listing_car.seats = ?",
    [req.body.locationSearch, req.body.seatSearch],
    function (error, results, fields) {
      res.render("carlistings", {
        results: results,
      });
    }
  );
});
module.exports = router;
