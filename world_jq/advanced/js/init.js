$(function () {

    var stateNames = new Array();
    var stateURLs = new Array();
    var stateModes = new Array();
    var stateColors = new Array();
    var stateOverColors = new Array();
    var stateClickedColors = new Array();
    var stateText = new Array();

    var offColor;
    var strokeColor;
    var mapWidth;
    var mapHeight;
    var useSideText;
    var textAreaWidth;
    var textAreaPadding;
	var textAreaHeight;

    var mouseX = 0;
    var mouseY = 0;
    var current = null;

    var mapZoom = 1;
    var originW = 900;
    var originH = 440;
    var curMapX = 0;
    var curMapY = 0;
    var viewBoxCoords = [curMapX, curMapY, originW, originH];
    var maxTransX, maxTransY, minTransX, maxTransY;

    var maxX = 0;
    var scale = 1;
    var isOverState = false;
    var draggable = false;
    var _window = $(window);
    var dragStartX = 0;
    var dragStartY = 0;
    var curMouseX = 0;
    var curMouseY = 0;
    var mapOffset = 0;
    var map;
    var backPan;

    var r;
    var pan = {};
    var originViewBox = {};
    var isPanning = false;
    var strokeWidth = 0;

    var readyToAnimate = true;

    // Detect if the browser is IE.
    var IE = $.browser.msie ? true : false;

    $.ajax({
        type: 'GET',
        url: 'xml/settings.xml',
        dataType: $.browser.msie ? 'text' : 'xml',
        success: function (data) {


            var xml;
            if ($.browser.msie) {
                xml = new ActiveXObject('Microsoft.XMLDOM');
                xml.async = false;
                xml.loadXML(data);
            } else {
                xml = data;
            }

            var $xml = $(xml);

            offColor = '#' + $xml.find('mapSettings').attr('offColor');
            strokeColor = '#' + $xml.find('mapSettings').attr('strokeColor');
            mapWidth = $xml.find('mapSettings').attr('mapWidth');
            mapHeight = $xml.find('mapSettings').attr('mapHeight');
            useSideText = $xml.find('mapSettings').attr('useSideText');
            textAreaWidth = $xml.find('mapSettings').attr('textAreaWidth');
            textAreaPadding = $xml.find('mapSettings').attr('textAreaPadding');
            strokeWidth = parseFloat($xml.find('mapSettings').attr('strokeWidth'));
			textAreaHeight = $xml.find('mapSettings').attr('textAreaHeight');


            if (useSideText == 'true') {
                $("#text").css({
                    'width': parseFloat(mapWidth, 10) - parseFloat(textAreaPadding, 10)*2 + 'px',
                    'height': textAreaHeight + 'px',
                    'float': 'left',
					'marginTop': (parseFloat(mapHeight, 10) + 20) + 'px',
                    'padding': textAreaPadding + 'px'
                });

                $('#text').html($xml.find('defaultSideText').text());
            }


            //Parse xml
            $xml.find('stateData').each(function (i) {

                var $node = $(this);

                stateText.push($node.text());
                stateNames.push($node.attr('stateName'));
                stateURLs.push($node.attr('url'));
                stateModes.push($node.attr('stateMode'));
                stateColors.push('#' + $node.attr('initialStateColor'));
                stateOverColors.push('#' + $node.attr('stateOverColor'));
                stateClickedColors.push('#' + $node.attr('stateSelectedColor'));

            });


            map = $('#map');
            mapOffset = map.offset();

            createMap();




        }
    });


    function createMap() {

        //start map
        r = new ScaleRaphael('map', originW, originH),
        attributes = {
            fill: '#d9d9d9',
            cursor: 'pointer',
            stroke: strokeColor,
            'stroke-width': strokeWidth,
            'stroke-linejoin': 'round'
        },
        arr = new Array();

        //Each state
        for (var state in paths) {

            //Create obj
            var obj = r.path(paths[state].path);
            obj.attr(attributes);
            arr[obj.id] = state;

            if (stateModes[obj.id] == 'OFF') {
                obj.attr({
                    fill: offColor,
                    cursor: 'default'
                });
            } else {

                obj.attr({
                    fill: stateColors[obj.id]
                });

                //States mouse over
                obj.mouseover(function (e) {

                    if (!isPanning) {
                        isOverState = true;
                        this.attr({
                            cursor: 'pointer'
                        });

                        //Animate if not already the current state
                        if (this != current) {
                            this.animate({
                                fill: stateOverColors[this.id]
                            }, 500);
                        }

                        //tooltip
                        var point = this.getBBox(0);
                        $('#map').next('.point').remove();
                        $('#map').after($('<div />').addClass('point'));
                        $('.point').html(stateNames[this.id]).css({
                            left: mouseX - 50,
                            top: mouseY - 70
                        }).fadeIn();
                    } else {
                        this.attr({
                            cursor: 'move'
                        });
                    }

                });

                //States mouse out
                obj.mouseout(function (e) {

                    if (!isPanning) {
                        isOverState = false;

                        if (this != current) {
                            this.animate({
                                fill: stateColors[this.id]
                            }, 500);
                        }
                        $('#map').next('.point').remove();
                    }

                });

                //States clicked
                obj.mouseup(function (e) {

                    if (!isPanning) {
                        //Reset scrollbar
                        var t = $('#text')[0];
                        t.scrollLeft = 0;
                        t.scrollTop = 0;

                        //Animate previous state out
                        if (current) {
                            current.animate({
                                fill: stateColors[current.id]
                            }, 500);
                        }

                        //Animate next
                        this.animate({
                            fill: stateClickedColors[this.id]
                        }, 500);

                        current = this;

                        if (useSideText == 'true') {
                            $('#text').html(stateText[this.id]);
                        } else {
                            window.location = stateURLs[this.id];
                        }

                    }

                });


            }

        }


        //Resize map first
        resizeMap(r);
		
		$('.console').fadeIn();



        //Create invisible raphael rectangle for panning
        backPan = r.rect(viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3]).attr({
            fill: '#F00',
            'fill-opacity': 0,
            'stroke': 'none'
        }).data({
            disabled: true,
            'name': '_backpan'
        }).toBack();

        //Add panning event handlers
        backPan.drag(panMove, panStart, panEnd);



        //Add mouse wheel handler for zoom
        map.bind('mousewheel.map', function (event, delta, deltaX, deltaY) {


            if (readyToAnimate) {

                readyToAnimate = false;

                mapZoom += delta / 2;

                if (mapZoom <= 1) mapZoom = 1;

                if (mapZoom == 1) resetMap(r);

                if (mapZoom == 1 && delta < 0) return;


                getViewBox();


                var vWidth = viewBoxCoords[2];
                var vHeight = viewBoxCoords[3];

                viewBoxCoords[2] = originW / mapZoom;
                viewBoxCoords[3] = originH / mapZoom;

                viewBoxCoords[0] += (vWidth - viewBoxCoords[2]) / 2;
                viewBoxCoords[1] += (vHeight - viewBoxCoords[3]) / 2;

                r.animateViewBox(originViewBox, viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3], 250, animationFinished);


                scale = originW / viewBoxCoords[2];
                scale = scale.toFixed(1);


                return false;
            }
        });


        //mouse move to change cursor for panning
        map.mousemove(function (event) {

            if (!isOverState && mapZoom != 1) {
                $(this).css('cursor', 'move');
            } else {
                $(this).css('cursor', 'default');
            }

        });


        //butons hacked from mister fish :P

        //zoom in
        $('#zoomerIn').click(function (e) {

            if (readyToAnimate) {

                readyToAnimate = false;

                mapZoom += .5;

                getViewBox();


                var vWidth = viewBoxCoords[2];
                var vHeight = viewBoxCoords[3];

                viewBoxCoords[2] = originW / mapZoom;
                viewBoxCoords[3] = originH / mapZoom;

                viewBoxCoords[0] += (vWidth - viewBoxCoords[2]) / 2;
                viewBoxCoords[1] += (vHeight - viewBoxCoords[3]) / 2;

                //r.setViewBox(viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3], false);
                r.animateViewBox(originViewBox, viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3], 250, animationFinished);

                scale = originW / viewBoxCoords[2];
                scale = scale.toFixed(1);

                e.stopPropagation();
                e.preventDefault();

            }
        });

        //zoom out
        $('#zoomerOut').click(function (e) {

            if (readyToAnimate) {

                readyToAnimate = false;

                if (mapZoom == 1) {

                    resetMap(r);
                    return;

                }

                mapZoom -= .5;

                getViewBox();


                var vWidth = viewBoxCoords[2];
                var vHeight = viewBoxCoords[3];

                viewBoxCoords[2] = originW / mapZoom;
                viewBoxCoords[3] = originH / mapZoom;

                viewBoxCoords[0] += (vWidth - viewBoxCoords[2]) / 2;
                viewBoxCoords[1] += (vHeight - viewBoxCoords[3]) / 2;


                //r.setViewBox(viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3], false);
                r.animateViewBox(originViewBox, viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3], 250, animationFinished);

                scale = originW / viewBoxCoords[2];
                scale = scale.toFixed(1);

                e.stopPropagation();
                e.preventDefault();

            }

        });

        //Reset zoom and pan
        $('#zoomerReset').click(function (e) {


            resetMap(r);

            e.stopPropagation();
            e.preventDefault();

        });

        //Manual panning not needed anymore
      
        $('#zoomerUp').click(function (e) {


            viewBoxCoords[1] -= 20;

            if (viewBoxCoords[1] <= 0) viewBoxCoords[1] = 0;


            r.setViewBox(viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3], false);

            e.stopPropagation();
            e.preventDefault();

        });

        //move down
        $('#zoomerDown').click(function (e) {

            viewBoxCoords[1] += 20;

            var limitY = originH - viewBoxCoords[3];

            if (viewBoxCoords[1] >= limitY) viewBoxCoords[1] = limitY;


            r.setViewBox(viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3], false);

            e.stopPropagation();
            e.preventDefault();
        });

        //move left
        $('#zoomerLeft').click(function (e) {

            viewBoxCoords[0] -= 20;

            if (viewBoxCoords[0] <= 0) viewBoxCoords[0] = 0;

            r.setViewBox(viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3], false);

            e.stopPropagation();
            e.preventDefault();
        });

        //move right
        $('#zoomerRight').click(function (e) {

            viewBoxCoords[0] += 20;

            var limitX = originW - viewBoxCoords[2];

            if (viewBoxCoords[0] >= limitX) viewBoxCoords[0] = limitX;


            r.setViewBox(viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3], false);

            e.stopPropagation();
            e.preventDefault();
        });
		
      




    }

    function getViewBox() {

        originViewBox.x = viewBoxCoords[0];
        originViewBox.y = viewBoxCoords[1];
        originViewBox.width = viewBoxCoords[2];
        originViewBox.height = viewBoxCoords[3];

    }

    function animationFinished(x, y, w, h) {

        originViewBox.x = x;
        originViewBox.y = y;
        originViewBox.width = w;
        originViewBox.height = h;

        readyToAnimate = true;


    }

    //Pan start handler
    function panStart() {

        pan.dx = viewBoxCoords[0];
        pan.dy = viewBoxCoords[1];

        isPanning = true;
    };

    //Pan move handler
    function panMove(dx, dy) {

        pan.dx = viewBoxCoords[0] - dx / scale;
        pan.dy = viewBoxCoords[1] - dy / scale;

        var limitY = originH - viewBoxCoords[3];
        var limitX = originW - viewBoxCoords[2];

        if (pan.dx >= limitX) pan.dx = limitX;
        if (pan.dx <= 0) pan.dx = 0;

        if (pan.dy >= limitY) pan.dy = limitY;
        if (pan.dy <= 0) pan.dy = 0;

        r.setViewBox(pan.dx, pan.dy, viewBoxCoords[2], viewBoxCoords[3], false);

    };

    //Pan end handler
    function panEnd() {

        isPanning = false;

        viewBoxCoords[0] = pan.dx;
        viewBoxCoords[1] = pan.dy;

    };


    //Reset zoom and pan
    function resetMap(map) {

        mapZoom = 1;

        viewBoxCoords[0] = 0;
        viewBoxCoords[1] = 0;
        viewBoxCoords[2] = originW;
        viewBoxCoords[3] = originH;

        originViewBox.x = 0;
        originViewBox.y = 0;
        originViewBox.width = originW;
        originViewBox.height = originH;

        //map.setViewBox(viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3], false);
        map.animateViewBox(originViewBox, viewBoxCoords[0], viewBoxCoords[1], viewBoxCoords[2], viewBoxCoords[3], 250, animationFinished);

        readyToAnimate = true;

    }

    // Set up for mouse capture
    if (document.captureEvents && Event.MOUSEMOVE) {
        document.captureEvents(Event.MOUSEMOVE);
    }

    // Main function to retrieve mouse x-y pos.s

    function getMouseXY(e) {

        var scrollTop = $(window).scrollTop();

        if (e && e.pageX) {
            mouseX = e.pageX;
            mouseY = e.pageY - scrollTop;
        } else {
            mouseX = event.clientX + document.body.scrollLeft;
            mouseY = event.clientY + document.body.scrollTop;
        }
        // catch possible negative values
        if (mouseX < 0) {
            mouseX = 0;
        }
        if (mouseY < 0) {
            mouseY = 0;
        }

        $('#map').next('.point').css({
            left: mouseX - 50,
            top: mouseY - 70
        })
    }

    // Set-up to use getMouseXY function onMouseMove
    document.body.onmousemove = getMouseXY;


    function resizeMap(paper) {

        paper.changeSize(mapWidth, mapHeight, true, false);

        if (useSideText == 'true') {
            $(".mapWrapper").css({
                'width': parseFloat(mapWidth, 10) + 'px',
                    'height': mapHeight + 'px'
            });
        } else {
            $(".mapWrapper").css({
                'width': mapWidth + 'px',
                    'height': mapHeight + 'px'
            });
        }

    }



});