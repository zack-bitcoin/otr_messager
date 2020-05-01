-module(inbox).
-behaviour(gen_server).
-export([start_link/0,code_change/3,handle_call/3,handle_cast/2,handle_info/2,init/1,terminate/2,
        send/2, read/2, garbage/0, test/0]).

%TODO:
% garbage collection for expired messages or accounts.



-record(d, {accs = dict:new()}).
-record(acc, {pubkey, inbox = [], nonce = 1}).
-record(msg, {content, time, nonce}).
init(ok) -> {ok, #d{}}.
start_link() -> gen_server:start_link({local, ?MODULE}, ?MODULE, ok, []).
code_change(_OldVsn, State, _Extra) -> {ok, State}.
terminate(_, _) -> io:format("died!"), ok.
handle_info(_, X) -> {noreply, X}.
handle_cast({send, Msg, To}, X) -> 
    Accs = X#d.accs,
    A = case dict:find(To, Accs) of
            error -> #acc{pubkey = To};
            {ok, Acc} -> Acc
        end,
    Now = now2(),
    Nonce = A#acc.nonce,
    Msg2 = #msg{content = Msg, time = Now, nonce = Nonce},
    A2 = A#acc{inbox = [Msg2|A#acc.inbox], nonce = Nonce + 1},
    Accs2 = dict:store(To, A2, Accs),
    X2 = X#d{accs = Accs2},
    {noreply, X2};
handle_cast(garbage, X) -> 
    Accs = X#d.accs,
    Keys = dict:fetch_keys(Accs),
    Accs2 = garbage(Keys, Accs),
    X2 = X#d{accs = Accs2},
    {noreply, X2};
handle_cast(_, X) -> {noreply, X}.
handle_call({read, Who, Nonce}, _From, X) -> 
    Accs = X#d.accs,
    R = case dict:find(Who, Accs) of
            error -> [];
            {ok, Acc} -> 
                lists:filter(fun(M) ->
                                     M#msg.nonce > Nonce
                             end, Acc#acc.inbox)
        end,
    {reply, R, X};
handle_call(_, _From, X) -> {reply, X, X}.


read(Who, Nonce) ->
    %return an empty list if it is empty.
    gen_server:call(?MODULE, {read, Who, Nonce}).
send(Msg, To) ->
    gen_server:cast(?MODULE, {send, Msg, To}).

garbage() ->
    timer:sleep(30000),
    gen_server:cast(?MODULE, garbage),
    garbage().

    
now2() ->    
    erlang:timestamp().

garbage([], D) -> D;
garbage([H|T], D) -> 
    {ok, A} = dict:find(H, D),
    Msgs = A#acc.inbox,
    KeepDelay = 120,
    Msgs2 = keep(KeepDelay, Msgs),
    D2 = case Msgs2 of
             [] ->
                 dict:erase(H, D);
             _ ->
                 A2 = A#acc{inbox = Msgs2},
                 dict:store(H, A2, D)
         end,
    garbage(T, D2).
    
keep(_, []) -> [];
keep(Delay, [H|T]) -> 
    Time = H#msg.time,
    Age = timer:now_diff(now2(), Time),
    if
        Age > (Delay * 1000000) -> 
            keep(Delay, T);
        true -> [H|keep(Delay, T)]
    end.

    
                                       
    
test() ->
    %send read, garbage
    Msg = "hi",
    Who = "you",
    send(Msg, Who),
    [Msg2] = read(Who, 0),
    Msg = Msg2#msg.content,
    success.
    
    
