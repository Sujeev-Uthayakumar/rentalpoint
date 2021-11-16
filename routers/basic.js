const express = require("express");
const connection = require("../helpers/database");

const router = express.Router();

router.get("", (req, res) => {
  connection().query(
    "SELECT fname, lname, seats, state, location, manufacturer, model, car_year, picture FROM listings JOIN listing_car ON listings.listing_id = listing_car.listing_id JOIN accounts ON listings.host_id = accounts.id ORDER BY datecreated DESC LIMIT 6",
    function (error, results, fields) {
      if (error) throw error;
      res.render("main", {
        results: results,
        loggedIn: req.session.loggedin,
      });
    }
  );
});

router.get("/about", (req, res) => {
  connection().query(
    "SELECT  COUNT(DISTINCT accounts.id) AS users, COUNT(DISTINCT listings.listing_id) AS listings, COUNT(DISTINCT listing_car.car_id) AS cars FROM accounts, listings, listing_car",
    function (error, results, fields) {
      res.render("about", {
        users: results[0].users,
        listings: results[0].listings,
        cars: results[0].cars,
        loggedIn: req.session.loggedin,
      });
    }
  );
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
