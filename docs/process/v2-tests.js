// TEMPORARY. jsdom tests for 2.0. Run: node docs/process/v2-tests.js
// Requires: npm i jsdom. Delete once the Breaker has passed 2.0.
const fs=require("fs");
let JSDOM;try{({JSDOM}=require("jsdom"));}catch(e){console.error("npm i jsdom");process.exit(2);}
const html=fs.readFileSync(require("path").join(__dirname,"..","..","index.html"),"utf8");
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
// ---- sheet helpers. The app moved from always-open fields to a settled-row + sheet model on
// 2026-08-27, so tests now drive the sheet the way a person does: open, fill, save.
const sOpen=(d)=>!d.getElementById("sheet").hidden;
const sSet=(d,k,v)=>{const i=d.getElementById("sf_"+k); if(!i)throw new Error("no sheet field "+k); i.value=v; return i;};
const sSave=(d)=>d.getElementById("sheetSave").click();
const sErr=(d)=>d.getElementById("sheetErr").hidden?null:d.getElementById("sheetErr").textContent;
const sClose=(d)=>d.getElementById("sheetClose").click();
const rowsIn=(d,id)=>[...d.querySelectorAll("#"+id+" .item")];
const editRow=(d,id,i)=>{const r=rowsIn(d,id)[i||0]; r.click(); return r;};
const addOut=(d,label,amount,every)=>{d.getElementById("addOut").click();sSet(d,"label",label);sSet(d,"amount",amount);if(every)sSet(d,"every",every);sSave(d);sClose(d);};
const addGoal=(d,label,amount,weeks)=>{d.getElementById("addGoal").click();sSet(d,"label",label);sSet(d,"amount",amount);sSet(d,"weeks",weeks);sSave(d);sClose(d);};
const addShift=(d,o)=>{d.getElementById("addShift").click();Object.keys(o).forEach(k=>sSet(d,k,o[k]));sSave(d);sClose(d);};
const setRate=(d,v)=>{editRow(d,"jobList",1);sSet(d,"rval",v);sSave(d);};
const setRateTo99=(d)=>{editRow(d,"jobList",1);sSet(d,"rval","99");sSave(d);};
const setHrs=(d,v)=>{editRow(d,"jobList",0);sSet(d,"hrs",v);sSave(d);};

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
 ok("tapping the rate refinement opens the rate sheet",sOpen(d));
 sSet(d,"rname","Nights"); sSet(d,"rval","16.50"); sSave(d); sClose(d);
 ok("a second rate now exists",rowsIn(d,"jobList").length===3,rowsIn(d,"jobList").length);
 nav(d,"answer");
 const after=[...d.querySelectorAll(".refine b")].map(x=>x.textContent);
 ok("the taken refinement drops off the list",!after.some(t=>/another rate/i.test(t)),after);}

console.log("\nJ. Earn edits change the number");
{const {d,st}=onboard();
 const before=parseFloat(d.getElementById("hours").textContent);
 nav(d,"earn");
 setRate(d,"20");
 nav(d,"answer");
 const after=parseFloat(d.getElementById("hours").textContent);
 ok("a higher rate means fewer hours",after<before,{before,after});
 ok("persisted",JSON.parse(st["shiftPlanner.2"]).jobs[0].rates[0].value===20);}

console.log("\nK. Outgoings edits change the number");
{const {d,st}=onboard();
 const before=parseFloat(d.getElementById("hours").textContent);
 nav(d,"out");
 ok("the onboarding item is there, labelled plainly",
    /Everything/.test(d.getElementById("outList").textContent));
 addOut(d,"Extra","200");
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
 editRow(d,"jobList",0); d.getElementById("sheetDel").click();
 nav(d,"answer");
 ok("no figure",d.getElementById("ansGood").hidden);
 ok("names what is missing",/what you earn an hour/i.test(d.getElementById("missText").textContent),
    d.getElementById("missText").textContent);}
console.log("\n"+pass+" passed, "+fail+" failed");

const ev=(d,t,k)=>t.dispatchEvent(new (d.defaultView.Event)(k||"input",{bubbles:true}));

console.log("\nM. The limit section is gone");
{const {d}=onboard(); nav(d,"earn");
 ok("no limit inputs",!d.getElementById("maxDays")&&!d.getElementById("hoursPerDay"));
 nav(d,"answer");
 ok("no limit refinement offered",![...d.querySelectorAll(".refine b")].some(x=>/limit/i.test(x.textContent)));}

