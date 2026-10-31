import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {player} from '../entities/player.js';
import {makePoliceMesh,drive} from '../entities/vehicles.js';
export const policeGroup=new THREE.Group();
const RD=[-240,-180,-120,-60,0,60,120,180,240],nr=v=>RD.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a),cl=(x,a,b)=>Math.max(a,Math.min(b,x));
const cops=[],Zv=new CANNON.Vec3(0,0,1),F=new CANNON.Vec3(),A=new CANNON.Vec3(),B=new CANNON.Vec3(),RR=new CANNON.RaycastResult(),RO={collisionFilterMask:1,skipBackfaces:true};
let world,heat=0,stars=0,evade=0,seeAcc=0,sees=false,shown=-1,starsEl;
export function initPolice(scene,w){world=w;scene.add(policeGroup);starsEl=document.getElementById('stars');
 for(let i=0;i<3;i++){const mesh=makePoliceMesh(),half=[.95,.6,2.1];policeGroup.add(mesh);
  const body=new CANNON.Body({mass:1600,shape:new CANNON.Box(new CANNON.Vec3(...half)),collisionFilterGroup:1,collisionFilterMask:-1,angularDamping:.8,linearDamping:.2,allowSleep:false});
  w.addBody(body);const c={mesh,body,half,type:'car',speed:30,heading:0,sF:0,flip:0,hp:100,on:false,cool:0,stuck:0,rev:0,sirens:mesh.sirens,inp:{up:0,down:0,left:0,right:0,jump:0,brake:0}};
  park(c,0);cops.push(c);}
 player.onCrime=crime;hud();}
function park(c,cool){c.on=false;c.cool=cool;c.mesh.visible=false;c.body.collisionFilterMask=0;c.body.position.set(0,-100,0);c.body.sleep();}
function spawn(c,i){const p=player.body.position,z=Math.random()<.5,r=nr(z?p.x:p.z),t=cl((z?p.z:p.x)+(Math.random()<.5?1:-1)*(90+Math.random()*20)+i*10,-275,275),x=z?r-3:t,zz=z?t:r-3,b=c.body;
 b.wakeUp();b.collisionFilterMask=-1;b.position.set(x,.8,zz);b.velocity.set(0,0,0);b.angularVelocity.set(0,0,0);b.quaternion.setFromEuler(0,Math.atan2(p.x-x,p.z-zz),0);
 c.hp=100;c.on=true;c.mesh.visible=true;c.stuck=c.rev=c.flip=0;}
function hud(){if(shown===stars&&starsEl.dataset.b==(evade>1?1:0))return;shown=stars;starsEl.dataset.b=evade>1?1:0;starsEl.className=evade>1?'blink':'';
 starsEl.innerHTML=[0,1,2,3,4].map(i=>`<span class="s${i<stars?' on':''}">⭐</span>`).join('');}
export function crime(n){heat=Math.min(25,heat+n);const s=heat>=15?5:heat>=9?4:heat>=5?3:heat>=2?2:heat>=.6?1:0;if(s>stars)stars=s;if(stars)evade=0;hud();}
export function clearWanted(){heat=0;stars=0;evade=0;for(const c of cops)park(c,0);hud();}
export const resetPolice=clearWanted;
export function policeHit(b,dmg){const c=cops.find(k=>k.on&&k.body===b);if(!c)return;crime(1);c.hp-=dmg;if(c.hp<=0)park(c,6);}
export function policeBlast(pos){for(const c of cops)if(c.on&&Math.hypot(c.body.position.x-pos.x,c.body.position.z-pos.z)<10){c.hp-=60;if(c.hp<=0)park(c,6);}}
export function updatePolice(dt){
 const av=player.active,tb=(av?av.body:player.body).position,ph=player.heading,n=[0,1,1,2,3,3][stars],t=performance.now();
 cops.forEach((c,i)=>{if(!c.on){c.cool-=dt;if(i<n&&c.cool<=0)spawn(c,i);return;}
  if(i>=n){park(c,0);return;}
  const b=c.body,inp=c.inp;b.quaternion.vmult(Zv,F);c.heading=Math.atan2(F.x,F.z);
  let tx=tb.x,tz=tb.z;if(i===1){tx+=Math.sin(ph)*25;tz+=Math.cos(ph)*25;}else if(i===2){tx+=Math.cos(ph)*12;tz-=Math.sin(ph)*12;}
  let dx=tx-b.position.x,dz=tz-b.position.z,dist=Math.hypot(dx,dz);
  if(i>0&&dist<12){dx=tb.x-b.position.x;dz=tb.z-b.position.z;dist=Math.hypot(dx,dz);}
  let want=Math.atan2(dx,dz);const ox=b.position.x+F.x*2.4,oz=b.position.z+F.z*2.4,sy=b.position.y+.3;
  const ray=a=>{A.set(ox,sy,oz);B.set(ox+Math.sin(a)*9,sy,oz+Math.cos(a)*9);return world.raycastClosest(A,B,RO,RR)?RR.distance:99;};
  const df=ray(c.heading),dl=ray(c.heading+.6),dr=ray(c.heading-.6);
  if(df<9||dl<5||dr<5)want=c.heading+(dl>dr?.9:-.9);
  let d=want-c.heading;d=Math.atan2(Math.sin(d),Math.cos(d));
  inp.left=cl(d*1.5,0,1);inp.right=cl(-d*1.5,0,1);
  const spd=Math.hypot(b.velocity.x,b.velocity.z);c.stuck=spd<1.5&&dist>8?c.stuck+dt:0;if(c.stuck>1.5){c.rev=1.2;c.stuck=0;}
  if(c.rev>0){c.rev-=dt;inp.up=0;inp.down=1;}else{inp.down=0;inp.up=dist>6?1:0;}
  c.speed=24+stars*3;drive(c,dt,inp);
  c.mesh.position.copy(b.position);c.mesh.quaternion.copy(b.quaternion);
  const on=((t/160)|0)%2;c.sirens[0].material.emissive.setHex(on?0xff0000:0x110000);c.sirens[1].material.emissive.setHex(on?0x000011:0x0044ff);
  if(dist<(av?4.5:3.5))player.hp-=(av?8:14)*dt;
  if(dist>170)park(c,1);});
 if(stars){seeAcc+=dt;if(seeAcc>.25){seeAcc=0;sees=false;
  for(const c of cops)if(c.on&&Math.hypot(c.body.position.x-tb.x,c.body.position.z-tb.z)<90){
   A.set(c.body.position.x,c.body.position.y+1,c.body.position.z);B.set(tb.x,tb.y+1,tb.z);if(!world.raycastClosest(A,B,RO,RR)){sees=true;break;}}}
  if(sees)evade=0;else evade+=dt;if(evade>=15)clearWanted();else hud();}}
export const getStars=()=>stars;export const copList=()=>cops;
export function setWanted(n){heat=[0,.6,2,5,9,15][n];stars=n;evade=0;if(!n)for(const c of cops)park(c,0);hud();}
export function nearestCop(){let m=999;const p=player.body.position;for(const c of cops)if(c.on)m=Math.min(m,Math.hypot(c.body.position.x-p.x,c.body.position.z-p.z));return m;}
