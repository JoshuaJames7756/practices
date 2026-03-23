'use strict';

// ══════════════════════════════════════════
//  ACCESO — CÓDIGOS VÁLIDOS
// ══════════════════════════════════════════
const CODIGOS_VALIDOS = [
  'ECG-2024-A1',
  'ECG-2024-A2',
  'ECG-2024-A3',
  'ECG-2024-A4',
  'ECG-2024-A5',
  'DEMO-ACCESO',
];
const STORAGE_KEY = 'ecg_acceso';

function verificarSesion() {
  const guardado = localStorage.getItem(STORAGE_KEY);
  if (guardado && CODIGOS_VALIDOS.includes(guardado)) {
    setTimeout(() => mostrarApp(), 80);
  }
}

function mostrarApp() {
  document.getElementById('loginOverlay').classList.add('hidden');
  document.getElementById('appWrap').classList.add('visible');
  setTimeout(() => iniciarSimulador(), 80);
}

function cerrarSesion() {
  localStorage.removeItem(STORAGE_KEY);
  document.getElementById('loginOverlay').classList.remove('hidden');
  document.getElementById('appWrap').classList.remove('visible');
  document.getElementById('loginInput').value = '';
  document.getElementById('loginError').classList.remove('visible');
  document.getElementById('loginInput').classList.remove('error');
}

document.getElementById('loginBtn').addEventListener('click', intentarLogin);
document.getElementById('loginInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') intentarLogin();
});

function intentarLogin() {
  const input  = document.getElementById('loginInput');
  const error  = document.getElementById('loginError');
  const codigo = input.value.trim().toUpperCase();
  const validos = CODIGOS_VALIDOS.map(c => c.toUpperCase());
  if (validos.includes(codigo)) {
    localStorage.setItem(STORAGE_KEY, input.value.trim());
    input.classList.remove('error');
    error.classList.remove('visible');
    mostrarApp();
  } else {
    input.classList.add('error');
    error.classList.add('visible');
    input.value = '';
    input.focus();
  }
}

document.getElementById('btnLogout').addEventListener('click', () => {
  if (confirm('¿Cerrar sesión?')) cerrarSesion();
});

verificarSesion();

// ══════════════════════════════════════════
//  RITMOS
// ══════════════════════════════════════════
const SR=250,LOOP=30,LSIZ=SR*LOOP,MMPX=4,PX1X=25*MMPX,ERASE=26;
const G=(t,mu,a,s)=>a*Math.exp(-((t-mu)**2)/(2*s*s));
function mkRand(seed){let s=seed;return()=>{s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff;};}
const M={
  normal:n=>G(n,.10,.16,.026)+G(n,.33,-.08,.009)+G(n,.37,1.20,.013)+G(n,.41,-.27,.009)+G(n,.60,.32,.052),
  noP:n=>G(n,.33,-.08,.009)+G(n,.37,1.20,.013)+G(n,.41,-.27,.009)+G(n,.58,.30,.050),
  wide:n=>G(n,.31,-.18,.015)+G(n,.39,1.55,.031)+G(n,.49,-.52,.025)+G(n,.67,-.40,.068),
  lbbb:n=>G(n,.09,.15,.026)+G(n,.37,.62,.018)+G(n,.45,.96,.019)+G(n,.65,-.23,.065),
  rbbb:n=>G(n,.10,.15,.025)+G(n,.34,-.08,.009)+G(n,.38,.85,.013)+G(n,.43,-.30,.012)+G(n,.51,.80,.018)+G(n,.63,.22,.048),
  wpw:n=>G(n,.06,.14,.028)+G(n,.16,.23,.018)+G(n,.23,1.08,.014)+G(n,.28,-.20,.009)+G(n,.46,.28,.054),
};

