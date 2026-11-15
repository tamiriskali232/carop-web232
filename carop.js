// CarOp app logic (screens, simulation, scoring, skill tasks, test checkout).
// It draws into the #app, #corner and #modal containers rendered by App.jsx.
// ---------- Data ----------
// ---------- Pixel avatars: one chibi sprite grid, six palettes ----------
const BASE = {H:"#1b1416",h:"#3d2f35",S:"#f6d9c4",P:"#f0a0a0",W:"#ffffff",w:"#c9c9d6",O:"#17151a",o:"#2e2b33",G:"#e8b04a",K:"#f4f4f8",k:"#d9d9e4",B:"#16141a",b:"#8a8a99",E:"#2b1d1a",e:"#ffffff",M:"#c46a6a"};
const AV = [{},
 {H:"#4a2a1c",h:"#70452f",W:"#f8a8cb",w:"#d985ad",O:"#e98fb7",o:"#f8a8cb",G:"#fff3b0",K:"#1c1820",k:"#34303b"},
 {H:"#1c2a55",h:"#3a58a8",S:"#e7bf9f",W:"#9ae8ff",w:"#63bdd6",O:"#6f5bb5",o:"#8c79cf",K:"#e9e2ff",k:"#c9c0ee",B:"#2a2350"},
 {H:"#d9a441",h:"#f2cb70",S:"#d9a77c",W:"#ff9d5c",w:"#d97a3a",O:"#c98a1d",o:"#e2a63a",K:"#2a2a33",k:"#44444f",B:"#3a2a1c"},
 {H:"#3fc4a0",h:"#8ee9cf",S:"#8f5d3f",P:"#d9776b",O:"#1f8a7a",o:"#2fa593",K:"#b69cf0",k:"#9577d9"},
 {H:"#b8282f",h:"#e0525a",W:"#26262b",w:"#4a4a52",O:"#6c6c78",o:"#8a8a96",K:"#26262b",k:"#3d3d47",B:"#26262b"}
].map(p=>Object.assign({},BASE,p));
const GW = 24, GH = 36;
function grid(){
  const g = Array.from({length:GH},()=>Array(GW).fill(""));
  const px = (x,y,c)=>{g[y][x]=c}, rc = (x,y,w,h,c)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)px(x+i,y+j,c)};
  // long wavy hair behind the body
  rc(5,3,14,6,"H"); rc(3,8,18,19,"H");
  for(let x=3;x<21;x++) px(x,27+(x%4<2?1:0),"H");
  for(let y=10;y<27;y++) if(y%4<2){px(2,y,"H");px(21,y,"H")}
  [[5,12],[18,16],[4,20],[19,22],[6,24],[17,25]].forEach(([x,y])=>px(x,y,"h"));
  // legs and chunky boots
  rc(9,30,2,2,"S"); rc(13,30,2,2,"S");
  rc(8,32,4,4,"B"); rc(13,32,4,4,"B"); rc(7,35,5,1,"B"); rc(13,35,5,1,"B");
  [[8,33],[11,34],[13,33],[16,34]].forEach(([x,y])=>px(x,y,"b"));
  // pleated skirt
  rc(7,26,10,2,"K"); rc(6,28,12,1,"K");
  for(let x=6;x<18;x++) px(x,29,x%2?"K":"k");
  // hoodie, sleeves, hands, laces
  rc(7,19,10,7,"O"); rc(8,19,8,1,"o"); rc(9,25,6,1,"o");
  rc(5,20,2,7,"O"); rc(17,20,2,7,"O"); rc(5,26,2,1,"o"); rc(17,26,2,1,"o");
  rc(5,27,2,1,"S"); rc(17,27,2,1,"S");
  [20,22,24].forEach(y=>{px(10,y,"G");px(13,y,"G")});
  [[11,21],[12,21],[11,23],[12,23]].forEach(([x,y])=>px(x,y,"o"));
  // head: face, neck, bangs, eyes, blush, mouth
  rc(11,18,2,1,"S"); rc(8,9,8,8,"S"); rc(9,17,6,1,"S");
  rc(6,5,12,4,"H"); rc(6,9,2,7,"H"); rc(16,9,2,7,"H"); rc(8,9,2,1,"H"); rc(14,9,2,1,"H"); px(11,8,"S"); px(12,8,"S");
  [9,10,13,14].forEach(x=>px(x,11,"E")); rc(9,12,2,2,"E"); rc(13,12,2,2,"E"); px(9,12,"e"); px(13,12,"e");
  [8,9,14,15].forEach(x=>px(x,14,"P")); px(11,15,"M"); px(12,15,"M");
  // headphones
  rc(7,2,10,1,"W"); rc(7,3,10,1,"w"); px(6,3,"W"); px(17,3,"W"); rc(5,4,2,4,"W"); rc(17,4,2,4,"W");
  rc(4,8,3,6,"W"); rc(4,8,1,6,"w"); rc(17,8,3,6,"W"); rc(19,8,1,6,"w");
  return g;
}
let GRID;
// Draws avatar i as crisp SVG; head=true crops to the head for small chat icons
function av(i,cls,head){
  const p = AV[i], g = GRID || (GRID = grid()); let r = "";
  g.forEach((row,y)=>{ let x=0; while(x<GW){ const c=row[x]; if(!c){x++;continue} let n=1; while(x+n<GW&&row[x+n]===c) n++; r+=`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${p[c]}"/>`; x+=n } });
  return `<svg class="av ${cls||""}" viewBox="${head?"2 1 20 19":"0 0 24 36"}" shape-rendering="crispEdges" role="img" aria-label="Avatar ${i+1}">${r}</svg>`;
}
const CAREERS = [{id:"pm",n:"Project Manager"},{id:"csm",n:"Customer Success Manager"},{id:"da",n:"Data Analyst"}];
// Three free Project Manager scenarios; ctx feeds the boss prompt
const SC = [
 {title:"Deadline moved up",blurb:"The client wants it 3 days earlier.",ctx:"the client moved the deadline up 3 days and the team is stretched",open:"Hey, quick one. The client just moved the deadline up 3 days and the team is already stretched. Reply with your plan."},
 {title:"Budget cut",blurb:"Finance trims 20% mid-project.",ctx:"finance just cut the project budget by 20% and the client has not been told yet",open:"Heads up: finance just cut our project budget by 20% and the client doesn’t know yet. Reply with how you’d handle it."},
 {title:"Key person quits",blurb:"Your lead developer resigns.",ctx:"the lead developer just resigned and launch is in two weeks",open:"Bad news: our lead developer just resigned and launch is in two weeks. Reply with your plan."}];
