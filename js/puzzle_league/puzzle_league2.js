//View, then Model, then Controller

//View
var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");

var cursor=document.getElementById('cursor');
var yellow = document.getElementById('yellow');
var blue = document.getElementById('blue');
var red = document.getElementById('red');
var black = document.getElementById('black');
var green = document.getElementById('green');
var block_types = [yellow, blue, red, black, green];

var pause_button = document.getElementById("pause_button");
pause_button.onclick = pause_func;
var fast_button = document.getElementById("fast_button");
fast_button.onclick = add_row;
var restart_button = document.getElementById("restart_button");
restart_button.onclick = new_game;

var points_p = document.getElementById("points");

function loc_shifter() {
    return(Math.max(0, new_row_timer/frames_per_row) + 0.5);
};
function draw_board() {
    var a = loc_shifter();
    var ss = square_size;
    for(columns=0;columns<ManyColumns;columns++){
        for(rows=0;rows<ManyRows;rows++) {
            var x = board[rows][columns];
            if ((!(x == 0)) && (!(x == undefined))){
                ctx.drawImage(block_types[x-1], ss*columns, ss*(1+rows - a));
            }
        };
    };
    var curx = (ss * cursor_location[0]);
    var cury = (ss * (cursor_location[1] + 1 - a));
    ctx.drawImage(cursor, curx-4, cury-4);
    points_p.innerHTML = "point: ".concat(points).concat(" | best move: ").concat(best_move).concat(" | current speed: ").concat(Math.round(speed*1000)).concat("<br />time till next row: ").concat(Math.round((frames_per_row - new_row_timer)/fps/speed)).concat(" | time: ").concat(Math.round(game_time));
};
function clearscreen(B){
    ctx.clearRect(0,0,c.width,c.height);
    ctx.beginPath();
    ctx.rect(0,0,c.width,c.height);
    if (B) {
        ctx.fillStyle = '#444444';
    } else {
        ctx.fillStyle = '#333333';
    }
    ctx.fill();
};


//Model

var frames_per_row = 50;
var ManyRows = 12;
var ManyColumns = 6;
var square_size = 50;
var pause = false;
var game_over = false;
var new_row_timer, speed, board, cursor_location, points, best_move, game_time;


function new_game() {
    game_time = 0;
    new_row_timer = 40;
    speed = 0.5;
    board = empty_board();
    cursor_location = [2,12];
    add_row();
    add_row();
    add_row();
    add_row();
    points = 0;
    best_move = 0;
    pause = false;
    game_over = false;
    pause_button.innerHTML = "Pause";
};
new_game();

function full() {
    return(!(JSON.stringify(board[0]) == JSON.stringify([0,0,0,0,0,0])));
};

function add_row() {
    var bool = full();
    if ((!bool) && (!pause)) {
        var new_row = generate_row();
        board = board.slice(1).concat([new_row]);
        new_row_timer = Math.min(0, new_row_timer);
        cursor_location[1] = Math.max(0, cursor_location[1] - 1);
    };
};
function empty_board() {
    var r = list_many(6, 0);//columns
    return(list_many(12, r));//rows
};
function list_many(n, r) {
    if(n<1){
        return([]);
    };
    var r2 = JSON.parse(JSON.stringify(r));
    return([r2].concat(list_many(n-1, r)));
};
function valid_row(a, b, c) {
    for(i=0;i<6;i++){
        if ((a[i] == b[i]) && (a[i] == c[i])){
            return(false);
        };
        if ((a[i] == a[i+1]) && (a[i] == a[i+2])){
            return(false);
        };
    };
    return(true);
};
function generate_row() {
    var a = board[10];
    var b = board[11];
    var Z = [0,0,0,0,0,0].map(function(x){
        var n = Math.floor(Math.random()*(block_types.length));
        return(n+1);
    });
    var d = valid_row(Z, a, b);
    if (d){
        return(Z);
    };
    return(generate_row());
}

function match_columns(){
    var X = [];
    for (r=0;r<(ManyRows - 2);r++){
        for(col=0;col<ManyColumns;col++){
            if(!(board[r][col] == 0)) {
                if((board[r][col] == board[r+1][col]) && (board[r][col] == board[r+2][col])){
                    X = X.concat([[r, col],[r+1, col],[r+2, col]]);
                };
            };
        };
    };
    return(X);
};
function match_rows(){
    var X = [];
    for (r=0;r<ManyRows;r++){
        for(col=0;col<(ManyColumns - 2);col++){
            if(!(board[r][col] == 0)) {
                if((board[r][col] == board[r][col+1]) && (board[r][col] == board[r][col+2])){
                    X = X.concat([[r, col],[r,col+1],[r,col+2]]);
                };
            };
        };
    };
    return(X);
};
function is_in(a, L){
    if(L.length == 0){
        return(false);
    };
    if(JSON.stringify(L[0]) == JSON.stringify(a)){
        return(true);
    };
    return(is_in(a, L.slice(1)));
};
function remove_repeats(L){
    if(L.length < 2) {
        return(L);
    };
    var h = L[0];
    var L2 = L.slice(1);
    var b = is_in(h, L2);
    var d;
    if(b){
        d = [];
    } else {
        d = [h]
    };
    return(d.concat(remove_repeats(L2)));
};
function gravity2(R, C) {
    //a single block is falling multiple blocks of height
    if(R==11){//cant fall further than the bottom
        return(0);
    };
    if(!(board[R+1][C] == 0)) {
        return(0);
    };
    board[R+1][C] = board[R][C];
    board[R][C] = 0;
    gravity2(R+1, C);
};
function gravity(R, C) {//only do this if the spot below R,C is empty
    //a stack of blocks falling a height of 1.
    if(R<0){
        return(0);
    };
    if(board[R][C] == 0) {
        return(0);
    };
    board[R+1][C] = board[R][C];
    board[R][C] = 0;
    return(gravity(R-1, C));
};
function remove_spot(R, C) {
    board[R][C] = 0;
    return(gravity(R-1, C));
};
function remove_from_board(L) {
    L.map(function(x){remove_spot(x[0],x[1])});
};
function match() {
    //remove any rows or columns from board that match. apply gravity rules to move blocks downwards, and then attempt to match again, with double points this time.
    var r1 = match_columns(board);
    var r2 = match_rows(board);
    var r3 = remove_repeats((r1).concat(r2));
    if (r3.length == 0) {
        return 0;
    };
    remove_from_board(r3);
    return(r3.length - 2 + (2 * match()));
};
function pause_func() {
    pause = !(pause);
    if(pause){
        clearscreen(false);
        pause_button.innerHTML = "Resume";
    } else {
        pause_button.innerHTML = "Pause";
    };
};
function up(){
    cursor_location[1] = Math.max(0, cursor_location[1] - 1);
};
function down(){
    cursor_location[1] = Math.min(11, cursor_location[1] + 1);
};
function right(){
    cursor_location[0] = Math.min(4, cursor_location[0] + 1);
};
function left(){
    cursor_location[0] = Math.max(0, cursor_location[0] - 1);
};

