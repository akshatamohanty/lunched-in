app.controller("UserDisplay", [ 
	"$scope", "$http", 
	function( $scope, $http ){

		$scope.users = [];
		$scope.userDetails = {};

		$scope.newUser = {  'name': 'John Doe', 
							'email': 'johndoe@aedas.sg', 
							'password': 'pass',
							'title': 'Senior Designer'
						 };

		// get all users data
		function refreshUserList(){
			$http.get("/api/users")
				.success( function(data){

					$scope.users = data;
					console.log("Refreshed User List", data);

				})
				.error(function(data){
					console.log("Error:" + data);
				});
		}

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

		$scope.addNewUser = addNewUser;
		$scope.deleteUser = deleteUser;

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
		        if (list[i]._id == obj._id) {
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

	    function addNewUser(){
	    	$http.post('/api/add_User', $scope.newUser)
	    		 .success( function(data){
	    		 	console.log("User Added. ", data);

	    		 })
	    		 .error( function(data){
	    		 	console.log("User not added", data);
	    		 })

	    	refreshUserList();
	    }

	    function deleteUser( email ){

	    	$http.post('/api/delete_User', {'email' : email } )
	    		 .success( function(data){
	    		 	console.log("User Deleted. ", data);

	    		 })
	    		 .error( function(data){
	    		 	console.log("User not deleted", data);
	    		 })

	    	refreshUserList();
	    }
	}

]);