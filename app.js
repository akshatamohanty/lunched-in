// This file does the following
// Configures the application
// Connects to the database
// creates the mongoose models
// defines routes for the RESTful application
// define routes for the angular application
// set the app to list on a port so we can view it on the browser

// get scehemas
/*require('./models/user');
require('./models/match');
require('./models/restaurant');
require('./models/dailypool');*/

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
// mongoose.connect('mongodb://127.0.0.1:27017/test');
/* 
 * Mongoose by default sets the auto_reconnect option to true.
 * We recommend setting socket options at both the server and replica set level.
 * We recommend a 30 second connection timeout because it allows for 
 * plenty of time in most operating environments.
 */
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };       
 
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/test', function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

//mongoose.connect(mongodbUri, options);
var conn = mongoose.connection;             
 
conn.on('error', console.error.bind(console, 'connection error:'));  

// listen (start app with node app.js)
conn.once('open', function() {
  // Wait for the database connection to establish, then start the app.   
                  
});
 
/***** ... ***/
var UserSchema = require('./models/user');
var RestaurantSchema = require('./models/restaurant');
var MatchSchema = require('./models/match');
var DailyPoolSchema = require('./models/dailypool');
var PairSchema = require('./models/pair');

var ObjectId = mongoose.Types.ObjectId;

var User = mongoose.model('User', UserSchema);
var Restaurant = mongoose.model('Restaurant', RestaurantSchema);
var Match = mongoose.model('Match', MatchSchema);
var DailyPool = mongoose.model('DailyPool', DailyPoolSchema);
var Pair = mongoose.model('Pair', PairSchema);

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
var populate = function() {

    // create a restaurant - for testing purpose - delete later
    Restaurant.remove({}, function(err, doc){
            if(err) console.log("error deleting restuarants", err);

            Restaurant.create({
              name: 'FoodCourt', 
              cuisine: [ 'Chinese', 'Thai', 'Indian' ]
            }, function(err, doc){
                if(err) console.log("error createing restuarant");

                console.log("restaurant created");
            })
    });

    Match.remove({}, function(err, doc){
      if(err) console.log("matches not removed", err);

      console.log("matches removed");
    });
    
    User.remove( {}, function(err, results) {
          
          console.log(results);

          for(var i=0; i<dUsers.length; i++){
              // populating 5 dummy users
              User.create(
                    {   
                        'name': dUsers[i].name,
                        'title': dUsers[i].title,
                        'password': 'pass',
                        'tagline': dUsers[i].tagline, 
                        'phone': '90123892',
                        'email': 'something@something.com',
                        'picture': dUsers[i].picture,
                        'available': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                        'cuisine': ['Chinese', 'Thai', 'Indian'],
                        'blocked': [],
                        'known': []
                    }
                    , function(err, user){

                        if(err)
                          console.log(err);

                    });

              }

            console.log(dUsers.length + ' dummy users populated');
        });

    // initial runnning
    setTimeout(matchingAlgorithm, 3000);
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

  app.get('/loginStatus', function(req, res){
      if(req.isAuthenticated())
        return true;
      else
        return false;
  });

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
      else{
        res.statusCode = 302;
      }
  });

  app.get('/api/user_pref', function(req, res){

      if(req.isAuthenticated())
        res.json(req.session.passport.user[0]);
      else{
        res.statusCode = 302;
      }

  });

   // getting today's lunch match for a user
  app.get('/api/matches', function(req, res){
      
      if(req.isAuthenticated()){ 
              //use mongoose to get all lunches for this user in the database
          Match.find( { 
            'participants._id': req.session.passport.user[0]._id
          }, function(err, lunches){

                if(err)
                  res.send(err);

                console.log("matches found:", lunches);
                res.json(lunches);

          });
      }

   });

  app.post('/api/edit_pref', function(req, res){

      if(req.isAuthenticated()){
        
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
                        console.log("updated from server!");
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
      else{
        res.statusCode = 302;
      }
  });

  app.post('/api/edit_mates', function(req, res){
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
                        console.log("updated from server!");
                      }
            )


            // update the logged in user
            req.session.passport.user[0].known = req.body.known;
            req.session.passport.user[0].blocked = req.body.blocked;

            res.json(req.session.passport.user[0]._id);
      }
      else{
        res.statusCode = 302;
      }
  });

  app.get('*', function(req, res){ console.log("unknown api")
        res.send('Error!');
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

    User.find({ available : dayMap[day] })
        .sort({ blockedCount: -1, knownCount: 1 })
        .exec( function(err, userPool) {
          if (err) console.log("UserPoolRetrieval Failed! Error:", err);
          
          else {
                // Algorithm is run on the user pool
                //console.log("UserPool Count:", userPool.length);
                
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
                          /*cuisine: { $in : user1.cuisine.concat(user2.cuisine) }*/
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

                          console.log("Match created");
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
  setInterval(matchingAlgorithm, 86400000);
