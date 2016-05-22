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

var schedule = require('node-schedule'); 


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

// General Functions
//
//

var clearDatabase = function( database, stringName, callback ){

  database.remove({}, function(err, doc){
        if(err) console.log("Error: ", stringName, " Database has not been reset. ", err);

        //console.log(stringName, " Database has been reset."); 

        if(callback)
          callback;   
    });

};

var addToDatabase = function( database, jsonObject, stringName, callback ){
    
    database.create( jsonObject, 
                  function(err, user){

                      if(err)
                        console.log("Error: Unable to add to ", stringName, err);

                      console.log("Added ", stringName);

                      if(callback)
                        callback;   
                  });
};


// GLOBAL Variables and Functions for LunchedIn
//
//

// GLOBAL VARIABLES
var cuisineList = ['American', 'Australian', 'Chinese', 'French', 'Fusion', 'German', 'Indian', 'Indonesian', 'International', 
                  'Italian', 'Japanese', 'Korean', 'Malay', 'Mexican', 'Pernakan', 'Russian', 'Salads', 'Singaporean', 'Spanish', 
                  'Thai', 'Vietnamese', 'Western'];

var lunchedin = {};

lunchedin.production = true; 
lunchedin.speedrun = false;

lunchedin.run;  // intialized in the firstCall function
lunchedin.discardedUsers = [];

//- If set to true, mailing functionality is activated
lunchedin.mails = false; 

//- Keeps calling all three functions automatically after set times, if set to true
//- Set to true, for production
//lunchedin.autorun = false;

//- First Call : 
//    Mails everyone to join the pool
//    Adds people who have marked that day (deprecated functionality)
//lunchedin.timeToFirstCall = 300000; // 5minutes - ThirdCall to FirstCall Gap

//- Second Call : 
//    Runs matching algorithm
//    Sends mails to matches
lunchedin.timeToSecondCall = 20000; // 2 minutes - FirstCall to SecondCall Gap

//- Third Call : 
//    Goes through the matches for today and incase of dropouts, mails the concerned people
//    Increases lunchedCount of people
//    Increases restaurantCount of restaurant
//    AddsToKnown 
lunchedin.timeToThirdCall = 30000; // 3 minutes - SecondCall to ThirdCall Gap

lunchedin.timeForDiscardedUsers_speedrun = 20000; 
lunchedin.timeForDiscardedUsers_normal = 900000;

lunchedin.timeToMail_speedrun = 20000; 
lunchedin.timeToMail_normal = 1200000;
 

/*
 *  Returns true if today is a holiday, else returns false
 *  
 */
lunchedin.checkHoliday = function(date){

  var today = date; 
  // check for saturday - sunday
  if(date == null)
    today = new Date();

  if(today.getDay() == 6 || today.getDay() == 0) 
    return true;

  // check for other holidays
  var holidays = [ {'date': 21, 'month': 4}, // vesak
                   {'date': 6, 'month': 6}, // hari raya puasa
                   {'date': 9, 'month': 7}, // national day
                   {'date': 12, 'month': 8}, // hari raya haji
                   {'date': 29, 'month': 9}, // diwali 
                   {'date': 26, 'month': 11}  // christmas
                ];

  for(holiday in holidays){

      if( holidays[holiday].date == today.getDate() && holidays[holiday].month == today.getMonth() )
        return true;
  }

  return false;
}

/*
 *  Returns the last run value as inferred from the Matches
 *  
 */
lunchedin.getLastRun = function(){

  // Finding all because this is faster than aggregation
/*  Match.find({})
        .sort({ run: -1 })
        .exec( function(err, matches) {

          console.log("-----------Getting last run count---------------")
          if(matches.length == 0){
            console.log("No matches in database. First run!");
            return 0;
          }
          else{
            console.log("Found past matches for run ", matches[0].run)
            return matches[0].run; 
          }
  });*/
    console.log("This shouldn't be called!");

}

lunchedin.getFirstName = function(user_name){
  try{
    return user_name.split(" ")[0]
  }catch(e){
    console.log("Error getting first name", e);
    return user_name;
  }

}

/*
 *  Adds a new user to the database and send him / her an invite
 *  Autogenerates a password
 */
lunchedin.addUser = function(user){

      if( user.name != undefined && user.email != undefined){
        user.lunchCount = 0;
        user.dropCount = 0;
        user.veg = false; 
        user.halal = false;
        if(user.gender == 0)
          user.picture = 'http://res.cloudinary.com/hzif3kbk7/image/upload/c_scale,h_200,w_200/v1463920100/misc/head-659651_960_720.png';
        else if(user.gender == 1)
          user.picture = 'http://res.cloudinary.com/hzif3kbk7/image/upload/c_scale,h_200,w_200/v1463920003/misc/lady-31217_960_720.png';
        else
          user.picture = 'http://placehold.it/200x200';

        user.password = Math.round((Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))).toString(36).slice(1);
        addToDatabase( User, user, "User", null);
        lunchedin.firstMail( user );
      }

};

/*
 *  Adds a user to current pool only if no matches have been made for that run
 *  
 */
lunchedin.addToPool = function( runCount, userID ){

  Match.find({ run: runCount }, function(err, matches){

      if(matches != undefined && matches.length>0){
        console.log("Matches found for run ", runCount);
        // - Means the algorithm has already run for that time - can't add to pool - what if there were no matches for that run?
        return false; 
      }
      else{
        
        console.log("Matches not found for run ", runCount);
        User.find({ _id: ObjectId(userID) }, function(err, users){

            if(users.length){
              users[0].inPool = true; 
              users[0].save();
              console.log(users[0].name, " added to pool");
            }
        })
        return true; 
      }
  });
};

/*
 *  General function to send any mail to any user
 *  
 */
