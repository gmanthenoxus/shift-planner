// TEMPORARY. jsdom tests for 2.0 build steps 1 to 5. Run: node docs/process/v2-tests.js
// Requires: npm i jsdom. Delete once the Breaker has passed 2.0.
const fs=require("fs");
let JSDOM;try{({JSDOM}=require("jsdom"));}catch(e){console.error("npm i jsdom");process.exit(2);}
const html=fs.readFileSync("/sessions/beautiful-loving-wozniak/mnt/Shift Planner/index.html","utf8");
let pass=0,fail=0;
const ok=(n,c,x)=>{c?(pass++,console.log("  PASS  "+n)):(fail++,console.log("  FAIL  "+n+(x!==undefined?"  -> "+JSON.stringify(x):"")));};
function boot(store,tz,lang){
  const st={...store},errs=[];
  const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
    Object.defineProperty(w,"localStorage",{value:{getItem:k=>k in st?st[k]:null,setItem:(k,v)=>{st[k]=String(v);},removeItem:k=>{delete st[k];}},configurable:true});
    if(tz){const O=w.Intl.DateTimeFormat;w.Intl.DateTimeFormat=function(){return{resolvedOptions:()=>({timeZone:tz})};};}
    if(lang)Object.defineProperty(w.navigator,"language",{value:lang,configurable:true});
    w.addEventListener("error",e=>errs.push(e.error&&e.error.message||e.message));
    w.confirm=()=>true; w.alert=()=>{};
  }});
  const d=dom.window.document;
  return {w:dom.window,d,st,errs,vis:()=>["cold","ask","answer"].filter(n=>!d.getElementById(n).hidden)};
}
const type=(d,v)=>{d.getElementById("qInput").value=v;};

console.log("\nA. Cold open");
{const {d,errs,vis,st}=boot({});
 ok("no errors",errs.length===0,errs.join("; "));
 ok("cold open is the only screen",vis().join()==="cold",vis());
 ok("no number anywhere",!/[0-9]/.test(d.getElementById("cold").textContent));
 ok("nothing written to storage yet",!st["shiftPlanner.2"]);
 ok("old keys untouched",!st["shiftPlanner.v5"]&&!st["shiftPlanner.v6"]);}

console.log("\nB. The two questions");
{const {d,vis,st,errs}=boot({});
 d.getElementById("start").click();
 ok("no errors",errs.length===0,errs.join("; "));
 ok("ask screen shown",vis().join()==="ask",vis());
 ok("step 1 of 2",/Question 1 of 2/.test(d.getElementById("stepLabel").textContent));
 type(d,"14.25"); d.getElementById("next").click();
 ok("q1 commits to storage immediately",!!st["shiftPlanner.2"]&&JSON.parse(st["shiftPlanner.2"]).jobs[0].rates[0].value===14.25);
 ok("step 2 of 2",/Question 2 of 2/.test(d.getElementById("stepLabel").textContent));
 type(d,"1,240"); d.getElementById("next").click();
 ok("lands on the answer",vis().join()==="answer",vis());
 const blob=JSON.parse(st["shiftPlanner.2"]);
 ok("thousands separator parsed",blob.outgoings[0].amount===1240,blob.outgoings[0].amount);
 ok("marked onboarded",blob.meta.onboarded===true);
 ok("schema is v:1 on a new key",blob.v===1&&"shiftPlanner.2" in st);
 const hrs=parseFloat(d.getElementById("hours").textContent);
 ok("a real number, not 0, not NaN",isFinite(hrs)&&hrs>0,d.getElementById("hours").textContent);
 ok("restated in one plain line",/a month, at .* an hour after tax\./.test(d.getElementById("restate").textContent),
    d.getElementById("restate").textContent);}

