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
//Sender makes 2 ephemeral key pairs: [{Epub1, Epriv1}, {Epub2, Epriv2}]
    var keys1 = keys_function1(false);
    var keys2 = keys_function1(false);
    //var keys1 = keys.make();
    //var keys2 = keys.make();
    //keys.getPrivate("hex");
    //sender uses Epriv1 to sign the message we are sending.
    var SigInner = keys1.raw_sign(serialize(msg));
    //var SigInner = btoa(array_to_string(sign(msg, keys1)));
    console.log(SigInner);
//Sender deletes Epriv1.
    //Sender combines Epriv2 and Rpub to produce a shared secret SSER.
//Sender uses Spriv to sign over (Epub1 + timestamp) and make SigET.
    var D = new Date();
    //var Pub1 = btoa(fromHex(keys1.getPublic("hex")));
    var Pub1 = keys1.pub();
    var Message1 = Pub1.concat(D.getTime());
    console.log(JSON.stringify(Message1));
    console.log(Message1);
    var SigET = keys.raw_sign(serialize(btoa(Message1)));
    console.log(Message1);
    //var SigET = btoa(array_to_string(sign(Message1, keys2)));
    //Message2 = (message to encrypt) + Epub1 + timestamp + SigET.
    var Message2 = keys.pub().concat(Message1).concat(SigET).concat(SigInner).concat(msg);
    //encrypt message2
    var Emsg = keys2.encrypt(Message2, to);
    //var msg = (keys2.pub()).concat(Emsg);
    //send encrypted message
    //TODO publish Epriv1 somewhere public
    //console.log(JSON.stringify(keys2.pub()));
    //console.log(JSON.stringify(Emsg));
    variable_public_get(["send", btoa(JSON.stringify(Emsg)), to], function(x){});
    Display.innerHTML += "<br />";
    Display.innerHTML += "<p style='color:blue;display:inline'>".concat(Edit.value).concat("</p>");
};

function send(){
    var msg = btoa(Edit.value);
    var to = To.value;
    variable_public_get(["send", msg, to], function(x){});
    Display.innerHTML += "<br />";
    Display.innerHTML += "U <p style='color:green;display:inline'>".concat(Edit.value).concat("</p>");
};

var w = window.innerWidth;
var h = window.innerHeight;

Display.style.width = w - 20;
Display.style.height = h / 2;
Edit.style.width = w - 20;
Edit.style.height = (h / 2) - 200;
To.style.width = w - 70;


listener_thread();
function listener_thread() {
    console.log("listener thread");
    variable_public_get(["read", nonce, keys.pub(), 20], display_response);
};
function display_response(X) {
    X = X.slice(1);
    display_messages(X);
    listener_thread();
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
            if(verify(btoa(msg), inner_sig, key1)){
                //verify that from signed message1 to make main_sig.
                var Message1 = pub.concat(time);
                var key2 = from_pub(from);
                if(verify(btoa(Message1), main_sig, key2)){
                    Display.innerHTML += "<br />";
                    Display.innerHTML += msg;
                }else{
                    return(0);
                }
            }else{
                return(0);
            }
        } else {
            Display.innerHTML += "<br />";
            Display.innerHTML += msg;
        };
        //console.log(atob(msg));
        X = X.slice(1);
        return(display_messages(X));
    };
};