lunchedin.sendMail = function( templateID, templateModel, user_email ){

    if(!lunchedin.mails)
      return;

    var client = new postmark.Client("32f51173-e5ee-4819-90aa-ad9c25c402a8");

    client.sendEmailWithTemplate({
            "From": "eva@trylunchedin.com",
            "To": user_email,
            "TemplateId": templateID,
            "TemplateModel": templateModel 
    });
};

/*
 *  Invitation Mail
 *  
 */
lunchedin.firstMail = function( user ){

    var templateID = 497903;
    var templateModel = {
              "user_name": lunchedin.getFirstName(user.name),
              "user_email": user.email,
              "user_password": user.password,
            }
    console.log("Sending first mail to", user.name);
    lunchedin.sendMail( templateID, templateModel, user.email)

};

/*
 *  Morning mail - which asks user to join the pool
 *  
 */
lunchedin.confirmationMail = function( user ){

    var templateID = 609621;
    var opening_paraOpts = [ 'Say it like Yoda: Bad morning, it is not!', 
                             'Good Morning. Hope you\'ve had a great beginning to the day.', 
                             'Top of the Morning to ya! In case you\'re wondering, no, I\'m not Irish :-)',
                             'Good Morning! Hope you\'ve had a productive day so far' ];
    var middle_paraOpts = [
                            'It will be lunch soon. How about a great lunch while meeting some awesome'
                            + ' colleagues? All you have to do is simple click the green button to confirm'
                            + ' your availability. You have until 11.30 AM to do so. If you are caught up'
                            + ' with other things and cannot make it today, no worries, ignore this email :-)', 
                            
                            'Will you be interested to join your colleagues for lunch over your favourite'
                            + ' cuisine at a nearby restaurant? Then, it\'s very simple. Just click the'
                            + ' green button before 11.30 PM and confirm your availability. But if you cannot'
                            + ' make it today, it\'s alright, just ignore this email :-)' , 
                            
                            'Already feeling hungry? Me too :-) How about I arrange an awesome lunch'
                            + ' for you with your colleagues? If you like it, all you have to do is simple click the' 
                            + ' green button to confirm your availability. If you are not in the mood today, it\'s OK,' 
                            + ' simply ignore this email and I will understand :-)',

                            'Game for an awesome lunch? You have until 11.30 PM to confirm your'
                            + ' availability for today\'s lunch rendezvous. You can do so by simply'
                            + ' clicking the green button. If you cannot make it, ignore this email'
                            + ' and I will understand.'
                          ];

    var closing_paraOpts = [
                              'Excited to schedule your lunch meeting today.', 
                              'Excited to help you meet new people and expand your network.', 
                              'Eager to surprise you with an awesome lunch.', 
                              'Looking forward to surprise you with all the good food in your area.',
                              'Looking forward to schedule your lunch meeting today.'
                          ];

    var templateModel = {
              "user_name": lunchedin.getFirstName(user.name),
              "addToPool_url": "http://www.trylunchedin.com/api/addToPool?id=" + user._id,
              "opening_para": opening_paraOpts[Math.floor(Math.random() * opening_paraOpts.length)],
              "middle_para": middle_paraOpts[Math.floor(Math.random() * middle_paraOpts.length)], 
              "closing_para": closing_paraOpts[Math.floor(Math.random() * closing_paraOpts.length)]
            }
    
    console.log("Confirmation Mail sent to ", user.name);
    lunchedin.sendMail( templateID, templateModel, user.email)

};

/*
 *  Matched Mail
 *  
 */
lunchedin.matchedMail = function( match, user ){

    if(match==undefined || user == undefined)
      return; 

    var templateID = 610803;

    
    var today = new Date(); 

    // Configuring the template model
    var template = {};

    template.user_name = lunchedin.getFirstName(user.name);
    template.picture = user.picture;
    //api / dropOut?participant=object_id&match=match_id
    template.dropoutURL = "http://www.trylunchedin.com/api/dropOut?participant=" 
                                  + user._id 
                                  + "&match=" + match._id;
    //console.log(match);
    template.where = {};
    template.where.rest_name = match.location.name;
    template.where.address = match.location.address; 
    template.where.cuisine = match.location.cuisine; 
    template.where.website = match.location.website;
    if(restaurants[0].zip.length == 5)
      restaurants[0].zip = '0' + restaurants[0].zip;
    template.where.directionURL = "https://www.google.com.sg/maps/dir/Singapore+" + match.location.zip + "/";  
    // api / blockRestaurant?user=objectid&block=email
    // TODO - make these into functions to construct the string
    template.where.blockString = "http://www.trylunchedin.com/api/blockRestaurant?user=" 
                                  + user._id 
                                  + "&block=" + match.location._id;

    template.when = (new Date()).toDateString().substr(4);  // May 15 2016
    
    template.people = [];
    User.find( { 
                  _id: {$in: match.participants}
                }, function(err, participants){

                    if(participants != undefined && participants.length > 0){
                      for( p in participants ){


                          var pObj = {};

                          var participant = participants[p]; 

                          if(participant.email == user.email)
                              continue;

                          pObj.name = participant.name; 
                          pObj.title = participant.title; 
                          pObj.phone = participant.phone; 
                          pObj.picture = participant.picture; 
                          pObj.linkedin = participant.linkedin;
                          pObj.blockString = "http://www.trylunchedin.com/api/blockUser?user=" 
                                                    + user._id 
                                                    + "&block=" + participant.email;



                          template.people.push(pObj);

                      }

                      console.log("Matched Mail sent to ", user.name);
                      lunchedin.sendMail( templateID, template, user.email)
                    }

                });
};

/*
 *  Cancelled Mail :
 *  
 */
