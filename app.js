const $=s=>document.getElementById(s),K='oshiGoods.v1',UK='oshiGoods.ui';
const DEF=()=>({items:[],genres:['アクスタ','缶バッジ','タペストリー','ぬいぐるみ','ブロマイド','キーホルダー','アクキー','色紙','その他'],series:[],works:[],photos:{}});
let D=DEF();
function fix(){if(!D||typeof D!=='object')D=DEF();if(!D.photos||typeof D.photos!=='object')D.photos={};['genres','series','works'].forEach(k=>{if(!Array.isArray(D[k]))D[k]=[]});if(!Array.isArray(D.items))D.items=[]}
let U=Object.assign({st:['own','none','plan'],genre:''},JSON.parse(localStorage.getItem(UK)||'{}'));if(!Array.isArray(U.st))U.st=['own','none','plan'];
let curPhoto=null,pending=[],bulk=false,sel=new Set(),visible=[];
function gc(){const u=new Set(D.items.map(i=>i.photoRef).filter(Boolean));Object.keys(D.photos).forEach(k=>{if(!u.has(k))delete D.photos[k]})}
// photos: inline item.photo -> D.photos (dedupe), items keep photoRef
function normPhotos(){const by={};for(const k in D.photos)by[D.photos[k]]=k;D.items.forEach(i=>{if(typeof i.photo==='string'&&i.photo.startsWith('data:')){let k=by[i.photo];if(!k){k='p'+uid();D.photos[k]=i.photo;by[i.photo]=k}i.photoRef=k}if('photo'in i)i.photo=null})}
// ---- IndexedDB storage ----
let db=null,saved=new Set(),full=true,chain=Promise.resolve();
const req=r=>new Promise((ok,ng)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>ng(r.error)});
const txDone=t=>new Promise((ok,ng)=>{t.oncomplete=()=>ok();t.onerror=t.onabort=()=>ng(t.error||new Error('abort'))});
function openDB(){return new Promise((ok,ng)=>{const r=indexedDB.open('oshiGoods',1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('kv');d.createObjectStore('photos')};r.onsuccess=()=>ok(r.result);r.onerror=()=>ng(r.error);r.onblocked=()=>ng(new Error('blocked'))})}
const meta=()=>({items:D.items,genres:D.genres,series:D.series,works:D.works});
async function writeAll(){const t=db.transaction(['kv','photos'],'readwrite'),P=t.objectStore('photos'),ids=Object.keys(D.photos);
 if(full)P.clear();ids.forEach(k=>{if(full||!saved.has(k))P.put(D.photos[k],k)});[...saved].forEach(k=>{if(!(k in D.photos))P.delete(k)});
 t.objectStore('kv').put(meta(),'data');await txDone(t);saved=new Set(ids);full=false}
async function readAll(){const t=db.transaction(['kv','photos']),m=await req(t.objectStore('kv').get('data'));if(!m)return null;
 const ks=await req(t.objectStore('photos').getAllKeys()),vs=await req(t.objectStore('photos').getAll()),ph={};ks.forEach((k,i)=>ph[k]=vs[i]);return Object.assign(m,{photos:ph})}
function fullAlert(){alert('保存容量がいっぱいで保存できませんでした😢\n写真を外す・小さい写真にする・バックアップ後に整理するなどで空きを作ってください。')}
function save(){normPhotos();gc();const snap=JSON.stringify(meta());
 if(!db){try{localStorage.setItem(K,JSON.stringify(D));return Promise.resolve(true)}catch(e){fullAlert();return Promise.resolve(false)}}
 return chain=chain.then(()=>writeAll().then(()=>true,e=>{console.error(e);saved=new Set();full=true;fullAlert();return false}))}
