-module(api_handler).
-export([init/3, handle/2, terminate/3, doit/1,
         init/2,
         test/0]).

init(A, B) ->
    handle(A, B).
handle(Req, State) ->
    {ok, Data, Req2} = cowboy_req:read_body(Req),
    %{IP, _} = cowboy_req:peer(Req2),
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
    65 = size(To),
    true = is_binary(To),
    true = is_binary(Msg),
    true = size(Msg) < 5000,
    inbox:send(Msg, To),
    ok;
doit({read, Nonce, To, Delay0}) ->
%. gets all the messages for a particular user with a nonce higher than Nonce. Delay is how long to maintain this http request relationship, so if a message appears during this time period it can get immediately sent.
    true = is_integer(Nonce),
    true = is_integer(Delay0),
    true = Delay0 > -1,
    65 = size(To),
    true = is_binary(To),
    Delay1 = max(Delay0, 2),
    Delay = min(Delay1, 60),%maximum of a 1 minute relationship.
    Return = read_thread(Nonce, To, Delay, now2()),
    {ok, Return};
doit({private, Pub, Priv}) ->
    keys:store(Pub, Priv),
    ok;
doit({read_private, Pub}) ->
    {ok, keys:read(Pub)};
doit(X) ->
    io:fwrite("I can't handle this \n"),
    io:fwrite(X), %unlock2
    io:fwrite(packer:pack(X)), %unlock2
    {error}.

now2() ->
    erlang:timestamp().
read_thread(Nonce, To, Delay, Then) ->
    Diff = timer:now_diff(now2(), Then),
    R = inbox:read(To, Nonce),
    L = length(R),
    if
        (L > 0) -> R;
        (Diff > (Delay * 1000000)) -> [];
        true ->
            timer:sleep(100),
            read_thread(Nonce, To, Delay, Then)
    end.
            
params() -> crypto:ec_curve(secp256k1).
generate_keys() -> 
    crypto:generate_key(ecdh, params()).

test() ->
    {To, _} = generate_keys(),
    
    spawn(fun() ->
                  timer:sleep(500),
                  doit({send, <<"hi">>, To})
          end),
    doit({read, 0, To, 6}).
