angular.module('lab.rtc-controller', [])

.controller('CallCtrl', function($timeout,Auth,$stateParams,$cordovaFile,$ionicScrollDelegate,socket,Chat,$cordovaDevice,Device,$ionicPopover,$cordovaBarcodeScanner,$ionicSlideBoxDelegate,Upload,$cordovaFile,$cordovaCamera,$ionicNavBarDelegate,Auth,$rootScope,$scope,$state,$ionicLoading,$ionicModal,$cordovaKeyboard,$ionicSideMenuDelegate) {
    
    var duplicateMessages = [];

    $scope.callInProgress = false;
    $scope.audioEar=true;

    $scope.isCalling = $stateParams.isCalling === 'true';
    $scope.contactName = $stateParams.contactName;

    $scope.allContacts = ['cpycpy','windht','TonyChol'];
    $scope.contacts = {};
    $scope.hideFromContactList = [$scope.contactName];
    $scope.muted = false;

    $ionicModal.fromTemplateUrl('templates/cooperation/meeting-contact.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.selectContactModal = modal;
    });

    if ($scope.isCalling) {
      socket.emit('sendMessage', $stateParams.contactName, { type: 'call',from:Auth.user });
    }

    function call(isInitiator, contactName) {
      console.log(new Date().toString() + ': calling to ' + contactName + ', isInitiator: ' + isInitiator);

      var config = { 
        isInitiator: isInitiator,
        turn: {
          host: 'turn:115.29.103.118:3478',
          username: 'windht',
          password: 'ht930531'
        },
        streams: {
          audio: true,
          video: false
        }
      };

      var session = new cordova.plugins.phonertc.Session(config);
      
      session.on('sendMessage', function (data) { 
        socket.emit('sendMessage', contactName, { 
          type: 'phonertc_handshake',
          data: JSON.stringify(data),
          from: Auth.user
        });
      });

      session.on('answer', function () {
        console.log('Answered!');
      });

      session.on('disconnect', function () {
        if ($scope.contacts[contactName]) {
          delete $scope.contacts[contactName];
        }

        if (Object.keys($scope.contacts).length === 0) {
          socket.emit('sendMessage', contactName, { type: 'ignore',from: Auth.user });
          $state.go('tab.dash');
        }
      });

      session.call();

      $scope.contacts[contactName] = session; 
    }

    function onMessageReceive (name, message) {
      switch (message.type) {
        case 'answer':
          $scope.$apply(function () {
            $scope.callInProgress = true;
          });

          var existingContacts = Object.keys($scope.contacts);
          if (existingContacts.length !== 0) {
            socket.emit('sendMessage', name, {
              type: 'add_to_group',
              contacts: existingContacts,
              isInitiator: false,
              from: Auth.user
            });
          }

          call(true, name);
          break;

        case 'ignore':
          var len = Object.keys($scope.contacts).length;
          if (len > 0) { 
            if ($scope.contacts[name]) {
              $scope.contacts[name].close();
              delete $scope.contacts[name];
            }

            var i = $scope.hideFromContactList.indexOf(name);
            if (i > -1) {
              $scope.hideFromContactList.splice(i, 1);
            }

            if (Object.keys($scope.contacts).length === 0) {
              $state.go('tab.dash');
            }
          } else {
            $state.go('tab.dash');
          }

          break;

        case 'phonertc_handshake':
          if (duplicateMessages.indexOf(message.data) === -1) {
            $scope.contacts[name].receiveMessage(JSON.parse(message.data));
            duplicateMessages.push(message.data);
          }
          
          break;

        case 'add_to_group':
          message.contacts.forEach(function (contact) {
            $scope.hideFromContactList.push(contact);
            call(message.isInitiator, contact);

            if (!message.isInitiator) {
              $timeout(function () {
                socket.emit('sendMessage', contact, { 
                  type: 'add_to_group',
                  contacts: [ContactsService.currentName],
                  isInitiator: true,
                  from: Auth.user
                });
              }, 1500);
            }
          });

          break;
      } 
    }

    $scope.ignore = function () {
      var contactNames = Object.keys($scope.contacts);
      if (contactNames.length > 0) { 
        $scope.contacts[contactNames[0]].disconnect();
      } else {
        socket.emit('sendMessage', $stateParams.contactName, { type: 'ignore',from: Auth.user });
        $state.go('tab.dash');
      }
    };

    $scope.end = function () {
      Object.keys($scope.contacts).forEach(function (contact) {
        $scope.contacts[contact].close();
        delete $scope.contacts[contact];
      });
    };

    $scope.answer = function () {
      if ($scope.callInProgress) { return; }
      $scope.callInProgress = true;
      call(false, $stateParams.contactName);
      setTimeout(function(){
        socket.emit('sendMessage', $stateParams.contactName, { type:'answer',from:Auth.user});
      }, 1500);
    };

    $scope.openSelectContactModal = function () {
      $scope.selectContactModal.show();
    };

    $scope.closeSelectContactModal = function () {
      $scope.selectContactModal.hide();      
    };

    $scope.addContact = function (newContact) {
      $scope.hideFromContactList.push(newContact);
      socket.emit('sendMessage', newContact, { type: 'call',from: Auth.user });
      $scope.selectContactModal.hide();
    };

    $scope.hideCurrentUsers = function () {
      return function (item) {
        return $scope.hideFromContactList.indexOf(item) === -1;
      };
    };

    $scope.toggleMute = function () {
      $scope.muted = !$scope.muted;

      Object.keys($scope.contacts).forEach(function (contact) {
        var session = $scope.contacts[contact];
        session.streams.audio = !$scope.muted;
        session.renegotiate();
      });
    };

    $scope.toggleAudioMode=function() {
        if ($scope.audioEar) {
            AudioToggle.setAudioMode(AudioToggle.SPEAKER);
            $scope.audioEar=false;
        }
        else {
            AudioToggle.setAudioMode(AudioToggle.EARPIECE);
        }
        
    }

    socket.on('messageReceived', onMessageReceive);

    $scope.$on('$destroy', function() { 
      socket.removeListener('messageReceived', onMessageReceive);
    });

})
.controller('CallTestCtrl',function($scope,socket,Auth){
    $scope.connection="还没拨呢";

    $scope.initrtc=function(bool,to) {
        $scope.connection="拨号中";
        var config = { 
            isInitiator: bool,
            turn: {
              host: 'turn:lab.buildmind.cn:3478',
              username: 'windht',
              password: 'ht930531'
            },
            streams: {
              audio: true,
              video: false
            }
        };
        var session = new cordova.plugins.phonertc.Session(config);

        session.on('sendMessage', function (data) { 
            socket.emit('rtc', to, { 
              type: 'phonertc_handshake',
              data: JSON.stringify(data),
              from: Auth.user
            });
        });

        session.on('answer', function () { 
            $scope.connection="已连接！"
        });

        session.on('disconnect', function () { 
            $scope.connection="已经断开！"
        });

        session.call();
    }

    $scope.call=function(whom) {
        socket.emit('rtc',whom,{
            type:'ask for call',
            from:Auth.user
        })
    }

    socket.on('new rtc',function(name,data){
        if (data.type=="ask for call") {

        }
        if (data.type=="phonertc_handshake") {
            session.receiveMessage(JSON.parse(message.data));
        }
    })

});
