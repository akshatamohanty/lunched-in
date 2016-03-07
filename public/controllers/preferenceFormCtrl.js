app.controller("preferenceFormCtrl", [
			"$scope", "$http", "$routeParams",
			function( $scope, $http, $routeParams ){

				$scope.userDetails = $scope.loggedInUser; 
				$scope.days = [
								'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'	
								]

				// should be a factory
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

  			}
]);