const FRICTION = {
  2:"Change priorities: add a new urgent demand that conflicts with their plan.",
  3:"Give vague feedback such as \"this doesn’t feel quite right\" without saying why.",
  4:"Be passive-aggressive (for example \"sure, if that’s the best we can do\").",
  5:"Bring a coworker conflict: a teammate named Marcus is complaining he is overloaded and blames them. Ask how they will handle it."};
const STYLES = [
  ["Calm & structured","Thanks for the heads-up, I understand the pressure. Here’s my plan: first I’ll "],
  ["Direct & assertive","Understood. I’ll re-prioritize today. First, "],
  ["Empathetic & collaborative","I hear you, and I know the team is stretched. Let’s "]];
const SKILLS = [["emotional_tolerance","Emotional Tolerance"],["communication_clarity","Communication Clarity"],["problem_solving","Problem Solving"],["composure","Composure Under Pressure"]];
const S = {view:"home",av:0,picked:false,role:"pm",pay:null,sc:0,msgs:[],turn:1,stress:20,replies:[],busy:false,t0:0,err:null,res:null};
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// ---------- Live LLM access: calls our serverless functions (the API key stays on the server) ----------
async function llm(json, prompt){
  const r = await fetch(json ? "/api/score" : "/api/boss", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt})});
  if(!r.ok) throw new Error("AI request failed");
  const d = await r.json();
  return json ? d.json : d.text;
}
const transcript = () => S.msgs.map(m=>(m.role==="boss"?"Boss: ":"Employee: ")+m.text).join("\n");

// ---------- Code-measured signals ----------
function signals(r){
  const w = r.text.trim().split(/\s+/).length;
  const len = w<20 ? w/20 : w<=70 ? 1 : Math.max(.5,1-(w-70)/100);
  const ack = /\b(understand|hear you|i hear|appreciate|sorry|thanks|thank you|got it|i see|makes sense|fair|totally|pressure|stretched|frustrat)/i.test(r.text);
  const step = /\b(i.?ll|i will|let.?s|first|then|next|today|tomorrow|tonight|schedule|assign|send|update|sync|meeting|prioriti[sz]e|call)\b/i.test(r.text);
  const shout = (r.text.match(/\b[A-Z]{3,}\b/g)||[]).length>=2 || /!{3,}/.test(r.text);
  const time = (r.secs<=120?1:Math.max(.4,1-(r.secs-120)/300)) * (shout?.7:1);
  return {w,len,ack,step,time};
}

// ---------- Views ----------
const nav = () => `<div class="nav"><span class="logo" onclick="go('home')">CarOp</span><span class="mut" style="cursor:pointer;margin-right:64px" onclick="goPricing()">Pricing</span></div>`;
const bubbles = () => `<i class="bub b1"></i><i class="bub b2"></i><i class="bub b3"></i>`;

