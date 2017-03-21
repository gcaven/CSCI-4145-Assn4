module.exports = function(app, collection, prefix){

  var ObjectId = require('mongodb').ObjectID;

  app.post(prefix + "/new_application", function(req,res) {
    var application = {
      'lastname': req.body.lastname,
      'firstname': req.body.firstname,
      'phone': req.body.phone,
      'address': req.body.address,
      'employer': req.body.employer,
      'insurance': req.body.insurance,
      'employerInfo': {},
      'insuranceInfo': {}
    };
    collection.insertOne(
    application,
    function(err, result) {
      if (err) {
        return res.sendStatus(500);
      } else {
        result.result['_id'] = application._id;
        return res.send(result.result);
      }
    });
  });

  app.post(prefix + "/retrieve_application", function(req, res) {
    collection.find(
      {
        '_id': new ObjectId(req.body._id)
      }
    ).toArray(function(err, result) {
      if (err) {res.sendStatus(500); return;}
      if (result.length == 0) {
        res.send({'error': 'This ID is not associated with any active applications.'});
      } else {
        res.send(result[0]);
      }
    });
  });

  app.post(prefix + "/receive_from_employer", function(req, res) {
    let appID = new ObjectId(req.body.appID);
    delete req.body.appID;
    collection.find(
      {
        '_id': appID
      }
    ).toArray(function(err, result) {
      if (err) {res.sendStatus(500); return;}
      if (result.length == 0) {
        res.send({'error': 'This ID is not associated with any active applications.'});
      } else {
        collection.updateOne(
          { '_id': appID },
          { $set: { 'employerInfo' : req.body }},
          function(err, result) {
            if (err) {res.sendStatus(500); return;}
            return res.send(result);
          }
        );
      }
    });
  });

  app.post(prefix + "/receive_from_insurance", function(req, res) {
    let appID = new ObjectId(req.body.appID);
    delete req.body.appID;
    collection.find(
      {
        '_id': appID
      }
    ).toArray(function(err, result) {
      if (err) {res.sendStatus(500); return;}
      if (result.length == 0) {
        res.send({'error': 'This ID is not associated with any active applications.'});
      } else {
        collection.updateOne(
          { '_id': appID },
          { $set: { 'insuranceInfo' : req.body }},
          function(err, result) {
            if (err) {res.sendStatus(500); return;}
            return res.send(result);
          }
        );
      }
    });
  });

}
