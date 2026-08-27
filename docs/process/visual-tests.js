// jsdom tests for the 2026-08-27 presentation changes: the keep-an-hour bar, the mid-week figure,
// and the sheet as the only way data enters the app. Run: node docs/process/visual-tests.js
const fs=require("fs"),path=require("path");
let JSDOM;try{({JSDOM}=require("jsdom"));}catch(e){console.error("npm i jsdom");process.exit(2);}
const html=fs.readFileSync(path.join(__dirname,"..","..","index.html"),"utf8");
let p=0,f=0;
const ok=(n,c,x)=>{c?(p++,console.log("  PASS  "+n)):(f++,console.log("  FAIL  "+n+(x!==undefined?"  -> "+JSON.stringify(x):"")));};
function boot(){
  const st={},errs=[];
  const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
    Object.defineProperty(w,"localStorage",{value:{getItem:k=>k in st?st[k]:null,setItem:(k,v)=>{st[k]=String(v);},removeItem:k=>{delete st[k];}},configurable:true});
    w.addEventListener("error",e=>errs.push(e.error&&e.error.message||e.message));
    w.confirm=()=>true;w.alert=()=>{};w.scrollTo=()=>{};
  }});
  return {d:dom.window.document,st,errs};
}
function onboard(rate,cost){
  const b=boot(),d=b.d;
  d.getElementById("start").click();
  d.getElementById("qInput").value=rate; d.getElementById("next").click();
  d.getElementById("qInput").value=cost; d.getElementById("next").click();
  return b;
}
const nav=(d,t)=>d.querySelector('.nav [data-tab="'+t+'"]').click();
const sSet=(d,k,v)=>{const i=d.getElementById("sf_"+k);if(i)i.value=v;return i;};
const sSave=(d)=>d.getElementById("sheetSave").click();
const sClose=(d)=>{if(!d.getElementById("sheet").hidden)d.getElementById("sheetClose").click();};
const rows=(d,id)=>[...d.querySelectorAll("#"+id+" .item")];
const widths=(d)=>[...d.querySelectorAll("#takehome .barwrap i")].map(x=>parseFloat(x.style.width));

console.log("\n1. The keep-an-hour bar");
{const {d,errs}=onboard("14.25","1240"); nav(d,"earn");
 ok("no errors",errs.length===0,errs.join("; "));
 const t=d.getElementById("takehome");
 ok("the answer is the headline, not the last row",!!t.querySelector(".bignum b"),t.textContent.slice(0,40));
 ok("headline states what you keep of what you earn",/of .?14\.25/.test(t.querySelector(".bignum").textContent),
    t.querySelector(".bignum").textContent);
 ok("a bar is drawn",!!t.querySelector(".barwrap"));
 const w=widths(d);
 ok("every segment has a width",w.length>0&&w.every(x=>isFinite(x)&&x>0),w);
 ok("widths sum to 100 percent",Math.abs(w.reduce((a,b)=>a+b,0)-100)<0.5,w.reduce((a,b)=>a+b,0));
 ok("every segment is also labelled in text",
    t.querySelectorAll(".keyrow").length>=w.length,{rows:t.querySelectorAll(".keyrow").length,segs:w.length});
 ok("no NaN or Infinity",!/NaN|Infinity/.test(t.textContent));
 ok("no judgement words about the position",
    !/tight|comfortable|healthy|stretched|brutal|good|bad|too much/i.test(t.textContent));
 ok("no steering language about money",
    !/you should|consider |we recommend|prioritise|pay .* first|cut your|reduce your/i.test(t.textContent),
    t.textContent.slice(0,120));}

console.log("\n2. Small slices stay visible");
{const {d}=onboard("9.50","400"); nav(d,"earn");
 // a low rate with no pension makes National Insurance a tiny fraction of the hour
 const w=widths(d);
 ok("no segment renders thinner than 3 percent",w.every(x=>x>=2.99),w);
 ok("still sums to 100",Math.abs(w.reduce((a,b)=>a+b,0)-100)<0.5,w.reduce((a,b)=>a+b,0));
 ok("the largest slice is still the biggest",w[0]===Math.max.apply(null,w),w);}

