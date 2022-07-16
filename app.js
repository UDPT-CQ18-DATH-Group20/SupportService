var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");

var logger = require("morgan");
require("./db/db_mongo");
var reviewRouter = require("./routes/review");

var app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true  }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", reviewRouter);

module.exports = app;
