var app = angular
      .module('lunchedIn', ['ngMaterial'])

app.controller('UserDisplay', [
	'$scope',
	function( $scope ){

		$scope.users = [
			{	name:'user1',
				title: 'Senior Designer',
				level: 3,
				phone: 123414 },
			{	name:'user2',
				title: 'Business Associate',
				level: 1,
				phone: 7588739188 }
		];

		$scope.addUser = function(){
			if(!$scope.name || $scope.name === '') { return; }
			
			$scope.users.push(
				{	
					name: $scope.name,
					title: $scope.title, 
					level: $scope.level,
					phone: $scope.phone
				});
  			
  			$scope.name = '';
  			$scope.title = '';
  			$scope.level = '';
  			$scope.phone = '';
		};

	}

]);

app.controller('preferenceFormCtrl', [
			'$scope',
			function( $scope ){
				
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
