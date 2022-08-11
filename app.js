//Import packages
const express = require("express");
const mongodb = require("mongodb");
const morgan = require("morgan");
const ejs = require("ejs");
//Configure Express
const app = express();
app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.use(express.static("css"));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));
app.listen(8080);
//Configure MongoDB
const MongoClient = mongodb.MongoClient;
// Connection URL
const url = "mongodb://localhost:27017/";
//reference to the database (i.e. collection)
let db;
//Connect to mongoDB server
MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
  if (err) {
    console.log("Err  ", err);
  } else {
    console.log("Connected successfully to server");
    db = client.db("fit2095db");
  }
});

//Home - index.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});


//addbook page - addbook.html
app.get("/addbook",function(req,res){
    res.sendFile(__dirname + "/views/addbook.html");
});
// handler - addnewbook
app.post("/addnewbook", function (req, res) {
  let bookRecords = req.body;
  db.collection("books").insertOne({
    title: bookRecords.title,
    author: bookRecords.author,
    topic: bookRecords.topic,
    dateOfpublication: bookRecords.dateOfpublication,
    description: bookRecords.description
  });
  res.redirect("/getbooks"); // redirect the client to list books page
});
//List all books
app.get("/getbooks", function (req, res) {
  db.collection("books")
    .find({})
    .toArray(function (err, data) {
      res.render("listbooks", { booksDb: data });
    });
});
//Update book:
app.get("/updatebook", function (req, res) {
  res.sendFile(__dirname + "/views/updatebook.html");
});
//POST request: receive the details from the client and do the update
app.post("/updatebookdata", function (req, res) {
  let bookRecords = req.body;
  let filter = { title:bookRecords.titleold }; // need to update later
  let theUpdate = {
    $set: {
      title: bookRecords.titlenew,
      author: bookRecords.authornew,
      topic: bookRecords.topicnew,
      dateOfpublication: bookRecords.dateOfpublicationnew,
      description: bookRecords.descriptionnew
    },
  };
  db.collection("books").updateOne(filter, theUpdate);
  res.redirect("/getbooks"); // redirect the client to list books page
});
//Delete book:
app.get("/deletebook", function (req, res) {
  res.sendFile(__dirname + "/views/deletebook.html");
});
app.post("/deletebookRecord", function (req, res) {
  let bookRecords = req.body;
  let filter = { topic: bookRecords.topic };
  db.collection("books").deleteMany(filter);
  res.redirect("/getbooks"); // redirect the client to list books page
});

app.post("/deletebookRecordByDate", function (req, res) {
    let bookRecords = req.body;
    let filter = { dateOfpublication: {$lt: bookRecords.dateOfpublication} };
    db.collection("books").deleteMany(filter);
    res.redirect("/getbooks"); // redirect the client to list books page
  });

app.get("*",function(req,res){
    res.sendFile(__dirname + "/views/404.html");
})