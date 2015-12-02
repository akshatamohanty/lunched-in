var app = angular.module('lunchedIn', []);

app.controller('UserDisplay', [
	'$scope',
	function( $scope ){

		$scope.users = [
			{	name:'Akshata',
				title: 'Senior Designer',
				level: 3,
				phone: 90154732 },
			{	name:'Rajiv',
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