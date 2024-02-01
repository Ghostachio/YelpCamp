// setting up express and mongoose

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("../YelpCamp/models/campground");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const AppError = require("./utils/appError");
const Joi = require("joi");
const catchAsync = require("./utils/catchAsync");
const Review = require("./models/review");

mongoose.connect("mongodb://127.0.0.1:27017/yelpCamp");

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// validating Campgrounds Creation
const validateCampgrounds = (req, res, next) => {
  const campgroundSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
  }).required();
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new AppError(msg, 400);
  }
  next();
};

// validating Campgrounds Reviews
const validateReviews = (req, res, next) => {
  const validateSchema = Joi.object({
    body: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
  }).required();
  const { error } = validateSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new AppError(msg, 400);
  }
  next();
};

// setting index page
app.get("/", async (req, res) => {
  const campgroundData = await Campground.find({});
  res.render("home", { campgroundData });
});

// campgrounds List page
app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

// Create new Campground
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", validateCampgrounds, async (req, res, next) => {
  try {
    const newCampground = new Campground(req.body);
    await newCampground.save();
    res.redirect("/campgrounds");
  } catch (e) {
    next(e);
  }
});

// individual Campground Page
app.get("/campgrounds/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    res.render("campgrounds/show", { campground });
  } catch (e) {
    next(e);
  }
});

// Updating/changing a selected Campground data
app.get("/campgrounds/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
  } catch (e) {
    next(e);
  }
});

app.put("/campgrounds/:id", validateCampgrounds, async (req, res, next) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (e) {
    next(e);
  }
});

// Delete Campground
app.delete("/campgrounds/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  } catch (e) {
    next(e);
  }
});

app.post(
  "/campgrounds/:id/reviews",
  validateReviews,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new AppError("Page Not Found", 404));
});

// setting Error handlers
app.use((err, req, res, next) => {
  const { message = "something went wrong", status = 500 } = err;
  res.status(status).render("error", { message, status });
});

app.listen("3000", () => {
  console.log("connected to port 3000");
});