async function init(){fix();
 try{db=await openDB()}catch(e){console.warn('IDB unavailable',e);db=null}
 if(!db){D=JSON.parse(localStorage.getItem(K)||'null')||DEF();fix();normPhotos();return}
 let d=await readAll();
 if(d){D=d;fix();saved=new Set(Object.keys(D.photos));full=false;if(localStorage.getItem(K)!=null&&localStorage.getItem(MK)==='1')localStorage.removeItem(K);
  else if(localStorage.getItem(K)!=null){/* IDB present but migration not marked: verify then remove */await verifyAndClear()}return}
 const raw=localStorage.getItem(K);D=raw?JSON.parse(raw):DEF();fix();normPhotos();gc();
 if(raw){saved=new Set();full=true;await writeAll();await verifyAndClear()}}
async function verifyAndClear(){const raw=localStorage.getItem(K);if(raw==null)return;const L=JSON.parse(raw),d=await readAll();
 const ln=(L.items||[]).length,lp=(L.items||[]).filter(i=>i.photo||i.photoRef).length,dp=d.items.filter(i=>i.photoRef&&d.photos[i.photoRef]).length;
 if(d&&d.items.length>=ln&&dp>=lp){localStorage.setItem(MK,'1');localStorage.removeItem(K)}else console.warn('migration verify failed; keeping localStorage',ln,lp,d&&d.items.length,dp)}
