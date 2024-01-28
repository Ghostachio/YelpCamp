// setting up express and mongoose

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("../YelpCamp/models/campground");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

mongoose.connect("mongodb://127.0.0.1:27017/yelpCamp");

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

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

app.post("/campgrounds", async (req, res) => {
  const newCampground = new Campground(req.body);
  await newCampground.save();
  res.redirect("/campgrounds");
});

// individual Campground Page
app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/show", { campground });
});

// Updating/changing a selected Campground data
app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/edit", { campground });
});

app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body });
  res.redirect(`/campgrounds/${campground._id}`);
});

// Delete Campground
app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});

app.listen("3000", () => {
  console.log("connected to port 3000");
});
