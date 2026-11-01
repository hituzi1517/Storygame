/* No external dependencies. Save data stays in this browser. */
(() => {
'use strict';
const D=window.CASEBOOK,M=window.GameModel,$=id=>document.getElementById(id);
const KEY='ipomoea-casebook-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',talk:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l-3 2 1-6A8.5 8.5 0 1 1 21 11.5Z"/><path d="M7 9h9M7 13h6"/>',map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16M15 5v16"/>',link:'<path d="m9 15 6-6M7 14l-2 2a3 3 0 0 0 4 4l4-4a3 3 0 0 0 0-4M17 10l2-2a3 3 0 0 0-4-4l-4 4a3 3 0 0 0 0 4"/>',book:'<path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2ZM12 5v16"/>',file:'<path d="M14 2H5v20h14V7ZM14 2v6h5M8 12h8M8 16h6"/>',settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',sound:'<path d="m11 4-5 4H3v8h3l5 4ZM15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/>',mute:'<path d="m11 4-5 4H3v8h3l5 4ZM16 9l5 6M16 15l5-6"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',check:'<path d="m5 12 4 4 10-10"/>',diamond:'<path d="m12 3 9 9-9 9-9-9Z"/>',leaf:'<path d="M20 3C8 1 1 10 6 17s16 1 14-14ZM5 20 16 8"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>'};
const svg=(n)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n]||icons.diamond}</svg>`;
const clue=id=>D.clues.find(x=>x.id===id);
let state=M.fresh(),storageOK=true,toastTimer,modalMode='',returnFocus=null;
try {const saved=localStorage.getItem(KEY);if(saved)state=M.restore(JSON.parse(saved));}catch(e){storageOK=false;}
const ch=()=>M.chapter(state),sc=()=>M.currentScene(state);
function save(){state.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch(e){storageOK=false;}$('saveStatus').textContent=storageOK?'この端末に自動保存':'保存できません · 設定から書き出し';}
function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3300);}
function openModal(title,eyebrow,body,mode=''){
 returnFocus=document.activeElement;modalMode=mode;$('modalTitle').textContent=title;$('modalEyebrow').textContent=eyebrow;$('modalBody').innerHTML=body;
 $('modal').className=mode?mode+'-dialog':'';
 if(!$('modal').open)$('modal').showModal();
 $('modal').scrollTop=0;
 $('closeModal').focus({preventScroll:true});
}
function close(){if($('modal').open)$('modal').close();modalMode='';if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
function bodyClick(selector,fn){$('modalBody').querySelectorAll(selector).forEach(el=>el.addEventListener('click',()=>fn(el)));}
function message(title,text,eyebrow='CASE NOTE'){openModal(title,eyebrow,`<p class="prose">${esc(text)}</p><div class="button-row"><button class="primary-button" id="ack">探索へ戻る ${svg('arrow')}</button></div>`);$('ack').onclick=close;}
function guarded(fn){return()=>{if(!state.started)return title();fn();};}
function countScene(scene){const items=[...scene.spots.filter(i=>i.clue),...scene.talks.filter(i=>i.clue&&M.available(state,i))];return [items.filter(x=>state.seen.includes(x.id)).length,items.length];}
const imageDescriptions={lab:'朝の光が差す、人物のいない植物研究室。小瓶、記録、真鍮の測定器と青い朝顔。',archive:'灯りに照らされた人物のいない古文書庫。記録机と棚が並ぶ。',canal:'雨上がりの人物のいない運河沿いの倉庫街。木箱と係留された舟。',office:'机と空いた椅子、封書が置かれた、人物のいない面会室。',sanatorium:'人物のいない旧療養院の廊下。衝立、空いた寝台、窓の向こうの温室。'};
function render(){
 const c=ch(),s=sc();document.body.classList.toggle('large-text',state.settings.largeText);
 $('chapterNumber').textContent=`CASE FILE 0${state.chapter+1} / 06`;$('chapterTitle').textContent=c.title;
 $('sceneName').textContent=s.name;$('sceneTime').textContent=s.time;
 $('pov').innerHTML=`視点 <b>${esc(s.pov)}</b><span>として調査中</span>`;
 const src=`assets/${s.asset}.webp`;if($('sceneImage').getAttribute('src')!==src)$('sceneImage').src=src;
 $('sceneImage').alt=imageDescriptions[s.asset];$('sceneDescription').textContent=s.description;
 $('sceneCounter').textContent=String(c.scenes.indexOf(s)+1).padStart(2,'0')+' / '+String(c.scenes.length).padStart(2,'0');
 $('hotspots').classList.toggle('labels-hidden',!state.settings.labels);
 $('hotspots').innerHTML=s.spots.map(i=>`<button class="hotspot ${state.seen.includes(i.id)?'seen':''} ${i.memory?'memory':''}" style="left:${i.x}%;top:${i.y}%" data-spot="${i.id}" aria-label="${esc(i.label)}を調べる${state.seen.includes(i.id)?'（調査済み）':''}"><span class="marker">${svg(state.seen.includes(i.id)?'check':i.memory?'leaf':'search')}</span><span class="spot-label">${esc(i.label)}</span></button>`).join('');
 $('hotspots').querySelectorAll('[data-spot]').forEach(el=>el.onclick=guarded(()=>inspect(s.spots.find(i=>i.id===el.dataset.spot))));
 const progress=c.required.filter(id=>state.clues.includes(id)).length;
 $('railNumeral').textContent=c.numeral;$('caseQuestion').textContent=c.question;$('objective').textContent=c.objective;
 $('progressText').textContent=`${progress} / ${c.required.length}`;$('progressFill').style.width=(progress/c.required.length*100)+'%';
 $('totalEvidence').textContent=state.clues.length+' 件';
 $('recentClues').innerHTML=state.clues.length?state.clues.slice(-3).reverse().map(id=>`<button class="recent-clue" data-evidence="${id}"><span>${id.slice(1)}</span><span>${esc(clue(id).title)}</span><span>↗</span></button>`).join(''):'<p class="empty-clues">まだ、白紙の手帳。<br>目の前のものから調べてみよう。</p>';
 $('recentClues').querySelectorAll('[data-evidence]').forEach(el=>el.onclick=()=>showEvidence(el.dataset.evidence));
 const solved=state.solved.includes(state.chapter),deduced=state.deductions.includes(state.chapter);
 $('puzzleButton').innerHTML=`${svg(solved?'check':'diamond')}<span><b>${solved?'照合済み':c.puzzle.title}</b><small>${solved?'証拠をつないで推理する':M.readyPuzzle(state)?'記録が揃った。照合を始める':'手がかりを集めると挑戦できる'}</small></span><span>↗</span>`;
 $('puzzleButton').onclick=guarded(()=>solved?reason():puzzle());
 const talkItems=s.talks.filter(i=>M.available(state,i));const freshTalks=talkItems.filter(i=>!state.seen.includes(i.id)).length;
 const actions=[['inspectButton','search','調べる',s.spots.filter(i=>!state.seen.includes(i.id)).length],['talkButton','talk','話す',freshTalks],['mapButton','map','移動',null],['reasonButton','link','推理',null],['notebookButton','book','手帳',state.clues.length]];
 for(const [id,icon,label,count] of actions)$(id).innerHTML=`${svg(icon)}<span>${label}</span>${count?`<small>${count}</small>`:''}`;
 $('reasonButton').classList.toggle('ready',M.readyDeduction(state));
 let next='光の印を選んで、手がかりを調べよう。';
 if(state.ended)next='事件は引き継がれた。手帳から、あなたの調査を振り返れます。';
 else if(deduced)next=state.chapter===5?'救助の最後の手順へ。推理ボタンから続けよう。':'この章の謎は解けた。推理ボタンから次の章へ。';
 else if(state.chapter===4&&solved&&!state.clues.includes('e26'))next='急使が到着した。研究所・面会室の「話す」で封書を開こう。';
 else if(M.readyDeduction(state))next='照合ができた。「推理」で二つの証拠をつなごう。';
 else if(M.readyPuzzle(state))next='記録が揃った。「推理」から照合に挑戦しよう。';
 else if(!s.spots.some(i=>!state.seen.includes(i.id))&&freshTalks)next='この場所で聞ける話がある。「話す」を開こう。';
 else if(!s.spots.some(i=>!state.seen.includes(i.id))&&!freshTalks)next='地図を開いて、ほかの場所も調べよう。';
 $('nextAction').textContent=next;
 let companion=s.pov==='アルバ'?'グラント':'アルバ';
 let companionText=s.pov==='アルバ'?'「こちらは任せてください。隊長は、次の判断を」':'「見たものと、まだ分からんこと。分けて話せ」';
 if(state.chapter===0&&state.flags.includes('kai_listened'))companionText='「あいつ、さっきより話していたな。急がせなかったのか」';
 if(state.chapter===2&&state.flags.includes('archive_method'))companionText='「原本を合わせたやり方でいく。今回も、一枚で決めるな」';
 if(state.chapter===3&&state.flags.includes('boy_safe'))companionText='「あの子は、嫌ならやめていいと分かっている。だから聞けることもある」';
 if(state.chapter===4&&state.flags.includes('yuan_name'))companionText='「あの札、本人と読んだんだろ。伝える時も、名前で呼べ」';
 if(state.chapter===5&&state.flags.includes('clinical_care'))companionText='「戻す手順も書いたんだろ。現場でも、それを使え」';
 $('companionName').textContent=companion;$('companionText').textContent=companionText;
 $('saveStatus').textContent=storageOK?'この端末に自動保存':'保存できません · 設定から書き出し';
}
function reward(item){return item.clue?`<div class="evidence-reward">${svg('file')}<div><small>EVIDENCE ADDED TO YOUR NOTEBOOK</small><b>${esc(clue(item.clue).title)}</b></div></div>`:item.memory?`<div class="evidence-reward">${svg('leaf')}<div><small>街の余白を見つけた</small><b>${esc(item.memory)}</b></div></div>`:'';}
function inspect(item){
 const was=state.seen.includes(item.id);M.collect(state,item);save();render();
 openModal(item.label,was?'OBSERVATION · 読み返す':'OBSERVATION · 調べる',`<div class="speaker-line"><span class="speaker-name">${esc(item.speaker)}</span><span class="speaker-role">${item.speaker===sc().pov?'あなたの視点':'その場の声'}</span></div><p class="prose dialogue-text">${esc(item.text)}</p>${reward(item)}<div class="button-row">${item.clue?'<button class="secondary-button" id="readEvidence">記録を詳しく読む</button>':''}<button class="primary-button" id="returnExplore">探索へ戻る ${svg('arrow')}</button></div>`,'observation');
 $('returnExplore').onclick=close;if(item.clue)$('readEvidence').onclick=()=>showEvidence(item.clue);
}
function inspectList(){
 if(!sc().spots.length)return message('ここでは話を聞こう','調べられる物はありません。「話す」から、この場所にいる人の証言を聞けます。','OBSERVATION');
 openModal('この場所を調べる','OBSERVATION',`<p class="body-muted">背景の光の印からも、同じ場所を調べられます。</p><div class="topic-list" style="margin-top:20px">${sc().spots.map(i=>`<button class="topic" data-item="${i.id}">${svg(i.memory?'leaf':'search')}<span><small>${state.seen.includes(i.id)?'調査済み':i.memory?'街の余白':'未調査'}</small><b>${esc(i.label)}</b></span><span>↗</span></button>`).join('')}</div>`);
 bodyClick('[data-item]',el=>inspect(sc().spots.find(x=>x.id===el.dataset.item)));
}
function talkList(){
 const items=sc().talks.filter(i=>M.available(state,i));
 if(!items.length)return message('静かな場所','いま、この場所で聞ける話はありません。背景を調べるか、地図から別の場所へ進みましょう。','CONVERSATION');
 openModal('話を聞く','CONVERSATION',`<p class="body-muted">問いかけ方によって、相手の返事が変わります。選んだ言葉は手帳に残ります。</p><div class="topic-list" style="margin-top:20px">${items.map(i=>`<button class="topic" data-topic="${i.id}">${svg('talk')}<span><small>${esc(i.speaker)}${state.seen.includes(i.id)?' · 会話済み':''}</small><b>${esc(i.label)}</b></span><span>↗</span></button>`).join('')}</div>`);
 bodyClick('[data-topic]',el=>conversation(items.find(x=>x.id===el.dataset.topic)));
}
function conversation(item){
 const chosen=Object.hasOwn(state.choices,item.id)?state.choices[item.id]:null;
 openModal(item.label,'CONVERSATION',`<div class="speaker-line"><span class="speaker-name">${esc(item.speaker)}</span><span class="speaker-role">${chosen===null?'問いかけを選ぶ':'選んだ言葉を読み返す'}</span></div><p class="prose dialogue-text">${esc(item.text)}</p>${chosen===null?`<div class="choices">${item.choices.map((c,i)=>`<button class="choice" data-choice="${i}">${esc(c.label)}</button>`).join('')}</div>`:`<div class="callout">あなたの選択　${esc(item.choices[chosen].label)}</div><p class="prose">${esc(item.choices[chosen].reply)}</p>${reward(item)}<div class="button-row"><button class="secondary-button" id="moreTalk">ほかの話題</button><button class="primary-button" id="talkDone">探索へ戻る ${svg('arrow')}</button></div>`}`,'conversation');
 if(chosen===null)bodyClick('[data-choice]',el=>{M.choose(state,item,Number(el.dataset.choice));save();render();conversation(item);});
 else {$('moreTalk').onclick=talkList;$('talkDone').onclick=close;}
}
function map(){
 openModal('調査の地図','FIELD MAP',`<div class="map-key"><span>${esc(ch().period)}</span><span>章 ${ch().numeral} · 調査範囲</span></div><p class="body-muted">行きたい場所を選ぶと移動します。場所に応じて、ニルとアルバの視点が切り替わります。</p><div class="map-grid">${ch().scenes.map((s,i)=>{const [found,total]=countScene(s);return `<button class="map-location ${s.id===state.scene?'current':''}" data-scene="${s.id}"><img src="assets/${s.asset}.webp" alt=""><span class="location-number">0${i+1}</span><span class="map-label"><b>${esc(s.name)}</b><small>${esc(s.pov)}視点 · 証拠 ${found}/${total}${s.id===state.scene?' · 現在地':''}</small></span></button>`;}).join('')}</div><p class="body-muted">移動による時間制限や、取り返しのつかない選択はありません。</p>`,'map');
 bodyClick('[data-scene]',el=>{M.move(state,el.dataset.scene);save();render();close();toast(sc().pov+'の視点 · '+sc().name);});
}
function showEvidence(id){
 if(!state.clues.includes(id))return;const e=clue(id);
 openModal(e.title,'EVIDENCE · '+e.type,`<div class="evidence-number">${id.slice(1)}</div><p class="prose">${esc(e.text)}</p><div class="source-line">入手場所　${esc(e.source)}</div><div class="button-row"><button class="secondary-button" id="backNotebook">証拠一覧</button><button class="primary-button" id="evidenceDone">閉じる</button></div>`);
 $('backNotebook').onclick=()=>notebook('evidence');$('evidenceDone').onclick=close;
}
function evidenceCards(ids,selected=[]){return ids.map(id=>{const e=clue(id);return `<button class="evidence-card ${selected.includes(id)?'selected':''}" data-clue="${id}" aria-pressed="${selected.includes(id)}"><small>${id.slice(1)} / ${esc(e.type)}</small><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></button>`;}).join('');}
function notebook(tab='evidence'){
 let content='';
 if(tab==='evidence')content=state.clues.length?`<div class="notebook-grid">${evidenceCards(state.clues)}</div>`:'<p class="prose">まだ、何も書かれていない。最初の手がかりを探そう。</p>';
 if(tab==='notes')content=`<p class="body-muted" style="margin-bottom:15px">気づいたこと、引っかかった言葉。自由に書き留めてください。入力すると自動保存されます。</p><textarea id="personalNotes" class="notes-field" maxlength="15000" aria-label="自由メモ" placeholder="誰が、何を知っていたのだろう。">${esc(state.note)}</textarea><p class="body-muted">この端末・ブラウザ内の記録です。設定からセーブを書き出すと、メモも含まれます。</p>`;
 if(tab==='memories')content=`<p class="body-muted" style="margin-bottom:18px">事件の答えにはならなくても、覚えておきたかったこと。</p>${state.memories.length?state.memories.map((m,i)=>`<div class="callout"><span class="eyebrow">MARGIN 0${i+1}</span><p>${esc(m)}</p><p class="body-muted">${esc(D.chapters.flatMap(c=>c.scenes.flatMap(s=>s.spots)).find(x=>x.memory===m).text)}</p></div>`).join(''):'<p class="prose">背景にある、点線の印を探してみよう。</p>'}`;
 if(tab==='log')content=state.log.length?state.log.slice().reverse().map(x=>`<div class="log-entry"><small>章 ${D.chapters[x.chapter].numeral} · ${esc(x.speaker)}</small><p>${esc(x.text)}</p></div>`).join(''):'<p class="prose">会話や調査は、ここに記録されます。</p>';
 openModal('事件手帳','CASEBOOK · '+state.clues.length+' EVIDENCE',`<div class="view-tabs">${[['evidence','証拠'],['log','会話ログ'],['notes','自由メモ'],['memories','街の余白']].map(([id,l])=>`<button data-tab="${id}" class="${tab===id?'selected':''}">${l}${id==='memories'?` ${state.memories.length}/6`:''}</button>`).join('')}${state.ended?'<button id="endingAgain">結末の記録</button>':''}</div>${content}`,'notebook');
 bodyClick('[data-tab]',el=>notebook(el.dataset.tab));bodyClick('[data-clue]',el=>showEvidence(el.dataset.clue));
 if($('personalNotes'))$('personalNotes').oninput=e=>{state.note=e.target.value;save();};if($('endingAgain'))$('endingAgain').onclick=ending;
}
function puzzle(){
 const p=ch().puzzle;
 if(!M.readyPuzzle(state)){
 const missing=(ch().puzzleRequires||ch().required).filter(x=>!state.clues.includes(x));
 openModal('まず、調べられることを','PUZZLE · 記録を集める',`<p class="prose">まだ照合に必要な記録が揃っていない。あと ${missing.length} 件の手がかりを探そう。</p><div class="callout">${esc(ch().objective)}</div><div class="button-row"><button class="secondary-button" id="puzzleHint">ヒント</button><button class="primary-button" id="puzzleMap">地図を開く ${svg('map')}</button></div>`);$('puzzleHint').onclick=hints;$('puzzleMap').onclick=map;return;
 }
 if(state.solved.includes(state.chapter)){
 openModal(p.title,'PUZZLE · 照合済み',`<p class="prose">${esc(p.success)}</p><div class="button-row"><button class="primary-button" id="alreadySolved">${M.readyDeduction(state)?'証拠をつなぐ':'探索へ戻る'} ${svg('arrow')}</button></div>`);$('alreadySolved').onclick=()=>M.readyDeduction(state)?reason():close();return;
 }
 let order=p.items?p.items.slice():[],selected=null,docIndex=0;
 function draw(){
 let content='';
 if(p.type==='order')content=`<div class="puzzle-rules">${p.rules.map(r=>`<p>・${esc(r)}</p>`).join('')}</div><ol class="order-list">${order.map((x,i)=>`<li><span class="num">${i+1}</span><span class="order-name">${esc(x)}</span><button data-up="${i}" aria-label="${esc(x)}を上へ" ${i===0?'disabled':''}>↑</button><button data-down="${i}" aria-label="${esc(x)}を下へ" ${i===order.length-1?'disabled':''}>↓</button></li>`).join('')}</ol>`;
 if(p.type==='documents')content=`<div class="view-tabs" style="margin-top:20px">${p.docs.map((d,i)=>`<button data-doc="${i}" class="${docIndex===i?'selected':''}">${esc(d.name)}</button>`).join('')}</div><div class="paper">${esc(p.docs[docIndex].body)}</div>`;
 if(p.type==='matrix')content=`<table class="data-table"><thead><tr><th>比較</th><th>左の器具</th><th>右の器具</th></tr></thead><tbody><tr><th>最初の配置</th><td>A · 弱い反応</td><td class="strong">B · 強い反応</td></tr><tr><th>試料を交換</th><td class="strong">B · 強い反応</td><td>A · 弱い反応</td></tr><tr><th>別の器具で再測定</th><td>A · 弱い反応</td><td class="strong">B · 強い反応</td></tr></tbody></table><p class="body-muted">試料名以外の処理条件は、まだ確認できていない。</p>`;
 if(p.fields){
 if(p.type==='routes')content+=`<svg class="route-diagram" viewBox="0 0 620 175" role="img" aria-label="搬入口から西廊下と管理区画に分岐。西廊下は患者区画へ、温室は資材通路を通って外庭へつながる。"><path d="M70 80H220V40H390M220 80v60h170M390 80h110v60h90"/><rect x="5" y="58" width="130" height="43" rx="2"/><text x="70" y="84" text-anchor="middle">搬入口</text><rect x="160" y="18" width="130" height="43" rx="2"/><text x="225" y="44" text-anchor="middle">西廊下</text><rect x="325" y="18" width="130" height="43" rx="2"/><text x="390" y="44" text-anchor="middle">患者区画</text><rect x="160" y="119" width="130" height="43" rx="2"/><text x="225" y="145" text-anchor="middle">管理区画・記録</text><rect x="325" y="60" width="130" height="43" rx="2"/><text x="390" y="86" text-anchor="middle">温室</text><rect x="487" y="119" width="130" height="43" rx="2"/><text x="552" y="145" text-anchor="middle">資材通路 → 外庭</text></svg>`;
 content+=p.fields.map((f,i)=>`<label class="field"><span>${esc(f.label)}</span><select id="field${i}"><option value="">選んでください</option>${f.options.map(o=>`<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></label>`).join('');
 }
 if(p.options)content+=`<div class="choices">${p.options.map((o,i)=>`<button class="choice ${selected===i?'selected':''}" data-option="${i}" aria-pressed="${selected===i}">${esc(o)}</button>`).join('')}</div>`;
 openModal(p.title,`PUZZLE 0${state.chapter+1} · ${state.chapter===0?'調製工程':state.chapter===1?'書類照合':state.chapter===2?'経路復元':state.chapter===3?'比較実験':state.chapter===4?'原紙の照合':'経路の確保'}`,`<p class="body-muted">${esc(p.lead)}</p>${content}<div id="puzzleFeedback" role="status"></div><div class="button-row split"><button class="secondary-button" id="puzzleBack">いったん戻る</button><button class="primary-button" id="checkPuzzle">照合する ${svg('check')}</button></div>`,'puzzle');
 $('puzzleBack').onclick=close;
 bodyClick('[data-up]',el=>{const i=Number(el.dataset.up);[order[i],order[i-1]]=[order[i-1],order[i]];draw();});
 bodyClick('[data-down]',el=>{const i=Number(el.dataset.down);[order[i],order[i+1]]=[order[i+1],order[i]];draw();});
 bodyClick('[data-doc]',el=>{docIndex=Number(el.dataset.doc);draw();});
 bodyClick('[data-option]',el=>{selected=Number(el.dataset.option);$('modalBody').querySelectorAll('[data-option]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.option)===selected);b.setAttribute('aria-pressed',String(Number(b.dataset.option)===selected));});});
 $('checkPuzzle').onclick=()=>{
 const answer=p.type==='order'?order:p.fields?p.fields.map((_,i)=>$('field'+i).value):selected;
 if(!M.solve(state,answer)){$('puzzleFeedback').innerHTML='<div class="callout error">まだ、記録と一致していない。失敗のペナルティはありません。条件を読み返し、もう一度照合しよう。</div>';return;}
 save();render();
 openModal('照合ができた','PUZZLE SOLVED',`<p class="prose">${esc(p.success)}</p>${state.chapter===4?'<div class="callout good">面会室に急使が到着しました。「話す」から封書を開けます。</div>':''}<div class="button-row"><button class="primary-button" id="puzzleComplete">${state.chapter===4?'面会室へ':'証拠をつなぐ'} ${svg('arrow')}</button></div>`);
 $('puzzleComplete').onclick=()=>{if(state.chapter===4){M.move(state,'visitor');save();render();close();talkList();}else reason();};
 };
 }
 draw();
}
function reason(){
 if(state.ended)return ending();
 if(state.deductions.includes(state.chapter))return chapterConclusion();
 if(!M.readyDeduction(state)){
 if(!state.solved.includes(state.chapter))return puzzle();
 message('もう一通の記録','いまいる患者の所在が必要です。面会室に届いた急使の手紙を、「話す」から確認しましょう。','DEDUCTION');return;
 }
 let pair=[],answer=null;const d=ch().deduction;
 function draw(){
 openModal('二つの証拠をつなぐ','DEDUCTION · いま分かること',`<p class="body-muted">${esc(ch().question)}<br>この問いの根拠になる証拠を二つ選んでください。</p><div class="selection-slots"><div class="selection-slot">${pair[0]?esc(clue(pair[0]).title):'一つ目の証拠'}</div><span>×</span><div class="selection-slot">${pair[1]?esc(clue(pair[1]).title):'二つ目の証拠'}</div></div><div class="notebook-grid reason-grid">${evidenceCards(ch().required,pair)}</div><h3 class="mini-heading">${esc(d.prompt)}</h3><div class="choices">${d.options.map((o,i)=>`<button class="choice ${answer===i?'selected':''}" data-answer="${i}" aria-pressed="${answer===i}">${esc(o)}</button>`).join('')}</div><div id="reasonFeedback" role="status"></div><div class="button-row"><button class="primary-button" id="deduce">推理を確かめる ${svg('link')}</button></div>`,'notebook');
 bodyClick('[data-clue]',el=>{const id=el.dataset.clue;if(pair.includes(id))pair=pair.filter(x=>x!==id);else if(pair.length<2)pair.push(id);else{toast('選択済みの証拠を押すと、選び直せます。');return;}
 $('modalBody').querySelectorAll('[data-clue]').forEach(b=>{b.classList.toggle('selected',pair.includes(b.dataset.clue));b.setAttribute('aria-pressed',String(pair.includes(b.dataset.clue)));});
 $('modalBody').querySelectorAll('.selection-slot').forEach((slot,i)=>slot.textContent=pair[i]?clue(pair[i]).title:(i?'二つ目':'一つ目')+'の証拠');
 });
 bodyClick('[data-answer]',el=>{answer=Number(el.dataset.answer);$('modalBody').querySelectorAll('[data-answer]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.answer)===answer);b.setAttribute('aria-pressed',String(Number(b.dataset.answer)===answer));});});
 $('deduce').onclick=()=>{
 if(M.deduce(state,pair,answer)){save();render();chapterConclusion();}
 else {let text=pair.length<2?'まず、根拠になる証拠を二つ選ぼう。':answer===null?'二つの証拠から言えることを、一つ選ぼう。':!d.pair.every(id=>pair.includes(id))?'その二つだけでは、この問いの根拠が足りない。問いに直接つながる二つを選び直そう。':'証拠はつながった。ただし、その結論は記録で言える範囲を越えている。もう一度考えよう。';$('reasonFeedback').innerHTML=`<div class="callout error">${text}</div>`;}
 };
 }
 draw();
}
function chapterConclusion(){
 const c=ch();
 openModal('見えた、次の一歩','CASE '+c.numeral+' · 解かれた謎',`<p class="prose">${esc(c.deduction.success)}</p><div class="callout good">${esc(c.deduction.pair.map(id=>clue(id).title).join(' × '))}</div><div class="button-row split"><button class="secondary-button" id="stayChapter">この章をもう少し調べる</button><button class="primary-button" id="nextChapter">${state.chapter===5?'最後の配置へ':'次の章へ'} ${svg('arrow')}</button></div>`);
 $('stayChapter').onclick=close;$('nextChapter').onclick=()=>{if(state.chapter===5)return rescuePuzzle();if(M.advance(state)){save();render();intro();}};
}
function intro(page=0){
 const c=ch();
 openModal(c.title,`CHAPTER ${c.numeral} · ${c.subtitle}`,`<div class="intro-roman">${c.numeral}</div><p class="prose dialogue-text">${esc(c.intro[page])}</p><div class="button-row split"><span class="intro-step">0${page+1} / 03</span><button class="primary-button" id="introNext">${page===2?'調査を始める':'続きを読む'} ${svg('arrow')}</button></div>`,'intro');
 $('introNext').onclick=()=>{if(page<2)intro(page+1);else{if(!state.introSeen.includes(state.chapter))state.introSeen.push(state.chapter);M.move(state,state.scene);save();close();render();}};
}
function hints(){
 const level=state.hints[state.chapter]||0;
 openModal('小さな道しるべ','HINTS · 必要な分だけ',`<p class="body-muted">一段ずつ、具体的になります。ヒントを使っても結末の救助は変わりません。</p><ol class="hints-list">${ch().hints.map((h,i)=>`<li class="${i>=level?'hint-placeholder':''}"><small>HINT 0${i+1}</small>${i<level?esc(h):'まだ開いていないヒント'}</li>`).join('')}</ol><div class="button-row"><button class="secondary-button" id="hintReturn">探索へ戻る</button>${level<3?'<button class="primary-button" id="hintNext">次のヒントを開く</button>':''}</div>`);
 $('hintReturn').onclick=close;if($('hintNext'))$('hintNext').onclick=()=>{state.hints[state.chapter]=level+1;save();hints();};
}
function chapterList(){
 openModal('六つの事件記録','CHAPTERS',`<div class="chapter-list">${D.chapters.map((c,i)=>`<div class="chapter-row ${i>state.chapter?'locked':''}"><span class="chapter-roman">${c.numeral}</span><span><small>${i<=state.chapter?esc(c.subtitle):'未開封の記録'}</small><b>${i<=state.chapter?esc(c.title):'まだ知らない出来事'}</b></span><span>${state.deductions.includes(i)?'照合済み':i===state.chapter?'調査中':'封印'}</span></div>`).join('')}</div><div class="button-row"><button class="secondary-button" id="replayIntro">今の章の導入を読む</button>${state.ended?'<button class="primary-button" id="chapterEnding">結末へ</button>':''}</div><p class="body-muted" style="margin-top:20px">次の章へ進むには、「推理」で証拠をつなぎます。過去の記録は事件手帳からいつでも読み返せます。</p>`);
 $('replayIntro').onclick=()=>intro();if($('chapterEnding'))$('chapterEnding').onclick=ending;
}
function rescuePuzzle(){
 let values=[0,0,0];
 openModal('引き継げる配置を','FINAL PUZZLE · ダリオの模擬配置図',`<p class="prose">一箇所を強くしては、指先が耐えられない。残る三箇所へ、弱い制限を分けよう。</p><div class="callout">既損傷のある胸側・肩内側・肘内側は候補から外す。中心側の保持は残す。<br>この図では、三箇所それぞれが「弱」であることを目指す。</div><p class="body-muted">記録上で検討する、ゲーム用の模擬配置です。実際の処置は医師・助手と一箇所ずつ変更し、症状を見て戻します。</p><div class="rescue-readout"><div><small>指先の反応</small><b id="fingerState">未調整</b></div><div><small>一箇所への負担</small><b id="loadState">集中している</b></div></div>${['上腕外側','前腕の掌側','手首の手前'].map((l,i)=>`<label class="regulator-row"><span>${l}</span><input type="range" min="0" max="3" step="1" value="0" data-reg="${i}" aria-label="${l}の制限"><output id="regOut${i}">なし</output></label>`).join('')}<div id="rescueFeedback" role="status"></div><div class="button-row split"><button class="secondary-button" id="resetReg">配置を戻す</button><button class="primary-button" id="applyReg">この配置を提案する ${svg('check')}</button></div>`,'rescue');
 function update(){
 const labels=['なし','弱','中','強'];values.forEach((v,i)=>$('regOut'+i).textContent=labels[v]);
 $('fingerState').textContent=values.some(v=>v>=2)?'低下の懸念':values.every(v=>v===1)?'保たれる見込み':'未調整';
 $('loadState').textContent=values.every(v=>v===1)?'弱く分散':values.some(v=>v>=2)?'一箇所が強すぎる':'集中が残る';
 }
 $('modalBody').querySelectorAll('[data-reg]').forEach(el=>el.oninput=()=>{values[Number(el.dataset.reg)]=Number(el.value);update();});
 $('resetReg').onclick=()=>{values=[0,0,0];$('modalBody').querySelectorAll('[data-reg]').forEach(el=>el.value=0);update();};
 $('applyReg').onclick=()=>{
 if(!M.rescue(state,values)){$('rescueFeedback').innerHTML='<div class="callout error">「数値だけでは決められません」。医師が確認する。三箇所をそれぞれ弱くして、強い一枚への集中を避けよう。</div>';return;}
 save();
 openModal('朝を越える','RESCUE · 別の担当へ',`<p class="prose">上腕、前腕、手首の手前。助手が一箇所ずつ変え、症状が落ち着くのを待つ。悪化した時には戻し、別の班から届く値も使って、もう一度配分を直した。\n\n鉢が遠ざかると、強すぎる制限は緩め直す必要があった。環境、薬、痛みの管理、安静、調節。どれか一つだけの勝利ではない。\n\nダリオが短い言葉を返した。次の担当へ渡せる記録が、ようやく揃う。</p><div class="button-row"><button class="primary-button" id="finishCase">事件の、その先へ ${svg('arrow')}</button></div>`);
 $('finishCase').onclick=()=>{M.advance(state);save();render();ending();};
 };
}
function ending(){
 const care=['kai_listened','boy_safe','yuan_name','mirei_protected','clinical_care','rescue_share','rescue_reversible'].filter(f=>state.flags.includes(f)).length;
 const endingName=care>=4?'声をつないだ調査':'記録をつないだ調査';
 const kai=state.flags.includes('kai_listened')?'「最初に、困ってることを聞いてくれたろ」。カイは自分の言葉で証言を残すと決めた。':state.flags.includes('kai_repaired')?'「あの時、聞き直してくれた」。急ぎすぎた問いも、引き返せたことがカイの記憶に残っていた。':'カイは、自分の経過と退出を望んだ時点を、記録に残すと決めた。';
 openModal('夜明けの、その先','CASE CLOSED · THE STORY CONTINUES',`<div class="end-ornament">✧</div><h3 class="ending-title">${endingName}</h3><p class="prose">十二人は、急性期を越えた。完治ではない。ダリオの右腕側には機能の低下が残り、薬と調節、長い診療が続く。\n\n${esc(kai)}\n\n現地の指示は、中央の発信控えと合わせられる。フェーンの継続指示、ヴァイスの軍事拡大と妨害、企業の記録管理、研究院の権利処理。それぞれの行為が、公的な追及へ引き継がれた。リゼットの通報と救助への協力も、それまでの関与を消すものではない。\n\n少年を探す問い合わせは、後から流れた押収資料の写しにたどり着く。最初から彼を送り込んだ計画など、なかった。保護と補償も続いていく。</p><div class="callout good">複数の処置を同時に行ったため、この朝だけで共鳴が完全に証明されたわけではない。分かったことも、残った問いも、次の担当へ渡した。</div><p class="prose">交代を終えて、外へ出る。\n「帰るぞ」\nアルバの声のあとに、遠くの車輪の音が重なった。僕は手帳を閉じた。まだ、帰ってからしたいことがある。</p><div class="end-stats"><div><b>${state.clues.length}/32</b><span>集めた証拠</span></div><div><b>${state.memories.length}/6</b><span>街の余白</span></div><div><b>${Object.keys(state.choices).length}</b><span>選んだ問いかけ</span></div></div><p class="body-muted">会話の選択に応じて、調査の呼び名と後の応答が変わります。事件の事実と、患者を救う結末は共通です。</p><div class="button-row split"><button class="secondary-button" id="endNotebook">手帳を読み返す</button><button class="primary-button" id="endExport">調査記録を保存 ${svg('file')}</button></div><div class="button-row"><button class="text-button" id="endReplay">最初から、別の言葉で</button></div>`,'notebook');
 $('endNotebook').onclick=()=>notebook();$('endExport').onclick=exportReport;$('endReplay').onclick=resetConfirm;
}
function title(){
 openModal('Ipomoea','AN INVESTIGATIVE STORY',`<h3 class="title-kicker">夜明けの証言</h3><p class="title-description">治してほしい、と来たのではなかった。<br>彼は、止めてほしいと言った。<br><br>残された研究と、帰れない患者。<br>二人の視点で街を巡り、<br>紙と声のあいだにある真相を探す。</p><div class="title-meta"><span>全6章の事件編</span><span>探索・会話・推理</span><span>二人の視点</span></div><div class="button-row"><button class="primary-button" id="startGame">${state.started?state.ended?'結末の記録へ':'調査を続ける':'物語を始める'} ${svg('arrow')}</button><button class="secondary-button" id="howTo">遊び方</button></div><p class="start-note">進行はこの端末に自動保存。音は、右上から任意でオンにできます。<br>原作『Ipomoea』のミステリー部分を再構成した、事件完結のゲーム版。</p>`,'title');
 $('startGame').onclick=()=>{if(!state.started){state.started=true;save();intro();}else if(state.ended)ending();else if(!state.introSeen.includes(state.chapter))intro();else{close();render();}};
 $('howTo').onclick=help;
}
function help(){
 openModal('調査の進め方','HOW TO PLAY',`<div class="topic-list">${[['search','調べる','背景の光の印を押して調査。物の記録は手帳へ入ります。'],['talk','話す','問いかけを選ぶと返事が変わります。大事な証拠は、どの選択でも取得できます。'],['map','移動','地図の場所を選んで移動。場面によりニル／アルバの視点になります。'],['link','推理','必要な記録を集めて照合パズルへ。その後、二つの証拠から結論を導きます。'],['book','手帳','証拠、会話ログ、自由メモを確認。背景の点線の印には、事件の外の小さな発見も。']].map(([i,t,b])=>`<div class="topic">${svg(i)}<span><b>${t}</b><small style="color:var(--muted);margin-top:4px">${b}</small></span></div>`).join('')}</div><div class="callout">間違えてもゲームオーバーになりません。章を進める前なら、調べ残した場所に戻れます。ヒントは「設定」または右の手帳から。Escで画面を閉じられます。</div><p class="body-muted">セーブはブラウザごとに保存されます。端末を変える時は「設定 → セーブを書き出す」でJSONを保存し、移動先で読み込んでください。ブラウザのデータを消すと、その端末の記録も消えます。</p><div class="button-row"><button class="primary-button" id="helpDone">${state.started?'調査へ戻る':'タイトルへ'}</button></div>`);
 $('helpDone').onclick=()=>state.started?close():title();
}
function settings(){
 openModal('調査の設定','SETTINGS',`<div class="settings-row"><span><p>文字を大きくする</p><small>会話と本文の文字サイズを変更</small></span><button class="toggle ${state.settings.largeText?'on':''}" id="fontToggle" aria-label="文字を大きくする" aria-pressed="${state.settings.largeText}"></button></div><div class="settings-row"><span><p>調べる場所の名前</p><small>背景のラベル表示を切り替え</small></span><button class="toggle ${state.settings.labels?'on':''}" id="labelToggle" aria-label="調べる場所の名前を表示" aria-pressed="${state.settings.labels}"></button></div><div class="settings-row"><span><p>環境音</p><small>控えめな空気の音。音楽や人物の声はありません</small></span><button class="toggle ${audioOn?'on':''}" id="audioToggle" aria-label="環境音" aria-pressed="${audioOn}"></button></div><div class="settings-row"><span><p>セーブデータ</p><small>${storageOK?'この端末に自動保存中':'自動保存が使えません。書き出しを使ってください。'}${state.updatedAt?' · '+esc(new Date(state.updatedAt).toLocaleString('ja-JP')):''}</small></span></div><div class="menu-actions"><button class="secondary-button" id="exportSave">セーブを書き出す</button><button class="secondary-button" id="importSave">セーブを読み込む</button></div><div class="menu-actions"><button class="secondary-button" id="settingsHelp">遊び方</button><button class="secondary-button" id="settingsHints">ヒント</button><button class="secondary-button" id="settingsChapters">章一覧</button><button class="secondary-button" id="aboutGame">このゲームについて</button></div><div class="button-row split"><button class="text-button danger-text" id="resetGame">最初から始める</button><button class="primary-button" id="settingsDone">閉じる</button></div>`);
 $('fontToggle').onclick=()=>{state.settings.largeText=!state.settings.largeText;save();render();settings();};
 $('labelToggle').onclick=()=>{state.settings.labels=!state.settings.labels;save();render();settings();};
 $('audioToggle').onclick=async()=>{await toggleAudio();settings();};
 $('exportSave').onclick=exportSave;$('importSave').onclick=()=>$('importFile').click();$('settingsHelp').onclick=help;$('settingsHints').onclick=guarded(hints);$('settingsChapters').onclick=guarded(chapterList);$('aboutGame').onclick=about;$('resetGame').onclick=resetConfirm;$('settingsDone').onclick=close;
}
function about(){
 openModal('このゲームについて','IPOMOEA · ADAPTATION',`<p class="prose">『Ipomoea 改稿版・長編小説制作バイブル』の事件を、六章の探索ゲームへ再構成しました。</p><div class="callout">原作から引き継いだもの<br>研究記録の移転、署名と対象別紙、限定承認と逸脱、ユアンの原紙、内部協力者ごとの情報の範囲、新材料と開花の仮説、患者別の救助、事件後の責任。</div><p class="body-muted">会話、章立て、手がかりの配置、書類番号〈植17〉〈U04〉、試料の比較表、調製工程の具体的な順番、模擬配置パズルの強度は、ゲーム用の再構成・補作です。原作設定への追加確定ではありません。恋愛・容姿・過去の私的な被害の詳細はこのゲームでは扱っていません。<br><br>背景五点はこのゲーム用の生成画像。人物のスチル、立ち絵、顔や姿のイラストは使っていません。地名や背景の調度はゲーム上の演出です。<br><br>会話はあらかじめ用意した選択肢で分岐します。入力内容を外部へ送信する機能はありません。全6章・32の証拠・6つの街の余白・6つの照合パズルと最後の配置パズルを収録しています。</p><div class="button-row"><button class="primary-button" id="aboutDone">設定に戻る</button></div>`);$('aboutDone').onclick=settings;
}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportSave(){save();download('ipomoea-save.json',JSON.stringify(state,null,2),'application/json');toast('セーブデータを書き出しました。');}
function exportReport(){
 let text='Ipomoea — 夜明けの証言\nあなたの調査記録\n\n';
 text+=D.chapters.map(c=>`第${c.numeral}章 ${c.title}\n${c.deduction.success}\n`).join('\n');
 text+='\n【集めた証拠】\n'+state.clues.map(id=>`${id.slice(1)} ${clue(id).title}\n${clue(id).text}\n`).join('\n');
 text+='\n【選んだ会話】\n'+D.chapters.flatMap(c=>c.scenes.flatMap(s=>s.talks)).filter(t=>Object.hasOwn(state.choices,t.id)).map(t=>`${t.speaker}／${t.label}\n選択：${t.choices[state.choices[t.id]].label}\n${t.choices[state.choices[t.id]].reply}\n`).join('\n');
 text+='\n【自由メモ】\n'+state.note+'\n\n※原作をゲーム用に再構成。書類番号・パズルの数値は補作。';
 download('ipomoea-investigation.txt',text,'text/plain;charset=utf-8');toast('調査記録を保存しました。');
}
function resetConfirm(){
 openModal('新しい調査を始める','NEW GAME',`<p class="prose">現在のセーブと自由メモを、新しい調査で置き換えます。残しておきたい場合は、先に書き出してください。</p><div class="button-row"><button class="secondary-button" id="resetCancel">戻る</button><button class="secondary-button" id="beforeResetExport">今のセーブを書き出す</button><button class="primary-button" id="confirmReset">新しい調査を始める</button></div>`);$('resetCancel').onclick=settings;$('beforeResetExport').onclick=exportSave;$('confirmReset').onclick=()=>{const oldSettings=state.settings;state=M.fresh();state.settings=oldSettings;state.started=true;save();render();intro();};
}
$('importFile').onchange=async e=>{
 const file=e.target.files[0];e.target.value='';if(!file)return;
 try{
 if(file.size>2000000)throw new Error('ファイルが大きすぎます。');const incoming=M.restore(JSON.parse(await file.text()));
 openModal('セーブを読み込む','RESTORE SAVE',`<p class="prose">第${D.chapters[incoming.chapter].numeral}章「${esc(D.chapters[incoming.chapter].title)}」\n証拠 ${incoming.clues.length} 件のデータで、現在の調査を置き換えます。</p><div class="button-row"><button class="secondary-button" id="cancelImport">戻る</button><button class="primary-button" id="confirmImport">読み込む</button></div>`);
 $('cancelImport').onclick=settings;$('confirmImport').onclick=()=>{state=incoming;save();render();close();title();toast('セーブを読み込みました。');};
 }catch(err){toast('読み込めませんでした。このゲームのセーブJSONを選んでください。');}
};
let audioContext=null,audioOn=false,audioGain=null;
async function toggleAudio(){
 try{
 if(!audioContext){const C=window.AudioContext||window.webkitAudioContext;if(!C)throw new Error('Audio unavailable');audioContext=new C();const n=audioContext.sampleRate*4,buffer=audioContext.createBuffer(1,n,audioContext.sampleRate),samples=buffer.getChannelData(0);let prev=0;for(let i=0;i<n;i++){prev=(prev+(Math.random()*2-1)*.025)/1.025;samples[i]=prev*1.7;}const source=audioContext.createBufferSource();source.buffer=buffer;source.loop=true;const low=audioContext.createBiquadFilter();low.type='lowpass';low.frequency.value=700;audioGain=audioContext.createGain();audioGain.gain.value=0;source.connect(low);low.connect(audioGain);audioGain.connect(audioContext.destination);source.start();}
 await audioContext.resume();audioOn=!audioOn;audioGain.gain.setTargetAtTime(audioOn ? .18 : 0,audioContext.currentTime,.4);$('soundButton').innerHTML=svg(audioOn?'sound':'mute');$('soundButton').setAttribute('aria-label',audioOn?'環境音をオフ':'環境音をオン');$('soundButton').setAttribute('aria-pressed',String(audioOn));$('soundButton').title=audioOn?'環境音をオフ':'環境音をオン';
 }catch(e){toast('このブラウザでは環境音を再生できません。');}
}
document.addEventListener('visibilitychange',()=>{if(audioContext){if(document.hidden)audioContext.suspend();else if(audioOn)audioContext.resume();}});
$('closeModal').innerHTML=svg('close');$('settingsButton').innerHTML=svg('settings');$('soundButton').innerHTML=svg('mute');$('labelsButton').innerHTML=svg('eye');
$('closeModal').onclick=close;$('modal').addEventListener('cancel',()=>{modalMode='';});
$('brand').onclick=title;$('settingsButton').onclick=settings;$('soundButton').onclick=toggleAudio;
$('inspectButton').onclick=guarded(inspectList);$('talkButton').onclick=guarded(talkList);$('mapButton').onclick=guarded(map);$('reasonButton').onclick=guarded(reason);$('notebookButton').onclick=guarded(()=>notebook());$('logButton').onclick=guarded(()=>notebook('log'));$('chapterListButton').onclick=guarded(chapterList);$('hintButton').onclick=guarded(hints);
$('labelsButton').onclick=()=>{state.settings.labels=!state.settings.labels;save();render();toast(state.settings.labels?'調べる場所の名前を表示':'名前を隠しました。光の印から調べられます。');};
$('sceneImage').onerror=()=>toast('背景を読み込めませんでした。ページを再読み込みしてください。');
render();title();
if(!storageOK)toast('自動保存を読み込めませんでした。設定からセーブを書き出せます。');
const prefetch=()=>{['archive','canal','office','sanatorium'].forEach(name=>{const i=new Image();i.src=`assets/${name}.webp`;});};
if('requestIdleCallback'in window)requestIdleCallback(prefetch);else setTimeout(prefetch,1000);
})();