async function storageInfo(){try{const e=await navigator.storage.estimate(),p=navigator.storage.persisted?await navigator.storage.persisted():false,mb=x=>(x/1048576).toFixed(1)+'MB';$('stInfo').textContent=`使用量 ${mb(e.usage||0)} / 上限 約${mb(e.quota||0)}${p?'（保護あり）':''}${db?'':'（互換モード）'}`}catch(_){$('stInfo').textContent=''}}
const MK='oshiGoods.migrated';
const ph=i=>i.photo||(i.photoRef&&D.photos[i.photoRef])||null;
const saveU=()=>localStorage.setItem(UK,JSON.stringify(U));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const open=m=>$(m).classList.add('on'),close=m=>$(m).classList.remove('on');
const num=v=>{const n=parseFloat(v);return isFinite(n)&&n>0?n:null};
const price=v=>{if(v===''||v==null)return null;const n=parseFloat(String(v).replace(/[¥￥,円\s]/g,''));return isFinite(n)&&n>=0?Math.round(n):null};
const bool=v=>v===true||v===1||(typeof v==='string'&&/^(true|1|yes|はい|○|◯)$/i.test(v.trim()));
const yen=n=>'¥'+n.toLocaleString('ja-JP');
function addList(k,v){v=(v||'').trim();if(v&&!D[k].includes(v))D[k].push(v)}
function sizeStr(i){if(!i.w&&!i.h)return'';return `${i.w??'?'}×${i.h??'?'}${i.d?'×'+i.d:''}cm`}
function stMatch(i){const q=+i.qty||0;return(U.st.includes('own')&&q>=1)||(U.st.includes('none')&&q===0)||(U.st.includes('plan')&&!!i.planned)}
function card(i,ck){const q=+i.qty||0;return `<div class="item${q===0?' zero':''}${i.planned?' plan':''}" data-id="${i.id||''}">${ck?`<input type="checkbox" class="ck"${sel.has(i.id)?' checked':''}>`:''}${ph(i)?`<img src="${ph(i)}">`:'<div class="ph">🎀</div>'}<div class="b"><div class="n">${esc(i.name)}</div>${i.planned?'<span class="tag plan">🛒購入予定</span>':''}${i.work?`<span class="tag w">${esc(i.work)}</span>`:''}${i.genre?`<span class="tag">${esc(i.genre)}</span>`:''}${i.series?`<span class="tag s">${esc(i.series)}</span>`:''}${i.notForSale?'<span class="tag nfs">非売品</span>':i.price!=null?`<span class="tag p">${yen(i.price)}</span>`:''}<div style="font-size:12px;color:var(--m)">${esc(sizeStr(i))}${ck?'':' '+esc(i.memo||'')}</div></div><div class="q">×${q}</div></div>`}
function render(){
 if(U.genre&&!D.genres.includes(U.genre))U.genre='';
 const fs=$('fs').value,fw=$('fw').value,fg=U.genre;
 $('gtabs').innerHTML=['',...D.genres].map(g=>`<button data-g="${esc(g)}" class="${g===fg?'on':''}">${g?esc(g):'すべて'}</button>`).join('');
 document.querySelectorAll('#stc button').forEach(b=>b.classList.toggle('on',U.st.includes(b.dataset.st)));
 $('fw').innerHTML='<option value="">全作品</option>'+D.works.map(g=>`<option${g===fw?' selected':''}>${esc(g)}</option>`).join('');
 $('fs').innerHTML='<option value="">全シリーズ</option>'+D.series.map(g=>`<option${g===fs?' selected':''}>${esc(g)}</option>`).join('');
 $('dlW').innerHTML=D.works.map(g=>`<option value="${esc(g)}">`).join('');$('dlG').innerHTML=D.genres.map(g=>`<option value="${esc(g)}">`).join('');$('dlS').innerHTML=D.series.map(g=>`<option value="${esc(g)}">`).join('');
 const q=$('q').value.trim().toLowerCase(),grp=$('grp').value;
 const L=D.items.filter(i=>(!fg||i.genre===fg)&&(!fs||i.series===fs)&&(!fw||i.work===fw)&&stMatch(i)&&(!q||[i.name,i.work,i.genre,i.series,i.memo,i.notForSale?'非売品':'',i.planned?'購入予定':''].join(' ').toLowerCase().includes(q)));
 visible=L.map(i=>i.id);
 const own=L.filter(i=>(+i.qty||0)>=1),tot=own.reduce((a,i)=>a+(+i.qty||0),0),val=own.reduce((a,i)=>a+(i.notForSale||i.price==null?0:i.price*(+i.qty||0)),0),pl=L.filter(i=>i.planned).length;
 $('sum').textContent=`${L.length}種類 / 所持${tot}個${val?` / 所持品合計${yen(val)}`:''}${pl?` / 購入予定${pl}件`:''}${bulk?` ｜ ${sel.size}件選択中`:''}`;
 if(!L.length){$('list').innerHTML=`<div class="empty">${D.items.length?'該当するグッズがありません':'まだグッズがありません<br>右下の＋から登録しよう ✨'}</div>`;return}
 const G={};L.forEach(i=>{const k=grp==='none'?'':(i[grp]||'未分類');(G[k]=G[k]||[]).push(i)});
 $('list').innerHTML=Object.keys(G).sort((a,b)=>{const L=D[{genre:'genres',series:'series',work:'works'}[grp]]||[],x=L.indexOf(a),y=L.indexOf(b);return(x<0?1e9:x)-(y<0?1e9:y)||a.localeCompare(b,'ja')}).map(k=>(grp==='none'?'':`<h2 class="g">${esc(k)}（${G[k].reduce((a,i)=>a+(+i.qty||0),0)}個）</h2>`)+G[k].map(i=>card(i,true)).join('')).join('');
}
$('gtabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;U.genre=b.dataset.g;saveU();render()};
$('stc').onclick=e=>{const b=e.target.closest('button');if(!b)return;const s=b.dataset.st;U.st=U.st.includes(s)?U.st.filter(x=>x!==s):U.st.concat(s);saveU();render()};
$('list').onclick=e=>{const el=e.target.closest('.item');if(!el)return;const id=el.dataset.id;
 if(bulk){sel.has(id)?sel.delete(id):sel.add(id);render();return}edit(D.items.find(i=>i.id===id))};
function setPh(p){curPhoto=p;$('prev').src=p||'';$('prev').style.display=p?'block':'none';$('rmPh').style.display=p?'block':'none'}
function edit(i){i=i||{};$('eT').textContent=i.id?'グッズを編集':'グッズを登録';$('eId').value=i.id||'';
 $('eName').value=i.name||'';$('eWork').value=i.work||'';$('eGenre').value=i.genre||'';$('eSeries').value=i.series||'';$('eW').value=i.w??'';$('eH').value=i.h??'';$('eD').value=i.d??'';
 $('eQty').value=i.qty??1;$('ePrice').value=i.price??'';$('eNfs').checked=!!i.notForSale;$('ePrice').disabled=!!i.notForSale;$('ePlan').checked=!!i.planned;
 $('eUrl').value=i.url||'';$('eMemo').value=i.memo||'';$('eFile').value='';setPh(ph(i));$('eDel').style.display=$('eDup').style.display=i.id?'':'none';dupRef=null;open('mEdit')}
let dupRef=null;
$('eDup').onclick=()=>{const x=D.items.find(i=>i.id===$('eId').value);dupRef=x&&x.photoRef||null;$('eId').value='';$('eT').textContent='複製して登録';$('eDel').style.display=$('eDup').style.display='none';$('eName').focus()};
$('eNfs').onchange=()=>{$('ePrice').disabled=$('eNfs').checked;if($('eNfs').checked)$('ePrice').value=''};
$('bNfs').onchange=()=>{$('bPrice').disabled=$('bNfs').checked;if($('bNfs').checked)$('bPrice').value=''};
$('add').onclick=()=>edit();$('eCancel').onclick=()=>close('mEdit');
$('qm').onclick=()=>$('eQty').value=Math.max(0,(+$('eQty').value||0)-1);$('qp').onclick=()=>$('eQty').value=(+$('eQty').value||0)+1;
$('rmPh').onclick=()=>setPh(null);
function compress(f,cb){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const M=480,s=Math.min(1,M/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=img.width*s;c.height=img.height*s;c.getContext('2d').drawImage(img,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.72))};img.onerror=()=>{alert('この画像は読み込めませんでした（PNG/JPEG等をお試しください）');cb(null)};img.src=r.result};r.onerror=()=>{alert('ファイルを読み込めませんでした');cb(null)};r.readAsDataURL(f)}
$('eFile').onchange=e=>{const f=e.target.files[0];if(f)compress(f,setPh)};
let bPhoto=null;function setBPh(p){bPhoto=p;$('bPrev').src=p||'';$('bPrev').style.display=p?'block':'none'}
let bBusy=null;$('bFile').onchange=e=>{const f=e.target.files[0];if(!f){setBPh(null);return}$('bkOK').textContent='画像を処理中…';bBusy=new Promise(res=>compress(f,p=>{setBPh(p);res()})).finally(()=>{bBusy=null;$('bkOK').textContent='適用'})};
function norm(o){const nfs=bool(o.notForSale??o['非売品']);return{id:uid(),name:String(o.name||'').trim()||'(名称未設定)',work:String(o.work??o.title??o['作品名']??'').trim(),genre:String(o.genre||'').trim(),series:String(o.series||'').trim(),w:num(o.w??o.width),h:num(o.h??o.height),d:num(o.d??o.depth),qty:Math.max(0,parseInt(o.qty??o.quantity??1)||0),price:nfs?null:price(o.price??o['価格']),notForSale:nfs,planned:bool(o.planned??o['購入予定']),url:String(o.url||''),memo:String(o.memo||''),photo:typeof o.photo==='string'&&o.photo.startsWith('data:image')?o.photo:null,created:Date.now()}}
$('eSave').onclick=()=>{if(!$('eName').value.trim())return alert('名前を入れてください');
 const id=$('eId').value,o=norm({name:$('eName').value,work:$('eWork').value,genre:$('eGenre').value,series:$('eSeries').value,w:$('eW').value,h:$('eH').value,d:$('eD').value,qty:$('eQty').value,price:$('ePrice').value,notForSale:$('eNfs').checked,planned:$('ePlan').checked,url:$('eUrl').value,memo:$('eMemo').value,photo:curPhoto});
 addList('works',o.work);addList('genres',o.genre);addList('series',o.series);
 if(id){const x=D.items.find(i=>i.id===id);if(x.photoRef&&curPhoto&&curPhoto===D.photos[x.photoRef])o.photo=null,o.photoRef=x.photoRef;else delete x.photoRef;Object.assign(x,o,{id,created:x.created})}else{if(dupRef&&curPhoto&&curPhoto===D.photos[dupRef]){o.photo=null;o.photoRef=dupRef}D.items.unshift(o)}save();close('mEdit');render()};
