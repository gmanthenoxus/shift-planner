// TEMPORARY. Verifies BUG-1: no UK-only advice service is named outside the UK.
// Run: NODE_PATH=<dir>/node_modules node docs/process/bug1-advice-pointer.js
const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/beautiful-loving-wozniak/mnt/Shift Planner/index.html","utf8");
let p=0,f=0;const ok=(n,c,x)=>{c?(p++,console.log("  PASS  "+n)):(f++,console.log("  FAIL  "+n+(x?"  -> "+x:"")))};
function boot(){const st={};
  const d=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
    Object.defineProperty(w,"localStorage",{value:{getItem:k=>k in st?st[k]:null,setItem:(k,v)=>{st[k]=String(v)}},configurable:true});
    w.confirm=()=>true;w.alert=()=>{};}}).window;
  const doc=d.document;
  doc.getElementById("start").click();
  doc.getElementById("qInput").value="14.25"; doc.getElementById("next").click();
  doc.getElementById("qInput").value="1240";  doc.getElementById("next").click();
  return {w:d,d:doc};}
const {d}=boot();
d.getElementById("settingsBtn").click();
const legal=()=>d.getElementById("legal").textContent;
ok("UK names MoneyHelper and Citizens Advice",/MoneyHelper and Citizens Advice/.test(legal()));
const c=d.getElementById("country");
let bad=[];
for(const k of ["IE","DE","FR","NL","ES","US","CA","AU","NONE"]){
  c.value=k; c.dispatchEvent(new (d.defaultView.Event)("change",{bubbles:true}));
  const t=legal();
  if(/MoneyHelper|Citizens Advice/.test(t)) bad.push(k);
  if(!/Free debt advice services exist in most countries/.test(t)) bad.push(k+":no-generic");
}
ok("no UK-only service named outside the UK",bad.length===0,bad.join(","));
c.value="UK"; c.dispatchEvent(new (d.defaultView.Event)("change",{bubbles:true}));
ok("returning to the UK restores the named services",/MoneyHelper/.test(legal()));
ok("not-debt-advice statement survives every country",/not debt advice/i.test(legal()));
ok("no steering language in the legal block",
   !/prioritise|consider|you should|we recommend|instead of|rather than/i.test(legal()));
ok("still says it will not tell you what to pay",/will not tell you what to pay or when/.test(legal()));
console.log("\n"+p+" pass, "+f+" fail");
if(f)process.exitCode=1;
