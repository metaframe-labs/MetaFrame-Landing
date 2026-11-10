// ---------- 3D phone showcase: opens from a card, drag to rotate, live app UI on screen ----------
(function(){
if(!window.THREE)return;
let stage,canvas,renderer,scene,camera,phone,screenMat,glareTex,ring,light,info,raf=0,open=false;
let rotY=0,rotX=0,vY=0,drag=false,lx=0,ly=0,t0=0,mx=0,my=0,fr=0;
let sCv,sCtx,sTex,iconImg=null,backMat,bump;
const SW=512,SH=1088;

// ---------- helpers ----------
function rr(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function mix(h,k,w){const a=rgb(h);return`rgb(${a.map(v=>Math.round(v+(k-v)*w)).join(',')})`}
function lum(h){const[r,g,b]=rgb(h);return(.299*r+.587*g+.114*b)/255}
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};

// ---------- live app UI (light theme) ----------
const INK='#14141c',SUB='#6e6e7a',BG='#f4f5fa',CARD='#ffffff';
function T(c,s,x,y,sz,col,w='600',al='left',f='"Space Grotesk",sans-serif'){c.font=`${w} ${sz}px ${f}`;c.fillStyle=col;c.textAlign=al;c.fillText(s,x,y)}
function card(c,x,y,w,h,r=26,col=CARD){c.save();c.shadowColor='rgba(20,20,40,.12)';c.shadowBlur=24;c.shadowOffsetY=8;c.fillStyle=col;rrect(c,x,y,w,h,r);c.fill();c.restore()}
function arcRing(c,x,y,r,p,col,lw=16,track='rgba(20,20,40,.08)'){
  c.lineWidth=lw;c.lineCap='round';c.strokeStyle=track;c.beginPath();c.arc(x,y,r,0,6.283);c.stroke();
  c.strokeStyle=col;c.beginPath();c.arc(x,y,r,-1.5708,-1.5708+6.283*p);c.stroke();
}
const typed=(s,t,sp=14)=>s.slice(0,Math.floor(clamp(t*sp,0,s.length)));

const UI=[
  // 0 Meta Box: prompt -> build steps -> generated app
  (c,i,t)=>{
    const col=i.color,P=t%9,txt='a pomodoro timer app';
    card(c,36,270,440,96,28);
    T(c,typed(txt,P,9)+(Math.floor(t*2)%2?'|':''),64,330,28,INK,'500');
    c.fillStyle=col;rrect(c,380,290,80,56,20);c.fill();T(c,'GO',420,327,22,lum(col)>.6?'#000':'#fff','700','center');
    ['Parsing intent','Wiring timer engine','Generating UI','Compiling app'].forEach((s,k)=>{
      const a=clamp((P-2.4-k*.9)*3);if(a<=0)return;c.globalAlpha=a;
      c.fillStyle=col;c.beginPath();c.arc(66,420+k*52,13,0,6.283);c.fill();
      T(c,'✓',66,428+k*52,18,lum(col)>.6?'#000':'#fff','700','center');T(c,s,96,430+k*52,24,INK,'500');c.globalAlpha=1});
    const a=ease(clamp((P-6.2)*1.2));if(a>0){c.save();c.translate(256,820);c.scale(a,a);
      card(c,-190,-150,380,300,34);arcRing(c,0,-10,84,clamp((P-6.2)/2.6),col,16);T(c,'25:00',0,2,38,INK,'700','center');
      T(c,'your new app',0,118,20,SUB,'500','center');c.restore()}
  },
  // 1 Neurodivergence: breathing orb
  (c,i,t)=>{
    const col=i.color===('#e8e8e8')?'#6a5cff':i.color,b=(Math.sin(t*.9)+1)/2;
    for(let k=4;k>=0;k--){const r=90+k*38+b*34*(1+k*.15);c.fillStyle=mix(col,255,.5+k*.1);c.globalAlpha=.16+.1*(4-k)/4;c.beginPath();c.arc(256,600,r,0,6.283);c.fill()}
    c.globalAlpha=1;c.fillStyle=col;c.beginPath();c.arc(256,600,70+b*26,0,6.283);c.fill();
    T(c,b>.5?'breathe in':'breathe out',256,830,34,INK,'600','center');
    T(c,'how does your mind feel today?',256,872,20,SUB,'500','center');
    ['Focus','Flow','Calm'].forEach((s,k)=>{const on=Math.floor(t/2)%3===k;c.fillStyle=on?col:'#fff';c.globalAlpha=on?1:.9;rrect(c,60+k*136,930,124,52,26);c.fill();c.globalAlpha=1;T(c,s,122+k*136,964,20,on?(lum(col)>.6?'#000':'#fff'):INK,'600','center')});
  },
  // 2 Mindhouse: chat tutor + streak chart
  (c,i,t)=>{
    const col=i.color,P=t%8;
    c.fillStyle=col;rrect(c,200,280,276,74,28);c.fill();T(c,'Explain photosynthesis',224,326,22,'#fff','500');
    const a=clamp((P-1)*2);if(a>0){c.globalAlpha=a;card(c,36,380,420,200,28);
      [1,.92,.78,.5].forEach((w,k)=>{const rw=clamp((P-1.6-k*.5)*2)*360*w;c.fillStyle='rgba(20,20,40,.12)';rrect(c,62,408+k*34,rw,16,8);c.fill()});
      c.globalAlpha=1}
    if(P>.6&&P<1.6)for(let k=0;k<3;k++){c.fillStyle='#bbb';c.beginPath();c.arc(70+k*24,416+Math.sin(t*8+k)*5,7,0,6.283);c.fill()}
    card(c,36,630,440,300,30);T(c,'Study streak',64,680,24,INK,'700');T(c,'7 days',448,680,22,col,'700','right');
    for(let k=0;k<7;k++){const h=(60+((k*53)%90))*ease(clamp((t-.3-k*.12)*1.3));c.fillStyle=k===6?col:mix(col,255,.6);rrect(c,66+k*58,900-h,38,h,12);c.fill()}
  },
  // 3 Divergent AI: non-linear idea graph
  (c,i,t)=>{
    const col=i.color,N=[];for(let k=0;k<8;k++){const a=t*.25+k*.785,r=150+Math.sin(t*.7+k*2)*50;N.push([256+Math.cos(a)*r*1.05,640+Math.sin(a*1.3)*r*1.15])}
    c.lineWidth=2;N.forEach((p,k)=>{[(k+1)%8,(k+3)%8].forEach(j=>{c.strokeStyle=mix(col,255,.55);c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(N[j][0],N[j][1]);c.stroke()});c.strokeStyle=col;c.globalAlpha=.5;c.beginPath();c.moveTo(256,640);c.lineTo(p[0],p[1]);c.stroke();c.globalAlpha=1});
    N.forEach((p,k)=>{c.fillStyle='#fff';c.shadowColor='rgba(20,20,40,.2)';c.shadowBlur=14;c.beginPath();c.arc(p[0],p[1],22+(k%3)*5,0,6.283);c.fill();c.shadowBlur=0;c.fillStyle=k%2?col:mix(col,255,.5);c.beginPath();c.arc(p[0],p[1],9+(k%3)*3,0,6.283);c.fill()});
    c.fillStyle=col;c.beginPath();c.arc(256,640,46+Math.sin(t*3)*5,0,6.283);c.fill();T(c,'AI',256,652,32,lum(col)>.6?'#000':'#fff','700','center');
    T(c,'non-linear thinking map',256,960,22,SUB,'500','center');
  },
  // 4 FocusTabs: timer + tab stack
  (c,i,t)=>{
    const col=i.color,p=(t%12)/12,sec=Math.round(1500*(1-p)),m=String(Math.floor(sec/60)).padStart(2,'0'),s=String(sec%60).padStart(2,'0');
    card(c,36,270,440,420,40);arcRing(c,256,470,130,p,col,22);T(c,`${m}:${s}`,256,486,60,INK,'700','center');T(c,'deep focus',256,640,22,SUB,'500','center');
    ['Research · 3 tabs','Writing · 2 tabs','Inbox · muted'].forEach((s,k)=>{const on=Math.floor(t/3)%3===k;
      card(c,36+(on?0:14),720+k*84,440-(on?0:28),68,22,on?col:CARD);T(c,s,70,762+k*84,22,on?(lum(col)>.6?'#000':'#fff'):INK,'600')});
  },
  // 5 Mindbook Lite / 6 Mindbook: notes
  (c,i,t)=>note(c,i,t,false),(c,i,t)=>note(c,i,t,true)
];
function note(c,i,t,md){
  const col=i.color,P=t%10;card(c,36,270,440,640,32);
  T(c,typed(md?'# Launch plan':'Quick note',P,10),68,334,md?36:34,INK,'700');
  const L=md?['- ship v2 to beta','- write release notes','- sync across devices']:['groceries, ideas,','things not to forget','call mom'];
  L.forEach((s,k)=>T(c,typed(s,P-1.2-k*1.1,16),68,400+k*50,26,k===0?INK:SUB,'500'));
  if(md){const a=clamp((P-5)*1.5);c.globalAlpha=a;c.fillStyle='#10131c';rrect(c,60,580,392,150,18);c.fill();
    T(c,'const sync = () => cloud.push()',80,640,19,'#9ef0c9','500','left','"JetBrains Mono",monospace');T(c,'// markdown + code blocks',80,680,17,'#6c7088','400','left','"JetBrains Mono",monospace');c.globalAlpha=1;
    c.fillStyle=mix(col,255,.78);rrect(c,60,770,190,48,24);c.fill();c.fillStyle=col;c.beginPath();c.arc(88,794,7+Math.sin(t*4)*2,0,6.283);c.fill();T(c,'synced to cloud',104,801,18,INK,'600')}
  else{c.fillStyle=mix(col,255,.78);rrect(c,60,580,150,48,24);c.fill();T(c,'offline · fast',135,611,18,INK,'600','center')}
}
function drawScreen(i,t){
  const c=sCtx,col=i.color,dark=lum(col)<.55,hc=dark?'#fff':'#000';
  c.clearRect(0,0,SW,SH);c.save();rrect(c,0,0,SW,SH,66);c.clip();
  c.fillStyle=BG;c.fillRect(0,0,SW,SH);
  // coloured header
  const g=c.createLinearGradient(0,0,SW,230);g.addColorStop(0,col);g.addColorStop(1,mix(col,0,.35));c.fillStyle=g;c.fillRect(0,0,SW,230);
  T(c,'9:41',48,66,24,hc,'600');
  // app icon + name
  if(iconImg){c.save();rrect(c,40,106,84,84,22);c.clip();c.drawImage(iconImg,40,106,84,84);c.restore()}
  else{c.fillStyle='rgba(255,255,255,.3)';rrect(c,40,106,84,84,22);c.fill()}
  T(c,i.name,142,148,38,hc,'700');T(c,i.tag,142,182,20,hc,'500');c.globalAlpha=.8;
  c.fillStyle='#000';rrect(c,SW/2-60,28,120,36,18);c.fill();c.globalAlpha=1;
  // app content
  c.save();c.beginPath();c.rect(0,240,SW,SH-240);c.clip();(UI[i.index]||UI[0])(c,i,t);c.restore();
  // bottom bar
  card(c,56,1000,400,64,32);[0,1,2,3].forEach(k=>{c.fillStyle=k===0?col:'rgba(20,20,40,.18)';c.beginPath();c.arc(116+k*93,1032,k===0?11:8,0,6.283);c.fill()});
  c.restore();
}
function drawBack(i){
  const W=512,H=1058,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
  c.save();rrect(c,0,0,W,H,95);c.clip();
  const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,mix(i.color,0,.1));g.addColorStop(1,mix(i.color,0,.7));c.fillStyle=g;c.fillRect(0,0,W,H);
  const sh=c.createLinearGradient(0,0,W,H);sh.addColorStop(.3,'rgba(255,255,255,0)');sh.addColorStop(.5,'rgba(255,255,255,.18)');sh.addColorStop(.7,'rgba(255,255,255,0)');c.fillStyle=sh;c.fillRect(0,0,W,H);
  // frosted-glass grain
  const im=c.getImageData(0,0,W,H),d=im.data;for(let k=0;k<d.length;k+=4){const n=(Math.random()-.5)*14;d[k]+=n;d[k+1]+=n;d[k+2]+=n}c.putImageData(im,0,0);
  // soft top-left sheen + edge vignette
  const rg2=c.createRadialGradient(W*.25,H*.18,10,W*.25,H*.18,W*.9);rg2.addColorStop(0,'rgba(255,255,255,.22)');rg2.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=rg2;c.fillRect(0,0,W,H);
  const vg=c.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H*.65);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.35)');c.fillStyle=vg;c.fillRect(0,0,W,H);
  const dk=lum(i.color)<.55,fc=dk?'rgba(255,255,255,.55)':'rgba(0,0,0,.45)';
  // subtle etched logo, like a real phone
  // brand wordmark
  c.save();c.textAlign='left';c.textBaseline='alphabetic';c.shadowColor=dk?'rgba(0,0,0,.35)':'rgba(255,255,255,.4)';c.shadowBlur=6;c.shadowOffsetY=2;
  c.font='700 62px "Space Grotesk","Inter",system-ui,sans-serif';const w1=c.measureText('MetaFrame').width;
  c.font='300 62px "Space Grotesk","Inter",system-ui,sans-serif';const w2=c.measureText(' Labs').width;
  const x0=(W-w1-w2)/2,yy=H/2+150,wf=dk?'rgba(255,255,255,.92)':'rgba(0,0,0,.82)';
  c.font='700 62px "Space Grotesk","Inter",system-ui,sans-serif';c.fillStyle=wf;c.fillText('MetaFrame',x0,yy);
  c.font='300 62px "Space Grotesk","Inter",system-ui,sans-serif';c.fillStyle=dk?'rgba(255,255,255,.65)':'rgba(0,0,0,.55)';c.fillText(' Labs',x0+w1,yy);
  c.restore();
  c.fillStyle=wf;c.globalAlpha=.5;c.fillRect(W/2-24,yy+26,48,3);c.globalAlpha=1;
  c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=3;rrect(c,2,2,W-4,H-4,93);c.stroke();  c.restore();
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;
}

