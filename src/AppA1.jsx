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
  get:async k=>{try{const r=await window.storage.get(k,true);return r?JSON.parse(r.value):null;}catch{return null;}},
  set:async(k,v)=>{try{await window.storage.set(k,JSON.stringify(v),true);}catch{}}
};

const SI=(x={})=>({background:"#0f0f0c",border:"1px solid #2a2a22",borderRadius:8,padding:"9px 13px",color:"#F0EDE6",fontSize:13,fontFamily:"'Poppins',sans-serif",width:"100%",transition:"border-color .2s",...x});
const SB=(x={})=>({background:"linear-gradient(135deg,#C9956C,#8B5E3C)",border:"none",borderRadius:9,color:"#1a0d00",fontWeight:700,fontFamily:"'Poppins',sans-serif",letterSpacing:".5px",textTransform:"uppercase",fontSize:11,...x});
const SG=(x={})=>({background:"transparent",border:"1px solid #C9956C44",borderRadius:9,color:"#C9956C",fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:12,...x});
const GT=({children,style={}})=>(<span style={{background:"linear-gradient(135deg,#C9956C,#E8C4A0)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",...style}}>{children}</span>);
const SH=({label,sub=""})=>(<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><div style={{width:3,height:14,background:"linear-gradient(180deg,#C9956C,#8B5E3C)",borderRadius:2}}/><span style={{fontSize:10,color:"#C9956C",letterSpacing:1.5,textTransform:"uppercase",fontWeight:600}}>{label}</span>{sub&&<span style={{fontSize:10,color:P.mt,marginLeft:4}}>{sub}</span>}</div>);
const MCard=({label,value,sub,color=P.gold,icon=""})=>(<div style={{background:P.card,border:"1px solid "+P.border,borderRadius:12,padding:"14px 16px"}}><div style={{fontSize:9,color:P.mt,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,marginBottom:6,display:"flex",alignItems:"center",gap:6}}>{icon&&<span>{icon}</span>}{label}</div><div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:800,color,lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:10,color:P.mt,marginTop:4}}>{sub}</div>}</div>);

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
/* ── ACCORDION SECTION ── */
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
/* ── FONT SIZE ICON CONTROL ── */
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

