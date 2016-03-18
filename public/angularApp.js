/*
 *  Akshata Mohanty, February 2016
 *  Angular App - LunchedIn
 */


/*
 *  App Defintion and Configuration
 */
var app = angular
      .module("lunchedIn", ["ngMaterial", "ngRoute", "ngMdIcons", "ngResource"])
      .config(function($mdThemingProvider) {
		  $mdThemingProvider.theme('default')
		    .primaryPalette('red')
		});

/*
 *  Routing
 */
app.config(["$routeProvider", function($routeProvider) {
   $routeProvider.
   
   when("/lunchMates", {
      templateUrl: "templates/lunchMates.html", 
      controller: "lunchMatesCtrl"
   }).
   
   when("/settings", {
      templateUrl: "templates/settings.html", 
      controller: "settingsCtrl"
   }).

   when("/lunches", {
      templateUrl: "templates/lunches.html", 
      controller: "lunchesCtrl"
   }).

   otherwise({
      templateUrl: "templates/lunches.html", 
      controller: "lunchesCtrl"
   });
	
}]);


/***************** Main Controller ************************************/
app.controller("MainCtrl", [
      "$scope", "$http", 
      function($scope, $http){

         $scope.loggedInUser = null;
         $scope.logout = logoutFunction; 
         
         $http.get("/api/getLoggedInUser")
                           .success( function(data){

                              if( data ){
                                 $scope.loggedInUser = data; 
                                 console.log("User is logged in.");
                              }
                              else
                                 console.log("User is not logged in.");

                           })
                           .error(function(data){
                              console.log("Error:" + data);
                           });

            var logoutFunction = function(){

                           $http.get("/logout")
                               .success( function(data){
                                    $scope.loggedInUser = null;
                               });
          }
      }
]);


/***************** Matches Display Controller ***************/
app.controller("lunchesCtrl", [
         "$scope", "$http", 
         function( $scope, $http ){

            $scope.matches = []; 

            $scope.getMatches = getMatches; 
            var getMatches = function(){
               $http.get("/api/lunches")
                  .success( function(data){
                     $scope.matches = data; 
                     console.log("Matches:", data)
                  })
                  .error( function( data ){
                     console.log("Error: ", data);
                  });
            }

            $scope.match = function(){
               $http.get('/api/runMatchAlgorithm')
                   .success( function(data){
                     console.log("Algorithm ran successfully!")
                     getMatches();
                   })
                   .error( function(err){
                     console.log("Error: ", data);
                   })
            }

            function processMatches(){
               // checking for lunch today
               for(var i=0; i < $scope.matches.length; i++ ){
                  var lunch = $scope.matches[i];
                  if(lunch.date){
                     $scope.today = lunch;
                     $scope.today.message = "Lunch today!";
                     $scope.matches.splice(i, 1);
                  }
                  else
                     $scope.today = {
                        "message" : "No Lunch Today",
                        "date" : new Date().toJSON().slice(0,10),
                        "time" : "13.00 PM",
                        "participants": [{'name':'user1'},
                                       {'name':'user2'},
                                          {'name':'user3'}],
                        "location": { 'name': 'dummy restaurant name',
                                      'latLong': [ 1.31014298, 103.81468448 ] 
                                 }
                     }
               }

               console.log("today", $scope.today);
            }

         }

]);


/****************** Settings Controller *******************/
app.controller("settingsCtrl", [
         "$scope", "$http", "$routeParams",
         function( $scope, $http, $routeParams ){

            $scope.userDetails = $scope.loggedInUser; 
            $scope.days = [
                        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'   
                        ]

            /********** Admin Component - Cuisine Related ********************/
            // get the cuisines from the server
            $scope.cuisines = []
            $scope.newCuisine = "";

            function refreshCuisineList(){
               console.log("Refreshing Cuisine List");
               $http.get("/api/cuisines")
                  .success( function(data){

                     $scope.cuisines = data;

                  })
                  .error(function(data){
                     console.log("Error:" + data);
                  });
            }
            // initialization
            refreshCuisineList();
            

            $scope.addCuisine = function( cuisineName, cuisinePicture ){ console.log("Adding Cuisine", $scope.newCuisine);
               $http.post('/api/addCuisine', { 'cuisineName': $scope.newCuisine })
                               .success(function(data){
                                 console.log("New Cuisine Added");
                                 $scope.cuisines = data;
                                 $scope.newCuisine = "";
                               })
                               .error(function(data){
                                 console.log('Error:', data);
                               });
            }


            /*************** admin Component : Restaurant related **********************/
            $scope.restaurants;
            $scope.newRestaurant = {
               'code': "0001",
               'name' : 'Restaurant1',
               'address' : 'Address',
               'cuisine': [],
               'scheduled': 0,
               'total': 0
            };

            // get all users data
            function refreshRestaurantList(){
               $http.get("/api/restaurants")
                  .success( function(data){

                     $scope.restaurants = data;
                     console.log("Refreshed User List", data);

                  })
                  .error(function(data){
                     console.log("Error:" + data);
                  });
            }

            $scope.addNewRestaurant = function(){
               $http.post('/api/addRestaurant', $scope.newRestaurant)
                   .success( function(data){
                     console.log("Restaurant Added. ", data);

                   })
                   .error( function(data){
                     console.log("Restaurant not added", data);
                   })

               refreshRestaurantList();
             }

             $scope.deleteRestaurant = function ( code ){

               $http.post('/api/removeRestaurant', {'code' : code } )
                   .success( function(data){
                     console.log("Restaurant Deleted. ", data);

                   })
                   .error( function(data){
                     console.log("Restaurant not deleted", data);
                   })

               refreshRestaurantList();
             }



                        // user preference options
/*          $http.get("/api/user_pref")
                  .success( function(data){

                     if(data.statusCode == 302){
                        $window.location.href = '/login'
                     }

                     $scope.userDetails = data;
                     //console.log("preference", data);

                  })
                  .error(function(data){
                     console.log("Error:" + data);
                  });*/
      
               
               /*************** user component *********************************/
               $scope.toggle = function (item, list) {
                  if (list == undefined) { return };
               var idx = list.indexOf(item);
               if (idx > -1) list.splice(idx, 1);
               else list.push(item);
               };

               $scope.exists = function (item, list) {
                  //console.log("exists", item, list.indexOf(item) > -1);
                  if (list == undefined) { return };
               return list.indexOf(item) > -1;
               };


            $scope.editUserPreference = function (){
               $http.post('/api/edit_pref', $scope.userDetails)
                               .success(function(data){
                                 console.log($scope.userDetails._id);
                                 console.log("user updated", data);
                               })
                               .error(function(data){
                                 console.log('Error:', data);
                               });
            }

         }
]);


