// This file does the following
// Configures the application
// Connects to the database
// creates the mongoose models
// defines routes for the RESTful application
// define routes for the angular application
// set the app to list on a port so we can view it on the browser

// get scehemas
require('./models/user');
require('./models/match');
require('./models/restaurant');


// set up =====================================
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


// configuration ==============================
mongoose.connect('mongodb://127.0.0.1:27017/test');

var UserSchema = require('./models/user');
var RestaurantSchema = require('./models/restaurant');
var MatchSchema = require('./models/match');

var User = mongoose.model('User', UserSchema);
var Restaurant = mongoose.model('Restaurant', RestaurantSchema);
var Match = mongoose.model('Match', MatchSchema);

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));
app.use(methodOverride());

app.use(passport.initialize());
app.use(passport.session());
//app.use(app.router);

// populating
var populate = function(){
      // populating the model with the userDatabase
    dummyUsers = [{
        uid: 1, 
        name: "JamesPotter",
        title: "Senior Architect",
        phone: "902xx",
        tagline: "Prongs",
        picture: "http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg",
        cuisine: ["chinese"], 
        blocked: []
      },
      {
        uid: 2, 
        name: "SiriusBlack",
        title: "Junior Architect",
        phone: "902xx",
        tagline: "Padfoot",
        picture: "http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg",
        cuisine: ["italian"],
        blocked: []
      },
      {
        uid: 3, 
        name: "PeterPettigrew",
        title: "Finance",
        phone: "902xx",
        tagline: "Wormtail",
        picture: "http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg",
        cuisine: ["mexican"],
        blocked: []
      },
      {
        uid:4, 
        name: "AlbusDumbledore",
        title: "Director",
        phone: "902xx",
        tagline: "Phoenix",
        picture: "http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg",
        cuisine: ["indian"],
        blocked: []
      },
      {
        uid: 5, 
        name: "RemusLupin",
        title: "HR",
        phone: "902xx",
        tagline: "Moony",
        picture: "http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg",
        cuisine: ["thai"],
        blocked: []
      }
    ]

    dummyLunch = [
      {
        date: "date1" , 
        restaurant: "res1",
        participants: [1, 2, 5, 3]
      },
      {
        date: "date2" , 
        restaurant: "res2",
        participants: [5, 2, 4, 1]
      }
    ]

    for(var i=0; i<5; i++){

      // populating 5 dummy users
      User.create(
            {   
                'name': dummyUsers[i].name,
                'title': dummyUsers[i].title,
                'password': 'pass'
            }
            , function(err, user){

                if(err)
                  console.log(err);

                User.find(function(err, users){
                    
                    if(err)
                        console.log(err)

                    console.log(users);
                });
            });

    }

    console.log(dummyUsers.length + ' dummy users populated');
}
populate();

// routes ================

  app.post('/login',
    passport.authenticate('local', {
      successRedirect: '/loginSuccess',
      failureRedirect: '/loginFailure'
    })
  );

  app.get('/loginFailure', function(req, res, next) {
    res.send('Failed to authenticate');
  });

  app.get('/loginSuccess', function(req, res, next) {
    res.send('Successfully authenticated');
  });

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(new LocalStrategy(function(username, password, done) {
    process.nextTick(function() {
      User.find({
        'name': username, 
        }, function(err, user) {
              if (err) {
                return done(err);
              }

             if (!user) {
                return done(null, false);
              } 

              if (user.password != password) { 
                return done(null, false);
              }

              return done(null, user);
      });
    });
  }));

  //api -------------
  app.get('/api/users/:user_id', function(req, res){

      //use mongoose to get all users in the database
      User.find(function(err, users){

            if(err)
              res.send(err);

            console.log("hey there", users);
            res.json(users);

      });
   });

  app.get('/api/user_pref/:user_id', function(req, res){

      //use mongoose to get the particular user
      User.find({ 
        uid : req.params.user_id
      },function(err, user_details){

            if(err)
              res.send(err);

            res.json(user_details);
      });

   });

   // deleting a user
   app.delete('/api/users/:user_id', function(req, res){
      User.remove({
        _id : req.params
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

   // getting today's lunch match for a user
  app.get('/api/matches/:user_id', function(req, res){
      
      //use mongoose to get all lunches for this user in the database
      Match.find( { 
        participants : req.params.user_id
      }, function(err, lunches){

            if(err)
              res.send(err);

            res.json(lunches);

      });

   });


  app.get('*', function(req, res){
        res.sendFile('./public/index.html');
   });

// listen (start app with node app.js)

app.listen(8080);
console.log("App listening on port 8080");