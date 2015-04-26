$(function(){
function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
$("#test-area").touchInit({
    preventDefault: true,
    mouse: true,
    pen: true,
    maxtouch: -1,
    prefix: ""
});

var timeout_id = null;
var last_original_event = null;
var handler = function (e) {
    $("#last-event-name").text(e.type);
    
    var showData ={
        clientX: e.clientX, clientY: e.clientY,
        pageX: e.pageX, pageY: e.pageY,
        screenX: e.screenX, screenY: e.screenY,
        touches: e.touches
    };
    
    $("#last-event-detail").html(syntaxHighlight(JSON.stringify(showData, undefined, 2)));

    if (last_original_event != e.originalType) {
        last_original_event = e.originalType;
        $("#original-event").html(e.originalType + "<br/>" + $("#original-event").html());
        if (timeout_id !== null) window.clearTimeout(timeout_id);
        timeout_id = window.setTimeout(
            function () {
                $("#original-event").html("");
            },
            5000);
    }
};

$("#test-area").on("touch_start", handler);
$("#test-area").on("touch_move", handler);
$("#test-area").on("touch_end", handler);
});