function home(){return `${nav()}
<section class="sec">${bubbles()}<div class="wrap">
<h1>Career Opportunities</h1>
<p style="font-size:22px;max-width:560px">Live through and decide</p>
<p class="mut" style="max-width:560px">Find out if you’d hate a career before you spend thousands of dollars and months studying it.</p>
<p class="mut" style="margin:0 0 8px">Tap an avatar to make it yours</p><div class="row" style="margin:4px 0 22px">${AV.map((p,i)=>`<button class="avb ${S.picked&&i===S.av?"sel":""}" aria-label="Avatar ${i+1}" onclick="pick(${i})">${av(i)}</button>`).join("")}</div>
<button class="btn" onclick="go('select')">Try a free simulation</button></div></section>
<section class="sec"><div class="wrap"><h2>How it works</h2>
<div class="steps"><div class="stp"><div class="dot"></div><b>Select Role</b></div><div class="stp"><div class="dot"></div><b>Survive the Boss</b></div><div class="stp"><div class="dot"></div><b>Get Scored</b></div></div>
<div class="grid g3"><div class="card">Pick an avatar and a career to test.</div><div class="card">Handle a live AI boss over 5 turns of rising pressure.</div><div class="card">See four scores and whether the job fits you.</div></div></div></section>
<section class="sec" id="pricing"><div class="wrap"><h2>Pricing</h2><p class="mut">Tap a plan to check out. Test mode, no real money.</p><div class="grid g3">
<div class="card" style="cursor:pointer" onclick="openPay('free')"><h3>Freemium Hook</h3><p><b>1 free</b> role simulation</p></div>
<div class="card" style="cursor:pointer" onclick="openPay('role')"><h3>Pay-Per-Role</h3><p><b>$4.99</b> per career module</p></div>
<div class="card" style="cursor:pointer" onclick="openPay('pass')"><h3>Pivot Pass</h3><p><b>$14.99</b> per month, unlimited simulations, cancel anytime</p></div></div></div></section>
<footer class="mut">CarOp is a simulation for self-exploration, not professional career advice.</footer>`}

function select(){return `${nav()}<section class="sec">${bubbles()}<div class="wrap">
<div class="steps"><div class="stp"><div class="dot"></div><b class="p">Select Role</b></div><div class="stp"><div class="dot" style="opacity:.4"></div>Survive the Boss</div><div class="stp"><div class="dot" style="opacity:.4"></div>Get Scored</div></div>
<h2>Choose your avatar</h2><div class="row" style="margin-bottom:30px">${AV.map((p,i)=>`<button class="avb ${i===S.av?"sel":""}" aria-label="Avatar ${i+1}" onclick="pick(${i})">${av(i)}</button>`).join("")}</div>
<h2>Choose a career</h2><div class="grid g3">${CAREERS.map(c=>{const ok=has(c.id);return `<div class="card" style="cursor:pointer;${ok&&S.role===c.id?"background:rgba(248,168,203,.35)":""}" onclick="${ok?`S.role='${c.id}';render()`:`openPay('role','${c.id}')`}"><h3>${c.n}</h3><p class="mut">${ok?(c.id==="pm"?"Free":"Unlocked"):"🔒 Locked · tap to unlock"}</p></div>`}).join("")}</div>
<div style="display:${S.role==="pm"?"block":"none"}"><h2 style="margin-top:30px">Pick a free scenario</h2><div class="grid g3">${SC.map((s,i)=>`<div class="card" style="cursor:pointer;${i===S.sc?"background:rgba(248,168,203,.2)":""}" onclick="S.sc=${i};render()"><h3>${s.title}</h3><p class="mut">${s.blurb}</p></div>`).join("")}</div>
</div><p style="margin-top:24px"><span class="row">${S.role==="pm"?`<button class="btn" onclick="start()">Start AI boss simulation</button>`:""}<button class="btn alt" onclick="go('levels')">Career tasks: ${CAREERS.find(c=>c.id===S.role).n}</button></span></p></div></section>`}

function chat(){
  const lastBoss = S.msgs.length && S.msgs[S.msgs.length-1].role==="boss";
  const can = lastBoss && !S.busy && !S.err;
  return `<div class="hud"><div class="row" style="justify-content:space-between"><b>Turn ${Math.min(S.turn,5)} of 5</b><span class="mut">Stress ${Math.round(S.stress)}%</span></div><div class="meter"><i style="width:${S.stress}%"></i></div></div>
<div class="chat">${S.msgs.map(m=>m.role==="boss"
  ?`<div class="msg boss"><span class="orb sm" style="--c:#ff4fa0"></span><div class="bx">${esc(m.text)}</div></div>`
  :`<div class="msg me"><div class="bx">${esc(m.text)}</div>${av(S.av,"sm",true)}</div>`).join("")}
${S.busy?`<div class="msg boss"><span class="orb sm" style="--c:#ff4fa0"></span><div class="bx dots"><span>●</span><span>●</span><span>●</span></div></div>`:""}
${S.err?errBox():""}</div>
<div class="dock"><div class="in"><div class="chips">${STYLES.map((s,i)=>`<button class="chip" onclick="fill(${i})">${s[0]}</button>`).join("")}</div>
<div class="send"><textarea id="inp" rows="2" placeholder="Type your reply…" ${can?"":"disabled"}></textarea><button class="btn" ${can?"":"disabled"} onclick="send()">Send</button></div></div></div>`}

const errBox = () => `<div class="card" style="margin:16px 0"><h3>Something went wrong</h3><p>We couldn’t reach the AI just now. Nothing was lost.</p><button class="btn" onclick="retry()">Retry</button></div>`;

