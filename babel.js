// ---------- i18next-local-inference: the babel pipeline — simulated local inference, 0 cloud ----------
(function(){
const stage=document.querySelector('#intel .stage-babel');if(!stage)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>stage.querySelector(s);
const ttl=$('.ttl'),grid=$('#babelTiles'),gwrap=$('.gridwrap'),out=$('#babelOut'),inp=$('#babelInp'),
      phases=[...stage.querySelectorAll('.bphases b')],ledT=$('#bledT'),ledJ=$('#bledJ'),langTag=$('#babelLang');
if(!grid||!ttl)return;

const wait=ms=>new Promise(r=>setTimeout(r,ms));
const tone=(f,d,t,v,w)=>{const s=window.__snd;if(s&&s.on)s.tone(f,d,t,v,w)};

// ---------- data: one english source string, 15 demo locales (the real thing does 29) ----------
const SRC='en';
const LOC=['tr','de','fr','es','it','pt','nl','pl','ru','ja','ko','zh','ar','hi','id'];
const MINE=(navigator.language||'').slice(0,2).toLowerCase();
// cog: same as source on purpose (legit cognate) · fgt: lazy fill left it untranslated, judge fixes it
const PRESETS={
  'Welcome back!':{t:{tr:'Tekrar hoş geldin!',de:'Willkommen zurück!',fr:'Bon retour !',es:'¡Bienvenido de nuevo!',it:'Bentornato!',pt:'Bem-vindo de volta!',nl:'Welkom terug!',pl:'Witaj ponownie!',ru:'С возвращением!',ja:'おかえりなさい！',ko:'다시 만나 반가워요!',zh:'欢迎回来！',ar:'أهلاً بعودتك!',hi:'वापसी पर स्वागत है!',id:'Selamat datang kembali!'}},
  'Flashcards':{cog:['tr','de','pt','nl'],t:{fr:'Cartes mémo',es:'Tarjetas',it:'Flashcard',pl:'Fiszki',ru:'Карточки',ja:'フラッシュカード',ko:'플래시카드',zh:'闪卡',ar:'بطاقات المراجعة',hi:'फ्लैशकार्ड',id:'Flashcard'}},
  'AI tutor':{t:{tr:'AI eğitmeni',de:'KI-Tutor',fr:'Tuteur IA',es:'Tutor de IA',it:'Tutor IA',pt:'Tutor de IA',nl:'AI-tutor',pl:'Korepetytor AI',ru:'ИИ-репетитор',ja:'AIチューター',ko:'AI 튜터',zh:'AI 导师',ar:'مدرّس AI',hi:'AI ट्यूटर',id:'Tutor AI'}},
  'Focus session complete':{fgt:['tr','es'],t:{tr:'Odak seansı tamamlandı',es:'Sesión de enfoque completada',de:'Fokus-Sitzung abgeschlossen',fr:'Session de concentration terminée',it:'Sessione di focus completata',pt:'Sessão de foco concluída',nl:'Focusessie voltooid',pl:'Sesja skupienia zakończona',ru:'Фокус-сессия завершена',ja:'集中セッション完了',ko:'집중 세션 완료',zh:'专注会话完成',ar:'انتهت جلسة التركيز',hi:'फोकस सत्र पूर्ण',id:'Sesi fokus selesai'}},
  'WiFi':{cogAll:1,t:{}}
};
const COGNATE_RE=/^(wifi|ai|api|gps|usb|url|ok|id|ui|ux|http|json|pdf)$/i;

// ---------- locale tiles ----------
const tiles={};
function mkTile(code,src){
  const d=document.createElement('div');d.className='tile'+(src?' src':'');
  d.innerHTML=`<span class="lc"><b>${code}</b><i></i></span><span class="tx" dir="auto">∅</span>`;
  tiles[code]=d;return d;
}
grid.append(mkTile(SRC,1));
LOC.forEach(c=>grid.append(mkTile(c)));
if(LOC.includes(MINE)){tiles[MINE].classList.add('you');tiles[MINE].querySelector('.lc i').textContent='YOU'}
langTag.textContent='locale: '+(navigator.language||'??')+(LOC.includes(MINE)?' · filling first':' · 15 of 29 shown');

// ---------- multilingual headline: the title translates itself, forever ----------
const TITLES=[
  'One string, 29 faces.','Tek satır, 29 yüz.','Ein String, 29 Gesichter.','Une chaîne, 29 visages.',
  'Una cadena, 29 caras.','Una stringa, 29 volti.','Eén string, 29 gezichten.','Jeden ciąg, 29 twarzy.',
  'Одна строка, 29 лиц.','一つの文字列、29の顔。','하나의 문자열, 29개의 얼굴.','一行字符串，29张面孔。',
  'سلسلة واحدة، 29 وجهاً.','एक स्ट्रिंग, 29 चेहरे।','Satu string, 29 wajah.'];
const CH='01<>/{}#$%';
let ti=0;
function paint(txt,prog){
  const chars=[...txt];
  ttl.innerHTML=chars.map((c,i)=>c===' '?' ':(i<prog*chars.length?c:CH[(Math.random()*CH.length)|0])).join('').replace('29','<em>29</em>');
}
function startCycle(){
  if(startCycle.on)return;startCycle.on=1;
  setInterval(()=>{ti=(ti+1)%TITLES.length;const txt=TITLES[ti];
    if(reduce){ttl.innerHTML=txt.replace('29','<em>29</em>');return} // plain swap: content, not motion
    let f=0;
    const ani=setInterval(()=>{f+=.08;paint(txt,Math.min(1,f));
      if(f>=1){clearInterval(ani);ttl.innerHTML=txt.replace('29','<em>29</em>')}},30);
  },2900);
}

// ---------- glyph rain: world scripts falling through the stage ----------
const cvL=[...stage.querySelectorAll('.layer canvas')];
const DPR=Math.min(devicePixelRatio||1,2);
const POOL=[...'アイウエオカキサシスセソタチツテトナニヌネノ한그한글서울중문번역學習言語機械ابجدهوزحطيكلمنسعصعقلأبجدهوزдежзийклмнопрстуфхцчшαβγδεζηθλμπσφψωi18n{}<>#$'];
const cfg=[{n:46,a:.14,s:[10,15],v:[10,22],hue:'39,227,154'},{n:30,a:.26,s:[16,24],v:[16,34],hue:'39,227,154'},{n:13,a:.42,s:[26,42],v:[24,52],hue:'255,178,30'}];
const L=cvL.map((c,i)=>({ctx:c.getContext('2d'),c:cfg[i]||cfg[0],p:[]}));
let W=0,H=0,visible=false,mx=0,my=0,tx=0,ty=0,pulse=0;
function size(){
  const r=stage.getBoundingClientRect();W=r.width;H=r.height;
  cvL.forEach(c=>{c.width=W*DPR;c.height=H*DPR});
  L.forEach(l=>{l.ctx.setTransform(DPR,0,0,DPR,0,0);const k=innerWidth<700?.5:1;
    l.p=Array.from({length:Math.round(l.c.n*k)},()=>({x:Math.random()*W,y:Math.random()*H,
      v:l.c.v[0]+Math.random()*(l.c.v[1]-l.c.v[0]),s:l.c.s[0]+Math.random()*(l.c.s[1]-l.c.s[0]),
      ch:POOL[(Math.random()*POOL.length)|0],ph:Math.random()*6.28}))});
}
addEventListener('resize',()=>{size();if(reduce)draw()});
document.fonts&&document.fonts.ready.then(()=>{size();if(reduce)draw()});
function draw(){
  const glow=1+pulse*1.2;
  for(let li=0;li<L.length;li++){
    const {ctx,c}=L[li];ctx.clearRect(0,0,W,H);ctx.textAlign='center';
    for(const g of L[li].p){
      g.y+=g.v*.016;g.ph+=.01;
      if(g.y>H+g.s){g.y=-g.s;g.x=Math.random()*W;g.ch=POOL[(Math.random()*POOL.length)|0]}
      ctx.fillStyle=`rgba(${c.hue},${Math.min(1,c.a*(.7+.3*Math.sin(g.ph))*glow)})`;
      ctx.font=`${g.s|0}px "JetBrains Mono",monospace`;
      ctx.fillText(g.ch,g.x+Math.sin(g.ph)*3,g.y);
    }
  }
}
stage.addEventListener('pointermove',e=>{
  const r=stage.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5;
  stage.style.setProperty('--mx',(mx+.5)*100+'%');stage.style.setProperty('--my',(my+.5)*100+'%');
});
stage.addEventListener('pointerleave',()=>{mx=my=0});
stage.addEventListener('click',()=>{pulse=1;tone(220,.3,'sine',.05);tone(880,.3,'triangle',.04,.08)});
new IntersectionObserver(e=>{
  visible=e[0].isIntersecting;
  if(visible&&!L[0].p.length)size();
},{threshold:.05}).observe(stage);
if(reduce)draw();
(function loop(){
  requestAnimationFrame(loop);
  if(!visible||reduce)return;
  pulse*=.95;tx+=(mx-tx)*.07;ty+=(my-ty)*.07;
  stage.querySelectorAll('.layer').forEach(l=>{const z=parseFloat(l.dataset.z||0);
    l.style.transform=`translate3d(${-tx*z*W}px,${-ty*z*H}px,0) scale(${1+z*1.6})`});
  stage.style.transform=`perspective(1200px) rotateY(${tx*4}deg) rotateX(${-ty*4}deg)`;
  stage.querySelector('.hud').style.transform=`translate3d(${tx*10}px,${ty*8}px,0)`;
  draw();
})();

// ---------- the pipeline: discover -> translate -> judge -> verify ----------
function setPhase(i){phases.forEach((b,k)=>{b.classList.toggle('on',k===i);b.classList.toggle('done',k<i)})}
function say(line){return new Promise(res=>{
  if(reduce){out.textContent=line;return res()}
  let i=0;(function nc(){out.textContent=line.slice(0,++i);if(i<line.length)setTimeout(nc,8);else res()})();
})}
async function type(tx,val,rid){
  tx._rid=rid;
  if(reduce||val.length<2){tx.textContent=val;return}
  for(let i=1;i<=val.length;i++){if(tx._rid!==rid)return;tx.textContent=val.slice(0,i);await wait(11)}
}
function pop(d){d.classList.remove('pop');void d.offsetWidth;d.classList.add('pop')}

let running=false,rid=0;
function reset(str){
  Object.entries(tiles).forEach(([c,d])=>{
    const tx=d.querySelector('.tx');tx._rid=0;
    d.className='tile'+(c===SRC?' src':'')+(c===MINE&&LOC.includes(MINE)?' you':'');
    d.querySelector('.lc i').textContent=c===MINE&&LOC.includes(MINE)?'YOU':'';
    tx.textContent=c===SRC?str:'∅';
    d.style.removeProperty('--wd');
  });
  out.textContent='';gwrap.querySelectorAll('.jsweep').forEach(x=>x.remove());
  ledT.className='mled';ledJ.className='mled j';
}
async function run(str){
  str=(str||'').trim();if(!str||running)return;
  running=true;const id=++rid;
  const p=PRESETS[str],custom=!p;
  reset(str);
  tone(160,.2,'sine',.03);
  setPhase(0);await say('> scanning src/i18n/locales … 15 locale files found');
  await wait(reduce?120:480);

  // translator pass — 12b fills every empty tile, your locale first
  setPhase(1);ledT.classList.add('live');
  const order=LOC.slice();
  for(let i=order.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[order[i],order[j]]=[order[j],order[i]]}
  if(LOC.includes(MINE))order.splice(order.indexOf(MINE),1),order.unshift(MINE);
  let n=0;
  for(const c of order){
    const d=tiles[c],tx=d.querySelector('.tx');
    let val;
    if(custom||p.cogAll)val=str;
    else if(p.fgt&&p.fgt.includes(c))val=str;   // lazy fill leaves the source behind
    else if(p.cog&&p.cog.includes(c))val=str;   // legit cognate: same on purpose
    else val=p.t[c];
    d.classList.add('fill');type(tx,val,id);
    tone(500+n*16,.05,'square',.011);n++;
    await wait(reduce?10:75);
  }
  await wait(reduce?100:480);
  ledT.classList.remove('live');ledT.classList.add('ok');
  await say('> translator: en → 15 locales · filled 15/15 · 0 bytes left the machine');

  // judge pass — 26b decides: cognate, forgotten, or flag for review
  setPhase(2);ledJ.classList.add('live');tone(220,.3,'sawtooth',.02);
  if(!reduce){const s=document.createElement('div');s.className='jsweep';gwrap.append(s);setTimeout(()=>s.remove(),1400)}
  await wait(reduce?120:1050);
  let cog=0,fix=0,rev=0;
  const isCog=p&&p.cogAll||COGNATE_RE.test(str);
  const targets=custom||p.cogAll?LOC:(p.cog||[]).concat(p.fgt||[]);
  for(const c of targets){
    const d=tiles[c],tag=d.querySelector('.lc i');
    if(custom||p.cogAll){
      if(isCog){d.classList.add('cog');tag.textContent='COGNATE ✓';tone(880,.08,'sine',.028)}
      else{d.classList.add('rev');tag.textContent='REVIEW ?';tone(330,.1,'triangle',.02)}
      pop(d);cog+=isCog;rev+=!isCog;
    }else if(p.cog&&p.cog.includes(c)){
      d.classList.add('cog');tag.textContent='COGNATE ✓';pop(d);tone(880,.08,'sine',.028);cog++;
    }else{ // forgotten: flag it, then fix it on the spot
      d.classList.add('fgt');tag.textContent='FORGOTTEN';pop(d);tone(130,.25,'sawtooth',.03);
      await wait(reduce?15:450);
      tone(660,.1,'sine',.03);tone(990,.12,'sine',.028,.08);
      d.classList.remove('fgt');d.classList.add('fix');tag.textContent='FIXED ✓';
      type(d.querySelector('.tx'),p.t[c],id);pop(d);fix++;
    }
    await wait(reduce?15:(custom||p.cogAll?100:160));
  }
  ledJ.classList.remove('live');ledJ.classList.add('ok');
  await say(`> judge: ${cog} cognates kept · ${fix} forgotten fixed · ${rev} flagged for review`);

  // verify pass — green wave sweeps the grid
  setPhase(3);
  if(!reduce){LOC.forEach((c,k)=>{const d=tiles[c];d.style.setProperty('--wd',(k*.04)+'s');d.classList.add('wave');
    setTimeout(()=>d.classList.remove('wave'),1200+k*40)})}
  [523,659,784,1047].forEach((f,k)=>tone(f,.18,'sine',.03,k*.05));
  await wait(reduce?150:850);
  await say('> verify ok — locale files rewritten · 0 cloud calls · done.');
  setPhase(4);running=false;
}

// chips + input
stage.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>run(b.textContent));
$('#babelForm').addEventListener('submit',e=>{e.preventDefault();run(inp.value)});

// auto-boot the flagship scenario (the judge's cognate call) on first view
let booted=false;
new IntersectionObserver((es,o)=>{es.forEach(e=>{
  if(!e.isIntersecting||booted)return;booted=true;o.disconnect();
  startCycle();
  setTimeout(()=>run('Flashcards'),reduce?100:600);
})},{threshold:.3}).observe(stage);
})();
