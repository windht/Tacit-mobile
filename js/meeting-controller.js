angular.module('lab.meeting.controller', [])
.controller('MeetingCtrl', function(Board,Device,$state,$ionicNavBarDelegate,$cordovaInAppBrowser,$ionicModal,socket,Auth,$timeout,$scope,Meeting,$ionicSlideBoxDelegate,$http) {
  $scope.Meeting=Meeting;
  $scope.imgSize=30;  
  $scope.Auth=Auth;
  $scope.Board=Board;
  $scope.whiteBoard={
    width:Device.width,
    height:Device.width,
    background:'white'
  }

  $scope.$on('$ionicView.beforeEnter', function(){
    $ionicNavBarDelegate.showBackButton(false);
    $ionicSlideBoxDelegate.$getByHandle('meetingSpaceSlide').enableSlide(false);
    $timeout(function(){

    },0)
    socket.emit('ask for meeting record',{
        room:"buildmind",
        type:'all'
    });
  })

  $scope.openReference=function() {

  }

  $scope.openSpace=function() {
    paper.setup('meeting-whiteboard');
    $('.meeting-communicate').animate({top:"44px"},200);
    $ionicNavBarDelegate.showBackButton(true);
  }

  $scope.closeSpace=function() {
    paper.setup('meeting-interaction');
    $('.meeting-communicate').animate({top:"100%"},200);
    $ionicNavBarDelegate.showBackButton(false);
  }

  $scope.exitMeeting=function() {
    $('.meeting-communicate').animate({top:"100%"},200);
    $state.go('tab.dash');
  }

  $scope.gotoMeeting=function() {
    $ionicSlideBoxDelegate.$getByHandle('meetingSpaceSlide').slide(1);
    paper.setup('meeting-interaction');
  }

  $scope.updateMeetingProgress=function() {
        for (i in Meeting.progress) {
            if (i<Meeting.currentSection) {
                Meeting.progress[i].value=Meeting.sectionInfo[i].sectionSteps.length;   
            }
            if (i==Meeting.currentSection) {
                Meeting.progress[i].value=Meeting.currentStepOfSection+1;
            }
            if (i>Meeting.currentSection) {
                Meeting.progress[i].value=0;
            }
            Meeting.progress[i].max=Meeting.sectionInfo[i].sectionSteps.length;
        }
    }
    $scope.killPath=function() {
        var length= Board.path.length;
        Board.path[length-1].remove();
        Board.path.pop();
        view.draw();
    }

  $scope.$on('$ionicView.loaded',function(){
    $('#meeting-whiteboard').attr('width',Device.width);
    $('#meeting-whiteboard').attr('height',Device.width);
    $('#meeting-interaction').attr('width',Device.width);
    $('#meeting-interaction').attr('height',Device.height-86);
    Board.tool = new Tool();
    // Define a mousedown and mousedrag handler

    Board.tool.onMouseDown = function(event) {
        var path  = new Path();
        Board.path.push(path);
        var length= Board.path.length;
        Board.path[length-1].strokeColor = 'black';
        Board.path[length-1].strokeWidth=Board.pathWidth;
        Board.path[length-1].strokeCap="round";
        Board.path[length-1].add(event.point);
        Board.path[length-1].add(event.point);
        socket.emit('whiteboard change',{
            type:'new path',
            point:event.point,
            room:'buildmind'
        })
    }
    Board.tool.onMouseDrag = function(event) {
        var length= Board.path.length;
        Board.path[length-1].add(event.point);

        console.log(event.point);
        socket.emit('whiteboard change',{
            type:'new seg',
            point:event.point,
            room:'buildmind'
        })
    }

    Board.tool.onMouseUp = function(event) {
        var length= Board.path.length;
        socket.emit('whiteboard change',{
            type:'path end',
            point:event.point,
            room:'buildmind'
        })
        Board.path[length-1].simplify();
        Board.path[length-1].selected=true;
        console.log(Board.path[length-1]);
    }
  })
  $scope.$on('$ionicView.enter', function(){
        var fileurl=Meeting.dataUrl+'meeting/outline/today-meeting.json';
        $http.get(fileurl).success(function(data){
            Meeting.hasMeeting=true;
            Meeting.sectionInfo=data;
            Meeting.progress=[];
            for (i in data) {
                if (i==0) {
                    Meeting.progress.push({
                        value:1,
                        max:data[i].sectionSteps.length
                    })
                }
                else {
                    Meeting.progress.push({
                        value:0,
                        max:data[i].sectionSteps.length
                    })
                }
            }
        })
        $ionicSlideBoxDelegate.$getByHandle('meetingSpaceSlide').update();


        socket.emit('user entering meeting space',{
        	room:"buildmind",
        	user:Auth.user
        });
  });


  $scope.attendMeetingCall=function() {
    socket.emit('user attend meeting call',{
        user:Auth.user,
    })
  }

  $scope.$on('$ionicView.leave', function(){
  	socket.emit('user leaving meeting space',{
    	room:"buildmind",
    	user:Auth.user
    });
    for (i in Meeting.members) {
        if (Meeting.members[i].rtcSession!=null) {
            Meeting.members[i].rtcSession.close();
            Meeting.members[i].rtcSession=null;
        } 
    }
    Meeting.members=[];    

    $timeout(function(){

    },0)
        
  })

  $scope.meetinggo=function(where) {
        if (where=="next meeting step") {
            Meeting.currentStepOfSection+=1;
        }
        if (where=="last meeting step") {
            Meeting.currentStepOfSection-=1;
        }
        if (where=="next meeting section") {
            Meeting.currentFile=0;
            Meeting.currentStepOfSection=0;
            Meeting.currentSection+=1;
        }
        if (where=="last meeting section") {
            Meeting.currentSection-=1;
            Meeting.currentFile=0;
            Meeting.currentStepOfSection=Meeting.sectionInfo[Meeting.currentSection].sectionSteps.length-1;
        }
        $scope.updateMeetingProgress();
        socket.emit("meeting step change",{
            currentSection:Meeting.currentSection,
            currentStepOfSection:Meeting.currentStepOfSection
        })
    }

    $ionicModal.fromTemplateUrl('templates/cooperation/meeting/meeting-pic.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.picmodal = modal;
    });
    $scope.openPicModal = function(modalimgsrc) {
        $scope.picmodal.show();
        $scope.modalimgsrc=modalimgsrc;
    };
    $scope.closePicModal = function() {
        $scope.picmodal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.picmodal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
    // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
    // Execute action
    });
})


