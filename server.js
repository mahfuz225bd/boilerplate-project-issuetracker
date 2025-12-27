"use strict";

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const app = express();

/* FCC REQUIRED MIDDLEWARE */
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* MongoDB */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/* Static */
app.use("/public", express.static(process.cwd() + "/public"));

/* Pages */
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/:project/", (req, res) => {
  res.sendFile(process.cwd() + "/views/issue.html");
});

/* FCC Testing */
fccTestingRoutes(app);

/* API */
apiRoutes(app);

/* 404 */
app.use((req, res) => {
  res.status(404).type("text").send("Not Found");
});

/* Start */
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app;
