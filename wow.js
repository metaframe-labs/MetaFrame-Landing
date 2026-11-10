// ---------- WOW layer: post-processing, camera path, starfield, synth sound, text scramble, cursor labels ----------
(function(){
const mf=window.__mf;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;
const lerp=(a,b,t)=>a+(b-a)*t;

// ===== 1. Starfield (far depth layer, parallax with scroll) =====
let stars=null;
if(mf){
  const n=innerWidth<700?900:2200,p=new Float32Array(n*3),s=new Float32Array(n);
  for(let i=0;i<n;i++){
    const r=16+Math.random()*30,th=Math.random()*6.283,ph=Math.acos(2*Math.random()-1);
    p[i*3]=r*Math.sin(ph)*Math.cos(th);p[i*3+1]=r*Math.sin(ph)*Math.sin(th);p[i*3+2]=r*Math.cos(ph)-10;s[i]=Math.random();
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('seed',new THREE.BufferAttribute(s,1));
  const m=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uT:{value:0},uPx:{value:Math.min(devicePixelRatio,2)}},
    vertexShader:`attribute float seed;uniform float uT,uPx;varying float vA;
      void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=(1.+seed*2.)*uPx*(18./-mv.z);
      vA=.25+.75*(.5+.5*sin(uT*1.5+seed*60.));gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;
      gl_FragColor=vec4(vec3(.75,.85,1.),smoothstep(.5,0.,d)*vA*.55);}`
  });
  stars=new THREE.Points(g,m);mf.scene.add(stars);
}

// ===== 2. Post-processing: bloom + chromatic aberration + grain + vignette + velocity warp =====
let post=null,quality=1;
if(mf){
  const R=mf.renderer,size=new THREE.Vector2();
  const rtOpt={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:false};
  const rtA=new THREE.WebGLRenderTarget(4,4,{...rtOpt,depthBuffer:true}),rtB=new THREE.WebGLRenderTarget(4,4,rtOpt),rtC=new THREE.WebGLRenderTarget(4,4,rtOpt);
  const vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const blurMat=new THREE.ShaderMaterial({
    uniforms:{t:{value:null},dir:{value:new THREE.Vector2()},thr:{value:0}},vertexShader:vs,
    fragmentShader:`uniform sampler2D t;uniform vec2 dir;uniform float thr;varying vec2 vUv;
      void main(){vec4 c=texture2D(t,vUv)*.2270;
      c+=(texture2D(t,vUv+dir*1.385)+texture2D(t,vUv-dir*1.385))*.3162;
      c+=(texture2D(t,vUv+dir*3.231)+texture2D(t,vUv-dir*3.231))*.0703;
      if(thr>0.){float l=max(c.r,max(c.g,c.b));c*=smoothstep(.15,.6,l);}
      gl_FragColor=c;}`
  });
  const compMat=new THREE.ShaderMaterial({
    uniforms:{tS:{value:rtA.texture},tB:{value:rtC.texture},uT:{value:0},uV:{value:0},uBloom:{value:1.1}},vertexShader:vs,
    fragmentShader:`uniform sampler2D tS,tB;uniform float uT,uV,uBloom;varying vec2 vUv;
      float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uT)*43758.5453);}
      void main(){
        vec2 c=vUv-.5;float r=length(c);
        vec2 uv=vUv-c*r*r*uV*.35;                       // scroll-speed lens warp
        float ca=.0012+r*r*.006+uV*.004;vec2 o=normalize(c+1e-5)*ca;
        vec4 s=vec4(texture2D(tS,uv+o).r,texture2D(tS,uv).g,texture2D(tS,uv-o).b,texture2D(tS,uv).a);
        vec3 b=texture2D(tB,uv).rgb*uBloom;
        vec3 col=s.rgb+b;
        col+=(h(vUv*1000.)-.5)*.035;                    // film grain
        float a=clamp(max(s.a,max(b.r,max(b.g,b.b))),0.,1.);
        a=max(a,.0)*(1.-smoothstep(.55,.95,r)*.35);       // soft vignette
        col*=1.-smoothstep(.45,.95,r)*.4;
        gl_FragColor=vec4(max(col,0.)*step(.001,a),a);}`
  });
  const qs=new THREE.Scene(),qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),blurMat);quad.frustumCulled=false;qs.add(quad);
  function pass(mat,target){quad.material=mat;R.setRenderTarget(target);R.render(qs,qc)}
  function resizeRT(){
    R.getDrawingBufferSize(size);const w=size.x|0,h=size.y|0;
    rtA.setSize(w,h);rtB.setSize(Math.max(2,w>>2),Math.max(2,h>>2));rtC.setSize(Math.max(2,w>>2),Math.max(2,h>>2));
  }
  addEventListener('resize',resizeRT);resizeRT();

  // camera path driven by scroll progress
  let cp=0,roll=0,fovK=0,camX=0,camY=0;
  function camera(tm){
    const C=mf.camera,H=Math.max(1,document.body.scrollHeight-innerHeight),p=scrollY/H;
    cp=lerp(cp,p,.06);
    const v=Math.max(-1,Math.min(1,mf.vel*.02));
    camX=lerp(camX,Math.sin(cp*6.283)*.9+mf.mouse.x*.25,.05);
    camY=lerp(camY,Math.cos(cp*4.7)*.45+mf.mouse.y*.15,.05);
    roll=lerp(roll,v*.05+Math.sin(cp*6.283)*.03,.06);
    fovK=lerp(fovK,Math.min(12,Math.abs(mf.vel)*.25),.08);
    C.position.set(camX,camY,7+Math.sin(cp*9.4)*.6-fovK*.03);
    C.lookAt(0,0,0);C.rotateZ(roll);
    const f=50+fovK;if(Math.abs(C.fov-f)>.01){C.fov=f;C.updateProjectionMatrix()}
    if(stars){stars.rotation.y=cp*1.6+tm*.01;stars.rotation.x=cp*.6;stars.material.uniforms.uT.value=tm}
  }

  // adaptive quality: drop the heavy passes on slow devices
  let acc=0,cnt=0,lastT=performance.now();
  function render(tm){
    const now=performance.now(),dt=now-lastT;lastT=now;
    if(++cnt>20){acc+=dt;if(cnt===140){if(acc/120>30&&quality){quality=0;mf.renderer.setPixelRatio(1);dispatchEvent(new Event('resize'))}}}
    if(!reduce)camera(tm);
    if(!quality){R.setRenderTarget(null);R.render(mf.scene,mf.camera);return}
    R.setRenderTarget(rtA);R.clear();R.render(mf.scene,mf.camera);
    const tw=1/rtB.width,th=1/rtB.height;
    blurMat.uniforms.t.value=rtA.texture;blurMat.uniforms.thr.value=1;blurMat.uniforms.dir.value.set(tw*1.5,0);pass(blurMat,rtB);
    blurMat.uniforms.t.value=rtB.texture;blurMat.uniforms.thr.value=0;blurMat.uniforms.dir.value.set(0,th*1.5);pass(blurMat,rtC);
    blurMat.uniforms.t.value=rtC.texture;blurMat.uniforms.dir.value.set(tw*2.5,0);pass(blurMat,rtB);
    blurMat.uniforms.t.value=rtB.texture;blurMat.uniforms.dir.value.set(0,th*2.5);pass(blurMat,rtC);
    compMat.uniforms.uT.value=(tm%10)+.01;compMat.uniforms.uV.value=Math.min(1,Math.abs(mf.vel)*.012);
    pass(compMat,null);
  }
  mf.render=render;
  mf.renderer.autoClear=true;
}

