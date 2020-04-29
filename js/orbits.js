var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");


var fps = 60;
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
//var pdb = pdb_maker();
var starting_distance = 2000;

var planets = [
    make_planet(100, 0, starting_distance, 0, 0, 1, 40, colors[1]),
    make_planet(0, 50, starting_distance, 0, 0, -1, 40, colors[2]),
    make_planet(10, 50, starting_distance, 2, 0, 0, 10, colors[3]),
    make_planet(0, 0, starting_distance, -2, 0, 0, 10, colors[4]),
    make_planet(10, 50, starting_distance, 0, 1, 0, 5, colors[7]),
    make_planet(0, 0, starting_distance, 0, -1, 0, 5, colors[6]),
    make_planet(0, 100, starting_distance, 0, -3, 0, 1, colors[5]),
    make_planet(0, 100, starting_distance, 0, 3, 0, 1, colors[0]),
    make_planet(0, 0, starting_distance, 0, 0, 0, 100, colors[8]),
];

function cron(){
    time_step_page();
    draw_helper();
    setTimeout(cron, 1000/fps);
};
cron();

//console.log(JSON.stringify(planets));
//time_step_page();
//console.log(JSON.stringify(planets));

function draw_helper(){
    ctx.clearRect(0, 0, c.width, c.height);
    //draw_background();
    planets = planets.sort(function(a, b){return(b.z - a.z);});
    for(var i=0;i<planets.length;i++){
        var P = planets[i];
        var p1 = three_to_two(P);
        var size = 200000000 / P.z / P.z;
        //console.log(size);
        var p2 = {y: p1.y, x: p1.x + size};
        var p3 = {y: p1.y + size, x: p1.x};
        draw_triangle(p1, p2, p3, P.color);
    };
};
function three_to_two(a) {
    var W = c.width;
    var Z = W;
    var H = c.height;
    var f = a.z / Z;
    var X = (W/2) + (a.x / f);
    var Y = (H/2) + (a.y / f);
    return {x: X, y: Y};
}

function make_planet(X, Y, Z, dX, dY, dZ, Mass, Color) {
    return({x: X, y: Y, z: Z, dx: dX, dy: dY, dz: dZ, mass: Mass, color: Color});
};
function force(X, Y, Z){
    var A = [0,0,0];
    for(var i=0;i<planets.length;i++){
        var p = planets[i];
        var dx = X - p.x;
        var dy = Y - p.y;
        var dz = Z - p.z;
        var d2 = (dx*dx) + (dy*dy) + (dz*dz);
        if (!(d2 == 0)){
            var m = p.mass/d2;//magnitude
            var distance = Math.max(Math.sqrt(d2), 20);
            var m = p.mass / distance;
            //console.log(JSON.stringify([dx, d2, m, distance]));
            var z = 20;
            A[0] -= (m * dx / distance)*z;
            A[1] -= (m * dy / distance)*z;
            A[2] -= (m * dz / distance)*z;
        };
    };
    return(A);
};
function time_step_element(P){
    var f = force(P.x, P.y, P.z);
    //console.log(JSON.stringify(f));
    var fx = f[0];
    var fy = f[1];
    var fz = f[2];
    var friction = 0.99;
    P.dx = P.dx * friction;
    P.dy = P.dy * friction;
    P.dz = P.dz * friction;
    return({x: P.x + P.dx, y: P.y + P.dy, z: P.z + P.dz,
            dx: P.dx + (fx/P.mass),
            dy: P.dy + (fy/P.mass),
            dz: P.dz + (fz/P.mass),
            mass: P.mass,
            color: P.color});
};

function time_step_page(){
    var planets2 = [];
    for(var i=0;i<planets.length;i++){
        var P = JSON.parse(JSON.stringify(planets[i]));
        var P2 = time_step_element(P);
        //console.log(P2);
        planets2[i] = P2;
    };
    planets = planets2;
};
function draw_triangle(p1, p2, p3, color) {
    var b = true;//clockwise(p1, p2, p3);
    if (b) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.fillStyle = color;
        ctx.fill();
    }
}
/*
function pdb_maker() {
    var db = {type: "points"};
    var top = 0;
    return({
        top: top,
        db: db,
        add: function(x,y,z) {
            db[top] = make_3_point(x, y, z);
            top += 1;
            return(top-1);
        },
        perspective: function(){
            //rotates and shifts each point over based on your current location and the direction you are facing. Points are still specified in 3d.
            var r = rotation_matrix_y(perspective.theta);
            var db2 = {};
            for(var i=0;i<top;i++) {
                db2[i] = in_perspective(db[i], r);
            };
            return(db2);
        }
    });
};
*/
