'use strict';

/* Filters */

angular.module('myApp.filters', []).
    filter('interpolate', ['version', function (version) {
    return function (text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    }
}]);


myApp.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});


angular.module('myApp.filters', []).
  filter('since', function() {
    return function(input, uppercase) {
	    var tTime=input;
	    var cTime=new Date();
	    var sinceMin=Math.round((cTime-tTime)/60000);
	    if(sinceMin==0)
	    {
	        var sinceSec=Math.round((cTime-tTime)/1000);
	        if(sinceSec<10)
	          var since='less than 10 seconds ago';
	        else if(sinceSec<20)
	          var since='less than 20 seconds ago';
	        else
	          var since='half a minute ago';
	    }
	    else if(sinceMin==1)
	    {
	        var sinceSec=Math.round((cTime-tTime)/1000);
	        if(sinceSec==30)
	          var since='half a minute ago';
	        else if(sinceSec<60)
	          var since='less than a minute ago';
	        else
	          var since='1 minute ago';
	    }
	    else if(sinceMin<45)
	        var since=sinceMin+' minutes ago';
	    else if(sinceMin>44 && sinceMin<60)
	        var since='about 1 hour ago';
	    else if(sinceMin<1440){
	        var sinceHr=Math.round(sinceMin/60);
	    if(sinceHr==1)
	      var since='about 1 hour ago';
	    else
	      var since='about '+sinceHr+' hours ago';
	    }
	    else if(sinceMin>1439 && sinceMin<2880)
	        var since='1 day ago';
	    else
	    {
	        var sinceDay=Math.round(sinceMin/1440);
	        var since=sinceDay+' days ago';
	    }
	    return since;
    }
  });
  
 
/**
* get youtube video ID from URL
*
* @param string $url
* @return string Youtube video id or FALSE if none found. 
*/
myApp.filter('youtube_id', function() {
  return function(url) {
	  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	     var match = url.match(regExp);
	     if (match&&match[7].length==11){
	         return match[7];
	     }else{
	         alert("Url unsupported format");
	     }
};
});
