// ---------- repo-intelligence-layer: 3-depth knowledge-graph scene, pointer parallax, 6-gate verifier ----------
(function(){
const st=document.querySelector('#intel .stage');if(!st)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const hud=st.querySelector('.hud'),title=st.querySelector('.ttl');
const layers=[...st.querySelectorAll('.layer')];
const gates=[...st.querySelectorAll('.gate')];
const cv=[...st.querySelectorAll('canvas')];
const DPR=Math.min(devicePixelRatio||1,2);
let W=0,H=0,mx=0,my=0,tx=0,ty=0,visible=false,t=0,pulse=0;

// three graph layers: far (dim, slow), mid, near (bright, big, blurry)
const cfg=[{n:46,r:1.2,a:.25,link:110,z:.012,hue:'39,227,154'},{n:34,r:2,a:.5,link:150,z:.03,hue:'39,227,154'},{n:12,r:4.5,a:.75,link:240,z:.07,hue:'255,178,30'}];
const L=cfg.map((c,i)=>({c,ctx:cv[i].getContext('2d'),p:[]}));
function size(){
  const r=st.getBoundingClientRect();W=r.width*1.12;H=r.height*1.12;
  cv.forEach(c=>{c.width=W*DPR;c.height=H*DPR});
  L.forEach(l=>{l.ctx.setTransform(DPR,0,0,DPR,0,0);const k=innerWidth<700?.55:1;const n=Math.round(l.c.n*k);
    l.p=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,ph:Math.random()*6.28}))});
}
addEventListener('resize',size);size();

st.addEventListener('pointermove',e=>{
  const r=st.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5;
  st.style.setProperty('--mx',(mx+.5)*100+'%');st.style.setProperty('--my',(my+.5)*100+'%');
});
st.addEventListener('pointerleave',()=>{mx=my=0});
st.addEventListener('click',()=>{pulse=1;const s=window.__snd;if(s&&s.on){s.tone(220,.3,'sine',.05);s.tone(880,.3,'triangle',.04,.08)}});
new IntersectionObserver(e=>{visible=e[0].isIntersecting},{threshold:.05}).observe(st);

function draw(){
  for(let li=0;li<L.length;li++){
    const {c,ctx,p}=L[li];ctx.clearRect(0,0,W,H);
    // gravity toward pointer gives the graph a living feel
    const gx=(mx+.5)*W,gy=(my+.5)*H;
    for(const n of p){
      n.ph+=.02;n.x+=n.vx;n.y+=n.vy;
      if(!reduce&&(mx||my)){n.x+=(gx-n.x)*.0004*(li+1);n.y+=(gy-n.y)*.0004*(li+1)}
      if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1;
    }
    ctx.lineWidth=li===2?1.2:.7;
    for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++){
      const dx=p[i].x-p[j].x,dy=p[i].y-p[j].y,d=Math.hypot(dx,dy);
      if(d<c.link){const a=(1-d/c.link)*c.a*(.6+pulse*.8);
        ctx.strokeStyle=`rgba(${c.hue},${a})`;ctx.beginPath();ctx.moveTo(p[i].x,p[i].y);ctx.lineTo(p[j].x,p[j].y);ctx.stroke();
        // data packet travelling along an edge
        if(li>0&&(i+j)%7===0){const k=(t*.4+i*.13)%1;ctx.fillStyle=`rgba(${c.hue},${Math.min(1,a*3)})`;
          ctx.fillRect(p[i].x+(p[j].x-p[i].x)*k-1.5,p[i].y+(p[j].y-p[i].y)*k-1.5,3,3)}}
    }
    for(const n of p){
      const r=c.r*(1+.25*Math.sin(n.ph))+pulse*2;
      ctx.fillStyle=`rgba(${c.hue},${c.a+.2})`;ctx.shadowColor=`rgb(${c.hue})`;ctx.shadowBlur=li===2?24:8;
      ctx.beginPath();ctx.arc(n.x,n.y,r,0,6.283);ctx.fill();
    }
    ctx.shadowBlur=0;
  }
}

let gi=-1,gt=0;
function loop(){
  requestAnimationFrame(loop);
  if(!visible)return;
  t+=.016;pulse*=.94;
  tx+=(mx-tx)*.07;ty+=(my-ty)*.07;
  if(!reduce){
    layers.forEach(l=>{const z=parseFloat(l.dataset.z||0);
      l.style.transform=`translate3d(${-tx*z*W}px,${-ty*z*H}px,0) scale(${1+z*2})`});
    st.style.transform=`perspective(1200px) rotateY(${tx*5}deg) rotateX(${-ty*5}deg)`;
    hud.style.transform=`translate3d(${tx*14}px,${ty*10}px,0)`;
  }
  draw();
  // verification chain lights up gate by gate, then loops
  gt+=.016;if(gt>.7){gt=0;gi++;if(gi>6){gi=-1;gates.forEach(g=>g.classList.remove('on'))}else if(gi<6)gates[gi].classList.add('on')}
}
layers.forEach((l,i)=>{if(!l.dataset.z)l.dataset.z=[.0,.012,.03,.07][i]||0});
loop();

// title scramble on first view
if(!reduce&&title){
  const txt=title.dataset.t||title.textContent,ch='01<>/{}#$%';let done=false;
  new IntersectionObserver((e,o)=>{if(!e[0].isIntersecting||done)return;done=true;o.disconnect();let f=0;
    const iv=setInterval(()=>{f++;title.innerHTML=[...txt].map((c,i)=>c===' '||c==='\n'?c:(i<f/2?c:ch[Math.random()*ch.length|0])).join('').replace(/(intelligence)/i,'<em>$1</em>');
      if(f>txt.length*2){clearInterval(iv);title.innerHTML=txt.replace(/(intelligence)/i,'<em>$1</em>')}},30)},{threshold:.4}).observe(title);
}
})();
