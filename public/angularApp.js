

var app = angular
      .module("lunchedIn", ["ngMaterial", "ngRoute", "ngMdIcons", "ngDialog"])

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

app.directive('userAvatar', function() {
	return {
	  replace: true,
	  template: '<svg class="user-avatar" viewBox="0 0 128 128" height="64" width="64" pointer-events="none" display="block" > <path fill="#FF8A80" d="M0 0h128v128H0z"/> <path fill="#FFE0B2" d="M36.3 94.8c6.4 7.3 16.2 12.1 27.3 12.4 10.7-.3 20.3-4.7 26.7-11.6l.2.1c-17-13.3-12.9-23.4-8.5-28.6 1.3-1.2 2.8-2.5 4.4-3.9l13.1-11c1.5-1.2 2.6-3 2.9-5.1.6-4.4-2.5-8.4-6.9-9.1-1.5-.2-3 0-4.3.6-.3-1.3-.4-2.7-1.6-3.5-1.4-.9-2.8-1.7-4.2-2.5-7.1-3.9-14.9-6.6-23-7.9-5.4-.9-11-1.2-16.1.7-3.3 1.2-6.1 3.2-8.7 5.6-1.3 1.2-2.5 2.4-3.7 3.7l-1.8 1.9c-.3.3-.5.6-.8.8-.1.1-.2 0-.4.2.1.2.1.5.1.6-1-.3-2.1-.4-3.2-.2-4.4.6-7.5 4.7-6.9 9.1.3 2.1 1.3 3.8 2.8 5.1l11 9.3c1.8 1.5 3.3 3.8 4.6 5.7 1.5 2.3 2.8 4.9 3.5 7.6 1.7 6.8-.8 13.4-5.4 18.4-.5.6-1.1 1-1.4 1.7-.2.6-.4 1.3-.6 2-.4 1.5-.5 3.1-.3 4.6.4 3.1 1.8 6.1 4.1 8.2 3.3 3 8 4 12.4 4.5 5.2.6 10.5.7 15.7.2 4.5-.4 9.1-1.2 13-3.4 5.6-3.1 9.6-8.9 10.5-15.2M76.4 46c.9 0 1.6.7 1.6 1.6 0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6-.1-.9.7-1.6 1.6-1.6zm-25.7 0c.9 0 1.6.7 1.6 1.6 0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6-.1-.9.7-1.6 1.6-1.6z"/> <path fill="#E0F7FA" d="M105.3 106.1c-.9-1.3-1.3-1.9-1.3-1.9l-.2-.3c-.6-.9-1.2-1.7-1.9-2.4-3.2-3.5-7.3-5.4-11.4-5.7 0 0 .1 0 .1.1l-.2-.1c-6.4 6.9-16 11.3-26.7 11.6-11.2-.3-21.1-5.1-27.5-12.6-.1.2-.2.4-.2.5-3.1.9-6 2.7-8.4 5.4l-.2.2s-.5.6-1.5 1.7c-.9 1.1-2.2 2.6-3.7 4.5-3.1 3.9-7.2 9.5-11.7 16.6-.9 1.4-1.7 2.8-2.6 4.3h109.6c-3.4-7.1-6.5-12.8-8.9-16.9-1.5-2.2-2.6-3.8-3.3-5z"/> <circle fill="#444" cx="76.3" cy="47.5" r="2"/> <circle fill="#444" cx="50.7" cy="47.6" r="2"/> <path fill="#444" d="M48.1 27.4c4.5 5.9 15.5 12.1 42.4 8.4-2.2-6.9-6.8-12.6-12.6-16.4C95.1 20.9 92 10 92 10c-1.4 5.5-11.1 4.4-11.1 4.4H62.1c-1.7-.1-3.4 0-5.2.3-12.8 1.8-22.6 11.1-25.7 22.9 10.6-1.9 15.3-7.6 16.9-10.2z"/> </svg>'
	};
});

app.controller("login", [ 
	"$scope", "$http", "$ngDialog",
	function( $scope, $http ){

	}
]);

app.controller("MainCtrl", [
		"$scope", "$http", 
		function($scope, $http){
			
			$scope.loggedIn = false; 
			
			$http.get("/loginStatus")
									.success( function(data){
										console.log("loggedin", data);
										$scope.loggedIn = data;
									})
									.error(function(data){
										console.log("Error:" + data);
									});
		}
]);

app.controller("UserDisplay", [ 
	"$scope", "$http", "$routeParams",
	function( $scope, $http, $routeParams ){

		$scope.users = [];
		$scope.userDetails = {};

		// get all users data
		$http.get("/api/users")
			.success( function(data){

				if(data.statusCode == 302){
								$window.location.href = '/login'
							}

				$scope.users = data;
				console.log("Getting user", data);

				

			})
			.error(function(data){
				console.log("Error:" + data);
			});

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

		$scope.isCurrentUser = isCurrentUser; 

		function isCurrentUser( user ){

		}

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
		        if (JSON.stringify(list[i]) == JSON.stringify(obj)) {
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

	    //$scope.load();
	}

]);

app.controller("preferenceFormCtrl", [
			"$scope", "$http", "$routeParams",
			function( $scope, $http, $routeParams ){

				$scope.userDetails = {}; 
				$scope.days = [
								'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'	
								]

				$scope.cuisines = [
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

								]

				// user preference options
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


app.controller("MatchesDisplayCtrl", [
			"$scope", "$http", "$routeParams",
			function( $scope, $http, $routeParams ){
				$scope.message = "This page will be used to display add preferences";

				$scope.matches = [];

/*				$http.get("/api/matches")
						.success( function(data){

							$scope.matches = data; 
							console.log("matches", data);
						})
						.error( function( data ){
							console.log("Error: ", data);
						});*/
				
				// checking for lunch today
/*				for(var i=0; i < $scope.matches.length; i++ ){
					var lunch = $scope.matches[i];
					if(lunch.date == Date()){
						$scope.today = lunch;
						$scope.today.message = "Lunch today!";
						$scope.matches.splice(i, 1);
					}
					else*/
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
				//}

				console.log("today", $scope.today);

			}

]);