const RHYTHMS=[
  {id:'normal',cat:'normal',chip:'Sinusal Normal',name:'Ritmo Sinusal Normal',bpm:72,hrDisp:'60 – 100 lpm',color:'#00e676',
   feats:['Onda P positiva en DII, precede cada QRS','Intervalo PR: 0.12 – 0.20 s (3 – 5 cuadros pequeños)','QRS estrecho < 0.12 s (< 3 cuadros pequeños)','Eje QRS: 0 – 90°; onda T positiva en laterales','RR regular; Origen en el nodo sinoauricular (SA)'],
   ref:'El nodo SA despolariza espontáneamente a 60–100/min gracias a la corriente If. La onda P refleja la activación auricular; el intervalo PR, la conducción retardada en el nodo AV; el QRS estrecho, la rápida activación ventricular por el sistema de His–Purkinje.',
   gen(){const b=new Float32Array(LSIZ),rr=60/72;for(let i=0;i<LSIZ;i++)b[i]=M.normal((i/SR%rr)/rr);return b;}},
  {id:'tachy',cat:'normal',chip:'Taq. Sinusal',name:'Taquicardia Sinusal',bpm:118,hrDisp:'100 – 160 lpm',color:'#69f0ae',
   feats:['Morfología idéntica al ritmo sinusal normal','FC > 100 lpm; RR regular y disminuido','Onda P antes de cada QRS; PR puede acortarse','Inicio y fin graduales (≠ TSVP)','Causas: ejercicio, fiebre, dolor, hipovolemia, hipertiroidismo'],
   ref:'Mayor estimulación simpática o reducción del tono vagal sobre el nodo SA. FC > 100 lpm con morfología P–QRS–T normal. El nodo SA conserva el control del ritmo.',
   gen(){const b=new Float32Array(LSIZ),rr=60/118;for(let i=0;i<LSIZ;i++){const n=(i/SR%rr)/rr;b[i]=G(n,.08,.14,.022)+G(n,.29,-.07,.009)+G(n,.33,1.12,.012)+G(n,.37,-.23,.009)+G(n,.54,.27,.044);}return b;}},
  {id:'brady',cat:'normal',chip:'Brad. Sinusal',name:'Bradicardia Sinusal',bpm:44,hrDisp:'< 60 lpm',color:'#b9f6ca',
   feats:['Morfología P–QRS–T completamente normal','FC < 60 lpm; RR largo y regular','Intervalos PR y QRS dentro de límites normales','Puede ser fisiológica (atletas, vagotono nocturno)','Causas patológicas: hipotiroidismo, betabloqueantes, isquemia SA'],
   ref:'Aumento del tono vagal sobre el nodo SA. Hiperpolariza la membrana y enlentece la despolarización diastólica espontánea. Común en deportistas de élite.',
   gen(){const b=new Float32Array(LSIZ),rr=60/44;for(let i=0;i<LSIZ;i++){const n=(i/SR%rr)/rr;b[i]=G(n,.07,.17,.030)+G(n,.31,-.08,.009)+G(n,.35,1.20,.013)+G(n,.39,-.28,.009)+G(n,.56,.33,.058);}return b;}},
  {id:'afib',cat:'supra',chip:'F. Auricular',name:'Fibrilación Auricular',bpm:95,hrDisp:'60 – 160 lpm (irregular)',color:'#ffd740',
   feats:['Ausencia de ondas P identificables','Línea basal fibrilatoria irregular (ondas "f", 350–600/min)','Intervalos RR totalmente IRREGULARES (hallazgo clave)','QRS estrecho (si conducción ventricular normal)','Riesgo de tromboembolismo por estasis auricular'],
   ref:'Múltiples frentes de onda auriculares (350–600/min) caóticos. El nodo AV conduce aleatoriamente. La pérdida de la "patada auricular" reduce el gasto cardíaco 20–30%.',
   gen(){const b=new Float32Array(LSIZ).fill(0);const r1=mkRand(42);let t=0;while(t<LOOP){const rr=.38+r1()*.65;const bs=Math.floor(t*SR),be=Math.floor((t+rr)*SR);for(let i=bs;i<be&&i<LSIZ;i++)b[i]+=M.noP((i-bs)/(be-bs));t+=rr;}const r2=mkRand(77);for(let i=0;i<LSIZ;i++){const t2=i/SR;b[i]+=.07*Math.sin(2*Math.PI*6.8*t2+r2()*6.28)+.05*Math.sin(2*Math.PI*11.2*t2+r2()*6.28)+.03*(r2()-.5);}return b;}},
  {id:'flutter',cat:'supra',chip:'Flutter Aur.',name:'Flutter Auricular (bloqueo 2:1)',bpm:150,hrDisp:'~150 lpm',color:'#ffab40',
   feats:['Ondas F en "dientes de sierra" a 250–350/min','Sin línea isoeléctrica entre ondas F','Bloqueo AV 2:1 → FC ventricular ~150 lpm','QRS estrecho; RR regular (≠ FA)','FC exacta de 150 lpm debe alertar sobre flutter 2:1'],
   ref:'Macroreentrada en el istmo cavotricuspídeo a 250–350/min. El nodo AV actúa con bloqueo 2:1. Patrón en "dientes de sierra".',
   gen(){const b=new Float32Array(LSIZ).fill(0);const fRR=60/300,vRR=60/150;for(let i=0;i<LSIZ;i++){const t=i/SR;b[i]+=.19*(1-2*((t%fRR)/fRR));const n=(t%vRR)/vRR;b[i]+=G(n,.31,-.07,.009)+G(n,.35,1.15,.013)+G(n,.39,-.24,.009)+G(n,.54,.27,.047);}return b;}},
  {id:'svt',cat:'supra',chip:'TSVP',name:'Taquicardia Supraventricular Paroxística',bpm:188,hrDisp:'150 – 250 lpm',color:'#ffcc02',
   feats:['Inicio y fin ABRUPTOS ("paroxística") — diagnóstico clave','FC 150–250 lpm, RR perfectamente regular','QRS estrecho < 0.12 s (si sin aberrancia)','Onda P oculta en QRS/T o retrógrada (RP < 70 ms)','Maniobra de Valsalva/adenosina puede terminarla'],
   ref:'TRNAV (60%): circuito usa vía lenta nodal anterógrada y vía rápida retrógrada. Mecanismo: reentrada con conducción lenta y bloqueo unidireccional.',
   gen(){const b=new Float32Array(LSIZ),rr=60/188;for(let i=0;i<LSIZ;i++){const n=(i/SR%rr)/rr;b[i]=G(n,.28,-.05,.008)+G(n,.32,1.08,.012)+G(n,.36,-.19,.008)+G(n,.50,.24,.038);}return b;}},
  {id:'wpw',cat:'special',chip:'WPW',name:'Síndrome de Wolff-Parkinson-White',bpm:78,hrDisp:'60 – 100 lpm (basal)',color:'#40c4ff',
   feats:['Intervalo PR CORTO < 0.12 s','Onda DELTA: empastamiento inicial del QRS','QRS ensanchado > 0.12 s (preexcitación)','Alteraciones secundarias de repolarización','Riesgo de TSVP, FA con conducción rápida → FV'],
   ref:'Haz de Kent bypasea el nodo AV. Acorta el PR y ensancha el QRS. Riesgo de FA con conducción rápida → FV.',
   gen(){const b=new Float32Array(LSIZ),rr=60/78;for(let i=0;i<LSIZ;i++)b[i]=M.wpw((i/SR%rr)/rr);return b;}},
  {id:'blk1',cat:'block',chip:'Bloqueo 1°',name:'Bloqueo AV de Primer Grado',bpm:68,hrDisp:'Variable (PR > 0.20 s)',color:'#ff9100',
   feats:['Intervalo PR > 0.20 s (> 5 cuadros pequeños)','Cada onda P conduce → relación P:QRS = 1:1','QRS estrecho y morfológicamente normal','RR regular; benigno y asintomático','Causas: vagotono, digoxina, betabloqueantes'],
   ref:'Conducción retardada en el nodo AV sin interrupción. El retraso supera los 0.20 s.',
   gen(){const b=new Float32Array(LSIZ),rr=60/68;for(let i=0;i<LSIZ;i++){const n=(i/SR%rr)/rr;b[i]=G(n,.05,.16,.028)+G(n,.36,-.08,.009)+G(n,.40,1.18,.013)+G(n,.44,-.26,.009)+G(n,.63,.31,.052);}return b;}},
  {id:'blk2',cat:'block',chip:'Bloqueo 2°',name:'Bloqueo AV 2° Grado — Mobitz II',bpm:60,hrDisp:'40 – 80 lpm efectiva',color:'#ff6d00',
   feats:['PR CONSTANTE antes del QRS bloqueado','Onda P ocasional NO seguida por QRS','Relación P:QRS = 3:2, 4:3, 2:1, etc.','QRS puede ser estrecho o ancho','⚠ Riesgo de bloqueo completo — marcapasos'],
   ref:'Bloqueo infranodal. PR constante, QRS cae súbitamente. Puede progresar a bloqueo completo con síncope (Stokes-Adams). Requiere marcapasos.',
   gen(){const b=new Float32Array(LSIZ).fill(0);const rr=60/75;let t=0,cnt=0;while(t<LOOP){cnt++;const drop=(cnt%4===0);const bs=Math.floor(t*SR),be=Math.floor((t+rr)*SR);for(let i=bs;i<be&&i<LSIZ;i++){const n=(i-bs)/(be-bs);b[i]+=G(n,.08,.16,.027);if(!drop)b[i]+=G(n,.33,-.08,.009)+G(n,.37,1.18,.013)+G(n,.41,-.25,.009)+G(n,.60,.30,.052);}t+=rr;}return b;}},
  {id:'blk3',cat:'block',chip:'Bloqueo 3° Completo',name:'Bloqueo AV de 3er Grado (Completo)',bpm:36,hrDisp:'20–50 lpm (escape ventr.)',color:'#dd2c00',
   feats:['DISOCIACIÓN AV COMPLETA — P y QRS sin relación','Ondas P auriculares ~75/min (regulares)','QRS escape ~36/min (sin relación con P)','QRS ANCHO (escape ventricular idioventricular)','⚠ EMERGENCIA — Stokes-Adams — Marcapasos urgente'],
   ref:'Interrupción total conducción AV. Aurículas y ventrículos independientes. Escape idioventricular. Síndrome de Stokes-Adams.',
   gen(){const b=new Float32Array(LSIZ).fill(0);const aRR=60/78,vRR=60/36;for(let i=0;i<LSIZ;i++){const t=i/SR;b[i]+=G((t%aRR)/aRR,.50,.16,.027);b[i]+=M.wide((t%vRR)/vRR);}return b;}},
  {id:'lbbb',cat:'block',chip:'BRIHH',name:'Bloqueo de Rama Izquierda (BRIHH)',bpm:70,hrDisp:'60 – 100 lpm',color:'#ff6e40',
   feats:['QRS ≥ 0.12 s','Patrón RR\' o "M" en DI, aVL, V5–V6','Ausencia de onda Q septal en DI, V5, V6','Inversión secundaria de onda T','Casi siempre indica cardiopatía estructural'],
   ref:'Activación tardía del VI. QRS ancho con morfología RR\' lateral. Casi siempre patológico.',
   gen(){const b=new Float32Array(LSIZ),rr=60/70;for(let i=0;i<LSIZ;i++)b[i]=M.lbbb((i/SR%rr)/rr);return b;}},
  {id:'rbbb',cat:'block',chip:'BRDHH',name:'Bloqueo de Rama Derecha (BRDHH)',bpm:72,hrDisp:'60 – 100 lpm',color:'#ff9e80',
   feats:['QRS ≥ 0.12 s; morfología rSR\' en V1','S ancha y empastada en DI, aVL, V5–V6','Onda T invertida en V1–V3','Primer vector QRS normal','Vigilar TEP, cor pulmonale, cardiopatía congénita'],
   ref:'Retardo activación VD. Primeros 0.08 s normales. R\' en V1: despolarización tardía del VD.',
   gen(){const b=new Float32Array(LSIZ),rr=60/72;for(let i=0;i<LSIZ;i++)b[i]=M.rbbb((i/SR%rr)/rr);return b;}},
  {id:'vt',cat:'ventricular',chip:'Taq. Ventricular',name:'Taquicardia Ventricular',bpm:168,hrDisp:'100 – 250 lpm',color:'#ff5252',
   feats:['QRS ancho y bizarro ≥ 0.12 s','FC 100–250 lpm; RR regular','Disociación AV (ondas P independientes)','Capturas y fusiones ventriculares (patognomónico)','⚠ EMERGENCIA: puede degenerar en FV'],
   ref:'Foco ectópico ventricular o reentrada intraventricular. Disociación AV: criterio más específico (Brugada, Vereckei).',
   gen(){const b=new Float32Array(LSIZ),rr=60/168;for(let i=0;i<LSIZ;i++)b[i]=M.wide((i/SR%rr)/rr);return b;}},
  {id:'vfib',cat:'ventricular',chip:'FV — PARO',name:'Fibrilación Ventricular',bpm:0,hrDisp:'SIN PULSO — PARO CARDÍACO',color:'#d50000',
   feats:['⚠ RITMO LETAL — PARO CARDIORRESPIRATORIO','Ondas caóticas, irregulares','IMPOSIBLE identificar P, QRS ni T','Ausencia total de gasto cardíaco','Tratamiento: RCP + DESFIBRILACIÓN (200 J)'],
   ref:'Frentes caóticos a 350–600/min. 80% de muertes súbitas. Supervivencia cae ~10%/min sin desfibrilación.',
   gen(){const b=new Float32Array(LSIZ);const r=mkRand(987);for(let i=0;i<LSIZ;i++){const t=i/SR;b[i]=.90*Math.sin(2*Math.PI*4.1*t+Math.sin(3.2*t)*2.1+r()*.6)+.50*Math.sin(2*Math.PI*7.5*t+r()*3.14)+.30*Math.sin(2*Math.PI*2.0*t)+.28*(r()-.5);}return b;}},
  {id:'pvc',cat:'ventricular',chip:'PVC',name:'Contracciones Ventriculares Prematuras (PVC)',bpm:70,hrDisp:'Base: 60 – 90 lpm',color:'#ff8a65',
   feats:['QRS prematuro, ancho y bizarro (sin onda P previa)','Pausa compensatoria post-PVC (RR doble)','Onda T discordante al QRS','Unifocales o multifocales (≥2 morfologías)','Regla 3R: Repetidas, R en T, Rachas → TV/FV'],
   ref:'Despolarizaciones ectópicas ventriculares. Nodo SA "descarga en el vacío": pausa compensatoria = doble del RR normal.',
   gen(){const b=new Float32Array(LSIZ).fill(0);const rr=60/72;let t=0,cnt=0;while(t<LOOP-1){cnt++;const isPVC=(cnt%5===0);const rrThis=isPVC?rr*.65:rr;const bs=Math.floor(t*SR),be=Math.min(Math.floor((t+rrThis)*SR),LSIZ);for(let i=bs;i<be;i++){const n=(i-bs)/(be-bs);b[i]+=isPVC?M.wide(n):M.normal(n);}t+=isPVC?rr*1.65:rr;}return b;}},
];

