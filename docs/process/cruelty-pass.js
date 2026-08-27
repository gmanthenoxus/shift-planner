// TEMPORARY. Breaker cruelty + security pass for 2.0. Run from a dir with jsdom installed:
//   cd /tmp && npm i jsdom && node "<repo>/docs/process/cruelty-pass.js"
const fs=require("fs");let JSDOM;try{({JSDOM}=require("jsdom"))}catch(e){console.error("npm i jsdom");process.exit(2)}
const APP=require("path").join(__dirname,"..","..","index.html");
const html=fs.readFileSync(APP,"utf8");
let out=[];const rec=(id,r,n)=>out.push([id,r,n||""]);
function boot(store){const st={...store},errs=[];
  const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
    Object.defineProperty(w,"localStorage",{value:{getItem:k=>k in st?st[k]:null,setItem:(k,v)=>{st[k]=String(v)},removeItem:k=>{delete st[k]}},configurable:true});
    w.addEventListener("error",e=>errs.push(e.error&&e.error.message||e.message));
    w.confirm=()=>true;w.alert=m=>errs.push("ALERT:"+m);
  }});
  return{w:dom.window,d:dom.window.document,st,errs};}
const type=(d,v)=>{d.getElementById("qInput").value=v};
const ev=(d,t,k)=>t.dispatchEvent(new(d.defaultView.Event)(k||"input",{bubbles:true}));
const tab=(d,t)=>d.querySelector('.nav button[data-tab="'+t+'"]').click();
function onboard(){const b=boot({});b.d.getElementById("start").click();
  type(b.d,"14.25");b.d.getElementById("next").click();
  type(b.d,"1240");b.d.getElementById("next").click();return b;}

// The app moved to a settled-row + sheet model on 2026-08-27. Hostile values now go in through the
// sheet, which is the only path a real user has, and the sheet's validate() is part of what is
// being attacked: a refused value must leave the stored blob untouched, not half-written.
const sSet=(d,k,v)=>{const i=d.getElementById("sf_"+k); if(i){i.value=v;} return i;};
const sSave=(d)=>d.getElementById("sheetSave").click();
const sClose=(d)=>d.getElementById("sheetClose").click();
const sOpen=(d)=>!d.getElementById("sheet").hidden;
const rowsIn=(d,id)=>[...d.querySelectorAll("#"+id+" .item")];
const addShiftQ=(d)=>{d.getElementById("addShift").click();sSave(d);if(sOpen(d))sClose(d);};

const nasty=["0","-1","-999999","1e9","999999999999","0.000001","abc","   ","<script>alert(1)</script>",
 "<img src=x onerror=alert(1)>","'\"><b>x</b>","NaN","Infinity","1,2,3,4",".",",","--5","1e309","A".repeat(3000)];

