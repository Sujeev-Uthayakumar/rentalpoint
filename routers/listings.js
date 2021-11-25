const express = require("express");
const mysql = require("mysql2");
const dayjs = require("dayjs");

const router = express.Router();
const connection = require("../helpers/database");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const capitilize = require("../helpers/capitalize");

dayjs.extend(isSameOrBefore);

router.use(express.json());
router.get("/listings", (req, res) => {
  if (req.session.loggedin) {
    const queries = [
      "SELECT country FROM accounts WHERE id = ?",
      "SELECT full_listings.listing_id, full_listings.location, DATE_FORMAT(full_listings.avaliable_start, '%Y/%m/%d') AS avaliable_start,DATE_FORMAT(full_listings.avaliable_end, '%Y/%m/%d') AS avaliable_end, listing_car.manufacturer, listing_car.model, listing_car.car_year, accounts.fname, accounts.lname, DATE_FORMAT(full_listings.datecreated, '%Y/%m/%d') AS datecreated, listing_car.seats, listing_car.state, full_listings.price, full_listings.picture FROM listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id JOIN accounts ON full_listings.host_id = accounts.id WHERE full_listings.location=? AND full_listings.is_deleted='0'",
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
  if (req.session.loggedin) {
    if (
      req.body.manufacturer &&
      req.body.model &&
      req.body.country !== "None" &&
      req.body.seats &&
      req.body.condition &&
      req.body.datestart &&
      req.body.dateend &&
      req.body.price &&
      req.body.year
    ) {
      const start = dayjs(req.body.datestart);
      const end = dayjs(req.body.dateend);
      const now = dayjs();

      if (start.diff(end, "day", true) >= 0) {
        res.render("listings-add", {
          errorMessage:
            "The end date must be set to a later date, a date later than the start date",
          loggedIn: req.session.loggedin,
        });
      } else if (now.diff(start, "day", true) > 0) {
        res.render("listings-add", {
          errorMessage:
            "The start date must at least start after today, so begin your listing starting tomorrow",
          loggedIn: req.session.loggedin,
        });
      } else if (req.body.condition > 10 || req.body.condition < 1) {
        res.render("listings-add", {
          errorMessage: "The condition input field is not an acceptable value",
          loggedIn: req.session.loggedin,
        });
      } else if (req.body.seats > 10 || req.body.seats < 1) {
        res.render("listings-add", {
          errorMessage: "The car capacity should qualify as a consumer vehicle",
          loggedIn: req.session.loggedin,
        });
      } else if (req.body.price < 0) {
        res.render("listings-add", {
          errorMessage: "The price must be an acceptable value",
          loggedIn: req.session.loggedin,
        });
      } else if (req.body.year < 2010) {
        res.render("listings-add", {
          errorMessage: "The car year must be at least from 2010",
          loggedIn: req.session.loggedin,
        });
      } else {
        connection().query(
          "INSERT INTO listings(host_id, price, avaliable_start, avaliable_end, location) VALUES(?, ?, ?, ?, ?)",
          [
            req.session.userid,
            Math.round(req.body.price * 100) / 100,
            req.body.datestart,
            req.body.dateend,
            req.body.country,
          ],
          function (error, results, fields) {
            connection().query(
              "INSERT INTO listing_car(listing_id, manufacturer, model, car_year, seats, state) VALUES(?, ?, ?, ?, ?, ?)",
              [
                results.insertId,
                capitilize(req.body.manufacturer),
                capitilize(req.body.model),
                req.body.year,
                req.body.seats,
                req.body.condition,
              ],
              function (error, results, fields) {
                res.redirect("/listings");
              }
            );
          }
        );
      }
    } else {
      res.render("listings-add", {
        loggedIn: req.session.loggedin,
        errorMessage: "All input fields must be filled in",
      });
    }
  } else {
    res.redirect("/login");
  }
});

router.post("/search", (req, res) => {
  connection().query(
    "SELECT fname, lname, price,DATE_FORMAT(datecreated, '%Y/%m/%d') AS datecreated, DATE_FORMAT(avaliable_start, '%Y/%m/%d') as avaliable_start, DATE_FORMAT(avaliable_end, '%Y/%m/%d') AS avaliable_end, location, manufacturer, model, car_year, seats, state, price, full_listings.picture AS picture FROM accounts, listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id  WHERE full_listings.location = ? AND listing_car.seats = ? AND accounts.id = host_id",
    [req.body.locationSearch, req.body.seatSearch],
    function (error, results, fields) {
      res.render("carlistings", {
        results: results,
        loggedIn: req.session.loggedin,
      });
    }
  );
});

router.get("/listings/:id", (req, res) => {
  if (req.session.loggedin) {
    const queries = [
      "SELECT DATE_FORMAT(datecreated, '%Y-%m-%d') AS date_created, DATE_FORMAT(avaliable_start, '%Y-%m-%d') AS start_date, DATE_FORMAT(avaliable_end, '%Y-%m-%d') AS end_date FROM listings WHERE listing_id = ?",
      "SELECT full_listings.picture, full_listings.listing_id, DATE_FORMAT(full_listings.datecreated, '%Y-%m-%d') AS datecreated, accounts.email, accounts.fname, accounts.lname, full_listings.price, full_listings.location, listing_car.manufacturer, listing_car.model, listing_car.car_year, listing_car.state, listing_car.seats FROM listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id JOIN accounts ON accounts.id = full_listings.host_id WHERE full_listings.listing_id = ?",
      "SELECT DATE_FORMAT(pickup, '%Y-%m-%d') AS 'from', DATE_FORMAT(dropoff, '%Y-%m-%d') AS 'to' FROM rented_cars WHERE rented_cars.listing_id = ?",
    ];
    connection().query(
      queries.join(";"),
      [req.params.id, req.params.id, req.params.id],
      function (error, results, fields) {
        const currentDate = dayjs();
        res.render("product", {
          loggedIn: req.session.loggedin,
          endDate: results[0][0].end_date,
          startDate: results[0][0].start_date,
          isAvaliable: dayjs(results[0][0].end_date).isSameOrBefore(
            currentDate,
            "day"
          ),
          disable: JSON.stringify(results[2]),
          results: results[1][0],
        });
      }
    );
  } else {
    res.redirect("/login");
  }
});

router.post("/listings/:id", (req, res, next) => {
  if (req.session.loggedin) {
    if (req.body.calendar) {
      connection().query(
        "SELECT * FROM listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id WHERE full_listings.listing_id = ?",
        [req.params.id],
        function (error, results, fields) {
          const dates = req.body.calendar.split(" to ");
          console.log(results);
          const numberDays =
            dates.length > 1
              ? 1 + dayjs(dates[1]).diff(dayjs(dates[0]), "day")
              : 1;

          res.render("checkout", {
            listing_id: req.params.id,
            from: dates[0],
            to: dates[1],
            days:
              dates.length > 1
                ? 1 + dayjs(dates[1]).diff(dayjs(dates[0]), "day")
                : 1,
            results: results[0],
            loggedIn: req.session.loggedin,
            price: (numberDays * results[0].price).toFixed(2),
          });
          req.session.fromDate = dates[0];
          req.session.toDate = dates[1] ? dates[1] : dates[0];
          req.session.price = numberDays * results[0].price;
          req.session.locationListing = results[0].location;
          req.session.carId = results[0].car_id;
        }
      );
    } else {
      res.redirect("back");
    }
  } else {
    res.redirect("/login");
  }
});

router.post("/listings/:id/checkout", (req, res, next) => {
  if (req.session.loggedin) {
    if (req.session.carId && req.params.id) {
      connection().query(
        "INSERT INTO rented_cars(listing_id, car_id, buyer_id, pickup, dropoff, location, price) VALUES(?, ?, ?, ?, ?, ?, ?)",
        [
          req.params.id,
          req.session.carId,
          req.session.userid,
          req.session.fromDate,
          req.session.toDate,
          req.session.locationListing,
          req.session.price,
        ],
        function (error, results, fields) {
          if (error) {
            res.render("about", {
              errorMessage:
                "There was a problem with your order, try again later",
              loggedIn: req.session.loggedin,
            });
          } else {
            req.params.id = null;
            req.session.carId = null;
            req.session.fromDate = null;
            req.session.toDate = null;
            req.session.locationListing = null;
            req.session.price = null;
            res.render("about", {
              successMessage: "Your order has been successfully made",
              loggedIn: req.session.loggedin,
            });
          }
        }
      );
    } else {
      res.render("about", {
        errorMessage: "There was a problem with your order, try again later",
        loggedIn: req.session.loggedin,
      });
    }
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
