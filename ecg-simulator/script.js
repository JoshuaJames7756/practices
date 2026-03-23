'use strict';

// ══════════════════════════════════════════
//  SISTEMA DE ACCESO — CONTRASEÑAS
//  Agregá o quitá códigos según tus ventas
// ══════════════════════════════════════════
const CODIGOS_VALIDOS = [
  'ECG-2024-A1',   // Estudiante 1
  'ECG-2024-A2',   // Estudiante 2
  'ECG-2024-A3',   // Estudiante 3
  'ECG-2024-A4',   // Estudiante 4
  'ECG-2024-A5',   // Estudiante 5
  'DEMO-ACCESO',   // Código de demo para probar
];

const STORAGE_KEY = 'ecg_acceso';

// ── Verificar si ya tiene sesión guardada ──
function verificarSesion() {
  const guardado = localStorage.getItem(STORAGE_KEY);
  if (guardado && CODIGOS_VALIDOS.includes(guardado)) {
    mostrarApp();
  }
}

// ── Mostrar la app y ocultar login ──
function mostrarApp() {
  document.getElementById('loginOverlay').classList.add('hidden');
  document.getElementById('appWrap').classList.add('visible');
  iniciarSimulador(); // arranca el ECG
}

// ── Cerrar sesión ──
function cerrarSesion() {
  localStorage.removeItem(STORAGE_KEY);
  document.getElementById('loginOverlay').classList.remove('hidden');
  document.getElementById('appWrap').classList.remove('visible');
  document.getElementById('loginInput').value = '';
  document.getElementById('loginError').classList.remove('visible');
  document.getElementById('loginInput').classList.remove('error');
}

// ── Lógica del botón ingresar ──
document.getElementById('loginBtn').addEventListener('click', intentarLogin);
document.getElementById('loginInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') intentarLogin();
});

function intentarLogin() {
  const input  = document.getElementById('loginInput');
  const error  = document.getElementById('loginError');
  const codigo = input.value.trim().toUpperCase();

  // Normalizamos los códigos para comparar sin importar mayúsculas
  const validos = CODIGOS_VALIDOS.map(c => c.toUpperCase());

  if (validos.includes(codigo)) {
    // ✅ Código correcto
    localStorage.setItem(STORAGE_KEY, input.value.trim());
    input.classList.remove('error');
    error.classList.remove('visible');
    mostrarApp();
  } else {
    // ❌ Código incorrecto
    input.classList.add('error');
    error.classList.add('visible');
    input.value = '';
    input.focus();
  }
}

// ── Botón cerrar sesión ──
document.getElementById('btnLogout').addEventListener('click', () => {
  if (confirm('¿Cerrar sesión?')) cerrarSesion();
});

// ── Verificar sesión al cargar ──
verificarSesion();


// ══════════════════════════════════════════
//  SIMULADOR ECG
// ══════════════════════════════════════════

const SR    = 250;
const LOOP  = 30;
const LSIZ  = SR * LOOP;
const MMPX  = 4;
const PX1X  = 25 * MMPX;
const ERASE = 26;

const G = (t, mu, a, s) => a * Math.exp(-((t - mu) ** 2) / (2 * s * s));

function mkRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const M = {
  normal: n =>
    G(n,.10,.16,.026)+G(n,.33,-.08,.009)+G(n,.37,1.20,.013)
    +G(n,.41,-.27,.009)+G(n,.60,.32,.052),
  noP: n =>
    G(n,.33,-.08,.009)+G(n,.37,1.20,.013)
    +G(n,.41,-.27,.009)+G(n,.58,.30,.050),
  wide: n =>
    G(n,.31,-.18,.015)+G(n,.39,1.55,.031)
    +G(n,.49,-.52,.025)+G(n,.67,-.40,.068),
  lbbb: n =>
    G(n,.09,.15,.026)+G(n,.37,.62,.018)+G(n,.45,.96,.019)
    +G(n,.65,-.23,.065),
  rbbb: n =>
    G(n,.10,.15,.025)+G(n,.34,-.08,.009)+G(n,.38,.85,.013)
    +G(n,.43,-.30,.012)+G(n,.51,.80,.018)+G(n,.63,.22,.048),
  wpw: n =>
    G(n,.06,.14,.028)+G(n,.16,.23,.018)+G(n,.23,1.08,.014)
    +G(n,.28,-.20,.009)+G(n,.46,.28,.054),
};

