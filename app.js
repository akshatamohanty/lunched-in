/* This file does the following
 * Configures the application
 * Connects to the database
 * creates the mongoose models
 * defines routes for the RESTful application
 * define routes for the angular application
 * set the app to list on a port so we can view it on the browser
 */

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

var async = require('async');

var postmark = require("postmark");
var querystring = require("querystring");


// configuration ==============================
/* 
 * Mongoose by default sets the auto_reconnect option to true.
 * We recommend setting socket options at both the server and replica set level.
 * We recommend a 30 second connection timeout because it allows for 
 * plenty of time in most operating environments.
 */     
 
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/test', function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});


/***** Models Set-up ***/
var AdminSchema = require('./models/admin');
var UserSchema = require('./models/user');
var RestaurantSchema = require('./models/restaurant');
var MatchSchema = require('./models/match');

var ObjectId = mongoose.Types.ObjectId;

var Admin = mongoose.model('Admin', AdminSchema);
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



// set up database ==== only for testing === 
var clearDatabase = function( database, stringName, callback ){

  database.remove({}, function(err, doc){
        if(err) console.log("Error: ", stringName, " Database has not been reset. ", err);

        //console.log(stringName, " Database has been reset."); 

        if(callback)
          callback;   
    });

}

var addToDatabase = function( database, jsonObject, stringName, callback ){
    
    database.create( jsonObject, 
                  function(err, user){

                      if(err)
                        console.log("Error: Unable to add to ", stringName, err);

                      //console.log("Added to ", stringName);

                      if(callback)
                        callback;   
                  });
}


// GLOBAL VARIABLES
var primaryAdmin =  {   
                        name: 'Administrator',
                        username: 'admin@trylunchedin.com',
                        password: '123',
                        adminStatus: true
                    };

var run = 0; // keeps count of how many times the algorithm has run
var activePool = []; // TODO: Global variable - very risky - change later

var cuisineList = ['Chinese', 'Continental', 'Korean', 'Thai', 'Indian','Western', 'Vietnamese', 'Japanese'];

/* Adds the preliminary user details and restaurants */
var init = function(){
  // loads the dummyUsers from the database
  var dummyUsers = require('./finalUsers');
  console.log(dummyUsers.length, "users loaded.");
  
  // pre-process the user data - change to array etc
  for(var i=0; i<dummyUsers.length; i++){
      var user = dummyUsers[i]; 
      console.log(user.name);

      user.tagline="";
      user.nationality="";
      user.cuisine = []; // not enough - fix null values on client side
      user.available = [];
      user.veg = false;
      user.halal = false;
      user.lunchCount = 0;
      user.dropCount = 0;
      user.available = [];
      user.blocked = [];
      user.known = [];

      addToDatabase( User, user, "User", null);
  }

    // loads the dummyUsers from the database
  var dummyRestaurants = require('./dummyRestaurants');
  console.log(dummyRestaurants.length, "restaurants loaded.");
  
  // pre-process the user data - change to array etc
  for(var i=0; i<dummyRestaurants.length; i++){
      var restaurant = dummyRestaurants[i]; 

      if(restaurant.cuisine == 0)
        restaurant.cuisine = [];
      else 
        restaurant.cuisine = restaurant.cuisine.replace(/\s/g, '').split(',');

      addToDatabase( Restaurant, restaurant, "Restaurant", null);
  }


  // loads the restaurants from the database
  //matchingAlgorithm();
}

/* Clears all databases */
var initializeDatabases = function() {
    clearDatabase( Admin, "Admin", addToDatabase( Admin, primaryAdmin, "Admin", null) );
    clearDatabase( User, "User", null );
    clearDatabase( Restaurant, "Restaurants", null );
    clearDatabase( Match, "Matches", null);
}
//initializeDatabases();
//setTimeout(init, 5000); // initialize after 5 seconds so databases have been properly configured


/*
 *  Function will be called by match algorithm and related APIs
 *  Will - 1) Will analyse each match from previous run and perform addToKnown operation
 *       - 2) Will add to activePool
 *       - 3) Will run secondCall function after an allotted period of time
 *         4) secondCall will perform matching, mail users
 *  
 *
 */
