import {byId,createSession,recordSet,stepSession,uid} from './core.js';
export class WorkoutPlayer{
 constructor({data,persist,render,tick,finished}){this.data=data;this.persist=persist;this.render=render;this.paint=tick;this.finished=finished;this.last=performance.now();this.saveClock=0;this.interval=setInterval(()=>this.update(),200);document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.session&&!this.session.paused)this.pause()});}
 get session(){return this.data.active}
 start(name,items){this.data.active=createSession(name,items);this.last=performance.now();this.persist();this.render()}
 resume(){if(!this.session)return;this.session.paused=false;this.last=performance.now();this.persist();this.render();this.wake()}
 pause(){if(!this.session)return;this.session.paused=true;this.persist();this.render();this.wakeLock?.release().catch(()=>{})}
 async wake(){try{this.wakeLock=await navigator.wakeLock?.request('screen')}catch{}}
 sound(){if(!this.data.preferences.sound)return;try{const ctx=this.audio||(this.audio=new (window.AudioContext||window.webkitAudioContext)());ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=640;g.gain.setValueAtTime(.045,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.15);o.start();o.stop(ctx.currentTime+.17)}catch{}}
 update(){const now=performance.now(),delta=Math.min((now-this.last)/1000,2);this.last=now;const s=this.session;if(!s||s.paused)return;s.elapsed+=delta;const e=byId[s.items[s.index].id];if(s.phase!=='work'||e.mode==='time'){s.remaining=Math.max(0,s.remaining-delta);if(s.remaining===0){this.sound();if(s.phase==='work')this.complete();else this.begin();return}}this.paint();this.saveClock+=delta;if(this.saveClock>3){this.saveClock=0;this.persist()}}
 begin(){const s=this.session;if(!s)return;s.phase='work';s.remaining=byId[s.items[s.index].id].mode==='time'?s.items[s.index].seconds:0;this.persist();this.render();this.wake()}
 complete(){const s=this.session;if(!s||s.phase!=='work')return;recordSet(s);const rest=s.items[s.index].rest;const done=stepSession(s);if(done){this.finish(true);return}s.phase=rest>0?'rest':'work';s.remaining=rest>0?rest:(byId[s.items[s.index].id].mode==='time'?s.items[s.index].seconds:0);s.restTotal=rest;this.persist();this.render()}
 skip(){const s=this.session;if(!s)return;if(s.phase!=='work'){this.begin();return}s.skipped=(s.skipped||0)+1;s.index++;s.set=1;s.side=0;if(s.index>=s.items.length){this.finish(true);return}s.phase='ready';s.remaining=5;this.persist();this.render()}
 previous(){const s=this.session;if(!s||s.index===0)return;s.index--;s.set=1;s.side=0;s.phase='ready';s.remaining=5;this.persist();this.render()}
 finish(complete=false){const s=this.session;if(!s)return;const h={id:s.id||uid(),name:s.name,date:new Date().toISOString(),duration:Math.round(s.elapsed),sets:s.records,complete:complete&&!s.skipped};if(s.records.length){this.data.history.unshift(h);this.data.history=this.data.history.slice(0,5000)}this.data.active=null;this.persist();this.wakeLock?.release().catch(()=>{});this.finished(h)}
 adjust(key,amount){const s=this.session;if(!s)return;const it=s.items[s.index];const min=key==='weight'?0:1,max=key==='weight'?1000:100;it[key]=Math.min(max,Math.max(min,Math.round((it[key]+amount)*10)/10));this.persist();this.render()}
}
