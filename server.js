var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient
var path = require('path');

var app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
var dburl = 'mongodb://localhost:27017/ass4';
var dbMortgage, dbEmployer, dbInsurance;
MongoClient.connect(dburl, function(err, db) {
  if (!err) {
    console.log("Connected successfully to database");
    dbMortgage = db.collection('mortgage');
    dbEmployer = db.collection('employer');
    dbInsurance = db.collection('insurance');
    require('./components/mortgage')(app, dbMortgage, '/mortgage');
    require('./components/employer')(app, dbEmployer, '/employer');
    require('./components/insurance')(app, dbInsurance, '/insurance');

  } else {
    console.log("Ensure that MongoDB is running on port 27017 before running server.js")
    process.exit(1);
  }
});

function logInfo(method, request) {
  log.info({'accessed': method, 'params': request.body, 'user-agent': request.headers['user-agent']});
}

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Listening on port %s", port);
});