var firstCall = function(){

  Match.find({ 
        run : run-1;
      }, function(err, users){

          if(err) console.log("Error fetching previous matches", err);

          // add to known for each match
  });

  var today = new Date();
  var day = today.getDay();

  // populate daily pool
  var dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var holidays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  activePool = [];

  User.find({ 
        available : dayMap[day]
      }, function(err, users){

          if(err) console.log("Error fetching pool", err);

          console.log("Pool length on", dayMap[day] + users.length);
          

          // mail users      - change to user length after testing
          for(var i=0; i<users.length; i++){

            var user=users[i];
            var client = new postmark.Client("32f51173-e5ee-4819-90aa-ad9c25c402a8");

            client.sendEmailWithTemplate({
              "From": "admin@trylunchedin.com",
              "To": "trylunchedin@gmail.com",
              "TemplateId": 588701,
              "TemplateModel": {
                "name": user.name,
                "action_url": "http://localhost:3000/api/addToPool?id=" + user.email,
                "sender_name": "Eva",
                "product_address_line1": "product_address_line1_Value",
                "product_address_line2": "product_address_line2_Value"
              }
            });

            console.info("Sent to postmark for delivery")           
          }
  });

  // call secondCall after some predetermined time

}; //firstCall();

var secondCall = function(){

  // deal with pool

  // match and mail

  // store matches

  run++;

};

