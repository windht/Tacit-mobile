// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('labapp', ['ui.bootstrap','lab.filter','lab.team.controller','lab.meeting.controller','lab.mobile.event','lab.rtc-controller','angular-datepicker','ionic', 'lab.controllers', 'lab.services','btford.socket-io','ngCordova','lab.socket','lab.directives'])

.run(function(Sound,$cordovaMedia,$cordovaPush,Chat,Friends,$cordovaTouchID,$cordovaFile,Device,$cordovaDevice,$ionicPlatform, socket, Auth,$localstorage,$state,$cordovaNetwork,$cordovaToast,$rootScope,$cordovaKeyboard,$cordovaStatusbar) {
  $ionicPlatform.isFullScreen = true;
  Device.width=$(window).width();
  Device.height=$(window).height();
  Chat.scrollHeight=(Device.height-108)+'px';
  paper.install(window);

  $ionicPlatform.ready(function() {
    Sound.newmsg=new Media("sound/new-msg.mp3");
    $cordovaKeyboard.disableScroll(true);
    $cordovaKeyboard.hideAccessoryBar(true);
    Device.platform=$cordovaDevice.getPlatform();
    Device.directory=cordova.file.dataDirectory.replace("NoCloud","files");
    $cordovaTouchID.checkSupport().then(function() {
      Device.supportTouchID=true;
    }, function (error) {
      Device.supportTouchID=false;
    });
    // $cordovaFile.removeFile('/friends.json').then(function(result) {
    //   alert('remove success');
    // }, function(err) {
    //   alert(err.code);
    // })



    if($cordovaNetwork.isOnline()) {
      var network = $cordovaNetwork.getNetwork();
      $cordovaToast.show('当前为'+network+'环境', 'short', 'bottom');
    }

    $cordovaStatusbar.style(1);
  });

  Auth.authorize({
    type:'mobile',
    username:$localstorage.get('username'),
    token:$localstorage.get('token')
  },function(res){
    Auth.user=$localstorage.get('username');
    Auth.isLoggedIn=true;
    socket.emit('login',{username:Auth.user});
    if (Device.token!='') {
      socket.emit('deviceToken',{token:Device.token,user:Auth.user});
    }
    $('.auth-mask').addClass('done');
  },function(err){
    $localstorage.set('username','');
    $localstorage.set('token','');
    $state.go('auth');
    // $state.go('tab.dash');
    $('.auth-mask').addClass('done');
})

})

.config(function($cordovaInAppBrowserProvider,$ionicConfigProvider,$stateProvider, $urlRouterProvider) {
  $ionicConfigProvider.views.maxCache(20);
  $ionicConfigProvider.views.forwardCache(true);
  $stateProvider
    .state('auth', {
      url: "/auth",
      views: {
        '@': {
          templateUrl: 'templates/auth/login.html',
          controller: 'AuthCtrl'
        }
      }
    })
    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })
    // Each tab has its own nav history stack:
    .state('tab.dash', {
      url: '/dash',
      views: {
        'tabs': {
          templateUrl: 'templates/communicate/tab-communicate.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.chat', {
      url: '/chat/:friendIndex',
      views: {
        'tabs': {
          templateUrl: 'templates/communicate/tab-chat.html',
          controller: 'ChatCtrl'
        }
      }
    })

    .state('tab.setting', {
      url: '/setting',
      views: {
        'tabs': {
          templateUrl: 'templates/communicate/tab-setting.html',
          controller: 'SettingCtrl'
        }
      }
    })
    .state('tab.new-meeting', {
      url: '/new-meeting',
      views: {
        'tabs': {
          templateUrl: 'templates/cooperation/new-meeting.html',
          controller: 'NewMeetingCtrl'
        }
      }
    })
    .state('tab.meeting', {
      url: '/meeting',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/meeting/meeting.html',
          controller: 'MeetingCtrl'
        }
      }
    })
    .state('tab.meetingrecordlist', {
      url: '/meeting-record-list',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/meeting/meeting-record-list.html',
          controller: 'MeetingRecordListCtrl'
        }
      }
    })
    .state('tab.meetingrecord', {
      url: '/meeting-record/{meetingNum}',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/meeting/meeting-record.html',
          controller: 'MeetingRecordCtrl'
        }
      }
    })
    .state('tab.meeting-call', {
      url: '/meeting-call/:contactName?isCalling',
      views: {
        'tabs': {
          templateUrl: 'templates/cooperation/meeting-call.html',
          controller: 'CallCtrl'
        }
      }
    })
    .state('tab.team', {
      url: '/team',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/team.html',
          controller: 'TeamCtrl'
        }
      },
      onEnter:function(){
        
      },
      onExit:function(){
        
      }
    })
    .state('tab.taskdetail', {
      url: '/task-detail/{list}/{taskNum}',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/task-detail.html',
          controller: 'TaskDetailCtrl'
        }
      },
      onEnter:function(){
        
      },
      onExit:function(){
        
      }
    })
    .state('tab.newtask', {
      url: '/new-task/{list}/{taskNum}',
      views: {
        '@': {
          templateUrl: 'templates/cooperation/new-task.html',
          controller: 'TaskDetailCtrl'
        }
      },
      onEnter:function(){
        
      },
      onExit:function(){
        
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});

