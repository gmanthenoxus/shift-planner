// TEMPORARY. jsdom tests for the four-screen shell + card density. Run: node docs/process/tab-tests.js
// Requires: npm i jsdom. Delete once the Breaker has passed v11.
const fs=require("fs");
let JSDOM;try{({JSDOM}=require("jsdom"));}catch(e){
  console.error("jsdom not installed. Run:  npm i jsdom   (dev-only, not an app dependency)");
  process.exit(2);}
const html=fs.readFileSync("/sessions/beautiful-loving-wozniak/mnt/Shift Planner/index.html","utf8");
let pass=0,fail=0;
const ok=(n,c,x)=>{c?(pass++,console.log("  PASS  "+n)):(fail++,console.log("  FAIL  "+n+(x?"  -> "+x:"")));};
const V5={jobs:[{id:"j1",label:"Door supervisor",wage:14.25,hours:24,pension:5}],
 bills:[{id:"b1",label:"Rent",amount:600,cat:"bills"}],goals:[],
 shifts:[{jobId:"j1",start:"18:00",end:"02:00",brk:30}],
 history:[{date:"3 Aug",hours:31.5,net:402.11,coverage:[]}],
 settings:{country:"UK",customRate:20,maxDays:6,hoursPerDay:10,otherMo:0}};
const st={"shiftPlanner.v5":JSON.stringify(V5)};
const errs=[];
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  Object.defineProperty(w,"localStorage",{value:{getItem:k=>k in st?st[k]:null,setItem:(k,v)=>{st[k]=String(v);},removeItem:k=>{delete st[k];}},configurable:true});
  w.addEventListener("error",e=>errs.push(e.error?e.error.message:String(e.message)));}});
const {window:w}=dom, d=w.document;
const vis=()=>[...d.querySelectorAll(".tabpanel")].filter(p=>!p.hidden).map(p=>p.id);

console.log("\nShell");
ok("no uncaught errors",errs.length===0,errs.join("; "));
ok("five panels exist",d.querySelectorAll(".tabpanel").length===5);
ok("exactly one visible on load, and it is Now",vis().length===1&&vis()[0]==="tab-now",vis().join(","));
ok("four tab buttons",d.querySelectorAll(".tabbtn").length===4);
ok("tablist/tab/tabpanel roles present",
   d.querySelector('[role="tablist"]')&&d.querySelectorAll('[role="tab"]').length===4&&d.querySelectorAll('[role="tabpanel"]').length===5);
ok("every tab button meets 44px min-height rule in CSS",/\.tabbtn\{[^}]*min-height:44px/.test(html));

console.log("\nSwitching");
const mb=d.querySelector('[data-tab="money"]'); mb.focus(); mb.click();  // real browsers focus on mousedown; jsdom does not
ok("clicking Money shows only Money",vis().length===1&&vis()[0]==="tab-money",vis().join(","));
ok("aria-selected moved",d.querySelector('[data-tab="money"]').getAttribute("aria-selected")==="true"
   && d.querySelector('[data-tab="now"]').getAttribute("aria-selected")==="false");
ok("focus stays on the tab button (ARIA practice)",d.activeElement&&d.activeElement.dataset.tab==="money",d.activeElement&&d.activeElement.id);
ok("panel is the next tab stop",d.getElementById("tab-money").getAttribute("tabindex")==="0");
d.querySelector('[data-tab="weeks"]').click();
ok("Weeks shows banked history",/3 Aug|history/i.test(d.getElementById("tab-weeks").innerHTML));

console.log("\nSettings");
d.getElementById("settingsBtn").click();
ok("Settings panel opens",vis().length===1&&vis()[0]==="tab-settings",vis().join(","));
ok("no tab button claims to be active",[...d.querySelectorAll(".tabbtn")].every(b=>b.getAttribute("aria-selected")==="false"));
ok("country picker lives in Settings",!!d.getElementById("tab-settings").querySelector("#country"));
d.getElementById("settingsBtn").click();
ok("toggling returns to Now",vis()[0]==="tab-now");

console.log("\nKeyboard");
const first=d.querySelector('[data-tab="now"]'); first.focus();
const ev=k=>new w.KeyboardEvent("keydown",{key:k,bubbles:true});
first.dispatchEvent(ev("ArrowRight"));
ok("ArrowRight moves to Work",vis()[0]==="tab-work",vis().join(","));
d.activeElement.dispatchEvent(ev("End"));
ok("End jumps to the last tab",vis()[0]==="tab-weeks",vis().join(","));
d.activeElement.dispatchEvent(ev("Home"));
ok("Home returns to the first",vis()[0]==="tab-now",vis().join(","));

console.log("\nContent placement");
d.querySelector('[data-tab="work"]').click();
ok("employers on Work",!!d.getElementById("tab-work").querySelector("#jobs"));
d.querySelector('[data-tab="money"]').click();
ok("outgoings on Money",!!d.getElementById("tab-money").querySelector("#bills"));
d.querySelector('[data-tab="now"]').click();
ok("headline + shifts on Now",!!d.getElementById("tab-now").querySelector("#headline")&&!!d.getElementById("tab-now").querySelector("#shifts"));
console.log("\n"+pass+" passed, "+fail+" failed");
if(fail)process.exitCode=1;

console.log("\nDensity (TECH-PACK §2: never more than three cards per screen)");
{ const counts={};
  ["now","work","money","weeks","settings"].forEach(t=>{
    counts[t]=d.getElementById("tab-"+t).querySelectorAll(":scope > .card").length;});
  Object.entries(counts).forEach(([t,n])=>ok(t+" has "+n+" cards (max 3)",n<=3));
  ok("Now carries the headline, this-week and shifts",
     !!d.getElementById("headline")&&!!d.getElementById("thisweek")&&!!d.getElementById("shifts"));
  // this fixture has one migrated shift, so the card must be SHOWING and populated
  ok("this-week card shows when a shift exists",!d.getElementById("thisweek").hidden);
  ok("this-week counts the shift",d.getElementById("tw-count").textContent==="1",d.getElementById("tw-count").textContent);
  ok("this-week shows earnings, not a dash",/[0-9]/.test(d.getElementById("tw-net").textContent),d.getElementById("tw-net").textContent);
  ok("a full-width log button exists on Now",!!d.getElementById("addShiftTop"));
}
console.log("\n"+pass+" passed, "+fail+" failed");
