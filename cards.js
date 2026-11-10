// ---------- Cartridge cards: spring-physics tilt, foil tracking, flip sound ----------
(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cards=[...document.querySelectorAll('.card')];
if(!cards.length)return;

const URLS=[
  'https://play.google.com/store/apps/details?id=com.metaframe.metabox',
  'https://play.google.com/store/apps/details?id=com.metaframe.neurodivergence',
  'https://play.google.com/store/apps/details?id=com.metaframe.mindhouse',
  'https://play.google.com/store/apps/details?id=com.metaframe.divergentai',
  'https://play.google.com/store/apps/details?id=com.melihcandemir.focustabs',
  'https://play.google.com/store/apps/details?id=com.melihcandemir.mindbook.free',
  'https://play.google.com/store/apps/details?id=com.melihcandemir.mindbook'
];
// per-card action buttons on the back face: 3D view + Google Play
cards.forEach((c,i)=>{
  const back=c.querySelector('.back'),img=c.querySelector('img');
  const info={
    id:'MF-0'+(i+1),index:i,name:c.querySelector('h3').textContent,tag:c.querySelector('p').textContent,
    desc:[...back.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim(),
    color:getComputedStyle(c).getPropertyValue('--c').trim()||'#27e39a',icon:img?img.getAttribute('src'):'',url:URLS[i]||'#'
  };
  const row=document.createElement('div');row.className='acts';
  const b3=document.createElement('button');b3.type='button';b3.textContent='VIEW IN 3D';b3.dataset.cursor='open';
  b3.onclick=e=>{e.stopPropagation();window.__open3D&&window.__open3D(info)};
  const pl=document.createElement('a');pl.href=info.url;pl.target='_blank';pl.rel='noopener';pl.textContent='GOOGLE PLAY ↗';pl.dataset.cursor='open';
  pl.onclick=e=>e.stopPropagation();
  row.append(b3,pl);back.append(row);
});

const S=cards.map((c,i)=>{
  // drop the old instant tilt from main.js, we drive it with springs instead
  c.onpointermove=null;c.onpointerleave=null;c.style.transform='';
  c.style.setProperty('--i',i);c.style.setProperty('--d',(i*.09)+'s');
  const st={c,rx:0,ry:0,vx:0,vy:0,tx:0,ty:0,hi:0,thi:0,px:50,py:50,tpx:50,tpy:50,active:false};
  if(!reduce){
    c.addEventListener('pointermove',e=>{
      const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      st.ty=(x-.5)*26;st.tx=-(y-.5)*22;st.tpx=x*100;st.tpy=y*100;st.thi=1;st.active=true;
    });
    c.addEventListener('pointerleave',()=>{st.tx=st.ty=0;st.thi=0;st.tpx=st.tpy=50});
    c.addEventListener('pointerenter',()=>{st.active=true});
  }
  c.addEventListener('click',()=>{
    const s=window.__snd;if(s&&s.on){s.tone(180,.35,'sawtooth',.05);s.tone(1200,.25,'sine',.04,.05);s.tone(600,.4,'triangle',.05,.1)}
    // spring kick on flip
    st.vy+=c.classList.contains('flip')?-14:14;st.active=true;
  });
  return st;
});

// underdamped spring => the card overshoots and settles like a real object
const K=.09,D=.78;
function loop(){
  for(const s of S){
    if(!s.active)continue;
    s.vx=(s.vx+(s.tx-s.rx)*K)*D;s.vy=(s.vy+(s.ty-s.ry)*K)*D;
    s.rx+=s.vx;s.ry+=s.vy;
    s.hi+=(s.thi-s.hi)*.12;s.px+=(s.tpx-s.px)*.2;s.py+=(s.tpy-s.py)*.2;
    const c=s.c;
    c.style.setProperty('--rx',s.rx.toFixed(2)+'deg');c.style.setProperty('--ry',s.ry.toFixed(2)+'deg');
    c.style.setProperty('--px',s.px.toFixed(1)+'%');c.style.setProperty('--py',s.py.toFixed(1)+'%');
    c.style.setProperty('--hi',s.hi.toFixed(3));
    if(!s.thi&&Math.abs(s.rx)+Math.abs(s.ry)+Math.abs(s.vx)+Math.abs(s.vy)<.02&&s.hi<.01)s.active=false;
  }
  requestAnimationFrame(loop);
}
loop();
})();
