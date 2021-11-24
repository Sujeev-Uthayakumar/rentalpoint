const express = require("express");
const session = require("express-session");
const dayjs = require("dayjs");

const connection = require("../helpers/database");
const capitalize = require("../helpers/capitalize");
const { default: flatpickr } = require("flatpickr");
const relativeTime = require("dayjs/plugin/relativeTime");

const router = express.Router();
dayjs.extend(relativeTime);

router.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

router.get("/login", (req, res) => {
  if (req.session.loggedin) {
    res.redirect("/account");
  }
  res.render("login", { loggedIn: req.session.loggedin });
});

router.post("/login", (req, res) => {
  if (req.body.username && req.body.password) {
    connection().query(
      "SELECT * FROM accounts WHERE email = ? AND password = ?",
      [req.body.username, req.body.password],
      function (error, results, fields) {
        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = req.body.username;
          req.session.userid = results[0].id;
          req.session.location = results[0].country;
          res.redirect("/");
        } else {
          res.render("login", {
            errorMessage: "No account can be found matching your credentials",
            loggedIn: req.session.loggedin,
          });
        }
      }
    );
  } else {
    res.render("login", {
      errorMessage: "Please fill in all login details",
      loggedIn: req.session.loggedin,
    });
  }
});

router.get("/register", (req, res) => {
  if (req.session.loggedin) {
    res.redirect("/account");
  }
  res.render("register", {
    loggedIn: req.session.loggedin,
  });
});

router.post("/register", (req, res) => {
  if (
    req.body.fname &&
    req.body.lname &&
    req.body.country !== "None" &&
    req.body.date &&
    req.body.email &&
    req.body.password &&
    req.body.confirm
  ) {
    connection().query(
      "SELECT * FROM accounts WHERE email=?",
      [req.body.email],
      function (error, results, fields) {
        if (results.length > 0) {
          res.render("register", {
            errorMessage: "The email is already taken, try another one",
            loggedIn: req.session.loggedin,
          });
        } else if (req.body.password !== req.body.confirm) {
          res.render("register", {
            errorMessage: "The passwords don't match, please try again",
            loggedIn: req.session.loggedin,
          });
        } else if (
          req.body.password.length < 8 ||
          req.body.confirm.length < 8
        ) {
          res.render("register", {
            errorMessage: "Chosen password must be at least 8 characters",
            loggedIn: req.session.loggedin,
          });
        } else if (parseFloat(dayjs(req.body.date).toNow(true)) < 18) {
          res.render("register", {
            errorMessage:
              "You need to be at least 18 years old to make an account",
            loggedIn: req.session.loggedin,
          });
        } else if (req.session.loggedIn) {
          res.render("register", {
            errorMessage:
              "You are already logged in, please logout before proceeding",
            loggedIn: req.session.loggedin,
          });
        } else {
          connection().query(
            "INSERT INTO accounts(fname, lname, email, country, birthdate, password) VALUES(?,?,?,?,?,?)",
            [
              capitalize(req.body.fname),
              capitalize(req.body.lname),
              req.body.email,
              req.body.country,
              req.body.date,
              req.body.password,
            ],
            function (error, results, fields) {
              res.render("login", {
                successMessage:
                  "Congratulations, you have registered. Log in below",
                loggedIn: req.session.loggedin,
              });
            }
          );
        }
      }
    );
  } else {
    res.render("register", {
      errorMessage: "All input fields must be filled in",
      loggedIn: req.session.loggedin,
    });
  }
});

router.get("/seller", (req, res) => {
  if (req.session.loggedin) {
    res.redirect("/account");
  }
  res.render("register-seller", {
    loggedIn: req.session.loggedin,
  });
});

router.post("/seller", (req, res) => {
  if (
    req.body.fname &&
    req.body.lname &&
    req.body.country !== "None" &&
    req.body.date &&
    req.body.email &&
    req.body.password &&
    req.body.confirm &&
    req.body.phone &&
    req.body.license
  ) {
    connection().query(
      "SELECT * FROM accounts WHERE email=?",
      [req.body.email],
      function (error, results, fields) {
        if (results.length > 0) {
          res.render("register-seller", {
            errorMessage: "The email is already taken, try another one",
            loggedIn: req.session.loggedin,
          });
        } else if (req.body.password !== req.body.confirm) {
          res.render("register-seller", {
            errorMessage: "The passwords don't match, please try again",
            loggedIn: req.session.loggedin,
          });
        } else if (
          req.body.password.length < 8 ||
          req.body.confirm.length < 8
        ) {
          res.render("register-seller", {
            errorMessage: "Chosen password must be at least 8 characters",
            loggedIn: req.session.loggedin,
          });
        } else if (parseFloat(dayjs(req.body.date).toNow(true)) < 18) {
          res.render("register-seller", {
            errorMessage:
              "You need to be at least 18 years old to make an account",
            loggedIn: req.session.loggedin,
          });
        } else if (req.session.loggedIn) {
          res.render("register", {
            errorMessage:
              "You are already logged in, please logout before proceeding",
            loggedIn: req.session.loggedin,
          });
        } else {
          connection().query(
            "INSERT INTO accounts(fname, lname, email, country, birthdate, password) VALUES(?,?,?,?,?,?)",
            [
              capitalize(req.body.fname),
              capitalize(req.body.lname),
              req.body.email,
              req.body.country,
              req.body.date,
              req.body.password,
            ],
            function (error, results, fields) {
              res.render("login", {
                successMessage:
                  "Congratulations, you have registered as a seller. Log in below",
                loggedIn: req.session.loggedin,
              });
              connection().query(
                "INSERT INTO verified_accounts(user_id, license, isSeller, phone) VALUES(?, ?, ?, ?)",
                [results.insertId, req.body.license, 1, req.body.phone]
              );
            }
          );
        }
      }
    );
  } else {
    res.render("register-seller", {
      errorMessage: "All input fields must be filled in",
      loggedIn: req.session.loggedin,
    });
  }
});

