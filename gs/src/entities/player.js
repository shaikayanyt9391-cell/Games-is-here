import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {G} from '../core/engine.js';
import {input} from '../ui/controls.js';
export const WEAPONS=['UNARMED','9MM PISTOL','ASSAULT RIFLE','RPG LAUNCHER'];
export const player={deaths:0,body:null,mesh:null,scene:null,heading:Math.PI,weapon:0,hp:100,cash:0,active:null,vehicles:[],speed:0,snap:true};
const L=(c,e=0)=>new THREE.MeshLambertMaterial({color:c,emissive:e});
const bx=(p,w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),L(c));m.position.set(x,y,z);p.add(m);return m;};
const pv=(p,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g;};
let world,la,ra,ll,rl,wg=[null],walkT=0,punchT=0,cd=0,flash,flashT=0,scene;
const tracers=[],rockets=[],booms=[],ray=new CANNON.RaycastResult(),V=new CANNON.Vec3(),V2=new CANNON.Vec3();
const OG={collisionFilterMask:1,skipBackfaces:true},OB={skipBackfaces:true};
export function initPlayer(s,w){scene=s;world=w;player.scene=s;
 const m=player.mesh=new THREE.Group();
 bx(m,.5,.65,.28,0x2e4a7d,0,1.15,0);const hd=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),L(0xc68642));hd.position.y=1.7;m.add(hd);
 bx(m,.42,.1,.3,0x111111,0,1.83,0);
 ll=pv(m,-.13,.82,0);bx(ll,.2,.82,.22,0x1b1b1b,0,-.41,0);rl=pv(m,.13,.82,0);bx(rl,.2,.82,.22,0x1b1b1b,0,-.41,0);
 la=pv(m,-.37,1.42,0);bx(la,.15,.6,.15,0x2e4a7d,0,-.3,0);ra=pv(m,.37,1.42,0);bx(ra,.15,.6,.15,0x2e4a7d,0,-.3,0);
 const hand=pv(ra,0,-.6,0);
 for(let i=1;i<4;i++){wg[i]=pv(hand,0,0,0);}
 bx(wg[1],.05,.3,.08,0x222222,0,-.15,0);
 bx(wg[2],.07,.8,.1,0x333333,0,-.35,0);bx(wg[2],.05,.2,.18,0x111111,0,-.05,0);
 bx(wg[3],.14,.9,.14,0x4a5d23,0,-.3,0);bx(wg[3],.22,.25,.22,0x8b0000,0,-.85,0);
 scene.add(m);
 player.body=new CANNON.Body({mass:75,shape:new CANNON.Sphere(.6),position:new CANNON.Vec3(0,.6,12),linearDamping:.9,fixedRotation:true,collisionFilterGroup:2,collisionFilterMask:1});
 world.addBody(player.body);
 flash=new THREE.PointLight(0xffaa44,0,14);scene.add(flash);
 for(let i=0;i<8;i++){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
  const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xffe600}));l.visible=false;l.frustumCulled=false;scene.add(l);tracers.push({l,t:0});}
 m.visible=false;
}
export function resetPlayer(){const b=player.body;player.active=null;b.collisionFilterMask=1;b.position.set(0,.6,12);b.velocity.set(0,0,0);
 player.heading=Math.PI;player.hp=100;player.snap=true;scene.add(player.mesh);}
export const nextWeapon=()=>{player.weapon=(player.weapon+1)%4;};
function tracer(a,b){const t=tracers.find(o=>o.t<=0)||tracers[0],p=t.l.geometry.attributes.position;
 p.setXYZ(0,a.x,a.y,a.z);p.setXYZ(1,b.x,b.y,b.z);p.needsUpdate=true;t.t=.06;t.l.visible=true;}
function glow(pos,i,t){flash.position.set(pos.x,pos.y,pos.z);flash.intensity=i;flashT=t;}
function explode(pos){const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshLambertMaterial({color:0xff6a00,emissive:0xff4400,transparent:true}));
 m.position.copy(pos);scene.add(m);booms.push({m,t:0});glow(pos,10,.25);if(player.onCrime)player.onCrime(1.2);if(player.onExplode)player.onExplode(pos);
 for(const v of player.vehicles){const b=v.body,dx=b.position.x-pos.x,dy=b.position.y-pos.y,dz=b.position.z-pos.z,d=Math.hypot(dx,dy,dz)||1;
  if(d<14){const k=(1-d/14)*b.mass*12/d;b.applyImpulse(new CANNON.Vec3(dx*k,Math.abs(dy)*k+(1-d/14)*b.mass*6,dz*k));}}
 const pp=player.body.position,d=Math.hypot(pp.x-pos.x,pp.y-pos.y,pp.z-pos.z);if(d<8)player.hp-=(1-d/8)*60;}