console.log("\nN. What an hour pays: the bug I shipped");
{const {d}=onboard(); nav(d,"earn");
 const t=d.getElementById("takehome").textContent;
 ok("no NaN or Infinity with zero usual hours",!/NaN|Infinity/.test(t),t.slice(0,90));
 ok("deductions are per hour, not annual",/-\D?[0-9]+\.[0-9]{2}/.test(t),t.slice(0,120));
 ok("no invented 37.5 assumption anywhere",!/37\.5/.test(t),t.slice(-90));
 ok("states the solved basis and where it came from",/hours a week, which is what covering your month would take/.test(t),t.slice(-140));
 const keep=t.match(/You keep\D*([0-9.]+)/);
 ok("take-home is below the gross rate",keep&&parseFloat(keep[1])<14.25,keep&&keep[1]);
 // live update: editing a rate must change take-home WITHOUT a tab switch
 const before=d.getElementById("takehome").textContent;
 setRate(d,"30");
 ok("take-home updates immediately on save",d.getElementById("takehome").textContent!==before);
 ok("still no NaN after the edit",!/NaN|Infinity/.test(d.getElementById("takehome").textContent));
 setHrs(d,"40");
 ok("entering usual hours changes the stated basis",/40 hours a week/.test(d.getElementById("takehome").textContent),
    d.getElementById("takehome").textContent.slice(-80));}

console.log("\nO. Weekly outgoings");
{const {d,st}=onboard();
 const before=parseFloat(d.getElementById("hours").textContent);
 nav(d,"out");
 editRow(d,"outList",0);
 const sel=d.getElementById("sf_every");
 ok("every item offers a frequency",!!sel);
 ok("month is the default",sel.value==="month");
 sel.value="week"; sSave(d);
 ok("stored as weekly",JSON.parse(st["shiftPlanner.2"]).outgoings[0].every==="week");
 ok("shows the monthly equivalent",/a month/.test(d.getElementById("outList").textContent),
    d.getElementById("outList").textContent.slice(-60));
 nav(d,"answer");
 const after=parseFloat(d.getElementById("hours").textContent);
 ok("1240 a week needs far more hours than 1240 a month",after>before*4,{before,after});
 ok("no Infinity or NaN",!/Infinity|NaN/.test(d.getElementById("answer").textContent));}

console.log("\nP. Settled rows, structurally");
{const {d}=onboard(); nav(d,"earn");
 ok("a job renders as rows, not open fields",d.querySelectorAll("#jobList .item").length>=2
    &&d.querySelectorAll("#jobList input").length===0,d.querySelectorAll("#jobList input").length);
 ok("the rate row shows its value as text",/14\.25/.test(d.getElementById("jobList").textContent));
 ok("delete targets still 44px in CSS",/\.x\{[^}]*min-height:44px/.test(html));
 ok("every settled row is a real button, so it is keyboard reachable",
    [...d.querySelectorAll("#jobList .item")].every(x=>x.tagName==="BUTTON"));
 nav(d,"out");
 ok("outgoings use settled rows too",d.querySelectorAll("#outList .item").length>=1
    &&d.querySelectorAll("#outList input").length===0);
 ok("goals use settled rows too",d.querySelectorAll("#goalList input").length===0);}
console.log("\n"+pass+" passed, "+fail+" failed");

console.log("\nQ. The tax basis is solved, not assumed");
{const {d}=onboard(); nav(d,"earn");
 const t=()=>d.getElementById("takehome").textContent;
 ok("no 37.5 shown to the user",!/37\.5/.test(t()));
 const m1=t().match(/on ([0-9.]+) hours a week/);
 ok("a solved basis is stated",!!m1,t().slice(-120));
 // The solved basis must equal the answer the app gives, because they are the same unknown.
 nav(d,"answer");
 const hrs=parseFloat(d.getElementById("hours").textContent);
 ok("the basis equals the hours it recommends",Math.abs(parseFloat(m1[1])-hrs)<0.15,{basis:m1[1],hours:hrs});
 // Declared hours must win over the solver.
 nav(d,"earn");
 setHrs(d,"40");
 ok("declared hours take over",/the 40 hours a week you entered/.test(t()),t().slice(-110));
 setHrs(d,"0");
 ok("clearing them returns to the solved basis",/which is what covering your month would take/.test(t()),t().slice(-110));
 ok("still no NaN or Infinity",!/NaN|Infinity/.test(t()));}

