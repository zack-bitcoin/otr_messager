var my_address = "BIVZhs16gtoQ/uUMujl5aSutpImC4va8MewgCveh6MEuDjoDvtQqYZ5FeYcUhY/QLjpCBrXjqvTtFiN4li0Nhjo=";
var nonce = 0;

var To = document.getElementById("to");
To.value = keys.pub();
var Display = document.getElementById("display");
var Edit = document.getElementById("edit");
Edit.value = "Hello. Consider Amoveo blockchain";
var SendButton = document.getElementById("send_button");
SendButton.onclick = send_encrypted;
var ESendButton = document.getElementById("encrypted_send_button");
SendButton.onclick = send;
ESendButton.onclick = send_encrypted;

function send_encrypted(){
    var msg = btoa(Edit.value);
    var to = To.value;
    //ephemeral keys
    var keys1 = keys_function1(false);
    var keys2 = keys_function1(false);
    var SigInner = keys1.raw_sign(serialize(msg));
    var D = new Date();
    var Pub1 = keys1.pub();
    var Message1 = Pub1.concat(D.getTime());
    var SigET = keys.raw_sign(serialize(btoa(Message1)));
    var Message2 = keys.pub().concat(Message1).concat(SigET).concat(SigInner).concat(msg);
    var Emsg = keys2.encrypt(Message2, to);
    variable_public_get(["send", btoa(JSON.stringify(Emsg)), to], function(x){});
    display_more("<p style='color:blue;display:inline'>".concat(Edit.value).concat("</p>"));
    setTimeout(function(){
        console.log("publishing priv");
        variable_public_get(["private", keys1.keys_internal().getPrivate("hex")], function(x){});
    }, 120000);
};
function display_more(S){
    var S1 = Display.innerHTML;
    Display.innerHTML = (S.concat("<br />").concat(S1));
//    Display.innerHTML += "<br />";
 //   Display.innerHTML += S;
};
function send(){
    var msg = btoa(Edit.value);
    var to = To.value;
    variable_public_get(["send", msg, to], function(x){});
    display_more("U <p style='color:green;display:inline'>".concat(Edit.value).concat("</p>"));
};

var w = window.innerWidth;
var h = window.innerHeight;

Display.style.width = w - 20;
Display.style.height = h / 2;
Edit.style.width = w - 20;
Edit.style.height = (h / 2) - 200;
To.style.width = w - 70;


listener_thread(keys.pub());
function listener_thread(Pub) {
    PubNow = keys.pub();
    if(Pub == PubNow) {
        console.log("listener thread");
        variable_public_get(["read", nonce, keys.pub(), 20], function(X) { return(display_response(X, Pub)); } );
    };
};
function display_response(X, Pub) {
    X = X.slice(1);
    display_messages(X);
    listener_thread(Pub);
};
function display_messages(X) {
    if(X.length == 0) {
        return(0);
    } else {
        var msg = X[0][1];
        var nonce2 = X[0][3];
        console.log([nonce, nonce2]);
        nonce = Math.max(nonce, nonce2);
        msg = atob(msg);
        console.log(msg.slice(0, 8));
        if(msg.slice(0, 8) == "[\"emsg\",") {
            msg = JSON.parse(msg);
            msg = keys.decrypt(msg);
            //pub ++ time ++ sig ++ msg
            var from = msg.slice(0, 88);
            msg = msg.slice(88);
            var pub = msg.slice(0, 88);
            msg = msg.slice(88);
            var time = msg.slice(0, 13);
            msg = msg.slice(13);
            var main_sig = msg.slice(0, 96);
            msg = msg.slice(96);
            var inner_sig = msg.slice(0, 96);
            msg = msg.slice(96);
            msg = atob(msg);
            console.log(atob(inner_sig));
            console.log(inner_sig);
            console.log([from, pub, time, main_sig, inner_sig, msg]);
            var key1 = from_pub(pub);
            //verify that pub1 signed msg to make inner_sig.
            console.log([inner_sig, msg]);
            var D = new Date();
            var timeNow = D.getTime();
            if((timeNow - parseInt(time)) > (1000 * 20)) {
                return(0);//expired message. possibly a fake.
            } else {
                if(verify(btoa(msg), inner_sig, key1)){
                //verify that from signed message1 to make main_sig.
                    var Message1 = pub.concat(time);
                    var key2 = from_pub(from);
                    if(verify(btoa(Message1), main_sig, key2)){
                        display_more(msg.concat("  :  ").concat(from));
                    }else{
                        return(0);
                    }
                }else{
                    return(0);
                }
            }
        } else {
            display_more(msg);
        };
        //console.log(atob(msg));
        X = X.slice(1);
        return(display_messages(X));
    };
};