// ---------- scene ----------
function build(){
  stage=document.createElement('div');stage.id='stage';stage.setAttribute('data-lenis-prevent','');
  stage.innerHTML='<canvas></canvas><button class="x" aria-label="close">✕</button><div class="panel"><span class="mid"></span><h3></h3><em></em><p></p><div class="row"><a class="play" target="_blank" rel="noopener">GOOGLE PLAY ↗</a></div><small>drag to rotate</small></div>';
  document.body.append(stage);canvas=stage.querySelector('canvas');
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(32,1,.1,50);
  scene.add(new THREE.AmbientLight(0xffffff,.7));
  const key=new THREE.DirectionalLight(0xffffff,1.8);key.position.set(3,4,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0x88aaff,1.2);rim.position.set(-5,-1,-4);scene.add(rim);
  light=new THREE.PointLight(0xffffff,40,14);light.position.set(0,-2.4,3);scene.add(light);

  phone=new THREE.Group();scene.add(phone);
  const body=new THREE.ExtrudeGeometry(rr(2.2,4.5,.4),{depth:.18,bevelEnabled:true,bevelThickness:.07,bevelSize:.07,bevelSegments:8,curveSegments:24});
  body.translate(0,0,-.09);
  phone.add(new THREE.Mesh(body,new THREE.MeshStandardMaterial({color:0x1d1d26,metalness:.8,roughness:.3})));
  const bm=new THREE.MeshStandardMaterial({color:0x2a2a33,metalness:.9,roughness:.3});
  [[1.17,.9,.5],[1.17,.1,.5],[-1.17,.7,.35]].forEach(([x,y,h])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.06,h,.1),bm);b.position.set(x,y,0);phone.add(b)});

  // front screen (live canvas texture, created synchronously so it is never empty)
  sCv=document.createElement('canvas');sCv.width=SW;sCv.height=SH;sCtx=sCv.getContext('2d');
  sTex=new THREE.CanvasTexture(sCv);sTex.colorSpace=THREE.SRGBColorSpace;sTex.anisotropy=8;
  screenMat=new THREE.MeshBasicMaterial({map:sTex,transparent:true,alphaTest:.02,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const sh=2.0*SH/SW;
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(2.0,sh),screenMat);screen.position.z=.18;phone.add(screen);
  const gc=document.createElement('canvas');gc.width=gc.height=256;const g=gc.getContext('2d');
  const gg=g.createLinearGradient(0,0,256,256);gg.addColorStop(.35,'rgba(255,255,255,0)');gg.addColorStop(.5,'rgba(255,255,255,.3)');gg.addColorStop(.65,'rgba(255,255,255,0)');g.fillStyle=gg;g.fillRect(0,0,256,256);
  glareTex=new THREE.CanvasTexture(gc);glareTex.wrapS=glareTex.wrapT=THREE.RepeatWrapping;glareTex.repeat.set(1.4,1.4);
  const glare=new THREE.Mesh(new THREE.PlaneGeometry(2.0,sh),new THREE.MeshBasicMaterial({map:glareTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  glare.position.z=.19;phone.add(glare);

  // back plate + camera bump
  backMat=new THREE.MeshPhysicalMaterial({metalness:.15,roughness:.45,clearcoat:.8,clearcoatRoughness:.25,transparent:true,alphaTest:.02});
  const back=new THREE.Mesh(new THREE.PlaneGeometry(2.14,2.14*1058/512),backMat);back.rotation.y=Math.PI;back.position.z=-.175;phone.add(back);
  bump=new THREE.Group();bump.position.set(.5,1.5,-.2);bump.rotation.y=Math.PI;phone.add(bump);
  const isl=new THREE.ExtrudeGeometry(rr(1.0,1.0,.28),{depth:.05,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:6,curveSegments:16});isl.translate(0,0,-.02);
  bump.add(new THREE.Mesh(isl,new THREE.MeshPhysicalMaterial({color:0x0c0c10,metalness:.5,roughness:.25,clearcoat:1,clearcoatRoughness:.1})));
  const ringM=new THREE.MeshStandardMaterial({color:0x8a8a94,metalness:1,roughness:.2});
  const glassM=new THREE.MeshPhysicalMaterial({color:0x020208,metalness:.9,roughness:.05,clearcoat:1,clearcoatRoughness:0});
  const coreM=new THREE.MeshStandardMaterial({color:0x1a2a55,metalness:1,roughness:.1,emissive:0x0a1030,emissiveIntensity:.6});
  [[-.22,.22],[.22,.22],[-.22,-.22]].forEach(([x,y])=>{
    const g2=new THREE.Group();g2.position.set(x,y,.09);g2.rotation.x=Math.PI/2;bump.add(g2);
    g2.add(new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.08,32),ringM));
    const gl=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.1,32),glassM);g2.add(gl);
    const co=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.11,24),coreM);g2.add(co)});
  const fl=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.04,24),new THREE.MeshStandardMaterial({color:0xfff2c8,emissive:0xffe9a8,emissiveIntensity:.5,roughness:.4}));
  fl.rotation.x=Math.PI/2;fl.position.set(.24,-.2,.06);bump.add(fl);
  const n=420,p=new Float32Array(n*3);
  for(let k=0;k<n;k++){const a=Math.random()*6.283,r=2.6+Math.random()*1.4;p[k*3]=Math.cos(a)*r;p[k*3+1]=(Math.random()-.5)*5.5;p[k*3+2]=Math.sin(a)*r}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(p,3));
  ring=new THREE.Points(rg,new THREE.PointsMaterial({size:.035,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(ring);

  const size=()=>{const w=innerWidth,h=innerHeight,m=w<800;renderer.setSize(w,h,false);camera.aspect=w/h;
    camera.position.set(0,0,m?13.5:10.5);camera.lookAt(0,0,0);camera.updateProjectionMatrix()};
  addEventListener('resize',size);size();

  canvas.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{
    mx=e.clientX/innerWidth*2-1;my=e.clientY/innerHeight*2-1;
    if(!drag)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
    rotY+=dx*.012;vY=dx*.012;rotX=clamp(rotX+dy*.007,-.7,.7);
  });
  const up=()=>{drag=false};canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
  stage.querySelector('.x').onclick=close;
  stage.addEventListener('click',e=>{if(e.target===stage)close()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&open)close()});
}

