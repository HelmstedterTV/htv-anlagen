import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch
} from "firebase/firestore";

const ANLAGEN_KATEGORIEN = [
  { id: "bewaesserung", label: "Bewässerung", icon: "💧" },
  { id: "hebepumpe", label: "Hebepumpe", icon: "⬆️" },
  { id: "beleuchtung", label: "Beleuchtung", icon: "💡" },
  { id: "heizung", label: "Heizung", icon: "🔥" },
  { id: "zutritt", label: "Zutrittskontrolle", icon: "🔐" },
  { id: "plaetze", label: "Plätze", icon: "🎾" },
  { id: "ebusy", label: "eBuSy", icon: "📱" },
  { id: "gaststaette", label: "Gaststätte", icon: "🍽️" },
  { id: "brandmeldeanlage", label: "Brandmeldeanlage", icon: "🚨" },
  { id: "hallenheizung", label: "Hallenheizung", icon: "🏠" },
  { id: "fettabscheider", label: "Fettabscheider", icon: "🔧" },
  { id: "zisterne", label: "Zisterne", icon: "🪣" },
];
const TELEFON_KATEGORIEN = ["HTV", "Handwerker", "Sonstige", "Pressearbeit"];
const MASCHINEN_KATEGORIEN = [
  { id: "rasenpflege", label: "Rasenpflege", icon: "🌿" },
  { id: "platzbau", label: "Platzbau & Pflege", icon: "🎾" },
  { id: "werkzeug", label: "Werkzeug", icon: "🔨" },
  { id: "reinigung", label: "Reinigung", icon: "🧹" },
  { id: "sonstiges", label: "Sonstiges", icon: "📦" },
];

const SEED_ANLAGEN = [
  { id: "1", name: "Hunter Pro-C Bewässerungssteuerung", kategorie: "bewaesserung", standort: "Technikraum Vereinshaus", hersteller: "Hunter Industries", modell: "Pro-C 12-Station", seriennummer: "SN-20230412", kaufdatum: "2023-04-12", garantieBis: "2026-04-12", beschreibung: "Hauptsteuerung für alle 6 Beregnungskreise der Tennisplätze", kontakte: [{ name: "Frieseke Platzbewässerung", telefon: "05136 894546", email: "", rolle: "Wartung Saisonbeginn/-ende" }], dokumente: [], wartungen: [{ id: "w1", bezeichnung: "Jahresinspektion", intervallMonate: 12, letzteDurchfuehrung: "2024-04-10", naechsteFaelligkeit: "2025-04-10", zustaendig: "Frieseke", notizen: "" }, { id: "w2", bezeichnung: "Saisonstart-Check", intervallMonate: 12, letzteDurchfuehrung: "2024-03-15", naechsteFaelligkeit: "2025-03-15", zustaendig: "Platzwart", notizen: "" }], stoerungen: [] },
  { id: "2", name: "Hebepumpenanlage Keller", kategorie: "hebepumpe", standort: "Keller Vereinshaus", hersteller: "Grundfos", modell: "Multilift M.15.1.4", seriennummer: "GF-2021-0987", kaufdatum: "2021-09-01", garantieBis: "2024-09-01", beschreibung: "Abwasser-Hebepumpe für Sanitäranlagen Untergeschoss", kontakte: [{ name: "PBA Pumpen", telefon: "05351 536200", email: "", rolle: "Wartung Hebeanlage" }], dokumente: [], wartungen: [{ id: "w3", bezeichnung: "Halbjahreswartung", intervallMonate: 6, letzteDurchfuehrung: "2024-09-15", naechsteFaelligkeit: "2025-03-15", zustaendig: "PBA Pumpen", notizen: "" }], stoerungen: [] },
  { id: "3", name: "Brandmeldeanlage", kategorie: "brandmeldeanlage", standort: "Vereinshaus gesamt", hersteller: "Bosch", modell: "FPA-5000", seriennummer: "BMA-2020-1122", kaufdatum: "2020-01-15", garantieBis: "2023-01-15", beschreibung: "Zentrale Brandmeldeanlage mit 24 Meldern", kontakte: [{ name: "Scholz (Harms)", telefon: "05351 2565260", email: "", rolle: "Installation & Wartung" }], dokumente: [], wartungen: [{ id: "w4", bezeichnung: "Jahresprüfung (Pflicht)", intervallMonate: 12, letzteDurchfuehrung: "2024-01-20", naechsteFaelligkeit: "2025-01-20", zustaendig: "Scholz", notizen: "VdS-konform" }], stoerungen: [] },
  { id: "4", name: "Fettabscheider Gaststätte", kategorie: "fettabscheider", standort: "Außenbereich Gaststätte", hersteller: "Kessel", modell: "Lipumax", seriennummer: "", kaufdatum: "", garantieBis: "", beschreibung: "Fettabscheider für Küche der Gaststätte", kontakte: [{ name: "Michael Obst (Onyx-Veolia)", telefon: "+49 1607472896", email: "", rolle: "Entleerung" }], dokumente: [], wartungen: [{ id: "w6", bezeichnung: "Entleerung", intervallMonate: 3, letzteDurchfuehrung: "2025-01-10", naechsteFaelligkeit: "2025-04-10", zustaendig: "Onyx-Veolia", notizen: "" }], stoerungen: [] },
];
const SEED_TELEFON = [
  { id: "t1", kategorie: "HTV", position: "1. Vorsitzender", name: "Peter Schinnerling", handy: "0151 28099490", privat: "6771", firma: "", email: "", bemerkungen: "" },
  { id: "t2", kategorie: "HTV", position: "Sportwart", name: "Manfred Fabiunke", handy: "0173 2147811", privat: "053072034666", firma: "", email: "", bemerkungen: "" },
  { id: "t3", kategorie: "HTV", position: "Jugendwartin", name: "Carolin Segebarth", handy: "0170 3635634", privat: "", firma: "", email: "", bemerkungen: "" },
  { id: "t4", kategorie: "HTV", position: "Breitensportwartin Damen", name: "Erika Fabiunke", handy: "0162 4190375", privat: "053072034666", firma: "", email: "", bemerkungen: "" },
  { id: "t5", kategorie: "HTV", position: "Schriftführerin", name: "Sabine Kwiatkowski", handy: "0170 3551050", privat: "", firma: "", email: "", bemerkungen: "" },
  { id: "t6", kategorie: "HTV", position: "Anlagenwart", name: "Wolfgang Brumund", handy: "0157 54371380", privat: "595999", firma: "", email: "", bemerkungen: "" },
  { id: "t7", kategorie: "HTV", position: "Leitung Discgolf", name: "Stephan Mesel", handy: "0177 2260114", privat: "05351537489", firma: "", email: "", bemerkungen: "" },
  { id: "t8", kategorie: "HTV", position: "Kassenwartin", name: "Christina Nabers", handy: "015254007933", privat: "", firma: "", email: "", bemerkungen: "" },
  { id: "t9", kategorie: "HTV", position: "Tennisschule", name: "Jan Plewinski", handy: "01631738224", privat: "", firma: "Dojo", email: "plewina@gmail.com", bemerkungen: "" },
  { id: "t10", kategorie: "HTV", position: "Platzwart", name: "Frank Dibowski", handy: "015753283639", privat: "", firma: "", email: "", bemerkungen: "" },
  { id: "t11", kategorie: "HTV", position: "Platzwart", name: "Maik Odermatt", handy: "015736438636", privat: "", firma: "", email: "", bemerkungen: "" },
  { id: "t12", kategorie: "Handwerker", position: "Ansprechpartner / Platzherrichtung", name: "Herr Meinecke", handy: "+4915202378211", privat: "+4934653727462", firma: "Meinecke", email: "", bemerkungen: "Frühjahr-Instandsetzung" },
  { id: "t13", kategorie: "Handwerker", position: "Heizung", name: "Tropartz / Werthmann", handy: "+491751680793", privat: "05351 34700", firma: "Werthmann", email: "", bemerkungen: "" },
  { id: "t14", kategorie: "Handwerker", position: "Container", name: "", handy: "", privat: "05353-2245", firma: "Gehrecke", email: "", bemerkungen: "" },
  { id: "t15", kategorie: "Handwerker", position: "Wartung Hebeanlage", name: "", handy: "01736314155", privat: "05351 536200", firma: "PBA Pumpen", email: "", bemerkungen: "" },
  { id: "t16", kategorie: "Handwerker", position: "Elektriker", name: "", handy: "01724504411", privat: "05351 37249", firma: "Mirus", email: "", bemerkungen: "" },
  { id: "t17", kategorie: "Handwerker", position: "Platzbewässerung", name: "", handy: "", privat: "05136 894546", firma: "Frieseke", email: "", bemerkungen: "Saisonbeginn/-ende" },
  { id: "t18", kategorie: "Handwerker", position: "Platzherrichtung", name: "", handy: "015202378211", privat: "", firma: "Meinecke", email: "", bemerkungen: "" },
  { id: "t19", kategorie: "Handwerker", position: "Rohr-Reinigung", name: "", handy: "01608456499", privat: "053368789 · Notruf 08008789333", firma: "Wagner", email: "", bemerkungen: "" },
  { id: "t20", kategorie: "Handwerker", position: "Brandmeldeanlage", name: "Harms", handy: "", privat: "05351 2565260", firma: "Scholz", email: "", bemerkungen: "Installation, Wartung" },
  { id: "t21", kategorie: "Sonstige", position: "Fettabscheiderentleerung", name: "Michael Obst", handy: "+49 1607472896", privat: "+49 5615709340", firma: "Onyx-Veolia", email: "", bemerkungen: "" },
  { id: "t22", kategorie: "Sonstige", position: "Fettabscheider Prüfung", name: "Norbert Friedrich", handy: "015118357972", privat: "05356 9183591", firma: "Umwelttechn. Büro Wanske", email: "", bemerkungen: "" },
  { id: "t23", kategorie: "Sonstige", position: "Hygieneartikel", name: "", handy: "", privat: "05352 4069", firma: "Hansa Feinkost", email: "", bemerkungen: "Toilettenpapier/Handtücher" },
  { id: "t24", kategorie: "Pressearbeit", position: "Redaktion", name: "Braunschweiger Zeitung", handy: "", privat: "", firma: "", email: "redaktion.helmstedt@bzv.de", bemerkungen: "" },
  { id: "t25", kategorie: "Pressearbeit", position: "Redaktion", name: "Helmstedter Sonntag", handy: "", privat: "", firma: "", email: "redaktion.helmstedt@RegionalHeute.de", bemerkungen: "" },
  { id: "t26", kategorie: "Pressearbeit", position: "Redaktion", name: "Helmstedter Nachrichten / Facebook", handy: "", privat: "", firma: "", email: "redaktion@news38.de", bemerkungen: "" },
  { id: "t27", kategorie: "Pressearbeit", position: "Kostenlose Bekanntmachung", name: "MeineStadt.de", handy: "", privat: "", firma: "", email: "", bemerkungen: "https://faq.meinestadt.de" },
];

