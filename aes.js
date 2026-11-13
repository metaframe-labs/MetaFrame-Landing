// ---------- autonomousengineeringsystem: mission control — agents, aegis gates, blast radar ----------
(function(){
const stage=document.querySelector('#intel .stage-aes');if(!stage)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>stage.querySelector(s);
const log=$('#aesLog'),inp=$('#aesInp'),
      leds={ori:$('#aledOri'),dae:$('#aledDae'),vul:$('#aledVul'),aeg:$('#aledAeg')},
      gates=[...stage.querySelectorAll('.aegis .g')],
      phases=[...stage.querySelectorAll('.aphases b')];
if(!log)return;

const wait=ms=>new Promise(r=>setTimeout(r,ms));
const tone=(f,d,t,v,w)=>{const s=window.__snd;if(s&&s.on)s.tone(f,d,t,v,w)};
const sleep=ms=>wait(reduce?40:ms);

// ---------- the crew & the gates ----------
const GATES=['TSC','BLAST','THEME','EMOJI','I18N','AST'];
const MISSIONS={
  'dark mode toggle':{prd:'PRD-042 "dark mode toggle" · 3 requirements',adr:'ADR-017 accepted: theme tokens over literals',plan:'plan: 7 steps · 3 files · est 420 tok',
    files:[['src/theme/tokens.ts','+62'],['src/ui/Toggle.tsx','+38'],['src/app.css','+12']],
    fail:3,failMsg:'emoji detected — src/ui/Toggle.tsx:42 "🎉 shipped!"',heal:'stripping emoji · re-running gates',commit:'4f2a91c'},
  'streak widget':{prd:'PRD-051 "streak widget" · 2 requirements',adr:'ADR-023 accepted: local-first storage, no sync',plan:'plan: 5 steps · 3 files · est 380 tok',
    files:[['src/ui/Streak.tsx','+74'],['src/store/streak.ts','+31'],['src/i18n/en.json','+6']],
    fail:1,failMsg:'blast radius 14 nodes — limit is 12',heal:'splitting widget into 3 modules · blast radius 5 · re-running',commit:'9be03d7'},
  'i18n loader refactor':{prd:'PRD-038 "i18n loader refactor" · 4 requirements',adr:'ADR-012 accepted: lazy locale loading',plan:'plan: 9 steps · 2 files · est 510 tok',
    files:[['src/i18n/loader.ts','+58'],['src/i18n/queue.ts','+27']],
    fail:5,failMsg:'stray console.log — src/i18n/loader.ts:31,88',heal:'removing debug noise · re-running gates',commit:'d41c07a'}
};
const ADRS=['ADR-008 accepted: composition over config','ADR-031 accepted: explicit deps, no singletons','ADR-005 accepted: edge-first, zero telemetry'];
const GFAIL=[
  s=>`type error — src/${s}.ts:47 property "opts" is missing`,
  s=>`blast radius ${9+((Math.random()*8)|0)} nodes — limit is 12`,
  s=>`hardcoded #ff0044 in src/${s}.tsx — theme tokens only`,
  s=>`emoji detected — src/${s}.tsx:42 "🎉 shipped!"`,
  s=>`untranslated string — "Save" has no key in en.json`,
  s=>`stray console.log — src/${s}.ts:31,88`];
const GHEAL=[
  s=>`typing the call site · re-running gates`,
  s=>`splitting the module · re-running gates`,
  s=>`swapping in token --em · re-running gates`,
  s=>`stripping emoji · re-running gates`,
  s=>`adding key common.save · re-running gates`,
  s=>`removing debug noise · re-running gates`];
function genCustom(name){
  const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,18)||'feature';
  const fail=1+((Math.random()*5)|0);
  return {prd:`PRD-0${40+((Math.random()*9)|0)} "${name}" · 3 requirements`,adr:ADRS[(Math.random()*ADRS.length)|0],
    plan:`plan: ${5+((Math.random()*3)|0)} steps · 3 files · est ${300+((Math.random()*9)|0)*10} tok`,
    files:[[`src/feature/${slug}.tsx`,'+'+(35+((Math.random()*40)|0))],[`src/core/${slug}.ts`,'+'+(18+((Math.random()*25)|0))],['src/i18n/en.json','+8']],
    fail,failMsg:GFAIL[fail](slug),heal:GHEAL[fail](slug),
    commit:((Math.random()*0xfffff)|0).toString(16).padStart(6,'0')};
}

// ---------- blast radius radar: rings, sweep beam, node blips ----------
const cv=stage.querySelector('.layer canvas');
const DPR=Math.min(devicePixelRatio||1,2);
let W=0,H=0,visible=false,mx=0,my=0,tx=0,ty=0,pulse=0,sweep=0,tt=0;
let blips=[];
function size(){
  const r=stage.getBoundingClientRect();W=r.width;H=r.height;
  cv.width=W*DPR;cv.height=H*DPR;
  cv.getContext('2d').setTransform(DPR,0,0,DPR,0,0);
  const maxR=Math.min(W,H)*.42,cx=W/2,cy=H*.4;
  blips=Array.from({length:46},()=>({a:Math.random()*6.283,r:.18+Math.random()*.76,s:1.6+Math.random()*2,st:0,hit:0,ph:Math.random()*6.28}));
  if(reduce)draw();
}
function pick(n){ // choose n distinct blips for the current build
  const idx=[...blips.keys()];
  for(let i=idx.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[idx[i],idx[j]]=[idx[j],idx[i]]}
  return idx.slice(0,n).map(i=>blips[i]);
}
function draw(){
  const ctx=cv.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const cx=W/2,cy=H*.4,maxR=Math.min(W,H)*.42;
  // rings + crosshair
  ctx.lineWidth=1;
  [.33,.55,.78,1].forEach(k=>{ctx.strokeStyle=`rgba(255,178,30,${k===1?.16:.08})`;
    ctx.beginPath();ctx.arc(cx,cy,maxR*k,0,6.283);ctx.stroke()});
  ctx.strokeStyle='rgba(255,178,30,.05)';
  ctx.beginPath();ctx.moveTo(cx-maxR,cy);ctx.lineTo(cx+maxR,cy);ctx.moveTo(cx,cy-maxR);ctx.lineTo(cx,cy+maxR);ctx.stroke();
  // sweep beam with fading trail
  for(let k=0;k<26;k++){
    const a=sweep-k*.02,al=(1-k/26)*.055;
    ctx.strokeStyle=`rgba(255,178,30,${al})`;ctx.lineWidth=k===0?1.6:1;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*maxR,cy+Math.sin(a)*maxR);ctx.stroke();
  }
  // blips
  for(const b of blips){
    b.hit*=.965;
    const x=cx+Math.cos(b.a)*b.r*maxR,y=cy+Math.sin(b.a)*b.r*maxR;
    let al=.22+b.hit*.75,col='255,178,30';
    if(b.st===1){al=.45+.4*Math.sin(tt*6+b.ph);col='255,178,30'}
    else if(b.st===2){al=.65+.3*Math.sin(tt*9+b.ph);col='255,61,110'}
    else if(b.st===3){al=.85;col='39,227,154'}
    ctx.fillStyle=`rgba(${col},${al})`;
    ctx.beginPath();ctx.arc(x,y,b.s+b.hit*1.4,0,6.283);ctx.fill();
  }
  // core
  ctx.fillStyle=`rgba(255,178,30,${.5+.3*Math.sin(tt*2)})`;
  ctx.beginPath();ctx.arc(cx,cy,3,0,6.283);ctx.fill();
}
stage.addEventListener('pointermove',e=>{
  const r=stage.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5;
  stage.style.setProperty('--mx',(mx+.5)*100+'%');stage.style.setProperty('--my',(my+.5)*100+'%');
});
stage.addEventListener('pointerleave',()=>{mx=my=0});
stage.addEventListener('click',()=>{pulse=1;blips.forEach(b=>b.hit=1);tone(220,.3,'sine',.05);tone(880,.3,'triangle',.04,.08)});
new IntersectionObserver(e=>{
  visible=e[0].isIntersecting;
  if(visible&&!blips.length)size();
},{threshold:.05}).observe(stage);
addEventListener('resize',()=>{size();if(reduce)draw()});
document.fonts&&document.fonts.ready.then(()=>{size();if(reduce)draw()});
if(reduce)draw();
(function loop(){
  requestAnimationFrame(loop);
  if(!visible||reduce)return;
  tt+=.016;sweep=(sweep+.011)%6.283;pulse*=.94;
  tx+=(mx-tx)*.07;ty+=(my-ty)*.07;
  stage.querySelectorAll('.layer').forEach(l=>{const z=parseFloat(l.dataset.z||0);
    l.style.transform=`translate3d(${-tx*z*W}px,${-ty*z*H}px,0) scale(${1+z*1.6})`});
  stage.style.transform=`perspective(1200px) rotateY(${tx*4}deg) rotateX(${-ty*4}deg)`;
  stage.querySelector('.hud').style.transform=`translate3d(${tx*10}px,${ty*8}px,0)`;
  for(const b of blips){
    let d=Math.abs(sweep-b.a)%6.283;if(d>3.14159)d=6.283-d;
    if(d<.055)b.hit=1;
  }
  draw();
})();

