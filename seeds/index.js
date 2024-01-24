const mongoose = require('mongoose');
const Campground = require("../models/campground")
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp');





const sample = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
}

const seedb = async () => {
  await Campground.deleteMany({})
  for (let i=0 ; i < 50; i++){
    const randomCity = Math.floor((Math.random() * 1000));
    const camp = new Campground({
      location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
      title : `${sample(places)} ${sample(descriptors)}`
    })
    await camp.save();
  }
}


seedb().then(() => {
  mongoose.connection.close();
})