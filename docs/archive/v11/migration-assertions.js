// TEMPORARY. Migration assertions for SCOPE v11 feature 1. Run: node docs/process/migration-assertions.js
// Delete once the Breaker has passed v11. Kept in-repo because prompt 3 forbids deleting them earlier.
// Mirrors the schema-v6 block in index.html; it is NOT the source of truth, index.html is.

const KEY="shiftPlanner.v5";
const uid=()=>Math.random().toString(36).slice(2,9);
function validShape(o){if(!o||typeof o!=="object")return false;
 for(const k of ["jobs","bills","goals","shifts","history"])if(!Array.isArray(o[k]))return false;
 if(!o.settings||typeof o.settings!=="object")return false;return true;}
const store={};
const localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};
// ── schema v6 ──────────────────────────────────
// ARCHITECTURE.md §2. DATA ONLY -- nothing here is wired into the running app yet. model() and the
// render functions still read the v5 shape (S.jobs, S.bills); the switchover happens in the step
// that builds onboarding. Migrating S now would break every reader at once, which is precisely the
// big-bang change the build order exists to avoid.
const SCHEMA=6;
const KEY_V6="shiftPlanner.v6";
// The v5 key is NOT deleted after migration -- it is the only rollback path if v6 reaches a real
// user with a bug (ARCHITECTURE.md decision 17). Removed in v12, once v11 has survived contact.

// Monday of the week containing `d`, as YYYY-MM-DD. Deliberately local time, not UTC: a shift
// logged at 00:30 on a Monday in BST is a Monday to the user, and UTC would file it as Sunday.
function mondayISO(d){
  const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  x.setDate(x.getDate()-((x.getDay()+6)%7));
  const p=n=>String(n).padStart(2,"0");
  return x.getFullYear()+"-"+p(x.getMonth()+1)+"-"+p(x.getDate());
}

const EMPTY_V6=()=>({schema:SCHEMA,employers:[],outgoings:[],goals:[],shifts:[],history:[],
  settings:{country:"UK",customRate:20,maxDays:6,hoursPerDay:10,otherMo:0,protectedBlocks:[]},
  meta:{firstRunISO:new Date().toISOString(),appVersion:"11.0.0",taxDataVersion:"2026.1"}});

function validShapeV6(o){
  if(!o||typeof o!=="object")return false;
  if(o.schema!==SCHEMA)return false;
  for(const k of ["employers","outgoings","goals","shifts","history"])if(!Array.isArray(o[k]))return false;
  if(!o.settings||typeof o.settings!=="object")return false;
  if(!o.meta||typeof o.meta!=="object")return false;
  return true;
}

