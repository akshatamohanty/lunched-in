

var app = angular
      .module("lunchedIn", ["ngMaterial", "ngRoute", "ngMdIcons"])

app.config(["$routeProvider", function($routeProvider) {
   $routeProvider.
   
   when("/mates/:param", {
      templateUrl: "templates/mates.html", 
      controller: "UserDisplay"
   }).
   
   when("/preferences/:param", {
      templateUrl: "templates/preferences.html", 
      controller: "preferenceFormCtrl"
   }).

   when("/matches/:param", {
      templateUrl: "templates/matches.html", 
      controller: "MatchesDisplayCtrl"
   }).
   
   otherwise({
      redirectTo: "/matches/1"
   });
	
}]);


app.controller("UserDisplay", [ 
	"$scope", "$http", "$routeParams",
	function( $scope, $http, $routeParams ){

		var userDB = [];

		$http.get("/api/users/" + $routeParams.param)
			.success( function(data){
				userDB = data;
				console.log(data);

				//jquery
				$(".material-card > .mc-btn-action").click(function () { 
			                      var card = $(this).parent(".material-card");
			                      var icon = $(this).children("i");
			                      icon.addClass("fa-spin-fast");

			                      if (card.hasClass("mc-active")) {
			                          card.removeClass("mc-active");

			                          window.setTimeout(function() {
			                              icon
			                                  .removeClass("fa-arrow-left")
			                                  .removeClass("fa-spin-fast")
			                                  .addClass("fa-bars");

			                          }, 800);
			                      } else {
			                          card.addClass("mc-active");

			                          window.setTimeout(function() {
			                              icon
			                                  .removeClass("fa-bars")
			                                  .removeClass("fa-spin-fast")
			                                  .addClass("fa-arrow-left");

			                          }, 800);
			                      }
			                  });
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
		$scope.users = userDB.map(function (c) {
	        				c._lowername = c.name.toLowerCase();
	        				c._title = c.title.toLowerCase();
	        				return c;
	      				});

		$scope.selectedItem = null;
		$scope.searchText = null;
		$scope.querySearch = querySearch;
		$scope.selectedUsers = [];
		$scope.transformChip = transformChip;
    
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

	    //$scope.load();
	}

]);

app.controller("preferenceFormCtrl", [
			"$scope", "$http", "$routeParams",
			function( $scope, $http, $routeParams ){

				$scope.userDetails = {}; 

				// user preference options
				$http.get("/api/user_pref/" + $routeParams.param)
						.success( function(data){

							$scope.userDetails = data[0];
							//console.log("preference", data);

						})
						.error(function(data){
							console.log("Error:" + data);
						});
		

				$scope.message = "This page will be used to display add preferences";
				// cuisine preference

			    $scope.selectedItem = null;
				$scope.searchText = null;
				$scope.querySearch = querySearch;
				$scope.cuisines = loadCuisines();
				$scope.selectedCuisines = [];
				$scope.transformChip = transformChip;
		    
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
			    function querySearch (query) { console.log("querying for", query);
			      var results = query ? $scope.cuisines.filter(createFilterFor(query)) : [];
			      return results;
			    }
			    /**
			     * Create filter function for a query string
			     */
			    function createFilterFor(query) {
			      var lowercaseQuery = angular.lowercase(query);
			      return function filterFn(cuisine) {
					        return (cuisine._lowername.indexOf(lowercaseQuery) === 0)
					     };
			    }


			   	function loadCuisines() {
						      var cuisines = [
						        {
						          "name": "American",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Chinese",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Continental",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Cuban",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "French",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Greek",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Indian",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Indonesian",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Italian",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Japanese",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Korean",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Lebanese",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Malaysian",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Mexican",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Pakistani",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Russian",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Singaporean",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Spanish",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Thai",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Tibetan",
						          "icon": "pictureaddress"
						        },
						        {
						          "name": "Vietnamese",
						          "icon": "pictureaddress"
						        }

						      ];

			      return cuisines.map(function (c) {
			        c._lowername = c.name.toLowerCase();
			        return c;
			      });

			    }

  			}
]);


app.controller("MatchesDisplayCtrl", [
			"$scope", "$http", "$routeParams",
			function( $scope, $http, $routeParams ){
				$scope.message = "This page will be used to display add preferences";

				$scope.lunches = [];

				$http.get("/api/matches/" + $routeParams.param )
						.success( function(data){
							$scope.lunches = data; 
							console.log(data);
						})
						.error( function( data ){
							console.log("Error: ", data);
						});
				
				// checking for lunch today
				for(var i=0; i < $scope.lunches.length; i++ ){
					var lunch = $scope.lunches[i];
					if(lunch.date == "date1"){
						$scope.today = lunch;
						$scope.today.message = "Lunch today!";
						$scope.lunches.splice(i, 1);
					}
					else
						$scope.today = {
							"message" : "No Lunch Today",
							"date" : "",
							"participants": "",
							"restaurant": ""
						}
				}
			}

]);
