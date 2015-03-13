angular.module('lab.team.controller', [])

.controller('TeamCtrl', function(Task,socket,$filter,$ionicScrollDelegate,$ionicSlideBoxDelegate,$scope,$http,Team) {
	$scope.Team=Team;
	$scope.Task=Task;
	$scope.slideSelect=0;
	$scope.$on('$ionicView.loaded',function(){		
       	$ionicSlideBoxDelegate.$getByHandle('teamslide').update();   	
    });
    $scope.$on('$ionicView.beforeEnter',function(){
    	$ionicSlideBoxDelegate.$getByHandle('teamslide').update();
    	$ionicScrollDelegate.$getByHandle('teamlabel').resize();
    });

    $scope.update=function() {
    	socket.emit('update task',{
    		room:'buildmind'
    	})
    }

    $scope.teamSlideTo=function(index) {
    	$ionicSlideBoxDelegate.$getByHandle('teamslide').slide(index);
    };
    $scope.teamslideChanged=function(index) {
    	$scope.slideSelect=index;
    };
    $scope.newTaskAt=function(list) {
    	var today=new Date();
    	var num=Team[0].teamTaskList[list].listTasks.length;
    	Team[0].teamTaskList[list].listTasks.push({
    		taskName:"新任务",
    		taskColors:{green:false,red:false,yellow:false,blue:false,orange:false,black:false,pink:false},
    		taskChargeMembers:[],
    		taskComments:[],
    		taskDeadLine:$filter('date')(today,'yyyy-MM-dd'),
    		taskCheckLists:[],
    		taskDone:false,
    		taskDescriptions:''
    	})
    	$scope.goto('tab.newtask',{list:list,taskNum:num});
    };
})
.controller('TaskDetailCtrl', function(socket,$ionicHistory,$ionicModal,$filter,$ionicPopup,$sce,$stateParams,$ionicSlideBoxDelegate,$scope,$http,Team) {
	$scope.Team=Team;
	$scope.list=$stateParams.list;
	$scope.taskNum=$stateParams.taskNum;
	$scope.year=parseInt($filter('date')(Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDeadLine, 'yyyy'));
	$scope.month=parseInt($filter('date')(Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDeadLine, 'MM'));
	$scope.day=parseInt($filter('date')(Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDeadLine, 'dd'));
	$ionicModal.fromTemplateUrl('templates/cooperation/popup/task-content-edit.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	}).then(function(modal) {
	$scope.contentEditModal = modal;
	});

	$scope.archive=function() {
		var myPopup = $ionicPopup.show({
	    template: '<div>你要将此任务归档吗？</div>',
	    title: '任务归档',
	    subtitle:'你要放弃本次修改吗？',
	    scope: $scope,
	    buttons: [
	      { text: '取消' },
	      {
	        text: '<b>确认</b>',
	        type: 'button-balanced',
	        onTap: function(e) {
	        	$scope.showloading();
				socket.emit('task information change',{
					type:'task archive',
					list:$scope.list,
					taskNum:$scope.taskNum,
					taskName:Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskName		
				})
	        }
	      }
	    ]
	  });
		
	}

	$scope.openContentEdit = function() {
		$scope.contentEditModal.show();
		var title= JSON.stringify(Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskName);
		var content= JSON.stringify(Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDescriptions);
		Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDescriptions=Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDescriptions.replace(/<br.*?>/g, '\r\n');
		$scope.masterTitle= angular.copy(JSON.parse(title));
		$scope.masterContent= angular.copy(JSON.parse(content));
	};
	$scope.closeContentEdit = function() {
		var myPopup = $ionicPopup.show({
	    template: '<div>你要放弃本次修改吗？</div>',
	    title: '放弃修改',
	    subtitle:'你要放弃本次修改吗？',
	    scope: $scope,
	    buttons: [
	      { text: '取消' },
	      {
	        text: '<b>确认</b>',
	        type: 'button-assertive',
	        onTap: function(e) {
	        	Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskName=angular.copy($scope.masterTitle);
	        	Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDescriptions=angular.copy($scope.masterContent);
	        	$scope.contentEditModal.hide();
	        }
	      }
	    ]
	  });
	};
	$scope.saveChangeContent=function() {
		Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDescriptions=Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDescriptions.replace(/\r?\n/g, '<br />');
		if ($ionicHistory.currentStateName()!="tab.newtask") {
			$scope.showloading();
			socket.emit('task information change',{
				type:'task content change',
				list:$scope.list,
				taskNum:$scope.taskNum,
				taskName:Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskName,
				taskDescriptions:Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDescriptions
			})
		}
		else {
			$scope.contentEditModal.hide();
		}
		
	}

	$scope.taskDone=function() {
		Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDone=!Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDone;
		$scope.showloading();	
		socket.emit('task information change',{
			type:'task done',
			list:$scope.list,
			taskNum:$scope.taskNum,
			taskDone:Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDone
		})
	}

	socket.on('task information changed',function(data){
		$scope.hideloading();
		switch (data.type) {
			case "task content change":
				$scope.contentEditModal.hide();
			break;

			case "task new comment":

			break;

			case "task done":

			break;

			case "task archive":
				Team[0].teamTaskList[$scope.list].listTasks.splice($scope.taskNum,1);
				$scope.goto('tab.team');
			break;

			case "new task":
				$scope.goto('tab.team');
			break;
		}
	})
	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.contentEditModal.remove();
	});
	$scope.pickDeadLine = function() {
	  var myPopup = $ionicPopup.show({
	    templateUrl: 'templates/cooperation/popup/pick-date.html',
	    title: '请选择日期',
	    scope: $scope,
	    buttons: [
	      { text: '取消' },
	      {
	        text: '<b>确认</b>',
	        type: 'button-positive',
	        onTap: function(e) {
	        	var date = $scope.year + '-' + $scope.month + '-'+ $scope.day;
	        	Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskDeadLine=date;
	        	if ($ionicHistory.currentStateName()!="tab.newtask") {
		        	$scope.showloading();
					socket.emit('task information change',{
						type:'task deadline change',
						list:$scope.list,
						taskNum:$scope.taskNum,
						taskDeadLine:date
					})
				}
	        }
	      }
	    ]
	  });
	};
	$scope.workDistribution = function() {
	  var myPopup = $ionicPopup.show({
	    templateUrl: 'templates/cooperation/popup/work-distribution.html',
	    title: '请选择要分配的人员',
	    scope: $scope,
	    buttons: [
	      { text: '取消' },
	      {
	        text: '<b>确认</b>',
	        type: 'button-positive',
	        onTap: function(e) {
	        	if ($ionicHistory.currentStateName()!="tab.newtask") {
	        		$scope.showloading();
		        	socket.emit('task information change',{
						type:'task charge members change',
						list:$scope.list,
						taskNum:$scope.taskNum,
						taskChargeMembers:Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum].taskChargeMembers
					})
				}
	        }
	      }
	    ]
	  });
	};
	$scope.selectToggle=function(ele,array) {
		var index=array.indexOf(ele);
		if (index===-1) {
			array.push(ele);
		}
		else {
			array.splice(index,1);
		}
	}
	$scope.checkSelected=function(ele,array) {
		if (array.indexOf(ele)===-1) {
			return false
		}
		else {
			return true;
		}
	}
	$scope.changedate=function(type,direction) {
		if (type=="year") {
			$scope.year+=direction
		}
		if (type=="month") {
			if ($scope.month==12 && direction==1) {
				$scope.month=1;
				$scope.year+=1;
			}
			else if ($scope.month==1 && direction==-1) {
				$scope.month=12;
				$scope.year-=1;
			}
			else {
				$scope.month+=direction;
			}	
		}
		if (type=="day") {
			if (direction==1) {
				if ($scope.month==1 || $scope.month==3 || $scope.month==5 || $scope.month==7 || $scope.month==8 || $scope.month==10 || $scope.month==12) {
					if ($scope.day < 31) {
						$scope.day+=direction
					}
					else if ($scope.month==12){
						$scope.month=1;
						$scope.year+=1;
						$scope.day=1
					}
					else {
						$scope.month+=1;
						$scope.day=1
					}
				}
				else if ($scope.month==2) {
					var maxday;
					if ($scope.year%4==0) {
						maxday=29
					}
					else {
						maxday=28
					}

					if ($scope.day<maxday) {
						$scope.day+=1;
					}
					else {
						$scope.day=1;
						$scope.month+=1;
					}
				}
			}
			else {
				if ($scope.day==1) {
					if ($scope.month>1) {
						var maxday
						$scope.month-=1;
							if ($scope.month==1 || $scope.month==3 || $scope.month==5 || $scope.month==7 || $scope.month==8 || $scope.month==10 || $scope.month==12) {
								maxday=31;
							}	
							else if ($scope.month==2) {
								if ($scope.year%4==0) {
									maxday=29;
								}
								else {
									maxday=28;
								}
							}
							else {
								maxday=30;
							}
						$scope.day=maxday;
					} 
				}
				else {
					$scope.day-=1;
				}
			}
			
		}
	}
	$scope.closeEdit=function() {
		var myPopup = $ionicPopup.show({
	    template: '<div>你要放弃这个任务的创建吗？</div>',
	    title: '放弃创建',
	    subtitle:'你要放弃本次创建吗？',
	    scope: $scope,
	    buttons: [
	      { text: '取消' },
	      {
	        text: '<b>确认</b>',
	        type: 'button-assertive',
	        onTap: function(e) {
	        	Team[0].teamTaskList[$scope.list].listTasks.pop();
	        	$scope.goto('tab.team');
	        }
	      }
	    ]
	  });
	}
	$scope.saveTask=function() {
		console.log($ionicHistory.currentStateName());
		console.log('hi');
		if ($ionicHistory.currentStateName()=="tab.newtask") {
			$scope.showloading();
			socket.emit('task information change',{
				type:'new task',
				list:$scope.list,
				task:Team[0].teamTaskList[$scope.list].listTasks[$scope.taskNum]
			});
		}
	}
	$scope.$on('$ionicView.beforeEnter',function(){
		if ($ionicHistory.currentStateName()=="tab.newtask") {
		}
	})
})