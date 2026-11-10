// ---------- THE CHAMBER: suspended shard-core in a cable cage, fog, reflective floor (Three.js) ----------
(function(){
const box=document.querySelector('#chamber .room');
if(!box||!window.THREE)return;
const T=THREE,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})}catch(e){box.classList.add('nogl');return}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
box.prepend(renderer.domElement);

const scene=new T.Scene();scene.background=new T.Color(0x040407);scene.fog=new T.FogExp2(0x050509,.055);
const cam=new T.PerspectiveCamera(48,1,.1,80);cam.position.set(0,1.2,11);

// lights
scene.add(new T.AmbientLight(0x20202c,.8));
const core=new T.PointLight(0xff7ad9,40,18,2);core.position.set(0,2.2,0);scene.add(core);
const rim=new T.SpotLight(0x8fb4ff,60,30,.6,.8,1.5);rim.position.set(-8,9,4);rim.target.position.set(0,2,0);scene.add(rim,rim.target);
const gl=new T.PointLight(0x27e39a,14,9,2);gl.position.set(0,-1.2,3);scene.add(gl);

const metal=new T.MeshStandardMaterial({color:0x8a8d99,metalness:.95,roughness:.35});
const dark=new T.MeshStandardMaterial({color:0x14141a,metalness:.4,roughness:.8});

// cage: rings, bars, base
const cage=new T.Group();scene.add(cage);
[[4.2,6.2],[3.4,5.4],[3.0,4.4]].forEach(([r,y],i)=>{
  const ring=new T.Mesh(new T.TorusGeometry(r,.07+i*.03,12,96),metal);ring.rotation.x=Math.PI/2;ring.position.y=y;cage.add(ring)});
const top=new T.Mesh(new T.CylinderGeometry(3.6,4.4,.5,48,1,true),metal);top.position.y=6.7;cage.add(top);
for(let i=0;i<18;i++){const a=i/18*6.283,r=3.1;
  const bar=new T.Mesh(new T.CylinderGeometry(.03,.03,6.6,6),metal);bar.position.set(Math.cos(a)*r,2.9,Math.sin(a)*r);cage.add(bar)}
const base=new T.Mesh(new T.CylinderGeometry(3.4,3.7,.25,64),metal);base.position.y=-.4;cage.add(base);
const base2=new T.Mesh(new T.TorusGeometry(3.4,.05,8,64),metal);base2.rotation.x=Math.PI/2;base2.position.y=-.25;cage.add(base2);

// cables sagging from top ring down to the core / floor
const cm=new T.MeshStandardMaterial({color:0x22232b,metalness:.7,roughness:.5});
for(let i=0;i<26;i++){
  const a=Math.random()*6.283,r=3+Math.random()*2.2,b=a+(Math.random()-.5)*1.2;
  const p=[new T.Vector3(Math.cos(a)*r,6.4,Math.sin(a)*r),
    new T.Vector3(Math.cos(a)*r*1.1,3+Math.random()*2,Math.sin(a)*r*1.1),
    new T.Vector3(Math.cos(b)*(r*.6),.5+Math.random()*2,Math.sin(b)*(r*.6)),
    new T.Vector3(Math.cos(b)*(r*1.3),-.45,Math.sin(b)*(r*1.3))];
  scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(p),48,.025+Math.random()*.04,6),cm))}

// environment: pillars + rubble
for(let i=0;i<7;i++){const s=1+Math.random()*2.2,m=new T.Mesh(new T.BoxGeometry(s,9+Math.random()*6,s),dark);
  const side=i%2?1:-1;m.position.set(side*(7+Math.random()*7),3,-4-Math.random()*14);m.rotation.y=Math.random();m.rotation.z=(Math.random()-.5)*.25;scene.add(m)}
for(let i=0;i<60;i++){const m=new T.Mesh(new T.IcosahedronGeometry(.2+Math.random()*.7,0),dark);
  const a=Math.random()*6.283,r=4.5+Math.random()*10;m.position.set(Math.cos(a)*r,-.4,Math.sin(a)*r-2);m.rotation.set(Math.random()*3,Math.random()*3,0);scene.add(m)}

// glossy floor + emerald light patch
const floor=new T.Mesh(new T.PlaneGeometry(60,60),new T.MeshStandardMaterial({color:0x07070b,metalness:.9,roughness:.18}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.5;scene.add(floor);
const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
g.addColorStop(0,'rgba(39,227,154,.9)');g.addColorStop(1,'rgba(39,227,154,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
const patch=new T.Mesh(new T.PlaneGeometry(5,3),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,blending:T.AdditiveBlending,depthWrite:false}));
patch.rotation.x=-Math.PI/2;patch.position.set(0,-.48,3.2);scene.add(patch);

// shard core: points on a lumpy sphere, glittering
const N=innerWidth<700?4500:9000,pos=new Float32Array(N*3),seed=new Float32Array(N),col=new Float32Array(N*3);
const pal=[new T.Color(0xffffff),new T.Color(0xd9b8ff),new T.Color(0xff7ad9),new T.Color(0x9fd0ff)];
for(let i=0;i<N;i++){
  const u=Math.random(),v=Math.random(),th=u*6.283,ph=Math.acos(2*v-1);
  const lump=1+.28*Math.sin(th*3+ph*2)+.18*Math.sin(ph*5-th*2);
  const r=(1.7*lump)*(.82+Math.random()*.3);
  pos[i*3]=r*Math.sin(ph)*Math.cos(th);pos[i*3+1]=r*Math.cos(ph);pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);
  seed[i]=Math.random();const c=pal[Math.random()*pal.length|0];col.set([c.r,c.g,c.b],i*3)}
