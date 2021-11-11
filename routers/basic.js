const express = require("express");
const connection = require("../config/database");

const router = express.Router();

router.get("", (req, res) => {
  connection().query(
    "SELECT fname, lname, seats, state, location, manufacturer, model, car_year, picture FROM listings JOIN listing_car ON listings.listing_id = listing_car.listing_id JOIN accounts ON listings.host_id = accounts.id ORDER BY datecreated DESC LIMIT 6",
    function (error, results, fields) {
      if (error) throw error;
      res.render("main", {
        results: results,
      });
    }
  );
});

router.get("/about", (req, res) => {
  res.render("about");
});

module.exports = router;
