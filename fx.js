// ---------- FX layer: WebGL morphing particles, smooth scroll, motion polish ----------
(function(){
document.body.classList.toggle('seen',!!sessionStorage.getItem('mf_seen'));sessionStorage.setItem('mf_seen',1);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;

// ===== 1. Smooth inertial scroll (Lenis) =====
let lenis=null;
if(window.Lenis&&!reduce){
  lenis=new Lenis({lerp:.085,smoothWheel:true});
  document.documentElement.style.scrollBehavior='auto';
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));if(!t)return;e.preventDefault();lenis.scrollTo(t,{offset:-40,duration:1.6});
  }));
}

// ===== 2. Scroll progress + smooth trailing cursor =====
const prog=document.getElementById('prog'),trail=document.getElementById('trail');
let mx=innerWidth/2,my=innerHeight/2,tx=mx,ty=my;
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY});
if(!fine)trail.style.display='none';

// ===== 3. Split-letter hero headline =====
(function(){
  const h=document.querySelector('h1');if(!h||reduce)return;
  let n=0;
  const walk=node=>{
    [...node.childNodes].forEach(c=>{
      if(c.nodeType===3){
        const f=document.createDocumentFragment();
        [...c.textContent].forEach(ch=>{
          if(ch===' '){f.append(' ');return}
          const s=document.createElement('span');s.className='ch';s.textContent=ch;s.style.setProperty('--i',n++);f.append(s);
        });
        c.replaceWith(f);
      }else if(c.nodeType===1&&c.tagName!=='BR'&&!c.classList.contains('glitch'))walk(c);
      else if(c.classList&&c.classList.contains('glitch')){c.classList.add('ch');c.style.setProperty('--i',n++)}
    });
  };
  walk(h);h.classList.add('split');
})();

// ===== 4. Magnetic links / buttons =====
if(fine&&!reduce){
  document.querySelectorAll('.links a,.logo,.pills span,form button,.chips button,#konami').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);
      el.style.transform=`translate(${x*.25}px,${y*.35}px)`;
    });
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });
}

// ===== 5. WebGL particle universe =====
const canvas=document.getElementById('gl');
if(!window.THREE||!canvas){ // fallback: loop for lenis/progress only
  (function raf(t){lenis&&lenis.raf(t);prog.style.transform=`scaleX(${scrollY/Math.max(1,document.body.scrollHeight-innerHeight)})`;requestAnimationFrame(raf)})(0);
  return;
}
const N=innerWidth<700?3500:7000;
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(50,1,.1,100);camera.position.z=7;
const group=new THREE.Group();scene.add(group);

