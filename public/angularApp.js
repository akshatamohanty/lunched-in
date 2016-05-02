/*
 *  Akshata Mohanty, February 2016
 *  Angular App - LunchedIn
 */


/*
 *  App Defintion and Configuration
 */
var app = angular
      .module("lunchedIn", ["ngMaterial", "ngRoute", "ngResource"])
      .config(function($mdThemingProvider) {
		  $mdThemingProvider.theme('default')
		    .primaryPalette('red')
		});

/*
 *  Routing
 */
app.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
   $routeProvider.
    
    when("/logout", {
      templateUrl: "templates/logout.html", 
   }).

    otherwise({
      templateUrl: "templates/user_dashboard.html", 
      controller: "user"
    });

	 $locationProvider.html5Mode(true);
   
}]);


/***************** Main Controller ************************************/
app.controller("MainCtrl", [
      "$scope", "$http",
      function($scope, $http){

        $scope.loggedInUser = null;


         
        $http.get("/api/getLoggedInUser")
                         .success( function(data){

                            if( data ){
                               $scope.loggedInUser = data; 
                               console.log("User is logged in.", data);
                            }
                            else
                               console.log("User is not logged in.");

                         })
                         .error(function(data){
                            console.log("Error:" + data);
                         });
        


      }
]);

app.controller("user", [
      "$scope", "$http",
      function($scope, $http){

        $scope.active_user = null;

        $scope.cuisines = [];

        $scope.letters = ["A", "B", "C", "D", "E", "F",
         "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

        $scope.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        $scope.users = [];
        $scope.usersAlpha = [];

        $http.get("/api/cuisines")
          .success( function(data){

             $scope.cuisines = data; 
          })
          .error(function(data){
             console.log("Error:" + data);
        });

        var resetUser = function (){
          $http.get("/api/getLoggedInUser")
                         .success( function(data){

                            if( data ){
                                $scope.active_user = data; 
                                $http.get("/api/users")
                                  .success( function(data){
                                     
                                     $scope.users = data;

                                     // Initializing Alpha
                                     for(var i=0; i<$scope.letters.length; i++)
                                        $scope.usersAlpha[ $scope.letters[i] ] = [];

                                     for(var i=0; i<data.length; i++){
                                        if(data[i].email == $scope.active_user.email)
                                          continue;
                                        $scope.usersAlpha[ data[i].name[0].toUpperCase() ].push( data[i] ); 
                                     }

                                     console.log($scope.usersAlpha);
                                    
                                  })
                                  .error(function(data){
                                     console.log("Error:" + data);
                                  });
                                                
                            }
                            else
                               console.log("User is not logged in.");

                         })
                         .error(function(data){
                            console.log("Error:" + data);
                         });
        }
        resetUser();

        $scope.toggle = function (item, list) {

          if(list){
            var idx = list.indexOf(item);
            if (idx > -1) {
              list.splice(idx, 1);
            }
            else {
              list.push(item);
            }
          }
        };

        $scope.exists = function (item, list) {
          //console.log("exists");
          if(list)
            return list.indexOf(item) > -1;
          else
            return false;
        };

        $scope.updateUser = function(){

            if ($scope.active_user.blocked == null)
                $scope.active_user.blocked = [];
            if ($scope.active_user.known == null)
                $scope.active_user.known = [];
            if ($scope.active_user.cuisine == null)
                $scope.active_user.cuisine = [];
            if ($scope.active_user.available == null)
                $scope.active_user.available = [];
            
            console.log($scope.active_user);
            
            $.post('/api/editUser', $scope.active_user, function(data,status,xhr){

                  resetUser();
                  console.log($scope.active_user, status);
            })
        };

}]);

app.controller("admin", [
      "$scope", "$http",
      function($scope, $http){
 /*
        $scope.selectedUser = null;
        $scope.selectedRestaurant = null;

        $scope.matches = [];
        $scope.restaurants = []

        $http.get("/api/matches")
                         .success( function(data){

                            if( data ){
                                $scope.matches = data; 
                                             
                            }
                            else
                               console.log("Error getting matches");

                         })
                         .error(function(data){
                            console.log("Error:" + data);
                         });
        $http.get("/api/lunches")
                 .success( function(data){

                    if( data ){
                        $scope.matches = data; 
                                     
                    }
                    else
                       console.log("Error getting matches");

                 })
                 .error(function(data){
                    console.log("Error:" + data);
                 });

        $http.get("/api/restaurants")
                 .success( function(data){

                    if( data ){
                        $scope.restaurants = data; 
                                     
                    }
                    else
                       console.log("Error getting matches");

                 })
                 .error(function(data){
                    console.log("Error:" + data);
                 });

        $scope.toggle = function (item, list) {
          if(list){
            var idx = list.indexOf(item);
            if (idx > -1) {
              list.splice(idx, 1);
            }
            else {
              list.push(item);
            }
          }
        };

        $scope.exists = function (item, list) {
          if(list)
            return list.indexOf(item) > -1;
          else
            return false;
        };

        $scope.updateUserByAdmin = function(selectedUser){
                  if (selectedUser.blocked == null)
                      selectedUser.blocked = [];
                  if (selectedUser.known == null)
                      selectedUser.known = [];
                  if (selectedUser.cuisine == null)
                      selectedUser.cuisine = [];
                  if (selectedUser.available == null)
                      selectedUser.available = [];
            $.post('/api/editUser', selectedUser, function(data,status,xhr){
              
              console.log(status);
            })
        };

        $scope.updateRestaurant = function(){

            $.post('/api/editUser', $scope.selectedRestaurant, function(data,status,xhr){
              console.log(status);
            })
        };
*/
      }
]);
