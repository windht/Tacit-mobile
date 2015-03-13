angular.module('lab.controllers', [])

.controller('MainCtrl', function($sce,Func,$cordovaFile,$ionicScrollDelegate,socket,Chat,$cordovaDevice,Device,$ionicPopover,$cordovaBarcodeScanner,$ionicSlideBoxDelegate,Upload,$cordovaFile,$cordovaCamera,$ionicNavBarDelegate,Auth,$rootScope,$scope,$state,$ionicLoading,$ionicModal,$cordovaKeyboard,$ionicSideMenuDelegate) {
    $scope.Func=Func;
    $scope.Auth=Auth;
    $scope.state=$state;
    $scope.headsrc="img/chol.jpg";
    $scope.commtabstatus="connect";
    $scope.currentslide=0;
    $ionicPopover.fromTemplateUrl('templates/cooperation/corp-add.html', {
        scope: $scope,
      }).then(function(popover) {
        $scope.popover = popover;
    });
    $scope.trust=function(input) {
        return $sce.trustAsHtml(input);
    }

    $scope.trustAsResource=function(input) {
        return $sce.trustAsResourceUrl(input)
    }

    $scope.refreshTask=function() {
        socket.emit('update task',{
            room:'buildmind'
        })
    }

    socket.on('task information',function(){
      $scope.$broadcast('scroll.refreshComplete');
    })

    $scope.savemsg=function(data) {
        $cordovaFile.readAsText('/friends.json').then(function(result){
            var file = JSON.parse(result);
            file[Chat.currentIndex].msg.push({
                type:data.type,
                content:data.msg
            });
            var writefile = JSON.stringify(file);
            var options={
              append:false
            }
            $cordovaFile.writeFile('/friends.json',writefile,options).then(function(){
            },function(err){
            })
          },function(err){
            alert('read error '+err.code);
          })
    }

    $scope.addNewMeetingGroup=function() {
        socket.emit('create a new meeting space',{
            roomname:'buildmind',
            members:["TonyChol","cpycpy","windht","litao","xxye",'ballack']
        })
    }


    $scope.resetboard=function() {

    }

    $scope.toggleLeftMenu=function() {
        $ionicSideMenuDelegate.toggleLeft();
    }
    $scope.changetab=function(des) {
        if (des=="connect") {
            $scope.commtabstatus="connect";
            $ionicSlideBoxDelegate.slide(0);
        }
        else {
            $scope.commtabstatus="network";
            $ionicSlideBoxDelegate.slide(1);
        }
    }

    $scope.corpadd=function($event) {
        $scope.popover.show($event);
    }

    $scope.getpic=function() {
        var options = {
        quality : 75,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit : true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 100,
        targetHeight: 100,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      $cordovaCamera.getPicture(options).then(function(imageURI) {
        $scope.headsrc=imageURI;
        Upload.src.headicon=imageURI;
      }, function(err) {
        // An error occurred. Show a message to the user
      });
    }

    $scope.upload=function() {
        $cordovaFile
        .uploadFile(Upload.server, Upload.src.headicon, Upload.option.img)
        .then(function(r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
        }, function(error) {
            alert("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
        }, function (progress) {

        });

    }

	$scope.goto=function(state,param){
        $scope.popover.hide();
        $ionicSideMenuDelegate.toggleLeft(false);
		$state.go(state,param);
	}

    $scope.slideto=function(index) {
        $ionicSlideBoxDelegate.$getByHandle('commslide').slide(index);
        $scope.currentslide=index;
    }

    

    $scope.showloading=function() {
        $ionicLoading.show({
            templateUrl:'templates/widget/loading.html'
        });
    }

    $scope.hideloading=function() {
        $ionicLoading.hide()
    }

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

    })
    $scope.$on('$destroy', function() {
        $scope.popover.remove();
    });
})

