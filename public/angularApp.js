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
   
   when("/mates", {
      templateUrl: "templates/mates.html", 
      controller: "UserDisplay"
   }).
   
   when("/preferences", {
      templateUrl: "templates/preferences.html", 
      controller: "preferenceFormCtrl"
   }).

   when("/matches", {
      templateUrl: "templates/matches.html", 
      controller: "MatchesDisplayCtrl"
   }).

   otherwise({
      templateUrl: "templates/matches.html", 
      controller: "MatchesDisplayCtrl"
   });
	
}]);






