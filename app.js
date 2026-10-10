const $=s=>document.getElementById(s),K='oshiGoods.v1';
let D=JSON.parse(localStorage.getItem(K)||'null')||{items:[],genres:['アクスタ','缶バッジ','タペストリー','ぬいぐるみ','ブロマイド','キーホルダー','アクキー','色紙','その他'],series:[]};
let curPhoto=null,pending=[];
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D))}catch(e){alert('保存容量がいっぱいです。写真を減らすかバックアップ後に整理してください。')}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const open=m=>$(m).classList.add('on'),close=m=>$(m).classList.remove('on');
const num=v=>{const n=parseFloat(v);return isFinite(n)&&n>0?n:null};
function addList(k,v){v=(v||'').trim();if(v&&!D[k].includes(v))D[k].push(v)}
function sizeStr(i){if(!i.w&&!i.h)return'';return `${i.w??'?'}×${i.h??'?'}${i.d?'×'+i.d:''}cm`}
function render(){
 const fg=$('fg').value,fs=$('fs').value;
 $('fg').innerHTML='<option value="">全ジャンル</option>'+D.genres.map(g=>`<option${g===fg?' selected':''}>${esc(g)}</option>`).join('');
 $('fs').innerHTML='<option value="">全シリーズ</option>'+D.series.map(g=>`<option${g===fs?' selected':''}>${esc(g)}</option>`).join('');
 $('dlG').innerHTML=D.genres.map(g=>`<option value="${esc(g)}">`).join('');$('dlS').innerHTML=D.series.map(g=>`<option value="${esc(g)}">`).join('');
 const q=$('q').value.trim().toLowerCase(),grp=$('grp').value;
 const L=D.items.filter(i=>(!fg||i.genre===fg)&&(!fs||i.series===fs)&&(!q||[i.name,i.genre,i.series,i.memo].join(' ').toLowerCase().includes(q)));
 const tot=L.reduce((a,i)=>a+(+i.qty||0),0);$('sum').textContent=`${L.length}種類 / 合計${tot}個`;
 if(!L.length){$('list').innerHTML=`<div class="empty">${D.items.length?'該当するグッズがありません':'まだグッズがありません<br>右下の＋から登録しよう ✨'}</div>`;return}
 const G={};L.forEach(i=>{const k=grp==='none'?'':(i[grp]||'未分類');(G[k]=G[k]||[]).push(i)});
 $('list').innerHTML=Object.keys(G).sort((a,b)=>a.localeCompare(b,'ja')).map(k=>(grp==='none'?'':`<h2 class="g">${esc(k)}（${G[k].reduce((a,i)=>a+(+i.qty||0),0)}個）</h2>`)+G[k].map(i=>`<div class="item" data-id="${i.id}">${i.photo?`<img src="${i.photo}">`:'<div class="ph">🎀</div>'}<div class="b"><div class="n">${esc(i.name)}</div>${i.genre?`<span class="tag">${esc(i.genre)}</span>`:''}${i.series?`<span class="tag s">${esc(i.series)}</span>`:''}<div style="font-size:12px;color:var(--m)">${esc(sizeStr(i))}</div></div><div class="q">×${i.qty}</div></div>`).join('')).join('');
}
$('list').onclick=e=>{const el=e.target.closest('.item');if(el)edit(D.items.find(i=>i.id===el.dataset.id))};
function setPh(p){curPhoto=p;$('prev').src=p||'';$('prev').style.display=p?'block':'none';$('rmPh').style.display=p?'block':'none'}
function edit(i){i=i||{};$('eT').textContent=i.id?'グッズを編集':'グッズを登録';$('eId').value=i.id||'';
 $('eName').value=i.name||'';$('eGenre').value=i.genre||'';$('eSeries').value=i.series||'';$('eW').value=i.w??'';$('eH').value=i.h??'';$('eD').value=i.d??'';
 $('eQty').value=i.qty??1;$('eUrl').value=i.url||'';$('eMemo').value=i.memo||'';$('eFile').value='';setPh(i.photo||null);$('eDel').style.display=i.id?'':'none';open('mEdit')}
