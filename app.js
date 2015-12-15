		//pseudo database
		function random_character() {
		    var chars = "ABCDEFGHIJKLMNOPQURSTUVWXYZ";
		    return chars.substr( Math.floor(Math.random() * 62), 1);
		}
		var userDB = [];
		for(var i=0; i<150; i++){
			var user = {
				'name': random_character()+"Christopher Walken",
				'title': "Senior Architect",
				'phone': "902xx"+i,
				'tagline': "The Deer Hunter",
				'enabled': true,
				'picture': 'http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg'
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
	      // If it is an object, it's already a known chip
	      if (angular.isObject(chip)) {
	        return chip;
	      }
	    }
	    /**
	     * Search for cuisines.
	     */
	    function querySearch (query, exact) {
	      var results = query ? $scope.users.filter(createFilterFor(query, exact)) : [];
	      return results;
	    }
	    /**
	     * Create filter function for a query string
	     */
	    function createFilterFor(query, exact) {
	      var lowercaseQuery = angular.lowercase(query);
	      return function filterFn(user) {
	      			if(exact)
	      				return (user._lowername.indexOf(lowercaseQuery) === 0)
	      			else
			        	return (user._lowername.indexOf(lowercaseQuery) > -1 || user._lowername.indexOf(lowercaseQuery) > -1)
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


$(function() {
        $('.material-card > .mc-btn-action').click(function () {
            var card = $(this).parent('.material-card');
            var icon = $(this).children('i');
            icon.addClass('fa-spin-fast');

            if (card.hasClass('mc-active')) {
                card.removeClass('mc-active');

                window.setTimeout(function() {
                    icon
                        .removeClass('fa-arrow-left')
                        .removeClass('fa-spin-fast')
                        .addClass('fa-bars');

                }, 800);
            } else {
                card.addClass('mc-active');

                window.setTimeout(function() {
                    icon
                        .removeClass('fa-bars')
                        .removeClass('fa-spin-fast')
                        .addClass('fa-arrow-left');

                }, 800);
            }
        });
    });