lunchedin.canceledMail = function( match, user ){

    var templateID = 634242;

    // Configuring the template model
    var template = {};
    
    template.user_name = lunchedin.getFirstName(user.name);
    template.people = [];
    User.find( { 
                  _id: {$in: match.dropouts}
                }, function(err, dropOuts){
                    
                    if(dropOuts != undefined && dropOuts.length > 0 ){
                          for( p in dropOuts ){

                              var pObj = {};

                              var dropOut = dropOuts[p];

                              pObj.name = dropOut.name; 
                              pObj.title = dropOut.title; 
                              pObj.phone = dropOut.phone; 
                              pObj.picture = dropOut.picture; 
                              pObj.linkedin = dropOut.linkedin;
                              //pObj.blockString = "http://trylunchedin.herokuapp.com/api/blockUser?user=" 
                                                        + user._id 
                                                        + "&block=" + dropOut.email;


                              template.people.push(pObj);

                          }

                          console.log("Drop-out Alert Mail sent to ", user.name);
                          lunchedin.sendMail( templateID, template, user.email)                      
                    }
                });
};


/*
 *  Cancelled Mail :
 *  
 */
lunchedin.noMatchMail = function( user ){

    var templateID = 651561;

    // Configuring the template model
    var template = {};
    
    template.user_name = lunchedin.getFirstName(user.name);

    Restaurant.find( { 
                   cuisine: { $in: user.cuisine } ,
                   _id: { $nin: user.blockedRestaurants } ,
                   veg: user.veg ,
                   halal: user.halal ,                
                }, function(err, restaurants){
                    
                      if(restaurants.length > 0 && restaurants != undefined){

                        template.where = {}
                        template.where.rest_name = restaurants[0].name;
                        template.where.address = restaurants[0].address; 
                        template.where.cuisine = restaurants[0].cuisine; 
                        template.where.website = restaurants[0].website; 
                        
                        if(restaurants[0].zip.length == 5)
                            restaurants[0].zip = '0' + restaurants[0].zip;

                        //https://www.google.com/maps/dir/Singapore+zipcode/
                        template.where.directionURL = "https://www.google.com.sg/maps/dir/Singapore+" 
                                                      + restaurants[0].zip + "/";  

                        lunchedin.sendMail( templateID, template, user.email)
                        console.log("Mailing ", user.name, "restaurant", restaurants[0].name);
                      }
                });
};

/*
 *  Goes through matches of a particular run and adds people who went to the lunch to each others known list,
 *  increments restaurant counters and lunch counts, increments dropCounters
 *  
 */
lunchedin.updateStatistics = function( runCount ){
    // for each participant of a match, check if all others are added - if not - add it
    Match.find({ run: runCount }, function(err, matches){

      if(err) console.log("Error retriving matches");
      else{

            //console.log(matches.length, "matches found for runCount", runCount );
            for(var i=0; i < matches.length; i++){

                // skipping the dummy match
                if(matches[i].participants.length == 0 && matches[i].dropouts.length == 0)
                  continue;

                console.log("Updating statistics for match", matches[i]._id);
                // increasing restaurant count by number of people who went there
                Restaurant.find( { _id: matches[i].location._id }, function(err, rest){

                      if(!err && rest.length != 0){
                        rest[0].total++; //= rest[0].total + matches[i].participants.length;
                        rest[0].save();
                      }
                });

                // increasing drop count for dropouts
                User.find( { 
                    _id: {$in: matches[i].dropouts}
                }, function(err, users){
                    if(!err){
                      for(var i=0; i<users.length; i++){
                         users[i].dropCount ++;
                         users[i].save();
                      }
                    }

                });

                // Adding to know and increasing lunch count for the user
                User.find( { 
                    _id: {$in: matches[i].participants}
                  }, function(err, participants){

                        if(err) console.log("Error getting participants");
                        else{
                              
                              for(var pCount=0; pCount< participants.length; pCount++){
                                  
                                  var p = participants[pCount]; //console.log("Comparing", p.name);
                                  
                                  for(var qCount=0; qCount < participants.length; qCount++){

                                      if(qCount == pCount)
                                          continue; 

                                      var q = participants[qCount];                                        
                                      
                                      if( p.known.indexOf(q._id) == -1)
                                        p.known.push(q._id);
                                  }

                                  p.lunchCount++ ;
                                  p.save();
                                  console.log(p.name, "knows", p.known.length);
                              }
                        }

                });
                
            }       
      }

    });
};

/*
 *  Goes through matches of a particular run and sends mail to concerned people about dropouts
 *  
 */
lunchedin.checkDropouts = function( runCount ){
    // for each participant of a match, check if all others are added - if not - add it
    Match.find({ run: runCount, location: {$exists:true} }, function(err, matches){

      if(err) console.log("Error retriving matches");
      else{

            console.log("-------------- Alerting for dropouts -----------------"); 
            for(var i=0; i < matches.length; i++){

                var match = matches[i];

                if(match.dropouts.length){
                    User.find( { 
                        _id: {$in: match.participants}
                      }, function(err, participants){

                          if(!err){
                              for(var p=0; p<participants.length; p++)
                                lunchedin.canceledMail(match, participants[p]);
                          }

                      });                  
                }

                
            }       
      }

    });
};

/*
 *  Goes through the matches for the current run and mails the people
 *  
 */
lunchedin.mailMatches = function( runCount ){
 
    Match.find(
      { run: runCount,
        location: {$exists:true} 
      }, function(err, matches){

      if(err) console.log("Error retriving matches");
      else{

            console.log("-------------- Mailing matches -----------------");
            for(var i=0; i < matches.length; i++){

                var match = matches[i];

                if(match.participants.length != 0 && match.location != undefined){
                    User.find( { 
                        _id: {$in: match.participants}
                      }, function(err, participants){

                          if(!err){
                              for(var p=0; p<participants.length; p++)
                                lunchedin.matchedMail(match, participants[p]);
                          }

                      });                  
                }

                
            }       
      }

    });

};


/*
 *  Sets the pool for that day and email people to join the pool 
 *  
 */
