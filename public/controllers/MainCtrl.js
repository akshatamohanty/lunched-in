app.controller("MainCtrl", [
		"$scope", "$http", 
		function($scope, $http){
			
			$scope.loggedIn; 
			$scope.loggedInUser = {};
			
			$http.get("/api/getLoggedInUser")
									.success( function(data){

										if( data ){
											$scope.loggedIn = true;
											$scope.loggedInUser = data; 
										}

									})
									.error(function(data){
										console.log("Error:" + data);
									});

		    $scope.logout = function(){
		    	$http.get("/logout")
		    		 .success( function(data){
							$scope.loggedIn = false;
		    		 });
		    }
		}
]);
