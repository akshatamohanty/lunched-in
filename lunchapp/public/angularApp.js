/*var userDB = [{
		'name': "James Potter",
		'title': "Senior Architect",
		'phone': "902xx",
		'tagline': "Prongs",
		'enabled': true,
		'picture': 'http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg',
		'cuisine': []
	},
	{
		'name': "Sirius Black",
		'title': "Junior Architect",
		'phone': "902xx",
		'tagline': "Padfoot",
		'enabled': false,
		'picture': 'http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg',
		'cuisine': []
	},
	{
		'name': "Peter Pettigrew",
		'title': "Finance",
		'phone': "902xx",
		'tagline': "Wormtail",
		'enabled': false,
		'picture': 'http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg',
		'cuisine': []
	},
	{
		'name': "Albus Dumbledore",
		'title': "Director",
		'phone': "902xx",
		'tagline': "Phoenix",
		'enabled': true,
		'picture': 'http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg',
		'cuisine': []
	},
	{
		'name': "Remus Lupin",
		'title': "HR",
		'phone': "902xx",
		'tagline': "Moony",
		'enabled': true,
		'picture': 'http://u.lorenzoferrara.net/marlenesco/material-card/thumb-christopher-walken.jpg',
		'cuisine': []
	}
]*/

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
	'$scope', '$http',
	function( $scope, $http ){

		var userDB = [];

		$http.get('/api/users')
			.success( function(data){
				userDB = data;
				console.log(data);
			})
			.error(function(data){
				console.log('Error:' + data);
			});

		$scope.load = function(){
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
		}
		
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
						          'name': 'American',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Chinese',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Continental',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Cuban',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'French',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Greek',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Indian',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Indonesian',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Italian',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Japanese',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Korean',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Lebanese',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Malaysian',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Mexican',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Pakistani',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Russian',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Singaporean',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Spanish',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Thai',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Tibetan',
						          'icon': 'pictureaddress'
						        },
						        {
						          'name': 'Vietnamese',
						          'icon': 'pictureaddress'
						        }

						      ];

			      return cuisines.map(function (c) {
			        c._lowername = c.name.toLowerCase();
			        return c;
			      });

			    }

  			}
]);