function results(){
  const r = S.res;
  return `${nav()}<section class="sec">${bubbles()}<div class="wrap">
<h2>Your results</h2><p><span class="badge">${r.fit}</span> <span class="mut">Overall ${r.avg}/100</span></p>
<p style="font-size:18px">${r.verdict}</p>
<div class="card">${r.scores.map(s=>`<div class="row" style="justify-content:space-between"><b>${s.name}</b><b class="p">${s.v}</b></div><div class="bar"><i style="width:${s.v}%"></i></div>`).join("")}</div>
<h3 style="margin-top:28px">What shaped your score</h3>${r.quotes.map(q=>`<blockquote><b>${q.tag}</b> (turn ${q.turn}): “${esc(q.text)}”<br><small>${esc(q.reason)}</small></blockquote>`).join("")}
<div class="card" style="margin-top:22px"><h3>How we scored</h3><small>Each skill = 75% AI rating of your replies (1–5, converted to 0–100) + 25% code-measured signals. Emotional Tolerance: how often you acknowledged the boss’s concern. Clarity: reply length (about 20–70 words is ideal). Problem Solving: how often you proposed a concrete next step. Composure: response time and no shouting. Strong fit: average 70+ with no score under 50. Possible fit: average 50+. Otherwise: Probably not for you.</small></div>
<p style="margin-top:24px" class="row"><button class="btn" onclick="start()">Play again</button><button class="btn alt" onclick="go('select')">Try another scenario</button><button class="btn alt" onclick="go('home')">Back to home</button></p></div></section>
<footer class="mut">CarOp is a simulation for self-exploration, not professional career advice.</footer>`}

function render(){
  const v = {home,select,chat,results,levels,task}[S.view];
  $("#app").innerHTML = v();
  // Chosen avatar floats in the top-right corner; rebuilt only when the choice changes so it keeps bobbing smoothly
  const ck = (S.picked||S.view!=="home") ? S.av : -1;
  if(ck!==S.ck){ S.ck = ck; $("#corner").innerHTML = ck<0 ? "" : `<div class="cav">${av(ck,"",true)}</div>`; }
  if(S.view==="chat") window.scrollTo(0,document.body.scrollHeight);
}
function pick(i){S.av=i;S.picked=true;render()}
function go(v){S.view=v;S.err=null;render();window.scrollTo(0,0)}

// ---------- Simulation flow ----------
function start(){
  Object.assign(S,{view:"chat",msgs:[{role:"boss",text:SC[S.sc].open}],turn:1,stress:20,replies:[],busy:false,err:null,t0:Date.now()});
  render();
}
function fill(i){const t=$("#inp");if(t&&!t.disabled){t.value=STYLES[i][1];t.focus()}}

function send(){
  const t = $("#inp"), text = t.value.trim();
  if(!text) return;
  const r = {text, secs:(Date.now()-S.t0)/1000};
  S.replies.push(r); S.msgs.push({role:"me",text});
  // Stress rises with the boss's friction and falls when the user acknowledges and proposes a step
  const g = signals(r), fr = [8,12,16,18,20][S.turn-1];
  S.stress = Math.max(5,Math.min(100,S.stress+fr+(g.w<8?8:0)+(g.ack?-6:3)+(g.step?-6:0)));
  if(S.turn===5){ score(); return; }
  S.turn++; bossReply();
}

async function bossReply(){
  S.busy=true; S.err=null; S.retry=bossReply; render();
  try{
    const text = (await llm(false,
`You are Dana, a demanding but realistic project director chatting on Slack with a Project Manager trainee. Scenario: ${SC[S.sc].ctx}. This is your message ${S.turn} of 5.
Required friction for this message: ${FRICTION[S.turn]}
React specifically to what the employee just wrote (acknowledge a good point briefly, press on weak ones). Max 55 words, casual Slack tone, no stage directions, no markdown. Output only the message.

Conversation so far:
${transcript()}`)).trim();
    S.msgs.push({role:"boss",text}); S.t0=Date.now();
  }catch(e){ S.err=true }
  S.busy=false; render();
}

async function score(){
  S.busy=true; S.err=null; S.retry=score; render();
  try{
    const j = await llm(true,
`You are an objective workplace-skills rater. Below is a Slack chat between a boss and an employee (a Project Manager trainee). Rate ONLY the employee's reply in each of the 5 turns, in order.
For each turn give integer ratings 1-5 (1=poor, 5=excellent) for: emotional_tolerance (stays level under friction), communication_clarity, problem_solving (concrete, workable plan), composure (calm, professional tone). Add "reason": one sentence about that reply.
Return STRICT JSON only, no prose, no markdown, exactly this shape:
{"turns":[{"emotional_tolerance":3,"communication_clarity":3,"problem_solving":3,"composure":3,"reason":"..."}, ... 5 items]}

Chat:
${transcript()}`);
    S.res = compute(j); S.view="results";
  }catch(e){ S.err=true }
  S.busy=false; render();
}

