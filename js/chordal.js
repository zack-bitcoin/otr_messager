var text = document.getElementById("main");
var string = "abcd\nabcd\nabcd\n";
var cursor = 0;

var yanked = [];
var yanking = false;

var fps = 30;
display_string(string);
function mainloop() {
    var gp = navigator.getGamepads()[0];
    if (!(gp == undefined)) {
        handle_button_press(gp);
        handle_button_unpress(gp.buttons);
        //handle_axes(gp.axes);
        //console.log(gp.axes);
    };
    setTimeout(mainloop, 1000/fps);
};
mainloop();
function L1(A) {
    trigger(next_char_l1, A);
};
function L2(A) {
    trigger(next_char_l2, A);
};
function R1(A) {
    trigger(next_char_r1, A);
};
function R2(A) {
    trigger(next_char_r2, A);
};
function trigger(F, A){
    var d = axes_reader(A);
    console.log(d);
    var c = F[d];
    if(c == "yank"){
        if(!(yanking)){
            yanked = [];
        };
        var t = till_next("\n", cursor, string);
        var s = since_last("\n", cursor-1, string);
        string2 = string.slice(0, cursor-s).concat(string.slice(cursor+t+1, string.length));
        var line = string.slice(cursor-s, cursor+t);
        string = string2;
        yanked = yanked.concat(line);
        //remove current line from string, append it to yanked.
        yanking = true;
        display_string(string);
        return(0);
    };
    yanking = false;
    if(c == "backspace"){
        var sa = string.slice(0, cursor-1);
        var sb = string.slice(cursor, string.length);
        string = sa.concat(sb);
        cursor -= 1;
    } else if(c == "up"){
        cursor -= up_many(cursor, string);
        cursor = Math.max(cursor,0);
    } else if(c == "down"){
        cursor += down_many(cursor, string);
        cursor = Math.min(cursor,string.length);
    } else if(c == "right"){
        cursor += 1;
        cursor = Math.min(cursor,string.length);
    } else if(c == "left"){
        cursor -= 1;
        cursor = Math.max(cursor,0);
    } else if(c == "paste"){
        var t = till_next("\n", cursor, string);
        var sa = string.slice(0, cursor+t);
        var sb = string.slice(cursor+t, string.length);
        var yanked_text = y2t(yanked);
        string = sa.concat(yanked_text).concat(sb);
    } else if(!(c == undefined)){
        //string = string.concat(c);
        var sa = string.slice(0, cursor);
        var sb = string.slice(cursor, string.length);
        string = sa.concat(c).concat(sb);
        cursor += 1;
    };
    display_string(string);
        return(0);
    };
function display_string(s){
    var sa = s.slice(0,cursor);
    var sb = s.slice(cursor,s.length);
    s3 = sa.concat("|").concat(sb);
    var s2 = "";
    for(var i=0;i<s3.length;i++){
        if (s3[i] == "\n") {
            s2 = s2.concat("<br />");
        } else {
            s2 = s2.concat(s3[i]);
        };
    };
    text.innerHTML = s2;//sa.concat("|").concat(sb);
};
function till_next(c, n, string) {
    var x = 0;
    for(;n<string.length;n++){
        if (string[n] == c){
            return(x);
        };
        x+=1;
    };
    return(x);
};
function since_last(c, n, string) {
    var x = 0;
    for(;n>-1;n--){
        if (string[n] == c){
            return(x);
        };
        x+=1;
    };
    return(x);
};
function down_many(position, string) {
    //count backward to nearest line break. count forward that many characters in the next line.
    var b = since_last("\n", position-1, string);
    var c = till_next("\n", position, string);
    var d = till_next("\n", position+c, string);
    var e = Math.max(b+1, d);
    return(c+e);
};
function up_many(position, string) {
    var a = since_last("\n", position, string);
    var b = since_last("\n", position-a-1, string);
    var c = Math.max(b+1, a);
    return(c);
};
function y2t(yanked){
    var s = "";
    for(var i=0;i<yanked.length;i++){
        s=s.concat("\n").concat(yanked[i]);
    };
    return(s);
};

var next_char_r1 = {
    55: "up",
    33: "yank",
    0: " ",
    10: "a",
    20: "b",
    30: "c",
    40: "d",
    50: "e",
    60: "f",
    70: "g",
    80: "h",
    90: "i",
    1:"Q",
    2:"R",
    3:"S",
    4:"T",
    5:"U",
    6:"V",
    7:"W",
    8:"X",
};
var next_char_r2 = {
    55: "down",
    0: "\n",
    10:"i",
    20:"j",
    30:"k",
    40:"l",
    50:"m",
    60:"n",
    70:"o",
    80:"p",
    1:"Y",
    2:"Z",
    3:"0",
    4:"2",
    5:"4",
    6:"6",
    7:"8",
};
var next_char_l2 = {
    55: "left",
    //0:0,
    1:"y",
    2:"z",
    3:"1",
    4:"3",
    5:"5",
    6:"7",
    7:"9",
    10:"I",
    20:"J",
    30:"K",
    40:"L",
    50:"M",
    60:"N",
    70:"O",
    80:"P",
}
var next_char_l1 = {
    55: "right",
    33: "paste",
    0: "backspace",
    1:"q",
    2:"r",
    3:"s",
    4:"t",
    5:"u",
    6:"v",
    7:"w",
    8:"x",
    10: "A",
    20: "B",
    30: "C",
    40: "D",
    50: "E",
    60: "F",
    70: "G",
    80: "H",
    };

function axes_reader(A) {
    //label like a clock, neutral is zero. up is 1. down is 5.
    //multiply the left by 10, return a decimal integer.
    A = A.map(function(x) {
        if(x>epsilon){ return(1)};
        if(x<-epsilon){ return(-1)};
        return(0);
    });
    var d1 = axes_digit(A[0], A[1]);
    var d2 = axes_digit(A[2], A[3]);
    d2 = 10-d2;
    if (d2==9){
        d2 = 1;
    };
    if (d2==10){
        d2 = 0;
    };
    return((d1*10)+d2);
};
function axes_digit(h, v){
    if(h==0){
        if(v==0){
            return(0);
        }else if(v==1){
            return(1);
        }else{
            return(5);
        }
    }else if(h==1){
        if(v==1){
            return(2);
        }else if(v==0){
            return(3);
        }else{
            return(4);
        }
    }else if(h==-1){
        if(v==-1){
            return(6);
        }else if(v==0){
            return(7);
        }else{
            return(8);
        }
    };
};

var button_state = {a: false, x: false, left: false, up: false, right: false, down: false, L1: false, L2: false, R1: false, R2: false};
var button_names = [
    ["L1", L1, 4],
    ["L2", L2, 6],
    ["R1", R1, 5],
    ["R2", R2, 7],
];
//axes [left_horizontal, left_vertical, right_horizontal, right_vertical]
//right and down are 1's, left and up are -1's
var epsilon = 0.2;
function handle_button_unpress(buttons) {
    for(i=0;i<button_names.length;i++){
        var bn = button_names[i];
        var num = bn[2];
        //var fun = bn[1];
        var name = bn[0];
        if (buttons[num].value < epsilon) {
            button_state[name] = false;
        };
    };
};
function handle_button_press(gp) {
    var buttons = gp.buttons;
    for(i=0;i<button_names.length;i++){
        var bn = button_names[i];
        var num = bn[2];
        var fun = bn[1];
        var name = bn[0];
        if ((buttons[num].value > epsilon) && (!(button_state[name]))) {
            button_state[name] = true;
            fun(gp.axes);
        };

    };
    //console.log(buttons.map(function(x){return x.value}));
};
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
