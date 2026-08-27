// TEMPORARY. Goals feed the number, expire, and stay out of the coverage waterfall.
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(require("path").join(__dirname,"..","..","index.html"),"utf8");
let p=0,f=0;const ok=(n,c,x)=>{c?(p++,console.log("  PASS  "+n)):(f++,console.log("  FAIL  "+n+(x!==undefined?"  -> "+JSON.stringify(x):"")))};
function boot(store){const st={...store},errs=[];
  const w=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
    Object.defineProperty(w,"localStorage",{value:{getItem:k=>k in st?st[k]:null,setItem:(k,v)=>{st[k]=String(v)}},configurable:true});
    w.confirm=()=>true;w.alert=()=>{};w.addEventListener("error",e=>errs.push(e.message));}}).window;
  return {w,d:w.document,st,errs};}
const ev=(d,t,k)=>t.dispatchEvent(new (d.defaultView.Event)(k||"input",{bubbles:true}));
const nav=(d,t)=>d.querySelector('.nav button[data-tab="'+t+'"]').click();
function onboard(){const b=boot({});b.d.getElementById("start").click();
  b.d.getElementById("qInput").value="14.25";b.d.getElementById("next").click();
  b.d.getElementById("qInput").value="1240";b.d.getElementById("next").click();return b;}

console.log("\nGoals actually change the number");
{const {d,st,errs}=onboard();
 const before=parseFloat(d.getElementById("hours").textContent);
 nav(d,"out"); d.getElementById("addGoal").click();
 const set=(k,v)=>{const i=d.getElementById("sf_"+k);i.value=v;};
 const saveGoal=()=>{d.getElementById("sheetSave").click();if(!d.getElementById("sheet").hidden)d.getElementById("sheetClose").click();};
 set("label","Car"); set("label","Car"); set("amount","2000"); set("weeks","20"); saveGoal(); saveGoal();
 nav(d,"answer");
 const after=parseFloat(d.getElementById("hours").textContent);
 ok("no errors",errs.length===0,errs.join("; "));
 ok("adding a goal raises the hours",after>before,{before,after});
 // 2000/20 = 100 a week. At net ~11.24, that is ~8.9 extra hours.
 const extra=after-before;
 ok("the extra is the goal's weekly share divided by net pay",extra>7&&extra<11,extra.toFixed(2));
 ok("the split is stated on screen",/includes .* hours a week for your goals/.test(d.getElementById("restate").textContent),
    d.getElementById("restate").textContent);
 ok("no NaN or Infinity",!/NaN|Infinity/.test(d.getElementById("answer").textContent));
 nav(d,"out");
 ok("the goal row shows its weekly share and time left",/a week, 20 weeks to go/.test(d.getElementById("goalList").textContent),
    d.getElementById("goalList").textContent.slice(-70));}

console.log("\nAn expired goal stops adding hours and says so");
{const past=Date.now()-40*7*24*60*60*1000;
 const blob={v:1,jobs:[{id:"j",name:"Job",pension:0,typicalHours:0,rates:[{id:"r",name:"Standard",value:14.25}]}],
  outgoings:[{id:"o",label:"Everything",amount:1240,cat:"bills"}],
  goals:[{id:"g",label:"Old",amount:2000,weeks:4,addedAt:past}],
  shifts:[],weeks:[],settings:{country:"UK",customRate:20,otherIncome:0,theme:"light",countryInferred:true},
  meta:{onboarded:true,appVersion:"2.0.0",taxDataVersion:"2026.1"}};
 const {d,errs}=boot({"shiftPlanner.2":JSON.stringify(blob)});
 ok("no errors",errs.length===0,errs.join("; "));
 ok("expired goal adds no hours",!/includes .* for your goals/.test(d.getElementById("restate").textContent),
    d.getElementById("restate").textContent);
 nav(d,"out");
 ok("it is still visible, marked finished",/Finished\. It is not adding hours any more/.test(d.getElementById("goalList").textContent),
    d.getElementById("goalList").textContent.slice(-80));}

console.log("\nA goal alone is enough to work something out");
{const blob={v:1,jobs:[{id:"j",name:"Job",pension:0,typicalHours:0,rates:[{id:"r",name:"Standard",value:14.25}]}],
  outgoings:[],goals:[{id:"g",label:"Deposit",amount:1000,weeks:10,addedAt:Date.now()}],
  shifts:[],weeks:[],settings:{country:"UK",customRate:20,otherIncome:0,theme:"light",countryInferred:true},
  meta:{onboarded:true,appVersion:"2.0.0",taxDataVersion:"2026.1"}};
 const {d,errs}=boot({"shiftPlanner.2":JSON.stringify(blob)});
 ok("no errors",errs.length===0,errs.join("; "));
 ok("shows a figure, not 'add what your month costs'",!d.getElementById("ansGood").hidden,
    d.getElementById("missText").textContent);
 const h=parseFloat(d.getElementById("hours").textContent);
 ok("the figure is real",isFinite(h)&&h>0,h);}

console.log("\nBanking records what the week put towards goals");
{const {d,st}=onboard();
 nav(d,"out"); d.getElementById("addGoal").click();
 const set=(k,v)=>{const i=d.getElementById("sf_"+k);i.value=v;};
 const saveGoal=()=>{d.getElementById("sheetSave").click();if(!d.getElementById("sheet").hidden)d.getElementById("sheetClose").click();};
 set("label","Car"); set("amount","2000"); set("weeks","20"); saveGoal();
 nav(d,"answer"); d.getElementById("addShift").click(); d.getElementById("sheetSave").click();
 if(!d.getElementById("sheet").hidden)d.getElementById("sheetClose").click();
 nav(d,"weeks"); d.getElementById("bankBtn").click();
 const wk=JSON.parse(st["shiftPlanner.2"]).weeks[0];
 ok("goal target frozen into the week",wk.goalTarget>0,wk.goalTarget);
 ok("shown on the week row",/Put towards goals/.test(d.getElementById("weekList").textContent));
 ok("goals are NOT slotted into the coverage waterfall",
    wk.coverage.every(c=>c.label!=="Car"),wk.coverage.map(c=>c.label));
 ok("the week records WHICH goal got what, not one lump",
    wk.goalSplit&&typeof wk.goalSplit==="object",wk.goalSplit);
 nav(d,"out");
 ok("the goal row now shows progress against the target",
    /of .?2,000/.test(d.getElementById("goalList").textContent),
    d.getElementById("goalList").textContent.slice(0,90));
 ok("progress never exceeds the target",
    !/2,0[0-9][0-9] of .?2,000/.test(d.getElementById("goalList").textContent));}
console.log("\n"+p+" pass, "+f+" fail"); if(f)process.exitCode=1;
