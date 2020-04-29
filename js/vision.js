var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var fps = 30;
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
var pdb = pdb_maker();
function minus_3(a, b) {
    return({x: a.x - b.x,
            y: a.y - b.y,
            z: a.z - b.z});
};
function normalize(v) {
    var d = distance_to(v);
    return({x: v.x / d, y: v.y / d, z: v.z / d});
};
function vector_maker(location, direction) {
    var d2 = minus_3(direction, location);
    return(normalize(d2));
};
function cube(sidelength, corner) {
    var W = c.width;
    var corner2 = corner;
    return(function(vector, db){
        var corner = db[corner2];
        var d = three_to_two(vector);
        var c2 = three_to_two(corner);
        var sidelength2 = sidelength * W / corner.z;
        return((d.x < c2.x+sidelength2) &&
               (d.x > c2.x) &&
               (d.y < c2.y + sidelength2) &&
                (d.y > c2.y));
    });
};
function sphere(radius, center) {
    var W = c.width;
    var center2 = center;
    var pixel_width = 10;
    var wide = c.width / pixel_width;
    var tall = c.height / pixel_width;
    return(function(vector, db) {
        var center = db[center2];
        var d = three_to_two2(vector);
        var c2 = three_to_two(center);
        var r2 = radius * W / (distance_to(center));
        var X = d.x - c2.x;
        var Y = d.y - c2.y;
        var D = (X**2) + (Y**2);
        //var r2 = r2 * (1 + ((Math.min(0, Math.sqrt(D)-r2))/1000));
        //console.log(Math.sin(Math.sqrt(D)/W));
        //var r2 = r2 / Math.cos(Math.sqrt(D)/W);
        //var r2 = radius * W / center.z;
        return((r2**2) > D);
    });
};

function make_3_point(a, b, c) {
    return {x: a, y: b, z: c};
}
function make_2_point(a, b) {
    return {x: a, y: b};
}
function three_to_two2(a) {
    var W = c.width;
    var Z = W;
    var H = c.height;
    //var f = a.z / Z;
    var f = distance_to(a) / W;
    var X = (W/2) + (a.x / f);
    var Y = (H/2) + (a.y / f);
    return {x: X, y: Y};
}
function three_to_two(a) {
    var W = c.width;
    var Z = W;
    var H = c.height;
    var f = a.z / Z;
    //var f = distance_to(a) / W;
    var X = (W/2) + (a.x / f);
    var Y = (H/2) + (a.y / f);
    return {x: X, y: Y};
}
var v1 = pdb.add(0,0,500);
var v2 = pdb.add(100,0,400);
var v3 = pdb.add(0,0,700);
var v4 = pdb.add(0,-200,500);
var v5 = pdb.add(0,0,300);
var v6 = pdb.add(-200,10,500);
var v7 = pdb.add(12000,0,500);
var v8 = pdb.add(0,0,9000);
var v9 = pdb.add(0,500,500);
var things = [
    sphere_thing(v1, 80, colors[0]),
    sphere_thing(v2, 60, colors[2]),
    sphere_thing(v3, 100, colors[4]),
    sphere_thing(v4, 100, colors[3]),
    //{where: cube(100, v5),
    // point: v5,
    // color: colors[1]},
    sphere_thing(v6, 20, colors[5]),
    sphere_thing(v7,10000, colors[6]),
    sphere_thing(v8, 5000, colors[1]),
    sphere_thing(v9, 450, colors[8]),
];
function sphere_thing(point, radius, color){
    return({where: sphere(radius, point),
            point: point,
            color: color});
};

