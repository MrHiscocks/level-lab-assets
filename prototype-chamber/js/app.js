(function(){
  'use strict';
  const packs=window.PACKS||[],all=packs.flatMap(p=>p.assets),byId=new Map(all.map(a=>[a.id,a]));
  const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>[...root.querySelectorAll(s)];
  const symbols={download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',cube:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V8M12 13v10"/>',play:'<path d="m8 5 11 7-11 7Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',grid:'<path d="M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z"/>',heart:'<path d="M12 21 3 12C-2 4 7-1 12 6c5-7 14-2 9 6Z"/>',arrow:'<path d="m9 5 7 7-7 7"/>',eye:'<path d="M2 12S6 5 12 5s10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'};
  const icon=n=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[n]||symbols.cube}</svg>`;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const themeName=s=>packs.find(p=>p.slug===s)?.name||s;
  const fileStem=s=>themeName(s).replace(/[^a-zA-Z0-9]/g,'');
  let selected=new Set(),kit='build',busy=false,timer;
  try{const saved=JSON.parse(localStorage.getItem('level-lab-selection-v1')||'[]');if(Array.isArray(saved))selected=new Set(saved.map(id=>typeof id==='string'?id.replace(/\/sFlag\.png$/,'/sGoal.png').replace(/\/sSolidFill\.png$/,'/sSolid.png'):id).filter(id=>byId.has(id)));}catch{}
  const page=document.body.dataset.page,pack=packs.find(p=>p.slug===page),content=$('#content');
  const animations=new Map();
  function stopAnimations(){animations.forEach(v=>clearInterval(v));animations.clear();}
  function notify(message,error=false){const box=$('#toast');clearTimeout(timer);box.textContent=message;box.classList.toggle('error',error);box.hidden=false;timer=setTimeout(()=>box.hidden=true,error?9000:4500);}
  function sync(){
    try{localStorage.setItem('level-lab-selection-v1',JSON.stringify([...selected]));}catch{}
    $$('.selection-count').forEach(x=>x.textContent=selected.size);
    $('#selection-bar').hidden=!selected.size||page==='selection';
    $('#selection-total').textContent=`${selected.size} asset${selected.size===1?'':'s'} selected`;
    $$('[data-asset-check]').forEach(x=>{x.checked=selected.has(x.dataset.assetCheck);x.closest('.asset-card')?.classList.toggle('selected',x.checked);});
    $$('[data-custom-download]').forEach(x=>x.disabled=busy||!selected.size);
  }
  function check(a){return `<label class="check-label"><input type="checkbox" data-asset-check="${a.id}" aria-label="Select ${esc(themeName(a.theme))}: ${esc(a.title)}" ${selected.has(a.id)?'checked':''}></label>`;}
  function download(a,small=false){return `<a class="btn ${small?'btn-small':''}" href="${a.url}" download="${a.name}" aria-label="Download ${esc(a.name)}">${icon('download')}Download</a>`;}
  function meta(a){return a.type==='audio'?`${a.duration.toFixed(2).replace(/\.00$/,'')} seconds${a.name==='sMusic.wav'?' · loops':''}`:`${a.width} × ${a.height}${a.frames>1?` · ${a.frames} frames · 64 × 64 each`:''}`;}
  function card(a){
    const sel=selected.has(a.id)?' selected':'';
    if(a.type==='audio')return `<article class="asset-card audio-card${sel}" data-id="${a.id}">${check(a)}<div><h3>${esc(a.title)}</h3><p class="filename">${a.name}</p><p class="meta">${meta(a)}</p></div>${download(a,true)}<audio controls preload="none" ${a.name==='sMusic.wav'?'loop':''} aria-label="${esc(themeName(a.theme)+' '+a.title)}"><source src="${a.url}" type="audio/wav"></audio></article>`;
    const image=`<img src="${a.url}" alt="${esc(a.title)}" loading="lazy" width="${a.width}" height="${a.height}" class="${a.frames>1?'strip':a.name==='sGoal.png'?'goal':a.width===64?'single':''}">`;
    if(a.folder==='background')return `<article class="asset-card background-card${sel}" data-id="${a.id}">${check(a)}<div class="asset-stage">${image}</div><div class="background-info"><div><h3>${esc(a.title)}</h3><p class="meta">${meta(a)} · ${a.group==='title-screen'?'Single screen':'Tiles horizontally'}</p></div><div class="background-actions"><button class="btn btn-small" data-preview="${a.id}" aria-label="Preview ${esc(themeName(a.theme))} ${a.title} with game assets">${icon('eye')}Preview</button>${download(a,true)}</div></div></article>`;
    return `<article class="asset-card${sel}" data-id="${a.id}">${check(a)}<div class="asset-stage">${image}${a.frames>1?`<button class="play-animation" data-animate="${a.id}" aria-label="Play ${esc(a.title)} animation" aria-pressed="false">${icon('play')}</button>`:''}</div><div class="asset-info"><h3>${esc(a.title)}</h3><p class="filename">${a.name}</p><p class="meta">${meta(a)}</p></div>${download(a,true)}</article>`;
  }
  function section(title,items,cls=''){return items.length?`<section aria-label="${esc(title)}"><h2>${title}</h2><div class="asset-grid ${cls}">${items.map(card).join('')}</div></section>`:'';}
  function kitLink(kind,label,primary=false){return `<a href="downloads/${fileStem(pack.slug)}_${kind}.zip" download class="btn ${primary?'btn-primary':''}">${icon('download')}${label}</a>`;}
  function showTheme(){
    stopAnimations();
    const a=pack.assets.filter(x=>x.kit===kit);
    content.innerHTML=`<nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">All themes</a>${icon('arrow')}<strong>${esc(pack.name)}</strong></nav>
      <header class="hero"><img class="hero-scene" src="images/scenes/${pack.slug}.webp" alt=""><h1 class="sr-only">${esc(pack.name)} asset pack</h1><img class="hero-title" src="images/titles/${pack.slug}.png" alt="${esc(pack.name)}"><p class="hero-caption">${esc(window.THEME_COPY[pack.slug])}</p><div class="hero-actions">${kitLink(kit==='build'?'BuildKit':'LevelUpKit',kit==='build'?'Download Build Kit':'Download Level Up Kit',true)}${kitLink('FullPack','Download Full Pack')}</div></header>
      <div class="tabs" role="tablist" aria-label="Asset kits"><button role="tab" id="build-tab" class="tab" data-kit="build" aria-selected="${kit==='build'}" aria-controls="kit-panel" tabindex="${kit==='build'?0:-1}">${icon('cube')}Build Kit</button><button role="tab" id="levelup-tab" class="tab" data-kit="levelup" aria-selected="${kit==='levelup'}" aria-controls="kit-panel" tabindex="${kit==='levelup'?0:-1}">${icon('cube')}Level Up Kit</button></div>
      <div id="kit-panel" role="tabpanel" aria-labelledby="${kit==='build'?'build':'levelup'}-tab"><div class="kit-note"><p>${kit==='build'?'Everything you need to get started.':'Optional assets for your next challenge.'}</p><button class="select-kit" data-select-kit>Select all ${a.length} assets</button></div>
      ${section(kit==='build'?'Core assets':'Gameplay upgrades',a.filter(x=>x.folder==='sprite'))}
      ${section('Level backgrounds',a.filter(x=>x.folder==='background'&&x.group!=='title-screen'),'background-grid')}
      ${section('Decorations',a.filter(x=>x.name.startsWith('sDecoration')))}
      ${section(kit==='build'?'Level labels':'Titles & buttons',a.filter(x=>x.folder==='asset'&&!x.type&&!x.name.startsWith('sDecoration')&&x.group!=='title-screen'),'label-grid')}
      ${section('Title screen',a.filter(x=>x.group==='title-screen'),'title-screen-grid')}
      ${kit==='levelup'?'<p class="meta">Arrange the title and Start Game button on the background, then add your own characters. Reuse the theme music from the Build Kit.</p>':''}
      ${a.some(x=>x.type==='audio')?`<section><h2>Audio</h2><div class="audio-grid">${a.filter(x=>x.type==='audio').map(card).join('')}</div></section>`:''}
      </div><details class="import-tip"><summary>Using these assets in GameMaker</summary><ol><li>Use a <strong>64 × 64</strong> grid and a <strong>1280 × 640</strong> room.</li><li>Import <code>sPlayer_strip6.png</code> as <strong>6 horizontal frames, 64 × 64 each</strong>. Set the player origin to bottom centre (32, 64). Import the enemy as 4 frames.</li><li>Set a fixed collision mask for animated objects so the shape does not change between frames. Use one <code>sSolid</code> sprite and one <code>oSolid</code> object for all ground. Set a full 64 × 64 collision box and top-left origin (0, 0). The same block stacks horizontally and vertically. Set spikes to top-left origin too, and place them one grid cell above the ground: their flat base is at the bottom of the image.</li><li>The level goal is <code>sGoal.png</code>, 128 × 128. Set its origin to bottom centre (64, 128) and its trigger mask around the visible object.</li><li>Add level backgrounds at their original size and enable horizontal tiling for wider rooms. The title-screen background is a single 1280 × 640 scene; do not tile it. Put game objects on layers in front.</li><li>Labels and decorations can go on asset layers. For a clickable button, assign its sprite to an object and add a mouse event. Import WAV files as sound resources.</li></ol><a href="guides/sImportGuide.txt" download class="btn btn-small">Download the import guide</a></details>`;
    sync();
  }
  function showWorlds(){
    content.innerHTML=`<header class="world-intro"><h1>Choose your world.</h1><p>Start with a Build Kit. Add a Level Up Kit when you’re ready for a challenge, or select your own assets across the ten worlds.</p></header><div class="world-toolbar"><h2>Explore the themes</h2><label><span class="sr-only">Find a theme</span><input id="theme-search" type="search" placeholder="Find a theme…"></label></div><section class="world-grid" aria-label="Theme selection">${packs.map(p=>`<a class="world-card" href="${p.slug}.html" data-world="${esc(p.name.toLowerCase())}"><span class="world-art"><img class="world-scene" src="images/scenes/${p.slug}.webp" alt="" width="960" height="640"><img class="world-title" src="images/titles/${p.slug}.png" alt="${esc(p.name)}"></span><span class="world-card-footer">${esc(p.name)}<small>Build Kit + Level Up Kit</small></span></a>`).join('')}</section><p class="empty" id="world-empty" hidden>No themes match. Try another name.</p>`;
    $('#theme-search').addEventListener('input',e=>{let n=0;$$('[data-world]').forEach(x=>{x.hidden=!x.dataset.world.includes(e.target.value.trim().toLowerCase());if(!x.hidden)n++;});$('#world-empty').hidden=!!n;});sync();
  }
  function showSelection(){
    stopAnimations();
    content.innerHTML=`<nav class="breadcrumb"><a href="index.html">All themes</a>${icon('arrow')}<strong>My selection</strong></nav><header class="selection-head"><div><h1>My selection</h1><p class="build-summary">${selected.size} assets. Your choices stay here as you explore other themes.</p></div><div><button class="btn btn-primary" data-custom-download>${icon('download')}Download selection</button> <button class="btn btn-quiet clear-selection">Clear</button></div></header>${selected.size?packs.map(p=>{const a=p.assets.filter(x=>selected.has(x.id));return a.length?`<section class="selection-theme"><h2><a href="${p.slug}.html">${esc(p.name)}</a></h2><div class="asset-grid">${a.map(card).join('')}</div></section>`:'';}).join(''):'<div class="empty"><h2>Your pack starts here.</h2><p>Tick assets on any theme page, then download them together.</p><a href="index.html" class="btn btn-primary">Explore the themes</a></div>'}`;sync();
  }
  async function customDownload(){
    if(busy||!selected.size)return;
    if(location.protocol==='file:'){notify('Custom ZIPs work when the site is served over HTTP, including GitHub Pages. The ready-made kit ZIPs also work offline.',true);return;}
    const choices=[...selected].map(id=>byId.get(id)).filter(Boolean);busy=true;sync();notify(`Preparing ${choices.length} assets…`);
    try{
      const entries=['sprite/','background/','asset/'].map(name=>({name,data:new Uint8Array()}));let done=0;
      // Bounded fetch concurrency; no partial archive is offered on a failed fetch.
      let next=0;const downloaded=new Array(choices.length);
      await Promise.all(Array.from({length:Math.min(4,choices.length)},async()=>{while(next<choices.length){const i=next++,a=choices[i],res=await fetch(a.url);if(!res.ok)throw new Error(`Could not load ${a.name} (${res.status})`);downloaded[i]={name:`${a.folder}/${fileStem(a.theme)}/${a.name}`,data:new Uint8Array(await res.arrayBuffer())};done++;$('#selection-total').textContent=`Preparing ${done} of ${choices.length}…`;}}));
      entries.push(...downloaded);
      const guide=await fetch('guides/sImportGuide.txt');if(!guide.ok)throw new Error('Could not load the import guide');entries.push({name:'asset/sImportGuide.txt',data:new Uint8Array(await guide.arrayBuffer())});
      entries.push({name:'asset/sSelection.txt',data:new TextEncoder().encode('LEVEL LAB / MY SELECTION\n\n'+choices.map(a=>`${themeName(a.theme)} | ${a.folder}/${fileStem(a.theme)}/${a.name} | ${meta(a)}`).join('\n'))});
      const blob=LevelLabZip.makeZip(entries),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='LevelLab_MySelection.zip';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);notify(`Your ${choices.length}-asset ZIP is ready.`);
    }catch(e){notify(`Download failed. ${e.message}. Your selection is saved; please try again.`,true);}finally{busy=false;sync();}
  }
  function animate(button){
    const id=button.dataset.animate,a=byId.get(id),stage=button.parentElement;
    if(animations.has(id)){clearInterval(animations.get(id));animations.delete(id);$('.animation-frame',stage)?.remove();$('img',stage).hidden=false;button.innerHTML=icon('play');button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',`Play ${a.title} animation`);return;}
    $('img',stage).hidden=true;const frame=document.createElement('span');frame.className='animation-frame';frame.style.backgroundImage=`url("${a.url}")`;frame.setAttribute('role','img');frame.setAttribute('aria-label',`${a.frames}-frame ${a.title} animation`);stage.prepend(frame);let i=0;animations.set(id,setInterval(()=>{i=(i+1)%a.frames;frame.style.backgroundPosition=`${-64*i}px 0`;},125));button.innerHTML=icon('pause');button.setAttribute('aria-pressed','true');button.setAttribute('aria-label',`Pause ${a.title} animation`);
  }
  function preview(id){
    const a=byId.get(id),p=packs.find(t=>t.slug===a.theme),root=`assets/${a.theme}/sprite/`,dialog=$('#preview-dialog');
    $('#preview-title').textContent=`${p.name} · ${a.title}`;
    if(a.group==='title-screen'){
      $('#preview-body').innerHTML=`<div class="preview-controls"><label><input type="checkbox" id="show-title-assets" checked> Show title and button</label></div><div class="room-window"><div class="room" style="background-image:url('${a.url}');background-repeat:no-repeat"><div class="room-objects"><img src="assets/${a.theme}/asset/sTitle.png" width="640" height="240" style="left:320px;top:48px" alt="${esc(p.name)} title"><img src="assets/${a.theme}/asset/sBtnStart.png" width="256" height="64" style="left:512px;top:480px" alt="Start Game"></div></div></div><p class="preview-help">An example layout at 1280 × 640. Download the three separate assets and arrange them in your title room. Add your own characters and reuse the theme music. The button is artwork; add its click behaviour in GameMaker.</p>`;
      $('#show-title-assets').onchange=e=>$('.room-objects').hidden=!e.target.checked;
      dialog.showModal();return;
    }
    $('#preview-body').innerHTML=`<div class="preview-controls"><label><input type="checkbox" id="show-objects" checked> Show game assets</label><label><input type="checkbox" id="show-grid"> 64 × 64 grid</label><label><input type="checkbox" id="repeat-bg"> Repeat horizontally</label></div><div class="room-window"><div class="room" style="background-image:url('${a.url}')"><div class="room-objects"></div><div class="room-grid" hidden></div></div></div><p class="preview-help">The room is shown at its actual 1280 × 640 pixel size. Scroll to inspect it. The repeat option adds a second copy, so you can inspect the join. This is an asset preview.</p>`;
    const objects=$('.room-objects');
    const level=a.name.match(/Level([123])/)[1];
    objects.insertAdjacentHTML('beforeend',`<img src="assets/${a.theme}/asset/sLabel_Level${level}.png" width="256" height="64" style="left:24px;top:24px" alt="${esc(a.title)}">`);
    for(let x=0;x<2560;x+=64)for(let y=512;y<640;y+=64)objects.insertAdjacentHTML('beforeend',`<img src="${root}sSolid.png" width="64" height="64" style="left:${x}px;top:${y}px" alt="">`);
    for(const [x,y,n] of [[320,448,'sSolid'],[384,448,'sSolid'],[448,448,'sSolid'],[768,384,'sSolid'],[832,384,'sSolid'],[896,384,'sSolid'],[640,448,'sSpike'],[1088,384,'sGoal'],[1664,448,'sSolid'],[1728,448,'sSolid'],[1920,448,'sSpike']])objects.insertAdjacentHTML('beforeend',`<img src="${root}${n}.png" width="${n==='sGoal'?128:64}" height="${n==='sGoal'?128:64}" style="left:${x}px;top:${y}px" alt="">`);
    objects.insertAdjacentHTML('beforeend',`<span class="room-player" style="left:128px;top:448px;background-image:url('${root}sPlayer_strip6.png')" role="img" aria-label="Player at actual size"></span>`);
    $('#show-objects').onchange=e=>objects.hidden=!e.target.checked;$('#show-grid').onchange=e=>$('.room-grid').hidden=!e.target.checked;$('#repeat-bg').onchange=e=>$('.room').classList.toggle('repeat',e.target.checked);dialog.showModal();
  }
  document.addEventListener('change',e=>{if(e.target.matches('[data-asset-check]')){const id=e.target.dataset.assetCheck;e.target.checked?selected.add(id):selected.delete(id);sync();if(page==='selection')showSelection();}});
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.kit){kit=b.dataset.kit;showTheme();$(`[data-kit="${kit}"]`).focus();}
    else if(b.hasAttribute('data-select-kit')){pack.assets.filter(a=>a.kit===kit).forEach(a=>selected.add(a.id));sync();notify(`${kit==='build'?'Build Kit':'Level Up Kit'} added to your selection.`);}
    else if(b.hasAttribute('data-custom-download'))customDownload();
    else if(b.classList.contains('clear-selection')){selected.clear();sync();if(page==='selection')showSelection();}
    else if(b.dataset.animate)animate(b);
    else if(b.dataset.preview)preview(b.dataset.preview);
  });
  document.addEventListener('keydown',e=>{if(e.target.matches('[role=tab]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();kit=e.key==='Home'?'build':e.key==='End'?'levelup':kit==='build'?'levelup':'build';showTheme();$(`[data-kit="${kit}"]`).focus();}});
  $('#menu-toggle').addEventListener('click',()=>{const open=$('.sidebar').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',open);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('.sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');}});
  $('#close-preview').addEventListener('click',()=>$('#preview-dialog').close());
  document.addEventListener('play',e=>{if(e.target.tagName==='AUDIO')$$('audio').forEach(a=>{if(a!==e.target)a.pause();});},true);
  window.addEventListener('storage',e=>{if(e.key==='level-lab-selection-v1'){try{const ids=JSON.parse(e.newValue||'[]');selected=new Set(Array.isArray(ids)?ids.filter(id=>byId.has(id)):[]);if(page==='selection')showSelection();else sync();}catch{}}});
  window.addEventListener('pagehide',stopAnimations);
  if(pack)showTheme();else if(page==='selection')showSelection();else showWorlds();
})();