$('eDel').onclick=()=>{if(!confirm('削除しますか？'))return;D.items=D.items.filter(i=>i.id!==$('eId').value);save();close('mEdit');render()};
// bulk
function setBulk(on){bulk=on;sel.clear();document.body.classList.toggle('bulk',on);$('bulkBtn').textContent=on?'選択終了':'選択';render()}
$('bulkBtn').onclick=()=>setBulk(!bulk);$('bkEnd').onclick=()=>setBulk(false);
$('bkAll').onclick=()=>{const all=visible.length&&visible.every(id=>sel.has(id));visible.forEach(id=>all?sel.delete(id):sel.add(id));render()};
$('bkDel').onclick=()=>{if(!sel.size)return alert('グッズを選択してください');if(!confirm(`選択した${sel.size}件を削除します。元に戻せません。よろしいですか？`))return;D.items=D.items.filter(i=>!sel.has(i.id));save();setBulk(false)};
$('bkEdit').onclick=()=>{if(!sel.size)return alert('グッズを選択してください');$('bkT').textContent=`一括編集（${sel.size}件）`;
 document.querySelectorAll('#mBulk .bf').forEach(b=>{b.classList.remove('en');b.querySelector('.en').checked=false});
 ['bWork','bGenre','bSeries','bW','bH','bD','bPrice','bUrl','bMemo'].forEach(x=>$(x).value='');$('bQty').value=1;$('bFile').value='';setBPh(null);$('bNfs').checked=false;$('bPrice').disabled=false;$('bPlan').value='1';open('mBulk')};
