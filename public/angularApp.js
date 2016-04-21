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

app.controller('Controller', ['$scope', function($scope) {
  $scope.naomi = { name: 'Naomi', address: '1600 Amphitheatre' };
  $scope.igor = { name: 'Igor', address: '123 Somewhere' };
}])
.directive('user-card', function() {
  return {
    restrict: 'E',
    scope: {
      userInfo: '=info'
    },
    templateUrl: 'user-card.html'
  };
});

/***************** Main Controller ************************************/
app.controller("MainCtrl", [
      "$scope", "$http",
      function($scope, $http){

        $scope.loggedInUser = null;
        $scope.logout = logoutFunction; 

        $scope.cuisines = [];

        $scope.letters = ["A", "B", "C", "D", "E", "F",
         "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
         
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

        $scope.loggedInUser = null;
        $scope.saveUser = saveUser;
        $scope.n=0;
        $scope.nMod = function(mod){

          if(mod)
            $scope.n-2>-1)?$scope.n-=2:$scope.n;
          else
            $scope.n+2<cuisines.length)?$scope.n-=2:$scope.n;

        }
        $scope.decN = (n+2<cuisines.length)?n=n+2:n=n

        var saveUser = function(){
          console.log("Saving :", $scope.loggedInUser);
        };

        $http.get("/api/getLoggedInUser")
               .success( function(data){

                  if( data ){
                     $scope.loggedInUser = data; 
                  
                  }
                  else
                     console.log("User is not logged in.");

               })
               .error(function(data){
                  console.log("Error:" + data);
               });

          $scope.users = [];
/*          $http.get("/api/users")
              .success( function(data){

                 $scope.users = data;
                 console.log("Refreshed User List", data);

              })
              .error(function(data){
                 console.log("Error:" + data);
              });*/
      }
]);

app.controller("admin", [
      "$scope", "$http",
      function($scope, $http){

         $scope.loggedInUser = null;
         $scope.logout = logoutFunction; 

      }
]);