const RHYTHMS = [
  { id:'normal', cat:'normal', chip:'Sinusal Normal',
    name:'Ritmo Sinusal Normal', bpm:72, hrDisp:'60 – 100 lpm', color:'#00e676',
    feats:['Onda P positiva en DII, precede cada QRS','Intervalo PR: 0.12 – 0.20 s (3 – 5 cuadros pequeños)','QRS estrecho < 0.12 s (< 3 cuadros pequeños)','Eje QRS: 0 – 90°; onda T positiva en laterales','RR regular; Origen en el nodo sinoauricular (SA)'],
    ref:'El nodo SA despolariza espontáneamente a 60–100/min gracias a la corriente If ("funny"). La onda P refleja la activación auricular; el intervalo PR, la conducción retardada en el nodo AV; y el QRS estrecho, la rápida activación ventricular a través del sistema de His–Purkinje. Guyton destaca que el voltaje de la membrana del nodo SA oscila espontáneamente desde –65 mV hasta el umbral de –40 mV, produciendo el potencial de acción automático.',
    gen(){ const b=new Float32Array(LSIZ),rr=60/72; for(let i=0;i<LSIZ;i++) b[i]=M.normal((i/SR%rr)/rr); return b; }
  },
  { id:'tachy', cat:'normal', chip:'Taq. Sinusal',
    name:'Taquicardia Sinusal', bpm:118, hrDisp:'100 – 160 lpm', color:'#69f0ae',
    feats:['Morfología idéntica al ritmo sinusal normal','FC > 100 lpm; RR regular y disminuido','Onda P antes de cada QRS; PR puede acortarse','Inicio y fin graduales (≠ TSVP)','Causas: ejercicio, fiebre, dolor, hipovolemia, hipertiroidismo'],
    ref:'La taquicardia sinusal resulta de mayor estimulación simpática (noradrenalina) o reducción del tono vagal sobre el nodo SA. La FC > 100 lpm con morfología P–QRS–T normal es su hallazgo definitorio. Guyton explica cómo el balance simpático-parasimpático regula la frecuencia del nodo SA en un rango de 20 a >200 lpm.',
    gen(){ const b=new Float32Array(LSIZ),rr=60/118; for(let i=0;i<LSIZ;i++){const n=(i/SR%rr)/rr; b[i]=G(n,.08,.14,.022)+G(n,.29,-.07,.009)+G(n,.33,1.12,.012)+G(n,.37,-.23,.009)+G(n,.54,.27,.044);} return b; }
  },
  { id:'brady', cat:'normal', chip:'Brad. Sinusal',
    name:'Bradicardia Sinusal', bpm:44, hrDisp:'< 60 lpm', color:'#b9f6ca',
    feats:['Morfología P–QRS–T completamente normal','FC < 60 lpm; RR largo y regular','Intervalos PR y QRS dentro de límites normales','Puede ser fisiológica (atletas, vagotono nocturno)','Causas patológicas: hipotiroidismo, betabloqueantes, isquemia SA'],
    ref:'La bradicardia sinusal ocurre por aumento del tono vagal sobre el nodo SA, que hiperpolariza la membrana y enlentece la despolarización diastólica espontánea. Común en deportistas de élite (FC en reposo de 40–50 lpm). Guyton describe que la estimulación vagal intensa puede incluso detener temporalmente el nodo SA.',
    gen(){ const b=new Float32Array(LSIZ),rr=60/44; for(let i=0;i<LSIZ;i++){const n=(i/SR%rr)/rr; b[i]=G(n,.07,.17,.030)+G(n,.31,-.08,.009)+G(n,.35,1.20,.013)+G(n,.39,-.28,.009)+G(n,.56,.33,.058);} return b; }
  },
  { id:'afib', cat:'supra', chip:'F. Auricular',
    name:'Fibrilación Auricular', bpm:95, hrDisp:'60 – 160 lpm (irregular)', color:'#ffd740',
    feats:['Ausencia de ondas P identificables','Línea basal fibrilatoria irregular (ondas "f", 350–600/min)','Intervalos RR totalmente IRREGULARES (hallazgo clave)','QRS estrecho (si conducción ventricular normal)','Riesgo de tromboembolismo por estasis auricular'],
    ref:'Múltiples frentes de onda auriculares (350–600/min) se propagan de forma caótica, impidiendo una sístole auricular coordinada. El nodo AV conduce de forma aleatoria generando la irregularidad ventricular característica. La pérdida de la "patada auricular" reduce el gasto cardíaco un 20–30%.',
    gen(){ const b=new Float32Array(LSIZ).fill(0); const r1=mkRand(42); let t=0; while(t<LOOP){const rr=.38+r1()*.65; const bs=Math.floor(t*SR),be=Math.floor((t+rr)*SR); for(let i=bs;i<be&&i<LSIZ;i++) b[i]+=M.noP((i-bs)/(be-bs)); t+=rr;} const r2=mkRand(77); for(let i=0;i<LSIZ;i++){const t2=i/SR; b[i]+=.07*Math.sin(2*Math.PI*6.8*t2+r2()*6.28)+.05*Math.sin(2*Math.PI*11.2*t2+r2()*6.28)+.03*(r2()-.5);} return b; }
  },
  { id:'flutter', cat:'supra', chip:'Flutter Aur.',
    name:'Flutter Auricular (bloqueo 2:1)', bpm:150, hrDisp:'~150 lpm', color:'#ffab40',
    feats:['Ondas F en "dientes de sierra" a 250–350/min','Sin línea isoeléctrica entre ondas F (continuas)','Bloqueo AV 2:1 → FC ventricular ~150 lpm (típico)','QRS estrecho; RR regular (≠ FA)','FC exacta de 150 lpm debe alertar sobre flutter 2:1'],
    ref:'Circuito de macroreentrada en el istmo cavotricuspídeo (aurícula derecha) a 250–350/min. El nodo AV actúa con bloqueo 2:1 (lo más común). El ECG muestra el patrón clásico en "dientes de sierra" sin retorno a la línea isoeléctrica.',
    gen(){ const b=new Float32Array(LSIZ).fill(0); const fRR=60/300,vRR=60/150; for(let i=0;i<LSIZ;i++){const t=i/SR; b[i]+=.19*(1-2*((t%fRR)/fRR)); const n=(t%vRR)/vRR; b[i]+=G(n,.31,-.07,.009)+G(n,.35,1.15,.013)+G(n,.39,-.24,.009)+G(n,.54,.27,.047);} return b; }
  },
  { id:'svt', cat:'supra', chip:'TSVP',
    name:'Taquicardia Supraventricular Paroxística', bpm:188, hrDisp:'150 – 250 lpm', color:'#ffcc02',
    feats:['Inicio y fin ABRUPTOS ("paroxística") — diagnóstico clave','FC 150–250 lpm, RR perfectamente regular','QRS estrecho < 0.12 s (si sin aberrancia)','Onda P oculta en QRS/T o retrógrada (RP corto < 70 ms)','Maniobra de Valsalva/adenosina puede terminarla'],
    ref:'La TSVP más común es la Taquicardia por Reentrada Nodal AV (TRNAV, 60%), donde el circuito usa la vía lenta nodal en sentido anterógrado y la vía rápida retrógrada. El mecanismo común es la reentrada, descrita por Guyton como la circulación repetida de un impulso a través de un circuito con conducción lenta y bloqueo unidireccional.',
    gen(){ const b=new Float32Array(LSIZ),rr=60/188; for(let i=0;i<LSIZ;i++){const n=(i/SR%rr)/rr; b[i]=G(n,.28,-.05,.008)+G(n,.32,1.08,.012)+G(n,.36,-.19,.008)+G(n,.50,.24,.038);} return b; }
  },
  { id:'wpw', cat:'special', chip:'WPW',
    name:'Síndrome de Wolff-Parkinson-White', bpm:78, hrDisp:'60 – 100 lpm (basal)', color:'#40c4ff',
    feats:['Intervalo PR CORTO < 0.12 s (< 3 cuadros)','Onda DELTA: empastamiento inicial del QRS','QRS ensanchado > 0.12 s (preexcitación)','Alteraciones secundarias de repolarización (T discordante)','Riesgo de TSVP, FA con conducción rápida → FV'],
    ref:'El haz de Kent (vía accesoria AV) bypasea el nodo AV, activando prematuramente una zona ventricular y produciendo la onda delta. La preexcitación acorta el PR y ensancha el QRS. El mayor riesgo es la FA con conducción rápida por el haz de Kent, que puede degenerar en FV.',
    gen(){ const b=new Float32Array(LSIZ),rr=60/78; for(let i=0;i<LSIZ;i++) b[i]=M.wpw((i/SR%rr)/rr); return b; }
  },
  { id:'blk1', cat:'block', chip:'Bloqueo 1°',
    name:'Bloqueo AV de Primer Grado', bpm:68, hrDisp:'Variable (PR > 0.20 s)', color:'#ff9100',
    feats:['Intervalo PR > 0.20 s (> 5 cuadros pequeños)','Cada onda P conduce → relación P:QRS = 1:1','QRS estrecho y morfológicamente normal','RR regular; Generalmente benigno y asintomático','Causas: vagotono, digoxina, betabloqueantes, isquemia AV'],
    ref:'El bloqueo AV de primer grado representa conducción retardada a través del nodo AV sin interrupción. Guyton explica que el nodo AV está adaptado para retrasar la conducción 0.13 s; en el bloqueo de 1° este retraso supera los 0.20 s.',
    gen(){ const b=new Float32Array(LSIZ),rr=60/68; for(let i=0;i<LSIZ;i++){const n=(i/SR%rr)/rr; b[i]=G(n,.05,.16,.028)+G(n,.36,-.08,.009)+G(n,.40,1.18,.013)+G(n,.44,-.26,.009)+G(n,.63,.31,.052);} return b; }
  },
  { id:'blk2', cat:'block', chip:'Bloqueo 2°',
    name:'Bloqueo AV 2° Grado — Mobitz II', bpm:60, hrDisp:'40 – 80 lpm efectiva', color:'#ff6d00',
    feats:['PR CONSTANTE antes del QRS bloqueado (≠ Wenckebach)','Onda P ocasional NO seguida por QRS (bloqueo súbito)','Relación P:QRS = 3:2, 4:3, 2:1, etc.','QRS puede ser estrecho o ancho (según nivel de bloqueo)','⚠ Riesgo de bloqueo completo — considerar marcapasos'],
    ref:'El bloqueo de Mobitz II se localiza infranodalmente. A diferencia del Wenckebach, el PR permanece constante y el QRS cae súbitamente. Guyton señala que puede progresar a bloqueo completo con síncope (síndrome de Stokes-Adams). Requiere marcapasos preventivo.',
    gen(){ const b=new Float32Array(LSIZ).fill(0); const rr=60/75; let t=0,cnt=0; while(t<LOOP){cnt++; const drop=(cnt%4===0); const bs=Math.floor(t*SR),be=Math.floor((t+rr)*SR); for(let i=bs;i<be&&i<LSIZ;i++){const n=(i-bs)/(be-bs); b[i]+=G(n,.08,.16,.027); if(!drop) b[i]+=G(n,.33,-.08,.009)+G(n,.37,1.18,.013)+G(n,.41,-.25,.009)+G(n,.60,.30,.052);} t+=rr;} return b; }
  },
  { id:'blk3', cat:'block', chip:'Bloqueo 3° Completo',
    name:'Bloqueo AV de 3er Grado (Completo)', bpm:36, hrDisp:'20–50 lpm (escape ventr.)', color:'#dd2c00',
    feats:['DISOCIACIÓN AV COMPLETA — P y QRS sin relación','Ondas P a frecuencia auricular ~75/min (regulares)','QRS de escape a ~36/min (regulares, sin relación con P)','QRS ANCHO (escape ventricular idioventricular)','⚠ EMERGENCIA — Stokes-Adams — Marcapasos urgente'],
    ref:'La interrupción total de la conducción AV obliga a los ventrículos a depender de un marcapasos de escape. Las aurículas y ventrículos se contraen independientemente. Guyton describe el síndrome de Stokes-Adams como las crisis de síncope producidas por pausas ventriculares durante la transición hacia el ritmo de escape.',
    gen(){ const b=new Float32Array(LSIZ).fill(0); const aRR=60/78,vRR=60/36; for(let i=0;i<LSIZ;i++){const t=i/SR; b[i]+=G((t%aRR)/aRR,.50,.16,.027); b[i]+=M.wide((t%vRR)/vRR);} return b; }
  },
  { id:'lbbb', cat:'block', chip:'BRIHH',
    name:'Bloqueo de Rama Izquierda (BRIHH)', bpm:70, hrDisp:'60 – 100 lpm', color:'#ff6e40',
    feats:['QRS ≥ 0.12 s (≥ 3 cuadros pequeños)','Patrón RR\' o "M" en DI, aVL, V5–V6 (diagnóstico)','Ausencia de onda Q septal en DI, V5, V6','Inversión secundaria de onda T (discordante al QRS)','Casi siempre indica cardiopatía estructural significativa'],
    ref:'La interrupción de la rama izquierda produce activación tardía del VI a través del tabique y miocardio, creando el QRS ancho con morfología RR\' en derivaciones laterales. A diferencia del BRDHH, el BRIHH es casi siempre patológico.',
    gen(){ const b=new Float32Array(LSIZ),rr=60/70; for(let i=0;i<LSIZ;i++) b[i]=M.lbbb((i/SR%rr)/rr); return b; }
  },
  { id:'rbbb', cat:'block', chip:'BRDHH',
    name:'Bloqueo de Rama Derecha (BRDHH)', bpm:72, hrDisp:'60 – 100 lpm', color:'#ff9e80',
    feats:['QRS ≥ 0.12 s; morfología rSR\' en V1 ("orejas de conejo")','S ancha y empastada en DI, aVL, V5–V6','Onda T invertida en V1–V3 (cambio secundario)','Primer vector QRS normal (activación septal conservada)','Puede ser incidental; vigilar TEP, cor pulmonale, cardiopatía'],
    ref:'La interrupción de la rama derecha retarda la activación del VD. Los primeros 0.08 s del QRS son normales. La fase terminal, ancha y positiva en V1 (R\'), refleja la despolarización tardía del VD. Guyton lo usa como ejemplo de alteración del vector cardíaco.',
    gen(){ const b=new Float32Array(LSIZ),rr=60/72; for(let i=0;i<LSIZ;i++) b[i]=M.rbbb((i/SR%rr)/rr); return b; }
  },
  { id:'vt', cat:'ventricular', chip:'Taq. Ventricular',
    name:'Taquicardia Ventricular', bpm:168, hrDisp:'100 – 250 lpm', color:'#ff5252',
    feats:['QRS ancho y bizarro ≥ 0.12 s (sin morfología de BRIHH/BRDHH)','FC 100–250 lpm; RR regular (o casi)','Disociación AV (ondas P independientes del QRS)','Capturas y fusiones ventriculares (patognomónico)','⚠ EMERGENCIA: puede degenerar en FV → muerte súbita'],
    ref:'La TV se origina en un foco ectópico ventricular o un circuito de reentrada intraventricular. La disociación AV es el criterio diagnóstico más específico (criterios de Brugada, Vereckei). Guyton explica que la isquemia focal crea zonas de conducción lenta que sustentan los circuitos de reentrada ventriculares.',
    gen(){ const b=new Float32Array(LSIZ),rr=60/168; for(let i=0;i<LSIZ;i++) b[i]=M.wide((i/SR%rr)/rr); return b; }
  },
  { id:'vfib', cat:'ventricular', chip:'FV — PARO',
    name:'Fibrilación Ventricular', bpm:0, hrDisp:'SIN PULSO — PARO CARDÍACO', color:'#d50000',
    feats:['⚠ RITMO LETAL — PARO CARDIORRESPIRATORIO','Ondas caóticas, irregulares, de amplitud y frecuencia variables','IMPOSIBLE identificar ondas P, QRS ni T','Ausencia total de gasto cardíaco efectivo','Tratamiento: RCP inmediata + DESFIBRILACIÓN (200 J)'],
    ref:'Múltiples frentes de onda circulan caóticamente por el ventrículo a 350–600/min. Es el mecanismo del 80% de las muertes súbitas cardíacas. Sin desfibrilación en los primeros 3–5 minutos, la supervivencia cae ~10% por minuto. Guyton destaca que el umbral fibrilatorio disminuye con la isquemia, hipopotasemia e hipotermia.',
    gen(){ const b=new Float32Array(LSIZ); const r=mkRand(987); for(let i=0;i<LSIZ;i++){const t=i/SR; b[i]=.90*Math.sin(2*Math.PI*4.1*t+Math.sin(3.2*t)*2.1+r()*.6)+.50*Math.sin(2*Math.PI*7.5*t+r()*3.14)+.30*Math.sin(2*Math.PI*2.0*t)+.28*(r()-.5);} return b; }
  },
  { id:'pvc', cat:'ventricular', chip:'PVC',
    name:'Contracciones Ventriculares Prematuras (PVC)', bpm:70, hrDisp:'Base: 60 – 90 lpm', color:'#ff8a65',
    feats:['QRS prematuro, ancho y bizarro (sin onda P previa)','Pausa compensatoria post-PVC (intervalo RR doble)','Onda T discordante (dirección opuesta al QRS)','Unifocales (mismo aspecto) o multifocales (≥2 morfologías)','Regla de las 3 R: Repetidas, R en T, Rachas → riesgo TV/FV'],
    ref:'Las PVC son despolarizaciones ectópicas ventriculares que ocurren antes del siguiente latido sinusal. El nodo SA "descarga en el vacío" produciendo la pausa compensatoria. Guyton explica la PVC como ejemplo de actividad ectópica ventricular por aumento de la automaticidad o microcircuitos de reentrada.',
    gen(){ const b=new Float32Array(LSIZ).fill(0); const rr=60/72; let t=0,cnt=0; while(t<LOOP-1){cnt++; const isPVC=(cnt%5===0); const rrThis=isPVC?rr*.65:rr; const bs=Math.floor(t*SR),be=Math.min(Math.floor((t+rrThis)*SR),LSIZ); for(let i=bs;i<be;i++){const n=(i-bs)/(be-bs); b[i]+=isPVC?M.wide(n):M.normal(n);} t+=isPVC?rr*1.65:rr;} return b; }
  },
];

