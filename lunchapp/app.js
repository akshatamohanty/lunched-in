// This file does the following
// Configures the application
// Connects to the database
// creates the mongoose models
// defines routes for the RESTful application
// define routes for the angular application
// set the app to list on a port so we can view it on the browser


// set up =====================================
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');


// configuration ==============================
mongoose.connect('mongodb://127.0.0.1:27017/data');


app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));
app.use(methodOverride());

// define model ========================
var User = mongoose.model('User', {
  name: String,
  tagline: String,
});

// routes ================

   //api -------------
   app.get('/api/users', function(req, res){

      //use mongoose to get all users in the database
      User.find(function(err, users){

            if(err)
              res.send(err);

            res.json(users);

      });
   })

   // creating a new user
   app.post('/api/users', function(req, res){

        User.create({
              name: req.body.text, 
        }, function(err, user){

            if(err)
              res.send(err);

            User.find(function(err, users){
                
                if(err)
                    res.send(err)

                res.json(users);
            });
        });
 });

   // deleting a user
   app.delete('/api/users/:user_id', function(req, res){
      User.remove({
        _id : req.params.user_id
      }, function( err, user ){
         if(err)
           res.send(err);

         User.find(function(err, users){
              if(err)
                res.send(err);

              res.join(users);
         });
      });
   });

   app.get('*', function(req, res){
        res.sendfile('./public/index.html');
   });

// listen (start app with node app.js)

app.listen(8080);
console.log("App listening on port 8080");