// ══════════════════════════════════════════
//  SIMULADOR — CANVAS PRINCIPAL
// ══════════════════════════════════════════
const sim={id:'normal',buf:null,pos:0,playing:true,speed:1,gain:1,lastTs:null,pixAcc:0,cache:{},started:false};
function getBuf(id){if(!sim.cache[id])sim.cache[id]=RHYTHMS.find(r=>r.id===id).gen();return sim.cache[id];}
function setRhythm(id){sim.id=id;sim.buf=getBuf(id);sim.pos=0;if(traceData)traceData.fill(0);writeX=0;updateInfo(id);}

const canvas=document.getElementById('ecg');
const ctx=canvas.getContext('2d');
let traceData=null,writeX=0,gridImg=null;

// ── CLAVE: usa window.innerWidth como fallback ──
function resize(){
  const parent=canvas.parentElement;
  const W=parent.clientWidth||window.innerWidth;
  const H=Math.max(220,Math.min(480,Math.round(window.innerHeight*.38)));
  if(W<=0)return; // no apliques si aún no tiene dimensiones
  canvas.width=W;canvas.height=H;
  traceData=new Float32Array(W).fill(0);
  writeX=0;sim.pixAcc=0;
  buildGrid();
}

function buildGrid(){
  const{width:W,height:H}=canvas;
  const oc=document.createElement('canvas');oc.width=W;oc.height=H;
  const g=oc.getContext('2d');
  g.fillStyle='#020408';g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(138,20,20,.22)';g.lineWidth=.5;g.beginPath();
  for(let x=0;x<W;x+=MMPX){g.moveTo(x+.5,0);g.lineTo(x+.5,H);}
  for(let y=0;y<H;y+=MMPX){g.moveTo(0,y+.5);g.lineTo(W,y+.5);}g.stroke();
  g.strokeStyle='rgba(148,28,28,.55)';g.lineWidth=1;g.beginPath();
  for(let x=0;x<W;x+=MMPX*5){g.moveTo(x+.5,0);g.lineTo(x+.5,H);}
  for(let y=0;y<H;y+=MMPX*5){g.moveTo(0,y+.5);g.lineTo(W,y+.5);}g.stroke();
  const bl=Math.round(H*.63);
  g.strokeStyle='rgba(0,160,70,.08)';g.lineWidth=1;g.beginPath();
  g.moveTo(0,bl+.5);g.lineTo(W,bl+.5);g.stroke();
  gridImg=oc;
}