console.log("\nC. Input handling");
{const cases=[["",""],["abc","not a number"],["0","zero"],["-5","negative"],["99999","absurd rate"]];
 for(const [v,label] of cases){
   const {d,vis}=boot({});
   d.getElementById("start").click(); type(d,v); d.getElementById("next").click();
   ok(label+" is rejected with a message, not accepted",!d.getElementById("askErr").hidden&&vis().join()==="ask");
 }
 const {d}=boot({}); d.getElementById("start").click(); type(d,"14,25"); d.getElementById("next").click();
 ok("comma decimal accepted","Question 2 of 2"===d.getElementById("stepLabel").textContent);}

console.log("\nD. Resuming and empty states");
{const half={v:1,jobs:[{id:"j",name:"Job",pension:0,typicalHours:0,rates:[{id:"r",name:"Standard",value:14.25}]}],
   outgoings:[],goals:[],shifts:[],weeks:[],
   settings:{country:"UK",customRate:20,maxDays:6,hoursPerDay:10,otherIncome:0,theme:"light",countryInferred:true},
   meta:{firstRun:"x",onboarded:true,appVersion:"2.0.0",taxDataVersion:"2026.1"}};
 const {d,errs}=boot({"shiftPlanner.2":JSON.stringify(half)});
 ok("no errors",errs.length===0,errs.join("; "));
 ok("says what is missing, shows no figure",d.getElementById("ansGood").hidden&&!d.getElementById("ansMissing").hidden);
 ok("names the missing thing",/what your month costs/i.test(d.getElementById("missText").textContent),
    d.getElementById("missText").textContent);
 ok("no 0.0 and no tick",!/0\.0/.test(d.getElementById("answer").textContent));}

console.log("\nE. Country inference");
{const t=[["Europe/London",null,"United Kingdom"],["America/Toronto",null,"Canada"],
          ["Australia/Sydney",null,"Australia"],["Pacific/Chatham","en-IE","Ireland"],
          ["Pacific/Chatham","xx-ZZ","United Kingdom"]];
 for(const [tz,lang,want] of t){
   const {d}=boot({},tz,lang); d.getElementById("start").click();
   type(d,"10"); d.getElementById("next").click(); type(d,"1000"); d.getElementById("next").click();
   ok(tz+(lang?" + "+lang:"")+" -> "+want,d.getElementById("countryLine").textContent.startsWith(want),
      d.getElementById("countryLine").textContent);
 }}

console.log("\nF. Refusing a blob from the future");
{const fut=JSON.stringify({v:9,jobs:[],outgoings:[],goals:[],shifts:[],weeks:[],settings:{},meta:{}});
 const {d,st,errs}=boot({"shiftPlanner.2":fut});
 ok("no errors",errs.length===0,errs.join("; "));
 ok("says so plainly",/newer version/i.test(d.getElementById("missText").textContent));
 ok("blob left byte-identical",st["shiftPlanner.2"]===fut);}

console.log("\nG. Malformed storage fails safe");
{for(const [v,label] of [['{"v":1,"jobs":[','truncated'],['','empty string'],['null','null'],
   ['{"v":1,"jobs":{},"outgoings":[],"goals":[],"shifts":[],"weeks":[],"settings":{},"meta":{}}','jobs not an array'],
   ['{"v":0,"jobs":[],"outgoings":[],"goals":[],"shifts":[],"weeks":[],"settings":{},"meta":{}}','wrong version']]){
   const {vis,errs}=boot({"shiftPlanner.2":v});
   ok(label+" -> cold open, no crash",errs.length===0&&vis().join()==="cold",errs.join("; ")||vis());
 }}
console.log("\n"+pass+" passed, "+fail+" failed");
if(fail)process.exitCode=1;

function onboard(tz){
  const b=boot({},tz);
  b.d.getElementById("start").click();
  type(b.d,"14.25"); b.d.getElementById("next").click();
  type(b.d,"1240");  b.d.getElementById("next").click();
  return b;
}
const nav=(d,t)=>d.querySelector('.nav button[data-tab="'+t+'"]').click();

