/** Parse: save user's select country **/
// current only allow one country
// Parse.initialize("APPLICATION_ID", "JAVASCRIPT_KEY");
Parse.initialize("sr4B0s62RshtQG2MwvVUXWYNWCnE6qvzHdjKDNfy", "4OnAG23buEs16uMkFeearCADfkTAnNeqMreS8l60");
var pathname = "/myd3_geo/beauty/beautyBallon_phone.html?country=",
    phoneUrl = "beauty_qr.html",
    wallUrl = "BallonData_v3.html";

var BeautyUser = Parse.Object.extend("BeautyUser");
var beautyUser = new BeautyUser();
var beautyQuery = new Parse.Query(BeautyUser);
var userID = localStorage.getItem("userID");

var localUrl = window.location.href,
	localHost = window.location.host;
var userCountry;

$(function(){
    $("div.guideImg").hide();
	getFromParse(userID);
});

/** Toggle guide image **/
$('#guide').on("click touchstart", function(){
    $('div.guideImg').fadeToggle(1000);
});
$('a#guideBtn').on("click touchstart", function(){
	alert("guide");
    $("div.guideImg").fadeOut(1000);
});

$('#onPhone').on("click touchstart", function(){
    strogeToParse("phoneQR");
});

/** Clear button in fixed-action-btn group **/
$('#clear').on("click touchstart", function(){
    localStorage.clear();
});

function getFromParse(beautyUserID){
	console.log("LocalStorage | userIndex: " + localStorage.getItem("userIndex") + "; userID: " + localStorage.getItem("userID") );
	
	if(beautyUserID){
		beautyQuery.get(beautyUserID, {
		  success: function(beautyUser) {
			// The object was retrieved successfully.
			userCountry = beautyUser.get("countryName");
			console.log("Parse: beautyUser ID: " + beautyUser.id + "; Get country name from user: " + userCountry);
			/** jquery to Show user selected country to div **/
			$('.countryname').text(userCountry);
			console.log("Phone Ballon URL is: "+localHost+pathname+userCountry+"&userID="+userID);
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
    }else{    		// first user 
        userIndex = 1;
        localStorage.setItem("userIndex", userIndex);    
    }
    console.log("userIndex AF: " + userIndex);
  	beautyUser.set("userIndex", userIndex); 
    
	if(userCountry){
        beautyUser.set("countryName", userCountry);
    }
    beautyUser.set("showMethod", method); 
    
    // Save Data to Parse server
    beautyUser.save(null, {
      success: function(beautyUser) {
        // Execute any logic that should take place after the object is saved.
        beautyUser.save();
        localStorage.setItem("userID", beautyUser.id);
      // Save ID to localStorage, 注意sessionStorage不能跨标签页使用
 		console.log('Parse objectId: ' + beautyUser.id + "; localStorage ID: " + localStorage.getItem("userID"));
		window.open(phoneUrl);
      },
      error: function(beautyUser, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and description.
        alert('Failed to create new object, with error code: ' + error.description);
      }
    }); // Parse data save
}