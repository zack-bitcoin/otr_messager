
-module(file_handler).

-export([init/2, init/3, handle/2, terminate/3]).
%example of talking to this handler:
%httpc:request(post, {"http://127.0.0.1:3011/", [], "application/octet-stream", "echo"}, [], []).
%curl -i -d '[-6,"test"]' http://localhost:3011
init(Req, Opts) ->
	handle(Req, Opts).
handle(Req, State) ->
    F0 = cowboy_req:path(Req),
    PrivDir0 = "../../../../js",
    PrivDir = list_to_binary(PrivDir0),
    F = case F0 of
	       <<"/main.html">> -> F0;
	       <<"/messaging.js">> -> F0;
	       <<"/codecBytes.js">> -> F0;
	       <<"/favicon.ico">> -> F0;
	       <<"/rpc.js">> -> F0;
	       <<"/format.js">> -> F0;
	       <<"/server.js">> -> F0;
	       <<"/sjcl.js">> -> F0;
	       <<"/elliptic.min.js">> -> F0;
	       <<"/files.js">> -> F0;
	       <<"/codecBytes.js">> -> F0;
	       <<"/crypto.js">> -> F0;
	       <<"/encryption_library.js">> -> F0;
	       <<"/encryption.js">> -> F0;
	       <<"/keys.js">> -> F0;
	       <<"/signing.js">> -> F0;
	       <<"/sha256.js">> -> F0;
               X -> 
                io:fwrite("ext file handler block access to: "),
                io:fwrite(X),
                io:fwrite("\n"),
                <<"/main.html">>
           end,
    %File = << PrivDir/binary, <<"/external_web">>/binary, F/binary>>,
    File = << PrivDir/binary, F/binary>>,
    {ok, _Data, _} = cowboy_req:read_body(Req),
    Headers = #{<<"content-type">> => <<"text/html">>,
    <<"Access-Control-Allow-Origin">> => <<"*">>},
    Text = read_file(File),
    Req2 = cowboy_req:reply(200, Headers, Text, Req),
    {ok, Req2, State}.
read_file(F) ->
    {ok, File } = file:open(F, [read, binary, raw]),
    {ok, O} =file:pread(File, 0, filelib:file_size(F)),
    file:close(File),
    O.
init(_Type, Req, _Opts) -> {ok, Req, []}.
terminate(_Reason, _Req, _State) -> ok.
