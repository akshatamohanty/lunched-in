/* This file does the following
 * Configures the application
 * Connects to the database
 * creates the mongoose models
 * defines routes for the RESTful application
 * define routes for the angular application
 * set the app to list on a port so we can view it on the browser
 */

// GLOBAL VARIABLES
var primaryAdmin =  {   
                        name: 'Administrator',
                        username: 'admin@trylunchedin.com',
                        password: '123',
                        adminStatus: true
                    }

var cuisineList = [];

var test = function(){
  // loads the dummyUsers from the database
  var dummyUsers = require('./dummyUsers');
  console.log(dummyUsers.length, "users loaded.");
  
  // pre-process the user data - change to array etc
  for(var i=0; i<dummyUsers.length; i++){
      var user = dummyUsers[i]; 

      if(user.cuisine == 0)
        user.cuisine = [];
      else 
        user.cuisine = user.cuisine.replace(/\s/g, '').split(',');

      if(user.available == 0)
        user.available = [];
      else
        user.available = user.available.replace(/\s/g, '').split(',');

      user.available.push('Sunday');

      user.picture = "http://picture.com"

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
}


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
var DailyPoolSchema = require('./models/dailypool');
var PairSchema = require('./models/pair');
var MatchAlgorithmSchema = require('./models/matchAlgorithm');

var ObjectId = mongoose.Types.ObjectId;

var Admin = mongoose.model('Admin', AdminSchema);
var User = mongoose.model('User', UserSchema);
var Restaurant = mongoose.model('Restaurant', RestaurantSchema);
var Match = mongoose.model('Match', MatchSchema);
var DailyPool = mongoose.model('DailyPool', DailyPoolSchema);
var Pair = mongoose.model('Pair', PairSchema);
var MatchAlgorithm = mongoose.model('MatchAlgorithm', MatchAlgorithmSchema);

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



var initialize = function() {
    var dummyUser =  {   
                        name: 'Jane Doe',
                        email: 'janedoe@aedas.sg',
                        password: '123',
                        title: 'Senior Designer'
                    }
    clearDatabase( Admin, "Admin", addToDatabase( Admin, primaryAdmin, "Admin", null) );
    clearDatabase( User, "User", addToDatabase( User, dummyUser, "User", null) );
    clearDatabase( Restaurant, "Restaurants", null );
    clearDatabase( Match, "Matches", null);
    clearDatabase( MatchAlgorithm, "MatchAlgorithm", null);

}
initialize();
setTimeout(test, 5000);

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

        User.find({ 
                        'email' : username, //remember! virtuals can't be queried unless exposed!
                        'password' : password 
                      }, 
                        function(err, user) {

                            if (!err && user.length){
                              console.log("Found in User");
                              return done(null, user); 
                            }
                              

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
                                                done(null, false); 
                                          });
                       }); 
      }) 
  }));

  app.post('/login',
    passport.authenticate('local', { 
                                   successRedirect: '/',
                                   failureRedirect: '/#/lunches'
                                 })
  );

  app.get('/logout', function(req, res){
    req.logout();
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

  // deprecated - same as logged in user - delete this
/*  app.get('/api/user_pref', function(req, res){

      if(req.isAuthenticated())
        res.json(req.session.passport.user[0]);
      else{
        res.statusCode = 302;
      }

  });*/

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
  })

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

  })

  app.get('/api/runMatchAlgorithm', function(req, res){
      
      // only Admins can run the algorithm
      if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){
            matchingAlgorithm();
            res.send(true);
      }
      else{
        res.send('Request not authenticated');
      }
  })

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
                          console.log("Admin Request Approved: Sending complete data", restaurants);
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
                                 'email': req.body.email
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
                              function(){
                                console.log("Updated user details");
                              }
                    )

                    res.json("Success");   
          }
          else{
                  User.findOneAndUpdate(
                              { 
                                 "_id": new ObjectId(req.session.passport.user[0]._id)
                              }, 
                              {
                                  password: req.body.password, 
                                  picture: req.body.picture,  
                                  tagline: req.body.tagline, 
                                  cuisine: req.body.cuisine,
                                  available: req.body.available
                              }, 
                              { multi: false }, 
                              function(){
                                console.log("Updated loggedIn user details");
                              }
                    )


                    // update the logged in user
                    req.session.passport.user[0].password =  req.body.password;
                    req.session.passport.user[0].picture = req.body.picture;
                    req.session.passport.user[0].tagline = req.body.tagline; 
                    req.session.passport.user[0].cuisine = req.body.cuisine;
                    req.session.passport.user[0].available = req.body.available;

                    res.json(req.session.passport.user[0]._id);            
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

  app.get('/api/matchAlgorithmData', function(req, res){
      //
      // This authentication is important for every request to the API 
      //
      if(req.isAuthenticated() && req.session.passport.user[0].adminStatus){   //!! TODO: find if this is safe? I think there's a loophole - if req can be tampered around with
        
            // get mongoose to extract all users in the database
            MatchAlgorithm.find(function(err, algoInfo){

                    if(err)
                      res.send(err);

                    // if user is admin - send all information 
                    res.send(algoInfo);
            });

      } 
      else{
        res.send('Request not authenticated');
      }
  })
  // deprecated - same as edit_User - delete after configuring angular app
/*  app.post('/api/edit_mates', function(req, res){
      
      // authenticate the request - to ensure no one gets information without correct access rights
      if(req.isAuthenticated()){
        
          User.findOneAndUpdate(
                      { 
                         "_id": new ObjectId(req.session.passport.user[0]._id)
                      }, 
                      {
                          known: req.body.known, 
                          blocked: req.body.blocked,  
                      }, 
                      { multi: false }, 
                      function(){
                        console.log("Updated mate selection for the user"); 
                      }
            )

            // update the logged in user
            req.session.passport.user[0].known = req.body.known;
            req.session.passport.user[0].blocked = req.body.blocked;

            res.json(req.session.passport.user[0]._id);
      }

  });*/

  /********** Login logout functionality ************/
  app.get('/api/users/:email', function(req, res){
         
          User.find({
            'email': req.params.email
          }, function(err, user){ 

              if(user){
                res.json(true);
              }

              if(!user.length)
                res.json(false)

          });  

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
    var dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
     
    var today = new Date();
    var day = today.getDay();

    var matchAlgoData = {};
    matchAlgoData.time = today;
    matchAlgoData.poolCount = 0;
    matchAlgoData.matchCount = 0;

    User.find({ available : dayMap[day] })
        .sort({ blockedCount: -1, knownCount: 1 })
        .exec( function(err, userPool) {
          if (err) console.log("UserPoolRetrieval Failed! Error:", err);
          
          else {
                // Algorithm is run on the user pool
                //console.log("UserPool Count:", userPool.length);
                matchAlgoData.poolCount = userPool.length;
                matchAlgoData.count = 0;

                runAlgoOnPool( userPool ); 

                function runAlgoOnPool( userPool ){
                    while(userPool.length > 0){

                          //always at index 0 - because the first user is always removed; remove the first user
                          var currUser = userPool.splice(0, 1)[0]; 

                          // create a pool for second mate - which should be a close person to the current user
                          var pairMatePool = regroup( userPool, currUser, false ); 
                          var pairMatePool = pairMatePool[0].concat(pairMatePool[1]).concat(pairMatePool [2]); // ordered by priority

                          // if pairMatePool.length == 0 - no pair available - can't do anything - user has already been removed from the pool
                          if(pairMatePool.length == 0)
                            continue;

                          // picks the first mate in the given pool with compatible cuisine - or just picks the first person
                          var pairMate = pickNextMate( pairMatePool, currUser, false );
                          
                          // this will happen when no user can be selected such that a third user can be selected -
                          // in this case, better to discard the first user and continue
                          if(pairMate == undefined)
                            continue;

                          // this regrouping will give users compatible with both the selected users
                          // pairMatePool has to be reordered according to new user
                          // ordering of the pool is done to keep compatible people first
                          var thirdMatePool = regroup( pairMatePool, pairMate, false );
                          var thirdMatePool = thirdMatePool[2].concat(thirdMatePool[1]).concat(thirdMatePool[0]);

                          // pick a third person compatible with the second person - and matching his cuisine
                          // if no user with matching cuisine is found, pick first person who gives next pool length > 0
                          var thirdMate = pickNextMate( thirdMatePool, pairMate, false );

                          // this happens when no third user can give the next pool greater than 0 
                          // in this case, switch off pool length condition - pick a person with compatible cuisine
                          if(thirdMate == undefined){
                            thirdMate = pickNextMate( thirdMatePool, pairMate, true );
                            // create match of three people
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
                          removeFromPool( userPool, [currUser, pairMate, thirdMate, fourthMate]  )
                          
                          if(userPool.length == 0)
                            addToDatabase( MatchAlgorithm, matchAlgoData, "matchAlgorithm", null); 
                                
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
                        
                        var returnValue = false;

/*                        Restaurant.find({
                          //cuisine: { $in : user1.cuisine.concat(user2.cuisine) }
                        }, function(err, restaurant){
                           if(err) console.log(err);
                           
                           returnValue = true;
                        })*/
                        //console.log("cuisine compatible", true)
                        return true;
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
                            pairMate = matePool.splice(i, 1); // removes pairmate at the same time  
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
                          var restaurant = "";
                          Restaurant.find({
                              //cuisine: { $in : user1.cuisine.concat(user2.cuisine) }
                            }, function(err, res){
                               if(err) console.log(err);

                               else restaurant = res[0];
                          })

                          // create and add a match to the database
                          Match.create({
                            date: Date(),
                            participants: participants,
                            location: restaurant
                          }, function(err, doc){
                              if(err) console.log(err);

                              console.log("Match made");
                              matchAlgoData.matchCount++; //console.log("count", userPool.length);
                                
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