function updateTrace(dt){
  if(!sim.playing||!sim.buf||canvas.width===0)return;
  const pxPS=PX1X*sim.speed,spPx=SR/pxPS;
  const raw=dt*pxPS+sim.pixAcc,full=Math.floor(raw);
  sim.pixAcc=raw-full;
  const W=canvas.width;
  for(let p=0;p<full;p++){
    traceData[writeX]=sim.buf[Math.floor(sim.pos)%LSIZ];
    writeX=(writeX+1)%W;
    sim.pos=(sim.pos+spPx)%LSIZ;
  }
}

function renderCanvas(cv,ct,td,wx,gi,col,gn){
  const{width:W,height:H}=cv;
  if(W===0||H===0)return; // no renderizar si el canvas no tiene dimensiones
  if(gi)ct.drawImage(gi,0,0);
  else{ct.fillStyle='#020408';ct.fillRect(0,0,W,H);}
  const bl=H*.63,gain=128*gn;
  ct.strokeStyle=col;ct.lineWidth=2.3;ct.lineJoin='round';ct.lineCap='round';
  ct.shadowBlur=13;ct.shadowColor=col+'88';
  ct.beginPath();let ink=false;
  for(let x=0;x<W;x++){
    const dist=(wx-x+W)%W;
    if(dist<ERASE){ink=false;continue;}
    const y=bl-td[x]*gain;
    if(!ink){ct.moveTo(x,y);ink=true;}else ct.lineTo(x,y);
  }
  ct.stroke();ct.shadowBlur=0;
  const cpH=gain,cpX=8,cpY=bl;
  ct.strokeStyle=col+'60';ct.lineWidth=1.5;ct.beginPath();
  ct.moveTo(cpX,cpY);ct.lineTo(cpX,cpY-cpH);
  ct.lineTo(cpX+16,cpY-cpH);ct.lineTo(cpX+16,cpY);ct.stroke();
  ct.strokeStyle=col+'22';ct.lineWidth=1;
  ct.beginPath();ct.moveTo(wx,0);ct.lineTo(wx,H);ct.stroke();
}

