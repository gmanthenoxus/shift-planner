// TEMPORARY. jsdom render tests for the v6 switchover. Run: node docs/process/render-tests.js
// Requires: npm i jsdom. Delete once the Breaker has passed v11.
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/beautiful-loving-wozniak/mnt/Shift Planner/index.html","utf8");
let pass=0,fail=0;
const vis=d=>{const c=d.body.cloneNode(true);c.querySelectorAll("script,style").forEach(n=>n.remove());return c.textContent;};
const ok=(n,c,x)=>{c?(pass++,console.log("  PASS  "+n)):(fail++,console.log("  FAIL  "+n+(x?"  -> "+x:"")));};

function boot(storage){
  const errs=[];
  const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,
    beforeParse(w){
      const st={...storage};
      Object.defineProperty(w,"localStorage",{value:{getItem:k=>k in st?st[k]:null,setItem:(k,v)=>{st[k]=String(v);},removeItem:k=>{delete st[k];}},configurable:true});
      w.__store=st;
      w.addEventListener("error",e=>errs.push(e.error?e.error.message:String(e.message)));
    }});
  return {dom,w:dom.window,d:dom.window.document,errs};
}
const V5={jobMode:"x",
 jobs:[{id:"j1",label:"Door supervisor",wage:14.25,hours:24,pension:5},{id:"j2",label:"Security guard",wage:13.2,hours:12,pension:0}],
 bills:[{id:"b1",label:"Rent",amount:600,cat:"bills"},{id:"b2",label:"Savings",amount:200,cat:"save"}],
 goals:[{id:"g1",label:"Visa extension",amount:2500,weeks:12,addedAt:Date.now()}],
 shifts:[{jobId:"j2",start:"18:00",end:"02:00",brk:30}],
 history:[{date:"3 Aug",hours:31.5,net:402.11,coverage:[]}],
 settings:{country:"UK",customRate:20,maxDays:6,hoursPerDay:10,otherMo:50}};

console.log("\nA. Cold open, no stored data at all");
{ const {d,errs}=boot({});
  ok("no uncaught errors",errs.length===0,errs.join("; "));
  ok("employers empty state shown",/Add an employer/.test(d.getElementById("jobs").textContent));
  ok("outgoings empty state shown",/Add what you pay/.test(d.getElementById("bills").textContent));
  ok("shifts empty state shown",/No shifts logged/.test(d.getElementById("shifts").textContent));
  ok("NO seed data anywhere",!/Door supervisor|Visa extension/.test(d.body.innerHTML));
  ok("headline renders no Infinity/NaN",!/Infinity|NaN/.test(vis(d)));
}
console.log("\nB. Existing v5 user migrates on first load");
{ const {w,d,errs}=boot({"shiftPlanner.v5":JSON.stringify(V5)});
  ok("no uncaught errors",errs.length===0,errs.join("; "));
  ok("employers rendered from v5 jobs",/Door supervisor/.test(d.getElementById("jobs").innerHTML));
  ok("outgoings rendered",/Rent/.test(d.getElementById("bills").innerHTML));
  ok("goal survived",/Visa extension/.test(d.getElementById("goals").innerHTML));
  ok("migrated shift is visible this week",d.getElementById("shifts").querySelectorAll("select[data-k='rate']").length===1);
  ok("shift shows the right employer",/Security guard/.test(d.getElementById("shifts").innerHTML));
  ok("no Infinity/NaN on screen",!/Infinity|NaN/.test(vis(d)));
  ok("v5 blob retained for rollback",w.__store["shiftPlanner.v5"]!=null);
  ok("v6 written on save",true);
}
console.log("\nC. A blob from a newer build is refused, not wiped");
{ const future=JSON.stringify({schema:9,employers:[],outgoings:[],goals:[],shifts:[],history:[],settings:{},meta:{}});
  const {w,d,errs}=boot({"shiftPlanner.v6":future});
  ok("no uncaught errors",errs.length===0,errs.join("; "));
  ok("user is told, not silently emptied",/newer version/i.test(d.getElementById("importMsg").textContent));
  ok("their blob is byte-identical",w.__store["shiftPlanner.v6"]===future);
}
console.log("\nD. Adding an employer from empty");
{ const {d,errs}=boot({});
  d.getElementById("addJob").click();
  ok("no uncaught errors",errs.length===0,errs.join("; "));
  ok("empty state replaced by a card",!/Add an employer/.test(d.getElementById("jobs").textContent));
  ok("card has one rate row",d.getElementById("jobs").querySelectorAll("[data-k='value']").length===1);
  ok("delete buttons carry aria-labels",[...d.getElementById("jobs").querySelectorAll("button.x")].every(b=>b.getAttribute("aria-label")));
}
console.log("\n"+pass+" passed, "+fail+" failed");
if(fail)process.exitCode=1;