// --- shapes ---
const rnd=(a,b)=>a+Math.random()*(b-a);
function mkShape(fn){const a=new Float32Array(N*3);for(let i=0;i<N;i++){const p=fn(i,N);a[i*3]=p[0];a[i*3+1]=p[1];a[i*3+2]=p[2]}return a}
const shapes=[];
// 0: "M" glyph sampled from font pixels (rebuilt when fonts load)
function glyphShape(){
  const S=320,o=document.createElement('canvas');o.width=o.height=S;const c=o.getContext('2d');
  c.fillStyle='#fff';c.font='bold 300px "Space Grotesk",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('M',S/2,S/2+14);
  const d=c.getImageData(0,0,S,S).data,pts=[];
  for(let y=0;y<S;y+=2)for(let x=0;x<S;x+=2)if(d[(y*S+x)*4+3]>128)pts.push([(x-S/2)/S*5.2,-(y-S/2)/S*5.2]);
  return mkShape(()=>{const p=pts[(Math.random()*pts.length)|0]||[0,0];return[p[0],p[1],rnd(-.35,.35)]});
}
shapes[0]=glyphShape();
// 1: sphere (fibonacci)
shapes[1]=mkShape((i,n)=>{const y=1-2*(i+.5)/n,r=Math.sqrt(1-y*y),th=i*2.399963;return[Math.cos(th)*r*2,y*2,Math.sin(th)*r*2]});
// 2: cube (the Meta Box) - edges dense, faces sparse
shapes[2]=mkShape(()=>{
  const s=1.7;
  if(Math.random()<.55){const ax=(Math.random()*3)|0,v=[(Math.random()<.5?-s:s),(Math.random()<.5?-s:s),(Math.random()<.5?-s:s)];v[ax]=rnd(-s,s);return v}
  const v=[rnd(-s,s),rnd(-s,s),rnd(-s,s)],ax=(Math.random()*3)|0;v[ax]=Math.random()<.5?-s:s;return v;
});
// 3: torus knot
shapes[3]=mkShape((i,n)=>{const t=i/n*Math.PI*2*3,r=1.2+.5*Math.cos(2*t/3*1.5),j=.07;return[(r*Math.cos(t)*1.35+rnd(-j,j)),(r*Math.sin(t)*1.35+rnd(-j,j)),Math.sin(t*1.5)*1.1+rnd(-j,j)]});
// 4: wave plane
shapes[4]=mkShape(()=>{const x=rnd(-3.4,3.4),z=rnd(-3.4,3.4);return[x,Math.sin(x*1.4)*Math.cos(z*1.4)*.55-.4,z*.8]});
// 5: spiral galaxy
shapes[5]=mkShape((i,n)=>{const a=Math.random(),arm=(i%3)*2.094,th=a*9+arm,r=a*3.2;return[Math.cos(th)*r+rnd(-.15,.15),rnd(-.12,.12)*(1.2-a),Math.sin(th)*r+rnd(-.15,.15)]});
document.fonts&&document.fonts.ready.then(()=>{shapes[0]=glyphShape()});

// --- particles ---
const pos=new Float32Array(N*3),seed=new Float32Array(N);
for(let i=0;i<N;i++){pos[i*3]=rnd(-9,9);pos[i*3+1]=rnd(-6,6);pos[i*3+2]=rnd(-6,6);seed[i]=Math.random()}
const geo=new THREE.BufferGeometry();
geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
geo.setAttribute('seed',new THREE.BufferAttribute(seed,1));
const mat=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  uniforms:{uC1:{value:new THREE.Color('#ffb21e')},uC2:{value:new THREE.Color('#27e39a')},uPx:{value:renderer.getPixelRatio()},uA:{value:1},uT:{value:0}},
  vertexShader:`attribute float seed;uniform float uPx,uT;varying float vS;varying float vD;
    void main(){vS=seed;vec4 mv=modelViewMatrix*vec4(position,1.);vD=clamp((-mv.z-4.)/8.,0.,1.);
    gl_PointSize=(1.6+seed*2.2)*uPx*(7./-mv.z)*(1.+.25*sin(uT*2.+seed*40.));gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform vec3 uC1,uC2;uniform float uA;varying float vS;varying float vD;
    void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=smoothstep(.5,0.,d);
    vec3 c=mix(uC1,uC2,smoothstep(.55,1.,vS)*.9);gl_FragColor=vec4(c*(1.2-vD*.6),a*uA*(.85-vD*.4));}`
});
group.add(new THREE.Points(geo,mat));

// --- sections drive the shape ---
const ids=['top','lab','console','products','principles','contact'];
let target=0,xSide=1;
const secEls=ids.map(id=>document.getElementById(id));
function pickSection(){
  const mid=innerHeight*.5;let best=0;
  secEls.forEach((el,i)=>{if(el){const r=el.getBoundingClientRect();if(r.top<mid)best=i}});
  if(best!==target){target=best}
}

// --- sizing ---
let aspect=1;
function resize(){renderer.setSize(innerWidth,innerHeight,false);aspect=innerWidth/innerHeight;camera.aspect=aspect;camera.updateProjectionMatrix();mat.uniforms.uPx.value=renderer.getPixelRatio()}
addEventListener('resize',resize);resize();

