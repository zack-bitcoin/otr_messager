
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var r = identity();
r = mul_m_m(r, rotate_matrix_3(100,0,0));

//console.log(JSON.stringify(r));
var dr = [0,0,0];
var W = c.width;
var Z = W;
var size = 200;
var corners = [
    make_3_point(size, size, Z+size),
    make_3_point(size, size, Z-size),
    make_3_point(size, -size, Z+size),
    make_3_point(size, -size, Z-size),
    make_3_point(-size, size, Z+size),
    make_3_point(-size, size, Z-size),
    make_3_point(-size, -size, Z+size),
    make_3_point(-size, -size, Z-size),
    make_3_point(size+5, 20, Z),//8
    make_3_point(size+5, 0, Z + 20),
    make_3_point(size+5, -20, Z),
    make_3_point(size+5, 0, Z - 20),
    make_3_point(size+5, 35, Z),
    make_3_point(size+5, 0, Z + 35),
    make_3_point(size+5, -35, Z),
    make_3_point(size+5, 0, Z - 35),//15
    //make_3_point(0,0,Z+size),
    make_3_point(0,0,Z),
    make_3_point(0,0,Z+size+size),//17
];
var colors = [
    "#880000",
    "#888800",
    "#008800",
    "#008888",
    "#880088",
    "#000088"
];
var green = "#880088";
var blue = "#000088";
var black = "#000000";
var faces = [[3,2,0,1],[4,6,7,5],[0,4,5,1],[2,3,7,6]];//,[4,0,2,6]];//,[3,1,5,7]];
var triangles =
    ([[3,1,16,blue],[1,5,16,black],[5,7,16,blue],[7,3,16,black]]).concat(
        [[4,0,17,green],[0,2,17,black],[2,6,17,green],[6,4,17,black]]).concat(
        faces_to_triangles(faces,colors)).concat(
            [[13,12,14,"#FFFFFF"],[12,15,14,"#FFFFFF"]]).concat(
                [[9,8,10,"#000000"],[8,11,10,"#000000"]]);
draw_helper();
function faces_to_triangles(L,C) {
    if (L.length == 0) {
        return([]);
    }
    var h = L[0];
    return [[h[0],h[1],h[2],C[0]],
            [h[0],h[2],h[3],C[0]],
            [h[0],h[1],h[3],C[0]],
            [h[1],h[2],h[3],C[0]]
           ].concat(
        faces_to_triangles(L.slice(1),
                           C.slice(1)));
};
function make_3_point(a, b, c) {
    return {x: a, y: b, z: c};
}
function rotate3(point, rotation) {
    var W = c.width;
    var x = point.x;
    var y = point.y;
    var z = point.z - W;
    var V = mul_v_m([x, y, z],rotation);
    var X = V[0];
    var Y = V[1];
    var Z = V[2];
    return make_3_point(X, Y, Z+W);
};
function draw_helper() {
    var corners2 = corners.map(function(x) {return(rotate3(x, r))});
    ctx.clearRect(0, 0, c.width, c.height);
    draw_triangles(corners2, triangles);
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
function three_to_two(a) {
    var W = c.width;
    var Z = W;
    var H = c.height;
    var f = a.z / Z;//default distance is 100 units in front of you.
    var X = (W/2) + (a.x / f);
    var Y = (H/2) + (a.y / f);
    return {x: X, y: Y};
}
function draw_triangles(corners, triangles) {
    if (triangles.length == 0) {
        return(0);
    }
    var tri = triangles[0];
    var p1 = three_to_two(corners[tri[0]]);
    var p2 = three_to_two(corners[tri[1]]);
    var p3 = three_to_two(corners[tri[2]]);
    draw_triangle(p1, p2, p3, tri[3]);
    return draw_triangles(corners, triangles.slice(1));
};
function identity() {
    return([[1,0,0],
            [0,1,0],
            [0,0,1]]);
};
function rotate_matrix_3(a1,a2,a3) {
    var m1 = rotation_matrix_x(a1);
    var m2 = rotation_matrix_y(a2);
    var m3 = rotation_matrix_z(a3);
    var m4 = mul_m_m(m1, m2);
    return(mul_m_m(m4, m3));
};
function rotation_matrix_x(angle) {
    return([[1,0,0],
            [0,Math.cos(angle),-Math.sin(angle)],
            [0,Math.sin(angle),Math.cos(angle)]]);
};
function rotation_matrix_y(angle) {
    return([
        [Math.cos(angle),0,Math.sin(angle)],
        [0,1,0],
        [-Math.sin(angle),0,Math.cos(angle)]]);
};
function rotation_matrix_z(angle) {
    return([
        [Math.cos(angle),-Math.sin(angle),0],
        [Math.sin(angle),Math.cos(angle),0],
        [0,0,1]]);
};
function mul_v_v(v1, v2) {
    if (JSON.stringify(v1) == JSON.stringify([])) {
        return(0);
    };
    return (v1[0]*v2[0]) + mul_v_v(v1.slice(1),v2.slice(1));
};
function mul_v_m(v, m){
    return([mul_v_v(v, m[0]),
            mul_v_v(v, m[1]),
            mul_v_v(v, m[2])])
};
function column(m, n) {
    if (n < 0) { return(0); }
    if (n == 0) { return(m.map(function(x){return(x[0]);}))}
    return column(m.map(function(x){return(x.slice(1))}),
                  n-1);
};
function mul_m_m(m1, m2) {
    var cs = [0,1,2].map(function(x){return(column(m2, x))});
    return([0,1,2].map(function(n){return(
        cs.map(function(x){return(
            mul_v_v(m1[n], x))}))}));
};
function v_sum(a, b) {
    if(a.length == 0) {
        return([]);
    };
    return [a[0]+b[0]].concat(v_sum(a.slice(1),b.slice(1)));
};
function mul_v_s(V, S) {
    if(V.length == 0) {
        return([]);
    };
    return [V[0]*S].concat(mul_v_s(V.slice(1), S));
};
document.addEventListener('click', function(e){
    //give the cube a little kick depending on which part we click on.
    var L = c.offsetLeft;
    var T = c.offsetTop;
    var W = c.width;
    var H = c.height;
    var mouseX = e.pageX;
    var mouseY = e.pageY;
    var Y = mouseX - L - (W/2);
    var X = mouseY - T - (H/2);
    var kick = [X, Y, 0];
    kick = mul_v_s(kick, 1/W/10);
    dr = v_sum(dr, kick);
})

cron();
function cron() {
    setTimeout(function(){
        dr = [dr[0] * 0.99, dr[1] * 0.99, dr[2] * 0.99];//reduce spinning with friction.
        var r2 = rotate_matrix_3(dr[0], dr[1], dr[2]);//a rotation matrix based on how fast we are spinning
        r = mul_m_m(r, r2);//use the rotation matrix to calculate our new position
        draw_helper();//draw the cube in it's current position
        return cron();
    }, 20);//attempting 50 frames per second.
};

