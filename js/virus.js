
var rounds_constant = 6000;
var infectious_constant = 1.4;
//var deadliness_constant = 1;
var deadliness_constant = 0.0005;
var recovery_constant = 0.020;
//var medical_max_constant = 1.01;
var critical_max_constant = 1.01;

var population = 1000000;
var medical_workers = 1000;
var critical_workers = 1000;
var everyone = population + medical_workers + critical_workers;

var quarantine_limit = 10000;

var initial_sick = 10;
var deliberate_c = 900;
var deliberate_m = 900;

/* ) Disease stages: dead; well: never sick, exposed, recovered; sick: infectious but asymptomatic, symptomatic, intensive care
2) Pools: general, quarantine, medical. Those sick:symptomatic or in quarantine are NOT at work. 
3) Worker types: general, critical, medical
4) Model counts over time of how many workers of what type, at what disease stage, in what pools. 
5) Chances of [uninfected -> infected] depend on % infectious in own pool, plus leakage: % of all infectious
6) Chances of [symptomatic -> intensive care -> dead, recovered] depends on ratio of sick to healthy medical workers
7) Chances of [well -> sick] depend on general level of the economy, which depends on % of critical workers at work.
8) Perhaps some chance of [recovered -> sick]
9) Quarantines vary by # people hold, and how long everyone stays in them, if all in are deliberately exposed 
Outcome measure: total dead over a simulation run
What to change: % different types of workers in quarantine at different times  
Are there simple cases of fewer total dead if take medical, critical workers and put early into deliberate exposed quarantines?
*/

//each worker has a job-type, a pool, and a disease stage. It is a 3D matrix.

function new_disease_obj(n, a){
    return {
        never_sick: n,
        exposed: 0,
        recovered: 0,

        asymptomatic: a,
        symptomatic: 0,
        intensive_care: 0
    };
};

function new_workers(g0, g1,//general workers, healthy and sick
                     c0, c1,//critical workers
                     m0, m1) { // medical workers
    var g = new_disease_obj(g1,g0);
    var c = new_disease_obj(c1,g0);
    var m = new_disease_obj(m1,m0);
    return({
        general: g,
        critical: c,
        medical: m
    });
};


function new_pools(unintentionally_sick, g,
                   deliberate_critical, c,
                   deliberate_medical, m) {
    //all unintentionally sick start in the general population, for simplicity.
    // all deliberate sick start in quarantine, because we know who was infected.
    var f = new_workers(unintentionally_sick,g,0,c,0,m);
    var q = new_workers(0,0,deliberate_critical,
                        0,deliberate_medical,0);
    return({
        free: f,
        quarantine: q,
        dead: 0
    });
};

function quarantine_rule(P){
    //example of how we could decide who to quarantine
    var v = ["general", "critical", "medical"];
    
    //quarantine everyone who is symptomatic.
    //maybe add a maximum size of people who fit in quarantine.
    var already_quarantined = 0;

    (["medical", "general", "critical"]).map(function(wt){
        (["never_sick", "exposed", "recovered", "asymptomatic", "symptomatic", "intensive_care"]).map(function(dt){
            already_quarantined += P.quarantine[wt][dt];
        });
    });

    
    v.map(function(t){
        if(already_quarantined < quarantine_limit){
            x = P.free[t].symptomatic;
            P.quarantine[t].symptomatic += x;
            already_quarantined += x;
            P.free[t].symptomatic -= x;
        };
    });

    //unquarantine everyone who is recovered
    v.map(function(t){
        x = P.quarantine[t].recovered;
        P.free[t].recovered += x;
        P.quarantine[t].recovered -= x;
    });

    return(P);
};

function infected_portion2(P, qt, types) {
    var total = 0;
    var sick = 0;
    (qt).map(function(q){
        (types).map(function(wt){
            (["asymptomatic", "symptomatic", "intensive_care"]).map(function(sick_type){
                sick += P[q][wt][sick_type];
                total += P[q][wt][sick_type];
            });
            (["never_sick", "exposed", "recovered"]).map(function(well_type){
                total += P[q][wt][well_type];
            });
        });
    });
    if(total == 0){
        return(0);
    };
    return(sick/total);
};
function working(P, type){
    var total = 0;
    var working = 0;
    (["never_sick", "exposed", "recovered", "asymptomatic"]).map(function(wt){
        working += P.free[type][wt];
        total += P.free[type][wt];
        total += P.quarantine[type][wt];
    });
    (["symptomatic", "intensive_care"]).map(function(wt){
        total += P.free[type][wt];
        total += P.quarantine[type][wt];
    });
    if(total == 0){
        return(1);
    }
    return(working/total);
};