// ══════════════════════════════════════════
//  QUIZ — CANVAS
// ══════════════════════════════════════════
const quizCanvas=document.getElementById('quizEcg');
const quizCtx=quizCanvas.getContext('2d');
let quizTrace=null,quizWriteX=0,quizGridImg=null,quizPos=0,quizBuf=null,quizPixAcc=0;

function setupQuizCanvas(){
  const wrap=document.getElementById('quizCanvasWrap');
  const W=wrap.clientWidth||window.innerWidth-36;
  const H=Math.max(160,Math.min(260,Math.round(window.innerHeight*.25)));
  if(W<=0)return;
  quizCanvas.width=W;quizCanvas.height=H;
  quizTrace=new Float32Array(W).fill(0);
  quizWriteX=0;quizPixAcc=0;
  const oc=document.createElement('canvas');oc.width=W;oc.height=H;
  const g=oc.getContext('2d');
  g.fillStyle='#020408';g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(138,20,20,.22)';g.lineWidth=.5;g.beginPath();
  for(let x=0;x<W;x+=MMPX){g.moveTo(x+.5,0);g.lineTo(x+.5,H);}
  for(let y=0;y<H;y+=MMPX){g.moveTo(0,y+.5);g.lineTo(W,y+.5);}g.stroke();
  g.strokeStyle='rgba(148,28,28,.55)';g.lineWidth=1;g.beginPath();
  for(let x=0;x<W;x+=MMPX*5){g.moveTo(x+.5,0);g.lineTo(x+.5,H);}
  for(let y=0;y<H;y+=MMPX*5){g.moveTo(0,y+.5);g.lineTo(W,y+.5);}g.stroke();
  const bl=Math.round(H*.63);
  g.strokeStyle='rgba(0,160,70,.08)';g.lineWidth=1;
  g.beginPath();g.moveTo(0,bl+.5);g.lineTo(W,bl+.5);g.stroke();
  quizGridImg=oc;
}

function quizUpdateTrace(dt){
  if(!quizBuf||quizCanvas.width===0)return;
  const pxPS=PX1X,spPx=SR/pxPS;
  const raw=dt*pxPS+quizPixAcc,full=Math.floor(raw);
  quizPixAcc=raw-full;
  const W=quizCanvas.width;
  for(let p=0;p<full;p++){
    quizTrace[quizWriteX]=quizBuf[Math.floor(quizPos)%LSIZ];
    quizWriteX=(quizWriteX+1)%W;
    quizPos=(quizPos+spPx)%LSIZ;
  }
}

