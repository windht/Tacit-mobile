var bapp = angular.module('lab.mobile.event', []);

bapp.run(function($cordovaPush,$rootScope,socket,$timeout,$ionicActionSheet,Device,$cordovaFile,$cordovaDevice,$http,$httpBackend,$ionicPlatform, Auth,$localstorage,$state,$cordovaNetwork,$cordovaToast,$rootScope,$cordovaKeyboard,$cordovaStatusbar) {
	$ionicPlatform.ready(function() {
		

	    if ($localstorage.get('deviceToken')!=null) {
	    	if (Auth.user) {
	    		socket.emit('deviceToken',{token:$localstorage.get('deviceToken'),user:Auth.user});
	    	}
	    }
	    else {
	    	var config = {
		        "badge": true,
		        "sound": true,
		        "alert": true,
		    };
	    	$cordovaPush.register(config).then(function(result) {
		      if (Auth.user) {
		        socket.emit('deviceToken',{token:result,user:Auth.user});
		      }
		      else {
		        Device.token=result;
		      }
		      $localstorage.set('deviceToken',result);
		    }, function(err) {
		      alert("Registration error: " + err)
		    });
	    }

	    
	    $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
	      if (notification.alert) {
	        navigator.notification.alert(notification.alert);
	      }

	      if (notification.sound) {
	        var snd = new Media(event.sound);
	        snd.play();
	      }

	      if (notification.badge) {
	        $cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
	          // Success!
	        }, function(err) {
	          // An error occurred. Show a message to the user
	        });
	      }
	    });



		$ionicPlatform.on('offline',function(){
			Device.isOnline=false;
		});
		$ionicPlatform.on('online',function(){
			Device.isOnline=true;
		});
		$ionicPlatform.on('pause',function(){
			Device.focus=false;
			console.log(Device.focus);
		});
		$ionicPlatform.on('resume',function(){
	  		$timeout(function(){
	  			Device.focus=true;
	  			console.log(Device.focus);
	  			if (Auth.isLoggedIn) {
	  				socket.emit('login',{username:Auth.user});
	  			}	
	  			else {
	  				Auth.authorize({
				      type:'mobile',
				      username:$localstorage.get('username'),
				      token:$localstorage.get('token')
				    },function(res){
				      Auth.user=$localstorage.get('username');
				      Auth.isLoggedIn=true;
				      socket.emit('login',{username:Auth.user});
				      $('.auth-mask').addClass('done');
				      $state.go('tab.dash');
				    },function(err){
				      $localstorage.set('username','');
				      $localstorage.set('token','');
				      $state.go('auth.login');
				      // $state.go('tab.dash');
				      $('.auth-mask').addClass('done');
				  	})
	  			}
	  		},0)
		});

	})
})
