/** Parse: save user's select country **/
// current only allow one country
// Parse.initialize("APPLICATION_ID", "JAVASCRIPT_KEY");
Parse.initialize("sr4B0s62RshtQG2MwvVUXWYNWCnE6qvzHdjKDNfy", "4OnAG23buEs16uMkFeearCADfkTAnNeqMreS8l60");

var BeautyUser = Parse.Object.extend("BeautyUser");
var beautyUser = new BeautyUser();
var ctryname;
var userID = localStorage.getItem("userID");
console.log("Current User ID is: " + userID);

/** jquery to pass country when click button**/
var $countryname = $('.tooltip').text();

($function(){
    $("div.guideImg").hide();
 });

$('.map').on("click touchstart", function(){
    $countryname = $('.tooltip').text();
    console.log("$countryname: " + $countryname);
}); // save country name to this object


$('#onWall').on("click touchstart", function(){
    strogeToParse("wall");
});

$('#onPhone').on("click touchstart", function(){
    strogeToParse("phone");
});

$('#clear').on("click touchstart", function(){
    localStorage.clear();
    console.log("userIndex: " + localStorage.getItem("userIndex") + "; userID: " + localStorage.getItem("userID") );
});

$('#guide').on("click touchstart", function(){
    $("div.guideImg").fadeToggle(1000);
});
$('a#guideBtn').on("click touchstart", function(){
    $("div.guideImg").fadeOut(1000);
});

function getFromParse(){
}


function strogeToParse(method){
     /* get user index from localStorage */
    var userIndex = localStorage.getItem("userIndex");
    
    if(userIndex){  // Not the first user
        localStorage.setItem("userIndex", ++userIndex);
    }else{    // first user 
        userIndex = 1;
        localStorage.setItem("userIndex", userIndex);    
    }
    console.log("userIndex AF: " + userIndex);
    
    /* Parse: set data */
    beautyUser.set("userIndex", userIndex); 
    if($countryname){
        beautyUser.set("countryName", $countryname);
    }
    beautyUser.set("showMethod", method); 
    
    // Save Data to Parse server
    beautyUser.save(null, {
      success: function(beautyUser) {
        // Execute any logic that should take place after the object is saved.
        beautyUser.save();
        localStorage.setItem("userID", beautyUser.id);
      // Save ID to localStorage, 注意sessionStorage不能跨标签页使用
    
        // Access some stored data
        console.log('Parse objectId: ' + beautyUser.id + "; localStorage ID: " + localStorage.getItem("userID"));
          
        if(method == "wall"){
            window.open('BallonData_v3.html');
        }else{
            window.open('beauty_qr.html');
        } // open new page if the new beautyUser saved;
      },
      error: function(beautyUser, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and description.
        alert('Failed to create new object, with error code: ' + error.description);
      }
    }); // Parse data save
}


// Lots of code from:  http://bl.ocks.org/3757125
//  http://bl.ocks.org/3795040
//$(function(){
//    var isMobile = false;
//    /** touch move event **/
//    if ((navigator.userAgent.indexOf('iPhone') != -1) || (navigator.userAgent.indexOf('iPod') != -1) || (navigator.userAgent.indexOf('iPad') != -1)) {
//        isMobile = true;
//        $('.touchinfo').append("this is Mobile device: " + isMobile);
//        // document.location = "WEBSITE GOES HERE";
//    }
//                               
//    $(".svgmap").touchInit({
//        preventDefault: true,
//        mouse: true,
//        pen: true,
//        maxtouch: -1,
//        prefix: ""
//    });
//
//    if(isMobile && proj){
//        var touch0, rotate0;
//        var touchend = function(e) {
//            e.preventDefault();
//            touch0 = [e.pageX, e.pageY];
//            rotate0 = proj.rotate();
//        }
//
//        var touchmove = function(e) { 
//            e.preventDefault();
//          if (touch0) { 
//              // m1 目前位置
//            var touch1 = [e.pageX, e.pageY, e.touches]
//              , rotate1 = [
//                  rotate0[0]+(touch1[0]-touch0[0])/6, 
//                  rotate0[1]+(touch0[1]-touch1[1])/6];
//
//            rotate1[1] = rotate1[1]>30?
//                    30:rotate1[1]<-30?-30 : rotate1[1];
//
//              proj.rotate(rotate1);
//              refresh();
//          }
//        }
//
//        var touchstart = function(e){
//            e.preventDefault();
//            if (touch0) {
//                touchmove();
//                touch0 = null;
//            } 
//        }
//
//        $("div.map").on("touch_start", touchstart);
//        $("div.map").on("touch_move", touchmove);
//        $("div.map").on("touch_end", touchend);
//    }
//});
