import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {input,toast} from '../ui/controls.js';
import {G} from '../core/engine.js';
import {player} from './player.js';
export const vehicleGroup=new THREE.Group(),vehicles=[];
let world;
const L=(c,e=0)=>new THREE.MeshLambertMaterial({color:c,emissive:e});
const box=(g,w,h,l,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,l),L(c));m.position.set(x,y,z);g.add(m);return m;};
const wheel=(g,r,w,x,y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,14),L(0x111111));m.rotation.z=Math.PI/2;m.position.set(x,y,z);g.add(m);};
function bike(col,acc,hy){const g=new THREE.Group(),p=new THREE.Group();g.add(p);g.pivot=p;
 for(const z of[-.7,.7])wheel(p,.33,.14,0,-hy+.33,z);
 box(p,.22,.3,1.2,0x222222,0,-hy+.65,0);box(p,.3,.28,.5,acc,0,-hy+.95,.25);box(p,.24,.12,.55,0x111111,0,-hy+.88,-.25);
 box(p,.34,.4,.4,col,0,-hy+.8,.7);box(p,.3,.08,.6,col,0,-hy+.55,-.8);box(p,.7,.05,.05,acc,0,-hy+1.05,.5);return g;}
function car(o){const g=new THREE.Group(),{w,l,bh,ch,cl,cz,wr,col,cab,hy}=o,by=-hy+wr+bh/2;
 box(g,w,bh,l,col,0,by,0);box(g,w*.88,ch,cl,cab,0,by+bh/2+ch/2,cz);
 for(const x of[-1,1])for(const z of[-1,1])wheel(g,wr,wr*.6,x*w/2,-hy+wr,z*l*.32);
 g.by=by;g.roof=by+bh/2+ch;return g;}
function police(){const g=car({w:1.9,l:4.2,bh:.95,ch:.8,cl:2,cz:-.3,wr:.45,col:0xf2f2f2,cab:0x1b1b1b,hy:.6});
 box(g,1.92,.14,3,0x1565c0,0,g.by,0);const r=box(g,.35,.12,.3,0xff0000,-.35,g.roof+.06,-.3),b=box(g,.35,.12,.3,0x0044ff,.35,g.roof+.06,-.3);
 g.sirens=[r,b];return g;}
const SPEC=[
 {id:'hayabusa_1300',type:'bike',speed:42,mass:220,half:[.35,.55,1.1],pos:[6,6],build:()=>bike(0xdc143c,0x111111,.55)},
 {id:'royal_bullet',type:'bike',speed:30,mass:240,half:[.4,.55,1.1],pos:[12,3],build:()=>bike(0x151515,0xd4af37,.55)},
 {id:'thar_4x4',type:'car',speed:28,mass:1400,half:[.95,.7,1.9],pos:[18,8],build:()=>car({w:1.9,l:3.8,bh:.9,ch:.75,cl:1.7,cz:-.4,wr:.55,col:0xb01e1e,cab:0x222222,hy:.7})},
 {id:'lambo_v12',type:'car',speed:48,mass:1100,half:[1,.4,2.2],pos:[6,18],build:()=>car({w:2,l:4.4,bh:.45,ch:.35,cl:1.8,cz:-.2,wr:.34,col:0xe6ff00,cab:0x111111,hy:.4})},
 {id:'police_interceptor',type:'car',speed:35,mass:1600,half:[.95,.6,2.1],pos:[16,22],build:police},
 {id:'monster_truck',type:'car',speed:24,mass:3500,half:[1.1,1.2,2.1],pos:[26,14],build:()=>car({w:2.2,l:4.2,bh:.9,ch:.8,cl:1.8,cz:-.3,wr:1.1,col:0xff8c00,cab:0x222222,hy:1.2})},
];
export function initVehicles(scene,w){world=w;scene.add(vehicleGroup);vehicleGroup.visible=false;
 SPEC.forEach((s,i)=>{const mesh=s.build();vehicleGroup.add(mesh);
  const body=new CANNON.Body({mass:s.mass,shape:new CANNON.Box(new CANNON.Vec3(...s.half)),position:new CANNON.Vec3(s.pos[0],s.half[1]+.1,s.pos[1]),
   collisionFilterGroup:2,collisionFilterMask:1,angularDamping:.8,linearDamping:.2,allowSleep:false});
  body.quaternion.setFromEuler(0,i*1.1,0);world.addBody(body);
  vehicles.push({...s,mesh,body,pivot:mesh.pivot,sirens:mesh.sirens,heading:0,sF:0,flip:0,owned:false});});
 player.vehicles=vehicles;}