// ══════════════════════════════════════════
//  ESTADO DEL SIMULADOR
// ══════════════════════════════════════════
const sim = {
  id:'normal', buf:null, pos:0,
  playing:true, speed:1, gain:1,
  lastTs:null, pixAcc:0, cache:{},
  started: false,
};

function getBuf(id){
  if(!sim.cache[id]) sim.cache[id]=RHYTHMS.find(r=>r.id===id).gen();
  return sim.cache[id];
}

function setRhythm(id){
  sim.id=id; sim.buf=getBuf(id); sim.pos=0;
  if(traceData) traceData.fill(0);
  writeX=0;
  updateInfo(id);
}

// ══════════════════════════════════════════
//  CANVAS
// ══════════════════════════════════════════
const canvas = document.getElementById('ecg');
const ctx    = canvas.getContext('2d');
let traceData=null, writeX=0, gridImg=null;

function resize(){
  const W=canvas.parentElement.clientWidth;
  const H=Math.max(290,Math.min(520,Math.round(window.innerHeight*.44)));
  canvas.width=W; canvas.height=H;
  traceData=new Float32Array(W).fill(0);
  writeX=0; sim.pixAcc=0;
  buildGrid();
}

function buildGrid(){
  const {width:W,height:H}=canvas;
  const oc=document.createElement('canvas');
  oc.width=W; oc.height=H;
  const g=oc.getContext('2d');
  g.fillStyle='#020408'; g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(138,20,20,.22)'; g.lineWidth=.5; g.beginPath();
  for(let x=0;x<W;x+=MMPX){g.moveTo(x+.5,0);g.lineTo(x+.5,H);}
  for(let y=0;y<H;y+=MMPX){g.moveTo(0,y+.5);g.lineTo(W,y+.5);}
  g.stroke();
  g.strokeStyle='rgba(148,28,28,.55)'; g.lineWidth=1; g.beginPath();
  for(let x=0;x<W;x+=MMPX*5){g.moveTo(x+.5,0);g.lineTo(x+.5,H);}
  for(let y=0;y<H;y+=MMPX*5){g.moveTo(0,y+.5);g.lineTo(W,y+.5);}
  g.stroke();
  const bl=Math.round(H*.63);
  g.strokeStyle='rgba(0,160,70,.08)'; g.lineWidth=1;
  g.beginPath(); g.moveTo(0,bl+.5); g.lineTo(W,bl+.5); g.stroke();
  gridImg=oc;
}

