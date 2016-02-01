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
                        'available': ['Monday', 'Tuesday'],
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

    setTimeout(matchingWithMongo, 3000);
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
            participants : req.user._id
          }, function(err, lunches){

                if(err)
                  res.send(err);

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


/*function matchingAlgorithm(){
  // populate daily pool
  var dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
   
  var today = new Date();
  var day = today.getDay();

  var userPool = [];

  function retrieveUserPool(weekday, callback) {

    User.find({ available : weekday }).sort({ blockedCount: -1, knownCount: 1 }).all( 
      function(err, users) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, users[0]);
          }
      });

  };

  retrieveUserPool(dayMap[day], function(err, user) {
  if (err) {
    console.log(err);
  }

      userPool = user;
  });

  // function checks if either of the users have blocked each other
  function userMutualBlock( user1, user2 ){

  }

  // returns number status to check is users are mutual friends or one way friends
  function userMutualFriends( user1, user2 ){

  }

  // returns array of users that aren't mutually blocked with the current user
  function findCompatible( user, userList ){

    var compatible = [];
    for(var i=0; i<userList.length; i++){
        if( !userMutualBlock(user, userList[i]) )
          compatible.push(userList[i]);
    }

    return compatible;

  }

  function findFriend( user, userList ){

    var two_way_friends = [];
    var one_way_friends = [];
    for(var i=0; i<userList.length; i++){

        if( userMutualFriends(user, userList[i]) == 1 )
          one_way_friends.push(userList[i]);
        else if( userMutualFriends(user, userList[i]) == 2 )
          two_way_friends.push(userList[i]);
    }

    return [ one_way_friends, two_way_friends ];
  }

  function findCompatibleCuisine( user, userList ){

  }

  var userNo = 0; 
  var pairs = [];
  while(userPool.length > 0){

    // extract most difficult user
    var user = userPool.splice(userNo, 1);

    // find compatible users from the remaining users
    var compatible = findCompatible(user, userPool);

    var friends = findFriend( user, compatible );
    // find friend of user
    var finalFriendList = friends[1].length ? friends[1] : friends[0];
    if(finalFriendList.length == 0)
        finalFriendList = compatible;  // all unknown to user

    if(compatible.length == 0)
      continue; // user discarded

    var cuisineCompatible = findCompatibleCuisine( user, finalFriendList );

    // if cuisineCompatible is a non zero set then select from cuisine compatible or go to finalfriendlist
    var pairMatePool = cuisineCompatible.concat(finalFriendList);  // redundancu to be solved

    var i=0;
    var pairmate; 
    var thirdMatePool = [];
    var pseudo = [];
    while( thirdMatePool.length == 0 && i < pairMatePool.length ){
      
      pairmate = pairMatePool[i];
      thirdMatePool = findCompatible( pairmate, compatible );



      i++;
    
    }

    if(thirdMatePool.length == 0)
      // no hope!
    else{
        // find friend for third mate compatible with the other two
        var i=0;
        var thirdmate; 
        var fourthMatePool = [];
        while( fourthMatePool.length == 0 && i < thirdMatePool.length ){
        
            thirdmate = thirdMatePool[i];
            fourthMatePool = findFriend( thirdmate, thirdMatePool );

            i++;
      
        }
        if(fourthMatePool.length == 0)
          // make group of three
        else

    }


    


    // remove pairmate from user pool
    
    // find compatible friends for the pair
    

    if(thirdMatePool.length == 0 )
      // no idea what to do then!
    else{}

}*/


function matchingWithMongo(){

  function findPairMatch( currPair, usedPairs ){
          
      var second;
      // find second mate
      Pair.find({
        'data': currPair.date,
        'ids': { $nin: [].concat(usedPairs.map(function(c){ return c._id })) },
        'ids': { $nin: currPair.blocked }, 
        'blocked': { $nin: currPair.ids },
        'cuisine': { $in: user.cuisine }
      }).sort({'blockedCount': -1, 'knownCount': 1}).exec(
          function(err, users){
              if(err) console.log(err);

              // this user matches everything
              if(users.length){
                second = users[0];
              }else{ 
                 Pair.find({
                        'data': currPair.date,
                        'ids': { $nin: [].concat(usedPairs.map(function(c){ return c._id })) },
                        'ids': { $nin: currPair.blocked }, 
                        'blocked': { $nin: currPair.ids }
                    }).sort({'blockedCount': -1, 'knownCount': 1}).exec(
                            function(err, users){
                              if(err) console.log(err);

                              // this user matches everything
                              if(users.length){
                                second = users[0];
                              }
                          })
                  }
          })

      return second; 
  }  

  function findPair( user, used ){
      
      var second;
      // find second mate
      User.find({
        _id: { $nin: used.map(function(c){ return c._id }) },
        _id: { $nin: user.blocked }, 
        blocked: { $not: user },
        _id: { $in: user.known },
        known: user._id, 
        cuisine: { $in: user.cuisine }
      }).sort({'blockedCount': -1, 'knownCount': 1}).exec(
          function(err, users){
              if(err) console.log(err);

              // this user matches everything
              if(users.length){
                second = users[0];
              }else{
                 
                 User.find({
                        '_id': { $nin: used.map(function(c){ return c._id }) },
                        '_id': { $nin: user.blocked }, 
                        'blocked': { $not: user },
                        '_id': { $in: user.known },
                        'known': user._id, 
                    }).sort({'blockedCount': -1, 'knownCount': 1}).exec(
                      function(err, users){
                          if(err) console.log(err);

                          // this user matches everything
                          if(users.length){
                            second = users[0];
                          }else{
                             User.find({
                                          '_id': { $nin: used.map(function(c){ return c._id }) },
                                          '_id': { $nin: user.blocked }, 
                                          'blocked': { $not: user },
                                          '_id': { $in: user.known },
                                        }).sort({'blockedCount': -1, 'knownCount': 1}).exec(
                                          function(err, users){
                                              if(err) console.log(err);

                                              // this user matches everything
                                              if(users.length){
                                                second = users[0];
                                              }else{
                                                 User.find({
                                                      '_id': { $nin: used.map(function(c){ return c._id }) },
                                                      '_id': { $nin: user.blocked }, 
                                                      'blocked': { $not: user },
                                                    }).sort({'blockedCount': -1, 'knownCount': 1}).exec(
                                                      function(err, users){
                                                          if(err) console.log(err);

                                                          // this user matches everything
                                                          if(users.length){
                                                            second = users[0];
                                                          }else{
                                                             console.log("no option for user");
                                                          }
                                                      }) 
                                              }
                                      }) 
                          }
                      }) 
              }
          }
      ) 

      return second; 
  }

  var dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
   
  var today = new Date();
  var day = today.getDay(); 

  var userPool = [];

  //use mongoose to get all available users in the database and populating userPool
  var message;
  User.find({
    available: dayMap[day]
  }).sort({'blockedCount':-1, 'knownCount':1}).exec(function(err, users){

        if(err)
          message = err;

        userPool = users;
       //console.log("userPool", users);

        // populating daily pool 
        DailyPool.remove( {}, function(err, results) {
        
              DailyPool.create({ 
                    date: Date(),
                    participants: userPool.map(function(c){ return c._id }) 
                  }, 
                  function (err, pool) {
                        if (err) return handleError(err);
                        // saved!
                        //console.log("daily pool populated", pool);
                        matching();
                        function matching(){
                            var used = [];
                            var pair = [];

                            //pairing
                            for(var userNo=0; userNo < userPool.length; userNo++){
                                
                                var user = userPool[userNo];
                                used.push(user);

                                var second = findPair(user, used);

                                if(second != undefined){
                                  used.push(second);
                                  pairs.push(user, second);
                                }
                            }

                            // create or find-update the pairs 
                            for(var pairNo=0; pairNo < pair.length; pairNo++){

                                var updatedData = {
                                  'date': Date(),
                                  'ids': [ pair[pairNo][0]._id,  pair[pairNo][1]._id],
                                  'cuisines': pair[pairNo][0].cuisine.concat( pair[pairNo][1].cuisine ),
                                  'blocked': pair[pairNo][0].blocked.concat( pair[pairNo][1].blocked ),
                                  'known': pair[pairNo][0].known.concat( pair[pairNo][1].known ),
                                }

                                Pair.create( updatedData,
                                              function(err, doc){
                                                    if (err) console.log("error:", err);

                                                    pair[pairNo] = doc;  // pair becomes an array of objects
                                              });
                            }

                            //remove matches for testing
                            Match.remove(function(err, results) {
                              // do something with results
                              console.log("removing matches");
                            });

                            console.log("pairs", pair);
                            var usedPair = [];
                            var secondPair;
                            for(var pairNo=0; pairNo < pair.length; pairNo++){

                                var currentPair = pair[pairNo];
                                usedPair.push(currentPair);

                                secondPair = findPairMatch( currentPair, usedPair );
                                if(secondPair != undefined){
                                  
                                  usedPair.push(secondPair);

                                  // find a location


                                  // create the match
                                  Match.create({
                                      date: Date(), 
                                      participants: currentPair.ids.concat(secondPair.ids),
                                      dropouts: [],
                                      location: "someRestaurant"
                                    }, function(err, doc){
                                          if(err) console.log("error:", err);

                                          console.log("Match Made!");

                                  })
                                
                                }
                            }
                          }
                  })   
        });
  });

}
