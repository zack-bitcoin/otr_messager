var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var perspective = {x:0,z:500,theta:0};

var points = [
    make_3_point(50, 50, 1000),
    make_3_point(50, -50, 1000),
    make_3_point(-50, 50, 1000),
    make_3_point(-50, -50, 1000),
    make_3_point(100, -50, 900),//4
    make_3_point(-100, -50, 900),
    make_3_point(100, 50, 900),
    make_3_point(-100, 50, 900),
    make_3_point(100, 50, 700),//8
    make_3_point(-100, 50, 700),
    make_3_point(100, -50, 700),
    make_3_point(-100, -50, 700),
];

//var faces = [[0,1,2,3]];
var colors = ["#880000",//red
              "#000000",//black
              "#008800",//green
              "#000088",//blue
              "#FF0088",//pink
              "#88FF00",//lime
              "#FF8800",//neon orange
              "#00FF88",//green3
              "#FF0000",//bright red
             ];

var triangles = [
    [0,3,1,colors[8]],[0,2,3,colors[8]],
    [4,6,0,colors[5]],[0,1,4,colors[5]],
    [7, 5, 2,colors[5]],[3,2,5,colors[5]],
    [2,0,6,colors[4]],[7,2,6,colors[4]],
    [1,3,4,colors[4]],[4,3,5,colors[4]],

    [10,4,11,colors[6]],[5,11,4,colors[6]],
    [6,8,9,colors[6]],[9,7,6,colors[6]],

    [10,6,4,colors[7]],[6,10,8,colors[7]],
    [9,5,7,colors[7]],[5,9,11,colors[7]],
    
    [3,0,1,colors[1]],[2,0,3,colors[1]],
    [4,0,6,colors[1]],[1,0,4,colors[1]],
    [7,2,5,colors[1]],[3,5,2,colors[1]],
    [2,6,0,colors[1]],[7,6,2,colors[1]],
    [1,4,3,colors[1]],[4,5,3,colors[1]],

    [6,10,4,colors[1]],[10,6,8,colors[1]],
    [5,9,7,colors[1]],[9,5,11,colors[1]],
                ];

var fps = 20;
function cron(){
    draw_helper(points, triangles);
    setTimeout(cron, 1000/fps);
};
cron();

function in_perspective(point, rotation) {
    var point2 = make_3_point(point.x - perspective.x, point.y, point.z - perspective.z);
    var point3 = mul_v_m(point2, rotation);
    return(point3);
};
function mul_v_v(p, v) {
    return (p.x*v[0]) + (p.y * v[1]) + (p.z * v[2]);
};
function mul_v_m(p, m){
    var p2 = JSON.parse(JSON.stringify(p));
    p2.x = mul_v_v(p, m[0]);
    p2.y = mul_v_v(p, m[1]);
    p2.z = mul_v_v(p, m[2]);
    return(p2);
};

function rotation_matrix_y(angle) {
    return([
        [Math.cos(angle),0,Math.sin(angle)],
        [0,1,0],
        [-Math.sin(angle),0,Math.cos(angle)]]);
};
function draw_helper(points, triangles) {
    var r = rotation_matrix_y(perspective.theta);
    //console.log(JSON.stringify(r));
    var points2 = points.map(
        function(p) {
            return(in_perspective(p, r)) });
    ctx.clearRect(0, 0, c.width, c.height);
    return draw_triangles(points2, triangles);
};

function make_3_point(a, b, c) {
    return {x: a, y: b, z: c};
}
function clockwise(p1, p2, p3) {
    //checking the sign of the cross product of a couple vectors made from these points.
    var v1 = [(p2.x - p1.x), (p2.y - p1.y)];
    var v2 = [(p3.x - p1.x), (p3.y - p1.y)];
    var cross = (v1[0]*v2[1]) - (v2[0]*v1[1]);
    return cross > 0;
};
function draw_triangle(p1, p2, p3, color) {
    var b = clockwise(p1, p2, p3);
    if (b) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.fillStyle = color;
        ctx.fill();
    }
}
function draw_triangles(corners, triangles) {
    if (triangles.length == 0) {
        return(0);
    }
    var tri = triangles[0];
    var P0 = corners[tri[0]];
    var P1 = corners[tri[1]];
    var P2 = corners[tri[2]];
    if ((P0.z > 0) && (P1.z > 0) && (P2.z > 0)) {
        var p1 = three_to_two(P0);
        var p2 = three_to_two(P1);
        var p3 = three_to_two(P2);
        draw_triangle(p1, p2, p3, tri[3]);
    }
    return draw_triangles(corners, triangles.slice(1));
};

function three_to_two(a) {
    //takes a 2d images of the 3d model
    var W = c.width;
    var Z = W;
    var H = c.height;
    var f = a.z / Z;
    var X = (W/2) + (a.x / f);
    var Y = (H/2) + (a.y / f);
    return {x: X, y: Y};
}


//Controller

var step_size = 20;
function left() {
    perspective.theta += 0.1;
};
function step_left() {
    var T = perspective.theta;
    var S = Math.sin(T);
    var C = Math.cos(T);
    perspective.z -= (S*step_size);
    perspective.x -= (C*step_size);
};
function up() {
    var T = perspective.theta;
    var S = Math.sin(T);
    var C = Math.cos(T);
    perspective.z += (C*step_size);
    perspective.x -= (S*step_size);
};
function right() {
    perspective.theta -= 0.1;
};
function step_right() {
    var T = perspective.theta;
    var S = Math.sin(T);
    var C = Math.cos(T);
    perspective.z += (S*step_size);
    perspective.x += (C*step_size);
};
function down() {
    var T = perspective.theta;
    var S = Math.sin(T);
    var C = Math.cos(T);
    perspective.z -= (C*step_size);
    perspective.x += (S*step_size);
};

var keys = {};
keys[37] = left;
keys[38] = up;
keys[39] = right;
keys[40] = down;
keys[65] = step_left;
keys[83] = step_right;
document.addEventListener('keydown', function(event) {
    var f = keys[event.keyCode];
    if(!(f == undefined)){ f(); };
//    console.log(event.keyCode);
});
 