// ===== 3. Click shockwave =====
addEventListener('pointerdown',e=>{
  if(mf)mf.pulse=1;
  const r=document.createElement('div');r.className='ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';
  document.body.append(r);setTimeout(()=>r.remove(),900);
  if(snd.on)snd.click();
});

// ===== 4. Synth sound design (Web Audio, no assets) =====
const snd={on:false,ctx:null,master:null,wind:null,windG:null,last:0,sec:0,
  init(){
    const A=window.AudioContext||window.webkitAudioContext;if(!A)return false;
    const c=this.ctx=new A(),m=this.master=c.createGain();m.gain.value=0;m.connect(c.destination);
    // generative music: chill chord loop (Am-F-C-G) with pad, bass, plucked arpeggio and soft beat
    const mus=this.mus=c.createGain();mus.gain.value=.9;mus.connect(m);
    const dly=c.createDelay();dly.delayTime.value=.375;const fb=c.createGain();fb.gain.value=.3;const dg=c.createGain();dg.gain.value=.35;
    mus.connect(dly);dly.connect(fb).connect(dly);dly.connect(dg).connect(m);
    const nz=c.createBuffer(1,c.sampleRate,c.sampleRate),nd=nz.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
    const hz=n=>440*Math.pow(2,(n-69)/12),prog=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],bpm=96,sp=60/bpm/4;
    const note=(f,t,dur,type,v,dest)=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(dest||mus);o.start(t);o.stop(t+dur+.05)};
    const pad=(f,t,dur,v)=>{const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=f;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.4);g.gain.linearRampToValueAtTime(v*.7,t+dur-.3);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(g).connect(mus);o.start(t);o.stop(t+dur+.05)};
    const hat=(t,v)=>{const s=c.createBufferSource();s.buffer=nz;const h=c.createBiquadFilter();h.type='highpass';h.frequency.value=7000;const g=c.createGain();
      g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.05);s.connect(h).connect(g).connect(mus);s.start(t);s.stop(t+.06)};
    const kick=t=>{const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);
      g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.0001,t+.25);o.connect(g).connect(mus);o.start(t);o.stop(t+.3)};
    const arp=[0,1,2,1,2,1,0,1],step={i:0,next:0};
    const sched=()=>{if(!this.on)return;if(step.next<c.currentTime)step.next=c.currentTime+.05;
      while(step.next<c.currentTime+.25){const i=step.i,t=step.next,ch=prog[(i>>4)%4],s=i%16;
        if(s===0){ch.forEach(n=>pad(hz(n+12),t,sp*16,.018));note(hz(ch[0]-12),t,sp*7,'sine',.16)}
        if(s===8)note(hz(ch[0]-12),t,sp*4,'sine',.12);
        if(s%2===0){const n=ch[arp[(s>>1)%8]]+12+(s%8===6?12:0);note(hz(n),t,.35,'triangle',.05)}
        if(s%4===0&&(s===0||s===8))kick(t);if(s%2===1)hat(t,.025);
        step.i++;step.next+=sp}};
    this.timer=setInterval(sched,80);
    // wind: looped noise, level follows scroll speed
    const buf=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const ns=c.createBufferSource();ns.buffer=buf;ns.loop=true;
    const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=2200;bp.Q.value=2.5;
    const wg=this.windG=c.createGain();wg.gain.value=0;ns.connect(bp).connect(wg).connect(m);ns.start();
    return true;
  },
  tone(f,dur=.15,type='sine',vol=.08,when=0){
    if(!this.on)return;const c=this.ctx,t=c.currentTime+when,o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.25,t+dur*.8);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g).connect(this.master);o.start(t);o.stop(t+dur+.02);
  },
  hover(){const n=performance.now();if(n-this.last<70)return;this.last=n;this.tone([784,880,1047,1319,1568][(Math.random()*5)|0],.08,'sine',.02)},
  click(){this.tone(880,.12,'triangle',.05);this.tone(1318,.18,'sine',.04,.05)},
  section(i){[0,4,7,12,16,19].forEach((s,k)=>this.tone(220*Math.pow(2,(s+i*2)/12)*2,.5,'sine',.025,k*.06))},
  set(on){
    if(on&&!this.ctx&&!this.init())return;
    this.on=on;const c=this.ctx;if(on)c.resume();
    this.master.gain.cancelScheduledValues(c.currentTime);
    this.master.gain.linearRampToValueAtTime(on?.55:0,c.currentTime+(on?1.5:.4));
    btn.classList.toggle('on',on);btn.querySelector('b').textContent=on?'SOUND ON':'SOUND OFF';
    if(on)this.tone(523,.3,'sine',.06),this.tone(784,.3,'sine',.05,.1),this.tone(1047,.4,'sine',.05,.2);
  }
};
window.__snd=snd;
const btn=document.createElement('button');btn.id='snd';btn.setAttribute('aria-label','toggle sound');
btn.innerHTML='<span class="eq"><i></i><i></i><i></i><i></i></span><b>SOUND OFF</b>';
btn.onclick=()=>snd.set(!snd.on);document.body.append(btn);
document.addEventListener('pointerover',e=>{if(snd.on&&e.target.closest('a,button:not(#snd),.card,.pills span,input'))snd.hover()});
(function loop(){
  if(snd.on&&mf){
    snd.windG.gain.value=lerp(snd.windG.gain.value,Math.min(.04,Math.abs(mf.vel)*.001),.15);
    if(mf.section!==snd.sec){snd.sec=mf.section;snd.section(snd.sec)}
  }
  requestAnimationFrame(loop);
})();

