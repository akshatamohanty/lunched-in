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
    
    when("/", {
      templateUrl: "templates/user_dashboard.html", 
      controller: "user"
   }).

    when("/admin", {
      templateUrl: "templates/admin_dashboard.html", 
      controller: "admin"
   }).

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
        $scope.logout = logoutFunction; 

        $scope.cuisines = [];

        $scope.letters = ["A", "B", "C", "D", "E", "F",
         "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

        $scope.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        $scope.users = [];
        $http.get("/api/users")
            .success( function(data){
               $scope.users = data; console.log("All users loaded", data);
            })
            .error(function(data){
               console.log("Error:" + data);
            });
         
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
        $http.get("/api/cuisines")
          .success( function(data){

             $scope.cuisines = data; 
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

app.controller("user", [
      "$scope", "$http",
      function($scope, $http){

        $scope.active_user = null;


        $http.get("/api/getLoggedInUser")
                         .success( function(data){

                            if( data ){
                                $scope.active_user = data; 
                                // fix null values
                                if($scope.active_user.cuisines == null)
                                  $scope.active_user.cuisines = [];
                                if($scope.active_user.available == null)
                                  $scope.active_user.available = [];
                                if($scope.active_user.blocked == null)
                                  $scope.active_user.blocked = [];
                                if($scope.active_user.known == null)
                                  $scope.active_user.known = [];                            
                            }
                            else
                               console.log("User is not logged in.");

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

        $scope.updateUser = function(){

            $.post('/api/editUser', $scope.active_user, function(data,status,xhr){
              console.log(status);
            })
        };

}]);

app.controller("admin", [
      "$scope", "$http",
      function($scope, $http){

         $scope.loggedInUser = null;
         $scope.logout = logoutFunction; 

      }
]);