function tageFaellig(d) { if (!d) return null; return Math.round((new Date(d) - new Date()) / 86400000); }
function formatDate(s) { return s ? new Date(s).toLocaleDateString("de-DE") : "–"; }
function statusColor(t) { if (t === null) return "#666"; if (t < 0) return "#ef4444"; if (t <= 30) return "#f59e0b"; return "#22c55e"; }
function statusLabel(t) { if (t === null) return "–"; if (t < 0) return `${Math.abs(t)}d überfällig`; if (t === 0) return "Heute"; return `in ${t}d`; }
function newId() { return Math.random().toString(36).slice(2, 10); }

const I = ({ n, s = 16 }) => {
  const d = { plus: "M12 5v14M5 12h14", trash: "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2", link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", close: "M18 6L6 18M6 6l12 12", search: "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.09 6.09l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z", mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6", file: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM13 2v7h7", tool: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z", alert: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01", back: "M19 12H5M12 19l-7-7 7-7", dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z", check: "M20 6L9 17l-5-5", chevronRight: "M9 18l6-6-6-6", users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", warning: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", sync: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d[n]}/></svg>;
};const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--bg:#0f1117;--sf:#181c27;--sf2:#1e2333;--sf3:#252a3a;--bd:#2a3045;--bd2:#333c55;--ac:#3b82f6;--ac2:#60a5fa;--gr:#22c55e;--am:#f59e0b;--rd:#ef4444;--tx:#e8ecf4;--tx2:#8b95b0;--tx3:#5a6380;--r:10px;--r2:6px}
  body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--tx);font-size:14px}
  .app{display:flex;height:100vh;overflow:hidden}
  .sidebar{width:220px;min-width:220px;background:var(--sf);border-right:1px solid var(--bd);display:flex;flex-direction:column;overflow-y:auto}
  .s-logo{padding:20px 16px 16px;border-bottom:1px solid var(--bd);font-weight:700;font-size:15px}
  .s-logo span{color:var(--ac2)}.s-logo small{display:block;font-size:11px;font-weight:400;color:var(--tx3);margin-top:2px}
  .s-sec{padding:12px 8px 4px;font-size:10px;font-weight:600;letter-spacing:.8px;color:var(--tx3);text-transform:uppercase}
  .s-item{display:flex;align-items:center;gap:8px;padding:8px 10px;margin:1px 4px;border-radius:var(--r2);cursor:pointer;transition:all .15s;color:var(--tx2);font-size:13px}
  .s-item:hover{background:var(--sf2);color:var(--tx)}.s-item.on{background:var(--ac);color:#fff}
  .s-item .bdg{margin-left:auto;background:var(--rd);color:#fff;font-size:10px;padding:1px 5px;border-radius:10px;font-weight:600}
  .main{flex:1;overflow-y:auto;display:flex;flex-direction:column}
  .topbar{padding:16px 24px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:12px;background:var(--sf);position:sticky;top:0;z-index:10}
  .topbar h1{font-size:17px;font-weight:600;flex:1}
  .t-back{cursor:pointer;color:var(--tx2);display:flex;align-items:center;gap:6px;font-size:13px}.t-back:hover{color:var(--tx)}
  .sb{display:flex;align-items:center;gap:8px;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--r2);padding:7px 12px;color:var(--tx2);flex:1;max-width:320px}
  .sb input{background:none;border:none;outline:none;color:var(--tx);font-family:inherit;font-size:13px;flex:1}.sb input::placeholder{color:var(--tx3)}
  .content{padding:24px;flex:1}
  .card{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:16px;transition:border-color .15s}.card:hover{border-color:var(--bd2)}
  .cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
  .ac{cursor:pointer}.ac-hd{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
  .ac-ic{font-size:22px;flex-shrink:0}.ac-nm{font-weight:600;font-size:14px;line-height:1.3}.ac-mt{font-size:12px;color:var(--tx2);margin-top:2px}
  .ac-st{font-size:12px;color:var(--tx3);margin-bottom:10px}
  .tags{display:flex;flex-wrap:wrap;gap:5px}
  .tag{font-size:11px;padding:2px 8px;border-radius:20px;font-weight:500;border:1px solid}
  .tr{background:#1a0505;border-color:#7f1d1d;color:var(--rd)}.tgr{background:var(--sf2);border-color:var(--bd);color:var(--tx2)}
  .dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex-shrink:0}
  .dr{background:var(--rd);box-shadow:0 0 6px var(--rd)}
  .st{font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--tx3);margin-bottom:12px;display:flex;align-items:center;gap:8px}
  .st::after{content:'';flex:1;height:1px;background:var(--bd)}
  .ig{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .ii label{font-size:11px;color:var(--tx3);display:block;margin-bottom:2px}.ii span{font-size:13px;font-family:'DM Mono',monospace}
  .tw{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;padding:8px 12px;font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--tx3);border-bottom:1px solid var(--bd)}
  td{padding:10px 12px;border-bottom:1px solid var(--bd);color:var(--tx2);vertical-align:top}tr:last-child td{border-bottom:none}tr:hover td{background:var(--sf2);color:var(--tx)}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--r2);border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:500;transition:all .15s;text-decoration:none}
  .bp{background:var(--ac);color:#fff}.bp:hover{background:#2563eb}
  .bg{background:transparent;color:var(--tx2);border:1px solid var(--bd)}.bg:hover{background:var(--sf2);color:var(--tx);border-color:var(--bd2)}
  .bd{background:transparent;color:var(--rd);border:1px solid #7f1d1d}.bd:hover{background:#1a0505}
  .bs{padding:4px 10px;font-size:12px}.bi{padding:6px}
  .mo{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
  .md{background:var(--sf);border:1px solid var(--bd2);border-radius:var(--r);padding:24px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto}
  .mt{font-size:16px;font-weight:600;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between}
  .ma{display:flex;gap:8px;justify-content:flex-end;margin-top:20px}
  .fg{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .fi{display:flex;flex-direction:column;gap:5px}.fi.fu{grid-column:1/-1}
  .fi label{font-size:12px;font-weight:500;color:var(--tx2)}
  .fi input,.fi select,.fi textarea{background:var(--sf2);border:1px solid var(--bd);border-radius:var(--r2);color:var(--tx);padding:8px 10px;font-family:inherit;font-size:13px;outline:none;transition:border-color .15s}
  .fi input:focus,.fi select:focus,.fi textarea:focus{border-color:var(--ac)}
  .fi select option{background:var(--sf2)}.fi textarea{resize:vertical;min-height:70px}
  .sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:24px}
  .sc{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:16px}
  .sv{font-size:28px;font-weight:700;font-family:'DM Mono',monospace;line-height:1}.sl{font-size:12px;color:var(--tx2);margin-top:4px}
  .wr{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bd)}.wr:last-child{border-bottom:none}
  .wi{flex:1;min-width:0}.wn{font-size:13px;font-weight:500}.wm{font-size:12px;color:var(--tx3);margin-top:2px}
  .ss{font-size:11px;padding:2px 8px;border-radius:20px;font-weight:500}
  .so{background:#1a0505;color:var(--rd)}.si{background:#1a1200;color:var(--am)}.se{background:#052814;color:var(--gr)}
  .es{text-align:center;padding:40px 20px;color:var(--tx3)}.es div{font-size:32px;margin-bottom:8px}
  .tt{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px}
  .ttb{padding:6px 14px;border-radius:20px;border:1px solid var(--bd);background:transparent;color:var(--tx2);cursor:pointer;font-size:12px;font-weight:500;font-family:inherit;transition:all .15s}
  .ttb:hover{border-color:var(--bd2);color:var(--tx)}.ttb.on{background:var(--ac);border-color:var(--ac);color:#fff}
  .kb{display:inline-block;font-size:10px;padding:1px 7px;border-radius:10px;font-weight:600}
  .kh{background:#051328;color:var(--ac2);border:1px solid #1d4ed8}.kw{background:#052814;color:var(--gr);border:1px solid #166534}
  .ks{background:#1a1200;color:var(--am);border:1px solid #854d0e}.kp{background:#1a0520;color:#c084fc;border:1px solid #7e22ce}
  .tr-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--bd)}.tr-row:last-child{border-bottom:none}
  .ta-v{width:36px;height:36px;border-radius:50%;background:var(--sf3);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
  .ti{flex:1;min-width:0}.tn{font-size:13px;font-weight:600;color:var(--tx)}.tp{font-size:12px;color:var(--tx3)}.tf{font-size:11px;color:var(--tx3);font-style:italic}
  .tac{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.tno{font-family:'DM Mono',monospace;font-size:12px;color:var(--ac2)}
  .zb{font-size:11px;padding:2px 8px;border-radius:20px;font-weight:500}
  .zg{background:#052814;color:var(--gr)}.zw{background:#1a1200;color:var(--am)}.zd{background:#1a0505;color:var(--rd)}
  .loading{display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:12px;color:var(--tx2)}
  .spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
  .sync-badge{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--gr);padding:3px 8px;border-radius:20px;background:#052814;border:1px solid #166534}
`;

function Modal({ title, onClose, children, mw = 560 }) {
  return (
    <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="md" style={{ maxWidth: mw }}>
        <div className="mt">{title}<button className="btn bg bi bs" onClick={onClose}><I n="close" s={14}/></button></div>
        {children}
      </div>
    </div>
  );
}
function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", gap:2, marginBottom:20, borderBottom:"1px solid var(--bd)" }}>
      {tabs.map(t => <button key={t.id} onClick={() => onChange(t.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:"8px 14px", color: active===t.id ? "var(--tx)" : "var(--tx3)", borderBottom: active===t.id ? "2px solid var(--ac)" : "2px solid transparent", fontFamily:"inherit", fontSize:13, fontWeight: active===t.id ? 600 : 400, marginBottom:-1 }}>{t.label}</button>)}
    </div>
  );
}
function WartungForm({ onSave, onClose }) {
  const [f, setF] = useState({ bezeichnung: "", intervallMonate: 12, letzteDurchfuehrung: "", naechsteFaelligkeit: "", zustaendig: "", notizen: "" });
  const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (<><div className="fg"><div className="fi fu"><label>Bezeichnung</label><input value={f.bezeichnung} onChange={s("bezeichnung")}/></div><div className="fi"><label>Intervall (Monate)</label><input type="number" value={f.intervallMonate} onChange={s("intervallMonate")}/></div><div className="fi"><label>Zuständig</label><input value={f.zustaendig} onChange={s("zustaendig")}/></div><div className="fi"><label>Letzte Durchführung</label><input type="date" value={f.letzteDurchfuehrung} onChange={s("letzteDurchfuehrung")}/></div><div className="fi"><label>Nächste Fälligkeit</label><input type="date" value={f.naechsteFaelligkeit} onChange={s("naechsteFaelligkeit")}/></div><div className="fi fu"><label>Notizen</label><textarea value={f.notizen} onChange={s("notizen")}/></div></div><div className="ma"><button className="btn bg" onClick={onClose}>Abbrechen</button><button className="btn bp" onClick={() => f.bezeichnung && onSave(f)}>Speichern</button></div></>);
}
function StoerungForm({ onSave, onClose }) {
  const [f, setF] = useState({ datum: new Date().toISOString().slice(0,10), beschreibung: "", gemeldetVon: "", status: "offen", loesung: "" });
  const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (<><div className="fg"><div className="fi"><label>Datum</label><input type="date" value={f.datum} onChange={s("datum")}/></div><div className="fi"><label>Gemeldet von</label><input value={f.gemeldetVon} onChange={s("gemeldetVon")}/></div><div className="fi fu"><label>Beschreibung</label><textarea value={f.beschreibung} onChange={s("beschreibung")}/></div><div className="fi"><label>Status</label><select value={f.status} onChange={s("status")}><option value="offen">Offen</option><option value="in_bearbeitung">In Bearbeitung</option><option value="erledigt">Erledigt</option></select></div><div className="fi fu"><label>Lösung</label><textarea value={f.loesung} onChange={s("loesung")}/></div></div><div className="ma"><button className="btn bg" onClick={onClose}>Abbrechen</button><button className="btn bp" onClick={() => f.beschreibung && onSave(f)}>Speichern</button></div></>);
}
function DokumentForm({ onSave, onClose }) {
  const [f, setF] = useState({ name: "", url: "", typ: "Anleitung" });
  const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (<><div className="fg"><div className="fi fu"><label>Bezeichnung</label><input value={f.name} onChange={s("name")}/></div><div className="fi"><label>Typ</label><select value={f.typ} onChange={s("typ")}>{["Anleitung","Prüfbericht","Protokoll","Vertrag","Laufkarte","Sonstiges"].map(t=><option key={t}>{t}</option>)}</select></div><div className="fi fu"><label>SharePoint / OneDrive URL</label><input value={f.url} onChange={s("url")} placeholder="https://..."/></div></div><div className="ma"><button className="btn bg" onClick={onClose}>Abbrechen</button><button className="btn bp" onClick={() => f.name && f.url && onSave(f)}>Speichern</button></div></>);
}
function KontaktForm({ onSave, onClose }) {
  const [f, setF] = useState({ name: "", rolle: "", telefon: "", email: "" });
  const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (<><div className="fg"><div className="fi fu"><label>Name / Firma</label><input value={f.name} onChange={s("name")}/></div><div className="fi fu"><label>Rolle</label><input value={f.rolle} onChange={s("rolle")}/></div><div className="fi"><label>Telefon</label><input value={f.telefon} onChange={s("telefon")}/></div><div className="fi"><label>E-Mail</label><input value={f.email} onChange={s("email")}/></div></div><div className="ma"><button className="btn bg" onClick={onClose}>Abbrechen</button><button className="btn bp" onClick={() => f.name && onSave(f)}>Speichern</button></div></>);
}
function WartungCard({ w, onDone, onDelete }) {
  const t = tageFaellig(w.naechsteFaelligkeit);
  return (<div className="card" style={{ marginBottom:10 }}><div style={{ display:"flex", gap:10 }}><div style={{ flex:1 }}><div style={{ fontWeight:600, marginBottom:4 }}>{w.bezeichnung}</div><div style={{ fontSize:12, color:"var(--tx3)", marginBottom:6 }}>Alle {w.intervallMonate} Monate · {w.zustaendig||"–"}</div><div style={{ display:"flex", gap:16, fontSize:12, flexWrap:"wrap" }}><span>Zuletzt: <b style={{color:"var(--tx)"}}>{formatDate(w.letzteDurchfuehrung)}</b></span><span style={{color:statusColor(t)}}>Nächste: <b>{formatDate(w.naechsteFaelligkeit)}</b> ({statusLabel(t)})</span></div>{w.notizen&&<div style={{ fontSize:12, color:"var(--tx3)", marginTop:4 }}>{w.notizen}</div>}</div><div style={{ display:"flex", gap:4 }}><button className="btn bg bs bi" onClick={onDone}><I n="check" s={13}/></button><button className="btn bd bs bi" onClick={onDelete}><I n="trash" s={13}/></button></div></div></div>);
}

function AnlageDetail({ anlage, onUpdate }) {
  const [tab, setTab] = useState("info");
  const [modal, setModal] = useState(null);
  function upd(c) { onUpdate({ ...anlage, ...c }); }
  return (<div>
    <Tabs active={tab} onChange={setTab} tabs={[{id:"info",label:"Info"},{id:"wartung",label:`Wartung (${anlage.wartungen.length})`},{id:"stoerung",label:`Störungen (${anlage.stoerungen.length})`},{id:"dokumente",label:`Dokumente (${anlage.dokumente.length})`},{id:"kontakte",label:`Kontakte (${anlage.kontakte.length})`}]}/>
    {tab==="info"&&<div><div className="st">Stammdaten</div><div className="ig" style={{marginBottom:16}}>{[["Hersteller",anlage.hersteller],["Modell",anlage.modell],["Seriennummer",anlage.seriennummer],["Standort",anlage.standort],["Kaufdatum",formatDate(anlage.kaufdatum)],["Garantie bis",formatDate(anlage.garantieBis)]].map(([l,v])=><div key={l} className="ii"><label>{l}</label><span>{v||"–"}</span></div>)}</div>{anlage.beschreibung&&<p style={{color:"var(--tx2)",fontSize:13}}>{anlage.beschreibung}</p>}</div>}
    {tab==="wartung"&&<div><div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button className="btn bp bs" onClick={()=>setModal("wartung")}><I n="plus" s={13}/>Wartungsintervall</button></div>{anlage.wartungen.length===0&&<div className="es"><div>🔧</div>Keine Wartungen</div>}{anlage.wartungen.map(w=><WartungCard key={w.id} w={w} onDone={()=>{const d=prompt("Datum (YYYY-MM-DD):",new Date().toISOString().slice(0,10));if(d){const n=new Date(d);n.setMonth(n.getMonth()+w.intervallMonate);upd({wartungen:anlage.wartungen.map(x=>x.id===w.id?{...x,letzteDurchfuehrung:d,naechsteFaelligkeit:n.toISOString().slice(0,10)}:x)})}}} onDelete={()=>upd({wartungen:anlage.wartungen.filter(x=>x.id!==w.id)})}/>)}</div>}
    {tab==="stoerung"&&<div><div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button className="btn bp bs" onClick={()=>setModal("stoerung")}><I n="plus" s={13}/>Störung</button></div>{anlage.stoerungen.length===0&&<div className="es"><div>✅</div>Keine Störungen</div>}<div className="tw"><table><thead><tr><th>Datum</th><th>Beschreibung</th><th>Von</th><th>Status</th><th>Lösung</th><th></th></tr></thead><tbody>{[...anlage.stoerungen].sort((a,b)=>new Date(b.datum)-new Date(a.datum)).map(s=><tr key={s.id}><td style={{whiteSpace:"nowrap"}}>{formatDate(s.datum)}</td><td style={{color:"var(--tx)"}}>{s.beschreibung}</td><td>{s.gemeldetVon||"–"}</td><td><span className={`ss ${s.status==="offen"?"so":s.status==="in_bearbeitung"?"si":"se"}`}>{s.status==="offen"?"Offen":s.status==="in_bearbeitung"?"In Bearb.":"Erledigt"}</span></td><td style={{fontSize:12}}>{s.loesung||"–"}</td><td>{s.status!=="erledigt"&&<button className="btn bg bs" onClick={()=>{const l=prompt("Lösung:");upd({stoerungen:anlage.stoerungen.map(x=>x.id===s.id?{...x,status:"erledigt",loesung:l||""}:x)})}}>✓</button>}</td></tr>)}</tbody></table></div></div>}
    {tab==="dokumente"&&<div><div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button className="btn bp bs" onClick={()=>setModal("dokument")}><I n="plus" s={13}/>Dokument</button></div>{anlage.dokumente.length===0&&<div className="es"><div>📄</div>Keine Dokumente</div>}{anlage.dokumente.map((d,i)=><div key={i} className="card" style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><I n="file" s={16}/><div style={{flex:1}}><div style={{fontWeight:500}}>{d.name}</div><div style={{fontSize:11,color:"var(--tx3)"}}>{d.typ}</div></div><a href={d.url} target="_blank" rel="noreferrer" className="btn bg bs"><I n="link" s={12}/>Öffnen</a><button className="btn bd bs bi" onClick={()=>upd({dokumente:anlage.dokumente.filter((_,j)=>j!==i)})}><I n="trash" s={13}/></button></div>)}</div>}
    {tab==="kontakte"&&<div><div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button className="btn bp bs" onClick={()=>setModal("kontakt")}><I n="plus" s={13}/>Kontakt</button></div>{anlage.kontakte.length===0&&<div className="es"><div>📞</div>Keine Kontakte</div>}{anlage.kontakte.map((k,i)=><div key={i} className="card" style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}><div style={{flex:1}}><div style={{fontWeight:500}}>{k.name}</div><div style={{fontSize:12,color:"var(--tx3)",marginTop:2}}>{k.rolle}</div><div style={{display:"flex",gap:12,marginTop:6}}>{k.telefon&&<a href={`tel:${k.telefon}`} style={{fontSize:12,color:"var(--ac2)",display:"flex",gap:4,alignItems:"center"}}><I n="phone" s={12}/>{k.telefon}</a>}{k.email&&<a href={`mailto:${k.email}`} style={{fontSize:12,color:"var(--ac2)",display:"flex",gap:4,alignItems:"center"}}><I n="mail" s={12}/>{k.email}</a>}</div></div><button className="btn bd bs bi" onClick={()=>upd({kontakte:anlage.kontakte.filter((_,j)=>j!==i)})}><I n="trash" s={13}/></button></div>)}</div>}
    {modal==="wartung"&&<Modal title="Wartungsintervall" onClose={()=>setModal(null)}><WartungForm onSave={d=>{upd({wartungen:[...anlage.wartungen,{id:newId(),...d}]});setModal(null)}} onClose={()=>setModal(null)}/></Modal>}
    {modal==="stoerung"&&<Modal title="Störung melden" onClose={()=>setModal(null)}><StoerungForm onSave={d=>{upd({stoerungen:[...anlage.stoerungen,{id:newId(),...d}]});setModal(null)}} onClose={()=>setModal(null)}/></Modal>}
    {modal==="dokument"&&<Modal title="Dokument" onClose={()=>setModal(null)}><DokumentForm onSave={d=>{upd({dokumente:[...anlage.dokumente,d]});setModal(null)}} onClose={()=>setModal(null)}/></Modal>}
    {modal==="kontakt"&&<Modal title="Kontakt" onClose={()=>setModal(null)}><KontaktForm onSave={d=>{upd({kontakte:[...anlage.kontakte,d]});setModal(null)}} onClose={()=>setModal(null)}/></Modal>}
  </div>);
}

function MaschineDetail({ maschine, onUpdate }) {
  const [tab, setTab] = useState("info");
  const [modal, setModal] = useState(null);
  function upd(c) { onUpdate({ ...maschine, ...c }); }
  return (<div>
    <Tabs active={tab} onChange={setTab} tabs={[{id:"info",label:"Info"},{id:"wartung",label:`Wartung (${maschine.wartungen.length})`},{id:"stoerung",label:`Störungen (${maschine.stoerungen.length})`},{id:"dokumente",label:`Dokumente (${maschine.dokumente.length})`}]}/>
    {tab==="info"&&<div><div className="st">Stammdaten</div><div className="ig" style={{marginBottom:16}}>{[["Kategorie",MASCHINEN_KATEGORIEN.find(k=>k.id===maschine.kategorie)?.label],["Standort",maschine.standort],["Hersteller",maschine.hersteller],["Modell",maschine.modell],["Seriennummer",maschine.seriennummer],["Kaufdatum",formatDate(maschine.kaufdatum)]].map(([l,v])=><div key={l} className="ii"><label>{l}</label><span>{v||"–"}</span></div>)}</div><div className="fi" style={{marginBottom:12,maxWidth:200}}><label>Zustand</label><select value={maschine.zustand} onChange={e=>upd({zustand:e.target.value})}><option value="gut">✓ Gut</option><option value="wartung">⚠ Wartung nötig</option><option value="defekt">✗ Defekt</option></select></div>{maschine.beschreibung&&<p style={{color:"var(--tx2)",fontSize:13}}>{maschine.beschreibung}</p>}</div>}
    {tab==="wartung"&&<div><div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button className="btn bp bs" onClick={()=>setModal("wartung")}><I n="plus" s={13}/>Wartungsintervall</button></div>{maschine.wartungen.length===0&&<div className="es"><div>🔧</div>Keine Wartungen</div>}{maschine.wartungen.map(w=><WartungCard key={w.id} w={w} onDone={()=>{const d=prompt("Datum:",new Date().toISOString().slice(0,10));if(d){const n=new Date(d);n.setMonth(n.getMonth()+w.intervallMonate);upd({wartungen:maschine.wartungen.map(x=>x.id===w.id?{...x,letzteDurchfuehrung:d,naechsteFaelligkeit:n.toISOString().slice(0,10)}:x)})}}} onDelete={()=>upd({wartungen:maschine.wartungen.filter(x=>x.id!==w.id)})}/>)}</div>}
    {tab==="stoerung"&&<div><div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button className="btn bp bs" onClick={()=>setModal("stoerung")}><I n="plus" s={13}/>Störung</button></div>{maschine.stoerungen.length===0&&<div className="es"><div>✅</div>Keine Störungen</div>}<div className="tw"><table><thead><tr><th>Datum</th><th>Beschreibung</th><th>Status</th><th>Lösung</th></tr></thead><tbody>{maschine.stoerungen.map(s=><tr key={s.id}><td>{formatDate(s.datum)}</td><td style={{color:"var(--tx)"}}>{s.beschreibung}</td><td><span className={`ss ${s.status==="offen"?"so":s.status==="in_bearbeitung"?"si":"se"}`}>{s.status==="offen"?"Offen":s.status==="in_bearbeitung"?"In Bearb.":"Erledigt"}</span></td><td style={{fontSize:12}}>{s.loesung||"–"}</td></tr>)}</tbody></table></div></div>}
    {tab==="dokumente"&&<div><div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button className="btn bp bs" onClick={()=>setModal("dokument")}><I n="plus" s={13}/>Dokument</button></div>{maschine.dokumente.length===0&&<div className="es"><div>📄</div>Keine Dokumente</div>}{maschine.dokumente.map((d,i)=><div key={i} className="card" style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><I n="file" s={16}/><div style={{flex:1}}><div style={{fontWeight:500}}>{d.name}</div><div style={{fontSize:11,color:"var(--tx3)"}}>{d.typ}</div></div><a href={d.url} target="_blank" rel="noreferrer" className="btn bg bs"><I n="link" s={12}/>Öffnen</a><button className="btn bd bs bi" onClick={()=>upd({dokumente:maschine.dokumente.filter((_,j)=>j!==i)})}><I n="trash" s={13}/></button></div>)}</div>}
    {modal==="wartung"&&<Modal title="Wartungsintervall" onClose={()=>setModal(null)}><WartungForm onSave={d=>{upd({wartungen:[...maschine.wartungen,{id:newId(),...d}]});setModal(null)}} onClose={()=>setModal(null)}/></Modal>}
    {modal==="stoerung"&&<Modal title="Störung melden" onClose={()=>setModal(null)}><StoerungForm onSave={d=>{upd({stoerungen:[...maschine.stoerungen,{id:newId(),...d}]});setModal(null)}} onClose={()=>setModal(null)}/></Modal>}
    {modal==="dokument"&&<Modal title="Dokument" onClose={()=>setModal(null)}><DokumentForm onSave={d=>{upd({dokumente:[...maschine.dokumente,d]});setModal(null)}} onClose={()=>setModal(null)}/></Modal>}
  </div>);
}

function AnlagenListe({ anlagen, filterKat, search, onSelect, onAdd }) {
  const filtered = anlagen.filter(a => (!filterKat||a.kategorie===filterKat)&&(!search||a.name.toLowerCase().includes(search.toLowerCase())||a.standort.toLowerCase().includes(search.toLowerCase())));
  return (<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{color:"var(--tx2)",fontSize:13}}>{filtered.length} Anlage{filtered.length!==1?"n":""}</span><button className="btn bp bs" onClick={onAdd}><I n="plus" s={13}/>Neue Anlage</button></div>{filtered.length===0&&<div className="es"><div>🔍</div>Keine Anlagen</div>}<div className="cg">{filtered.map(a=>{const ki=ANLAGEN_KATEGORIEN.find(k=>k.id===a.kategorie);const nw=a.wartungen.filter(w=>w.naechsteFaelligkeit).sort((x,y)=>new Date(x.naechsteFaelligkeit)-new Date(y.naechsteFaelligkeit))[0];const t=nw?tageFaellig(nw.naechsteFaelligkeit):null;const os=a.stoerungen.filter(s=>s.status!=="erledigt").length;return(<div key={a.id} className="card ac" onClick={()=>onSelect(a.id)}><div className="ac-hd"><span className="ac-ic">{ki?.icon||"⚙️"}</span><div style={{flex:1}}><div className="ac-nm">{a.name}</div><div className="ac-mt">{a.hersteller} {a.modell}</div></div><I n="chevronRight" s={14}/></div><div className="ac-st">📍 {a.standort}</div><div className="tags">{nw&&<span style={{fontSize:11,color:statusColor(t),border:`1px solid ${statusColor(t)}`,padding:"2px 8px",borderRadius:20}}>🔧 {statusLabel(t)}</span>}{os>0&&<span className="tag tr">⚠ {os} Störung{os>1?"en":""}</span>}{a.dokumente.length>0&&<span className="tag tgr">📄 {a.dokumente.length}</span>}</div></div>);})}</div></div>);
}
function MaschinenListe({ maschinen, onSelect, onAdd }) {
  const [search, setSearch] = useState("");
  const [fk, setFk] = useState(null);
  const filtered = maschinen.filter(m=>(!fk||m.kategorie===fk)&&(!search||m.name.toLowerCase().includes(search.toLowerCase())));
  return (<div><div style={{display:"flex",gap:10,marginBottom:16}}><div className="sb" style={{maxWidth:280}}><I n="search" s={14}/><input placeholder="Suchen…" value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="btn bp bs" style={{marginLeft:"auto"}} onClick={onAdd}><I n="plus" s={13}/>Gerät / Maschine</button></div><div className="tt"><button className={`ttb ${!fk?"on":""}`} onClick={()=>setFk(null)}>Alle {maschinen.length}</button>{MASCHINEN_KATEGORIEN.map(k=>{const c=maschinen.filter(m=>m.kategorie===k.id).length;return c>0?<button key={k.id} className={`ttb ${fk===k.id?"on":""}`} onClick={()=>setFk(k.id)}>{k.icon} {k.label} {c}</button>:null;})}</div>{filtered.length===0&&<div className="es"><div>{maschinen.length===0?"📦":"🔍"}</div>{maschinen.length===0?"Noch keine Geräte eingetragen":"Keine Geräte gefunden"}</div>}<div className="cg">{filtered.map(m=>{const ki=MASCHINEN_KATEGORIEN.find(k=>k.id===m.kategorie);const nw=m.wartungen.filter(w=>w.naechsteFaelligkeit).sort((a,b)=>new Date(a.naechsteFaelligkeit)-new Date(b.naechsteFaelligkeit))[0];const t=nw?tageFaellig(nw.naechsteFaelligkeit):null;return(<div key={m.id} className="card ac" onClick={()=>onSelect(m.id)}><div className="ac-hd"><span className="ac-ic">{ki?.icon||"⚙️"}</span><div style={{flex:1}}><div className="ac-nm">{m.name}</div><div className="ac-mt">{m.hersteller||"–"}</div></div><I n="chevronRight" s={14}/></div><div className="ac-st">📍 {m.standort||"–"}</div><div className="tags"><span className={`zb ${m.zustand==="gut"?"zg":m.zustand==="wartung"?"zw":"zd"}`}>{m.zustand==="gut"?"✓ Gut":m.zustand==="wartung"?"⚠ Wartung nötig":"✗ Defekt"}</span>{nw&&<span style={{fontSize:11,color:statusColor(t),border:`1px solid ${statusColor(t)}`,padding:"2px 8px",borderRadius:20}}>🔧 {statusLabel(t)}</span>}</div></div>);})}</div></div>);
}
function Telefonliste({ kontakte, onAdd, onDelete }) {
  const [fk, setFk] = useState("Alle");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const katC={HTV:"kh",Handwerker:"kw",Sonstige:"ks",Pressearbeit:"kp"};
  const katI={HTV:"🎾",Handwerker:"🔧",Sonstige:"📦",Pressearbeit:"📰"};
  const filtered=kontakte.filter(k=>(fk==="Alle"||k.kategorie===fk)&&(!search||k.name.toLowerCase().includes(search.toLowerCase())||k.position.toLowerCase().includes(search.toLowerCase())||(k.firma||"").toLowerCase().includes(search.toLowerCase())));
  return (<div><div style={{display:"flex",gap:10,marginBottom:16}}><div className="sb" style={{maxWidth:280}}><I n="search" s={14}/><input placeholder="Suchen…" value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="btn bp bs" style={{marginLeft:"auto"}} onClick={()=>setShowModal(true)}><I n="plus" s={13}/>Kontakt</button></div><div className="tt">{["Alle",...TELEFON_KATEGORIEN].map(k=><button key={k} className={`ttb ${fk===k?"on":""}`} onClick={()=>setFk(k)}>{katI[k]||""} {k} <span style={{marginLeft:4,opacity:.7}}>{k==="Alle"?kontakte.length:kontakte.filter(x=>x.kategorie===k).length}</span></button>)}</div><div className="card">{filtered.length===0&&<div className="es"><div>🔍</div>Keine Einträge</div>}{filtered.map(k=><div key={k.id} className="tr-row"><div className="ta-v">{katI[k.kategorie]||"👤"}</div><div className="ti"><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span className="tn">{k.name||k.firma||"–"}</span><span className={`kb ${katC[k.kategorie]||""}`}>{k.kategorie}</span></div><div className="tp">{k.position}{k.firma&&k.firma!==k.name?` · ${k.firma}`:""}</div>{k.bemerkungen&&<div className="tf">{k.bemerkungen}</div>}</div><div className="tac">{(k.handy||k.privat)&&<a href={`tel:${(k.handy||k.privat).replace(/\s/g,"")}`} className="btn bg bs"><I n="phone" s={12}/><span className="tno">{k.handy||k.privat}</span></a>}{k.email&&<a href={`mailto:${k.email}`} className="btn bg bs bi"><I n="mail" s={12}/></a>}<button className="btn bd bs bi" onClick={()=>onDelete(k.id)}><I n="trash" s={13}/></button></div></div>)}</div>{showModal&&<Modal title="Kontakt hinzufügen" onClose={()=>setShowModal(false)}><TelForm onSave={d=>{onAdd(d);setShowModal(false);}} onClose={()=>setShowModal(false)}/></Modal>}</div>);
}
function TelForm({ onSave, onClose }) {
  const [f,setF]=useState({kategorie:"HTV",position:"",name:"",handy:"",privat:"",firma:"",email:"",bemerkungen:""});
  const s=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  return (<><div className="fg"><div className="fi"><label>Kategorie</label><select value={f.kategorie} onChange={s("kategorie")}>{TELEFON_KATEGORIEN.map(k=><option key={k}>{k}</option>)}</select></div><div className="fi"><label>Position</label><input value={f.position} onChange={s("position")}/></div><div className="fi"><label>Name</label><input value={f.name} onChange={s("name")}/></div><div className="fi"><label>Firma</label><input value={f.firma} onChange={s("firma")}/></div><div className="fi"><label>Handy</label><input value={f.handy} onChange={s("handy")}/></div><div className="fi"><label>Festnetz</label><input value={f.privat} onChange={s("privat")}/></div><div className="fi fu"><label>E-Mail</label><input value={f.email} onChange={s("email")}/></div><div className="fi fu"><label>Bemerkungen</label><textarea value={f.bemerkungen} onChange={s("bemerkungen")}/></div></div><div className="ma"><button className="btn bg" onClick={onClose}>Abbrechen</button><button className="btn bp" onClick={()=>(f.position||f.name)&&onSave(f)}>Speichern</button></div></>);
}
function Dashboard({ anlagen, maschinen }) {
  const aw=[...anlagen.flatMap(a=>a.wartungen.map(w=>({...w,q:a.name}))),...maschinen.flatMap(m=>m.wartungen.map(w=>({...w,q:m.name})))];
  const as=[...anlagen.flatMap(a=>a.stoerungen.map(s=>({...s,q:a.name}))),...maschinen.flatMap(m=>m.stoerungen.map(s=>({...s,q:m.name})))];
  const ue=aw.filter(w=>tageFaellig(w.naechsteFaelligkeit)<0);
  const bf=aw.filter(w=>{const t=tageFaellig(w.naechsteFaelligkeit);return t>=0&&t<=30;});
  const os=as.filter(s=>s.status!=="erledigt");
  const nw=[...aw].filter(w=>w.naechsteFaelligkeit).sort((a,b)=>new Date(a.naechsteFaelligkeit)-new Date(b.naechsteFaelligkeit)).slice(0,8);
  return (<div><div className="sg">{[{v:anlagen.length+maschinen.length,l:"Objekte gesamt",c:null},{v:ue.length,l:"Wartungen überfällig",c:ue.length>0?"var(--rd)":"var(--gr)"},{v:bf.length,l:"Fällig in 30 Tagen",c:bf.length>0?"var(--am)":"var(--tx)"},{v:os.length,l:"Offene Störungen",c:os.length>0?"var(--rd)":"var(--gr)"}].map(s=><div key={s.l} className="sc"><div className="sv" style={{color:s.c||"var(--tx)"}}>{s.v}</div><div className="sl">{s.l}</div></div>)}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><div><div className="st">Nächste Wartungen</div><div className="card">{nw.length===0&&<div className="es"><div>✅</div>Keine geplant</div>}{nw.map(w=>{const t=tageFaellig(w.naechsteFaelligkeit);return<div key={w.id} className="wr"><span className="dot" style={{background:statusColor(t),boxShadow:`0 0 6px ${statusColor(t)}`}}/><div className="wi"><div className="wn">{w.bezeichnung}</div><div className="wm">{w.q}</div></div><span style={{fontSize:11,color:statusColor(t),whiteSpace:"nowrap"}}>{statusLabel(t)}</span></div>;})}</div></div><div><div className="st">Offene Störungen</div><div className="card">{os.length===0&&<div className="es"><div>✅</div>Keine offenen Störungen</div>}{os.map(s=><div key={s.id} className="wr"><span className="dot dr"/><div className="wi"><div className="wn">{s.beschreibung.slice(0,50)}{s.beschreibung.length>50?"…":""}</div><div className="wm">{s.q} · {formatDate(s.datum)}</div></div></div>)}</div></div></div></div>);
}
function WartungsUebersicht({ anlagen, maschinen }) {
  const alle=[...anlagen.flatMap(a=>a.wartungen.map(w=>({...w,q:a.name,kat:a.kategorie,typ:"a"}))),...maschinen.flatMap(m=>m.wartungen.map(w=>({...w,q:m.name,kat:m.kategorie,typ:"m"})))].sort((a,b)=>(tageFaellig(a.naechsteFaelligkeit)??9999)-(tageFaellig(b.naechsteFaelligkeit)??9999));
  return (<div className="card"><div className="tw"><table><thead><tr><th></th><th>Objekt</th><th>Wartung</th><th>Zuständig</th><th>Zuletzt</th><th>Nächste Fälligkeit</th></tr></thead><tbody>{alle.map(w=>{const t=tageFaellig(w.naechsteFaelligkeit);const ki=w.typ==="a"?ANLAGEN_KATEGORIEN.find(k=>k.id===w.kat):MASCHINEN_KATEGORIEN.find(k=>k.id===w.kat);return<tr key={w.id}><td><span className="dot" style={{background:statusColor(t),boxShadow:`0 0 5px ${statusColor(t)}`}}/></td><td><span style={{marginRight:6}}>{ki?.icon}</span>{w.q}</td><td style={{color:"var(--tx)"}}>{w.bezeichnung}</td><td>{w.zustaendig||"–"}</td><td>{formatDate(w.letzteDurchfuehrung)}</td><td><span style={{color:statusColor(t)}}>{formatDate(w.naechsteFaelligkeit)}</span><span style={{color:statusColor(t),fontSize:11,marginLeft:6}}>({statusLabel(t)})</span></td></tr>;})}</tbody></table></div></div>);
}
function StoerungsUebersicht({ anlagen, maschinen }) {
  const alle=[...anlagen.flatMap(a=>a.stoerungen.map(s=>({...s,q:a.name,kat:a.kategorie}))),...maschinen.flatMap(m=>m.stoerungen.map(s=>({...s,q:m.name})))].sort((a,b)=>new Date(b.datum)-new Date(a.datum));
  const of=alle.filter(s=>s.status!=="erledigt").length;
  return (<div>{of>0&&<div style={{background:"#1a0505",border:"1px solid #7f1d1d",borderRadius:"var(--r)",padding:"12px 16px",marginBottom:16,display:"flex",gap:10,alignItems:"center"}}><I n="warning" s={16}/><span style={{color:"var(--rd)",fontSize:13}}>{of} offene Störung{of>1?"en":""}</span></div>}<div className="card"><div className="tw"><table><thead><tr><th>Datum</th><th>Objekt</th><th>Beschreibung</th><th>Status</th><th>Lösung</th></tr></thead><tbody>{alle.map(s=>{const ki=ANLAGEN_KATEGORIEN.find(k=>k.id===s.kat);return<tr key={s.id}><td style={{whiteSpace:"nowrap"}}>{formatDate(s.datum)}</td><td><span style={{marginRight:6}}>{ki?.icon||"🔧"}</span>{s.q}</td><td style={{color:"var(--tx)"}}>{s.beschreibung}</td><td><span className={`ss ${s.status==="offen"?"so":s.status==="in_bearbeitung"?"si":"se"}`}>{s.status==="offen"?"Offen":s.status==="in_bearbeitung"?"In Bearb.":"Erledigt"}</span></td><td style={{fontSize:12}}>{s.loesung||"–"}</td></tr>;})}</tbody></table></div></div></div>);
}
function AnlageAddForm({ onSave, onClose }) {
  const [f,setF]=useState({name:"",kategorie:"bewaesserung",standort:"",hersteller:"",modell:"",seriennummer:"",kaufdatum:"",garantieBis:"",beschreibung:""});
  const s=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  return(<Modal title="Neue Anlage" onClose={onClose} mw={620}><div className="fg"><div className="fi fu"><label>Name</label><input value={f.name} onChange={s("name")}/></div><div className="fi"><label>Kategorie</label><select value={f.kategorie} onChange={s("kategorie")}>{ANLAGEN_KATEGORIEN.map(k=><option key={k.id} value={k.id}>{k.icon} {k.label}</option>)}</select></div><div className="fi"><label>Standort</label><input value={f.standort} onChange={s("standort")}/></div><div className="fi"><label>Hersteller</label><input value={f.hersteller} onChange={s("hersteller")}/></div><div className="fi"><label>Modell</label><input value={f.modell} onChange={s("modell")}/></div><div className="fi"><label>Seriennummer</label><input value={f.seriennummer} onChange={s("seriennummer")}/></div><div className="fi"><label>Kaufdatum</label><input type="date" value={f.kaufdatum} onChange={s("kaufdatum")}/></div><div className="fi"><label>Garantie bis</label><input type="date" value={f.garantieBis} onChange={s("garantieBis")}/></div><div className="fi fu"><label>Beschreibung</label><textarea value={f.beschreibung} onChange={s("beschreibung")}/></div></div><div className="ma"><button className="btn bg" onClick={onClose}>Abbrechen</button><button className="btn bp" onClick={()=>f.name&&onSave({...f,id:newId(),kontakte:[],dokumente:[],wartungen:[],stoerungen:[]})}>Speichern</button></div></Modal>);
}
function MaschineAddForm({ onSave, onClose }) {
  const [f,setF]=useState({name:"",kategorie:"rasenpflege",standort:"",hersteller:"",modell:"",seriennummer:"",kaufdatum:"",garantieBis:"",zustand:"gut",beschreibung:""});
  const s=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  return(<Modal title="Neue Maschine / Gerät" onClose={onClose} mw={620}><div className="fg"><div className="fi fu"><label>Name</label><input value={f.name} onChange={s("name")}/></div><div className="fi"><label>Kategorie</label><select value={f.kategorie} onChange={s("kategorie")}>{MASCHINEN_KATEGORIEN.map(k=><option key={k.id} value={k.id}>{k.icon} {k.label}</option>)}</select></div><div className="fi"><label>Standort</label><input value={f.standort} onChange={s("standort")}/></div><div className="fi"><label>Hersteller</label><input value={f.hersteller} onChange={s("hersteller")}/></div><div className="fi"><label>Modell</label><input value={f.modell} onChange={s("modell")}/></div><div className="fi"><label>Seriennummer</label><input value={f.seriennummer} onChange={s("seriennummer")}/></div><div className="fi"><label>Kaufdatum</label><input type="date" value={f.kaufdatum} onChange={s("kaufdatum")}/></div><div className="fi"><label>Zustand</label><select value={f.zustand} onChange={s("zustand")}><option value="gut">Gut</option><option value="wartung">Wartung nötig</option><option value="defekt">Defekt</option></select></div><div className="fi fu"><label>Beschreibung</label><textarea value={f.beschreibung} onChange={s("beschreibung")}/></div></div><div className="ma"><button className="btn bg" onClick={onClose}>Abbrechen</button><button className="btn bp" onClick={()=>f.name&&onSave({...f,id:newId(),wartungen:[],stoerungen:[],dokumente:[]})}>Speichern</button></div></Modal>);
}

export default function App() {
  const [anlagen, setAnlagen] = useState([]);
  const [telefon, setTelefon] = useState([]);
  const [maschinen, setMaschinen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [selAnlage, setSelAnlage] = useState(null);
  const [selMaschine, setSelMaschine] = useState(null);
  const [search, setSearch] = useState("");
  const [addAnlage, setAddAnlage] = useState(false);
  const [addMaschine, setAddMaschine] = useState(false);

  useEffect(() => {
    let loaded = { a: false, t: false, m: false };
    const check = () => { if (loaded.a && loaded.t && loaded.m) setLoading(false); };
    const unsubA = onSnapshot(collection(db, "anlagen"), async snap => {
      if (snap.empty) { const batch = writeBatch(db); SEED_ANLAGEN.forEach(a => batch.set(doc(db,"anlagen",a.id),a)); await batch.commit(); }
      else setAnlagen(snap.docs.map(d=>({id:d.id,...d.data()})));
      loaded.a=true; check();
    });
    const unsubT = onSnapshot(collection(db, "telefon"), async snap => {
      if (snap.empty) { const batch = writeBatch(db); SEED_TELEFON.forEach(t => batch.set(doc(db,"telefon",t.id),t)); await batch.commit(); }
      else setTelefon(snap.docs.map(d=>({id:d.id,...d.data()})));
      loaded.t=true; check();
    });
    const unsubM = onSnapshot(collection(db, "maschinen"), snap => {
      setMaschinen(snap.docs.map(d=>({id:d.id,...d.data()})));
      loaded.m=true; check();
    });
    return () => { unsubA(); unsubT(); unsubM(); };
  }, []);

  async function saveAnlage(a) { await setDoc(doc(db,"anlagen",a.id),a); }
  async function saveMaschine(m) { await setDoc(doc(db,"maschinen",m.id),m); }
  async function addTelefon(data) { const id=newId(); await setDoc(doc(db,"telefon",id),{id,...data}); }
  async function deleteTelefon(id) { await deleteDoc(doc(db,"telefon",id)); }

  const foundAnlage=anlagen.find(a=>a.id===selAnlage);
  const foundMaschine=maschinen.find(m=>m.id===selMaschine);
  const ueCount=[...anlagen,...maschinen].flatMap(x=>x.wartungen||[]).filter(w=>tageFaellig(w.naechsteFaelligkeit)<0).length;
  const osCount=[...anlagen,...maschinen].flatMap(x=>x.stoerungen||[]).filter(s=>s.status!=="erledigt").length;
  const filterKat=["dashboard","anlagen","maschinen","wartungen","stoerungen","telefon"].includes(view)?null:view;
  const isAnlagenKat=filterKat&&ANLAGEN_KATEGORIEN.find(k=>k.id===filterKat);
  const nav=(v)=>{setView(v);setSelAnlage(null);setSelMaschine(null);setSearch("");};
  let title=view==="dashboard"?"Dashboard":view==="anlagen"?"Technische Anlagen":view==="maschinen"?"Maschinen & Geräte":view==="wartungen"?"Wartungsübersicht":view==="stoerungen"?"Störungsprotokoll":view==="telefon"?"Telefonliste":isAnlagenKat?`${isAnlagenKat.icon} ${isAnlagenKat.label}`:"";
  if(foundAnlage) title=`${ANLAGEN_KATEGORIEN.find(k=>k.id===foundAnlage.kategorie)?.icon||""} ${foundAnlage.name}`;
  if(foundMaschine) title=`${MASCHINEN_KATEGORIEN.find(k=>k.id===foundMaschine.kategorie)?.icon||""} ${foundMaschine.name}`;

  if(loading) return(<><style>{css}</style><div className="loading"><div className="spin"><I n="sync" s={32}/></div><span>Verbinde mit Datenbank…</span></div></>);

  return (
    <><style>{css}</style>
    <div className="app">
      <div className="sidebar">
        <div className="s-logo">HTV <span>Anlagen</span><small>Helmstedter TV</small></div>
        <div style={{padding:"8px 4px"}}>
          <div className="s-sec">Übersicht</div>
          {[{id:"dashboard",icon:<I n="dashboard" s={14}/>,l:"Dashboard"},{id:"wartungen",icon:<I n="tool" s={14}/>,l:"Wartungen",b:ueCount},{id:"stoerungen",icon:<I n="alert" s={14}/>,l:"Störungen",b:osCount}].map(x=><div key={x.id} className={`s-item ${view===x.id?"on":""}`} onClick={()=>nav(x.id)}>{x.icon}{x.l}{x.b>0&&<span className="bdg">{x.b}</span>}</div>)}
          <div className="s-sec" style={{marginTop:8}}>Anlagen</div>
          <div className={`s-item ${view==="anlagen"?"on":""}`} onClick={()=>nav("anlagen")}><I n="tool" s={14}/>Alle Anlagen</div>
          {ANLAGEN_KATEGORIEN.map(k=>{const c=anlagen.filter(a=>a.kategorie===k.id).length;return(<div key={k.id} className={`s-item ${view===k.id?"on":""}`} onClick={()=>nav(k.id)}><span style={{fontSize:14}}>{k.icon}</span><span style={{flex:1,fontSize:12}}>{k.label}</span>{c>0&&<span style={{fontSize:11,color:view===k.id?"rgba(255,255,255,.7)":"var(--tx3)"}}>{c}</span>}</div>);})}
          <div className="s-sec" style={{marginTop:8}}>Geräte & Kontakte</div>
          <div className={`s-item ${view==="maschinen"?"on":""}`} onClick={()=>nav("maschinen")}><I n="box" s={14}/>Maschinen & Geräte<span style={{fontSize:11,color:view==="maschinen"?"rgba(255,255,255,.7)":"var(--tx3)"}}>{maschinen.length}</span></div>
          <div className={`s-item ${view==="telefon"?"on":""}`} onClick={()=>nav("telefon")}><I n="users" s={14}/>Telefonliste<span style={{fontSize:11,color:view==="telefon"?"rgba(255,255,255,.7)":"var(--tx3)"}}>{telefon.length}</span></div>
        </div>
      </div>
      <div className="main">
        <div className="topbar">
          {(foundAnlage||foundMaschine)?(<><div className="t-back" onClick={()=>{setSelAnlage(null);setSelMaschine(null);}}><I n="back" s={14}/>Zurück</div><h1>{title}</h1><span style={{fontSize:12,color:"var(--tx3)"}}>📍 {(foundAnlage||foundMaschine).standort}</span></>
          ):(<><h1>{title}</h1>{(view==="anlagen"||isAnlagenKat)&&<div className="sb"><I n="search" s={14}/><input placeholder="Suchen…" value={search} onChange={e=>setSearch(e.target.value)}/></div>}<div className="sync-badge"><I n="sync" s={11}/>Firestore</div></>)}
        </div>
        <div className="content">
          {foundAnlage?<AnlageDetail anlage={foundAnlage} onUpdate={saveAnlage}/>
          :foundMaschine?<MaschineDetail maschine={foundMaschine} onUpdate={saveMaschine}/>
          :view==="dashboard"?<Dashboard anlagen={anlagen} maschinen={maschinen}/>
          :view==="wartungen"?<WartungsUebersicht anlagen={anlagen} maschinen={maschinen}/>
          :view==="stoerungen"?<StoerungsUebersicht anlagen={anlagen} maschinen={maschinen}/>
          :view==="telefon"?<Telefonliste kontakte={telefon} onAdd={addTelefon} onDelete={deleteTelefon}/>
          :view==="maschinen"?<MaschinenListe maschinen={maschinen} onSelect={setSelMaschine} onAdd={()=>setAddMaschine(true)}/>
          :<AnlagenListe anlagen={anlagen} filterKat={filterKat} search={search} onSelect={setSelAnlage} onAdd={()=>setAddAnlage(true)}/>}
        </div>
      </div>
    </div>
    {addAnlage&&<AnlageAddForm onSave={d=>{saveAnlage(d);setAddAnlage(false);}} onClose={()=>setAddAnlage(false)}/>}
    {addMaschine&&<MaschineAddForm onSave={d=>{saveMaschine(d);setAddMaschine(false);}} onClose={()=>setAddMaschine(false)}/>}
    </>
  );
}
