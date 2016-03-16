app.controller("preferenceFormCtrl", [
			"$scope", "$http", "$routeParams",
			function( $scope, $http, $routeParams ){

				$scope.userDetails = $scope.loggedInUser; 
				$scope.days = [
								'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'	
								]

				/********** Admin Component - Cuisine Related ********************/
				// get the cuisines from the server
				$scope.cuisines = []
				$scope.newCuisine = "";

				function refreshCuisineList(){
					console.log("Refreshing Cuisine List");
					$http.get("/api/cuisines")
						.success( function(data){

							$scope.cuisines = data;

						})
						.error(function(data){
							console.log("Error:" + data);
						});
				}
				// initialization
				refreshCuisineList();
				

				$scope.addCuisine = function( cuisineName, cuisinePicture ){ console.log("Adding Cuisine", $scope.newCuisine);
					$http.post('/api/addCuisine', { 'cuisineName': $scope.newCuisine })
										 .success(function(data){
										 	console.log("New Cuisine Added");
										 	$scope.cuisines = data;
										 	$scope.newCuisine = "";
										 })
										 .error(function(data){
										 	console.log('Error:', data);
										 });
				}


				/*************** admin Component : Restaurant related **********************/
				$scope.restaurants;
				$scope.newRestaurant = {
					'code': "0001",
					'name' : 'Restaurant1',
					'address' : 'Address',
					'cuisine': [],
					'scheduled': 0,
					'total': 0
				};

				// get all users data
				function refreshRestaurantList(){
					$http.get("/api/restaurants")
						.success( function(data){

							$scope.restaurants = data;
							console.log("Refreshed User List", data);

						})
						.error(function(data){
							console.log("Error:" + data);
						});
				}

				$scope.addNewRestaurant = function(){
			    	$http.post('/api/add_Restaurant', $scope.newRestaurant)
			    		 .success( function(data){
			    		 	console.log("Restaurant Added. ", data);

			    		 })
			    		 .error( function(data){
			    		 	console.log("Restaurant not added", data);
			    		 })

			    	refreshRestaurantList();
			    }

			    $scope.deleteRestaurant = function ( code ){

			    	$http.post('/api/delete_Restaurant', {'code' : code } )
			    		 .success( function(data){
			    		 	console.log("Restaurant Deleted. ", data);

			    		 })
			    		 .error( function(data){
			    		 	console.log("Restaurant not deleted", data);
			    		 })

			    	refreshRestaurantList();
			    }



			    				// user preference options
/*				$http.get("/api/user_pref")
						.success( function(data){

							if(data.statusCode == 302){
								$window.location.href = '/login'
							}

							$scope.userDetails = data;
							//console.log("preference", data);

						})
						.error(function(data){
							console.log("Error:" + data);
						});*/
		
		      	
		      	/*************** user component *********************************/
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