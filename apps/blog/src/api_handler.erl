-module(api_handler).
-export([init/3, handle/2, terminate/3, doit/1,
         init/2]).

init(A, B) ->
    handle(A, B).
handle(Req, State) ->
    {ok, Data, Req2} = cowboy_req:read_body(Req),
    {IP, _} = cowboy_req:peer(Req2),
    true = is_binary(Data),
    A = packer:unpack(Data),
    B = doit(A),
    C = packer:pack(B),
    Headers = #{ <<"content-type">> => <<"application/octet-stream">>,
	       <<"Access-Control-Allow-Origin">> => <<"*">>},
    Req4 = cowboy_req:reply(200, Headers, C, Req2),
    {ok, Req4, State}.
init(_Type, Req, _Opts) -> {ok, Req, no_state}.
terminate(_Reason, _Req, _State) -> ok.
doit({test}) ->    
    {ok, 22};
doit({send, Msg, To}) ->
    inbox:send(Msg, To);
doit({read, Nonce, To, Delay}) ->
%. gets all the messages for a particular user with a nonce higher than Nonce. Delay is how long to maintain this http request relationship, so if a message appears during this time period it can get immediately sent.
    Delay = min(Delay, 60),%maximum of a 1 minute relationship.
    Return = read_thread(Nonce, To, Delay, now2()),
    {ok, Return};


doit(X) ->
    io:fwrite("I can't handle this \n"),
    io:fwrite(packer:pack(X)), %unlock2
    {error}.

now2() ->
    erlang:timestamp().
read_thread(Nonce, To, Delay, Then) ->
    Diff = timer:now_diff(Then, now2()),
    R = inbox:read(To, Nonce),
    L = length(R),
    if
        (L > 0) -> R;
        (Diff > (Delay * 1000000)) -> [];
        true ->
            timer:sleep(100),
            read_thread(Nonce, To, Delay, Then)
    end.
            