const GoldText=({children,style={}})=>(<span style={{background:"linear-gradient(135deg,"+P.gold+","+P.gold2+")",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",...style}}>{children}</span>);

export default function AppA1(){
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
  // M1 state
  const[tab,setTab]=useState("plan");
  const[date,setDate]=useState(todayStr());
  const[day,setDay]=useState(null);
  const[noteOpen,setNoteOpen]=useState(false);
  const[noteText,setNoteText]=useState("");
  const[calcOpen,setCalcOpen]=useState(false);
  const[calcVal,setCalcVal]=useState("");
  const[calcHistory,setCalcHistory]=useState([]);
  const[waSent,setWaSent]=useState(false);
  const[fontSize,setFontSize]=useState(14);
  const saveRef=useRef(null);


  /* Auto-login */
  // M2 state
  /* ── ALL HOOKS FIRST — never conditionally ── */
  const[productos,setProductos]=useState([]);
  const[selProd,setSelProd]=useState(null);
  const[search,setSearch]=useState("");
  const[filtroEst,setFiltroEst]=useState("Todos");
  const[confirmDel,setConfirmDel]=useState(null);

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
            setUser({name:sess.u,ph:sess.ph,role:ud.role||"admin",nc:ud.nc||sess.u});
            const p=await DB.get("productos:"+sess.u)||[];
            setProductos(p);
            setScreen("app");
            return;
          }
        }
      }catch(e){}
      try{const lu=await DB.get("session:lastuser");if(lu)setUname(lu.u||"");}catch(e){}
      setScreen("auth");
    })();
  },[]);
  const doAuth=async()=>{
    setBusy(true);setErr("");
    const u=uname.trim().toLowerCase().replace(/[\s/'"]+/g,"_");
    if(!u||!pass){setErr("Completa todos los campos");setBusy(false);return;}
    if(isReg){
      if(!nombre.trim()){setErr("Ingresa tu nombre");setBusy(false);return;}
      if(pass.length<4){setErr("Minimo 4 caracteres");setBusy(false);return;}
      const ex=await DB.get("u:"+u);
      if(ex){setErr("Usuario ya existe");setBusy(false);return;}
      const nc=(nombre.trim()+" "+apellido.trim()).trim();
      const ud={ph:hash(pass),role:"admin",active:true,nc};
      await DB.set("u:"+u,ud);
      await DB.set("session:active",{u,ph:hash(pass)});
      await DB.set("session:lastuser",{u});
      setUser({name:u,ph:hash(pass),role:"admin",nc});
      setScreen("app");
    }else{
      const ud=await DB.get("u:"+u);
      if(!ud){setErr("Usuario no encontrado");setBusy(false);return;}
      if(ud.ph!==hash(pass)){setErr("Contrasena incorrecta");setBusy(false);return;}
      if(ud.active===false){setErr("Cuenta desactivada");setBusy(false);return;}
      await DB.set("session:active",{u,ph:ud.ph});
      await DB.set("session:lastuser",{u});
      setUser({name:u,ph:ud.ph,role:ud.role||"user",nc:ud.nc||u});
      const p=await DB.get("productos:"+u)||[];
      setProductos(p);
      setScreen("app");
    }
    setBusy(false);
  };
  const logout=async()=>{
    await DB.set("session:active",null);
    setUser(null);setScreen("auth");setUname("");setPass("");
    setNombre("");setApellido("");setMenuOpen(false);
  };
  const doSave=async(silent=false)=>{
    if(!silent)setSaveMsg("guardando...");
    if(user){
      await DB.set("productos:"+user.name,productos);
    }
    if(!silent){setSaveMsg("Guardado");setTimeout(()=>setSaveMsg(""),2000);}
  };


  const MODS=[
    {id:"M1",icon:"📋",label:"Planner",desc:"Planificacion diaria",color:P.gold},
    {id:"M2",icon:"📦",label:"Productos",desc:"Pipeline de productos",color:P.blue},
  ];
  const fn=user&&user.nc?user.nc:(user&&user.name?user.name:"");
  const firstName=fn.split(" ")[0]||fn;

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
          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:11,marginBottom:18}}>
            {MODS.map(m=>(<button key={m.id} onClick={()=>setModulo(m.id)}
              style={{background:P.card,border:"1px solid "+P.border,borderRadius:15,padding:isMob?"15px":"20px 18px",display:"flex",flexDirection:"column",gap:11,cursor:"pointer",textAlign:"left",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=m.color+"66";e.currentTarget.style.background=m.color+"08";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.background=P.card;}}>
              <div style={{width:44,height:44,borderRadius:11,background:m.color+"22",border:"1px solid "+m.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:21}}>{m.icon}</div>
              <div><div style={{fontSize:13,fontWeight:700,color:P.tx,marginBottom:3}}>{m.label}</div><div style={{fontSize:10,color:P.mt,lineHeight:1.5}}>{m.desc}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{height:2,flex:1,background:"linear-gradient(90deg,"+m.color+",transparent)",borderRadius:1}}/><span style={{fontSize:9,color:m.color,fontWeight:600}}>Abrir</span></div>
            </button>))}
          </div>
          <div style={{borderTop:"1px solid "+P.border,paddingTop:14,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:7}}>
            <div style={{fontSize:8,color:P.mt2,letterSpacing:1}}>BITACORA PRO by Estefani Horta . Edwin Giraldo</div>
            <button style={SG({padding:"5px 13px",fontSize:10})} onClick={logout}>Cerrar sesion</button>
          </div>
        </div>
      )}

      {modulo==="M1"&&(
    <div style={{fontFamily:"'Poppins',sans-serif",background:P.bg,minHeight:"100vh",color:P.tx,fontSize:fontSize}}>
      <style>{CSS}</style>

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
          <span style={{fontSize:11,color:P.mt,fontWeight:400}}>@{user?.name}</span>
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

    </div>
      )}

      {modulo==="M2"&&(
    <div style={{fontFamily:"'Poppins',sans-serif",background:P.bg,minHeight:"100vh",color:P.tx}}>
      <style>{CSS}</style>
      <div style={{background:"#060604",borderBottom:"1px solid "+P.border,padding:isMob?"8px 14px":"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,position:"sticky",top:0,zIndex:100}}>
        <div style={{fontFamily:"'Poppins',sans-serif",fontSize:isMob?16:22,fontWeight:800}}><GT>BITÁCORA PRO</GT></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:11,color:P.mt}}>@{user?.name}</span>
          <button style={SB({padding:"7px 16px",fontSize:11})} onClick={()=>doSave()}>{saveMsg||"GUARDAR"}</button>
          <button style={SG({padding:"5px 12px",fontSize:11})} onClick={logout}>Salir</button>
        </div>
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
    </div>
      )}

    </div>
  );
}