console.log("\nR. Inputs read as fields again");
{ok("fields have a resting fill",/\.f\{background:var\(--panel2\)/.test(html));
 ok("settled rows are buttons, not inputs",/\.item\{display:block/.test(html));
 ok("focus is still distinct",/\.f:focus\{background:var\(--panel\);border-color:var\(--accent\)/.test(html));}
console.log("\n"+pass+" passed, "+fail+" failed");

console.log("\nS. Shift logging");
{const {d,st}=onboard();
 ok("one control to add a shift",d.querySelectorAll("#shiftCard .add").length===1);
 ok("no always-open inputs on the shift list",d.querySelectorAll("#shiftList input").length===0);
 ok("empty state before anything is logged",/No shifts logged this week/.test(d.getElementById("shiftList").textContent));
 addShift(d,{start:"18:00",end:"02:00",brk:"0"});
 const blob=()=>JSON.parse(st["shiftPlanner.2"]);
 ok("shift stored",blob().shifts.length===1);
 const sh=blob().shifts[0];
 ok("rate and job snapshotted at log time",sh.rateValue===14.25&&sh.rateName==="Standard"&&sh.jobName==="Job",sh);
 ok("dated today",/^\d{4}-\d{2}-\d{2}$/.test(sh.date));
 ok("week summary appears",/8\.0 of|8\.0 hrs/.test(d.getElementById("weekTotal").textContent),
    d.getElementById("weekTotal").textContent);
 ok("overnight 18:00 to 02:00 is 8 hours",/8\.00 hrs/.test(d.getElementById("shiftList").textContent),
    d.getElementById("shiftList").textContent.match(/[\d.]+ hrs/));
 ok("earned is below gross 8 x 14.25",parseFloat(d.getElementById("weekTotal").textContent.replace(/^[^0-9]*[\d.]+ of [\d.]+ hrs\D*/,"").replace(/[^0-9.]/g,""))<114,
    d.getElementById("weekTotal").textContent);
 // break, applied through the sheet
 editRow(d,"shiftList",0); sSet(d,"brk","30"); sSave(d);
 ok("a 30 minute break gives 7.5 hours",/7\.50 hrs/.test(d.getElementById("shiftList").textContent),
    d.getElementById("shiftList").textContent.match(/[\d.]+ hrs/));
 // editing the rate afterwards must NOT rewrite the logged shift
 nav(d,"earn");
 setRateTo99(d);
 nav(d,"answer");
 ok("editing a rate does not rewrite a logged shift",blob().shifts[0].rateValue===14.25,blob().shifts[0].rateValue);
 // deleting the rate must not corrupt it either
 nav(d,"earn");
 editRow(d,"jobList",1); d.getElementById("sheetDel").click();
 nav(d,"answer");
 ok("deleting the rate leaves the shift intact",blob().shifts[0].rateValue===14.25&&blob().shifts.length===1);
 ok("no NaN or Infinity anywhere on Now",!/NaN|Infinity/.test(d.getElementById("answer").textContent+d.getElementById("shiftList").textContent));
 editRow(d,"shiftList",0); d.getElementById("sheetDel").click();
 ok("delete removes it",blob().shifts.length===0);
 ok("empty state returns",/No shifts logged this week/.test(d.getElementById("shiftList").textContent));}

console.log("\nT. Overnight and clock-change hours");
{const {d,st}=onboard();
 const cases=[["18:00","02:00",0,"8.00"],["22:00","06:00",30,"7.50"],
              ["09:00","17:00",60,"7.00"],["00:30","08:30",0,"8.00"],
              ["23:00","23:00",0,"0.00"]];
 for(const [a,b,br,want] of cases){
   addShift(d,{start:a,end:b,brk:String(br)});
   const txt=rowsIn(d,"shiftList").pop().textContent;
   ok(a+" to "+b+" less "+br+"m = "+want+" hrs",txt.indexOf(want+" hrs")>-1,txt.match(/[\d.]+ hrs/));
   editRow(d,"shiftList",rowsIn(d,"shiftList").length-1); d.getElementById("sheetDel").click();
 }}
console.log("\n"+pass+" passed, "+fail+" failed");

console.log("\nU. Weeks and banking");
{const {d,st}=onboard();
 nav(d,"weeks");
 ok("empty weeks screen says so",/Nothing here yet/.test(d.getElementById("weekList").textContent));
 ok("bank button says there is nothing to bank",d.getElementById("bankBtn").textContent==="Nothing to bank");
 nav(d,"answer"); addShift(d,{start:"18:00",end:"02:00",brk:"0"});
 nav(d,"weeks");
 ok("bank button offers to bank",d.getElementById("bankBtn").textContent==="Bank this week");
 d.getElementById("bankBtn").click();
 const blob=()=>JSON.parse(st["shiftPlanner.2"]);
 ok("week stored",blob().weeks.length===1);
 ok("the shift left the current week",blob().shifts.length===0);
 const w=blob().weeks[0];
 ok("hours and pay recorded",w.hours===8&&w.net>0,{h:w.hours,n:w.net});
 ok("coverage frozen at bank time",Array.isArray(w.coverage)&&w.coverage.length===1,w.coverage);
 ok("row rendered newest first with a date",/Week of/.test(d.getElementById("weekList").textContent));
 // editing an outgoing afterwards must NOT rewrite a banked week
 const before=JSON.stringify(blob().weeks[0].coverage);
 nav(d,"out");
 editRow(d,"outList",0); sSet(d,"amount","99999"); sSave(d);
 nav(d,"weeks");
 ok("editing an outgoing does not rewrite a banked week",JSON.stringify(blob().weeks[0].coverage)===before);
 ok("no Infinity or NaN",!/Infinity|NaN/.test(d.getElementById("weekList").textContent));}

console.log("\nV. Coverage never ranks");
{const {d,st}=onboard();
 nav(d,"out");
 addOut(d,"Savings","100");
 nav(d,"answer"); addShift(d,{start:"18:00",end:"02:00",brk:"0"});
 nav(d,"weeks"); d.getElementById("bankBtn").click();
 const cov=JSON.parse(st["shiftPlanner.2"]).weeks[0].coverage;
 const stored=JSON.parse(st["shiftPlanner.2"]).outgoings.map(o=>o.label);
 ok("coverage follows the stored order exactly",JSON.stringify(cov.map(c=>c.label))===JSON.stringify(stored),
    {cov:cov.map(c=>c.label),stored});
 const txt=d.getElementById("weekList").textContent;
 ok("no steering language anywhere",
    !/prioritise|consider|you should|pay this first|instead of|we recommend/i.test(txt));
 ok("states reached or not, nothing more",/Covered|short|Not reached/.test(txt),txt.slice(0,120));}

console.log("\nW. Settings and the compliance surface");
{const {d,st}=onboard();
 d.getElementById("settingsBtn").click();
 ok("settings opens",!d.getElementById("settings").hidden);
 ok("country picker is here, with all countries",d.getElementById("country").options.length>=9);
 ok("appearance has three choices",d.querySelectorAll(".themebtn").length===3);
 ok("export, import and delete are all here",
    !!d.getElementById("exportBtn")&&!!d.getElementById("importBtn2")&&!!d.getElementById("resetBtn"));
 const legal=d.getElementById("legal").textContent;
 ok("tax disclaimer present",/simplified estimate/i.test(legal));
 ok("not-debt-advice statement present",/not debt advice/i.test(legal));
 ok("points at free regulated advice",/MoneyHelper|Citizens Advice/.test(legal));
 ok("says it will not tell you what to pay",/will not tell you what to pay/i.test(legal));
 ok("version stamp present",/Version 2\.0\.0/.test(legal)&&/tax data/i.test(legal));
 ok("nothing leaves the browser is stated",/Nothing leaves your browser/i.test(legal));
 // theme
 d.querySelector('[data-theme-set="dark"]').click();
 ok("theme applies and persists",d.documentElement.getAttribute("data-theme")==="dark"
    &&JSON.parse(st["shiftPlanner.2"]).settings.theme==="dark");
 // country change moves the number
 nav(d,"answer"); const before=parseFloat(d.getElementById("hours").textContent);
 d.getElementById("settingsBtn").click();
 const c=d.getElementById("country"); c.value="US"; ev(d,c,"change");
 nav(d,"answer");
 ok("changing country changes the number",parseFloat(d.getElementById("hours").textContent)!==before);
 ok("and does not break it",!/NaN|Infinity/.test(d.getElementById("answer").textContent));}
console.log("\n"+pass+" passed, "+fail+" failed");