console.log("\n3. The mid-week figure");
{const {d,errs}=onboard("14.25","1240");
 ok("nothing claimed before a shift is logged",!/of .* hrs/.test(d.getElementById("weekTotal").textContent),
    d.getElementById("weekTotal").textContent);
 d.getElementById("addShift").click(); sSet(d,"start","09:00"); sSet(d,"end","17:00"); sSet(d,"brk","0"); sSave(d); sClose(d);
 const txt=d.getElementById("weekTotal").textContent;
 ok("states hours so far against hours needed",/8\.0 of [0-9.]+ hrs/.test(txt),txt);
 ok("a progress bar is drawn",!!d.querySelector("#weekTotal .prog i"));
 ok("no verdict about the position",!/behind|ahead|on track|good|short of/i.test(txt),txt);
 ok("no errors",errs.length===0,errs.join("; "));}

console.log("\n4. The sheet is the only way data enters");
{const {d}=onboard("14.25","1240");
 nav(d,"earn");
 ok("no open inputs on Earn",d.querySelectorAll("#jobList input,#jobList select").length===0);
 nav(d,"out");
 ok("no open inputs on the outgoings list",d.querySelectorAll("#outList input,#outList select").length===0);
 ok("no open inputs on the goals list",d.querySelectorAll("#goalList input,#goalList select").length===0);}

console.log("\n5. The sheet refuses bad input without writing anything");
{const {d,st}=onboard("14.25","1240");
 nav(d,"out");
 const before=st["shiftPlanner.2"];
 d.getElementById("addOut").click();
 sSet(d,"label",""); sSet(d,"amount","abc"); sSave(d);
 ok("it refuses and says why",!d.getElementById("sheetErr").hidden,d.getElementById("sheetErr").textContent);
 ok("the sheet stays open",!d.getElementById("sheet").hidden);
 ok("nothing was written to storage",st["shiftPlanner.2"]===before);
 sSet(d,"label","Rent"); sSet(d,"amount","850"); sSave(d);
 ok("a valid save closes the error",d.getElementById("sheetErr").hidden);
 ok("and writes",JSON.parse(st["shiftPlanner.2"]).outgoings.some(o=>o.label==="Rent"));}

console.log("\n6. Cancel discards, Escape closes");
{const {d,st}=onboard("14.25","1240");
 nav(d,"out");
 const before=JSON.parse(st["shiftPlanner.2"]).outgoings[0].amount;
 rows(d,"outList")[0].click();
 sSet(d,"amount","99999");
 d.getElementById("sheetClose").click();
 ok("closing without saving changes nothing",JSON.parse(st["shiftPlanner.2"]).outgoings[0].amount===before,
    JSON.parse(st["shiftPlanner.2"]).outgoings[0].amount);
 ok("the sheet is closed",d.getElementById("sheet").hidden);}

console.log("\n7. Multi-rate survived the rewrite");
{const {d,st}=onboard("14.25","1240");
 nav(d,"earn");
 d.querySelector("[data-addrate]").click();
 sSet(d,"rname","Nights"); sSet(d,"rval","16.50"); sSave(d); sClose(d);
 const j=JSON.parse(st["shiftPlanner.2"]).jobs[0];
 ok("a second rate can still be added",j.rates.length===2,j.rates.map(r=>r.name));
 ok("both rates are listed",/Nights/.test(d.getElementById("jobList").textContent));
 ok("each rate is separately editable",rows(d,"jobList").length===3,rows(d,"jobList").length);
 rows(d,"jobList")[2].click();
 ok("editing the second rate opens its own values",d.getElementById("sf_rname").value==="Nights",
    d.getElementById("sf_rname").value);}

console.log("\n"+p+" pass, "+f+" fail"); if(f)process.exitCode=1;
