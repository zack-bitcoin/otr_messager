-module(keys).
-behaviour(gen_server).
-export([start_link/0,code_change/3,handle_call/3,handle_cast/2,handle_info/2,init/1,terminate/2]).
-export([store/2, read/1, garage/1]).

-record(x, {pub, priv, time}).

init(ok) -> {ok, dict:new()}.
start_link() -> gen_server:start_link({local, ?MODULE}, ?MODULE, ok, []).
code_change(_OldVsn, State, _Extra) -> {ok, State}.
terminate(_, _) -> io:format("died!"), ok.
handle_info(_, X) -> {noreply, X}.
handle_cast({store, Pub, Priv}, X) -> 
    K = #x{pub = Pub, priv = Priv, time = now2()},
    X2 = dict:store(Pub, K, X),
    {noreply, X2};
handle_cast(garbage, X) -> 
    X2 = garbage_internal(X),
    {noreply, X2};
handle_cast(_, X) -> {noreply, X}.
handle_call({read, Pub}, _From, X) -> 
    A = case dict:find(X) of
            error -> empty;
            {ok, Z} -> Z
        end,
    {reply, A, X};
handle_call(_, _From, X) -> {reply, X, X}.
now2() ->    
    erlang:timestamp().
read(Pub) ->
    gen_server:call(?MODULE, {read, Pub}).
store(Pub, Priv) ->
    65 = size(Pub),
    64 = size(Priv),
    gen_server:cast(?MODULE, {store, Pub, Priv}).
garbage() ->
    timer:sleep(30000),
    gen_server:cast(?MODULE, garbage),
    garbage().

garbage_internal(D) ->
    K = dict:fetch_keys(D),
    garbage_internal2(K, D).
garbage_internal2([], D) -> D;
garbage_internal2([H|T], D) -> 
    {ok, K} = dict:find(H, D),
    Age = timer:now_diff(now2(), K#x.time),
    D2 = if
             Age > (600 * 1000000) ->
                 dict:erase(H, D);
             true -> D
         end,
    garbage_internal2(T, D2).
    