lunchedin.setPool = function(){

      console.log("-------------- Refreshing pool-----------------");
      User.update({}, {inPool: false} , {multi: true}, function(err, users){
            
            if(err) console.log(err, "error");
            else{
/*                  var today = new Date();
                  var day = today.getDay();

                  // populate daily pool
                  var dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  var holidays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];*/

                  /*
                   *  Sends confirmation mail to users who have marked - 'Ask Me Everyday'
                   */
                  User.find({
                        cuisine: { $exists: true, $ne: [] } 
                        //available : ['All'] // Availability functionality deprecated - will mail all users
                  }, function(err, users){

                          if(err) 
                            console.log("Error fetching pool", err);
                          else{

                              for(var i=0; i<users.length; i++)
                                lunchedin.confirmationMail( users[i]);                
                          }
                  });

                  /*
                   * Add all users that have already marked preference - deprecated
                   */
                  /*User.update({ available: dayMap[day] }, {inPool:true} , {multi: true}, function(err, users){
                        if(err) console.log(err, "error");
                        
                       //console.log(users.n, "users added to pool");

                        User.find({inPool:true}, function(err, users){
                          //console.log(users.length, "made active");
                        })

                  });*/   
            }   
      });     
};


/*  CALLS
 *
 *  Function will be called by match algorithm and related APIs
 *  Will - 1) Will analyse each match from previous run and perform addToKnown operation
 *       - 2) Will add to activePool
 *       - 3) Will run secondCall function after an allotted period of time
 *         4) secondCall will perform matching, mail users
 *  
 *
 */

lunchedin.firstCall = function(){

  /*
   *  Checks if it is a holiday - if holiday, calls itself again after 24hours
   *  By-passes if not in production
   */
  if( lunchedin.checkHoliday() ==  true && lunchedin.speedrun == false){
    console.log("Holiday! I'll sleep today - match tomorrow.");
    
/*    if(lunchedin.production)
      setTimeout(lunchedin.firstCall, 86400000); */
  }
  else{

    if (lunchedin.speedrun)
      setTimeout(lunchedin.secondCall, lunchedin.timeToSecondCall);

    /*
     *  Initialize run based on Matches
     *  Run starts from 1 
     */
      Match.find({})
        .sort({ run: -1 })
        .exec( function(err, matches) {

          console.log("-----------Getting last run count---------------")
          if(matches.length == 0 || matches == undefined){
            console.log("No matches in database. First run!");
            lunchedin.run = 1; 
          }
          else{
            console.log("Found past matches for run ", matches[0].run)
            lunchedin.run = matches[0].run + 1; 
          }

          lunchedin.setPool();
          // call secondCall after some predetermined time
          //console.log("-------------- Processing after " + lunchedin.timeToSecondCall + "ms-----------------");
        }); 
  }
};


lunchedin.secondCall = function(){

  if( lunchedin.checkHoliday() ==  true && lunchedin.speedrun == false)
    return; 

  if(lunchedin.speedrun)
    setTimeout(lunchedin.thirdCall, lunchedin.timeToThirdCall);

  // add a dummy match for this run
  addToDatabase( Match, { run: lunchedin.run, date: Date() } , "Match", null)

  // deal with pool
  console.log("-------------- Run ", lunchedin.run, "-----------------");
  User.find({ 
            inPool : true, 
            cuisine: { $exists: true, $ne: [] }
        })
        .sort({ blockedCount: 1, lunchCount: 1, knownCount: 1,  })
        .exec( function(err, userPool) {

          if(userPool.length == 0)
            console.log("No users!");
          else{
              console.log("-----------Running Match Algorithm (user count):", userPool.length, "---------------")
              console.log(userPool);
              matchingAlgorithm(userPool);            
            }
  });

  function discarded(){
   // Find suitable party for discarded users to join
    console.log("discarded", lunchedin.discardedUsers);

    lunchedin.discardedUsers.map( function(d_user){
      Match.find( { 
               run : lunchedin.run,
               location: {$exists:true},
              'location._id' : {$nin: d_user.blockedRestaurants},
              'location.veg' : d_user.veg, 
              'location.halal' : d_user.halal, 
              'location.cuisine' :{$in: d_user.cuisine}, 
               participants : {$nin: d_user.blocked}
              }, function(err, matches){

                // no suitable matches found - discard user
                if(err || matches.length == 0){
                  console.log("No compatible match found for discarded user to join", d_user.name);
                  console.log("Restaurant mailed to ", d_user.name);
                  lunchedin.noMatchMail(d_user);
                }
                else{
                  
                  for(var m=0; m < matches.length; m++){

                      var match = matches[m]; 

                      if(match.participants.length == 0 || match.participants.length > 4)
                        continue;

                      //console.log("Trying for a match for discarded user", match, d_user);
                      User.find({
                        _id: {$in: match.participants},
                        blocked : { $ne: ObjectId(d_user._id) } 
                      }, function(err, users){

                          if( !err && users != undefined && users.length > 0){
                            match.participants.push(d_user);
                            match.save();
                            console.log("Discarded user placed!");
                          }else{
                            console.log("No match found for discarded user", d_user.name);
                            console.log("Restaurant mailed to ", d_user.name);
                            lunchedin.noMatchMail(d_user);
                          }

                      });                                  
                  }

                }                    

      }); 

    });
    
/*    for( var k=0; k < lunchedin.discardedUsers.length; k++){

      var d_user = lunchedin.discardedUsers[k];  
      //TODO: fix

      Match.find( { 
               run : lunchedin.run,
               location: {$exists:true},
              'location._id' : {$nin: d_user.blockedRestaurants},
              'location.veg' : d_user.veg, 
              'location.halal' : d_user.halal, 
              'location.cuisine' :{$in: d_user.cuisine}, 
               participants : {$nin: d_user.blocked}
              }, function(err, matches){

                // no suitable matches found - discard user
                if(err || matches.length == 0){
                  console.log("No compatible match found for discarded user to join", d_user.name);
                  console.log("Restaurant mailed to ", d_user.name);
                  lunchedin.noMatchMail(d_user);
                }
                else{
                  
                  for(var m=0; m < matches.length; m++){

                      var match = matches[m]; 

                      if(match.participants.length == 0 || match.participants.length > 4)
                        continue;

                      //console.log("Trying for a match for discarded user", match, d_user);
                      User.find({
                        _id: {$in: match.participants},
                        blocked : { $ne: ObjectId(d_user._id) } 
                      }, function(err, users){

                          if( !err && users != undefined && users.length > 0){
                            match.participants.push(d_user);
                            match.save();
                            console.log("Discarded user placed!");
                          }else{
                            console.log("No match found for discarded user", d_user.name);
                            console.log("Restaurant mailed to ", d_user.name);
                            lunchedin.noMatchMail(d_user);
                          }

                      });                                  
                  }

                }                    

      }); 

      setTimeout(function(){ console.log(d_user.name, " processing"), 1000});                    
    }*/         
  }

  // for discarded users
  setTimeout( discarded, (lunchedin.speedrun? lunchedin.timeForDiscardedUsers_speedrun : lunchedin.timeForDiscardedUsers_normal) );

  // match and mail
  // TODO: wait for 30s for matches to be made - wait 10 minutes
  // ATTENTION: MODIFY IN PRODUCTION
  setTimeout( function(){
          lunchedin.discardedUsers = []; // safety net - redundant
          lunchedin.mailMatches( lunchedin.run )

          console.log("-------------- Pool refresh after running algorithm in second call -----------------");
          User.update({}, {inPool: false} , {multi: true}, function(err, users){
            if(!err) console.log("Pool refreshed after running algorithm");
          });

        }, (lunchedin.speedrun ? lunchedin.timeToMail_speedrun : lunchedin.timeToMail_normal) );
};

