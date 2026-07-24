(function(){
  'use strict';
  const DB_NAME='priedsKnowledgeCenterMasterV1';
  const DB_VERSION=1;
  const STORE='app';
  const KEY='state';
  const FALLBACK_KEY='prieds_kc_state_v1';
  const PING_KEY='prieds_kc_ping_v1';
  const CHANNEL='prieds-kc-sync-v1';
  const CLIENT_ID=Math.random().toString(36).slice(2)+Date.now().toString(36);
  let dbPromise=null;

  const clone=value=>JSON.parse(JSON.stringify(value));
  const slugify=value=>String(value||'guide').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'guide';
  const now=()=>new Date().toISOString();

  function derivePageMenu(module,topic){
    if(topic.pageMenu && (topic.pageMenu.id||topic.pageMenu.en)) return {id:topic.pageMenu.id||topic.pageMenu.en,en:topic.pageMenu.en||topic.pageMenu.id};
    if(topic.group) return typeof topic.group==='string'?{id:topic.group,en:topic.group}:{id:topic.group.id||topic.group.en,en:topic.group.en||topic.group.id};
    const id=String(topic.title?.id||'');
    const en=String(topic.title?.en||id);
    const hay=(id+' '+en).toLowerCase();
    const map={
      inbound:[['qc','QC Inbound'],['putaway','Putaway'],['inbound report','Inbound Report'],['inbound','Inbound']],
      outbound:[['material usage','Material Usage'],['packing','Packing System'],['picklist','Picklist'],['loading','Process Loading'],['delivery|outbound|do report','Delivery Order']],
      purchase:[['purchase request','Purchase Request'],['purchase invoice','Purchase Invoice'],['purchase return','Purchase Return'],['direct purchase','Direct Purchase'],['purchase report','Purchase Report']],
      sales:[['point of sales|pos','Point of Sales (POS)'],['sales return','Sales Return'],['sales report','Sales Report'],['sales order','Sales Order']],
      inventory:[['stock opname','Stock Opname'],['storage layout','Storage Layout'],['split stock','Split Stock'],['stock report','Stock Report'],['inventory','Inventory']],
      movement:[['goods loan','Goods Loan'],['stock transfer','Stock Transfer']],
      production:[['assembly','Assembly Product'],['production','Production']],
      master:[['customer','Customer Management'],['supplier','Supplier Management'],['promo','Promo Management'],['point','Point Management'],['voucher','Voucher Management'],['storage','Storage Management'],['barcode','Barcode Generator'],['ticket','Ticketing Support'],['expedition','Expedition Management'],['price tier','Product Price Tier'],['change document','Change Document Log'],['product','Product Management']],
      integration:[['accurate','Sync Accurate'],['jurnal|journal','Sync Jurnal'],['forstock','Sync Forstock'],['integration','Integration & Tools']]
    };
    const rules=map[module.id]||[];
    for(const [pattern,label] of rules){if(new RegExp(pattern,'i').test(hay)) return {id:label,en:label};}
    return {id:module.name?.id||'General',en:module.name?.en||module.name?.id||'General'};
  }

  function normalizeState(raw,defaultData){
    const state=raw&&raw.data?clone(raw):{data:clone(defaultData),assets:{},savedAt:now()};
    state.assets=state.assets||{};
    state.data=Array.isArray(state.data)?state.data:clone(defaultData);
    const used=new Set();
    state.data.forEach((module,mi)=>{
      module.topics=Array.isArray(module.topics)?module.topics:[];
      module.topics.forEach((topic,ti)=>{
        let id=topic.id||`${module.id}-${slugify(topic.title?.id||topic.title?.en||'guide')}`;
        let n=2,base=id;
        while(used.has(id)) id=base+'-'+n++;
        used.add(id); topic.id=id;
        topic.pageMenu=derivePageMenu(module,topic);
        topic.createdAt=topic.createdAt||'2026-07-20T03:00:00.000Z';
        topic.updatedAt=topic.updatedAt||topic.createdAt;
        topic.editor=topic.editor||'Prieds Learning Center';
        topic.source=topic.source||'WMS Lite';
        topic.blocks=topic.blocks||{id:[],en:[]};
        topic.blocks.id=Array.isArray(topic.blocks.id)?topic.blocks.id:[];
        topic.blocks.en=Array.isArray(topic.blocks.en)?topic.blocks.en:[];
      });
    });
    state.savedAt=state.savedAt||now();
    return state;
  }

  let firebaseDb = null;
  async function initFirebase() {
    if (firebaseDb) return firebaseDb;
    // Import Firebase SDK dari CDN
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getDatabase, ref, get, set } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
    
    // GANTI DENGAN FIREBASE CONFIG ANDA
    const firebaseConfig = {
      apiKey: "AIzaSyDJA9ygiUbD81d3kXmH5Cn3w0ZmsxdvRKY",
      authDomain: "prds-management.firebaseapp.com",
      databaseURL: "https://prds-management-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "prds-management",
      storageBucket: "prds-management.firebasestorage.app",
      messagingSenderId: "971549464000",
      appId: "1:971549464000:web:d05730bd0f4fd2a250a425",
    };

    const app = initializeApp(firebaseConfig);
    firebaseDb = getDatabase(app);
    window._fbTools = { ref, get, set };
    return firebaseDb;
  }

  async function idbGet(){
    const db = await initFirebase();
    const { ref, get } = window._fbTools;
    const snapshot = await get(ref(db, 'prieds_kc_state'));
    return snapshot.exists() ? snapshot.val() : null;
  }

  async function idbPut(value){
    const db = await initFirebase();
    const { ref, set } = window._fbTools;
    await set(ref(db, 'prieds_kc_state'), value);
  }
  function fallbackGet(){try{const x=localStorage.getItem(FALLBACK_KEY);return x?JSON.parse(x):null;}catch(_){return null;}}
  function fallbackPut(value){try{localStorage.setItem(FALLBACK_KEY,JSON.stringify(value));return true;}catch(_){return false;}}
  function ping(){
    try{localStorage.setItem(PING_KEY,String(Date.now()));}catch(_){}
    try{const bc=new BroadcastChannel(CHANNEL);bc.postMessage({type:'updated',at:Date.now(),sender:CLIENT_ID});bc.close();}catch(_){}
  }
  async function load(defaultData){
    let raw=null;
    try{raw=await idbGet();}catch(_){raw=fallbackGet();}
    const state=normalizeState(raw,defaultData);
    if(!raw){try{await idbPut(state);}catch(_){fallbackPut(state);}}
    return state;
  }
  async function save(state){
    const normalized=normalizeState(state,state.data||[]);
    normalized.savedAt=now();
    try{await idbPut(normalized);}catch(err){if(!fallbackPut(normalized)) throw err;}
    ping();
    return normalized;
  }
  async function reset(defaultData){
    const state=normalizeState(null,defaultData);
    await save(state); return state;
  }
  function subscribe(callback){
    let bc=null;
    try{bc=new BroadcastChannel(CHANNEL);bc.onmessage=e=>{if(!e.data||e.data.sender!==CLIENT_ID)callback();};}catch(_){}
    const onStorage=e=>{if(e.key===PING_KEY)callback();};
    window.addEventListener('storage',onStorage);
    return ()=>{window.removeEventListener('storage',onStorage);if(bc)bc.close();};
  }

  function splitMasterGuide(state, moduleId, topicIndex, splitRules) {
    if (!state || !state.data) return state;
    const moduleObj = state.data.find(m => m.id === moduleId);
    if (!moduleObj || !moduleObj.topics[topicIndex]) {
      console.error("Master topic tidak ditemukan.");
      return state;
    }

    const masterTopic = moduleObj.topics[topicIndex];
    const newTopics = [];

    splitRules.forEach(rule => {
      const filteredId = rule.blockIndexes
        .map(idx => masterTopic.blocks?.id?.[idx])
        .filter(Boolean);

      const filteredEn = rule.blockIndexes
        .map(idx => masterTopic.blocks?.en?.[idx])
        .filter(Boolean);

      newTopics.push({
        ...masterTopic,
        title: rule.title,
        tabMenu: rule.tabName,
        blocks: {
          id: filteredId,
          en: filteredEn
        }
      });
    });

    // Gantikan topic lama dengan daftar topic baru hasil split
    moduleObj.topics.splice(topicIndex, 1, ...newTopics);
    return state;
  }

  window.KCStore={load,save,reset,subscribe,slugify,derivePageMenu,normalizeState,clone,splitMasterGuide};
})();
