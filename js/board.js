
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var size = 19;
//var size = 13;
//var size = 9;

var spot_size = 40;
var empty = document.getElementById("empty");
var black = document.getElementById("black");
var white = document.getElementById("white");
var star = document.getElementById("star");
var mark = document.getElementById("mark");

var board = generate_empty_board(size);

function generate_empty_board(n) {
    var r = list_many(n, 0);
    return(list_many(n, r));
};
function list_many(n, r) {
    if(n<1){
        return([]);
    };
    var r2 = JSON.parse(JSON.stringify(r));
    return([r2].concat(list_many(n-1, r)));
};
function star_int(x) {
    if (size == 19) {
        return((x == 3) || (x == 9) || (x == 15));
    } else if (size == 13) {
        return((x == 3) || (x == 9));
    } else if (size == 9) {
        return((x == 2) || (x == 6));
    };
    return(false);
};
function is_odd(x) {
    return((x % 2) == 1);
};
function draw_board() {
    ctx.clearRect(0, 0, c.width, c.height);
    for(i=0;i<size;i++) {
        for(j=0;j<size;j++){
            var img;
            var b = board[i][j];
            if (b == 0) {
                img = empty;
                if ((star_int(i) && star_int(j))) {
                    img = star;
                };
                if (is_odd(size) && (i == Math.floor(size / 2))
                    && (j == Math.floor(size / 2))) {
                    img = star;
                };
            } else if (b == 1) {
                img = black;
            } else if (b == 2) {
                img = white;
            }
            ctx.drawImage(img, i*spot_size, j*spot_size, spot_size, spot_size);
        }
    }
};


document.addEventListener('click', function(e){
    var L = c.offsetLeft;
    var T = c.offsetTop;
    var W = c.width;
    var H = c.height;
    var mouseX = e.pageX;
    var mouseY = e.pageY;
    var X = mouseX - L;
    var Y = mouseY - T;
    board_size = size*spot_size;
    if((X > -1) && (X < (board_size + 1)) &&
       (Y > -1) && (Y < (board_size + 1))) {
        var X2 = Math.floor(X / spot_size);
        var Y2 = Math.floor(Y / spot_size);
        var b = board[X2][Y2];
        b = b + 1;
        if (b>2) {
            b = 0;
        };
        board[X2][Y2] = b;
        draw_board();
    };
})

setTimeout(function() {
    draw_board();
}, 100);
