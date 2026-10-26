import {timelineForSteps} from './data.js';
export class Session {
 constructor({routine,minutes,slots,prep=10,now=()=>performance.now()}){
  this.routine=routine;this.minutes=minutes;this.slots=slots.map(s=>({...s}));this.prep=prep;this.now=now;
  this.timeline=timelineForSteps(this.slots,prep);this.index=0;this.remaining=this.timeline[0].seconds;
  this.paused=false;this.ended=false;this.last=this.now();this.elapsed=0;this.skipped=new Set();this.finished=new Set();this.startedAt=new Date().toISOString();
 }
 get phase(){return this.timeline[this.index];}
 get secondsLeft(){if(this.ended)return 0;return this.remaining+this.timeline.slice(this.index+1).reduce((s,p)=>s+p.seconds,0);}
 tick(){
  const time=this.now();if(this.paused||this.ended){this.last=time;return false;}
  let delta=Math.max(0,(time-this.last)/1000);this.last=time;
  // A suspended page must not fast-forward through unobserved movements.
  if(delta>3){this.paused=true;return 'suspended';}
  this.elapsed+=delta;this.remaining-=delta;let changed=false;
  while(this.remaining<=0&&!this.ended){const carry=this.remaining;const old=this.phase;this.index++;changed=true;
   if(this.index>=this.timeline.length){if(!this.skipped.has(old.slot))this.finished.add(old.slot);this.ended=true;this.remaining=0;break;}
   if(this.phase.slot!==old.slot&&!this.skipped.has(old.slot))this.finished.add(old.slot);
   this.remaining=this.phase.seconds+carry;
  }return changed;
 }
 pause(){this.tick();this.paused=true;}
 resume(){this.last=this.now();this.paused=false;}
 seekSlot(slot){const ix=this.timeline.findIndex(p=>p.slot===slot);if(ix<0)return;this.index=ix;this.remaining=this.phase.seconds;this.last=this.now();this.ended=false;}
 skip(){if(this.ended)return;const slot=this.phase.slot;this.skipped.add(slot);this.finished.delete(slot);
  if(slot+1>=this.slots.length){this.ended=true;this.remaining=0;return;}this.seekSlot(slot+1);
 }
 back(){const slot=this.phase.slot;this.seekSlot(Math.max(0,slot-1));this.finished.delete(Math.max(0,slot-1));this.skipped.delete(Math.max(0,slot-1));}
 replace(id){const slot=this.phase.slot;this.slots[slot]={id,side:''};this.timeline=timelineForSteps(this.slots,this.prep);this.seekSlot(slot);}
}
export function preferredSlots(slots,seated){
 if(!seated)return slots.map(s=>({...s}));
 const map={squeeze:'chest',pelvic:'rotation',kneerolls:'rotation',heelslide:'kneeextend',quads:'kneeextend',legraise:'kneeextend',calf:'ankles',breathing:'chest',hip:'kneeextend',wall:'extension',crossbody:'chest',rolls:'chest'};
 return slots.map((s,i)=>({id:map[s.id]||s.id,side:(map[s.id]==='rotation'||map[s.id]==='kneeextend')?(s.side||(['left','right'][i%2])):(['rotation','kneeextend','hamstring'].includes(s.id)?s.side:'')}));
}