// ---------- Scoring formula (all in code) ----------
function compute(j){
  const T = j && j.turns;
  if(!Array.isArray(T)||T.length!==5) throw new Error("bad shape");
  T.forEach(t=>{SKILLS.forEach(([k])=>{if(!Number.isInteger(t[k])||t[k]<1||t[k]>5) throw new Error("bad rating")});if(typeof t.reason!=="string") throw new Error("bad reason")});
  const G = S.replies.map(signals), mean = a=>a.reduce((x,y)=>x+y,0)/a.length;
  const sig = {
    emotional_tolerance: mean(G.map(g=>g.ack?1:0)),
    communication_clarity: mean(G.map(g=>g.len)),
    problem_solving: mean(G.map(g=>g.step?1:0)),
    composure: mean(G.map(g=>g.time))};
  const scores = SKILLS.map(([k,name])=>{
    const llmPart = (mean(T.map(t=>t[k]))-1)/4*100;
    return {name, v:Math.round(.75*llmPart+.25*sig[k]*100)};
  });
  const avg = Math.round(mean(scores.map(s=>s.v)));
  const min = Math.min(...scores.map(s=>s.v));
  const fit = avg>=70&&min>=50 ? "Strong fit" : avg>=50 ? "Possible fit" : "Probably not for you";
  const top = [...scores].sort((a,b)=>b.v-a.v)[0], low = [...scores].sort((a,b)=>a.v-b.v)[0];
  const verdict = fit==="Strong fit" ? `You kept your cool and gave clear, workable answers under pressure. ${top.name} was your strongest area. Project management looks like a realistic option for you.`
    : fit==="Possible fit" ? `You handled parts of the pressure well, especially ${top.name.toLowerCase()}, but ${low.name.toLowerCase()} slipped when things got tense. This job could work if you build that skill.`
    : `The pressure hit hard, and ${low.name.toLowerCase()} was your toughest spot. Day-to-day project management would likely feel draining right now.`;
  // Quotes: best, worst and a third turn, using the AI's per-turn rating
  const tm = T.map((t,i)=>({i,m:mean(SKILLS.map(([k])=>t[k]))}));
  const order = [...tm].sort((a,b)=>b.m-a.m), pick = [order[0],order[order.length-1],order[1]];
  const seen = new Set(), quotes = [];
  pick.forEach(p=>{ if(seen.has(p.i)) return; seen.add(p.i);
    let q = S.replies[p.i].text; if(q.length>150) q=q.slice(0,147)+"…";
    quotes.push({turn:p.i+1,text:q,reason:T[p.i].reason,tag:p.m>=3.5?"Helped you":p.m<=2.5?"Hurt you":"Mixed"}); });
  return {scores,avg,fit,verdict,quotes};
}
function retry(){ S.retry && S.retry(); }

// ---------- Skill levels: one task per PM skill, unlocked in order (score 60+ to advance) ----------
const LV = [
 {skill:"Prioritization",type:"rank",title:"Rank today’s tasks",prompt:"A project is due Friday. Tap these in the order you would do them, first to last.",
  items:["Fix the bug blocking the client demo","Reply to a vendor’s pricing email","Update the team wiki","Prepare Friday’s client status report"],answer:[0,3,1,2]},
 {skill:"Risk Management",type:"choice",title:"Handle the risk",prompt:"A key supplier says delivery may slip by a week. What do you do first?",
  opts:["Wait and see, it may not happen","Size the impact, line up a backup supplier and warn stakeholders early","Tell the client the project is delayed","Add overtime for the whole team"],pts:[10,100,40,25],
  why:"Strong PMs size the risk, prepare a fallback and communicate early before committing to a delay or costly fixes."},
 {skill:"Scheduling",type:"number",title:"Find the shortest timeline",
  prompt:"Task A takes 2 days. Task B takes 3 days and starts after A. Task C takes 4 days and runs alongside A and B. Task D takes 2 days and starts only after both B and C finish. What is the minimum number of days for the whole project?",
  answer:7,why:"The longest path is A, B, then D: 2 + 3 + 2 = 7 days. C finishes at day 4, before B at day 5."},
 {skill:"Stakeholder Communication",type:"write",title:"Calm an angry client",
  prompt:"The client emails: “This is the second delay. I’m losing trust in this project.” Write your reply in 2-5 sentences."},
 {skill:"Conflict Resolution",type:"write",title:"Two teammates, one problem",
  prompt:"Priya and Marcus both claim the same task and blame each other for missed work. Write what you say to them in 2-5 sentences."}];
