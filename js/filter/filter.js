labfilter=angular.module('lab.filter', []);

labfilter.filter('DOMParser', function($sce) { 
    var parser = new DOMParser() ;
    return function(input) {
        return input;
    };  
});

labfilter.filter('recentTask', function() { 
	var count=0;
    return function(input) {
    	count=0;
        for (i in input) {
        	if (input[i].status=='urgent') {
        		count+=1;
        	}
        }
        return count;
    };  
});

labfilter.filter('deadTask', function() { 
	var count=0;
    return function(input) {
    	count=0;
        for (i in input) {
        	if (input[i].status=='dead') {
        		count+=1
        	}
        }
        return count;
    };  
});

labfilter.filter('EmailGen', function() { 
    return function(input) {
    	switch (input) {
	        case 'windht':      
	          return 'hutong@buildmind.org'
	        break;
	        case 'TonyChol':      
	          return 'caizhibin@buildmind.org'
	        break;
	        case 'litao':      
	          return 'litao@buildmind.org'
	        break;
	        case 'cpycpy':
	          return '294489786@qq.com'
	        break;
	        case 'xxye':
	          return '465130003@qq.com'
	        break;
    	};  
    };  
});

labfilter.filter('ArrayToList', function($sce) { 
    return function(input) {
    	var str='';
        for (i in input) {
        	if (i < input.length-1) {
        		str= str + input[i] + ',';
        	}
        	else {
        		str=str + input[i];
        	}
        }
        return str;
    };  
});

labfilter.filter('NumToChinese', function() { 
    return function(input) {
        switch (input) {
	        case 1:      
	          return '一'
	        break;
	        case 2:      
	          return '二'
	        break;
	        case 3:      
	          return '三'
	        break;
	        case 4:      
	          return '四'
	        break;
	        case 5:      
	          return '五'
	        break;
	        case 6:      
	          return '六'
	        break;
	        case 7:      
	          return '七'
	        break;
    	};  
    }
});  