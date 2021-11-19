const express = require("express");
const mysql = require("mysql2");

const router = express.Router();
const connection = require("../helpers/database");

router.use(express.json());

router.get("/listings", (req, res) => {
  console.log(req.session);
  if (req.session.loggedin) {
    const queries = [
      "SELECT country FROM accounts WHERE id = ?",
      "SELECT * FROM listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id WHERE full_listings.location=?",
    ];
    connection().query(
      queries.join(";"),
      [req.session.userid, req.session.location],
      function (error, results, fields) {
        console.log(results);
        res.render("listings", {
          loggedIn: req.session.loggedin,
          results,
          isSeller: true,
        });
      }
    );
  } else {
    res.redirect("/login");
  }
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
