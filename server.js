var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
var textSearch = require('mongoose-text-search');
var mongoose = require('mongoose');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/Adobe';

mongoose.connect(connectionString);

app.use(express.static(__dirname + '/'));

// -------------------------------------Schema----------------------------------- //

// Image Visualizer Schema
var ImageFinder = new mongoose.Schema({
    city: String,
    place: String,
    rating: Number,
    width: Number,
    height: Number,
    url: String,
    date: { type: Date, default: Date.now }
}, { collection: "Images" });

ImageFinder.plugin(textSearch);
ImageFinder.index({ place: 'text' });

var Image = mongoose.model("Image", ImageFinder);

// ----------------------------------- Fill DataBase -----------------------------------//

app.post("/api/uploadImage", function (req, res) {
    var json = req.body;
    console.log(json);
    Image.insertMany(json, function (err, data) {
        if (err)
            throw (err);
        else {
            res.sendStatus(200);
            console.log('Images saved');
        }
    });
});

// ----------------------------Images based on filtering ----------------------------------------- //

app.get("/api/getImages/filter/:page/:city/:place/:width/:height/:rating", function (req, res) {
    var index = ((req.params.page - 1) * 10);
    var queryCity = req.params.city;
    var queryPlace = req.params.place;
    var queryWidth = req.params.width;
    var queryHeight = req.params.height;
    var queryRating = req.params.rating;
    console.log(queryCity);
    console.log(queryPlace);
    console.log(queryWidth);
    console.log(queryHeight);
    console.log(queryRating);
    var query = Image.find({ 'city': { $regex: new RegExp('^' + queryCity + '$', "i") } });
    console.log(typeof queryPlace);
    if (queryPlace !== "*") {
        query.find({ $text: { $search: queryPlace } });
    }
    query.find({ 'width': { $gt: queryWidth } });
    query.find({ 'height': { $gt: queryHeight } });
    query.find({ 'rating': { $gt: queryRating } });
    query.skip(index);
    query.limit(10);
    query.exec(function (err, doc) {
        if (err)
            throw (err)
        else
            res.json(doc);
    });
});

// --------------------------------- Images based on city name ------------------------- //

app.get("/api/getImages/city/:city", function (req, res) {
    var queryCity = req.params.city;
    var query = Image.find({ 'city': { $regex: new RegExp('^' + queryCity + '$', "i") } });
    query.limit(10);
    query.exec(function (err, doc) {
        if (err)
            throw (err)
        else
            res.json(doc);
    });
});

// --------------------------------- Default Fetch Boston Images ----------------------- //

app.get("/api/getImages/:city", function (req, res) {
    var city = req.params.city;
    var query = Image.find({ 'city': city });
    query.limit(10);
    query.exec(function (err, doc) {
        if (err)
            throw (err)
        else
            res.json(doc);
    });
});

// -------------------------------- start server --------------------------------------- //

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 4000;

app.listen(port, ip);