// ══════════════════════════════════════════
//  LOOP DE ANIMACIÓN
// ══════════════════════════════════════════
function frame(ts){
  if(!sim.lastTs)sim.lastTs=ts;
  const dt=Math.min((ts-sim.lastTs)/1000,.05);
  sim.lastTs=ts;

  // Simulador principal
  updateTrace(dt);
  const rhy=RHYTHMS.find(r=>r.id===sim.id);
  renderCanvas(canvas,ctx,traceData,writeX,gridImg,rhy?rhy.color:'#00e676',sim.gain);

  // Quiz canvas modo A
  if(quizState.running&&quizState.mode==='A'&&quizBuf&&quizTrace){
    quizUpdateTrace(dt);
    const qrhy=RHYTHMS.find(r=>r.id===quizState.currentId);
    renderCanvas(quizCanvas,quizCtx,quizTrace,quizWriteX,quizGridImg,qrhy?qrhy.color:'#00e676',1);
  }

  requestAnimationFrame(frame);
}

// ══════════════════════════════════════════
//  UI — INFO PANEL
// ══════════════════════════════════════════
function updateInfo(id){
  const r=RHYTHMS.find(x=>x.id===id);
  document.getElementById('iName').textContent=r.name;
  document.getElementById('iName').style.color=r.color;
  document.getElementById('iHR').textContent='FC: '+r.hrDisp;
  const fl=document.getElementById('iFeats');fl.innerHTML='';
  r.feats.forEach(f=>{const li=document.createElement('li');li.textContent=f;fl.appendChild(li);});
  document.getElementById('iRef').textContent=r.ref;
  const bpm=r.bpm>0?r.bpm:'—';
  document.getElementById('hrBig').textContent=bpm;
  document.getElementById('hrBig').style.color=r.color;
  document.getElementById('hrBig').style.textShadow=`0 0 22px ${r.color}88,0 0 44px ${r.color}44`;
  document.getElementById('rhythmChip').textContent=r.chip;
  document.getElementById('rhythmChip').style.color=r.color;
  document.getElementById('rhythmChip').style.borderColor=r.color+'50';
  document.getElementById('rhythmChip').style.background=r.color+'12';
}

const CAT_ORDER=[
  {id:'normal',label:'● Normal'},{id:'supra',label:'● Supraventricular'},
  {id:'special',label:'● Preexcitación'},{id:'block',label:'● Bloqueos AV/Rama'},
  {id:'ventricular',label:'● Ventricular'},
];

function buildRhythmUI(){
  const cont=document.getElementById('catRows');
  CAT_ORDER.forEach(cat=>{
    const ryths=RHYTHMS.filter(r=>r.cat===cat.id);if(!ryths.length)return;
    const row=document.createElement('div');row.className='cat-row';
    const lbl=document.createElement('div');lbl.className='cat-lbl';lbl.textContent=cat.label;row.appendChild(lbl);
    ryths.forEach(r=>{
      const btn=document.createElement('button');btn.className='btn-r';
      btn.textContent=r.chip;btn.style.color=r.color;
      btn.style.borderColor=r.color+'30';btn.dataset.id=r.id;
      if(r.id===sim.id){btn.classList.add('sel');btn.style.borderColor=r.color;btn.style.background=r.color+'1a';}
      btn.addEventListener('click',()=>{
        document.querySelectorAll('.btn-r').forEach(b=>{
          b.classList.remove('sel');
          const br=RHYTHMS.find(x=>x.id===b.dataset.id);
          if(br){b.style.borderColor=br.color+'30';b.style.background='';}
        });
        btn.classList.add('sel');btn.style.borderColor=r.color;btn.style.background=r.color+'1a';
        setRhythm(r.id);
      });
      row.appendChild(btn);
    });
    cont.appendChild(row);
  });
}

document.getElementById('btnPlay').addEventListener('click',()=>{
  sim.playing=!sim.playing;
  const btn=document.getElementById('btnPlay');
  btn.innerHTML=sim.playing?'⏸':'▶';
  btn.classList.toggle('paused',!sim.playing);
  if(sim.playing)sim.lastTs=null;
});
document.querySelectorAll('[data-speed]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    sim.speed=parseFloat(btn.dataset.speed);
    document.querySelectorAll('[data-speed]').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    document.getElementById('speedTag').textContent=`${Math.round(25*sim.speed)} mm/s · 10 mm/mV`;
  });
});
document.querySelectorAll('[data-gain]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    sim.gain=parseFloat(btn.dataset.gain);
    document.querySelectorAll('[data-gain]').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
  });
});
const SPEED_STEPS=[0.5,1,2,4],GAIN_STEPS=[0.5,1,2];
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  if(e.code==='Space'){e.preventDefault();document.getElementById('btnPlay').click();}
  else if(e.code==='ArrowRight'){const i=SPEED_STEPS.indexOf(sim.speed);if(i<SPEED_STEPS.length-1)document.querySelector(`[data-speed="${SPEED_STEPS[i+1]}"]`)?.click();}
  else if(e.code==='ArrowLeft'){const i=SPEED_STEPS.indexOf(sim.speed);if(i>0)document.querySelector(`[data-speed="${SPEED_STEPS[i-1]}"]`)?.click();}
  else if(e.code==='ArrowUp'){const i=GAIN_STEPS.indexOf(sim.gain);if(i<GAIN_STEPS.length-1)document.querySelector(`[data-gain="${GAIN_STEPS[i+1]}"]`)?.click();}
  else if(e.code==='ArrowDown'){const i=GAIN_STEPS.indexOf(sim.gain);if(i>0)document.querySelector(`[data-gain="${GAIN_STEPS[i-1]}"]`)?.click();}
  else{const keys={'1':0,'2':1,'3':2,'4':3,'5':4,'6':5,'7':6,'8':7,'9':8,'0':9};if(keys[e.key]!==undefined){const r=RHYTHMS[keys[e.key]];if(r)document.querySelector(`.btn-r[data-id="${r.id}"]`)?.click();}}
});

