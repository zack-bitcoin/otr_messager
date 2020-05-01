%%%-------------------------------------------------------------------
%% @doc blog public API
%% @end
%%%-------------------------------------------------------------------

-module(blog_app).

-behaviour(application).

-export([start/2, stop/1]).

start(_StartType, _StartArgs) ->
    inets:start(),
    start_http(),
    spawn(fun() ->
                  inbox:garbage()
          end),
    spawn(fun() ->
                  keys:garbage()
          end),
    blog_sup:start_link().

stop(_State) ->
    ok.

%% internal functions
start_http() ->
    Dispatch =
        cowboy_router:compile(
          [{'_', [
		  %{"/:file", file_handler, []}%,
		  {"/", api_handler, []},
		  {"/[...]", file_handler, []}
		 ]}]),
    %{ok, Port} = application:get_env(amoveo_mining_pool, port),
    {ok, _} = cowboy:start_clear(http,
				 [{ip, {0,0,0,0}}, {port, 8010}],
				 #{env => #{dispatch => Dispatch}}),
    ok.
    