// --- loop ---
const mouseN={x:0,y:0},ms={x:0,y:0};
addEventListener('pointermove',e=>{mouseN.x=e.clientX/innerWidth*2-1;mouseN.y=-(e.clientY/innerHeight*2-1)});
const halfH=Math.tan(25*Math.PI/180)*7;
let last=scrollY,vel=0,clock=0,shift=0,scl=1,alpha=1;
function frame(t){
  const dt=Math.min(.05,(t-clock)/1000||.016);clock=t;
  lenis&&lenis.raf(t);
  // scroll
  const sy=scrollY;vel+=((sy-last)-vel)*.15;last=sy;
  pickSection();
  prog.style.transform=`scaleX(${sy/Math.max(1,document.body.scrollHeight-innerHeight)})`;
  // trailing cursor
  tx+=(mx-tx)*.12;ty+=(my-ty)*.12;trail.style.transform=`translate(${tx}px,${ty}px)`;
  // group placement: hero right, then alternates sides, fades behind content
  const wide=aspect>1.1;
  const sideT=target===0?(wide?1:0):(target%2?-1:1)*(wide?1:0);
  shift+=(sideT*halfH*aspect*.5-shift)*.04;
  const sT=target===0?(wide?1.15:.8):(wide?.85:.6);scl+=(sT-scl)*.04;
  const aT=target===0?1:.55;alpha+=(aT-alpha)*.05;mat.uniforms.uA.value=alpha;
  group.position.x=shift;group.position.y=wide?0:(target===0?-.4:0);group.scale.setScalar(scl);
  ms.x+=(mouseN.x-ms.x)*.05;ms.y+=(mouseN.y-ms.y)*.05;
  group.rotation.y+=((ms.x*.5+Math.sin(clock*.0003)*.25)-group.rotation.y)*.04+(target===0?0:dt*.15);
  group.rotation.x+=((-ms.y*.3)-group.rotation.x)*.04;
  group.rotation.z=target===3?Math.sin(clock*.0004)*.15:group.rotation.z*.95;
  // particles -> target shape (+ curl-ish drift, mouse repulsion in group-local space)
  const A=shapes[target],ease=1-Math.pow(.0009,dt),
    mxw=(mouseN.x*halfH*aspect-shift)/scl,myw=(mouseN.y*halfH)/scl,
    warp=Math.min(1.6,Math.abs(vel)*.02),tm=clock*.001;
  for(let i=0;i<N;i++){
    const i3=i*3,s=seed[i];
    let ax=A[i3],ay=A[i3+1],az=A[i3+2];
    ax+=Math.sin(tm*.8+s*50)*.045+Math.sin(tm*.3+i)*warp*.5;
    ay+=Math.cos(tm*.7+s*40)*.045;
    az+=Math.sin(tm*.6+s*30)*.045+warp*(s-.5)*2;
    // stagger: each particle follows at its own pace for organic morph
    const e=ease*(.35+s*.65);
    let px=pos[i3]+(ax-pos[i3])*e,py=pos[i3+1]+(ay-pos[i3+1])*e,pz=pos[i3+2]+(az-pos[i3+2])*e;
    const dx=px-mxw,dy=py-myw,d2=dx*dx+dy*dy;
    if(d2<.9){const f=(1-d2/.9)*.16/Math.sqrt(d2+.01);px+=dx*f;py+=dy*f;pz+=(s-.5)*f*.6}
    pos[i3]=px;pos[i3+1]=py;pos[i3+2]=pz;
  }
  geo.attributes.position.needsUpdate=true;
  mat.uniforms.uT.value=tm;
  // theme colour follows the easter egg
  const g=getComputedStyle(document.body).getPropertyValue('--gold').trim();if(g&&mat.uniforms.uC1.value.getStyle()!==g)mat.uniforms.uC1.value.set(g);
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