function shoot(fx,fz){const w=player.weapon,p=player.body.position;
 if(w===0){punchT=.25;cd=.45;if(player.onPunch)player.onPunch(p.x+fx*1.2,p.z+fz*1.2);for(const v of player.vehicles){const d=v.body.position;
  if(Math.hypot(d.x-p.x-fx*1.2,d.z-p.z-fz*1.2)<2.2)v.body.applyImpulse(new CANNON.Vec3(fx*400,150,fz*400));}return;}
 V.set(p.x+fx*.9,p.y+.7,p.z+fz*.9);
 if(w===3){cd=1.2;if(player.onCrime)player.onCrime(.6);if(player.onShot)player.onShot(3);const m=new THREE.Group();const c=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.8,8).rotateX(Math.PI/2),L(0xffaa00,0xff6600));
  m.add(c);m.position.set(V.x,V.y,V.z);scene.add(m);rockets.push({m,fx,fz,life:0});return;}
 cd=w===1?.35:.09;if(player.onCrime)player.onCrime(.35);if(player.onShot)player.onShot(w);const sp=w===2?.05:0,dx=fx+(Math.random()-.5)*sp,dz=fz+(Math.random()-.5)*sp;
 V2.set(V.x+dx*80,V.y,V.z+dz*80);
 const hit=world.raycastClosest(V,V2,OB,ray);tracer(V,hit?ray.hitPointWorld:V2);glow(V,3,.06);
 if(hit&&player.onHit)player.onHit(ray.body,w===1?25:12);
 if(hit&&ray.body.mass>0)ray.body.applyImpulse(new CANNON.Vec3(dx*(w===1?300:150),0,dz*(w===1?300:150)));}
export function updatePlayer(dt){
 const b=player.body,m=player.mesh,a=player.active;
 for(const t of tracers)if(t.t>0){t.t-=dt;t.l.visible=t.t>0;}
 if(flashT>0){flashT-=dt;if(flashT<=0)flash.intensity=0;}
 for(let i=booms.length-1;i>=0;i--){const e=booms[i];e.t+=dt;const k=e.t/.45;e.m.scale.setScalar(.5+7.5*k);e.m.material.opacity=Math.max(0,1-k);
  if(k>=1){scene.remove(e.m);booms.splice(i,1);}}
 for(let i=rockets.length-1;i>=0;i--){const r=rockets[i],p=r.m.position,s=40*dt;r.life+=dt;
  V.set(p.x,p.y,p.z);V2.set(p.x+r.fx*s,p.y,p.z+r.fz*s);
  const hit=world.raycastClosest(V,V2,OB,ray);
  if(hit||r.life>3){explode(hit?new THREE.Vector3(ray.hitPointWorld.x,ray.hitPointWorld.y,ray.hitPointWorld.z):p);scene.remove(r.m);rockets.splice(i,1);}
  else{p.set(V2.x,V2.y,V2.z);r.m.rotation.y=Math.atan2(r.fx,r.fz);}}
 if(player.hp<=0){player.deaths++;resetPlayer();return;}
 if(a){b.position.copy(a.body.position);b.velocity.set(0,0,0);player.heading=a.heading;player.speed=0;
  m.visible=a.type==='bike';ll.rotation.x=rl.rotation.x=-1.3;la.rotation.x=ra.rotation.x=-1.1;wg.forEach(g=>g&&(g.visible=false));return;}
 m.visible=true;
 player.heading+=(input.left-input.right)*2.6*dt;const h=player.heading,fx=Math.sin(h),fz=Math.cos(h);
 const sp=input.sprint?8.5:4.2,s=input.up?sp:input.down?-2.5:0;player.speed=Math.abs(s);
 b.velocity.x=fx*s;b.velocity.z=fz*s;
 const gr=world.raycastClosest(b.position,new CANNON.Vec3(b.position.x,b.position.y-.75,b.position.z),OG,ray);
 if(gr&&input.jump&&b.velocity.y<2)b.velocity.y=8*(G.superJump?3:1);if(!gr)b.velocity.y-=14*dt*(G.moon?.2:1);
 cd-=dt;if(input.fire&&cd<=0)shoot(fx,fz);
 m.position.set(b.position.x,b.position.y-.6,b.position.z);m.rotation.y=h;
 walkT+=s?dt*(input.sprint?1.5:1):0;const sw=s&&gr?Math.sin(walkT*10)*(input.sprint?.9:.6):0;
 ll.rotation.x=sw;rl.rotation.x=-sw;la.rotation.x=-sw;ra.rotation.x=player.weapon?-1.45:sw;
 if(punchT>0){punchT-=dt;ra.rotation.x=-Math.sin((1-Math.max(punchT,0)/.25)*Math.PI)*1.6;}
 wg.forEach((g,i)=>g&&(g.visible=i===player.weapon));
}
