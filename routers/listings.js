const express = require("express");
const mysql = require("mysql2");
const relativeTime = require("dayjs/plugin/relativeTime");
const dayjs = require("dayjs");

const router = express.Router();
const connection = require("../helpers/database");

router.use(express.json());

router.get("/listings", (req, res) => {
  if (req.session.loggedin) {
    const queries = [
      "SELECT country FROM accounts WHERE id = ?",
      "SELECT * FROM listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id WHERE full_listings.location=?",
      "SELECT isSeller FROM verified_accounts, accounts WHERE verified_accounts.user_id = accounts.id AND accounts.email = ?",
    ];
    connection().query(
      queries.join(";"),
      [req.session.userid, req.session.location, req.session.username],
      function (error, results, fields) {
        res.render("listings", {
          loggedIn: req.session.loggedin,
          results: results[1],
          isSeller: true ? results[2].length > 0 : false,
        });
      }
    );
  } else {
    res.redirect("/login");
  }
});

router.get("/listings/add", (req, res) => {
  res.render("listings-add", {
    loggedIn: req.session.loggedin,
  });
});

router.post("/listings/add", (req, res) => {
  if (
    req.body.manufacturer &&
    req.body.model &&
    req.body.country !== "None" &&
    req.body.seats &&
    req.body.condition &&
    req.body.datestart &&
    req.body.dateend &&
    req.body.price
  ) {
    const start = dayjs(req.body.datestart);
    const end = dayjs(req.body.dateend);
    const now = dayjs();
    if (start.diff(end, "day", true) >= 0) {
      res.render("listings-add", {
        errorMessage:
          "The end date must be set to a later date, a date later than the start date",
      });
    } else if (now.diff(start, "day", true) > 0) {
      res.render("listings-add", {
        errorMessage:
          "The start date must at least start after today, so begin your listing starting tomorrow",
      });
    }
  } else {
    res.render("listings-add", {
      loggedIn: req.session.loggedin,
      errorMessage: "All input fields must be filled in",
    });
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
