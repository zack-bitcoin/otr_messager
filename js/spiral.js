

var switch_button = document.getElementById("switchButton");
var img = document.getElementById("pic");
var mode = 2;
switch_button.onclick = function() {
    console.log("switch button 2 clicked");
    //var it = img.src;
    //console.log(it);
    if (mode == 1) {
        img.src = "spots2.png";
        mode = 2;
    } else if (mode == 2) {
        img.src = "spots3.png";
        mode = 3;
    } else {
        img.src = "spots.png";
        mode = 1;
    }
    draw_helper(0,0);
};
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
draw_helper(0,0);

function draw_helper(X, Y) {
    X = X / 50;
    X = Math.min(20, X);
    X = Math.max(0, X);
    Y = Y / 40;
    Y = Math.min(20, Y);
    Y = Math.max(0, Y);
    ctx.clearRect(0, 0, c.width, c.height);
    //ctx.drawImage(img, 10, 10, 1000, 800);
    ctx.drawImage(img, X-(Y), Y+(X*1.5), 1000, 800);
    ctx.rotate(Math.PI/100);
    ctx.drawImage(img, 0, 0, 1020, 820);
    ctx.rotate(-Math.PI/100);
}; 

document.addEventListener('mousemove', function(e){
    var L = c.offsetLeft;
    var T = c.offsetTop;

    var mouseX = e.pageX;
    var mouseY = e.pageY;
    draw_helper(mouseX - L, mouseY - T);
    //console.log(JSON.stringify(mouseX - L));
    //console.log(JSON.stringify(mouseY - T));
    //console.log(JSON.stringify(e));
});