// routes ================

  /*
   *
   * User Authentication
   *
   */


  passport.serializeUser(function(user, done) { 
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  //
  //  defining the passport local strategy for authenticating user
  //
  passport.use(new LocalStrategy(function(username, password, done) {
      process.nextTick(function() {
        console.log("passport");
        User.find({ 
                        'email' : username, //remember! virtuals can't be queried unless exposed!
                        'password' : password 
                      }, 
                        function(err, user) {

                            if (!err && user.length){
                              console.log("Found in User");
                              return done(null, user); 
                            }
                              
                            console.log("user not found");
                            // Find in Admin database if not found in users
                            Admin.find({ 
                                            'username' : username, 
                                            'password' : password 
                                          }, function(err, user) {
                                                

                                                if (!err && user.length){
                                                  console.log("Found in Admins");
                                                  return done(null, user); 
                                                }
                                                
                                                // fail! 
                                                console.log("user not found");
                                                done(null, false); 
                                          });
                       }); 
      }) 
  }));

  app.post('/login',
    passport.authenticate('local', { 
                                   successRedirect: '/',
                                   failureRedirect: '/'
                                 })
  );

  app.get('/logout', function(req, res){
    req.session.passport.user = undefined;
    //req.logout();
    res.send('/');
  });

  app.get('/api/getLoggedInUser', function(req, res){

      if(req.isAuthenticated()){
        res.json(req.session.passport.user[0]);       
      }
      else
        res.json(null);

  });

  /*
   * LunchApp APIs
   * 
   */

  //api -------------
  
  // Sends all the users in the database 
  app.get('/api/users', function(req, res){

      //
      // This authentication is important for every request to the API 
      //
      if(req.isAuthenticated()){   //!! TODO: find if this is safe? I think there's a loophole - if req can be tampered around with
        
            // get mongoose to extract all users in the database
            User.find(function(err, users){

                    if(err)
                      res.send(err);

                    // if user is admin - send all information 
                    if( req.session.passport.user[0].adminStatus ){
                          console.log("Admin Request Approved: Sending complete data", users);
                          res.json(users);
                    }
                    else{
                          console.log("Compressing Data");
                          var compressedUserData = users.map( function(user){
                               return {
                                      _id: user._id,
                                      name: user.name, 
                                      title: user.title, 
                                      picture: user.picture, 
                                      email: user.email, 
                                      phone: user.phone, 
                                      tagline: user.tagline, 
                                      nationality: user.nationality
                               }
                          })

                          res.json(compressedUserData);
                    }
            });

      } 
      else{
        res.send('Request not authenticated');
      }
  });

   // getting today's lunch match for a user
  app.get('/api/lunches', function(req, res){
      
      if(req.isAuthenticated()){   //!! TODO: find if this is safe? I think there's a loophole - if req can be tampered around with

            // if user is admin - send all information 
            if( req.session.passport.user[0].adminStatus ){

                  console.log("Admin Request Approved: Sending complete data of matches");
                  
                  Match.find( function(err, lunches){

                        if(err)
                          res.send(err);

                        res.send(lunches);

                  });
            }
            else{
                   
                  console.log("Single User detected");
                  //use mongoose to get all lunches for this user in the database
                  Match.find( { 
                    'participants._id': req.session.passport.user[0]._id
                  }, function(err, lunches){

                        if(err)
                          res.send(err);

                        console.log("Number of lunches found for user: ", lunches.length);
                        res.send(lunches);

                  });
            }
      } 
      else{
        res.send('Request not authenticated');
      }


  });

  app.get('/api/cuisines', function(req, res){
      
      // anyone who is authenticated can get the cuisinelist
      if( req.isAuthenticated() ){
            res.send(cuisineList);
      }
      else{
        res.send('Request not authenticated');
      }
  });

  // Admin Only APIs
  app.post('/api/addCuisine', function(req, res){

      // only Admins can add new users
      if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){

            // add a cuisine to the cuisine list if it doesn't exist already
            if(cuisineList.indexOf(req.body.cuisineName) == -1){
                cuisineList.push(req.body.cuisineName);
                console.log("New Cuisine:", req.body.cuisineName, "added.");
                console.log("All Cuisines:", cuisineList);
                res.send(cuisineList);
            }
            else
              console.log("Cuisine already exists!");

      }
      else{
        res.send('Request not authenticated');
      }

  });

  app.get('/api/runMatchAlgorithm', function(req, res){
      
      // only Admins can run the algorithm
      if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){
            matchingAlgorithm();
      }
      else{
        res.send('Request not authenticated');
      }
  })

  app.get('/api/firstcall', function(req, res){
      firstCall();
      // only Admins can run the algorithm
/*      if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){
            firstCall();
      }
      else{
        res.send('Request not authenticated');
      }*/
  })

  app.get('/api/today', function(req, res){
    res.send(activePool);
  });

  app.post('/api/addUser', function(req, res){

      // only Admins can add new users
      if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){

            // add only if no user with same email exists
            User.find({
              'email' : req.body.email
            }, function(err, user){

                if(err) console.log("Error while adding user", err);

                // user is always an array - remember this!
                if(user.length == 0)
                  addToDatabase( User, req.body, "User", null )
                
                res.send("Admin Request Approved: Added new user");

            })

      }
      else{
        res.send('Request not authenticated');
      }

  })

  app.post('/api/removeUser', function(req, res){

      // only Admins can delete users
      if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){

            // add only if no user with same email exists
            User.find({
              'email' : req.body.email
            })
            .remove( function(err, user){

                if(err) console.log("Error while deleting user", err);
                
                res.send("Admin Request Approved: Deleted User");

            }); 

      }
      else{
        res.send('Request not authenticated');
      }

  })

  app.get('/api/restaurants', function(req, res){
      //
      // This authentication is important for every request to the API 
      //
      if(req.isAuthenticated()){   //!! TODO: find if this is safe? I think there's a loophole - if req can be tampered around with
        
            // get mongoose to extract all users in the database
            Restaurant.find(function(err, restaurants){

                    if(err)
                      res.send(err);

                    // if user is admin - send all information 
                    if( req.session.passport.user[0].adminStatus ){
                          //console.log("Admin Request Approved: Sending complete data", restaurants);
                          res.json(restaurants);
                    }
            });

      } 
      else{
        res.send('Request not authenticated');
      }
  })

  app.post('/api/addRestaurant', function(req, res){
      // only Admins can add new users
      if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){

            // add only if no user with same email exists
            Restaurant.find({
              'code' : req.body.code
            }, function(err, restaurant){

                if(err) console.log("Error while adding restaurant", err);

                // user is always an array - remember this!
                if(restaurant.length == 0)
                  addToDatabase( Restaurant, req.body, "Restaurant", null )
                
                res.send("Admin Request Approved: Added new restaurant");

            })

      }
      else{
        res.send('Request not authenticated');
      }
  })

  app.post('/api/removeRestaurant', function(req, res){
      // only Admins can delete users
      if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){

            // add only if no user with same email exists
            Restaurant.find({
              'code' : req.body.code
            })
            .remove( function(err, user){

                if(err) console.log("Error while deleting restaurant", err);
                
                res.send("Admin Request Approved: Deleted Restaurant");

            }); 

      }
      else{
        res.send('Request not authenticated');
      }
  })

  // name changed from user_pref to edit_user - change in angular app - public
  app.post('/api/editUser', function(req, res){

      if(req.isAuthenticated()){
        
          // if user is admin - the body of the request will have email of the user which is to be updated
          if( req.session.passport.user[0].adminStatus ){

                  User.findOneAndUpdate(
                              { 
                                    email: req.body.email  // don't change to id - doesn't work!
                              }, 
                              {
                                    name: req.body.name, 
                                    password: req.body.password, 
                                    title: req.body.title, 
                                    picture: req.body.picture, 
                                    //email: req.body.email, 
                                    phone: req.body.phone, 
                                    tagline: req.body.tagline, 
                                    nationality: req.body.nationality,
                                    cuisine: req.body.cuisine,
                                    available: req.body.available,
                                    blocked: req.body.blocked,
                                    known: req.body.known
                              }, 
                              { multi: false }, 
                              function(err, user){
                                if(err) console.log(err);
                                else{
                                  console.log("Updated user details", user);
                                  res.json("Success");  
                                }
                              }
                    )
          }
          else{
                  console.log("request", req.body);
                  User.findOneAndUpdate(
                              { 
                                 "_id": new ObjectId(req.session.passport.user[0]._id)
                              }, 
                              {
                                  password: req.body.password, 
                                  phone: req.body.phone,  
                                  tagline: req.body.tagline, 
                                  nationality: req.body.nationality, 
                                  cuisine: req.body.cuisine,
                                  veg: req.body.veg,
                                  halal: req.body.halal,
                                  available: req.body.available, 
                                  blocked: req.body.blocked, 
                                  known: req.body.known
                              }, 
                              { multi: false }, 
                              function(){
                                  // update the current user
                                  req.session.passport.user[0].password =  req.body.password;
                                  req.session.passport.user[0].phone = req.body.phone;
                                  req.session.passport.user[0].tagline = req.body.tagline; 
                                  req.session.passport.user[0].nationality = req.body.nationality;
                                  req.session.passport.user[0].cuisine = req.body.cuisine;
                                  req.session.passport.user[0].veg = req.body.veg;
                                  req.session.passport.user[0].halal = req.body.halal;
                                  req.session.passport.user[0].available = req.body.available;
                                  req.session.passport.user[0].blocked = req.body.blocked;
                                  req.session.passport.user[0].known = req.body.known;

                                  res.json(req.session.passport.user[0]._id);  
                                  console.log("User update from User-Dashboard");  
                              }
                    )
          }
      }
  });

  // name changed from user_pref to edit_user - change in angular app - public
  app.post('/api/editRestaurant', function(req, res){

      if(req.isAuthenticated()){
        
          // if user is admin - the body of the request will have email of the user which is to be updated
          if( req.session.passport.user[0].adminStatus ){

                  User.findOneAndUpdate(
                              { 
                                 'code': req.body.code
                              }, 
                              {
                                  //code: { type: String, require: true},
                                  name: req.body.name, 
                                  address: req.body.address,
                                  cuisine: req.body.cuisine,
                                  scheduled: req.body.scheduled,
                                  total: req.body.total
                              }, 
                              { multi: false }, 
                              function(){
                                console.log("Updated restaurant details");
                              }
                    )

                    res.json("Successfully updated restaurant details");   
          }
      }
  });


  // email apis
  app.get('/api/addToPool', function(req, res){

      var qs = querystring.parse(req.url.split("?")[1]),
      id = qs.id; console.log(id);
      User.find({
              email : id
            }, function(err, user){

                if(err) console.log("Error while adding user to pool", err);
                else{
                  console.log(user);
                  if(user.length){
                    //check for duplicates
                    activePool.push(user[0]);
                    for(var i=0; i<activePool.length; i++){
                      var user_i = activePool[i];
                      if(user_i.email == id)
                        res.send("You are already signed up for today!");
                    }
                  } 
                  res.end("Added successfully.", activePool);
                }
            })      
  });

  app.post('/api/dropOut', function(req, res){
      
      var qs = querystring.parse(req.url.split("?")[1]),
      objectID = qs.id;
      matchID = qs.id;

    var qs = querystring.parse(req.url.split("?")[1]),
    id = qs.id; console.log(id);
    Match.find({
            _id : ObjectId(id)
          }, function(err, user){

              
          })    

  });

  app.post('/api/resetPassword', function(req, res){
          
          console.log(req.body);

          User.find({
            'email': req.body.email
          }, function(err, user){ 

              if(user){
                var password = user[0].password; 

                // send a mail with this password; 
                res.send("Email sent! Please check your email.");
                var postmark = require("postmark")(process.env.POSTMARK_API_TOKEN)

                postmark.send({
                    "From": "admin@trylunchedin.com",
                    "To": req.body.email,
                    "Subject": "Password Recovery - TryLunchedIn",
                    "TextBody": "Hello!",
                    "Tag": "password-recovery"
                }, function(error, success) {
                    if(error) {
                        console.error("Unable to send via postmark: " + error.message);
                       return;
                    }
                    console.info("Sent to postmark for delivery")
                });
              }

              if(!user.length)
                res.send("Sorry! This email is not registered with us.")

          });  
  });

  app.post('/signUp', function(req, res){
          
          console.log(req.body);

          User.find({
            'email': req.body.email
          }, function(err, user){ 

              if(user){
                res.send("Oops.. Looks like this email has already been registered with us.");

              if(!user.length){
                // send a mail with this password; 


                    var client = new postmark.Client("32f51173-e5ee-4819-90aa-ad9c25c402a8");

                    client.sendEmailWithTemplate({
                      "From": "admin@trylunchedin.com",
                      "To": req.body.email,
                      "TemplateId": 497903,
                      "TemplateModel": {
                        "product_name": "TryLunchedIn",
                        "username": req.body.email,
                        "action_url": "admin@trylunchedin.com",
                        "product_address_line1": "Singapore"
                      }
                    });

                    client.send({
                        "From": "admin@TryLunchedIn.com",
                        "To": "trylunchedin@gmail.com",
                        "Subject": "New Sign Up on TryLunchedIn",
                        "TextBody": req.body.email+" just signed up on TryLunchedIn!",
                        "Tag": "sign-up"
                        }, function(error, success) {
                        if(error) {
                            console.error("Unable to send via postmark: " + error.message);
                           return;
                        }
                        console.info("Sent to postmark for delivery")
                    });

                    console.info("Sent to postmark for delivery")
                }

                res.send("Thank you! Please check your inbox for a mail from us!")
              }
              
              

          });  
  });

  app.get('*', function(req, res){ 
        res.send('Sorry! We haven\'t written this API yet! Got a suggestion? Mail us at admin@trylunchedin.com!');
  });

  app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

  console.log("App listening on port 8080");    


  function matchingAlgorithm(){

    console.log("Matching");

    // populate daily pool
    var dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var holidays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
     
     
    var today = new Date();
    var day = today.getDay();

    var poolCount = 0;
    var currMatches = [];
    var matchedCount = [];

    User.find({ available : dayMap[day] })
        .sort({ blockedCount: -1, knownCount: 1 })
        .exec( function(err, userPool) {
          if (err) console.log("UserPoolRetrieval Failed! Error:", err);
          
          else {
                // Algorithm is run on the user pool
                //console.log("UserPool Count:", userPool.length);
                poolCount = userPool.length;
                //matchAlgoData.count = 0;

                runAlgoOnPool( userPool ); 

                    function runAlgoOnPool( userPool ){
                    while(userPool.length > 0){

                          //always at index 0 - because the first user is always removed; remove the first user
                          //console.log("UserPool Length at", userPool.length);
                          var currUser = userPool.splice(0, 1)[0]; // removes from the userPool also
                          
                          //console.log("Starting with", currUser.name);

                          // create a pool for second mate - which should be a close person to the current user
                          var pairMatePool = regroup( userPool, currUser, false ); 
                          var pairMatePool = pairMatePool[0].concat(pairMatePool[1]).concat(pairMatePool [2]); // ordered by priority
                          //console.log("Found pairmate pool of length", pairMatePool.length);
                          // if pairMatePool.length == 0 - no pair available - can't do anything - user has already been removed from the pool
                          if(pairMatePool.length == 0){
                              console.log("Match not found for", currUser.name);
                              continue;                            
                          }


                          // picks the first mate in the given pool with compatible cuisine - or just picks the first person
                          var pairMate = pickNextMate( pairMatePool, currUser, false );
                          
                          // this will happen when no user can be selected such that a third user can be selected -
                          // in this case, better to discard the first user and continue
                          if(pairMate == undefined){
                              console.log("Match not found for", currUser.name);
                              continue;
                          }
                            

                          // this regrouping will give users compatible with both the selected users
                          // pairMatePool has to be reordered according to new user
                          // ordering of the pool is done to keep compatible people first
                          var thirdMatePool = regroup( pairMatePool, pairMate, false );
                          var thirdMatePool = thirdMatePool[2].concat(thirdMatePool[1]).concat(thirdMatePool[0]);
                          //console.log("Pool of third mate for", currUser.name, "and", pairMate.name, "of length", thirdMatePool.length);

                          // pick a third person compatible with the second person - and matching his cuisine
                          // if no user with matching cuisine is found, pick first person who gives next pool length > 0
                          var thirdMate = pickNextMate( thirdMatePool, pairMate, false );
                          //console.log("Found mate for", currUser.name, "and", pairMate.name, "in", thirdMate.name || 'none');

                          // this happens when no third user can give the next pool greater than 0 
                          // in this case, switch off pool length condition - pick a person with compatible cuisine
                          if(thirdMate == undefined){
                            thirdMate = pickNextMate( thirdMatePool, pairMate, true );
                            // create match of three people
                            if(thirdMate == undefined)
                              console.log("No third mate found");

                            addMatch( [currUser, pairMate, thirdMate] );
                            // remove the three people from the userpool
                            removeFromPool( userPool, [currUser, pairMate, thirdMate]  )

                            continue;
                          }

                          // third mate pool is acceptable to both first and second user - fourth mate pool removes
                          // blocked users for third mate also - ordered with best friend for third mate first
                          var fourthMatePool = regroup( thirdMatePool, thirdMate, false );
                          var fourthMatePool = fourthMatePool[0].concat(fourthMatePool[1]).concat(fourthMatePool[2]);
                          var fourthMate = pickNextMate( fourthMatePool, thirdMate, true );  // switch off next pool length

                          // make match of four people
                          addMatch( [currUser, pairMate, thirdMate, fourthMate] );                        
                          
                          // remove the four people from the user pool
                          //console.log("pool length before removal", userPool.length);
                          removeFromPool( userPool, [pairMate, thirdMate, fourthMate]  )
                          
/*                          if(userPool.length == 0)
                            addToDatabase( MatchAlgorithm, matchAlgoData, "matchAlgorithm", null); */
                                
                    } //while end

                    // takes in two users 
                    // returns true if either of the users have blocked each other
                    // returns false if none of the users have blocked each other
                    function userMutualBlock( user1, user2 ){
                      
                      // check if user1.id is present in user2 block list
                      if( user2.blocked.indexOf(user1._id) > -1 ||  user1.blocked.indexOf(user2._id) > -1 )
                        return true;
                      
                      return false; 
                    }

                    // returns the connection between two users
                    // in 0, 1, 2 form
                    function userMutualFriends( user1, user2){
                      // check if user1.id is present in user2 block list
                      return (user2.known.indexOf(user1._id)>-1) + (user1.known.indexOf(user2._id)>-1) +0; 
                    }

                    // returns true if the users have atleast one common cuisine
                    // later -> or equivalent cuisine - can find restaurant serving atleast one of each
                    function userCuisineCompatible( user1, user2 ){
                        
                        Restaurant.find({
                          $and: [ { cuisine: { $in: user1.cuisine } }, 
                                  { cuisine: { $in: user2.cuisine } },
                                  { veg: user1.veg || user2.veg },
                                  { halal: user1.halal || user2.halal },
                                ]  
                        }, function(err, restaurant){
                           if(err){
                             console.log(err);
                             return false;
                           } 
                           
                           return true;
                        })
                        //console.log("cuisine compatible", returnValue)
                        //return returnValue;
                    }


                    // takes in a user pool and a current user - divides the group into three layers 
                    // length - returns only length of the compatible pool
                    // returns a divided pool of all unblocked users for the given current user
                    function regroup( userPool, currUser, length ){
                        
                        var oneWayPool = [];
                        var twoWayPool = [];
                        var compatible = [];

                        for(var i=0; i<userPool.length; i++){
                            // if either of the people have blocked, skip the user
                            if( userMutualBlock( currUser, userPool[i] ))
                              continue;

                            // categorize according to compatibility
                            switch( userMutualFriends( currUser, userPool[i] ) ) {
                                case 0:
                                    compatible.push( userPool[i] )
                                    break;
                                case 1:
                                    oneWayPool.push( userPool[i] )
                                    break;
                                case 2:
                                    twoWayPool.push( userPool[i] )
                            } // switch end
                        } // for-compatibility end

                        if(!length)
                          return [twoWayPool, oneWayPool, compatible]
                        else
                          return twoWayPool.length + oneWayPool.length + compatible.length;                         
                    }


                    // takes a pool and a current user and finds person from the pool with which the given user is cuisine compatible
                    // and compatible pool for both these users has length more than 1
                    // incase of no cuisine compatibility - the first user or user with next compatible pool length > 1 is selected
                    // and returned
                    // the matePool is ordered accordin to priority - two way first or compatible first etc
                    function pickNextMate(  matePool, currUser, poolLengthOFF  ){
                      // pick the first that has compatible cuisine
                      var pairMate; 
                      for(var i=0; i<matePool.length; i++){

                          // if the from the mate pool is cuisine compatible and the next pool with both these has length > 0
                          if( userCuisineCompatible( currUser, matePool[i] ) 
                                && ( poolLengthOFF || regroup( matePool, matePool[i], true ) ) ){ 
                            pairMate = matePool.splice(i, 1)[0]; // removes pairmate at the same time                     
                            break;
                          }
                      }
                     
                      // if no one is cuisine compatible, just pick best friend
                      if(pairMate == undefined){
                        var i=0;
                        while(i < matePool.length){
                          if(poolLengthOFF || regroup( matePool, matePool[i], true )){ 
                            pairMate = matePool.splice(i, 1)[0]; // removes pairmate at the same time  
                            //console.log("No one cuisine compatible, pairmate selected", pairMate.name || "none");
                            break;
                          }
                          i++;               
                        }
                      }

                      return pairMate;
                    }

                    // adds the required match
                    function addMatch( participants ){
                    
                          // find a matching restaurant
                          //factor in veg and halal
                          console.log(participants[participants.length-1].cuisine);
                          Restaurant.find({
                               $and: [ { cuisine: { $in: participants[0].cuisine } }, 
                                        { cuisine: { $in: participants[1].cuisine } },
                                        { cuisine: { $in: participants[2].cuisine } },
                                        { cuisine: { $in: (participants[3].cuisine || []) } },
                                        { veg: (participants[0].veg || participants[1].veg || participants[2].veg || (participants[3].veg || 0) )},
                                        { halal: (participants[0].halal || participants[1].halal || participants[2].halal || (participants[3].halal || 0) ) },
                                      ]  
                            }, function(err, res){
                               if(err) console.log(err);

                               else {
                                        // increase lunchcount of users

                                        // add users to known 

                                        // create and add a match to the database
                                        if (res[0] == undefined)
                                          res[0] = {'name' : 'Foodcourt'};
                                        var newMatch =                                           
                                          {
                                            'batch': algoRuns,
                                            'batchSize': poolCount,
                                            'date': Date(),
                                            'participants': participants,
                                            'location': res[0]
                                          };
                                          currMatches.push(newMatch);


                                        Match.create(
                                          newMatch
                                        , function(err, doc){
                                            if(err) console.log(err);

                                            console.log("Match");
                                              
                                        })
                                      }
                              })
                    } 

                    // removes the users from the pool
                    function removeFromPool( userPool, participants ){
                      for(var i=0; i<participants.length; i++){
                        var index = userPool.indexOf(participants[i]); 
                        userPool.splice(index, 1);
                      }
                    }    
                } // end of runAlgoOnPool
          }
    });


  } // matchingAlgo end


  //calling the matching algorithm every 5 seconds
  //setInterval(matchingAlgorithm, 43200000);

