const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
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
      author: "65c74fc816d8286b12524e60",
      image: [
        {
          url: "https://res.cloudinary.com/dbcm74bft/image/upload/v1707663576/yelpCamp/wetohmsadzbqiw7es7hm.png",
          filename: "yelpCamp/wetohmsadzbqiw7es7hm",
        },
        {
          url: "https://res.cloudinary.com/dbcm74bft/image/upload/v1707663576/yelpCamp/otn4kgvdn1fwftdylge1.jpg",
          filename: "yelpCamp/otn4kgvdn1fwftdylge1",
        },
        {
          url: "https://res.cloudinary.com/dbcm74bft/image/upload/v1707663583/yelpCamp/yjshx4wmvz0rke67ednu.jpg",
          filename: "yelpCamp/yjshx4wmvz0rke67ednu",
        },
      ],
      location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
      title: `${sample(places)} ${sample(descriptors)}`,
      price: price,
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa laborum facilis ",
    });
    await camp.save();
  }
};

seedb().then(() => {
  mongoose.connection.close();
});