function time_step(P){
    //fraction of total population that is infected
    var infected_portion =
        infected_portion2(
            P,
            ["free", "quarantine"],
            ["general","critical","medical"]);

    //fraction of the critical workers that are working
    var critical_working = working(P, "critical");

    //fraction of the medical workers that are working
    var medical_working = working(P, "medical");
    var medical_concentration = Math.log(medical_working * medical_workers) * 500 / (everyone * infected_portion);
    //console.log(JSON.stringify(medical_concentration));
    //console.log(JSON.stringify(medical_working));
    //console.log(JSON.stringify(medical_workers));
    
    //fraction of the medical workers that are sick
    var medical_infected =
        infected_portion2(
            P, ["free"], ["medical"]);

    //fraction of general workers that are sick.
    var general_infected =
        infected_portion2(
            P,
            ["free"],
            ["general", "critical"]);

    //fraction of quarantined population that is sick.
    var quarantine_infected =
        infected_portion2(
            P,
            ["quarantine"],
            ["general", "critical", "medical"]);

    //some medical personal become sick.
    (["free"]).map(function(q){
        (["medical"]).map(function(wt){
            (["never_sick", "exposed"]).map(function(type){
                var portion =
                    (infected_portion +
                     medical_infected) *
                    (critical_max_constant -
                     critical_working) *
                    infectious_constant;
                portion = Math.min(portion, 1);
                var x = P[q][wt][type] * portion;
                P[q][wt]["asymptomatic"] += x;
                P[q][wt][type] -= x;
            });
        });
        //some other workers become sick.
        (["general", "critical"]).map(function(wt){
            (["never_sick", "exposed"]).map(function(type){
                var portion =
                    (infected_portion +
                     general_infected) *
                    (critical_max_constant -
                     critical_working) *
                    infectious_constant;
                portion = Math.min(portion, 1);
                var x = P[q][wt][type] * portion;
                P[q][wt]["asymptomatic"] += x;
                P[q][wt][type] -= x;
            });
        });
    });
    //some people in quarantine become sick.
    (["quarantine"]).map(function(q){
        (["general", "critical", "medical"]).map(function(wt){
            (["never_sick", "exposed"]).map(function(type){
                var portion =
                    (infected_portion +
                     quarantine_infected) *
                    (critical_max_constant -
                     critical_working) *
                    infectious_constant;
                portion = Math.min(portion, 1);
                var x = P[q][wt][type] * portion;
                P[q][wt]["asymptomatic"] += x;
                P[q][wt][type] -= x;
            });
        });
    });
    //some people who are sick become more sick.
    (["free", "quarantine"]).map(function(q){
        (["medical", "general", "critical"]).map(function(wt){
            var portion =
                deadliness_constant /
                medical_concentration;
            portion = Math.min(portion, 1);
            var a = P[q][wt]["asymptomatic"];
            var s = P[q][wt]["symptomatic"];
            var i = P[q][wt]["intensive_care"];
            P[q][wt]["asymptomatic"] -= portion*a;
            P[q][wt]["symptomatic"] += portion*(a-s);
            P[q][wt]["intensive_care"] += portion*(s-i);
            P.dead += portion*i;
        });
    });
    //some sick people recover from their illness.
    (["free", "quarantine"]).map(function(q){
        (["medical", "general", "critical"]).map(function(wt){
            (["asymptomatic", "symptomatic", "intensive_care"]).map(function(dt){
                var portion = recovery_constant;
                if(portion > 1) {
                    console.log("error portion too big");
                    return(0);
                };
                var x = P[q][wt][dt];
                P[q][wt][dt] -= (x*portion);
                P[q][wt]["recovered"] += (x*portion);
            });
        });
    });
//8) Perhaps some chance of [recovered -> sick]
    P = quarantine_rule(P);
    return(P);
};


function doit(P){
    for(var i = 0; i < rounds_constant; i ++){
        P = time_step(P);
    };
    var total = sum_all(P);
    return((total - P.dead)/total);
    //return P;
};
function sum_all(P){
    var total = 0;
    (["free", "quarantine"]).map(function(q){
        (["medical", "general", "critical"]).map(function(wt){
            (["never_sick", "exposed", "recovered", "asymptomatic", "symptomatic", "intensive_care"]).map(function(dt){
                total += P[q][wt][dt];
            });
        });
    });
    console.log(JSON.stringify(P.free.general.recovered));
    console.log(JSON.stringify(P.free.general.never_sick));
    total += P.dead;
    return(total);
};


function test_infect() {
    var P = new_pools(initial_sick, population,
                      deliberate_c, critical_workers,
                      deliberate_m, medical_workers);
    return(doit(P));
};

function test_no_infect() {
    var P = new_pools(initial_sick, population,
                      0, critical_workers,
                      0, medical_workers);
    return(doit(P));
};


function test(){
    var I = test_infect();
    var N = test_no_infect();

    console.log("survivors if we deliberately infect: ");
    console.log(I);
    console.log("survivors if we do not infect on purpose: ");
    console.log(N);
    return(0);
};