router.get("/account", (req, res) => {
  if (req.session.loggedin) {
    const queries = [
      "SELECT fname, lname, country, email, DATE_FORMAT(birthdate, '%Y/%m/%d') AS birthdate  FROM accounts WHERE email=?",
      "SELECT isSeller FROM verified_accounts, accounts WHERE verified_accounts.user_id = accounts.id AND accounts.email = ?",
      "SELECT listings.price, full_listings.state, full_listings.manufacturer, full_listings.model, full_listings.car_year, listings.listing_id, host_id, DATE_FORMAT(datecreated, '%Y/%m/%d') AS datecreated, price, DATE_FORMAT(avaliable_start, '%Y/%m/%d') AS start, DATE_FORMAT(avaliable_end,'%Y/%m/%d') AS end, location FROM listings JOIN listing_car AS full_listings ON listings.listing_id = full_listings.listing_id WHERE host_id IN (SELECT user_id FROM verified_accounts,accounts WHERE accounts.email=? AND verified_accounts.user_id = accounts.id)",
      "SELECT DATE_FORMAT(rented_cars.datecreated, '%Y/%m/%d') AS datecreated, rented_cars.order_id, DATE_FORMAT(rented_cars.pickup, '%Y/%m/%d') AS pickup, DATE_FORMAT(rented_cars.dropoff, '%Y/%m/%d') AS dropoff, listing_car.manufacturer, listing_car.model, listing_car.car_year, rented_cars.location, accounts.email, accounts.fname, accounts.lname, full_listings.price, rented_cars.price AS total FROM listings AS full_listings JOIN rented_cars ON rented_cars.listing_id = full_listings.listing_id JOIN accounts ON accounts.id = full_listings.host_id JOIN listing_car ON listing_car.car_id = rented_cars.car_id WHERE rented_cars.buyer_id=?",
      "SELECT DATE_FORMAT(full_listings.datecreated, '%Y/%m/%d') AS purchaseDate, full_listings.price, full_listings.order_id, DATE_FORMAT(full_listings.pickup, '%Y/%m/%d') AS pickup, DATE_FORMAT(full_listings.dropoff, '%Y/%m/%d') AS dropoff, listing_car.manufacturer, listing_car.model, listing_car.car_year, accounts.email, accounts.fname, accounts.lname, listing_car.state, full_listings.location FROM rented_cars AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id JOIN accounts ON full_listings.buyer_id = accounts.id WHERE full_listings.listing_id IN(SELECT listing_id FROM listings WHERE listings.host_id = ?) ORDER BY full_listings.order_id DESC",
    ];
    connection().query(
      queries.join(";"),
      [
        req.session.username,
        req.session.username,
        req.session.username,
        req.session.userid,
        req.session.userid,
      ],
      function (error, results, fields) {
        res.render("account", {
          loggedIn: req.session.loggedin,
          accountDetails: results[0][0],
          registeredSeller: true ? results[1].length > 0 : false,
          orders: results[3],
          listings: results[2],
          fulfilled: results[4],
        });
      }
    );
  } else {
    res.redirect("/login");
  }
});

router.post("/account", (req, res) => {
  if (req.session.loggedin) {
    if (req.body.changeLocation && req.body.changeLocation !== "None") {
      req.session.location = req.body.changeLocation;
      connection().query(
        "UPDATE accounts SET country=? WHERE id=?",
        [req.body.changeLocation, req.session.userid],
        function (error, results, fields) {
          res.redirect("/account");
        }
      );
    } else {
      res.redirect("/account");
    }
  } else {
    res.redirect("/login");
  }
});

router.get("/account/:id", (req, res) => {
  console.log(req.params);
  if (req.session.loggedin) {
    connection().query(
      "DELETE full_listings, listing_car FROM listings AS full_listings JOIN listing_car ON full_listings.listing_id = listing_car.listing_id WHERE full_listings.listing_id=?",
      [req.params.id],
      function (error, results, fields) {
        res.redirect("/account");
      }
    );
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