function cron(){
    //time_step_page();
    movement([37,38,39,40,65,83]);
    draw_helper();
    setTimeout(cron, 1000/fps);
};
setTimeout(function(){
    return(cron());
}, 100);
//draw_helper();
function distance_to(v) {
    return(Math.sqrt((v.x**2) + (v.y**2) + (v.z**2)));
};
function draw_helper() {
    var p = make_3_point(0,0,0);
    var pixel_width = 10;
    var db = pdb.perspective();
    things = things.sort(function(a,b){return(distance_to(db[a.point]) - distance_to(db[b.point]));});
    var wide = c.width / pixel_width;
    var tall = c.height / pixel_width;
    for(var x = 0; x<wide; x++) {
        for(var y = 0; y<tall; y++){
            var color = "#FFFFFF";//default pixel color is white.
            //var fun = function(x, w) {
            //    return(w * Math.sin(((x/w) - 0.5)*Math.PI) / Math.PI);
            //}
            //console.log(x-(wide/2));
            //console.log(fun(x, wide));
            //console.log(y-(tall/2));
            //console.log(fun(y, tall));
            //var d = make_3_point(fun((x/wide)-(1/2)),y-(tall/2),wide);
            //var d = make_3_point(fun(x, wide), fun(y, tall), wide);
            var X1 = (x-(wide/2));
            var Y1 = (y-(tall/2));
            var Z = Math.sqrt(wide**2 - X1**2 - Y1**2);

            X = X1*Math.PI/wide/2;
            Y = Y1*Math.PI/tall/4;
            //Y2 = (y + (tall/4))*Math.PI/tall;
            var d = make_3_point(Math.sin(X)*Math.cos(Y), Math.sin(Y), Math.cos(X)*Math.cos(Y));

            //X = wide * Math.sin(X);
            //Y = tall * Math.sin(Y);
            //screen is measuring pi/36 staradians.

            //var zed = Math.sqrt((wide*2)**2 - X**2 - Y**2);
            //var d = make_3_point(X, Y, zed);

            var d2 = make_3_point(X1,Y1,Z);
            //var d2 = make_3_point(X, Y ,Z);
            var V = vector_maker(p, d);
            for(var i=0; i<things.length; i++){
                var T = things[i];
                if(visible(db[T.point])) {
                    if(T.where(V, db)){
                        color = T.color;
                        i=things.length;
                    };
                };
            };
            var p1 = three_to_two2(d2);
            //var p1 = three_to_two(d2);
            //console.log(JSON.stringify([p1, p10]));
            var size = pixel_width;
            var p2 = {y: p1.y, x: p1.x + size};
            var p3 = {y: p1.y + size, x: p1.x};
            var p4 = {y: p1.y + size, x: p1.x + size};
            draw_square(p1, p2, p4, p3, color);
        };
    };
};
function draw_square(p1, p2, p3, p4, color) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.fillStyle = color;
    ctx.fill();
}
function visible(Z) {
    var vision = 100000;
    return ((Z.z > 0) && (Z.z < vision) && (Z.x > -(vision/2)) && (Z.x < (vision/2)));
};
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
        update: function(n,x,y,z) {
            db[n] = make_3_point(x, y, z);
        },
        adjust: function(n,x,y,z) {
            var old = db[n];
            db[n] = make_3_point(old.x + x, old.y + y, old.z + z);
        },
        perspective: function(){
            //rotates and shifts each point over based on your current location and the direction you are facing. Points are still specified in 3d.
            var r = rotation_matrix_y(perspective.theta);
            var db2 = {};
            for(i=0;i<top;i++) {
                db2[i] = in_perspective(db[i], r);
            };
            return(db2);
        }
    });
};



//Controller

var controls = {37:false, 38:false, 39:false, 40:false, 65:false, 83:false};
var perspective = {x:0,z:0,theta:0};
var step_size = 20;
var turn_speed = 0.03;
function left() {
    perspective.theta += turn_speed;
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
    perspective.theta -= turn_speed;
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
    var k = event.keyCode;
    var cv = controls[k];
    if(cv == false) {
        controls[k] = true;
    };

    //var f = keys[event.keyCode];
    //if(!(f == undefined)){ f(); };
//    console.log(event.keyCode);
});
document.addEventListener('keyup', function(event) {
    var k = event.keyCode;
    var cv = controls[k];
    if(cv == true) {
        controls[k] = false;
    };
});
 
function movement(L){
    if(L.length == 0){return(0);};
    var H = L[0];
    //console.log(JSON.stringify(controls));
    if(controls[H]){
        keys[H]();
    };
    return(movement(L.slice(1)));
};


// physics

function rotation_matrix_y(angle) {
    return([
        [Math.cos(angle),0,Math.sin(angle)],
        [0,1,0],
        [-Math.sin(angle),0,Math.cos(angle)]]);
};
function in_perspective(point, rotation) {
    var X = point.x - perspective.x;
    var Y = point.y;
    var Z = point.z - perspective.z;
    var point2 = make_3_point(X, Y, Z);
    var point3 = mul_v_m(point2, rotation);
    return(point3);
};
function pos_mod(A, B) {
    return(((A % B) + B) % B);
}
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
