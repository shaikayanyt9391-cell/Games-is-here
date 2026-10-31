import * as THREE from 'three';
import * as CANNON from 'cannon-es';
let seed=7;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
const M=new THREE.Matrix4(),P=new THREE.Vector3(),S=new THREE.Vector3(),C=new THREE.Color(),ID=new THREE.Quaternion();
const pick=a=>a[(rnd()*a.length)|0];
export function buildCity(scene,world){
 const g=new THREE.Mesh(new THREE.PlaneGeometry(600,600).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x5f7f4a}));
 g.receiveShadow=true;scene.add(g);
 const gb=new CANNON.Body({mass:0,shape:new CANNON.Plane()});gb.quaternion.setFromEuler(-Math.PI/2,0,0);world.addBody(gb);
 const mk=(geo,n,sh)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial(),n);m.count=0;m.castShadow=sh;m.receiveShadow=true;m.frustumCulled=false;scene.add(m);return m;};
 const put=(m,x,y,z,sx,sy,sz,c,q)=>{P.set(x,y,z);S.set(sx,sy,sz);M.compose(P,q||ID,S);m.setMatrixAt(m.count,M);m.setColorAt(m.count,C.set(c));m.count++;};
 const col=(x,y,z,hx,hy,hz,q)=>{const b=new CANNON.Body({mass:0,shape:new CANNON.Box(new CANNON.Vec3(hx,hy,hz)),position:new CANNON.Vec3(x,y,z)});if(q)b.quaternion.set(q.x,q.y,q.z,q.w);world.addBody(b);};
 const box=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(.5,.5,1,6);
 const bld=mk(box,260,true),road=mk(box,40,false),pole=mk(cyl,300,false),lamp=mk(new THREE.SphereGeometry(.5,6,4),300,false),
  trunk=mk(cyl,90,false),crown=mk(new THREE.IcosahedronGeometry(.5,0),90,false),ramp=mk(box,4,true),loop=mk(box,28,true),cont=mk(box,40,true);
 // c) Highway ring road + grid roads + central plaza
 for(let r=-240;r<=240;r+=60){put(road,r,.05,0,12,.1,560,0x2b2b2e);put(road,0,.05,r,560,.1,12,0x2b2b2e);}
 for(const s of[-280,280]){put(road,s,.05,0,16,.1,576,0x1f1f22);put(road,0,.05,s,576,.1,16,0x1f1f22);}
 put(road,0,.075,0,90,.15,90,0x8d8a80);
 put(road,230,.12,150,18,.1,170,0x3a3a3f); // airport runway
 // a) Downtown (NW) + b) Residential/Market
 const dt=[0x6c7a89,0x8395a7,0x4b6584,0x95a5a6],rs=[0xe0b084,0xd98880,0xf7dc6f,0xa9cce3,0xf0e6d2];
 for(let i=-4;i<4;i++)for(let j=-4;j<4;j++){const bx=i*60+30,bz=j*60+30;
  if(Math.abs(bx)<60&&Math.abs(bz)<60)continue;if(bx>60&&bz>60)continue;
  const down=bx<0&&bz<0;
  for(const ox of[-12,12])for(const oz of[-12,12]){const w=down?20:18,h=down?40+rnd()*70:6+rnd()*12;
   put(bld,bx+ox,h/2,bz+oz,w,h,w,pick(down?dt:rs));col(bx+ox,h/2,bz+oz,w/2,h/2,w/2);}
  if(!down){put(trunk,bx,1.2,bz,.5,2.4,.5,0x6b4a2b);put(crown,bx,3.6,bz,3.4,3.4,3.4,0x2e7d32);}
 }
 for(let r=-240;r<=240;r+=60)for(let t=-270;t<=270;t+=45){
  for(const [x,z] of [[r+7,t],[t,r+7]]){if(Math.abs(x)<60&&Math.abs(z)<60)continue;if(x>60&&z>60)continue;
   put(pole,x,3,z,.25,6,.25,0x555555);put(lamp,x,6.2,z,.9,.6,.9,0xfff3b0);}}
 // d) Airport & Mega Stunt Park: 4 ramps, loop, containers
 const qy=new THREE.Quaternion(),qz=new THREE.Quaternion(),q=new THREE.Quaternion(),th=20*Math.PI/180;
 [[110,120,0],[170,120,Math.PI],[110,170,Math.PI/2],[170,170,-Math.PI/2]].forEach(([x,z,yaw])=>{
  qy.setFromAxisAngle(new THREE.Vector3(0,1,0),yaw);qz.setFromAxisAngle(new THREE.Vector3(0,0,1),th);q.copy(qy).multiply(qz);
  const y=8*Math.sin(th)+.3*Math.cos(th);put(ramp,x,y,z,16,.6,10,0xf5c518,q);col(x,y,z,8,.3,5,q);});
 const R=12,N=28,cx=200,cz=90;
 for(let k=0;k<N;k++){const a=2*Math.PI*k/N;qz.setFromAxisAngle(new THREE.Vector3(0,0,1),a);
  const x=cx+R*Math.sin(a),y=R+.4-R*Math.cos(a),len=2*Math.PI*R/N+.6;
  put(loop,x,y,cz,len,.8,8,0xe74c3c,qz);col(x,y,cz,len/2,.4,4,qz);}
 const cc=[0xc0392b,0x2980b9,0x27ae60,0xd35400];
 for(let k=0;k<12;k++){const lvl=k%3===0?1:0,px=150+(k%4)*22,pz=240+(k>>2)*5;
  put(cont,px,1.3+lvl*2.6,pz,12,2.6,2.4,cc[k%4]);col(px,1.3+lvl*2.6,pz,6,1.3,1.2);}
}