.controller('DashCtrl', function(Sound,Chat,socket,Device,Task,$ionicHistory,Func,$ionicNavBarDelegate,Auth,Friends,$ionicSideMenuDelegate,$ionicSlideBoxDelegate,$scope,$ionicModal,$http) {
    $scope.Friends=Friends;
    $scope.Task=Task;
    $scope.Auth=Auth;
    $scope.Chat=Chat;


    $scope.play=function(){

    }

    $scope.selectFriend=function(index){
        Friends.selected=index;
        if (Friends.list[index].unread!=0) {
            Device.toRead-=Friends.list[index].unread;
            Friends.list[index].unread=0;
            // 修改未读
            // var win = window.gui.Window.get();
            // win.setBadgeLabel(Device.toRead);
            // if (Device.toRead==0) {
            //     win.setBadgeLabel(-1);
            // }  
        }
        $scope.goto('tab.chat',{friendIndex:index});
    }


    $scope.$on('$ionicView.beforeEnter',function(){

    })

    $scope.$on('$ionicView.beforeLeave',function(){
        
    })

    $scope.$on('$ionicView.afterLeave',function(){
        Func.sideMenu=false;
    })

    

    $scope.$on('$ionicView.enter', function(){

    });

    $scope.doRefresh = function() {
        $http.get('/new-items')
         .success(function(newItems) {
           $scope.items = newItems;
         })
         .finally(function() {
           // Stop the ion-refresher from spinning
           $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.logout = function() {
        Auth.logout({
            username: Auth.user
        },
        function() {
            Auth.isLoggedIn=false;
            socket.emit('logout',{username:Auth.user});
            $localstorage.set('username','');
            $localstorage.set('token','');
            $scope.goto('auth');
        },
        function(err) {
            console.log(err);
        });
    };
})

.controller('ChatCtrl', function($rootScope,$ionicHistory,$state,Focus,$ionicScrollDelegate,Friends,Device,$stateParams,$scope,$cordovaKeyboard,socket,Auth,Chat) {
    Chat.currentIndex = $stateParams.friendIndex;
    $scope.Chat=Chat;
    $scope.Friends=Friends;
    $scope.Device=Device;
    window.addEventListener('native.keyboardshow', function(event){
        $scope.$emit('native.keyboardshow',{event:event});
        $scope.$apply();
    });
    window.addEventListener('native.keyboardhide', function(event){
        $scope.$emit('native.keyboardhide',{event:event});
        $scope.$apply();
    });

    $scope.sendmsg=function() {

        var hashkey=new Date().getTime()+'-'+Math.floor(Math.random()*5);
        Chat.record[Chat.currentIndex].msg.push({
            hashkey:hashkey,
            from:Auth.user,
            content:Chat.input.replace(/\r?\n/g, '<br />'),
            type:'self',
            contentType:'text',
            sentStatus:1    // 0 for failed, 1 for pending, 2 for success
        });
        $ionicScrollDelegate.$getByHandle('chat-box').scrollBottom(true,true);
        Chat.hash+=1;
        

        if (Friends.list[Chat.currentIndex].name=="Tacit"){
            socket.emit('msg sent to admin',{
                user:Auth.user,
                msg:Chat.input.replace(/\r?\n/g, '<br />'),
                hashkey:hashkey,
                contentType:'text'
            })
        }
        if (Friends.list[Chat.currentIndex].name=="xiaodoubi"){
            socket.emit('msg sent to robot',{
                user:Auth.user,
                msg:Chat.input.replace(/\r?\n/g, '<br />'),
                hashkey:hashkey,
                contentType:'text'
            })
        }
        if (Friends.list[Chat.currentIndex].name=="Turing Robot"){
            socket.emit('msg sent to turing',{
                user:Auth.user,
                msg:Chat.input.replace(/\r?\n/g, '<br />'),
                hashkey:hashkey,
                contentType:'text'
            })
        }
        else {
            socket.emit('msg sent to friend',{
                user:Auth.user,
                hashkey:hashkey,
                msg:Chat.input.replace(/\r?\n/g, '<br />'),
                friend:Friends.list[Chat.currentIndex].name,
                contentType:'text'
            })
        }
        Chat.input='';
        Focus('chat-textarea');
    }

    $scope.goBack=function(){
        $ionicHistory.goBack();
    }

    $scope.showEmoji=function() {
        $('#emoji-board').show();
        $('#add-board').hide();
        $('#chat-content').animate({top:"-150px"});
        $ionicScrollDelegate.$getByHandle('chat-box').resize();
    }

    $scope.showAdd=function() {
        $('#emoji-board').hide();
        $('#add-board').show();
        $('#chat-content').animate({top:"-150px"});
        $ionicScrollDelegate.$getByHandle('chat-box').resize();
    }

    $scope.$on('$ionicView.beforeEnter',function(){

    })

    $scope.$on('$ionicView.beforeLeave',function(){
        
    })
})

.controller('SettingCtrl', function($scope,socket,Auth,$localstorage) {

    $scope.$on('$ionicView.beforeEnter',function(){
       
    })

    $scope.$on('$ionicView.beforeLeave',function(){
          
    })
})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('NewMeetingCtrl', function($scope) {
  $scope.selected=1;
  $scope.meetinglength=30;
  $scope.options = {
      format: 'yyyy-mm-dd', // ISO formatted date
      onClose: function(e) {
        // do something when the picker closes   
      }
    }
  
})

.controller('AccountCtrl', function($scope) {
})

.controller('AuthCtrl', function($ionicHistory,$ionicNavBarDelegate,$ionicSlideBoxDelegate,$cordovaTouchID,$scope,Auth,socket,$localstorage,$rootScope,$ionicPopup,$ionicLoading,Device) {
	$scope.rememberme = true;
    $scope.Device=Device;

    $scope.$on('$ionicView.enter', function(){
        $ionicSlideBoxDelegate.$getByHandle('authslide').enableSlide(false);
        $ionicSlideBoxDelegate.$getByHandle('authslide').update();
        $ionicHistory.nextViewOptions({
          disableAnimate: false,
          disableBack: true,
          historyRoot:true
        });
    });

    $scope.$on('$ionicView.afterLeave', function(){
        
    });

    $scope.slideto=function(to) {
        if(to=='login') {
            $ionicSlideBoxDelegate.$getByHandle('authslide').slide(0);
        }
        else {
            $ionicSlideBoxDelegate.$getByHandle('authslide').slide(1);
        }
    }
    
    $scope.checkTouchID=function() {
        if (Device.supportTouchID) {
            $cordovaTouchID.authenticate("请验证TouchID").then(function() {
                $scope.goto('tab.dash');
            }, function () {
                $ionicPopup.alert({
                 title: '失败！',
                 template: 'TouchID认证错误！'
                });
            });
        } 
    }
    $scope.login = function() {
        $scope.showloading();
        Auth.login({
        		type:"mobile",
                userinfo: $scope.login.userinfo,
                password: $scope.login.password,
                rememberme: $scope.rememberme
            },
            function(res) {
                $scope.hideloading();
            	Auth.isLoggedIn=true;
            	Auth.user=res.username;
            	socket.emit('login',{username:Auth.user});
            	$localstorage.set('username',res.username);
            	$localstorage.set('token',res.usersession);
               	$scope.goto('tab.dash');
            },
            function(err,status) {
                var errortext=''
                $scope.hideloading();
            	console.log(status);
                if (status==404)
                {
                    errortext='网络无法连接！'
                }
                if (status==401)
                {
                    errortext='用户名或密码错误'
                }
                $ionicPopup.alert({
			     title: '错误',
			     template: errortext
			    });
                $rootScope.error = "用户名或密码不存在！";
            });
    };

    $scope.register = function() {
        
        if($scope.signform.$valid) {
            $scope.showloading();
            Auth.register({
            		type:"mobile",
                    username: $scope.user.username,
                    email: $scope.user.email,
                    password: $scope.user.password,
                    invitecode: $scope.user.invitecode
                },
                function(res) {
                    $scope.hideloading();
                	Auth.user=res.username;
                	Auth.isLoggedIn=true;
                	socket.emit('login',{username:Auth.user});
                	$localstorage.set('username',res.username);
                	$localstorage.set('token',res.usersession);
                	$scope.goto('tab.dash');
                },
                function(err,status) {
                    $scope.hideloading();
                	$ionicPopup.alert({
                     title: '错误',
                     template: status
                    });
                    console.log(status);
                    $rootScope.error = "用户名或密码不存在！";
                });
        }
        else {
            if($scope.signform.username.$invalid){
                $ionicPopup.alert({
                 title: '不好意思',
                 template: '用户名要在4位到20位之间！'
                });
            }
            else if($scope.signform.email.$invalid){
                $ionicPopup.alert({
                 title: '不好意思',
                 template: '邮箱格式错误！'
                });
            }
            else if($scope.signform.password.$invalid){
                $ionicPopup.alert({
                 title: '不好意思',
                 template: '密码要在6位到20位之间！'
                });
            }
            else if($scope.signform.invitecode.$invalid){
                $ionicPopup.alert({
                 title: '不好意思',
                 template: '激活码必须输入！'
                });
            }
            
        }
    };
});