var fps = 20;
var button_state = {a: false, x: false, left: false, up: false, right: false, down: false};
function mainloop() {
    if(!(pause) && !(game_over)) {
        game_time += (1 / fps);
        speed *= 1.00025;
        var bool = (!(full()));
        if (bool || (new_row_timer < (-speed))) {
            new_row_timer += speed;
        } else {
            new_row_timer += (speed/2);
        };
        if (new_row_timer > frames_per_row) {
            if (bool){
                add_row();
            } else {
                console.log("game over");
                game_over = true;
            }
        };
        clearscreen(bool);
        draw_board();
    };
    var gp = navigator.getGamepads()[0];
    if (!(gp == undefined)) {
        handle_button_press(gp.buttons);
        handle_button_unpress(gp.buttons);
    };
    setTimeout(mainloop, 1000/fps);
};
mainloop();
var button_names = [
    ["a", swap_helper, 0],
    ["x", add_row, 2],
    ["up", up, 12],
    ["down", down, 13],
    ["left", left, 14],
    ["right", right, 15]
];
function handle_button_unpress(buttons) {
    for(i=0;i<button_names.length;i++){
        var bn = button_names[i];
        var num = bn[2];
        //var fun = bn[1];
        var name = bn[0];
        if (buttons[num].value == 0) {
            button_state[name] = false;
        };
    };
};
function handle_button_press(buttons) {
    for(i=0;i<button_names.length;i++){
        var bn = button_names[i];
        var num = bn[2];
        var fun = bn[1];
        var name = bn[0];
        if ((buttons[num].value == 1) && (!(button_state[name]))) {
            button_state[name] = true;
            fun();
        };

    };
    console.log(buttons.map(function(x){return x.value}));
};

function swap(Y, X) {
    var a = board[Y][X-1];
    var b = board[Y][X];
    board[Y][X-1] = b;
    board[Y][X] = a;
    if(a == 0) {
        gravity(Y-1,X);
    } else if(b == 0) {
        gravity(Y-1, X-1);
    }
    if(Y < 11) {
        gravity2(Y, X);
        gravity2(Y, X-1);
    };
    var m = match();
    new_row_timer -= ((frames_per_row) * m / 3);
    points += m;
    best_move = Math.max(best_move, m);
};
function swap_helper() {
    swap(cursor_location[1], cursor_location[0]+1);
};

//Controller

var keys = {};
keys[90] = add_row;//z key
keys[80] = pause_func;//p key
keys[82] = new_game;//r key
keys[32] = swap_helper;
//arrow keys
keys[37] = left;
keys[39] = right;
keys[38] = up;
keys[40] = down;
//vi keybindings
keys[72] = left;
keys[74] = down;
keys[75] = up;
keys[76] = right;
document.addEventListener('keydown', function(event) {
    //console.log(event.keyCode);
    var f = keys[event.keyCode];
    if(!(f == undefined)){ f(); };
});

document.addEventListener('click', function(e){
    var L = c.offsetLeft;
    var T = c.offsetTop;
    var W = c.width;
    var H = c.height;
    var mouseX = e.pageX;
    var mouseY = e.pageY;
    if ((mouseX > L) && (mouseX < (L+W)) && (mouseY > T) && (mouseY < (T+H))) {
        var X = mouseX - L;
        var a = loc_shifter();
        var Y = mouseY - T + (a * square_size);
        Y = Math.floor((Y / square_size)-1);
        X = Math.floor(0.5 + (X / square_size));
        X = Math.min(X, 5);
        X = Math.max(X, 1);
        swap(Y, X);
    };
});




//navigator.getGamepads()[0].buttons[0];
var gamepads = {};

function gamepadHandler(event, connecting) {
  var gamepad = event.gamepad;
  // Note:
  // gamepad === navigator.getGamepads()[gamepad.index]

  if (connecting) {
    gamepads[gamepad.index] = gamepad;
  } else {
    delete gamepads[gamepad.index];
  }
}

window.addEventListener("gamepadconnected", function(e) { gamepadHandler(e, true); }, false);
//window.addEventListener("gamepaddisconnected", function(e) { gamepadHandler(e, false); }, false);
window.addEventListener("gamepadconnected", function(e) {
  var gp = navigator.getGamepads()[e.gamepad.index];
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    gp.index, gp.id,
    gp.buttons.length, gp.axes.length);
});

