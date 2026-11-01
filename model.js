(function(root){
'use strict';
const D=typeof module!=='undefined'&&module.exports?require('./data.js'):root.CASEBOOK;
const clueIds=new Set(D.clues.map(c=>c.id));
const allItems=D.chapters.flatMap(c=>c.scenes.flatMap(s=>[...s.spots,...s.talks]));
const itemIds=new Set(allItems.map(s=>s.id));
const allFlags=new Set(allItems.flatMap(s=>(s.choices||[]).map(c=>c.flag).filter(Boolean)));
const fresh=()=>({version:1,started:false,chapter:0,scene:D.chapters[0].scenes[0].id,clues:[],seen:[],choices:{},flags:[],solved:[],deductions:[],memories:[],hints:{},log:[],note:'',introSeen:[],visited:[],rescueDone:false,ended:false,settings:{largeText:false,labels:true},updatedAt:null});
const chapter=s=>D.chapters[s.chapter];
const currentScene=s=>chapter(s).scenes.find(x=>x.id===s.scene)||chapter(s).scenes[0];
const hasAll=(s,ids)=>ids.every(id=>s.clues.includes(id));
const available=(s,item)=>!item.afterPuzzle||s.solved.includes(s.chapter);
const readyPuzzle=s=>hasAll(s,chapter(s).puzzleRequires||chapter(s).required);
const readyDeduction=s=>hasAll(s,chapter(s).required)&&s.solved.includes(s.chapter);
function addLog(s,speaker,text){s.log.push({chapter:s.chapter,speaker,text}); if(s.log.length>300)s.log.shift();}
function collect(s,item){
 if(!available(s,item))return false;
 if(!s.seen.includes(item.id)){s.seen.push(item.id);addLog(s,item.speaker,item.text);}
 if(item.clue&&!s.clues.includes(item.clue))s.clues.push(item.clue);
 if(item.memory&&!s.memories.includes(item.memory))s.memories.push(item.memory);
 return true;
}
function choose(s,item,index){
 if(!available(s,item)||!item.choices||!item.choices[index]||Object.hasOwn(s.choices,item.id))return false;
 collect(s,item);s.choices[item.id]=index;
 const c=item.choices[index];if(c.flag&&!s.flags.includes(c.flag))s.flags.push(c.flag);
 addLog(s,currentScene(s).pov,c.label);addLog(s,item.speaker,c.reply);
 return true;
}
function move(s,id){if(!chapter(s).scenes.some(x=>x.id===id))return false;s.scene=id;const key=s.chapter+':'+id;if(!s.visited.includes(key))s.visited.push(key);return true;}
function solve(s,answer){
 if(!readyPuzzle(s))return false;
 const p=chapter(s).puzzle;
 let correct=false;
 if(p.type==='order')correct=Array.isArray(answer)&&JSON.stringify(answer)===JSON.stringify(p.answer);
 else if(p.fields)correct=Array.isArray(answer)&&p.fields.every((f,i)=>answer[i]===f.answer);
 else correct=answer===p.answer;
 if(correct&&!s.solved.includes(s.chapter)){s.solved.push(s.chapter);addLog(s,'照合の結論',p.success);}
 return correct;
}
function deduce(s,pair,answer){
 if(!readyDeduction(s))return false;
 const d=chapter(s).deduction;
 const correct=Array.isArray(pair)&&pair.length===2&&new Set(pair).size===2&&d.pair.every(x=>pair.includes(x))&&answer===d.answer;
 if(correct&&!s.deductions.includes(s.chapter)){s.deductions.push(s.chapter);addLog(s,'推理の結論',d.success);}
 return correct;
}
function rescue(s,values){
 if(s.chapter!==5||!s.deductions.includes(5)||!Array.isArray(values)||values.length!==3)return false;
 if(values.every(x=>x===1)){s.rescueDone=true;return true;}return false;
}
function advance(s){
 if(!s.deductions.includes(s.chapter))return false;
 if(s.chapter===5){if(!s.rescueDone)return false;s.ended=true;return true;}
 s.chapter++;s.scene=chapter(s).scenes[0].id;move(s,s.scene);return true;
}
function restore(raw){
 if(!raw||raw.version!==1||!Number.isInteger(raw.chapter)||raw.chapter<0||raw.chapter>=D.chapters.length)throw new Error('このゲームのセーブデータではありません。');
 const s=fresh();s.chapter=raw.chapter;s.started=!!raw.started;
 for(const key of ['clues','seen','flags']){
 const allow=key==='clues'?clueIds:key==='seen'?itemIds:allFlags;
 s[key]=Array.isArray(raw[key])?[...new Set(raw[key].filter(x=>typeof x==='string'&&allow.has(x)))]:[];
 }
 for(const key of ['solved','deductions','introSeen'])s[key]=Array.isArray(raw[key])?[...new Set(raw[key].filter(x=>Number.isInteger(x)&&x>=0&&x<=s.chapter))]:[];
 s.scene=D.chapters[s.chapter].scenes.some(x=>x.id===raw.scene)?raw.scene:D.chapters[s.chapter].scenes[0].id;
 if(raw.choices&&typeof raw.choices==='object') for(const item of allItems){const i=raw.choices[item.id];if(Number.isInteger(i)&&item.choices?.[i])s.choices[item.id]=i;}
 s.memories=Array.isArray(raw.memories)?raw.memories.filter(x=>allItems.some(i=>i.memory===x)):[];
 s.visited=Array.isArray(raw.visited)?raw.visited.filter(x=>typeof x==='string'&&/^\d:[a-z]+$/.test(x)):[];
 s.log=Array.isArray(raw.log)?raw.log.slice(-300).filter(x=>x&&typeof x.text==='string'&&typeof x.speaker==='string'&&Number.isInteger(x.chapter)&&x.chapter>=0&&x.chapter<=s.chapter).map(x=>({text:x.text.slice(0,6000),speaker:x.speaker.slice(0,80),chapter:x.chapter})):[];
 s.note=typeof raw.note==='string'?raw.note.slice(0,15000):'';
 for(let i=0;i<6;i++)s.hints[i]=Number.isInteger(raw.hints?.[i])?Math.max(0,Math.min(3,raw.hints[i])):0;
 s.settings={largeText:!!raw.settings?.largeText,labels:raw.settings?.labels!==false};
 s.rescueDone=!!raw.rescueDone&&s.deductions.includes(5);s.ended=!!raw.ended&&s.rescueDone;
 s.updatedAt=typeof raw.updatedAt==='string'?raw.updatedAt:null;
 return s;
}
const api={fresh,chapter,currentScene,hasAll,available,readyPuzzle,readyDeduction,collect,choose,move,solve,deduce,rescue,advance,restore,addLog};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GameModel=api;
})(typeof window!=='undefined'?window:globalThis);
