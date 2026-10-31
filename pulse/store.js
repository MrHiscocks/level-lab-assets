import {initialData,validateBackup,validateItems} from './core.js';
export let storageProblem='';
const KEY='pulse:training:v1';
export function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return initialData();const parsed=JSON.parse(raw),data=validateBackup(parsed);if(parsed.active){const a=parsed.active;validateItems(a.items);if(Number.isInteger(a.index)&&a.index>=0&&a.index<a.items.length&&Number.isInteger(a.set)&&a.set>=1&&a.set<=a.items[a.index].sets&&['ready','work','rest'].includes(a.phase)&&Number.isFinite(a.remaining)&&a.remaining>=0&&Array.isArray(a.records)){data.active={...a,paused:true,savedAt:Date.now()}}}return data}catch{storageProblem='Saved data could not be read. Export or recover your backup before relying on new saves.';return initialData()}}
export function save(data){try{localStorage.setItem(KEY,JSON.stringify(data));return true}catch{storageProblem='Your browser could not save changes. Export a backup before closing Pulse.';return false}}
export function rawBackup(){return localStorage.getItem(KEY)}
