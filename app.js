		//pseudo database
		function random_character() {
		    var chars = "ABCDEFGHIJKLMNOPQURSTUVWXYZ";
		    return chars.substr( Math.floor(Math.random() * 62), 1);
		}
		var userDB = [];
		for(var i=0; i<150; i++){
			var user = {
				'name': random_character()+"_userID_"+i,
				'title': "Title",
				'phone': "902xx"+i,
				'tagline': "Tagline for userID"+ i,
				'enabled': true
			}
			userDB.push(user);
		}

var app = angular
      .module('lunchedIn', ['ngMaterial', 'ngRoute', 'ngMdIcons'])

app.config(['$routeProvider', function($routeProvider) {
   $routeProvider.
   
   when('/mates', {
      templateUrl: 'templates/mates.html', controller: 'UserDisplay'
   }).
   
   when('/preferences', {
      templateUrl: 'templates/preferences.html', controller: 'preferenceFormCtrl'
   }).

   when('/matches', {
      templateUrl: 'templates/matches.html', controller: 'preferenceFormCtrl'
   }).
   
   otherwise({
      redirectTo: '/matches'
   });
	
}]);


app.controller('UserDisplay', [
	'$scope',
	function( $scope ){
		$scope.chars = "ABCDEFGHIJKLMNOPQURSTUVWXYZ";
		$scope.message = "This page will be used to display users";
		$scope.users = userDB.map(function (c) {
	        				c._lowername = c.name.toLowerCase();
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
	      // If it is an object, it's already a known chip
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

	}

])

app.controller('preferenceFormCtrl', [
			'$scope',
			function( $scope ){
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
			      // If it is an object, it's already a known chip
			      if (angular.isObject(chip)) {
			        return chip;
			      }
			    }
			    /**
			     * Search for cuisines.
			     */
			    function querySearch (query) {
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
			          'name': 'Indian',
			          'resCount': 12
			        },
			        {
			          'name': 'Chinese',
			          'resCount': 15
			        },
			        {
			          'name': 'Japanese',
			          'resCount': 2
			        },
			        {
			          'name': 'Thai',
			          'resCount': 4
			        },
			        {
			          'name': 'Italian',
			          'resCount': 7
			        }
			      ];

			      return cuisines.map(function (c) {
			        c._lowername = c.name.toLowerCase();
			        return c;
			      });

			    }

  			}
]);


