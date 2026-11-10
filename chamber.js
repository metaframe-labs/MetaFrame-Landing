// ---------- THE CHAMBER as the site's world: cage, cables, pillars and glossy floor live INSIDE the global scene ----------
// The morphing particle core (M / sphere / cube / ...) now hangs inside the cage, on every section.
(function(){
const mf=window.__mf;if(!mf||!window.THREE)return;
const T=THREE,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene=mf.scene;
scene.fog=new T.FogExp2(0x07070a,.045);

// lights (the particle shader ignores them; they only shape the architecture)
scene.add(new T.AmbientLight(0x2a2a38,1.1));
const coreL=new T.PointLight(0xff7ad9,30,16,2);scene.add(coreL);
const rim=new T.SpotLight(0x8fb4ff,70,40,.7,.8,1.4);rim.position.set(-8,8,5);scene.add(rim,rim.target);
const gL=new T.PointLight(0x27e39a,10,8,2);scene.add(gL);

const root=new T.Group();mf.group.add(root);          // follows the core when it slides left/right per section
root.scale.setScalar(.62);root.position.y=-1.5;
const metal=new T.MeshStandardMaterial({color:0x6d707c,metalness:.95,roughness:.38});
const dark=new T.MeshStandardMaterial({color:0x101016,metalness:.4,roughness:.85});
const cm=new T.MeshStandardMaterial({color:0x1d1e26,metalness:.7,roughness:.5});

// cage
const cage=new T.Group();root.add(cage);
[[4.2,6.2],[3.4,5.4],[3.0,4.4]].forEach(([r,y],i)=>{
  const m=new T.Mesh(new T.TorusGeometry(r,.07+i*.03,12,96),metal);m.rotation.x=Math.PI/2;m.position.y=y;m.userData.spin=(i%2?1:-1)*(.03+i*.02);cage.add(m)});
const cap=new T.Mesh(new T.CylinderGeometry(3.6,4.4,.5,48,1,true),metal);cap.position.y=6.7;cage.add(cap);
for(let i=0;i<18;i++){const a=i/18*6.283;
  const b=new T.Mesh(new T.CylinderGeometry(.03,.03,6.6,6),metal);b.position.set(Math.cos(a)*3.1,2.9,Math.sin(a)*3.1);cage.add(b)}
const base=new T.Mesh(new T.CylinderGeometry(3.4,3.7,.25,64),metal);base.position.y=-.4;cage.add(base);

// cables
const cables=[];
for(let i=0;i<28;i++){
  const a=Math.random()*6.283,r=3+Math.random()*2.2,b=a+(Math.random()-.5)*1.2;
  const p=[new T.Vector3(Math.cos(a)*r,6.4,Math.sin(a)*r),new T.Vector3(Math.cos(a)*r*1.1,3+Math.random()*2,Math.sin(a)*r*1.1),
    new T.Vector3(Math.cos(b)*r*.6,.5+Math.random()*2,Math.sin(b)*r*.6),new T.Vector3(Math.cos(b)*r*1.3,-.45,Math.sin(b)*r*1.3)];
  const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(p),48,.025+Math.random()*.045,6),cm);root.add(m);cables.push(m)}

// ruined hall: pillars + rubble, spread deep behind and to the sides so every section has depth
for(let i=0;i<12;i++){const s=1+Math.random()*2.4,m=new T.Mesh(new T.BoxGeometry(s,10+Math.random()*8,s),dark);
  const side=i%2?1:-1;m.position.set(side*(8+Math.random()*10),3,-5-Math.random()*26);m.rotation.y=Math.random();m.rotation.z=(Math.random()-.5)*.25;root.add(m)}
for(let i=0;i<90;i++){const m=new T.Mesh(new T.IcosahedronGeometry(.2+Math.random()*.8,0),dark);
  const a=Math.random()*6.283,r=4.5+Math.random()*16;m.position.set(Math.cos(a)*r,-.4,Math.sin(a)*r-2);m.rotation.set(Math.random()*3,Math.random()*3,0);root.add(m)}

// glossy floor + emerald patch + pink pool under the core
const floor=new T.Mesh(new T.PlaneGeometry(90,90),new T.MeshStandardMaterial({color:0x08080c,metalness:.9,roughness:.2}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.5;root.add(floor);
function glow(rgb){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,`rgba(${rgb},.9)`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.fillRect(0,0,128,128);
  return new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,blending:T.AdditiveBlending,depthWrite:false})}
const green=new T.Mesh(new T.PlaneGeometry(5,3),glow('39,227,154'));green.rotation.x=-Math.PI/2;green.position.set(0,-.47,3.4);root.add(green);
const pink=new T.Mesh(new T.PlaneGeometry(9,9),glow('255,122,217'));pink.rotation.x=-Math.PI/2;pink.position.set(0,-.46,0);pink.material.opacity=.45;root.add(pink);

// every frame: slow world drift tied to scroll, light follows the core
const B=document.body;
function tick(){
  requestAnimationFrame(tick);
  const t=performance.now()/1000,H=Math.max(1,B.scrollHeight-innerHeight),p=scrollY/H;
  if(!reduce){
    root.rotation.y=(p-.5)*1.4+mf.mouse.x*.12;
    cage.children.forEach(c=>{if(c.userData.spin)c.rotation.z+=c.userData.spin*.01});
    cables.forEach((c,i)=>{c.rotation.y=Math.sin(t*.4+i)*.004*(1+mf.pulse*6)});
  }
  const w=new T.Vector3();mf.group.getWorldPosition(w);
  coreL.position.set(w.x,w.y,w.z+.5);coreL.intensity=26+Math.sin(t*2)*5+mf.pulse*50;
  gL.position.set(w.x,w.y-2.6,w.z+2);
  rim.target.position.set(w.x,w.y,w.z);
}
tick();
})();
