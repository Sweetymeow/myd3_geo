/** Parse: save user's select country **/
// current only allow one country
// Parse.initialize("APPLICATION_ID", "JAVASCRIPT_KEY");
Parse.initialize("sr4B0s62RshtQG2MwvVUXWYNWCnE6qvzHdjKDNfy", "4OnAG23buEs16uMkFeearCADfkTAnNeqMreS8l60");
var pathname = "/beautyBallon_phone.html?country=",
    phoneUrl = "beauty_qr.html",
    wallUrl = "BallonData_v3.html";

var BeautyUser = Parse.Object.extend("BeautyUser");
var beautyUser = new BeautyUser();
var beautyQuery = new Parse.Query(BeautyUser);
var userID = localStorage.getItem("userID");

var localUrl = window.location.href,
	localHost = window.location.host;
var userCountry;
console.log("Current User ID is: " + userID);

$(function(){
    $("div.guideImg").hide();
	getFromParse(userID);
});

/** Toggle guide image **/
$('#guide').on("click touchstart", function(){
    $("div.guideImg").fadeToggle(1000);
});
$('a#guideBtn').on("click touchstart", function(){
    $("div.guideImg").fadeOut(1000);
});

$('#onPhone').on("click touchstart", function(){
    strogeToParse("phone");
});

/** Clear button in fixed-action-btn group **/
$('#clear').on("click touchstart", function(){
    localStorage.clear();
});

function getFromParse(beautyUserID){
	console.log("userIndex: " + localStorage.getItem("userIndex") + "; userID: " + localStorage.getItem("userID") );
	if(beautyUserID){
		beautyQuery.get(beautyUserID, {
		  success: function(beautyUser) {
			  // The object was retrieved successfully.
			  userCountry = beautyUser.get("countryName");
			  console.log("Parse: beautyUser ID: " + beautyUser.id + "; Get country name from user: " + userCountry);
			  /** jquery to Show user selected country to div **/
			  $('.countryname').text(userCountry);
              
            console.log("local Host is: "+localHost);
            console.log("Phone Ballon URL is: "+localHost+pathname+userCountry);
            jQuery('#qrimage').qrcode(localHost+pathname+userCountry);
		  },
		  error: function(object, error) {
			// The object was not retrieved successfully, error is a Parse.Error with an error code and description.
			alert('Failed to get object from server: ' + error.description);
		  }
		}); 
	} // if get beauty user id from localStorage
} // getFromParse(beautyUserID)


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
            window.open(wallUrl);
        }else{
            window.open(phoneUrl);
        } // open new page if the new beautyUser saved;
      },
      error: function(beautyUser, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and description.
        alert('Failed to create new object, with error code: ' + error.description);
      }
    }); // Parse data save
}

/* 明天改 */
function resizeCanvas(width){
    /* important! for alignment, you should make things
 * relative to the canvas' current width/height.
 */
      var ctx = (a canvas context);
      ctx.canvas.width  = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
      //...drawing code...

}
// Display custom canvas.
// In this case it's a blue, 5 pixel border that 
// resizes along with the browser window.					
function redraw() {
    context.strokeStyle = 'blue';
    context.lineWidth = '5';
    context.strokeRect(0, 0, window.innerWidth, window.innerHeight);
}

// Runs each time the DOM window resize event fires.
// Resets the canvas dimensions to match window,
// then draws the new borders accordingly.
function resizeCanvas() {
    htmlCanvas.width = window.innerWidth;
    htmlCanvas.height = window.innerHeight;
    redraw();
}


//$('#onWall').on("click touchstart", function(){
//    strogeToParse("wall");
//});
//

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
