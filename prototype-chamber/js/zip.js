/* Small dependency-free ZIP writer. ZIP method 0 (stored), UTF-8 filenames,
 * CRC-32, central directory. Game assets are already compressed PNG/WAV.
 * The same module runs in the browser and in the download integrity tests. */
(function(root){
  'use strict';
  const table=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
  function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
  function header(n){return new Uint8Array(n);}
  function makeZip(files){
    const parts=[],central=[];let offset=0,size=0;const enc=new TextEncoder();
    for(const f of files){
      if(!f.name||f.name.startsWith('/')||f.name.split('/').includes('..'))throw new Error('Unsafe ZIP path');
      const name=enc.encode(f.name),data=f.data instanceof Uint8Array?f.data:new Uint8Array(f.data),crc=crc32(data);
      const h=header(30),d=new DataView(h.buffer);d.setUint32(0,0x04034b50,true);d.setUint16(4,20,true);d.setUint16(6,0x800,true);d.setUint16(12,33,true);d.setUint32(14,crc,true);d.setUint32(18,data.length,true);d.setUint32(22,data.length,true);d.setUint16(26,name.length,true);
      parts.push(h,name,data);
      const c=header(46),v=new DataView(c.buffer);v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint16(8,0x800,true);v.setUint16(14,33,true);v.setUint32(16,crc,true);v.setUint32(20,data.length,true);v.setUint32(24,data.length,true);v.setUint16(28,name.length,true);v.setUint32(42,offset,true);
      central.push(c,name);offset+=h.length+name.length+data.length;size+=c.length+name.length;
    }
    const end=header(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,size,true);e.setUint32(16,offset,true);
    return new Blob([...parts,...central,end],{type:'application/zip'});
  }
  root.LevelLabZip={makeZip,crc32};if(typeof module!=='undefined')module.exports=root.LevelLabZip;
})(typeof window==='undefined'?globalThis:window);