// ══════════════════════════════════════════
//  QUIZ — LÓGICA
// ══════════════════════════════════════════
const quizState={
  running:false,mode:'A',
  questions:[],current:0,
  score:0,results:[],
  currentId:null,
  timerInterval:null,timeLeft:15,
  answered:false,
};
const QUIZ_TOTAL=10,QUIZ_TIME=15;

function buildQuestions(){
  return [...RHYTHMS].sort(()=>Math.random()-.5).slice(0,QUIZ_TOTAL);
}
function getOptions(correctId){
  const wrong=RHYTHMS.filter(r=>r.id!==correctId).sort(()=>Math.random()-.5).slice(0,3);
  return [RHYTHMS.find(r=>r.id===correctId),...wrong].sort(()=>Math.random()-.5);
}

function showQuestion(idx){
  quizState.answered=false;
  const r=quizState.questions[idx];
  quizState.currentId=r.id;
  document.getElementById('quizProgressBar').style.width=`${(idx/QUIZ_TOTAL)*100}%`;
  document.getElementById('quizQNum').textContent=`${idx+1} / ${QUIZ_TOTAL}`;
  document.getElementById('quizFeedback').classList.add('hidden');

  if(quizState.mode==='A'){
    document.getElementById('quizCanvasWrap').classList.remove('hidden');
    document.getElementById('quizFeatWrap').classList.add('hidden');
    // Limpiar estado del canvas anterior
    quizBuf=null;
    quizTrace=null;
    // Setup en cascada: primero el DOM se actualiza, luego medimos
    setTimeout(()=>{
      setupQuizCanvas();
    },80);
    setTimeout(()=>{
      quizBuf=getBuf(r.id);
      quizPos=0;
      if(quizTrace)quizTrace.fill(0);
      quizWriteX=0;
    },200);
  } else {
    document.getElementById('quizCanvasWrap').classList.add('hidden');
    document.getElementById('quizFeatWrap').classList.remove('hidden');
    const fl=document.getElementById('quizFeatList');fl.innerHTML='';
    r.feats.forEach(f=>{const li=document.createElement('li');li.textContent=f;fl.appendChild(li);});
  }

  // Opciones
  const opts=getOptions(r.id);
  const optCont=document.getElementById('quizOptions');optCont.innerHTML='';
  opts.forEach(o=>{
    const btn=document.createElement('button');
    btn.className='quiz-opt';
    btn.textContent=o.name;
    btn.dataset.id=o.id;
    btn.addEventListener('click',()=>answerQuiz(o.id,r.id));
    optCont.appendChild(btn);
  });
  startTimer();
}

function startTimer(){
  clearInterval(quizState.timerInterval);
  quizState.timeLeft=QUIZ_TIME;
  updateTimerUI(QUIZ_TIME);
  quizState.timerInterval=setInterval(()=>{
    quizState.timeLeft--;
    updateTimerUI(quizState.timeLeft);
    if(quizState.timeLeft<=0){
      clearInterval(quizState.timerInterval);
      if(!quizState.answered)answerQuiz(null,quizState.currentId);
    }
  },1000);
}

function updateTimerUI(t){
  document.getElementById('timerNum').textContent=t;
  const pct=(t/QUIZ_TIME)*100;
  const circle=document.getElementById('timerCircle');
  circle.setAttribute('stroke-dasharray',`${pct} 100`);
  const col=t>8?'#00e676':t>4?'#ffcc02':'#ff5252';
  circle.setAttribute('stroke',col);
  document.getElementById('timerNum').style.color=col;
}

function answerQuiz(selectedId,correctId){
  if(quizState.answered)return;
  quizState.answered=true;
  clearInterval(quizState.timerInterval);
  const correct=selectedId===correctId;
  if(correct)quizState.score++;
  const correctRhy=RHYTHMS.find(r=>r.id===correctId);
  document.querySelectorAll('.quiz-opt').forEach(btn=>{
    btn.disabled=true;
    if(btn.dataset.id===correctId)btn.classList.add('correct');
    else if(btn.dataset.id===selectedId&&!correct)btn.classList.add('wrong');
  });
  quizState.results.push({name:correctRhy.name,correct,selectedId});
  const fb=document.getElementById('quizFeedback');
  fb.classList.remove('hidden');
  const res=document.getElementById('qfResult');
  if(selectedId===null){res.textContent='⏱ Tiempo agotado';res.className='qf-result bad';}
  else if(correct){res.textContent='✅ ¡Correcto!';res.className='qf-result ok';}
  else{res.textContent='❌ Incorrecto';res.className='qf-result bad';}
  document.getElementById('qfCorrect').textContent=
    selectedId&&selectedId!==correctId?`Respuesta correcta: ${correctRhy.name}`:'';
  document.getElementById('qfRef').textContent=correctRhy.ref;
}

