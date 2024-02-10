const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { isLoggedin } = require("../middlewares");

router.get("/register", (req, res) => {
  res.render("user/register");
});
router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  const user = new User({ email, username });
  const registerUser = await User.register(user, password);
  req.logIn(registerUser, (err) => {
    if (err) return next(err);
    req.flash("success", "welcome to yelpCamp");
    res.redirect("/campgrounds");
  });
});

router.get("/login", (req, res) => {
  res.render("./user/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "welcome back");
    res.redirect("/campgrounds");
  }
);
router.get("/logout", (req, res, next) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "sucessully logged out");
    res.redirect("/campgrounds");
  });
});

module.exports = router;