function migrateV5toV6(v5){
  const out=EMPTY_V6(),wk=mondayISO(new Date());
  // jobs -> employers holding exactly one rate, named after the old role, so a single-rate
  // employer reproduces v5's blended-rate maths exactly (SCOPE f3 regression criterion).
  out.employers=(v5.jobs||[]).map(j=>({id:j.id||uid(),name:j.label||"",pension:+j.pension||0,
    typicalHours:+j.hours||0,rates:[{id:uid(),name:j.label||"Standard",value:+j.wage||0}]}));
  const byJobId={};(v5.jobs||[]).forEach((j,i)=>{byJobId[j.id]=out.employers[i];});
  // credit:false / dated:null rather than absent, so readers never branch on undefined.
  out.outgoings=(v5.bills||[]).map(b=>({id:b.id||uid(),label:b.label||"",amount:+b.amount||0,
    cat:b.cat||"bills",credit:false,dated:null}));
  // goals are unchanged in shape; addedAt backfill is preserved so v9's expiry logic still holds.
  out.goals=(v5.goals||[]).map(g=>({id:g.id||uid(),label:g.label||"",amount:+g.amount||0,
    weeks:+g.weeks||1,addedAt:g.addedAt||Date.now()}));
  // v5 shifts carry no date and no rate reference. They are BY DEFINITION the current unbanked
  // week (newWeek empties the array), so this week's Monday is correct for every shift that can
  // exist in a v5 blob. Rate and employer are snapshotted now, per decision 13, so the migrated
  // history stops depending on a rate card that can later be edited.
  out.shifts=(v5.shifts||[]).map(s=>{
    const emp=byJobId[s.jobId]||out.employers[0]||null,rate=emp&&emp.rates[0]?emp.rates[0]:null;
    return {id:uid(),date:wk,employerId:emp?emp.id:null,employerName:emp?emp.name:"",
      rateId:rate?rate.id:null,rateName:rate?rate.name:"",rateValue:rate?rate.value:0,
      start:s.start||"",end:s.end||"",brk:+s.brk||0};});
  // v5 history dates are locale display strings ("3 Aug") with no year and no locale guarantee --
  // unparseable. Keep the label, set weekStartISO null, let date logic skip legacy rows. Parsing
  // would invent data, and a wrong date in a financial record is worse than a missing one.
  out.history=(v5.history||[]).map(h=>({id:uid(),weekStartISO:null,dateLabel:h.date||"",
    hours:+h.hours||0,net:+h.net||0,coverage:Array.isArray(h.coverage)?h.coverage:[]}));
  const st=v5.settings||{};
  out.settings={country:st.country||"UK",customRate:+st.customRate||20,maxDays:+st.maxDays||6,
    hoursPerDay:+st.hoursPerDay||10,otherMo:+st.otherMo||0,protectedBlocks:[]};
  return out;
}

// Read order: v6 -> migrate v5 -> empty. A blob declaring a HIGHER schema than this build knows is
// refused, left untouched, and reported -- silently downgrading it would destroy data the user
// cannot get back (ARCHITECTURE.md §2, "Defensive read").
function loadV6(){
  try{const r=localStorage.getItem(KEY_V6);
    if(r){const p=JSON.parse(r);
      if(p&&typeof p.schema==="number"&&p.schema>SCHEMA)return{state:null,err:"future"};
      if(validShapeV6(p))return{state:p,err:null};}}catch(e){}
  try{const r5=localStorage.getItem(KEY);
    if(r5){const p5=JSON.parse(r5);if(validShape(p5))return{state:migrateV5toV6(p5),err:null};}}catch(e){}
  return {state:EMPTY_V6(),err:null};
}
function saveV6(state){try{localStorage.setItem(KEY_V6,JSON.stringify(state));}catch(e){}}

let pass=0,fail=0;
function ok(name,cond,extra){ if(cond){pass++;console.log("  PASS  "+name);} else {fail++;console.log("  FAIL  "+name+(extra?"  -> "+JSON.stringify(extra):""));} }

const V5={jobMode:"x",
 jobs:[{id:"j1",label:"Door supervisor",wage:14.25,hours:24,pension:5},{id:"j2",label:"Security guard",wage:13.2,hours:12,pension:0}],
 bills:[{id:"b1",label:"Rent",amount:600,cat:"bills"},{id:"b2",label:"Savings",amount:200,cat:"save"}],
 goals:[{id:"g1",label:"Visa extension",amount:2500,weeks:12,addedAt:1750000000000}],
 shifts:[{jobId:"j2",start:"18:00",end:"02:00",brk:30}],
 history:[{date:"3 Aug",hours:31.5,net:402.11,coverage:[{label:"Rent",state:"covered"}]}],
 settings:{country:"UK",customRate:20,maxDays:6,hoursPerDay:10,otherMo:50}};

