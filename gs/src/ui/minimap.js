const c=document.getElementById('radar'),x=c.getContext('2d'),R=60,SC=.5,RD=[-280,-240,-180,-120,-60,0,60,120,180,240,280];
export function drawRadar(p,blips,cops,t){
 const o=(p.active?p.active.body:p.body).position,h=p.heading,sn=Math.sin(h),cs=Math.cos(h);
 const tr=(wx,wz)=>{const dx=wx-o.x,dz=wz-o.z;return[R-(dx*cs-dz*sn)*SC,R-(dx*sn+dz*cs)*SC];};
 x.clearRect(0,0,120,120);x.save();x.beginPath();x.arc(R,R,R-2,0,7);x.clip();x.fillStyle='#14281a';x.fillRect(0,0,120,120);
 x.strokeStyle='#6b6b73';x.lineWidth=3;x.beginPath();
 for(const r of RD){let a=tr(r,-290),b=tr(r,290);x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);a=tr(-290,r);b=tr(290,r);x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);}
 x.stroke();
 for(const b of blips){let[sx,sy]=tr(b.x,b.z);const dx=sx-R,dy=sy-R,d=Math.hypot(dx,dy);if(d>R-7){sx=R+dx/d*(R-7);sy=R+dy/d*(R-7);}
  x.fillStyle=b.c;x.beginPath();x.arc(sx,sy,4,0,7);x.fill();}
 const on=((t/200)|0)%2;x.fillStyle=on?'#ff2020':'#3070ff';
 for(const k of cops){if(!k.on)continue;const[sx,sy]=tr(k.body.position.x,k.body.position.z);if(Math.hypot(sx-R,sy-R)<R-4){x.beginPath();x.arc(sx,sy,3.5,0,7);x.fill();}}
 x.fillStyle='#fff';x.beginPath();x.moveTo(R,R-8);x.lineTo(R-5,R+5);x.lineTo(R+5,R+5);x.fill();x.restore();}