const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));
geo.setAttribute('aSeed',new T.BufferAttribute(seed,1));geo.setAttribute('aCol',new T.BufferAttribute(col,3));
const U={uT:{value:0},uP:{value:new T.Vector3(99,99,99)},uPx:{value:renderer.getPixelRatio()},uPulse:{value:0}};
const mat=new T.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
 vertexShader:`attribute float aSeed;attribute vec3 aCol;uniform float uT,uPx,uPulse;uniform vec3 uP;varying vec3 vC;varying float vA;
 void main(){vec3 p=position;float b=1.+.05*sin(uT*1.3+p.y*1.5)+uPulse*.25;p*=b;
  p+=normalize(p)*.06*sin(uT*2.+aSeed*40.);
  vec4 w=modelMatrix*vec4(p,1.);vec3 d=w.xyz-uP;float l=length(d);w.xyz+=normalize(d)*smoothstep(1.6,0.,l)*.9;
  vec4 mv=viewMatrix*w;gl_Position=projectionMatrix*mv;
  float tw=.5+.5*sin(uT*(2.+aSeed*5.)+aSeed*60.);vA=.25+.75*pow(tw,3.);vC=aCol;
  gl_PointSize=(2.+aSeed*5.)*uPx*(9./-mv.z);}`,
 fragmentShader:`varying vec3 vC;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);
  float shape=smoothstep(.5,.0,max(abs(c.x)*.9+abs(c.y)*.9,d));gl_FragColor=vec4(vC*1.3,shape*vA);}`});
const pts=new T.Points(geo,mat);pts.position.y=2.4;scene.add(pts);
// faint mirrored reflection in the floor
const refl=new T.Points(geo,mat.clone());refl.material.uniforms=U;refl.material.opacity=.25;
refl.scale.y=-1;refl.position.y=-3.4;scene.add(refl);
// dark inner mass so the core reads as a solid with a glitter skin
const mass=new T.Mesh(new T.SphereGeometry(1.35,48,32),new T.MeshStandardMaterial({color:0x0b0610,roughness:.4,metalness:.8,emissive:0x2a0a2e,emissiveIntensity:.6}));
mass.position.y=2.4;scene.add(mass);

// pointer + resize
let mx=0,my=0,sx=0,sy=0,vis=false,pulse=0;const ray=new T.Raycaster(),mv2=new T.Vector2(),pl=new T.Plane(new T.Vector3(0,0,1),-0);
box.addEventListener('pointermove',e=>{const r=box.getBoundingClientRect();mx=(e.clientX-r.left)/r.width*2-1;my=-((e.clientY-r.top)/r.height*2-1)});
box.addEventListener('pointerleave',()=>{mx=my=0;U.uP.value.set(99,99,99)});
box.addEventListener('click',()=>{pulse=1;const s=window.__snd;if(s&&s.on){s.tone(70,.8,'sine',.08);s.tone(1400,.6,'triangle',.03,.05)}});
function size(){const r=box.getBoundingClientRect();renderer.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix()}
addEventListener('resize',size);size();
new IntersectionObserver(e=>{vis=e[0].isIntersecting},{threshold:.02}).observe(box);

const clock=new T.Clock();
function frame(){
  requestAnimationFrame(frame);if(!vis)return;
  const t=clock.getElapsedTime();U.uT.value=t;pulse*=.95;U.uPulse.value=pulse;
  sx+=(mx-sx)*.05;sy+=(my-sy)*.05;
  // scroll-driven dolly through the room
  const r=box.getBoundingClientRect(),pr=Math.min(1,Math.max(0,1-(r.bottom)/(innerHeight+r.height)));
  if(!reduce){cam.position.set(sx*2.4,1.2+sy*.8+ (pr-.5)*1.2,11-pr*3.2);cam.lookAt(0,2.2,0);
    pts.rotation.y=refl.rotation.y=t*.12;mass.rotation.y=t*.12;cage.rotation.y=Math.sin(t*.1)*.05}
  core.intensity=36+Math.sin(t*2)*6+pulse*60;
  // pointer in world space at the core's depth
  mv2.set(mx,my);ray.setFromCamera(mv2,cam);const h=new T.Vector3();
  if(mx||my){ray.ray.intersectPlane(pl,h);if(h)U.uP.value.copy(h)}
  renderer.render(scene,cam);
}
frame();
})();