lunchedin.thirdCall = function(){

  /* Deprecated because of chron
  if(lunchedin.autorun)
    setTimeout(lunchedin.firstCall, lunchedin.timeToFirstCall); */
  if( lunchedin.checkHoliday() ==  true && lunchedin.speedrun == false )
    return;

  console.log("-------------- Checking for clean pool -----------------");
  User.find({ 
            inPool : true
        }, function( err, users ){

            if(users.length == 0){
                // check for dropOuts
                console.log("-------------- Checking for dropouts for Run ", lunchedin.run, "-----------------");
                lunchedin.checkDropouts( lunchedin.run );

                console.log("-------------- Updating counters and known for Run ", lunchedin.run, "-----------------");
                lunchedin.updateStatistics( lunchedin.run );
            }
            else
              console.log("ATTENTION: Unclean pool in third call");
  });

}

// routes ================

  /*
   *
   * User Authentication
   *
   */

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
    res.send('<h1>Logged out</h1>');
  });

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  app.get('/api/getLoggedInUser', function(req, res){

      if(req.isAuthenticated()){
        console.log("Sending active user details",req.session.passport.user[0]);
        res.json(req.session.passport.user[0]);       
      }
      else
        res.json(null);

  });

  /*
   * LunchApp APIs
   * 
   */

  // ==========================================================================
  /*
   *  Admin only APIs
   */
  app.get('/api/clearUsers', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){ //TODO
          
        clearDatabase( User, "Users", null ); 

        res.send('Refreshed users.')
    }
    else
      res.send('Not authenticated');     
  });

  app.get('/api/clearMatches', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){ //TODO
          
        clearDatabase( Match, "Matches", null ); 

        res.send('Refreshed matches.')
    }
    else
      res.send('Not authenticated');     
  });

  app.get('/api/clearRestaurants', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){ //TODO
          
        clearDatabase( Restaurant, "Restaurants", null );

        res.send('Refreshed restaurant.')
    }
    else
      res.send('Not authenticated');     
  });

  app.get('/api/resetRestaurants', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){ //TODO
          
        //clearDatabase( Restaurant, "Restaurants", null );
          
        // loads the dummyUsers from the database
        var allRestaurants = require('./allRestaurants');
        console.log(allRestaurants.length, "restaurants loaded.");
        
        // pre-process the user data - change to array etc
        for(var i=0; i<allRestaurants.length; i++){
            var restaurant = allRestaurants[i]; 

            if(restaurant.zip.length == 5)
              restaurant.zip = '0' + restaurant.zip;

            restaurant.cuisine = restaurant.cuisine.replace(/\s/g, '').split(',');
            restaurant.total = 0;

            addToDatabase( Restaurant, restaurant, "Restaurant", null);
        }    
        

        res.send('Refreshed restaurants.')
    }
    else
      res.send('Not authenticated');     
  });

  app.get('/api/about', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){ //TODO
          res.status(200).send("Production:" +  lunchedin.production +
                               "\nSpeedRun:" + lunchedin.speedrun +
                               "\nMails:" + lunchedin.mails +
                               "\nTime till second call (speedrun):" + lunchedin.timeToSecondCall +
                               "\nTime till third call (speedrun):" + lunchedin.timeToThirdCall +
                               "\nTime for discarded users processing (normal):" + lunchedin.timeForDiscardedUsers_normal +
                               "\nTime for discarded users processing (speedrun):" + lunchedin.timeForDiscardedUsers_speedrun + 
                               "\nTime for mailing matches (speedrun):" + lunchedin.timeForDiscardedUsers_speedrun +
                               "\nTime for mailing matches (normal):" + lunchedin.timeForDiscardedUsers_speedrun );
    }
    else
      res.send('Not authenticated');     
  });

  app.get('/api/firstCall', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){ //TODO
          lunchedin.firstCall();
          res.status(200).send("Production:" +  lunchedin.production +
                               "\nSpeedRun:" + lunchedin.speedrun +
                               "\nMails:" + lunchedin.mails +
                               "\nTime till second call (speedrun):" + lunchedin.timeToSecondCall +
                               "\nTime till third call (speedrun):" + lunchedin.timeToThirdCall +
                               "\nTime for discarded users processing (normal):" + lunchedin.timeForDiscardedUsers_normal +
                               "\nTime for discarded users processing (speedrun):" + lunchedin.timeForDiscardedUsers_speedrun + 
                               "\nTime for mailing matches (speedrun):" + lunchedin.timeForDiscardedUsers_speedrun +
                               "\nTime for mailing matches (normal):" + lunchedin.timeForDiscardedUsers_speedrun );
    }
    else
      res.send('Not authenticated');     
  });