.controller('MeetingRecordCtrl', function($filter,$ionicPopup,Email,$ionicHistory,$stateParams,$state,$ionicNavBarDelegate,$cordovaInAppBrowser,$ionicModal,socket,Auth,$timeout,$scope,Meeting,$ionicSlideBoxDelegate,$http) {
    $scope.Meeting=Meeting;
    $scope.Email=Email;
    $scope.meetingNum=$stateParams.meetingNum;
    $scope.$on('$ionicView.enter', function(){
        
    })

    $scope.$on('$ionicView.leave', function(){
        
    })

    $ionicModal.fromTemplateUrl('templates/cooperation/meeting/meeting-record-email.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.emailEditModal = modal;
    });

    $scope.goBack=function() {
        $ionicHistory.goBack();
    }

    $scope.openEmail=function() {
        Email.to=$filter('EmailGen')(Auth.user);
        Email.subject="BuildMind "+Meeting.allRecords[$scope.meetingNum].date+' 会议记录';
        Email.html=$('#record-content')[0].innerHTML;
        $scope.emailEditModal.show();
    }

    $scope.closeEmailEdit=function() {
        var myPopup = $ionicPopup.show({
            template: '<div>你要放弃本次邮件发送吗？</div>',
            title: '放弃发送',
            subtitle:'',
            scope: $scope,
            buttons: [
              { text: '取消' },
              {
                text: '<b>确认</b>',
                type: 'button-assertive',
                onTap: function(e) {
                    $scope.emailEditModal.hide();
                }
              }
            ]
        });
    }

    $scope.sendEmail=function() {
        $scope.showloading();
        socket.emit('send email',{
            type:"meeting record",
            team:"buildmind",
            to:Email.to,
            subject:Email.subject,
            html:Email.html,
            recordNum:$scope.meetingNum
        })

        var requestTimeout=$timeout(function(){
            $ionicLoading.show({
                templateUrl:'templates/widget/email-error.html',
                duration: 500
            })
            $scope.emailEditModal.hide();
        },5000)


        socket.on('email sent',function(data){
            $timeout.cancel(requestTimeout);
            $scope.hideloading();
            if (data.type=='error') {   
                var myPopup = $ionicPopup.show({
                    template: '<div>可能是收件人填写错误或是网络问题</div>',
                    title: '发送失败！',
                    subtitle:'',
                    scope: $scope,
                    buttons: [
                      { 
                        text: '更改收件人' ,
                        type: 'button-primary',
                        onTap: function(e) {
                        }
                      },
                      {
                        text: '<b>放弃编辑</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            $scope.emailEditModal.hide();
                        }
                      }
                    ]
                });
            }
            else {
                $scope.emailEditModal.hide();
            }
            
            
        })
        
    }
})

.controller('MeetingRecordListCtrl', function($state,$ionicNavBarDelegate,$cordovaInAppBrowser,$ionicModal,socket,Auth,$timeout,$scope,Meeting,$ionicSlideBoxDelegate,$http) {
    $scope.Meeting=Meeting;
    $scope.$on('$ionicView.enter', function(){
    })

    $scope.$on('$ionicView.leave', function(){
        
    })
})