// Task sets for the other two careers (same level mechanics as Project Manager)
const LV_CSM = [
 {skill:'Onboarding Prioritization',type:'rank',title:'Order the first-week actions',prompt:'A new customer just signed. Tap these in the order you would do them, first to last.',
  items:['Book a kickoff call with the customer','Review their contract and success goals','Answer a low-priority feature request','Write the monthly newsletter'],answer:[1,0,2,3]},
 {skill:'Churn Risk',type:'choice',title:'Spot the warning sign',prompt:'A customer’s product logins dropped 60% this month. What do you do first?',
  opts:['Nothing, usage always fluctuates','Reach out, ask what changed and offer a tailored training session','Offer a big discount right away','Send the same newsletter as everyone else'],pts:[10,100,35,20],
  why:'Good CSMs find the cause with a personal, helpful touch before reaching for discounts.'},
 {skill:'Retention Math',type:'number',title:'Calculate churn',prompt:'You start the quarter with 200 customers and 5 cancel. What is the churn rate as a percentage?',answer:2.5,why:'5 ÷ 200 = 0.025, which is 2.5%.'},
 {skill:'Handling Escalations',type:'write',title:'Calm an angry customer',prompt:'A customer writes: “The product has been down twice this week. I want a refund.” Write your reply in 2-5 sentences.'},
 {skill:'Expansion',type:'write',title:'Suggest an upgrade',prompt:'A happy customer has hit their seat limit. Write a short message that suggests an upgrade without being pushy (2-5 sentences).'}];
const LV_DA = [
 {skill:'Excel',type:'number',title:'Read the formula',prompt:'Cells A1:A5 hold 12, 8, 25, 9 and 36. What does =SUMPRODUCT((A1:A5>10)*A1:A5) return?',answer:73,why:'Only values above 10 count: 12 + 25 + 36 = 73.'},
 {skill:'SQL',type:'choice',title:'Total per customer',prompt:'Table orders(customer, amount). Which query lists customers whose total spend is over 500?',
  opts:['SELECT customer FROM orders WHERE SUM(amount) > 500','SELECT customer, SUM(amount) FROM orders GROUP BY customer HAVING SUM(amount) > 500','SELECT customer FROM orders ORDER BY amount > 500','SELECT SUM(amount) FROM orders WHERE customer > 500'],pts:[20,100,0,0],
  why:'Aggregates are filtered with HAVING after GROUP BY. WHERE cannot use SUM().'},
 {skill:'Power BI Visuals',type:'choice',title:'Pick the right chart',prompt:'Your manager wants to see how monthly revenue changed over two years. Which visual fits best?',
  opts:['Pie chart','Line chart','Map','Plain text card'],pts:[15,100,5,25],why:'Trends over time are clearest in a line chart.'},
 {skill:'Power BI DAX',type:'choice',title:'Compare to last year',prompt:'Which DAX measure returns revenue for the same period last year?',
  opts:['CALCULATE([Revenue], SAMEPERIODLASTYEAR(Date[Date]))','SUM([Revenue]) - 1','[Revenue] * LASTYEAR()','FILTER([Revenue], YEAR() - 1)'],pts:[100,0,0,10],
  why:'CALCULATE with SAMEPERIODLASTYEAR shifts the date filter back one year.'},
 {skill:'Insight Storytelling',type:'write',title:'Explain the drop',prompt:'Sales fell 12% in March versus February, right after a price increase. Write 2-4 sentences for the VP of Sales: what you found and what you recommend.'}];
const LVS = {pm:LV,csm:LV_CSM,da:LV_DA};
const LK = "carop_levels";

// ---------- Pricing, simulated test checkout and role unlocks ----------
const PLANS = {
 free:{n:'Freemium Hook',price:0,txt:'1 free role simulation'},
 role:{n:'Pay-Per-Role',price:4.99,txt:'$4.99 per career module'},
 pass:{n:'Pivot Pass',price:14.99,txt:'$14.99 per month, unlimited simulations, cancel anytime'}};