$('add').onclick=()=>edit();$('eCancel').onclick=()=>close('mEdit');
$('qm').onclick=()=>$('eQty').value=Math.max(0,(+$('eQty').value||0)-1);$('qp').onclick=()=>$('eQty').value=(+$('eQty').value||0)+1;
$('rmPh').onclick=()=>setPh(null);
$('eFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const M=480,s=Math.min(1,M/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=img.width*s;c.height=img.height*s;c.getContext('2d').drawImage(img,0,0,c.width,c.height);setPh(c.toDataURL('image/jpeg',.72))};img.src=r.result};r.readAsDataURL(f)};
function norm(o){return{id:uid(),name:String(o.name||'').trim()||'(名称未設定)',genre:String(o.genre||'').trim(),series:String(o.series||'').trim(),w:num(o.w??o.width),h:num(o.h??o.height),d:num(o.d??o.depth),qty:Math.max(0,parseInt(o.qty??o.quantity??1)||0),url:String(o.url||''),memo:String(o.memo||''),photo:typeof o.photo==='string'&&o.photo.startsWith('data:image')?o.photo:null,created:Date.now()}}
$('eSave').onclick=()=>{if(!$('eName').value.trim())return alert('名前を入れてください');
 const id=$('eId').value,o=norm({name:$('eName').value,genre:$('eGenre').value,series:$('eSeries').value,w:$('eW').value,h:$('eH').value,d:$('eD').value,qty:$('eQty').value,url:$('eUrl').value,memo:$('eMemo').value,photo:curPhoto});
 addList('genres',o.genre);addList('series',o.series);
 if(id){const x=D.items.find(i=>i.id===id);Object.assign(x,o,{id,created:x.created})}else D.items.unshift(o);save();close('mEdit');render()};
$('eDel').onclick=()=>{if(!confirm('削除しますか？'))return;D.items=D.items.filter(i=>i.id!==$('eId').value);save();close('mEdit');render()};
['q'].forEach(x=>$(x).oninput=render);['fg','fs','grp'].forEach(x=>$(x).onchange=render);
$('mBtn').onclick=()=>open('mMenu');$('bClose').onclick=()=>close('mMenu');
$('bExp').onclick=()=>{const b=new Blob([JSON.stringify(D,null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`oshi-goods-${new Date().toISOString().slice(0,10)}.json`;a.click()};
$('bImpF').onclick=()=>$('impF').click();
$('impF').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const j=JSON.parse(t);if(!Array.isArray(j.items))throw 0;if(!confirm(`${j.items.length}件で今のデータを置き換えます。よろしいですか？`))return;D={items:j.items,genres:j.genres||D.genres,series:j.series||[]};save();close('mMenu');render()}catch(_){alert('バックアップファイルを読めませんでした')}})};
function parseItems(t){let j=JSON.parse(t);if(!Array.isArray(j))j=j.items||[j];return j.filter(o=>o&&typeof o==='object').map(norm)}
function confirmImport(items){if(!items.length)return alert('取り込めるデータがありません');pending=items;
 $('cList').innerHTML=items.map(i=>`<div class="item"><div class="ph">🎀</div><div class="b"><div class="n">${esc(i.name)}</div>${i.genre?`<span class="tag">${esc(i.genre)}</span>`:''}${i.series?`<span class="tag s">${esc(i.series)}</span>`:''}<div style="font-size:12px;color:var(--m)">${esc(sizeStr(i))} ${esc(i.memo)}</div></div><div class="q">×${i.qty}</div></div>`).join('');open('mConf')}
$('bAI').onclick=()=>{close('mMenu');$('aiT').value='';open('mAI')};$('aiC').onclick=()=>close('mAI');
$('aiN').onclick=()=>{let t=$('aiT').value.trim().replace(/^```(json)?|```$/g,'');try{const it=parseItems(t);close('mAI');confirmImport(it)}catch(e){alert('JSONの形式が正しくありません')}};
$('cC').onclick=()=>{pending=[];close('mConf')};
$('cOK').onclick=()=>{pending.forEach(i=>{addList('genres',i.genre);addList('series',i.series)});D.items=pending.concat(D.items);save();alert(`${pending.length}件追加しました`);pending=[];close('mConf');render()};
function b64d(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return new TextDecoder().decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0)))}
function hashImport(){const m=location.hash.match(/import=([^&]+)/);if(!m)return;history.replaceState(null,'',location.pathname);
 try{let s=decodeURIComponent(m[1]);confirmImport(parseItems(s.trim().startsWith('[')||s.trim().startsWith('{')?s:b64d(s)))}catch(e){alert('リンクのデータを読めませんでした')}}
function lists(){['genres','series'].forEach(k=>{$(k==='genres'?'lG':'lS').innerHTML=D[k].map((v,ix)=>`<div class="li"><input value="${esc(v)}" data-k="${k}" data-i="${ix}"><button class="btn r" data-k="${k}" data-i="${ix}">×</button></div>`).join('')})}
$('bList').onclick=()=>{close('mMenu');lists();open('mLists')};$('lC').onclick=()=>{close('mLists');render()};
$('mLists').addEventListener('change',e=>{const t=e.target;if(t.tagName!=='INPUT'||!t.dataset.k)return;const k=t.dataset.k,old=D[k][t.dataset.i],nv=t.value.trim();if(!nv)return;D[k][t.dataset.i]=nv;const f=k==='genres'?'genre':'series';D.items.forEach(i=>{if(i[f]===old)i[f]=nv});save()});
$('mLists').addEventListener('click',e=>{const t=e.target;if(t.tagName!=='BUTTON'||!t.dataset.k)return;D[t.dataset.k].splice(t.dataset.i,1);save();lists()});
$('aG').onclick=()=>{addList('genres',$('nG').value);$('nG').value='';save();lists()};$('aS').onclick=()=>{addList('series',$('nS').value);$('nS').value='';save();lists()};
window.addEventListener('hashchange',hashImport);render();hashImport();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
