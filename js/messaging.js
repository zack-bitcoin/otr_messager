var To = document.getElementById("to");
var Display = document.getElementById("display");
var Edit = document.getElementById("edit");
var SendButton = document.getElementById("send_button");

var w = window.innerWidth;
var h = window.innerHeight;

Display.style.width = w - 20;
Display.style.height = h / 2;
Edit.style.width = w - 20;
Edit.style.height = (h / 2) - 200;

var msg = btoa("hello");
var to = "BIVZhs16gtoQ/uUMujl5aSutpImC4va8MewgCveh6MEuDjoDvtQqYZ5FeYcUhY/QLjpCBrXjqvTtFiN4li0Nhjo=";
console.log("to send");
variable_public_get(["send", msg, to], spend_response);

function spend_response(X) {
};

console.log("to read");
variable_public_get(["read", 0, to, 100], read_response);

function read_response(X) {
    X = X.slice(1);
    return response2(X);
};
function response2(X) {
    if(X.length == 0) {
        console.log("done");
        return(0);
    } else {
        var msg = X[0][1];
        Display.innerHTML += "<br />";
        Display.innerHTML += atob(msg);
        console.log(atob(msg));
        X = X.slice(1);
        return(response2(X));
    };
};