const UK = 'carop_unlocked';
let UL = {roles:[],pass:0};
try{ Object.assign(UL, JSON.parse(localStorage.getItem(UK))||{}) }catch(e){}
const has = id => id==='pm' || UL.roles.includes(id) || UL.pass>Date.now();
const rname = id => CAREERS.find(c=>c.id===id).n;
function openPay(plan,role){
  S.pay = {plan,role:role||null,done:''};
  if(plan==='role' && !S.pay.role) S.pay.role = ['csm','da'].find(r=>!has(r)) || null;
  drawPay();
}
function closePay(){ S.pay=null; drawPay() }
function goPass(){ openPay('pass') }
function setRole(r){ S.pay.role=r; drawPay() }
function startFree(){ closePay(); go('select') }
function useRole(){ const r=S.pay.role; closePay(); S.role=r; go('select') }
function goPricing(){ if(S.view!=='home'){S.view='home';render()} const e=$('#pricing'); if(e) e.scrollIntoView({behavior:'smooth'}) }
function fmtCard(e){ e.value = e.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim() }
function fmtExp(e){ let v=e.value.replace(/\D/g,'').slice(0,4); if(v.length>2) v=v.slice(0,2)+'/'+v.slice(2); e.value=v }
function drawPay(){
  const P=S.pay, m=$('#modal'); if(!P){ m.innerHTML=''; return }
  const pl=PLANS[P.plan]; let body;
  if(P.done) body = `<h3>Payment successful</h3><p>${P.done}</p><button class='btn' onclick='${P.plan==="role"?"useRole()":"closePay()"}'>${P.plan==='role'?'Open it now':'Continue'}</button>`;
  else if(P.plan==='free') body = `<p>No card needed. Try the Project Manager simulation and tasks for free.</p><button class='btn' onclick='startFree()'>Start free</button>`;
  else {
    const opts = ['csm','da'].filter(r=>!has(r));
    const pickRole = P.plan==='role' ? (opts.length ? `<p class='mut' style='margin:0 0 6px'>Choose a career module</p><div class='row' style='margin-bottom:12px'>${opts.map(r=>`<button class='chip ${P.role===r?'on':''}' data-r='${r}' onclick='setRole(this.dataset.r)'>${rname(r)}</button>`).join('')}</div>` : `<p>You already unlocked every career.</p>`) : '';
    body = `${pickRole}<p class='note'><b>Simulated checkout (test mode).</b><br>Test mode: use card 4242 4242 4242 4242, any future date, any CVC. No real money is charged.</p>
<label>Card number<input class='f' id='cn' inputmode='numeric' autocomplete='off' placeholder='4242 4242 4242 4242' maxlength='19' oninput='fmtCard(this)'></label>
<div class='row' style='align-items:flex-start'><label style='flex:1'>Expiry date<input class='f' id='ex' autocomplete='off' placeholder='MM/YY' maxlength='5' oninput='fmtExp(this)'></label><label style='flex:1'>CVC<input class='f' id='cv' inputmode='numeric' autocomplete='off' placeholder='CVC' maxlength='4'></label></div>
<p id='perr' style='color:#b3261e;margin:0 0 10px'></p>
<button class='btn' style='width:100%' ${P.plan==='role'&&!P.role?'disabled':''} onclick='pay()'>Pay $${pl.price.toFixed(2)}</button>
${P.plan==='role'?`<p class='mut' style='text-align:center'>Want everything? <span class='p' style='cursor:pointer;text-decoration:underline' onclick='goPass()'>Get the Pivot Pass</span></p>`:''}`;
  }
  m.innerHTML = `<div class='ov' onclick='if(event.target===this)closePay()'><div class='card mdl'><button class='xb' onclick='closePay()' aria-label='Close'>×</button><h3>${pl.n}</h3><p style='margin-top:0'>${pl.txt}</p><p class='mut'>Find out if you’d hate a career before you spend thousands of dollars and months studying it.</p>${body}</div></div>`;
}
// Test card only; nothing is charged and card details are never stored
function pay(){
  const P=S.pay, cn=$('#cn').value.replace(/\s/g,''), ex=$('#ex').value, cv=$('#cv').value, m=/^(\d\d)\/(\d\d)$/.exec(ex);
  let err='';
  if(cn!=='4242424242424242') err='Test mode: please use card 4242 4242 4242 4242.';
  else if(!m||+m[1]<1||+m[1]>12||new Date(2000+ +m[2],+m[1],1)<=new Date()) err='Enter a future expiry date as MM/YY.';
  else if(!/^\d{3,4}$/.test(cv)) err='Enter a 3 or 4 digit CVC.';
  if(err){ $('#perr').textContent=err; return }
  if(P.plan==='role'){ if(!P.role) return; if(!UL.roles.includes(P.role)) UL.roles.push(P.role); P.done = rname(P.role)+' is unlocked.'; }
  else { UL.pass = Date.now()+30*864e5; P.done = 'Pivot Pass is active for 30 days. Every career is unlocked.'; }
  try{ localStorage.setItem(UK,JSON.stringify(UL)) }catch(e){}
  drawPay(); render();
}
try{ const r = JSON.parse(localStorage.getItem(LK))||{}; S.prog = Array.isArray(r) ? {pm:r} : r }catch(e){ S.prog = {} }
const best = i => { const a = S.prog[S.role]||[]; return a[i]==null ? -1 : a[i] };
const unlocked = i => i===0 || best(i-1)>=60;

function levels(){return `${nav()}<section class="sec">${bubbles()}<div class="wrap"><h2>Skill levels</h2>
<p class="mut">${CAREERS.find(c=>c.id===S.role).n}: ${LVS[S.role].length} short tasks, each testing one real skill. Score 60+ to unlock the next level.</p>
<div class="grid">${LVS[S.role].map((l,i)=>`<div class="card ${unlocked(i)?"":"lock"}" ${unlocked(i)?`style="cursor:pointer" onclick="openLv(${i})"`:""}><div class="row" style="justify-content:space-between"><h3 style="margin:0">Level ${i+1}: ${l.skill}</h3><b class="p">${best(i)>=0?best(i)+"/100":unlocked(i)?"Play":"🔒"}</b></div><p class="mut" style="margin:6px 0 0">${l.title}</p></div>`).join("")}</div>
<p><button class="btn alt" onclick="go('select')">Back</button></p></div></section>`}

function openLv(i){ Object.assign(S,{view:"task",li:i,order:[],pick:null,lres:null,draft:"",err:null,busy:false}); render(); window.scrollTo(0,0) }

