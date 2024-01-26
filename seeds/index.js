const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const axios = require("axios");
const morgan = require("morgan");
mongoose.connect("mongodb://127.0.0.1:27017/yelpCamp");

const sample = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const seedb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const randomCity = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20 + 1);
    const camp = new Campground({
      image: "https://source.unsplash.com/random",
      location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
      title: `${sample(places)} ${sample(descriptors)}`,
      price: price,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa laborum facilis ",
    });
    await camp.save();
  }
};

seedb().then(() => {
  mongoose.connection.close();
});