/**************** User Display Controller *****************/
app.controller("lunchMatesCtrl", [ 
   "$scope", "$http", 
   function( $scope, $http ){

      $scope.users = [];
      $scope.userDetails = {};

      $scope.newUser = {  'name': 'John Doe', 
                     'email': 'johndoe@aedas.sg', 
                     'password': 'pass',
                     'title': 'Senior Designer',
                     'cuisine': ['Chinese', 'Indian'],
                     'available' : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] 
                   };

      // get all users data
      function refreshUserList(){
         $http.get("/api/users")
            .success( function(data){

               $scope.users = data;
               console.log("Refreshed User List", data);

            })
            .error(function(data){
               console.log("Error:" + data);
            });
      }

      // get current user data
      $http.get("/api/user_pref")
            .success( function(data){

               if(data.statusCode == 302){
                  $window.location.href = '/login'
               }

               $scope.userDetails = data;
               //console.log("preference", data);

            })
            .error(function(data){
               console.log("Error:" + data);
            });

      var chars = "ABCDEFGHIJKLMNOPQURSTUVWXYZ";
      var tabs = [];
      for(var c=0; c<26; c++){
         var t = {};
         t.title = chars[c];
         tabs.push(t);
      }
      $scope.tabs = tabs;
      $scope.selectedIndex = 0;

      $scope.message = "This page will be used to display users";
      $scope.users = $scope.users.map(function (c) {
                     c._lowername = c.name.toLowerCase();
                     return c;
                     });

      $scope.selectedItem = null;
      $scope.searchText = null;
      $scope.querySearch = querySearch;
      $scope.selectedUsers = [];
      $scope.transformChip = transformChip;

      $scope.checkInitial = checkInitial; 

      $scope.containsObject = containsObject; 
      $scope.addToList = addToList; 

      $scope.saveMates = saveMates;

      $scope.addNewUser = addNewUser;
      $scope.deleteUser = deleteUser;

      // http post to modify mates
      function saveMates(){
         $http.post('/api/edit_mates', $scope.userDetails)
                      .success(function(data){
                        console.log($scope.userDetails._id);
                        console.log("user updated", data);
                      })
                      .error(function(data){
                        console.log('Error:', data);
                      });
      }

      function containsObject(obj, list) {
          var i;
          for (i = 0; i < list.length; i++) {
              if (list[i]._id == obj._id) {
               //console.log(obj.name, "is contained in", list)
                  return true;
              }
          }

          //console.log(obj.name, "is not contained in", list);
          return false;
      }

      function addToList( user, list ){

         if ( containsObject( user, $scope.userDetails[list] ) )
            console.log("Already ", list)
         else 
            $scope.userDetails[list].push(user);

      }

      function checkInitial( intial, string ){
         // check if the user is the current - dont display self to self!
         if( $scope.userDetails.name == string ){
            //console.log("Self detected!")
            return false; 
         }

         var result = angular.lowercase(string[0]) == angular.lowercase(intial);
         return result;
      }
    
       /**
        * Return the proper object when the append is called.
        */
       function transformChip(chip) {
         // If it is an object, it"s already a known chip
         if (angular.isObject(chip)) {
           return chip;
         }
       }
       /**
        * Search for cuisines.
        */
       function querySearch (query) {
         if($scope.users.length == 0)
            return;
         var results = query ? $scope.users.filter(createFilterFor(query)) : [];
         return results;
       }
       /**
        * Create filter function for a query string
        */
       function createFilterFor(query) {
         var lowercaseQuery = angular.lowercase(query); 
         return function filterFn(user) {
                  return (user._lowername.indexOf(lowercaseQuery) === 0)
              };
       }

       function addNewUser(){
         $http.post('/api/addUser', $scope.newUser)
             .success( function(data){
               console.log("User Added. ", data);

             })
             .error( function(data){
               console.log("User not added", data);
             })

         refreshUserList();
       }

       function deleteUser( email ){

         $http.post('/api/removeUser', {'email' : email } )
             .success( function(data){
               console.log("User Deleted. ", data);

             })
             .error( function(data){
               console.log("User not deleted", data);
             })

         refreshUserList();
       }
   }

]);

