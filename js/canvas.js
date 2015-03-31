// http://www.leebrimelow.com/html5-canvas-mouse-interaction-example/
var context;
var destx = 0;
var x = 0;
var ind;
var offset;

var photos = new Array();

for(var i=1; i<15; i++) {
    var im = new Image();
    im.src = "p" + i + ".jpg";
    photos.push(im);    
}

function init() {
    context = document.getElementById('canvas').getContext('2d');   
    canvas.addEventListener('mousemove', function(e) {
        x = e.offsetX / 670 * 8710; 
    }, false);
    setInterval(loop, 1);
}

function loop() {
    destx += (x - destx) * 0.04;
    ind = Math.floor(destx/670);
    offset = destx % 670;
    context.drawImage(photos[ind], offset, 0, 670-offset, 503, 0, 0, 670-offset, 503);
    context.drawImage(photos[ind+1], 0, 0, 670, 503, 670-offset, 0, 670, 503);
}