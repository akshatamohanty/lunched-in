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

// only for testing
var dUsers = require('./dummyUsers');
var dLunches = require('./dummyLunches');


// set up =====================================
var express = require('express');
var app = express();

var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var expressSession = require('express-session');
var cookieParser = require('cookie-parser'); // the session is stored in a cookie, so we use this to parse it


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

// use cookie parser and express session with proper resave etc - to get the session to work
app.use(cookieParser());
app.use(expressSession({
                  secret:'somesecrettokenhere',     
                  resave: true,
                  saveUninitialized: true
                }));

app.use(passport.initialize());
app.use(passport.session());

//app.use(app.router);


// set up database ==== only for testing === 
  var populate = function(){ console.log("adding");
    
    User.remove( {}, function(err, results) {
          
          console.log(results);

          for(var i=0; i<dUsers.length; i++){
              // populating 5 dummy users
              User.create(
                    {   
                        'name': dUsers[i].name,
                        'title': dUsers[i].title,
                        'password': 'pass'
                    }
                    , function(err, user){

                        if(err)
                          console.log(err);

                        User.find(function(err, users){
                            
                            if(err)
                                console.log(err)

                            //console.log(users);
                        });
                    });

              }

            console.log(dUsers.length + ' dummy users populated');
        });

  }
  populate();


// routes ================

  app.post('/login',
    passport.authenticate('local', {
      successRedirect: '/#/matches',
      failureRedirect: '/login'
    })
  );

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

                if (user[0].password != password) { 
                  return done(null, false);
                }

                return done(null, user);
        });
      });
  }));

  app.get('/logout', function(req, res){
    req.logOut();  //<- known problem - use the below instead
    //req.session.destroy()
    res.send('Loggedout');
  });

  //api -------------
  app.get('/api/users', function(req, res){

      if(req.isAuthenticated()){
        //use mongoose to get all users in the database
        User.find(function(err, users){

              if(err)
                res.send(err);

              res.json(users);

        });
      } 
      else
        res.send('Please login');
  });

  app.get('/api/user_pref', function(req, res){

      if(req.isAuthenticated())
        res.json(req.session.passport.user[0]);
      else
        res.send('Please login');

  });

   // getting today's lunch match for a user
  app.get('/api/matches', function(req, res){
      
      if(req.isAuthenticated()){
              //use mongoose to get all lunches for this user in the database
          Match.find( { 
            participants : req.user
          }, function(err, lunches){

                if(err)
                  res.send(err);

                res.json(lunches);

          });
      }
      else
        res.send('Please login');

   });


  app.get('*', function(req, res){ console.log("unknown api")
        res.send('unknown api');
  });

// listen (start app with node app.js)

app.listen(8080);
console.log("App listening on port 8080");