function updateTrace(dt){
  if(!sim.playing||!sim.buf) return;
  const pxPS=PX1X*sim.speed, spPx=SR/pxPS;
  const raw=dt*pxPS+sim.pixAcc, full=Math.floor(raw);
  sim.pixAcc=raw-full;
  const W=canvas.width;
  for(let p=0;p<full;p++){
    traceData[writeX]=sim.buf[Math.floor(sim.pos)%LSIZ];
    writeX=(writeX+1)%W;
    sim.pos=(sim.pos+spPx)%LSIZ;
  }
}

function render(){
  const {width:W,height:H}=canvas;
  if(gridImg) ctx.drawImage(gridImg,0,0);
  else{ctx.fillStyle='#020408';ctx.fillRect(0,0,W,H);}
  const rhy=RHYTHMS.find(r=>r.id===sim.id);
  const col=rhy?rhy.color:'#00e676';
  const bl=H*.63, gain=128*sim.gain;
  ctx.strokeStyle=col; ctx.lineWidth=2.3;
  ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.shadowBlur=13; ctx.shadowColor=col+'88';
  ctx.beginPath(); let ink=false;
  for(let x=0;x<W;x++){
    const dist=(writeX-x+W)%W;
    if(dist<ERASE){ink=false;continue;}
    const y=bl-traceData[x]*gain;
    if(!ink){ctx.moveTo(x,y);ink=true;}else ctx.lineTo(x,y);
  }
  ctx.stroke(); ctx.shadowBlur=0;
  const cpW=16,cpH=gain,cpX=8,cpY=bl;
  ctx.strokeStyle=col+'60'; ctx.lineWidth=1.5; ctx.beginPath();
  ctx.moveTo(cpX,cpY); ctx.lineTo(cpX,cpY-cpH);
  ctx.lineTo(cpX+cpW,cpY-cpH); ctx.lineTo(cpX+cpW,cpY); ctx.stroke();
  ctx.strokeStyle=col+'22'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(writeX,0); ctx.lineTo(writeX,H); ctx.stroke();
}

