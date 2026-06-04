import { useState, useEffect, useRef, useMemo } from "react";

const P={bg:"#080806",bg2:"#0f0f0c",card:"#131310",card2:"#1a1a16",border:"#2a2a22",borderG:"#C9956C44",gold:"#C9956C",gold2:"#E8C4A0",gold3:"#8B5E3C",tx:"#F0EDE6",mt:"#7a7060",mt2:"#4a4840",green:"#4dba7f",red:"#d46f6f",blue:"#4da8c9",purple:"#7c6fd4",orange:"#f97316"};
const hash=s=>{let h=5381;for(let c of s)h=(Math.imul(31,h)+c.charCodeAt(0))|0;return Math.abs(h).toString(36);};
const todayStr=()=>new Date().toISOString().split("T")[0];
const monthStr=()=>new Date().toISOString().slice(0,7);
const getNow=()=>{const n=new Date();return{y:n.getFullYear(),m:String(n.getMonth()+1).padStart(2,"0")}};
const nowMonthStr=()=>{const{y,m}=getNow();return y+"-"+m;};
const makeFecha=(day)=>{const{y,m}=getNow();return y+"-"+m+"-"+String(day).padStart(2,"0");};
const COP=n=>isNaN(n)||!isFinite(n)?"$0":"$"+new Intl.NumberFormat("es-CO").format(Math.round(n||0));
const fmtDate=d=>{try{return new Date(d+"T12:00:00").toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"});}catch{return d;}};
const fmtMonth=m=>{try{const[y,mo]=m.split("-");return new Date(+y,+mo-1,1).toLocaleDateString("es-CO",{month:"long",year:"numeric"});}catch{return m;}};
const shiftMonth=(m,d)=>{const[y,mo]=m.split("-");const dt=new Date(+y,+mo-1+d,1);return dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0");};

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#C9956C33;border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:#C9956C66}
body,html{background:#080806;color:#F0EDE6;font-family:'Poppins',sans-serif;min-height:100vh}
input,textarea,select{color-scheme:dark;font-family:'Poppins',sans-serif}
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
select option{background:#131310;color:#F0EDE6}
input:focus,textarea:focus,select:focus{outline:none;border-color:#C9956C88!important}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes accordionOpen{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.anim{animation:fadeUp .3s cubic-bezier(.22,1,.36,1)}
.acc-body{animation:accordionOpen .25s ease}
.pulse{animation:pulse 2s ease-in-out infinite}
.hr:hover{background:#161612!important;transition:background .15s}
button{cursor:pointer}
`;

const DB={
  get:async k=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):null;}catch{return null;}},
  set:async(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
};

const SI=(x={})=>({background:"#0f0f0c",border:"1px solid #2a2a22",borderRadius:8,padding:"9px 13px",color:"#F0EDE6",fontSize:13,fontFamily:"'Poppins',sans-serif",width:"100%",transition:"border-color .2s",...x});
const SB=(x={})=>({background:"linear-gradient(135deg,#C9956C,#8B5E3C)",border:"none",borderRadius:9,color:"#1a0d00",fontWeight:700,fontFamily:"'Poppins',sans-serif",letterSpacing:".5px",textTransform:"uppercase",fontSize:11,...x});
const SG=(x={})=>({background:"transparent",border:"1px solid #C9956C44",borderRadius:9,color:"#C9956C",fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:12,...x});
const GT=({children,style={}})=>(<span style={{background:"linear-gradient(135deg,#C9956C,#E8C4A0)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",...style}}>{children}</span>);
const SH=({label,sub=""})=>(<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:3,height:14,background:"linear-gradient(180deg,#C9956C,#8B5E3C)",borderRadius:2}}/><span style={{fontSize:10,color:"#C9956C",letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>{label}</span>{sub&&<span style={{fontSize:10,color:P.mt,marginLeft:4}}>{sub}</span>}</div>);
const MCard=({label,value,sub,color=P.gold,icon=""})=>(<div style={{background:P.card,border:"1px solid "+P.border,borderRadius:12,padding:"14px 16px"}}><div style={{fontSize:9,color:P.mt,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,marginBottom:6,display:"flex",alignItems:"center",gap:6}}>{icon&&<span>{icon}</span>}{label}</div><div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:800,color,lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:10,color:P.mt,marginTop:4}}>{sub}</div>}</div>);

const CopyBtn=({text,small=false})=>{const[ok,setOk]=useState(false);return(<button style={{...SG({padding:small?"4px 12px":"7px 16px",fontSize:small?10:11}),background:ok?"#0a1a0a":"transparent",borderColor:ok?"#4dba7f44":"#C9956C44",color:ok?P.green:P.gold}} onClick={()=>{navigator.clipboard?.writeText(text);setOk(true);setTimeout(()=>setOk(false),2000);}}>{ok?"✓ Copiado":"📋 Copiar"}</button>);};
const Acc=({num,label,tag,color=P.gold,note="",children,defaultOpen=false})=>{const[open,setOpen]=useState(defaultOpen);return(<div style={{background:P.card,border:open ? "1px solid "+color+"55" : "1px solid "+P.border,borderRadius:12,overflow:"hidden",marginBottom:10,transition:"border-color .2s"}}><button onClick={()=>setOpen(!open)} style={{width:"100%",background:"none",border:"none",display:"flex",alignItems:"center",gap:10,padding:"13px 16px",cursor:"pointer",textAlign:"left"}}><div style={{width:28,height:28,borderRadius:8,background:color+"22",border:"1px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:10,color,fontWeight:800,letterSpacing:-.5}}>{num}</span></div><div style={{flex:1}}><div style={{fontSize:9,color,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>{tag}</div><div style={{fontSize:13,color:P.tx,fontWeight:600}}>{label}</div></div><span style={{color:P.mt,fontSize:14,transition:"transform .25s",display:"inline-block",transform:open?"rotate(180deg)":"rotate(0)"}}>▾</span></button>{open&&(<div className="acc" style={{borderTop:"1px solid "+P.border,padding:"14px 16px 16px"}}>{note&&<div style={{background:color+"11",border:"1px solid "+color+"22",borderRadius:8,padding:"8px 12px",fontSize:11,color,marginBottom:12,lineHeight:1.6}}>{note}</div>}{children}</div>)}</div>);};
const PromptBox=({text})=>(<div><div style={{background:P.bg,border:"1px solid "+P.border,borderRadius:8,padding:"12px 14px",fontSize:11.5,color:P.mt,lineHeight:1.9,whiteSpace:"pre-wrap",maxHeight:280,overflowY:"auto",marginBottom:10,fontFamily:"monospace"}}>{text}</div><div style={{display:"flex",justifyContent:"flex-end"}}><CopyBtn text={text}/></div></div>);

// Module constants from A1/A2
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#C9956C33;border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:#C9956C66}
body,html{background:#080806;color:#F0EDE6;font-family:'Poppins',sans-serif;min-height:100vh}
input,textarea,select{color-scheme:dark;font-family:'Poppins',sans-serif}
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
select option{background:#131310;color:#F0EDE6}
input:focus,textarea:focus,select:focus{outline:none;border-color:#C9956C88!important}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes accordionOpen{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.anim{animation:fadeUp .3s cubic-bezier(.22,1,.36,1)}
.acc-body{animation:accordionOpen .25s ease}
.pulse{animation:pulse 2s ease-in-out infinite}
.hr:hover{background:#161612!important;transition:background .15s}
button{cursor:pointer}
`;
  get:async k=>{try{const r=await window.storage.get(k,true);return r?JSON.parse(r.value):null;}catch{return null;}},
  set:async(k,v)=>{try{await window.storage.set(k,JSON.stringify(v),true);}catch{}}
};
// ── M1 constants ──
const DEF_HRS=["7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM"];
const newDay=d=>({
  date:d,
  priorities:[{t:"",d:false},{t:"",d:false},{t:"",d:false}],
  dump:["","",""],
  sched:DEF_HRS.map(h=>({h,task:"",done:false})),
  notes:"",
});
const Card=({children,style={}})=>(
  <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18,...style}}>{children}</div>
);
const AccordionSection=({label,children,defaultOpen=false,fontSize})=>{
  const[open,setOpen]=useState(defaultOpen);
  return(
    <Card style={{padding:0,overflow:"hidden"}}>
      <button onClick={()=>setOpen(!open)} style={{
        width:"100%",background:"none",border:"none",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"14px 18px",cursor:"pointer",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:3,height:14,background:"linear-gradient(180deg,"+P.gold+","+P.gold3+")",borderRadius:2,flexShrink:0}}/>
          <span style={{fontFamily:"'Poppins',sans-serif",fontSize:Math.max(9,Math.min(13,(fontSize||10))),color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>{label}</span>
        </div>
        <span style={{color:P.mt,fontSize:14,transition:"transform .25s",display:"inline-block",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
      </button>
      {open&&(
        <div className="acc-body" style={{padding:"0 18px 18px"}}>
          {children}
        </div>
      )}
    </Card>
  );
};
const CHK=(done,onClick,color=P.gold)=>(
  <div onClick={onClick} style={{width:20,height:20,border:done?"2px solid "+color:"2px solid "+P.border,borderRadius:5,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:done?color:"transparent",flexShrink:0,transition:"all .2s"}}>
    {done&&<span style={{color:"#0a0400",fontSize:11,fontWeight:900,lineHeight:1}}>✓</span>}
  </div>
);
const FontSizeControl=({fontSize,setFontSize})=>(
  <div style={{display:"flex",alignItems:"center",gap:6,background:P.card2,borderRadius:8,padding:"4px 10px",border:"1px solid "+P.border}}>
    <button onClick={()=>setFontSize(f=>Math.max(11,f-1))} style={{background:"none",border:"none",color:P.mt,fontSize:16,lineHeight:1,padding:"0 2px",fontWeight:700}}>A</button>
    <span style={{fontSize:10,color:P.mt,minWidth:22,textAlign:"center"}}>{fontSize}px</span>
    <button onClick={()=>setFontSize(f=>Math.min(20,f+1))} style={{background:"none",border:"none",color:P.gold,fontSize:20,lineHeight:1,padding:"0 2px",fontWeight:700}}>A</button>
  </div>
);
// ── M2 constants ──
const ESTADOS=["Investigando","Testeando","Escalando","Pausado","Finalizado","Descartado"];
const EST_COL={Investigando:P.blue,Testeando:P.gold,Escalando:P.green,Pausado:P.mt,Finalizado:P.purple,Descartado:P.red};
const ETAPAS=[{id:"investigacion",label:"Investigación",icon:"🔍"},{id:"analisis",label:"Análisis",icon:"📊"},{id:"calculadora",label:"Calculadora",icon:"🧮"},{id:"oferta",label:"Oferta",icon:"🎁"},{id:"desarrollo",label:"Desarrollo",icon:"🛠️"},{id:"creativos",label:"Creativos",icon:"🎨"},{id:"campana",label:"Campaña",icon:"📣"}];
const PAISES=["Colombia","Mexico","Ecuador","España","Chile","Peru"];
const DEF_FL={Colombia:20000,Mexico:180,Ecuador:7,España:5,Chile:6500,Peru:15};
const DEF_C2={Colombia:18000,Mexico:90,Ecuador:4,España:7,Chile:4400,Peru:17};
const DEV_STEPS=[
  {key:"biblioteca",label:"Revisar Biblioteca de Anuncios",subs:["Buscar en Meta Ads Library","Buscar en plataformas espías","Anotar competidores activos"]},
  {key:"proveedores",label:"Buscar Proveedores en Dropi",subs:["Verificar disponibilidad","Comparar precios","Revisar tiempos de entrega"]},
  {key:"costeo",label:"Hacer Costeo",subs:["Calcular precio sugerido","Verificar margen","Revisar CPA breakeven"]},
  {key:"angulos",label:"Buscar Ángulos de Venta",subs:["Ángulo beneficio","Ángulo testimonio","Ángulo emocional","Ángulo comparación","Ángulo validación"]},
  {key:"recursos",label:"Conseguir Recursos",subs:["Imágenes del producto","Videos de referencia","Textos y descripciones"]},
  {key:"guion",label:"Guión Voz en Off",subs:["Definir hook","Escribir cuerpo","Escribir CTA"]},
  {key:"creativos",label:"Hacer Creativos",subs:["Escoger escenas de base","Editar creativos","Ponerle voz en off","Subtítulo","Efecto de sonido","Animación","Ponerle miniatura","Música de acompañamiento"]},
  {key:"landing",label:"Crear Landing + GIF",subs:["Subir contexto a ChatGPT","Crear imágenes","Editar imágenes","Optimizar contenido","Crear GIF problema-solución","Crear GIF modo de uso","Poner botón de compra","Poner mínimo 20 reseñas","Poner preguntas frecuentes"]},
  {key:"resenas",label:"Crear Reseñas",subs:["Reseñas Trustoo","Reseñas product page","Fotos hiperrealistas"]},
  {key:"ofertas",label:"Ofertas de Cantidad",subs:["Oferta 1 unidad","Oferta 2 unidades","Oferta 3 unidades","Optimizar imágenes de oferta"]},
  {key:"enlazar",label:"Enlazar con Dropi",subs:["Configurar producto","Verificar enlace","Probar proceso de compra"]},
];
const calcP=c=>{
  const fb=+(c.fletes||DEF_FL)[c.pais||"Colombia"]||0,cpa2v=+(c.cpa2s||DEF_C2)[c.pais||"Colombia"]||0;
  const u=(+c.util||0)/100,ef=Math.max(0.01,(+c.efect||75)/100),cp=(+c.cpa||0)/100,tx=(+c.tax||0)/100;
  const pr=+c.proveedor||0,ad=+c.admin||0,fu=+c.fulfi||0;
  const fd=fb/ef,base=pr+fd+ad+fu;
  const d1=1-u-cp-tx,Ps1=d1>0?base/d1:0;
  const Ps=(Ps1*cp>=cpa2v||cpa2v===0)?Ps1:(()=>{const d2=1-u-tx;return d2>0?(base+cpa2v)/d2:0;})();
  const cpc=Math.max(Ps*cp,cpa2v),imp=Ps*tx,cos=base+cpc+imp;
  const mn=+c.manual||0,um=mn?mn-cos:0,pm2=mn&&cos?(mn-cos)/cos:0,cbk=mn?mn-base:Ps-base;
  const ref=mn>0?mn:Ps;
  return{fb,fd,cpa2v,base,Ps,cpp:Ps*cp,cpc,imp,cos,um,pm:pm2,cbk,pr,ad,fu,ref,o2:{p:ref*2*0.8,u:ref*2*0.8-cos*2},o3:{p:ref*3*0.7,u:ref*3*0.7-cos*3}};
};
const scoreA=a=>{
  let p=0,m=0;
  if((+a.cantProv||1)>1)p++;m++;
  const cm={"1":2,"Entre 2 y 3":1,"Entre 4 y 6":0,"Más de 6":-1};
  p+=Math.max(0,cm[a.cantComp]??0);m+=2;
  if(a.catalogo==="Si")p++;m++;if(a.importar==="Si")p++;m++;
  if(a.ticket==="Bajo"){p+=2;m+=2;}else if(a.ticket==="Medio"){p++;m+=2;}else m+=2;
  if(a.necesidad==="Si"){p+=2;m+=2;}else m+=2;
  if(a.wow==="Si")p++;m++;if(a.cautivador==="Si")p++;m++;if(a.percepcion==="Si")p++;m++;
  return m>0?Math.round(p/m*100):0;
};
const scoreInfo=s=>s>=75?{label:"Alta Posibilidad ✦",color:P.green}:s>=55?{label:"Alta Posibilidad de Testeo",color:P.gold}:s>=35?{label:"Media Posibilidad",color:"#f97316"}:{label:"Baja Posibilidad",color:P.red};
const newProd=()=>({id:Date.now()+Math.random().toString(36).slice(2),nombre:"",estado:"Investigando",etapa:"investigacion",fecha:todayStr(),pinned:false,hidden:false,foto:"",investigacion:{descripcion:"",porQueVender:"",linkAmazon:"",linkTrends:"",linkAli:"",linkML:"",linksComp:"",linksVideos:"",precioProveedor:0,cantProveedores:1,competencia:"Entre 2 y 3",valorVenta:0,buyerPersona:"",notas:""},analisis:{cantProv:1,cantComp:"Entre 2 y 3",catalogo:"Si",importar:"Si",ticket:"Bajo",necesidad:"Si",queNec:"",wow:"No",cautivador:"Si",percepcion:"Si",black:"No",precReal:0,plataforma:"Dropi"},calculadora:{pais:"Colombia",util:10,efect:75,cpa:20,canc:15,tax:0,proveedor:0,admin:0,fulfi:0,manual:0,fletes:{...DEF_FL},cpa2s:{...DEF_C2}},oferta:{precio1:"",precio2:"",precio3:"",bundle:"",garantia:"",bonus:"",upsell:"",urgencia:"",notas:""},desarrollo:{steps:Object.fromEntries(DEV_STEPS.map(s=>[s.key,{done:false,subs:Object.fromEntries((s.subs||[]).map(sb=>[sb,false]))}]))},creativos:{angulos:"",guion:"",prompts:"",notas:""},campana:{fecha:"",plataforma:"Meta Ads",inversion:0,ingresos:0,ventas:0,cpa:0,ctr:0,cpm:0,estado:"Testeando",notas:""}});

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#C9956C33;border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:#C9956C66}
body,html{background:#080806;color:#F0EDE6;font-family:'Poppins',sans-serif;min-height:100vh}
input,textarea,select{color-scheme:dark;font-family:'Poppins',sans-serif}
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
select option{background:#131310;color:#F0EDE6}
input:focus,textarea:focus,select:focus{outline:none;border-color:#C9956C88!important}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes accordionOpen{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.anim{animation:fadeUp .3s cubic-bezier(.22,1,.36,1)}
.acc-body{animation:accordionOpen .25s ease}
.pulse{animation:pulse 2s ease-in-out infinite}
.hr:hover{background:#161612!important;transition:background .15s}
button{cursor:pointer}
`;
  get:async k=>{try{const r=await window.storage.get(k,true);return r?JSON.parse(r.value):null;}catch{return null;}},
  set:async(k,v)=>{try{await window.storage.set(k,JSON.stringify(v),true);}catch{}}
};
const FLETES={Colombia:20000,Mexico:180,Ecuador:7,Espana:5,Chile:6500,Peru:15};
const calcCosteo=(v)=>{
  const prec=+(v.precProv||0),flete=FLETES[v.pais||"Colombia"]||20000;
  const fleteD=flete/(+(v.efectividad||0.75));
  const cpa=prec*(+(v.pctCpa||0.2));
  const total=prec+fleteD+cpa+(+(v.costoAdmin||0));
  const pv=+(v.pvManual||0);
  const util=pv-total;
  const pctUtil=pv>0?util/pv:0;
  const cpaBreak=pv>0?pv-prec-fleteD:0;
  return{prec,fleteD,cpa,total,pv,util,pctUtil,cpaBreak,
    pv2:pv*2*0.8,util2:pv*2*0.8*2-total*2,
    pv3:pv*3*0.7,util3:pv*3*0.7*3-total*3};
};
// M3 constants
import * as XLSX from "xlsx";
import Papa from "papaparse";
const ESTADOS_C=["Testeando","Activa","Escalando","Pausada","Finalizada"];
const EST_COL={Testeando:P.gold,Activa:P.blue,Escalando:P.green,Pausada:P.mt,Finalizada:P.purple};
const PLATF=["Meta Ads","TikTok Ads","Meta + TikTok"];
const PERIODOS=[{id:"dia",l:"Hoy"},{id:"7d",l:"7 días"},{id:"mes",l:"Este mes"},{id:"3m",l:"3 meses"},{id:"anio",l:"Este año"},{id:"todo",l:"Todo"}];
const ESTADOS_ENTREGADO=["ENTREGADO","ENTREGADA","DELIVERED"];
const ESTADOS_CANCELADO=["CANCELADO","CANCELADA","CANCELLED","ANULADO"];
const ESTADOS_DEVUELTO=["DEVUELTO","DEVUELTA","RETURNED","DEVOLUCION","DEVOLUCIÓN"];
const ESTADOS_CAMINO=["EN CAMINO","EN TRÁNSITO","EN TRANSITO","DESPACHADO","ENVIADO","EN REPARTO"];
const ESTADOS_NOVEDAD=["NOVEDAD","CON NOVEDAD","PENDIENTE NOVEDAD"];
const classifyEstado=(e="")=>{
  const u=e.toUpperCase().trim();
  if(ESTADOS_ENTREGADO.some(s=>u.includes(s)))return"entregado";
  if(ESTADOS_CANCELADO.some(s=>u.includes(s)))return"cancelado";
  if(ESTADOS_DEVUELTO.some(s=>u.includes(s)))return"devuelto";
  if(ESTADOS_CAMINO.some(s=>u.includes(s)))return"camino";
  if(ESTADOS_NOVEDAD.some(s=>u.includes(s)))return"novedad";
  return"otro";
};
const BarChart=({data,color=P.gold,height=90})=>{
  const max=Math.max(...data.map(d=>d.v),1);
  return(
    <div style={{width:"100%"}}>
      <div style={{display:"flex",alignItems:"flex-end",gap:3,height,paddingBottom:18}}>
        {data.map((d,i)=>{
          const pct=Math.round(d.v/max*100);
          return(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%",gap:2}}>
              {d.v>0&&<div style={{fontSize:7,color:P.mt,textAlign:"center"}}>{COP(d.v).replace("$","").replace(/\.000$/,"k")}</div>}
              <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:d.v>0?color:P.border,height:(Math.max(pct,d.v>0?4:0))+"%",transition:"height .6s"}}/>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:3}}>
        {data.map((d,i)=><div key={i} style={{flex:1,fontSize:7,color:P.mt,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.l}</div>)}
      </div>
    </div>
  );
};
const parseMetaRows=(rows)=>{
  return rows.filter(r=>r["Nombre de la campaña"]&&r["Importe gastado (COP)"]).map((r,i)=>({
    id:"meta_"+i+"_"+Date.now(),
    campana:r["Nombre de la campaña"]||"",
    fechaInicio:r["Inicio del informe"]||"",
    fechaFin:r["Fin del informe"]||todayStr(),
    inversion:parseFloat(r["Importe gastado (COP)"])||0,
    impresiones:parseFloat(r["Impresiones"])||0,
    ctr:parseFloat(r["CTR (porcentaje de clics en el enlace)"])||0,
    cpm:parseFloat(r["CPM (costo por mil impresiones) (COP)"])||0,
    compras:parseFloat(r["Compras"])||0,
    cpa:parseFloat(r["Costo por compra (COP)"])||0,
    roas:parseFloat(r["ROAS de compras"])||0,
    clics:parseFloat(r["Clics en el enlace"])||0,
    alcance:parseFloat(r["Alcance"])||0,
  }));
};
const parseDropiRows=(rows)=>{
  const stats={entregado:0,cancelado:0,devuelto:0,camino:0,novedad:0,otro:0,
    totalFacturado:0,totalGanancia:0,totalFlete:0,totalDevFlete:0,totalComision:0,
    pedidos:[],porEstado:{}};
  rows.forEach(r=>{
    const est=classifyEstado(r["ESTATUS"]||"");
    stats[est]=(stats[est]||0)+1;
    const estRaw=(r["ESTATUS"]||"").toUpperCase().trim();
    stats.porEstado[estRaw]=(stats.porEstado[estRaw]||0)+1;
    const fac=parseFloat(r["VALOR FACTURADO"])||0;
    const gan=parseFloat(r["GANANCIA"])||0;
    const fle=parseFloat(r["PRECIO FLETE"])||0;
    const dev=parseFloat(r["COSTO DEVOLUCION FLETE"])||0;
    const com=parseFloat(r["COMISION"])||0;
    if(est==="entregado"){stats.totalFacturado+=fac;stats.totalGanancia+=gan;}
    stats.totalFlete+=fle;
    stats.totalDevFlete+=dev;
    stats.totalComision+=com;
    stats.pedidos.push({
      id:r["ID"]||"",fecha:r["FECHA"]||"",cliente:r["NOMBRE CLIENTE"]||"",
      ciudad:r["CIUDAD DESTINO"]||"",estado:r["ESTATUS"]||"",
      facturado:fac,ganancia:gan,flete:fle,devFlete:dev,comision:com,
      tienda:r["TIENDA"]||"",estClass:est,
    });
  });
  const total=stats.entregado+stats.cancelado+stats.devuelto+stats.camino+stats.novedad+stats.otro;
  stats.totalPedidos=total;
  stats.efectividad=total>0?Math.round(stats.entregado/total*100):0;
  stats.tasaCancelacion=total>0?Math.round((stats.cancelado+stats.devuelto)/total*100):0;
  return stats;
};
const buildSamples=()=>[
  {id:"c1",fecha:makeFecha(2),producto:"Shampoo Anticaída Capixyl",cuenta:"Cuenta Mía 1",campana:"Shampoo — Ángulo Emocional",plataforma:"Meta Ads",pais:"Colombia",precVenta:79900,inversion:120000,ingresos:480000,ventas:6,costoDropi:108000,cpa:20000,ctr:3.2,cpm:16500,estado:"Escalando",notas:"ROAS 4x."},
  {id:"c2",fecha:makeFecha(6),producto:"Shampoo Anticaída Capixyl",cuenta:"Cuenta Mía 1",campana:"Shampoo — Testimonio Post-parto",plataforma:"Meta Ads",pais:"Colombia",precVenta:79900,inversion:80000,ingresos:239700,ventas:3,costoDropi:54000,cpa:26667,ctr:2.1,cpm:19000,estado:"Activa",notas:""},
  {id:"c3",fecha:makeFecha(9),producto:"Inflador Portátil",cuenta:"Cuenta Mía 2",campana:"Inflador — Beneficio Directo",plataforma:"Meta Ads",pais:"Colombia",precVenta:89900,inversion:95000,ingresos:269700,ventas:3,costoDropi:105000,cpa:31667,ctr:1.8,cpm:22000,estado:"Testeando",notas:"CPA alto."},
  {id:"c4",fecha:makeFecha(13),producto:"Shampoo Anticaída Capixyl",cuenta:"Cuenta Mía 1",campana:"Shampoo — Comparación",plataforma:"Meta Ads",pais:"Colombia",precVenta:79900,inversion:60000,ingresos:319600,ventas:4,costoDropi:72000,cpa:15000,ctr:4.1,cpm:14000,estado:"Escalando",notas:"CTR excelente."},
  {id:"c5",fecha:makeFecha(16),producto:"Corrector Postural",cuenta:"Cuenta Mía 2",campana:"Corrector — Dolor Espalda",plataforma:"Meta Ads",pais:"Colombia",precVenta:75000,inversion:40000,ingresos:0,ventas:0,costoDropi:0,cpa:0,ctr:0.8,cpm:28000,estado:"Pausada",notas:"CTR bajo. Pérdida: $40.000"},
  {id:"c6",fecha:makeFecha(19),producto:"Inflador Portátil",cuenta:"Cuenta Mía 2",campana:"Inflador — Demo Video",plataforma:"Meta Ads",pais:"Colombia",precVenta:89900,inversion:55000,ingresos:179800,ventas:2,costoDropi:70000,cpa:27500,ctr:2.4,cpm:20000,estado:"Activa",notas:""},
  {id:"c7",fecha:makeFecha(23),producto:"Shampoo Anticaída Capixyl",cuenta:"Cuenta Mía 1",campana:"Shampoo — Validación",plataforma:"Meta Ads",pais:"Colombia",precVenta:79900,inversion:45000,ingresos:159800,ventas:2,costoDropi:36000,cpa:22500,ctr:2.9,cpm:17500,estado:"Activa",notas:""},
];
const campsAreStale=(camps)=>{
  if(!camps||camps.length===0)return true;
  const currentMonth=nowMonthStr();
  const currentYear=String(new Date().getFullYear());
  // Si ninguna campaña es del año actual, los datos son viejos/ejemplo
  const hasCurrentYear=camps.some(c=>(c.fecha||"").startsWith(currentYear));
  return!hasCurrentYear;
};
const filtrarPeriodo=(camps,periodo,fechaUnica)=>{
  const hoy=todayStr();
  const now=new Date(hoy+"T12:00:00");
  return camps.filter(c=>{
    const f=(c.fecha||"").trim();
    if(!f)return false;
    if(periodo==="dia")return f===hoy;
    if(periodo==="fecha")return f===(fechaUnica||hoy);
    if(periodo==="7d"){
      const d=new Date(hoy+"T12:00:00");d.setDate(d.getDate()-6);
      return f>=d.toISOString().split("T")[0]&&f<=hoy;
    }
    if(periodo==="mes")return f.startsWith(nowMonthStr());
    if(periodo==="3m"){
      const d=new Date(hoy+"T12:00:00");d.setMonth(d.getMonth()-2);d.setDate(1);
      return f>=d.toISOString().split("T")[0]&&f<=hoy;
    }
    if(periodo==="anio")return f.startsWith(String(now.getFullYear()));
    return true;
  });
};
// M4 constants
const bLB=(p)=>`Eres un experto en diseño de landing pages para ecommerce COD en LATAM, especializado en productos de compra por impulso vendidos a través de Meta Ads.\n\nVoy a darte todo lo que necesitas sobre el producto. Aún no tengo definido el nombre comercial — necesito que me ayudes a definirlo antes de empezar.\n\n--- PRODUCTO ---\nNombre comercial: sin definir aún\nDescripción: ${p.descripcion||"[qué es, para qué sirve, qué problema resuelve]"}\nPrecio antes: ${p.precioAntes||"[$ precio tachado]"}\nPrecio ahora: ${p.precioAhora||"[$ precio actual]"}\n\n--- MERCADO ---\nPaís(es) de venta: ${p.pais||"Colombia"}\nTono de comunicación: directo, confiable, sin exageración\n\n--- NECESITO QUE ANTES DE EMPEZAR ME DES ---\n1. 3 opciones de nombre brandeable para el producto\n   (cortos, memorables, en español, que suenen a marca, no a descripción)\n\n2. La paleta de colores que tú consideres mejor para este producto.\n   Decídela basándote en lo que el producto transmite visualmente. Reglas:\n   - Máximo 3 colores\n   - Fondo neutro o que complemente el producto sin competirle\n   - Los colores deben nacer del producto, no de tendencias genéricas\n   - Sin combinaciones saturadas ni que parezcan oferta de bazar\n   - Sin degradados recargados\n   - Que transmita marca seria, no promoción agresiva\n\nLa landing es un brandeo — habla del producto de forma general, sin enfocarla en un perfil de comprador específico. El ángulo y el público se van descubriendo en el testeo con pauta.\n\nYo te confirmo el nombre que me gusta, y luego arrancamos con el hero.\n\n--- REGLAS QUE SIEMPRE APLICAN ---\n- Máximo 3 colores en toda la landing\n- Sin párrafos largos ni bloques de texto denso\n- Sin íconos decorativos innecesarios\n- Sin fondos degradados recargados\n- Los botones de compra se configuran en la plataforma — no los incluyas en los diseños\n- Trabajaremos bloque por bloque — espera mi aprobación antes de continuar\n\n¿Entendido? Preséntame las opciones.`;
const bHero=(p,w,h)=>`Ahora crea el HERO de la landing. Dimensiones: ${w||"1080"} x ${h||"1400"} px.\n\nDebe tener en este orden:\n1. Nombre del producto — grande, que sea lo más visible\n2. Gancho — frase corta que genere deseo (máximo 10 palabras)\n3. Producto imponente como foco visual principal — usa estrictamente la foto del producto que te compartí\n4. Beneficios clave — máximo 3, cortos, solo si no satura\n5. Precio de antes tachado + precio de ahora destacado abajo\n\nProducto: ${p.nombre}\nPrecio antes: ${p.precioAntes}\nPrecio ahora: ${p.precioAhora}\nPaleta: ${p.paleta||"[paleta definida en el briefing]"}\n\nQue sea limpio y profesional, que inspire confianza y marca. Sin saturación de colores ni elementos innecesarios. Sin botón de compra.\nFormato vertical, mobile first. Imágenes hiperrealistas.\n\nCuando lo apruebe seguimos con el siguiente bloque.`;
const bBen=(p)=>`Ahora la sección de BENEFICIOS para ${p.nombre}.\n\nDame entre 3 y 5 beneficios del producto. Cada uno debe tener:\n- Un ícono simple sugerido (describe con palabras, ej: "ícono de reloj")\n- Una frase de máximo 6 palabras (el titular del beneficio)\n- Una línea de apoyo de máximo 12 palabras (opcional, solo si suma)\n\nLenguaje orientado al resultado del producto. Sin párrafos. Sin adjetivos vacíos.\nConvierte características en beneficios: "500 diodos" → "alumbra más que una linterna normal".\n\nCuando lo apruebe seguimos.`;
const bCar=(p)=>`Ahora la sección de CARACTERÍSTICAS de ${p.nombre}.\n\nLista las especificaciones más relevantes del producto de forma visual:\n- Ícono sugerido + dato concreto (ej: "⚡ 1500W", "🍳 8 mini sartenes incluidas")\n- Sin párrafos ni explicaciones largas — solo el dato que impacta\n\nEsta sección es técnica pero debe verse limpia, no como un manual.\n\nCuando lo apruebe seguimos.`;
const bTab=(p,comp)=>`Ahora la TABLA COMPARATIVA de ${p.nombre}.\n\nVoy a decirte contra qué comparar:\n${comp||'[escribe aquí tu propuesta, ej: compáralo con una parrilla a carbón o compara tener vs no tener el producto]'}\n\nArma la tabla con las columnas y filas necesarias para mostrar las diferencias más relevantes. Nuestro producto debe ganar en todos los puntos. Usa ✓ y ✗ o equivalentes visuales simples. Sin texto explicativo adicional — la tabla habla sola.\n\nCuando lo apruebe seguimos.`;
const bTest=(p)=>`Ahora la sección de TESTIMONIOS de ${p.nombre}.\n\nDame 3 testimonios creíbles y específicos para este producto. Cada uno con:\n- Nombre completo (inventado pero real, acorde al país de venta: ${p.pais||"Colombia"})\n- Ciudad y país\n- Testimonio de máximo 3 líneas: menciona el problema que tenía, cómo el producto lo solucionó y el resultado concreto\n- Indicación de dónde va la foto del comprador (foto hiperrealista, persona real, NO piel lisa, imagen casera)\n\nSin lenguaje exagerado — que suene a persona real.\nBuyer persona: ${p.buyerPersona||"—"}\n\nCuando lo apruebe seguimos.`;
const bFAQ=(p)=>`Ahora las PREGUNTAS FRECUENTES de ${p.nombre}.\n\nDame entre 5 y 8 preguntas. Mezcla los dos tipos:\n- Objeciones de compra: envío, garantía, si vale el precio, si llega en buen estado\n- Dudas técnicas reales: cómo se usa, qué incluye, compatibilidad, mantenimiento\n- Objeciones emocionales: "¿realmente funciona?", "¿no es otro producto chino que dura 2 días?"\n\nCada respuesta: máximo 2 líneas. Directas, sin rodeos.\n\nCuando lo apruebe seguimos.`;
const bTrustoo=(p)=>`Necesito que me generes reseñas para subir a Trustoo para el siguiente producto: ${p.nombre}\n\nDame exactamente 20 reseñas en este formato:\n- 17 reseñas de 5 estrellas\n- 3 reseñas de 4 estrellas\n(Esto da una calificación promedio de 4.85 ⭐)\n\nCada reseña debe tener:\n- Nombre y apellido colombiano (reales, variados, que suenen naturales)\n- Comentario en español coloquial colombiano\n- Sin signos de puntuación\n- Sin mayúsculas al inicio de cada frase\n- Sin lenguaje de marketing ni frases perfectas — que suene a persona real escribiendo desde el celular\n- Que mencione algo específico del producto: cómo lo usa, dónde lo usa, qué resultado tuvo\n- Foto sugerida: hiperrealista, NO piel lisa, imagen casera y humana del día a día, solo nombre y apellido\n\nPara las 3 reseñas de 4 estrellas:\n- El producto siempre queda bien — nunca se critica\n- La razón de no dar 5 estrellas es siempre un factor externo:\n  la transportadora demoró más de lo esperado, el repartidor no avisó que había llegado, la caja llegó un poco golpeada pero el producto en perfecto estado\n- El comentario igual termina satisfecho con el producto en sí\n\nNo pongas "5 estrellas" ni "4 estrellas" como texto — solo el nombre y el comentario.`;
const bGIF=(p,tipo)=>`Ahora necesito el PROMPT para generar el GIF ${tipo==="problema"?"de PROBLEMA → SOLUCIÓN":"de MODO DE USO"} de ${p.nombre}.\n\nDuración: 3 a 5 segundos máximo.\n\nDame el prompt completo listo para pegar en ChatGPT/Sora/Runway:\n1. CONCEPTO: ${tipo==="problema"?"Mostrar el dolor antes del producto → transformación con el producto":"Mostrar el producto siendo usado de forma práctica y cotidiana"}\n2. SECUENCIA frame a frame (2-3 frames)\n3. ESTILO: hiperrealista, cotidiano, NO stock, personas reales\n4. TEXTO ANIMADO que aparece (si aplica) — complementa, no describe\n5. OBJETIVO EMOCIONAL del gif\n6. ESPECIFICACIONES: formato, resolución, loop\n\nBuyer persona: ${p.buyerPersona||"—"}\nPaleta: ${p.paleta||"[paleta de la landing]"}`;
const bPPBrief=(p)=>`Este es mi prompt para configurar el contexto de product page. No generes nada todavía — confirma que entendiste y espera.\n\nPRODUCTO: ${p.nombre}\nDESCRIPCIÓN: ${p.descripcion||"—"}\nPROBLEMA QUE RESUELVE: ${p.problema||"—"}\nBUYER PERSONA: ${p.buyerPersona||"—"}\nPRECIO: ${p.precioAhora||"—"} COP\nPALETA (máx 3 colores): ${p.paleta||"[definir]"}\nPAÍS: ${p.pais||"Colombia"}\n\nREGLAS:\n- Máximo 3 colores\n- Mobile first, formato vertical\n- Imágenes 1080x1080\n- El primer botón de compra SIEMPRE visible en la primera captura\n- Imágenes hiperrealistas, NO de stock, NO piel lisa\n- Bloque por bloque — espera mi aprobación antes de continuar\n\n¿Entendido? Confirma y espera.`;
const bSlide=(p,n,tipo,inst)=>`Ahora el SLIDE ${n} — ${tipo} de ${p.nombre}.\n\nFormato: 1080x1080 px\nPaleta: ${p.paleta||"[paleta definida]"}\nPaís: ${p.pais||"Colombia"}\n\n${inst}\n\nUsa estrictamente las fotos del producto que te compartí. Hiperrealista, no de stock.\nCuando lo apruebe seguimos.`;
const bPPNombre=(p)=>`Genera el NOMBRE para el listing del producto.\n\nProducto: ${p.nombre}\nProblema que resuelve: ${p.problema||"—"}\nBuyer persona: ${p.buyerPersona||"—"}\n\nFormato: [Nombre del producto]® - [Necesidad que soluciona] y [resultado esperado]\nEjemplo: "Shampoo Nombre® - Elimina la caída del cabello y activa su crecimiento natural y abundante"\n\nDame 5 opciones. El nombre debe:\n- Sonar a marca real\n- Atacar directamente el problema: ${p.problema||"—"}\n- Ser memorable y fácil de pronunciar`;
const bPPTitulos=(p)=>`Genera los 3 TÍTULOS PRINCIPALES para la product page de ${p.nombre}.\n\nBuyer persona: ${p.buyerPersona||"—"}\nProblema central: ${p.problema||"—"}\n\nTÍTULO 1 — Punto de dolor directo:\nEjemplo: "La caída del cabello no tiene porque ser motivo de vergüenza"\nDame 3 opciones.\n\nTÍTULO 2 — Urgencia (esperar empeora):\nEjemplo: "La caída del cabello no se va de la noche a la mañana; esperar solo empeora"\nDame 3 opciones.\n\nTÍTULO 3 — Validación social con número:\nEjemplo: "Más de 1.899 personas en Colombia han eliminado la caída del cabello y han logrado que vuelva a crecer de manera natural y abundante"\nDame 3 opciones.`;
const bPPBenPct=(p)=>`Genera los BENEFICIOS CON PORCENTAJES para ${p.nombre}.\n\nFormato:\n"Deja de [problema relacionado]. Es hora de hacer un cambio de una vez por todas;\n[X]% Han notado [resultado específico desde la primera/segunda semana]\n[X]% Notaron desde la primera [aplicación/uso] que [resultado concreto]\n[X]% Aseguran que hoy [beneficio emocional o social visible]"\n\nBuyer persona: ${p.buyerPersona||"—"}\nProblema: ${p.problema||"—"}\n\nLos porcentajes entre 94% y 98%. Que cada frase toque un punto de dolor diferente.\nSé crudo, fuerte y muy directo.`;
const bPPTabla=(p)=>`Genera la TABLA COMPARATIVA para la product page de ${p.nombre}.\n\nFormato: ${p.nombre} vs. otras opciones del mercado\nMáximo 10 comparaciones de máximo 2 palabras cada una.\nEjemplo: "Crecimiento capilar", "Elimina la caída", "Fórmula potente"\n\nNuestro producto gana en todos los puntos.\nUsa ✓ para nuestro producto y ✗ para la competencia.\nDiseño limpio y legible en móvil.`;
const bPPAfirm=(p)=>`Dame para ${p.nombre}:\n\n1. Una lista de AFIRMACIONES directas y crudas atacando el punto de dolor:\n   Ejemplo: "Cada día que esperas, tu cabello se debilita más. No es genética — es falta de acción."\n   Dame mínimo 8 afirmaciones.\n\n2. Una lista de PREGUNTAS tipo "¿Sabías que...?":\n   Ejemplo: "¿Sabías que más del 73% de mujeres en Colombia sufren caída del cabello antes de los 40?"\n   Dame mínimo 6 preguntas con estadísticas creíbles.\n\n3. DATOS CURIOSOS que destaquen el problema y presenten el producto como solución definitiva.\n   Dame mínimo 5 datos.\n\nTodo debe destacar ${p.nombre} como la solución definitiva.\nBuyer persona: ${p.buyerPersona||"—"}\nProblema: ${p.problema||"—"}`;
const bPPRes=(p)=>`Dame 40 RESEÑAS con jerga colombiana para ${p.nombre}.\n\nCada reseña:\n- Nombre y apellido colombiano (solo nombre y apellido)\n- Corta (2-3 líneas máximo)\n- Toque puntos de dolor reales y soluciones concretas\n- Suene humana, del día a día\n- En español coloquial colombiano\n- Foto sugerida: hiperrealista, casera, NO modelo, NO piel lisa, imagen real\n\nDistribución:\n- 32 de ⭐⭐⭐⭐⭐\n- 5 de ⭐⭐⭐⭐ (queja SIEMPRE a la transportadora, NUNCA al producto)\n- 3 de ⭐⭐⭐ (neutras, algo menor, producto bien)\n\nBuyer persona: ${p.buyerPersona||"—"}`;
const bPPEbook=(p)=>`Genera el contenido completo del eBOOK de regalo para ${p.nombre}.\n\nTítulo: "Recibe gratis [título relacionado al problema] al completar tu compra. Recibirás el eBook junto con el producto."\n\nEstructura:\n1. Portada (título llamativo + subtítulo)\n2. Índice\n3. Introducción\n4. Mínimo 5 capítulos con rutinas, tips y explicaciones detalladas\n5. Conclusión\n6. CTA final al producto\n\nTono: cercano, amigable, como un amigo experto\nMercado: colombiano — ejemplos y referencias locales\nExtensión: completo, sin resúmenes\nBuyer persona: ${p.buyerPersona||"—"}\n\nAl final di "ESO FUE TODO" para generar el HTML del eBook.`;
const bCrInvest=(p,ang)=>`INVESTIGACIÓN PREVIA — ${p.nombre}\n\nAntes de proponer cualquier ángulo, investiga activamente:\n1. Reseñas negativas (1-2 estrellas) de Amazon del problema "${p.problema||"—"}" — qué dice la gente que NO funcionó\n2. Comentarios en TikTok de productos similares — lenguaje real del comprador\n3. Meta Ads Library Colombia — qué ángulos ya están corriendo\n4. Extrae los puntos de dolor específicos del día a día real\n\nLuego pregunta obligatoriamente:\n"¿Tienes ángulos o hooks que ya están corriendo en Meta Ads Library — ya sea para este producto o para productos similares de la competencia? Pégalos aquí para que los nuevos ángulos se diferencien de lo que ya existe en el mercado."\n\nProducto: ${p.nombre}\nBuyer persona: ${p.buyerPersona||"—"}\nProblema central: ${p.problema||"—"}\nÁngulos que quiero trabajar: ${ang||"Beneficio, Testimonio, Emocional, Comparación, Validación"}`;
const bCrAng=(p,ang)=>`Eres un experto en publicidad digital de respuesta directa para Meta Ads 2026, especializado en e-commerce. Tu misión es generar guiones de video de alta conversión. La meta de un creativo no es verse profesional. La meta es vender.\n\nAntes de proponer ángulos nuevos, pregunta:\n"¿Tienes ángulos o hooks que ya están corriendo en Meta Ads Library? Pégalos aquí para diferenciarlos."\n\nLuego, por cada uno de estos ángulos, dame 5 HOOKS AGRESIVOS que paren el scroll:\n${ang||"1. Beneficio específico\n2. Testimonio\n3. Emocional\n4. Comparación\n5. Validación"}\n\nReglas de los hooks:\n- Máximo 8 palabras\n- Tocan el punto de dolor del día a día real\n- Directos, sin rodeos, sin adjetivos vacíos\n- Generan: curiosidad, impacto, identificación, sorpresa o intriga\n- En español latinoamericano neutro\n\nClasifica cada ángulo en: Beneficio específico / Testimonio / Emocional / Comparación / Validación\n\nProducto: ${p.nombre}\nBuyer persona: ${p.buyerPersona||"—"}\nProblema: ${p.problema||"—"}`;
const bGuionUGC=(p,hook,ang)=>`Eres un experto en publicidad digital de respuesta directa para Meta Ads 2026, especializado en e-commerce colombiano. Método AIDA, CTR objetivo superior al 5%.\n\nPRODUCTO: ${p.nombre}\nDESCRIPCIÓN: ${p.descripcion||"—"}\nBUYER PERSONA: ${p.buyerPersona||"—"}\nPROBLEMA: ${p.problema||"—"}\nÁNGULO: ${ang||"[ángulo elegido]"}\nHOOK: "${hook||"[hook elegido]"}"\nFORMATO: UGC — persona hablando a cámara\n\nGUIÓN COMPLETO — ESTRUCTURA AIDA POR FASES:\n\nFASE 1 — SCROLLSTOPPER (2-3s) — ATENCIÓN\nHook: ${hook||"[hook elegido]"}\nEscena cinematográfica: [descripción específica, ej: "Mujer mirándose al espejo, expresión de frustración al ver cabello cayendo"]\nTexto pantalla: [complementa, NO repite la voz]\n\nFASE 2 — PRESENTACIÓN PRODUCTO (2-3s) — INTERÉS\nVoz: [qué es y qué hace — rápido y claro]\nEscena: [producto claramente visible, close-up real]\nTexto pantalla: [nombre del producto o beneficio principal]\n\nFASE 3 — CARACTERÍSTICAS + BENEFICIOS (6-8s) — DESEO\nVoz: [2-3 beneficios reales. "500 diodos" → "alumbra más"]\nEscenas: [3 tomas dinámicas de uso real, cortes rápidos]\nTexto pantalla: [porcentajes, datos o diferenciadores]\n\nFASE 4 — MODO DE USO + ESPECIFICACIONES (10-12s) — DESEO\nVoz: [cómo se usa, qué incluye, contexto cotidiano]\nEscenas: [manos usando el producto, cotidiano, demostración real]\nTexto pantalla: [pasos numerados o specs clave]\n\nFASE 5 — CTA (2-4s) — ACCIÓN\nVoz: [urgencia real + una sola acción. Máximo 2 frases]\nTexto pantalla: "PÍDELO HOY · PAGA AL RECIBIR · ENVÍO GRATIS"\n\nPALABRAS PROHIBIDAS: cansado/a, fácil/fácilmente, sin complicaciones, en segundos/en minutos, tirante (piel), piel opaca/apagada, revolucionario, innovador, único en el mercado, increíble, espectacular, extraordinario, básicamente, literalmente, de hecho, en términos de, súper [adjetivo], el mejor/la mejor solución, transforma tu vida, transforma tu [parte del cuerpo], sin esfuerzo, resultados garantizados, descúbrelo, conócelo\n\nPOLÍTICAS META ADS 2026: sin afirmaciones médicas absolutas. Usar: "ayuda a", "diseñado para", "puede contribuir a", "se siente", "con uso constante".\n\nAl final entrega el BLOQUE DE VOZ EN OFF completo con tags ElevenLabs v3 listos para pegar. Cada tag justificado. Tags distintos en cada guión.`;
const bGuionVOZ=(p,hook,ang)=>`Eres un experto en publicidad digital de respuesta directa para Meta Ads 2026. Método AIDA, CTR objetivo superior al 5%.\n\nPRODUCTO: ${p.nombre}\nDESCRIPCIÓN: ${p.descripcion||"—"}\nBUYER PERSONA: ${p.buyerPersona||"—"}\nÁNGULO: ${ang||"[ángulo elegido]"}\nHOOK: "${hook||"[hook elegido]"}"\nFORMATO: Voz en off + imágenes/clips del producto\n\nGUIÓN COMPLETO — ESTRUCTURA AIDA POR FASES:\n\nFASE 1 — SCROLLSTOPPER (2-3s) — ATENCIÓN\nVoz off: ${hook||"[hook elegido]"}\nVisual: [escena que muestra el problema sin narración — impacto inmediato]\nTexto pantalla: [impacto visual, sin repetir la voz, máx 6 palabras]\n\nFASE 2 — PRESENTACIÓN PRODUCTO (2-3s) — INTERÉS\nVoz off: [qué es y qué hace — genera interés inmediato]\nVisual: [producto de cerca, siendo usado]\nTexto pantalla: [nombre del producto]\n\nFASE 3 — CARACTERÍSTICAS + OFERTA (6-8s) — DESEO\nVoz off: [2-3 beneficios reales, convertidos de características]\nVisuales: [3 tomas dinámicas de uso real]\nTexto pantalla: [datos, porcentajes, diferenciadores]\n\nFASE 4 — ESPECIFICACIONES + MODO DE USO (10-12s) — DESEO\nVoz off: [cómo se usa, qué incluye, contexto de uso real]\nVisuales: [demostración práctica, manos, cotidiano]\nTexto pantalla: [pasos numerados o specs]\n\nFASE 5 — CTA (2-4s) — ACCIÓN\nVoz off: [urgencia real + una sola instrucción]\nVisual: [producto + precio]\nTexto pantalla: "ORDÉNALO HOY · PAGO CONTRA ENTREGA"\n\nPALABRAS PROHIBIDAS: cansado/a, fácil, en segundos, tirante (piel), piel opaca/apagada, revolucionario, increíble, espectacular, súper [adjetivo], el mejor, transforma tu vida, sin esfuerzo, resultados garantizados, básicamente, literalmente\n\nAl final entrega el BLOQUE DE VOZ EN OFF completo con tags ElevenLabs v3.\nBuyer persona: ${p.buyerPersona||"—"}`;
const bCopy=(p,ang)=>`Eres un experto en copy de respuesta directa para Meta Ads 2026, especializado en e-commerce colombiano (Shopify / WooCommerce). Tu trabajo es escribir copy text de anuncios pagados que generen clics. No expliques teoría. Ve directo al output en texto plano.\n\nPASO 1 — ANALIZA EL PRODUCTO ANTES DE ESCRIBIR:\n1. Lee la descripción completa del producto\n2. Define el problema central que el producto resuelve\n3. Define el perfil del comprador: quién es, qué siente, qué busca, qué lo frena\n4. Extrae mínimo 3 puntos de dolor reales — estos serán los ganchos\n\nPRODUCTO: ${p.nombre}\nDESCRIPCIÓN: ${p.descripcion||"—"}\nBUYER PERSONA: ${p.buyerPersona||"—"}\nPROBLEMA: ${p.problema||"—"}\nPRECIO: ${p.precioAhora||"—"} COP\nMERCADO: ${p.pais||"Colombia"} COD Meta Ads\nÁNGULOS: ${ang||"Beneficio, Testimonio, Emocional, Comparación, Validación"}\n\nPor cada ángulo genera:\n\nCOPY NORMAL (máx 6 líneas):\nHEADLINE: máx 8 palabras. Funciona solo. Pregunta, promesa concreta o dolor. NUNCA empieza con el nombre del producto.\nCUERPO: primera línea toca dolor diferente al headline. Desarrolla. Transición al CTA.\nCTA: accionable + urgencia real. Nunca solo "Haz clic aquí".\nEjemplos CTA válidos: "Entra a la tienda y pídelo hoy.", "Link en el anuncio. Stock limitado.", "Visita la tienda y elige el tuyo antes de que se agote."\n\nCOPY TIPO F (máx 6 líneas, escaneable):\nHEADLINE: máx 8 palabras\nGANCHO: primera línea desde otro ángulo del mismo dolor\n3 BULLETS con — (máx 7 palabras cada uno)\nCTA: accionable + urgencia real\n\nREGLAS:\n- Español colombiano estándar. Cercano y claro, sin tecnicismos\n- Sin muletillas: básicamente, literalmente, o sea, de hecho, súper, increíble, revolucionario, sin duda alguna, claramente, en términos de\n- Sin superlativos vacíos sin respaldo\n- Que suene a persona real, no a marca describiéndose\n- Sin afirmaciones médicas absolutas\n- Cumplir políticas Meta Ads 2026`;
const bMinBrief=(p)=>`Actúa como AI Graphic Designer especializado en miniaturas creativas para Meta Ads Colombia 2026, con enfoque en alto CTR, ecommerce COD, respuesta directa, scroll-stopping design y conversión.\n\nTu tarea es crear miniaturas publicitarias verticales 1080x1920 para ${p.nombre}.\n\nDebes usar exclusivamente el contexto ya construido sobre el producto: dolores, beneficios, mecanismo, cliente ideal, tono, promesa, empaque, colores, estética visual, oferta y ángulos de venta.\n\nProducto: ${p.nombre}\nDescripción: ${p.descripcion||"—"}\nProblema: ${p.problema||"—"}\nBuyer persona: ${p.buyerPersona||"—"}\nPaleta: ${p.paleta||"[paleta definida]"}\n\nFLUJO OBLIGATORIO:\nAntes de diseñar cualquier miniatura, pídeme siempre:\n"Pásame los 5 ángulos que quieres convertir en miniaturas."\n\nSiempre 5 ángulos = 5 miniaturas = 1 miniatura independiente por ángulo.\nCada miniatura: un solo dolor + una sola idea + una sola promesa visual.\n\nREGLA PRINCIPAL: Problema → Solución → CTA (en menos de 2 segundos)\n\n¿Entendido? Pide los 5 ángulos.`;
const bMin=(p,n,ang,comp)=>`MINIATURA ${n} de 5 — ${p.nombre}\n\nÁngulo: ${ang}\nComposición: ${comp}\nFormato: 1080x1920 vertical\nPaleta: ${p.paleta||"[paleta del producto]"}\n\nLa miniatura debe comunicar en menos de 2 segundos:\n1. El problema: "${p.problema||"—"}"\n2. El producto como solución\n3. CTA claro\n\nMODELO: Genera una persona DIFERENTE a las demás miniaturas.\n- ${(p.buyerPersona||"").toLowerCase().includes("mujer")||!(p.buyerPersona||"").toLowerCase().includes("hombre")?"Mujer latina/colombiana":"Hombre latino/colombiano"}, hiperrealista, natural\n- NO modelo de stock, NO piel plástica, NO poses artificiales\n- Perfil latino, creíble, look comercial premium\n- Expresión real según el ángulo\n\nPRODUCTO: presente, nítido, fiel a las fotos reales, grande y reconocible.\n\nTEXTO EN IMAGEN:\n- Headline: máx 8 palabras (dolor o resultado)\n- Elemento de confianza (badge, porcentaje o dato)\n- CTA: "COMPRAR AHORA" o "PEDIR AHORA"\n\nCOMPOSICIÓN: ${comp}\n\nQue se vea como top performer de Meta Ads, no como plantilla genérica.`;
const bUGC=(p)=>`MODELOS UGC HIPERREALISTAS — ${p.nombre}\n\nPASO 1 — En Gemini (adjunta foto de Pinterest antes):\nBusca en Pinterest: "${(p.buyerPersona||"").toLowerCase().includes("mujer")?"mujer colombiana real":"hombre colombiano real"}" — fotos reales, no perfectas.\n\nMensaje para Gemini:\n"Eres un experto en la creación de prompts para modelos ${(p.buyerPersona||"").toLowerCase().includes("mujer")?"MUJER":"HOMBRE"} UGC HIPERREALISTA.\nYo te voy a compartir un ejemplo de modelo (FORMATO FOTO) y quiero que analices por completo todas sus facciones, color de piel, imperfecciones, cabello color, tipo de cabello, ojos, entendido?\nY de ahí partes para darme 3 json prompts con las mismas facciones, UGC HIPERREALISTA, parecida a la que te comparto.\nLOS PROMPTS ME LOS DAS EN CÓDIGO.\nDame los 3 Json prompts UGC HIPERREALISTAS LLENO DE ESTÍMULOS VISUALES"\n\nPASO 2 — En Flow (adjunta imagen del modelo generado + fotos del producto):\n"UGC, CREA UNA IMAGEN CON ESTA ${(p.buyerPersona||"").toLowerCase().includes("mujer")?"MUJER":"PERSONA"} CON ${p.nombre} EN LA MANO, PARA ENSEÑARLO A CÁMARA, DE FRENTE A CÁMARA.\nEL SOL EMPIEZA A BAJAR, ESTÁ EN SU HABITACIÓN.\nFONDO — CONTEXTO MINIMALISTA BONITO.\nES UN ENTORNO VIBRANTE LLENO DE ESTÍMULOS VISUALES.\nUGC HIPERREALISTA.\nPLANO CERCA — 35mm\n- Ligero motion blur\n- Partículas de polvo en el aire\n- Capturada con Sony Venice, Cooke S4, 84mm\n- UGC"`;
const bAnalisis=(p)=>`ANÁLISIS ESTRATÉGICO DE PRODUCTO — BITÁCORA PRO\nAnalista mundial de problemáticas para Ecommerce COD en Colombia vía Meta Ads.\n\nPRODUCTO: ${p.nombre}\nDESCRIPCIÓN: ${p.descripcion||"—"}\nPROBLEMA QUE RESUELVE: ${p.problema||"—"}\nBUYER PERSONA: ${p.buyerPersona||"—"}\nPRECIO PROVEEDOR: ${p.precioProveedor ? Number(p.precioProveedor).toLocaleString("es-CO")+" COP" : "—"}\nVALOR DE VENTA: ${p.precioAhora||"—"}\n\nFilosofía: No existen productos ganadores por sí solos. Existen problemáticas fuertes, mecanismos bien comunicados, creativos potentes, landing persuasiva y oferta adecuada para COD Colombia.\n\nEjecuta el análisis completo en este orden:\n1. Resumen ejecutivo + Veredicto rápido\n2. Qué es / qué hace / cómo funciona / para qué sirve\n3. Investigación profunda de ingredientes o componentes\n4. Problema real y dolor profundo\n5. Buyer Persona completo (qué siente, qué problema tiene, qué desea, por qué compraría, qué lo frena, cómo toma decisiones, qué contenido consume)\n6. Competencia en Meta Ads Library Colombia\n7. Mercado Libre Colombia\n8. Amazon USA + reviews negativas como oportunidades\n9. Vehículos de solución comparados\n10. Diferenciadores reales + gaps del mercado\n11. Naming del producto (mínimo 15 nombres clasificados)\n12. Ángulos de venta Meta Ads (mínimo 12, clasificados)\n13. Oferta recomendada COD Colombia (x1/x2/x3, garantía, bonus, upsell)\n14. Potencial creativo Meta Ads (score por capas)\n15. Claims permitidos, riesgosos y prohibidos\n16. Score de viabilidad /100 con razonamiento brutal por dimensión\n17. Alertas y riesgos (3 a 7 riesgos concretos)\n18. Recomendación estratégica final\n19. Próximos pasos\n\nREGLAS: Investiga antes de concluir. No infles scores. Sé directo. Sin emojis. Si algo no se puede confirmar escribe "No visible".\n\nAl final di "ESO FUE TODO" para recibir el HTML profesional del análisis.`;
const bComp=(p)=>`COMPETITOR ANALYZER — ${p.nombre}\nAnálisis de Mercado Inmersivo COD Colombia\n\nInvestiga activamente — no asumas, extrae datos reales.\n\nPRODUCTO / PROBLEMÁTICA: ${p.nombre} — "${p.problema||"—"}"\nPAÍS: ${p.pais||"Colombia"}\n\nPLATAFORMAS A INVESTIGAR EN ORDEN:\n1. META ADS LIBRARY — Colombia (principal)\n   Busca por problemática, NO por nombre del producto.\n   Para cada anunciante: copy visible, # ads activos, fecha de inicio, landing URL.\n   Señales de escalado: 50+ ads + 3+ meses = ganador confirmado.\n\n2. LANDINGS DE COMPETIDORES\n   Extrae: precio, oferta, garantía, bonos, urgencia, mecanismo narrativo, COD.\n\n3. MERCADO LIBRE COLOMBIA\n   Resultados totales, rango de precios, vendedores dominantes, demanda orgánica.\n\n4. AMAZON USA\n   Top 5 por ventas, # reseñas, quejas negativas (1-2 estrellas = oportunidades).\n\n5. TIKTOK (referencia secundaria)\n\nENTREGA:\n• Pulso del mercado (3 líneas)\n• Análisis por competidor con copy/hook exacto, mecanismo, oferta, por qué funciona\n• Gap de oportunidad: qué nadie está haciendo bien en COL\n• Oferta sugerida (precio, bundle, garantía, bonus, urgencia)\n• 3 hooks concretos para Meta Ads COL\n\nREGLA: Navegar primero, analizar después. Copias textuales. Nunca inventar datos.`;
const bCRO=(p)=>`ANÁLISIS CRO LANDING PAGE — ${p.nombre}\nActúa como experto en CRO y UX especializado en e-commerce COD para Colombia con tráfico desde Meta Ads.\n\nAnaliza la landing page en modo móvil (viewport 390px, iPhone) con foco en conversión COD.\n\nRevisa y reporta sobre CADA uno de estos puntos:\n\nVELOCIDAD Y CARGA\n- ¿Hay imágenes con resolución excesiva para móvil? (ej: width=3840 en celular)\n- ¿Hay imágenes en formato .avif? (no compatible Android 8/9)\n- ¿Hay recursos externos (ImgBB, imgur, etc.) fuera del CDN principal?\n\nESTRUCTURA DEL FOLD (lo que se ve sin hacer scroll)\n- ¿El botón de compra está visible sin scroll en móvil?\n- ¿Hay sticky CTA bar?\n- ¿El titular cierra la idea o queda inconcluso?\n- ¿El precio y las opciones de bundle están claros?\n\nCONFIANZA Y PRUEBA SOCIAL\n- ¿Las reseñas tienen foto real o solo iniciales?\n- ¿Los números (reseñas, compradores) son consistentes entre sí?\n- ¿Hay estadísticas con fuente visible?\n- ¿La garantía está explicada en detalle cerca del botón de compra?\n- ¿El email de contacto es corporativo o Gmail/Hotmail?\n\nIMAGENES Y MEDIOS\n- ¿El carousel tiene más de 1 imagen?\n- ¿Hay GIF o video de demostración del producto?\n- ¿Las imágenes del cuerpo son relevantes para cada sección?\n- ¿Alguna imagen aparece duplicada?\n\nOFERTA Y CONVERSIÓN\n- ¿Hay opciones de bundle (X1/X2/X3)?\n- ¿Hay urgencia falsa?\n- ¿El botón de compra está en el idioma correcto?\n\nCONTENIDO Y COPY\n- ¿Hay secciones repetidas con el mismo texto?\n- ¿Hay una sección visual de modo de uso?\n- ¿La tabla comparativa está completamente llena?\n- ¿"Powered by Shopify" está visible en el footer?\n\nPara cada problema:\n1. QUÉ está mal (para alguien sin conocimiento técnico)\n2. QUÉ debo hacer para arreglarlo, paso a paso\n3. Prioridad: 🔴 Crítico → 🟠 Alto → 🔵 Oportunidad\n\nEL LINK ES: [PEGAR LINK AQUÍ]`;
// M5 constants
const CAT_GASTOS=["Plataforma","Infraestructura","Herramientas IA","Freelancers","Publicidad","Logística","Otro"];
const TIPOS_APREND=["Creativo","Campaña","Producto","Landing","Operación","Proveedor","Otro"];
const ESTADOS_TIENDA=["Activa","Pausada","En construcción","Archivada"];
const SECCIONES_ADMIN=["Planner","Productos","Trafficker","Creativos","Tiendas","Métricas","Herramientas"];
const bLA=(p,ang)=>`Eres un experto en diseño de landing pages para ecommerce COD en LATAM, especializado en productos de compra por impulso vendidos a través de Meta Ads.\n\nVoy a darte todo lo que necesitas sobre el producto antes de que empieces a trabajar. No generes nada todavía — solo confirma que entendiste y espera mi instrucción.\n\n--- PRODUCTO ---\nNombre comercial (si ya lo tienes): ${p.nombre||"sin definir aún"}\nDescripción: ${p.descripcion||"[qué es, para qué sirve, qué problema resuelve]"}\nPrecio antes: ${p.precioAntes||"[$ precio tachado]"}\nPrecio ahora: ${p.precioAhora||"[$ precio actual]"}\n\n--- AUDIENCIA ---\nPúblico objetivo: ${p.buyerPersona||"[ej: mujeres 30-55 / sin definir, en testeo]"}\nÁngulo de venta principal: ${p.anguloPpal||ang?.split("\n")[0]||"[ej: comodidad / ahorro / status / sin definir aún]"}\nPaís(es) de venta: ${p.pais||"Colombia"}\n\n--- ESTILO VISUAL ---\nColores: ${p.paleta||'[color fondo / color marca / color botón CTA — o sin definir]'}\nTono de comunicación: directo, confiable, sin exageración ni lenguaje de mercado\nReferencia de estilo: páginas limpias, profesionales, sin saturación visual\n\n--- REGLAS QUE SIEMPRE APLICAN ---\n- Máximo 3 colores en toda la landing\n- Sin párrafos largos ni bloques de texto denso\n- Sin íconos decorativos innecesarios\n- Sin fondos degradados recargados\n- Los botones de compra se configuran en la plataforma — no los incluyas en los diseños\n- Trabajaremos bloque por bloque — espera mi aprobación antes de continuar al siguiente\n\n¿Entendido? Confirma y espera.`;

const FLETES={Colombia:20000,Mexico:180,Ecuador:7,Espana:5,Chile:6500,Peru:15};
const calcCosteo=(v)=>{const prec=+(v.precProv||0),flete=FLETES[v.pais||"Colombia"]||20000;const fleteD=flete/(+(v.efectividad||0.75));const cpa=prec*(+(v.pctCpa||0.2));const total=prec+fleteD+cpa+(+(v.costoAdmin||0));const pv=+(v.pvManual||0);const util=pv-total;const pctUtil=pv>0?util/pv:0;return{prec,fleteD,cpa,total,pv,util,pctUtil,cpaBreak:pv>0?pv-prec-fleteD:0,pv2:pv*2*0.8,util2:pv*2*0.8*2-total*2,pv3:pv*3*0.7,util3:pv*3*0.7*3-total*3};};

export default function App(){
  const[screen,setScreen]=useState("loading");
  const[isReg,setIsReg]=useState(false);
  const[uname,setUname]=useState("");
  const[nombre,setNombre]=useState("");
  const[apellido,setApellido]=useState("");
  const[pass,setPass]=useState("");
  const[err,setErr]=useState("");
  const[busy,setBusy]=useState(false);
  const[user,setUser]=useState(null);
  const[isMob,setIsMob]=useState(window.innerWidth<768);
  const[modulo,setModulo]=useState("home");
  const[menuOpen,setMenuOpen]=useState(false);
  const[saveMsg,setSaveMsg]=useState("");
  const[productos,setProductos]=useState([]);
  const[camps,setCamps]=useState([]);
  const[tiendas,setTiendas]=useState([]);
  const[gastos,setGastos]=useState([]);
  const[aprend,setAprend]=useState([]);
  const[noteText,setNoteText]=useState("");
  const[noteOpen,setNoteOpen]=useState(false);
  const[calcOpen,setCalcOpen]=useState(false);
  const[calcV,setCalcV]=useState({pais:"Colombia",precProv:0,efectividad:0.75,pctCpa:0.2,pvManual:0,costoAdmin:0});
  // M1 Planner
  const[tab,setTab]=useState("plan");
  const[date,setDate]=useState(todayStr());
  const[day,setDay]=useState(null);
  const[calcHistory,setCalcHistory]=useState([]);
  const[waSent,setWaSent]=useState(false);
  const[fontSize,setFontSize]=useState(14);
  const saveRef=useRef(null);


  /* Auto-login */

  /* Auto-save */
  useEffect(()=>{
    if(!user||!day)return;
    clearTimeout(saveRef.current);
    saveRef.current=setTimeout(()=>doSave(true),2000);
    return()=>clearTimeout(saveRef.current);
  },[day]);

  /* WA midnight */
  useEffect(()=>{
    if(!user||!day)return;
    const check=()=>{
      const now=new Date();
      if(now.getHours()===23&&now.getMinutes()===59&&!waSent){setWaSent(true);sendWA();}
    };
    const iv=setInterval(check,30000);
    return()=>clearInterval(iv);
  },[user,day,waSent]);

  const sendWA=()=>{
    if(!day)return;
    const done=day.priorities.filter(p=>p.t&&p.d).map(p=>"✅ "+(p.t)).join("\n");
    const pending=day.priorities.filter(p=>p.t&&!p.d).map(p=>"⏳ "+(p.t)).join("\n");
    const sd=day.sched.filter(s=>s.task&&s.done).length;
    const st=day.sched.filter(s=>s.task).length;
    const msg="🗓 *BITÁCORA PRO — "+(fmtDate(date))+"*\n\n*✅ Completado:*\n"+(done||"Nada completado")+"\n\n*⏳ Pendiente:*\n"+(pending||"Todo listo 🎉")+"\n\n*📅 Horario:* "+(sd)+"/"+(st)+" tareas\n\n_by Bitácora Pro_";
    window.open("https://wa.me/?text="+(encodeURIComponent(msg)),"_blank");
  };

  const doSave=async(silent=false)=>{
    if(!silent)setSaveMsg("guardando...");
    if(day)await DB.set("d:"+(user.name)+":"+(date),day);
    await DB.set("floatnote:"+(user.name),noteText);
    const ud=await DB.get("u:"+(user.name))||{};
    await DB.set("u:"+(user.name),{...ud,fontSize});
    if(!silent){setSaveMsg("✓ Guardado");setTimeout(()=>setSaveMsg(""),2000);}
  };

  const changeDate=async nd=>{
    if(day)await DB.set("d:"+(user.name)+":"+(date),day);
    setDate(nd);setDay(await DB.get("d:"+(user.name)+":"+(nd))||newDay(nd));setWaSent(false);
  };


  /* ── LOADING ── */
  if(screen==="loading")return(
    <div style={{background:P.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Poppins',sans-serif",fontSize:10,color:P.mt2,letterSpacing:5,textTransform:"uppercase",marginBottom:10,fontWeight:300}}>estefani horta</div>
        <div className="pulse" style={{fontFamily:"'Poppins',sans-serif",fontSize:40,fontWeight:800,lineHeight:1}}>
          <GoldText>BITÁCORA PRO</GoldText>
        </div>
      </div>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:P.gold,animation:"pulse 1.4s ease-in-out "+(i*0.2)+"s infinite"}}/>)}
      </div>
      <div style={{fontSize:10,color:P.mt2,letterSpacing:3,marginTop:4,fontWeight:300}}>CARGANDO SESIÓN</div>
    </div>
  );

  /* ── AUTH ── */
  if(screen==="auth")return(
    <div style={{background:P.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{CSS}</style>
      <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",top:"15%",left:"10%",width:300,height:300,borderRadius:"50%",background:(P.gold)+"08",filter:"blur(80px)"}}/>
        <div style={{position:"absolute",bottom:"15%",right:"10%",width:250,height:250,borderRadius:"50%",background:(P.gold3)+"0a",filter:"blur(60px)"}}/>
      </div>
      <div style={{width:"100%",maxWidth:400,position:"relative",zIndex:1}} className="anim">
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:9,color:P.mt2,letterSpacing:5,textTransform:"uppercase",marginBottom:10,fontWeight:300}}>estefani horta</div>
          <h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?40:52,fontWeight:800,lineHeight:1,margin:0}}>
            <GoldText>BITÁCORA</GoldText>
          </h1>
          <h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?40:52,fontWeight:300,lineHeight:1,color:P.tx,margin:0,marginTop:-4}}>PRO</h1>
          <div style={{display:"flex",alignItems:"center",gap:12,justifyContent:"center",margin:"18px 0 10px"}}>
            <div style={{flex:1,height:"0.5px",background:"linear-gradient(90deg,transparent,"+(P.gold3)+")"}}/>
            <div style={{width:5,height:5,background:P.gold,transform:"rotate(45deg)"}}/>
            <div style={{flex:1,height:"0.5px",background:"linear-gradient(90deg,"+(P.gold3)+",transparent)"}}/>
          </div>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:9,color:P.mt,letterSpacing:2.5,fontWeight:400}}>SISTEMA DE GESTIÓN ECOMMERCE</div>
        </div>
        <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:16,padding:28}}>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:10,color:P.mt,letterSpacing:2,marginBottom:20,textAlign:"center",fontWeight:500}}>
            {isReg?"CREAR CUENTA":"BIENVENIDA DE VUELTA"}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <div style={{fontSize:9,letterSpacing:2,color:P.mt,marginBottom:6,textTransform:"uppercase",fontWeight:600}}>Usuario</div>
              <input style={SI()} value={uname} onChange={e=>setUname(e.target.value)} placeholder="tu_usuario" onKeyDown={e=>e.key==="Enter"&&doAuth()} autoCapitalize="none"/>
              {uname&&uname.includes(" ")&&<div style={{fontSize:10,color:P.gold,marginTop:4}}>→ Se guardará como: <b>{uname.trim().toLowerCase().replace(/[\s\/\\'"+]+/g,"_")}</b></div>}
            </div>
            <div>
              <div style={{fontSize:9,letterSpacing:2,color:P.mt,marginBottom:6,textTransform:"uppercase",fontWeight:600}}>Contraseña</div>
              <input style={SI()} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&doAuth()}/>
            </div>
            {err&&<div style={{background:"#1e0808",border:"1px solid #5a181844",borderRadius:8,padding:"10px 14px",color:"#f08888",fontSize:12}}>{err}</div>}
            <button style={SB({width:"100%",padding:"13px 0",fontSize:12,marginTop:4})} onClick={doAuth} disabled={busy}>
              {busy?<span className="pulse">▪ ▪ ▪</span>:isReg?"CREAR CUENTA":"ENTRAR"}
            </button>
          </div>
          <div style={{textAlign:"center",marginTop:18,fontSize:12,color:P.mt}}>
            {isReg?"¿Ya tienes cuenta? ":"¿Primera vez? "}
            <span style={{color:P.gold,cursor:"pointer",fontWeight:600}} onClick={()=>{setIsReg(!isReg);setErr("");}}>
              {isReg?"Inicia sesión":"Regístrate"}
            </span>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:16,fontSize:9,color:P.mt2,letterSpacing:2,fontWeight:300}}>✦ SINCRONIZACIÓN ENTRE DISPOSITIVOS ✦</div>
      </div>
    </div>
  );

  if(!day)return(
    <div style={{background:P.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div className="pulse" style={{fontFamily:"'Poppins',sans-serif",fontSize:18,fontWeight:600}}><GoldText>Cargando...</GoldText></div>
    </div>
  );

  const TABS=[
    {id:"plan",icon:"📋",label:"Planner"},
    {id:"productos",icon:"📦",label:"Productos"},
    {id:"trafficker",icon:"📊",label:"Trafficker"},
    {id:"creativos",icon:"🎨",label:"Creativos"},
    {id:"tiendas",icon:"🏪",label:"Tiendas"},
    {id:"herramientas",icon:"🔧",label:"Herramientas"},
    {id:"metricas",icon:"📈",label:"Métricas"},
    {id:"admin",icon:"⚙️",label:"Admin",adminOnly:true},
  ].filter(t=>!t.adminOnly||user?.role==="admin");

  // M2 Productos
  /* ── ALL HOOKS FIRST — never conditionally ── */
  const[search,setSearch]=useState("");
  const[filtroEst,setFiltroEst]=useState("Todos");

  /* derived — always computed */
  const prod=useMemo(()=>productos.find(p=>p.id===selProd)||null,[productos,selProd]);
  const prodsFiltrados=useMemo(()=>{
    let r=[...productos];
    if(search)r=r.filter(p=>p.nombre.toLowerCase().includes(search.toLowerCase()));
    if(filtroEst!=="Todos")r=r.filter(p=>p.estado===filtroEst);
    r.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
    return{visibles:r.filter(p=>!p.hidden),ocultos:r.filter(p=>p.hidden)};
  },[productos,search,filtroEst]);



  useEffect(()=>{
    if(!user||screen!=="app")return;
    clearTimeout(saveRef.current);
    saveRef.current=setTimeout(()=>DB.set("productos:"+(user.name),productos),2000);
  },[productos,user,screen]);

  const doSave=async(silent=false)=>{
    if(!silent)setSaveMsg("guardando...");
    if(user)await DB.set("productos:"+(user.name),productos);
    if(!silent){setSaveMsg("✓ Guardado");setTimeout(()=>setSaveMsg(""),2000);}
  };

  const updEtapa=(id,etapa,patch)=>setProductos(prev=>prev.map(p=>p.id===id?{...p,[etapa]:{...p[etapa],...patch}}:p));

  /* ════════ LOADING ════════ */
  if(screen==="loading")return(
    <div style={{background:P.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <style>{CSS}</style>
      <div className="pulse" style={{fontFamily:"'Poppins',sans-serif",fontSize:36,fontWeight:800}}><GT>BITÁCORA PRO</GT></div>
      <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:P.gold,animation:"pulse 1.4s ease-in-out "+(i*0.2)+"s infinite"}}/>)}</div>
    </div>
  );

  /* ════════ AUTH ════════ */
  if(screen==="auth")return(
    <div style={{background:P.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:400}} className="anim">
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:9,color:P.mt2,letterSpacing:5,textTransform:"uppercase",marginBottom:10,fontWeight:300}}>estefani horta</div>
          <h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:48,fontWeight:800,lineHeight:1,margin:0}}><GT>BITÁCORA</GT></h1>
          <h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:48,fontWeight:300,lineHeight:1,color:P.tx,margin:0}}>PRO</h1>
        </div>
        <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:16,padding:28}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><div style={{fontSize:9,letterSpacing:2,color:P.mt,marginBottom:6,textTransform:"uppercase",fontWeight:600}}>Usuario</div>
              <input style={SI()} value={uname} onChange={e=>setUname(e.target.value)} placeholder="tu_usuario" onKeyDown={e=>e.key==="Enter"&&doAuth()} autoCapitalize="none"/></div>
            <div><div style={{fontSize:9,letterSpacing:2,color:P.mt,marginBottom:6,textTransform:"uppercase",fontWeight:600}}>Contraseña</div>
              <input style={SI()} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&doAuth()}/></div>
            {err&&<div style={{background:"#1e0808",border:"1px solid #5a181844",borderRadius:8,padding:"10px 14px",color:"#f08888",fontSize:12}}>{err}</div>}
            <button style={SB({width:"100%",padding:"13px 0",fontSize:12,marginTop:4})} onClick={doAuth} disabled={busy}>
              {busy?<span className="pulse">▪ ▪ ▪</span>:isReg?"CREAR CUENTA":"ENTRAR"}
            </button>
          </div>
          <div style={{textAlign:"center",marginTop:18,fontSize:12,color:P.mt}}>
            {isReg?"¿Ya tienes cuenta? ":"¿Primera vez? "}
            <span style={{color:P.gold,cursor:"pointer",fontWeight:600}} onClick={()=>{setIsReg(!isReg);setErr("");}}>
              {isReg?"Inicia sesión":"Regístrate"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  /* ════════ DETALLE PRODUCTO ════════ */
  if(selProd&&prod){
    const sc=scoreA(prod.analisis||{});
    const si=scoreInfo(sc);
    const cp=calcP(prod.calculadora||{});
    const devDone=DEV_STEPS.filter(s=>prod.desarrollo?.steps?.[s.key]?.done).length;
    const devPct=Math.round(devDone/DEV_STEPS.length*100);
    const etapaIdx=ETAPAS.findIndex(e=>e.id===prod.etapa);

    return(
      <div style={{fontFamily:"'Poppins',sans-serif",background:P.bg,minHeight:"100vh",color:P.tx}}>
        <style>{CSS}</style>
        {/* Header */}
        <div style={{background:"#060604",borderBottom:"1px solid "+P.border,padding:isMob?"8px 14px":"10px 24px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",position:"sticky",top:0,zIndex:100}}>
          <button style={SG({padding:"6px 14px",fontSize:12})} onClick={()=>setSelProd(null)}>← Volver</button>
          <input style={{background:"none",border:"none",fontFamily:"'Poppins',sans-serif",fontSize:isMob?15:20,fontWeight:700,color:P.tx,flex:1,minWidth:0,outline:"none"}}
            value={prod.nombre} placeholder="Nombre del producto..." onChange={e=>updProd(prod.id,{nombre:e.target.value})}/>
          <select style={SI({width:"auto",padding:"5px 10px",fontSize:12,color:EST_COL[prod.estado]||P.gold})}
            value={prod.estado} onChange={e=>updProd(prod.id,{estado:e.target.value})}>
            {ESTADOS.map(s=><option key={s}>{s}</option>)}
          </select>
          <button style={SB({padding:"7px 16px",fontSize:11})} onClick={()=>doSave()}>{saveMsg||"GUARDAR"}</button>
        </div>
        {/* Etapas */}
        <div style={{display:"flex",background:"#060604",borderBottom:"1px solid "+P.border,overflowX:"auto",position:"sticky",top:isMob?53:57,zIndex:99}}>
          {ETAPAS.map((e,i)=>{
            const isActive=prod.etapa===e.id,isDone=i<etapaIdx;
            return(<button key={e.id} onClick={()=>updProd(prod.id,{etapa:e.id})} style={{background:"none",border:"none",borderBottom:isActive?"2px solid "+(P.gold):"2px solid transparent",color:isActive?P.gold:isDone?P.green:P.mt,padding:isMob?"8px 10px":"10px 18px",fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:isMob?9:10,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap",transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
              <span>{e.icon}</span><span>{e.label}</span>{isDone&&<span style={{color:P.green,fontSize:10}}>✓</span>}
            </button>);
          })}
        </div>

        <div style={{padding:isMob?"12px":"20px",maxWidth:1200,margin:"0 auto"}} className="slide">

          {/* INVESTIGACIÓN */}
          {prod.etapa==="investigacion"&&(
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:14}}>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Foto del Producto"/>
                  {prod.foto?(
                    <div style={{position:"relative"}}>
                      <img src={prod.foto} alt="" style={{width:"100%",borderRadius:10,maxHeight:240,objectFit:"cover"}}/>
                      <button onClick={()=>updProd(prod.id,{foto:""})} style={{position:"absolute",top:8,right:8,background:"#000000aa",border:"none",color:"#fff",borderRadius:"50%",width:28,height:28,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                    </div>
                  ):(
                    <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:140,border:"2px dashed "+(P.border),borderRadius:10,cursor:"pointer",gap:8}}>
                      <span style={{fontSize:32}}>📸</span>
                      <span style={{fontSize:12,color:P.mt}}>Subir foto del producto</span>
                      <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>updProd(prod.id,{foto:ev.target.result});r.readAsDataURL(f);}}/>
                    </label>
                  )}
                </div>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Datos Básicos"/>
                  {[["¿Por qué lo venderías?","porQueVender"],["Descripción","descripcion"],["Buyer Persona","buyerPersona"]].map(([lbl,key])=>(
                    <div key={key} style={{marginBottom:12}}>
                      <div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{lbl}</div>
                      <textarea style={SI({height:70,resize:"vertical",lineHeight:1.6,fontSize:12})} value={prod.investigacion?.[key]||""} placeholder={lbl+"..."} onChange={e=>updEtapa(prod.id,"investigacion",{[key]:e.target.value})}/>
                    </div>
                  ))}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[["Precio Proveedor","precioProveedor"],["Valor Venta Est.","valorVenta"],["Cant. Proveedores","cantProveedores"]].map(([lbl,key])=>(
                      <div key={key}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{lbl}</div>
                        <input style={SI({fontSize:12})} type="number" value={prod.investigacion?.[key]||""} onChange={e=>updEtapa(prod.id,"investigacion",{[key]:e.target.value})}/></div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Links de Referencia"/>
                  {[["Amazon","linkAmazon"],["Google Trends","linkTrends"],["AliExpress","linkAli"],["MercadoLibre","linkML"],["Links Competencia","linksComp"],["Links Videos","linksVideos"]].map(([lbl,key])=>(
                    <div key={key} style={{marginBottom:10}}>
                      <div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{lbl}</div>
                      <div style={{display:"flex",gap:6}}>
                        <input style={SI({fontSize:12,flex:1})} value={prod.investigacion?.[key]||""} placeholder="https://..." onChange={e=>updEtapa(prod.id,"investigacion",{[key]:e.target.value})}/>
                        {prod.investigacion?.[key]&&<a href={prod.investigacion[key]} target="_blank" rel="noreferrer" style={{...SG({padding:"0 10px",display:"flex",alignItems:"center",fontSize:14,textDecoration:"none"})}}>↗</a>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Notas"/>
                  <textarea style={SI({height:100,resize:"vertical",lineHeight:1.7,fontSize:12})} value={prod.investigacion?.notas||""} placeholder="Observaciones, ideas..." onChange={e=>updEtapa(prod.id,"investigacion",{notas:e.target.value})}/>
                </div>
              </div>
            </div>
          )}

          {/* ANÁLISIS */}
          {prod.etapa==="analisis"&&(
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:14,alignItems:"start"}}>
              <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                <SH label="Criterios de Análisis"/>
                {[["Cantidad Proveedores","cantProv",["1","2","3","4+"]],["Competidores","cantComp",["1","Entre 2 y 3","Entre 4 y 6","Más de 6"]],["Catálogo Público","catalogo",["Si","No"]],["Puede Importar","importar",["Si","No"]],["Ticket","ticket",["Bajo","Medio","Alto"]],["Suple Necesidad","necesidad",["Si","No"]],["Efecto Wow","wow",["Si","No"]],["Anuncio Cautivador","cautivador",["Si","No"]],["Percepción Valor","percepcion",["Si","No"]],["Es Black","black",["Si","No"]]].map(([lbl,key,opts])=>(
                  <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid "+P.border}}>
                    <span style={{fontSize:12,color:P.mt}}>{lbl}</span>
                    <select style={SI({width:"auto",padding:"4px 8px",fontSize:12})} value={prod.analisis?.[key]||opts[0]} onChange={e=>updEtapa(prod.id,"analisis",{[key]:e.target.value})}>
                      {opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{marginTop:10}}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Necesidad que suple</div>
                  <input style={SI({fontSize:12})} value={prod.analisis?.queNec||""} placeholder="Describe..." onChange={e=>updEtapa(prod.id,"analisis",{queNec:e.target.value})}/></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:"#0a0900",border:"1px solid "+(si.color)+"44",borderRadius:14,padding:24,textAlign:"center"}}>
                  <Ring pct={sc} color={si.color} size={130} stroke={12}/>
                  <div style={{fontSize:14,color:si.color,fontWeight:700,marginTop:12}}>{si.label}</div>
                </div>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Prompt Análisis Profundo"/>
                  <div style={{fontSize:11,color:P.mt,marginBottom:10,lineHeight:1.6}}>Copia y pega en ChatGPT para análisis completo COD Colombia.</div>
                  <button style={SB({width:"100%",padding:"10px 0",fontSize:11})} onClick={()=>{
                    const txt="ANÁLISIS ESTRATÉGICO — BITÁCORA PRO\nProducto: "+(prod.nombre)+"\nProblema: "+(prod.investigacion?.descripcion||"—")+"\nPor qué vender: "+(prod.investigacion?.porQueVender||"—")+"\nPrecio proveedor: "+(prod.investigacion?.precioProveedor||0)+"\nValor venta estimado: "+(prod.investigacion?.valorVenta||0)+"\nCant. proveedores: "+(prod.investigacion?.cantProveedores||1)+"\nCompetencia: "+(prod.analisis?.cantComp||"—")+"\nTicket: "+(prod.analisis?.ticket||"—")+"\nBuyer Persona: "+(prod.investigacion?.buyerPersona||"—")+"\nLinks competencia: "+(prod.investigacion?.linksComp||"—")+"\n\nEjecuta análisis completo COD Colombia Meta Ads con score de viabilidad, ángulos de venta, oferta recomendada, naming y recomendación final.";
                    navigator.clipboard?.writeText(txt);setSaveMsg("✓ Copiado");setTimeout(()=>setSaveMsg(""),2000);
                  }}>📋 Copiar Prompt de Análisis</button>
                </div>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Subir Análisis HTML/PDF"/>
                  {prod.analisisFile?(
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:10,background:P.bg2,borderRadius:8,border:"1px solid "+P.green+"33"}}>
                      <span style={{fontSize:20}}>📄</span>
                      <span style={{fontSize:12,color:P.green,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{prod.analisisFileName||"Análisis subido"}</span>
                      <button onClick={()=>updProd(prod.id,{analisisFile:null,analisisFileName:""})} style={{background:"none",border:"none",color:P.mt,fontSize:16}}>×</button>
                    </div>
                  ):(
                    <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:80,border:"2px dashed "+(P.border),borderRadius:10,cursor:"pointer",gap:6}}>
                      <span style={{fontSize:24}}>📤</span>
                      <span style={{fontSize:11,color:P.mt}}>Subir HTML o PDF</span>
                      <input type="file" accept=".html,.pdf" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>updProd(prod.id,{analisisFile:ev.target.result,analisisFileName:f.name});r.readAsDataURL(f);}}/>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CALCULADORA */}
          {prod.etapa==="calculadora"&&(()=>{
            const c=prod.calculadora||{},r=calcP(c);
            return(
              <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:14,alignItems:"start"}}>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                    <SH label="Parámetros"/>
                    <div style={{marginBottom:12}}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>País</div>
                      <select style={SI()} value={c.pais||"Colombia"} onChange={e=>updEtapa(prod.id,"calculadora",{pais:e.target.value})}>{PAISES.map(p=><option key={p}>{p}</option>)}</select></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      {[["Utilidad %","util"],["Efectividad %","efect"],["CPA %","cpa"],["Cancelados %","canc"],["Impuestos %","tax"],["Precio Proveedor","proveedor"],["Costos Admin","admin"],["Fullfilment","fulfi"],["Precio Manual","manual"]].map(([lbl,key])=>(
                        <div key={key}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{lbl}</div>
                          <input style={SI({fontSize:12,color:key==="manual"?P.gold:P.tx})} type="number" value={c[key]||0} onChange={e=>updEtapa(prod.id,"calculadora",{[key]:e.target.value})}/></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div style={{background:"#0a0900",border:"1px solid "+P.gold+"55",borderRadius:14,padding:24,textAlign:"center"}}>
                    <div style={{fontSize:10,color:P.mt,letterSpacing:3,marginBottom:8,fontWeight:600}}>PRECIO SUGERIDO — {c.pais||"Colombia"}</div>
                    <div style={{fontFamily:"'Poppins',sans-serif",fontSize:42,fontWeight:800,background:"linear-gradient(135deg,#C9956C,#E8C4A0)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{COP(r.Ps)}</div>
                    {+c.manual>0&&(<div style={{borderTop:"1px solid "+P.border,marginTop:14,paddingTop:14}}>
                      <div style={{fontSize:10,color:P.mt,letterSpacing:2,marginBottom:6,fontWeight:600}}>PRECIO MANUAL</div>
                      <div style={{fontSize:28,fontWeight:700,color:P.gold}}>{COP(+c.manual)}</div>
                      <div style={{fontSize:13,color:r.um>=0?P.green:P.red,marginTop:4}}>Utilidad: {COP(r.um)}</div>
                    </div>)}
                  </div>
                  <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                    <SH label="Desglose"/>
                    {NR("Precio Proveedor",COP(r.pr))}{NR("Flete c/Devoluciones",COP(r.fd))}{NR("CPA Costeado",COP(r.cpc))}{NR("Impuestos",COP(r.imp))}{NR("Costos Totales",COP(r.cos))}{NR("Precio Sugerido",COP(r.Ps),true)}{NR("CPA Breakeven",COP(r.cbk),true)}{+c.manual>0&&NR("Utilidad Real",COP(r.um),true)}
                  </div>
                  <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                    <SH label="Ofertas de Cantidad"/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      {[{lbl:"2 Uds -20%",d:r.o2},{lbl:"3 Uds -30%",d:r.o3}].map(({lbl,d})=>(
                        <div key={lbl} style={{background:P.bg2,border:"1px solid "+P.border,borderRadius:10,padding:14}}>
                          <div style={{fontSize:11,color:P.gold,fontWeight:700,marginBottom:8}}>{lbl}</div>
                          {NR("Venta",COP(d.p))}
                          <div style={{display:"flex",justifyContent:"space-between",paddingTop:6}}>
                            <span style={{fontSize:12,color:P.mt}}>Utilidad</span>
                            <span style={{fontSize:14,color:d.u>=0?P.green:P.red,fontWeight:700}}>{COP(d.u)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* OFERTA */}
          {prod.etapa==="oferta"&&(
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:14}}>
              <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                <SH label="Estructura de Oferta"/>
                {[["Precio 1 Unidad","precio1"],["Precio 2 Unidades","precio2"],["Precio 3 Unidades","precio3"],["Bundle","bundle"],["Garantía","garantia"],["Bonus Digital","bonus"],["Upsell","upsell"],["Urgencia","urgencia"]].map(([lbl,key])=>(
                  <div key={key} style={{marginBottom:10}}>
                    <div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{lbl}</div>
                    <input style={SI({fontSize:12})} value={prod.oferta?.[key]||""} placeholder={lbl+"..."} onChange={e=>updEtapa(prod.id,"oferta",{[key]:e.target.value})}/>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Notas de Oferta"/>
                  <textarea style={SI({height:180,resize:"vertical",lineHeight:1.7,fontSize:12})} value={prod.oferta?.notas||""} placeholder="Estrategia, observaciones..." onChange={e=>updEtapa(prod.id,"oferta",{notas:e.target.value})}/>
                </div>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Prompt Oferta COD"/>
                  <button style={SB({width:"100%",padding:"10px 0",fontSize:11})} onClick={()=>{
                    const txt="OFERTA COD COLOMBIA — BITÁCORA PRO\nProducto: "+(prod.nombre)+"\nPrecio proveedor: "+(prod.investigacion?.precioProveedor||0)+"\nValor venta: "+(prod.investigacion?.valorVenta||0)+"\nMercado: Colombia COD Meta Ads\n\nGenera oferta completa: precios x1/x2/x3, bundle, garantía en días, bonus digital con título, upsell, urgencia real y justificación de cada elemento.";
                    navigator.clipboard?.writeText(txt);setSaveMsg("✓ Copiado");setTimeout(()=>setSaveMsg(""),2000);
                  }}>📋 Copiar Prompt Oferta</button>
                </div>
              </div>
            </div>
          )}

          {/* DESARROLLO */}
          {prod.etapa==="desarrollo"&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20,flexWrap:"wrap"}}>
                <Ring pct={devPct} color={devPct===100?P.green:devPct>=50?P.gold:P.red} size={64} stroke={7}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:700,color:P.tx}}>{devDone}/{DEV_STEPS.length} pasos completados</div>
                  <div style={{fontSize:12,color:P.mt,marginTop:2}}>{DEV_STEPS.length-devDone} pasos restantes</div>
                  <div style={{height:4,background:P.card2,borderRadius:2,marginTop:8}}>
                    <div style={{height:4,borderRadius:2,background:devPct===100?P.green:"linear-gradient(90deg,"+(P.gold)+","+(P.gold2)+")",width:(devPct)+"%",transition:"width .6s"}}/>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {DEV_STEPS.map((s,i)=>{
                  const step=prod.desarrollo?.steps?.[s.key]||{done:false,subs:{}};
                  const subsDone=Object.values(step.subs||{}).filter(Boolean).length;
                  const subsTotal=(s.subs||[]).length;
                  const allDone=subsTotal>0&&subsDone===subsTotal;
                  const stepOpen=step.open||false;
                  return(
                    <div key={s.key} style={{background:allDone?"#0a1a0a":step.done?"#0f1a0a":P.card,border:"1px solid "+(allDone?"#4dba7f55":step.done?"#4dba7f33":P.border),borderRadius:12,overflow:"hidden",transition:"all .2s"}}>
                      {/* Header acordeón */}
                      <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 16px",cursor:"pointer",userSelect:"none"}}
                        onClick={()=>setProductos(prev=>prev.map(p=>p.id===prod.id?{...p,desarrollo:{...p.desarrollo,steps:{...p.desarrollo.steps,[s.key]:{...step,open:!stepOpen}}}}:p))}>
                        {/* Check principal */}
                        <div onClick={e=>{e.stopPropagation();const nd=!step.done;const ns=Object.fromEntries((s.subs||[]).map(sb=>[sb,nd]));setProductos(prev=>prev.map(p=>p.id===prod.id?{...p,desarrollo:{...p.desarrollo,steps:{...p.desarrollo.steps,[s.key]:{...step,done:nd,subs:ns}}}}:p));}}
                          style={{width:22,height:22,borderRadius:5,background:allDone?P.green:step.done?"#2a6a3a":"transparent",border:"2px solid "+(allDone?P.green:step.done?"#4dba7f":P.border),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s",zIndex:1}}>
                          {(allDone||step.done)&&<span style={{color:"#080400",fontSize:12,fontWeight:900}}>✓</span>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:9,color:allDone?P.green:step.done?P.green:P.mt,letterSpacing:1,fontWeight:600,marginBottom:2}}>PASO {i+1}</div>
                          <div style={{fontSize:13,color:allDone?P.green:step.done?P.tx:P.tx,fontWeight:600,textDecoration:(allDone||step.done)?"line-through":"none"}}>{s.label}</div>
                        </div>
                        {/* Progress mini */}
                        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                          <div style={{display:"flex",gap:3}}>
                            {(s.subs||[]).map((_,si)=>(
                              <div key={si} style={{width:6,height:6,borderRadius:"50%",background:si<subsDone?P.green:P.border,transition:"background .2s"}}/>
                            ))}
                          </div>
                          <span style={{fontSize:10,color:allDone?P.green:P.mt,minWidth:28,fontWeight:allDone?700:400}}>{subsDone}/{subsTotal}</span>
                          <span style={{color:P.mt,fontSize:12,transition:"transform .2s",display:"inline-block",transform:stepOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
                        </div>
                      </div>
                      {/* Sub-ítems acordeón */}
                      {stepOpen&&(
                        <div style={{borderTop:"1px solid "+P.border,padding:"10px 16px 14px",background:"#0a0a08"}}>
                          {(s.subs||[]).map(sub=>{
                            const sd=step.subs?.[sub]||false;
                            return(
                              <div key={sub} onClick={()=>{
                                setProductos(prev=>prev.map(p=>{
                                  if(p.id!==prod.id)return p;
                                  const ns={...(p.desarrollo?.steps?.[s.key]?.subs||{}),[sub]:!sd};
                                  const ad=Object.values(ns).every(Boolean);
                                  return{...p,desarrollo:{...p.desarrollo,steps:{...p.desarrollo.steps,[s.key]:{...p.desarrollo.steps[s.key],done:ad,subs:ns}}}};
                                }));
                              }} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",cursor:"pointer",borderBottom:"1px solid "+(P.border)+"22"}}>
                                <div style={{width:16,height:16,borderRadius:4,background:sd?P.green:"transparent",border:"1.5px solid "+(sd?P.green:P.mt2),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
                                  {sd&&<span style={{color:"#080400",fontSize:10,fontWeight:900}}>✓</span>}
                                </div>
                                <span style={{fontSize:12,color:sd?P.green:P.mt,textDecoration:sd?"line-through":"none",transition:"all .2s"}}>{sub}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CREATIVOS */}
          {prod.etapa==="creativos"&&(
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:14}}>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Ángulos de Venta"/>
                  <textarea style={SI({height:120,resize:"vertical",lineHeight:1.7,fontSize:12})} value={prod.creativos?.angulos||""} placeholder="1. Emocional — ...\n2. Testimonio — ...\n3. Comparación — ..." onChange={e=>updEtapa(prod.id,"creativos",{angulos:e.target.value})}/>
                </div>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Guión / Script"/>
                  <textarea style={SI({height:200,resize:"vertical",lineHeight:1.7,fontSize:12})} value={prod.creativos?.guion||""} placeholder="Pega aquí el guión generado en ChatGPT..." onChange={e=>updEtapa(prod.id,"creativos",{guion:e.target.value})}/>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Prompts de Imagen/Video"/>
                  <textarea style={SI({height:150,resize:"vertical",lineHeight:1.7,fontSize:12})} value={prod.creativos?.prompts||""} placeholder="Pega aquí los prompts generados..." onChange={e=>updEtapa(prod.id,"creativos",{prompts:e.target.value})}/>
                </div>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Prompt Creativos"/>
                  <button style={SB({width:"100%",padding:"10px 0",fontSize:11,marginBottom:10})} onClick={()=>{
                    const txt="CREATIVOS — BITÁCORA PRO\nProducto: "+(prod.nombre)+"\nDescripción: "+(prod.investigacion?.descripcion||"—")+"\nBuyer Persona: "+(prod.investigacion?.buyerPersona||"—")+"\nÁngulos: "+(prod.creativos?.angulos||"Beneficio, Testimonio, Emocional, Comparación, Validación")+"\nPrecio: "+(COP(+prod.investigacion?.valorVenta||0))+"\nMercado: Colombia COD Meta Ads\n\nPor cada ángulo: 5 hooks agresivos que toquen el punto de dolor. Luego por ángulo elegido: guión completo UGC + voz en off con fases (Scrollstopper 2-3s, Presentación 2-3s, Características 6-8s, Modo de uso 10-12s, CTA 2-4s) + texto de pantalla complementario (NO repite voz en off) + escenas sugeridas cinematográficas + tags ElevenLabs v3.";
                    navigator.clipboard?.writeText(txt);setSaveMsg("✓ Copiado");setTimeout(()=>setSaveMsg(""),2000);
                  }}>📋 Copiar Prompt Creativos</button>
                  <SH label="Notas"/>
                  <textarea style={SI({height:80,resize:"vertical",lineHeight:1.6,fontSize:12})} value={prod.creativos?.notas||""} placeholder="Notas adicionales..." onChange={e=>updEtapa(prod.id,"creativos",{notas:e.target.value})}/>
                </div>
              </div>
            </div>
          )}

          {/* CAMPAÑA */}
          {prod.etapa==="campana"&&(()=>{
            const inv=+prod.campana?.inversion||0,ing=+prod.campana?.ingresos||0;
            const costoDropi=+prod.campana?.costoDropi||0;
            const profit=ing-inv-costoDropi;
            const roas=inv>0?ing/inv:0;
            const alertas=[];
            if((+prod.campana?.cpa||0)>50000)alertas.push({t:"CPA Alto — revisar segmentación",c:P.red});
            if((+prod.campana?.cpm||0)>30000)alertas.push({t:"CPM Alto — revisar creativos",c:P.red});
            if((+prod.campana?.ctr||0)<1&&(+prod.campana?.ctr||0)>0)alertas.push({t:"CTR Bajo — cambiar hook",c:"#f97316"});
            return(
              <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:14}}>
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                  <SH label="Datos de Campaña"/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[["Fecha","fecha","date"],["Inversión Ads","inversion","number"],["Ingresos Dropi","ingresos","number"],["Costo Dropi (opcional)","costoDropi","number"],["Ventas","ventas","number"],["CPA","cpa","number"],["CTR %","ctr","number"],["CPM","cpm","number"]].map(([lbl,key,type])=>(
                      <div key={key}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{lbl}</div>
                        <input style={SI({fontSize:12})} type={type} value={prod.campana?.[key]||""} onChange={e=>updEtapa(prod.id,"campana",{[key]:e.target.value})}/></div>
                    ))}
                  </div>
                  <div style={{marginTop:10}}>
                    <div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Estado</div>
                    <select style={SI({fontSize:12,color:EST_COL[prod.campana?.estado]||P.gold})} value={prod.campana?.estado||"Testeando"} onChange={e=>updEtapa(prod.id,"campana",{estado:e.target.value})}>
                      {["Testeando","Activa","Escalando","Pausada","Finalizada"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{fontSize:10,color:P.mt,marginTop:10,lineHeight:1.5,background:P.bg2,borderRadius:8,padding:"8px 10px"}}>
                    💡 <b>Profit = Ingresos Dropi − Inversión Ads{costoDropi>0?" − Costo Dropi":""}</b><br/>
                    Dropi ya descuenta el costo del producto antes de pagarte. Solo agrega "Costo Dropi" si quieres ver el profit incluyendo lo que pagaste a Dropi.
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[{l:"Inversión",v:COP(inv),c:P.mt},{l:"Ingresos",v:COP(ing),c:P.gold},{l:"Profit",v:COP(profit),c:profit>=0?P.green:P.red},{l:"ROAS",v:roas.toFixed(2)+"x",c:roas>=2?P.green:roas>=1?P.gold:P.red}].map(({l,v,c})=>(
                      <div key={l} style={{background:P.bg2,borderRadius:10,padding:"12px 14px",border:"1px solid "+P.border}}>
                        <div style={{fontSize:9,color:P.mt,letterSpacing:1,textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{l}</div>
                        <div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {alertas.length>0&&(
                    <div style={{background:"#1a0808",border:"1px solid "+P.red+"33",borderRadius:12,padding:14}}>
                      <div style={{fontSize:10,color:P.red,letterSpacing:1.5,marginBottom:8,textTransform:"uppercase",fontWeight:600}}>⚠ Alertas</div>
                      {alertas.map(a=><div key={a.t} style={{fontSize:12,color:a.c,marginBottom:4}}>• {a.t}</div>)}
                    </div>
                  )}
                  <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                    <SH label="Notas de Campaña"/>
                    <textarea style={SI({height:120,resize:"vertical",lineHeight:1.7,fontSize:12})} value={prod.campana?.notas||""} placeholder="Aprendizajes, próximos pasos..." onChange={e=>updEtapa(prod.id,"campana",{notas:e.target.value})}/>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Nav etapas */}
          <div style={{display:"flex",gap:10,marginTop:24,justifyContent:"space-between"}}>
            <button style={SG({padding:"9px 20px",fontSize:12,opacity:etapaIdx===0?.3:1})} onClick={()=>etapaIdx>0&&updProd(prod.id,{etapa:ETAPAS[etapaIdx-1].id})}>← Anterior</button>
            <button style={SB({padding:"9px 24px",fontSize:12,opacity:etapaIdx===ETAPAS.length-1?.3:1})} onClick={()=>etapaIdx<ETAPAS.length-1&&updProd(prod.id,{etapa:ETAPAS[etapaIdx+1].id})}>Siguiente →</button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════ LISTA PRODUCTOS ════════ */
  // M3 Trafficker
  const[periodo,setPeriodo]=useState("mes");
  const[fechaUnica,setFechaUnica]=useState(todayStr());
  const[vistaTab,setVistaTab]=useState("dashboard");
  const[vistaCamps,setVistaCamps]=useState("periodo");
  const[showForm,setShowForm]=useState(false);
  const[editCamp,setEditCamp]=useState(null);
  const[confirmDel,setConfirmDel]=useState(null);
  const[notasMes,setNotasMes]=useState("");
  const[dropiData,setDropiData]=useState(null);
  const[metaData,setMetaData]=useState(null);
  const[importMsg,setImportMsg]=useState("");



  useEffect(()=>{
    if(!user||screen!=="app")return;
    clearTimeout(saveRef.current);
    saveRef.current=setTimeout(()=>DB.set("camps:"+(user.name),camps),1500);
  },[camps,user,screen]);

  const doSave=async(silent=false)=>{
    if(!silent)setSaveMsg("guardando...");
    if(user){
      await DB.set("camps:"+(user.name),camps);
      await DB.set("campnotes:"+(user.name),notasMes);
      if(dropiData)await DB.set("dropidata:"+(user.name),dropiData);
      if(metaData)await DB.set("metadata:"+(user.name),metaData);
    }
    if(!silent){setSaveMsg("✓ Guardado");setTimeout(()=>setSaveMsg(""),2000);}
  };


  /* ── IMPORTAR META ── */
  const importMeta=async(file)=>{
    setImportMsg("Procesando Meta Ads...");
    try{
      let rows=[];
      if(file.name.endsWith(".csv")){
        const text=await file.text();
        const result=Papa.parse(text,{header:true,skipEmptyLines:true});
        rows=result.data;
      }else{
        const ab=await file.arrayBuffer();
        const wb=XLSX.read(ab);
        const ws=wb.Sheets[wb.SheetNames[0]];
        rows=XLSX.utils.sheet_to_json(ws);
      }
      const parsed=parseMetaRows(rows);
      setMetaData({filas:parsed,archivo:file.name,fecha:todayStr(),totalRows:rows.length});
      await DB.set("metadata:"+(user.name),{filas:parsed,archivo:file.name,fecha:todayStr(),totalRows:rows.length});
      setImportMsg("✓ Meta: "+(parsed.length)+" campañas importadas");
      setTimeout(()=>setImportMsg(""),3000);
    }catch(e){setImportMsg("Error al procesar: "+e.message);setTimeout(()=>setImportMsg(""),4000);}
  };

  /* ── IMPORTAR DROPI ── */
  const importDropi=async(file)=>{
    setImportMsg("Procesando Dropi...");
    try{
      let rows=[];
      if(file.name.endsWith(".csv")){
        const text=await file.text();
        const result=Papa.parse(text,{header:true,skipEmptyLines:true});
        rows=result.data;
      }else{
        const ab=await file.arrayBuffer();
        const wb=XLSX.read(ab);
        const ws=wb.Sheets[wb.SheetNames[0]];
        rows=XLSX.utils.sheet_to_json(ws);
      }
      const parsed=parseDropiRows(rows);
      setDropiData({...parsed,archivo:file.name,fechaImport:todayStr()});
      await DB.set("dropidata:"+(user.name),{...parsed,archivo:file.name,fechaImport:todayStr()});
      setImportMsg("✓ Dropi: "+(parsed.totalPedidos)+" pedidos — "+(parsed.entregado)+" entregados");
      setTimeout(()=>setImportMsg(""),3000);
    }catch(e){setImportMsg("Error al procesar: "+e.message);setTimeout(()=>setImportMsg(""),4000);}
  };

  /* ── MÉTRICAS MANUALES ── */
  const campsActivas=useMemo(()=>filtrarPeriodo(camps,periodo,fechaUnica),[camps,periodo,fechaUnica]);
  const campsProdVista=useMemo(()=>selProd==="Todos"?camps:camps.filter(c=>c.producto===selProd),[camps,selProd]);
  const campsTabla=vistaCamps==="periodo"?campsActivas:campsProdVista;

  const M=useMemo(()=>{
    const cs=campsActivas;
    const inv=cs.reduce((a,c)=>a+(+c.inversion||0),0);
    const ing=cs.reduce((a,c)=>a+(+c.ingresos||0),0);
    const ven=cs.reduce((a,c)=>a+(+c.ventas||0),0);
    const drop=cs.reduce((a,c)=>a+(+c.costoDropi||0),0);
    const profit=ing-inv-drop;
    const roas=inv>0?ing/inv:0;
    const wCtr=cs.filter(c=>+c.ctr>0);
    const wCpm=cs.filter(c=>+c.cpm>0);
    const wCpa=cs.filter(c=>+c.cpa>0);
    const ctr=wCtr.length?wCtr.reduce((a,c)=>a+(+c.ctr),0)/wCtr.length:0;
    const cpm=wCpm.length?wCpm.reduce((a,c)=>a+(+c.cpm),0)/wCpm.length:0;
    const cpa=wCpa.length?wCpa.reduce((a,c)=>a+(+c.cpa),0)/wCpa.length:0;
    // pérdidas: campañas con ingresos=0 o profit negativo
    const perdidas=cs.filter(c=>(+c.ingresos||0)===0&&(+c.inversion||0)>0);
    const dinPerdido=perdidas.reduce((a,c)=>a+(+c.inversion||0),0);
    const campsPerdida=cs.filter(c=>(+c.ingresos||0)-(+c.inversion||0)-(+c.costoDropi||0)<0);
    const byProd={};
    cs.forEach(c=>{if(!c.producto)return;if(!byProd[c.producto])byProd[c.producto]={inv:0,ing:0,profit:0,ven:0};const p=byProd[c.producto];p.inv+=+c.inversion||0;p.ing+=+c.ingresos||0;p.profit+=(+c.ingresos||0)-(+c.inversion||0)-(+c.costoDropi||0);p.ven+=+c.ventas||0;});
    const byCuenta={};
    cs.forEach(c=>{if(!c.cuenta)return;if(!byCuenta[c.cuenta])byCuenta[c.cuenta]={inv:0,ing:0,n:0};byCuenta[c.cuenta].inv+=+c.inversion||0;byCuenta[c.cuenta].ing+=+c.ingresos||0;byCuenta[c.cuenta].n++;});
    const alertas=[];
    cs.forEach(c=>{
      if((+c.cpa||0)>45000)alertas.push({camp:c.campana||c.producto,tipo:"CPA Alto",val:COP(+c.cpa),color:P.red});
      if((+c.cpm||0)>28000)alertas.push({camp:c.campana||c.producto,tipo:"CPM Alto",val:COP(+c.cpm),color:P.orange});
      if((+c.ctr||0)>0&&(+c.ctr||0)<1.5)alertas.push({camp:c.campana||c.producto,tipo:"CTR Bajo",val:PCT(+c.ctr),color:P.orange});
      if((+c.ingresos||0)===0&&(+c.inversion||0)>0)alertas.push({camp:c.campana||c.producto,tipo:"Sin Ventas",val:COP(+c.inversion)+" perdido",color:P.red});
    });
    const byFecha={};
    cs.forEach(c=>{if(!byFecha[c.fecha])byFecha[c.fecha]={ing:0};byFecha[c.fecha].ing+=+c.ingresos||0;});
    const chart=Object.entries(byFecha).sort((a,b)=>a[0].localeCompare(b[0])).slice(-10).map(([f,v])=>({l:f.slice(5),v:v.ing}));
    return{inv,ing,ven,drop,profit,roas,ctr,cpm,cpa,activas:cs.filter(c=>c.estado==="Activa"||c.estado==="Escalando").length,total:cs.length,byProd,byCuenta,alertas,chart,perdidas,dinPerdido,campsPerdida};
  },[campsActivas]);

  const productos=useMemo(()=>["Todos",...new Set(camps.map(c=>c.producto).filter(Boolean))],[camps]);

  /* ── LOADING ── */
  if(screen==="loading")return(
    <div style={{background:P.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <style>{CSS}</style>
      <div className="pulse" style={{fontFamily:"'Poppins',sans-serif",fontSize:36,fontWeight:800}}><GT>BITÁCORA PRO</GT></div>
      <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:P.gold,animation:"pulse 1.4s ease-in-out "+(i*0.2)+"s infinite"}}/>)}</div>
    </div>
  );

  if(screen==="auth")return(
    <div style={{background:P.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:400}} className="anim">
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:9,color:P.mt2,letterSpacing:5,textTransform:"uppercase",marginBottom:10,fontWeight:300}}>estefani horta</div>
          <h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:48,fontWeight:800,lineHeight:1,margin:0}}><GT>BITÁCORA</GT></h1>
          <h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:48,fontWeight:300,lineHeight:1,color:P.tx,margin:0}}>PRO</h1>
        </div>
        <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:16,padding:28}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><div style={{fontSize:9,letterSpacing:2,color:P.mt,marginBottom:6,textTransform:"uppercase",fontWeight:600}}>Usuario</div><input style={SI()} value={uname} onChange={e=>setUname(e.target.value)} placeholder="tu_usuario" onKeyDown={e=>e.key==="Enter"&&doAuth()} autoCapitalize="none"/></div>
            <div><div style={{fontSize:9,letterSpacing:2,color:P.mt,marginBottom:6,textTransform:"uppercase",fontWeight:600}}>Contraseña</div><input style={SI()} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&doAuth()}/></div>
            {err&&<div style={{background:"#1e0808",border:"1px solid #5a181844",borderRadius:8,padding:"10px 14px",color:"#f08888",fontSize:12}}>{err}</div>}
            <button style={SB({width:"100%",padding:"13px 0",fontSize:12,marginTop:4})} onClick={doAuth} disabled={busy}>{busy?<span className="pulse">▪ ▪ ▪</span>:isReg?"CREAR CUENTA":"ENTRAR"}</button>
          </div>
          <div style={{textAlign:"center",marginTop:18,fontSize:12,color:P.mt}}>
            {isReg?"¿Ya tienes cuenta? ":"¿Primera vez? "}
            <span style={{color:P.gold,cursor:"pointer",fontWeight:600}} onClick={()=>{setIsReg(!isReg);setErr("");}}>{isReg?"Inicia sesión":"Regístrate"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // M4 Creativos
  const[fuenteProd,setFuenteProd]=useState("analizado");
  const[prodSelId,setProdSelId]=useState("p1");
  const[prodLibre,setProdLibre]=useState({id:"libre",nombre:"",descripcion:"",problema:"",buyerPersona:"",precioAntes:"",precioAhora:"",paleta:"",pais:"Colombia",anguloPpal:"",precioProveedor:0});
  const[angulos,setAngulos]=useState("1. Emocional — vergüenza o frustración del día a día\n2. Testimonio — resultado real de un cliente\n3. Comparación — vs productos genéricos del mercado\n4. Beneficio específico — ingrediente o mecanismo activo\n5. Validación — autoridad, dato o estadística");
  const[heroAncho,setHeroAncho]=useState("1080");
  const[heroAlto,setHeroAlto]=useState("1400");
  const[comparacion,setComparacion]=useState("");
  const[hookSel,setHookSel]=useState("");
  const[angSel,setAngSel]=useState("Emocional");
  const[saveMsg2,setSaveMsg2]=useState("");

  useEffect(()=>{if(!user)return;clearTimeout(saveRef.current);saveRef.current=setTimeout(()=>DB.set("m4s:"+(user.name),savedR),2000);},[savedR]);
  const doSave=async(silent=false)=>{if(!silent)setSaveMsg("guardando...");if(user)await DB.set("m4s:"+(user.name),savedR);if(!silent){setSaveMsg("✓ Guardado");setTimeout(()=>setSaveMsg(""),2000);}};
  const RB=({k,ph="Pega aquí el resultado de ChatGPT...",h=100})=>(<div style={{marginTop:10,background:(P.green)+"08",border:"1px solid "+(P.green)+"22",borderRadius:10,padding:12}}><div style={{fontSize:9,color:P.green,letterSpacing:1,textTransform:"uppercase",fontWeight:600,marginBottom:5}}>💾 Guardar Resultado</div><textarea style={SI({height:h,resize:"vertical",lineHeight:1.7,fontSize:12})} value={savedR[k]||""} placeholder={ph} onChange={e=>sv(k,e.target.value)}/><div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:5}}>{savedR[k]&&<CopyBtn text={savedR[k]} small/>}<button style={SB({padding:"4px 12px",fontSize:10})} onClick={()=>doSave()}>💾</button></div></div>);

  if(screen==="loading")return(<div style={{background:P.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}><style>{CSS}</style><div className="pulse" style={{fontFamily:"'Poppins',sans-serif",fontSize:36,fontWeight:800}}><GT>BITÁCORA PRO</GT></div><div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:P.gold,animation:"pulse 1.4s ease-in-out "+(i*0.2)+"s infinite"}}/>)}</div></div>);
  if(screen==="auth")return(<div style={{background:P.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><style>{CSS}</style><div style={{width:"100%",maxWidth:400}} className="anim"><div style={{textAlign:"center",marginBottom:36}}><div style={{fontSize:9,color:P.mt2,letterSpacing:5,textTransform:"uppercase",marginBottom:10,fontWeight:300}}>estefani horta</div><h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:48,fontWeight:800,lineHeight:1,margin:0}}><GT>BITÁCORA</GT></h1><h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:48,fontWeight:300,lineHeight:1,color:P.tx,margin:0}}>PRO</h1></div><div style={{background:P.card,border:"1px solid "+P.border,borderRadius:16,padding:28}}><div style={{display:"flex",flexDirection:"column",gap:14}}><div><div style={{fontSize:9,letterSpacing:2,color:P.mt,marginBottom:6,textTransform:"uppercase",fontWeight:600}}>Usuario</div><input style={SI()} value={uname} onChange={e=>setUname(e.target.value)} placeholder="tu_usuario" onKeyDown={e=>e.key==="Enter"&&doAuth()} autoCapitalize="none"/></div><div><div style={{fontSize:9,letterSpacing:2,color:P.mt,marginBottom:6,textTransform:"uppercase",fontWeight:600}}>Contraseña</div><input style={SI()} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&doAuth()}/></div>{err&&<div style={{background:"#1e0808",border:"1px solid #5a181844",borderRadius:8,padding:"10px 14px",color:"#f08888",fontSize:12}}>{err}</div>}<button style={SB({width:"100%",padding:"13px 0",fontSize:12,marginTop:4})} onClick={doAuth} disabled={busy}>{busy?<span className="pulse">▪ ▪ ▪</span>:isReg?"CREAR CUENTA":"ENTRAR"}</button></div><div style={{textAlign:"center",marginTop:18,fontSize:12,color:P.mt}}>{isReg?"¿Ya tienes cuenta? ":"¿Primera vez? "}<span style={{color:P.gold,cursor:"pointer",fontWeight:600}} onClick={()=>{setIsReg(!isReg);setErr("");}}>{isReg?"Inicia sesión":"Regístrate"}</span></div></div></div></div>);

  const prodCreativo=fuenteProd==="analizado"?(productos.find(p=>p.id===prodSelId)||productos[0]):prodLibre;
  // M5 Metricas

  // Métricas

  // Tiendas

  // Gastos

  // Aprendizajes

  // Admin

  // Nota flotante

  // Calc flotante
  const[calcVal,setCalcVal]=useState("");
  const[calcHist,setCalcHist]=useState([]);




  useEffect(()=>{
    if(!user||screen!=="app")return;
    clearTimeout(saveRef.current);
    saveRef.current=setTimeout(()=>{
      DB.set("tiendas:"+user.name,tiendas);
      DB.set("gastos:"+user.name,gastos);
      DB.set("aprend:"+user.name,aprend);
      DB.set("floatnote:"+user.name,noteText);
    },2000);
  },[tiendas,gastos,aprend,noteText,user,screen]);

  const doSave=async(silent=false)=>{
    if(!silent)setSaveMsg("guardando...");
    if(user){
      await DB.set("tiendas:"+user.name,tiendas);
      await DB.set("gastos:"+user.name,gastos);
      await DB.set("aprend:"+user.name,aprend);
      await DB.set("floatnote:"+user.name,noteText);
    }
    if(!silent){setSaveMsg("✓ Guardado");setTimeout(()=>setSaveMsg(""),2000);}
  };


  const canAccess=(sec)=>{
    if(!user)return false;
    if(user.role==="admin")return true;
    if(!user.secciones)return true;
    return user.secciones[sec]!==false;
  };

  /* ── TABS ── */
  const TABS=[
    {id:"metricas",l:"📈 Métricas",sec:"Métricas"},
    {id:"tiendas",l:"🏪 Tiendas",sec:"Tiendas"},
    {id:"gastos",l:"💸 Gastos Fijos",sec:null},
    {id:"aprend",l:"📚 Aprendizajes",sec:null},
    {id:"admin",l:"⚙️ Admin",sec:null,adminOnly:true},
  ].filter(t=>(!t.adminOnly||user?.role==="admin")&&(!t.sec||canAccess(t.sec)));

  /* ── LOADING ── */
  if(screen==="loading")return(<div style={{background:P.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}><style>{CSS}</style><div className="pulse" style={{fontFamily:"'Poppins',sans-serif",fontSize:36,fontWeight:800}}><GT>BITÁCORA PRO</GT></div><div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:P.gold,animation:"pulse 1.4s ease-in-out "+(i*0.2)+"s infinite"}}/>)}</div></div>);

  /* ── AUTH ── */
  if(screen==="auth")return(
    <div style={{background:P.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:400}} className="anim">
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:9,color:P.mt2,letterSpacing:5,textTransform:"uppercase",marginBottom:10,fontWeight:300}}>estefani horta</div>
          <h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:48,fontWeight:800,lineHeight:1,margin:0}}><GT>BITÁCORA</GT></h1>
          <h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:48,fontWeight:300,lineHeight:1,color:P.tx,margin:0}}>PRO</h1>
        </div>
        <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:16,padding:28}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><div style={{fontSize:9,letterSpacing:2,color:P.mt,marginBottom:6,textTransform:"uppercase",fontWeight:600}}>Usuario</div><input style={SI()} value={uname} onChange={e=>setUname(e.target.value)} placeholder="tu_usuario" onKeyDown={e=>e.key==="Enter"&&doAuth()} autoCapitalize="none"/></div>
            <div><div style={{fontSize:9,letterSpacing:2,color:P.mt,marginBottom:6,textTransform:"uppercase",fontWeight:600}}>Contraseña</div><input style={SI()} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&doAuth()}/></div>
            {err&&<div style={{background:"#1e0808",border:"1px solid #5a181844",borderRadius:8,padding:"10px 14px",color:"#f08888",fontSize:12}}>{err}</div>}
            <button style={SB({width:"100%",padding:"13px 0",fontSize:12,marginTop:4})} onClick={doAuth} disabled={busy}>{busy?<span className="pulse">▪ ▪ ▪</span>:isReg?"CREAR CUENTA":"ENTRAR"}</button>
          </div>
          <div style={{textAlign:"center",marginTop:18,fontSize:12,color:P.mt}}>{isReg?"¿Ya tienes cuenta? ":"¿Primera vez? "}<span style={{color:P.gold,cursor:"pointer",fontWeight:600}} onClick={()=>{setIsReg(!isReg);setErr("");}}>{isReg?"Inicia sesión":"Regístrate"}</span></div>
        </div>
      </div>
    </div>
  );

  /* ════════ APP ════════ */

  useEffect(()=>{
    const r=()=>setIsMob(window.innerWidth<768);
    window.addEventListener("resize",r);
    return()=>window.removeEventListener("resize",r);
  },[]);
  useEffect(()=>{
    (async()=>{
      try{
        const sess=await DB.get("session:active");
        if(sess&&sess.u&&sess.ph){
          const ud=await DB.get("u:"+sess.u);
          if(ud&&ud.ph===sess.ph&&ud.active!==false){
            setUser({name:sess.u,ph:sess.ph,role:ud.role||"admin",secciones:ud.secciones||null,nc:ud.nc||sess.u});
            const p=await DB.get("productos:"+sess.u)||[];setProductos(p);
            const c=await DB.get("camps:"+sess.u)||[];setCamps(c);
            const t=await DB.get("tiendas:"+sess.u)||[];setTiendas(t);
            const g=await DB.get("gastos:"+sess.u)||[];setGastos(g);
            const a=await DB.get("aprend:"+sess.u)||[];setAprend(a);
            setNoteText(await DB.get("floatnote:"+sess.u)||"");
            const m4s=await DB.get("m4s:"+sess.u)||{};setSavedR(m4s);
            if(ud.role==="admin"){const all=await DB.get("admin:usuarios")||[];setUsuarios(all);}
            const today=todayStr();
            setDate(today);setDay(await DB.get("d:"+sess.u+":"+today)||null);
            setFontSize(ud.fontSize||14);
            setScreen("app");return;
          }
        }
      }catch(e){}
      try{const lu=await DB.get("session:lastuser");if(lu)setUname(lu.u||"");}catch(e){}
      setScreen("auth");
    })();
  },[]);
  const doAuth=async()=>{
    setBusy(true);setErr("");
    const u=uname.trim().toLowerCase().replace(/[\s/\'"+]+/g,"_");
    if(!u||!pass){setErr("Completa todos los campos");setBusy(false);return;}
    if(isReg){
      if(!nombre.trim()){setErr("Ingresa tu nombre");setBusy(false);return;}
      if(pass.length<4){setErr("Minimo 4 caracteres");setBusy(false);return;}
      const ex=await DB.get("u:"+u);
      if(ex){setErr("Usuario ya existe");setBusy(false);return;}
      const nc=(nombre.trim()+" "+apellido.trim()).trim();
      const ud={ph:hash(pass),role:"admin",active:true,nc,fontSize:14};
      await DB.set("u:"+u,ud);
      await DB.set("session:active",{u,ph:hash(pass)});
      await DB.set("session:lastuser",{u});
      setUser({name:u,ph:hash(pass),role:"admin",nc});
      const today=todayStr();setDate(today);setDay(null);
      setScreen("app");
    }else{
      const ud=await DB.get("u:"+u);
      if(!ud){setErr("Usuario no encontrado");setBusy(false);return;}
      if(ud.ph!==hash(pass)){setErr("Contrasena incorrecta");setBusy(false);return;}
      if(ud.active===false){setErr("Cuenta desactivada");setBusy(false);return;}
      await DB.set("session:active",{u,ph:ud.ph});
      await DB.set("session:lastuser",{u});
      setUser({name:u,ph:ud.ph,role:ud.role||"user",secciones:ud.secciones||null,nc:ud.nc||u});
      const p=await DB.get("productos:"+u)||[];setProductos(p);
      const c=await DB.get("camps:"+u)||[];setCamps(c);
      const t=await DB.get("tiendas:"+u)||[];setTiendas(t);
      const g=await DB.get("gastos:"+u)||[];setGastos(g);
      const a=await DB.get("aprend:"+u)||[];setAprend(a);
      setNoteText(await DB.get("floatnote:"+u)||"");
      const m4s=await DB.get("m4s:"+u)||{};setSavedR(m4s);
      if(ud.role==="admin"){const all=await DB.get("admin:usuarios")||[];setUsuarios(all);}
      const today=todayStr();setDate(today);
      setDay(await DB.get("d:"+u+":"+today)||null);
      setFontSize(ud.fontSize||14);
      setScreen("app");
    }
    setBusy(false);
  };
  const logout=async()=>{
    if(day)await DB.set("d:"+(user&&user.name)+":"+date,day);
    await DB.set("session:active",null);
    setUser(null);setScreen("auth");setUname("");setPass("");setNombre("");setApellido("");setMenuOpen(false);
  };
  const doSave=async(silent=false)=>{
    if(!silent)setSaveMsg("guardando...");
    if(user){
      if(day)await DB.set("d:"+user.name+":"+date,day);
      await DB.set("floatnote:"+user.name,noteText);
      const ud=await DB.get("u:"+user.name)||{};
      await DB.set("u:"+user.name,{...ud,fontSize});
      await DB.set("productos:"+user.name,productos);
      await DB.set("camps:"+user.name,camps);
      await DB.set("tiendas:"+user.name,tiendas);
      await DB.set("gastos:"+user.name,gastos);
      await DB.set("aprend:"+user.name,aprend);
      await DB.set("m4s:"+user.name,savedR);
    }
    if(!silent){setSaveMsg("Guardado");setTimeout(()=>setSaveMsg(""),2000);}
  };
  const fn=user&&user.nc?user.nc:(user&&user.name?user.name:"");
  const firstName=fn.split(" ")[0]||fn;
  const MODS=[
    {id:"planner",icon:"📋",label:"Planner",desc:"Planificacion diaria",color:P.gold},
    {id:"productos",icon:"📦",label:"Productos",desc:"Pipeline de productos",color:P.blue},
    {id:"trafficker",icon:"📊",label:"Trafficker",desc:"Campanas Meta Ads",color:P.green},
    {id:"creativos",icon:"🎨",label:"Creativos",desc:"Prompts y guiones",color:P.purple},
    {id:"metricas",icon:"📈",label:"Metricas",desc:"Salud del negocio",color:P.orange},
  ];
  if(screen==="loading")return(<div style={{background:P.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}><style>{CSS}</style><div style={{fontFamily:"'Poppins',sans-serif",fontSize:32,fontWeight:800,lineHeight:1}}><GT>BITACORA PRO</GT></div><div style={{fontSize:9,color:P.mt2,letterSpacing:4,textTransform:"uppercase",marginTop:6,fontWeight:300}}>by Estefani Horta</div><div style={{display:"flex",gap:6,marginTop:12}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:P.gold,animation:"pulse 1.4s ease-in-out "+(i*0.2)+"s infinite"}}/>)}</div></div>);
  if(screen==="auth")return(
    <div style={{background:P.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",position:"relative",overflow:"hidden"}}>
      <style>{CSS}</style>
      <div style={{position:"absolute",top:"8%",left:"50%",transform:"translateX(-50%)",width:360,height:360,borderRadius:"50%",background:P.gold+"08",filter:"blur(80px)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:420,position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:9,color:P.gold,letterSpacing:4,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>BY ESTEFANI HORTA . EDWIN GIRALDO</div>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?44:54,fontWeight:800,lineHeight:.9,marginBottom:4}}><GT>BITACORA</GT></div>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?44:54,fontWeight:200,lineHeight:.9,color:P.tx}}>PRO</div>
          <div style={{display:"flex",alignItems:"center",gap:12,justifyContent:"center",margin:"16px 0 10px"}}>
            <div style={{flex:1,height:"0.5px",background:"linear-gradient(90deg,transparent,"+P.gold3+")"}}/>
            <div style={{width:5,height:5,background:P.gold,transform:"rotate(45deg)"}}/>
            <div style={{flex:1,height:"0.5px",background:"linear-gradient(90deg,"+P.gold3+",transparent)"}}/>
          </div>
          <div style={{fontSize:9,color:P.mt,letterSpacing:3}}>SISTEMA DE GESTION ECOMMERCE COD</div>
        </div>
        <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:18,padding:28,boxShadow:"0 20px 60px #00000066"}}>
          <div style={{fontSize:10,color:P.mt,letterSpacing:2,marginBottom:20,textAlign:"center"}}>{isReg?"CREAR CUENTA":"BIENVENIDA DE VUELTA"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            {isReg&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:5,textTransform:"uppercase",fontWeight:600}}>Nombre</div><input style={SI({fontSize:12})} value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre"/></div>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:5,textTransform:"uppercase",fontWeight:600}}>Apellido</div><input style={SI({fontSize:12})} value={apellido} onChange={e=>setApellido(e.target.value)} placeholder="Tu apellido"/></div>
            </div>}
            <div><div style={{fontSize:9,color:P.mt,marginBottom:5,textTransform:"uppercase",fontWeight:600}}>Usuario</div>
              <input style={SI({fontSize:13})} value={uname} onChange={e=>setUname(e.target.value)} placeholder="tu_usuario" onKeyDown={e=>e.key==="Enter"&&doAuth()} autoCapitalize="none"/>
            </div>
            <div><div style={{fontSize:9,color:P.mt,marginBottom:5,textTransform:"uppercase",fontWeight:600}}>Contrasena</div>
              <input style={SI({fontSize:13})} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&doAuth()}/>
            </div>
            {err&&<div style={{background:"#1e0808",borderRadius:8,padding:"9px 13px",color:"#f08888",fontSize:12}}>{err}</div>}
            <button style={SB({width:"100%",padding:"13px 0",fontSize:12,marginTop:2})} onClick={doAuth} disabled={busy}>{busy?"...":isReg?"CREAR CUENTA":"ENTRAR"}</button>
          </div>
          <div style={{textAlign:"center",marginTop:16,fontSize:12,color:P.mt}}>
            {isReg?"Ya tienes cuenta? ":"Primera vez? "}
            <span style={{color:P.gold,cursor:"pointer",fontWeight:700}} onClick={()=>{setIsReg(!isReg);setErr("");}}>{isReg?"Inicia sesion":"Registrate"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{fontFamily:"'Poppins',sans-serif",background:P.bg,minHeight:"100vh",color:P.tx}}>
      <style>{CSS}</style>
      <div style={{background:"#060604",borderBottom:"1px solid "+P.border,padding:isMob?"9px 14px":"11px 26px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200}}>
        <div style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?16:21,fontWeight:800,cursor:"pointer",lineHeight:1}} onClick={()=>{setModulo("home");setMenuOpen(false);}}><GT>BITACORA PRO</GT></div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {saveMsg&&<span style={{fontSize:10,color:P.green,fontWeight:600}}>{saveMsg}</span>}
          <span style={{fontSize:10,color:P.mt}}>{firstName}</span>
          {user&&user.role==="admin"&&<span style={{background:P.gold+"22",border:"1px solid "+P.gold+"44",borderRadius:12,padding:"2px 8px",fontSize:9,color:P.gold,fontWeight:600}}>ADMIN</span>}
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background:"none",border:"1px solid "+P.border,borderRadius:7,padding:"6px 9px",color:P.mt,display:"flex",flexDirection:"column",gap:4,cursor:"pointer"}}>
            {[0,1,2].map(i=><div key={i} style={{width:16,height:2,background:menuOpen?P.gold:P.mt,borderRadius:1,transition:"all .2s",transform:menuOpen&&i===0?"rotate(45deg) translate(3px,4px)":menuOpen&&i===2?"rotate(-45deg) translate(3px,-4px)":menuOpen&&i===1?"scaleX(0)":"none"}}/>)}
          </button>
        </div>
      </div>
      {menuOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:185}} onClick={()=>setMenuOpen(false)}>
          <div style={{position:"absolute",inset:0,background:"#000000bb"}}/>
          <div style={{position:"absolute",top:0,right:0,width:isMob?"85%":"290px",height:"100vh",background:"#080806",borderLeft:"1px solid "+P.border,display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"18px 18px 14px",borderBottom:"1px solid "+P.border,background:"#060604"}}>
              <div style={{fontSize:8,color:P.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:5,fontWeight:600}}>BY ESTEFANI HORTA . EDWIN GIRALDO</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:800}}><GT>BITACORA PRO</GT></div>
              <div style={{fontSize:10,color:P.mt,marginTop:3}}>{user&&(user.nc||user.name)}</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:12}}>
              {MODS.map(m=>(<button key={m.id} onClick={()=>{setModulo(m.id);setMenuOpen(false);doSave(true);}}
                style={{width:"100%",background:modulo===m.id?m.color+"15":"transparent",border:"1px solid "+(modulo===m.id?m.color+"44":P.border),borderRadius:11,padding:"11px 13px",marginBottom:6,display:"flex",alignItems:"center",gap:11,cursor:"pointer",textAlign:"left"}}>
                <div style={{width:36,height:36,borderRadius:9,background:m.color+"22",border:"1px solid "+m.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{m.icon}</div>
                <div><div style={{fontSize:12,fontWeight:700,color:modulo===m.id?m.color:P.tx}}>{m.label}</div><div style={{fontSize:10,color:P.mt}}>{m.desc}</div></div>
              </button>))}
              <div style={{height:1,background:P.border,margin:"8px 0"}}/>
              <button onClick={()=>{setModulo("home");setMenuOpen(false);}} style={{width:"100%",background:modulo==="home"?P.gold+"15":"transparent",border:"1px solid "+(modulo==="home"?P.gold+"44":P.border),borderRadius:11,padding:"10px 13px",display:"flex",alignItems:"center",gap:11,cursor:"pointer"}}>
                <div style={{width:36,height:36,borderRadius:9,background:P.gold+"22",border:"1px solid "+P.gold+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🏠</div>
                <div style={{fontSize:12,fontWeight:700,color:modulo==="home"?P.gold:P.tx}}>Inicio</div>
              </button>
            </div>
            <div style={{padding:12,borderTop:"1px solid "+P.border,display:"flex",gap:8}}>
              <button style={{...SB({padding:"9px 0",fontSize:11}),flex:1,display:"block",textAlign:"center"}} onClick={()=>{doSave();setMenuOpen(false);}}>Guardar</button>
              <button style={SG({padding:"9px 12px",fontSize:11})} onClick={logout}>Salir</button>
            </div>
          </div>
        </div>
      )}
      {modulo==="home"&&(
        <div style={{padding:isMob?"14px":"26px 30px",maxWidth:1100,margin:"0 auto"}}>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:isMob?19:26,fontWeight:800,marginBottom:3}}>Hola, <GT>{firstName}</GT> 👋</div>
            <div style={{fontSize:11,color:P.mt}}>Que vas a trabajar hoy?</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(5,1fr)",gap:11,marginBottom:18}}>
            {MODS.map(m=>(<button key={m.id} onClick={()=>setModulo(m.id)}
              style={{background:P.card,border:"1px solid "+P.border,borderRadius:15,padding:isMob?"14px 10px":"20px 18px",display:"flex",flexDirection:"column",gap:10,cursor:"pointer",textAlign:"left",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=m.color+"66";e.currentTarget.style.background=m.color+"08";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.background=P.card;}}>
              <div style={{width:40,height:40,borderRadius:10,background:m.color+"22",border:"1px solid "+m.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{m.icon}</div>
              <div><div style={{fontSize:isMob?11:13,fontWeight:700,color:P.tx,marginBottom:2}}>{m.label}</div>
              <div style={{fontSize:9,color:P.mt,lineHeight:1.4}}>{m.desc}</div></div>
            </button>))}
          </div>
          <div style={{borderTop:"1px solid "+P.border,paddingTop:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:7}}>
            <div style={{fontSize:8,color:P.mt2,letterSpacing:1}}>BITACORA PRO by Estefani Horta . Edwin Giraldo</div>
            <button style={SG({padding:"5px 13px",fontSize:10})} onClick={logout}>Cerrar sesion</button>
          </div>
        </div>
      )}
      {modulo==="planner"&&(

      {/* BG */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",height:1,background:"linear-gradient(90deg,transparent,"+(P.gold)+"33,transparent)"}}/>
      </div>

      {/* HEADER */}
      <div style={{background:"#060604",borderBottom:"1px solid "+P.border,padding:isMob?"8px 14px":"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?15:20,fontWeight:800,lineHeight:1}}>
            <GoldText>BITÁCORA PRO</GoldText>
          </div>
          <span style={{color:P.mt2,fontSize:12}}>|</span>
          <span style={{fontSize:11,color:P.mt,fontWeight:400}}>{"@"+(user?.name||"")}</span>
          {user?.role==="admin"&&<span style={{background:P.gold+"22",border:"1px solid "+P.gold+"44",borderRadius:12,padding:"1px 7px",fontSize:9,color:P.gold,letterSpacing:1,fontWeight:600}}>ADMIN</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          {/* Font size control */}
          <FontSizeControl fontSize={fontSize} setFontSize={setFontSize}/>
          {tab==="plan"&&<input type="date" value={date} onChange={e=>changeDate(e.target.value)} style={SI({width:"auto",padding:"5px 10px",fontSize:12})}/>}
          {tab==="plan"&&<button style={SG({padding:"5px 12px",fontSize:11})} onClick={sendWA} title="Enviar resumen a WhatsApp">📱 WA</button>}
          <button style={SB({padding:"7px 16px",fontSize:11})} onClick={()=>doSave()}>{saveMsg||"GUARDAR"}</button>
          <button style={SG({padding:"5px 12px",fontSize:11})} onClick={logout}>Salir</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:"#060604",borderBottom:"1px solid "+P.border,overflowX:"auto",position:"sticky",top:isMob?53:57,zIndex:99}}>
        {TABS.map(({id,icon,label})=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            background:"none",border:"none",
            borderBottom:tab===id?"2px solid "+(P.gold):"2px solid transparent",
            color:tab===id?P.gold:P.mt,
            padding:isMob?"8px 10px":"10px 20px",
            fontFamily:"'Poppins',sans-serif",fontWeight:600,
            fontSize:isMob?9:10,letterSpacing:.8,
            textTransform:"uppercase",whiteSpace:"nowrap",
            transition:"all .2s",display:"flex",alignItems:"center",gap:5
          }}>
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ════ PLANNER ════ */}
      {tab==="plan"&&(
        <div style={{padding:isMob?"12px":"20px",maxWidth:1400,margin:"0 auto"}} className="anim">

          {/* Fecha + progreso */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
            <span style={{fontSize:Math.max(12,fontSize-1),color:P.mt,textTransform:"capitalize",letterSpacing:.3,fontWeight:400}}>{fmtDate(date)}</span>
            <div style={{flex:1,height:"0.5px",background:"linear-gradient(90deg,"+(P.border)+",transparent)"}}/>
            <span style={{fontFamily:"'Poppins',sans-serif",fontSize:Math.max(13,fontSize),color:P.gold,fontWeight:700}}>{pSt.p}% completado</span>
          </div>

          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1.4fr 1fr",gap:14,alignItems:"start"}}>

            {/* COL 1 */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* TOP PRIORIDADES — acordeón */}
              <AccordionSection label="Top Prioridades" defaultOpen={true} fontSize={fontSize}>
                {day.priorities.map((p,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontFamily:"'Poppins',sans-serif",color:P.gold,fontSize:Math.max(13,fontSize),minWidth:22,fontWeight:700}}>{i+1}.</span>
                    <input style={SI({flex:1,fontSize:Math.max(12,fontSize-1),textDecoration:p.d?"line-through":"none",color:p.d?P.mt:P.tx})}
                      value={p.t} placeholder={"Prioridad "+(i+1)+"..."}
                      onChange={e=>{const n=[...day.priorities];n[i]={...n[i],t:e.target.value};setDay({...day,priorities:n});}}/>
                    {CHK(p.d,()=>{const n=[...day.priorities];n[i]={...n[i],d:!n[i].d};setDay({...day,priorities:n});})}
                  </div>
                ))}
              </AccordionSection>

              {/* BRAIN DUMP — acordeón */}
              <AccordionSection label="Brain Dump" defaultOpen={false} fontSize={fontSize}>
                <div style={{fontSize:Math.max(10,fontSize-3),color:P.mt,marginBottom:10,fontWeight:300}}>Vacía tu mente aquí</div>
                {day.dump.map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <span style={{color:P.mt2,fontSize:10,minWidth:14,textAlign:"right"}}>{i+1}</span>
                    <input style={SI({padding:"7px 10px",fontSize:Math.max(12,fontSize-1)})} value={item} placeholder="Escribe aquí..."
                      onChange={e=>{const n=[...day.dump];n[i]=e.target.value;setDay({...day,dump:n});}}/>
                    {i>=3&&(
                      <span style={{cursor:"pointer",color:P.mt2,fontSize:16,lineHeight:1}}
                        onMouseEnter={e=>e.target.style.color=P.red}
                        onMouseLeave={e=>e.target.style.color=P.mt2}
                        onClick={()=>{const n=[...day.dump];n.splice(i,1);setDay({...day,dump:n});}}>×</span>
                    )}
                  </div>
                ))}
                <button style={SG({width:"100%",padding:"7px 0",marginTop:8,fontSize:10,letterSpacing:1.5})}
                  onClick={()=>setDay({...day,dump:[...day.dump,""]})}>+ AÑADIR</button>
              </AccordionSection>

              {/* WA RESUMEN */}
              <div style={{background:"#0a0f08",border:`1px solid #4dba7f33`,borderRadius:12,padding:14}}>
                <div style={{fontSize:Math.max(9,fontSize-4),color:P.green,letterSpacing:1.5,marginBottom:6,textTransform:"uppercase",fontWeight:600}}>📱 Resumen WhatsApp</div>
                <div style={{fontSize:Math.max(11,fontSize-2),color:P.mt,marginBottom:10,lineHeight:1.6,fontWeight:300}}>
                  Envío automático a las 11:59 PM o manualmente ahora.
                </div>
                <button style={SG({width:"100%",padding:"8px 0",fontSize:11,color:P.green,borderColor:"#4dba7f44"})} onClick={sendWA}>
                  Enviar Resumen Ahora →
                </button>
              </div>
            </div>

            {/* COL 2 — HORARIO */}
            <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18,maxHeight:isMob?"none":"78vh",overflowY:"auto",display:"flex",flexDirection:"column"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <div style={{width:3,height:14,background:"linear-gradient(180deg,"+P.gold+","+P.gold3+")",borderRadius:2,flexShrink:0}}/>
                <span style={{fontSize:Math.max(9,fontSize-4),color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Horario del Día</span>
              </div>
              {day.sched.map((slot,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
                  <input style={SI({width:76,minWidth:76,padding:"6px 6px",fontSize:Math.max(11,fontSize-2),textAlign:"center",color:P.gold,fontWeight:600})}
                    value={slot.h} onChange={e=>{const n=[...day.sched];n[i]={...n[i],h:e.target.value};setDay({...day,sched:n});}}/>
                  <input style={SI({flex:1,padding:"6px 10px",fontSize:Math.max(12,fontSize-1),textDecoration:slot.done?"line-through":"none",color:slot.done?P.mt:P.tx})}
                    value={slot.task} placeholder="Tarea..."
                    onChange={e=>{const n=[...day.sched];n[i]={...n[i],task:e.target.value};setDay({...day,sched:n});}}/>
                  {CHK(slot.done,()=>{const n=[...day.sched];n[i]={...n[i],done:!n[i].done};setDay({...day,sched:n});})}
                  <span style={{cursor:"pointer",color:P.mt2,fontSize:16,lineHeight:1,flexShrink:0}}
                    onMouseEnter={e=>e.target.style.color=P.red}
                    onMouseLeave={e=>e.target.style.color=P.mt2}
                    onClick={()=>{const n=[...day.sched];n.splice(i,1);setDay({...day,sched:n});}}>×</span>
                </div>
              ))}
              <button style={SG({width:"100%",padding:"8px 0",marginTop:10,fontSize:10,letterSpacing:1.5})}
                onClick={()=>setDay({...day,sched:[...day.sched,{h:"",task:"",done:false}]})}>+ AÑADIR HORA</button>
            </div>

            {/* COL 3 */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* CUMPLIMIENTO */}
              <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <div style={{width:3,height:14,background:"linear-gradient(180deg,"+P.gold+","+P.gold3+")",borderRadius:2}}/>
                  <span style={{fontSize:Math.max(9,fontSize-4),color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Cumplimiento</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  {(()=>{const r=62,c=2*Math.PI*r;return(
                    <svg width={150} height={150} viewBox="0 0 150 150">
                      <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={P.gold}/><stop offset="100%" stopColor={P.gold2}/></linearGradient></defs>
                      <circle cx="75" cy="75" r={r} fill="none" stroke={P.card2} strokeWidth="12"/>
                      <circle cx="75" cy="75" r={r} fill="none" stroke="url(#cg)" strokeWidth="12" strokeDasharray={c} strokeDashoffset={c*(1-pSt.p/100)} strokeLinecap="round" transform="rotate(-90 75 75)" style={{transition:"stroke-dashoffset .8s"}}/>
                      <text x="75" y="69" textAnchor="middle" fill={P.gold} fontFamily="Poppins,sans-serif" fontSize="28" fontWeight="700">{pSt.p}%</text>
                      <text x="75" y="86" textAnchor="middle" fill={P.mt} fontFamily="Poppins,sans-serif" fontSize="10">{pSt.d} de {pSt.t} tareas</text>
                    </svg>
                  );})()}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,width:"100%",marginTop:8}}>
                    {[{l:"Prioridades",d:pSt.pd,t:pSt.pt},{l:"Horario",d:pSt.sd,t:pSt.stt}].map(({l,d,t})=>(
                      <div key={l} style={{background:P.bg2,borderRadius:8,padding:"10px 12px",border:"1px solid "+P.border}}>
                        <div style={{fontSize:Math.max(9,fontSize-4),color:P.mt,marginBottom:4,letterSpacing:.8,textTransform:"uppercase",fontWeight:500}}>{l}</div>
                        <div style={{fontSize:Math.max(16,fontSize+2),fontWeight:700,color:P.gold}}>
                          {d}<span style={{fontSize:Math.max(10,fontSize-3),color:P.mt,fontWeight:400}}> /{t}</span>
                        </div>
                        <div style={{height:3,background:P.card2,borderRadius:2,marginTop:6}}>
                          <div style={{height:3,borderRadius:2,background:"linear-gradient(90deg,"+(P.gold)+","+(P.gold2)+")",width:(t?Math.round(d/t*100):0)+"%",transition:"width .6s"}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* NOTAS RÁPIDAS — acordeón */}
              <AccordionSection label="Notas Rápidas" defaultOpen={false} fontSize={fontSize}>
                <textarea style={SI({height:160,resize:"vertical",lineHeight:1.7,fontSize:Math.max(12,fontSize-1)})}
                  value={day.notes} placeholder="Ideas, pensamientos, recordatorios..."
                  onChange={e=>setDay({...day,notes:e.target.value})}/>
              </AccordionSection>

            </div>
          </div>
        </div>
      )}

      {/* OTRAS TABS */}
      {tab!=="plan"&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:16}} className="anim">
          <div style={{fontSize:40}}>{TABS.find(t=>t.id===tab)?.icon}</div>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:22,fontWeight:700}}><GoldText>{TABS.find(t=>t.id===tab)?.label}</GoldText></div>
          <div style={{fontSize:Math.max(12,fontSize-1),color:P.mt,textAlign:"center",maxWidth:320,lineHeight:1.7,fontWeight:300}}>
            Próxima entrega — Módulo 2.<br/><span style={{color:P.gold2}}>Módulo 1 completado ✦</span>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{borderTop:"1px solid "+P.border,padding:"10px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:20,background:"#060604"}}>
        <div style={{fontSize:9,color:P.mt2,letterSpacing:2,fontWeight:300}}>BITÁCORA PRO · by Estefani Horta</div>
        <button style={SB({padding:"7px 20px",fontSize:11})} onClick={()=>doSave()}>{saveMsg||"💾 GUARDAR"}</button>
      </div>

      {/* NOTA FLOTANTE */}
      <div style={{position:"fixed",bottom:20,right:noteOpen?76:20,zIndex:300,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10}}>
        {noteOpen&&(
          <div style={{background:P.card,border:"1px solid "+P.borderG,borderRadius:14,padding:14,width:isMob?280:320,boxShadow:"0 8px 32px #00000066"}} className="anim">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:Math.max(10,fontSize-3),color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Nota Rápida</span>
              <button onClick={()=>{setNoteOpen(false);DB.set("floatnote:"+(user.name),noteText);}} style={{background:"none",border:"none",color:P.mt,fontSize:18,lineHeight:1,padding:0}}>×</button>
            </div>
            <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Escribe aquí tu nota..."
              style={SI({height:140,resize:"none",lineHeight:1.6,fontSize:Math.max(12,fontSize-1)})}/>
            <button style={SG({width:"100%",padding:"6px 0",marginTop:8,fontSize:10})}
              onClick={()=>{DB.set("floatnote:"+(user.name),noteText);setSaveMsg("✓ Nota guardada");setTimeout(()=>setSaveMsg(""),1500);}}>
              Guardar nota
            </button>
          </div>
        )}
        <button onClick={()=>setNoteOpen(!noteOpen)}
          style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,"+P.gold+","+P.gold3+")",border:"none",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px "+(P.gold)+"44",transition:"transform .2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>📝</button>
      </div>

      {/* CALC FLOTANTE */}
      <div style={{position:"fixed",bottom:20,right:20,zIndex:300,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10}}>
        {calcOpen&&(
          <div style={{background:P.card,border:"1px solid "+P.borderG,borderRadius:14,padding:14,width:210,boxShadow:"0 8px 32px #00000066"}} className="anim">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:Math.max(10,fontSize-3),color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Costeo Rápido</span>
              <button onClick={()=>setCalcOpen(false)} style={{background:"none",border:"none",color:P.mt,fontSize:18,lineHeight:1,padding:0}}>×</button>
            </div>
            <div style={{minHeight:60,marginBottom:8}}>
              {calcHistory.map((h,i)=>(
                <div key={i} style={{fontSize:11,color:i===0?P.gold2:P.mt,padding:"2px 0",fontFamily:"monospace",borderBottom:i===0?"1px solid "+P.border:"none"}}>{h}</div>
              ))}
            </div>
            <input style={SI({fontSize:14,fontFamily:"monospace",padding:"8px 10px"})}
              value={calcVal} onChange={e=>setCalcVal(e.target.value)} placeholder="ej: 50000*0.3"
              onKeyDown={e=>e.key==="Enter"&&evalCalc()}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>
              <button style={SG({padding:"7px 0",fontSize:11})} onClick={()=>{setCalcVal("");setCalcHistory([]);}}>Limpiar</button>
              <button style={SB({padding:"7px 0",fontSize:11})} onClick={evalCalc}>=</button>
            </div>
          </div>
        )}
        <button onClick={()=>setCalcOpen(!calcOpen)}
          style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,"+P.gold+","+P.gold3+")",border:"none",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px "+(P.gold)+"44",transition:"transform .2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>🧮</button>
      </div>

      )}
      {modulo==="productos"&&(
      </div>

      <div style={{padding:isMob?"12px":"20px",maxWidth:1200,margin:"0 auto"}} className="anim">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div>
            <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?20:28,fontWeight:800,margin:0}}><GT>Productos</GT></h2>
            <div style={{fontSize:12,color:P.mt,marginTop:2}}>{productos.length} productos · {productos.filter(p=>p.estado==="Escalando").length} escalando</div>
          </div>
          <button style={SB({padding:"10px 22px",fontSize:12})} onClick={()=>{const p=newProd();setProductos(prev=>[p,...prev]);setSelProd(p.id);}}>+ NUEVO PRODUCTO</button>
        </div>

        {/* Buscador */}
        <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:1,minWidth:200}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:P.mt,fontSize:14}}>🔍</span>
            <input style={SI({paddingLeft:36})} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar producto..."/>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["Todos",...ESTADOS].map(est=>(
              <button key={est} onClick={()=>setFiltroEst(est)} style={{background:filtroEst===est?(EST_COL[est]||P.gold):"transparent",border:"1px solid "+(filtroEst===est?(EST_COL[est]||P.gold):P.border),borderRadius:20,color:filtroEst===est?"#080400":(EST_COL[est]||P.mt),padding:"5px 12px",fontSize:10,fontWeight:600,fontFamily:"'Poppins',sans-serif",transition:"all .2s"}}>{est}</button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat("+(isMob?3:6)+",1fr)",gap:8,marginBottom:20}}>
          {ESTADOS.map(est=>{const n=productos.filter(p=>p.estado===est).length;return(
            <div key={est} style={{background:P.card,border:"1px solid "+(EST_COL[est])+"33",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:800,color:EST_COL[est]}}>{n}</div>
              <div style={{fontSize:9,color:P.mt,letterSpacing:.8,textTransform:"uppercase",fontWeight:600,marginTop:2}}>{est}</div>
            </div>
          );})}
        </div>

        {/* Tabla */}
        {prodsFiltrados.visibles.length===0&&prodsFiltrados.ocultos.length===0?(
          <div style={{textAlign:"center",padding:"60px 20px",color:P.mt}}>
            <div style={{fontSize:40,marginBottom:12}}>📦</div>
            <div style={{fontSize:16,fontWeight:600,marginBottom:6}}>No hay productos aún</div>
            <button style={SB({padding:"10px 28px",fontSize:12,marginTop:10})} onClick={()=>{const p=newProd();setProductos([p]);setSelProd(p.id);}}>+ CREAR PRIMER PRODUCTO</button>
          </div>
        ):(
          <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,overflow:"hidden",marginBottom:16}}>
            <div style={{display:"grid",gridTemplateColumns:isMob?"48px 1fr 80px":"56px 1fr 130px 120px 100px 110px 90px",padding:"10px 16px",borderBottom:"1px solid "+P.border,background:P.bg2}}>
              {["","Producto","Estado","Etapa","Progreso","Precio",""].map((h,i)=>(!isMob||[0,1,6].includes(i))&&<div key={i} style={{fontSize:9,color:P.mt,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>{h}</div>)}
            </div>
            {prodsFiltrados.visibles.map(p=>{
              const dd=DEV_STEPS.filter(s=>p.desarrollo?.steps?.[s.key]?.done).length;
              const dp=Math.round(dd/DEV_STEPS.length*100);
              const ea=ETAPAS.find(e=>e.id===p.etapa);
              return(
                <div key={p.id} className="hr" style={{display:"grid",gridTemplateColumns:isMob?"48px 1fr 80px":"56px 1fr 130px 120px 100px 110px 90px",padding:"12px 16px",borderBottom:"1px solid "+P.border,cursor:"pointer"}} onClick={()=>setSelProd(p.id)}>
                  <div style={{width:40,height:40,borderRadius:8,overflow:"hidden",background:P.bg2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {p.foto?<img src={p.foto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:18}}>📦</span>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",justifyContent:"center",paddingLeft:10,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:p.pinned?P.gold:P.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {p.pinned&&<span style={{color:P.gold,fontSize:10,marginRight:4}}>📌</span>}
                      {p.nombre||<span style={{color:P.mt,fontStyle:"italic"}}>Sin nombre</span>}
                    </div>
                    <div style={{fontSize:10,color:P.mt,marginTop:2}}>{p.fecha}</div>
                  </div>
                  {!isMob&&<div style={{display:"flex",alignItems:"center"}}><span style={{background:(EST_COL[p.estado]||P.mt)+"22",border:"1px solid "+(EST_COL[p.estado]||P.mt)+"44",borderRadius:12,padding:"3px 10px",fontSize:10,color:EST_COL[p.estado]||P.mt,fontWeight:600}}>{p.estado}</span></div>}
                  {!isMob&&<div style={{display:"flex",alignItems:"center"}}><span style={{fontSize:11,color:P.mt}}>{ea?.icon} {ea?.label}</span></div>}
                  {!isMob&&<div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1,height:4,background:P.bg2,borderRadius:2}}><div style={{height:4,borderRadius:2,background:dp===100?P.green:P.gold,width:(dp)+"%",transition:"width .5s"}}/></div>
                    <span style={{fontSize:10,color:P.mt,minWidth:30}}>{dp}%</span>
                  </div>}
                  {!isMob&&<div style={{display:"flex",alignItems:"center"}}><span style={{fontSize:12,color:P.gold,fontWeight:600}}>{p.investigacion?.valorVenta?COP(+p.investigacion.valorVenta):"—"}</span></div>}
                  <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}} onClick={e=>e.stopPropagation()}>
                    <button title={p.pinned?"Desfijar":"Fijar"} onClick={()=>updProd(p.id,{pinned:!p.pinned})} style={{background:"none",border:"none",color:p.pinned?P.gold:P.mt2,fontSize:14,padding:3}}>📌</button>
                    <button title="Ocultar" onClick={()=>updProd(p.id,{hidden:true})} style={{background:"none",border:"none",color:P.mt2,fontSize:14,padding:3}}>👁</button>
                    <button title="Eliminar" onClick={()=>setConfirmDel(p.id)} style={{background:"none",border:"none",color:P.mt2,fontSize:14,padding:3}}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ocultos */}
        {prodsFiltrados.ocultos.length>0&&(
          <details style={{marginTop:8}}>
            <summary style={{fontSize:11,color:P.mt,cursor:"pointer",padding:"8px 0",letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>📁 Productos Ocultos ({prodsFiltrados.ocultos.length})</summary>
            <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,overflow:"hidden",marginTop:8}}>
              {prodsFiltrados.ocultos.map(p=>(
                <div key={p.id} className="hr" style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:"1px solid "+P.border}}>
                  <span style={{flex:1,fontSize:12,color:P.mt}}>{p.nombre||"Sin nombre"}</span>
                  <button onClick={()=>updProd(p.id,{hidden:false})} style={SG({padding:"4px 12px",fontSize:10})}>Mostrar</button>
                  <button onClick={()=>setSelProd(p.id)} style={SB({padding:"4px 12px",fontSize:10})}>Abrir</button>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Modal eliminar */}
      {confirmDel&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:16,padding:28,maxWidth:360,width:"100%",textAlign:"center"}} className="anim">
            <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>¿Eliminar producto?</div>
            <div style={{fontSize:13,color:P.mt,marginBottom:20}}>Esta acción no se puede deshacer.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button style={SG({padding:"9px 20px",fontSize:12})} onClick={()=>setConfirmDel(null)}>Cancelar</button>
              <button style={{...SB({padding:"9px 20px",fontSize:12}),background:"linear-gradient(135deg,#c04040,#8a2020)"}} onClick={()=>{setProductos(prev=>prev.filter(p=>p.id!==confirmDel));setConfirmDel(null);}}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
      )}
      {modulo==="trafficker"&&(

      {/* HEADER */}
      <div style={{background:"#060604",borderBottom:"1px solid "+P.border,padding:isMob?"8px 14px":"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?15:20,fontWeight:800}}><GT>BITÁCORA PRO</GT></div>
          <span style={{color:P.mt2}}>|</span><span style={{fontSize:11,color:P.mt}}>📊 Trafficker</span>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <button style={SB({padding:"7px 14px",fontSize:11})} onClick={()=>{setEditCamp(newCamp());setShowForm(true);}}>+ CAMPAÑA</button>
          <button style={{...SG({padding:"7px 12px",fontSize:10}),color:P.mt,borderColor:P.border}} title="Recargar datos de ejemplo" onClick={()=>{const s=buildSamples();setCamps(s);if(user)DB.set("camps:"+(user.name),s);}}>↺ Ejemplos</button>
          <button style={SB({padding:"7px 16px",fontSize:11})} onClick={()=>doSave()}>{saveMsg||"GUARDAR"}</button>
          <button style={SG({padding:"5px 12px",fontSize:11})} onClick={logout}>Salir</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:"#060604",borderBottom:"1px solid "+P.border,overflowX:"auto",position:"sticky",top:isMob?53:57,zIndex:99}}>
        {[{id:"dashboard",l:"📊 Dashboard"},{id:"campanas",l:"📋 Campañas"},{id:"dropi",l:"🚚 Dropi"},{id:"meta",l:"📣 Meta Ads"},{id:"notas",l:"📝 Notas"}].map(({id,l})=>(
          <button key={id} onClick={()=>setVistaTab(id)} style={{background:"none",border:"none",borderBottom:vistaTab===id?"2px solid "+(P.gold):"2px solid transparent",color:vistaTab===id?P.gold:P.mt,padding:isMob?"8px 10px":"10px 20px",fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:isMob?9:10,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap",transition:"all .2s"}}>{l}</button>
        ))}
      </div>

      {/* FILTRO PERÍODO */}
      <div style={{background:"#060604",borderBottom:"1px solid "+P.border,padding:"8px 16px",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        <span style={{fontSize:9,color:P.mt,letterSpacing:1,textTransform:"uppercase",fontWeight:600,marginRight:4}}>Período:</span>
        {PERIODOS.map(({id,l})=>(
          <button key={id} onClick={()=>setPeriodo(id)} style={{background:periodo===id?P.gold:"transparent",border:"1px solid "+(periodo===id?P.gold:P.border),borderRadius:20,color:periodo===id?"#1a0d00":P.mt,padding:"3px 10px",fontSize:10,fontWeight:600,fontFamily:"'Poppins',sans-serif",transition:"all .2s"}}>{l}</button>
        ))}
        <button onClick={()=>setPeriodo("fecha")} style={{background:periodo==="fecha"?P.gold:"transparent",border:"1px solid "+(periodo==="fecha"?P.gold:P.border),borderRadius:20,color:periodo==="fecha"?"#1a0d00":P.mt,padding:"3px 10px",fontSize:10,fontWeight:600,fontFamily:"'Poppins',sans-serif",transition:"all .2s"}}>📅 Día</button>
        {periodo==="fecha"&&<input type="date" value={fechaUnica} onChange={e=>setFechaUnica(e.target.value)} style={SI({width:"auto",padding:"3px 8px",fontSize:11})}/>}
        <span style={{marginLeft:"auto",fontSize:10,color:P.gold,fontWeight:600}}>{campsActivas.length} campañas</span>
      </div>

      {importMsg&&<div style={{background:importMsg.startsWith("✓")?"#0a1a0a":"#1a0808",borderBottom:"1px solid "+(importMsg.startsWith("✓")?P.green:P.red)+"33",padding:"8px 20px",fontSize:12,color:importMsg.startsWith("✓")?P.green:P.red,fontWeight:600}}>{importMsg}</div>}

      <div style={{padding:isMob?"12px":"20px",maxWidth:1400,margin:"0 auto"}}>

        {/* ════ DASHBOARD ════ */}
        {vistaTab==="dashboard"&&(
          <div className="anim">
            {campsActivas.length===0&&<div style={{background:P.bg2,border:"1px solid "+P.border,borderRadius:12,padding:"24px",textAlign:"center",marginBottom:16,color:P.mt,fontSize:13}}>Sin campañas en este período — cambia el filtro o agrega campañas.</div>}

            {M.alertas.length>0&&(
              <div style={{background:"#140808",border:"1px solid "+P.red+"33",borderRadius:12,padding:"10px 16px",marginBottom:12,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:10,color:P.red,fontWeight:700,letterSpacing:1,marginRight:4}}>⚠ ALERTAS</span>
                {M.alertas.slice(0,5).map((a,i)=>(
                  <span key={i} style={{background:(a.color)+"22",border:"1px solid "+(a.color)+"44",borderRadius:20,padding:"2px 10px",fontSize:10,color:a.color,fontWeight:600}}>{a.tipo}: {a.val} — {a.camp}</span>
                ))}
              </div>
            )}

            {/* KPIs rentabilidad */}
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:10}}>
              <MCard label="Inversión Ads" value={COP(M.inv)} icon="💸" color={P.mt}/>
              <MCard label="Ingresos Dropi" value={COP(M.ing)} icon="💰" color={P.gold}/>
              <MCard label="Profit Neto" value={COP(M.profit)} icon="📈" color={M.profit>=0?P.green:P.red} sub={M.profit>=0?"✓ Rentable":"↓ En pérdida"}/>
              <MCard label="ROAS" value={M.roas.toFixed(2)+"x"} icon="🎯" color={M.roas>=2?P.green:M.roas>=1?P.gold:P.red}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:12}}>
              <MCard label="Ventas" value={M.ven+" uds"} icon="🛒" color={P.blue}/>
              <MCard label="CTR Prom." value={PCT(M.ctr)} icon="👆" color={M.ctr>=2?P.green:M.ctr>=1?P.gold:P.red}/>
              <MCard label="CPA Prom." value={COP(M.cpa)} icon="💡" color={M.cpa>0&&M.cpa<30000?P.green:M.cpa<50000?P.gold:P.mt}/>
              <MCard label="Activas" value={M.activas+"/"+M.total} icon="⚡" color={P.purple}/>
            </div>

            {/* BLOQUE PÉRDIDAS */}
            <div style={{background:"#120808",border:"1px solid "+P.red+"33",borderRadius:14,padding:16,marginBottom:12}}>
              <SH label="💀 Pérdidas y Productos Fallidos"/>
              <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(3,1fr)",gap:10,marginBottom:M.perdidas.length>0?12:0}}>
                <MCard label="Dinero Perdido en Pauta" value={COP(M.dinPerdido)} icon="🔴" color={P.red} alert={M.dinPerdido>0}/>
                <MCard label="Campañas Sin Ventas" value={M.perdidas.length} icon="📉" color={M.perdidas.length>0?P.red:P.mt} sub={M.perdidas.length>0?"Inversión sin retorno":"Todo ok"}/>
                <MCard label="Camps con Profit Negativo" value={M.campsPerdida.length} icon="⛔" color={M.campsPerdida.length>0?P.orange:P.mt} sub={M.campsPerdida.length>0?"Revisar o pausar":""}/>
              </div>
              {M.perdidas.length>0&&(
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                    <thead><tr>{["Campaña","Producto","Fecha","Inversión Perdida"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:"left",fontSize:9,color:P.red,letterSpacing:1,textTransform:"uppercase",borderBottom:"1px solid "+(P.red)+"22",fontWeight:600}}>{h}</th>)}</tr></thead>
                    <tbody>{M.perdidas.map(c=>(
                      <tr key={c.id} style={{borderBottom:"1px solid "+(P.red)+"11"}}>
                        <td style={{padding:"7px 10px",color:P.tx,fontSize:12}}>{c.campana||"—"}</td>
                        <td style={{padding:"7px 10px",color:P.mt,fontSize:12}}>{c.producto||"—"}</td>
                        <td style={{padding:"7px 10px",color:P.mt,fontSize:12}}>{c.fecha}</td>
                        <td style={{padding:"7px 10px",color:P.red,fontWeight:700,fontSize:12}}>{COP(+c.inversion)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Gráfico */}
            {M.chart.length>0&&(
              <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18,marginBottom:12}}>
                <SH label="Ingresos por Fecha"/>
                <BarChart data={M.chart} color={P.gold} height={100}/>
              </div>
            )}

            {/* Por producto */}
            {Object.keys(M.byProd).length>0&&(
              <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18,marginBottom:12}}>
                <SH label="Rendimiento por Producto"/>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:450}}>
                    <thead><tr>{["Producto","Inversión","Ingresos","Profit","Ventas","ROAS"].map(h=><th key={h} style={{padding:"7px 12px",textAlign:"left",fontSize:9,color:P.mt,letterSpacing:1.5,textTransform:"uppercase",borderBottom:"1px solid "+P.border,fontWeight:600}}>{h}</th>)}</tr></thead>
                    <tbody>{Object.entries(M.byProd).sort((a,b)=>b[1].profit-a[1].profit).map(([prod,d])=>(
                      <tr key={prod} className="hr" style={{borderBottom:"1px solid "+P.border}}>
                        <td style={{padding:"8px 12px",color:P.tx,fontWeight:600}}>{prod}</td>
                        <td style={{padding:"8px 12px",color:P.mt}}>{COP(d.inv)}</td>
                        <td style={{padding:"8px 12px",color:P.gold,fontWeight:600}}>{COP(d.ing)}</td>
                        <td style={{padding:"8px 12px",color:d.profit>=0?P.green:P.red,fontWeight:700}}>{COP(d.profit)}</td>
                        <td style={{padding:"8px 12px",color:P.mt}}>{d.ven}</td>
                        <td style={{padding:"8px 12px",color:d.inv>0&&d.ing/d.inv>=2?P.green:P.gold,fontWeight:700}}>{d.inv>0?(d.ing/d.inv).toFixed(2)+"x":"—"}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                {/* Barras */}
                <div style={{marginTop:14}}>
                  {Object.entries(M.byProd).map(([prod,d])=>{
                    const mx=Math.max(...Object.values(M.byProd).map(x=>x.ing),1);
                    return(
                      <div key={prod} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:11,color:P.tx,fontWeight:600}}>{prod}</span>
                          <span style={{fontSize:10,color:d.profit>=0?P.green:P.red,fontWeight:700}}>Profit: {COP(d.profit)}</span>
                        </div>
                        {[{l:"Inversión",v:d.inv,c:P.mt},{l:"Ingresos",v:d.ing,c:P.gold}].map(({l,v,c})=>(
                          <div key={l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                            <span style={{fontSize:9,color:P.mt,minWidth:55,textTransform:"uppercase"}}>{l}</span>
                            <div style={{flex:1,height:6,background:P.border,borderRadius:3,overflow:"hidden"}}>
                              <div style={{height:"100%",borderRadius:3,background:c,width:(Math.round(v/mx*100))+"%",transition:"width .8s"}}/>
                            </div>
                            <span style={{fontSize:10,color:c,minWidth:78,textAlign:"right",fontWeight:600}}>{COP(v)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Por cuenta */}
            {Object.keys(M.byCuenta).length>0&&(
              <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                <SH label="Por Cuenta Publicitaria"/>
                <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                  {Object.entries(M.byCuenta).map(([cuenta,d])=>(
                    <div key={cuenta} style={{background:P.bg2,borderRadius:10,padding:"12px 14px",border:"1px solid "+P.border}}>
                      <div style={{fontSize:11,color:P.gold,fontWeight:700,marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cuenta}</div>
                      {[["Inversión",COP(d.inv),P.mt],["Ingresos",COP(d.ing),P.gold],["Camps",d.n,P.mt]].map(([l,v,c])=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:10,color:P.mt}}>{l}</span>
                          <span style={{fontSize:11,color:c,fontWeight:600}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ CAMPAÑAS ════ */}
        {vistaTab==="campanas"&&(
          <div className="anim">
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
              {[{id:"periodo",l:"Por período"},{id:"producto",l:"Por producto"}].map(({id,l})=>(
                <button key={id} onClick={()=>setVistaCamps(id)} style={{background:vistaCamps===id?P.gold:"transparent",border:"1px solid "+(vistaCamps===id?P.gold:P.border),borderRadius:20,color:vistaCamps===id?"#1a0d00":P.mt,padding:"4px 14px",fontSize:11,fontWeight:600,fontFamily:"'Poppins',sans-serif",transition:"all .2s"}}>{l}</button>
              ))}
              {vistaCamps==="producto"&&<select style={SI({width:"auto",padding:"4px 10px",fontSize:12})} value={selProd} onChange={e=>setSelProd(e.target.value)}>{productos.map(p=><option key={p}>{p}</option>)}</select>}
              <div style={{marginLeft:"auto",fontSize:11,color:P.mt}}>{campsTabla.length} campañas</div>
            </div>
            {campsTabla.length===0?(
              <div style={{textAlign:"center",padding:"40px",color:P.mt}}>
                <div style={{fontSize:32,marginBottom:8}}>📊</div>
                <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Sin campañas</div>
                <button style={SB({padding:"8px 20px",fontSize:11})} onClick={()=>{setEditCamp(newCamp());setShowForm(true);}}>+ NUEVA CAMPAÑA</button>
              </div>
            ):(
              <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,overflow:"hidden"}}>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:700}}>
                    <thead><tr style={{background:P.bg2}}>{["Fecha","Producto","Campaña","Inversión","Ingresos","Profit","ROAS","CTR%","CPA","Estado",""].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:9,color:P.mt,letterSpacing:1.2,textTransform:"uppercase",borderBottom:"1px solid "+P.border,fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {campsTabla.map(c=>{
                        const profit=(+c.ingresos||0)-(+c.inversion||0)-(+c.costoDropi||0);
                        const roas=(+c.inversion||0)>0?(+c.ingresos||0)/(+c.inversion||0):0;
                        const sinVentas=(+c.ingresos||0)===0&&(+c.inversion||0)>0;
                        return(
                          <tr key={c.id} className="hr" style={{borderBottom:"1px solid "+P.border,background:sinVentas?"#140808":undefined}}>
                            <td style={{padding:"8px 12px",color:P.mt,whiteSpace:"nowrap"}}>{c.fecha}</td>
                            <td style={{padding:"8px 12px",color:P.tx,fontWeight:600,maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.producto||"—"}</td>
                            <td style={{padding:"8px 12px",color:P.mt,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.campana||"—"}</td>
                            <td style={{padding:"8px 12px",color:P.mt}}>{COP(+c.inversion)}</td>
                            <td style={{padding:"8px 12px",color:P.gold,fontWeight:600}}>{COP(+c.ingresos)}</td>
                            <td style={{padding:"8px 12px",color:profit>=0?P.green:P.red,fontWeight:700}}>{COP(profit)}</td>
                            <td style={{padding:"8px 12px",color:roas>=2?P.green:roas>=1?P.gold:P.red,fontWeight:700}}>{roas>0?roas.toFixed(2)+"x":"—"}</td>
                            <td style={{padding:"8px 12px",color:(+c.ctr||0)>=2?P.green:(+c.ctr||0)>=1?P.gold:P.mt}}>{c.ctr>0?PCT(+c.ctr):"—"}</td>
                            <td style={{padding:"8px 12px",color:(+c.cpa||0)>0&&(+c.cpa||0)<30000?P.green:(+c.cpa||0)<50000?P.gold:P.mt}}>{c.cpa>0?COP(+c.cpa):"—"}</td>
                            <td style={{padding:"8px 12px"}}><span style={{background:(EST_COL[c.estado]||P.mt)+"22",border:"1px solid "+(EST_COL[c.estado]||P.mt)+"44",borderRadius:12,padding:"2px 8px",fontSize:10,color:EST_COL[c.estado]||P.mt,fontWeight:600,whiteSpace:"nowrap"}}>{c.estado}</span></td>
                            <td style={{padding:"8px 12px"}}>
                              <div style={{display:"flex",gap:5}}>
                                <button style={SG({padding:"3px 10px",fontSize:10})} onClick={()=>{setEditCamp({...c});setShowForm(true);}}>Editar</button>
                                <button style={{background:"transparent",border:"1px solid #3a1010",borderRadius:6,color:P.red,padding:"3px 8px",fontSize:10}} onClick={()=>setConfirmDel(c.id)}>✕</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{background:P.bg2,borderTop:"1px solid "+P.gold+"33"}}>
                        <td colSpan={3} style={{padding:"8px 12px",fontSize:9,color:P.gold,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Totales</td>
                        <td style={{padding:"8px 12px",color:P.mt,fontWeight:700}}>{COP(campsTabla.reduce((a,c)=>a+(+c.inversion||0),0))}</td>
                        <td style={{padding:"8px 12px",color:P.gold,fontWeight:700}}>{COP(campsTabla.reduce((a,c)=>a+(+c.ingresos||0),0))}</td>
                        <td style={{padding:"8px 12px",fontWeight:700,color:(()=>{const p=campsTabla.reduce((a,c)=>a+(+c.ingresos||0)-(+c.inversion||0)-(+c.costoDropi||0),0);return p>=0?P.green:P.red;})()}}>{COP(campsTabla.reduce((a,c)=>a+(+c.ingresos||0)-(+c.inversion||0)-(+c.costoDropi||0),0))}</td>
                        <td colSpan={5}/>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ DROPI ════ */}
        {vistaTab==="dropi"&&(
          <div className="anim">
            <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:20,marginBottom:14}}>
              <SH label="Importar Archivo Dropi"/>
              <div style={{fontSize:12,color:P.mt,marginBottom:12,lineHeight:1.6}}>
                Sube el Excel de pedidos de Dropi. La app detecta automáticamente entregados, cancelados, devueltos y calcula tu efectividad real.
              </div>
              <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:100,border:"2px dashed "+(P.border),borderRadius:12,cursor:"pointer",gap:8,background:P.bg2,transition:"border-color .2s"}}>
                <span style={{fontSize:28}}>📤</span>
                <span style={{fontSize:12,color:P.mt}}>Subir CSV o Excel de Dropi</span>
                <span style={{fontSize:10,color:P.mt2}}>ordenes_*.xlsx / ordenes_*.csv</span>
                <input type="file" accept=".csv,.xlsx,.xls" style={{display:"none"}} onChange={e=>e.target.files[0]&&importDropi(e.target.files[0])}/>
              </label>
              {dropiData?.archivo&&<div style={{marginTop:10,fontSize:11,color:P.green}}>✓ Último archivo: {dropiData.archivo} — importado el {dropiData.fechaImport}</div>}
            </div>

            {dropiData&&(
              <>
                {/* Stats principales */}
                <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(3,1fr)",gap:10,marginBottom:12}}>
                  <MCard label="Total Pedidos" value={dropiData.totalPedidos} icon="📦" color={P.blue}/>
                  <MCard label="Entregados" value={dropiData.entregado} icon="✅" color={P.green} sub={(dropiData.efectividad)+"% efectividad"}/>
                  <MCard label="Ingresos Reales" value={COP(dropiData.totalFacturado)} icon="💰" color={P.gold} sub="Solo pedidos entregados"/>
                </div>

                {/* CANCELACIONES Y PÉRDIDAS */}
                <div style={{background:"#120808",border:"1px solid "+P.red+"33",borderRadius:14,padding:16,marginBottom:12}}>
                  <SH label="💀 Cancelaciones y Pérdidas"/>
                  <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:12}}>
                    <MCard label="Cancelados" value={dropiData.cancelado} icon="❌" color={P.red} alert={dropiData.cancelado>0} sub={dropiData.totalPedidos>0?PCT(dropiData.cancelado/dropiData.totalPedidos*100)+" del total":""}/>
                    <MCard label="Devueltos" value={dropiData.devuelto} icon="↩️" color={P.orange} alert={dropiData.devuelto>0} sub={dropiData.totalPedidos>0?PCT(dropiData.devuelto/dropiData.totalPedidos*100)+" del total":""}/>
                    <MCard label="Tasa Cancelación" value={PCT(dropiData.tasaCancelacion)} icon="📉" color={dropiData.tasaCancelacion>20?P.red:dropiData.tasaCancelacion>10?P.orange:P.green} alert={dropiData.tasaCancelacion>20}/>
                    <MCard label="Costo Devoluciones" value={COP(dropiData.totalDevFlete)} icon="💸" color={dropiData.totalDevFlete>0?P.red:P.mt} alert={dropiData.totalDevFlete>0}/>
                  </div>
                  {/* Barra efectividad */}
                  <div style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:11,color:P.mt}}>Efectividad de entrega</span>
                      <span style={{fontSize:12,fontWeight:700,color:dropiData.efectividad>=80?P.green:dropiData.efectividad>=60?P.gold:P.red}}>{dropiData.efectividad}%</span>
                    </div>
                    <div style={{height:8,background:P.border,borderRadius:4,overflow:"hidden",display:"flex"}}>
                      <div style={{height:"100%",background:P.green,width:(dropiData.efectividad)+"%",transition:"width .8s"}}/>
                      <div style={{height:"100%",background:P.red,width:(dropiData.tasaCancelacion)+"%",transition:"width .8s"}}/>
                    </div>
                    <div style={{display:"flex",gap:16,marginTop:4}}>
                      <span style={{fontSize:9,color:P.green}}>■ Entregados {dropiData.efectividad}%</span>
                      <span style={{fontSize:9,color:P.red}}>■ Cancel/Dev {dropiData.tasaCancelacion}%</span>
                    </div>
                  </div>
                </div>

                {/* Novedades y en camino */}
                <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:10,marginBottom:12}}>
                  <MCard label="En Camino / Tránsito" value={dropiData.camino} icon="🚚" color={P.blue}/>
                  <MCard label="Con Novedad" value={dropiData.novedad} icon="⚠️" color={dropiData.novedad>0?P.orange:P.mt}/>
                </div>

                {/* Desglose financiero */}
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18,marginBottom:12}}>
                  <SH label="Desglose Financiero Dropi"/>
                  {[["Valor Facturado (entregados)",COP(dropiData.totalFacturado),P.gold,true],["Ganancia Bruta",COP(dropiData.totalGanancia),P.green,true],["Total Fletes Pagados",COP(dropiData.totalFlete),P.mt,false],["Costo Devoluciones Flete",COP(dropiData.totalDevFlete),dropiData.totalDevFlete>0?P.red:P.mt,false],["Comisiones Dropi",COP(dropiData.totalComision),P.mt,false]].map(([l,v,c,hi])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+P.border}}>
                      <span style={{fontSize:13,color:hi?P.tx:P.mt}}>{l}</span>
                      <span style={{fontSize:hi?15:13,color:c,fontWeight:hi?700:400}}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Por estado */}
                {Object.keys(dropiData.porEstado||{}).length>0&&(
                  <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                    <SH label="Todos los Estados Dropi"/>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {Object.entries(dropiData.porEstado).sort((a,b)=>b[1]-a[1]).map(([est,n])=>(
                        <div key={est} style={{background:P.bg2,borderRadius:8,padding:"8px 12px",border:"1px solid "+P.border}}>
                          <div style={{fontSize:9,color:P.mt,marginBottom:3,textTransform:"uppercase",letterSpacing:.8}}>{est}</div>
                          <div style={{fontSize:16,fontWeight:700,color:P.tx}}>{n}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!dropiData&&<div style={{textAlign:"center",padding:"40px",color:P.mt,fontSize:13}}>Sube tu archivo de Dropi para ver el análisis completo de pedidos.</div>}
          </div>
        )}

        {/* ════ META ADS ════ */}
        {vistaTab==="meta"&&(
          <div className="anim">
            <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:20,marginBottom:14}}>
              <SH label="Importar Reporte Meta Ads"/>
              <div style={{fontSize:12,color:P.mt,marginBottom:12,lineHeight:1.6}}>
                Sube el CSV o Excel exportado desde Meta Ads Manager. La app lee inversión, CTR, CPM, CPA, compras y ROAS por campaña.
              </div>
              <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:100,border:"2px dashed "+(P.border),borderRadius:12,cursor:"pointer",gap:8,background:P.bg2}}>
                <span style={{fontSize:28}}>📣</span>
                <span style={{fontSize:12,color:P.mt}}>Subir CSV o Excel de Meta Ads</span>
                <span style={{fontSize:10,color:P.mt2}}>Exportar desde Meta Ads Manager → Campañas</span>
                <input type="file" accept=".csv,.xlsx,.xls" style={{display:"none"}} onChange={e=>e.target.files[0]&&importMeta(e.target.files[0])}/>
              </label>
              {metaData?.archivo&&<div style={{marginTop:10,fontSize:11,color:P.green}}>✓ Último archivo: {metaData.archivo} — {metaData.totalRows} filas — importado el {metaData.fecha}</div>}
            </div>

            {metaData?.filas&&metaData.filas.length>0&&(
              <>
                {/* KPIs Meta */}
                {(()=>{
                  const fs=metaData.filas;
                  const invTotal=fs.reduce((a,r)=>a+(r.inversion||0),0);
                  const compras=fs.reduce((a,r)=>a+(r.compras||0),0);
                  const ctrProm=fs.filter(r=>r.ctr>0).reduce((a,r)=>a+r.ctr,0)/Math.max(fs.filter(r=>r.ctr>0).length,1);
                  const cpmProm=fs.filter(r=>r.cpm>0).reduce((a,r)=>a+r.cpm,0)/Math.max(fs.filter(r=>r.cpm>0).length,1);
                  const cpaProm=fs.filter(r=>r.cpa>0).reduce((a,r)=>a+r.cpa,0)/Math.max(fs.filter(r=>r.cpa>0).length,1);
                  const roasProm=fs.filter(r=>r.roas>0).reduce((a,r)=>a+r.roas,0)/Math.max(fs.filter(r=>r.roas>0).length,1);
                  return(
                    <>
                      <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:12}}>
                        <MCard label="Inversión Total" value={COP(invTotal)} icon="💸" color={P.mt}/>
                        <MCard label="Compras Meta" value={compras} icon="🛒" color={P.blue}/>
                        <MCard label="CTR Promedio" value={PCT(ctrProm)} icon="👆" color={ctrProm>=2?P.green:ctrProm>=1?P.gold:P.red}/>
                        <MCard label="ROAS Meta" value={roasProm.toFixed(2)+"x"} icon="🎯" color={roasProm>=2?P.green:roasProm>=1?P.gold:P.red}/>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(2,1fr)",gap:10,marginBottom:14}}>
                        <MCard label="CPM Promedio" value={COP(cpmProm)} icon="📱" color={cpmProm<20000?P.green:cpmProm<30000?P.gold:P.red}/>
                        <MCard label="CPA Promedio" value={COP(cpaProm)} icon="💡" color={cpaProm>0&&cpaProm<30000?P.green:cpaProm<50000?P.gold:P.red}/>
                      </div>
                    </>
                  );
                })()}

                {/* Tabla campañas Meta */}
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,overflow:"hidden"}}>
                  <div style={{padding:"14px 18px",borderBottom:"1px solid "+P.border}}><SH label="Campañas Importadas de Meta"/></div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:600}}>
                      <thead><tr style={{background:P.bg2}}>{["Campaña","Inversión","Impresiones","CTR%","CPM","CPA","Compras","ROAS"].map(h=><th key={h} style={{padding:"7px 12px",textAlign:"left",fontSize:9,color:P.mt,letterSpacing:1.2,textTransform:"uppercase",borderBottom:"1px solid "+P.border,fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                      <tbody>
                        {metaData.filas.map((r,i)=>(
                          <tr key={i} className="hr" style={{borderBottom:"1px solid "+P.border}}>
                            <td style={{padding:"8px 12px",color:P.tx,fontWeight:600,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.campana}</td>
                            <td style={{padding:"8px 12px",color:P.mt}}>{COP(r.inversion)}</td>
                            <td style={{padding:"8px 12px",color:P.mt}}>{new Intl.NumberFormat("es-CO").format(r.impresiones)}</td>
                            <td style={{padding:"8px 12px",color:r.ctr>=2?P.green:r.ctr>=1?P.gold:P.red,fontWeight:r.ctr>0?600:400}}>{r.ctr>0?PCT(r.ctr):"—"}</td>
                            <td style={{padding:"8px 12px",color:r.cpm<20000?P.green:r.cpm<30000?P.gold:P.red}}>{r.cpm>0?COP(r.cpm):"—"}</td>
                            <td style={{padding:"8px 12px",color:r.cpa>0&&r.cpa<30000?P.green:r.cpa<50000?P.gold:P.red}}>{r.cpa>0?COP(r.cpa):"—"}</td>
                            <td style={{padding:"8px 12px",color:P.blue,fontWeight:r.compras>0?700:400}}>{r.compras>0?r.compras:"—"}</td>
                            <td style={{padding:"8px 12px",color:r.roas>=2?P.green:r.roas>=1?P.gold:P.red,fontWeight:r.roas>0?700:400}}>{r.roas>0?r.roas.toFixed(2)+"x":"—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
            {!metaData&&<div style={{textAlign:"center",padding:"40px",color:P.mt,fontSize:13}}>Sube tu reporte de Meta Ads para ver el análisis por campaña.</div>}
          </div>
        )}

        {/* ════ NOTAS ════ */}
        {vistaTab==="notas"&&(
          <div className="anim" style={{maxWidth:800}}>
            <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:20}}>
              <SH label="Notas del Trafficker"/>
              <textarea style={SI({height:280,resize:"vertical",lineHeight:1.8,fontSize:13})} value={notasMes} placeholder="Aprendizajes, qué funcionó, qué cambiar, pendientes..." onChange={e=>setNotasMes(e.target.value)}/>
              <button style={SB({padding:"9px 20px",fontSize:11,marginTop:12})} onClick={()=>doSave()}>Guardar Notas</button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CAMPAÑA */}
      {showForm&&editCamp&&(
        <div style={{position:"fixed",inset:0,background:"#000000dd",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
          <div style={{background:P.card,border:"1px solid "+P.borderG,borderRadius:16,padding:24,width:"100%",maxWidth:680,maxHeight:"90vh",overflowY:"auto"}} className="anim">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:18,fontWeight:700}}><GT>{camps.find(c=>c.id===editCamp.id)?"Editar Campaña":"Nueva Campaña"}</GT></div>
              <button style={{background:"none",border:"none",color:P.mt,fontSize:22}} onClick={()=>{setShowForm(false);setEditCamp(null);}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:12}}>
              {[["Fecha","fecha","date"],["Producto","producto","text"],["Nombre Campaña","campana","text"],["Cuenta Publicitaria","cuenta","text"],["País","pais","text"],["Precio Venta","precVenta","number"],["Inversión Ads","inversion","number"],["Ingresos Dropi","ingresos","number"],["Costo Dropi (opcional)","costoDropi","number"],["Ventas","ventas","number"],["CPA","cpa","number"],["CTR %","ctr","number"],["CPM","cpm","number"]].map(([lbl,key,type])=>(
                <div key={key}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{lbl}</div>
                  <input style={SI({fontSize:12})} type={type} value={editCamp[key]||""} onChange={e=>setEditCamp({...editCamp,[key]:e.target.value})}/></div>
              ))}
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Plataforma</div>
                <select style={SI({fontSize:12})} value={editCamp.plataforma||"Meta Ads"} onChange={e=>setEditCamp({...editCamp,plataforma:e.target.value})}>{PLATF.map(p=><option key={p}>{p}</option>)}</select></div>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Estado</div>
                <select style={SI({fontSize:12,color:EST_COL[editCamp.estado]||P.gold})} value={editCamp.estado||"Testeando"} onChange={e=>setEditCamp({...editCamp,estado:e.target.value})}>{ESTADOS_C.map(s=><option key={s}>{s}</option>)}</select></div>
              <div style={{gridColumn:isMob?"1":"1/-1"}}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Notas</div>
                <textarea style={SI({height:60,resize:"vertical",fontSize:12})} value={editCamp.notas||""} onChange={e=>setEditCamp({...editCamp,notas:e.target.value})}/></div>
            </div>
            {(+editCamp.ingresos>0||+editCamp.inversion>0)&&(()=>{
              const profit=(+editCamp.ingresos||0)-(+editCamp.inversion||0)-(+editCamp.costoDropi||0);
              const roas=(+editCamp.inversion||0)>0?(+editCamp.ingresos||0)/(+editCamp.inversion||0):0;
              return(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:14,padding:"10px 14px",background:P.bg2,borderRadius:10}}>
                  {[{l:"Profit",v:COP(profit),c:profit>=0?P.green:P.red},{l:"ROAS",v:roas.toFixed(2)+"x",c:roas>=2?P.green:roas>=1?P.gold:P.red},{l:"Ventas",v:(+editCamp.ventas||0)+" uds",c:P.blue}].map(({l,v,c})=>(
                    <div key={l}><div style={{fontSize:9,color:P.mt,letterSpacing:1,textTransform:"uppercase",fontWeight:600,marginBottom:3}}>{l}</div><div style={{fontSize:15,fontWeight:700,color:c}}>{v}</div></div>
                  ))}
                </div>
              );
            })()}
            <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
              <button style={SG({padding:"9px 18px",fontSize:12})} onClick={()=>{setShowForm(false);setEditCamp(null);}}>Cancelar</button>
              <button style={SB({padding:"9px 22px",fontSize:12})} onClick={()=>{
                if(camps.find(c=>c.id===editCamp.id))setCamps(camps.map(c=>c.id===editCamp.id?editCamp:c));
                else setCamps([editCamp,...camps]);
                setShowForm(false);setEditCamp(null);
              }}>GUARDAR</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:16,padding:28,maxWidth:340,width:"100%",textAlign:"center"}} className="anim">
            <div style={{fontSize:28,marginBottom:10}}>⚠️</div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>¿Eliminar campaña?</div>
            <div style={{fontSize:12,color:P.mt,marginBottom:18}}>Esta acción no se puede deshacer.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button style={SG({padding:"8px 18px",fontSize:12})} onClick={()=>setConfirmDel(null)}>Cancelar</button>
              <button style={{...SB({padding:"8px 18px",fontSize:12}),background:"linear-gradient(135deg,#c04040,#8a2020)"}} onClick={()=>{setCamps(prev=>prev.filter(c=>c.id!==confirmDel));setConfirmDel(null);}}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
      )}
      {modulo==="creativos"&&(
      <div style={{padding:isMob?"12px":"20px",maxWidth:1100,margin:"0 auto"}}>

        {/* SELECTOR PRODUCTO */}
        <div style={{background:P.card,border:"1px solid "+P.borderG,borderRadius:14,padding:16,marginBottom:16}} className="anim">
          <SH label="Producto de Trabajo"/>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            {[{id:"analizado",l:"📦 Producto analizado"},{id:"libre",l:"✏️ Producto libre / externo"}].map(({id,l})=>(
              <button key={id} onClick={()=>setFuenteProd(id)} style={{background:fuenteProd===id?P.gold:"transparent",border:"1px solid "+(fuenteProd===id?P.gold:P.border),borderRadius:20,color:fuenteProd===id?"#1a0d00":P.mt,padding:"5px 16px",fontSize:11,fontWeight:600,fontFamily:"'Poppins',sans-serif",transition:"all .2s"}}>{l}</button>
            ))}
          </div>
          {fuenteProd==="analizado"?(
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"2fr 1fr",gap:12}}>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Seleccionar producto</div><select style={SI()} value={prodSelId} onChange={e=>setProdSelId(e.target.value)}>{productos.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select></div>
              {prodCreativo&&<div style={{background:P.bg2,borderRadius:10,padding:"12px 14px",border:"1px solid "+P.border}}><div style={{fontSize:11,color:P.gold,fontWeight:700,marginBottom:4}}>{prodCreativo.nombre}</div><div style={{fontSize:10,color:P.mt,lineHeight:1.5,marginBottom:4}}>{(prodCreativo.descripcion||"").slice(0,80)}...</div><div style={{fontSize:10,color:P.mt}}>💰 {prodCreativo.precioAhora} · 🌍 {prodCreativo.pais}</div></div>}
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:10}}>
              {[["Nombre","nombre"],["Descripción","descripcion"],["Problema que resuelve","problema"],["Buyer Persona","buyerPersona"],["Precio antes","precioAntes"],["Precio ahora","precioAhora"],["Paleta (máx 3 colores)","paleta"],["País","pais"],["Ángulo principal","anguloPpal"]].map(([lbl,key])=>(
                <div key={key}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{lbl}</div><input style={SI({fontSize:12})} value={prodLibre[key]||""} placeholder={lbl+"..."} onChange={e=>setProdLibre({...prodLibre,[key]:e.target.value})}/></div>
              ))}
            </div>
          )}
          <div style={{marginTop:12}}>
            <div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Ángulos de venta (uno por línea)</div>
            <textarea style={SI({height:80,resize:"none",fontSize:11,lineHeight:1.6})} value={angulos} onChange={e=>setAngulos(e.target.value)}/>
          </div>
        </div>

        {/* ══ LANDING ══ */}
        {tab==="landing"&&(<div className="anim">
          <div style={{background:"#0a0f08",border:"1px solid "+P.green+"33",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:11,color:P.green,lineHeight:1.6}}>💡 <b>Flujo:</b> Adjunta fotos del producto en ChatGPT → Envía el Briefing → aprueba bloque por bloque → al terminar pide el HTML completo.</div>
          <Acc num="0A" label="Briefing Versión A — Ya tienes nombre y paleta" tag="Momento 1 · Inicio" color={P.green} defaultOpen={true} note="⚠ Adjunta las fotos del producto en este mismo mensaje antes de enviar."><PromptBox text={bLA(prodCreativo,angulos)}/><RB k="lb_a" ph="Pega aquí la confirmación de ChatGPT..."/></Acc>
          <Acc num="0B" label="Briefing Versión B — Sin nombre ni paleta definidos" tag="Momento 1 · Inicio" color={P.green} note="La IA propone 3 nombres + decide la paleta. Tú confirmas el nombre y arrancamos con el hero."><PromptBox text={bLB(prodCreativo)}/><RB k="lb_b" ph="Pega aquí los nombres y paleta propuestos..."/></Acc>
          <Acc num="1" label="Hero — imagen principal" tag="Momento 2 · Hero" color={P.gold} note="Si el hero no convence, pide variaciones antes de avanzar. Sin botón de compra.">
            <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:80}}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Ancho px</div><input style={SI({fontSize:12})} value={heroAncho} onChange={e=>setHeroAncho(e.target.value)}/></div>
              <div style={{flex:1,minWidth:80}}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Alto px</div><input style={SI({fontSize:12})} value={heroAlto} onChange={e=>setHeroAlto(e.target.value)}/></div>
            </div>
            <PromptBox text={bHero(prodCreativo,heroAncho,heroAlto)}/><RB k="l_hero"/>
          </Acc>
          <Acc num="2" label="Beneficios — 3 a 5 puntos resultado" tag="Momento 3 · Bloque" color={P.blue}><PromptBox text={bBen(prodCreativo)}/><RB k="l_ben"/></Acc>
          <Acc num="3" label="Características — specs visuales" tag="Momento 3 · Bloque" color={P.blue}><PromptBox text={bCar(prodCreativo)}/><RB k="l_car"/></Acc>
          <Acc num="4" label="Tabla Comparativa — define contra qué comparas" tag="Momento 3 · Bloque" color={P.blue}>
            <div style={{marginBottom:10}}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>¿Contra qué comparas?</div><input style={SI({fontSize:12})} value={comparacion} onChange={e=>setComparacion(e.target.value)} placeholder='ej: "compara tener vs no tener el producto"'/></div>
            <PromptBox text={bTab(prodCreativo,comparacion)}/><RB k="l_tab"/>
          </Acc>
          <Acc num="5" label="GIF Problema → Solución (prompt para generar)" tag="Momento 3 · GIF" color={P.orange} note="Prompt listo para ChatGPT/Sora/Runway. Duración 3-5 segundos."><PromptBox text={bGIF(prodCreativo,"problema")}/><RB k="l_gif1" ph="Pega aquí el prompt del GIF generado..."/></Acc>
          <Acc num="6" label="GIF Modo de Uso (prompt para generar)" tag="Momento 3 · GIF" color={P.orange}><PromptBox text={bGIF(prodCreativo,"uso")}/><RB k="l_gif2" ph="Pega aquí el prompt del GIF generado..."/></Acc>
          <Acc num="7" label="Testimonios — 3 personas reales" tag="Momento 3 · Bloque" color={P.purple}><PromptBox text={bTest(prodCreativo)}/><RB k="l_test"/></Acc>
          <Acc num="8" label="Preguntas Frecuentes — 5 a 8 preguntas" tag="Momento 3 · Bloque" color={P.purple}><PromptBox text={bFAQ(prodCreativo)}/><RB k="l_faq"/></Acc>
          <Acc num="9" label="Reseñas Trustoo — 20 reseñas (17×⭐⭐⭐⭐⭐ + 3×⭐⭐⭐⭐)" tag="Momento 3 · Reseñas" color={P.gold} note="★ Las 3 reseñas de 4 estrellas: SIEMPRE critican la transportadora, NUNCA el producto. Fotos hiperrealistas, NO piel lisa."><PromptBox text={bTrustoo(prodCreativo)}/><RB k="l_trustoo" ph="Pega aquí las reseñas generadas..." h={160}/></Acc>
        </div>)}

        {/* ══ PRODUCT PAGE ══ */}
        {tab==="productpage"&&(<div className="anim">
          <div style={{background:"#0a0a14",border:"1px solid "+P.blue+"33",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:11,color:P.blue,lineHeight:1.6}}>💡 <b>Flujo:</b> Adjunta fotos → Briefing → cada slide por separado → copy de texto → eBook de regalo.</div>
          <Acc num="0" label="Briefing Product Page" tag="Inicio" color={P.blue} defaultOpen={true} note="⚠ Adjunta las fotos del producto en este mismo mensaje."><PromptBox text={bPPBrief(prodCreativo)}/><RB k="pp_br" ph="Pega aquí la confirmación..."/></Acc>
          <div style={{fontSize:10,color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,margin:"16px 0 8px",paddingLeft:4}}>📸 Slides — Imágenes 1080×1080</div>
          <Acc num="1" label="Slide 1 — Fondo Blanco (producto limpio)" tag="Imagen" color={P.mt}><PromptBox text={bSlide(prodCreativo,1,"Fondo Blanco","- Fondo: blanco puro\n- Producto al centro, limpio, bien iluminado, fiel a las fotos reales\n- Sin texto. Solo el producto.\n- Premium, que inspire confianza de marca")}/><RB k="pp_s1"/></Acc>
          <Acc num="2" label="Slide 2 — Imagen Principal (BOTÓN DE COMPRA AQUÍ)" tag="Imagen · ⚠ PRIMER SLIDE" color={P.gold} note="⚠ Este slide va PRIMERO en el carrusel. Debe tener el botón de compra visible."><PromptBox text={bSlide(prodCreativo,2,"Imagen Principal","- Producto como protagonista (foto real)\n- Texto del punto de dolor: \""+(prodCreativo.problema||"[problema]")+"\"\n- Beneficio principal del producto\n- Precio: "+(prodCreativo.precioAhora||"[precio]")+" COP\n- BOTÓN DE COMPRA visible en la imagen\n- Hiperrealista, NO stock. Problema + solución en 2 segundos")}/><RB k="pp_s2"/></Acc>
          <Acc num="3" label="Slide 3 — Características" tag="Imagen" color={P.blue}><PromptBox text={bSlide(prodCreativo,3,"Características","- Lista las 4-6 specs más importantes visualmente\n- Producto presente en la imagen\n- Íconos simples + texto corto por especificación\n- Técnico pero limpio, legible en móvil")}/><RB k="pp_s3"/></Acc>
          <Acc num="4" label="Slide 4 — Beneficio Clave" tag="Imagen" color={P.blue}><PromptBox text={bSlide(prodCreativo,4,"Beneficio Clave","- UN solo beneficio — el más diferenciador\n- Persona usando el producto o resultado (hiperrealista, NO piel lisa)\n- Frase máx 8 palabras que refuerce el beneficio\n- Genera DESEO de tener el producto")}/><RB k="pp_s4"/></Acc>
          <Acc num="5" label="Slide 5 — Modo de Uso" tag="Imagen" color={P.blue}><PromptBox text={bSlide(prodCreativo,5,"Modo de Uso","- Máximo 3 pasos numerados\n- Manos usando el producto — hiperrealista, cotidiano\n- El cliente entiende en 5 segundos cómo funciona")}/><RB k="pp_s5"/></Acc>
          <Acc num="6" label="Slide 6 — Tabla Comparativa" tag="Imagen" color={P.blue}><PromptBox text={bSlide(prodCreativo,6,"Tabla Comparativa","- "+(prodCreativo.nombre)+" vs otras opciones del mercado\n- Máximo 5 comparaciones de 2 palabras\n- ✓ para nuestro producto, ✗ para la competencia\n- Diseño limpio, legible en móvil")}/><RB k="pp_s6"/></Acc>
          <Acc num="7" label="Slide 7 — Reseñas (fotos hiperrealistas humanas)" tag="Imagen" color={P.purple} note="Fotos: persona real, NO modelo, NO piel lisa, imagen casera del día a día."><PromptBox text={bSlide(prodCreativo,7,"Reseñas","- 3 reseñas con foto hiperrealista\n- Persona real, NO modelo, NO piel lisa, imagen casera\n- Nombre y apellido colombiano\n- 2-3 líneas mencionando el problema resuelto\n- Estrellas: 5 ⭐")}/><RB k="pp_s7"/></Acc>
          <div style={{fontSize:10,color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,margin:"16px 0 8px",paddingLeft:4}}>✍️ Copy — Secciones de Texto</div>
          <Acc num="A" label="Nombre del Producto — [Nombre]® + necesidad + tiempo" tag="Copy" color={P.gold}><PromptBox text={bPPNombre(prodCreativo)}/><RB k="pp_nom"/></Acc>
          <Acc num="B" label="3 Títulos — dolor / urgencia / validación social" tag="Copy" color={P.orange}><PromptBox text={bPPTitulos(prodCreativo)}/><RB k="pp_tit"/></Acc>
          <Acc num="C" label="Beneficios con Porcentajes (97%/98%/96%)" tag="Copy" color={P.green}><PromptBox text={bPPBenPct(prodCreativo)}/><RB k="pp_bpct"/></Acc>
          <Acc num="D" label="Tabla Comparativa — hasta 10 comparaciones" tag="Copy" color={P.blue}><PromptBox text={bPPTabla(prodCreativo)}/><RB k="pp_tab"/></Acc>
          <Acc num="E" label="Afirmaciones, ¿Sabías que...? y Datos Curiosos" tag="Copy" color={P.orange}><PromptBox text={bPPAfirm(prodCreativo)}/><RB k="pp_afm"/></Acc>
          <Acc num="F" label="40 Reseñas Colombianizadas" tag="Copy" color={P.purple} note="32×⭐⭐⭐⭐⭐ + 5×⭐⭐⭐⭐ (queja transportadora) + 3×⭐⭐⭐. Solo nombre y apellido. Fotos hiperrealistas, caseras, NO piel lisa."><PromptBox text={bPPRes(prodCreativo)}/><RB k="pp_res" h={160}/></Acc>
          <Acc num="G" label="eBook de Regalo — generación completa" tag="Bonus" color={P.green} note="Se entrega junto con el producto. Al final di 'ESO FUE TODO' para recibir el HTML."><PromptBox text={bPPEbook(prodCreativo)}/><RB k="pp_ebook"/></Acc>
        </div>)}

        {/* ══ CREATIVOS ══ */}
        {tab==="creativos"&&(<div className="anim">
          <div style={{background:"#0a0a14",border:"1px solid "+P.purple+"33",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:11,color:P.purple,lineHeight:1.6}}>💡 <b>Flujo AIDA:</b> Investiga puntos de dolor reales → propone ángulos con 5 hooks cada uno → tú eliges ángulo + hook → guión completo por fases → copy text para Meta Ads.</div>
          <Acc num="1" label="Investigación — puntos de dolor reales antes de proponer ángulos" tag="Paso 1 · Investigar primero" color={P.blue} defaultOpen={true}><PromptBox text={bCrInvest(prodCreativo,angulos)}/><RB k="cr_inv" ph="Pega aquí los insights encontrados..."/></Acc>
          <Acc num="2" label="Ángulos con 5 Hooks Agresivos cada uno" tag="Paso 2 · Definir ángulos" color={P.gold} note="ChatGPT pregunta si tienes ángulos existentes antes de proponer. Por cada ángulo: 5 hooks de máx 8 palabras."><PromptBox text={bCrAng(prodCreativo,angulos)}/><RB k="cr_ang" ph="Pega aquí los ángulos y hooks generados..."/></Acc>
          <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:12,padding:16,marginBottom:10}}>
            <div style={{fontSize:10,color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,marginBottom:12}}>Paso 3 · Selecciona el ángulo y hook para el guión</div>
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:10}}>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Ángulo elegido</div><input style={SI({fontSize:12})} value={angSel} onChange={e=>setAngSel(e.target.value)} placeholder="ej: Emocional — vergüenza"/></div>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Hook elegido (cópialo aquí)</div><input style={SI({fontSize:12})} value={hookSel} onChange={e=>setHookSel(e.target.value)} placeholder="ej: ¿Cuánto más vas a esperar para...?"/></div>
            </div>
          </div>
          <Acc num="3A" label="Guión UGC completo — AIDA por fases" tag="Paso 3A · UGC" color={P.purple} note="Método AIDA: Atención → Interés → Deseo → Acción. Texto de pantalla NO repite la voz. Escenas cinematográficas específicas. ElevenLabs v3 al final."><PromptBox text={bGuionUGC(prodCreativo,hookSel,angSel)}/><RB k="cr_ugc" ph="Pega aquí el guión UGC generado..." h={160}/></Acc>
          <Acc num="3B" label="Guión Voz en Off + Imágenes/Clips — AIDA por fases" tag="Paso 3B · Voz en off" color={P.purple} note="Mismo método AIDA. Texto de pantalla complementa, no repite. ElevenLabs v3 al final."><PromptBox text={bGuionVOZ(prodCreativo,hookSel,angSel)}/><RB k="cr_voz" ph="Pega aquí el guión voz en off generado..." h={160}/></Acc>
          <Acc num="4" label="Copy Text Meta Ads — Normal + Tipo F por ángulo" tag="Paso 4 · Copy" color={P.orange} note="Por cada ángulo: 1 copy Normal (6 líneas máx) + 1 copy Tipo F (headline + bullets + CTA). Políticas Meta Ads 2026."><PromptBox text={bCopy(prodCreativo,angulos)}/><RB k="cr_copy" ph="Pega aquí los copys generados..." h={160}/></Acc>
        </div>)}

        {/* ══ MINIATURAS ══ */}
        {tab==="miniaturas"&&(<div className="anim">
          <div style={{background:"#140a08",border:"1px solid "+P.orange+"33",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:11,color:P.orange,lineHeight:1.6}}>💡 <b>Flujo:</b> Briefing → ChatGPT pide los 5 ángulos → 1 miniatura por ángulo, composición diferente en cada una. Para modelos UGC: Gemini → Flow.</div>
          <Acc num="0" label="Briefing Miniaturas — contexto del producto" tag="Inicio" color={P.orange} defaultOpen={true} note="Adjunta las fotos del producto en este mismo mensaje."><PromptBox text={bMinBrief(prodCreativo)}/><RB k="min_br" ph="Pega aquí la confirmación de ChatGPT..."/></Acc>
          <div style={{fontSize:10,color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,margin:"16px 0 8px",paddingLeft:4}}>🖼️ 5 Miniaturas — 1 por ángulo, composición diferente</div>
          {[
            {n:1,c:P.red,ang:angulos.split("\n")[0]||"Ángulo 1",comp:"Close-up extremo del problema → producto en primer plano como solución"},
            {n:2,c:P.purple,ang:angulos.split("\n")[1]||"Ángulo 2",comp:"Rostro real en primer plano (expresión emocional real) + producto flotando al costado"},
            {n:3,c:P.blue,ang:angulos.split("\n")[2]||"Ángulo 3",comp:"Composición izquierda/derecha: antes (problema) vs después (con el producto)"},
            {n:4,c:P.gold,ang:angulos.split("\n")[3]||"Ángulo 4",comp:"Producto gigante y protagonista al centro — texto de beneficio arriba y abajo"},
            {n:5,c:P.green,ang:angulos.split("\n")[4]||"Ángulo 5",comp:"Estilo editorial premium: modelo + producto integrado + dato de validación social"},
          ].map(({n,c,ang,comp})=>(
            <Acc key={n} num={n} label={"Miniatura "+(n)+" — "+(ang)} tag={"Ángulo "+(n)+" · 1080×1920"} color={c} note={"Composición: "+(comp)}>
              <PromptBox text={bMin(prodCreativo,n,ang,comp)}/><RB k={"min_"+(n)} ph="Pega aquí el prompt/resultado de la miniatura..."/>
            </Acc>
          ))}
          <div style={{fontSize:10,color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,margin:"16px 0 8px",paddingLeft:4}}>🤖 Modelos UGC Hiperrealistas — Gemini + Flow</div>
          <Acc num="UGC" label="Flujo completo: Gemini → Flow para modelos reales" tag="Herramienta" color={P.mt} note="Paso 1 en Gemini: analiza foto real de Pinterest → da 3 JSON prompts. Paso 2 en Flow: usa el modelo generado + fotos del producto."><PromptBox text={bUGC(prodCreativo)}/><RB k="min_ugc" ph="Pega aquí los JSON prompts generados por Gemini..."/></Acc>
        </div>)}

        {/* ══ ANÁLISIS ══ */}
        {tab==="analisis"&&(<div className="anim">
          <div style={{background:"#0a0a14",border:"1px solid "+P.blue+"33",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:11,color:P.blue,lineHeight:1.6}}>💡 <b>Flujo:</b> Pega el prompt → ChatGPT investiga → genera análisis completo → di "ESO FUE TODO" → recibe el HTML profesional → súbelo a la ficha del producto.</div>
          <Acc num="1" label="Análisis Profundo de Producto COD Colombia" tag="Análisis Completo" color={P.blue} defaultOpen={true} note="Score /100, ángulos, oferta, naming, buyer persona, competencia, risks. Al final genera HTML profesional."><PromptBox text={bAnalisis(prodCreativo)}/><RB k="an_an" ph="Pega aquí el análisis o el link al HTML..." h={100}/></Acc>
          <Acc num="2" label="Competitor Analyzer — Meta Ads + Mercado Libre + Amazon" tag="Competencia" color={P.gold} note="Investiga activamente. Extrae copies textuales. Nunca inventa datos."><PromptBox text={bComp(prodCreativo)}/><RB k="an_comp" ph="Pega aquí el análisis de competencia..."/></Acc>
          <Acc num="3" label="Analizador CRO Landing Page" tag="Optimización" color={P.red} note="Analiza en modo móvil iPhone (390px). Prioridad: 🔴 Crítico → 🟠 Alto → 🔵 Oportunidad."><PromptBox text={bCRO(prodCreativo)}/><RB k="an_cro" ph="Pega aquí el análisis CRO o el link de la landing..."/></Acc>
        </div>)}
      </div>
      )}
      {modulo==="metricas"&&(

      {/* HEADER */}
      <div style={{background:"#060604",borderBottom:"1px solid "+P.border,padding:isMob?"8px 14px":"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?15:20,fontWeight:800}}><GT>BITÁCORA PRO</GT></div>
          <span style={{color:P.mt2}}>|</span>
          <span style={{fontSize:11,color:P.mt}}>🌐 Panel Global</span>
          <span style={{background:P.gold+"22",border:"1px solid "+P.gold+"44",borderRadius:12,padding:"1px 7px",fontSize:9,color:P.gold,letterSpacing:1,fontWeight:600}}>{user?.role==="admin"?"ADMIN":"USUARIO"}</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button style={SB({padding:"7px 16px",fontSize:11})} onClick={()=>doSave()}>{saveMsg||"GUARDAR"}</button>
          <button style={SG({padding:"5px 12px",fontSize:11})} onClick={logout}>Salir</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:"#060604",borderBottom:"1px solid "+P.border,overflowX:"auto",position:"sticky",top:isMob?53:57,zIndex:99}}>
        {TABS.map(({id,l})=>(
          <button key={id} onClick={()=>setTab(id)} style={{background:"none",border:"none",borderBottom:tab===id?"2px solid "+P.gold:"2px solid transparent",color:tab===id?P.gold:P.mt,padding:isMob?"8px 10px":"10px 20px",fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:isMob?9:10,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap",transition:"all .2s"}}>{l}</button>
        ))}
      </div>

      <div style={{padding:isMob?"12px":"20px",maxWidth:1400,margin:"0 auto"}}>

        {/* ════ MÉTRICAS ════ */}
        {tab==="metricas"&&(
          <div className="anim">
            {/* Semáforo de salud */}
            <div style={{background:metricas.saludColor+"11",border:"1px solid "+metricas.saludColor+"44",borderRadius:14,padding:20,marginBottom:16,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:metricas.saludColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,boxShadow:"0 0 20px "+metricas.saludColor+"66"}}>
                {metricas.salud==="verde"?"✦":metricas.saludScore>=45?"⚠":"↓"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:18,fontWeight:800,color:metricas.saludColor}}>{metricas.saludLabel}</div>
                <div style={{fontSize:12,color:P.mt,marginTop:2}}>Score del negocio este mes: {metricas.saludScore}/100</div>
                <div style={{height:6,background:P.card2,borderRadius:3,marginTop:8,maxWidth:300}}>
                  <div style={{height:6,borderRadius:3,background:metricas.saludColor,width:metricas.saludScore+"%",transition:"width .8s"}}/>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:10,color:P.mt,marginBottom:4}}>ROAS del mes</div>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:28,fontWeight:800,color:metricas.roasMes>=2?P.green:metricas.roasMes>=1?P.gold:P.red}}>{metricas.roasMes.toFixed(2)}x</div>
              </div>
            </div>

            {/* KPIs globales */}
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:12}}>
              <MCard label="Inversión Total Ads" value={COP(metricas.totalInv)} icon="💸" color={P.mt}/>
              <MCard label="Ingresos Dropi" value={COP(metricas.totalIng)} icon="💰" color={P.gold}/>
              <MCard label="Profit Neto Ads" value={COP(metricas.totalProfit)} icon="📈" color={metricas.totalProfit>=0?P.green:P.red}/>
              <MCard label="Profit Real (−gastos)" value={COP(metricas.profitReal)} icon="💎" color={metricas.profitReal>=0?P.green:P.red} sub="Descontando gastos fijos"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:16}}>
              <MCard label="ROAS Histórico" value={metricas.roas.toFixed(2)+"x"} icon="🎯" color={metricas.roas>=2?P.green:metricas.roas>=1?P.gold:P.red}/>
              <MCard label="Ventas Totales" value={metricas.totalVen+" uds"} icon="🛒" color={P.blue}/>
              <MCard label="Gastos Fijos del Mes" value={COP(metricas.totalGastosFixed)} icon="🧾" color={P.orange}/>
              <MCard label="Campañas Totales" value={metricas.campsTotal} icon="📊" color={P.purple} sub={metricas.campsMes+" este mes"}/>
            </div>

            {/* Productos */}
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:12,marginBottom:16}}>
              <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                <SH label="Pipeline de Productos"/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[{l:"Total",v:metricas.prodTotal,c:P.mt},{l:"Testeando",v:metricas.prodTesteando,c:P.gold},{l:"Escalando",v:metricas.prodEscalando,c:P.green}].map(({l,v,c})=>(
                    <div key={l} style={{background:P.bg2,borderRadius:10,padding:"12px 14px",border:"1px solid "+P.border,textAlign:"center"}}>
                      <div style={{fontSize:9,color:P.mt,letterSpacing:1,textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{l}</div>
                      <div style={{fontSize:28,fontWeight:800,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                <SH label="Gastos Fijos del Mes"/>
                {gastos.filter(g=>g.fecha?.startsWith(monthStr())).length===0?(
                  <div style={{textAlign:"center",padding:"20px",color:P.mt,fontSize:12}}>Sin gastos registrados este mes</div>
                ):(
                  gastos.filter(g=>g.fecha?.startsWith(monthStr())).map(g=>(
                    <div key={g.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+P.border}}>
                      <span style={{fontSize:12,color:P.mt}}>{g.concepto}</span>
                      <span style={{fontSize:12,color:P.orange,fontWeight:600}}>{COP(+g.valor)}</span>
                    </div>
                  ))
                )}
                <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,marginTop:4}}>
                  <span style={{fontSize:13,fontWeight:700,color:P.tx}}>Total</span>
                  <span style={{fontSize:15,fontWeight:800,color:P.red}}>{COP(metricas.totalGastosFixed)}</span>
                </div>
              </div>
            </div>

            {/* Aprendizajes recientes */}
            {aprend.length>0&&(
              <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18}}>
                <SH label="Últimos Aprendizajes"/>
                {aprend.slice(0,3).map(a=>(
                  <div key={a.id} style={{padding:"10px 0",borderBottom:"1px solid "+P.border}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                      <span style={{background:P.purple+"22",border:"1px solid "+P.purple+"44",borderRadius:12,padding:"1px 8px",fontSize:9,color:P.purple,fontWeight:600}}>{a.tipo}</span>
                      <span style={{fontSize:10,color:P.mt}}>{a.producto} · {a.fecha}</span>
                    </div>
                    <div style={{fontSize:12,color:P.tx,marginBottom:4}}>{a.aprendizaje}</div>
                    {a.accion&&<div style={{fontSize:11,color:P.green}}>→ {a.accion}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ TIENDAS ════ */}
        {tab==="tiendas"&&(
          <div className="anim">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
              <div>
                <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?18:24,fontWeight:800,margin:0}}><GT>Tiendas</GT></h2>
                <div style={{fontSize:12,color:P.mt,marginTop:2}}>{tiendas.length} tiendas · {tiendas.filter(t=>t.estado==="Activa").length} activas</div>
              </div>
              <button style={SB({padding:"9px 20px",fontSize:11})} onClick={()=>{setEditTienda({id:Date.now()+Math.random().toString(36).slice(2),nombre:"",tipo:"Dropshipping COD",enlace:"",facebook:"",tiktok:"",estado:"Activa",pais:"Colombia",productosPautados:"",palabrasClave:"",notas:"",propietario:"propia"});setShowTiendaForm(true);}}>+ TIENDA</button>
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat("+Math.min(tiendas.length+1,4)+",1fr)",gap:8,marginBottom:16,maxWidth:500}}>
              {["Activa","Pausada","En construcción"].map(est=>{const n=tiendas.filter(t=>t.estado===est).length;const c=est==="Activa"?P.green:est==="Pausada"?P.orange:P.blue;return n>0&&(<div key={est} style={{background:P.card,border:"1px solid "+c+"33",borderRadius:10,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:c}}>{n}</div><div style={{fontSize:9,color:P.mt,letterSpacing:.8,textTransform:"uppercase",fontWeight:600,marginTop:2}}>{est}</div></div>);})}
            </div>

            {tiendas.length===0?(
              <div style={{textAlign:"center",padding:"50px 20px",color:P.mt}}>
                <div style={{fontSize:36,marginBottom:10}}>🏪</div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>Sin tiendas registradas</div>
                <button style={SB({padding:"9px 20px",fontSize:11})} onClick={()=>{setEditTienda({id:Date.now()+"",nombre:"",tipo:"Dropshipping COD",enlace:"",facebook:"",tiktok:"",estado:"Activa",pais:"Colombia",productosPautados:"",palabrasClave:"",notas:"",propietario:"propia"});setShowTiendaForm(true);}}>+ AGREGAR PRIMERA TIENDA</button>
              </div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
                {tiendas.map(t=>(
                  <div key={t.id} style={{background:P.card,border:"1px solid "+(t.estado==="Activa"?P.green+"33":P.border),borderRadius:14,padding:18}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div>
                        <div style={{fontFamily:"'Poppins',sans-serif",fontSize:15,fontWeight:700,color:P.tx}}>{t.nombre}</div>
                        <div style={{fontSize:11,color:P.mt,marginTop:2}}>{t.tipo} · {t.pais}</div>
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{background:(t.estado==="Activa"?P.green:t.estado==="Pausada"?P.orange:P.blue)+"22",border:"1px solid "+(t.estado==="Activa"?P.green:t.estado==="Pausada"?P.orange:P.blue)+"44",borderRadius:12,padding:"2px 8px",fontSize:10,color:t.estado==="Activa"?P.green:t.estado==="Pausada"?P.orange:P.blue,fontWeight:600}}>{t.estado}</span>
                        {t.propietario&&t.propietario!=="propia"&&<span style={{background:P.purple+"22",border:"1px solid "+P.purple+"44",borderRadius:12,padding:"2px 8px",fontSize:9,color:P.purple}}>{t.propietario}</span>}
                      </div>
                    </div>
                    {[["🌐 Enlace",t.enlace],["📘 Facebook",t.facebook],["🎵 TikTok",t.tiktok]].map(([lbl,url])=>url&&(
                      <div key={lbl} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <span style={{fontSize:11,color:P.mt}}>{lbl}</span>
                        <a href={url} target="_blank" rel="noreferrer" style={{fontSize:11,color:P.blue,textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>↗ {url.replace("https://","").slice(0,40)}</a>
                      </div>
                    ))}
                    {t.productosPautados&&<div style={{fontSize:11,color:P.mt,marginTop:8}}><b style={{color:P.tx}}>Productos:</b> {t.productosPautados}</div>}
                    {t.palabrasClave&&<div style={{fontSize:11,color:P.mt,marginTop:4}}><b style={{color:P.tx}}>Keywords:</b> {t.palabrasClave}</div>}
                    {t.notas&&<div style={{fontSize:11,color:P.mt,marginTop:4,fontStyle:"italic"}}>{t.notas}</div>}
                    <div style={{display:"flex",gap:8,marginTop:12}}>
                      <button style={SG({padding:"5px 14px",fontSize:10,flex:1})} onClick={()=>{setEditTienda({...t});setShowTiendaForm(true);}}>Editar</button>
                      <button style={{background:"transparent",border:"1px solid #3a1010",borderRadius:8,color:P.red,padding:"5px 12px",fontSize:10,cursor:"pointer"}} onClick={()=>setTiendas(tiendas.filter(x=>x.id!==t.id))}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ GASTOS FIJOS ════ */}
        {tab==="gastos"&&(
          <div className="anim">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
              <div>
                <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?18:24,fontWeight:800,margin:0}}><GT>Gastos Fijos</GT></h2>
                <div style={{fontSize:12,color:P.mt,marginTop:2}}>Costos de operación del negocio</div>
              </div>
              <button style={SB({padding:"9px 20px",fontSize:11})} onClick={()=>{setEditGasto({id:Date.now()+Math.random().toString(36).slice(2),fecha:todayStr(),concepto:"",categoria:"Plataforma",valor:0,recurrente:true,notas:""});setShowGastoForm(true);}}>+ GASTO</button>
            </div>

            {/* Resumen por categoría */}
            {gastos.length>0&&(()=>{
              const byCat={};
              gastos.forEach(g=>{if(!byCat[g.categoria])byCat[g.categoria]=0;byCat[g.categoria]+=(+g.valor||0);});
              const total=Object.values(byCat).reduce((a,v)=>a+v,0);
              return(
                <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:18,marginBottom:14}}>
                  <SH label="Resumen por Categoría"/>
                  <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(auto-fill,minmax(160px,1fr))",gap:8,marginBottom:12}}>
                    {Object.entries(byCat).map(([cat,val])=>(
                      <div key={cat} style={{background:P.bg2,borderRadius:10,padding:"10px 12px",border:"1px solid "+P.border}}>
                        <div style={{fontSize:9,color:P.mt,letterSpacing:.8,textTransform:"uppercase",fontWeight:600,marginBottom:4}}>{cat}</div>
                        <div style={{fontSize:16,fontWeight:700,color:P.orange}}>{COP(val)}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:"1px solid "+P.border}}>
                    <span style={{fontSize:13,fontWeight:700,color:P.tx}}>Total gastos registrados</span>
                    <span style={{fontSize:18,fontWeight:800,color:P.red}}>{COP(total)}</span>
                  </div>
                </div>
              );
            })()}

            {/* Lista gastos */}
            <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,overflow:"hidden"}}>
              {gastos.length===0?(
                <div style={{textAlign:"center",padding:"40px",color:P.mt,fontSize:13}}>Sin gastos registrados. Agrega los costos fijos de tu negocio.</div>
              ):(
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:500}}>
                    <thead><tr style={{background:P.bg2}}>{["Fecha","Concepto","Categoría","Valor","Recurrente",""].map(h=><th key={h} style={{padding:"8px 14px",textAlign:"left",fontSize:9,color:P.mt,letterSpacing:1.5,textTransform:"uppercase",borderBottom:"1px solid "+P.border,fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {gastos.sort((a,b)=>a.fecha>b.fecha?-1:1).map(g=>(
                        <tr key={g.id} className="hr" style={{borderBottom:"1px solid "+P.border}}>
                          <td style={{padding:"9px 14px",color:P.mt,whiteSpace:"nowrap"}}>{g.fecha}</td>
                          <td style={{padding:"9px 14px",color:P.tx,fontWeight:600}}>{g.concepto}</td>
                          <td style={{padding:"9px 14px",color:P.mt}}>{g.categoria}</td>
                          <td style={{padding:"9px 14px",color:P.orange,fontWeight:700}}>{COP(+g.valor)}</td>
                          <td style={{padding:"9px 14px"}}><span style={{color:g.recurrente?P.green:P.mt,fontSize:10,fontWeight:600}}>{g.recurrente?"🔄 Mensual":"Una vez"}</span></td>
                          <td style={{padding:"9px 14px"}}>
                            <div style={{display:"flex",gap:6}}>
                              <button style={SG({padding:"3px 10px",fontSize:10})} onClick={()=>{setEditGasto({...g});setShowGastoForm(true);}}>Editar</button>
                              <button style={{background:"transparent",border:"1px solid #3a1010",borderRadius:6,color:P.red,padding:"3px 8px",fontSize:10,cursor:"pointer"}} onClick={()=>setGastos(gastos.filter(x=>x.id!==g.id))}>✕</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ APRENDIZAJES ════ */}
        {tab==="aprend"&&(
          <div className="anim">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
              <div>
                <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?18:24,fontWeight:800,margin:0}}><GT>Aprendizajes</GT></h2>
                <div style={{fontSize:12,color:P.mt,marginTop:2}}>Tu manual personal de ecommerce</div>
              </div>
              <button style={SB({padding:"9px 20px",fontSize:11})} onClick={()=>{setEditAprend({id:Date.now()+Math.random().toString(36).slice(2),fecha:todayStr(),producto:"",tipo:"Creativo",aprendizaje:"",accion:""});setShowAprendForm(true);}}>+ APRENDIZAJE</button>
            </div>

            {/* Filtros */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              {["Todos",...TIPOS_APREND].map(t=>(
                <button key={t} onClick={()=>setFiltroTipo(t)} style={{background:filtroTipo===t?P.purple:"transparent",border:"1px solid "+(filtroTipo===t?P.purple:P.border),borderRadius:20,color:filtroTipo===t?"#fff":P.mt,padding:"4px 12px",fontSize:10,fontWeight:600,fontFamily:"'Poppins',sans-serif",transition:"all .2s"}}>{t}</button>
              ))}
            </div>

            {aprend.filter(a=>filtroTipo==="Todos"||a.tipo===filtroTipo).length===0?(
              <div style={{textAlign:"center",padding:"50px 20px",color:P.mt,fontSize:13}}>
                <div style={{fontSize:36,marginBottom:10}}>📚</div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Sin aprendizajes aún</div>
                <div style={{marginBottom:16}}>Cada vez que aprendas algo nuevo, regístralo aquí.</div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {aprend.filter(a=>filtroTipo==="Todos"||a.tipo===filtroTipo).sort((a,b)=>a.fecha>b.fecha?-1:1).map(a=>(
                  <div key={a.id} style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:16,borderLeft:"3px solid "+P.purple}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{background:P.purple+"22",border:"1px solid "+P.purple+"44",borderRadius:12,padding:"2px 10px",fontSize:10,color:P.purple,fontWeight:600}}>{a.tipo}</span>
                        <span style={{fontSize:11,color:P.gold,fontWeight:600}}>{a.producto}</span>
                        <span style={{fontSize:10,color:P.mt}}>{a.fecha}</span>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button style={SG({padding:"3px 10px",fontSize:10})} onClick={()=>{setEditAprend({...a});setShowAprendForm(true);}}>Editar</button>
                        <button style={{background:"transparent",border:"1px solid #3a1010",borderRadius:6,color:P.red,padding:"3px 8px",fontSize:10,cursor:"pointer"}} onClick={()=>setAprend(aprend.filter(x=>x.id!==a.id))}>✕</button>
                      </div>
                    </div>
                    <div style={{fontSize:13,color:P.tx,lineHeight:1.6,marginBottom:a.accion?8:0}}>{a.aprendizaje}</div>
                    {a.accion&&<div style={{fontSize:12,color:P.green,background:P.green+"11",borderRadius:8,padding:"6px 10px"}}>→ Acción: {a.accion}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ ADMIN ════ */}
        {tab==="admin"&&user?.role==="admin"&&(
          <div className="anim">
            <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?18:24,fontWeight:800,marginBottom:20}}><GT>Administrar Usuarios</GT></h2>

            {/* Crear usuario */}
            <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,padding:20,marginBottom:16}}>
              <SH label="Crear Nuevo Usuario"/>
              <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr 1fr",gap:12,marginBottom:14}}>
                <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Usuario</div><input style={SI({fontSize:12})} value={newUser.uname} onChange={e=>setNewUser({...newUser,uname:e.target.value})} placeholder="nombre_usuario"/></div>
                <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Contraseña</div><input style={SI({fontSize:12})} type="password" value={newUser.pass} onChange={e=>setNewUser({...newUser,pass:e.target.value})} placeholder="mínimo 4 caracteres"/></div>
                <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Rol</div>
                  <select style={SI({fontSize:12})} value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})}>
                    <option value="user">Usuario</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:9,color:P.mt,marginBottom:8,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Secciones con acceso</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {SECCIONES_ADMIN.map(sec=>(
                    <button key={sec} onClick={()=>setNewUser({...newUser,secciones:{...newUser.secciones,[sec]:!newUser.secciones[sec]}})}
                      style={{background:newUser.secciones[sec]?P.gold:"transparent",border:"1px solid "+(newUser.secciones[sec]?P.gold:P.border),borderRadius:20,color:newUser.secciones[sec]?"#1a0d00":P.mt,padding:"4px 12px",fontSize:10,fontWeight:600,fontFamily:"'Poppins',sans-serif",transition:"all .2s"}}>{sec}</button>
                  ))}
                </div>
              </div>
              {adminMsg&&<div style={{background:adminMsg.startsWith("✓")?"#0a1a0a":"#1e0808",border:"1px solid "+(adminMsg.startsWith("✓")?"#4dba7f44":"#c0404044"),borderRadius:8,padding:"8px 14px",fontSize:12,color:adminMsg.startsWith("✓")?P.green:"#f08888",marginBottom:10}}>{adminMsg}</div>}
              <button style={SB({padding:"10px 24px",fontSize:11})} onClick={crearUsuario}>CREAR USUARIO</button>
            </div>

            {/* Lista usuarios */}
            {usuarios.length>0&&(
              <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"14px 18px",borderBottom:"1px solid "+P.border}}>
                  <SH label={"Usuarios Registrados ("+usuarios.length+")"}/>
                </div>
                {usuarios.map(u=>(
                  <div key={u.name} className="hr" style={{padding:"14px 18px",borderBottom:"1px solid "+P.border}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:8}}>
                      <div style={{fontFamily:"'Poppins',sans-serif",fontSize:13,fontWeight:700,color:P.tx,flex:1}}>{"@"+(u.name||"")}</div>
                      <span style={{background:(u.role==="admin"?P.gold:P.blue)+"22",border:"1px solid "+(u.role==="admin"?P.gold:P.blue)+"44",borderRadius:12,padding:"2px 8px",fontSize:10,color:u.role==="admin"?P.gold:P.blue,fontWeight:600}}>{u.role}</span>
                      {/* Toggle activo */}
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:10,color:P.mt}}>Cuenta</span>
                        <div onClick={()=>u.name!==user.name&&toggleUsuario(u.name,"active",!u.active)}
                          style={{width:36,height:20,borderRadius:10,background:u.active!==false?P.green:"#252525",cursor:u.name===user.name?"default":"pointer",position:"relative",transition:"background .2s",flexShrink:0,border:"1px solid "+(u.active!==false?P.green+"88":"#333"),opacity:u.name===user.name?.5:1}}>
                          <div style={{position:"absolute",top:2,left:u.active!==false?17:2,width:14,height:14,borderRadius:"50%",background:u.active!==false?"#080400":"#555",transition:"left .2s"}}/>
                        </div>
                        <span style={{fontSize:10,color:u.active!==false?P.green:P.red,fontWeight:600}}>{u.active!==false?"Activo":"Inactivo"}</span>
                      </div>
                    </div>
                    {/* Secciones */}
                    {u.role!=="admin"&&(
                      <div style={{marginTop:8}}>
                        <div style={{fontSize:9,color:P.mt,marginBottom:6,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Secciones habilitadas</div>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                          {SECCIONES_ADMIN.map(sec=>{
                            const enabled=(u.secciones?.[sec])!==false;
                            return(
                              <button key={sec} onClick={()=>toggleSeccion(u.name,sec,!enabled)}
                                style={{background:enabled?P.gold+"22":"transparent",border:"1px solid "+(enabled?P.gold+"44":P.border),borderRadius:20,color:enabled?P.gold:P.mt2,padding:"3px 10px",fontSize:9,fontWeight:600,fontFamily:"'Poppins',sans-serif",transition:"all .2s"}}>{sec}</button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════ MODAL TIENDA ════ */}
      {showTiendaForm&&editTienda&&(
        <div style={{position:"fixed",inset:0,background:"#000000dd",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
          <div style={{background:P.card,border:"1px solid "+P.borderG,borderRadius:16,padding:24,width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto"}} className="anim">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:18,fontWeight:700}}><GT>{tiendas.find(t=>t.id===editTienda.id)?"Editar Tienda":"Nueva Tienda"}</GT></div>
              <button style={{background:"none",border:"none",color:P.mt,fontSize:22,cursor:"pointer"}} onClick={()=>{setShowTiendaForm(false);setEditTienda(null);}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:12}}>
              {[["Nombre de la Tienda","nombre","text"],["Enlace / URL","enlace","text"],["Facebook / BM","facebook","text"],["TikTok","tiktok","text"],["Productos Pautados","productosPautados","text"],["Palabras Clave","palabrasClave","text"]].map(([lbl,key,type])=>(
                <div key={key}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{lbl}</div>
                  <input style={SI({fontSize:12})} type={type} value={editTienda[key]||""} placeholder={lbl+"..."} onChange={e=>setEditTienda({...editTienda,[key]:e.target.value})}/></div>
              ))}
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Tipo</div>
                <input style={SI({fontSize:12})} value={editTienda.tipo||""} onChange={e=>setEditTienda({...editTienda,tipo:e.target.value})} placeholder="Dropshipping COD, Tienda Propia..."/></div>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>País</div>
                <select style={SI({fontSize:12})} value={editTienda.pais||"Colombia"} onChange={e=>setEditTienda({...editTienda,pais:e.target.value})}>{PAISES_TIENDA.map(p=><option key={p}>{p}</option>)}</select></div>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Estado</div>
                <select style={SI({fontSize:12})} value={editTienda.estado||"Activa"} onChange={e=>setEditTienda({...editTienda,estado:e.target.value})}>{ESTADOS_TIENDA.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Propietario</div>
                <select style={SI({fontSize:12})} value={editTienda.propietario||"propia"} onChange={e=>setEditTienda({...editTienda,propietario:e.target.value})}>{PROP_TIENDA.map(p=><option key={p}>{p}</option>)}</select></div>
              <div style={{gridColumn:isMob?"1":"1/-1"}}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Notas</div>
                <textarea style={SI({height:70,resize:"vertical",lineHeight:1.6,fontSize:12})} value={editTienda.notas||""} onChange={e=>setEditTienda({...editTienda,notas:e.target.value})}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button style={SG({padding:"9px 18px",fontSize:12})} onClick={()=>{setShowTiendaForm(false);setEditTienda(null);}}>Cancelar</button>
              <button style={SB({padding:"9px 22px",fontSize:12})} onClick={()=>{
                if(tiendas.find(t=>t.id===editTienda.id))setTiendas(tiendas.map(t=>t.id===editTienda.id?editTienda:t));
                else setTiendas([editTienda,...tiendas]);
                setShowTiendaForm(false);setEditTienda(null);
              }}>GUARDAR</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL GASTO ════ */}
      {showGastoForm&&editGasto&&(
        <div style={{position:"fixed",inset:0,background:"#000000dd",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:P.card,border:"1px solid "+P.borderG,borderRadius:16,padding:24,width:"100%",maxWidth:480}} className="anim">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:18,fontWeight:700}}><GT>{gastos.find(g=>g.id===editGasto.id)?"Editar Gasto":"Nuevo Gasto"}</GT></div>
              <button style={{background:"none",border:"none",color:P.mt,fontSize:22,cursor:"pointer"}} onClick={()=>{setShowGastoForm(false);setEditGasto(null);}}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[["Concepto","concepto","text"],["Fecha","fecha","date"],["Valor (COP)","valor","number"]].map(([lbl,key,type])=>(
                <div key={key}><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{lbl}</div>
                  <input style={SI({fontSize:12})} type={type} value={editGasto[key]||""} onChange={e=>setEditGasto({...editGasto,[key]:e.target.value})}/></div>
              ))}
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Categoría</div>
                <select style={SI({fontSize:12})} value={editGasto.categoria||"Plataforma"} onChange={e=>setEditGasto({...editGasto,categoria:e.target.value})}>{CAT_GASTOS.map(c=><option key={c}>{c}</option>)}</select></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" checked={editGasto.recurrente||false} onChange={e=>setEditGasto({...editGasto,recurrente:e.target.checked})} id="rec"/>
                <label htmlFor="rec" style={{fontSize:12,color:P.tx,cursor:"pointer"}}>🔄 Gasto recurrente mensual</label>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button style={SG({padding:"9px 18px",fontSize:12})} onClick={()=>{setShowGastoForm(false);setEditGasto(null);}}>Cancelar</button>
              <button style={SB({padding:"9px 22px",fontSize:12})} onClick={()=>{
                if(gastos.find(g=>g.id===editGasto.id))setGastos(gastos.map(g=>g.id===editGasto.id?editGasto:g));
                else setGastos([editGasto,...gastos]);
                setShowGastoForm(false);setEditGasto(null);
              }}>GUARDAR</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL APRENDIZAJE ════ */}
      {showAprendForm&&editAprend&&(
        <div style={{position:"fixed",inset:0,background:"#000000dd",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:P.card,border:"1px solid "+P.borderG,borderRadius:16,padding:24,width:"100%",maxWidth:520}} className="anim">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:18,fontWeight:700}}><GT>{aprend.find(a=>a.id===editAprend.id)?"Editar Aprendizaje":"Nuevo Aprendizaje"}</GT></div>
              <button style={{background:"none",border:"none",color:P.mt,fontSize:22,cursor:"pointer"}} onClick={()=>{setShowAprendForm(false);setEditAprend(null);}}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Producto / Área</div>
                  <input style={SI({fontSize:12})} value={editAprend.producto||""} placeholder="Ej: Shampoo Capixyl, General..." onChange={e=>setEditAprend({...editAprend,producto:e.target.value})}/></div>
                <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Fecha</div>
                  <input style={SI({fontSize:12})} type="date" value={editAprend.fecha||todayStr()} onChange={e=>setEditAprend({...editAprend,fecha:e.target.value})}/></div>
              </div>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Tipo</div>
                <select style={SI({fontSize:12})} value={editAprend.tipo||"Creativo"} onChange={e=>setEditAprend({...editAprend,tipo:e.target.value})}>{TIPOS_APREND.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>¿Qué aprendiste?</div>
                <textarea style={SI({height:90,resize:"vertical",lineHeight:1.7,fontSize:12})} value={editAprend.aprendizaje||""} placeholder="Describe el aprendizaje con detalle..." onChange={e=>setEditAprend({...editAprend,aprendizaje:e.target.value})}/></div>
              <div><div style={{fontSize:9,color:P.mt,marginBottom:4,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Acción a tomar</div>
                <input style={SI({fontSize:12})} value={editAprend.accion||""} placeholder="¿Qué vas a hacer con este aprendizaje?" onChange={e=>setEditAprend({...editAprend,accion:e.target.value})}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button style={SG({padding:"9px 18px",fontSize:12})} onClick={()=>{setShowAprendForm(false);setEditAprend(null);}}>Cancelar</button>
              <button style={SB({padding:"9px 22px",fontSize:12})} onClick={()=>{
                if(aprend.find(a=>a.id===editAprend.id))setAprend(aprend.map(a=>a.id===editAprend.id?editAprend:a));
                else setAprend([editAprend,...aprend]);
                setShowAprendForm(false);setEditAprend(null);
              }}>GUARDAR</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ BURBUJAS FLOTANTES ════ */}
      {/* Nota flotante */}
      <div style={{position:"fixed",bottom:76,right:20,zIndex:300,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10}}>
        {noteOpen&&(
          <div style={{background:P.card,border:"1px solid "+P.borderG,borderRadius:14,padding:14,width:isMob?280:320,boxShadow:"0 8px 32px #00000066"}} className="anim">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:10,color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Nota Rápida</span>
              <button onClick={()=>{setNoteOpen(false);if(user)DB.set("floatnote:"+user.name,noteText);}} style={{background:"none",border:"none",color:P.mt,fontSize:18,lineHeight:1,padding:0,cursor:"pointer"}}>×</button>
            </div>
            <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Escribe aquí tu nota..." style={SI({height:130,resize:"none",lineHeight:1.6,fontSize:12})}/>
            <button style={SG({width:"100%",padding:"6px 0",marginTop:8,fontSize:10})}
              onClick={()=>{if(user)DB.set("floatnote:"+user.name,noteText);setSaveMsg("✓ Nota guardada");setTimeout(()=>setSaveMsg(""),1500);}}>
              Guardar nota
            </button>
          </div>
        )}
        <button onClick={()=>setNoteOpen(!noteOpen)}
          style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,"+P.gold+","+P.gold3+")",border:"none",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px "+P.gold+"44",cursor:"pointer",transition:"transform .2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>📝</button>
      </div>

      {/* Calculadora flotante */}
      <div style={{position:"fixed",bottom:20,right:20,zIndex:300,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10}}>
        {calcOpen&&(
          <div style={{background:P.card,border:"1px solid "+P.borderG,borderRadius:14,padding:14,width:220,boxShadow:"0 8px 32px #00000066"}} className="anim">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:10,color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Costeo Rápido</span>
              <button onClick={()=>setCalcOpen(false)} style={{background:"none",border:"none",color:P.mt,fontSize:18,lineHeight:1,padding:0,cursor:"pointer"}}>×</button>
            </div>
            <div style={{minHeight:60,marginBottom:8}}>
              {calcHist.map((h,i)=>(
                <div key={i} style={{fontSize:11,color:i===0?P.gold2:P.mt,padding:"2px 0",fontFamily:"monospace",borderBottom:i===0?"1px solid "+P.border:"none"}}>{h}</div>
              ))}
            </div>
            <input style={SI({fontSize:13,fontFamily:"monospace",padding:"8px 10px"})}
              value={calcVal} onChange={e=>setCalcVal(e.target.value)}
              placeholder="ej: 50000*0.3"
              onKeyDown={e=>e.key==="Enter"&&evalCalc()}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>
              <button style={SG({padding:"7px 0",fontSize:11})} onClick={()=>{setCalcVal("");setCalcHist([]);}}>Limpiar</button>
              <button style={SB({padding:"7px 0",fontSize:11})} onClick={evalCalc}>=</button>
            </div>
          </div>
        )}
        <button onClick={()=>setCalcOpen(!calcOpen)}
          style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,"+P.gold+","+P.gold3+")",border:"none",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px "+P.gold+"44",cursor:"pointer",transition:"transform .2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>🧮</button>
      </div>

      )}
      <div style={{position:"fixed",bottom:76,right:20,zIndex:300,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
        {calcOpen&&(<div style={{background:P.card,border:"1px solid "+P.borderG,borderRadius:14,padding:14,width:isMob?280:310,boxShadow:"0 8px 32px #00000066",maxHeight:"78vh",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:10,color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Costeo COD</span>
            <button onClick={()=>setCalcOpen(false)} style={{background:"none",border:"none",color:P.mt,fontSize:18,cursor:"pointer",lineHeight:1}}>x</button>
          </div>
          {(()=>{const r=calcCosteo(calcV);const F=COP;
            const flds=[["Pais","pais","sel",["Colombia","Mexico","Ecuador","Espana","Chile","Peru"]],["Prec.Prov","precProv","num"],["P.Venta","pvManual","num"],["Efectiv","efectividad","num"],["% CPA","pctCpa","num"],["Gasto adm","costoAdmin","num"]];
            return(<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                {flds.map(([lbl,key,tp,opts])=>(<div key={key}><div style={{fontSize:8,color:P.mt,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>{lbl}</div>
                  {tp==="sel"?<select style={SI({fontSize:10,padding:"4px 6px"})} value={calcV[key]||""} onChange={e=>setCalcV({...calcV,[key]:e.target.value})}>{(opts||[]).map(o=><option key={o}>{o}</option>)}</select>
                  :<input type="number" style={SI({fontSize:10,padding:"4px 6px"})} value={calcV[key]||""} onChange={e=>setCalcV({...calcV,[key]:e.target.value})}/>}</div>))}
              </div>
              <div style={{background:P.bg2,borderRadius:8,padding:"8px 10px",border:"1px solid "+P.border,marginBottom:6}}>
                {[["Prov",r.prec],["Flete",r.fleteD],["CPA",r.cpa],["Total",r.total]].map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid "+P.border}}><span style={{fontSize:10,color:P.mt}}>{l}</span><span style={{fontSize:10,color:l==="Total"?P.gold:P.mt,fontWeight:l==="Total"?700:400}}>{F(v)}</span></div>))}
              </div>
              <div style={{background:r.util>=0?"#0a1a0a":"#140808",borderRadius:8,padding:"8px 10px",border:"1px solid "+(r.util>=0?P.green:P.red)+"44",marginBottom:6}}>
                {[["Venta",F(r.pv),P.gold],["Utilidad",F(r.util),r.util>=0?P.green:P.red],["% Util",(r.pctUtil*100).toFixed(1)+"%",r.pctUtil>=0.1?P.green:P.orange],["CPA brk",F(r.cpaBreak),P.blue]].map(([l,v,c])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid "+P.border}}><span style={{fontSize:10,color:P.mt}}>{l}</span><span style={{fontSize:11,color:c,fontWeight:700}}>{v}</span></div>))}
              </div>
              <div style={{background:P.bg2,borderRadius:8,padding:"8px 10px",border:"1px solid "+P.border}}>
                {[["x2",r.pv2,r.util2],["x3",r.pv3,r.util3]].map(([l,pv,ut])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid "+P.border}}><span style={{fontSize:10,color:P.mt}}>{l} {F(pv)}</span><span style={{fontSize:10,color:ut>=0?P.green:P.red,fontWeight:600}}>{F(ut)}</span></div>))}
              </div></>);
          })()}
        </div>)}
        <button onClick={()=>setCalcOpen(!calcOpen)} style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,"+P.gold+","+P.gold3+")",border:"none",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px "+P.gold+"44",cursor:"pointer"}}>🧮</button>
      </div>
      <div style={{position:"fixed",bottom:20,right:76,zIndex:300,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
        {noteOpen&&(<div style={{background:P.card,border:"1px solid "+P.borderG,borderRadius:14,padding:14,width:isMob?260:290,boxShadow:"0 8px 32px #00000066"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:10,color:P.gold,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>Nota Rapida</span>
            <button onClick={()=>{setNoteOpen(false);if(user)DB.set("floatnote:"+user.name,noteText);}} style={{background:"none",border:"none",color:P.mt,fontSize:18,cursor:"pointer",lineHeight:1}}>x</button>
          </div>
          <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Escribe aqui..." style={SI({height:90,resize:"none",lineHeight:1.6,fontSize:12})}/>
          <button style={SG({width:"100%",padding:"5px 0",marginTop:6,fontSize:10})} onClick={()=>{if(user)DB.set("floatnote:"+user.name,noteText);setSaveMsg("Guardado");setTimeout(()=>setSaveMsg(""),1500);}}>Guardar</button>
        </div>)}
        <button onClick={()=>setNoteOpen(!noteOpen)} style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,"+P.gold+","+P.gold3+")",border:"none",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px "+P.gold+"44",cursor:"pointer"}}>📝</button>
      </div>
    </div>
  );
}