$('mBulk').addEventListener('change',e=>{if(e.target.classList.contains('en'))e.target.closest('.bf').classList.toggle('en',e.target.checked)});
$('bkC').onclick=()=>close('mBulk');
function bulkApply(ids,F){const c={};
 if(F.work!==undefined)c.work=F.work.trim();if(F.genre!==undefined)c.genre=F.genre.trim();if(F.series!==undefined)c.series=F.series.trim();
 if(F.size){c.w=num(F.size.w);c.h=num(F.size.h);c.d=num(F.size.d)}
 if(F.qty!==undefined)c.qty=Math.max(0,parseInt(F.qty)||0);
 if(F.price){c.notForSale=!!F.price.notForSale;c.price=c.notForSale?null:price(F.price.price)}
 if(F.planned!==undefined)c.planned=!!F.planned;
 if(F.photo!==undefined){c.photo=null;if(F.photo){const pid='p'+uid();D.photos[pid]=F.photo;c.photoRef=pid}else c.photoRef=null}if(F.url!==undefined)c.url=F.url;if(F.memo!==undefined)c.memo=F.memo;
 addList('works',c.work);addList('genres',c.genre);addList('series',c.series);
 D.items.forEach(i=>{if(ids.has(i.id))Object.assign(i,c)});return Object.keys(c).length}