document.getElementById('qfNext').addEventListener('click',()=>{
  quizState.current++;
  if(quizState.current>=QUIZ_TOTAL)showResults();
  else showQuestion(quizState.current);
});

function showResults(){
  quizState.running=false;
  document.getElementById('quizQuestion').classList.add('hidden');
  document.getElementById('quizResults').classList.remove('hidden');
  const s=quizState.score;
  document.getElementById('qrScore').textContent=`${s}/${QUIZ_TOTAL}`;
  document.getElementById('qrScore').style.color=s>=8?'#00e676':s>=5?'#ffcc02':'#ff5252';
  const labels=['Seguí practicando 💪','Vas bien! 📈','¡Muy bien! 🎯','¡Excelente! 🏆','¡Perfecto! 🌟'];
  document.getElementById('qrLabel').textContent=labels[Math.floor((s/QUIZ_TOTAL)*4)];
  document.getElementById('qrStars').textContent=s>=9?'★★★★★':s>=7?'★★★★☆':s>=5?'★★★☆☆':s>=3?'★★☆☆☆':'★☆☆☆☆';
  const det=document.getElementById('qrDetail');det.innerHTML='';
  quizState.results.forEach(res=>{
    const row=document.createElement('div');row.className='qr-detail-row';
    row.innerHTML=`<span class="qr-detail-name">${res.name}</span><span class="${res.correct?'qr-detail-ok':'qr-detail-bad'}">${res.correct?'✅':'❌'}</span>`;
    det.appendChild(row);
  });
}

function startQuiz(mode){
  quizState.mode=mode;
  quizState.questions=buildQuestions();
  quizState.current=0;quizState.score=0;quizState.results=[];quizState.running=true;
  document.getElementById('quizStart').classList.add('hidden');
  document.getElementById('quizResults').classList.add('hidden');
  document.getElementById('quizQuestion').classList.remove('hidden');
  showQuestion(0);
}

document.getElementById('startModeA').addEventListener('click',()=>startQuiz('A'));
document.getElementById('startModeB').addEventListener('click',()=>startQuiz('B'));
document.getElementById('qrRetry').addEventListener('click',()=>{
  document.getElementById('quizResults').classList.add('hidden');
  document.getElementById('quizStart').classList.remove('hidden');
});
document.getElementById('qrSim').addEventListener('click',()=>switchView('sim'));

// ══════════════════════════════════════════
//  NAVEGACIÓN SIM ↔ QUIZ
//  SOLUCIÓN DEFINITIVA: no usar display:none en las vistas
//  Solo en el quiz usamos view-hidden al inicio
// ══════════════════════════════════════════
function switchView(view){
  const simView  = document.getElementById('simView');
  const quizView = document.getElementById('quizView');
  const btnQuiz  = document.getElementById('btnQuiz');
  const btnSim   = document.getElementById('btnSim');

  if(view==='quiz'){
    // Ocultar sim
    simView.classList.add('view-hidden');
    quizView.classList.remove('view-hidden');
    btnQuiz.classList.add('active');
    btnSim.classList.remove('active');
    clearInterval(quizState.timerInterval);
    quizState.running=false;
    document.getElementById('quizStart').classList.remove('hidden');
    document.getElementById('quizQuestion').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');

  } else {
    // Mostrar sim y recalcular canvas con múltiples intentos
    quizView.classList.add('view-hidden');
    simView.classList.remove('view-hidden');
    btnSim.classList.add('active');
    btnQuiz.classList.remove('active');

    // Cascada de resize para asegurar que el canvas tenga dimensiones
    const tryResize=()=>{
      const W=canvas.parentElement.clientWidth;
      if(W>0){
        resize();
        sim.lastTs=null;
      }
    };
    setTimeout(tryResize, 50);
    setTimeout(tryResize, 150);
    setTimeout(tryResize, 300);
  }
}

document.getElementById('btnQuiz').addEventListener('click',()=>switchView('quiz'));
document.getElementById('btnSim').addEventListener('click',()=>switchView('sim'));

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
function iniciarSimulador(){
  if(sim.started)return;
  sim.started=true;
  // Iniciar con quizView oculto
  document.getElementById('quizView').classList.add('view-hidden');
  document.getElementById('btnSim').classList.add('active');
  window.addEventListener('resize',()=>{ resize(); });
  resize();
  buildRhythmUI();
  sim.buf=getBuf('normal');
  updateInfo('normal');
  setTimeout(()=>{ ['tachy','brady','afib','flutter','vfib','vt'].forEach(id=>getBuf(id)); },150);
  requestAnimationFrame(frame);
}

// ══════════════════════════════════════════
//  SERVICE WORKER
// ══════════════════════════════════════════
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js')
    .then(()=>console.log('✅ SW registrado'))
    .catch(err=>console.log('❌ SW error:',err));
}