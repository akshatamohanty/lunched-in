app.controller("MatchesDisplayCtrl", [
			"$scope", "$http", 
			function( $scope, $http ){

				$scope.matches = [];

				$scope.getMatches = getMatches; 
				var getMatches = function(){
					$http.get("/api/matches")
						.success( function(data){
							$scope.matches = data; 
						})
						.error( function( data ){
							console.log("Error: ", data);
						});
				}

				$scope.match = function(){
					$http.get('/api/runMatchAlgorithm')
						 .success( function(data){
						 	getMatches();
						 })
						 .error( function(err){
						 	console.log("Error: ", data);
						 })
				}

				function processMatches(){
					// checking for lunch today
					for(var i=0; i < $scope.matches.length; i++ ){
						var lunch = $scope.matches[i];
						if(lunch.date){
							$scope.today = lunch;
							$scope.today.message = "Lunch today!";
							$scope.matches.splice(i, 1);
						}
						else
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
					}

					console.log("today", $scope.today);
				}

			}

]);