function frame(ts){
  if(!sim.lastTs) sim.lastTs=ts;
  const dt=Math.min((ts-sim.lastTs)/1000,.05);
  sim.lastTs=ts;
  updateTrace(dt); render();
  requestAnimationFrame(frame);
}

// ══════════════════════════════════════════
//  UI
// ══════════════════════════════════════════
function updateInfo(id){
  const r=RHYTHMS.find(x=>x.id===id);
  document.getElementById('iName').textContent=r.name;
  document.getElementById('iName').style.color=r.color;
  document.getElementById('iHR').textContent='FC: '+r.hrDisp;
  const fl=document.getElementById('iFeats'); fl.innerHTML='';
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
  {id:'normal',label:'● Normal'},
  {id:'supra',label:'● Supraventricular'},
  {id:'special',label:'● Preexcitación'},
  {id:'block',label:'● Bloqueos AV/Rama'},
  {id:'ventricular',label:'● Ventricular'},
];

function buildRhythmUI(){
  const cont=document.getElementById('catRows');
  CAT_ORDER.forEach(cat=>{
    const ryths=RHYTHMS.filter(r=>r.cat===cat.id);
    if(!ryths.length) return;
    const row=document.createElement('div'); row.className='cat-row';
    const lbl=document.createElement('div'); lbl.className='cat-lbl'; lbl.textContent=cat.label;
    row.appendChild(lbl);
    ryths.forEach(r=>{
      const btn=document.createElement('button'); btn.className='btn-r';
      btn.textContent=r.chip; btn.style.color=r.color;
      btn.style.borderColor=r.color+'30'; btn.dataset.id=r.id;
      if(r.id===sim.id){btn.classList.add('sel');btn.style.borderColor=r.color;btn.style.background=r.color+'1a';}
      btn.addEventListener('click',()=>{
        document.querySelectorAll('.btn-r').forEach(b=>{
          b.classList.remove('sel');
          const br=RHYTHMS.find(x=>x.id===b.dataset.id);
          if(br){b.style.borderColor=br.color+'30';b.style.background='';}
        });
        btn.classList.add('sel'); btn.style.borderColor=r.color; btn.style.background=r.color+'1a';
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
  if(sim.playing) sim.lastTs=null;
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

const SPEED_STEPS=[0.5,1,2,4];
const GAIN_STEPS=[0.5,1,2];

document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
  if(e.code==='Space'){e.preventDefault();document.getElementById('btnPlay').click();}
  else if(e.code==='ArrowRight'){const i=SPEED_STEPS.indexOf(sim.speed);if(i<SPEED_STEPS.length-1) document.querySelector(`[data-speed="${SPEED_STEPS[i+1]}"]`)?.click();}
  else if(e.code==='ArrowLeft'){const i=SPEED_STEPS.indexOf(sim.speed);if(i>0) document.querySelector(`[data-speed="${SPEED_STEPS[i-1]}"]`)?.click();}
  else if(e.code==='ArrowUp'){const i=GAIN_STEPS.indexOf(sim.gain);if(i<GAIN_STEPS.length-1) document.querySelector(`[data-gain="${GAIN_STEPS[i+1]}"]`)?.click();}
  else if(e.code==='ArrowDown'){const i=GAIN_STEPS.indexOf(sim.gain);if(i>0) document.querySelector(`[data-gain="${GAIN_STEPS[i-1]}"]`)?.click();}
  else{const keys={'1':0,'2':1,'3':2,'4':3,'5':4,'6':5,'7':6,'8':7,'9':8,'0':9};if(keys[e.key]!==undefined){const r=RHYTHMS[keys[e.key]];if(r) document.querySelector(`.btn-r[data-id="${r.id}"]`)?.click();}}
});

// ── Inicia el simulador (se llama solo tras login) ──
function iniciarSimulador(){
  if(sim.started) return;
  sim.started=true;
  window.addEventListener('resize',()=>{ resize(); });
  resize();
  buildRhythmUI();
  sim.buf=getBuf('normal');
  updateInfo('normal');
  setTimeout(()=>{ ['tachy','brady','afib','flutter'].forEach(id=>getBuf(id)); },100);
  requestAnimationFrame(frame);
}

// ══════════════════════════════════════════
//  SERVICE WORKER — PWA sin internet
// ══════════════════════════════════════════
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js')
    .then(()=>console.log('✅ Service Worker registrado'))
    .catch(err=>console.log('❌ Error SW:',err));
}