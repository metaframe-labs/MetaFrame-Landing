// ---------- boot sequence ----------
const lines=['> mounting metaframe.core ...','> loading models ............ ok','> privacy layer ............. ON','> telemetry ................. none','> welcome to the lab.'];
const boot=document.getElementById('boot'),log=document.getElementById('bootlog');
let bi=0;(function nx(){if(bi<lines.length){log.textContent+=lines[bi++]+'\n';setTimeout(nx,260)}else setTimeout(()=>boot.classList.add('done'),400)})();
if(sessionStorage.getItem('mf')){boot.classList.add('done')}sessionStorage.setItem('mf',1);
document.getElementById('y').textContent=new Date().getFullYear();

// ---------- particle field forming an "M" ----------
const cv=document.getElementById('field'),cx=cv.getContext('2d');
let W,H,P=[],mouse={x:-999,y:-999};
function targets(){
  const o=document.createElement('canvas');o.width=300;o.height=300;const c=o.getContext('2d');
  c.fillStyle='#fff';c.font='bold 280px Space Grotesk, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('M',150,160);
  const d=c.getImageData(0,0,300,300).data,t=[];
  for(let y=0;y<300;y+=5)for(let x=0;x<300;x+=5)if(d[(y*300+x)*4+3]>128)t.push([x-150,y-150]);
  return t;
}
function init(){
  W=cv.width=innerWidth;H=cv.height=innerHeight;
  const t=targets(),s=Math.min(W,H)/300*(W<700?1.1:1.5),ox=W<700?W/2:W*.72,oy=H*.5;
  P=t.map(([tx,ty])=>({x:Math.random()*W,y:Math.random()*H,vx:0,vy:0,tx:ox+tx*s,ty:oy+ty*s}));
  for(let i=0;i<120;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:Math.random()-.5,vy:Math.random()-.5,free:1});
}
let form=1; // 1 = assembled
function frame(){
  cx.clearRect(0,0,W,H);
  const sy=scrollY,fade=Math.max(0,1-sy/(H*.9)),gold=getComputedStyle(document.body).getPropertyValue('--gold');
  cx.fillStyle=gold;
  for(const p of P){
    if(p.free){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;cx.globalAlpha=.25}
    else{
      const k=sy<H?.045:.01;
      p.vx+=(p.tx-p.x)*k;p.vy+=(p.ty-p.y)*k;
      const dx=p.x-mouse.x,dy=p.y-mouse.y,d=dx*dx+dy*dy;
      if(d<14000){const f=(1-d/14000)*9;p.vx+=dx/Math.sqrt(d+1)*f;p.vy+=dy/Math.sqrt(d+1)*f}
      p.vx*=.82;p.vy*=.82;p.x+=p.vx;p.y+=p.vy;cx.globalAlpha=.15+.85*fade;
    }
    cx.fillRect(p.x,p.y,2.2,2.2);
  }
  requestAnimationFrame(frame);
}
if(!window.THREE){addEventListener('resize',init);init();frame();}else cv.style.display='none';
addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px'});
const cur=document.getElementById('cursor');
document.addEventListener('pointerover',e=>cur.classList.toggle('big',!!e.target.closest('a,button,.card,input')));

// ---------- reveal + counters ----------
document.querySelectorAll('section h2,.stat,.lead,.term,.rules li,.big').forEach(e=>e.classList.add('reveal'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');
  const b=e.target.querySelector('[data-n]');if(b&&!b.done){b.done=1;const n=+b.dataset.n;let i=0;const t=setInterval(()=>{i+=Math.max(1,n/40);if(i>=n){i=n;clearInterval(t)}b.textContent=Math.round(i)},30)}
  io.unobserve(e.target)}),{threshold:.2});
document.querySelectorAll('.reveal').forEach(e=>io.observe(e));


// ---------- product cards ----------
const prods=[
  ['Meta Box','Create apps with AI','#27e39a','MetaBox','Describe an app or mini game, get it built. The flagship of the lab.'],
  ['Neurodivergence','Consciousness','#e8e8e8','Neurodivergence','Exploring how different minds work — and building for them.'],
  ['Mindhouse','AI study companion','#5b7bff','Mindhouse','A study partner that adapts to how you learn.'],
  ['Divergent AI','Think differently','#a84dff','Divergentai','An AI that embraces non-linear thinking.'],
  ['FocusTabs','Stay in flow','#b06bff','FocusTabs','Tame your tabs, protect your attention.'],
  ['Mindbook Lite','Lightweight notes','#27e39a','Mindbook-Lite','Fast, minimal, distraction-free notes.'],
  ['Mindbook','Markdown cloud notes','#3d8bff','MindbookPro','Markdown notes that follow you across devices.']
];
const cards=document.getElementById('cards');
prods.forEach((p,i)=>{
  const c=document.createElement('div');c.className='card reveal';c.style.setProperty('--c',p[2]);
  c.innerHTML=`<div class="in"><div class="ico"><img src="icons/${p[3]}.png" alt="${p[0]}" loading="lazy"></div><span class="id">MF-0${i+1}</span><h3>${p[0]}</h3><p>${p[1]}</p></div><div class="back"><b style="color:var(--fg);margin-bottom:8px">${p[0]}</b>${p[4]}</div>`;
  c.onclick=()=>c.classList.toggle('flip');
  c.onpointermove=e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`rotateY(${x*18}deg) rotateX(${-y*18}deg)`};
  c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')});
  c.onpointerleave=()=>c.style.transform='';
  cards.append(c);io.observe(c);
});

// ---------- easter egg: Konami / â—† switches theme ----------
const seq='ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba';let buf='';
addEventListener('keydown',e=>{buf=(buf+e.key).slice(-seq.length);if(buf===seq)document.body.classList.toggle('em')});
document.getElementById('konami').onclick=()=>document.body.classList.toggle('em');
