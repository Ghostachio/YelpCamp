module.exports.isLoggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "you must be signed in");
    res.redirect("/login");
  }
  next();
};
