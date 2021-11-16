const express = require("express");
const mysql = require("mysql2");

const router = express.Router();
const connection = require("../helpers/database");

router.use(express.json());

router.get("/listings", (req, res) => {
  res.render("carlistings", { loggedIn: req.session.loggedin });
});

router.post("/search", (req, res) => {
  connection().query(
    "SELECT fname, lname, price,DATE_FORMAT(datecreated, '%Y/%m/%d') AS datecreated, DATE_FORMAT(avaliable_start, '%Y/%m/%d') as avaliable_start, DATE_FORMAT(avaliable_end, '%Y/%m/%d') AS avaliable_end, location, manufacturer, model, car_year, seats, state, price FROM accounts, listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id  WHERE full_listings.location = ? AND listing_car.seats = ? AND accounts.id = host_id",
    [req.body.locationSearch, req.body.seatSearch],
    function (error, results, fields) {
      res.render("carlistings", {
        results: results,
        loggedIn: req.session.loggedin,
      });
    }
  );
});
module.exports = router;