function task(){
  const L = LVS[S.role][S.li], r = S.lres; let body = "";
  if(L.type==="rank") body = `<ol>${S.order.map(i=>`<li>${L.items[i]}</li>`).join("")}</ol><div class="row">${L.items.map((t,i)=>S.order.includes(i)?"":`<button class="chip" style="font-size:15px" onclick="S.order.push(${i});render()">${t}</button>`).join("")}</div>${S.order.length?`<p><button class="chip" onclick="S.order=[];render()">Reset order</button></p>`:""}`;
  if(L.type==="choice") body = L.opts.map((o,i)=>`<div class="card" style="margin:10px 0;cursor:pointer;${S.pick===i?"background:rgba(248,168,203,.2)":""}" onclick="S.pick=${i};render()">${o}</div>`).join("");
  if(L.type==="number") body = `<input id="ans" type="number" step="any" inputmode="decimal" placeholder="Your answer" style="width:140px;min-height:48px;border-radius:18px;border:1.5px solid var(--pink);background:#fff;color:#2B1424;padding:0 14px;font:300 16px Sora,sans-serif">`;
  if(L.type==="write") body = `<textarea id="ans" rows="5" style="width:100%;box-sizing:border-box" placeholder="Type your reply (at least 8 words)…">${esc(S.draft||"")}</textarea>`;
  const res = r ? `<div class="card" style="margin-top:20px"><h3>${r.sc>=60?"Level passed":"Not yet"}: ${r.sc}/100</h3><p>${esc(r.note)}</p><div class="row">${r.sc>=60&&S.li<LVS[S.role].length-1?`<button class="btn" onclick="openLv(${S.li+1})">Next level</button>`:""}<button class="btn alt" onclick="openLv(${S.li})">Try again</button><button class="btn alt" onclick="go('levels')">All levels</button></div></div>` : "";
  return `${nav()}<section class="sec">${bubbles()}<div class="wrap"><p class="mut">Level ${S.li+1} of ${LVS[S.role].length} · ${L.skill}</p><h2>${L.title}</h2><p>${L.prompt}</p>${body}
${r?"":`<p><button class="btn" ${S.busy?"disabled":""} onclick="submitLv()">${S.busy?"Scoring…":"Submit"}</button></p>`}${S.err?errBox():""}${res}</div></section>`;
}

async function submitLv(){
  const L = LVS[S.role][S.li], a = $("#ans"); let sc, note;
  if(L.type==="rank"){ if(S.order.length<L.items.length) return;
    // Score = 100 minus how far each task sits from its ideal position
    const d = S.order.reduce((s,it,p)=>s+Math.abs(p-L.answer.indexOf(it)),0);
    sc = Math.round(100*(1-d/8)); note = "Best order: "+L.answer.map(i=>L.items[i]).join(" → ")+". Fix what blocks others and what the client sees first.";
  } else if(L.type==="choice"){ if(S.pick===null) return; sc = L.pts[S.pick]; note = L.why;
  } else if(L.type==="number"){ if(a.value==="") return; const n = Number(a.value);
    sc = n===L.answer ? 100 : Math.abs(n-L.answer)===1 ? 40 : 0; note = L.why;
  } else {
    const text = a.value.trim(); S.draft = text;
    if(text.split(/\s+/).length<8){ a.placeholder="Please write at least 8 words."; return; }
    S.busy = true; S.err = null; S.retry = submitLv; render();
    try{
      const j = await llm(true,
`Rate this employee's written reply to a workplace situation.
Situation: ${L.prompt}
Reply: ${text}
Return STRICT JSON only, no prose, no markdown: {"clarity":1-5,"empathy":1-5,"concrete_plan":1-5,"professionalism":1-5,"feedback":"one sentence"} using integers 1-5.`);
      const k = ["clarity","empathy","concrete_plan","professionalism"];
      if(k.some(x=>!Number.isInteger(j[x])||j[x]<1||j[x]>5)||typeof j.feedback!=="string") throw new Error("bad json");
      // 80% AI rating + 20% code signals (acknowledged the concern, proposed a next step)
      const g = signals({text,secs:0}), llmPart = (k.reduce((s,x)=>s+j[x],0)/4-1)/4*100;
      sc = Math.round(.8*llmPart + .2*((g.ack?50:0)+(g.step?50:0))); note = j.feedback;
    }catch(e){ S.err = true; S.busy = false; render(); return; }
    S.busy = false;
  }
  S.lres = {sc,note}; (S.prog[S.role] = S.prog[S.role]||[])[S.li] = Math.max(best(S.li),sc);
  try{ localStorage.setItem(LK,JSON.stringify(S.prog)) }catch(e){}
  render();
}
// Inline onclick/oninput handlers in the HTML strings look these up on window
Object.assign(window, {S, render, go, start, fill, send, retry, openLv, submitLv, pick, openPay, closePay, goPass, setRole, startFree, useRole, goPricing, fmtCard, fmtExp, pay, drawPay});
render();