{const {d,errs}=onboard();
 tab(d,"earn");
 for(const v of nasty){
   rowsIn(d,"jobList")[0].click();
   ["name","hrs","pension"].forEach(k=>sSet(d,k,v)); sSave(d); if(sOpen(d))sClose(d);
   rowsIn(d,"jobList")[1].click();
   ["rname","rval"].forEach(k=>sSet(d,k,v)); sSave(d); if(sOpen(d))sClose(d);
 }
 tab(d,"out");
 for(const v of nasty){
   rowsIn(d,"outList")[0].click();
   ["label","amount"].forEach(k=>sSet(d,k,v)); sSave(d); if(sOpen(d))sClose(d);
   d.getElementById("addGoal").click();
   ["label","amount","weeks"].forEach(k=>sSet(d,k,v)); sSave(d); if(sOpen(d))sClose(d);
 }
 tab(d,"answer");
 const txt=d.getElementById("answer").textContent+d.getElementById("shiftList").textContent;
 rec("absurd input into every field",errs.length===0?"PASS":"FAIL",errs.slice(0,2).join(" | "));
 rec("no NaN/Infinity/undefined on screen",!/NaN|Infinity|undefined/.test(txt)?"PASS":"FAIL",txt.slice(0,80));
 tab(d,"out");
 rowsIn(d,"outList")[0].click(); sSet(d,"label",'<img src=x onerror=alert(1)>'); sSet(d,"amount","500"); sSave(d);
 tab(d,"answer"); tab(d,"out");
 rec("HTML in a label is escaped, not injected",d.querySelectorAll("#outList img,#outList script").length===0?"PASS":"FAIL",
   "injected nodes: "+d.querySelectorAll("#outList img,#outList script").length);
}
{const {d,errs}=onboard();
 tab(d,"out"); rowsIn(d,"outList")[0].click(); sSet(d,"label",'<b onclick="x">B</b>'); sSet(d,"amount","500"); sSave(d);
 tab(d,"answer"); addShiftQ(d);
 tab(d,"weeks"); d.getElementById("bankBtn").click();
 rec("HTML escaped on the banked-week screen",d.querySelectorAll("#weekList b[onclick]").length===0?"PASS":"FAIL",
   "unescaped: "+d.querySelectorAll("#weekList b[onclick]").length);
 rec("banking a week raises no errors",errs.length===0?"PASS":"FAIL",errs.slice(0,2).join(" | "));
}
{const {d,errs,st}=onboard();
 for(let i=0;i<200;i++) addShiftQ(d);
 const n=JSON.parse(st["shiftPlanner.2"]).shifts.length;
 rec("200 shifts logged rapidly",(errs.length===0&&n===200)?"PASS":"FAIL","count="+n+" errs="+errs.length);
 tab(d,"weeks"); d.getElementById("bankBtn").click();
 rec("banking 200 shifts at once",errs.length===0?"PASS":"FAIL",errs.slice(0,2).join(" | "));
 for(let i=0;i<50;i++){tab(d,"earn");tab(d,"out");tab(d,"weeks");tab(d,"answer")}
 rec("200 rapid tab switches",errs.length===0?"PASS":"FAIL",errs.slice(0,2).join(" | "));
}
for(const [v,lab] of [['{"v":1,"jobs":[',"truncated JSON"],["","empty string"],["null","null"],["[]","an array"],
  ['{"v":1}',"missing arrays"],['{"v":"1","jobs":[],"outgoings":[],"goals":[],"shifts":[],"weeks":[],"settings":{},"meta":{}}',"version as a string"],
  ['{"v":1,"jobs":null,"outgoings":[],"goals":[],"shifts":[],"weeks":[],"settings":{},"meta":{}}',"jobs is null"],
  ['{"v":99,"jobs":[],"outgoings":[],"goals":[],"shifts":[],"weeks":[],"settings":{},"meta":{}}',"from the future"]]){
  const {d,errs,st}=boot({"shiftPlanner.2":v});
  const vis=["cold","ask","answer"].filter(n=>!d.getElementById(n).hidden);
  const future=v.indexOf('"v":99')>-1;
  const okScreen = future ? vis[0]==="answer" : vis[0]==="cold";
  const intact  = future ? st["shiftPlanner.2"]===v : true;
  rec("corrupt storage: "+lab,(errs.length===0&&okScreen&&intact)?"PASS":"FAIL","errs="+errs.length+" screen="+vis+" intact="+intact);
}
{const {w}=onboard();
 rec("import validates shape",w.eval('validShape({"v":1})')===false?"PASS":"FAIL","");
 rec("import accepts a good blob",
   w.eval('validShape({v:1,jobs:[],outgoings:[],goals:[],shifts:[],weeks:[],settings:{},meta:{}})')===true?"PASS":"FAIL","");
}
rec("no secrets, keys or tokens in source",!/api[_-]?key|client[_-]?secret|Bearer |AKIA[0-9A-Z]{16}/i.test(html)?"PASS":"FAIL","");
rec("no network calls of any kind",!/fetch\(|XMLHttpRequest|WebSocket|sendBeacon|<script\s+src/i.test(html)?"PASS":"FAIL",
  (html.match(/fetch\(|XMLHttpRequest|<script\s+src/gi)||[]).join(","));
rec("no innerHTML of raw user values",!/innerHTML\s*=\s*[a-z]+\.(label|name)\b/.test(html)?"PASS":"FAIL","");
console.log(out.map(r=>"  "+r[1].padEnd(6)+r[0]+(r[2]?"    "+r[2]:"")).join("\n"));
console.log("\n"+out.filter(r=>r[1]==="PASS").length+" pass, "+out.filter(r=>r[1]==="FAIL").length+" fail");
