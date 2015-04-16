$(function(){
    
    "use strict"; // we want to be a little more careful with our JavaScript
    
    var topoffset = 50; // variable fo menu height
	var slideqty = $('#d3keysample .item').length;
    
    //Activate Scrollspy
    $('body').scrollspy({
        target: 'header .navbar',
        offset: topoffset
    });
    
    // Add an inbody class to nav whenever page was loaded to other #
    var hash = $(this).find('li.active a').attr('href');
	console.log(hash);
    
    // this #featured is on top of page
    if(hash !== '#d3keysample'){  // 如果当前激活的li项目不是页面顶部
        $('header nav').addClass('inbody');
    }else{
        $('header nav').removeClass('inbody');
    }
    
//    // Add an inbody class to nav whenever the scrollspy event fires
//    $('.navbar-fixed-top').on('activate.bs.scrollspy', function(){
//        var hash = $(this).find('li.active a').attr('href');
//    
//        // this #featured is on top of page
//        if(hash !== '#d3keysample'){  // 如果当前激活的li项目不是页面顶部
//            $('header nav').addClass('inbody');
//        }else{
//            $('header nav').removeClass('inbody');
//        }
//    });
	
	// Use smooth scrolling when clicking on navigation
	/** https://css-tricks.com/snippets/jquery/smooth-scrolling/ **/
	$('.navbar a[href*=#]:not([href=#])').click(function() {
		if (location.pathname.replace(/^\//,'') ===
			this.pathname.replace(/^\//,'') && 
			location.hostname == this.hostname) {
		  var target = $(this.hash);
		  target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
		  if (target.length) {
			$('html,body').animate({
			  scrollTop: target.offset().top-topoffset+2
			}, 500); // different with original script
			return false;
		  } // target.length
		}  // click function
	  }); // Smooth scrolling
	
//	//Automatically generate carousel indicators
//	for(var i = 0; i < slideqty; i++){
//		var insertText = '<li data-target="#featured" data-slide-to="'+i+'"></li>';
//		console.log(insertText);
//		$('#featured ol').append(insertText);
//	}
    
    $('.carousel').carousel({
	interval: false
    }); // 时间量自动循环项目之间的延迟。如果设置为false，旋转木马也不会自动循环。
    
    
});/* 这通常可以确保我们的函数或我们的代码被执行后，才在页面加载完成。它还保护在此脚本里的变量，以防止其成为全局变量 */


/* there are same function but only target one carousel
$('#featured').carousel({
	interval: false
}) 
*/