function frame(now){
  if(!open)return;raf=requestAnimationFrame(frame);
  const el=(now-t0)/1000,k=ease(clamp(el/1.3));
  if(!drag){
    rotY+=vY;vY*=.94;
    // once released, ease back to the front face (nearest multiple of 2PI) with a slow swing
    if(Math.abs(vY)<.004){const home=Math.round(rotY/6.2832)*6.2832+Math.sin(now*.0006)*.4;rotY+=(home-rotY)*.035}
    rotX+=(0-rotX)*.03;
  }
  phone.scale.setScalar(.2+.8*clamp(k,0,1.02));
  // entry spin ends exactly on the front face
  phone.rotation.y=rotY+(1-clamp(k,0,1))*-6.2832+mx*.12;
  phone.rotation.x=rotX+my*.07;
  phone.position.y=Math.sin(now*.0015)*.12;
  glareTex.offset.x=-phone.rotation.y*.35;glareTex.offset.y=phone.rotation.x*.3;
  ring.rotation.y=now*.0002;ring.position.y=phone.position.y;
  if((fr++&1)===0){drawScreen(info,el);sTex.needsUpdate=true}
  renderer.render(scene,camera);
}

function show(i){
  if(!stage)build();
  info=Object.assign({},i);info.index=i.index||0;iconImg=null;
  drawScreen(info,0);sTex.needsUpdate=true; // visible immediately
  const src=(window.__ICONS&&window.__ICONS[i.icon])||(location.protocol!=='file:'?i.icon:'');
  if(src){const im=new Image();im.onload=()=>{iconImg=im};im.src=src}
  const old=backMat.map;backMat.map=drawBack(info);backMat.needsUpdate=true;old&&old.dispose();
  const col=new THREE.Color(i.color);light.color.copy(col);ring.material.color.copy(col);
  stage.style.setProperty('--c',i.color);
  stage.querySelector('.mid').textContent=i.id;stage.querySelector('h3').textContent=i.name;
  stage.querySelector('em').textContent=i.tag;stage.querySelector('p').textContent=i.desc;
  stage.querySelector('.play').href=i.url;
  rotY=0;rotX=0;vY=0;t0=performance.now();open=true;
  document.documentElement.classList.add('stage-open');stage.classList.add('open');
  const s=window.__snd;if(s&&s.on){s.tone(140,.6,'sawtooth',.06);s.tone(520,.5,'sine',.06,.12);s.tone(1040,.6,'sine',.04,.25)}
  cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
}
function close(){open=false;cancelAnimationFrame(raf);stage.classList.remove('open');document.documentElement.classList.remove('stage-open')}
window.__open3D=show;
})();