$('bkOK').onclick=async()=>{if(bBusy)await bBusy;const en=f=>document.querySelector(`#mBulk .bf[data-f="${f}"] .en`).checked,F={};
 if(en('work'))F.work=$('bWork').value;if(en('genre'))F.genre=$('bGenre').value;if(en('series'))F.series=$('bSeries').value;
 if(en('size'))F.size={w:$('bW').value,h:$('bH').value,d:$('bD').value};if(en('qty'))F.qty=$('bQty').value;
 if(en('price'))F.price={price:$('bPrice').value,notForSale:$('bNfs').checked};if(en('planned'))F.planned=$('bPlan').value==='1';
 if(en('photo')){F.photo=bPhoto;if(!bPhoto&&!confirm(`画像が選ばれていません。選択した${sel.size}件の写真を削除しますか？`))return}
 if(en('url'))F.url=$('bUrl').value;if(en('memo'))F.memo=$('bMemo').value;
 if(!Object.keys(F).length)return alert('上書きする項目にチェックを入れてください');
 if(!confirm(`${sel.size}件の${Object.keys(F).length}項目を上書きします。よろしいですか？`))return;
 const bak=JSON.stringify(D);bulkApply(sel,F);if(!await save()){D=JSON.parse(bak);render();return}close('mBulk');setBulk(false)};
['q'].forEach(x=>$(x).oninput=render);['fs','fw','grp'].forEach(x=>$(x).onchange=render);
$('mBtn').onclick=()=>{storageInfo();open('mMenu')};$('bClose').onclick=()=>close('mMenu');
$('bExp').onclick=()=>{const b=new Blob([JSON.stringify(D,null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`oshi-goods-${new Date().toISOString().slice(0,10)}.json`;a.click()};
$('bImpF').onclick=()=>$('impF').click();
$('impF').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const j=JSON.parse(t);if(!Array.isArray(j.items))throw 0;if(!confirm(`${j.items.length}件で今のデータを置き換えます。よろしいですか？`))return;D={items:j.items,genres:j.genres||D.genres,series:j.series||[],works:Array.isArray(j.works)?j.works:[],photos:j.photos&&typeof j.photos==='object'?j.photos:{}};saved=new Set();full=true;D.items.forEach(i=>addList('works',i.work));save();close('mMenu');render()}catch(_){alert('バックアップファイルを読めませんでした')}})};
function parseItems(t){let j=JSON.parse(t);if(!Array.isArray(j))j=j.items||[j];return j.filter(o=>o&&typeof o==='object').map(norm)}
function confirmImport(items){if(!items.length)return alert('取り込めるデータがありません');pending=items;$('cList').innerHTML=items.map(i=>card(i,false)).join('');open('mConf')}
$('bAI').onclick=()=>{close('mMenu');$('aiT').value='';open('mAI')};$('aiC').onclick=()=>close('mAI');
$('aiN').onclick=()=>{let t=$('aiT').value.trim().replace(/^```(json)?|```$/g,'');try{const it=parseItems(t);close('mAI');confirmImport(it)}catch(e){alert('JSONの形式が正しくありません')}};
$('cC').onclick=()=>{pending=[];close('mConf')};
$('cOK').onclick=()=>{pending.forEach(i=>{addList('works',i.work);addList('genres',i.genre);addList('series',i.series)});D.items=pending.concat(D.items);save();alert(`${pending.length}件追加しました`);pending=[];close('mConf');render()};
function b64d(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return new TextDecoder().decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0)))}
function hashImport(){const m=location.hash.match(/import=([^&]+)/);if(!m)return;history.replaceState(null,'',location.pathname);
 try{let s=decodeURIComponent(m[1]);confirmImport(parseItems(s.trim().startsWith('[')||s.trim().startsWith('{')?s:b64d(s)))}catch(e){alert('リンクのデータを読めませんでした')}}