// ===== 5. Text scramble on headings + nav hover =====
const GL='!<>-_\\/[]{}—=+*^?#01';
function scramble(el,node,final){
  if(reduce){return}
  let f=0;const tot=final.length,len=22;
  (function step(){
    let s='';for(let i=0;i<tot;i++){const k=f-i*.6;s+=final[i]===' '?' ':k>len*.35?final[i]:GL[(Math.random()*GL.length)|0]}
    node.textContent=s;f++;if(f<tot*.6+len)requestAnimationFrame(step);else node.textContent=final;
  })();
}
const hio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;hio.unobserve(e.target);
  const n=[...e.target.childNodes].reverse().find(x=>x.nodeType===3&&x.textContent.trim());
  if(n)scramble(e.target,n,n.textContent);
}),{threshold:.6});
document.querySelectorAll('section h2').forEach(h=>hio.observe(h));
document.querySelectorAll('.links a').forEach(a=>{
  const t=a.textContent;a.addEventListener('pointerenter',()=>{
    const n=a.firstChild;if(n&&n.nodeType===3)scramble(a,n,t);
  });
});

// ===== 6. Contextual cursor label =====
if(fine){
  const lab=document.createElement('div');lab.id='curlabel';document.body.append(lab);
  document.querySelectorAll('.card').forEach(el=>el.dataset.cursor='flip');
  new MutationObserver(()=>document.querySelectorAll('.card:not([data-cursor])').forEach(el=>el.dataset.cursor='flip')).observe(document.getElementById('cards'),{childList:true});
  const mail=document.getElementById('mail');if(mail)mail.dataset.cursor='say hi';
  document.querySelectorAll('.chips button,form button').forEach(el=>el.dataset.cursor='run');
  let x=0,y=0,tx=0,ty=0;
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY});
  document.addEventListener('pointerover',e=>{
    const t=e.target.closest('[data-cursor]');lab.textContent=t?t.dataset.cursor:'';lab.classList.toggle('show',!!t);
  });
  (function l(){x=lerp(x,tx,.18);y=lerp(y,ty,.18);lab.style.transform=`translate(${x+18}px,${y+18}px)`;requestAnimationFrame(l)})();
}
})();