const F=new CANNON.Vec3(),N=new CANNON.Vec3(),S=new CANNON.Vec3(),A=new CANNON.Vec3(),B=new CANNON.Vec3(),RR=new CANNON.RaycastResult();
const X=new CANNON.Vec3(1,0,0),Y=new CANNON.Vec3(0,1,0),Z=new CANNON.Vec3(0,0,1),RO={collisionFilterMask:1,skipBackfaces:true};
const cl=(x,a,b)=>Math.max(a,Math.min(b,x));
export function drive(v,dt,inp=input){const b=v.body,q=b.quaternion,vel=b.velocity,w=b.angularVelocity;
 q.vmult(Z,F);q.vmult(Y,N);q.vmult(X,S);
 A.copy(b.position);B.set(A.x,A.y-v.half[1]-.4,A.z);
 const gr=world.raycastClosest(A,B,RO,RR);v.grounded=gr;v.slip=0;
 if(gr){let sF=vel.dot(F),sS=vel.dot(S);const sN=vel.dot(N);
  const hb=inp.brake||(v.type==='car'&&inp.jump),mx=v.speed,tgt=hb?0:inp.up?mx:inp.down?-mx*.35:0;
  sF+=(tgt-sF)*Math.min(1,(hb?2.5:(inp.up||inp.down)?1.5:.4)*dt);
  if(v.type==='bike'&&inp.jump&&sF>4)sF=Math.min(sF+8*dt,mx*1.05);
  v.slip=Math.abs(sS)+(hb?Math.abs(sF)*.3:0);sS*=Math.pow(hb?.4:.0001,dt);
  const r=(inp.left-inp.right)*(hb&&v.type==='car'?2.6:1.8)*cl(sF/5,-1,1)*(1-.45*Math.min(1,Math.abs(sF)/mx)),d=w.dot(N);
  w.x+=N.x*(r-d);w.y+=N.y*(r-d);w.z+=N.z*(r-d);
  vel.set(F.x*sF+S.x*sS+N.x*sN,F.y*sF+S.y*sS+N.y*sN,F.z*sF+S.z*sS+N.z*sN);v.sF=sF;}
 const k=gr?(N.y<.5?10:0):1.5;if(k){w.x+=-N.z*k*dt;w.z+=N.x*k*dt;}
 v.flip=N.y<.25?v.flip+dt:0;
 if(v.flip>1.2){q.setFromEuler(0,v.heading,0);b.position.y+=1.2;w.set(0,0,0);v.flip=0;}}
export function updateVehicles(dt){const t=performance.now(),k=Math.pow(.3,dt);
 for(const v of vehicles){const b=v.body,act=v===player.active;
  if(act)drive(v,dt);else{b.velocity.x*=k;b.velocity.z*=k;b.angularVelocity.y*=k;v.sF=0;}
  b.quaternion.vmult(Z,F);v.heading=Math.atan2(F.x,F.z);
  v.mesh.position.copy(b.position);v.mesh.quaternion.copy(b.quaternion);
  if(v.pivot){const ratio=Math.min(1,Math.abs(v.sF)/v.speed),lean=act?-(input.left-input.right)*.5*ratio:0,wh=act&&input.jump&&v.grounded&&v.sF>5?-.5:0,e=Math.min(1,6*dt);
   v.pivot.rotation.z+=(lean-v.pivot.rotation.z)*e;v.pivot.rotation.x+=(wh-v.pivot.rotation.x)*e;}
  if(v.sirens){const on=((t/160)|0)%2;v.sirens[0].material.emissive.setHex(on?0xff0000:0x110000);v.sirens[1].material.emissive.setHex(on?0x000011:0x0044ff);}}}
export function nearestVehicle(){const p=player.body.position;let best=null,bd=4.5;
 for(const v of vehicles){const d=Math.hypot(v.body.position.x-p.x,v.body.position.z-p.z);if(d<bd){bd=d;best=v;}}return best;}
export function enterOrExitVehicle(){const a=player.active,b=player.body;
 if(a){a.body.quaternion.vmult(X,S);b.position.set(a.body.position.x+S.x*2.4,.8,a.body.position.z+S.z*2.4);
  b.velocity.set(0,0,0);b.collisionFilterMask=1;player.active=null;player.scene.add(player.mesh);return;}
 const v=nearestVehicle();if(!v)return;if(G.GAME_STATE==='STORY'&&!v.free&&!G.unlocked.has(v.id)){toast('🔒 LOCKED — COMPLETE MISSIONS TO UNLOCK');return;}player.active=v;b.collisionFilterMask=0;if(!v.owned){v.owned=true;if(player.onCrime)player.onCrime(1.2);}
 if(v.type==='bike'){v.pivot.add(player.mesh);player.mesh.position.set(0,-v.half[1]+.2,-.15);player.mesh.rotation.set(0,0,0);}}
export const makePoliceMesh=()=>police();
export function spawnVehicle(id){const v=vehicles.find(x=>x.id===id);if(!v||player.active===v)return null;
 const p=player.body.position,h=player.heading,b=v.body;
 b.position.set(p.x+Math.sin(h)*7,v.half[1]+.4,p.z+Math.cos(h)*7);b.quaternion.setFromEuler(0,h,0);
 b.velocity.set(0,0,0);b.angularVelocity.set(0,0,0);v.owned=true;return v;}
export {box,wheel};
export const specById=id=>SPEC.find(s=>s.id===id);
export function makeVehicle(s,reg){const mesh=s.build();vehicleGroup.add(mesh);
 const body=new CANNON.Body({mass:s.mass,shape:new CANNON.Box(new CANNON.Vec3(...s.half)),position:new CANNON.Vec3(900,-200,900),collisionFilterGroup:2,collisionFilterMask:1,angularDamping:.8,linearDamping:.2,allowSleep:false});
 world.addBody(body);body.sleep();
 const v={...s,mesh,body,pivot:mesh.pivot,sirens:mesh.sirens,heading:0,sF:0,flip:0,owned:false,free:!!s.free};if(reg)vehicles.push(v);return v;}