// ---------- the mission loop ----------
function setPhase(i){phases.forEach((b,k)=>{b.classList.toggle('on',k===i);b.classList.toggle('done',k<i)})}
function line(who,txt,cls){
  const d=document.createElement('div');d.className='ln'+(cls?' '+cls:'');
  d.innerHTML=`<span class="who">${who}</span> ${txt}`;
  log.append(d);while(log.children.length>8)log.firstChild.remove();
  return d;
}
function crew(on){for(const k in leds)leds[k].classList.toggle('live',on[k]||false)}
function resetGates(){gates.forEach(g=>g.className='g')}
function gateRun(i){gates[i].className='g run';tone(700+i*40,.06,'square',.012)}
function gatePass(i){gates[i].className='g pass';tone(620+i*70,.09,'sine',.028)}

let running=false;
async function run(name){
  name=(name||'').trim();if(!name||running)return;
  running=true;
  const m=MISSIONS[name]||genCustom(name);
  log.textContent='';resetGates();crew({});
  setPhase(0);tone(160,.2,'sine',.03);
  // index: the graph comes online on the radar
  line('index','643 files · 1,338 edges · 693ms','dim');
  blips.forEach((b,k)=>setTimeout(()=>{b.hit=1;tone(500+k*9,.04,'square',.008)},reduce?0:k*18));
  await sleep(900);
  // crew: PRD -> ADR -> plan
  setPhase(1);crew({ori:1});tone(520,.14,'sine',.035);
  await sleep(850);line('orion',m.prd);
  crew({ori:1,dae:1});tone(600,.14,'sine',.035);
  await sleep(850);line('daedalus',m.adr,'w-dae');
  crew({ori:1,dae:1,vul:1});tone(690,.14,'sine',.035);
  await sleep(850);line('vulcan',m.plan,'w-vul');
  // build: executor writes files, radar blips light gold
  setPhase(2);crew({vul:1});
  const touched=pick(m.files.length);
  for(let i=0;i<m.files.length;i++){
    const [f,d]=m.files[i];
    line('executor',`writing ${f} ${d}`,'w-exec');tone(300+i*60,.08,'triangle',.02);
    touched[i].st=1;
    if(reduce)draw();
    await sleep(720);
  }
  // gates: aegis walks the chain, one gate fails, the loop heals itself
  setPhase(3);crew({aeg:1});tone(220,.25,'sawtooth',.02);
  for(let i=0;i<GATES.length;i++){
    gateRun(i);await sleep(430);
    if(i===m.fail){
      gates[i].className='g fail';tone(130,.3,'sawtooth',.035);
      line('aegis',`gate ${i+1}/6 FAIL — ${m.failMsg}`,'bad');
      touched.forEach(b=>b.st=2);if(reduce)draw();
      await sleep(1050);
      line('aegis',m.heal,'heal');tone(660,.1,'sine',.03);tone(990,.12,'sine',.028,.08);
      await sleep(950);
      touched.forEach(b=>b.st=3);gatePass(i);
    }else gatePass(i);
    await sleep(160);
  }
  crew({});
  line('aegis','6/6 gates green — commit '+m.commit+' · traceability intact','ok');
  [523,659,784,1047].forEach((f,k)=>tone(f,.2,'sine',.035,k*.06));
  if(reduce)draw();
  await sleep(600);
  setPhase(4);running=false;
}

// chips + input
stage.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>run(b.textContent));
$('#aesForm').addEventListener('submit',e=>{e.preventDefault();run(inp.value)});

// auto-run the flagship mission on first view
let booted=false;
new IntersectionObserver((es,o)=>{es.forEach(e=>{
  if(!e.isIntersecting||booted)return;booted=true;o.disconnect();
  setTimeout(()=>run('dark mode toggle'),reduce?100:600);
})},{threshold:.3}).observe(stage);
})();
