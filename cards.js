// ---------- Cartridge deck: rack -> slot-in console -> CRT boot ----------
(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const deck=document.getElementById('deck'),rack=document.getElementById('rack'),cunit=document.getElementById('cunit'),
      crt=document.getElementById('crt'),crtidle=document.getElementById('crtidle'),crtlog=document.getElementById('crtlog'),
      crtinfo=document.getElementById('crtinfo'),slotcart=document.getElementById('slotcart');
if(!rack||!deck)return;

const PRODS=[
  ['Meta Box','Create apps with AI','#27e39a','MetaBox','metabox','Describe an app or mini game, get it built. The flagship of the lab.','https://play.google.com/store/apps/details?id=com.metaframe.metabox'],
  ['Neurodivergence','Consciousness','#e8e8e8','Neurodivergence','neurodivergence','Exploring how different minds work and building for them.','https://play.google.com/store/apps/details?id=com.metaframe.neurodivergence'],
  ['Mindhouse','AI study companion','#5b7bff','Mindhouse','mindhouse','A study partner that adapts to how you learn.','https://play.google.com/store/apps/details?id=com.metaframe.mindhouse'],
  ['Divergent AI','Think differently','#a84dff','Divergentai','divergentai','An AI that embraces non-linear thinking.','https://play.google.com/store/apps/details?id=com.metaframe.divergentai'],
  ['FocusTabs','Stay in flow','#b06bff','FocusTabs','focustabs','Tame your tabs, protect your attention.','https://play.google.com/store/apps/details?id=com.melihcandemir.focustabs'],
  ['Mindbook Lite','Lightweight notes','#27e39a','Mindbook-Lite','mindbooklite','Fast, minimal, distraction-free notes.','https://play.google.com/store/apps/details?id=com.melihcandemir.mindbook.free'],
  ['Mindbook','Markdown cloud notes','#3d8bff','MindbookPro','mindbook','Markdown notes that follow you across devices.','https://play.google.com/store/apps/details?id=com.melihcandemir.mindbook']
].map((p,i)=>({name:p[0],tag:p[1],color:p[2],icon:p[3],slug:p[4],desc:p[5],url:p[6],i}));

// one cartridge face, reused by the rack, the slot and the flight clone
function body(p){
  const d=document.createElement('div');d.className='cbody';
  // single long words (e.g. "Neurodivergence") can't wrap -> flag them for a smaller fit
  const lw=Math.max(...p.name.split(/\s+/).map(w=>w.length));
  d.innerHTML=`<img class="cico" src="icons/${p.icon}.png" alt="" loading="lazy"><span class="cid">MF-0${p.i+1}</span><b class="cname${lw>11?' long':''}">${p.name}</b><span class="ctag">${p.tag}</span><i class="notch"></i>`;
  return d;
}
function infoObj(p){return{id:'MF-0'+(p.i+1),index:p.i,name:p.name,tag:p.tag,desc:p.desc,color:p.color,icon:'icons/'+p.icon+'.png',url:p.url}}

const carts=PRODS.map(p=>{
  const b=document.createElement('button');
  b.type='button';b.className='cart reveal';
  b.style.setProperty('--c',p.color);b.style.setProperty('--d',(p.i*.07)+'s');
  b.dataset.cursor='insert';
  b.setAttribute('aria-label',`insert cartridge MF-0${p.i+1}: ${p.name}`);
  b.append(body(p));
  b.onclick=()=>insert(p.i);
  rack.append(b);
  return b;
});

// spring tilt on rack cartridges (foil + tilt track the cursor)
const S=carts.map(c=>{
  const st={rx:0,ry:0,vx:0,vy:0,tx:0,ty:0,hi:0,thi:0,px:50,py:30,tpx:50,tpy:30,active:false};
  if(!reduce){
    c.addEventListener('pointermove',e=>{
      const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      st.ty=(x-.5)*18;st.tx=-(y-.5)*15;st.tpx=x*100;st.tpy=y*100;st.thi=1;st.active=true;
    });
    c.addEventListener('pointerleave',()=>{st.tx=st.ty=0;st.thi=0;st.tpx=50;st.tpy=30});
  }
  return st;
});
const K=.1,D=.78;
(function loop(){
  for(let i=0;i<S.length;i++){
    const s=S[i];if(!s.active)continue;
    s.vx=(s.vx+(s.tx-s.rx)*K)*D;s.vy=(s.vy+(s.ty-s.ry)*K)*D;
    s.rx+=s.vx;s.ry+=s.vy;
    s.hi+=(s.thi-s.hi)*.12;s.px+=(s.tpx-s.px)*.2;s.py+=(s.tpy-s.py)*.2;
    const c=carts[i];
    c.style.setProperty('--rx',s.rx.toFixed(2)+'deg');c.style.setProperty('--ry',s.ry.toFixed(2)+'deg');
    c.style.setProperty('--px',s.px.toFixed(1)+'%');c.style.setProperty('--py',s.py.toFixed(1)+'%');
    c.style.setProperty('--hi',s.hi.toFixed(3));
    if(!s.thi&&Math.abs(s.rx)+Math.abs(s.ry)+Math.abs(s.vx)+Math.abs(s.vy)<.02&&s.hi<.01)s.active=false;
  }
  requestAnimationFrame(loop);
})();

const snd=()=>window.__snd;
function tone(f,d,t,v,w){const s=snd();if(s&&s.on)s.tone(f,d,t,v,w)}

let cur=-1,busy=false;

function slotRect(){ // measure where the seated cartridge will sit
  slotcart.hidden=false;slotcart.style.visibility='hidden';
  const r=slotcart.getBoundingClientRect();
  slotcart.style.visibility='';slotcart.hidden=true;return r;
}
function fly(f,t,p){ // clone flies from rack rect to slot rect (or back)
  return new Promise(res=>{
    const w=document.createElement('div');w.className='fly';
    w.style.cssText=`left:${f.left}px;top:${f.top}px;width:${f.width}px;height:${f.height}px`;
    w.append(body(p));document.body.append(w);
    const dx=t.left-f.left+(t.width-f.width)/2,dy=t.top-f.top+(t.height-f.height)/2,sc=t.width/f.width;
    requestAnimationFrame(()=>requestAnimationFrame(()=>w.style.transform=`translate(${dx}px,${dy}px) scale(${sc})`));
    tone(240,.18,'sine',.03);tone(360,.16,'sine',.025,.08);
    setTimeout(()=>{w.remove();res()},reduce?0:520);
  });
}
function boot(p){
  return new Promise(res=>{
    crt.classList.remove('flick');void crt.offsetWidth;crt.classList.add('flick');
    crtinfo.classList.remove('show');crtidle.classList.remove('show');
    crtlog.textContent='';crtlog.classList.add('show');
    const L=[`> scan ···· MF-0${p.i+1} detected`,`> ${p.slug} · checksum ok · signature ok`,`> mounting /apps/${p.slug}`,`> boot complete — ready`];
    if(reduce){crtlog.textContent=L.join('\n');return setTimeout(res,200)}
    let li=0;
    (function nl(){
      if(li>=L.length)return setTimeout(res,200);
      const line=L[li++];let ci=0;
      tone(560+li*160,.05,'square',.015);
      (function nc(){
        crtlog.textContent+=line[ci++];
        if(ci<line.length)setTimeout(nc,9);
        else{crtlog.textContent+='\n';setTimeout(nl,140)}
      })();
    })();
  });
}
function showInfo(p){
  crtlog.classList.remove('show');
  crtinfo.innerHTML=`
    <div class="ihead"><span class="icid">MF-0${p.i+1}</span><div><h3>${p.name}</h3><span class="itag">${p.tag}</span></div></div>
    <p class="idesc">${p.desc}</p>
    <div class="ispec"><span>platform · android</span><span>ver · 1.0</span><span>status · live</span></div>
    <div class="iacts">
      <button type="button" class="a3d" data-cursor="open">view in 3d</button>
      <a data-cursor="open" href="${p.url}" target="_blank" rel="noopener">google play &#8599;</a>
      <span class="ibar"></span>
    </div>`;
  crtinfo.querySelector('.a3d').onclick=e=>{e.stopPropagation();window.__open3D&&window.__open3D(infoObj(p))};
  crtinfo.classList.add('show');
  deck.classList.add('ready');
  tone(523,.22,'sine',.05);tone(784,.22,'sine',.04,.08);tone(1047,.3,'sine',.04,.16);
}
async function ejectCur(){
  const p=PRODS[cur],i=cur;
  deck.classList.remove('ready');
  crtinfo.classList.remove('show');crtlog.classList.remove('show');
  const from=slotcart.getBoundingClientRect();
  slotcart.hidden=true;slotcart.innerHTML='';
  if(!reduce)await fly(from,carts[i].getBoundingClientRect(),p);
  carts[i].classList.remove('out');
  cur=-1;
}
async function insert(i){
  if(busy||i===cur)return;
  busy=true;deck.classList.add('busy');
  const p=PRODS[i];
  deck.style.setProperty('--c',p.color);
  if(cur>-1)await ejectCur();
  cur=i;carts[i].classList.add('out');
  if(!reduce)await fly(carts[i].getBoundingClientRect(),slotRect(),p);
  slotcart.innerHTML='';slotcart.append(body(p));slotcart.hidden=false;
  slotcart.classList.remove('settle');void slotcart.offsetWidth;slotcart.classList.add('settle');
  tone(75,.28,'sine',.11);tone(150,.1,'square',.05);
  cunit.classList.remove('thud');void cunit.offsetWidth;cunit.classList.add('thud');
  await boot(p);
  showInfo(p);
  deck.classList.remove('busy');busy=false;
}
slotcart.onclick=()=>{
  if(busy||cur<0)return;
  busy=true;deck.classList.add('busy');deck.classList.remove('ready');
  tone(180,.2,'sawtooth',.05);tone(90,.3,'sine',.06,.05);
  ejectCur().then(()=>{
    crtinfo.classList.remove('show');crtlog.classList.remove('show');
    crtinfo.innerHTML='';
    crtidle.classList.add('show');
    deck.classList.remove('busy');busy=false;
  });
};

// entrance + auto-boot the first cartridge when the deck scrolls into view
const vio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');vio.unobserve(e.target)}}),{threshold:.15});
carts.forEach(c=>vio.observe(c));
let booted=false;
const dio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting||booted)return;
  booted=true;dio.disconnect();
  setTimeout(()=>{if(cur<0&&!busy)insert(0)},reduce?100:600);
}),{threshold:.3});
dio.observe(deck);
})();