function lists(){['genres','series','works'].forEach(k=>{$({genres:'lG',series:'lS',works:'lW'}[k]).innerHTML=D[k].map((v,ix)=>`<div class="li" data-k="${k}" data-i="${ix}"><span class="hd" title="ドラッグで並べ替え">☰</span><input value="${esc(v)}" data-k="${k}" data-i="${ix}"><button class="sb" data-a="up" ${ix?'':'disabled'}>↑</button><button class="sb" data-a="dn" ${ix<D[k].length-1?'':'disabled'}>↓</button><button class="sb" data-a="cp">📋</button><button class="btn r" data-a="del">×</button></div>`).join('')})}
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),1500)}
function copyText(s){const ok=()=>toast('コピーしました'),fb=()=>{const ta=document.createElement('textarea');ta.value=s;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(ta);ta.select();let r=false;try{r=document.execCommand('copy')}catch(_){}ta.remove();r?ok():toast('コピーできませんでした')};
 if(!s)return toast('コピーする内容がありません');if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(s).then(ok,fb);else fb()}
function moveList(k,from,to){if(to<0||to>=D[k].length||from===to)return;const[v]=D[k].splice(from,1);D[k].splice(to,0,v);save();lists()}
$('bList').onclick=()=>{close('mMenu');lists();open('mLists')};$('lC').onclick=()=>{close('mLists');render()};
$('mLists').addEventListener('change',e=>{const t=e.target;if(t.tagName!=='INPUT'||!t.dataset.k)return;const k=t.dataset.k,old=D[k][t.dataset.i],nv=t.value.trim();if(!nv)return;D[k][t.dataset.i]=nv;const f={genres:'genre',series:'series',works:'work'}[k];D.items.forEach(i=>{if(i[f]===old)i[f]=nv});if(k==='genres'&&U.genre===old){U.genre=nv;saveU()}save()});
$('mLists').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.all){copyText(D[b.dataset.all].join('\n'));return}
 const r=b.closest('.li[data-k]');if(!r)return;const k=r.dataset.k,i=+r.dataset.i,a=b.dataset.a;
 if(a==='up')moveList(k,i,i-1);else if(a==='dn')moveList(k,i,i+1);else if(a==='cp')copyText(r.querySelector('input').value.trim());else if(a==='del'){D[k].splice(i,1);save();lists()}});
// touch/mouse drag via pointer events on handle
(()=>{let drag=null;const M=$('mLists');
 M.addEventListener('pointerdown',e=>{const h=e.target.closest('.hd');if(!h)return;e.preventDefault();const r=h.closest('.li');drag={r,k:r.dataset.k,from:+r.dataset.i,id:e.pointerId};r.classList.add('drag');try{h.setPointerCapture(e.pointerId)}catch(_){}});
 M.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();const box=drag.r.parentNode;
  for(const o of box.children){if(o===drag.r)continue;const b=o.getBoundingClientRect();if(e.clientY>b.top&&e.clientY<b.bottom){const after=e.clientY>b.top+b.height/2;box.insertBefore(drag.r,after?o.nextSibling:o);break}}
  const sb=M,y=e.clientY;if(y<60)sb.scrollTop-=10;else if(y>innerHeight-60)sb.scrollTop+=10});
 const end=e=>{if(!drag||e.pointerId!==drag.id)return;const to=[...drag.r.parentNode.children].indexOf(drag.r),{k,from}=drag;drag.r.classList.remove('drag');drag=null;if(to!==from)moveList(k,from,to);else lists()};
 M.addEventListener('pointerup',end);M.addEventListener('pointercancel',end)})();
document.querySelectorAll('.cpf').forEach(b=>b.onclick=()=>copyText($(b.dataset.f).value.trim()));
$('aG').onclick=()=>{addList('genres',$('nG').value);$('nG').value='';save();lists()};$('aW').onclick=()=>{addList('works',$('nW').value);$('nW').value='';save();lists()};$('aS').onclick=()=>{addList('series',$('nS').value);$('nS').value='';save();lists()};
window.addEventListener('hashchange',hashImport);
init().catch(e=>{console.error(e);alert('データの読み込みに失敗しました。アプリを開き直してください。')}).then(()=>{render();hashImport();if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{})});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
