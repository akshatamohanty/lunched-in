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
      controller: "lunches"
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
            $scope.refreshMatchList = refreshMatchList; 

            var refreshMatchList = function(){
               $http.get("/api/lunches")
                  .success( function(data){
                     $scope.matches = data; 
                     //console.log("Matches:", data)
                  })
                  .error( function( data ){
                     console.log("Error: ", data);
                  });
            };
            refreshMatchList();
         
}]);

app.controller("lunchesCtrlUser", [
         "$scope", "$http", 
         function( $scope, $http ){

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
}]);

app.controller("lunchesCtrlAdmin", [
         "$scope", "$http", 
         function( $scope, $http ){

            var batchIds = [];
            var runMatchAlgorithm = function(){
               $http.get('/api/runMatchAlgorithm')
                   .success( function(data){
                     console.log("Algorithm ran successfully!")
                     processMatches();
                   })
                   .error( function(err){
                     console.log("Error: ", data);
                   })
            };
            runMatchAlgorithm();

            var processMatches = function(){
                var matches = $scope.$parent.matches; 
                for(var m=0; m < matches.length; m++){
                  if(batchIds.indexOf(matches[m].batch) == -1)
                    batchIds.push(matches[m].batch);
                }
                console.log("processed");
            }; 

            $scope.selectedBatch = 'No Match Selected';
            $scope.refresh = $scope.$parent.refreshMatchList;
            $scope.match = runMatchAlgorithm;
            $scope.processMatches = processMatches;  
            $scope.batchIds = batchIds;    


}]);



/****************** Settings Controller *******************/
app.controller("settingsCtrl", [
         "$scope", "$http", "$routeParams",
         function( $scope, $http, $routeParams ){

            
}]);

app.controller("settingsCtrlUser", [
  "$scope", "$http", 
  function( $scope, $http ){


}]);

app.controller("settingsCtrlAdmin", [
  "$scope", "$http", 
  function( $scope, $http ){

    $scope.restaurants = [];
    $scope.cuisines = [];
    $scope.refreshRestaurantList = refreshRestaurantList;
    $scope.refreshCuisineList = refreshCuisineList;
    $scope.selectedRestaurant = 'No restautant selected';

    refreshCuisineList();
    refreshRestaurantList();

    // get all restautant data
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

    function refreshCuisineList(){
       $http.get("/api/cuisines")
          .success( function(data){

             $scope.cuisines = data;

          })
          .error(function(data){
             console.log("Error:" + data);
          });
    }

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


}]);





/**************** User Display Controller *****************/
app.controller("lunchMatesCtrl", [
  "$scope", "$http", 
  function( $scope, $http ){

      $scope.users = [];

      // gets all user details - depending on if you are admin or normal user
      var refreshUserList = function(){
         $http.get("/api/users")
            .success( function(data){

               $scope.users = data;
               console.log("Refreshed User List", data);

            })
            .error(function(data){
               console.log("Error:" + data);
            });
      }

      refreshUserList();

}]);


app.controller("lunchMatesCtrlUser", [
  "$scope", "$http", 
  function( $scope, $http ){
      
      //add or block functionality

  }]);


app.controller("lunchMatesCtrlAdmin", [ 
   "$scope", "$http", 
   function( $scope, $http ){

      // add user / delete user / edit user functionality
      $scope.addNewUser = addNewUser;
      $scope.deleteUser = deleteUser;
      $scope.newUser = {
        'name': 'New User',
        'email': 'newuser@aedas.in',
        'password': 'password',
        'title': 'Not Provided'
      } 

      $scope.selectedUser = {'name': 'No User Selected'};

      var addNewUser = function(){
         $http.post('/api/addUser', $scope.newUser)
             .success( function(data){
               console.log("User Added. ", data);

             })
             .error( function(data){
               console.log("User not added", data);
             })

         refreshUserList();
      }

      var editUser = function( email ){

         //http post to edit

         refreshUserList();
      }

      var deleteUser = function( email ){

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