console.log("\nH. Nav appears only once there is an answer");
{const {d}=boot({});
 ok("no nav on cold open",d.getElementById("nav").hidden);
 d.getElementById("start").click();
 ok("no nav during the questions",d.getElementById("nav").hidden);
 const b=onboard();
 ok("nav appears after the answer",!b.d.getElementById("nav").hidden);
 ok("four tabs",b.d.querySelectorAll(".nav button").length===4);
 ok("Outgoings is a tab label",[...b.d.querySelectorAll(".nav button")].some(x=>x.textContent==="Outgoings"));}

console.log("\nI. Refinements");
{const {d}=onboard();
 ok("refinement list is offered",!d.getElementById("refineBox").hidden);
 const items=[...d.querySelectorAll(".refine b")].map(x=>x.textContent);
 ok("at most four at a time",items.length<=4,items.length);
 ok("each states what it buys",[...d.querySelectorAll(".refine span")].every(x=>x.textContent.trim().length>10));
 ok("offers a second rate",items.some(t=>/another rate/i.test(t)),items);
 d.querySelectorAll(".refine")[0].click();
 ok("tapping one navigates and acts",!d.getElementById("earn").hidden);
 ok("a second rate now exists",JSON.parse(boot?"{}":"{}")||d.querySelectorAll('#jobList [data-k="value"]').length===2,
    d.querySelectorAll('#jobList [data-k="value"]').length);
 nav(d,"answer");
 const after=[...d.querySelectorAll(".refine b")].map(x=>x.textContent);
 ok("the taken refinement drops off the list",!after.some(t=>/another rate/i.test(t)),after);}

console.log("\nJ. Earn edits change the number");
{const {d,st}=onboard();
 const before=parseFloat(d.getElementById("hours").textContent);
 nav(d,"earn");
 const rate=d.querySelectorAll('#jobList [data-k="value"]')[0];
 rate.value="20"; rate.dispatchEvent(new (d.defaultView.Event)("input",{bubbles:true}));
 nav(d,"answer");
 const after=parseFloat(d.getElementById("hours").textContent);
 ok("a higher rate means fewer hours",after<before,{before,after});
 ok("persisted",JSON.parse(st["shiftPlanner.2"]).jobs[0].rates[0].value===20);}

console.log("\nK. Outgoings edits change the number");
{const {d,st}=onboard();
 const before=parseFloat(d.getElementById("hours").textContent);
 nav(d,"out");
 ok("the onboarding item is there, labelled plainly",
    d.querySelector('#outList [data-k="label"]').value==="Everything");
 d.getElementById("addOut").click();
 const rows=d.querySelectorAll('#outList [data-k="amount"]');
 rows[rows.length-1].value="200";
 rows[rows.length-1].dispatchEvent(new (d.defaultView.Event)("input",{bubbles:true}));
 nav(d,"answer");
 ok("more outgoings means more hours",parseFloat(d.getElementById("hours").textContent)>before);
 nav(d,"out");
 const oi=d.getElementById("otherIncome");
 oi.value="1440"; oi.dispatchEvent(new (d.defaultView.Event)("input",{bubbles:true}));
 nav(d,"answer");
 ok("other income covering everything gives zero hours, not a crash",
    d.getElementById("hours").textContent==="0.0",d.getElementById("hours").textContent);
 ok("no Infinity or NaN on screen",!/Infinity|NaN/.test(d.getElementById("answer").textContent));}

console.log("\nL. Deleting everything degrades to a named empty state");
{const {d}=onboard();
 nav(d,"earn");
 d.querySelector("[data-delj]").click();
 nav(d,"answer");
 ok("no figure",d.getElementById("ansGood").hidden);
 ok("names what is missing",/what you earn an hour/i.test(d.getElementById("missText").textContent),
    d.getElementById("missText").textContent);}
console.log("\n"+pass+" passed, "+fail+" failed");
