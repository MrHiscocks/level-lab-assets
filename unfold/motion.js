import {exercises} from './data.js?v=5';
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const frame=n=>Math.round(clamp(n,0,5));
const mix=(a,b,p)=>a+(b-a)*clamp(p);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isBrowser=typeof document!=='undefined';
const reduced=isBrowser?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
let provider=()=>null,nodes=[],raf=0,lastPaint=0;
const instances=new WeakMap(),loaded=new Map();

export function cycleSeconds(id){return exercises[id].parts.reduce((s,p)=>s+p[1],0)}
export function previewPose(id,seconds){
 const t=((seconds%5.5)+5.5)%5.5;
 if(id==='rolls')return {frame:frame(5*t/5.5),label:'Slow circle backwards'};
 if(id==='kneerolls'){
  const order=[0,1,2,1,0,4,5,4,0];return {frame:order[Math.min(8,Math.floor(t/5.5*9))],label:t<2.75?'Roll gently to one side':'Return and change sides'};
 }
 if(id==='breathing')return {frame:t<2.2?frame(3*t/2.2):frame(3+2*(t-2.2)/3.3),label:t<2.2?'Breathe in gently':'Breathe out gently'};
 if(t<2)return {frame:frame(5*t/2),label:id==='quads'||id==='squeeze'?'Tighten gently':'Move gently'};
 if(t<3)return {frame:5,label:'Comfortable end position'};
 if(t<5)return {frame:frame(5*(1-(t-3)/2)),label:'Release slowly'};
 return {frame:0,label:'Relax'};
}
export function sessionPose(id,phase,remaining){
 const e=exercises[id],elapsed=clamp(phase.seconds-remaining,0,phase.seconds);
 if(phase.kind==='prepare')return {...previewPose(id,elapsed),label:'Watch the movement'};
 if(phase.kind==='rest')return {frame:0,label:'Relax and reset'};
 if(phase.timed){
  if(e.continuous){const total=cycleSeconds(id),cycle=elapsed%total;let time=cycle,part=0;while(part<e.parts.length-1&&time>=e.parts[part][1]){time-=e.parts[part][1];part++;}const [label,seconds]=e.parts[part];return sessionPose(id,{kind:'work',part,seconds,label},seconds-time);}
  return {frame:frame(5*elapsed/Math.min(2,phase.seconds/4)),label:'Hold gently · breathe naturally'};
 }
 const part=phase.part||0,duration=phase.seconds;
 if(id==='rolls')return {frame:frame(5*elapsed/duration),label:phase.label};
 if(id==='kneerolls'){
  const t=(part?e.parts[0][1]:0)+elapsed,order=[0,1,2,1,0,4,5,4,0];
  return {frame:order[Math.min(8,Math.floor(t/cycleSeconds(id)*9))],label:phase.label};
 }
 if(id==='breathing')return {frame:part===0?frame(3*elapsed/duration):frame(3+2*elapsed/duration),label:phase.label};
 if(e.parts.length===3)return {frame:part===0?frame(5*elapsed/duration):part===1?5:frame(5*(1-elapsed/duration)),label:phase.label};
 const moving=['wall','ankles','pelvic','heelslide','hip','forearmturn'].includes(id);
 const transition=moving?duration:Math.min(duration,['quads','squeeze'].includes(id)?1.5:2);
 return {frame:part===0?frame(5*elapsed/transition):frame(5*(1-elapsed/transition)),label:phase.label};
}
export function spriteSpec(id){const e=exercises[id];return {url:`./assets/motion/${e.sheet?'atlas-'+e.sheet:id}.webp`,rows:e.sheetRows||2,col:e.sheetColumn??null,count:e.frameRows?.length||e.sheetRows||6,baseRight:e.baseRight??['crossbody','kneeextend','hamstring','heelslide','quads','legraise','calf','wristext','wristflex','glute','hipflexor','quadstretch'].includes(id)}}
export function spritePosition(id,n){const s=spriteSpec(id);return s.col===null?`${(n%3)*50}% ${Math.floor(n/3)*100}%`:`${s.col*50}% ${(exercises[id].frameRows?.[n]??n)/(s.rows-1)*100}%`}
export function motionMarkup(id,side='',context='preview',fallback=''){
 const e=exercises[id],s=spriteSpec(id),mirror=side&&(s.baseRight?side==='left':side==='right');return `<div class="motion-guide ${e.atlas?'motion-floor':''} ${mirror?'motion-mirror':''}" data-motion="${id}" data-context="${context}" role="img" aria-label="Animated guide: ${esc(e.name)}${side?', '+side+' side':''}"><div class="motion-fallback">${fallback}</div><div class="motion-figure" style="background-image:url('${s.url}');background-size:300% ${s.rows*100}%;background-position:${spritePosition(id,0)}"></div><span class="motion-status" aria-hidden="true">${reduced.matches?'Motion off':'Movement guide'}</span>${reduced.matches?'<button class="motion-enable" data-motion-action="enable">Play motion</button>':''}</div>`;
}
export function motionControls(){return '<div class="motion-controls"><button data-motion-action="toggle" aria-label="Pause demonstration">Pause demo</button><button data-motion-action="replay" aria-label="Replay demonstration">Replay</button><button data-motion-action="step" aria-label="Next illustrated position">Next position</button></div><p class="motion-position" role="status">Move gently within your own range.</p>'}
export function setMotionProvider(fn){provider=fn}
function instance(el){let s=instances.get(el);if(!s){s={seconds:0,last:performance.now(),paused:reduced.matches,manual:false,position:0,enabled:!reduced.matches,lastFrame:-1};instances.set(el,s)}return s}
function preload(el){const id=el.dataset.motion;if(!loaded.has(id)){loaded.set(id,new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(true);im.onerror=()=>resolve(false);im.src=spriteSpec(id).url}))}loaded.get(id).then(ok=>{if(el.isConnected)el.dataset.ready=ok?'true':'false'})}
export function refreshMotion(){
 if(!isBrowser)return;nodes=[...document.querySelectorAll('[data-motion]')];nodes.forEach(el=>{instance(el);preload(el)});
 if(nodes.length&&!raf)raf=requestAnimationFrame(paint);if(!nodes.length&&raf){cancelAnimationFrame(raf);raf=0;}
}
function paint(now){raf=0;if(now-lastPaint>=70){lastPaint=now;const state=provider();for(const el of nodes){
 if(!el.isConnected)continue;const s=instance(el),delta=Math.min(.25,Math.max(0,(now-s.last)/1000));s.last=now;
 const session=el.dataset.context==='session'&&state?.phase?.id===el.dataset.motion;
 const rect=el.getBoundingClientRect(),visible=!document.hidden&&rect.bottom>0&&rect.top<innerHeight;
 if(!s.paused&&visible&&(!session||!state.paused))s.seconds+=delta;
 let p;
 const spec=spriteSpec(el.dataset.motion);if(s.manual)p={frame:s.position,label:`Position ${s.position+1} of ${spec.count}`};
 else if(!s.enabled)p={frame:5,label:'Motion off'};
 else if(session)p=sessionPose(el.dataset.motion,state.phase,state.remaining);
 else p=previewPose(el.dataset.motion,s.seconds);
 if(!s.manual)p.frame=Math.round(p.frame/5*(spec.count-1));const position=el.querySelector('.motion-figure');if(position&&s.lastFrame!==p.frame){position.style.backgroundPosition=spritePosition(el.dataset.motion,p.frame);el.dataset.frame=String(p.frame);s.lastFrame=p.frame}
 const caption=el.querySelector('.motion-status');if(caption)caption.textContent=session&&state.paused?'Paused':p.label;
 const sheet=el.closest('.sheet');if(sheet){const status=sheet.querySelector('.motion-position');if(status)status.textContent=s.manual?p.label:'Follow a comfortable range. Use the cues below.';const toggle=sheet.querySelector('[data-motion-action="toggle"]');if(toggle){toggle.textContent=s.paused?'Play demo':'Pause demo';toggle.setAttribute('aria-label',s.paused?'Play demonstration':'Pause demonstration')}}
 }}
 nodes=nodes.filter(el=>el.isConnected);if(nodes.length)raf=requestAnimationFrame(paint);
}
if(isBrowser){
 document.addEventListener('click',event=>{const b=event.target.closest('[data-motion-action]');if(!b)return;const root=b.closest('.motion-guide')||b.closest('.sheet')?.querySelector('.motion-guide');if(!root)return;const s=instance(root),action=b.dataset.motionAction;
  if(action==='enable'){s.enabled=true;s.paused=false;s.seconds=0;b.remove();}
  else if(action==='toggle'){s.paused=!s.paused;s.manual=false;s.enabled=true;}
  else if(action==='replay'){s.seconds=0;s.paused=false;s.manual=false;s.enabled=true;}
  else if(action==='step'){s.position=s.manual?(s.position+1)%spriteSpec(root.dataset.motion).count:(Math.max(0,s.lastFrame)+1)%spriteSpec(root.dataset.motion).count;s.manual=true;s.paused=true;s.enabled=true;}
  s.last=performance.now();refreshMotion();
 });
 document.addEventListener('visibilitychange',()=>{for(const el of nodes)instance(el).last=performance.now()});
}
