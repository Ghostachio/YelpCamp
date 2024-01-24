const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require("../YelpCamp/models/campground")

mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp');



const app = express();


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended : true}))




app.get('/', (req, res) => {
  res.render('home')
})

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', {campgrounds})
})

app.get('/campgrounds/:id', async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById({_id: id})
  res.render('campgrounds/show', {campground})

})


app.listen('3000', ()=> {
  console.log("connected to port 3000")
})