/*  app.get('/api/secondCall', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus){ //TODO
          lunchedin.secondCall();
          res.status(200).send(lunchedin.production);
    }
   else
    res.send('Not authenticated');     
  });

  app.get('/api/thirdCall', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){ //TODO
          lunchedin.thirdCall();
          res.status(200).send(lunchedin.production);
    }
   else
    res.send('Not authenticated');     
  });*/

  app.get('/api/toggleProduction', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){
          lunchedin.production = !lunchedin.production;
          res.status(200).send("<b>Production:" + lunchedin.production + '</b>' +
                               "<br>SpeedRun:" + lunchedin.speedrun +
                               "<br>Mails:" + lunchedin.mails +
                               "<br>Time till second call (speedrun):" + lunchedin.timeToSecondCall +
                               "<br>Time till third call (speedrun):" + lunchedin.timeToThirdCall +
                               "<br>Time for discarded users processing (normal):" + lunchedin.timeForDiscardedUsers_normal +
                               "<br>Time for discarded users processing (speedrun):" + lunchedin.timeForDiscardedUsers_speedrun + 
                               "<br>Time for mailing matches (speedrun):" + lunchedin.timeForDiscardedUsers_speedrun +
                               "<br>Time for mailing matches (normal):" + lunchedin.timeForDiscardedUsers_speedrun );
    }
    else
      res.send('not authenticated');     
  });

  app.get('/api/toggleSpeedRun', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){
          lunchedin.speedrun = !lunchedin.speedrun;
          res.status(200).send("Production:" + lunchedin.production + 
                               "<br><b>SpeedRun:" + lunchedin.speedrun + '</b>' +
                               "<br>Mails:" + lunchedin.mails +
                               "<br>Time till second call (speedrun):" + lunchedin.timeToSecondCall +
                               "<br>Time till third call (speedrun):" + lunchedin.timeToThirdCall +
                               "<br>Time for discarded users processing (normal):" + lunchedin.timeForDiscardedUsers_normal +
                               "<br>Time for discarded users processing (speedrun):" + lunchedin.timeForDiscardedUsers_speedrun + 
                               "<br>Time for mailing matches (speedrun):" + lunchedin.timeForDiscardedUsers_speedrun +
                               "<br>Time for mailing matches (normal):" + lunchedin.timeForDiscardedUsers_speedrun );
    }
    else
      res.send('not authenticated');     
  });

  app.get('/api/toggleMails', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){
          lunchedin.mails = !lunchedin.mails;
          res.status(200).send("Production:" + lunchedin.production + 
                               "<br>SpeedRun:" + lunchedin.speedrun +
                               "<br><b>Mails:" + lunchedin.mails + '</b>' +
                               "<br>Time till second call (speedrun):" + lunchedin.timeToSecondCall +
                               "<br>Time till third call (speedrun):" + lunchedin.timeToThirdCall +
                               "<br>Time for discarded users processing (normal):" + lunchedin.timeForDiscardedUsers_normal +
                               "<br>Time for discarded users processing (speedrun):" + lunchedin.timeForDiscardedUsers_speedrun + 
                               "<br>Time for mailing matches (speedrun):" + lunchedin.timeForDiscardedUsers_speedrun +
                               "<br>Time for mailing matches (normal):" + lunchedin.timeForDiscardedUsers_speedrun );
    }
    else
      res.send('not authenticated');     
  });

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
  });

