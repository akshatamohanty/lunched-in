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
mongoose.connect('mongodb://127.0.0.1:27017/test');


app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));
app.use(methodOverride());

// define model ========================
var User = mongoose.model('User', {
  uid: Number,
  name: String , 
  title: String,
  phone: String,
  tagline: String,
  picture: String,
  cuisine: [String]
});

var Lunch = mongoose.model('Lunch', {
  date: String , 
  restaurant: String,
  participants: [Number]
});

// populating the model with the userDatabase
dummyUsers = [{
    uid: 1, 
    name: "James Potter",
    title: "Senior Architect",
    phone: "902xx",
    tagline: "Prongs",
    picture: "http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg",
    cuisine: ["chinese"], 
    blocked: []
  },
  {
    uid: 2, 
    name: "Sirius Black",
    title: "Junior Architect",
    phone: "902xx",
    tagline: "Padfoot",
    picture: "http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg",
    cuisine: ["italian"],
    blocked: []
  },
  {
    uid: 3, 
    name: "Peter Pettigrew",
    title: "Finance",
    phone: "902xx",
    tagline: "Wormtail",
    picture: "http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg",
    cuisine: ["mexican"],
    blocked: []
  },
  {
    uid:4, 
    name: "Albus Dumbledore",
    title: "Director",
    phone: "902xx",
    tagline: "Phoenix",
    picture: "http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg",
    cuisine: ["indian"],
    blocked: []
  },
  {
    uid: 5, 
    name: "Remus Lupin",
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
            'uid': dummyUsers[i].uid,
            'name': dummyUsers[i].name,
            'title': dummyUsers[i].title,
            'phone': dummyUsers[i].phone,
            'tagline': dummyUsers[i].tagline,
            'picture': dummyUsers[i].picture,
            'cuisine': dummyUsers[i].cuisine
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

  // populating 2 dummy lunches
  if( i < 2){
    Lunch.create(
          {   
              'date': dummyLunch[i].date, 
              'restaurant': dummyLunch[i].restaurant,
              'participants': dummyLunch[i].participants
          }
          , function(err, user){

              if(err)
                console.log(err);

              Lunch.find(function(err, lunches){
                  
                  if(err)
                      console.log(err)

                  console.log(lunches);
              });
          });
  }
}

console.log(dummyUsers.length + ' dummy users populated');
console.log(dummyLunch.length + ' dummy lunches populated');

// routes ================

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

/*   // creating a new user
   app.post('/api/users', function(req, res){

        User.create(
        {   'name': req.name,
            'title': req.title,
            'phone': req.phone,
            'tagline': req.tagline,
            'picture': req.picture,
            'cuisine': req.cuisine
        }
        , function(err, user){

            if(err)
              res.send(err);

            User.find(function(err, users){
                
                if(err)
                    res.send(err)

                res.json(users);
            });
        });
 });*/

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
      Lunch.find( { 
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