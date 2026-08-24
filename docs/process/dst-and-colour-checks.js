// TEMPORARY. DST behaviour of mondayISO + colour-vision separability of the category ramp.
// Run: node docs/process/dst-and-colour-checks.js   Delete once the Breaker has passed v11.
const fs=require("fs");
const src=fs.readFileSync("/sessions/beautiful-loving-wozniak/mnt/Shift Planner/index.html","utf8");
const blk=src.split("// ── schema v6")[1].split("// ── end schema v6")[0];
eval("function uid(){return 'x'}"+blk.slice(blk.indexOf("function mondayISO")).split("const EMPTY_V6")[0]);
let pass=0,fail=0;
const ok=(n,c,x)=>{c?(pass++,console.log("  PASS  "+n)):(fail++,console.log("  FAIL  "+n+(x?"  -> "+x:"")));};
console.log("\nDST: mondayISO across the UK clock changes");
// 2026: BST ends Sun 25 Oct, starts Sun 29 Mar
const cases=[["Sat 24 Oct 2026 (BST, day before fall-back)","2026-10-24","2026-10-19"],
             ["Sun 25 Oct 2026 (fall-back day itself)","2026-10-25","2026-10-19"],
             ["Mon 26 Oct 2026 (first GMT Monday)","2026-10-26","2026-10-26"],
             ["Sat 28 Mar 2026 (day before spring-forward)","2026-03-28","2026-03-23"],
             ["Sun 29 Mar 2026 (spring-forward day)","2026-03-29","2026-03-23"],
             ["Mon 30 Mar 2026 (first BST Monday)","2026-03-30","2026-03-30"],
             ["Thu 31 Dec 2026 (year boundary)","2026-12-31","2026-12-28"],
             ["Fri 1 Jan 2027 (into next year)","2027-01-01","2026-12-28"]];
for(const [name,input,expect] of cases){
  const [y,m,d]=input.split("-").map(Number);
  for(const hh of [0,1,2,12,23]){
    const got=mondayISO(new Date(y,m-1,d,hh,30));
    if(got!==expect){ok(name+" @"+hh+":30",false,"got "+got+" want "+expect);break;}
    if(hh===23)ok(name,true);
  }
}
console.log("\nColour-vision: category ramp separability");
const ramp={bills:"#5C2410",save:"#3A5A31",repay:"#8A5B0E",spend:"#8E6A60",tax:"#4A443C"};
const lin=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
const rgb=h=>[0,2,4].map(i=>parseInt(h.slice(1).substr(i,2),16)/255);
// Brettel/Vienot-style LMS simulation, simplified
function sim(hex,type){
  let [r,g,b]=rgb(hex).map(lin);
  let L=.31399*r+.63951*g+.04649*b, M=.15537*r+.75789*g+.08670*b, S=.01776*r+.10945*g+.87262*b;
  if(type==="prot"){L=1.05118*M-0.05116*S;}
  if(type==="deut"){M=0.95130*L+0.04865*S;}
  if(type==="trit"){S=-0.86744*L+1.86727*M;}
  let R=5.47221*L-4.6419*M+0.16963*S, G=-1.1252*L+2.29317*M-0.1678*S, B=0.02980*L-0.19318*M+1.16364*S;
  return .2126*R+.7152*G+.0722*B;
}
for(const t of ["prot","deut","trit"]){
  const ls=Object.entries(ramp).map(([k,v])=>[k,sim(v,t)]).sort((a,b)=>a[1]-b[1]);
  let worst=Infinity,pair="";
  for(let i=1;i<ls.length;i++){const d=Math.abs(ls[i][1]-ls[i-1][1]);if(d<worst){worst=d;pair=ls[i-1][0]+"/"+ls[i][0];}}
  ok(t+": closest pair "+pair+" separated by "+worst.toFixed(4)+" luminance", worst>0.01,
     "under 0.01 means indistinguishable without the text label");
}
console.log("\n"+pass+" passed, "+fail+" failed");
if(fail)process.exitCode=1;