console.log("\n1. A real v5 blob migrates and loses nothing");
store["shiftPlanner.v5"]=JSON.stringify(V5);
let r=loadV6(), m=r.state;
ok("shape is valid v6", validShapeV6(m));
ok("2 employers, 1 rate each", m.employers.length===2 && m.employers.every(e=>e.rates.length===1));
ok("rate named after old role, value carried", m.employers[0].rates[0].name==="Door supervisor" && m.employers[0].rates[0].value===14.25);
ok("pension + typicalHours carried", m.employers[0].pension===5 && m.employers[0].typicalHours===24);
ok("outgoings carried, credit:false dated:null", m.outgoings.length===2 && m.outgoings[0].credit===false && m.outgoings[0].dated===null);
ok("goal addedAt preserved exactly", m.goals[0].addedAt===1750000000000);
ok("shift gained a date", /^\d{4}-\d{2}-\d{2}$/.test(m.shifts[0].date));
ok("shift snapshotted the RIGHT employer (j2)", m.shifts[0].employerName==="Security guard" && m.shifts[0].rateValue===13.2);
ok("shift start/end/brk carried", m.shifts[0].start==="18:00" && m.shifts[0].end==="02:00" && m.shifts[0].brk===30);
ok("history label kept, weekStartISO null", m.history[0].dateLabel==="3 Aug" && m.history[0].weekStartISO===null);
ok("history figures + coverage carried", m.history[0].net===402.11 && m.history[0].coverage.length===1);
ok("settings carried + protectedBlocks reserved", m.settings.otherMo===50 && Array.isArray(m.settings.protectedBlocks));
ok("v5 blob NOT deleted (rollback path)", store["shiftPlanner.v5"]!=null);

console.log("\n2. A blob from the future is refused, not destroyed");
store["shiftPlanner.v6"]=JSON.stringify({schema:7,employers:[],outgoings:[],goals:[],shifts:[],history:[],settings:{},meta:{}});
const before=store["shiftPlanner.v6"];
r=loadV6();
ok("refused: state null, err 'future'", r.state===null && r.err==="future");
ok("blob left byte-identical", store["shiftPlanner.v6"]===before);

console.log("\n3. Malformed storage fails safe");
for(const [name,val] of [["truncated JSON",'{"schema":6,"employers":[' ],["empty string",""],["null literal","null"],["hand-edited: employers not an array",'{"schema":6,"employers":{},"outgoings":[],"goals":[],"shifts":[],"history":[],"settings":{},"meta":{}}'],["wrong schema number",'{"schema":3,"employers":[],"outgoings":[],"goals":[],"shifts":[],"history":[],"settings":{},"meta":{}}']]){
  store["shiftPlanner.v6"]=val; delete store["shiftPlanner.v5"];
  let out=null,threw=false;
  try{out=loadV6();}catch(e){threw=true;}
  ok(name+" -> no throw, empty v6 returned", !threw && out && validShapeV6(out.state) && out.state.employers.length===0);
}

console.log("\n4. Round-trips");
delete store["shiftPlanner.v6"]; store["shiftPlanner.v5"]=JSON.stringify(V5);
const mig=loadV6().state;
const rt=JSON.parse(JSON.stringify(mig));
ok("v6 survives JSON round-trip", validShapeV6(rt) && JSON.stringify(rt)===JSON.stringify(mig));
saveV6(mig); delete store["shiftPlanner.v5"];
const reread=loadV6().state;
ok("saved v6 is read back, not re-migrated", validShapeV6(reread) && reread.employers.length===2);
ok("a v5 EXPORT still migrates (import path)", validShapeV6(migrateV5toV6(JSON.parse(JSON.stringify(V5)))));

console.log("\n5. Degenerate inputs");
ok("empty v5 blob migrates to empty v6", validShapeV6(migrateV5toV6({jobs:[],bills:[],goals:[],shifts:[],history:[],settings:{}})));
const orphan=migrateV5toV6({jobs:[],bills:[],goals:[],shifts:[{jobId:"gone",start:"09:00",end:"17:00",brk:0}],history:[],settings:{}});
ok("shift with no matching job does not crash", orphan.shifts.length===1 && orphan.shifts[0].employerId===null && orphan.shifts[0].rateValue===0);
ok("mondayISO returns a Monday", (()=>{const d=new Date(mondayISO(new Date())+"T12:00:00");return d.getDay()===1;})());

console.log("\n"+pass+" passed, "+fail+" failed");
if(fail) process.exitCode=1;
