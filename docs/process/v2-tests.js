// TEMPORARY. jsdom tests for 2.0 build steps 1 to 3. Run: node docs/process/v2-tests.js
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
