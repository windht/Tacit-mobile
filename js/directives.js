var app=angular.module('lab.directives', []);


app.directive('videoView', function ($rootScope, $timeout) {
    return {
      restrict: 'E',
      template: '<div class="video-container"></div>',
      replace: true,
      link: function (scope, element, attrs) {
        function updatePosition() {
          cordova.plugins.phonertc.setVideoView({
            container: element[0],
            local: { 
              position: [240, 240],
              size: [50, 50]
            }
          });
        }
        $timeout(updatePosition, 500);
        $rootScope.$on('videoView.updatePosition', updatePosition);
      }
    }
  });

app.directive('draw', function ($rootScope, $timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.bind('mousedown',function(){
          
        })
      }
    }
  });
app.directive('chatForm', function ($rootScope, $timeout,Chat,Device,$ionicScrollDelegate) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        $rootScope.$on('native.keyboardshow',function (e,data){
              var keyboardheight=data.event.keyboardHeight;
              element.css('bottom',keyboardheight+'px');
              Chat.scrollHeight=(Device.height-108-keyboardheight)+'px';
              $ionicScrollDelegate.$getByHandle('chat-box').resize();
              $ionicScrollDelegate.$getByHandle('chat-box').scrollBottom(true,true);
          }
        )
        $rootScope.$on('native.keyboardhide',function (e,data){
              var keyboardheight=data.event.keyboardHeight;
              element.css('bottom','0px');
              Chat.scrollHeight=(Device.height-108)+'px';
              $ionicScrollDelegate.$getByHandle('chat-box').resize();
              $ionicScrollDelegate.$getByHandle('chat-box').scrollBottom(true,true);
          }
        )
        element.bind('focus',function(){

        })

        element.find('#chat-textarea').click(function(){
            console.log('hiclick');
        })
        element.find('#chat-textarea').keypress(function(event){
          if(event.keyCode=='13')
          {
            console.log("enter pressed");
          }  
        })

        element.find('#chat-textarea').bind('input',function(){

        })
      }
    }
  });