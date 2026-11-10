// ---------- THE FORGE: Idea → App, live ----------
// A GPU particle system that spells what you type, spins into a vortex while the "build" runs,
// then condenses into a phone showing the generated app. Terminal log + stage tracker stay in sync.
(function(){
const $=id=>document.getElementById(id);
const stage=$('forgeStage'),out=$('out'),inp=$('inp'),chips=$('chips'),form=$('form'),fstate=$('fstate'),fstat=$('fstat');
const stepEls=[...document.querySelectorAll('#fsteps b')];
if(!stage||!out)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const MONO='"JetBrains Mono",monospace',SANS='"Space Grotesk",sans-serif';

// ---------- app catalogue ----------
const APPS={
  'currency converter':{name:'Converter',color:'#27e39a',kind:'fx',log:['Parsing intent: live FX exchange','Wiring rates API ........ ok','Generating UI: 2 inputs, 1 chart','Applying dark + emerald theme']},
  'pomodoro focus timer':{name:'Focus',color:'#ff6a4d',kind:'timer',log:['Parsing intent: focus session tool','Adding timer engine ..... ok','Generating UI: ring timer, streaks','Offline mode enabled']},
  'tiny puzzle game':{name:'Tile Rush',color:'#b06bff',kind:'puzzle',log:['Parsing intent: mini game','Building game loop ....... ok','Generating UI: grid, score, haptics','Balancing difficulty']},
  'dev news stream':{name:'Dev Stream',color:'#3d8bff',kind:'news',log:['Parsing intent: technical feed','Aggregating sources ..... ok','Generating UI: cards, filters','Caching for offline reading']}
};
function custom(q){
  let h=0;for(const ch of q)h=(h*31+ch.charCodeAt(0))>>>0;
  const hue=h%360,col=new THREE_Color(hue);
  const name=q.replace(/\s+/g,' ').trim();
  return{name:name.length>14?name.slice(0,13)+'…':name[0].toUpperCase()+name.slice(1),color:col,kind:'custom',
    log:['Parsing intent: "'+(name.length>26?name.slice(0,25)+'…':name)+'"','Selecting components ..... ok','Generating UI: custom layout','Compiling to a runnable app']};
}
function THREE_Color(h){// hsl → hex
  const s=.85,l=.58,a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1))};
  return'#'+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');
}
const hexRGB=h=>{h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const hexA=(h,a)=>{const[r,g,b]=hexRGB(h);return`rgba(${r},${g},${b},${a})`};

// ---------- 2D bitmaps that become particle targets ----------
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function T(c,s,x,y,sz,col,al='left',w=700,f=SANS){c.font=`${w} ${sz}px ${f}`;c.fillStyle=col;c.textAlign=al;c.textBaseline='alphabetic';c.fillText(s,x,y)}
function bar(c,x,y,w,h,col){c.fillStyle=col;rr(c,x,y,w,h,h/2);c.fill()}
const UI={
  fx(c,col){
    T(c,'Converter',44,118,34,'#fff');T(c,'LIVE · 1 USD = 0.924 EUR',44,146,11,col,'left',500,MONO);
    [['USD','100.00',190],['EUR','92.41',302]].forEach(([a,b,y])=>{
      c.lineWidth=2;c.strokeStyle=col;rr(c,44,y,272,84,22);c.stroke();c.fillStyle=hexA(col,.08);c.fill();
      T(c,a,66,y+34,13,col,'left',600,MONO);T(c,b,66,y+66,30,'#fff')});
    c.lineWidth=3;c.strokeStyle='#fff';c.beginPath();c.arc(180,293,20,0,6.283);c.stroke();T(c,'⇅',180,301,20,'#fff','center');
    const pts=[0,.3,.18,.5,.42,.7,.55,.9,.78,.95];c.beginPath();
    pts.forEach((v,i)=>{const x=44+i*272/9,y=600-v*130;i?c.lineTo(x,y):c.moveTo(x,y)});
    c.lineWidth=4;c.strokeStyle=col;c.lineJoin='round';c.stroke();c.lineTo(316,620);c.lineTo(44,620);c.fillStyle=hexA(col,.14);c.fill();
    for(let i=0;i<4;i++)bar(c,44+i*72,648,56,6,hexA('#ffffff',.55));
  },
  timer(c,col){
    T(c,'Focus',44,118,34,'#fff');T(c,'SESSION 3 / 4',44,146,11,col,'left',500,MONO);
    c.lineCap='round';c.lineWidth=15;c.strokeStyle=hexA(col,.22);c.beginPath();c.arc(180,336,108,0,6.283);c.stroke();
    c.strokeStyle=col;c.lineWidth=16;c.beginPath();c.arc(180,336,108,-1.5708,-1.5708+6.283*.72);c.stroke();
    T(c,'24:12',180,356,56,'#fff','center');T(c,'DEEP WORK',180,396,12,col,'center',600,MONO);
    c.lineWidth=3;c.strokeStyle=col;rr(c,80,520,200,64,32);c.stroke();c.fillStyle=hexA(col,.16);c.fill();T(c,'PAUSE',180,560,22,'#fff','center');
    for(let i=0;i<7;i++){c.fillStyle=i<5?col:hexA('#fff',.25);c.beginPath();c.arc(84+i*32,640,8,0,6.283);c.fill()}
  },
  puzzle(c,col){
    T(c,'Tile Rush',44,118,34,'#fff');T(c,'SCORE 1280 · BEST 2048',44,146,11,col,'left',500,MONO);
    const on=[1,0,1,1, 0,1,0,1, 1,1,0,0, 0,1,1,1];
    on.forEach((v,i)=>{const x=44+(i%4)*70,y=190+(i/4|0)*70;c.lineWidth=2.5;c.strokeStyle=v?col:hexA('#fff',.3);rr(c,x,y,62,62,16);c.stroke();
      if(v){c.fillStyle=hexA(col,.2+((i*37)%5)*.12);c.fill();T(c,String(2<<(i%5)),x+31,y+41,22,'#fff','center')}});
    bar(c,44,500,272,10,hexA('#fff',.25));bar(c,44,500,190,10,col);
    T(c,'COMBO ×3',44,548,13,col,'left',600,MONO);
    c.lineWidth=3;c.strokeStyle='#fff';rr(c,44,590,272,60,30);c.stroke();T(c,'NEW GAME',180,628,20,'#fff','center');
  },
  news(c,col){
    T(c,'Dev Stream',44,118,34,'#fff');
    ['ALL','AI','WEB','OSS'].forEach((s,i)=>{c.lineWidth=2;c.strokeStyle=i?hexA(col,.6):col;rr(c,44+i*66,140,58,26,13);c.stroke();if(!i){c.fillStyle=col;c.fill()}T(c,s,73+i*66,158,11,i?col:'#000','center',600,MONO)});
    for(let i=0;i<4;i++){const y=196+i*118;c.lineWidth=2;c.strokeStyle=hexA(col,.7);rr(c,44,y,272,102,20);c.stroke();c.fillStyle=hexA(col,.06);c.fill();
      c.fillStyle=hexA(col,.55);rr(c,58,y+14,74,74,14);c.fill();
      bar(c,148,y+22,150-i*14,9,'#fff');bar(c,148,y+42,118,9,hexA('#fff',.55));bar(c,148,y+72,54,7,col)}
  },
  custom(c,col,app){
    T(c,app.name,44,118,app.name.length>9?30:36,'#fff');T(c,'GENERATED BY META BOX',44,146,11,col,'left',500,MONO);
    c.lineWidth=2.5;c.strokeStyle=col;rr(c,44,180,272,170,26);c.stroke();c.fillStyle=hexA(col,.16);c.fill();
    c.lineWidth=3;c.beginPath();c.arc(104,265,34,0,6.283);c.stroke();bar(c,160,244,120,12,'#fff');bar(c,160,270,84,10,hexA('#fff',.55));bar(c,160,296,56,8,col);
    for(let i=0;i<3;i++){const y=380+i*78;c.lineWidth=2;c.strokeStyle=hexA(col,.7);rr(c,44,y,272,64,18);c.stroke();
      c.fillStyle=col;c.beginPath();c.arc(80,y+32,14,0,6.283);c.fill();bar(c,108,y+20,150-i*20,9,'#fff');bar(c,108,y+38,100,7,hexA('#fff',.45))}
    for(let i=0;i<4;i++){c.fillStyle=i?hexA('#fff',.4):col;c.beginPath();c.arc(72+i*72,650,10,0,6.283);c.fill()}
  }
};
function phoneCanvas(app,q){
  const cv=document.createElement('canvas');cv.width=360;cv.height=720;const c=cv.getContext('2d');
  c.lineWidth=5;c.strokeStyle='#fff';rr(c,14,14,332,692,48);c.stroke();
  c.lineWidth=2;c.strokeStyle=app.color;rr(c,24,24,312,672,40);c.stroke();
  c.fillStyle=hexA(app.color,.07);c.fill();
  c.fillStyle='#fff';rr(c,132,38,96,22,11);c.fill();
  UI[app.kind](c,app.color,app,q);
  return cv;
}
function textCanvas(str){
  const cv=document.createElement('canvas');cv.width=1000;cv.height=260;const c=cv.getContext('2d');
  let sz=170;c.font=`700 ${sz}px ${SANS}`;while(c.measureText(str).width>940&&sz>46){sz-=6;c.font=`700 ${sz}px ${SANS}`}
  const g=c.createLinearGradient(0,0,1000,0);g.addColorStop(0,'#ffb21e');g.addColorStop(1,'#27e39a');
  c.fillStyle=g;c.textAlign='center';c.textBaseline='middle';c.fillText(str,500,134);return cv;
}

// ---------- WebGL engine ----------
function initGL(){
  if(!window.THREE)return null;
  const N=innerWidth<700?4500:9000;
  const renderer=new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);
  const cv=renderer.domElement;cv.className='forge-cv';stage.prepend(cv);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,.1,60);cam.position.z=10;
  const group=new THREE.Group();scene.add(group);
  const mk=n=>new Float32Array(N*n);
  const A={from:mk(3),to:mk(3),cf:mk(3),ct:mk(3),rnd:mk(4)};
  for(let i=0;i<N*4;i++)A.rnd[i]=Math.random();
  const geo=new THREE.BufferGeometry();
  const bufs={};
  const add=(name,arr,n)=>{const b=new THREE.BufferAttribute(arr,n);b.setUsage(THREE.DynamicDrawUsage);geo.setAttribute(name,b);bufs[name]=b};
  geo.setAttribute('position',new THREE.BufferAttribute(mk(3),3));
  add('aFrom',A.from,3);add('aTo',A.to,3);add('cFrom',A.cf,3);add('cTo',A.ct,3);add('aRnd',A.rnd,4);
  const U={uT:{value:0},uMorph:{value:1},uChaos:{value:0},uVort:{value:0},uAng:{value:0},uSpin:{value:1},uPx:{value:Math.min(devicePixelRatio,2)},
    uPR:{value:0},uPA:{value:0},uPtr:{value:new THREE.Vector2(99,99)},uPtrOn:{value:0}};
  const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`attribute vec3 aFrom,aTo,cFrom,cTo;attribute vec4 aRnd;
      uniform float uT,uMorph,uChaos,uVort,uAng,uSpin,uPx,uPR,uPA,uPtrOn;uniform vec2 uPtr;
      varying vec3 vC;
      mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
      void main(){
        float d=aRnd.x*.45;float m=clamp((uMorph-d)/.55,0.,1.);m=m*m*(3.-2.*m);
        vec3 p=mix(aFrom,aTo,m);vec3 c=mix(cFrom,cTo,m);
        float mid=sin(m*3.14159);
        p+=vec3(sin(uT*.8+aRnd.y*40.+p.y*1.3),cos(uT*.7+aRnd.z*40.+p.x*1.3),sin(uT*.6+aRnd.w*40.))*mid*1.4;
        float r=length(p.xy);
        p.xy=rot(uAng*uSpin*(1.2/(.6+r*.5)))*p.xy;
        p.xy=rot(uChaos*(uVort-r*.9))*p.xy;
        p*=1.+uChaos*.35*(.5+aRnd.y);
        p+=vec3(sin(uT*1.1+aRnd.y*60.),cos(uT*.9+aRnd.z*60.),sin(uT*1.3+aRnd.w*60.))*(.012+uChaos*.25);
        vec2 dd=p.xy-uPtr;float dl=length(dd);float f=smoothstep(1.3,0.,dl)*uPtrOn;
        p.xy+=normalize(dd+1e-4)*f*.55;p.z+=f*.9;
        float ring=exp(-pow((r-uPR)*2.2,2.))*uPA;
        p.z+=ring*1.5;p.xy*=1.+ring*.06;
        vC=c*(1.+ring*2.5+f*.8);
        vec4 mv=modelViewMatrix*vec4(p,1.);
        gl_PointSize=uPx*(1.5+aRnd.w*2.1+ring*3.)*(9./-mv.z)*(1.+mid*.4);
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader:`varying vec3 vC;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=smoothstep(.5,0.,d);gl_FragColor=vec4(vC*(.3+a*.9),a*.9);}`});
  const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;group.add(pts);

  // --- targets ---
  const gauss=()=>(Math.random()+Math.random()+Math.random()-1.5)/1.5;
  function galaxy(){
    const pos=mk(3),col=mk(3);
    for(let i=0;i<N;i++){
      const arm=i%3,r=Math.pow(Math.random(),.65)*3.5+.15,th=arm*2.0944+r*1.15+gauss()*.28/(.4+r*.3);
      pos[i*3]=Math.cos(th)*r;pos[i*3+1]=Math.sin(th)*r*.82;pos[i*3+2]=gauss()*.25*(1.2-r/4);
      const t=clamp(r/3.6),k=Math.random()<.06?1:0;
      col[i*3]=k?1:1-t*.85;col[i*3+1]=k?1:.7+t*.2;col[i*3+2]=k?1:.15+t*.35;
    }
    return{pos,col};
  }
  function bitmap(cv,scale,zj){
    const w=cv.width,h=cv.height,d=cv.getContext('2d').getImageData(0,0,w,h).data,idx=[];
    for(let i=0;i<w*h;i++)if(d[i*4+3]>10)idx.push(i);
    if(!idx.length)return galaxy();
    const pos=mk(3),col=mk(3);
    for(let n=0;n<N;n++){
      let i=idx[Math.random()*idx.length|0];
      for(let k=0;k<20&&Math.random()*255>=d[i*4+3];k++)i=idx[Math.random()*idx.length|0];
      const x=i%w,y=i/w|0;
      pos[n*3]=(x-w/2+Math.random()-.5)*scale;pos[n*3+1]=-(y-h/2+Math.random()-.5)*scale;pos[n*3+2]=(Math.random()-.5)*zj;
      col[n*3]=d[i*4]/255;col[n*3+1]=d[i*4+1]/255;col[n*3+2]=d[i*4+2]/255;
    }
    return{pos,col};
  }
  const gal=galaxy();
  A.from.set(gal.pos);A.to.set(gal.pos);A.cf.set(gal.col);A.ct.set(gal.col);

  // --- tweens ---
  const tws=[];
  const e3=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  function tw(o,k,to,dur,ease=e3,delay=0){
    for(let i=tws.length-1;i>=0;i--)if(tws[i].o===o&&tws[i].k===k)tws.splice(i,1);
    return new Promise(res=>tws.push({o,k,from:o[k],to,dur:dur*1000,delay:delay*1000,t:0,ease,res}));
  }
  const S={morph:1,chaos:0,spin:1,pr:0,pa:0};
  function retarget(tg,dur=1.6){
    const um=S.morph;
    for(let i=0;i<N;i++){
      let m=clamp((um-A.rnd[i*4]*.45)/.55);m=m*m*(3-2*m);
      for(let k=0;k<3;k++){const j=i*3+k;A.from[j]=A.from[j]*(1-m)+A.to[j]*m;A.cf[j]=A.cf[j]*(1-m)+A.ct[j]*m}
    }
    A.to.set(tg.pos);A.ct.set(tg.col);
    bufs.aFrom.needsUpdate=bufs.aTo.needsUpdate=bufs.cFrom.needsUpdate=bufs.cTo.needsUpdate=true;
    S.morph=0;return tw(S,'morph',1,reduce?.01:dur,e3);
  }
  function pulse(a=1,spd=1.5){S.pr=0;S.pa=a;tw(S,'pr',6,spd);return tw(S,'pa',0,spd,t=>t)}

  // --- layout / pointer ---
  let visH=1,visW=1,desk=true,ndc={x:0,y:0},rot={x:0,y:0};
  function resize(){
    const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
    visH=2*Math.tan(20*Math.PI/180)*10;visW=visH*cam.aspect;desk=stage.parentElement.clientWidth>900;
    const s=Math.min(visW / 4.8, visH / 6.2);
    group.position.x = 0;
    group.position.y = 0;
  }
  new ResizeObserver(resize).observe(stage);resize();
  stage.addEventListener('pointermove',e=>{
    const r=stage.getBoundingClientRect();ndc.x=((e.clientX-r.left)/r.width)*2-1;ndc.y=-(((e.clientY-r.top)/r.height)*2-1);
    const s=group.scale.x;U.uPtr.value.set((ndc.x*visW/2-group.position.x)/s,(ndc.y*visH/2)/s);U.uPtrOn.value=1;
  });
  stage.addEventListener('pointerleave',()=>{U.uPtrOn.value=0;ndc.x=ndc.y=0});

  // --- loop ---
  let vis=false,last=performance.now(),acc=0,fr=0,ft=0;
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;last=performance.now()},{threshold:.05}).observe(stage);
  function frame(now){
    requestAnimationFrame(frame);if(!vis)return;
    const dt=Math.min(50,now-last);last=now;
    for(let i=tws.length-1;i>=0;i--){const t=tws[i];
      if(t.delay>0){t.delay-=dt;continue}
      t.t+=dt;const p=clamp(t.t/t.dur);t.o[t.k]=t.from+(t.to-t.from)*t.ease(p);
      if(p>=1){tws.splice(i,1);t.res()}}
    S.vort+=dt*.003*(S.chaos>.01?1:0);if(S.chaos<.01)S.vort=0;
    S.ang+=dt*.00022*S.spin;
    U.uT.value=now/1000;U.uMorph.value=S.morph;U.uChaos.value=S.chaos;U.uVort.value=S.vort;U.uAng.value=S.ang;U.uSpin.value=S.spin;
    U.uPR.value=S.pr;U.uPA.value=S.pa;
    rot.y+=(ndc.x*.5-rot.y)*.06;rot.x+=(-ndc.y*.3-rot.x)*.06;
    group.rotation.y=rot.y+Math.sin(now/2600)*.04;group.rotation.x=rot.x;
    renderer.render(scene,cam);
    fr++;ft+=dt;if(ft>600){fstat.textContent=N.toLocaleString('en')+' particles · '+Math.round(fr*1000/ft)+' fps';fr=ft=0}
  }
  S.vort=0;S.ang=0;
  requestAnimationFrame(frame);

  return{
    galaxy(){tw(S,'spin',1,1.4);tw(S,'chaos',0,1);return retarget(galaxy(),1.8)},
    text(str){tw(S,'spin',0,.8);return retarget(bitmap(textCanvas(str),.0062,.25),1.1)},
    chaos(v,d=1){return tw(S,'chaos',v,d)},
    phone(app,q){
  tw(S,'spin',0,1.2);
  tw(S,'chaos',0,2.2,e3,.15);
  return retarget(bitmap(phoneCanvas(app,q), 5.5/720, .35), 2.4)
},
    pulse,
    N
  };
}
let V=null;try{V=initGL()}catch(e){console.warn('forge: webgl unavailable',e)}
if(!V){stage.classList.add('nogl');fstat.textContent='webgl unavailable'}
else fstat.textContent=V.N.toLocaleString('en')+' particles';

// ---------- terminal / pipeline ----------
let busy=false,mode='idle';
const setState=s=>{fstate.textContent=s};
function setStep(n){stepEls.forEach((b,i)=>{b.classList.toggle('done',i<n);b.classList.toggle('on',i===n)})}
async function line(txt,cls=''){
  const el=document.createElement('div');el.className='ln run '+cls;el.innerHTML='<i></i><span></span>';out.append(el);
  const sp=el.lastChild;
  for(let i=1;i<=txt.length;i++){sp.textContent=txt.slice(0,i);if(!reduce)await sleep(14)}
  await sleep(reduce?0:220);el.classList.replace('run','done');
}
async function build(q){
  if(busy)return;busy=true;
  try{
    await document.fonts.ready;
    const app=APPS[q.toLowerCase().trim()]||custom(q);
    out.innerHTML='';const t0=performance.now();
    const head=document.createElement('div');head.className='ln cmd';head.textContent='$ metabox build "'+q.slice(0,60)+'"';out.append(head);
    setStep(0);setState('PARSING');
    if(V){V.pulse(.8,1.2);V.text(q)}
    await line(app.log[0]);
    setStep(1);setState('WIRING');
    if(V){V.chaos(1,1.1)}
    await line(app.log[1]);await line(app.log[2]);
    setStep(2);setState('COMPOSING');
    if(V)V.phone(app,q);
    await line(app.log[3]);
    if(V)await sleep(900);
    setStep(4);setState('READY');mode='ready';
    if(V)V.pulse(1,1.8);
    const secs=((performance.now()-t0)/1000).toFixed(1);
    await line('✔ App ready in '+secs+'s','ok');
    const hint=document.createElement('div');hint.className='ln hint';hint.textContent=V?'↳ move over the phone · click it to shatter':'';out.append(hint);
  }finally{busy=false}
}

// chips
Object.keys(APPS).forEach(k=>{
  const b=document.createElement('button');b.type='button';b.textContent=k;b.dataset.cursor='run';
  b.onclick=()=>build(k);
  b.onpointerenter=()=>{if(!busy&&V&&mode!=='ready'){setState('PREVIEW');V.text(k)}};
  b.onpointerleave=()=>{if(!busy&&V&&mode!=='ready'){const v=inp.value.trim();v?V.text(v):V.galaxy();setState(v?'TYPING':'IDLE')}};
  chips.append(b);
});
form.onsubmit=e=>{e.preventDefault();const v=inp.value.trim();if(v){inp.value='';build(v)}};
let typeT=0;
inp.addEventListener('input',()=>{
  if(busy||!V)return;mode='typing';
  clearTimeout(typeT);V.pulse(.45,.9);
  typeT=setTimeout(()=>{const v=inp.value.trim().slice(0,28);if(busy)return;if(v){setState('TYPING');V.text(v)}else{mode='idle';setState('IDLE');V.galaxy()}},140);
});
stage.addEventListener('click',()=>{
  if(!V||busy||mode!=='ready')return;
  mode='idle';setState('SHATTERED');V.pulse(1,1.2);V.chaos(.9,.5).then(()=>V.galaxy());setStep(-1);
});
// intro: spell "IDEA" the first time the stage scrolls into view
if(V){
  let seen=false;
  new IntersectionObserver((es,ob)=>{if(!es[0].isIntersecting||seen)return;seen=true;ob.disconnect();
    setTimeout(()=>{if(busy||mode!=='idle'||inp.value)return;setState('SPELLING');V.text('Idea → App').then(async()=>{await sleep(1300);if(!busy&&mode==='idle'&&!inp.value){setState('IDLE');V.galaxy()}})},500)},{threshold:.5}).observe(stage);
}
setStep(-1);setState('IDLE');
})();
