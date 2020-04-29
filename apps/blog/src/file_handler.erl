
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
	       <<"/virus.js">> -> F0;
	       <<"/virus.html">> -> F0;
	       <<"/codecBytes.js">> -> F0;
	       <<"/puzzle_league.js">> -> F0;
	       <<"/puzzle_league/puzzle_league2.js">> -> F0;
	       <<"/puzzle_league/instructions.html">> -> F0;
	       <<"/puzzle_league/main.html">> -> F0;

	       <<"/puzzle_league/black.png">> -> F0;
	       <<"/puzzle_league/blue.png">> -> F0;
	       <<"/puzzle_league/cursor.png">> -> F0;
	       <<"/puzzle_league/green.png">> -> F0;
	       <<"/puzzle_league/yellow.png">> -> F0;
	       <<"/puzzle_league/red.png">> -> F0;

	       <<"/crypto.js">> -> F0;
	       <<"/cube.html">> -> F0;
	       <<"/cube.js">> -> F0;
	       <<"/room.html">> -> F0;
	       <<"/room.js">> -> F0;
	       <<"/plant.html">> -> F0;
	       <<"/plant.js">> -> F0;
	       <<"/chordal.html">> -> F0;
	       <<"/chordal.js">> -> F0;
	       <<"/orbits.html">> -> F0;
	       <<"/orbits.js">> -> F0;
	       <<"/vision.html">> -> F0;
	       <<"/vision.js">> -> F0;
	       <<"/pendulum.html">> -> F0;
	       <<"/pendulum.js">> -> F0;
	       <<"/spider.png">> -> F0;
	       <<"/format.js">> -> F0;
	       <<"/main.html">> -> F0;
	       <<"/password.html">> -> F0;
	       <<"/pw_generator.js">> -> F0;
	       <<"/favicon.ico">> -> F0;
	       <<"/sjcl.js">> -> F0;
	       <<"/spiral.html">> -> F0;
	       <<"/spiral.js">> -> F0;
	       <<"/signing.js">> -> F0;
	       <<"/spots3.png">> -> F0;
	       <<"/spots2.png">> -> F0;
	       <<"/spots.png">> -> F0;
	       <<"/spots.png">> -> F0;
	       <<"/board.html">> -> F0;
	       <<"/board.js">> -> F0;
	       <<"/black_go.png">> -> F0;
	       <<"/white_go.png">> -> F0;
	       <<"/star_go.png">> -> F0;
	       <<"/empty_go.png">> -> F0;
	       <<"/mark_go.png">> -> F0;
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