/*  app.get('/api/setTime', function(req, res){
    if( req.isAuthenticated() && req.session.passport.user[0].adminStatus ){
        // api / setTime?thirdToFirst=time1&firstToSecond=time2&secondToThird=time3
        var qs = querystring.parse(req.url.split("?")[1]);
        lunchedin.timeToFirstCall = qs.thirdToFirst;
        lunchedin.timeToSecondCall = qs.firstToSecond;
        lunchedin.timeToThirdCall = qs.secondToThird;
        res.status(200).send(lunchedin.timeToFirstCall + "  " + lunchedin.timeToSecondCall + " " + lunchedin.timeToThirdCall);
    }
    else
      res.send('Not authenticated');   
  });
  */



  // Sends Matches Data 
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

      } 
      else{
        res.send('Request not authenticated');
      }
  });

  // Adds user
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
                  lunchedin.addUser(req.body);
                
                res.send("Admin Request Approved: Added new user");

            })

      }
      else{
        res.send('Request not authenticated');
      }

  });
  


  // ==========================================================================
  // Information APIs
  //
  //

  // Sends Cuisine
  app.get('/api/cuisines', function(req, res){
      
      // anyone who is authenticated can get the cuisinelist
      if( req.isAuthenticated() ){
            res.send(cuisineList);
      }
      else{
        res.send('Request not authenticated');
      }
  });

  // Sends all the users in the database 
  app.get('/api/users', function(req, res){

      //
      // This authentication is important for every request to the API 
      //
      if(req.isAuthenticated()){   //!! TODO: find if this is safe? I think there's a loophole - if req can be tampered around with
        
            // get mongoose to extract all users in the database
            User.find(function(err, users){

                    if(err || users.length == 0)
                      res.send(err);
                    else{
                       // if user is admin - send all information 
                      if( req.session.passport.user[0].adminStatus ){
                            console.log("Admin Request Approved: Sending complete data");
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
                    }
            });

      } 
      else{
        res.send('Request not authenticated');
      }
  });

  // name changed from user_pref to edit_user - change in angular app - public
  app.post('/api/editUser', function(req, res){

      if(req.isAuthenticated()){
        
          // if user is admin - the body of the request will have email of the user which is to be updated
          if( req.session.passport.user[0].adminStatus ){
/*
                  User.findOneAndUpdate(
                              { 
                                    email: req.body.email  // don't change to id - doesn't work!
                              }, 
                              {
                                    name: req.body.name, 
                                    password: req.body.password, 
                                    title: req.body.title, 
                                    picture: req.body.picture, 
                                    gender: req.body.gender, 
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
                                if(err || user.length == 0) console.log(err);
                                else{
                                  console.log("Updated user details", user);
                                  res.json("Success");  
                                }
                              }
                    )*/
          }
          else{

                  User.find({ 
                                 "_id": ObjectId(req.body._id)
                              }, function(err, users){
                                  if (err || users.length==0 ) console.log(err);
                                  else{
                                          var user = users[0];

                                          user.title = req.body.title;
                                          user.nationality = req.body.nationality;
                                          user.phone = req.body.phone;
                                          user.gender = req.body.gender;
                                          user.picture = req.body.picture;
                                          user.password = req.body.password;
                                          user.tagline = req.body.tagline;
                                          user.linkedin = req.body.linkedin;
                                          user.available = req.body.available; 
                                          user.cuisine = req.body.cuisine; 
                                          user.blocked = req.body.blocked;
                                          user.known = req.body.known; 
                                          user.veg = req.body.veg; 
                                          user.halal = req.body.halal;  
                                          user.save();

                                          console.log("User update from User-Dashboard"); 

                                          req.login(users, function(err) {
                                              if (err) console.log(err)

                                              setTimeout( function(){ res.sendStatus(200) }, 1500);
                                          })
                                  }

 
                              }
                    )
          }
      }
  });


  // ==========================================================================
  //
  //  User based Email APIs
  // 
  app.get('/api/addToPool', function(req, res){
        
      var qs = querystring.parse(req.url.split("?")[1]),
      id = qs.id;
      // api / dropOut?id=object_id

      if(ObjectId.isValid(id)){
          lunchedin.addToPool( lunchedin.run, id );
          res.send( "<h1>Thanks</h1>" );
      }
        
      

  });

  app.get('/api/dropOut', function(req, res){
      
      var qs = querystring.parse(req.url.split("?")[1]),
      objectID = qs.participant;
      matchID = qs.match;
      // api / dropOut?participant=object_id&match=match_id

      if(ObjectId.isValid(objectID) && ObjectId.isValid(matchID)){
         Match.find({
                _id : ObjectId(matchID),
                run : lunchedin.run
              }, function(err, matches){

              if(err || matches.length == 0) console.log("match not found");
              else{
                var match = matches[0];

                //TODO: Refactor by adding to match query
                if( match.dropouts.indexOf( objectID ) == -1 && match.participants.indexOf( objectID ) != -1){
                  match.dropouts.push( match.participants.splice(match.participants.indexOf(objectID), 1) );
                  match.save();
                  console.log("Dropped-out");
                  res.status(200).send("<h1>Your lunch mates will miss you!</h1>")
                  //res.send("<h1>Your lunch mates will miss you!</h1>")
                }
              }
        })       
      }
      else{
        console.log("Invalid query");
        res.send("<h1>Invalid query</h1>")
      }

  });

  app.get('/api/blockUser', function(req, res){

      // api / blockUser?user=objectid&block=email
      var qs = querystring.parse(req.url.split("?")[1]),
        userID = qs.user;
        blockedMail = qs.block;

      if(ObjectId.isValid(userID)){
          User.find( { _id: ObjectId(userID) }, function(err, user){

              if(err || user.length == 0) console.log(err);  
              else{
                      var user = user[0];
                      User.find({ email: blockedMail }, function(err, user2){

                            if(err || user2.length==0 ) console.log(err);
                            else{
                                  var user2 = user2[0];
                                  if( user.blocked.indexOf( user2._id ) == -1){
                                    user.blocked.push(user2._id);
                                    //res.send(user.name + ", " + user2.name+ "has been blocked.")
                                    user.save();
                                    res.status(200).send('<h1>Noted</h1>')
                                    //res.status(200).send(user.name + ", " + user2.name+ " has been blocked.");
                                  }
                                  else
                                    res.status(200).send('<h1>Error</h1>')
                                    //res.status(200).send(user.name+ ", "+ user2.name+ " was already blocked.");
                                    //res.send(user.name+ ", "+ user2.name+ "was already blocked.");                         
                            }

                      })
              }
          });
      }


  });

  app.get('/api/blockRestaurant', function(req, res){

      // api / blockRestaurant?user=objectid&block=email
      var qs = querystring.parse(req.url.split("?")[1]),
      userID = qs.user;
      blockedRId = qs.block;

      // check if objectID is valid
      if(ObjectId.isValid(userID) && ObjectId.isValid(blockedRId)){
         User.find( { _id: ObjectId(userID) }, function(err, user){

            if(err || user.length == 0) console.log(err);  
            else{
                    var user = user[0];
                    Restaurant.find({ _id: ObjectId(blockedRId)}, function(err, restaurants){

                          if(err || restaurants.length==0 ) console.log(err);
                          else{
                                var restaurant = restaurants[0]; console.log("Found", restaurant);
                                if( user.blockedRestaurants.indexOf( restaurant._id ) == -1){
                                  user.blockedRestaurants.push(restaurant._id);
                                  
                                  user.save();
                                  res.status(200).send('<h1>Noted</h1>')
                                  //res.status(200).(user.name+ ", "+ restaurant.name+ "has been blocked.")
                                }
                                else
                                  res.status(200).send('<h1>Error</h1>')
                                  //res.status(200).(user.name+ ", "+ restaurant.name+ "has been blocked.")
                                  //res.send(user.name + ", "+ restaurant.name+ "was already blocked.");                         
                          }

                    })
            }
        });       
      }

  });






  // ===========================================================================
  app.get('*', function(req, res){ 
        res.send('Sorry! We haven\'t written this API yet! Got a suggestion? Mail us at admin@trylunchedin.com!');
  });

  app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

  console.log("App listening on port 8080");    


  // ============================================================================
  function matchingAlgorithm( userPool ){


          lunchedin.discardedUsers = [];
          console.log("User pool length:", userPool.length);
          
          while(userPool.length > 0){

                if(userPool.length < 3){
                  console.log("Pool length is less than 3");
                  lunchedin.discardedUsers = lunchedin.discardedUsers.concat(userPool);
                  userPool = [];
                  continue;      
                }

                //always at index 0 - because the first user is always removed; remove the first user
                //console.log("UserPool Length at", userPool.length);
                var currUser = userPool.splice(0, 1)[0]; // removes from the userPool also
                
                console.log("Starting with", currUser.name, currUser.known);

                // create a pool for second mate - which should be a close person to the current user
                var pairMatePool = regroup( userPool, currUser, false ); 
                var pairMatePool = pairMatePool[0].concat(pairMatePool[1]).concat(pairMatePool [2]); // ordered by priority
                //console.log("Found pairmate pool of length", pairMatePool.length);
                // if pairMatePool.length == 0 - no pair available - can't do anything - user has already been removed from the pool
                if(pairMatePool.length == 0){
                    console.log("Match not found for", currUser.name);
                    lunchedin.discardedUsers.push(currUser);
                    continue;                            
                }


                // picks the first mate in the given pool with compatible cuisine - or just picks the first person
                var pairMate = pickNextMate( pairMatePool, currUser, false );
                
                // this will happen when no user can be selected such that a third user can be selected -
                // in this case, better to discard the first user and continue
                if(pairMate == undefined){
                    console.log("Match not found for", currUser.name);
                    lunchedin.discardedUsers.push(currUser);
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
                  if(thirdMate == undefined){
                    console.log("No third mate found");
                    lunchedin.discardedUsers.push(currUser);
                    continue;
                  }

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
                        { _id: { $nin: user1.blockedRestaurants } }, 
                        { _id: { $nin: user2.blockedRestaurants } }, 
                        { veg: user1.veg || user2.veg },
                        { halal: user1.halal || user2.halal },
                      ]  
              }, function(err, restaurant){
                 if(err || restaurant.length == 0){
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
                console.log("-------------Matching--------------");
                /*
                 * Dynamically constructing the criteria for the query
                 */
                var criteria = []; 
                var pids = [];
                vegValue = false; 
                halalValue = false;
                for( var p = 0; p < participants.length; p++ ){

                    var participant = participants[p];

                    if(participant == undefined)
                      continue;
                    
                    if(participant.veg)
                      vegValue = true;
                    
                    if(participant.halal)
                      halalValue = true;

                    criteria.push( { cuisine: { $in: participant.cuisine } } );
                    criteria.push( { _id: { $nin: participant.blockedRestaurants } } );
                    pids.push(participant._id);

                    console.log(participant.name, ": Been on ", participant.lunchCount, " lunches and knows ", participant.knownCount);
                }

                criteria.push( { veg: vegValue } )
                criteria.push( { halal: halalValue } )

                // Find a restaurant and add the match
                Restaurant.find({
                     $and: criteria
                  })
                .sort({ price: 1, total: 1 })
                .exec(function(err, res){
                     if(err || res.length==0) console.log(err);
                     else {

                          var newMatch =                                           
                            {
                              'run': lunchedin.run,
                              'date': Date(),
                              'participants': pids,
                              'location': res[0],
                              'dropouts' : []
                            };
                          console.log("Match made at", res[0].name);

                          addToDatabase( Match, newMatch, "Match", null)
                    }
                });
          } 

          // removes the users from the pool
          function removeFromPool( userPool, participants ){
            for(var i=0; i<participants.length; i++){
              var index = userPool.indexOf(participants[i]); 
              userPool.splice(index, 1);
            }
          }    

  } // matchingAlgo end


//  Initialization Function
//      Runs only once when dynos are reset
//      Adds the restaurants
var initialize = function() {   

    // Production settings
    if(lunchedin.production == true){

      //lunchedin.autorun = true; 
      // TODO: set to true for actual production
      lunchedin.mails = true;

      //lunchedin.timeToSecondCall = 10800000;  // After 7.30am, run after 3 hours - 3*60*60s - 10.30am - mails go at 11.00am
      //lunchedin.timeToThirdCall = 7200000; //  After 10.30am, run after 2 hours - 2*60*60s - 12.30pm - dropout mails

      // TODO: chron jon
      // schedule firstcall to be run everyday
      var rule = new schedule.RecurrenceRule();
      rule.hour = 1;
      rule.minute = 30;
      schedule.scheduleJob(rule, function(){
          console.log(new Date(), 'Waka Waka! First Call - Invite them!');
          lunchedin.firstCall();
      });

      var rule2 = new schedule.RecurrenceRule();
      rule2.hour = 4;
      rule2.minute = 30;
      schedule.scheduleJob(rule2, function(){
          console.log(new Date(), 'Waka Waka! Second Call - Match them!');
          lunchedin.secondCall();
      });

      var rule3 = new schedule.RecurrenceRule();
      rule3.hour = 5;
      rule3.minute = 0;
      schedule.scheduleJob(rule3, function(){
          console.log(new Date(), 'Waka Waka! Third Call - Spoiler Alert');
          lunchedin.thirdCall();
      });

      console.log("In production. Mails: ", lunchedin.mails, lunchedin.speedrun, ".Scheduled Jobs.")

    }

}
initialize(); // runs everytime dynos are set