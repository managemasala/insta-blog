//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cloudinary = require('cloudinary').v2;
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");

cloudinary.config({
    cloud_name: process.env.NAME,
    api_key: process.env.KEY,
    api_secret: process.env.SECRET
  });

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(fileUpload());

mongoose.connect("mongodb+srv://nisarg:" + process.env.PASSWORD + "@cluster0-x2a77.mongodb.net/instaDB", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    image1: String,
    image1url: String,
    caption1: String,
    image2: String,
    image2url: String,
    caption2: String,
    comment: [String]
});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    User.find(function(err, found) {
        if(err) {
         res.send(err);
        } else {
          if(found) {
            res.send(found);
          } else {
            res.send("First Enter Your Stories");
          }
        }
    });
});

app.post("/", function(req, res) {

    const caption1 = req.body.caption1;
    const caption2 = req.body.caption2;

    var img1, img2;

    if(req.files.image1.mimetype && req.files.image2.mimetype == "image/png") {
        req.files.image1.mv("public/images/" + req.files.image1.md5 + ".png", function(err) {
            if(err) {
                res.send(err);
            } else {
        req.files.image2.mv("public/images/" + req.files.image2.md5 + ".png", function(err) {
            if(err) {
                res.send(err);
            } else {
                cloudinary.uploader.upload(__dirname + "/public/images/" + req.files.image1.md5 + ".png", { context: [caption1] } , function(err, result) {
                    if(err) {
                        res.send(err);
                    } else {
                        img1 = result.secure_url;
                        cloudinary.uploader.upload(__dirname + "/public/images/" + req.files.image2.md5 + ".png", { context: [caption2] } , function(err, result) {
                            if(err) {
                               res.send(err);
                            } else {
                                img2 = result.secure_url;
                                const user = new User({
                                    image1: req.files.image1.md5,
                                    image1url: img1,
                                    caption1: caption1,
                                    image2: req.files.image2.md5,
                                    image2url: img2,
                                    caption2: caption2
                                });
                                user.save(function(err) {
                                    if(err) {
                                       res.send(err);
                                    } else {
                                        res.send("saved successfully");
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
            }
        });
    } else {
        res.send("Please enter a png image");
    }
});

app.post("/comment", function(req, res) {
    User.findByIdAndUpdate(req.body.id, {$push: {comment: req.body.comment}}, function(err) {
        if(err) {
            res.send(err);
        } else {
            res.send("comment successfull");
        }
    });
});

app.listen(3000 || process.env.PORT, function() {
    console.log("server is running on port 3000.");
});
