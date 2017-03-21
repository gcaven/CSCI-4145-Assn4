module.exports = function(app, collection, prefix){

  var bcrypt = require('bcrypt');
  const saltRounds = 10;

  var request = require('request');

  app.get(prefix + "/check_login", function(req, res) {
    collection.find(
      {
        'loggedIn': true
      }
    ).toArray(function(err, result) {
      if (result.length != 1) {
        res.send({'loggedIn' : false});
      } else {
        result[0].password = undefined;
        res.send(result[0]);
      }
    })
  });

  app.get(prefix + "/logout", function(req, res) {
    collection.find(
      {
        'loggedIn' : true
      }
    ).toArray(function(err, result) {
      if (result.length == 0) {
        res.send({'error': 'No active user to logout.'});
      } else {
        collection.updateMany(
          { 'loggedIn' : true },
          { $set: { 'loggedIn' : false }},
          function(err, result) {
            if (err) {res.sendStatus(500); return;}
            return res.send(result);
          }
        );
      }
    });
  });

  app.post(prefix + "/register", function(req, res) {
    collection.find(
      {
        'policyNum' : req.body.policyNum
      }
    ).toArray(function(err, result) {
      if (err) {res.sendStatus(500); return;}
      if (result.length == 0) {
        let hash = bcrypt.hashSync(req.body.password, saltRounds);
        let registration = {
          'policyNum': req.body.policyNum,
          'password': hash,
          'lastname': req.body.lastname,
          'firstname': req.body.firstname,
          'value': req.body.value,
        };
        collection.insertOne(
          registration,
          function(err, result) {
            if (err) {res.sendStatus(500); return;}
            return res.send(result);
          }
        );
      } else {
        res.send({'error': 'Policy # is already in use.'});
      }
    });
  });

  app.post(prefix + "/login", function(req, res) {
    collection.find(
      {
        'policyNum' : req.body.policyNum
      }
    ).toArray(function(err, result) {
      if (result.length == 0) {
        res.send({'error': 'Incorrect employee ID or password.'});
      } else {
        let hash = result[0].password;
        if (bcrypt.compareSync(req.body.password, hash)) {
          collection.updateOne(
            { 'policyNum' : req.body.policyNum },
            { $set: { 'loggedIn' : true }},
            function(err, result) {
              if (err) {res.sendStatus(500); return;}
              return res.send(result);
            }
          );
        } else {
          res.send({'error': 'Incorrect employee ID or password.'});
        }
      }
    });
  });

  app.post(prefix + "/transfer_to_mortgage", function(req, res) {
    let appID = req.body.appID;
    collection.find(
      {
        'loggedIn' : true
      }
    ).toArray(function(err, result) {
      if (err) {res.sendStatus(500); return;}
      if (result.length == 0) {
        res.send({'error': 'No users are currently authenticated. Please login and try again.'});
      } else {
        //send AJAX to mortgage endpoint
        let userData = result[0];
        userData.appID = appID;
        delete userData._id;
        delete userData.loggedIn;
        delete userData.password;
        request(
          {
            uri: 'http://localhost:8081/mortgage/receive_from_insurance',
            method: 'POST',
            json: userData
          },
          function(error, response, body) {
            console.log(error);
            if (error) { res.send({'error': error})};
            res.send(body);
          }
        )
      }
    });
  });
}
