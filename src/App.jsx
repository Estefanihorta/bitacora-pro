import { useState, useEffect } from "react";
import AppA1 from "./AppA1";
import AppA2 from "./AppA2";

const P={bg:"#080806",card:"#131310",border:"#2a2a22",borderG:"#C9956C44",gold:"#C9956C",gold2:"#E8C4A0",gold3:"#8B5E3C",tx:"#F0EDE6",mt:"#7a7060",mt2:"#4a4840",green:"#4dba7f",red:"#d46f6f",blue:"#4da8c9",purple:"#7c6fd4",orange:"#f97316"};
const hash=s=>{let h=5381;for(let c of s)h=(Math.imul(31,h)+c.charCodeAt(0))|0;return Math.abs(h).toString(36);};
const DB={
  get:async k=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):null;}catch{return null;}},
  set:async(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
};
const SI=(x={})=>({background:"#0f0f0c",border:"1px solid #2a2a22",borderRadius:8,padding:"9px 13px",color:"#F0EDE6",fontSize:13,fontFamily:"'Poppins',sans-serif",width:"100%",...x});
const SB=(x={})=>({background:"linear-gradient(135deg,#C9956C,#8B5E3C)",border:"none",borderRadius:9,color:"#1a0d00",fontWeight:700,fontFamily:"'Poppins',sans-serif",letterSpacing:".5px",textTransform:"uppercase",fontSize:11,...x});
const SG=(x={})=>({background:"transparent",border:"1px solid #C9956C44",borderRadius:9,color:"#C9956C",fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:12,...x});
const GT=({children})=>(<span style={{background:"linear-gradient(135deg,#C9956C,#E8C4A0)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{children}</span>);

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#080806;font-family:'Poppins',sans-serif}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#C9956C33;border-radius:4px}
  input,select,textarea{outline:none;font-family:'Poppins',sans-serif}
  button{cursor:pointer;font-family:'Poppins',sans-serif}
  @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
`;

const MODS = [
  {id:"planner",icon:"📋",label:"Planner",desc:"Planificacion diaria",color:P.gold,app:"A1",appMod:"M1"},
  {id:"productos",icon:"📦",label:"Productos",desc:"Pipeline de productos",color:P.blue,app:"A1",appMod:"M2"},
  {id:"trafficker",icon:"📊",label:"Trafficker",desc:"Campanas Meta Ads",color:P.green,app:"A2",appMod:"trafficker"},
  {id:"creativos",icon:"🎨",label:"Creativos",desc:"Prompts y guiones",color:P.purple,app:"A2",appMod:"creativos"},
  {id:"metricas",icon:"📈",label:"Metricas",desc:"Salud del negocio",color:P.orange,app:"A2",appMod:"metricas"},
];

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [isReg, setIsReg] = useState(false);
  const [uname, setUname] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState(null);
  const [isMob, setIsMob] = useState(window.innerWidth < 768);
  const [modulo, setModulo] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const r = () => setIsMob(window.innerWidth < 768);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const sess = await DB.get("session:active");
        if (sess && sess.u && sess.ph) {
          const ud = await DB.get("u:" + sess.u);
          if (ud && ud.ph === sess.ph && ud.active !== false) {
            setUser({ name: sess.u, ph: sess.ph, role: ud.role || "admin", nc: ud.nc || sess.u });
            setScreen("app");
            return;
          }
        }
      } catch (e) {}
      try { const lu = await DB.get("session:lastuser"); if (lu) setUname(lu.u || ""); } catch (e) {}
      setScreen("auth");
    })();
  }, []);

  const doAuth = async () => {
    setBusy(true); setErr("");
    const u = uname.trim().toLowerCase().replace(/[\s/'"]+/g, "_");
    if (!u || !pass) { setErr("Completa todos los campos"); setBusy(false); return; }
    if (isReg) {
      if (!nombre.trim()) { setErr("Ingresa tu nombre"); setBusy(false); return; }
      if (pass.length < 4) { setErr("Minimo 4 caracteres"); setBusy(false); return; }
      const ex = await DB.get("u:" + u);
      if (ex) { setErr("Usuario ya existe"); setBusy(false); return; }
      const nc = (nombre.trim() + " " + apellido.trim()).trim();
      const ud = { ph: hash(pass), role: "admin", active: true, nc };
      await DB.set("u:" + u, ud);
      await DB.set("session:active", { u, ph: hash(pass) });
      await DB.set("session:lastuser", { u });
      setUser({ name: u, ph: hash(pass), role: "admin", nc });
      setScreen("app");
    } else {
      const ud = await DB.get("u:" + u);
      if (!ud) { setErr("Usuario no encontrado"); setBusy(false); return; }
      if (ud.ph !== hash(pass)) { setErr("Contrasena incorrecta"); setBusy(false); return; }
      if (ud.active === false) { setErr("Cuenta desactivada"); setBusy(false); return; }
      await DB.set("session:active", { u, ph: ud.ph });
      await DB.set("session:lastuser", { u });
      setUser({ name: u, ph: ud.ph, role: ud.role || "user", nc: ud.nc || u });
      setScreen("app");
    }
    setBusy(false);
  };

  const logout = async () => {
    await DB.set("session:active", null);
    setUser(null); setScreen("auth"); setUname(""); setPass("");
    setNombre(""); setApellido(""); setMenuOpen(false);
  };

  const fn = user && user.nc ? user.nc : (user && user.name ? user.name : "");
  const firstName = fn.split(" ")[0] || fn;
  const currentMod = MODS.find(m => m.id === modulo);

  if (screen === "loading") return (
    <div style={{ background: P.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <style>{CSS}</style>
      <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}><GT>BITACORA PRO</GT></div>
      <div style={{ fontSize: 9, color: P.mt2, letterSpacing: 4, textTransform: "uppercase", marginTop: 6 }}>by Estefani Horta</div>
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: P.gold, animation: "pulse 1.4s ease-in-out " + (i * 0.2) + "s infinite" }} />)}
      </div>
    </div>
  );

  if (screen === "auth") return (
    <div style={{ background: P.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <style>{CSS}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 9, color: P.gold, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>BY ESTEFANI HORTA . EDWIN GIRALDO</div>
          <div style={{ fontSize: isMob ? 44 : 54, fontWeight: 800, lineHeight: .9, marginBottom: 4 }}><GT>BITACORA</GT></div>
          <div style={{ fontSize: isMob ? 44 : 54, fontWeight: 200, lineHeight: .9, color: P.tx }}>PRO</div>
          <div style={{ fontSize: 9, color: P.mt, letterSpacing: 3, marginTop: 12 }}>SISTEMA DE GESTION ECOMMERCE COD</div>
        </div>
        <div style={{ background: P.card, border: "1px solid " + P.border, borderRadius: 18, padding: 28, boxShadow: "0 20px 60px #00000066" }}>
          <div style={{ fontSize: 10, color: P.mt, letterSpacing: 2, marginBottom: 20, textAlign: "center" }}>{isReg ? "CREAR CUENTA" : "BIENVENIDA DE VUELTA"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {isReg && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: P.mt, marginBottom: 5, textTransform: "uppercase", fontWeight: 600 }}>Nombre</div>
                  <input style={SI({ fontSize: 12 })} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: P.mt, marginBottom: 5, textTransform: "uppercase", fontWeight: 600 }}>Apellido</div>
                  <input style={SI({ fontSize: 12 })} value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Tu apellido" />
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 9, color: P.mt, marginBottom: 5, textTransform: "uppercase", fontWeight: 600 }}>Usuario</div>
              <input style={SI({ fontSize: 13 })} value={uname} onChange={e => setUname(e.target.value)} placeholder="tu_usuario" onKeyDown={e => e.key === "Enter" && doAuth()} autoCapitalize="none" />
            </div>
            <div>
              <div style={{ fontSize: 9, color: P.mt, marginBottom: 5, textTransform: "uppercase", fontWeight: 600 }}>Contrasena</div>
              <input style={SI({ fontSize: 13 })} type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && doAuth()} />
            </div>
            {err && <div style={{ background: "#1e0808", borderRadius: 8, padding: "9px 13px", color: "#f08888", fontSize: 12 }}>{err}</div>}
            <button style={SB({ width: "100%", padding: "13px 0", fontSize: 12, marginTop: 2 })} onClick={doAuth} disabled={busy}>{busy ? "..." : isReg ? "CREAR CUENTA" : "ENTRAR"}</button>
          </div>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: P.mt }}>
            {isReg ? "Ya tienes cuenta? " : "Primera vez? "}
            <span style={{ color: P.gold, cursor: "pointer", fontWeight: 700 }} onClick={() => { setIsReg(!isReg); setErr(""); }}>{isReg ? "Inicia sesion" : "Registrate"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: P.bg, minHeight: "100vh", color: P.tx }}>
      <style>{CSS}</style>

      {/* HEADER */}
      <div style={{ background: "#060604", borderBottom: "1px solid " + P.border, padding: isMob ? "9px 14px" : "11px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ fontSize: isMob ? 16 : 21, fontWeight: 800, cursor: "pointer", lineHeight: 1 }} onClick={() => { setModulo("home"); setMenuOpen(false); }}><GT>BITACORA PRO</GT></div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, color: P.mt }}>{firstName}</span>
          {user && user.role === "admin" && <span style={{ background: P.gold + "22", border: "1px solid " + P.gold + "44", borderRadius: 12, padding: "2px 8px", fontSize: 9, color: P.gold, fontWeight: 600 }}>ADMIN</span>}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "1px solid " + P.border, borderRadius: 7, padding: "6px 9px", color: P.mt, display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 16, height: 2, background: menuOpen ? P.gold : P.mt, borderRadius: 1, transition: "all .2s", transform: menuOpen && i === 0 ? "rotate(45deg) translate(3px,4px)" : menuOpen && i === 2 ? "rotate(-45deg) translate(3px,-4px)" : menuOpen && i === 1 ? "scaleX(0)" : "none" }} />)}
          </button>
        </div>
      </div>

      {/* DRAWER */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 185 }} onClick={() => setMenuOpen(false)}>
          <div style={{ position: "absolute", inset: 0, background: "#000000bb" }} />
          <div style={{ position: "absolute", top: 0, right: 0, width: isMob ? "85%" : "290px", height: "100vh", background: "#080806", borderLeft: "1px solid " + P.border, display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid " + P.border, background: "#060604" }}>
              <div style={{ fontSize: 8, color: P.gold, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5, fontWeight: 600 }}>BY ESTEFANI HORTA . EDWIN GIRALDO</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}><GT>BITACORA PRO</GT></div>
              <div style={{ fontSize: 10, color: P.mt, marginTop: 3 }}>{user && (user.nc || user.name)}</div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
              {MODS.map(m => (
                <button key={m.id} onClick={() => { setModulo(m.id); setMenuOpen(false); }}
                  style={{ width: "100%", background: modulo === m.id ? m.color + "15" : "transparent", border: "1px solid " + (modulo === m.id ? m.color + "44" : P.border), borderRadius: 11, padding: "11px 13px", marginBottom: 6, display: "flex", alignItems: "center", gap: 11, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: m.color + "22", border: "1px solid " + m.color + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{m.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: modulo === m.id ? m.color : P.tx }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: P.mt }}>{m.desc}</div>
                  </div>
                </button>
              ))}
              <div style={{ height: 1, background: P.border, margin: "8px 0" }} />
              <button onClick={() => { setModulo("home"); setMenuOpen(false); }} style={{ width: "100%", background: modulo === "home" ? P.gold + "15" : "transparent", border: "1px solid " + (modulo === "home" ? P.gold + "44" : P.border), borderRadius: 11, padding: "10px 13px", display: "flex", alignItems: "center", gap: 11, cursor: "pointer" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: P.gold + "22", border: "1px solid " + P.gold + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🏠</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: modulo === "home" ? P.gold : P.tx }}>Inicio</div>
              </button>
            </div>
            <div style={{ padding: 12, borderTop: "1px solid " + P.border, display: "flex", gap: 8 }}>
              <button style={{ ...SB({ padding: "9px 0", fontSize: 11 }), flex: 1, textAlign: "center" }} onClick={() => setMenuOpen(false)}>Cerrar</button>
              <button style={SG({ padding: "9px 12px", fontSize: 11 })} onClick={logout}>Salir</button>
            </div>
          </div>
        </div>
      )}

      {/* HOME */}
      {modulo === "home" && (
        <div style={{ padding: isMob ? "14px" : "26px 30px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: isMob ? 19 : 26, fontWeight: 800, marginBottom: 3 }}>Hola, <GT>{firstName}</GT> 👋</div>
            <div style={{ fontSize: 11, color: P.mt }}>Que vas a trabajar hoy?</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMob ? "1fr 1fr" : "repeat(5,1fr)", gap: 11, marginBottom: 18 }}>
            {MODS.map(m => (
              <button key={m.id} onClick={() => setModulo(m.id)}
                style={{ background: P.card, border: "1px solid " + P.border, borderRadius: 15, padding: isMob ? "14px 10px" : "20px 18px", display: "flex", flexDirection: "column", gap: 10, cursor: "pointer", textAlign: "left", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = m.color + "66"; e.currentTarget.style.background = m.color + "08"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = P.card; }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: m.color + "22", border: "1px solid " + m.color + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: isMob ? 11 : 13, fontWeight: 700, color: P.tx, marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 9, color: P.mt, lineHeight: 1.4 }}>{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ borderTop: "1px solid " + P.border, paddingTop: 14, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 7 }}>
            <div style={{ fontSize: 8, color: P.mt2, letterSpacing: 1 }}>BITACORA PRO by Estefani Horta . Edwin Giraldo</div>
            <button style={SG({ padding: "5px 13px", fontSize: 10 })} onClick={logout}>Cerrar sesion</button>
          </div>
        </div>
      )}

      {/* A1 MODULES: Planner + Productos */}
      {currentMod && currentMod.app === "A1" && (
        <AppA1 embeddedUser={user} embeddedModulo={currentMod.appMod} onLogout={logout} />
      )}

      {/* A2 MODULES: Trafficker + Creativos + Metricas */}
      {currentMod && currentMod.app === "A2" && (
        <AppA2 embeddedUser={user} embeddedModulo={currentMod.appMod} onLogout={logout} />
      )}
    </div>
  );
}
