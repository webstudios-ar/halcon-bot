require('dotenv').config();
const {
  Client, GatewayIntentBits, REST, Routes,
  SlashCommandBuilder, ModalBuilder, TextInputBuilder,
  TextInputStyle, ActionRowBuilder, EmbedBuilder,
  ButtonBuilder, ButtonStyle, ActivityType,
  StringSelectMenuBuilder, PermissionsBitField,
  AttachmentBuilder, ChannelType
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const GUILD_ID = '1000882508373688331';
const CANAL_H50 = '1362506087818854540';
const CANAL_LOGS = '1347421739470291066';
const CANAL_ASCENSOS = '1370572245281407046';
const CANAL_ESPERANDO = '1347421594137530459';
const CANAL_SECUESTRO = '1363375107078361098';
const ROL_HEAD_PFA = '1347421445869011046';
const ROL_DEVELOPER = '1521009677582991441';
const ROL_DUENOS = '1452149338049613864';
const CANAL_ANTECEDENTES = '1347421650043539468';
const ROL_PFA = '1347421480698515487';
const CANAL_ENCUESTAS_SORTEOS = '1347421639003996162'; // canal exclusivo para encuestas/sorteos
const ROL_LOW_PFA = '1347421473400291338';
const ROL_POSTULACION_APROBADA = '1347421490345283624';
const ROL_PFA_SEMANA = '1347421452109877249';
const ROL_PFA_MES = '1347421450633613384';
const ROL_HIGH = '1347421453020037182';
const ROL_SANCIONES = '1347421486352437281';
const CANALES_FICHAJE = ['1347421710240059453', '1347421719723507833'];
const CANAL_LOGS_FICHAJE = '1521077322898341950';
// Canales de logs administrativos
const CANAL_LOG_FACT_EDIT = '1523014708582682665';   // ediciones y emisiones de facturas
const CANAL_LOG_SAN_EDIT = '1347421736437547130';    // ediciones de sanciones
const CANAL_LOG_AJUSTES = '1522376356024029459';     // ajustes manuales y reset semanal
const CANAL_LOG_BL = '1347421678187188265';           // logs de blacklists
const CANAL_LOG_RESIGN = '1523314445722321026';       // logs de bajas voluntarias (resigns)
// Canales del sistema de advertencias por farmeo
const CANAL_ADV_SUPERVISION = '1393925358050349106'; // canal donde se listan las advertencias
const CANAL_CHAT_LOW = '1361032023011102842';        // canal LOW donde se avisa al oficial LOW
const CANAL_CHAT_HIGH = '1445871357605970042';       // canal HIGH donde se avisa al oficial HIGH
const CANAL_CHAT_HEAD = '1445876980711948469';       // canal HEAD donde se avisa al oficial HEAD
// Canales del sistema de Kcoins
const CANAL_ANUNCIOS_PFA = '1347421637036871732';    // anuncios generales de la PFA
const CANAL_LOG_PAGOS_KCOINS = '1376626739094229032'; // logs de pagos de kcoins
// Configuración del sistema Kcoins
const KCOINS_MULTA_MIN = 3;
const KCOINS_MULTA_MAX = 7;
const KCOINS_NEGRO_MIN = 7;
const KCOINS_NEGRO_MAX = 13;
const KCOINS_JACKPOT_PROB = 0.05; // 5% probabilidad de doble
const KCOINS_TOPE_SEMANAL_GLOBAL = 2500;
const CANAL_FACT_MULTAS = '1399464017554309153';
const CANAL_FACT_NEGRO = '1347421647610843229';
const CANALES_FACTURAS = [CANAL_FACT_MULTAS, CANAL_FACT_NEGRO];

// Fase 5: Sanciones, Ausencias, Blacklist
const CANAL_SANCIONES = '1347421674382954536';
const CANAL_SUP_SANCIONES = '1347421676203282484';   // canal donde se proponen sanciones para aprobar
const CANAL_AUSENCIAS = '1347421628866367520';
const CANAL_BLACKLIST = '1347421678187188265';
const CANAL_APELACIONES = '1521316975622750269';
const CANAL_UPDATES = '1347421633417183242';
const CANAL_GENERAL = '1445871894686470317';
const CANAL_BREAK = '1434732576899334144';
const CANAL_ACTIVIDAD_LOW = '1347421708650283028';
const CANAL_ACTIVIDAD_HIGH = '1347421718200975371';
const CANAL_POSTULAR = '1502109782193209376';
const CANAL_POSTULACIONES_REVISION = '1347421579360993341';
const CANAL_RESULTADO_POSTULACIONES = '1347421583781920849';
const CANAL_INSTRUCTORES = '1347421603935424525';
const CANAL_PEDIR_INSTRUCTOR = '1483349936887173201';
const CANAL_INGRESOS = '1368367980789895258';
const ROL_INSTRUCTOR = '1347421483164766329';
const ROL_ENCARGADO_FICHAJE = '1347421481889566843';
const ROL_AUX_FICHAJE = '1521978791583547502';
const ROL_AUX_SANCIONES = '1521979126301593630';
// Roles que se asignan a un nuevo PFA con /new (saca todo lo demás)
const ROLES_NEW_PFA = ['1347421480698515487', '1347421526173155400', '1347421520758312982', '1347421479569985537', '1347421473400291338', '1347421478861275137'];
const ROL_WARN_1 = '1347421522071126117';
const ROL_WARN_2 = '1347421522876301353';
const ROL_STRIKE_1 = '1347421524294111272';
const ROL_STRIKE_2 = '1347421525485162506';
const ROL_BLACKLIST = '1347421492325126174';
const ROL_CIVIL = '1347421493289549936';
const ROLES_SANCION = [ROL_WARN_1, ROL_WARN_2, ROL_STRIKE_1, ROL_STRIKE_2];

// IDs de CATEGORIAS de tickets (no canales individuales)
const CATEGORIAS_TICKETS = {
  '1347421540773269526': '📨 Apelación',
  '1347421544095416351': '🚨 Reportes',
  '1347421542790856727': '💰 Reintegros',
  '1347421545890320447': '🔧 Soporte Técnico',
};

// Registro semanal de tickets: { userId: { apelacion: 0, reportes: 0, reintegros: 0, soporte: 0, total: 0 } }
let semanaTicketsInicio = new Date(0);
let registroTickets = {};
const TICKETS_FILE = 'semana_tickets.json';
const TICKETS_ACTIVOS_FILE = 'tickets_activos.json';

// ============================================================
// ==================== SISTEMA DE TICKETS V2 =================
// ============================================================
// Canal donde se publica el panel de apertura de tickets
const TKV2_CANAL_PANEL = '1347421573698814075';
// Canal donde se archivan los transcripts al cerrar
const TKV2_CANAL_TRANSCRIPT = '1347421752426365059';
// Horas sin reclamar tras las cuales se dispara una alerta al staff
const TKV2_ALERTA_HORAS = 6;
// Cada cuánto corre el chequeo de tickets sin reclamar (ms)
const TKV2_ALERTA_INTERVALO_MS = 15 * 60 * 1000; // 15 min

// Niveles de privacidad. A mayor nivel, más restringido.
// ver: roles que pueden ver el canal. folder: categoría Discord destino al escalar a ese nivel.
const TKV2_TIERS = {
  1: { nombre: 'HIGH + HEAD',   ver: [ROL_HIGH, ROL_HEAD_PFA], folder: '1347421540773269526' },
  2: { nombre: 'HEAD + Dueños', ver: [ROL_HEAD_PFA, ROL_DUENOS], folder: '1347421542790856727' },
  3: { nombre: 'Solo Dueños',   ver: [ROL_DUENOS],              folder: '1347421544095416351' },
};
const TKV2_TIER_MAX = 3;

// Definición de cada tipo de ticket (los 7 botones del panel).
// tier: nivel de privacidad inicial. folder: categoría Discord donde se crea el canal.
// anon: si el que abre queda anónimo (reportes). ping: roles a los que se avisa al abrir.
// modal: campos del formulario ('reporte' | 'general').
const TKV2_TIPOS = {
  rep_low:    { key: 'rep_low',    label: 'Reportar LOW',        titulo: 'Reporte a Oficial LOW',   tier: 1, folder: '1525041006599340042', anon: true,  modal: 'reporte', color: 0x1F3A5F, ping: [ROL_HEAD_PFA] },
  rep_high:   { key: 'rep_high',   label: 'Reportar HIGH',       titulo: 'Reporte a Oficial HIGH',  tier: 2, folder: '1347421542790856727', anon: true,  modal: 'reporte', color: 0x8A6D1F, ping: [ROL_HEAD_PFA, ROL_DUENOS] },
  rep_head:   { key: 'rep_head',   label: 'Reportar HEAD',       titulo: 'Reporte a un HEAD',       tier: 3, folder: '1347421544095416351', anon: true,  modal: 'reporte', color: 0x7A1F1F, ping: [ROL_DUENOS] },
  consulta:   { key: 'consulta',   label: 'Consulta',            titulo: 'Consulta',                tier: 1, folder: '1347421540773269526', anon: false, modal: 'general', color: 0x1F3A5F, ping: [ROL_HEAD_PFA] },
  reintegro:  { key: 'reintegro',  label: 'Reintegro / Apelación', titulo: 'Reintegro / Apelación', tier: 1, folder: '1347421545890320447', anon: false, modal: 'general', color: 0x1F3A5F, ping: [ROL_HEAD_PFA] },
  admin:      { key: 'admin',      label: 'Administrativo',      titulo: 'Administrativo',          tier: 1, folder: '1347421540773269526', anon: false, modal: 'general', color: 0x1F3A5F, ping: [ROL_HEAD_PFA] },
  emergencia: { key: 'emergencia', label: 'Emergencia',          titulo: 'Emergencia',              tier: 1, folder: '1347421540773269526', anon: false, modal: 'general', color: 0x7A1F1F, ping: [ROL_HEAD_PFA] },
};

// Estado en memoria de los tickets V2 (persistido en tickets_v2.json — repo privado)
// ticketsV2[canalId] = {
//   num, tipo, tierActual, esReporte, estado ('abierto'|'reclamado'|'cerrado'),
//   autorId (quien abrió — visible para los rangos autorizados), reportado, motivo, pruebas, asunto, detalle,
//   reclamadoPor, createdMs, reclamadoMs, alertado, folderId, guildId
// }
let ticketsV2 = {};
let ticketV2Contador = 0; // último número de ticket usado
// Puente MD anónimo: mapea autorId -> canalId del ticket anónimo abierto para relay bidireccional
let ticketV2RelayMD = {};
const TICKETS_V2_FILE = 'tickets_v2.json';

// Fichaje (PFA hours):
// fichajesActivos: { userId: { inicio: ISO, canalId } }
// semanaFichajes: { userId: { totalMs: number, sesiones: [{inicio, fin, ms}] } }
let fichajesActivos = {};
let semanaFichajes = {};
let semanaFichajesInicio = new Date(0);
const FICHAJES_ACTIVOS_FILE = 'fichajes_activos.json';
const FICHAJES_SEMANA_FILE = 'semana_fichajes.json';

// Facturas (PFA invoices):
// semanaFacturas: { userId: { totalMonto: number, totalCount: number, multasMonto: number, multasCount: number, negroMonto: number, negroCount: number, facturas: [{n, monto, tipo, fotoUrl, ts}] } }
let semanaFacturas = {};
let semanaFacturasInicio = new Date(0);
const FACTURAS_SEMANA_FILE = 'semana_facturas.json';

// ==================== RANGOS Y REQUISITOS DE ASCENSOS ====================
// Orden ascendente: indice mas alto = rango superior
const RANGOS_LOW = [
  { id: '1347421478861275137', nombre: 'Cadete' },
  { id: '1347421477485674527', nombre: 'Cabo' },
  { id: '1347421476927705168', nombre: 'Cabo 1\u00B0' },
  { id: '1347421475862478858', nombre: 'Sargento' },
  { id: '1347421474855850067', nombre: 'Sargento 1\u00B0' },
  { id: '1347421472137805834', nombre: 'Teniente' },
  { id: '1347421471172988979', nombre: 'Teniente 1\u00B0' },
  { id: '1512601226070724701', nombre: 'Teniente Mayor' },
  { id: '1347421469772349524', nombre: 'Suboficial' },
  { id: '1347421468698476585', nombre: 'Suboficial Mayor' },
  { id: '1347421467716882473', nombre: 'Oficial' },
  { id: '1512601660185120819', nombre: 'Oficial 1\u00B0' },
  { id: '1512601733979963422', nombre: 'Oficial Mayor' }
];
const RANGOS_HIGH = [
  { id: '1347421466492407868', nombre: 'Sub Inspector' },
  { id: '1347421464110039101', nombre: 'Inspector' },
  { id: '1521589826820898947', nombre: 'Inspector Mayor' },
  { id: '1347421462742696069', nombre: 'Inspector Principal' },
  { id: '1347421460293226568', nombre: 'Sub Coronel' },
  { id: '1347421459659620464', nombre: 'Coronel' },
  { id: '1512601927807008908', nombre: 'Coronel Mayor' },
  { id: '1347421458741071892', nombre: 'Sub Comisario/a' },
  { id: '1347421457512136714', nombre: 'Comisario/a' },
  { id: '1347421456161701921', nombre: 'Comisario/a Mayor' }
];
const RANGOS_HEAD = [
  { id: '1347421449287372852', nombre: 'Sub Jefe/a' },
  { id: '1347421448154910832', nombre: 'Jefe/a' },
  { id: '1347421446837768316', nombre: 'Sub Director' },
  { id: '1448891206338744422', nombre: 'Director' },
  { id: '1520542711692787952', nombre: 'Sub Director/a General' },
  { id: '1347421443209691238', nombre: 'Director/a General' },
  { id: '1505471984618835999', nombre: 'Sub Jefe de Directores' },
  { id: '1347421442538471494', nombre: 'Jefe de Directores' }
];

// Requisitos para ascender
const REQ_LOW = {
  minHoras: 8,
  minAntec: 3,
  promoteHoras: 12,
  promoteAntec: 4,
  promoteMonto: 500000,
  dobleHoras: 22,
  dobleAntec: 6,
  dobleMonto: 1000000,
  cicloDias: 7
};
const REQ_HIGH = {
  minHoras: 7,
  minAntec: 2,
  minTickets: 10,
  promoteHoras: 15,
  promoteAntec: 2,
  promoteTickets: 20,
  cicloDias: 14
};

// Estado adicional: antecedentes y ascensos
let semanaAntecedentes = {}; // { userId: count }
let ascensosHistorial = {};  // { userId: { ultimaFecha: ISO } }
// Registro de quién ingresó a cada PFA (/new, /return)
let ingresosPFA = {};  // { userId: { ingresadoPor: uid, ts: timestamp, comando: 'new'|'return', rangoInicial: str, categoria: 'low'|'high'|'head' } }
// Sistema de reportes de bugs
let reportesBugs = []; // [{ id, userId, categoria, titulo, descripcion, reproducir, ts, resuelto }]
// Blacklists activas con expiración (para BL temporales)
// { userId: { ts, expira, motivo, categoria, aplicadoPor, dias, notificado } }  — expira null = permanente
let blacklistsActivas = {};
// Snapshot de la semana anterior (para PFA de la Semana en la reunión del sábado)
let semanaAnteriorFichajes = {};
// Snapshot COMPLETO de la semana cerrada (horas + antec + tickets + facturas) para /semana y /ascensos
// { inicioISO, finISO, datos: { uid: { horasMs, antec, tickets, monto, facturasCount } } }
let semanaAnteriorFull = null;
const SEMANA_ANTERIOR_FULL_FILE = 'semana_anterior_full.json';
// Acumulador mensual de horas (para PFA del Mes)
let mesFichajesAcum = {};  // { userId: totalMs }
let ultimaFechaPfaMes = null;  // ISO date del último PFA del Mes registrado
// Sistema de advertencias por farmeo de horas
// { userId: { count: 0-3 (contador actual), ciclo: 1,2,3+ (cuántas veces llegó a 3), historial: [{ts, ejecutorId, motivo, ciclo, cerradoFichaje}] } }
let advertenciasFichaje = {};
// Sistema de Kcoins (recompensa por facturas)
let kcoinsData = {
  sistemaActivo: false,     // se activa con /kcoins activar
  kcoinsSemana: {},         // { userId: cantidad }
  totalSemana: 0,           // contador global para el tope
  historialPagos: [],       // pagos históricos permanentes
  jackpotsSemana: {}        // { userId: cantidad de jackpots que salió esta semana }
};
const KCOINS_FILE = 'kcoins.json';
const ANTECEDENTES_FILE = 'semana_antecedentes.json';
const ASCENSOS_HIST_FILE = 'ascensos_historial.json';
const INGRESOS_FILE = 'ingresos_pfa.json';
const REPORTES_BUGS_FILE = 'reportes_bugs.json';
const BLACKLISTS_FILE = 'blacklists_activas.json';
const SEMANA_ANTERIOR_FILE = 'semana_anterior_fichajes.json';
const MES_ACUM_FILE = 'mes_fichajes_acum.json';
const ADV_FICHAJE_FILE = 'advertencias_fichaje.json';

// Fase 5
// sanciones: { userId: { warns: n, strikes: n, historial: [{tipo, motivo, sancionadoPor, ts}] } }
let sanciones = {};
// ausencias: { ausenciaId: { uid, motivo, desdeISO, hastaISO, estado: 'pendiente'|'aprobada'|'rechazada', revisadoPor, ts } }
let ausencias = {};
// apelaciones: { apelacionId: { uid, sancionTs, motivoApelacion, estado, revisadoPor, revisadoTs } }
let apelaciones = {};
// Horas estelares: { activas, multiplicador, inicioMs, finMs, activadoPor }
let horasEstelares = { activas: false, multiplicador: 1, inicioMs: null, finMs: null, activadoPor: null };
let timeoutEstelares = null; // setTimeout dedicado al vencimiento de estelares
// Breaks activos: { userId: { inicioBreakMs, fichajeInicio (ISO original del fichaje) } }
let breaksActivos = {};
let encuestasActivas = {}; // { msgId: { pregunta, opciones, canalId, expiraEn, votos: { uid: opcionIdx }, creadaPor } }
let sorteosActivos = {};   // { msgId: { premio, descripcion, ganadores, minHoras, canalId, expiraEn, participantes: [uids], creadoPor } }
const SANCIONES_FILE = 'sanciones.json';
const AUSENCIAS_FILE = 'ausencias.json';
const APELACIONES_FILE = 'apelaciones.json';
const ESTELARES_FILE = 'horas_estelares.json';
const BREAKS_FILE = 'breaks_activos.json';

// Postulaciones (stats persistentes + estado en memoria por etapas del formulario)
let postulacionesStats = {}; // { 'YYYY-MM-DD': { uidStaff: { aceptadas, rechazadas } } }
const POSTULACIONES_STATS_FILE = 'postulaciones_stats.json';
const postulacionesEnCurso = new Map(); // uid -> { paso1: {...}, paso2: {...} }
let ticketsActivos = {}; // { canalId: { categoriaId, messageId } }
let botListo = false; // true cuando ya cargó todos los datos persistentes

const TIENDAS = ['tienda1', 'tienda2', 'tienda3'];

// Canales operativos de asignación (los 4 Tacticos / Radios). Ya no hay "patrullas" separadas:
//   Tactico 1 / Radio 1 · Tactico 2 / Radio 2 · Tactico 3 / Radio 3 · Tactico 4 / Radio 4
// De estos canales se asigna al personal y acá se lo divide con /patrullar.
const CANALES_TACTICOS = [
  '1355660648910032976', // Tactico 1 · Radio 1
  '1427788971873669201', // Tactico 2 · Radio 2
  '1435481620680282153', // Tactico 3 · Radio 3
  '1435484373595066458', // Tactico 4 · Radio 4
];
// Se mantienen los dos nombres por compatibilidad con el resto del código; ambos apuntan a los Tacticos.
const CANALES_INDIVIDUALES = CANALES_TACTICOS;
const CANALES_PATRULLA = CANALES_TACTICOS;

const ROBOS = {
  tienda1: { canal: '1362914142851436774', nombre: 'Tienda 1', min: 1, max: 3 },
  tienda2: { canal: '1453978522875068426', nombre: 'Tienda 2', min: 1, max: 3 },
  tienda3: { canal: '1362913398827913416', nombre: 'Tienda 3', min: 1, max: 3 },
  facebook: { canal: '1362287835587154071', nombre: 'Facebook', min: 4, max: 6 },
  bancocentral: { canal: '1362513426651283709', nombre: 'Banco Central', min: 7, max: 15 },
  humane: { canal: '1365399784508227584', nombre: 'Humane', min: 7, max: 15 },
  fleecacosta: { canal: '1374468389493280828', nombre: 'Fleeca Costa', min: 3, max: 6 },
  fleecalife: { canal: '1365400107440275526', nombre: 'Fleeca Life', min: 3, max: 6 },
  fleecataller: { canal: '1362513464672649437', nombre: 'Fleeca Taller', min: 3, max: 6 },
  fleecapaleto: { canal: '1378143656761884754', nombre: 'Fleeca Paleto', min: 3, max: 6 },
  fleecaayunta: { canal: '1362513448189169735', nombre: 'Fleeca Ayuntamiento', min: 3, max: 6 },
  fleecasandy: { canal: '1398041090694582333', nombre: 'Fleeca Sandy Shores', min: 3, max: 6 },
  mazebank: { canal: '1362513386314662173', nombre: 'Maze Bank', min: 2, max: 6 },
  mansion: { canal: '1362916819014258718', nombre: 'Mansión', min: 3, max: 6 },
  museo: { canal: '1365400052058820853', nombre: 'Museo', min: 5, max: 8 },
  joyeria: { canal: '1362916726840365296', nombre: 'Joyería', min: 2, max: 5 },
  subteprincipal: { canal: '1452721020984103044', nombre: 'Subte Principal', min: 3, max: 6 },
  subtebahamas: { canal: '1452721517782896640', nombre: 'Subte Bahamas', min: 3, max: 6 },
  subtegaraje: { canal: '1452721435117093065', nombre: 'Subte Garaje', min: 3, max: 6 },
  subteaero: { canal: '1452721685043220583', nombre: 'Subte Aeropuerto', min: 3, max: 6 },
  carniceria: { canal: '1362513481206730893', nombre: 'Carnicería', min: 7, max: 12 },
  estadio: { canal: '1362916764370866247', nombre: 'Estadio', min: 3, max: 7 },
  yate: { canal: '1362915313594794104', nombre: 'Yate', min: 4, max: 6 },
  fabrica: { canal: '1365400767678119996', nombre: 'Fábrica', min: 7, max: 12 },
  rancho: { canal: '1363190192516759812', nombre: 'Rancho Abandonado', min: 4, max: 6 },
  fundidora: { canal: '1403610575518302328', nombre: 'Fundidora', min: 4, max: 6 },
};

const ROL_GEOF_ASIGNACION   = '1384737385551495178';
const ROL_HALCON_ASIGNACION = '1466327608697290854';

// Peso por rango para balanceo — más peso = más "valor" táctico
const PESOS_RANGO = {
  geof:   5,
  halcon: 4,
  head:   4,
  high:   3,
  low:    1,
};

// Categoría del robo según complejidad — determina prioridad de fuerzas especiales
// - chico: usa LOW/HIGH. GEOF/Halcón solo como último recurso si no hay otro.
// - medio: usa LOW/HIGH y suma Halcón si sobra gente. GEOF solo como último recurso.
// - grande: prioriza GEOF/Halcón junto con HIGH/LOW.
const CATEGORIA_ROBO = {
  tienda1: 'chico', tienda2: 'chico', tienda3: 'chico',
  fleecacosta: 'chico', fleecalife: 'chico', fleecataller: 'chico',
  fleecapaleto: 'chico', fleecaayunta: 'chico', fleecasandy: 'chico',
  mazebank: 'medio', joyeria: 'medio', mansion: 'medio',
  facebook: 'medio', estadio: 'medio', yate: 'medio', rancho: 'medio',
  fundidora: 'medio', subteprincipal: 'medio', subtebahamas: 'medio',
  subtegaraje: 'medio', subteaero: 'medio',
  museo: 'grande', bancocentral: 'grande', humane: 'grande',
  carniceria: 'grande', fabrica: 'grande',
};

// Contador de asignaciones del día (rotación justa) — { uid: count }
// Se resetea al cierre diario del bot (00:00 hora Argentina)
let asignacionesHoy = {};

// Determina la categoría de rango de un member (para balanceo)
function detectarCategoriaAsignacion(member) {
  if (member.roles.cache.has(ROL_GEOF_ASIGNACION))   return 'geof';
  if (member.roles.cache.has(ROL_HALCON_ASIGNACION)) return 'halcon';
  if (member.roles.cache.has(ROL_HEAD_PFA))          return 'head';
  if (member.roles.cache.has(ROL_HIGH))              return 'high';
  if (member.roles.cache.has(ROL_LOW_PFA))           return 'low';
  return null;
}

const INFO_ROBOS = {
  tienda1: { armamento: 'Pistolas', humos: 0, latas: 0, molotovs: 0, rehenes: 1 },
  tienda2: { armamento: 'Pistolas', humos: 0, latas: 0, molotovs: 0, rehenes: 1 },
  tienda3: { armamento: 'Pistolas', humos: 0, latas: 0, molotovs: 0, rehenes: 1 },
  facebook: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 2, latas: 3, molotovs: 1, rehenes: 2 },
  bancocentral: { armamento: 'Pistolas, Escopetas, Subfusiles, Fusiles', humos: 3, latas: 6, molotovs: 2, rehenes: 3 },
  humane: { armamento: 'Pistolas, Escopetas, Subfusiles, Fusiles', humos: 4, latas: 6, molotovs: 3, rehenes: 3 },
  fleecacosta: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 1, latas: 3, molotovs: 1, rehenes: 1 },
  fleecalife: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 1, latas: 3, molotovs: 1, rehenes: 1 },
  fleecataller: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 1, latas: 3, molotovs: 1, rehenes: 1 },
  fleecapaleto: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 1, latas: 3, molotovs: 1, rehenes: 1 },
  fleecaayunta: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 1, latas: 3, molotovs: 1, rehenes: 1 },
  fleecasandy: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 1, latas: 3, molotovs: 1, rehenes: 1 },
  mazebank: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 2, latas: 3, molotovs: 1, rehenes: 1 },
  mansion: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 1, latas: 2, molotovs: 1, rehenes: 1 },
  museo: { armamento: 'Pistolas, Escopetas, Subfusiles, Fusiles', humos: 4, latas: 3, molotovs: 2, rehenes: 2 },
  joyeria: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 2, latas: 2, molotovs: 1, rehenes: 0 },
  subteprincipal: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 2, latas: 4, molotovs: 1, rehenes: 1 },
  subtebahamas: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 2, latas: 4, molotovs: 1, rehenes: 1 },
  subtegaraje: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 2, latas: 4, molotovs: 1, rehenes: 1 },
  subteaero: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 2, latas: 4, molotovs: 1, rehenes: 1 },
  carniceria: { armamento: 'Pistolas, Escopetas, Subfusiles, Fusiles', humos: 4, latas: 8, molotovs: 3, rehenes: 3 },
  estadio: { armamento: 'Pistolas, Escopetas, Subfusiles', humos: 2, latas: 3, molotovs: 1, rehenes: 2 },
  yate: { armamento: 'Pistolas, Escopetas, Subfusiles, Fusiles', humos: 2, latas: 3, molotovs: 3, rehenes: 1 },
  fabrica: { armamento: 'Pistolas, Escopetas, Subfusiles, Fusiles', humos: 8, latas: 6, molotovs: 6, rehenes: 2 },
  rancho: { armamento: 'Pistolas, Escopetas, Subfusiles, Fusiles', humos: 3, latas: 4, molotovs: 2, rehenes: 2 },
  fundidora: { armamento: 'Pistolas, Escopetas, Subfusiles, Fusiles', humos: 3, latas: 4, molotovs: 2, rehenes: 2 },
};

// ==================== DELITOS (para /procesando) ====================
const DELITOS = {
  trafico: {
    label: '🚗 Tráfico',
    items: [
      { id: 'tra01', n: 'Mal uso del claxon', p: 1000 },
      { id: 'tra02', n: 'Cruzando ilegalmente una línea continua', p: 1500 },
      { id: 'tra03', n: 'Conducir en el lado equivocado de la carretera', p: 2000 },
      { id: 'tra04', n: 'Giro ilegal en U', p: 1000 },
      { id: 'tra05', n: 'Conducir ilegalmente fuera de la carretera', p: 2000 },
      { id: 'tra06', n: 'Rechazar una orden legal', p: 3000 },
      { id: 'tra07', n: 'Detener ilegalmente un vehículo', p: 1000 },
      { id: 'tra08', n: 'Estacionamiento ilegal', p: 2000 },
      { id: 'tra09', n: 'A falta de ceder a la derecha', p: 2000 },
      { id: 'tra10', n: 'Incumplimiento de la información del vehículo', p: 0 },
      { id: 'tra11', n: 'No parar en una señal de Stop', p: 1500 },
      { id: 'tra12', n: 'No parar en un semáforo rojo', p: 1000 },
      { id: 'tra13', n: 'Paso ilegal', p: 1000 },
      { id: 'tra14', n: 'Conducir un vehículo ilegal', p: 2000 },
      { id: 'tra15', n: 'Conducir sin licencia', p: 3000 },
      { id: 'tra16', n: 'Accidente con fuga', p: 1000 },
      { id: 'tra17', n: 'Exceso de velocidad por', p: 1000 },
      { id: 'tra18', n: 'Exceso de velocidad por 100-250 km/h', p: 1500 },
      { id: 'tra19', n: 'Exceso de velocidad por 250-600 km/h', p: 2000 },
      { id: 'tra20', n: 'Exceso de velocidad por > 600 km/h', p: 3000 },
    ]
  },
  orden: {
    label: '👮 Orden público',
    items: [
      { id: 'ord01', n: 'Impedir el flujo de tráfico', p: 1000 },
      { id: 'ord02', n: 'Intoxicación pública', p: 2000 },
      { id: 'ord03', n: 'Conducta desordenada', p: 3000 },
      { id: 'ord04', n: 'Obstrucción de la justicia', p: 6000 },
      { id: 'ord05', n: 'Insultos hacia los civiles', p: 2000 },
      { id: 'ord06', n: 'Falta de respeto a un oficial', p: 5000 },
      { id: 'ord07', n: 'Amenaza verbal hacia un civil', p: 3000 },
      { id: 'ord08', n: 'Amenaza verbal hacia un oficial', p: 6000 },
      { id: 'ord09', n: 'Proporcionar información falsa', p: 15000 },
      { id: 'ord10', n: 'Intento de corrupción', p: 15000 },
    ]
  },
  armas: {
    label: '🔫 Armas y drogas',
    items: [
      { id: 'arm01', n: 'Blandiendo un arma en los límites de la ciudad', p: 2000 },
      { id: 'arm02', n: 'Blandiendo un arma letal en los límites de la ciudad', p: 6000 },
      { id: 'arm03', n: 'Sin licencia de armas de fuego', p: 10000 },
      { id: 'arm04', n: 'Posesión de un arma ilegal', p: 20000 },
      { id: 'arm05', n: 'Posesión de herramientas de robo', p: 2000 },
      { id: 'arm06', n: 'Acoso y/o violación', p: 10000 },
      { id: 'arm07', n: 'Intención de vender/comprar droga', p: 2000 },
      { id: 'arm08', n: 'Fabricación de una sustancia ilegal', p: 5000 },
      { id: 'arm09', n: 'Posesión de una sustancia ilegal', p: 2000 },
    ]
  },
  graves: {
    label: '🚨 Graves',
    items: [
      { id: 'gra01', n: 'Secuestro de un Civil', p: 20000 },
      { id: 'gra02', n: 'Secuestro de un Oficial', p: 100000 },
      { id: 'gra03', n: 'Robo', p: 30000 },
      { id: 'gra04', n: 'Robo de joyería mano armada', p: 80000 },
      { id: 'gra05', n: 'Robo de banco mano armada', p: 500000 },
      { id: 'gra06', n: 'Fraude', p: 8000 },
    ]
  }
};

// ==================== ARMAS PORTABLES (para /procesando) ====================
const ARMAS_PORTABLES = [
  { id: 'w01', n: 'Pistola de Combate' },
  { id: 'w02', n: 'Pistola Pesada' },
  { id: 'w03', n: 'Pistol MK2' },
  { id: 'w04', n: 'Pistola .50' },
  { id: 'w05', n: 'Pistola AP' },
  { id: 'w06', n: 'Pistola Ametralladora' },
  { id: 'w07', n: 'Micro SMG' },
  { id: 'w08', n: 'SMG' },
  { id: 'w09', n: 'Subfusil PDW' },
  { id: 'w10', n: 'P-90' },
  { id: 'w11', n: 'Compact Rifle' },
  { id: 'w12', n: 'M4' },
  { id: 'w13', n: 'Rifle Avanzado' },
  { id: 'w14', n: 'G36' },
  { id: 'w15', n: 'Tactical Rifle' },
  { id: 'w16', n: 'SCAR-H' },
  { id: 'w17', n: 'Sniper Rifle' },
  { id: 'w18', n: 'Pump Shotgun' },
  { id: 'w19', n: 'Escopeta de Combate' },
  { id: 'w20', n: 'MG de Combate' },
  { id: 'w21', n: 'Lanzagranadas' },
  { id: 'w22', n: 'Molotov' },
];

// Sesiones temporales del flujo /procesando: { sid: { userId, ciudadano, oficialId, armasSel, meses, fotoUrl, sel, ts } }
const procesandoSesiones = {};

// ==================== ORIGEN PARA /cancelar ====================
const origenPersonal = {};

async function cerrarSemanaTicketsAuto(client) {
  try {
    const inicio = semanaTicketsInicio.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });
    const hoy = new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });
    const filas = Object.keys(registroTickets).length > 0
      ? Object.entries(registroTickets).map(([uid, d]) => '<@' + uid + '> \u2014 \uD83C\uDFAB **' + (d.total || 0) + ' total**').join('\n')
      : 'Sin tickets registrados esta semana.';
    const embed = new EmbedBuilder().setTitle('\uD83C\uDFAB SEMANA CERRADA - TICKETS').setDescription(filas).addFields({ name: 'Per\u00edodo', value: inicio + ' - ' + hoy, inline: true }, { name: 'Cerrado por', value: 'Cierre autom\u00e1tico (viernes 23:59)', inline: true }).setColor(0xCC2222).setTimestamp().setFooter({ text: 'H50 Bot - Sistema de Tickets' });
    semanaTicketsInicio = new Date();
    registroTickets = {};
    await guardarTickets();
    const canalAscensos = await client.channels.fetch(CANAL_ASCENSOS);
    await canalAscensos.send({ embeds: [embed] });
    console.log('[AUTO] Semana de tickets cerrada autom\u00e1ticamente (viernes 23:59).');
  } catch (e) {
    console.error('[AUTO] Error cerrando semana de tickets:', e.message);
  }
}

// ==================== HELPER GENÉRICO DE GUARDADO EN GITHUB ====================
// Hace PUT a GitHub con 3 reintentos automáticos (backoff: 0s, 1s, 3s).
// Si los 3 intentos fallan, loguea error crítico y lanza excepción para que el caller pueda reaccionar.
async function subirArchivoGitHub(filename, dataString, mensajeCommit, descCorta) {
  const maxRetries = 3;
  let ultimoError = null;
  for (let intento = 1; intento <= maxRetries; intento++) {
    try {
      // 1. Obtener SHA actual si existe
      const resSha = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${filename}`, {
        headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
      });
      const sha = resSha.status !== 404 ? (await resSha.json()).sha : null;
      // 2. PUT con el contenido nuevo
      const body = { message: mensajeCommit, content: Buffer.from(dataString).toString('base64') };
      if (sha) body.sha = sha;
      const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${filename}`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error('HTTP ' + res.status + ': ' + txt.slice(0, 200));
      }
      // Éxito
      if (intento > 1) console.log('[GITHUB_SAVE] ' + (descCorta || filename) + ' guardado en intento ' + intento + '/' + maxRetries);
      return true;
    } catch (err) {
      ultimoError = err;
      console.error('[GITHUB_SAVE] Intento ' + intento + '/' + maxRetries + ' fallido (' + (descCorta || filename) + '): ' + err.message);
      if (intento < maxRetries) {
        const waitMs = intento === 1 ? 1000 : 3000; // 1s, 3s
        await new Promise(r => setTimeout(r, waitMs));
      }
    }
  }
  // Los 3 intentos fallaron
  const msg = '[GITHUB_SAVE] ❌ FALLA CRÍTICA después de ' + maxRetries + ' intentos: ' + (descCorta || filename) + ' — ' + (ultimoError ? ultimoError.message : 'error desconocido');
  console.error(msg);
  throw new Error(msg);
}

async function guardarTicketsActivos() {
  await subirArchivoGitHub(TICKETS_ACTIVOS_FILE, JSON.stringify(ticketsActivos, null, 2), 'update tickets activos', 'tickets activos');
}

async function cargarTicketsActivos() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${TICKETS_ACTIVOS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    const loaded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    Object.assign(ticketsActivos, loaded);
    console.log('Tickets activos cargados:', Object.keys(ticketsActivos).length);
  } catch (err) { console.error('Error cargando tickets activos:', err.message); }
}

async function guardarTickets() {
  await subirArchivoGitHub(TICKETS_FILE, JSON.stringify({ semanaTicketsInicio: semanaTicketsInicio.toISOString(), registroTickets }, null, 2), 'update tickets', 'tickets');
}

async function cargarTickets() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${TICKETS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) { semanaTicketsInicio = new Date(); return; }
    const data = await res.json();
    const loaded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    semanaTicketsInicio = new Date(loaded.semanaTicketsInicio);
    Object.assign(registroTickets, loaded.registroTickets || {});
    console.log('Tickets cargados desde:', semanaTicketsInicio.toLocaleDateString('es-AR'));
  } catch (err) { console.error('Error cargando tickets:', err.message); semanaTicketsInicio = new Date(); }
}

// ==================== TICKETS V2 (persistencia + lógica) ====================
async function guardarTicketsV2() {
  await subirArchivoGitHub(TICKETS_V2_FILE, JSON.stringify({ contador: ticketV2Contador, tickets: ticketsV2, relay: ticketV2RelayMD }, null, 2), 'update tickets v2', 'tickets v2');
}
async function cargarTicketsV2() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${TICKETS_V2_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) { console.log('Tickets V2: sin archivo previo, arranca en 0.'); return; }
    const data = await res.json();
    const loaded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    ticketV2Contador = loaded.contador || 0;
    Object.assign(ticketsV2, loaded.tickets || {});
    Object.assign(ticketV2RelayMD, loaded.relay || {});
    console.log('Tickets V2 cargados. Contador:', ticketV2Contador, '· activos:', Object.keys(ticketsV2).length);
  } catch (err) { console.error('Error cargando tickets v2:', err.message); }
}

function tkv2NumFmt(n) { return 'TKT-' + String(n).padStart(4, '0'); }
// Toma la primera palabra REAL del nick (saltea [RANGO], emojis y símbolos) y la deja apta para nombre de canal.
function tkv2NombreCorto(member) {
  let raw = (member && (member.displayName || (member.user && member.user.username))) || '';
  raw = raw.replace(/^\s*[\[\(][^\]\)]*[\]\)]\s*/, '');       // saca un [LOW] / [HIGH] / (algo) inicial
  raw = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ñ/gi, 'n'); // tildes y ñ
  // Recorre las palabras y devuelve la primera que tenga contenido alfanumérico (evita emojis/símbolos)
  for (const p of raw.split(/\s+/)) {
    const limpia = p.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (limpia) return limpia;
  }
  return 'ticket';
}

// Permisos por canal según el nivel de privacidad. El folder solo ordena; esto es lo que decide quién ve.
// El canal es privado para el resto del servidor y para el reportado; el reportante y los rangos
// autorizados de ese nivel SÍ ven todo (incluida la identidad de quien reporta).
function tkv2Overwrites(guild, tierLevel, autorId) {
  const F = PermissionsBitField.Flags;
  const rangos = (TKV2_TIERS[tierLevel] || TKV2_TIERS[1]).ver;
  const ow = [
    { id: guild.roles.everyone.id, deny: [F.ViewChannel] },
    { id: client.user.id, allow: [F.ViewChannel, F.SendMessages, F.ReadMessageHistory, F.ManageChannels, F.ManageMessages, F.AttachFiles, F.EmbedLinks] },
  ];
  for (const r of rangos) ow.push({ id: r, allow: [F.ViewChannel, F.SendMessages, F.ReadMessageHistory, F.AttachFiles, F.EmbedLinks] });
  if (autorId) ow.push({ id: autorId, allow: [F.ViewChannel, F.SendMessages, F.ReadMessageHistory, F.AttachFiles, F.EmbedLinks] });
  return ow;
}

// ¿Puede gestionar el ticket? (rangos autorizados del nivel + Dueños)
function tkv2PuedeGestionar(member, t) {
  if (!member) return false;
  if (member.roles.cache.has(ROL_DUENOS)) return true;
  const rangos = (TKV2_TIERS[t.tierActual] || TKV2_TIERS[1]).ver;
  return rangos.some(r => member.roles.cache.has(r));
}

// Embed de bienvenida dentro del canal del ticket
function tkv2EmbedBienvenida(t) {
  const tipo = TKV2_TIPOS[t.tipo];
  const e = new EmbedBuilder()
    .setColor(tipo.color)
    .setAuthor({ name: 'Policía Federal Argentina · H-50' })
    .setTitle(tkv2NumFmt(t.num) + ' · ' + tipo.titulo)
    .setFooter({ text: 'PFA H-50 · Sistema de Tickets' })
    .setTimestamp(new Date(t.createdMs));
  const estadoTxt = t.estado === 'reclamado' ? 'Reclamado' : 'Abierto';
  if (t.esReporte) {
    e.setDescription('Reporte privado. Solo el personal autorizado de este nivel puede ver este canal; el reportado no tiene acceso.');
    e.addFields(
      { name: 'Estado', value: estadoTxt, inline: true },
      { name: 'Nivel de acceso', value: (TKV2_TIERS[t.tierActual] || {}).nombre || '—', inline: true },
      { name: 'Reporta', value: '<@' + t.autorId + '>', inline: true },
      { name: 'Reportado', value: t.reportado ? t.reportado.slice(0, 1000) : '—', inline: false },
      { name: 'Motivo', value: t.motivo ? t.motivo.slice(0, 1024) : '—', inline: false },
    );
    if (t.pruebas) e.addFields({ name: 'Pruebas', value: t.pruebas.slice(0, 1024), inline: false });
  } else {
    e.setDescription('Contanos tu caso con el mayor detalle posible. Un oficial a cargo te atiende en breve.');
    e.addFields(
      { name: 'Estado', value: estadoTxt, inline: true },
      { name: 'Categoría', value: tipo.titulo, inline: true },
      { name: 'Usuario', value: '<@' + t.autorId + '>', inline: true },
      { name: 'Asunto', value: t.asunto ? t.asunto.slice(0, 1024) : '—', inline: false },
      { name: 'Detalle', value: t.detalle ? t.detalle.slice(0, 1024) : '—', inline: false },
    );
  }
  if (t.reclamadoPor) e.addFields({ name: 'Atendido por', value: '<@' + t.reclamadoPor + '>', inline: true });
  return e;
}

// Botonera de acciones dentro del ticket
function tkv2Botones(t) {
  const reclamado = t.estado === 'reclamado';
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('TKV2_CLAIM_' + t.canalId).setLabel(reclamado ? 'Reclamado' : 'Reclamar').setStyle(reclamado ? ButtonStyle.Success : ButtonStyle.Primary).setDisabled(reclamado),
    new ButtonBuilder().setCustomId('TKV2_ESC_' + t.canalId).setLabel('Escalar').setStyle(ButtonStyle.Secondary).setDisabled(t.tierActual >= TKV2_TIER_MAX),
    new ButtonBuilder().setCustomId('TKV2_CLOSE_' + t.canalId).setLabel('Cerrar').setStyle(ButtonStyle.Danger),
  );
  return row;
}

// Modal de apertura según el tipo
function tkv2Modal(tipoKey) {
  const tipo = TKV2_TIPOS[tipoKey];
  const modal = new ModalBuilder().setCustomId('TKV2_MODAL_' + tipoKey).setTitle(tipo.titulo.slice(0, 45));
  if (tipo.modal === 'reporte') {
    modal.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('reportado').setLabel('A quién reportás (nombre / ID)').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(200)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motivo').setLabel('Motivo del reporte').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('pruebas').setLabel('Pruebas (links, contexto)').setStyle(TextInputStyle.Paragraph).setRequired(false).setMaxLength(1000)),
    );
  } else {
    modal.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('asunto').setLabel('Asunto').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(200)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('detalle').setLabel('Detalle').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1500)),
    );
  }
  return modal;
}

// Crea el canal del ticket y publica el embed inicial
async function tkv2CrearTicket(interaction, tipoKey, campos) {
  const tipo = TKV2_TIPOS[tipoKey];
  const guild = interaction.guild;
  // Anti-spam: un ticket abierto del mismo tipo por usuario
  const yaAbierto = Object.values(ticketsV2).find(x => x.autorId === interaction.user.id && x.tipo === tipoKey && x.estado !== 'cerrado');
  if (yaAbierto) {
    return { error: 'Ya tenés un ticket abierto de esta categoría (' + tkv2NumFmt(yaAbierto.num) + '). Esperá a que lo atiendan antes de abrir otro.' };
  }
  ticketV2Contador++;
  const num = ticketV2Contador;
  const esReporte = tipo.modal === 'reporte';
  // Número = cantidad de tickets abiertos en este momento (posición del nuevo), 2 dígitos (01, 02...)
  const abiertos = Object.values(ticketsV2).filter(x => x.estado !== 'cerrado').length;
  const nn = String(abiertos + 1).padStart(2, '0');
  const nombreCanal = nn + '-' + tkv2NombreCorto(interaction.member) + '-' + tipoKey.replace(/_/g, '-');
  let canal;
  try {
    canal = await guild.channels.create({
      name: nombreCanal,
      type: ChannelType.GuildText,
      parent: tipo.folder,
      permissionOverwrites: tkv2Overwrites(guild, tipo.tier, interaction.user.id),
      topic: tkv2NumFmt(num) + ' · ' + tipo.titulo,
    });
  } catch (e) {
    ticketV2Contador--; // revertir el número si falló la creación
    console.error('[TKV2] Error creando canal:', e.message);
    return { error: 'No se pudo crear el canal del ticket. Avisá a un HEAD. (' + e.message + ')' };
  }
  const t = {
    canalId: canal.id, num, tipo: tipoKey, tierActual: tipo.tier, esReporte,
    estado: 'abierto', autorId: interaction.user.id,
    reportado: campos.reportado || null, motivo: campos.motivo || null, pruebas: campos.pruebas || null,
    asunto: campos.asunto || null, detalle: campos.detalle || null,
    reclamadoPor: null, createdMs: Date.now(), reclamadoMs: null, alertado: false,
    folderId: tipo.folder, guildId: guild.id,
  };
  ticketsV2[canal.id] = t;
  try { await guardarTicketsV2(); } catch (e) { console.error('[TKV2] guardar post-crear:', e.message); }

  const pingRoles = (tipo.ping || []).map(r => '<@&' + r + '>').join(' ');
  const contenido = (pingRoles ? pingRoles + ' ' : '') + '<@' + interaction.user.id + '>';
  try {
    await canal.send({ content: contenido, embeds: [tkv2EmbedBienvenida(t)], components: [tkv2Botones(t)] });
  } catch (e) { console.error('[TKV2] enviar embed inicial:', e.message); }

  return { canal, t };
}

// Genera un transcript HTML del canal
async function tkv2GenerarTranscript(canal, t) {
  let mensajes = [];
  try {
    let lastId = null;
    for (let i = 0; i < 12; i++) {
      const opts = { limit: 100 };
      if (lastId) opts.before = lastId;
      const batch = await canal.messages.fetch(opts);
      if (!batch.size) break;
      mensajes.push(...batch.values());
      lastId = batch.last().id;
      if (batch.size < 100) break;
    }
  } catch (e) { console.error('[TKV2] fetch transcript:', e.message); }
  mensajes.reverse();
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const filas = mensajes.map(m => {
    const fecha = new Date(m.createdTimestamp).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
    let autor = m.author && m.author.bot ? 'Sistema' : (m.member?.displayName || m.author?.username || 'Usuario');
    const adj = m.attachments && m.attachments.size ? [...m.attachments.values()].map(a => '<div class="adj"><a href="' + esc(a.url) + '">' + esc(a.name || 'adjunto') + '</a></div>').join('') : '';
    let cuerpo = esc(m.content);
    if (m.embeds && m.embeds.length) {
      cuerpo += m.embeds.map(em => {
        const partes = [];
        if (em.title) partes.push('<b>' + esc(em.title) + '</b>');
        if (em.description) partes.push(esc(em.description));
        if (em.fields) partes.push(em.fields.map(f => '<b>' + esc(f.name) + ':</b> ' + esc(f.value)).join('<br>'));
        return '<div class="embed">' + partes.join('<br>') + '</div>';
      }).join('');
    }
    return '<div class="msg"><span class="meta">' + esc(autor) + ' · ' + fecha + '</span><div class="cont">' + (cuerpo || '<i>(sin texto)</i>') + adj + '</div></div>';
  }).join('\n');
  const tipo = TKV2_TIPOS[t.tipo] || {};
  const cabecera = t.esReporte
    ? '<div class="hdr-row"><b>Reporta:</b> ID ' + esc(t.autorId) + ' &nbsp; <b>Reportado:</b> ' + esc(t.reportado || '—') + '</div>'
    : '<div class="hdr-row"><b>Usuario:</b> ID ' + esc(t.autorId) + '</div>';
  const html = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>' + tkv2NumFmt(t.num) + '</title>' +
    '<style>body{background:#1e1f22;color:#dbdee1;font-family:Segoe UI,Arial,sans-serif;margin:0;padding:24px;}' +
    '.card{max-width:820px;margin:0 auto;}h1{color:#fff;font-size:20px;border-bottom:2px solid ' + ('#' + (tipo.color || 0x1F3A5F).toString(16).padStart(6, '0')) + ';padding-bottom:8px;}' +
    '.hdr{background:#2b2d31;border-radius:8px;padding:14px 18px;margin:14px 0;font-size:14px;line-height:1.6;}' +
    '.hdr-row{margin-top:6px;}.msg{padding:8px 0;border-bottom:1px solid #2b2d31;}' +
    '.meta{color:#949ba4;font-size:12px;}.cont{margin-top:2px;font-size:14px;white-space:pre-wrap;word-wrap:break-word;}' +
    '.embed{border-left:3px solid #4f545c;padding:6px 10px;margin:6px 0;background:#2b2d31;border-radius:4px;}' +
    '.adj a{color:#00a8fc;}footer{color:#949ba4;font-size:12px;margin-top:20px;text-align:center;}</style></head><body><div class="card">' +
    '<h1>' + tkv2NumFmt(t.num) + ' · ' + esc(tipo.titulo || '') + '</h1>' +
    '<div class="hdr"><b>Estado final:</b> Cerrado &nbsp; <b>Nivel de acceso:</b> ' + esc((TKV2_TIERS[t.tierActual] || {}).nombre || '—') +
    (t.reclamadoPor ? ' &nbsp; <b>Atendido por:</b> ID ' + esc(t.reclamadoPor) : '') + cabecera + '</div>' +
    (filas || '<i>Sin mensajes.</i>') +
    '<footer>PFA H-50 · Sistema de Tickets · Transcript generado el ' + new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) + '</footer>' +
    '</div></body></html>';
  return { html, count: mensajes.length };
}

// Cierra el ticket: transcript + archivo + copia al reportante + borrado del canal.
// Diseñado para que el ticket SIEMPRE se cierre y se borre, aunque falle el envío del transcript.
async function tkv2CerrarTicket(canal, t, cerradoPorId) {
  t.estado = 'cerrado';
  const tipo = TKV2_TIPOS[t.tipo] || {};
  const numFmt = tkv2NumFmt(t.num);

  // 1) Generar el transcript (si falla, seguimos igual con el cierre)
  let html = null, count = 0;
  try { const r = await tkv2GenerarTranscript(canal, t); html = r.html; count = r.count; }
  catch (e) { console.error('[TKV2] generar transcript:', e.message); }

  const dur = t.createdMs ? Math.round((Date.now() - t.createdMs) / 60000) : 0;
  const resumen = new EmbedBuilder()
    .setColor(tipo.color || 0x1F3A5F)
    .setAuthor({ name: 'PFA H-50 · Transcript de Ticket' })
    .setTitle(numFmt + ' · ' + (tipo.titulo || ''))
    .addFields(
      { name: 'Estado', value: 'Cerrado', inline: true },
      { name: 'Mensajes', value: String(count), inline: true },
      { name: 'Duración', value: dur >= 60 ? Math.floor(dur / 60) + ' h ' + (dur % 60) + ' min' : dur + ' min', inline: true },
      { name: 'Nivel de acceso', value: (TKV2_TIERS[t.tierActual] || {}).nombre || '—', inline: true },
      { name: 'Atendido por', value: t.reclamadoPor ? '<@' + t.reclamadoPor + '>' : 'Sin reclamar', inline: true },
      { name: 'Cerrado por', value: cerradoPorId ? '<@' + cerradoPorId + '>' : 'Sistema', inline: true },
    )
    .setFooter({ text: 'PFA H-50 · Sistema de Tickets' })
    .setTimestamp();
  if (t.esReporte) resumen.addFields({ name: 'Reporta', value: '<@' + t.autorId + '>', inline: true }, { name: 'Reportado', value: (t.reportado || '—').slice(0, 1024), inline: true });

  // 2) Enviar el transcript al canal de logs (configurado solo para Dueños)
  if (html) {
    try {
      const archivo = await canal.guild.channels.fetch(TKV2_CANAL_TRANSCRIPT).catch(() => null);
      if (archivo) {
        const adj = new AttachmentBuilder(Buffer.from(html, 'utf8'), { name: numFmt + '.html' });
        await archivo.send({ embeds: [resumen], files: [adj] });
      } else {
        console.error('[TKV2] canal de transcripts no encontrado o sin acceso del bot: ' + TKV2_CANAL_TRANSCRIPT);
      }
    } catch (e) { console.error('[TKV2] enviar transcript a logs:', e.message); }

    // 3) Copia del transcript al que abrió el ticket (por privado)
    try {
      const u = await client.users.fetch(t.autorId);
      const adj2 = new AttachmentBuilder(Buffer.from(html, 'utf8'), { name: numFmt + '.html' });
      await u.send({ content: 'Tu ticket ' + numFmt + ' (' + (tipo.titulo || '') + ') fue cerrado. Te dejo la copia del registro completo.', files: [adj2] });
    } catch (e) { /* MD cerrados: no es crítico */ }
  }

  // 4) Cerrar: sacar de activos, persistir y borrar el canal en 5 segundos (pase lo que pase)
  delete ticketsV2[canal.id];
  try { await guardarTicketsV2(); } catch (e) { console.error('[TKV2] guardar post-cierre:', e.message); }
  try { await canal.send({ embeds: [new EmbedBuilder().setColor(0x7A1F1F).setDescription('Ticket cerrado. Este canal se eliminará en 5 segundos.')] }); } catch (e) {}
  setTimeout(() => { canal.delete('Ticket cerrado').catch(() => {}); }, 5000);
}

// Escala el ticket al siguiente nivel de privacidad y lo mueve de folder
async function tkv2Escalar(canal, t) {
  if (t.tierActual >= TKV2_TIER_MAX) return { ok: false, msg: 'El ticket ya está en el nivel máximo de privacidad (Solo Dueños).' };
  t.tierActual++;
  const tier = TKV2_TIERS[t.tierActual];
  try {
    await canal.setParent(tier.folder, { lockPermissions: false });
    await canal.permissionOverwrites.set(tkv2Overwrites(canal.guild, t.tierActual, t.autorId));
  } catch (e) {
    t.tierActual--;
    return { ok: false, msg: 'No se pudo mover el canal: ' + e.message };
  }
  t.folderId = tier.folder;
  try { await guardarTicketsV2(); } catch (e) {}
  return { ok: true, tier };
}

// Chequeo periódico de tickets sin reclamar
async function tkv2ChequearSinReclamar(cli) {
  const ahora = Date.now();
  const limite = TKV2_ALERTA_HORAS * 3600 * 1000;
  for (const [cid, t] of Object.entries(ticketsV2)) {
    if (t.estado !== 'abierto' || t.alertado) continue;
    if (ahora - (t.createdMs || ahora) < limite) continue;
    try {
      const canal = await cli.channels.fetch(cid).catch(() => null);
      if (!canal) { t.alertado = true; continue; }
      const tier = TKV2_TIERS[t.tierActual] || TKV2_TIERS[1];
      const ping = tier.ver.map(r => '<@&' + r + '>').join(' ');
      await canal.send({ content: ping, embeds: [new EmbedBuilder().setColor(0xC0392B).setTitle('Ticket sin reclamar').setDescription('El ticket ' + tkv2NumFmt(t.num) + ' lleva más de ' + TKV2_ALERTA_HORAS + ' horas sin ser reclamado. Requiere atención.').setFooter({ text: 'PFA H-50 · Sistema de Tickets' }).setTimestamp()] });
      t.alertado = true;
      await guardarTicketsV2();
    } catch (e) { console.error('[TKV2] alerta sin reclamar:', e.message); }
  }
}

// Panel público de apertura
function tkv2PanelEmbed() {
  return new EmbedBuilder()
    .setColor(0x1F3A5F)
    .setAuthor({ name: 'Policía Federal Argentina · H-50' })
    .setTitle('Centro de Tickets')
    .setDescription('Seleccioná la categoría según lo que necesites. Se abrirá un canal privado y un oficial a cargo te atenderá.\n\n' +
      '__Reportes de personal__\n' +
      'Reportar LOW, HIGH o HEAD. Los reportes son privados: solo el personal autorizado de cada nivel accede al canal y el reportado nunca lo ve.\n\n' +
      '__Gestión y soporte__\n' +
      'Consulta, Reintegro / Apelación, Administrativo y Emergencia.\n\n' +
      'Antes de abrir, tené a mano los datos y pruebas correspondientes.')
    .setFooter({ text: 'PFA H-50 · Sistema de Tickets · Atención 24/7' });
}
function tkv2PanelBotones() {
  // Discord solo permite 4 colores de botón: azul (Primary), gris (Secondary), verde (Success), rojo (Danger).
  // No existe "violeta" ni dos azules distintos como estilo. Para diferenciar los tres reportes por color
  // se usa un indicador de color (círculo) en el botón: azul para LOW, violeta para HIGH, otro azul para HEAD.
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('TKV2_OPEN_rep_low').setLabel('Reportar LOW').setEmoji('🔵').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('TKV2_OPEN_rep_high').setLabel('Reportar HIGH').setEmoji('🟣').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('TKV2_OPEN_rep_head').setLabel('Reportar HEAD').setEmoji('🔷').setStyle(ButtonStyle.Primary),
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('TKV2_OPEN_consulta').setLabel('Consulta').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('TKV2_OPEN_reintegro').setLabel('Reintegro / Apelación').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('TKV2_OPEN_admin').setLabel('Administrativo').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('TKV2_OPEN_emergencia').setLabel('Emergencia').setStyle(ButtonStyle.Danger),
  );
  return [row1, row2];
}

// ==================== FICHAJES (persistencia) ====================
async function guardarFichajesActivos() {
  await subirArchivoGitHub(FICHAJES_ACTIVOS_FILE, JSON.stringify(fichajesActivos, null, 2), 'update fichajes activos', 'fichajes activos');
}

async function cargarFichajesActivos() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${FICHAJES_ACTIVOS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(fichajesActivos, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    console.log('Fichajes activos cargados:', Object.keys(fichajesActivos).length);
  } catch (err) { console.error('Error cargando fichajes activos:', err.message); }
}

// Guard anti-pérdida: solo se permite guardar la semana de fichajes si primero se cargó bien.
// Evita el escenario catastrófico de: carga falla -> queda vacío -> se guarda vacío -> se pierden las horas de todos.
let semanaFichajesCargada = false;
async function guardarSemanaFichajes() {
  if (!semanaFichajesCargada) {
    throw new Error('[CRITICO] Guardado de semana_fichajes BLOQUEADO: los datos no se cargaron bien al arranque. No se sobrescribe para no perder las horas. Reiniciá el bot cuando GitHub responda.');
  }
  const payload = { semanaFichajesInicio: semanaFichajesInicio.toISOString(), semanaFichajes };
  await subirArchivoGitHub(FICHAJES_SEMANA_FILE, JSON.stringify(payload, null, 2), 'update semana fichajes', 'semana fichajes');
}

async function cargarSemanaFichajes() {
  for (let intento = 1; intento <= 4; intento++) {
    try {
      const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${FICHAJES_SEMANA_FILE}`, {
        headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
      });
      if (res.status === 404) { semanaFichajesInicio = new Date(); semanaFichajesCargada = true; console.log('Semana fichajes: sin archivo previo (semana nueva).'); return; }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const loaded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
      semanaFichajesInicio = new Date(loaded.semanaFichajesInicio);
      Object.assign(semanaFichajes, loaded.semanaFichajes || {});
      semanaFichajesCargada = true;
      console.log('Semana fichajes cargada desde:', semanaFichajesInicio.toLocaleDateString('es-AR'), '· registros:', Object.keys(semanaFichajes).length);
      return;
    } catch (err) {
      console.error('Error cargando semana fichajes (intento ' + intento + '/4):', err.message);
      if (intento < 4) await new Promise(r => setTimeout(r, intento * 2000));
    }
  }
  semanaFichajesCargada = false;
  console.error('[CRITICO] No se pudo cargar semana_fichajes tras 4 intentos. Se BLOQUEAN los guardados de horas para no pisar los datos buenos. Reiniciá el bot cuando GitHub responda.');
}

// ==================== FACTURAS (persistencia) ====================
async function guardarSemanaFacturas() {
  const payload = { semanaFacturasInicio: semanaFacturasInicio.toISOString(), semanaFacturas };
  await subirArchivoGitHub(FACTURAS_SEMANA_FILE, JSON.stringify(payload, null, 2), 'update semana facturas', 'semana facturas');
}

async function cargarSemanaFacturas() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${FACTURAS_SEMANA_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) { semanaFacturasInicio = new Date(); return; }
    const data = await res.json();
    const loaded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    semanaFacturasInicio = new Date(loaded.semanaFacturasInicio);
    Object.assign(semanaFacturas, loaded.semanaFacturas || {});
    console.log('Semana facturas cargada desde:', semanaFacturasInicio.toLocaleDateString('es-AR'));
  } catch (err) { console.error('Error cargando semana facturas:', err.message); semanaFacturasInicio = new Date(); }
}

// Formatea monto a "$X.XXX"
function formatMonto(n) {
  return '$' + Number(n || 0).toLocaleString('es-AR');
}

// ==================== ANTECEDENTES (persistencia) ====================
async function guardarAntecedentes() {
  await subirArchivoGitHub(ANTECEDENTES_FILE, JSON.stringify(semanaAntecedentes, null, 2), 'update antecedentes', 'antecedentes');
}

async function cargarAntecedentes() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${ANTECEDENTES_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(semanaAntecedentes, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    console.log('Antecedentes cargados:', Object.keys(semanaAntecedentes).length);
  } catch (err) { console.error('Error cargando antecedentes:', err.message); }
}

// ==================== ASCENSOS HISTORIAL (persistencia) ====================
async function guardarAscensosHistorial() {
  await subirArchivoGitHub(ASCENSOS_HIST_FILE, JSON.stringify(ascensosHistorial, null, 2), 'update ascensos historial', 'ascensos historial');
}

async function cargarAscensosHistorial() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${ASCENSOS_HIST_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(ascensosHistorial, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    console.log('Ascensos historial cargado:', Object.keys(ascensosHistorial).length);
  } catch (err) { console.error('Error cargando ascensos historial:', err.message); }
}

// ==================== SNAPSHOT SEMANA ANTERIOR (para PFA de la Semana) ====================
async function guardarSemanaAnterior() {
  await subirArchivoGitHub(SEMANA_ANTERIOR_FILE, JSON.stringify(semanaAnteriorFichajes, null, 2), 'update semana anterior', 'semana anterior');
}
async function cargarSemanaAnterior() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${SEMANA_ANTERIOR_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(semanaAnteriorFichajes, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    console.log('Semana anterior cargada:', Object.keys(semanaAnteriorFichajes).length);
  } catch (err) { console.error('Error cargando semana anterior:', err.message); }
}

// Snapshot COMPLETO de la semana cerrada (para /semana y /ascensos)
async function guardarSemanaAnteriorFull() {
  await subirArchivoGitHub(SEMANA_ANTERIOR_FULL_FILE, JSON.stringify(semanaAnteriorFull, null, 2), 'update semana anterior full', 'semana anterior full');
}
async function cargarSemanaAnteriorFull() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${SEMANA_ANTERIOR_FULL_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) { semanaAnteriorFull = null; return; }
    const data = await res.json();
    semanaAnteriorFull = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    console.log('Semana anterior FULL cargada:', semanaAnteriorFull && semanaAnteriorFull.datos ? Object.keys(semanaAnteriorFull.datos).length : 0, 'registros');
  } catch (err) { console.error('Error cargando semana anterior full:', err.message); }
}

// Devuelve las métricas de la semana CERRADA para un uid (snapshot full si existe;
// si no, cae al snapshot de horas viejo; si tampoco, todo en 0).
function metricasSemanaCerrada(uid) {
  if (semanaAnteriorFull && semanaAnteriorFull.datos && semanaAnteriorFull.datos[uid]) {
    const d = semanaAnteriorFull.datos[uid];
    return { horasMs: d.horasMs || 0, antec: d.antec || 0, tickets: d.tickets || 0, monto: d.monto || 0, facturasCount: d.facturasCount || 0 };
  }
  const h = (semanaAnteriorFichajes[uid] || {}).totalMs || 0;
  return { horasMs: h, antec: 0, tickets: 0, monto: 0, facturasCount: 0 };
}
function haySemanaCerrada() {
  return (semanaAnteriorFull && semanaAnteriorFull.datos && Object.keys(semanaAnteriorFull.datos).length > 0)
    || Object.keys(semanaAnteriorFichajes).length > 0;
}

// ==================== MES ACUMULADO FICHAJES (para PFA del Mes) ====================
async function guardarMesAcum() {
  const data = { acum: mesFichajesAcum, ultimaFechaPfaMes };
  await subirArchivoGitHub(MES_ACUM_FILE, JSON.stringify(data, null, 2), 'update mes acum', 'mes acum');
}
async function cargarMesAcum() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${MES_ACUM_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    const parsed = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    Object.assign(mesFichajesAcum, parsed.acum || {});
    ultimaFechaPfaMes = parsed.ultimaFechaPfaMes || null;
    console.log('Mes acum cargado:', Object.keys(mesFichajesAcum).length, '· ultima fecha PFA mes:', ultimaFechaPfaMes);
  } catch (err) { console.error('Error cargando mes acum:', err.message); }
}

// ==================== INGRESOS DE PFA (persistencia) ====================
async function guardarIngresos() {
  await subirArchivoGitHub(INGRESOS_FILE, JSON.stringify(ingresosPFA, null, 2), 'update ingresos pfa', 'ingresos');
}
async function cargarIngresos() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${INGRESOS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(ingresosPFA, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    console.log('Ingresos PFA cargados:', Object.keys(ingresosPFA).length);
  } catch (err) { console.error('Error cargando ingresos PFA:', err.message); }
}

// ==================== REPORTES DE BUGS (persistencia) ====================
async function guardarReportesBugs() {
  await subirArchivoGitHub(REPORTES_BUGS_FILE, JSON.stringify(reportesBugs, null, 2), 'update reportes bugs', 'reportes');
}
async function cargarReportesBugs() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${REPORTES_BUGS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    const parsed = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    if (Array.isArray(parsed)) reportesBugs.push(...parsed);
    console.log('Reportes bugs cargados:', reportesBugs.length);
  } catch (err) { console.error('Error cargando reportes bugs:', err.message); }
}

// ==================== BLACKLISTS ACTIVAS (persistencia) ====================
async function guardarBlacklists() {
  await subirArchivoGitHub(BLACKLISTS_FILE, JSON.stringify(blacklistsActivas, null, 2), 'update blacklists', 'blacklists');
}
async function cargarBlacklists() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${BLACKLISTS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(blacklistsActivas, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    console.log('Blacklists activas cargadas:', Object.keys(blacklistsActivas).length);
  } catch (err) { console.error('Error cargando blacklists:', err.message); }
}

// ==================== ADVERTENCIAS DE FICHAJE (persistencia) ====================
async function guardarAdvertenciasFichaje() {
  await subirArchivoGitHub(ADV_FICHAJE_FILE, JSON.stringify(advertenciasFichaje, null, 2), 'update advertencias fichaje', 'advertencias');
}
async function cargarAdvertenciasFichaje() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${ADV_FICHAJE_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(advertenciasFichaje, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    console.log('Advertencias fichaje cargadas:', Object.keys(advertenciasFichaje).length);
  } catch (err) { console.error('Error cargando advertencias fichaje:', err.message); }
}

// ==================== KCOINS (persistencia + helpers) ====================
async function guardarKcoins() {
  await subirArchivoGitHub(KCOINS_FILE, JSON.stringify(kcoinsData, null, 2), 'update kcoins', 'kcoins');
}
async function cargarKcoins() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${KCOINS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    const parsed = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    kcoinsData.sistemaActivo = !!parsed.sistemaActivo;
    kcoinsData.kcoinsSemana = parsed.kcoinsSemana || {};
    kcoinsData.totalSemana = parsed.totalSemana || 0;
    kcoinsData.historialPagos = parsed.historialPagos || [];
    kcoinsData.jackpotsSemana = parsed.jackpotsSemana || {};
    console.log('Kcoins cargados · activo:', kcoinsData.sistemaActivo, '· total semana:', kcoinsData.totalSemana);
  } catch (err) { console.error('Error cargando kcoins:', err.message); }
}

// Calcula kcoins con aleatoriedad + jackpot. Devuelve { kcoins, jackpot, base }
function calcularKcoinsFactura(tipo) {
  const min = tipo === 'negro' ? KCOINS_NEGRO_MIN : KCOINS_MULTA_MIN;
  const max = tipo === 'negro' ? KCOINS_NEGRO_MAX : KCOINS_MULTA_MAX;
  const base = Math.floor(Math.random() * (max - min + 1)) + min;
  const esJackpot = Math.random() < KCOINS_JACKPOT_PROB;
  return { kcoins: esJackpot ? base * 2 : base, jackpot: esJackpot, base };
}

// ==================== SANCIONES (persistencia) ====================
async function guardarSanciones() {
  await subirArchivoGitHub(SANCIONES_FILE, JSON.stringify(sanciones, null, 2), 'update sanciones', 'sanciones');
}

async function cargarSanciones() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${SANCIONES_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(sanciones, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    console.log('Sanciones cargadas:', Object.keys(sanciones).length);
  } catch (err) { console.error('Error cargando sanciones:', err.message); }
}

// ==================== AUSENCIAS (persistencia) ====================
async function guardarAusencias() {
  await subirArchivoGitHub(AUSENCIAS_FILE, JSON.stringify(ausencias, null, 2), 'update ausencias', 'ausencias');
}

async function cargarAusencias() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${AUSENCIAS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(ausencias, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    console.log('Ausencias cargadas:', Object.keys(ausencias).length);
  } catch (err) { console.error('Error cargando ausencias:', err.message); }
}

// ==================== APELACIONES (persistencia) ====================
async function guardarApelaciones() {
  await subirArchivoGitHub(APELACIONES_FILE, JSON.stringify(apelaciones, null, 2), 'update apelaciones', 'apelaciones');
}

async function cargarApelaciones() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${APELACIONES_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(apelaciones, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    console.log('Apelaciones cargadas:', Object.keys(apelaciones).length);
  } catch (err) { console.error('Error cargando apelaciones:', err.message); }
}

// ==================== HORAS ESTELARES (persistencia) ====================
async function guardarEstelares() {
  await subirArchivoGitHub(ESTELARES_FILE, JSON.stringify(horasEstelares, null, 2), 'update horas estelares', 'estelares');
}

async function cargarEstelares() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${ESTELARES_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(horasEstelares, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    if (horasEstelares.activas) {
      console.log('Estelares activas: x' + horasEstelares.multiplicador + ' hasta ' + new Date(horasEstelares.finMs).toLocaleString('es-AR'));
    }
  } catch (err) { console.error('Error cargando estelares:', err.message); }
}

// ==================== BREAKS ACTIVOS (persistencia) ====================
async function guardarBreaks() {
  await subirArchivoGitHub(BREAKS_FILE, JSON.stringify(breaksActivos, null, 2), 'update breaks activos', 'breaks');
}

async function cargarBreaks() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${BREAKS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    Object.assign(breaksActivos, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')));
    console.log('Breaks activos cargados:', Object.keys(breaksActivos).length);
  } catch (err) { console.error('Error cargando breaks:', err.message); }
}

const ENCUESTAS_FILE = 'encuestas_activas.json';
const SORTEOS_FILE = 'sorteos_activos.json';

async function guardarEncuestas() {
  await subirArchivoGitHub(ENCUESTAS_FILE, JSON.stringify(encuestasActivas, null, 2), 'update encuestas activas', 'encuestas');
}
async function cargarEncuestas() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${ENCUESTAS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    encuestasActivas = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    console.log('Encuestas activas cargadas:', Object.keys(encuestasActivas).length);
  } catch (err) { console.error('Error cargando encuestas:', err.message); }
}

// Arma el texto con la lista de votantes por opción de una encuesta (para taggear).
function encuestaVotantesTexto(enc) {
  const porOpcion = enc.opciones.map(() => []);
  for (const [uid, idx] of Object.entries(enc.votos || {})) {
    if (porOpcion[idx]) porOpcion[idx].push(uid);
  }
  const totalVotos = Object.keys(enc.votos || {}).length;
  let out = '**Votantes — ' + enc.pregunta + '**\nTotal: ' + totalVotos + ' voto(s)\n\n';
  enc.opciones.forEach((op, i) => {
    const lista = porOpcion[i];
    out += '**' + (i + 1) + '. ' + op + '** — ' + lista.length + ' voto(s)\n';
    if (lista.length) {
      out += lista.map(u => '<@' + u + '>').join(' ') + '\n';
      out += 'Para etiquetar: `' + lista.map(u => '<@' + u + '>').join(' ') + '`\n\n';
    } else {
      out += '_Sin votos_\n\n';
    }
  });
  if (out.length > 3900) out = out.slice(0, 3880) + '\n_(lista recortada)_';
  return out;
}

async function guardarSorteos() {
  await subirArchivoGitHub(SORTEOS_FILE, JSON.stringify(sorteosActivos, null, 2), 'update sorteos activos', 'sorteos');
}
async function cargarSorteos() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${SORTEOS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    sorteosActivos = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    console.log('Sorteos activos cargados:', Object.keys(sorteosActivos).length);
  } catch (err) { console.error('Error cargando sorteos:', err.message); }
}

async function guardarPostulacionesStats() {
  await subirArchivoGitHub(POSTULACIONES_STATS_FILE, JSON.stringify(postulacionesStats, null, 2), 'update postulaciones stats', 'postulaciones stats');
}
async function cargarPostulacionesStats() {
  try {
    const res = await fetch(`https://api.github.com/repos/webstudios-ar/h50-bot/contents/${POSTULACIONES_STATS_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    postulacionesStats = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    console.log('Postulaciones stats cargadas:', Object.keys(postulacionesStats).length, 'días');
  } catch (err) { console.error('Error cargando postulaciones stats:', err.message); }
}

// Helper: registrar una decisión de postulación (aceptada o rechazada) en stats
async function registrarDecisionPostulacion(uidStaff, tipo) {
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }); // YYYY-MM-DD
  if (!postulacionesStats[hoy]) postulacionesStats[hoy] = {};
  if (!postulacionesStats[hoy][uidStaff]) postulacionesStats[hoy][uidStaff] = { aceptadas: 0, rechazadas: 0 };
  if (tipo === 'aceptada') postulacionesStats[hoy][uidStaff].aceptadas++;
  else if (tipo === 'rechazada') postulacionesStats[hoy][uidStaff].rechazadas++;
  await guardarPostulacionesStats();
}

// Multiplicador vigente (1 si no hay estelares activas)
function multiVigente() {
  if (!horasEstelares.activas) return 1;
  if (horasEstelares.finMs && Date.now() >= horasEstelares.finMs) return 1;
  return horasEstelares.multiplicador || 1;
}

// Calcula desglose de horas reales vs estelares de una lista de sesiones
function calcularEstelares(sesiones) {
  let msReal = 0, msTotal = 0, sesionesEstelares = 0;
  const multisUsados = new Set();
  for (const s of (sesiones || [])) {
    const sMs = s.ms || 0;
    const sReal = s.msReal !== undefined ? s.msReal : sMs;
    const multi = s.multiplicador || 1;
    msReal += sReal;
    msTotal += sMs;
    if (multi > 1) {
      sesionesEstelares++;
      multisUsados.add(multi);
    }
  }
  const msEstelarBonus = msTotal - msReal;
  return { msReal, msTotal, msEstelarBonus, sesionesEstelares, multisUsados: Array.from(multisUsados) };
}

// ==================== GUÍA DE COMANDOS ====================
// Dos versiones: para todos los PFA (LOW/HIGH) y para staff (HEAD/HIGH)
function construirGuiaEmbedsLow() {
  const FOOTER = 'H-50 Bot · WebStudios AR · PFA Kilombo RP';
  const cmd = (name, desc) => `\`${name}\`\n${desc}\n`;

  const header = new EmbedBuilder()
    .setTitle('Guía de Comandos — LOW PFA')
    .setColor(0x22AA44)
    .setDescription('Comandos disponibles para oficiales LOW de la PFA.\nAcá tenés lo esencial para tu día a día.');

  const fichaje = new EmbedBuilder()
    .setTitle('Fichaje y Actividad')
    .setColor(0x22AA44)
    .setDescription(
      cmd('/pfa on · /pfa off', 'Abrir y cerrar tu fichaje.') +
      cmd('/pfa horas', 'Ver tus horas, facturación, paga estimada y Kcoins de la semana.') +
      cmd('/pfa hoy @vos', 'Ver las horas que hiciste hoy.') +
      cmd('/pfa ranking', 'Top 10 de actividad semanal.')
    );

  const trabajo = new EmbedBuilder()
    .setTitle('Trabajo Diario')
    .setColor(0xFFAA00)
    .setDescription(
      cmd('/facturar', 'Registrar una factura (multa o negro) con monto y foto. Suma Kcoins automáticamente.') +
      cmd('/pfa factura-editar', 'Corregir el monto de una factura propia con error.') +
      cmd('/procesando', 'Registrar un antecedente.') +
      cmd('/check placa', 'Verificar si un número de placa está disponible.')
    );

  const kcoins = new EmbedBuilder()
    .setTitle('Kcoins')
    .setColor(0xF1C40F)
    .setDescription(
      cmd('/kcoins ranking', 'Ver el ranking de Kcoins ganados esta semana.\n_Cada factura suma Kcoins aleatorios. Se pagan los sábados post-reunión._')
    );

  const sancion = new EmbedBuilder()
    .setTitle('Sanciones y Ausencias')
    .setColor(0xCC2222)
    .setDescription(
      cmd('/pfa sanciones @oficial', 'Ver historial de sanciones de un PFA.') +
      cmd('/pfa apelar', 'Apelar una sanción propia (Warn ≥ 15 días · Strike ≥ 30 días).') +
      cmd('/pfa ausencia días motivo', 'Solicitar ausencia justificada (máximo 15 días).')
    )
    .setFooter({ text: FOOTER });

  return [header, fichaje, trabajo, kcoins, sancion];
}

function construirGuiaEmbedsStaff() {
  const FOOTER = 'H-50 Bot · WebStudios AR · PFA Kilombo RP';
  const cmd = (name, desc, perm) => `\`${name}\`\n${desc}\n*Acceso: ${perm}.*\n`;

  const header = new EmbedBuilder()
    .setTitle('Guía de Comandos — Superiores (HIGH y HEAD)')
    .setColor(0x1F3A5F)
    .setDescription('Comandos de gestión disponibles para la oficialidad superior de la PFA.');

  const consultas = new EmbedBuilder()
    .setTitle('Consultas y Control')
    .setColor(0x1F8FFF)
    .setDescription(
      cmd('/pfa abiertos', 'Ver quién tiene fichaje abierto en este momento.', 'HIGH o superior') +
      cmd('/pfa info @oficial', 'Ver toda la actividad semanal de un PFA.', 'HIGH o superior') +
      cmd('/pfa historial @oficial', 'Historial completo del PFA (sanciones, ascensos, egresos).', 'HIGH o superior') +
      cmd('/pfa hoy @oficial', 'Horas trabajadas hoy por un PFA.', 'Todos') +
      cmd('/check placa', 'Verificar si un número de placa está disponible.', 'Todos')
    );

  const fichaje = new EmbedBuilder()
    .setTitle('Control de Fichaje y Advertencias')
    .setColor(0xE67E22)
    .setDescription(
      cmd('/pfa cerrar @oficial', 'Cerrar fichaje ajeno.', 'Encargado/Auxiliar de Fichaje o HEAD') +
      cmd('/adv @oficial [motivo]', 'Advertir por farmeo. A la 3° adv aplica WARN automático. Cierra fichaje si tiene abierto.', 'Encargado/Auxiliar de Fichaje o HEAD')
    );

  const gestion = new EmbedBuilder()
    .setTitle('Gestión de Personal')
    .setColor(0xFFAA00)
    .setDescription(
      cmd('/pfa sancionar @oficial tipo motivo', 'Aplicar warn o strike.', 'Encargado/Auxiliar de Sanciones o HEAD') +
      cmd('/ingresos · /new @oficial', 'Registrar y dar de alta a nuevo PFA post examen.', 'HEAD o Instructor') +
      cmd('/cambiar-nombre @oficial LOW/HIGH nombre placa', 'Cambiar apodo del server con formato PFA.', 'HEAD o Encargado de Fichaje')
    );

  const ascensos = new EmbedBuilder()
    .setTitle('Ascensos y Egresos')
    .setColor(0xFFD700)
    .setDescription(
      cmd('/ascensos · /inactivos', 'Ver candidatos a ascenso e inactivos de la semana.', 'HEAD') +
      cmd('/pfa ascendido @oficial', 'Aplicar ascenso: cambia el rango en Discord y arranca nuevo ciclo.', 'HEAD') +
      cmd('/pfa demote @oficial motivo', 'Egreso temporal (puede volver en 1 mes).', 'HEAD') +
      cmd('/pfa blacklist @oficial motivo [Troll/No apto]', 'Egreso permanente con categoría opcional.', 'HEAD') +
      cmd('/resign @oficial', 'Procesar baja voluntaria.', 'HEAD') +
      cmd('/return low/high/head @oficial rango', 'Reincorporar ex-PFA con rango específico. LOW: HEAD/HIGH/Instructor/Dueños · HIGH: HEAD/HIGH/Dueños · HEAD: solo Dueños.', 'Ver acceso')
    );

  const sistema = new EmbedBuilder()
    .setTitle('Sistema y Ajustes')
    .setColor(0x9B59B6)
    .setDescription(
      cmd('/pfa adicional', 'Activar o desactivar horas estelares (multiplicador temporal).', 'HEAD') +
      cmd('/pfa ajustar · /pfa reset · /pfa relevo', 'Ajustes manuales, reseteo semanal y cierre masivo.', 'HEAD') +
      cmd('/pfa editar-sanciones · /pfa factura-head-editar', 'Editar o anular sanciones y facturas ajenas.', 'HEAD') +
      cmd('/pfa reiniciar', 'Reinicia el bot sin perder datos.', 'Dueños o Developer') +
      cmd('/postulaciones-publicar · /postulaciones-stats', 'Sistema de postulaciones y estadísticas.', 'HEAD')
    );

  const kcoinsDueños = new EmbedBuilder()
    .setTitle('Kcoins (Dueños)')
    .setColor(0xF1C40F)
    .setDescription(
      cmd('/kcoins ranking', 'Ver el ranking de Kcoins ganados esta semana.', 'Todos') +
      cmd('/kcoins activar · desactivar', 'Activar/desactivar el sistema de Kcoins.', 'Dueños') +
      cmd('/kcoins pagar @oficial monto', 'Registrar el pago semanal de Kcoins a un oficial.', 'Dueños')
    )
    .setFooter({ text: FOOTER });

  return [header, consultas, fichaje, gestion, ascensos, sistema, kcoinsDueños];
}

// ==================== CIERRE DIARIO (00:00 ARG) ====================
// Cierra todos los fichajes abiertos, publica ranking del día en canales LOW/HIGH,
// y reabre los fichajes para continuar el nuevo día sin interrupción.
async function cierreDiario(client) {
  const ahora = new Date();
  const ahoraMs = ahora.getTime();
  const inicioDiaMs = ahoraMs - (24 * 60 * 60 * 1000); // ventana de las últimas 24h
  console.log('[CIERRE_DIARIO] Iniciando cierre diario a las ' + ahora.toISOString());

  let guild;
  try { guild = await client.guilds.fetch(GUILD_ID); }
  catch (e) { console.error('[CIERRE_DIARIO] No se pudo obtener guild:', e.message); return; }

  // 1. Cerrar todos los fichajes activos y guardar para reabrir
  const paraReabrir = [];
  for (const uid of Object.keys(fichajesActivos)) {
    const data = fichajesActivos[uid];
    const inicio = new Date(data.inicio);
    const multiUsado = data.multiplicador || 1;
    const msReal = ahoraMs - inicio.getTime();
    if (msReal <= 0) continue;
    const ms = Math.floor(msReal * multiUsado);

    if (!semanaFichajes[uid]) semanaFichajes[uid] = { totalMs: 0, sesiones: [] };
    semanaFichajes[uid].sesiones.push({
      inicio: inicio.toISOString(),
      fin: ahora.toISOString(),
      msReal, multiplicador: multiUsado, ms,
      cierreDiario: true
    });
    semanaFichajes[uid].totalMs = (semanaFichajes[uid].totalMs || 0) + ms;
    paraReabrir.push({ uid, multi: multiUsado });
  }
  await guardarSemanaFichajes();

  // 2. Calcular actividad de las últimas 24h por oficial
  const horasDelDia = {};
  for (const uid of Object.keys(semanaFichajes)) {
    const sesionesHoy = (semanaFichajes[uid].sesiones || []).filter(s => {
      const finMs = new Date(s.fin).getTime();
      return finMs > inicioDiaMs && finMs <= ahoraMs;
    });
    let msTotal = 0;
    let huboEstelar = false;
    for (const s of sesionesHoy) {
      msTotal += s.ms || 0;
      if ((s.multiplicador || 1) > 1) huboEstelar = true;
    }
    if (msTotal > 0) horasDelDia[uid] = { ms: msTotal, estelar: huboEstelar, sesiones: sesionesHoy.length };
  }

  // 3. Separar por rango (LOW vs HIGH)
  const rankingLow = [];
  const rankingHigh = [];
  for (const uid of Object.keys(horasDelDia)) {
    let member = null;
    try { member = await guild.members.fetch(uid); } catch (e) { continue; }
    const rango = detectarRango(member);
    if (!rango) continue;
    const entry = { uid, ms: horasDelDia[uid].ms, estelar: horasDelDia[uid].estelar };
    if (rango.categoria === 'low') rankingLow.push(entry);
    else if (rango.categoria === 'high') rankingHigh.push(entry);
  }
  rankingLow.sort((a, b) => b.ms - a.ms);
  rankingHigh.sort((a, b) => b.ms - a.ms);

  // 4. Fecha del día que se cerró (ayer en sentido cronológico)
  const fechaCierre = new Date(ahoraMs - (12 * 60 * 60 * 1000)); // día anterior
  const fechaTxt = fechaCierre.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric', month: 'long', year: 'numeric' });

  const armarDesc = (lista) => {
    if (lista.length === 0) return '_Sin actividad registrada._';
    return lista.map((r, i) => {
      const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '▸';
      return medalla + ' <@' + r.uid + '> — **' + formatDuracion(r.ms) + '**' + (r.estelar ? ' 🌟' : '');
    }).join('\n');
  };

  // 5. Publicar embed LOW (con MVP del día si hay)
  try {
    const c = await guild.channels.fetch(CANAL_ACTIVIDAD_LOW);
    const embed = new EmbedBuilder()
      .setTitle('Resumen Diario · Actividad LOW PFA')
      .setColor(0x22AA44)
      .setDescription(armarDesc(rankingLow))
      .addFields({ name: 'Fecha', value: fechaTxt, inline: false })
      .setTimestamp().setFooter({ text: 'H-50 Bot · Cierre Diario · WebStudios AR' });
    if (rankingLow.length > 0) {
      embed.addFields({ name: '🏆 MVP del Día (LOW)', value: '<@' + rankingLow[0].uid + '> — **' + formatDuracion(rankingLow[0].ms) + '**' + (rankingLow[0].estelar ? ' 🌟' : ''), inline: false });
    }
    await c.send({ embeds: [embed] });
    console.log('[CIERRE_DIARIO] Publicado en LOW: ' + rankingLow.length + ' oficiales');
  } catch (e) { console.error('[CIERRE_DIARIO] Error embed LOW:', e.message); }

  // 6. Publicar embed HIGH (con MVP del día si hay)
  try {
    const c = await guild.channels.fetch(CANAL_ACTIVIDAD_HIGH);
    const embed = new EmbedBuilder()
      .setTitle('Resumen Diario · Actividad HIGH PFA')
      .setColor(0x1F8FFF)
      .setDescription(armarDesc(rankingHigh))
      .addFields({ name: 'Fecha', value: fechaTxt, inline: false })
      .setTimestamp().setFooter({ text: 'H-50 Bot · Cierre Diario · WebStudios AR' });
    if (rankingHigh.length > 0) {
      embed.addFields({ name: '🏆 MVP del Día (HIGH)', value: '<@' + rankingHigh[0].uid + '> — **' + formatDuracion(rankingHigh[0].ms) + '**' + (rankingHigh[0].estelar ? ' 🌟' : ''), inline: false });
    }
    await c.send({ embeds: [embed] });
    console.log('[CIERRE_DIARIO] Publicado en HIGH: ' + rankingHigh.length + ' oficiales');
  } catch (e) { console.error('[CIERRE_DIARIO] Error embed HIGH:', e.message); }

  // 7. Reabrir fichajes para el nuevo día (conservando multi) + DM a cada uno
  for (const item of paraReabrir) {
    fichajesActivos[item.uid] = { inicio: ahora.toISOString(), multiplicador: item.multi };
    try {
      const memberDm = await guild.members.fetch(item.uid);
      const multiTxt = item.multi > 1 ? ' (con multiplicador 🌟 x' + item.multi + ' activo)' : '';
      await memberDm.send({ content: '🔄 **Cierre diario aplicado**\nTu fichaje fue cerrado por el cierre del día y **reabierto automáticamente** para el nuevo día' + multiTxt + '.\nSeguís activo. Si querés finalizar tu turno, usá `/pfa off`.' });
    } catch (e) { /* DM cerrado, ignorar */ }
  }
  await guardarFichajesActivos();
  console.log('[CIERRE_DIARIO] Reabiertos ' + paraReabrir.length + ' fichajes para el nuevo día');

  // Aviso en canales LOW y HIGH (para que se entere sí o sí quien no leyó el DM)
  const mensajeAviso = '🔄 **Se reinició el día**\nLos fichajes que estaban abiertos fueron **cerrados y reabiertos automáticamente**. Si en este momento **no estás de servicio**, cerrá tu fichaje con `/pfa off` para no ser advertido.';
  try {
    const cLow = await guild.channels.fetch(CANAL_CHAT_LOW);
    await cLow.send({ content: '<@&' + ROL_LOW_PFA + '> ' + mensajeAviso });
    console.log('[CIERRE_DIARIO] Aviso publicado en canal LOW');
  } catch (e) { console.error('[CIERRE_DIARIO] Error aviso LOW:', e.message); }

  try {
    const cHigh = await guild.channels.fetch(CANAL_CHAT_HIGH);
    await cHigh.send({ content: '<@&' + ROL_HIGH + '> ' + mensajeAviso });
    console.log('[CIERRE_DIARIO] Aviso publicado en canal HIGH');
  } catch (e) { console.error('[CIERRE_DIARIO] Error aviso HIGH:', e.message); }
}

// Cierra todos los fichajes abiertos con su multi original y los reabre con un multi nuevo
// Se usa cuando se activan o desactivan las estelares
async function cerrarYReabrirFichajesPorEstelares(multiNuevo) {
  const ahoraISO = new Date().toISOString();
  const ahoraMs = Date.now();
  const afectados = [];
  for (const uid of Object.keys(fichajesActivos)) {
    const data = fichajesActivos[uid];
    const inicio = new Date(data.inicio);
    const msReal = ahoraMs - inicio.getTime();
    const multiAnterior = data.multiplicador || 1;
    const msContado = Math.floor(msReal * multiAnterior);

    if (!semanaFichajes[uid]) semanaFichajes[uid] = { totalMs: 0, sesiones: [] };
    semanaFichajes[uid].sesiones.push({
      inicio: data.inicio,
      fin: ahoraISO,
      msReal,
      multiplicador: multiAnterior,
      msContado,
      transicionEstelares: true
    });
    semanaFichajes[uid].totalMs = (semanaFichajes[uid].totalMs || 0) + msContado;

    // Reabrir inmediatamente con el nuevo multi
    fichajesActivos[uid] = {
      inicio: ahoraISO,
      inicioOriginal: data.inicioOriginal || data.inicio, // preserva el momento real de apertura
      canalId: data.canalId,
      multiplicador: multiNuevo,
      transicionesEstelares: (data.transicionesEstelares || 0) + 1
    };
    afectados.push({ uid, msReal, multiAnterior, msContado });
  }
  await guardarFichajesActivos();
  await guardarSemanaFichajes();
  return afectados;
}

// Activa las estelares + cierra/reabre fichajes + manda aviso al general
// Programa un setTimeout para apagar las estelares EXACTAMENTE al vencimiento
// (mucho más preciso que esperar al chequeo del cron cada minuto)
function programarVencimientoEstelares(client) {
  // Limpiar timeout anterior si existe
  if (timeoutEstelares) {
    clearTimeout(timeoutEstelares);
    timeoutEstelares = null;
  }
  if (!horasEstelares.activas || !horasEstelares.finMs) return;

  const ahoraMs = Date.now();
  const restanteMs = horasEstelares.finMs - ahoraMs;

  if (restanteMs <= 0) {
    // Ya venció: apagar inmediatamente
    console.log('[ESTELARES] Vencimiento ya pasado, apagando ahora');
    client.guilds.fetch(GUILD_ID).then(g => {
      desactivarEstelares(client, g, 'Vencimiento automático del temporizador');
    }).catch(e => console.error('[ESTELARES] Error apagando estelares vencidas:', e.message));
    return;
  }

  console.log('[ESTELARES] Programando vencimiento en ' + Math.round(restanteMs / 60000) + ' min (finMs: ' + new Date(horasEstelares.finMs).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) + ')');
  timeoutEstelares = setTimeout(async () => {
    timeoutEstelares = null;
    console.log('[ESTELARES] ⏰ Timer disparado, apagando estelares');
    try {
      const g = await client.guilds.fetch(GUILD_ID);
      await desactivarEstelares(client, g, 'Vencimiento automático del temporizador');
    } catch (e) {
      console.error('[ESTELARES] Error al apagar por timer:', e.message);
    }
  }, restanteMs);
}

async function activarEstelares(client, guild, multiplicador, horas, ejecutorId) {
  const ahoraMs = Date.now();
  const finMs = ahoraMs + Math.round(horas * 3600000);

  const afectados = await cerrarYReabrirFichajesPorEstelares(multiplicador);

  horasEstelares = {
    activas: true,
    multiplicador,
    inicioMs: ahoraMs,
    finMs,
    activadoPor: ejecutorId
  };
  await guardarEstelares();

  const embed = new EmbedBuilder()
    .setTitle('🌟 HORAS ESTELARES ACTIVADAS 🌟')
    .setDescription('A partir de ahora cada hora trabajada por personal PFA cuenta como **x' + multiplicador + '**.\nLos fichajes abiertos fueron reiniciados automáticamente con el nuevo multiplicador.')
    .addFields(
      { name: '🎯 Multiplicador', value: '**x' + multiplicador + '**', inline: true },
      { name: '⏰ Duración', value: '**' + horas + 'h**', inline: true },
      { name: '🏁 Finalizan', value: '<t:' + Math.floor(finMs / 1000) + ':F>\n(<t:' + Math.floor(finMs / 1000) + ':R>)', inline: false },
      { name: '🔨 Activadas por', value: '<@' + ejecutorId + '>', inline: false }
    )
    .setColor(0xFFD700)
    .setTimestamp()
    .setFooter({ text: 'H-50 Bot · Sistema de Horas Estelares' });

  try {
    const c = await guild.channels.fetch(CANAL_GENERAL);
    await c.send({ content: '<@&' + ROL_PFA + '> 🌟 **HORAS ESTELARES ACTIVAS** 🌟', embeds: [embed] });
  } catch (e) { console.error('Error aviso activacion estelares:', e.message); }

  // Log administrativo al canal de logs de fichaje
  try {
    const cLog = await guild.channels.fetch(CANAL_LOGS_FICHAJE);
    const logEmbed = new EmbedBuilder()
      .setTitle('🌟 ESTELARES ACTIVADAS')
      .setColor(0xF1C40F)
      .addFields(
        { name: 'Activadas por', value: '<@' + ejecutorId + '>', inline: true },
        { name: 'Multiplicador', value: 'x' + multiplicador, inline: true },
        { name: 'Duración', value: horas + 'h', inline: true },
        { name: 'Finaliza', value: '<t:' + Math.floor(finMs / 1000) + ':F>', inline: false },
        { name: 'Oficiales reabiertos con el nuevo multi', value: (afectados && afectados.length > 0) ? String(afectados.length) : '0', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Log de estelares' });
    await cLog.send({ embeds: [logEmbed] });
  } catch (e) { console.error('Log activar estelares:', e.message); }

  // DM a los PFAs cuyo fichaje fue reabierto con el nuevo multi
  for (const uidAf of (afectados || [])) {
    try {
      const memberDm = await guild.members.fetch(uidAf);
      await memberDm.send({ content: '🌟 **Horas Estelares ACTIVADAS — multiplicador x' + multiplicador + '**\nTu fichaje fue reiniciado automáticamente con el nuevo multiplicador. Seguís activo.\nDuración: **' + horas + 'h**.' });
    } catch (e) { /* DM cerrado */ }
  }

  // Programar el timer de vencimiento (preciso al ms)
  programarVencimientoEstelares(client);

  return { afectados, finMs };
}

// Desactiva las estelares (manual o automatico)
async function desactivarEstelares(client, guild, motivo) {
  if (!horasEstelares.activas) return null;

  // Limpiar el timer de vencimiento si existe
  if (timeoutEstelares) {
    clearTimeout(timeoutEstelares);
    timeoutEstelares = null;
  }

  const multiAnterior = horasEstelares.multiplicador;
  const afectados = await cerrarYReabrirFichajesPorEstelares(1);

  horasEstelares = { activas: false, multiplicador: 1, inicioMs: null, finMs: null, activadoPor: null };
  await guardarEstelares();

  const embed = new EmbedBuilder()
    .setTitle('⭐ Horas Estelares finalizadas')
    .setDescription('El multiplicador de **x' + multiAnterior + '** dejó de aplicarse.\nLos fichajes en curso volvieron al multiplicador normal (x1).')
    .addFields(
      { name: '🛑 Motivo', value: motivo || 'Finalización manual', inline: false }
    )
    .setColor(0x888888)
    .setTimestamp()
    .setFooter({ text: 'H-50 Bot · Sistema de Horas Estelares' });

  try {
    const c = await guild.channels.fetch(CANAL_GENERAL);
    await c.send({ content: '<@&' + ROL_PFA + '> ⭐ Las horas estelares finalizaron.', embeds: [embed] });
  } catch (e) { console.error('Error aviso desactivacion estelares:', e.message); }

  // Log administrativo al canal de logs de fichaje
  try {
    const cLog = await guild.channels.fetch(CANAL_LOGS_FICHAJE);
    const logEmbed = new EmbedBuilder()
      .setTitle('⭐ ESTELARES FINALIZADAS')
      .setColor(0x95A5A6)
      .addFields(
        { name: 'Multiplicador anterior', value: 'x' + multiAnterior, inline: true },
        { name: 'Motivo', value: motivo || 'Finalización manual', inline: false },
        { name: 'Oficiales reabiertos con x1', value: (afectados && afectados.length > 0) ? String(afectados.length) : '0', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Log de estelares' });
    await cLog.send({ embeds: [logEmbed] });
  } catch (e) { console.error('Log desactivar estelares:', e.message); }

  // DM a los PFAs cuyo fichaje fue reabierto con x1
  for (const uidAf of (afectados || [])) {
    try {
      const memberDm = await guild.members.fetch(uidAf);
      await memberDm.send({ content: '⭐ **Horas Estelares finalizadas**\nEl multiplicador x' + multiAnterior + ' dejó de aplicarse. Tu fichaje sigue activo con multiplicador normal (x1).' });
    } catch (e) { /* DM cerrado */ }
  }

  return { afectados, multiAnterior };
}

// Verifica si una entrada del historial es apelable (warn ≥15d, strike ≥30d, no pendiente, no ya aprobada)
function entradaEsApelable(h) {
  if (h.tipo !== 'warn' && h.tipo !== 'strike') return false;
  if (h.apelacionPendiente || h.apelacionAprobada) return false;
  const diasMin = h.tipo === 'warn' ? 15 : 30;
  const dias = (Date.now() - h.ts) / (1000 * 60 * 60 * 24);
  return dias >= diasMin;
}

// Recalcula warns/strikes ignorando entradas con apelacionAprobada
function recalcularEstadoSancion(uid) {
  const data = sanciones[uid];
  if (!data) return { warns: 0, strikes: 0 };
  let warns = 0, strikes = 0;
  for (const h of data.historial) {
    if (h.apelacionAprobada) continue;
    if (h.tipo === 'warn') {
      const cant = h.cantidad || 1;
      for (let i = 0; i < cant; i++) {
        warns++;
        if (warns >= 3) { warns = 0; strikes++; }
      }
    } else if (h.tipo === 'strike') {
      strikes += (h.cantidad || 1);
    }
  }
  return { warns: Math.min(warns, 2), strikes: Math.min(strikes, 2) };
}

// Aplica el rol de sanción correcto según el estado actual
async function aplicarRolesSegunEstado(member) {
  const oid = member.id;
  const data = sanciones[oid] || { warns: 0, strikes: 0 };
  try {
    for (const r of ROLES_SANCION) {
      if (member.roles.cache.has(r)) await member.roles.remove(r, 'Recalculo de estado de sanción');
    }
    let rolFinal = null;
    if (data.strikes === 2) rolFinal = ROL_STRIKE_2;
    else if (data.strikes === 1) rolFinal = ROL_STRIKE_1;
    else if (data.warns === 2) rolFinal = ROL_WARN_2;
    else if (data.warns === 1) rolFinal = ROL_WARN_1;
    if (rolFinal) await member.roles.add(rolFinal, 'Actualización por apelación/sanción');
  } catch (e) { console.error('Error aplicando roles según estado:', e.message); }
}

// Verifica si un PFA tiene una ausencia aprobada activa (cubre algún día desde inicio de semana hasta hoy)
function tieneAusenciaActiva(uid) {
  const ahoraMs = Date.now();
  const inicioSemMs = semanaFichajesInicio.getTime();
  for (const a of Object.values(ausencias)) {
    if (a.uid !== uid || a.estado !== 'aprobada') continue;
    const desdeMs = new Date(a.desdeISO).getTime();
    const hastaMs = new Date(a.hastaISO).getTime();
    // La ausencia se solapa con la semana si: desde <= ahora AND hasta >= inicioSemana
    if (desdeMs <= ahoraMs && hastaMs >= inicioSemMs) return true;
  }
  return false;
}

// Aplica blacklist a un member. Le quita TODOS los roles PFA + sanción, le pone rol BLACKLIST,
// publica embed en CANAL_BLACKLIST, y registra en historial de sanciones.
async function aplicarBlacklist(member, motivo, ejecutorId, guild, esAuto, categoria) {
  const oid = member.id;
  const rangoAnterior = detectarRango(member);
  const rangoAntTxt = rangoAnterior ? rangoAnterior.nombre : '_Sin rango_';

  // Quitar TODOS los roles del miembro y dejarle solo el rol BLACKLIST
  try {
    await member.roles.set([ROL_BLACKLIST], 'Blacklist por ' + ejecutorId);
  } catch (e) { console.error('Error blacklist roles.set:', e.message); }

  if (!sanciones[oid]) sanciones[oid] = { warns: 0, strikes: 0, historial: [] };
  sanciones[oid].historial.push({ tipo: 'blacklist', motivo, categoria: categoria || null, sancionadoPor: ejecutorId, ts: Date.now(), rangoAnterior: rangoAntTxt, auto: !!esAuto });
  await guardarSanciones();

  // Mensaje minimalista en updates con categoría entre paréntesis si viene
  const catTxt = categoria ? ' (' + categoria.toUpperCase() + ')' : '';
  const mensaje = '**DEMOTE + BL' + catTxt + '** <@' + oid + '> · **' + rangoAntTxt.toUpperCase() + '** > **CIVIL**';

  try {
    const c = await guild.channels.fetch(CANAL_UPDATES);
    await c.send({ content: mensaje });
  } catch (e) { console.error('Log blacklist:', e.message); }

  // DM al oficial blacklisteado
  try {
    const catDm = categoria ? '\n**Categoría:** ' + categoria : '';
    await member.send({ content: '⛔ **Fuiste removido definitivamente de la PFA (BLACKLIST)**\n\n**Rango anterior:** ' + rangoAntTxt + catDm + '\n**Motivo:** _' + (motivo || 'Sin motivo especificado') + '_\n\n**No podés volver a postularte a la PFA.**\n\n_— PFA Kilombo RP_' });
  } catch (e) { /* DM cerrado */ }

  return { rangoAnterior: rangoAntTxt };
}

// Aplica DEMOTE (3er strike): quita todos los roles PFA + sanción, NO pone rol blacklist.
// El oficial queda como civil y puede volver despues de 1 mes (decision del HEAD).
async function aplicarDemote(member, motivo, ejecutorId, guild) {
  const oid = member.id;
  const rangoAnterior = detectarRango(member);
  const rangoAntTxt = rangoAnterior ? rangoAnterior.nombre : '_Sin rango_';

  // Quitar TODOS los roles del miembro y dejarle solo el rol CIVIL
  try {
    await member.roles.set([ROL_CIVIL], 'Demote por ' + ejecutorId);
  } catch (e) { console.error('Error demote roles.set:', e.message); }

  // Calcular fecha de retorno (1 mes despues)
  const ahora = new Date();
  const puedeVolverFecha = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (!sanciones[oid]) sanciones[oid] = { warns: 0, strikes: 0, historial: [] };
  sanciones[oid].historial.push({
    tipo: 'demote_auto',
    motivo,
    sancionadoPor: ejecutorId,
    ts: Date.now(),
    rangoAnterior: rangoAntTxt,
    puedeVolverTs: puedeVolverFecha.getTime()
  });
  await guardarSanciones();

  // Mensaje minimalista en updates: "DEMOTE <@user> RANGO > CIVIL"
  const mensaje = '**DEMOTE** <@' + oid + '> · **' + rangoAntTxt.toUpperCase() + '** > **CIVIL**';

  try { const c = await guild.channels.fetch(CANAL_UPDATES); await c.send({ content: mensaje }); } catch (e) { console.error('Log demote:', e.message); }

  // DM al oficial demoteado
  try {
    await member.send({ content: '⬇️ **Fuiste removido temporalmente de la PFA (DEMOTE)**\n\n**Rango anterior:** ' + rangoAntTxt + '\n**Motivo:** _' + (motivo || 'Sin motivo especificado') + '_\n\nPodés volver a la PFA en 1 mes (<t:' + Math.floor(puedeVolverFecha.getTime() / 1000) + ':D>) postulándote nuevamente en el canal <#' + CANAL_POSTULAR + '>.\n\n_— PFA Kilombo RP_' });
  } catch (e) { /* DM cerrado */ }

  return { rangoAnterior: rangoAntTxt, puedeVolverFecha };
}

// ==================== HELPERS DE RANGOS ====================
// Devuelve { categoria, indice, nombre, id } o null si no tiene rango
// Devuelve el nombre a mostrar de un miembro: el nickname del server si tiene, sino el username
function nombreDiscord(interactionOrMember) {
  const member = interactionOrMember?.member || interactionOrMember;
  return member?.displayName || member?.nickname || member?.user?.username || 'Desconocido';
}

function detectarRango(member) {
  for (let i = RANGOS_LOW.length - 1; i >= 0; i--) {
    if (member.roles.cache.has(RANGOS_LOW[i].id)) return { categoria: 'low', indice: i, ...RANGOS_LOW[i] };
  }
  for (let i = RANGOS_HIGH.length - 1; i >= 0; i--) {
    if (member.roles.cache.has(RANGOS_HIGH[i].id)) return { categoria: 'high', indice: i, ...RANGOS_HIGH[i] };
  }
  return null;
}

// Dias desde el ultimo ascenso (Infinity si no tiene registro)
function diasDesdeUltimoAscenso(userId) {
  const reg = ascensosHistorial[userId];
  if (!reg || !reg.ultimaFecha) return Infinity;
  return Math.floor((Date.now() - new Date(reg.ultimaFecha).getTime()) / (1000 * 60 * 60 * 24));
}

// Evalua si un PFA cumple los requisitos
function evaluarPFA(categoria, userId, horasMs, antecedentes, monto, tickets, opts) {
  opts = opts || {};
  const horas = horasMs / (1000 * 60 * 60);
  const dias = diasDesdeUltimoAscenso(userId);
  const faltantes = [];
  // Si opts.ignorarAntec es true, los requisitos de antecedentes se dan por cumplidos
  // (se usa cuando la semana no tiene datos de antecedentes por el bug ya corregido).
  const antecOK = (req) => opts.ignorarAntec || antecedentes >= req;

  if (categoria === 'low') {
    const r = REQ_LOW;
    // Doble
    if (horas >= r.dobleHoras && antecOK(r.dobleAntec) && dias >= r.cicloDias) {
      return { elegible: true, doble: true, downgrade: false, faltantes: [], dias, horas };
    }
    // Promote simple
    if (horas >= r.promoteHoras && antecOK(r.promoteAntec) && dias >= r.cicloDias) {
      return { elegible: true, doble: false, downgrade: false, faltantes: [], dias, horas };
    }
    // No asciende: verificar si al menos mantiene la mínima
    const cumpleMinima = horas >= r.minHoras && antecOK(r.minAntec);
    if (!cumpleMinima) {
      // Downgrade
      if (horas < r.minHoras) faltantes.push('mínima ' + r.minHoras + 'h (tiene ' + horas.toFixed(1) + 'h)');
      if (!opts.ignorarAntec && antecedentes < r.minAntec) faltantes.push('mínima ' + r.minAntec + ' antec. (tiene ' + antecedentes + ')');
      return { elegible: false, doble: false, downgrade: true, faltantes, dias, horas };
    }
    // Mantiene pero no asciende
    if (horas < r.promoteHoras) faltantes.push((r.promoteHoras - horas).toFixed(1) + 'h para promote');
    if (!opts.ignorarAntec && antecedentes < r.promoteAntec) faltantes.push((r.promoteAntec - antecedentes) + ' antec. para promote');
    if (dias < r.cicloDias) faltantes.push((r.cicloDias - dias) + 'd ciclo');
    return { elegible: false, doble: false, downgrade: false, faltantes, dias, horas };
  } else {
    const r = REQ_HIGH;
    // Ascenso
    if (horas >= r.promoteHoras && antecOK(r.promoteAntec) && tickets >= r.promoteTickets && dias >= r.cicloDias) {
      return { elegible: true, doble: false, downgrade: false, faltantes: [], dias, horas };
    }
    // Verificar si mantiene la mínima
    const cumpleMinima = horas >= r.minHoras && antecOK(r.minAntec) && tickets >= r.minTickets;
    if (!cumpleMinima) {
      // Downgrade
      if (horas < r.minHoras) faltantes.push('mínima ' + r.minHoras + 'h (tiene ' + horas.toFixed(1) + 'h)');
      if (!opts.ignorarAntec && antecedentes < r.minAntec) faltantes.push('mínima ' + r.minAntec + ' antec. (tiene ' + antecedentes + ')');
      if (tickets < r.minTickets) faltantes.push('mínima ' + r.minTickets + ' tickets (tiene ' + tickets + ')');
      return { elegible: false, doble: false, downgrade: true, faltantes, dias, horas };
    }
    // Mantiene pero no asciende
    if (horas < r.promoteHoras) faltantes.push((r.promoteHoras - horas).toFixed(1) + 'h para promote');
    if (!opts.ignorarAntec && antecedentes < r.promoteAntec) faltantes.push((r.promoteAntec - antecedentes) + ' antec. para promote');
    if (tickets < r.promoteTickets) faltantes.push((r.promoteTickets - tickets) + ' tickets para promote');
    if (dias < r.cicloDias) faltantes.push((r.cicloDias - dias) + 'd ciclo');
    return { elegible: false, doble: false, downgrade: false, faltantes, dias, horas };
  }
}
// ¿La semana cerrada tiene datos de antecedentes? Si no (bug histórico / semana recuperada),
// devuelve false y los ascensos ignoran el requisito de antecedentes.
function antecDisponibleSemanaCerrada() {
  if (semanaAnteriorFull && typeof semanaAnteriorFull.antecOk === 'boolean') return semanaAnteriorFull.antecOk;
  // Si no hay flag, se asume disponible salvo que TODOS los antec estén en 0
  if (semanaAnteriorFull && semanaAnteriorFull.datos) {
    return Object.values(semanaAnteriorFull.datos).some(d => (d.antec || 0) > 0);
  }
  return true;
}

// ==================== CIERRE SEMANAL COMPLETO ====================
async function cerrarSemanaCompletaAuto(client) {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const ahora = new Date();
    const finSemanaTs = Math.floor(ahora.getTime() / 1000);

    // 1. Cerrar todos los fichajes abiertos automaticamente
    for (const uid of Object.keys(fichajesActivos)) {
      const inicio = new Date(fichajesActivos[uid].inicio);
      const msReal = ahora.getTime() - inicio.getTime();
      const multiUsado = fichajesActivos[uid].multiplicador || 1;
      const ms = Math.floor(msReal * multiUsado);
      if (!semanaFichajes[uid]) semanaFichajes[uid] = { totalMs: 0, sesiones: [] };
      semanaFichajes[uid].sesiones.push({ inicio: inicio.toISOString(), fin: ahora.toISOString(), msReal, multiplicador: multiUsado, ms, autoClose: true });
      semanaFichajes[uid].totalMs = (semanaFichajes[uid].totalMs || 0) + ms;
    }
    fichajesActivos = {};

    // 2. Consolidar usuarios con actividad (fichajes OR facturas OR tickets OR antecedentes)
    const usuariosActivos = new Set([
      ...Object.keys(semanaFichajes),
      ...Object.keys(semanaFacturas),
      ...Object.keys(registroTickets),
      ...Object.keys(semanaAntecedentes)
    ]);

    // Necesitamos los miembros para detectar rango
    await guild.members.fetch();

    // 3. Agrupar por rango. Estructura: { categoria-indice: { rango, lineas: [], totalMs, totalMonto, totalPaga } }
    const grupos = {};
    let totalHsMs = 0, totalFacturado = 0, totalPaga = 0;
    const sinRango = [];

    for (const uid of usuariosActivos) {
      const horasMs = (semanaFichajes[uid] || {}).totalMs || 0;
      const fact = semanaFacturas[uid] || { totalMonto: 0, totalCount: 0 };
      const antec = semanaAntecedentes[uid] || 0;
      const tickets = (registroTickets[uid] || {}).total || 0;
      const paga = Math.floor((fact.totalMonto || 0) * 0.5);
      totalHsMs += horasMs;
      totalFacturado += (fact.totalMonto || 0);
      totalPaga += paga;

      const member = guild.members.cache.get(uid);
      const rango = member ? detectarRango(member) : null;

      const linea = '<@' + uid + '> \u2014 \u23F1\uFE0F ' + formatDuracion(horasMs) + ' \u00B7 \uD83D\uDCC4 ' + antec + ' antec. \u00B7 \uD83E\uDDFE ' + fact.totalCount + '/' + formatMonto(fact.totalMonto) + ' \u00B7 \uD83C\uDFAB ' + tickets + ' \u00B7 \uD83D\uDCB0 **' + formatMonto(paga) + '**';

      if (!rango) { sinRango.push({ uid, linea, horasMs }); continue; }
      const key = rango.categoria + '-' + rango.indice;
      if (!grupos[key]) grupos[key] = { rango, lineas: [], totalMs: 0 };
      grupos[key].lineas.push({ linea, horasMs });
      grupos[key].totalMs += horasMs;
    }

    const inicioStr = semanaFichajesInicio.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });
    const finStr = ahora.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });

    // 4. Embeds: uno por categoria. Cada rango es un field. Si un rango se pasa de 1024 chars, se trunca.
    const embedHeader = new EmbedBuilder()
      .setTitle('📊 CIERRE SEMANAL — H-50 / PFA')
      .setDescription('Resumen consolidado · paga al **50%** del total facturado · _formato: ⏱️ horas · 📄 antecedentes · 🧾 facturas/monto · 🎫 tickets · 💰 paga_')
      .setColor(0x1F3A5F)
      .addFields(
        { name: '📅 Período', value: inicioStr + ' \u2192 ' + finStr + ' (cierre <t:' + finSemanaTs + ':F>)', inline: false },
        { name: '⏱️ Horas totales', value: '**' + formatDuracion(totalHsMs) + '**', inline: true },
        { name: '🧾 Facturado total', value: '**' + formatMonto(totalFacturado) + '**', inline: true },
        { name: '💰 Paga total (50%)', value: '**' + formatMonto(totalPaga) + '**', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Cierre Semanal' });

    const embedLow = new EmbedBuilder().setTitle('👮 LOW PFA').setColor(0x2266CC);
    const embedHigh = new EmbedBuilder().setTitle('🎖️ HIGH PFA').setColor(0xAA2266);

    for (let i = RANGOS_LOW.length - 1; i >= 0; i--) {
      const key = 'low-' + i;
      if (!grupos[key]) continue;
      grupos[key].lineas.sort((a, b) => b.horasMs - a.horasMs);
      let valor = grupos[key].lineas.map(l => l.linea).join('\n');
      if (valor.length > 1024) valor = valor.slice(0, 1021) + '...';
      embedLow.addFields({ name: RANGOS_LOW[i].nombre + ' (' + grupos[key].lineas.length + ')', value: valor, inline: false });
    }
    for (let i = RANGOS_HIGH.length - 1; i >= 0; i--) {
      const key = 'high-' + i;
      if (!grupos[key]) continue;
      grupos[key].lineas.sort((a, b) => b.horasMs - a.horasMs);
      let valor = grupos[key].lineas.map(l => l.linea).join('\n');
      if (valor.length > 1024) valor = valor.slice(0, 1021) + '...';
      embedHigh.addFields({ name: RANGOS_HIGH[i].nombre + ' (' + grupos[key].lineas.length + ')', value: valor, inline: false });
    }

    const embeds = [embedHeader];
    if (embedLow.data.fields && embedLow.data.fields.length > 0) embeds.push(embedLow);
    if (embedHigh.data.fields && embedHigh.data.fields.length > 0) embeds.push(embedHigh);
    if (sinRango.length > 0) {
      sinRango.sort((a, b) => b.horasMs - a.horasMs);
      let valor = sinRango.map(s => s.linea).join('\n');
      if (valor.length > 1024) valor = valor.slice(0, 1021) + '...';
      const embedSin = new EmbedBuilder().setTitle('❓ Sin rango detectado').setColor(0x888888).addFields({ name: 'Oficiales (' + sinRango.length + ')', value: valor, inline: false });
      embeds.push(embedSin);
    }

    // 5. Publicar en ascensos
    try {
      const canalAscensos = await guild.channels.fetch(CANAL_ASCENSOS);
      await canalAscensos.send({ embeds });
    } catch (e) { console.error('[CIERRE] Error publicando en ascensos:', e.message); }

    // 5.b RANKING DE KCOINS: publicar al canal de ascensos el resumen semanal de kcoins ganados
    if (kcoinsData.sistemaActivo && Object.keys(kcoinsData.kcoinsSemana).length > 0) {
      try {
        // Filtrar HEAD y Dueños del resumen semanal de kcoins
        const entradas = Object.entries(kcoinsData.kcoinsSemana)
          .filter(([uid]) => {
            const m = guild.members.cache.get(uid);
            if (!m) return true;
            if (m.roles.cache.has(ROL_HEAD_PFA)) return false;
            if (m.roles.cache.has(ROL_DUENOS)) return false;
            return true;
          })
          .sort((a, b) => b[1] - a[1]);
        const medallas = ['🥇', '🥈', '🥉'];
        let lineas = [];
        let totalRepartido = 0;
        for (let i = 0; i < entradas.length; i++) {
          const [uid, monto] = entradas[i];
          const jackpots = kcoinsData.jackpotsSemana[uid] || 0;
          const medalla = medallas[i] || '📍';
          const jTxt = jackpots > 0 ? ' 🎰x' + jackpots : '';
          lineas.push(medalla + ' <@' + uid + '> — **' + monto + ' kc** ($' + monto + ')' + jTxt);
          totalRepartido += monto;
        }
        const kcEmbed = new EmbedBuilder()
          .setTitle('🪙 RESUMEN DE KCOINS · SEMANA')
          .setColor(0xF1C40F)
          .setDescription(lineas.join('\n'))
          .addFields(
            { name: '💰 Total repartido', value: '**' + totalRepartido + ' kc** ($' + totalRepartido + ')', inline: true },
            { name: '📊 Tope semanal', value: kcoinsData.totalSemana + ' / ' + KCOINS_TOPE_SEMANAL_GLOBAL + ' kc', inline: true },
            { name: '👥 PFA que ganaron', value: String(entradas.length), inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'H-50 Bot · Pago se realiza el sábado post-reunión' });
        const cAsc = await client.channels.fetch(CANAL_ASCENSOS);
        await cAsc.send({ embeds: [kcEmbed] });
      } catch (e) { console.error('[CIERRE] Error publicando ranking kcoins:', e.message); }
    }

    // 6. SNAPSHOT: guardar semana cerrada para usar en la reunión del sábado (PFA de la Semana)
    //    y acumular al mes (PFA del Mes)
    semanaAnteriorFichajes = {};
    for (const uid of Object.keys(semanaFichajes)) {
      const totalMs = semanaFichajes[uid].totalMs || 0;
      semanaAnteriorFichajes[uid] = { totalMs, sesiones: semanaFichajes[uid].sesiones ? semanaFichajes[uid].sesiones.slice() : [] };
      mesFichajesAcum[uid] = (mesFichajesAcum[uid] || 0) + totalMs;
    }
    // 6b. SNAPSHOT COMPLETO de la semana cerrada (horas + antec + tickets + facturas) para /semana y /ascensos
    const _uidsFull = new Set([
      ...Object.keys(semanaFichajes),
      ...Object.keys(semanaFacturas),
      ...Object.keys(registroTickets),
      ...Object.keys(semanaAntecedentes)
    ]);
    const _datosFull = {};
    for (const uid of _uidsFull) {
      _datosFull[uid] = {
        horasMs: (semanaFichajes[uid] || {}).totalMs || 0,
        antec: semanaAntecedentes[uid] || 0,
        tickets: (registroTickets[uid] || {}).total || 0,
        monto: (semanaFacturas[uid] || {}).totalMonto || 0,
        facturasCount: (semanaFacturas[uid] || {}).totalCount || 0,
      };
    }
    semanaAnteriorFull = { inicioISO: semanaFichajesInicio.toISOString(), finISO: ahora.toISOString(), antecOk: true, datos: _datosFull };

    // Guardado del cierre ESPACIADO para no gatillar el rate-limit secundario de GitHub.
    // (La ráfaga de ~10 commits de golpe era lo que buggeaba el cierre todas las semanas.)
    const _pausaCierre = (ms) => new Promise(r => setTimeout(r, ms));

    // Primero los SNAPSHOTS. El snapshot completo es CRÍTICO: si no se puede guardar,
    // NO reseteamos, para no perder la semana. Se reintenta en el próximo ciclo.
    let _snapshotOk = true;
    try { await guardarSemanaAnteriorFull(); } catch (e) { _snapshotOk = false; console.error('[CIERRE] CRITICO: no se guardó el snapshot completo:', e.message); }
    await _pausaCierre(2000);
    try { await guardarSemanaAnterior(); } catch (e) { console.error('[CIERRE] guardar semana anterior:', e.message); }
    await _pausaCierre(2000);
    try { await guardarMesAcum(); } catch (e) { console.error('[CIERRE] guardar mes acum:', e.message); }
    await _pausaCierre(2000);

    if (!_snapshotOk) {
      console.error('[CIERRE] ABORTADO: no se aseguró el snapshot de la semana. NO se resetea para no perder datos; se reintenta el próximo ciclo.');
      return { ok: false, error: 'No se pudo guardar el snapshot de la semana; se abortó el reset para no perder datos.' };
    }

    // 7. Reset total (solo con el snapshot ya a salvo)
    semanaFichajes = {};
    semanaFichajesInicio = new Date();
    semanaFacturas = {};
    semanaFacturasInicio = new Date();
    registroTickets = {};
    semanaTicketsInicio = new Date();
    semanaAntecedentes = {};
    kcoinsData.kcoinsSemana = {};
    kcoinsData.totalSemana = 0;
    kcoinsData.jackpotsSemana = {};

    // 8. Persistir el reset, ESPACIADO y tolerante a fallos (cada archivo por separado, sin cortar el cierre)
    const _guardadosReset = [
      ['fichajes', guardarSemanaFichajes],
      ['facturas', guardarSemanaFacturas],
      ['tickets', guardarTickets],
      ['antecedentes', guardarAntecedentes],
      ['kcoins', guardarKcoins],
      ['fichajes activos', guardarFichajesActivos],
    ];
    for (const [_nom, _fn] of _guardadosReset) {
      try { await _fn(); } catch (e) { console.error('[CIERRE] guardar reset ' + _nom + ':', e.message); }
      await _pausaCierre(2000);
    }

    console.log('[CIERRE] Semana cerrada correctamente:', finStr);
    return { ok: true, oficiales: usuariosActivos.size, totalFacturado, totalPaga };
  } catch (e) {
    console.error('[CIERRE] Error cerrando semana completa:', e.message);
    return { ok: false, error: e.message };
  }
}

// Mensaje de cierre de semana en #general (se dispara el sábado 00:01, separado del cierre pesado)
async function enviarMensajeCierreSemanal(client) {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const canal = await guild.channels.fetch(CANAL_GENERAL).catch(() => null);
    if (!canal) { console.error('[MSG SEMANAL] Canal general no encontrado (' + CANAL_GENERAL + ')'); return; }
    const embed = new EmbedBuilder()
      .setColor(0x1F3A5F)
      .setAuthor({ name: 'Policía Federal Argentina · H-50' })
      .setTitle('Cierre de Semana')
      .setDescription('La semana quedó cerrada y todos los registros (horas, tickets y facturado) fueron consolidados.\n\nSe realiza la reunión semanal: se anuncian ascensos, PFA de la Semana y las novedades de la facción. Estén atentos.\n\nGracias a todo el personal por el trabajo de esta semana. Arranca una nueva.')
      .setFooter({ text: 'PFA H-50 · Sistema de Fichaje' })
      .setTimestamp();
    await canal.send({ content: '<@&' + ROL_PFA + '>', embeds: [embed], allowedMentions: { roles: [ROL_PFA] } });
    console.log('[MSG SEMANAL] Mensaje de cierre de semana enviado a #general.');
  } catch (e) { console.error('[MSG SEMANAL] error enviando:', e.message); }
}

// Formatea milisegundos a "Xh Ym"
function formatDuracion(ms) {
  if (!ms || ms < 0) ms = 0;
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return m + 'm';
  if (m === 0) return h + 'h';
  return h + 'h ' + m + 'm';
}

// ==================== LOGS ====================
async function enviarLog(guild, embed) {
  try {
    const canal = await guild.channels.fetch(CANAL_LOGS);
    await canal.send({ embeds: [embed] });
  } catch (e) { console.error('Error enviando log:', e.message); }
}

// ==================== ASIGNACION ====================
async function asignarPersonal(interaction, roboKey, robo, cantidad, ubicacion) {
  const guild = interaction.guild;
  await guild.members.fetch();

  // 1. RECOLECTAR CANDIDATOS — todos los que están en canales de voz de asignación (individuales o patrulla)
  //    Y que tengan fichaje abierto (están activos)
  const candidatos = [];
  const canalesFuente = [...new Set([...CANALES_INDIVIDUALES, ...CANALES_PATRULLA])];
  for (const canalId of canalesFuente) {
    guild.voiceStates.cache
      .filter(vs => vs.channelId === canalId && vs.member && !vs.member.user.bot)
      .forEach(vs => {
        if (fichajesActivos[vs.member.id]) {
          const categoria = detectarCategoriaAsignacion(vs.member);
          if (categoria) candidatos.push({ member: vs.member, categoria, peso: PESOS_RANGO[categoria] });
        }
      });
  }

  if (candidatos.length === 0) {
    await interaction.editReply({ content: '❌ No hay personal disponible con fichaje abierto en canales de asignación.' });
    return;
  }

  // 2. CONTAR PFA YA ASIGNADOS a otros robos (para reserva "cada 3 = 1 robo")
  //    Y contar cuántos ya hay en el canal de ESTE robo (para no pasarse del máximo)
  let yaEnOtrosRobos = 0;
  const canalesDeRobos = Object.values(ROBOS).map(r => r.canal);
  for (const cid of canalesDeRobos) {
    if (cid === robo.canal) continue;
    yaEnOtrosRobos += guild.voiceStates.cache.filter(vs => vs.channelId === cid && vs.member && !vs.member.user.bot).size;
  }
  const yaEnEsteRobo = guild.voiceStates.cache.filter(vs => vs.channelId === robo.canal && vs.member && !vs.member.user.bot).size;

  // 3. CALCULAR CANTIDAD ÓPTIMA si no se pasó cantidad manual
  const categoriaRobo = CATEGORIA_ROBO[roboKey] || 'medio';
  let cantidadFinal = cantidad;

  if (!cantidad || cantidad <= 0) {
    // Modo automático — el "cerebro mágico" decide
    const disponibles = candidatos.length;
    const puntoMedio = Math.round((robo.min + robo.max) / 2);

    // Regla del server: cada 3 PFA activos = 1 robo posible.
    // Estimamos cuántos robos podrían aparecer y dejamos reserva.
    const totalActivos = disponibles + yaEnOtrosRobos + yaEnEsteRobo;
    const robosPosibles = Math.max(1, Math.floor(totalActivos / 3));
    const robosActivos = Object.values(ROBOS).filter(r => {
      return guild.voiceStates.cache.filter(vs => vs.channelId === r.canal && vs.member && !vs.member.user.bot).size > 0;
    }).length;
    const robosPotencialesFaltantes = Math.max(0, robosPosibles - robosActivos - 1); // -1 porque este robo YA cuenta
    const reservaRecomendada = robosPotencialesFaltantes * robo.min; // reservar al menos min por robo potencial

    // Cantidad ideal: punto medio del robo, pero recortada por disponibilidad y reserva
    let ideal = puntoMedio;
    ideal = Math.min(ideal, disponibles);
    ideal = Math.min(ideal, robo.max - yaEnEsteRobo);
    ideal = Math.min(ideal, disponibles - reservaRecomendada);
    ideal = Math.max(ideal, Math.min(disponibles, robo.min)); // al menos min si hay suficientes

    // Si no llega al mínimo, mandar los que hay igual (regla del user)
    if (ideal < 1) ideal = Math.min(disponibles, robo.max - yaEnEsteRobo);
    cantidadFinal = ideal;
    console.log('[ASIGNAR AUTO] Robo:', roboKey, 'Cat:', categoriaRobo, 'Disp:', disponibles, 'Ya asignados otros:', yaEnOtrosRobos, 'Robos activos:', robosActivos, 'Robos posibles:', robosPosibles, 'Reserva:', reservaRecomendada, 'Final:', cantidadFinal);
  } else {
    // Modo manual — respetar cantidad pero ajustar al máximo del canal
    if (yaEnEsteRobo + cantidadFinal > robo.max) {
      const puedoMandar = robo.max - yaEnEsteRobo;
      if (puedoMandar <= 0) {
        await interaction.editReply({ content: '❌ El canal de **' + robo.nombre + '** ya tiene el máximo de ' + robo.max + ' policías.' });
        return;
      }
      cantidadFinal = puedoMandar;
    }
    cantidadFinal = Math.min(cantidadFinal, candidatos.length);
  }

  if (cantidadFinal === 0) {
    await interaction.editReply({ content: '❌ No hay personal para asignar.' });
    return;
  }

  // 4. SELECCIÓN INTELIGENTE — balanceo por categoría del robo + rotación justa
  //    Prioridad de categorías según robo:
  //    - grande: geof + halcon prioritarios; luego high, low
  //    - medio: high + low prioritarios; halcon como refuerzo si sobra; geof solo si no hay otro
  //    - chico: low + high prioritarios; halcon/geof solo como último recurso
  const grupoPor = { geof: [], halcon: [], head: [], high: [], low: [] };
  for (const c of candidatos) grupoPor[c.categoria].push(c);

  // Ordenar cada grupo por rotación justa: los con menos asignaciones del día primero
  for (const g of Object.keys(grupoPor)) {
    grupoPor[g].sort((a, b) => (asignacionesHoy[a.member.id] || 0) - (asignacionesHoy[b.member.id] || 0));
  }

  // Orden de consumo según categoría del robo (de más prioritario a menos)
  let ordenConsumo;
  if (categoriaRobo === 'grande') {
    ordenConsumo = ['geof', 'halcon', 'high', 'low', 'head'];
  } else if (categoriaRobo === 'medio') {
    // Distribución proporcional: high/low primero, halcon como refuerzo, geof último
    ordenConsumo = ['high', 'low', 'halcon', 'geof', 'head'];
  } else {
    // chico: low primero (los pibes primero), después high, después halcon/geof solo si no hay
    ordenConsumo = ['low', 'high', 'halcon', 'geof', 'head'];
  }

  const seleccionados = [];

  // Fase 1: si el robo es GRANDE, garantizar al menos 1 GEOF y 1 Halcón (si hay disponibles y espacio)
  if (categoriaRobo === 'grande') {
    if (grupoPor.geof.length > 0 && seleccionados.length < cantidadFinal) {
      seleccionados.push(grupoPor.geof.shift());
    }
    if (grupoPor.halcon.length > 0 && seleccionados.length < cantidadFinal) {
      seleccionados.push(grupoPor.halcon.shift());
    }
  }

  const restantes = cantidadFinal - seleccionados.length;
  if (restantes > 0) {
    if (categoriaRobo === 'chico') {
      // ROBOS CHICOS (tiendas): JERARQUÍA ESTRICTA. Se agotan TODOS los LOW disponibles primero;
      // recién cuando no queda ningún LOW se usa un HIGH (y después halcón/geof/head).
      // No se "gasta" un HIGH en una tienda si hay un LOW libre.
      for (const g of ordenConsumo) {
        while (grupoPor[g].length > 0 && seleccionados.length < cantidadFinal) {
          seleccionados.push(grupoPor[g].shift());
        }
      }
    } else {
      // ROBOS MEDIO/GRANDE: composición proporcional (escuadra mixta de rangos).
      const totalCandidatos = candidatos.length - seleccionados.length;
      const cuotas = {};
      for (const g of ordenConsumo) {
        if (grupoPor[g].length === 0) { cuotas[g] = 0; continue; }
        cuotas[g] = Math.round((grupoPor[g].length / totalCandidatos) * restantes);
      }
      // Rellenar según cuotas
      for (const g of ordenConsumo) {
        while (cuotas[g] > 0 && grupoPor[g].length > 0 && seleccionados.length < cantidadFinal) {
          seleccionados.push(grupoPor[g].shift());
          cuotas[g]--;
        }
      }
      // Si aún faltan, completar según orden de prioridad del robo
      for (const g of ordenConsumo) {
        while (grupoPor[g].length > 0 && seleccionados.length < cantidadFinal) {
          seleccionados.push(grupoPor[g].shift());
        }
      }
    }
  }

  // 5. MOVER a los seleccionados al canal del robo + registrar origen
  if (!origenPersonal[robo.canal]) origenPersonal[robo.canal] = {};
  for (const s of seleccionados) origenPersonal[robo.canal][s.member.id] = s.member.voice?.channelId;

  const movidos = [], errores = [];
  for (const s of seleccionados) {
    try {
      await s.member.voice.setChannel(robo.canal);
      movidos.push(s);
      asignacionesHoy[s.member.id] = (asignacionesHoy[s.member.id] || 0) + 1;
    } catch (e) { errores.push(s.member.displayName); }
  }

  // 6. STATUS DEL CANAL
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(`/channels/${robo.canal}/voice-status`, { body: { status: ubicacion } });
  } catch (e) { console.error('Error setStatus:', e.message); }

  // 7. HOOK PARA SCRIPT IC FIVEM (COMENTADO — activar cuando Wezzo tenga el endpoint)
  // for (const s of movidos) {
  //   try {
  //     await fetch(process.env.FIVEM_ENDPOINT_URL + '/h50-asignacion', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.FIVEM_TOKEN },
  //       body: JSON.stringify({ discordId: s.member.id, robo: robo.nombre, ubicacion })
  //     });
  //   } catch (e) { console.error('Error notificacion FiveM:', e.message); }
  // }

  // 8. EMBED DE LOG con desglose de rangos asignados
  const desgloseRangos = {};
  for (const s of seleccionados) desgloseRangos[s.categoria] = (desgloseRangos[s.categoria] || 0) + 1;
  const desgloseTxt = ['geof', 'halcon', 'head', 'high', 'low']
    .filter(g => desgloseRangos[g] > 0)
    .map(g => {
      const nombres = { geof: 'GEOF', halcon: 'Halcón', head: 'HEAD', high: 'HIGH', low: 'LOW' };
      return '**' + nombres[g] + ':** ' + desgloseRangos[g];
    })
    .join(' · ') || '_(sin desglose)_';

  const modoTxt = (cantidad && cantidad > 0) ? 'Manual (pediste ' + cantidad + ')' : 'Automático (cerebro)';
  const info = INFO_ROBOS[roboKey];
  const embed = new EmbedBuilder()
    .setTitle('🚨 ASIGNACIÓN — ' + robo.nombre.toUpperCase())
    .setDescription('📍 **' + ubicacion + '**')
    .addFields(
      { name: '👮 Agentes asignados', value: movidos.map(m => '<@' + m.member.id + '>').join('\n') || 'Ninguno', inline: false },
      { name: '📊 Total', value: movidos.length + ' asignados', inline: true },
      { name: '🎖️ Desglose por rango', value: desgloseTxt, inline: true },
      { name: '⚙️ Modo', value: modoTxt, inline: true },
      { name: '🎯 Canal', value: '<#' + robo.canal + '>', inline: true },
      { name: '📈 Categoría del robo', value: categoriaRobo.toUpperCase(), inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: '🔫 Armamento', value: info.armamento, inline: false },
      { name: '💨 Humos', value: String(info.humos), inline: true },
      { name: '🥫 Latas', value: String(info.latas), inline: true },
      { name: '🔥 Molotovs', value: String(info.molotovs), inline: true },
      { name: '🧑 Rehenes', value: info.rehenes > 0 ? info.rehenes + ' máx.' : 'No permitidos', inline: true },
      { name: '👮 Ejecutado por', value: '<@' + interaction.user.id + '>', inline: true },
    )
    .setColor(0xCC2222).setTimestamp().setFooter({ text: 'H50 Bot • Sistema de Asignación Inteligente' });

  if (errores.length > 0) embed.addFields({ name: '⚠️ No se pudieron mover', value: errores.join(', '), inline: false });
  await enviarLog(guild, embed);
  await interaction.editReply({ content: '✅ Asignación realizada. ' + movidos.length + ' agentes movidos. Ver <#' + CANAL_LOGS + '> para el detalle.' });
}

// ==================== TICKETS V2 — COMANDOS DE TEXTO DENTRO DEL TICKET ====================
// Comandos con prefijo "/" leídos por el bot (NO son slash registrados, no aparecen en el menú).
// Solo funcionan dentro de un canal de ticket y solo para los rangos autorizados de ese nivel.
const TKV2_COMANDOS = ['rename', 'renombrar', 'add', 'agregar', 'remove', 'quitar', 'addrole', 'claim', 'reclamar', 'escalar', 'close', 'cerrar', 'ayuda', 'comandos'];
client.on('messageCreate', async (message) => {
  if (!botListo) return;
  if (message.author.bot || !message.guild) return;
  const t = ticketsV2[message.channelId];
  if (!t || t.estado === 'cerrado') return; // solo dentro de tickets activos
  const content = (message.content || '').trim();
  if (!content.startsWith('/')) return;
  const partes = content.slice(1).split(/\s+/);
  const cmd = (partes.shift() || '').toLowerCase();
  if (!TKV2_COMANDOS.includes(cmd)) return; // no es un comando del ticket, se ignora
  const rest = partes;
  const reply = (color, desc) => message.channel.send({ embeds: [new EmbedBuilder().setColor(color).setDescription(desc).setFooter({ text: 'PFA H-50 · Sistema de Tickets' })] }).catch(() => {});

  // /ayuda no requiere permisos
  if (cmd === 'ayuda' || cmd === 'comandos') {
    return reply(0x1F3A5F, '__Comandos del ticket__\n`/rename <nombre>` — renombrar el canal\n`/add @usuario` — agregar a alguien al ticket\n`/remove @usuario` — quitar a alguien del ticket\n`/addrole @rol` — agregar un rol al ticket\n`/claim` — tomar el ticket (queda a tu cargo)\n`/escalar` — subir un nivel de privacidad\n`/close` — cerrar el ticket y generar el registro');
  }

  if (!tkv2PuedeGestionar(message.member, t)) return reply(0xC0392B, 'No tenés permisos para usar los comandos de este ticket.');

  try {
    if (cmd === 'rename' || cmd === 'renombrar') {
      const nombre = rest.join(' ').trim();
      if (!nombre) return reply(0xC0392B, 'Uso: `/rename <nombre>`');
      await message.channel.setName(nombre.slice(0, 90));
      return reply(0x22AA44, 'Canal renombrado a **' + nombre.slice(0, 90) + '**.');
    }
    if (cmd === 'add' || cmd === 'agregar') {
      const u = message.mentions.users.first() || (rest[0] ? await client.users.fetch(rest[0].replace(/[<@!>]/g, '')).catch(() => null) : null);
      if (!u) return reply(0xC0392B, 'Uso: `/add @usuario`');
      await message.channel.permissionOverwrites.edit(u.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true });
      return reply(0x22AA44, 'Se agregó a <@' + u.id + '> al ticket.');
    }
    if (cmd === 'remove' || cmd === 'quitar') {
      const u = message.mentions.users.first() || (rest[0] ? await client.users.fetch(rest[0].replace(/[<@!>]/g, '')).catch(() => null) : null);
      if (!u) return reply(0xC0392B, 'Uso: `/remove @usuario`');
      if (u.id === t.autorId) return reply(0xC0392B, 'No se puede quitar a quien abrió el ticket.');
      await message.channel.permissionOverwrites.delete(u.id).catch(() => message.channel.permissionOverwrites.edit(u.id, { ViewChannel: false }));
      return reply(0x22AA44, 'Se quitó a <@' + u.id + '> del ticket.');
    }
    if (cmd === 'addrole') {
      const r = message.mentions.roles.first() || (rest[0] ? await message.guild.roles.fetch(rest[0].replace(/[<@&>]/g, '')).catch(() => null) : null);
      if (!r) return reply(0xC0392B, 'Uso: `/addrole @rol`');
      await message.channel.permissionOverwrites.edit(r.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
      return reply(0x22AA44, 'Se agregó el rol <@&' + r.id + '> al ticket. Tené en cuenta que ese rol ahora ve todo el contenido de este ticket.');
    }
    if (cmd === 'claim' || cmd === 'reclamar') {
      if (t.estado === 'reclamado') return reply(0xC0392B, 'Este ticket ya fue tomado por <@' + t.reclamadoPor + '>.');
      t.estado = 'reclamado'; t.reclamadoPor = message.author.id; t.reclamadoMs = Date.now();
      const uid = message.author.id;
      if (!registroTickets[uid]) registroTickets[uid] = { total: 0 };
      registroTickets[uid][t.tipo] = (registroTickets[uid][t.tipo] || 0) + 1;
      registroTickets[uid].total = (registroTickets[uid].total || 0) + 1;
      try { await guardarTickets(); } catch (e) {}
      try { await guardarTicketsV2(); } catch (e) {}
      return reply(0x22AA44, 'Ticket a cargo de <@' + message.author.id + '>.');
    }
    if (cmd === 'escalar') {
      const r = await tkv2Escalar(message.channel, t);
      if (!r.ok) return reply(0xC0392B, r.msg);
      return reply(0xE67E22, 'Ticket escalado a: **' + r.tier.nombre + '**. El canal se movió y solo ese personal puede verlo ahora.');
    }
    if (cmd === 'close' || cmd === 'cerrar') {
      await reply(0x7A1F1F, 'Cerrando el ticket y generando el registro...');
      await tkv2CerrarTicket(message.channel, t, message.author.id);
      return;
    }
  } catch (e) {
    console.error('[TKV2] comando ' + cmd + ':', e.message);
    return reply(0xC0392B, 'No se pudo ejecutar el comando: ' + e.message);
  }
});

// ==================== READY ====================
client.once('ready', async () => {
  console.log('H50 Bot conectado: ' + client.user.tag);
  await cargarTickets();
  await cargarTicketsActivos();
  await cargarTicketsV2();
  await cargarFichajesActivos();
  await cargarSemanaFichajes();
  await cargarSemanaFacturas();
  await cargarAntecedentes();
  await cargarAscensosHistorial();
  await cargarSemanaAnterior();
  await cargarSemanaAnteriorFull();
  await cargarMesAcum();
  await cargarAdvertenciasFichaje();
  await cargarKcoins();
  await cargarIngresos();
  await cargarReportesBugs();
  await cargarBlacklists();
  await cargarSanciones();
  await cargarAusencias();
  await cargarApelaciones();
  await cargarEstelares();
  await cargarBreaks();
  await cargarEncuestas();
  await cargarSorteos();
  restaurarTimersEncuestasSorteos();
  await cargarPostulacionesStats();
  botListo = true;
  console.log('[BOT] ✅ Todos los datos cargados. Bot listo para recibir eventos.');

  // Reprogramar el timer de vencimiento de estelares (si estaban activas al reiniciar)
  // Si ya vencieron, esta función las apaga automáticamente
  programarVencimientoEstelares(client);
  // Estado rotativo del bot (presencia) - 7 frases 'Viendo X' cada 3 minutos
  const estadosBot = [
    'Kilombo RP',
    'operativos PFA',
    'el patrullaje',
    'la coordinaci\u00f3n H-50',
    'los tickets',
    'la operaci\u00f3n 24/7',
    'la facci\u00f3n PFA'
  ];
  let ultimoEstado = -1;
  const aplicarEstado = () => {
    try {
      let i;
      do { i = Math.floor(Math.random() * estadosBot.length); } while (i === ultimoEstado && estadosBot.length > 1);
      ultimoEstado = i;
      client.user.setPresence({ activities: [{ name: estadosBot[i], type: ActivityType.Watching }], status: 'online' });
    } catch (e) { console.error('[ESTADO] Error:', e.message); }
  };
  aplicarEstado();
  setInterval(aplicarEstado, 180000);

  // Chequeo de blacklists expirados (cada 10 minutos)
  const chequearBlacklistsExpiradas = async () => {
    try {
      const guild = client.guilds.cache.first();
      if (!guild) return;
      const ahoraMs = Date.now();
      const paraLiberar = [];
      for (const [uid, data] of Object.entries(blacklistsActivas)) {
        if (!data.expira) continue; // permanente, no expira
        if (data.expira > ahoraMs) continue; // no expiró todavía
        if (data.notificado) continue; // ya se procesó
        paraLiberar.push(uid);
      }
      for (const uid of paraLiberar) {
        try {
          const member = await guild.members.fetch(uid);
          // Sacar rol BL y restrictivos, dejar como civil
          const rolesSacar = [ROL_BLACKLIST];
          for (const r of rolesSacar) {
            if (member.roles.cache.has(r)) await member.roles.remove(r, 'BL expirado automáticamente');
          }
          if (!member.roles.cache.has(ROL_CIVIL)) {
            await member.roles.add(ROL_CIVIL, 'BL expirado: vuelve a civil');
          }
          // DM al usuario
          try {
            await member.send({ content: '✅ **Tu Blacklist expiró**\n\nEl Blacklist que se te había aplicado en la PFA cumplió su tiempo y fue **removido automáticamente**.\n**Motivo original:** _' + blacklistsActivas[uid].motivo + '_\n**Duración:** ' + blacklistsActivas[uid].dias + ' días\n\nAhora podés volver a postularte a la PFA si lo deseas.\n\n_— PFA Kilombo RP_' });
          } catch (e) { /* DM cerrado */ }
          // Log en canal
          try {
            const cLog = await guild.channels.fetch(CANAL_LOG_BL);
            const embedFin = new EmbedBuilder()
              .setTitle('✅ BLACKLIST EXPIRADO')
              .setColor(0x22AA44)
              .setThumbnail(member.displayAvatarURL())
              .addFields(
                { name: '👮 Usuario', value: '<@' + uid + '>', inline: true },
                { name: '📅 Aplicado el', value: '<t:' + Math.floor(blacklistsActivas[uid].ts / 1000) + ':D>', inline: true },
                { name: '⏱️ Duración', value: blacklistsActivas[uid].dias + ' días', inline: true },
                { name: '📝 Motivo original', value: blacklistsActivas[uid].motivo, inline: false },
                { name: 'Estado', value: '_El usuario volvió a ser civil y recibió DM de aviso._', inline: false }
              )
              .setTimestamp()
              .setFooter({ text: 'H-50 Bot · Expiración automática' });
            await cLog.send({ embeds: [embedFin] });
          } catch (e) { console.error('Log BL expirado:', e.message); }
          // Marcar como procesado y limpiar
          delete blacklistsActivas[uid];
        } catch (e) { console.error('Error liberando BL de ' + uid + ':', e.message); }
      }
      if (paraLiberar.length > 0) {
        try { await guardarBlacklists(); } catch (e) { console.error('Guardar BL post-expiracion:', e.message); }
        console.log('[BL] ' + paraLiberar.length + ' blacklists expirados y procesados');
      }
    } catch (e) { console.error('[BL] Error chequeando BLs:', e.message); }
  };
  // Chequear al arrancar y luego cada 10 minutos
  setTimeout(chequearBlacklistsExpiradas, 30000); // esperar 30s tras arranque
  setInterval(chequearBlacklistsExpiradas, 600000); // cada 10 min

  // Tickets V2: chequeo de tickets sin reclamar
  setTimeout(() => { tkv2ChequearSinReclamar(client); }, 60000); // primer chequeo 1 min tras arranque
  setInterval(() => { tkv2ChequearSinReclamar(client); }, TKV2_ALERTA_INTERVALO_MS);

  // Cierre automático de la semana de tickets: viernes 23:59 hora Argentina
  let ultimoCierreAutoTickets = null;
  let ultimoCierreDiario = null;
  let ultimoMensajeSemanal = null;
  setInterval(() => {
    try {
      const ahora = new Date();
      const partes = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false }).formatToParts(ahora);
      const get = (tipo) => { const p = partes.find(x => x.type === tipo); return p ? p.value : ''; };
      const hora = parseInt(get('hour'), 10);
      const minuto = parseInt(get('minute'), 10);
      const dia = get('weekday').toLowerCase();
      const esViernes = dia.startsWith('vie');
      const claveDia = get('year') + '-' + get('month') + '-' + get('day');
      // Cierre DIARIO automático: TODOS los días a las 23:59 ARG
      // Los viernes, primero se hace el cierre diario y después el semanal.
      if (hora === 23 && minuto === 59 && ultimoCierreDiario !== claveDia) {
        ultimoCierreDiario = claveDia;
        cierreDiario(client).then(() => {
          // Cierre semanal solo los viernes, después del diario
          if (esViernes && ultimoCierreAutoTickets !== claveDia) {
            ultimoCierreAutoTickets = claveDia;
            cerrarSemanaCompletaAuto(client);
          }
        }).catch(e => console.error('Error cierre diario:', e.message));
      }

      // Mensaje de cierre de semana en #general: SÁBADO 00:01 ARG.
      // Va separado del cierre pesado de las 23:59 para no sumarle carga (era lo que lo hacía fallar).
      if (hora === 0 && minuto === 1 && dia.startsWith('sá') && ultimoMensajeSemanal !== claveDia) {
        ultimoMensajeSemanal = claveDia;
        enviarMensajeCierreSemanal(client).catch(e => console.error('[MSG SEMANAL] error:', e.message));
      }

      // Fallback: chequeo cada minuto por si el setTimeout dedicado falla
      // (no debería pasar, pero defensa en profundidad)
      if (horasEstelares.activas && horasEstelares.finMs && Date.now() >= horasEstelares.finMs) {
        console.log('[ESTELARES] ⚠️ Cron detectó vencimiento (fallback) - setTimeout debería haber actuado antes');
        client.guilds.fetch(GUILD_ID).then(g => {
          desactivarEstelares(client, g, 'Vencimiento automático (detectado por cron de respaldo)');
        }).catch(e => console.error('Error apagando estelares por timeout:', e.message));
      }

      // Auto-cierre de breaks que superaron los 15 minutos
      for (const uidBr of Object.keys(breaksActivos)) {
        const transcurridoMs = Date.now() - breaksActivos[uidBr].inicioBreakMs;
        if (transcurridoMs >= 15 * 60000) {
          // Cerrar el fichaje del oficial (si todavía está abierto)
          (async () => {
            try {
              const guildBr = await client.guilds.fetch(GUILD_ID);
              if (fichajesActivos[uidBr]) {
                const fichInicio = new Date(fichajesActivos[uidBr].inicio);
                const finBr = new Date();
                const msReal = finBr.getTime() - fichInicio.getTime();
                const multiUsado = fichajesActivos[uidBr].multiplicador || 1;
                const ms = Math.floor(msReal * multiUsado);
                if (!semanaFichajes[uidBr]) semanaFichajes[uidBr] = { totalMs: 0, sesiones: [] };
                semanaFichajes[uidBr].sesiones.push({ inicio: fichInicio.toISOString(), fin: finBr.toISOString(), msReal, multiplicador: multiUsado, ms, autoCloseBreak: true });
                semanaFichajes[uidBr].totalMs = (semanaFichajes[uidBr].totalMs || 0) + ms;
                delete fichajesActivos[uidBr];
                await guardarFichajesActivos();
                await guardarSemanaFichajes();

                // Log al canal de fichajes
                try {
                  const c = await guildBr.channels.fetch(CANAL_LOGS_FICHAJE);
                  const embedAuto = new EmbedBuilder()
                    .setTitle('🚨 FICHAJE CERRADO POR BREAK VENCIDO')
                    .setDescription('<@' + uidBr + '> no finalizó su break en 15 minutos. Su fichaje fue cerrado automáticamente.')
                    .addFields(
                      { name: '⏱️ Duración del turno', value: formatDuracion(ms), inline: true },
                      { name: '📊 Total semanal', value: formatDuracion(semanaFichajes[uidBr].totalMs), inline: true }
                    )
                    .setColor(0xFFAA00).setTimestamp().setFooter({ text: 'H-50 Bot · Auto-cierre por break' });
                  await c.send({ embeds: [embedAuto] });
                } catch (e) { console.error('Log auto-cierre break:', e.message); }

                // DM al oficial
                try {
                  const memberDm = await guildBr.members.fetch(uidBr);
                  await memberDm.send({ content: '⏰ **Tu break venció**\nNo finalizaste tu break en 15 minutos, así que **te cerramos el fichaje** automáticamente.\nContabilizó **' + formatDuracion(ms) + '** este turno.\nSi querés seguir, hacé `/pfa on` de nuevo.' });
                } catch (e) { /* DM cerrado */ }
              }
              delete breaksActivos[uidBr];
              await guardarBreaks();
            } catch (e) { console.error('Auto-cierre break loop:', e.message); }
          })();
        }
      }
    } catch (e) {
      console.error('[AUTO] Error en chequeo de cierre semanal:', e.message);
    }
  }, 60000);

  const robosChoices = Object.entries(ROBOS).map(([key, robo]) => ({ name: robo.nombre, value: key }));
  robosChoices.push({ name: 'Secuestro', value: 'secuestro_canal' });

  const commands = Object.entries(ROBOS).map(([key, robo]) => {
    const cmd = new SlashCommandBuilder().setName(key).setDescription('Asignar personal: ' + robo.nombre + ' (sin cantidad = automático)');
    // Los required van PRIMERO — Discord no permite optional antes que required
    if (TIENDAS.includes(key)) cmd.addStringOption(o => o.setName('ubicacion').setDescription('Nombre del lugar').setRequired(true));
    cmd.addIntegerOption(o => o.setName('cantidad').setDescription('Opcional — sin cantidad el bot decide automáticamente').setRequired(false).setMinValue(1).setMaxValue(20));
    return cmd.toJSON();
  });

  commands.push(new SlashCommandBuilder().setName('secuestro').setDescription('🚨 ALERTA ROJA — Todo el personal al Secuestro').toJSON());

  // /encuesta — HEAD/Dueños crean encuestas con voto único y resultados en vivo
  commands.push(new SlashCommandBuilder()
    .setName('encuesta')
    .setDescription('[HEAD/Dueños] Crear una encuesta con voto único')
    .addStringOption(o => o.setName('pregunta').setDescription('¿Qué se pregunta?').setRequired(true).setMaxLength(300))
    .addStringOption(o => o.setName('duracion').setDescription('¿Cuánto dura la encuesta?').setRequired(true)
      .addChoices(
        { name: '1 hora', value: '1h' },
        { name: '6 horas', value: '6h' },
        { name: '24 horas', value: '24h' },
        { name: '3 días', value: '3d' },
        { name: '7 días', value: '7d' }
      ))
    .addStringOption(o => o.setName('opcion1').setDescription('Primera opción de respuesta').setRequired(true).setMaxLength(80))
    .addStringOption(o => o.setName('opcion2').setDescription('Segunda opción de respuesta').setRequired(true).setMaxLength(80))
    .addStringOption(o => o.setName('opcion3').setDescription('Tercera opción (opcional)').setRequired(false).setMaxLength(80))
    .addStringOption(o => o.setName('opcion4').setDescription('Cuarta opción (opcional)').setRequired(false).setMaxLength(80))
    .addStringOption(o => o.setName('opcion5').setDescription('Quinta opción (opcional)').setRequired(false).setMaxLength(80))
    .toJSON());

  // /votantes — HEAD/Dueños ven quién votó cada opción de una encuesta (para taggear)
  commands.push(new SlashCommandBuilder()
    .setName('votantes')
    .setDescription('[HEAD/Dueños] Ver quién votó cada opción de una encuesta activa')
    .addStringOption(o => o.setName('mensaje').setDescription('ID o link del mensaje de la encuesta').setRequired(true))
    .toJSON());

  // /sorteo — HEAD/Dueños crean sorteos con requisitos opcionales
  commands.push(new SlashCommandBuilder()
    .setName('sorteo')
    .setDescription('[HEAD/Dueños] Crear un sorteo con participación por botón')
    .addStringOption(o => o.setName('premio').setDescription('¿Qué se sortea?').setRequired(true).setMaxLength(150))
    .addStringOption(o => o.setName('duracion').setDescription('¿Cuánto dura el sorteo?').setRequired(true)
      .addChoices(
        { name: '1 hora', value: '1h' },
        { name: '6 horas', value: '6h' },
        { name: '24 horas', value: '24h' },
        { name: '3 días', value: '3d' },
        { name: '7 días', value: '7d' }
      ))
    .addIntegerOption(o => o.setName('ganadores').setDescription('Cantidad de ganadores').setRequired(true).setMinValue(1).setMaxValue(20))
    .addStringOption(o => o.setName('descripcion').setDescription('Descripción del sorteo (opcional)').setRequired(false).setMaxLength(500))
    .addIntegerOption(o => o.setName('min_horas').setDescription('Horas mínimas semanales para participar (opcional, 0 = sin requisito)').setRequired(false).setMinValue(0).setMaxValue(100))
    .toJSON());
  commands.push(new SlashCommandBuilder().setName('patrullar').setDescription('Divide el personal de Esperando en canales de patrulla (mín. 2 por canal)').toJSON());
  commands.push(new SlashCommandBuilder().setName('liberar').setDescription('Mueve a todos del canal del robo a Esperando Asignación')
    .addStringOption(o => o.setName('robo').setDescription('El robo a liberar').setRequired(true).addChoices(...robosChoices.slice(0, 25))).toJSON());
  commands.push(new SlashCommandBuilder().setName('cancelar').setDescription('Devuelve a cada persona al canal donde estaba antes')
    .addStringOption(o => o.setName('robo').setDescription('El robo a cancelar').setRequired(true).addChoices(...robosChoices.slice(0, 25))).toJSON());
  commands.push(new SlashCommandBuilder().setName('estadisticas-tickets').setDescription('[HEAD] Ver estadísticas de tickets de todos').toJSON());
  commands.push(new SlashCommandBuilder()
    .setName('procesando')
    .setDescription('Registrar antecedentes (solo PFA, solo en #antecedentes)')
    .addStringOption(o => o.setName('ciudadano').setDescription('Nombre del ciudadano').setRequired(true))
    .addUserOption(o => o.setName('oficial').setDescription('Oficial actuante').setRequired(true))
    .addIntegerOption(o => o.setName('meses').setDescription('Meses de condena').setRequired(true).setMinValue(0).setMaxValue(999))
    .addAttachmentOption(o => o.setName('foto').setDescription('Foto del procesado').setRequired(true))
    .toJSON());
  commands.push(new SlashCommandBuilder().setName('cerrar-tickets').setDescription('[HEAD] Cierra la semana de tickets y resetea el contador').toJSON());
  commands.push(new SlashCommandBuilder().setName('panel-tickets').setDescription('[HEAD/Dueños] Publica el panel del Centro de Tickets en el canal configurado').toJSON());

  // /anuncio — HEAD/Dueños publican un mensaje con formato embed
  commands.push(new SlashCommandBuilder()
    .setName('anuncio')
    .setDescription('[HEAD/Dueños] Publicar un anuncio con formato embed')
    .addStringOption(o => o.setName('titulo').setDescription('Título del anuncio').setRequired(true).setMaxLength(256))
    .addStringOption(o => o.setName('mensaje').setDescription('Texto (usá \\n para saltos de línea)').setRequired(true).setMaxLength(3800))
    .addChannelOption(o => o.setName('canal').setDescription('Canal donde publicar (por defecto: este canal)').setRequired(false))
    .addStringOption(o => o.setName('color').setDescription('Color de la barra').setRequired(false)
      .addChoices(
        { name: 'Azul (institucional)', value: 'azul' },
        { name: 'Rojo', value: 'rojo' },
        { name: 'Verde', value: 'verde' },
        { name: 'Dorado', value: 'dorado' },
        { name: 'Gris', value: 'gris' },
        { name: 'Violeta', value: 'violeta' }
      ))
    .addRoleOption(o => o.setName('tagear').setDescription('Rol a etiquetar (opcional)').setRequired(false))
    .addAttachmentOption(o => o.setName('imagen').setDescription('Imagen para adjuntar (opcional)').setRequired(false))
    .toJSON());

  // /break panel — sistema de pausa de fichaje
  commands.push(new SlashCommandBuilder()
    .setName('break')
    .setDescription('Sistema de break / pausa de fichaje')
    .addSubcommand(s => s.setName('panel').setDescription('[HEAD] Publicar el panel de break en el canal correspondiente'))
    .toJSON());

  // /jerarquia — muestra la jerarquia completa del PFA
  commands.push(new SlashCommandBuilder()
    .setName('jerarquia')
    .setDescription('Muestra la jerarquía oficial del PFA Kilombo RP')
    .toJSON());

  // /guia — publicar guía (elegí LOW o SUPERIORES)
  commands.push(new SlashCommandBuilder()
    .setName('guia')
    .setDescription('[HEAD] Publicar la guía de comandos (elegí para LOW o para Superiores HIGH/HEAD)')
    .addStringOption(o => o.setName('tipo').setDescription('Qué guía publicar').setRequired(true)
      .addChoices(
        { name: 'Solo LOW PFA', value: 'low' },
        { name: 'Superiores (HIGH y HEAD)', value: 'staff' }
      ))
    .toJSON());

  // /postulaciones-publicar — HEAD publica el mensaje con botón en canal de postulaciones
  commands.push(new SlashCommandBuilder()
    .setName('postulaciones-publicar')
    .setDescription('[HEAD] Publicar el mensaje de postulación con botón en el canal de postulaciones')
    .toJSON());

  // /postulaciones-stats — HEAD ve estadísticas de postulaciones por staff
  commands.push(new SlashCommandBuilder()
    .setName('postulaciones-stats')
    .setDescription('[HEAD] Ver estadísticas de postulaciones aprobadas/rechazadas por staff')
    .toJSON());

  // /ingresos — registrar nuevo PFA tras examen instructor
  commands.push(new SlashCommandBuilder()
    .setName('ingresos')
    .setDescription('[HEAD/Instructor] Registrar el ingreso de un nuevo PFA')
    .addStringOption(o => o.setName('nombre_ic').setDescription('Nombre IC del nuevo oficial').setRequired(true))
    .addUserOption(o => o.setName('usuario').setDescription('Discord del nuevo oficial').setRequired(true))
    .addStringOption(o => o.setName('steam').setDescription('Steam ID o URL del perfil').setRequired(true))
    .addUserOption(o => o.setName('instructor').setDescription('Instructor que lo aprobó').setRequired(true))
    .addAttachmentOption(o => o.setName('foto').setDescription('Foto del nuevo oficial').setRequired(true))
    .toJSON());

  // /new — dar de alta al nuevo PFA con roles automáticos
  commands.push(new SlashCommandBuilder()
    .setName('new')
    .setDescription('[HEAD/Instructor] Asignar roles iniciales al nuevo PFA y publicar update')
    .addUserOption(o => o.setName('usuario').setDescription('Nuevo PFA').setRequired(true))
    .toJSON());

  // /resign — el PFA pide la baja voluntaria
  commands.push(new SlashCommandBuilder()
    .setName('resign')
    .setDescription('[HEAD] Procesar la baja voluntaria de un PFA (le saca todos los roles y queda como civil)')
    .addUserOption(o => o.setName('oficial').setDescription('PFA que pide la baja').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo opcional de la baja').setRequired(false))
    .toJSON());

  // /adv — advertir a un oficial por farmeo de horas (le cierra el fichaje si tiene abierto)
  commands.push(new SlashCommandBuilder()
    .setName('adv')
    .setDescription('[Encargado de Fichaje/HEAD] Advertir a un oficial por farmeo (le cierra fichaje si tiene abierto)')
    .addUserOption(o => o.setName('oficial').setDescription('Oficial a advertir').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo opcional (por defecto: no se lo encontró en voice)').setRequired(false))
    .toJSON());

  // /kcoins — Sistema de recompensas por facturación
  commands.push(new SlashCommandBuilder()
    .setName('kcoins')
    .setDescription('Sistema de Kcoins de la PFA')
    .addSubcommand(s => s.setName('ranking').setDescription('Ver el ranking de Kcoins ganados esta semana'))
    .addSubcommand(s => s.setName('activar').setDescription('[Dueños] Activar el sistema de Kcoins y publicar anuncio'))
    .addSubcommand(s => s.setName('desactivar').setDescription('[Dueños] Desactivar el sistema de Kcoins (sin borrar datos)'))
    .addSubcommand(s => s.setName('pagar').setDescription('[Dueños] Registrar el pago de Kcoins a un oficial')
      .addUserOption(o => o.setName('oficial').setDescription('Oficial que recibe el pago').setRequired(true))
      .addIntegerOption(o => o.setName('monto').setDescription('Cantidad de Kcoins pagados').setRequired(true).setMinValue(1)))
    .toJSON());

  // /return — reincorporar a un ex-PFA (con subcomandos low/high/head)
  commands.push(new SlashCommandBuilder()
    .setName('return')
    .setDescription('Reincorporar a un ex-PFA a la facción')
    .addSubcommand(s => s.setName('low').setDescription('[HEAD/HIGH/Instructor/Dueños] Reincorporar como rango LOW')
      .addUserOption(o => o.setName('oficial').setDescription('Oficial que vuelve').setRequired(true))
      .addStringOption(o => o.setName('rango').setDescription('Rango LOW').setRequired(true)
        .addChoices(...RANGOS_LOW.map(r => ({ name: r.nombre, value: r.id })))))
    .addSubcommand(s => s.setName('high').setDescription('[HEAD/HIGH/Dueños] Reincorporar como rango HIGH')
      .addUserOption(o => o.setName('oficial').setDescription('Oficial que vuelve').setRequired(true))
      .addStringOption(o => o.setName('rango').setDescription('Rango HIGH').setRequired(true)
        .addChoices(...RANGOS_HIGH.map(r => ({ name: r.nombre, value: r.id })))))
    .addSubcommand(s => s.setName('head').setDescription('[Dueños] Reincorporar como rango HEAD')
      .addUserOption(o => o.setName('oficial').setDescription('Oficial que vuelve').setRequired(true))
      .addStringOption(o => o.setName('rango').setDescription('Rango HEAD').setRequired(true)
        .addChoices(...RANGOS_HEAD.map(r => ({ name: r.nombre, value: r.id })))))
    .toJSON());

  // /cambiar-nombre — cambiar el nick del server con formato [LOW/HIGH] Nombre - placa
  commands.push(new SlashCommandBuilder()
    .setName('cambiar-nombre')
    .setDescription('[HEAD/Encargado de Fichaje] Cambiar el apodo de un oficial en el server')
    .addUserOption(o => o.setName('oficial').setDescription('Oficial a modificar').setRequired(true))
    .addStringOption(o => o.setName('categoria').setDescription('Categoría del prefijo').setRequired(true)
      .addChoices(
        { name: 'LOW', value: 'LOW' },
        { name: 'HIGH', value: 'HIGH' }
      ))
    .addStringOption(o => o.setName('nombre').setDescription('Nombre IC del oficial').setRequired(true))
    .addIntegerOption(o => o.setName('placa').setDescription('Número de placa').setRequired(true).setMinValue(1).setMaxValue(9999))
    .toJSON());

  // /check — verificar si un número de placa está disponible
  commands.push(new SlashCommandBuilder()
    .setName('check')
    .setDescription('Verificar si un número de placa está disponible (formatos: 777, -777, - 777)')
    .addStringOption(o => o.setName('placa').setDescription('Número de placa (ej: 777, -777, - 777)').setRequired(true))
    .toJSON());

  // /reportbug — reportar un bug o problema (abre modal)
  commands.push(new SlashCommandBuilder()
    .setName('reportbug')
    .setDescription('Reportar un bug del bot, problema del server, sugerencia u otro')
    .addStringOption(o => o.setName('categoria').setDescription('Categoría del reporte').setRequired(true)
      .addChoices(
        { name: '🐛 Bug del bot', value: 'bug_bot' },
        { name: '🖥️ Problema del server', value: 'problema_server' },
        { name: '💡 Sugerencia', value: 'sugerencia' },
        { name: '📌 Otro', value: 'otro' }
      ))
    .toJSON());

  // /reportinfo — ver los reportes almacenados (solo HEAD)
  commands.push(new SlashCommandBuilder()
    .setName('reportinfo')
    .setDescription('[HEAD] Ver los reportes de bugs almacenados')
    .addStringOption(o => o.setName('filtro').setDescription('Filtrar por estado').setRequired(false)
      .addChoices(
        { name: 'Todos', value: 'todos' },
        { name: 'Sin resolver', value: 'abiertos' },
        { name: 'Resueltos', value: 'resueltos' }
      ))
    .toJSON());

  // /proponer-sancion — Encargado/Aux Sanciones/HEAD proponen sanciones para aprobar
  commands.push(new SlashCommandBuilder()
    .setName('proponer-sancion')
    .setDescription('[Encargado/Aux Sanciones/HEAD] Proponer una sanción para que HEAD apruebe')
    .addUserOption(o => o.setName('oficial').setDescription('Oficial a sancionar').setRequired(true))
    .addStringOption(o => o.setName('tipo').setDescription('Tipo de sanción propuesta').setRequired(true)
      .addChoices(
        { name: '⚠️ 1 Warn', value: 'warn_1' },
        { name: '⚠️ 2 Warns', value: 'warn_2' },
        { name: '⛔ 1 Strike', value: 'strike_1' },
        { name: '⛔ 2 Strikes', value: 'strike_2' }
      ))
    .toJSON());

  // /cerrar-canal — cierra el canal actual para que solo HEAD y Dueños puedan escribir
  commands.push(new SlashCommandBuilder()
    .setName('cerrar-canal')
    .setDescription('[HEAD/Dueños] Cerrar el canal actual (solo HEAD y Dueños podrán escribir)')
    .addStringOption(o => o.setName('motivo').setDescription('Motivo del cierre (opcional)').setRequired(false))
    .toJSON());

  // /abrir-canal — reabre el canal actual
  commands.push(new SlashCommandBuilder()
    .setName('abrir-canal')
    .setDescription('[HEAD/Dueños] Reabrir el canal actual')
    .addStringOption(o => o.setName('motivo').setDescription('Motivo de la reapertura (opcional)').setRequired(false))
    .toJSON());

  // /anular-adv — anular la última advertencia de un oficial (por si se aplicó mal)
  commands.push(new SlashCommandBuilder()
    .setName('anular-adv')
    .setDescription('[HEAD/Dueños] Anular la última advertencia aplicada a un oficial')
    .addUserOption(o => o.setName('oficial').setDescription('Oficial al que anular la advertencia').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo de la anulación (opcional)').setRequired(false))
    .toJSON());

  // /pfa con subcomandos: on, off, horas, ascendido, ajustar, ranking, relevo
  commands.push(new SlashCommandBuilder()
    .setName('pfa')
    .setDescription('Sistema PFA: fichaje y consultas')
    .addSubcommand(s => s.setName('on').setDescription('Iniciar tu fichaje'))
    .addSubcommand(s => s.setName('off').setDescription('Cerrar tu fichaje'))
    .addSubcommand(s => s.setName('horas').setDescription('Ver tus horas y total facturado de la semana'))
    .addSubcommand(s => s.setName('ranking').setDescription('Ver el ranking de la semana (top 10)'))
    .addSubcommand(s => s.setName('ascendido').setDescription('[HEAD] Registrar que un PFA fue ascendido hoy')
      .addUserOption(o => o.setName('oficial').setDescription('PFA que acabás de ascender').setRequired(true)))
    .addSubcommand(s => s.setName('ajustar').setDescription('[HEAD] Ajustar manualmente la semana de un PFA (acepta valores negativos)')
      .addUserOption(o => o.setName('oficial').setDescription('PFA a ajustar').setRequired(true))
      .addStringOption(o => o.setName('tipo').setDescription('Qué ajustar').setRequired(true)
        .addChoices(
          { name: 'Horas', value: 'horas' },
          { name: 'Minutos', value: 'minutos' },
          { name: 'Monto facturado ($)', value: 'monto' },
          { name: 'Antecedentes', value: 'antec' },
          { name: 'Tickets', value: 'tickets' }
        ))
      .addNumberOption(o => o.setName('cantidad').setDescription('Cantidad a sumar (positiva) o restar (negativa, ej: -2)').setRequired(true)))
    .addSubcommand(s => s.setName('relevo').setDescription('[HEAD] Relevo general: cierra el fichaje de todos los PFA activos'))
    .addSubcommand(s => s.setName('abiertos').setDescription('[HIGH+] Ver quién tiene fichaje abierto en este momento'))
    .addSubcommand(s => s.setName('info').setDescription('[HIGH+] Ver toda la info semanal de un PFA')
      .addUserOption(o => o.setName('oficial').setDescription('PFA a consultar').setRequired(true)))
    .addSubcommand(s => s.setName('reset').setDescription('[HEAD] Resetear la semana de un PFA específico (horas, facturas, antec, tickets)')
      .addUserOption(o => o.setName('oficial').setDescription('PFA a resetear').setRequired(true)))
    .addSubcommand(s => s.setName('cerrar').setDescription('[HIGH+] Cerrar el fichaje de otro PFA (cuando se olvidó)')
      .addUserOption(o => o.setName('oficial').setDescription('PFA cuyo fichaje cerrar').setRequired(true)))
    .addSubcommand(s => s.setName('hoy').setDescription('Ver las horas que hizo un PFA HOY en el bot')
      .addUserOption(o => o.setName('oficial').setDescription('PFA a consultar').setRequired(true)))
    .addSubcommand(s => s.setName('factura-editar').setDescription('Editar una factura propia que mandaste con error'))
    .addSubcommand(s => s.setName('factura-head-editar').setDescription('[HEAD] Editar la factura de cualquier PFA')
      .addUserOption(o => o.setName('oficial').setDescription('PFA dueño de la factura').setRequired(true)))
    .addSubcommand(s => s.setName('editar-sanciones').setDescription('[HEAD/Sancionador] Editar el motivo o anular una sanción aplicada')
      .addUserOption(o => o.setName('oficial').setDescription('PFA dueño de la sanción').setRequired(true)))
    .addSubcommand(s => s.setName('sancionar').setDescription('[Sanciones] Aplicar un warn o strike a un PFA')
      .addUserOption(o => o.setName('oficial').setDescription('PFA a sancionar').setRequired(true))
      .addStringOption(o => o.setName('tipo').setDescription('Tipo y cantidad de sanción').setRequired(true)
        .addChoices(
          { name: '1 Warn', value: 'warn_1' },
          { name: '2 Warns', value: 'warn_2' },
          { name: '3 Warns (escala a strike)', value: 'warn_3' },
          { name: '1 Strike', value: 'strike_1' },
          { name: '2 Strikes', value: 'strike_2' },
          { name: '3 Strikes (demote auto)', value: 'strike_3' }
        ))
      .addStringOption(o => o.setName('motivo').setDescription('Motivo de la sanción').setRequired(true)))
    .addSubcommand(s => s.setName('sanciones').setDescription('Ver el historial de sanciones de un PFA')
      .addUserOption(o => o.setName('oficial').setDescription('PFA a consultar').setRequired(true)))
    .addSubcommand(s => s.setName('ausencia').setDescription('Registrar una ausencia (máximo 15 días, requiere aprobación)')
      .addIntegerOption(o => o.setName('dias').setDescription('Cantidad de días de ausencia (1-15)').setRequired(true).setMinValue(1).setMaxValue(15))
      .addStringOption(o => o.setName('motivo').setDescription('Razón de la ausencia').setRequired(true)))
    .addSubcommand(s => s.setName('blacklist').setDescription('[HEAD] Blacklist completo a un PFA (le saca todos los rangos)')
      .addUserOption(o => o.setName('oficial').setDescription('PFA a blacklistear').setRequired(true))
      .addStringOption(o => o.setName('motivo').setDescription('Motivo del blacklist').setRequired(true))
      .addIntegerOption(o => o.setName('tiempo').setDescription('Duración del BL en días (dejar vacío = permanente)').setRequired(false).setMinValue(1).setMaxValue(3650))
      .addStringOption(o => o.setName('categoria').setDescription('Categoría opcional').setRequired(false)
        .addChoices(
          { name: 'Troll', value: 'troll' },
          { name: 'No apto', value: 'no_apto' }
        )))
    .addSubcommand(s => s.setName('demote').setDescription('[HEAD] Demote manual: saca al PFA temporalmente (puede volver en 1 mes)')
      .addUserOption(o => o.setName('oficial').setDescription('PFA a demotear').setRequired(true))
      .addStringOption(o => o.setName('motivo').setDescription('Motivo del demote').setRequired(true)))
    .addSubcommand(s => s.setName('apelar').setDescription('Apelar una sanción (Warn ≥15 días · Strike ≥30 días)'))
    .addSubcommand(s => s.setName('adicional').setDescription('[HEAD] Activar/desactivar horas estelares (multiplicador temporal)')
      .addStringOption(o => o.setName('accion').setDescription('Qué hacer').setRequired(true)
        .addChoices(
          { name: '🌟 Activar', value: 'on' },
          { name: '⭐ Desactivar', value: 'off' },
          { name: 'ℹ️ Ver estado', value: 'info' }
        ))
      .addNumberOption(o => o.setName('multiplicador').setDescription('Cuánto vale cada hora (ej: 1.5, 2, 3, 4)').setRequired(false).setMinValue(1.1).setMaxValue(10))
      .addNumberOption(o => o.setName('horas').setDescription('Cuántas horas duran las estelares (máx 24)').setRequired(false).setMinValue(0.1).setMaxValue(24)))
    .addSubcommand(s => s.setName('historial').setDescription('[HIGH+] Ver historial completo de un oficial (rango, sanciones, salida)')
      .addUserOption(o => o.setName('oficial').setDescription('PFA a consultar').setRequired(true)))
    .addSubcommand(s => s.setName('reiniciar').setDescription('[HEAD] Reinicia el bot guardando todos los datos primero'))
    .toJSON());

  // /ascensos - [HEAD] Listar candidatos a ascenso por rango
  commands.push(new SlashCommandBuilder()
    .setName('ascensos')
    .setDescription('[HEAD] Ver candidatos a ascenso de esta semana, agrupados por rango')
    .toJSON());

  // /semana - [HEAD/HIGH] Ver todos los datos de la semana CERRADA (para comparar con /ascensos)
  commands.push(new SlashCommandBuilder()
    .setName('semana')
    .setDescription('[HEAD/HIGH] Ver los datos de la semana pasada (cerrada): horas, antec, tickets y facturado')
    .toJSON());

  // /inactivos - [HEAD] Listar PFAs sin actividad en la semana, agrupados por rango
  commands.push(new SlashCommandBuilder()
    .setName('inactivos')
    .setDescription('[HEAD] Ver PFAs sin actividad esta semana, agrupados por rango')
    .toJSON());

  // /facturar - registrar una factura (multa o dinero en negro segun canal)
  commands.push(new SlashCommandBuilder()
    .setName('facturar')
    .setDescription('Registrar una factura (multa o dinero en negro)')
    .addNumberOption(o => o.setName('monto').setDescription('Monto facturado').setRequired(true).setMinValue(1))
    .addAttachmentOption(o => o.setName('foto').setDescription('Foto/captura de la factura').setRequired(true))
    .toJSON());

  // /cerrar-semana - [HEAD/HIGH] Cierre semanal completo manual (fichajes + facturas + tickets)
  commands.push(new SlashCommandBuilder()
    .setName('cerrar-semana')
    .setDescription('[HEAD/HIGH] Cierre semanal completo: fichajes, facturas y tickets')
    .toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try { await rest.put(Routes.applicationCommands(client.user.id), { body: commands }); console.log('Comandos: ' + commands.length); }
  catch (err) { console.error(err); }
});

// ==================== SISTEMA DE AVISOS A INSTRUCTORES ====================
// Cuando un postulante (sin rol PFA) entra al canal de "esperando examen",
// el bot avisa al canal de instructores hasta 3 veces (cada 1 min) y después
// le manda DM al postulante diciendo que no hay personal disponible.
const avisosInstructor = new Map(); // userId -> { timeouts: [], inicio }

async function enviarAvisoInstructor(client, guild, member, numero, minutos) {
  try {
    const c = await guild.channels.fetch(CANAL_INSTRUCTORES);
    const tiempoTxt = minutos === 0 ? 'recién entró' : 'lleva **' + minutos + ' minuto' + (minutos > 1 ? 's' : '') + '** esperando';
    const embed = new EmbedBuilder()
      .setTitle('⚠️ AVISO #' + numero + ' — POSTULANTE SIN ATENCIÓN')
      .setDescription('<@' + member.id + '> ' + tiempoTxt + ' en <#' + CANAL_ESPERANDO + '>.')
      .setColor(numero === 3 ? 0xCC2222 : (numero === 2 ? 0xFF8800 : 0xFFAA00))
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Sistema de Exámenes' });
    await c.send({ content: '<@&' + ROL_INSTRUCTOR + '>', embeds: [embed], allowedMentions: { roles: [ROL_INSTRUCTOR] } });
    console.log('[INSTRUCTORES] Aviso #' + numero + ' enviado por ' + member.user.tag);
  } catch (e) { console.error('[INSTRUCTORES] ERROR enviando aviso:', e.message, e.code || ''); }
}

async function enviarDMSinInstructor(member) {
  try {
    await member.send({
      content: '⚠️ **No hay instructores disponibles en este momento**\n\n' +
        'Estuviste esperando en el canal de exámenes y nadie pudo atenderte.\n' +
        'Por favor, comunicate al canal <#' + CANAL_PEDIR_INSTRUCTOR + '> pidiendo que algún instructor te atienda cuando estén disponibles.\n\n' +
        '_— Sistema de Exámenes · PFA Kilombo RP_'
    });
  } catch (e) { /* DM cerrado, ignorar */ }
}

function iniciarAvisosInstructor(client, guild, member) {
  const uid = member.id;
  if (avisosInstructor.has(uid)) return;

  const timeouts = [];
  // Aviso #1 inmediato (apenas entra)
  enviarAvisoInstructor(client, guild, member, 1, 0);
  // Aviso #2 a 2 minutos
  timeouts.push(setTimeout(() => enviarAvisoInstructor(client, guild, member, 2, 2), 120000));
  // Aviso #3 a 4 minutos
  timeouts.push(setTimeout(() => enviarAvisoInstructor(client, guild, member, 3, 4), 240000));
  // DM al postulante a los 5 minutos totales (1 min después del último aviso)
  timeouts.push(setTimeout(() => {
    enviarDMSinInstructor(member);
    avisosInstructor.delete(uid);
  }, 300000));

  avisosInstructor.set(uid, { timeouts, inicio: Date.now() });
}

function cancelarAvisosInstructor(uid) {
  const data = avisosInstructor.get(uid);
  if (!data) return;
  for (const t of data.timeouts) clearTimeout(t);
  avisosInstructor.delete(uid);
}

client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    console.log('[VOICE] ' + member.user.tag + ' | ' + (oldState.channelId || 'null') + ' -> ' + (newState.channelId || 'null'));

    // Entró a CANAL_ESPERANDO
    if (newState.channelId === CANAL_ESPERANDO && oldState.channelId !== CANAL_ESPERANDO) {
      console.log('[VOICE] >>> Entró a CANAL_ESPERANDO');
      const esInstructor = member.roles.cache.has(ROL_INSTRUCTOR) || member.roles.cache.has(ROL_HEAD_PFA);
      if (esInstructor) {
        console.log('[VOICE] Es Instructor/HEAD, cancelando ' + avisosInstructor.size + ' secuencias activas');
        for (const uid of Array.from(avisosInstructor.keys())) {
          cancelarAvisosInstructor(uid);
        }
        return;
      }
      // Solo disparar avisos para postulantes reales (sin rol PFA)
      // Los PFA pueden entrar al canal sin disparar avisos
      if (member.roles.cache.has(ROL_PFA)) {
        console.log('[VOICE] Tiene rol PFA, no se disparan avisos');
        return;
      }
      console.log('[VOICE] Iniciando avisos para postulante ' + member.user.tag);
      iniciarAvisosInstructor(newState.client, newState.guild, member);
      return;
    }

    // Salió de CANAL_ESPERANDO
    if (oldState.channelId === CANAL_ESPERANDO && newState.channelId !== CANAL_ESPERANDO) {
      console.log('[VOICE] <<< Salió de CANAL_ESPERANDO, cancelando avisos');
      cancelarAvisosInstructor(member.id);
      return;
    }
  } catch (e) {
    console.error('[VOICE] error:', e.message);
  }
});

// ==================== INTERACTIONS ====================
client.on('interactionCreate', async (interaction) => {
  // Log universal para diagnóstico
  const tipoLog = interaction.isChatInputCommand() ? 'SLASH:' + interaction.commandName
    : interaction.isButton() ? 'BUTTON:' + interaction.customId
    : interaction.isModalSubmit() ? 'MODAL:' + interaction.customId
    : 'OTHER';
  console.log('[INTERACTION] ' + tipoLog + ' por ' + interaction.user.tag);

  // Manejar botones de encuesta ANTES que cualquier otro handler (prioridad máxima)
  if (interaction.isButton() && interaction.customId.startsWith('ENCUESTA_VOTO_')) {
    console.log('[VOTO EARLY] Detectado voto en encuesta');
    try {
      const opcionIdx = parseInt(interaction.customId.replace('ENCUESTA_VOTO_', ''), 10);
      const msgId = interaction.message.id;
      console.log('[VOTO EARLY] msgId:', msgId, 'opcion:', opcionIdx);
      console.log('[VOTO EARLY] Encuestas activas:', Object.keys(encuestasActivas));

      const enc = encuestasActivas[msgId];
      if (!enc) {
        console.log('[VOTO EARLY] Encuesta no está en memoria');
        await interaction.reply({ content: '❌ Esta encuesta no está registrada en el bot. Puede haber sido creada antes del último redeploy. Creá una nueva.', ephemeral: true });
        return;
      }

      if (enc.votos[interaction.user.id] !== undefined) {
        await interaction.reply({ content: `❌ Ya votaste **${enc.opciones[enc.votos[interaction.user.id]]}**.`, ephemeral: true });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      enc.votos[interaction.user.id] = opcionIdx;
      guardarEncuestas().catch(e => console.error('[VOTO] Save error:', e.message));

      const emojisNumeros = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
      const totalVotos = Object.keys(enc.votos).length;
      const conteos = enc.opciones.map((_, i) => Object.values(enc.votos).filter(v => v === i).length);
      const descOpciones = enc.opciones.map((o, i) => {
        const votos = conteos[i];
        const pct = totalVotos === 0 ? 0 : Math.round((votos / totalVotos) * 100);
        const llenos = Math.round(pct / 10);
        const barra = '▰'.repeat(llenos) + '▱'.repeat(10 - llenos);
        return `${emojisNumeros[i]} **${o}**\n\`${barra}\` ${votos} voto${votos === 1 ? '' : 's'} (${pct}%)`;
      }).join('\n\n');

      const nuevoEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setDescription(`**${enc.pregunta}**\n\n${descOpciones}`)
        .setFields(
          { name: '⏱️ Cierra', value: `<t:${Math.floor(enc.expiraEn / 1000)}:R>`, inline: true },
          { name: '👤 Creada por', value: `<@${enc.creadaPor}>`, inline: true },
          { name: '🗳️ Votos totales', value: `**${totalVotos}**`, inline: true }
        );

      // Editar el mensaje original con los conteos actualizados
      await interaction.message.edit({ embeds: [nuevoEmbed] });
      await interaction.editReply({ content: `✅ Voto registrado: **${enc.opciones[opcionIdx]}**` });
      console.log('[VOTO EARLY] Voto OK - total:', totalVotos);
    } catch (err) {
      console.error('[VOTO EARLY] ERROR:', err.message, err.stack);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ Error al votar: ' + err.message, ephemeral: true });
        } else {
          await interaction.followUp({ content: '❌ Error al votar: ' + err.message, ephemeral: true });
        }
      } catch (e) { console.error('[VOTO EARLY] Error respondiendo:', e.message); }
    }
    return;
  }

  // Ver votantes de una encuesta (HEAD/Dueños) — botón
  if (interaction.isButton() && interaction.customId === 'ENCUESTA_VOTANTES') {
    const esHeadDueno = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_DUENOS);
    if (!esHeadDueno) { await interaction.reply({ content: '❌ Solo HEAD PFA o Dueños pueden ver los votantes.', ephemeral: true }); return; }
    const enc = encuestasActivas[interaction.message.id];
    if (!enc) { await interaction.reply({ content: '❌ Esta encuesta ya no está registrada (puede haber cerrado o se creó antes de un redeploy).', ephemeral: true }); return; }
    await interaction.reply({ content: encuestaVotantesTexto(enc), ephemeral: true, allowedMentions: { parse: [] } });
    return;
  }

  // Botón participar sorteo — también prioridad
  if (interaction.isButton() && interaction.customId === 'SORTEO_PARTICIPAR') {
    console.log('[SORTEO EARLY] Detectado participar');
    try {
      const msgId = interaction.message.id;
      const sor = sorteosActivos[msgId];
      if (!sor) { await interaction.reply({ content: '❌ Este sorteo no está registrado en el bot.', ephemeral: true }); return; }

      if (sor.participantes.includes(interaction.user.id)) {
        await interaction.reply({ content: '❌ Ya estás participando en este sorteo.', ephemeral: true });
        return;
      }
      const esPFA = interaction.member.roles.cache.has(ROL_LOW_PFA) || interaction.member.roles.cache.has(ROL_HIGH) || interaction.member.roles.cache.has(ROL_HEAD_PFA);
      if (!esPFA) {
        await interaction.reply({ content: '❌ Solo oficiales PFA pueden participar.', ephemeral: true });
        return;
      }
      if (sor.minHoras > 0) {
        const fich = semanaFichajes[interaction.user.id];
        const horasSemana = fich ? (fich.totalMs / (1000 * 60 * 60)) : 0;
        if (horasSemana < sor.minHoras) {
          await interaction.reply({ content: `❌ Necesitás **${sor.minHoras} horas** semanales para participar. Tenés **${horasSemana.toFixed(1)}**.`, ephemeral: true });
          return;
        }
      }

      await interaction.deferReply({ ephemeral: true });
      sor.participantes.push(interaction.user.id);
      guardarSorteos().catch(e => console.error('[SORTEO] Save error:', e.message));

      const nuevoEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setFields(
        { name: '🎁 Cantidad de ganadores', value: `**${sor.ganadores}**`, inline: true },
        { name: '⏱️ Cierra', value: `<t:${Math.floor(sor.expiraEn / 1000)}:R>`, inline: true },
        { name: '👤 Organiza', value: `<@${sor.creadoPor}>`, inline: true },
        { name: '👥 Participantes', value: `**${sor.participantes.length}**`, inline: true }
      );
      await interaction.message.edit({ embeds: [nuevoEmbed] });
      await interaction.editReply({ content: '✅ Estás participando en el sorteo. ¡Suerte!' });
      console.log('[SORTEO EARLY] OK - participantes:', sor.participantes.length);
    } catch (err) {
      console.error('[SORTEO EARLY] ERROR:', err.message, err.stack);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ Error: ' + err.message, ephemeral: true });
        } else {
          await interaction.followUp({ content: '❌ Error: ' + err.message, ephemeral: true });
        }
      } catch (e) { }
    }
    return;
  }

  // Si el bot todavía no cargó todos los datos, avisar y no procesar (evita bug de datos vacíos durante arranque)
  if (!botListo) {
    try {
      if (interaction.isRepliable()) {
        await interaction.reply({
          content: '⏳ **El bot todavía está cargando datos.** Esperá unos segundos e intentá de nuevo. Los comandos se activan cuando todos los archivos terminen de cargarse.',
          ephemeral: true
        });
      }
    } catch (e) { /* Interaction ya vencida o error, ignorar */ }
    return;
  }

  // Botones BREAK_START / BREAK_END (sistema de pausa de fichaje)
  if (interaction.isButton() && (interaction.customId === 'BREAK_START' || interaction.customId === 'BREAK_END')) {
    const uidB = interaction.user.id;
    if (!interaction.member.roles.cache.has(ROL_PFA)) {
      await interaction.reply({ content: '❌ Solo personal con el rol PFA puede usar el sistema de break.', ephemeral: true });
      return;
    }

    if (interaction.customId === 'BREAK_START') {
      if (!fichajesActivos[uidB]) {
        await interaction.reply({ content: '❌ Necesitás tener un fichaje abierto para iniciar un break.', ephemeral: true });
        return;
      }
      if (breaksActivos[uidB]) {
        const inicioBr = breaksActivos[uidB].inicioBreakMs;
        const transcurrido = Date.now() - inicioBr;
        const restante = Math.max(0, 15 * 60000 - transcurrido);
        await interaction.reply({ content: '⚠️ Ya tenés un break activo desde <t:' + Math.floor(inicioBr / 1000) + ':R>. Te quedan **' + formatDuracion(restante) + '** antes del cierre automático del fichaje.', ephemeral: true });
        return;
      }
      breaksActivos[uidB] = { inicioBreakMs: Date.now() };
      await guardarBreaks();
      const finBreakMs = Date.now() + 15 * 60000;
      await interaction.reply({ content: '☕ **Break iniciado.** Tu fichaje quedó pausado.\n\n⏰ Tenés hasta <t:' + Math.floor(finBreakMs / 1000) + ':t> (<t:' + Math.floor(finBreakMs / 1000) + ':R>) para finalizarlo, o el fichaje se va a cerrar automáticamente.', ephemeral: true });
      return;
    }

    // BREAK_END
    if (!breaksActivos[uidB]) {
      await interaction.reply({ content: '❌ No tenés ningún break activo para finalizar.', ephemeral: true });
      return;
    }
    if (!fichajesActivos[uidB]) {
      // Edge: el fichaje ya no existe. Limpio el break y aviso.
      delete breaksActivos[uidB];
      await guardarBreaks();
      await interaction.reply({ content: '⚠️ Tu fichaje ya no estaba abierto. Limpié tu break.', ephemeral: true });
      return;
    }
    const duracionBreakMs = Date.now() - breaksActivos[uidB].inicioBreakMs;
    // Mover el inicio del fichaje hacia adelante para no contar el tiempo de break
    const inicioOriginal = new Date(fichajesActivos[uidB].inicio).getTime();
    const inicioNuevo = inicioOriginal + duracionBreakMs;
    fichajesActivos[uidB].inicio = new Date(inicioNuevo).toISOString();
    delete breaksActivos[uidB];
    await guardarBreaks();
    await guardarFichajesActivos();
    await interaction.reply({ content: '✅ **Break finalizado.** Tu fichaje fue reanudado. Tiempo de break descontado: **' + formatDuracion(duracionBreakMs) + '**.', ephemeral: true });
    return;
  }

  // Botón AUS_OK / AUS_NO (aprobar/rechazar ausencia)
  if (interaction.isButton() && (interaction.customId.startsWith('AUS_OK_') || interaction.customId.startsWith('AUS_NO_'))) {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HIGH) || interaction.member.roles.cache.has(ROL_HEAD_PFA);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo HIGH o HEAD PFA puede aprobar/rechazar ausencias.', ephemeral: true });
      return;
    }
    const aprobar = interaction.customId.startsWith('AUS_OK_');
    const ausenciaId = interaction.customId.slice(7);
    const a = ausencias[ausenciaId];
    if (!a) {
      await interaction.reply({ content: '❌ Esta solicitud ya no existe o fue procesada.', ephemeral: true });
      return;
    }
    if (a.estado !== 'pendiente') {
      await interaction.reply({ content: '⚠️ Esta solicitud ya fue ' + a.estado + '.', ephemeral: true });
      return;
    }

    a.estado = aprobar ? 'aprobada' : 'rechazada';
    a.revisadoPor = interaction.user.id;
    a.revisadoTs = Date.now();
    await guardarAusencias();

    const original = interaction.message.embeds[0];
    const embedUpd = EmbedBuilder.from(original)
      .setTitle('🏖️ Solicitud de Ausencia — ' + (aprobar ? 'APROBADA ✅' : 'RECHAZADA ❌'))
      .setColor(aprobar ? 0x22AA44 : 0xCC2222)
      .addFields({ name: (aprobar ? '✅' : '❌') + ' Revisado por', value: '<@' + interaction.user.id + '> · <t:' + Math.floor(Date.now() / 1000) + ':R>', inline: false });

    await interaction.update({ embeds: [embedUpd], components: [] });

    // Avisarle al solicitante por DM
    try {
      const u = await interaction.client.users.fetch(a.uid);
      await u.send({ content: 'Tu solicitud de ausencia de **' + a.dias + ' días** fue **' + (aprobar ? 'APROBADA ✅' : 'RECHAZADA ❌') + '** por <@' + interaction.user.id + '>.' });
    } catch (e) { /* dm cerrado, ignorar */ }
    return;
  }

  // Select menu APEL_SEL → mostrar modal
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('APEL_SEL_')) {
    const uidSel = interaction.customId.slice('APEL_SEL_'.length);
    if (interaction.user.id !== uidSel) {
      await interaction.reply({ content: '❌ Solo quien inició la apelación puede seleccionar.', ephemeral: true });
      return;
    }
    const sancionTs = interaction.values[0];

    const modal = new ModalBuilder()
      .setCustomId('APEL_MOD_' + sancionTs)
      .setTitle('Apelar Sanción');
    const txt = new TextInputBuilder()
      .setCustomId('motivo')
      .setLabel('¿Por qué querés apelar esta sanción?')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(20)
      .setMaxLength(1000)
      .setRequired(true)
      .setPlaceholder('Explicá detalladamente tu apelación. Mínimo 20 caracteres.');
    modal.addComponents(new ActionRowBuilder().addComponents(txt));
    await interaction.showModal(modal);
    return;
  }

  // Modal submit APEL_MOD → crear apelacion + publicar en canal
  if (interaction.isModalSubmit() && interaction.customId.startsWith('APEL_MOD_')) {
    const sancionTs = parseInt(interaction.customId.slice('APEL_MOD_'.length), 10);
    const uidApel = interaction.user.id;
    const motivoApel = interaction.fields.getTextInputValue('motivo');

    const data = sanciones[uidApel];
    if (!data) { await interaction.reply({ content: '❌ No se encontró tu historial de sanciones.', ephemeral: true }); return; }
    const entrada = data.historial.find(h => h.ts === sancionTs);
    if (!entrada) { await interaction.reply({ content: '❌ No se encontró esa sanción en tu historial.', ephemeral: true }); return; }
    if (!entradaEsApelable(entrada)) { await interaction.reply({ content: '❌ Esta sanción ya no es apelable.', ephemeral: true }); return; }

    // Marcar como pendiente
    entrada.apelacionPendiente = true;

    // Crear registro de apelación
    const apelacionId = 'AP' + Date.now() + '_' + uidApel.slice(-4);
    apelaciones[apelacionId] = {
      uid: uidApel,
      sancionTs,
      motivoApelacion: motivoApel,
      estado: 'pendiente',
      ts: Date.now()
    };
    await guardarSanciones();
    await guardarApelaciones();

    // Embed para canal apelaciones
    const cant = entrada.cantidad && entrada.cantidad > 1 ? entrada.cantidad + ' ' : '';
    const tipoTxt = cant + (entrada.tipo === 'warn' ? (entrada.cantidad > 1 ? 'WARNS' : 'WARN') : (entrada.cantidad > 1 ? 'STRIKES' : 'STRIKE'));
    const embed = new EmbedBuilder()
      .setTitle('📨 APELACIÓN — ' + tipoTxt)
      .setColor(0xFFAA00)
      .setThumbnail(interaction.member.displayAvatarURL())
      .addFields(
        { name: '👮 Apelante', value: '<@' + uidApel + '>', inline: true },
        { name: '🔨 Sancionado por', value: '<@' + entrada.sancionadoPor + '>', inline: true },
        { name: '📅 Fecha sanción', value: '<t:' + Math.floor(entrada.ts / 1000) + ':d>', inline: true },
        { name: '📝 Motivo original de la sanción', value: entrada.motivo || '_Sin motivo_', inline: false },
        { name: '🗣️ Motivo de la apelación', value: motivoApel, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Solo @' + entrada.sancionadoPor + ' o HEAD pueden decidir · ID: ' + apelacionId });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('APEL_OK_' + apelacionId).setLabel('✅ Aprobar apelación').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('APEL_NO_' + apelacionId).setLabel('❌ Rechazar apelación').setStyle(ButtonStyle.Danger)
    );

    try {
      const c = await interaction.guild.channels.fetch(CANAL_APELACIONES);
      await c.send({ content: '<@' + entrada.sancionadoPor + '>', embeds: [embed], components: [row] });
    } catch (e) { console.error('Log apelacion:', e.message); }

    await interaction.reply({ content: '✅ Apelación enviada. Esperá la decisión en <#' + CANAL_APELACIONES + '>. Te avisaremos por DM cuando se revise.', ephemeral: true });
    return;
  }

  // Botones APEL_OK / APEL_NO (aprobar/rechazar apelación)
  if (interaction.isButton() && (interaction.customId.startsWith('APEL_OK_') || interaction.customId.startsWith('APEL_NO_'))) {
    const aprobar = interaction.customId.startsWith('APEL_OK_');
    const apelacionId = interaction.customId.slice(8);
    const ap = apelaciones[apelacionId];
    if (!ap) { await interaction.reply({ content: '❌ Esta apelación ya no existe.', ephemeral: true }); return; }
    if (ap.estado !== 'pendiente') { await interaction.reply({ content: '⚠️ Esta apelación ya fue ' + ap.estado + '.', ephemeral: true }); return; }

    // Validar que sea el sancionador original O HEAD
    const data = sanciones[ap.uid];
    const entrada = data ? data.historial.find(h => h.ts === ap.sancionTs) : null;
    if (!entrada) { await interaction.reply({ content: '❌ No se encontró la sanción asociada a esta apelación.', ephemeral: true }); return; }

    const esElSancionador = interaction.user.id === entrada.sancionadoPor;
    const esHead = interaction.member.roles.cache.has(ROL_HEAD_PFA);
    if (!esElSancionador && !esHead) {
      await interaction.reply({ content: '❌ Solo el instructor que aplicó esta sanción (<@' + entrada.sancionadoPor + '>) o un HEAD PFA pueden decidir esta apelación.', ephemeral: true });
      return;
    }

    ap.estado = aprobar ? 'aprobada' : 'rechazada';
    ap.revisadoPor = interaction.user.id;
    ap.revisadoTs = Date.now();
    entrada.apelacionPendiente = false;

    if (aprobar) {
      entrada.apelacionAprobada = true;
      entrada.apelacionTs = Date.now();
      entrada.apelacionRevisadaPor = interaction.user.id;
      // Recalcular contadores
      const nuevoEstado = recalcularEstadoSancion(ap.uid);
      sanciones[ap.uid].warns = nuevoEstado.warns;
      sanciones[ap.uid].strikes = nuevoEstado.strikes;
      // Actualizar roles
      try {
        const member = await interaction.guild.members.fetch(ap.uid);
        await aplicarRolesSegunEstado(member);
      } catch (e) { console.error('Error actualizando roles post-apelacion:', e.message); }
    } else {
      entrada.apelacionRechazada = true;
      entrada.apelacionTs = Date.now();
      entrada.apelacionRevisadaPor = interaction.user.id;
    }
    await guardarSanciones();
    await guardarApelaciones();

    const original = interaction.message.embeds[0];
    const embedUpd = EmbedBuilder.from(original)
      .setTitle('📨 APELACIÓN — ' + (aprobar ? 'APROBADA ✅' : 'RECHAZADA ❌'))
      .setColor(aprobar ? 0x22AA44 : 0xCC2222)
      .addFields({ name: (aprobar ? '✅' : '❌') + ' Revisado por', value: '<@' + interaction.user.id + '> · <t:' + Math.floor(Date.now() / 1000) + ':R>', inline: false });

    await interaction.update({ embeds: [embedUpd], components: [] });

    // DM al apelante
    try {
      const u = await interaction.client.users.fetch(ap.uid);
      const txt = aprobar
        ? '✅ Tu apelación fue **APROBADA** por <@' + interaction.user.id + '>. La sanción quedó anulada y tus contadores fueron actualizados.'
        : '❌ Tu apelación fue **RECHAZADA** por <@' + interaction.user.id + '>. La sanción sigue vigente.';
      await u.send({ content: txt });
    } catch (e) { /* DM cerrado */ }
    return;
  }

  // ==================== POSTULACIONES — FLUJO COMPLETO ====================
  // Nota: Discord NO permite mostrar un modal en respuesta a otro modal submit.
  // Por eso, después de cada paso aparece un botón "Continuar al Paso X" que abre el siguiente modal.

  // Helper: valida que un valor sea un número entero dentro de un rango
  const validarNumero = (val, min, max) => {
    const n = parseInt(String(val).trim(), 10);
    if (isNaN(n) || String(n) !== String(val).trim()) return null;
    if (n < min || n > max) return null;
    return n;
  };

  // Botón "Enviar postulación" → modal Paso 1
  if (interaction.isButton() && interaction.customId === 'POSTULAR_INICIAR') {
    const modal = new ModalBuilder()
      .setCustomId('POSTULAR_PASO1')
      .setTitle('Postulación PFA — Paso 1 de 2');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('nombre_ic').setLabel('Nombre IC').setStyle(TextInputStyle.Short).setMinLength(2).setMaxLength(80).setRequired(true).setPlaceholder('Nombre completo del personaje')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('nombre_steam').setLabel('Nombre Steam').setStyle(TextInputStyle.Short).setMinLength(2).setMaxLength(80).setRequired(true).setPlaceholder('Nombre de usuario en Steam')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('tiempo_krp').setLabel('Cuánto tiempo llevás jugando en Kilombo RP').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(100).setRequired(true).setPlaceholder('Ej: 3 meses, 1 año')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('edad_ooc').setLabel('Edad OOC (solo número)').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(3).setRequired(true).setPlaceholder('Ej: 17')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('fuerzas_ic').setLabel('¿Formaste parte de alguna fuerza armada IC?').setStyle(TextInputStyle.Paragraph).setMinLength(2).setMaxLength(500).setRequired(true).setPlaceholder('¿Cuáles? Si no formaste parte, escribí "No"')
      )
    );
    await interaction.showModal(modal);
    return;
  }

  // Submit Paso 1 → valida edad y muestra botón para Paso 2
  if (interaction.isModalSubmit() && interaction.customId === 'POSTULAR_PASO1') {
    try {
      console.log('[POSTULAR] Paso 1 submit de ' + interaction.user.tag);
      const nombre_ic    = interaction.fields.getTextInputValue('nombre_ic');
      const nombre_steam = interaction.fields.getTextInputValue('nombre_steam');
      const tiempo_krp   = interaction.fields.getTextInputValue('tiempo_krp');
      const edadRaw      = interaction.fields.getTextInputValue('edad_ooc');
      const fuerzas_ic   = interaction.fields.getTextInputValue('fuerzas_ic');

      const edad = validarNumero(edadRaw, 1, 99);
      if (edad === null) {
        await interaction.reply({ content: '❌ La edad OOC debe ser un número válido (1-99). Volvé a apretar "Enviar postulación" y completá correctamente.', ephemeral: true });
        return;
      }

      postulacionesEnCurso.set(interaction.user.id, {
        paso1: { nombre_ic, nombre_steam, tiempo_krp, edad_ooc: String(edad), fuerzas_ic }
      });

      const boton = new ButtonBuilder().setCustomId('POSTULAR_BTN_PASO2').setLabel('Continuar al Paso 2 (Final)').setEmoji('➡️').setStyle(ButtonStyle.Primary);
      await interaction.reply({ content: '✅ Paso 1 guardado. Apretá el botón para continuar al Paso 2 (final).', components: [new ActionRowBuilder().addComponents(boton)], ephemeral: true });
    } catch (e) {
      console.error('[POSTULAR] ERROR paso 1:', e.message, e.stack);
      try { if (!interaction.replied) await interaction.reply({ content: '❌ Error en paso 1: ' + e.message, ephemeral: true }); } catch (_) {}
    }
    return;
  }

  // Botón "Continuar al Paso 2 (Final)" → modal Paso 2
  if (interaction.isButton() && interaction.customId === 'POSTULAR_BTN_PASO2') {
    const enCurso = postulacionesEnCurso.get(interaction.user.id);
    if (!enCurso || !enCurso.paso1) {
      await interaction.reply({ content: '❌ La sesión se perdió. Volvé al canal de postulaciones y apretá "Enviar postulación" de nuevo.', ephemeral: true });
      return;
    }
    const modal = new ModalBuilder()
      .setCustomId('POSTULAR_PASO2')
      .setTitle('Postulación PFA — Paso 2 (Final)');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('porque_pfa').setLabel('¿Por qué querés formar parte de la PFA?').setStyle(TextInputStyle.Paragraph).setMinLength(20).setMaxLength(800).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('disponibilidad').setLabel('Disponibilidad horaria').setStyle(TextInputStyle.Paragraph).setMinLength(5).setMaxLength(300).setRequired(true).setPlaceholder('Ej: Lunes a viernes de 19 a 23hs, fines de semana todo el día')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('solo_pfa').setLabel('¿Solo PFA o también sos de una Mafia?').setStyle(TextInputStyle.Paragraph).setMinLength(2).setMaxLength(300).setRequired(true).setPlaceholder('Detallá si tenés otras facciones activas')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('no_cumples').setLabel('¿Por qué considerarte si no cumplís?').setStyle(TextInputStyle.Paragraph).setMinLength(20).setMaxLength(800).setRequired(true).setPlaceholder('En caso de no cumplir los requisitos, ¿por qué deberíamos tenerte en cuenta?')
      )
    );
    await interaction.showModal(modal);
    return;
  }

  // Submit Paso 2 → publica embed final en canal de revisión
  if (interaction.isModalSubmit() && interaction.customId === 'POSTULAR_PASO2') {
    try {
      console.log('[POSTULAR] Paso 2 (final) submit de ' + interaction.user.tag);
      const enCurso = postulacionesEnCurso.get(interaction.user.id);
      if (!enCurso || !enCurso.paso1) {
        await interaction.reply({ content: '❌ La sesión de postulación se perdió. Volvé a apretar "Enviar postulación".', ephemeral: true });
        return;
      }

      const porque_pfa     = interaction.fields.getTextInputValue('porque_pfa');
      const disponibilidad = interaction.fields.getTextInputValue('disponibilidad');
      const solo_pfa       = interaction.fields.getTextInputValue('solo_pfa');
      const no_cumples     = interaction.fields.getTextInputValue('no_cumples');

      const p1 = enCurso.paso1;
      const ts = Date.now();
      const uidPostulante = interaction.user.id;

      const embed = new EmbedBuilder()
        .setTitle('Nueva Postulación de ' + nombreDiscord(interaction))
        .setColor(0x22AA44)
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '👤 Nombre IC',                                            value: p1.nombre_ic, inline: false },
          { name: '🎮 Nombre Steam',                                         value: p1.nombre_steam, inline: true },
          { name: '⏱️ Tiempo en Kilombo RP',                                 value: p1.tiempo_krp, inline: true },
          { name: '🎂 Edad OOC',                                             value: p1.edad_ooc, inline: true },
          { name: '🔗 Discord',                                              value: '<@' + uidPostulante + '> (' + nombreDiscord(interaction) + ')', inline: false },
          { name: '🎖️ ¿Formaste parte de alguna fuerza armada IC?',          value: p1.fuerzas_ic, inline: false },
          { name: '❓ ¿Por qué querés formar parte de la PFA?',              value: porque_pfa, inline: false },
          { name: '📅 Disponibilidad horaria',                               value: disponibilidad, inline: false },
          { name: '👮 ¿Solo PFA o también de una mafia?',                    value: solo_pfa, inline: false },
          { name: '📝 ¿Por qué considerarte si no cumplís los requisitos?',  value: no_cumples, inline: false }
        )
        .setTimestamp().setFooter({ text: 'H-50 Bot · Sistema de Postulaciones · WebStudios AR' });

      const aceptar = new ButtonBuilder().setCustomId('POSTULAR_ACEPTAR_' + uidPostulante + '_' + ts).setLabel('Aceptar').setEmoji('✅').setStyle(ButtonStyle.Success);
      const rechazar = new ButtonBuilder().setCustomId('POSTULAR_RECHAZAR_' + uidPostulante + '_' + ts).setLabel('Rechazar').setEmoji('❌').setStyle(ButtonStyle.Danger);

      const canal = await interaction.guild.channels.fetch(CANAL_POSTULACIONES_REVISION);
      await canal.send({ content: '<@&' + ROL_INSTRUCTOR + '>', embeds: [embed], components: [new ActionRowBuilder().addComponents(aceptar, rechazar)], allowedMentions: { roles: [ROL_INSTRUCTOR] } });
      postulacionesEnCurso.delete(uidPostulante);
      await interaction.reply({ content: '✅ **Tu postulación fue enviada con éxito.**\nEl equipo de instructores la va a revisar pronto. Te avisaremos por mensaje privado cuando tengamos una decisión.', ephemeral: true });
      console.log('[POSTULAR] Postulación de ' + interaction.user.tag + ' enviada al canal de revisión');
    } catch (e) {
      console.error('[POSTULAR] ERROR paso 2 final:', e.message, e.code || '', e.stack);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ Error al enviar la postulación: ' + e.message + '.\nProbá de nuevo o avisá a un staff.', ephemeral: true });
        }
      } catch (_) {}
    }
    return;
  }

  // Botón APROBAR ASCENSOS MASIVOS: ejecuta ascensos de todos los elegibles y publica embed único en updates
  if (interaction.isButton() && interaction.customId === 'ASCENSOS_APROBAR_MASIVO') {
    if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
      await interaction.reply({ content: '❌ Solo HEAD PFA puede aprobar ascensos.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    await guild.members.fetch();

    // Recolectar todos los oficiales elegibles con sus datos
    const paraAscender = [];
    for (const [, member] of guild.members.cache) {
      if (member.user.bot) continue;
      const rango = detectarRango(member);
      if (!rango) continue;
      const uid = member.id;
      if (tieneAusenciaActiva(uid)) continue;
      const horasMs = (semanaFichajes[uid] || {}).totalMs || 0;
      const antec = semanaAntecedentes[uid] || 0;
      const monto = (semanaFacturas[uid] || {}).totalMonto || 0;
      const tickets = (registroTickets[uid] || {}).total || 0;
      const ev = evaluarPFA(rango.categoria, uid, horasMs, antec, monto, tickets);
      if (!ev.elegible) continue;

      // Calcular rango siguiente (o doble en LOW)
      let saltos = ev.doble && rango.categoria === 'low' ? 2 : 1;
      let indiceObjetivo = rango.indice + saltos;
      let categoriaObj = rango.categoria;
      let rangoObjetivo = null;

      if (categoriaObj === 'low') {
        if (indiceObjetivo <= RANGOS_LOW.length - 1) {
          rangoObjetivo = { ...RANGOS_LOW[indiceObjetivo], categoria: 'low' };
        } else {
          // Se pasó del último LOW → primer HIGH
          rangoObjetivo = { ...RANGOS_HIGH[0], categoria: 'high' };
        }
      } else if (categoriaObj === 'high') {
        if (indiceObjetivo <= RANGOS_HIGH.length - 1) {
          rangoObjetivo = { ...RANGOS_HIGH[indiceObjetivo], categoria: 'high' };
        } else {
          continue; // Ya está en el máximo
        }
      }

      paraAscender.push({ member, uid, rangoActual: rango, rangoNuevo: rangoObjetivo, doble: ev.doble });
    }

    if (paraAscender.length === 0) {
      await interaction.editReply({ content: '_No hay oficiales elegibles para ascender en este momento._' });
      return;
    }

    // Aplicar ascensos (uno por uno) y armar líneas del mensaje
    const lineasPromote = [];
    const errores = [];
    for (const item of paraAscender) {
      try {
        await item.member.roles.remove(item.rangoActual.id, 'Ascenso masivo por ' + interaction.user.tag);
        await item.member.roles.add(item.rangoNuevo.id, 'Ascenso masivo por ' + interaction.user.tag);
        if (item.rangoActual.categoria === 'low' && item.rangoNuevo.categoria === 'high') {
          await item.member.roles.add(ROL_HIGH, 'Promoción a HIGH');
        }
        // Registrar en historial
        ascensosHistorial[item.uid] = {
          ultimaFecha: new Date().toISOString(),
          registradoPor: interaction.user.id,
          rangoAnterior: item.rangoActual.nombre,
          rangoNuevo: item.rangoNuevo.nombre,
          doble: !!item.doble
        };
        // Línea del mensaje
        const dobleTxt = item.doble ? ' **_(DOBLE)_**' : '';
        lineasPromote.push('**PROMOTE** <@' + item.uid + '> · **' + item.rangoActual.nombre + '** > **' + item.rangoNuevo.nombre + '**' + dobleTxt);
      } catch (e) {
        console.error('Error ascenso masivo ' + item.uid + ':', e.message);
        errores.push({ uid: item.uid, error: e.message });
      }
    }
    await guardarAscensosHistorial();

    // Publicar UN SOLO mensaje en el canal de updates
    if (lineasPromote.length > 0) {
      try {
        const c = await guild.channels.fetch(CANAL_UPDATES);
        const fecha = new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric', month: 'long', year: 'numeric' });
        const encabezado = '# ASCENSOS · PFA <a:fuegoceleste:>\n<@&' + ROL_LOW_PFA + '>\n_' + fecha + '_\n\n';
        // Dividir en chunks si es muy largo (limite Discord 2000 chars por mensaje)
        let mensajeActual = encabezado;
        for (const linea of lineasPromote) {
          if ((mensajeActual + linea + '\n').length > 1900) {
            await c.send({ content: mensajeActual });
            mensajeActual = '';
          }
          mensajeActual += linea + '\n';
        }
        if (mensajeActual.trim().length > 0) {
          await c.send({ content: mensajeActual });
        }
      } catch (e) { console.error('Error publicando ascensos masivos:', e.message); }
    }

    // ==================== PFA DE LA SEMANA ====================
    // Usa el snapshot de la semana cerrada (semanaAnteriorFichajes) si existe, sino usa la semana actual
    let mensajePfaSemana = null;
    let mensajePfaMes = null;
    try {
      // Elegir fuente de datos para la semana (snapshot si hay, si no la actual)
      const fuenteSemana = Object.keys(semanaAnteriorFichajes).length > 0 ? semanaAnteriorFichajes : semanaFichajes;

      // Top de todos (LOW o HIGH) por horas — EXCLUYENDO HEAD y Dueños
      let topLowUid = null, topLowMs = 0;
      for (const uid of Object.keys(fuenteSemana)) {
        const ms = fuenteSemana[uid].totalMs || 0;
        if (ms <= topLowMs) continue;
        const m = guild.members.cache.get(uid);
        if (!m) continue;
        // Excluir HEAD y Dueños (solo prueban comandos)
        if (m.roles.cache.has(ROL_HEAD_PFA) || m.roles.cache.has(ROL_DUENOS)) continue;
        const r = detectarRango(m);
        if (!r) continue;
        topLowUid = uid; topLowMs = ms;
      }

      if (topLowUid) {
        // Quitar rol al que actualmente lo tenga
        for (const [, m] of guild.members.cache) {
          if (m.id !== topLowUid && m.roles.cache.has(ROL_PFA_SEMANA)) {
            try { await m.roles.remove(ROL_PFA_SEMANA, 'Cambio semanal de PFA de la Semana'); } catch (e) { console.error('remove pfa semana:', e.message); }
          }
        }
        // Dar rol al top LOW
        const nuevoTop = guild.members.cache.get(topLowUid);
        try { await nuevoTop.roles.add(ROL_PFA_SEMANA, 'PFA de la Semana designado'); } catch (e) { console.error('add pfa semana:', e.message); }
        const horas = (topLowMs / 3600000).toFixed(1);
        mensajePfaSemana = '## PFA DE LA SEMANA\n**UPDATE** <@' + topLowUid + '> > <@&' + ROL_PFA_SEMANA + '>\n_' + horas + 'h trabajadas · reconocimiento especial._';
      }
    } catch (e) { console.error('Error PFA de la Semana:', e.message); }

    // ==================== PFA DEL MES ====================
    // Se calcula si pasaron ≥30 días desde el último PFA del Mes
    try {
      const ahoraMs = Date.now();
      const treintaDias = 30 * 24 * 60 * 60 * 1000;
      const ultimaMs = ultimaFechaPfaMes ? new Date(ultimaFechaPfaMes).getTime() : 0;
      const debeElegirse = !ultimaFechaPfaMes || (ahoraMs - ultimaMs) >= treintaDias;

      if (debeElegirse && Object.keys(mesFichajesAcum).length > 0) {
        // Top de TODOS (LOW + HIGH) por acumulado del mes — EXCLUYENDO HEAD y Dueños
        let topUid = null, topMs = 0;
        for (const uid of Object.keys(mesFichajesAcum)) {
          const ms = mesFichajesAcum[uid] || 0;
          if (ms <= topMs) continue;
          const m = guild.members.cache.get(uid);
          if (!m) continue;
          // Excluir HEAD y Dueños (solo prueban comandos)
          if (m.roles.cache.has(ROL_HEAD_PFA) || m.roles.cache.has(ROL_DUENOS)) continue;
          const r = detectarRango(m);
          if (!r) continue;
          topUid = uid; topMs = ms;
        }

        if (topUid) {
          // Quitar rol al anterior
          for (const [, m] of guild.members.cache) {
            if (m.id !== topUid && m.roles.cache.has(ROL_PFA_MES)) {
              try { await m.roles.remove(ROL_PFA_MES, 'Cambio mensual de PFA del Mes'); } catch (e) { console.error('remove pfa mes:', e.message); }
            }
          }
          const nuevoTopMes = guild.members.cache.get(topUid);
          try { await nuevoTopMes.roles.add(ROL_PFA_MES, 'PFA del Mes designado'); } catch (e) { console.error('add pfa mes:', e.message); }
          const horas = (topMs / 3600000).toFixed(1);
          mensajePfaMes = '## PFA DEL MES\n**UPDATE** <@' + topUid + '> > <@&' + ROL_PFA_MES + '>\n_' + horas + 'h acumuladas en el mes · máximo reconocimiento._';

          // Resetear acumulador y guardar fecha
          mesFichajesAcum = {};
          ultimaFechaPfaMes = new Date().toISOString();
          await guardarMesAcum();
        }
      }
    } catch (e) { console.error('Error PFA del Mes:', e.message); }

    // Publicar apartado de PFA de la Semana / Mes en un mensaje separado
    if (mensajePfaSemana || mensajePfaMes) {
      try {
        const c = await guild.channels.fetch(CANAL_UPDATES);
        let msg = '';
        if (mensajePfaSemana) msg += mensajePfaSemana + '\n\n';
        if (mensajePfaMes) msg += mensajePfaMes + '\n';
        await c.send({ content: msg });
      } catch (e) { console.error('Error publicando PFA semana/mes:', e.message); }
    }

    let respuesta = '✅ **' + lineasPromote.length + '** ascensos aplicados y publicados en <#' + CANAL_UPDATES + '>.';
    if (mensajePfaSemana) respuesta += '\n🏆 PFA de la Semana designado.';
    if (mensajePfaMes) respuesta += '\n👑 PFA del Mes designado.';
    if (errores.length > 0) {
      respuesta += '\n⚠️ ' + errores.length + ' fallaron (revisar logs — quizás el bot no puede modificar esos roles).';
    }
    await interaction.editReply({ content: respuesta });
    return;
  }

  // Botón APLICAR DOWNGRADES: baja 1 rango a todos los que no cumplen mínima, aplica warn, publica en updates
  if (interaction.isButton() && interaction.customId === 'ASCENSOS_APLICAR_DOWNGRADES') {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_DUENOS);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Dueños pueden aplicar downgrades.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    await guild.members.fetch();

    // Recolectar los oficiales a downgradear (misma fuente que /ascensos: la semana cerrada)
    const paraDowngrade = [];
    const _usarCerradaDg = haySemanaCerrada();
    const _ignorarAntecDg = _usarCerradaDg ? !antecDisponibleSemanaCerrada() : false;
    for (const [, member] of guild.members.cache) {
      if (member.user.bot) continue;
      const rango = detectarRango(member);
      if (!rango) continue;
      const uid = member.id;
      if (tieneAusenciaActiva(uid)) continue;
      const _mc = _usarCerradaDg ? metricasSemanaCerrada(uid) : { horasMs: (semanaFichajes[uid] || {}).totalMs || 0, antec: semanaAntecedentes[uid] || 0, monto: (semanaFacturas[uid] || {}).totalMonto || 0, tickets: (registroTickets[uid] || {}).total || 0 };
      const horasMs = _mc.horasMs;
      const antec = _mc.antec;
      const monto = _mc.monto;
      const tickets = _mc.tickets;
      const ev = evaluarPFA(rango.categoria, uid, horasMs, antec, monto, tickets, { ignorarAntec: _ignorarAntecDg });
      if (!ev.downgrade) continue;
      // Excluir recién ingresados (menos de 7 días desde /new o /return)
      const ingresoData = ingresosPFA[uid];
      const diasDesdeIngreso = ingresoData ? (Date.now() - ingresoData.ts) / (1000 * 60 * 60 * 24) : Infinity;
      if (diasDesdeIngreso < 7) continue;
      paraDowngrade.push({ member, uid, rangoActual: rango, horas: ev.horas, antec, tickets, faltantes: ev.faltantes });
    }

    if (paraDowngrade.length === 0) {
      await interaction.editReply({ content: '_No hay oficiales para hacer downgrade en este momento._' });
      return;
    }

    const lineas = [];
    const errores = [];
    for (const item of paraDowngrade) {
      try {
        const esCadete = item.rangoActual.categoria === 'low' && item.rangoActual.indice === 0;
        const motivoBase = 'No cumplió mínima semanal: ' + item.faltantes.join(', ');

        if (esCadete) {
          // Cadete → Civil (demote completo con función existente)
          const motivo = 'Demote automático por no cumplir con las tareas mínimas para el rango de Cadete. ' + motivoBase;
          await aplicarDemote(item.member, motivo, interaction.user.id, guild);
          lineas.push('⛔ **DEMOTE** <@' + item.uid + '> · **CADETE** > **CIVIL** _(no cumplió mínima)_');
          continue;
        }

        // Calcular rango destino (baja 1 rango)
        let rangoNuevo = null;
        let categoriaDestino = item.rangoActual.categoria;
        if (item.rangoActual.categoria === 'low') {
          rangoNuevo = { ...RANGOS_LOW[item.rangoActual.indice - 1], categoria: 'low' };
        } else if (item.rangoActual.categoria === 'high') {
          if (item.rangoActual.indice === 0) {
            // Sub Inspector → Oficial Mayor (último LOW). Le sacamos todo lo de HIGH.
            rangoNuevo = { ...RANGOS_LOW[RANGOS_LOW.length - 1], categoria: 'low' };
            categoriaDestino = 'low';
          } else {
            rangoNuevo = { ...RANGOS_HIGH[item.rangoActual.indice - 1], categoria: 'high' };
          }
        }

        // Aplicar cambio de roles
        if (categoriaDestino === 'low' && item.rangoActual.categoria === 'high') {
          // Baja de HIGH a LOW: dejarle SOLO roles estéticos + ROL_PFA + ROL_LOW_PFA + rango LOW
          const rolesFinales = new Set();
          rolesFinales.add(ROL_PFA);
          rolesFinales.add(ROL_LOW_PFA);
          rolesFinales.add(rangoNuevo.id);
          // Roles decorativos (primeros de ROLES_NEW_PFA excepto el último que es Cadete)
          for (let i = 0; i < ROLES_NEW_PFA.length - 1; i++) {
            rolesFinales.add(ROLES_NEW_PFA[i]);
          }
          // Preservar otros roles no relacionados a jerarquía/sanciones
          const rolesQuitar = new Set([
            ROL_HIGH, ROL_HEAD_PFA,
            ...RANGOS_HIGH.map(r => r.id), ...RANGOS_HEAD.map(r => r.id),
            ...RANGOS_LOW.map(r => r.id)
          ]);
          for (const [rid] of item.member.roles.cache) {
            if (rid === guild.id) continue;
            if (!rolesQuitar.has(rid)) rolesFinales.add(rid);
          }
          await item.member.roles.set(Array.from(rolesFinales), 'Downgrade masivo por ' + interaction.user.tag);
        } else {
          // Cambio simple dentro de la misma categoría
          await item.member.roles.remove(item.rangoActual.id, 'Downgrade masivo por ' + interaction.user.tag);
          await item.member.roles.add(rangoNuevo.id, 'Downgrade masivo por ' + interaction.user.tag);
        }

        // Aplicar +1 warn (con escalación automática si llega a 3 warns)
        if (!sanciones[item.uid]) sanciones[item.uid] = { warns: 0, strikes: 0, historial: [] };
        sanciones[item.uid].warns++;
        let escalaAStrike = false;
        if (sanciones[item.uid].warns >= 3) {
          sanciones[item.uid].warns = 0;
          sanciones[item.uid].strikes++;
          escalaAStrike = true;
        }
        sanciones[item.uid].historial.push({
          tipo: 'warn',
          cantidad: 1,
          motivo: 'Warn automático por downgrade — ' + motivoBase,
          sancionadoPor: interaction.user.id,
          ts: Date.now(),
          auto: true,
          origen: 'downgrade_semanal'
        });
        // Actualizar rol de sanción
        try {
          for (const r of ROLES_SANCION) {
            if (item.member.roles.cache.has(r)) await item.member.roles.remove(r, 'Actualización sanción');
          }
          let rolFinal = null;
          if (sanciones[item.uid].strikes === 2) rolFinal = ROL_STRIKE_2;
          else if (sanciones[item.uid].strikes === 1) rolFinal = ROL_STRIKE_1;
          else if (sanciones[item.uid].warns === 2) rolFinal = ROL_WARN_2;
          else if (sanciones[item.uid].warns === 1) rolFinal = ROL_WARN_1;
          if (rolFinal) await item.member.roles.add(rolFinal, 'Warn automático por downgrade');
        } catch (e) { console.error('Error rol sancion downgrade:', e.message); }

        // DM al oficial
        try {
          await item.member.send({ content: '⬇️ **Downgrade aplicado**\n\nFuiste bajado de rango porque no cumpliste con la mínima semanal.\n**Rango anterior:** ' + item.rangoActual.nombre + '\n**Rango nuevo:** ' + rangoNuevo.nombre + '\n**Faltantes:** ' + item.faltantes.join(', ') + '\n\nAdemás se te aplicó **+1 WARN** automático' + (escalaAStrike ? ' _(escaló a STRIKE por 3 warns)_' : '') + '. Podés revisar el detalle con `/pfa horas`.\n\n_— PFA Kilombo RP_' });
        } catch (e) { /* DM cerrado */ }

        lineas.push('⬇️ **DOWNGRADE** <@' + item.uid + '> · **' + item.rangoActual.nombre.toUpperCase() + '** > **' + rangoNuevo.nombre.toUpperCase() + '** _(+1 warn' + (escalaAStrike ? ', escaló a STRIKE' : '') + ')_');
      } catch (e) {
        console.error('Error downgrade ' + item.uid + ':', e.message);
        errores.push({ uid: item.uid, error: e.message });
      }
    }
    await guardarSanciones();

    // Publicar mensaje único en updates
    if (lineas.length > 0) {
      try {
        const c = await guild.channels.fetch(CANAL_UPDATES);
        const fecha = new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric', month: 'long', year: 'numeric' });
        const encabezado = '# ⬇️ DOWNGRADES SEMANALES · PFA\n<@&' + ROL_LOW_PFA + '>\n_' + fecha + '_\n_Por no cumplir con la mínima semanal_\n\n';
        let mensajeActual = encabezado;
        for (const linea of lineas) {
          if ((mensajeActual + linea + '\n').length > 1900) {
            await c.send({ content: mensajeActual });
            mensajeActual = '';
          }
          mensajeActual += linea + '\n';
        }
        if (mensajeActual.trim().length > 0) {
          await c.send({ content: mensajeActual });
        }
      } catch (e) { console.error('Error publicando downgrades:', e.message); }
    }

    let respuesta = '⬇️ **' + lineas.length + '** downgrades aplicados y publicados en <#' + CANAL_UPDATES + '>.';
    if (errores.length > 0) respuesta += '\n⚠️ ' + errores.length + ' fallaron (revisar logs).';
    await interaction.editReply({ content: respuesta });
    return;
  }

  // Botón ACEPTAR postulación
  // ==================== BOTONES: PROPUESTAS DE SANCIONES ====================
  // Botón APROBAR: aplica la sanción con el motivo original
  if (interaction.isButton() && interaction.customId.startsWith('PROP_SAN_APROBAR_')) {
    const puedeAprobar = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_SANCIONES);
    if (!puedeAprobar) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Encargado de Sanciones puede aprobar sanciones propuestas.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const partes = interaction.customId.slice('PROP_SAN_APROBAR_'.length).split('_');
    const oidSancionado = partes[0];
    const tipoSancion = partes.slice(1).join('_');

    // Extraer el motivo del embed original
    const embedOriginal = interaction.message.embeds[0];
    const motivoField = embedOriginal.fields.find(f => f.name.includes('Motivo'));
    const propuestoPorField = embedOriginal.fields.find(f => f.name.includes('Propuesto por'));
    if (!motivoField) {
      await interaction.editReply({ content: '❌ No se pudo leer el motivo del reporte.' });
      return;
    }
    const motivo = motivoField.value;
    // Extraer ID del proponente del texto "<@ID>"
    const propuestoPor = propuestoPorField ? (propuestoPorField.value.match(/<@(\d+)>/) || [])[1] : null;

    let member;
    try { member = await interaction.guild.members.fetch(oidSancionado); }
    catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al oficial.' }); return; }

    // Aplicar la sanción — reutilizamos la lógica del /pfa sancionar
    if (!sanciones[oidSancionado]) sanciones[oidSancionado] = { warns: 0, strikes: 0, historial: [] };
    let cantidad = 1;
    let esStrike = false;
    if (tipoSancion === 'warn_1') { cantidad = 1; esStrike = false; }
    else if (tipoSancion === 'warn_2') { cantidad = 2; esStrike = false; }
    else if (tipoSancion === 'strike_1') { cantidad = 1; esStrike = true; }
    else if (tipoSancion === 'strike_2') { cantidad = 2; esStrike = true; }

    let escalaAStrike = false;
    let demoteAuto = null;
    for (let i = 0; i < cantidad; i++) {
      if (esStrike) {
        sanciones[oidSancionado].strikes++;
      } else {
        sanciones[oidSancionado].warns++;
        if (sanciones[oidSancionado].warns >= 3) {
          sanciones[oidSancionado].warns = 0;
          sanciones[oidSancionado].strikes++;
          escalaAStrike = true;
        }
      }
    }
    sanciones[oidSancionado].historial.push({
      tipo: esStrike ? 'strike' : 'warn',
      cantidad,
      motivo,
      sancionadoPor: propuestoPor || interaction.user.id,
      aprobadoPor: interaction.user.id,
      ts: Date.now(),
      origen: 'propuesta_aprobada'
    });

    // Chequear demote auto por 3 strikes
    if (sanciones[oidSancionado].strikes >= 3) {
      sanciones[oidSancionado].historial.push({ tipo: 'pre_demote_auto', motivo: '3er strike alcanzado', ts: Date.now() });
      demoteAuto = await aplicarDemote(member, '3er strike — ' + motivo, interaction.user.id, interaction.guild);
    } else {
      // Aplicar rol de sanción actualizado
      try {
        for (const r of ROLES_SANCION) {
          if (member.roles.cache.has(r)) await member.roles.remove(r, 'Actualización sanción');
        }
        let rolFinal = null;
        if (sanciones[oidSancionado].strikes === 2) rolFinal = ROL_STRIKE_2;
        else if (sanciones[oidSancionado].strikes === 1) rolFinal = ROL_STRIKE_1;
        else if (sanciones[oidSancionado].warns === 2) rolFinal = ROL_WARN_2;
        else if (sanciones[oidSancionado].warns === 1) rolFinal = ROL_WARN_1;
        if (rolFinal) await member.roles.add(rolFinal, 'Sanción aprobada por propuesta');
      } catch (e) { console.error('Error rol sancion propuesta:', e.message); }
    }
    await guardarSanciones();

    // Publicar el embed de sanción en el canal de sanciones (como si fuera manual)
    const tipoTxt = esStrike ? (cantidad > 1 ? cantidad + ' STRIKES' : 'STRIKE') : (cantidad > 1 ? cantidad + ' WARNS' : 'WARN');
    const embedSancion = new EmbedBuilder()
      .setTitle(esStrike ? '⛔ SANCIÓN — ' + tipoTxt : '⚠️ SANCIÓN — ' + tipoTxt)
      .setColor(esStrike ? 0xCC2222 : 0xFFAA00)
      .setThumbnail(member.displayAvatarURL())
      .addFields(
        { name: '👮 Sancionado', value: '<@' + oidSancionado + '>', inline: true },
        { name: '🔨 Sancionado por', value: '<@' + (propuestoPor || interaction.user.id) + '>', inline: true },
        { name: '✅ Aprobado por', value: '<@' + interaction.user.id + '>', inline: true },
        { name: '📝 Motivo', value: motivo, inline: false },
        { name: '📊 Estado actual', value: '⚠️ Warns: **' + sanciones[oidSancionado].warns + '/2**\n⛔ Strikes: **' + sanciones[oidSancionado].strikes + '/2**', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Sistema de Sanciones' });
    try {
      const cSan = await interaction.guild.channels.fetch(CANAL_SANCIONES);
      await cSan.send({ content: '<@' + oidSancionado + '>', embeds: [embedSancion] });
    } catch (e) { console.error('Publicar sancion aprobada:', e.message); }

    // Editar embed original marcando como APROBADA
    const nuevoEmbed = EmbedBuilder.from(embedOriginal)
      .setTitle('✅ SANCIÓN APROBADA')
      .setColor(0x22AA44)
      .addFields({ name: '✅ Aprobada por', value: '<@' + interaction.user.id + '>\n<t:' + Math.floor(Date.now() / 1000) + ':F>', inline: false });
    await interaction.message.edit({ embeds: [nuevoEmbed], components: [] });

    await interaction.editReply({ content: '✅ Sanción aprobada y aplicada. Publicada en <#' + CANAL_SANCIONES + '>.' + (escalaAStrike ? '\n⚠️ Escaló automáticamente a STRIKE por 3er warn.' : '') + (demoteAuto ? '\n🚨 3er strike → demote automático aplicado.' : '') });
    return;
  }

  // Botón DESAPROBAR: solo marca como rechazada
  if (interaction.isButton() && interaction.customId.startsWith('PROP_SAN_RECHAZAR_')) {
    const puedeRechazar = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_SANCIONES);
    if (!puedeRechazar) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Encargado de Sanciones puede rechazar sanciones propuestas.', ephemeral: true });
      return;
    }
    const embedOriginal = interaction.message.embeds[0];
    const nuevoEmbed = EmbedBuilder.from(embedOriginal)
      .setTitle('❌ SANCIÓN DESAPROBADA')
      .setColor(0xCC2222)
      .addFields({ name: '❌ Rechazada por', value: '<@' + interaction.user.id + '>\n<t:' + Math.floor(Date.now() / 1000) + ':F>', inline: false });
    await interaction.update({ embeds: [nuevoEmbed], components: [] });
    return;
  }

  // Botón CORREGIR: abre modal donde el aprobador escribe la corrección
  if (interaction.isButton() && interaction.customId.startsWith('PROP_SAN_CORREGIR_')) {
    const puedeCorregir = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_SANCIONES);
    if (!puedeCorregir) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Encargado de Sanciones puede corregir sanciones propuestas.', ephemeral: true });
      return;
    }
    const modal = new ModalBuilder()
      .setCustomId('PROP_SAN_CORR_MOD_' + interaction.message.id)
      .setTitle('Corregir propuesta de sanción');
    const correccion = new TextInputBuilder()
      .setCustomId('correccion')
      .setLabel('Escribí la corrección/observación')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(5)
      .setMaxLength(800)
      .setRequired(true)
      .setPlaceholder('Ej: El motivo está incompleto, faltan datos del incidente. Revisá y volvé a proponer.');
    modal.addComponents(new ActionRowBuilder().addComponents(correccion));
    await interaction.showModal(modal);
    return;
  }

  // Modal submit de CORRECCIÓN
  if (interaction.isModalSubmit() && interaction.customId.startsWith('PROP_SAN_CORR_MOD_')) {
    const messageId = interaction.customId.slice('PROP_SAN_CORR_MOD_'.length);
    const correccion = interaction.fields.getTextInputValue('correccion');
    try {
      const canal = await interaction.guild.channels.fetch(CANAL_SUP_SANCIONES);
      const msg = await canal.messages.fetch(messageId);
      const embedOriginal = msg.embeds[0];
      const nuevoEmbed = EmbedBuilder.from(embedOriginal)
        .setTitle('✏️ SANCIÓN CON CORRECCIÓN — Esperando ajuste del proponente')
        .setColor(0x3498DB)
        .addFields({ name: '✏️ Corrección del HEAD', value: '**Por:** <@' + interaction.user.id + '>\n' + correccion, inline: false });

      // Extraer los datos originales para reponer botones + botón EDITAR PROPUESTA
      // Buscar el customId de los botones anteriores para preservar oidSancionado y tipo
      let oidSancionado = null;
      let tipoSancion = null;
      if (msg.components && msg.components[0] && msg.components[0].components) {
        for (const c of msg.components[0].components) {
          if (c.customId && c.customId.startsWith('PROP_SAN_APROBAR_')) {
            const partes = c.customId.slice('PROP_SAN_APROBAR_'.length).split('_');
            oidSancionado = partes[0];
            tipoSancion = partes.slice(1).join('_');
            break;
          }
        }
      }
      // Rearmar botones: APROBAR + DESAPROBAR + CORREGIR + EDITAR PROPUESTA
      const componentes = [];
      if (oidSancionado && tipoSancion) {
        const btnAprobar = new ButtonBuilder()
          .setCustomId('PROP_SAN_APROBAR_' + oidSancionado + '_' + tipoSancion)
          .setLabel('APROBAR').setEmoji('✅').setStyle(ButtonStyle.Success);
        const btnRechazar = new ButtonBuilder()
          .setCustomId('PROP_SAN_RECHAZAR_' + oidSancionado)
          .setLabel('DESAPROBAR').setEmoji('❌').setStyle(ButtonStyle.Danger);
        const btnCorregir = new ButtonBuilder()
          .setCustomId('PROP_SAN_CORREGIR_' + oidSancionado)
          .setLabel('CORREGIR').setEmoji('✏️').setStyle(ButtonStyle.Primary);
        const btnEditarProp = new ButtonBuilder()
          .setCustomId('PROP_SAN_EDITAR_' + oidSancionado + '_' + tipoSancion)
          .setLabel('EDITAR PROPUESTA')
          .setEmoji('✏️')
          .setStyle(ButtonStyle.Secondary);
        componentes.push(new ActionRowBuilder().addComponents(btnAprobar, btnRechazar, btnCorregir, btnEditarProp));
      }
      await msg.edit({ embeds: [nuevoEmbed], components: componentes });
    } catch (e) { console.error('Corregir propuesta:', e.message); }
    await interaction.reply({ content: '✅ Corrección agregada al embed. El proponente puede editar su propuesta con el botón "EDITAR PROPUESTA".', ephemeral: true });
    return;
  }

  // Botón EDITAR PROPUESTA: solo el que propuso originalmente puede editar los datos
  if (interaction.isButton() && interaction.customId.startsWith('PROP_SAN_EDITAR_')) {
    const partes = interaction.customId.slice('PROP_SAN_EDITAR_'.length).split('_');
    const oidSancionado = partes[0];
    const tipoSancion = partes.slice(1).join('_');

    // Verificar que quien lo usa sea el proponente original (leído del embed)
    const embedOriginal = interaction.message.embeds[0];
    const propuestoPorField = embedOriginal.fields.find(f => f.name.includes('Propuesto por'));
    const proponenteMatch = propuestoPorField ? (propuestoPorField.value.match(/<@(\d+)>/) || []) : [];
    const proponenteId = proponenteMatch[1];
    if (!proponenteId) {
      await interaction.reply({ content: '❌ No se pudo identificar al proponente original.', ephemeral: true });
      return;
    }
    if (interaction.user.id !== proponenteId && !interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
      await interaction.reply({ content: '❌ Solo el proponente original (<@' + proponenteId + '>) o un HEAD PFA puede editar esta propuesta.', ephemeral: true });
      return;
    }

    // Precargar valores actuales
    const motivoActual = (embedOriginal.fields.find(f => f.name.includes('Motivo')) || {}).value || '';
    const justificacionActual = (embedOriginal.fields.find(f => f.name.includes('Justificación')) || {}).value || '';
    const pruebaActual = (embedOriginal.fields.find(f => f.name.includes('Prueba')) || {}).value || '';
    const nombreICActual = (embedOriginal.fields.find(f => f.name.includes('Nombre IC')) || {}).value || '';
    const discordIdActual = ((embedOriginal.fields.find(f => f.name.includes('Discord ID')) || {}).value || '').replace(/`/g, '');

    const modal = new ModalBuilder()
      .setCustomId('PROP_SAN_EDIT_MOD_' + interaction.message.id + '_' + tipoSancion)
      .setTitle('Editar propuesta de sanción');
    const nombreICF = new TextInputBuilder()
      .setCustomId('nombreIC').setLabel('Nombre IC del sancionado')
      .setStyle(TextInputStyle.Short).setMinLength(2).setMaxLength(100).setRequired(true)
      .setValue(nombreICActual.slice(0, 100));
    const discordIdF = new TextInputBuilder()
      .setCustomId('discordId').setLabel('Discord ID del sancionado')
      .setStyle(TextInputStyle.Short).setMinLength(15).setMaxLength(30).setRequired(true)
      .setValue(discordIdActual.slice(0, 30));
    const motivo = new TextInputBuilder()
      .setCustomId('motivo').setLabel('Motivo (se aplica textual si se aprueba)')
      .setStyle(TextInputStyle.Paragraph).setMinLength(5).setMaxLength(300).setRequired(true)
      .setValue(motivoActual.slice(0, 300));
    const justificacion = new TextInputBuilder()
      .setCustomId('justificacion').setLabel('Justificación (contexto para el HEAD)')
      .setStyle(TextInputStyle.Paragraph).setMinLength(10).setMaxLength(600).setRequired(true)
      .setValue(justificacionActual.slice(0, 600));
    const prueba = new TextInputBuilder()
      .setCustomId('prueba').setLabel('Link de prueba')
      .setStyle(TextInputStyle.Short).setMinLength(5).setMaxLength(300).setRequired(true)
      .setValue(pruebaActual.slice(0, 300));
    modal.addComponents(
      new ActionRowBuilder().addComponents(nombreICF),
      new ActionRowBuilder().addComponents(discordIdF),
      new ActionRowBuilder().addComponents(motivo),
      new ActionRowBuilder().addComponents(justificacion),
      new ActionRowBuilder().addComponents(prueba)
    );
    await interaction.showModal(modal);
    return;
  }

  // Modal submit de EDITAR PROPUESTA
  if (interaction.isModalSubmit() && interaction.customId.startsWith('PROP_SAN_EDIT_MOD_')) {
    const resto = interaction.customId.slice('PROP_SAN_EDIT_MOD_'.length);
    const primerGuion = resto.indexOf('_');
    const messageId = resto.slice(0, primerGuion);
    const tipoSancion = resto.slice(primerGuion + 1);
    const nuevoNombreIC = interaction.fields.getTextInputValue('nombreIC');
    const nuevoDiscordId = interaction.fields.getTextInputValue('discordId');
    const nuevoMotivo = interaction.fields.getTextInputValue('motivo');
    const nuevaJustificacion = interaction.fields.getTextInputValue('justificacion');
    const nuevaPrueba = interaction.fields.getTextInputValue('prueba');
    try {
      const canal = await interaction.guild.channels.fetch(CANAL_SUP_SANCIONES);
      const msg = await canal.messages.fetch(messageId);
      const embedOriginal = msg.embeds[0];

      const nuevoEmbed = EmbedBuilder.from(embedOriginal)
        .setTitle('🔄 SANCIÓN PROPUESTA — Editada, pendiente de aprobación')
        .setColor(0xF39C12);
      const nuevosFields = [];
      for (const f of embedOriginal.fields) {
        if (f.name.includes('Motivo')) {
          nuevosFields.push({ name: '📝 Motivo (se aplicará si se aprueba)', value: nuevoMotivo, inline: false });
        } else if (f.name.includes('Justificación')) {
          nuevosFields.push({ name: '💬 Justificación', value: nuevaJustificacion, inline: false });
        } else if (f.name.includes('Prueba')) {
          nuevosFields.push({ name: '🎬 Prueba', value: nuevaPrueba, inline: false });
        } else if (f.name.includes('Nombre IC')) {
          nuevosFields.push({ name: '🎭 Nombre IC', value: nuevoNombreIC, inline: true });
        } else if (f.name.includes('Discord ID')) {
          nuevosFields.push({ name: '🆔 Discord ID', value: '`' + nuevoDiscordId + '`', inline: true });
        } else {
          nuevosFields.push({ name: f.name, value: f.value, inline: f.inline });
        }
      }
      nuevosFields.push({ name: '🔄 Edición del proponente', value: '**Por:** <@' + interaction.user.id + '>\n<t:' + Math.floor(Date.now() / 1000) + ':F>', inline: false });
      nuevoEmbed.setFields(nuevosFields);
      await msg.edit({ embeds: [nuevoEmbed] });
    } catch (e) { console.error('Editar propuesta:', e.message); }
    await interaction.reply({ content: '✅ Propuesta editada. Los HEAD pueden aprobar, desaprobar o corregir nuevamente.', ephemeral: true });
    return;
  }

  // ==================== BOTONES: PROPUESTAS DE SANCIONES (fin) ====================

  if (interaction.isButton() && interaction.customId.startsWith('POSTULAR_ACEPTAR_')) {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_INSTRUCTOR);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Instructores pueden aceptar postulaciones.', ephemeral: true });
      return;
    }
    const partes = interaction.customId.slice('POSTULAR_ACEPTAR_'.length).split('_');
    const uidPostulante = partes[0];

    await interaction.deferUpdate();
    await registrarDecisionPostulacion(interaction.user.id, 'aceptada');

    // Actualizar embed: color verde + footer con decisor
    try {
      const msg = interaction.message;
      const embedAnterior = msg.embeds[0];
      const embed = EmbedBuilder.from(embedAnterior).setColor(0x22AA44).setFooter({ text: 'Postulación APROBADA por ' + nombreDiscord(interaction) });
      await msg.edit({ content: msg.content, embeds: [embed], components: [] });
    } catch (e) { console.error('Edit postulación aceptada:', e.message); }

    // DM al postulante + asignar roles (Postulación Aprobada + Civil por si no lo tiene)
    let memberPost = null;
    try {
      memberPost = await interaction.guild.members.fetch(uidPostulante);

      // Asignar rol de postulación aprobada
      if (!memberPost.roles.cache.has(ROL_POSTULACION_APROBADA)) {
        try { await memberPost.roles.add(ROL_POSTULACION_APROBADA, 'Postulación aprobada por ' + nombreDiscord(interaction)); }
        catch (e) { console.error('Error rol postulación aprobada:', e.message); }
      }
      // Asegurar que tenga el rol de Civil (por si le falta)
      if (!memberPost.roles.cache.has(ROL_CIVIL)) {
        try { await memberPost.roles.add(ROL_CIVIL, 'Asignación automática al aprobar postulación'); }
        catch (e) { console.error('Error rol civil:', e.message); }
      }

      await memberPost.send({ content: '✅ **¡Tu postulación a la PFA fue APROBADA!**\nFue revisada y aprobada por <@' + interaction.user.id + '>.\n\nUn instructor se va a comunicar con vos para coordinar el examen oral. Mientras tanto, podés ingresar al canal de **Esperando Examen** cuando estés disponible.\n\n_— Sistema de Postulaciones · PFA Kilombo RP_' });
    } catch (e) { /* DM cerrado */ }

    // Anuncio público en canal de resultados
    try {
      const canalResultado = await interaction.guild.channels.fetch(CANAL_RESULTADO_POSTULACIONES);
      await canalResultado.send({
        content: '<@' + uidPostulante + '> Desde el departamento de la Ciudad tenemos el agrado de confirmar que su postulación escrita ha sido aprobada, debe entrar al canal de <#' + CANAL_ESPERANDO + '> para que un instructor le tome el examen oral.',
        allowedMentions: { users: [uidPostulante] }
      });
    } catch (e) { console.error('Anuncio postulación aprobada:', e.message); }

    await interaction.followUp({ content: '✅ Postulación de <@' + uidPostulante + '> aprobada. Le llegó DM al postulante y se publicó el anuncio en <#' + CANAL_RESULTADO_POSTULACIONES + '>.', ephemeral: true });
    return;
  }

  // Botón RECHAZAR postulación → modal pidiendo motivo
  if (interaction.isButton() && interaction.customId.startsWith('POSTULAR_RECHAZAR_')) {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_INSTRUCTOR);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Instructores pueden rechazar postulaciones.', ephemeral: true });
      return;
    }
    const partes = interaction.customId.slice('POSTULAR_RECHAZAR_'.length).split('_');
    const uidPostulante = partes[0];
    const ts = partes[1];

    const modal = new ModalBuilder()
      .setCustomId('POSTULAR_RECHAZO_MOD_' + uidPostulante + '_' + ts)
      .setTitle('Rechazar Postulación');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('motivo').setLabel('Motivo del rechazo').setStyle(TextInputStyle.Paragraph).setMinLength(3).setMaxLength(500).setRequired(true).setPlaceholder('Explicale al postulante por qué fue rechazado.')
      )
    );
    await interaction.showModal(modal);
    return;
  }

  // Submit modal de rechazo → DM + actualiza embed
  if (interaction.isModalSubmit() && interaction.customId.startsWith('POSTULAR_RECHAZO_MOD_')) {
    const partes = interaction.customId.slice('POSTULAR_RECHAZO_MOD_'.length).split('_');
    const uidPostulante = partes[0];
    const motivo = interaction.fields.getTextInputValue('motivo');

    await registrarDecisionPostulacion(interaction.user.id, 'rechazada');

    // Actualizar el mensaje original
    try {
      const canal = await interaction.guild.channels.fetch(CANAL_POSTULACIONES_REVISION);
      const mensajes = await canal.messages.fetch({ limit: 50 });
      const msg = mensajes.find(m => m.components && m.components.length > 0 && m.components[0].components.some(c => c.customId === 'POSTULAR_RECHAZAR_' + uidPostulante + '_' + partes[1]));
      if (msg) {
        const embedAnterior = msg.embeds[0];
        const embed = EmbedBuilder.from(embedAnterior).setColor(0xCC2222).setFooter({ text: 'Postulación RECHAZADA por ' + nombreDiscord(interaction) });
        embed.addFields({ name: 'Motivo del rechazo', value: motivo, inline: false });
        await msg.edit({ content: msg.content, embeds: [embed], components: [] });
      }
    } catch (e) { console.error('Edit postulación rechazada:', e.message); }

    // DM al postulante
    try {
      const memberPost = await interaction.guild.members.fetch(uidPostulante);
      await memberPost.send({ content: '❌ **Tu postulación a la PFA fue RECHAZADA**\nFue revisada y rechazada por <@' + interaction.user.id + '>.\n\n**Motivo:**\n_' + motivo + '_\n\nPodés volver a postularte más adelante si querés.\n\n_— Sistema de Postulaciones · PFA Kilombo RP_' });
    } catch (e) { /* DM cerrado */ }

    await interaction.reply({ content: '❌ Postulación de <@' + uidPostulante + '> rechazada. Le llegó DM al postulante con el motivo.', ephemeral: true });
    return;
  }

  // Select EDITAR_FACT_SEL → modal para editar factura
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('EDITAR_FACT_SEL_')) {
    const oidFact = interaction.customId.slice('EDITAR_FACT_SEL_'.length);
    const factTs = interaction.values[0];
    // Validar permisos: dueño o HEAD
    const esHead = interaction.member.roles.cache.has(ROL_HEAD_PFA);
    if (interaction.user.id !== oidFact && !esHead) {
      await interaction.reply({ content: '❌ Solo el dueño de la factura o HEAD pueden editarla.', ephemeral: true });
      return;
    }
    const fact = (semanaFacturas[oidFact] || { facturas: [] }).facturas.find(f => String(f.ts) === factTs);
    if (!fact) {
      await interaction.reply({ content: '❌ Esa factura ya no existe.', ephemeral: true });
      return;
    }
    const modal = new ModalBuilder()
      .setCustomId('EDITAR_FACT_MOD_' + oidFact + '_' + factTs)
      .setTitle('Editar Factura #' + (fact.n || '?'));
    const txt = new TextInputBuilder()
      .setCustomId('monto')
      .setLabel('Nuevo monto (sin puntos ni comas)')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1).setMaxLength(15)
      .setRequired(true)
      .setValue(String(fact.monto))
      .setPlaceholder('Ej: 150000');
    modal.addComponents(new ActionRowBuilder().addComponents(txt));
    await interaction.showModal(modal);
    return;
  }

  // Modal EDITAR_FACT_MOD → aplicar nuevo monto
  if (interaction.isModalSubmit() && interaction.customId.startsWith('PROPONER_SAN_MOD_')) {
    const partes = interaction.customId.slice('PROPONER_SAN_MOD_'.length).split('_');
    const oidSancionado = partes[0];
    const tipoSancion = partes.slice(1).join('_'); // warn_1, warn_2, strike_1, strike_2
    const nombreIC = interaction.fields.getTextInputValue('nombreIC');
    const discordIdF = interaction.fields.getTextInputValue('discordId');
    const motivo = interaction.fields.getTextInputValue('motivo');
    const justificacion = interaction.fields.getTextInputValue('justificacion');
    const prueba = interaction.fields.getTextInputValue('prueba');

    await interaction.deferReply({ ephemeral: true });

    let sancionado;
    try { sancionado = await interaction.guild.members.fetch(oidSancionado); }
    catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al oficial.' }); return; }

    const tipoTxt = { warn_1: '1 Warn', warn_2: '2 Warns', strike_1: '1 Strike', strike_2: '2 Strikes' }[tipoSancion] || tipoSancion;
    const tipoEmoji = tipoSancion.startsWith('strike') ? '⛔' : '⚠️';

    const embed = new EmbedBuilder()
      .setTitle(tipoEmoji + ' SANCIÓN PROPUESTA — Pendiente de aprobación')
      .setColor(0xF39C12)
      .setThumbnail(sancionado.displayAvatarURL())
      .addFields(
        { name: '👮 Sancionado', value: '<@' + oidSancionado + '>', inline: true },
        { name: '📌 Tipo propuesto', value: tipoEmoji + ' **' + tipoTxt + '**', inline: true },
        { name: '🔨 Propuesto por', value: '<@' + interaction.user.id + '>', inline: true },
        { name: '🎭 Nombre IC', value: nombreIC, inline: true },
        { name: '🆔 Discord ID', value: '`' + discordIdF + '`', inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        { name: '📝 Motivo (se aplicará si se aprueba)', value: motivo, inline: false },
        { name: '💬 Justificación', value: justificacion, inline: false },
        { name: '🎬 Prueba', value: prueba, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Aprobación de Sanciones · ID: PROP-' + Date.now() });

    const btnAprobar = new ButtonBuilder()
      .setCustomId('PROP_SAN_APROBAR_' + oidSancionado + '_' + tipoSancion)
      .setLabel('APROBAR')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success);
    const btnRechazar = new ButtonBuilder()
      .setCustomId('PROP_SAN_RECHAZAR_' + oidSancionado)
      .setLabel('DESAPROBAR')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger);
    const btnCorregir = new ButtonBuilder()
      .setCustomId('PROP_SAN_CORREGIR_' + oidSancionado)
      .setLabel('CORREGIR')
      .setEmoji('✏️')
      .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(btnAprobar, btnRechazar, btnCorregir);

    try {
      const canal = await interaction.guild.channels.fetch(CANAL_SUP_SANCIONES);
      await canal.send({
        content: '<@&' + ROL_SANCIONES + '> · <@&' + ROL_HEAD_PFA + '>',
        embeds: [embed],
        components: [row],
        allowedMentions: { roles: [ROL_SANCIONES, ROL_HEAD_PFA] }
      });
    } catch (e) { console.error('Publicar propuesta sancion:', e.message); }

    await interaction.editReply({ content: '✅ **Propuesta enviada** para aprobación. Los HEAD y Encargado de Sanciones fueron notificados.' });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('REPORTBUG_MODAL_')) {
    const categoria = interaction.customId.slice('REPORTBUG_MODAL_'.length);
    const titulo = interaction.fields.getTextInputValue('titulo');
    const descripcion = interaction.fields.getTextInputValue('descripcion');
    const reproducir = interaction.fields.getTextInputValue('reproducir') || '';
    const nuevoId = reportesBugs.length > 0 ? Math.max(...reportesBugs.map(r => r.id)) + 1 : 1;
    reportesBugs.push({
      id: nuevoId,
      userId: interaction.user.id,
      categoria,
      titulo,
      descripcion,
      reproducir,
      ts: Date.now(),
      resuelto: false
    });
    try { await guardarReportesBugs(); } catch (e) { console.error('Guardar reportes:', e.message); }
    await interaction.reply({
      content: '✅ **Reporte guardado correctamente**\n\n' +
        '**Categoría:** ' + ({ bug_bot: '🐛 Bug del bot', problema_server: '🖥️ Problema del server', sugerencia: '💡 Sugerencia', otro: '📌 Otro' })[categoria] + '\n' +
        '**Título:** ' + titulo + '\n' +
        '**ID:** #' + nuevoId + '\n\n' +
        '_Los Dueños y HEAD van a revisar tu reporte. Gracias por avisar._',
      ephemeral: true
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('EDITAR_FACT_MOD_')) {
    const partes = interaction.customId.slice('EDITAR_FACT_MOD_'.length).split('_');
    const oidFact = partes[0];
    const factTs = partes[1];
    const nuevoMontoStr = interaction.fields.getTextInputValue('monto').trim().replace(/[.,]/g, '');
    const nuevoMonto = parseInt(nuevoMontoStr, 10);
    if (isNaN(nuevoMonto) || nuevoMonto < 0) {
      await interaction.reply({ content: '❌ Monto inválido. Tiene que ser un número entero positivo.', ephemeral: true });
      return;
    }
    const data = semanaFacturas[oidFact];
    if (!data || !data.facturas) { await interaction.reply({ content: '❌ Datos no encontrados.', ephemeral: true }); return; }
    const fact = data.facturas.find(f => String(f.ts) === factTs);
    if (!fact) { await interaction.reply({ content: '❌ Esa factura ya no existe.', ephemeral: true }); return; }

    const montoAnterior = fact.monto;
    const diff = nuevoMonto - montoAnterior;
    fact.monto = nuevoMonto;
    fact.editadoTs = Date.now();
    fact.editadoPor = interaction.user.id;
    fact.montoAnterior = montoAnterior;

    // Recalcular totales
    data.totalMonto = Math.max(0, (data.totalMonto || 0) + diff);
    if (fact.tipo === 'multas') data.multasMonto = Math.max(0, (data.multasMonto || 0) + diff);
    else if (fact.tipo === 'negro') data.negroMonto = Math.max(0, (data.negroMonto || 0) + diff);
    await guardarSemanaFacturas();

    const nuevaPaga = Math.floor(data.totalMonto * 0.5);

    // Log administrativo — solo si un HEAD (o quien sea) edita factura AJENA
    if (interaction.user.id !== oidFact) {
      try {
        const c = await interaction.guild.channels.fetch(CANAL_LOG_FACT_EDIT);
        const embed = new EmbedBuilder()
          .setTitle('✏️ Factura EDITADA por HEAD')
          .setColor(0xF39C12)
          .addFields(
            { name: 'Oficial dueño', value: '<@' + oidFact + '>', inline: true },
            { name: 'Editada por', value: '<@' + interaction.user.id + '>', inline: true },
            { name: 'Tipo', value: fact.tipo === 'multas' ? '🚓 Multa' : '💸 Negro', inline: true },
            { name: 'Monto anterior', value: formatMonto(montoAnterior), inline: true },
            { name: 'Monto nuevo', value: formatMonto(nuevoMonto), inline: true },
            { name: 'Diferencia', value: (diff >= 0 ? '+' : '') + formatMonto(diff), inline: true },
            { name: 'Nuevo total semanal del oficial', value: formatMonto(data.totalMonto) + ' (paga: ' + formatMonto(nuevaPaga) + ')', inline: false }
          )
          .setTimestamp()
          .setFooter({ text: 'H-50 Bot · Log de administración' });
        await c.send({ embeds: [embed] });
      } catch (e) { console.error('Log editar factura HEAD:', e.message); }
    }

    await interaction.reply({ content: '✅ Factura #' + (fact.n || '?') + ' actualizada.\n' +
      '📂 Tipo: ' + (fact.tipo === 'multas' ? '🚓 Multa' : '💸 Negro') + '\n' +
      '💵 Monto anterior: ' + formatMonto(montoAnterior) + '\n' +
      '💵 Monto nuevo: **' + formatMonto(nuevoMonto) + '**\n' +
      '📊 Nuevo total semanal de <@' + oidFact + '>: **' + formatMonto(data.totalMonto) + '** (paga: ' + formatMonto(nuevaPaga) + ')', ephemeral: true });
    return;
  }

  // Select EDITAR_SAN_SEL → modal para editar/anular sancion
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('EDITAR_SAN_SEL_')) {
    const oidSan = interaction.customId.slice('EDITAR_SAN_SEL_'.length);
    const sanTs = parseInt(interaction.values[0], 10);
    const data = sanciones[oidSan];
    const entrada = data ? data.historial.find(h => h.ts === sanTs) : null;
    if (!entrada) {
      await interaction.reply({ content: '❌ Esa sanción ya no existe.', ephemeral: true });
      return;
    }
    // Validar permisos: HEAD o sancionador original
    const esHead = interaction.member.roles.cache.has(ROL_HEAD_PFA);
    if (interaction.user.id !== entrada.sancionadoPor && !esHead) {
      await interaction.reply({ content: '❌ Solo el sancionador original (<@' + entrada.sancionadoPor + '>) o HEAD pueden editar esta sanción.', ephemeral: true });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('EDITAR_SAN_MOD_' + oidSan + '_' + sanTs)
      .setTitle('Editar o Anular Sanción');
    const txt = new TextInputBuilder()
      .setCustomId('motivo')
      .setLabel('Nuevo motivo (o ANULAR para anularla)')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(3).setMaxLength(1000)
      .setRequired(true)
      .setValue(entrada.motivo || '')
      .setPlaceholder('Escribí el nuevo motivo o exactamente "ANULAR" para anular la sanción');
    modal.addComponents(new ActionRowBuilder().addComponents(txt));
    await interaction.showModal(modal);
    return;
  }

  // Modal EDITAR_SAN_MOD → aplicar edicion o anulacion
  if (interaction.isModalSubmit() && interaction.customId.startsWith('EDITAR_SAN_MOD_')) {
    const partes = interaction.customId.slice('EDITAR_SAN_MOD_'.length).split('_');
    const oidSan = partes[0];
    const sanTs = parseInt(partes[1], 10);
    const nuevoTexto = interaction.fields.getTextInputValue('motivo').trim();
    const data = sanciones[oidSan];
    const entrada = data ? data.historial.find(h => h.ts === sanTs) : null;
    if (!entrada) { await interaction.reply({ content: '❌ Esa sanción ya no existe.', ephemeral: true }); return; }

    if (nuevoTexto.toUpperCase() === 'ANULAR') {
      // Anular la sanción (similar a apelación aprobada)
      entrada.apelacionAprobada = true;
      entrada.anuladoPor = interaction.user.id;
      entrada.anuladoTs = Date.now();
      entrada.anuladoMotivo = 'Anulación directa por <@' + interaction.user.id + '>';
      // Recalcular contadores y aplicar roles
      const nuevoEstado = recalcularEstadoSancion(oidSan);
      data.warns = nuevoEstado.warns;
      data.strikes = nuevoEstado.strikes;
      await guardarSanciones();
      try {
        const member = await interaction.guild.members.fetch(oidSan);
        await aplicarRolesSegunEstado(member);
      } catch (e) { console.error('Error rol post-anulacion:', e.message); }

      // Log administrativo
      try {
        const c = await interaction.guild.channels.fetch(CANAL_LOG_SAN_EDIT);
        const embed = new EmbedBuilder()
          .setTitle('🚫 Sanción ANULADA')
          .setColor(0xE74C3C)
          .addFields(
            { name: 'Sancionado', value: '<@' + oidSan + '>', inline: true },
            { name: 'Anulada por', value: '<@' + interaction.user.id + '>', inline: true },
            { name: 'Motivo original', value: entrada.motivo || '_(sin motivo)_', inline: false },
            { name: 'Estado actual', value: '⚠️ ' + data.warns + ' warns · ⛔ ' + data.strikes + ' strikes', inline: false }
          )
          .setTimestamp()
          .setFooter({ text: 'H-50 Bot · Log de administración' });
        await c.send({ embeds: [embed] });
      } catch (e) { console.error('Log anular sancion:', e.message); }

      await interaction.reply({ content: '✅ Sanción **anulada**. Estado actual de <@' + oidSan + '>: ⚠️ ' + data.warns + ' warns · ⛔ ' + data.strikes + ' strikes.', ephemeral: true });
      return;
    }

    // Editar motivo
    const motivoAnterior = entrada.motivo;
    entrada.motivo = nuevoTexto;
    entrada.editadoTs = Date.now();
    entrada.editadoPor = interaction.user.id;
    entrada.motivoAnterior = motivoAnterior;
    await guardarSanciones();

    // Log administrativo
    try {
      const c = await interaction.guild.channels.fetch(CANAL_LOG_SAN_EDIT);
      const embed = new EmbedBuilder()
        .setTitle('✏️ Sanción EDITADA')
        .setColor(0xF39C12)
        .addFields(
          { name: 'Sancionado', value: '<@' + oidSan + '>', inline: true },
          { name: 'Editada por', value: '<@' + interaction.user.id + '>', inline: true },
          { name: 'Motivo anterior', value: motivoAnterior || '_(sin motivo)_', inline: false },
          { name: 'Motivo nuevo', value: nuevoTexto, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Log de administración' });
      await c.send({ embeds: [embed] });
    } catch (e) { console.error('Log editar sancion:', e.message); }

    await interaction.reply({ content: '✅ Motivo de la sanción actualizado.\n\n**Antes:** _' + (motivoAnterior || 'sin motivo') + '_\n**Ahora:** _' + nuevoTexto + '_', ephemeral: true });
    return;
  }

  // Boton asumir ticket
  if (interaction.isButton() && interaction.customId.startsWith('TICKET_')) {
    const puedeAsumir = interaction.member.roles.cache.has(ROL_HIGH) || interaction.member.roles.cache.has(ROL_HEAD_PFA);
    if (!puedeAsumir) {
      await interaction.reply({ content: '❌ Solo los rangos autorizados pueden asumir tickets.', ephemeral: true });
      return;
    }

    const partes = interaction.customId.split('_');
    const categoriaId = partes[1];
    const categoria = CATEGORIAS_TICKETS[categoriaId] || 'Ticket';
    const uid = interaction.user.id;

    if (!registroTickets[uid]) registroTickets[uid] = { total: 0 };
    if (!registroTickets[uid][categoriaId]) registroTickets[uid][categoriaId] = 0;
    registroTickets[uid][categoriaId]++;
    registroTickets[uid].total++;
    await guardarTickets();

    // Marcar como asumido pero NO borrar del registro para que no mande otro boton
    ticketsActivos[interaction.channelId] = { ...ticketsActivos[interaction.channelId], asumido: true, asumidoPor: interaction.user.id };
    try {
      await guardarTicketsActivos();
      console.log('[TICKETS] Canal ' + interaction.channelId + ' marcado como ASUMIDO por ' + interaction.user.tag + ' y guardado en GitHub');
    } catch (e) {
      console.error('[TICKETS] ⚠️ ERROR guardando estado asumido del canal ' + interaction.channelId + ':', e.message);
    }

    // Deshabilitar el boton
    const rowDone = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('TICKET_DONE')
        .setLabel('✅ Asumido por ' + (interaction.member.displayName || interaction.user.username))
        .setStyle(ButtonStyle.Success)
        .setDisabled(true)
    );
    await interaction.update({ components: [rowDone] });
    return;
  }

  // /procesando — paso 2: selección de delitos por categoría
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('PROC_SEL_')) {
    const resto = interaction.customId.slice('PROC_SEL_'.length);
    const corte = resto.lastIndexOf('_');
    const sid = resto.slice(0, corte);
    const cat = resto.slice(corte + 1);
    const sesion = procesandoSesiones[sid];
    if (!sesion) { await interaction.reply({ content: '❌ Esta sesión expiró. Volvé a ejecutar /procesando.', ephemeral: true }); return; }
    if (interaction.user.id !== sesion.userId) { await interaction.reply({ content: '❌ Solo quien inició el registro puede editarlo.', ephemeral: true }); return; }
    sesion.sel[cat] = interaction.values;
    await interaction.deferUpdate();
    return;
  }

  // /procesando — selección de arma(s) incautada(s)
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('PROC_WPN_')) {
    const sid = interaction.customId.slice('PROC_WPN_'.length);
    const sesion = procesandoSesiones[sid];
    if (!sesion) { await interaction.reply({ content: '❌ Esta sesión expiró. Volvé a ejecutar /procesando.', ephemeral: true }); return; }
    if (interaction.user.id !== sesion.userId) { await interaction.reply({ content: '❌ Solo quien inició el registro puede editarlo.', ephemeral: true }); return; }
    sesion.armasSel = interaction.values;
    await interaction.deferUpdate();
    return;
  }

  // /procesando — paso 3: confirmar registro
  if (interaction.isButton() && interaction.customId.startsWith('PROC_OK_')) {
    const sid = interaction.customId.slice('PROC_OK_'.length);
    const sesion = procesandoSesiones[sid];
    if (!sesion) { await interaction.reply({ content: '❌ Esta sesión expiró. Volvé a ejecutar /procesando.', ephemeral: true }); return; }
    if (interaction.user.id !== sesion.userId) { await interaction.reply({ content: '❌ Solo quien inició el registro puede confirmarlo.', ephemeral: true }); return; }

    const elegidos = [];
    let total = 0;
    for (const [cat, data] of Object.entries(DELITOS)) {
      const ids = sesion.sel[cat] || [];
      for (const id of ids) {
        const it = data.items.find(x => x.id === id);
        if (it) { elegidos.push(it); total += it.p; }
      }
    }
    if (elegidos.length === 0) {
      await interaction.reply({ content: '❌ Tenés que seleccionar al menos un delito antes de confirmar.', ephemeral: true });
      return;
    }
    let listaDelitos = elegidos.map(it => '• ' + it.n + ' — ' + (it.p > 0 ? '$' + it.p.toLocaleString('es-AR') : 'A definir')).join('\n');
    if (listaDelitos.length > 1024) listaDelitos = listaDelitos.slice(0, 1021) + '...';

    const armasTxt = (sesion.armasSel && sesion.armasSel.length)
      ? sesion.armasSel.map(id => { const a = ARMAS_PORTABLES.find(x => x.id === id); return a ? a.n : id; }).join(', ')
      : 'Ninguna';

    const embed = new EmbedBuilder()
      .setTitle('\uD83D\uDCCB Registro de Antecedentes')
      .setColor(0x1F3A5F)
      .addFields(
        { name: '\uD83D\uDC64 Ciudadano', value: '```' + sesion.ciudadano + '```', inline: true },
        { name: '\uD83D\uDC6E Oficial', value: '<@' + sesion.oficialId + '>', inline: true },
        { name: '\uD83D\uDD2B Arma(s)', value: '```' + armasTxt + '```', inline: false },
        { name: '\uD83D\uDCC1 Delitos', value: listaDelitos, inline: false },
        { name: '\u2696\uFE0F Meses de condena', value: '```' + sesion.meses + '```', inline: true },
        { name: '\uD83D\uDCB5 Total', value: '```$' + total.toLocaleString('es-AR') + '```', inline: true }
      )
      .setImage(sesion.fotoUrl)
      .setTimestamp()
      .setFooter({ text: 'H-50 \u00b7 PFA Kilombo RP \u00b7 Registrado por ' + nombreDiscord(interaction) });

    await interaction.channel.send({ embeds: [embed] });

    // Contar antecedente para el OFICIAL del registro (el que figura en el embed).
    // BUG corregido: antes decía "session.userId" (variable inexistente -> ReferenceError),
    // por eso los antecedentes NUNCA se contaban y el archivo quedaba siempre vacío.
    const oficialId = sesion.oficialId;
    semanaAntecedentes[oficialId] = (semanaAntecedentes[oficialId] || 0) + 1;
    try { await guardarAntecedentes(); } catch (e) { console.error('[ANTEC] Error guardando antecedentes:', e.message); }

    delete procesandoSesiones[sid];
    await interaction.update({ content: '✅ Registro publicado. Antecedente contado para <@' + oficialId + '>.', components: [] });
    return;
  }

  // ==================== TICKETS V2 — BOTONES Y MODALES ====================
  const tkv2EsStaff = (member, t) => {
    if (!member) return false;
    if (member.roles.cache.has(ROL_DUENOS)) return true;
    const roles = (TKV2_TIERS[t.tierActual] || TKV2_TIERS[1]).ver;
    return roles.some(r => member.roles.cache.has(r));
  };

  // Abrir ticket: click en un botón del panel -> mostrar modal
  if (interaction.isButton() && interaction.customId.startsWith('TKV2_OPEN_')) {
    const tipoKey = interaction.customId.slice('TKV2_OPEN_'.length);
    console.log('[TKV2] OPEN recibido. tipoKey="' + tipoKey + '" existe=' + !!TKV2_TIPOS[tipoKey]);
    if (!TKV2_TIPOS[tipoKey]) { await interaction.reply({ content: 'Categoría no válida (' + tipoKey + ').', ephemeral: true }); return; }
    try {
      await interaction.showModal(tkv2Modal(tipoKey));
      console.log('[TKV2] Modal mostrado OK para ' + tipoKey);
    } catch (e) {
      console.error('[TKV2] showModal ERROR:', e);
      try { await interaction.reply({ content: 'No se pudo abrir el formulario: ' + e.message, ephemeral: true }); } catch (e2) {}
    }
    return;
  }

  // Envío del modal -> crear el ticket
  if (interaction.isModalSubmit() && interaction.customId.startsWith('TKV2_MODAL_')) {
    const tipoKey = interaction.customId.slice('TKV2_MODAL_'.length);
    if (!TKV2_TIPOS[tipoKey]) { await interaction.reply({ content: 'Categoría no válida.', ephemeral: true }); return; }
    await interaction.deferReply({ ephemeral: true });
    const campos = {};
    const g = (id) => { try { return interaction.fields.getTextInputValue(id); } catch (e) { return null; } };
    campos.reportado = g('reportado'); campos.motivo = g('motivo'); campos.pruebas = g('pruebas');
    campos.asunto = g('asunto'); campos.detalle = g('detalle');
    const res = await tkv2CrearTicket(interaction, tipoKey, campos);
    if (res.error) { await interaction.editReply({ content: res.error }); return; }
    const esRep = TKV2_TIPOS[tipoKey].modal === 'reporte';
    await interaction.editReply({ content: (esRep ? 'Tu reporte' : 'Tu ticket') + ' ' + tkv2NumFmt(res.t.num) + ' fue creado: <#' + res.canal.id + '>\nEntrá al canal para seguir la conversación con el personal a cargo.' });
    return;
  }

  // Reclamar ticket
  if (interaction.isButton() && interaction.customId.startsWith('TKV2_CLAIM_')) {
    const t = ticketsV2[interaction.channelId];
    if (!t) { await interaction.reply({ content: 'Este ticket ya no está activo.', ephemeral: true }); return; }
    if (!tkv2EsStaff(interaction.member, t)) { await interaction.reply({ content: 'No tenés permisos para reclamar este ticket.', ephemeral: true }); return; }
    if (t.estado === 'reclamado') { await interaction.reply({ content: 'Este ticket ya fue reclamado por <@' + t.reclamadoPor + '>.', ephemeral: true }); return; }
    t.estado = 'reclamado'; t.reclamadoPor = interaction.user.id; t.reclamadoMs = Date.now();
    // Sumar al contador semanal de tickets (ascensos)
    const uid = interaction.user.id;
    if (!registroTickets[uid]) registroTickets[uid] = { total: 0 };
    registroTickets[uid][t.tipo] = (registroTickets[uid][t.tipo] || 0) + 1;
    registroTickets[uid].total = (registroTickets[uid].total || 0) + 1;
    try { await guardarTickets(); } catch (e) { console.error('[TKV2] guardarTickets claim:', e.message); }
    try { await guardarTicketsV2(); } catch (e) {}
    try { await interaction.update({ embeds: [tkv2EmbedBienvenida(t)], components: [tkv2Botones(t)] }); } catch (e) { console.error('[TKV2] update claim:', e.message); }
    try { await interaction.channel.send({ embeds: [new EmbedBuilder().setColor(0x22AA44).setDescription('Ticket a cargo de <@' + interaction.user.id + '>.')] }); } catch (e) {}
    return;
  }

  // Escalar ticket (sube un nivel de privacidad)
  if (interaction.isButton() && interaction.customId.startsWith('TKV2_ESC_')) {
    const t = ticketsV2[interaction.channelId];
    if (!t) { await interaction.reply({ content: 'Este ticket ya no está activo.', ephemeral: true }); return; }
    if (!tkv2EsStaff(interaction.member, t)) { await interaction.reply({ content: 'No tenés permisos para escalar este ticket.', ephemeral: true }); return; }
    await interaction.deferReply({ ephemeral: true });
    const r = await tkv2Escalar(interaction.channel, t);
    if (!r.ok) { await interaction.editReply({ content: r.msg }); return; }
    try {
      const msg = await interaction.channel.messages.fetch(interaction.message.id).catch(() => null);
      if (msg) await msg.edit({ embeds: [tkv2EmbedBienvenida(t)], components: [tkv2Botones(t)] });
    } catch (e) {}
    try { await interaction.channel.send({ embeds: [new EmbedBuilder().setColor(0xE67E22).setTitle('Ticket escalado').setDescription('Nivel de acceso elevado a: ' + r.tier.nombre + '. El canal se movió a la categoría correspondiente y solo ese personal puede verlo.').setTimestamp()] }); } catch (e) {}
    await interaction.editReply({ content: 'Ticket escalado a: ' + r.tier.nombre });
    return;
  }

  // Cerrar ticket (transcript + borrado)
  if (interaction.isButton() && interaction.customId.startsWith('TKV2_CLOSE_')) {
    const t = ticketsV2[interaction.channelId];
    if (!t) { await interaction.reply({ content: 'Este ticket ya no está activo.', ephemeral: true }); return; }
    const esAutor = !t.esReporte && interaction.user.id === t.autorId;
    if (!tkv2EsStaff(interaction.member, t) && !esAutor) { await interaction.reply({ content: 'No tenés permisos para cerrar este ticket.', ephemeral: true }); return; }
    await interaction.reply({ content: 'Cerrando el ticket y generando el transcript...', ephemeral: true });
    await tkv2CerrarTicket(interaction.channel, t, interaction.user.id);
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const enH50 = async () => { const m = await interaction.guild.members.fetch(interaction.user.id); return m.voice?.channelId === CANAL_H50; };

  // /panel-tickets — publica el panel del Centro de Tickets
  if (interaction.commandName === 'panel-tickets') {
    const puede = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_DUENOS);
    if (!puede) { await interaction.reply({ content: 'Solo HEAD o Dueños pueden publicar el panel.', ephemeral: true }); return; }
    await interaction.deferReply({ ephemeral: true });
    try {
      const canal = await interaction.guild.channels.fetch(TKV2_CANAL_PANEL).catch(() => null);
      if (!canal) { await interaction.editReply({ content: 'No encuentro el canal del panel configurado (' + TKV2_CANAL_PANEL + ').' }); return; }
      await canal.send({ embeds: [tkv2PanelEmbed()], components: tkv2PanelBotones() });
      await interaction.editReply({ content: 'Panel publicado en <#' + TKV2_CANAL_PANEL + '>.' });
    } catch (e) { await interaction.editReply({ content: 'Error publicando el panel: ' + e.message }); }
    return;
  }

  // /anuncio — publicar un embed
  if (interaction.commandName === 'anuncio') {
    const puede = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_DUENOS);
    if (!puede) { await interaction.reply({ content: '❌ Solo HEAD o Dueños pueden publicar anuncios.', ephemeral: true }); return; }
    await interaction.deferReply({ ephemeral: true });
    const titulo = interaction.options.getString('titulo');
    const mensaje = (interaction.options.getString('mensaje') || '').replace(/\\n/g, '\n');
    const canal = interaction.options.getChannel('canal') || interaction.channel;
    const colorKey = interaction.options.getString('color') || 'azul';
    const rol = interaction.options.getRole('tagear');
    const imagen = interaction.options.getAttachment('imagen');
    const colores = { azul: 0x1F3A5F, rojo: 0xC0392B, verde: 0x22AA44, dorado: 0xC9A227, gris: 0x95A5A6, violeta: 0x8E44AD };
    const embed = new EmbedBuilder()
      .setColor(colores[colorKey] || 0x1F3A5F)
      .setAuthor({ name: 'Policía Federal Argentina · H-50' })
      .setTitle(titulo)
      .setDescription(mensaje)
      .setFooter({ text: 'PFA H-50' })
      .setTimestamp();
    if (imagen && imagen.contentType && imagen.contentType.startsWith('image')) embed.setImage(imagen.url);
    try {
      if (!canal || typeof canal.send !== 'function') { await interaction.editReply({ content: 'Ese canal no admite mensajes.' }); return; }
      await canal.send({ content: rol ? '<@&' + rol.id + '>' : undefined, embeds: [embed], allowedMentions: rol ? { roles: [rol.id] } : { parse: [] } });
      await interaction.editReply({ content: '✅ Anuncio publicado en <#' + canal.id + '>.' });
    } catch (e) { await interaction.editReply({ content: 'Error publicando el anuncio: ' + e.message }); }
    return;
  }

  // /estadisticas-tickets
  if (interaction.commandName === 'estadisticas-tickets') {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HEAD_PFA);
    if (!puedeUsar) { await interaction.reply({ content: '❌ Solo HEAD PFA puede usar este comando.', ephemeral: true }); return; }
    const inicio = semanaTicketsInicio.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });
    const hoy = new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });
    const filas = Object.keys(registroTickets).length > 0
      ? Object.entries(registroTickets).map(([uid, d]) => '<@' + uid + '> — 📊 **' + (d.total || 0) + ' total**').join('\n')
      : 'Sin tickets registrados esta semana.';
    const embed = new EmbedBuilder().setTitle('🎫 ESTADÍSTICAS DE TICKETS').setDescription(filas)
      .addFields({ name: '📅 Período', value: inicio + ' → ' + hoy, inline: true })
      .setColor(0x5865F2).setTimestamp().setFooter({ text: 'H50 Bot • Sistema de Tickets' });
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  // /procesando — paso 1: validar y mostrar menús
  if (interaction.commandName === 'procesando') {
    if (interaction.channelId !== CANAL_ANTECEDENTES) {
      await interaction.reply({ content: '\u274c Este comando solo puede usarse en <#' + CANAL_ANTECEDENTES + '>.', ephemeral: true });
      return;
    }
    if (!interaction.member.roles.cache.has(ROL_PFA)) {
      await interaction.reply({ content: '\u274c Solo personal con el rol PFA puede usar este comando.', ephemeral: true });
      return;
    }
    const foto = interaction.options.getAttachment('foto');
    if (!foto.contentType || !foto.contentType.startsWith('image/')) {
      await interaction.reply({ content: '\u274c El archivo adjuntado debe ser una imagen.', ephemeral: true });
      return;
    }

    // Limpiar sesiones viejas (> 15 min)
    const ahoraTs = Date.now();
    for (const k of Object.keys(procesandoSesiones)) {
      if (ahoraTs - (procesandoSesiones[k].ts || 0) > 900000) delete procesandoSesiones[k];
    }

    const sid = interaction.id;
    procesandoSesiones[sid] = {
      userId: interaction.user.id,
      ciudadano: interaction.options.getString('ciudadano'),
      oficialId: interaction.options.getUser('oficial').id,
      armasSel: [],
      meses: interaction.options.getInteger('meses'),
      fotoUrl: foto.url,
      sel: { trafico: [], orden: [], armas: [], graves: [] },
      ts: ahoraTs
    };

    // Fila 1: menú de armas incautadas (multi-selección, opcional)
    const wpnMenu = new StringSelectMenuBuilder()
      .setCustomId('PROC_WPN_' + sid)
      .setPlaceholder('🔫 Arma(s) incautada(s)')
      .setMinValues(0)
      .setMaxValues(ARMAS_PORTABLES.length)
      .addOptions(ARMAS_PORTABLES.map(a => ({ label: a.n, value: a.id })));
    const rows = [new ActionRowBuilder().addComponents(wpnMenu)];

    // Filas 2-5: menús de delitos por categoría
    for (const [cat, data] of Object.entries(DELITOS)) {
      const menu = new StringSelectMenuBuilder()
        .setCustomId('PROC_SEL_' + sid + '_' + cat)
        .setPlaceholder(data.label)
        .setMinValues(0)
        .setMaxValues(data.items.length)
        .addOptions(data.items.map(it => ({
          label: it.n.length > 100 ? it.n.slice(0, 97) + '...' : it.n,
          value: it.id,
          description: it.p > 0 ? '$' + it.p.toLocaleString('es-AR') : 'A definir'
        })));
      rows.push(new ActionRowBuilder().addComponents(menu));
    }

    const btnRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('PROC_OK_' + sid).setLabel('✅ Confirmar registro').setStyle(ButtonStyle.Success)
    );

    // Los 5 menús ocupan las 5 filas máximas; el botón va en un segundo mensaje
    await interaction.reply({
      content: 'Seleccioná el/los arma(s) incautada(s) y los delitos por categoría (podés elegir varios en cada menú). El total se calcula solo.',
      components: rows,
      ephemeral: true
    });
    await interaction.followUp({
      content: 'Cuando termines de seleccionar, tocá **Confirmar registro**.',
      components: [btnRow],
      ephemeral: true
    });
    return;
  }

  // /cerrar-tickets
  if (interaction.commandName === 'cerrar-tickets') {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HEAD_PFA);
    if (!puedeUsar) { await interaction.reply({ content: '❌ Solo HEAD PFA puede usar este comando.', ephemeral: true }); return; }
    const inicio = semanaTicketsInicio.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });
    const hoy = new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });
    const filas = Object.keys(registroTickets).length > 0
      ? Object.entries(registroTickets).map(([uid, d]) => '<@' + uid + '> — 📊 **' + (d.total || 0) + ' total**').join('\n')
      : 'Sin tickets registrados esta semana.';
    const embed = new EmbedBuilder().setTitle('🔒 SEMANA CERRADA — TICKETS').setDescription(filas)
      .addFields({ name: '📅 Período', value: inicio + ' → ' + hoy, inline: true }, { name: '👮 Cerrado por', value: '<@' + interaction.user.id + '>', inline: true })
      .setColor(0xCC2222).setTimestamp().setFooter({ text: 'H50 Bot • Sistema de Tickets' });
    semanaTicketsInicio = new Date(); registroTickets = {};
    await guardarTickets();
    // Publicar en canal ascensos
    try {
      const canalAscensos = await interaction.guild.channels.fetch(CANAL_ASCENSOS);
      await canalAscensos.send({ embeds: [embed] });
    } catch (e) { console.error('Error enviando a ascensos:', e.message); }
    await interaction.reply({ content: '✅ Semana cerrada. Resumen publicado en <#' + CANAL_ASCENSOS + '>.', ephemeral: true });
    return;
  }

  // ==================== /break panel ====================
  if (interaction.commandName === 'break') {
    const sub = interaction.options.getSubcommand();
    if (sub === 'panel') {
      if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
        await interaction.reply({ content: '❌ Solo HEAD PFA puede publicar el panel de break.', ephemeral: true });
        return;
      }
      if (interaction.channelId !== CANAL_BREAK) {
        await interaction.reply({ content: '❌ El panel de break solo se puede publicar en <#' + CANAL_BREAK + '>.', ephemeral: true });
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle('☕ Sistema de Break PFA')
        .setDescription('**¡Sistema de break!**\n\n• **Empezar Break:** Pausá tu fichaje por un máximo de **15 minutos**.\n• **Finalizar Break:** Reanudá tu fichaje.\n• ⚠️ **Importante:** Si no finalizás tu break en 15 minutos, tu fichaje se va a cerrar automáticamente.\n\n**Solo podés usar este sistema si tenés un fichaje abierto.**')
        .setColor(0x8B5CF6)
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · WebStudios AR' });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('BREAK_START').setLabel('☕ Empezar Break').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('BREAK_END').setLabel('✅ Finalizar Break').setStyle(ButtonStyle.Success)
      );
      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }
    return;
  }

  // ==================== /jerarquia ====================
  if (interaction.commandName === 'jerarquia') {
    if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
      await interaction.reply({ content: '❌ Solo HEAD PFA puede publicar la jerarquía.', ephemeral: true });
      return;
    }
    const lowTxt = '• Cadete\n' +
      '• Cabo\n' +
      '• Cabo 1°\n' +
      '• Sargento _(Subdivisión OPCIONAL G.E.O.F o HALCÓN)_\n' +
      '• Sargento 1°\n' +
      '• Teniente _(Rango Instructor OPCIONAL)_\n' +
      '• Teniente 1°\n' +
      '• Teniente Mayor\n' +
      '• Suboficial _(Corrupción fuera de servicio)_\n' +
      '• Suboficial Mayor _(Subdivisión OBLIGATORIA G.E.O.F o HALCÓN)_\n' +
      '• Oficial _(Rango Instructor OBLIGATORIO)_\n' +
      '• Oficial 1° _(Encargado de Fichaje OPCIONAL)_\n' +
      '• Oficial Mayor _(Encargado de Sanciones OPCIONAL)_';

    const highTxt = '• Subinspector _(Corrupción dentro de servicio · Encargado de Fichaje OBLIGATORIO · Ingreso a Subdivisión Armería)_\n' +
      '• Inspector _(Encargado de Sanciones OBLIGATORIO)_\n' +
      '• Inspector Mayor\n' +
      '• Inspector Principal\n' +
      '• Subcoronel\n' +
      '• Coronel\n' +
      '• Coronel Mayor\n' +
      '• Subcomisario\n' +
      '• Comisario _(Ingreso a Ayudante de Head)_\n' +
      '• Comisario Mayor';

    const headTxt = '• Sub Jefe/a\n• Jefe/a\n• Sub Director\n• Director\n• Sub Director/a General\n• Director/a General';

    const notasTxt = '**Ayudante de Head** — Se encarga de Orales del PFA, controlar cosas IC de la facción, errores y demás.\n\n' +
      '**Subdivisión Armería** — Controla el inventario de la facción: compras de vendas, balas y demás.\n\n' +
      '**Subdivisión G.E.O.F** — Rápida acción. Encargada de tener miembros capacitados para asignar helicóptero en robos (posicionar tiradores y demás).\n\n' +
      '**Subdivisión HALCÓN** — Encargada de mantener miembros aptos para tirar latas, posicionar blindados y, lo más importante, tener al menos un Halcón por robo que maneje bien la organización.';

    const embed = new EmbedBuilder()
      .setTitle('🏛️ JERARQUÍA OFICIAL — POLICÍA FEDERAL ARGENTINA')
      .setColor(0x1F3A5F)
      .addFields(
        { name: '👮 LOW PFA', value: lowTxt, inline: false },
        { name: '🎖️ HIGH PFA', value: highTxt, inline: false },
        { name: '⭐ HEAD PFA', value: headTxt, inline: false },
        { name: '📋 Notas y Subdivisiones', value: notasTxt, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · WebStudios AR' });

    await interaction.reply({ embeds: [embed] });
    return;
  }

  // ==================== /guia ====================
  if (interaction.commandName === 'guia') {
    if (!interaction.member.roles.cache.has(ROL_DUENOS)) {
      await interaction.reply({ content: '❌ Solo los Dueños pueden publicar la guía.', ephemeral: true });
      return;
    }
    const tipo = interaction.options.getString('tipo');
    if (tipo === 'staff') {
      const embeds = construirGuiaEmbedsStaff();
      await interaction.reply({ content: '<@&' + ROL_HIGH + '> <@&' + ROL_HEAD_PFA + '> — **Guía de Comandos (Superiores)**', embeds, allowedMentions: { roles: [ROL_HIGH, ROL_HEAD_PFA] } });
    } else {
      const embeds = construirGuiaEmbedsLow();
      await interaction.reply({ content: '<@&' + ROL_LOW_PFA + '> — **Guía de Comandos LOW PFA**', embeds, allowedMentions: { roles: [ROL_LOW_PFA] } });
    }
    return;
  }

  // ==================== /postulaciones-publicar ====================
  if (interaction.commandName === 'postulaciones-publicar') {
    if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
      await interaction.reply({ content: '❌ Solo HEAD PFA puede publicar este mensaje.', ephemeral: true });
      return;
    }
    try {
      const canal = await interaction.guild.channels.fetch(CANAL_POSTULAR);
      const iconUrl = interaction.guild.iconURL({ size: 512 });
      const embed = new EmbedBuilder()
        .setTitle('📋 Postulación a la PFA — Unite a Nuestro Equipo')
        .setColor(0x1F3A5F)
        .setDescription(
          '◆ **¿Te gustaría formar parte de la PFA?**\n\n' +
          '📌 Completá el formulario y postulate para unirte a nuestro equipo de seguridad.\n' +
          '📝 Una vez completada la postulación, nuestros instructores evaluarán tu solicitud.\n' +
          '⚠️ *Asegurate de cumplir con todos los requisitos antes de postularte.*'
        )
        .setFooter({ text: 'H-50 Bot · WebStudios AR · PFA Kilombo RP' });
      if (iconUrl) embed.setThumbnail(iconUrl);
      const boton = new ButtonBuilder()
        .setCustomId('POSTULAR_INICIAR')
        .setLabel('Enviar postulación')
        .setEmoji('📋')
        .setStyle(ButtonStyle.Primary);
      await canal.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(boton)] });
      await interaction.reply({ content: '✅ Mensaje de postulación publicado en <#' + CANAL_POSTULAR + '>.', ephemeral: true });
    } catch (e) {
      console.error('Postulaciones publicar:', e.message);
      await interaction.reply({ content: '❌ Error al publicar: ' + e.message, ephemeral: true });
    }
    return;
  }

  // ==================== /postulaciones-stats ====================
  if (interaction.commandName === 'postulaciones-stats') {
    if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
      await interaction.reply({ content: '❌ Solo HEAD PFA puede ver las estadísticas.', ephemeral: true });
      return;
    }
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    const dias = Object.keys(postulacionesStats).sort().reverse().slice(0, 7); // últimos 7 días
    const statsHoy = postulacionesStats[hoy] || {};
    const staffHoy = Object.keys(statsHoy);

    // Total por staff últimos 7 días (suma)
    const totales = {};
    for (const dia of dias) {
      const data = postulacionesStats[dia] || {};
      for (const uidS of Object.keys(data)) {
        if (!totales[uidS]) totales[uidS] = { aceptadas: 0, rechazadas: 0 };
        totales[uidS].aceptadas += data[uidS].aceptadas || 0;
        totales[uidS].rechazadas += data[uidS].rechazadas || 0;
      }
    }

    let descHoy = '_Sin decisiones registradas hoy._';
    if (staffHoy.length > 0) {
      descHoy = staffHoy.sort((a, b) => (statsHoy[b].aceptadas + statsHoy[b].rechazadas) - (statsHoy[a].aceptadas + statsHoy[a].rechazadas))
        .map(uidS => '<@' + uidS + '> — ✅ **' + statsHoy[uidS].aceptadas + '** aceptadas · ❌ **' + statsHoy[uidS].rechazadas + '** rechazadas').join('\n');
    }

    const arr7 = Object.keys(totales);
    let desc7 = '_Sin decisiones en los últimos 7 días._';
    if (arr7.length > 0) {
      desc7 = arr7.sort((a, b) => (totales[b].aceptadas + totales[b].rechazadas) - (totales[a].aceptadas + totales[a].rechazadas))
        .map(uidS => '<@' + uidS + '> — ✅ **' + totales[uidS].aceptadas + '** · ❌ **' + totales[uidS].rechazadas + '** _(total: ' + (totales[uidS].aceptadas + totales[uidS].rechazadas) + ')_').join('\n');
    }

    const embed = new EmbedBuilder()
      .setTitle('📊 Estadísticas de Postulaciones')
      .setColor(0x1F3A5F)
      .addFields(
        { name: '📅 Hoy (' + hoy + ')', value: descHoy, inline: false },
        { name: '🗓️ Últimos 7 días', value: desc7, inline: false }
      )
      .setTimestamp().setFooter({ text: 'H-50 Bot · Sistema de Postulaciones' });
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (interaction.commandName === 'ingresos') {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_INSTRUCTOR);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Instructores pueden registrar ingresos.', ephemeral: true });
      return;
    }
    if (interaction.channelId !== CANAL_INGRESOS) {
      await interaction.reply({ content: '❌ Este comando solo se puede usar en <#' + CANAL_INGRESOS + '>.', ephemeral: true });
      return;
    }
    const nombreIc = interaction.options.getString('nombre_ic');
    const usuario = interaction.options.getUser('usuario');
    const steam = interaction.options.getString('steam');
    const instructor = interaction.options.getUser('instructor');
    const foto = interaction.options.getAttachment('foto');

    // Validar que la foto sea imagen
    if (!foto.contentType || !foto.contentType.startsWith('image/')) {
      await interaction.reply({ content: '❌ El archivo subido no es una imagen válida.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('📝 Registro de Ingreso')
      .setColor(0x1F3A5F)
      .addFields(
        { name: '👤 Nombre IC', value: nombreIc, inline: true },
        { name: '🆔 Discord', value: '<@' + usuario.id + '>\n`' + usuario.id + '`', inline: true },
        { name: '🏷️ Discord Tag', value: '`' + usuario.username + '`', inline: true },
        { name: '🎮 Steam', value: steam, inline: false },
        { name: '👮 Instructor', value: '<@' + instructor.id + '>', inline: false }
      )
      .setImage(foto.url)
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · WebStudios AR · Registrado por ' + nombreDiscord(interaction) });

    await interaction.reply({ embeds: [embed] });
    return;
  }

  // ==================== /new ====================
  if (interaction.commandName === 'new') {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_INSTRUCTOR);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Instructores pueden dar de alta nuevos PFA.', ephemeral: true });
      return;
    }
    if (interaction.channelId !== CANAL_UPDATES) {
      await interaction.reply({ content: '❌ Este comando solo se puede usar en <#' + CANAL_UPDATES + '>.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const usuario = interaction.options.getUser('usuario');
    let member;
    try { member = await interaction.guild.members.fetch(usuario.id); }
    catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al usuario en el servidor.' }); return; }

    // Sacar TODO lo que tenga y dejarle solo los roles del nuevo PFA
    try {
      await member.roles.set(ROLES_NEW_PFA, 'Alta de nuevo PFA por ' + interaction.user.tag);
    } catch (e) {
      console.error('Error en /new roles.set:', e.message);
      await interaction.editReply({ content: '⚠️ Hubo un error al asignar los roles. Verificá que el bot esté arriba en la jerarquía. Error: ' + e.message });
      return;
    }

    // Mensaje minimalista en updates (sin embed): NEW @user · CIVIL > CADETE
    const mensaje = '**NEW** <@' + usuario.id + '> · **CIVIL > CADETE**';
    try {
      const c = await interaction.guild.channels.fetch(CANAL_UPDATES);
      await c.send({ content: mensaje });
    } catch (e) { console.error('Log /new:', e.message); }

    // Guardar registro de ingreso
    ingresosPFA[usuario.id] = {
      ingresadoPor: interaction.user.id,
      ts: Date.now(),
      comando: 'new',
      rangoInicial: 'Cadete',
      categoria: 'low'
    };
    try { await guardarIngresos(); } catch (e) { console.error('Error guardando ingreso /new:', e.message); }

    await interaction.editReply({ content: '✅ Roles asignados a <@' + usuario.id + '> y update publicado en <#' + CANAL_UPDATES + '>.' });
    return;
  }

  // ==================== /resign ====================
  if (interaction.commandName === 'resign') {
    if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
      await interaction.reply({ content: '❌ Solo HEAD PFA puede procesar bajas voluntarias.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const oficial = interaction.options.getUser('oficial');
    const motivo = interaction.options.getString('motivo') || 'Baja voluntaria';
    let member;
    try { member = await interaction.guild.members.fetch(oficial.id); }
    catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al usuario en el servidor.' }); return; }

    // Detectar rango actual antes de sacárselo (para el mensaje)
    const rangoActual = detectarRango(member);
    const rangoTxt = rangoActual ? rangoActual.nombre.toUpperCase() : 'RANGO';

    // Cerrar fichaje si lo tiene abierto
    if (fichajesActivos[oficial.id]) {
      try {
        const ahoraMs = Date.now();
        const inicio = new Date(fichajesActivos[oficial.id].inicio);
        const multi = fichajesActivos[oficial.id].multiplicador || 1;
        const msReal = ahoraMs - inicio.getTime();
        const ms = Math.floor(msReal * multi);
        if (!semanaFichajes[oficial.id]) semanaFichajes[oficial.id] = { totalMs: 0, sesiones: [] };
        semanaFichajes[oficial.id].sesiones.push({ inicio: inicio.toISOString(), fin: new Date(ahoraMs).toISOString(), msReal, multiplicador: multi, ms, cerradoPor: interaction.user.id, motivo: 'Resign' });
        semanaFichajes[oficial.id].totalMs += ms;
        delete fichajesActivos[oficial.id];
        await guardarFichajesActivos();
        await guardarSemanaFichajes();
      } catch (e) { console.error('Error cerrando fichaje en resign:', e.message); }
    }

    // Sacar TODOS los roles y dejarle solo el rol Civil
    try {
      await member.roles.set([ROL_CIVIL], 'Baja voluntaria procesada por ' + interaction.user.tag);
    } catch (e) {
      console.error('Error en /resign roles.set:', e.message);
      await interaction.editReply({ content: '⚠️ Hubo un error al sacar los roles. Verificá que el bot esté arriba en la jerarquía. Error: ' + e.message });
      return;
    }

    // Mensaje minimalista en updates
    const mensaje = '**RESIGN** <@' + oficial.id + '> · **' + rangoTxt + ' > CIVIL**';
    try {
      const c = await interaction.guild.channels.fetch(CANAL_UPDATES);
      await c.send({ content: mensaje });
    } catch (e) { console.error('Log /resign:', e.message); }

    // DM al ex-PFA agradeciéndole
    try {
      await member.send({ content: '👋 **Tu baja voluntaria fue procesada**\n\nLa PFA recibió y procesó tu pedido de baja. Te agradecemos el tiempo y el esfuerzo que dedicaste a la facción.\n\n**Motivo:** _' + motivo + '_\n\nSi en algún momento querés volver a postularte, podés hacerlo a través del canal <#' + CANAL_POSTULAR + '>.\n\n_— PFA Kilombo RP_' });
    } catch (e) { /* DM cerrado */ }

    // Log detallado en canal dedicado
    try {
      const cLog = await interaction.guild.channels.fetch(CANAL_LOG_RESIGN);
      const embedResign = new EmbedBuilder()
        .setTitle('👋 BAJA VOLUNTARIA (RESIGN)')
        .setColor(0x95A5A6)
        .setThumbnail(member.displayAvatarURL())
        .addFields(
          { name: '👮 Usuario', value: '<@' + oficial.id + '>', inline: false },
          { name: '🆔 Discord ID', value: '`' + oficial.id + '`', inline: false },
          { name: '📅 Fecha del retiro', value: '<t:' + Math.floor(Date.now() / 1000) + ':F>', inline: false },
          { name: '📝 Motivo', value: motivo, inline: false },
          { name: '🔨 Procesada por', value: '<@' + interaction.user.id + '>', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Log de Bajas Voluntarias' });
      await cLog.send({ embeds: [embedResign] });
    } catch (e) { console.error('Log resign canal dedicado:', e.message); }

    // Guardar el resign en el historial de sanciones (para que aparezca en /pfa historial)
    if (!sanciones[oficial.id]) sanciones[oficial.id] = { warns: 0, strikes: 0, historial: [] };
    sanciones[oficial.id].historial.push({
      tipo: 'resign',
      motivo,
      sancionadoPor: interaction.user.id,
      ts: Date.now(),
      rangoAnterior: (detectarRango(member) || {}).nombre || 'desconocido'
    });
    try { await guardarSanciones(); } catch (e) { console.error('Guardar sancion resign:', e.message); }

    await interaction.editReply({ content: '✅ Baja procesada para <@' + oficial.id + '>. Roles removidos, queda como civil, update en <#' + CANAL_UPDATES + '> y log en <#' + CANAL_LOG_RESIGN + '>.' });
    return;
  }

  // ==================== /adv (advertencia por farmeo de horas) ====================
  if (interaction.commandName === 'adv') {
    const puedeUsar = interaction.member.roles.cache.has(ROL_ENCARGADO_FICHAJE) || interaction.member.roles.cache.has(ROL_AUX_FICHAJE) || interaction.member.roles.cache.has(ROL_HEAD_PFA);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo el Encargado de Fichaje, Auxiliar de Fichaje o HEAD PFA puede advertir.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const oficial = interaction.options.getUser('oficial');
    const motivo = interaction.options.getString('motivo') || 'No se lo encontró en voice teniendo actividad como PFA';
    const oid = oficial.id;

    let member;
    try { member = await interaction.guild.members.fetch(oid); }
    catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al usuario en el servidor.' }); return; }

    // Protección: si el oficial es HEAD, solo Dueños pueden advertirlo
    const esOficialHead = member.roles.cache.has(ROL_HEAD_PFA);
    if (esOficialHead && !interaction.member.roles.cache.has(ROL_DUENOS)) {
      await interaction.editReply({ content: '❌ Solo los **Dueños** pueden advertir/cerrar fichaje a un HEAD PFA.' });
      return;
    }

    // Determinar canal de aviso según categoría del oficial
    const esOficialHigh = !esOficialHead && member.roles.cache.has(ROL_HIGH);
    const canalAvisoOficial = esOficialHead ? CANAL_CHAT_HEAD : (esOficialHigh ? CANAL_CHAT_HIGH : CANAL_CHAT_LOW);
    const categoriaOficialTxt = esOficialHead ? 'HEAD' : (esOficialHigh ? 'HIGH' : 'LOW');

    // Cerrar fichaje si tiene abierto
    let cerradoFichaje = false;
    let horasSesionCerrada = 0;
    if (fichajesActivos[oid]) {
      try {
        const ahoraMs = Date.now();
        const inicio = new Date(fichajesActivos[oid].inicio);
        const multi = fichajesActivos[oid].multiplicador || 1;
        const msReal = ahoraMs - inicio.getTime();
        const ms = Math.floor(msReal * multi);
        if (!semanaFichajes[oid]) semanaFichajes[oid] = { totalMs: 0, sesiones: [] };
        semanaFichajes[oid].sesiones.push({ inicio: inicio.toISOString(), fin: new Date(ahoraMs).toISOString(), msReal, multiplicador: multi, ms, cerradoPor: interaction.user.id, motivo: 'Cerrado por advertencia — ' + motivo });
        semanaFichajes[oid].totalMs += ms;
        delete fichajesActivos[oid];
        if (breaksActivos[oid]) { delete breaksActivos[oid]; await guardarBreaks(); }
        await guardarFichajesActivos();
        await guardarSemanaFichajes();
        cerradoFichaje = true;
        horasSesionCerrada = ms;
      } catch (e) { console.error('Error cerrando fichaje en /adv:', e.message); }
    }

    // Inicializar estado si no existe
    if (!advertenciasFichaje[oid]) {
      advertenciasFichaje[oid] = { count: 0, ciclo: 0, historial: [] };
    }
    advertenciasFichaje[oid].count++;
    const numAdvActual = advertenciasFichaje[oid].count;
    const cicloActual = advertenciasFichaje[oid].ciclo;

    // Registrar en historial (persistente, no se puede borrar)
    advertenciasFichaje[oid].historial.push({
      ts: Date.now(),
      ejecutorId: interaction.user.id,
      motivo,
      ciclo: cicloActual,
      numeroEnCiclo: numAdvActual,
      cerradoFichaje
    });

    let warnAutomatico = false;
    let cantidadWarnsAplicados = 0;
    let embedSancion = null;

    if (numAdvActual >= 3) {
      // ===== ESCALACIÓN: 3 ADV → WARN AUTOMÁTICO =====
      const cicloTerminado = cicloActual + 1;
      // Ciclo 1 → 1 warn, Ciclo 2 → 2 warns, Ciclo 3+ → 1 warn (reinicio del sistema)
      cantidadWarnsAplicados = (cicloTerminado === 2) ? 2 : 1;

      // Aplicar warn(s) al sistema de sanciones (con escalación automática a strike)
      if (!sanciones[oid]) sanciones[oid] = { warns: 0, strikes: 0, historial: [] };

      let escalaAStrike = false;
      let demoteAuto = null;
      for (let i = 0; i < cantidadWarnsAplicados; i++) {
        sanciones[oid].warns++;
        if (sanciones[oid].warns >= 3) {
          sanciones[oid].warns = 0;
          sanciones[oid].strikes++;
          escalaAStrike = true;
          sanciones[oid].historial.push({ tipo: 'escalada_strike', motivo: 'Auto-escalación por 3er warn (farmeo automático)', sancionadoPor: interaction.user.id, ts: Date.now() });
        }
      }
      const motivoSancion = 'Farmeo de horas (3 advertencias acumuladas · ciclo #' + cicloTerminado + ')';
      sanciones[oid].historial.push({ tipo: 'warn', cantidad: cantidadWarnsAplicados, motivo: motivoSancion, sancionadoPor: interaction.user.id, ts: Date.now(), auto: true, origen: 'adv_fichaje' });

      // Chequear demote auto por 3 strikes
      if (sanciones[oid].strikes >= 3) {
        sanciones[oid].historial.push({ tipo: 'pre_demote_auto', motivo: '3er strike alcanzado desde farmeo', sancionadoPor: interaction.user.id, ts: Date.now() });
        demoteAuto = await aplicarDemote(member, '3er strike por farmeo — ' + motivoSancion, interaction.user.id, interaction.guild);
      } else {
        // Aplicar rol de sanción actualizado
        try {
          for (const r of ROLES_SANCION) {
            if (member.roles.cache.has(r)) await member.roles.remove(r, 'Actualización de sanción');
          }
          let rolFinal = null;
          if (sanciones[oid].strikes === 2) rolFinal = ROL_STRIKE_2;
          else if (sanciones[oid].strikes === 1) rolFinal = ROL_STRIKE_1;
          else if (sanciones[oid].warns === 2) rolFinal = ROL_WARN_2;
          else if (sanciones[oid].warns === 1) rolFinal = ROL_WARN_1;
          if (rolFinal) await member.roles.add(rolFinal, 'Sanción automática por farmeo');
        } catch (e) { console.error('Error aplicando rol sanción por adv:', e.message); }
      }

      await guardarSanciones();

      // Embed profesional al canal de sanciones (formato idéntico al warn manual)
      const tipoTxt = (cantidadWarnsAplicados > 1 ? cantidadWarnsAplicados + ' WARNS' : 'WARN');
      embedSancion = new EmbedBuilder()
        .setTitle('⚠️ SANCIÓN AUTOMÁTICA — ' + tipoTxt + ' (Farmeo de horas)')
        .setColor(0xFFAA00)
        .setThumbnail(member.displayAvatarURL())
        .addFields(
          { name: '👮 Sancionado', value: '<@' + oid + '>', inline: true },
          { name: '🔨 Aplicado por', value: '<@' + interaction.user.id + '> _(automático)_', inline: true },
          { name: '📝 Motivo', value: motivoSancion, inline: false },
          { name: '📊 Estado actual', value: '⚠️ Warns: **' + sanciones[oid].warns + '/2**\n⛔ Strikes: **' + sanciones[oid].strikes + '/2**', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Sistema de Sanciones Automáticas' });
      try { const c = await interaction.guild.channels.fetch(CANAL_SANCIONES); await c.send({ content: '<@' + oid + '>', embeds: [embedSancion] }); } catch (e) { console.error('Log sanción auto:', e.message); }

      // Reiniciar contador de advertencias e incrementar ciclo
      advertenciasFichaje[oid].count = 0;
      advertenciasFichaje[oid].ciclo = cicloTerminado;
      warnAutomatico = true;
    }

    await guardarAdvertenciasFichaje();

    // ===== EMBED al canal de SUPERVISIÓN FICHAJES =====
    try {
      const cSup = await interaction.guild.channels.fetch(CANAL_ADV_SUPERVISION);
      const advEmbed = new EmbedBuilder()
        .setTitle(warnAutomatico ? '🚨 ADVERTENCIA #3 — SANCIÓN APLICADA' : ('⚠️ ADVERTENCIA #' + numAdvActual + ' de 3'))
        .setColor(warnAutomatico ? 0xCC2222 : (numAdvActual === 2 ? 0xFF8800 : 0xFFCC00))
        .setThumbnail(member.displayAvatarURL())
        .addFields(
          { name: '👮 Oficial advertido', value: '<@' + oid + '>', inline: true },
          { name: '🔨 Advertido por', value: '<@' + interaction.user.id + '>', inline: true },
          { name: '📝 Motivo', value: motivo, inline: false },
          { name: '🕐 Fichaje cerrado', value: cerradoFichaje ? '✅ Sí (tenía fichaje abierto)' : '_No tenía fichaje abierto_', inline: true },
          { name: '📊 Ciclo actual', value: '#' + (warnAutomatico ? advertenciasFichaje[oid].ciclo : cicloActual + 1), inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Supervisión de Fichajes' });
      if (warnAutomatico) {
        advEmbed.addFields({ name: '⚠️ Sanción automática aplicada', value: cantidadWarnsAplicados + ' WARN' + (cantidadWarnsAplicados > 1 ? 'S' : '') + ' aplicado/s al oficial. Ver <#' + CANAL_SANCIONES + '>.', inline: false });
      }
      await cSup.send({ content: '<@' + oid + '>', embeds: [advEmbed] });
    } catch (e) { console.error('Log adv supervisión:', e.message); }

    // ===== AVISO al canal del rango correspondiente (para que el oficial se entere sí o sí) =====
    try {
      const cAviso = await interaction.guild.channels.fetch(canalAvisoOficial);
      let mensajeAviso;
      if (warnAutomatico) {
        mensajeAviso = '🚨 <@' + oid + '> **has recibido tu 3° advertencia por farmeo de horas.**\nSe te aplicó automáticamente **' + cantidadWarnsAplicados + ' WARN' + (cantidadWarnsAplicados > 1 ? 'S' : '') + '** en tu historial de sanciones. Tu fichaje fue cerrado.\nMotivo: _' + motivo + '_';
      } else {
        mensajeAviso = '⚠️ <@' + oid + '> **has recibido una advertencia** (' + numAdvActual + '/3) por parte de <@' + interaction.user.id + '>.\nMotivo: _' + motivo + '_\n' + (cerradoFichaje ? 'Tu fichaje fue cerrado.' : '') + '\nSi acumulás 3 advertencias, se te aplicará automáticamente un WARN.';
      }
      await cAviso.send({ content: mensajeAviso });
    } catch (e) { console.error('Aviso canal rango (' + categoriaOficialTxt + '):', e.message); }

    // Intentar DM (por si tiene abierto)
    try {
      if (warnAutomatico) {
        await member.send({ content: '🚨 **3° advertencia recibida — Sanción automática aplicada**\n\nRecibiste tu 3° advertencia por farmeo de horas. Se te aplicó **' + cantidadWarnsAplicados + ' WARN' + (cantidadWarnsAplicados > 1 ? 'S' : '') + '** en tu historial.\n**Motivo:** _' + motivo + '_\n\nTu fichaje fue cerrado. Ver <#' + CANAL_SANCIONES + '>.' });
      } else {
        await member.send({ content: '⚠️ **Recibiste una advertencia** (' + numAdvActual + '/3)\n\n**Motivo:** _' + motivo + '_\n**Aplicada por:** <@' + interaction.user.id + '>\n' + (cerradoFichaje ? '**Tu fichaje fue cerrado.**\n' : '') + '\nSi acumulás 3 advertencias, se te aplicará automáticamente un WARN.' });
      }
    } catch (e) { /* DM cerrado, ya se avisó al canal LOW */ }

    // Respuesta al ejecutor
    let respuesta;
    if (warnAutomatico) {
      respuesta = '🚨 **3° advertencia aplicada** a <@' + oid + '> _(rango ' + categoriaOficialTxt + ')_. Sanción automática de **' + cantidadWarnsAplicados + ' WARN' + (cantidadWarnsAplicados > 1 ? 'S' : '') + '** aplicada.\n\n📊 Ciclos totales acumulados: #' + advertenciasFichaje[oid].ciclo + '\n📍 Ver <#' + CANAL_SANCIONES + '> y <#' + CANAL_ADV_SUPERVISION + '>.';
    } else {
      respuesta = '⚠️ Advertencia **#' + numAdvActual + '/3** aplicada a <@' + oid + '> _(rango ' + categoriaOficialTxt + ')_.' + (cerradoFichaje ? ' Fichaje cerrado.' : '') + '\n📍 Ver <#' + CANAL_ADV_SUPERVISION + '> y <#' + canalAvisoOficial + '>.';
    }
    await interaction.editReply({ content: respuesta });
    return;
  }

  // ==================== /kcoins ====================
  if (interaction.commandName === 'kcoins') {
    const sub = interaction.options.getSubcommand();

    // ---- /kcoins ranking ----
    if (sub === 'ranking') {
      await interaction.deferReply();
      // Fetch miembros para poder filtrar por rol
      try { await interaction.guild.members.fetch(); } catch (e) { console.error('Fetch members ranking:', e.message); }
      // Filtrar HEAD PFA y Dueños del ranking (solo prueban comandos)
      const entradas = Object.entries(kcoinsData.kcoinsSemana)
        .filter(([uid]) => {
          const m = interaction.guild.members.cache.get(uid);
          if (!m) return true; // si no está en el server, dejalo (raro pero por seguridad)
          if (m.roles.cache.has(ROL_HEAD_PFA)) return false;
          if (m.roles.cache.has(ROL_DUENOS)) return false;
          return true;
        })
        .sort((a, b) => b[1] - a[1]);
      if (entradas.length === 0) {
        await interaction.editReply({ content: '_No hay Kcoins ganados esta semana todavía._' });
        return;
      }
      const inicio = semanaFichajesInicio ? semanaFichajesInicio.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric', month: 'long' }) : '_(desconocido)_';
      const embed = new EmbedBuilder()
        .setTitle('🪙 RANKING DE KCOINS · SEMANAL')
        .setColor(0xF1C40F)
        .setTimestamp()
        .setFooter({ text: kcoinsData.sistemaActivo ? 'H-50 Bot · Sistema Kcoins ACTIVO' : 'H-50 Bot · Sistema Kcoins DESACTIVADO (modo preview)' });

      const medallas = ['🥇', '🥈', '🥉'];
      let lineas = [];
      for (let i = 0; i < entradas.length; i++) {
        const [uid, monto] = entradas[i];
        const jackpots = kcoinsData.jackpotsSemana[uid] || 0;
        const medalla = medallas[i] || '📍';
        const jTxt = jackpots > 0 ? ' 🎰x' + jackpots : '';
        lineas.push(medalla + ' <@' + uid + '> — **' + monto + ' kc** ($' + monto + ')' + jTxt);
      }
      let desc = '_Ranking de todos los PFA que ganaron Kcoins esta semana._\n**Semana desde:** ' + inicio + '\n**Tope semanal global:** ' + kcoinsData.totalSemana + ' / ' + KCOINS_TOPE_SEMANAL_GLOBAL + ' kc' + (kcoinsData.totalSemana >= KCOINS_TOPE_SEMANAL_GLOBAL ? ' _(agotado)_' : '') + '\n\n' + lineas.join('\n');
      if (desc.length > 4000) desc = desc.slice(0, 3990) + '...\n_(lista truncada)_';
      embed.setDescription(desc);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // ---- /kcoins activar (Dueños) ----
    if (sub === 'activar') {
      if (!interaction.member.roles.cache.has(ROL_DUENOS)) {
        await interaction.reply({ content: '❌ Solo los **Dueños** pueden activar el sistema de Kcoins.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      if (kcoinsData.sistemaActivo) {
        await interaction.editReply({ content: '⚠️ El sistema de Kcoins ya está **activo**.' });
        return;
      }
      kcoinsData.sistemaActivo = true;
      await guardarKcoins();

      // Publicar anuncio en canal de anuncios PFA
      const anuncio = '# 🪙 SISTEMA DE KCOINS PFA — ACTIVADO\n\n' +
        '<@&' + ROL_PFA + '> · <@&' + ROL_DUENOS + '>\n\n' +
        '**A partir de este momento, cada factura que registres en el sistema del H-50 Bot te acredita KCOINS.**\n\n' +
        '## ¿Cómo funciona?\n\n' +
        'Cada vez que uses `/facturar`, además del registro habitual vas a ver cuántos Kcoins ganaste con esa factura, y cuánto llevás acumulado en la semana.\n\n' +
        '**Tarifa aleatoria:**\n' +
        '🚓 **Multa** → entre ' + KCOINS_MULTA_MIN + ' y ' + KCOINS_MULTA_MAX + ' Kcoins\n' +
        '💸 **Negro** → entre ' + KCOINS_NEGRO_MIN + ' y ' + KCOINS_NEGRO_MAX + ' Kcoins\n\n' +
        '## 🎰 Bonus JACKPOT\n\n' +
        'En cada factura hay una **posibilidad de cobrar el DOBLE**. Si te toca, se te avisa en el momento. Suerte para todos.\n\n' +
        '## ¿Cuándo cobrás?\n\n' +
        'Los sábados, después de la reunión semanal, **los Dueños** acreditan a cada PFA los Kcoins que ganó esa semana.\n\n' +
        '## Datos importantes\n\n' +
        '• Los Kcoins se resetean cada viernes 23:59 ARG (junto al cierre semanal).\n' +
        '• Hay un tope global de **' + KCOINS_TOPE_SEMANAL_GLOBAL + ' Kcoins por semana** para toda la PFA. Cuando se agota, hasta el próximo viernes no se acredita más — así que el que más produce, más se lleva.\n' +
        '• 1 Kcoin = 1 peso argentino real. Podés canjearlo en la tienda del server.\n\n' +
        '## ¿Por qué?\n\n' +
        'Porque el trabajo bien hecho tiene que tener recompensa real. Este sistema es un incentivo para el que se esfuerza, patrulla, procesa y factura de verdad.\n\n' +
        '**A patrullar. Suerte a todos.**';
      try {
        const c = await interaction.guild.channels.fetch(CANAL_ANUNCIOS_PFA);
        await c.send({ content: anuncio, allowedMentions: { roles: [ROL_PFA, ROL_DUENOS] } });
      } catch (e) { console.error('Anuncio activación kcoins:', e.message); }
      await interaction.editReply({ content: '✅ Sistema de Kcoins **ACTIVADO**. Anuncio publicado en <#' + CANAL_ANUNCIOS_PFA + '>.' });
      return;
    }

    // ---- /kcoins desactivar (Dueños) ----
    if (sub === 'desactivar') {
      if (!interaction.member.roles.cache.has(ROL_DUENOS)) {
        await interaction.reply({ content: '❌ Solo los **Dueños** pueden desactivar el sistema de Kcoins.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      if (!kcoinsData.sistemaActivo) {
        await interaction.editReply({ content: '⚠️ El sistema de Kcoins ya está **desactivado**.' });
        return;
      }
      kcoinsData.sistemaActivo = false;
      await guardarKcoins();
      await interaction.editReply({ content: '✅ Sistema de Kcoins **DESACTIVADO**. Los datos acumulados se mantienen y volverán a contarse cuando se reactive.' });
      return;
    }

    // ---- /kcoins pagar @oficial monto (Dueños) ----
    if (sub === 'pagar') {
      if (!interaction.member.roles.cache.has(ROL_DUENOS)) {
        await interaction.reply({ content: '❌ Solo los **Dueños** pueden registrar pagos de Kcoins.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      const oficial = interaction.options.getUser('oficial');
      const monto = interaction.options.getInteger('monto');
      const oid = oficial.id;
      let member;
      try { member = await interaction.guild.members.fetch(oid); }
      catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al usuario en el servidor.' }); return; }

      kcoinsData.historialPagos.push({
        oid,
        monto,
        ejecutorId: interaction.user.id,
        ts: Date.now()
      });
      await guardarKcoins();

      // Log en canal de pagos
      try {
        const c = await interaction.guild.channels.fetch(CANAL_LOG_PAGOS_KCOINS);
        const embed = new EmbedBuilder()
          .setTitle('🪙 PAGO DE KCOINS')
          .setColor(0xF1C40F)
          .setThumbnail(member.displayAvatarURL())
          .addFields(
            { name: '👮 Oficial', value: '<@' + oid + '>', inline: true },
            { name: '💰 Monto pagado', value: '**' + monto + ' Kcoins** ($' + monto + ')', inline: true },
            { name: '💵 Pagado por', value: '<@' + interaction.user.id + '>', inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'H-50 Bot · Sistema Kcoins · Pago registrado' });
        await c.send({ embeds: [embed] });
      } catch (e) { console.error('Log pago kcoins:', e.message); }

      // DM al oficial
      try {
        await member.send({ content: '🪙 **Recibiste tu pago de Kcoins**\n\n**Monto:** ' + monto + ' Kcoins ($' + monto + ' ARS)\n**Pagado por:** <@' + interaction.user.id + '>\n**Fecha:** <t:' + Math.floor(Date.now() / 1000) + ':F>\n\nPodés canjearlos en la tienda del server. ¡Gracias por tu trabajo!\n\n_— PFA Kilombo RP_' });
      } catch (e) { /* DM cerrado */ }

      await interaction.editReply({ content: '✅ Pago de **' + monto + ' Kcoins** registrado para <@' + oid + '>. Log publicado en <#' + CANAL_LOG_PAGOS_KCOINS + '> y DM enviado.' });
      return;
    }
    return;
  }

  // ==================== /return ====================
  if (interaction.commandName === 'return') {
    const cat = interaction.options.getSubcommand(); // 'low', 'high' o 'head'

    // Permisos según categoría
    const esInstructor = interaction.member.roles.cache.has(ROL_INSTRUCTOR);
    const esHigh = interaction.member.roles.cache.has(ROL_HIGH);
    const esHead = interaction.member.roles.cache.has(ROL_HEAD_PFA);
    const esDueno = interaction.member.roles.cache.has(ROL_DUENOS);

    let puedeUsar = false;
    if (cat === 'low') puedeUsar = esInstructor || esHigh || esHead || esDueno;
    else if (cat === 'high') puedeUsar = esHigh || esHead || esDueno;
    else if (cat === 'head') puedeUsar = esDueno;

    if (!puedeUsar) {
      const permMsg = cat === 'head' ? 'Solo Dueños pueden reincorporar HEAD.' : (cat === 'high' ? 'Solo HIGH, HEAD o Dueños pueden reincorporar HIGH.' : 'Solo Instructor, HIGH, HEAD o Dueños pueden reincorporar LOW.');
      await interaction.reply({ content: '❌ ' + permMsg, ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const oficial = interaction.options.getUser('oficial');
    const rangoId = interaction.options.getString('rango');
    const oid = oficial.id;
    let member;
    try { member = await interaction.guild.members.fetch(oid); }
    catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al usuario en el servidor.' }); return; }

    // Encontrar el objeto de rango
    let rangoObj = null;
    if (cat === 'low') rangoObj = RANGOS_LOW.find(r => r.id === rangoId);
    else if (cat === 'high') rangoObj = RANGOS_HIGH.find(r => r.id === rangoId);
    else if (cat === 'head') rangoObj = RANGOS_HEAD.find(r => r.id === rangoId);
    if (!rangoObj) {
      await interaction.editReply({ content: '❌ Rango no encontrado.' });
      return;
    }

    // Detectar rango anterior (para el mensaje)
    const rangoAnterior = detectarRango(member);
    const rangoAntTxt = rangoAnterior ? rangoAnterior.nombre.toUpperCase() : 'CIVIL';

    // Aplicar roles
    try {
      const rolesFinales = new Set();
      rolesFinales.add(ROL_PFA);
      rolesFinales.add(rangoObj.id);
      // Agregar los roles decorativos/base que reciben todos los PFA (excepto el último que es Cadete específico)
      for (let i = 0; i < ROLES_NEW_PFA.length - 1; i++) {
        rolesFinales.add(ROLES_NEW_PFA[i]);
      }
      if (cat === 'low') {
        rolesFinales.add(ROL_LOW_PFA);
      } else if (cat === 'high') {
        rolesFinales.add(ROL_HIGH);
      } else if (cat === 'head') {
        rolesFinales.add(ROL_HIGH);      // los HEAD también son HIGH
        rolesFinales.add(ROL_HEAD_PFA);
      }
      const rolesQuitar = new Set([
        ROL_CIVIL, ROL_BLACKLIST,
        ROL_WARN_1, ROL_WARN_2, ROL_STRIKE_1, ROL_STRIKE_2,
        ROL_LOW_PFA, ROL_HIGH, ROL_HEAD_PFA,
        ...RANGOS_LOW.map(r => r.id), ...RANGOS_HIGH.map(r => r.id), ...RANGOS_HEAD.map(r => r.id)
      ]);
      for (const [rid] of member.roles.cache) {
        if (rid === interaction.guild.id) continue;
        if (!rolesQuitar.has(rid)) rolesFinales.add(rid);
      }
      await member.roles.set(Array.from(rolesFinales), 'Reincorporación por ' + interaction.user.tag);
    } catch (e) {
      console.error('Error /return:', e.message);
      await interaction.editReply({ content: '⚠️ Hubo un error asignando roles: ' + e.message + '\nVerificá que el bot esté arriba en la jerarquía.' });
      return;
    }

    // Publicar en updates
    const mensaje = '**RETURN** <@' + oid + '> · **' + rangoAntTxt + ' > ' + rangoObj.nombre.toUpperCase() + '**';
    try {
      const c = await interaction.guild.channels.fetch(CANAL_UPDATES);
      await c.send({ content: mensaje });
    } catch (e) { console.error('Log return:', e.message); }

    // Guardar registro de reingreso
    ingresosPFA[oid] = {
      ingresadoPor: interaction.user.id,
      ts: Date.now(),
      comando: 'return',
      rangoInicial: rangoObj.nombre,
      categoria: cat
    };
    try { await guardarIngresos(); } catch (e) { console.error('Error guardando ingreso /return:', e.message); }

    // DM al oficial
    try {
      const catTxt = cat.toUpperCase();
      await member.send({ content: '🎉 **¡Bienvenido/a de vuelta a la PFA!**\n\nTu rango: **' + rangoObj.nombre + '** _(' + catTxt + ')_\n**Reincorporado por:** <@' + interaction.user.id + '>\n\n_— PFA Kilombo RP_' });
    } catch (e) { /* DM cerrado */ }

    await interaction.editReply({ content: '✅ <@' + oid + '> reincorporado como **' + rangoObj.nombre + '** _(' + cat.toUpperCase() + ')_. Update publicado en <#' + CANAL_UPDATES + '>.' });
    return;
  }

  // ==================== /cambiar-nombre ====================
  if (interaction.commandName === 'cambiar-nombre') {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_ENCARGADO_FICHAJE);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Encargado de Fichaje pueden cambiar el nombre.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const oficial = interaction.options.getUser('oficial');
    const categoria = interaction.options.getString('categoria'); // "LOW" o "HIGH"
    const nombreIC = interaction.options.getString('nombre').trim();
    const placa = interaction.options.getInteger('placa');
    const oid = oficial.id;
    let member;
    try { member = await interaction.guild.members.fetch(oid); }
    catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al usuario en el servidor.' }); return; }

    const prefijo = '[' + categoria + ']';

    // Formato final: "[LOW] Nombre - 007" — verificar límite de Discord (32 chars)
    const placaTxt = String(placa).padStart(3, '0');
    let nuevoNick = prefijo + ' ' + nombreIC + ' - ' + placaTxt;
    if (nuevoNick.length > 32) {
      // Recortar el nombre para que entre
      const maxNombre = 32 - (prefijo.length + 1 + 3 + placaTxt.length);
      const nombreRecortado = nombreIC.slice(0, Math.max(1, maxNombre));
      nuevoNick = prefijo + ' ' + nombreRecortado + ' - ' + placaTxt;
    }

    try {
      await member.setNickname(nuevoNick, 'Cambio de apodo por ' + interaction.user.tag);
    } catch (e) {
      console.error('Error setNickname:', e.message);
      let motivo = '';
      if (member.id === interaction.guild.ownerId) {
        motivo = '\n\n⚠️ **Este usuario es el dueño real del servidor.** Discord no permite que un bot cambie el nick del owner, aunque tenga todos los permisos.';
      } else if (e.message.includes('Missing Permissions')) {
        motivo = '\n\nPosibles causas:\n' +
          '1. El usuario tiene un rol MÁS ALTO que el rol del bot (aunque el bot esté arriba en general, si el usuario tiene UN solo rol más alto, falla).\n' +
          '2. Al bot le falta el permiso "**Manage Nicknames**" en su rol.\n' +
          '3. El usuario es el dueño real del servidor (Discord no lo permite).';
      }
      await interaction.editReply({ content: '⚠️ Hubo un error al cambiar el nombre: `' + e.message + '`' + motivo });
      return;
    }
    await interaction.editReply({ content: '✅ Apodo cambiado a **' + nuevoNick + '** para <@' + oid + '>.' });
    return;
  }

  // ==================== /check (placa disponible?) ====================
  if (interaction.commandName === 'check') {
    await interaction.deferReply({ ephemeral: true });
    const placaRaw = interaction.options.getString('placa').trim();
    // Extraer solo los dígitos (soporta formatos: 777, -777, - 777, "77", etc.)
    const soloDigitos = placaRaw.replace(/[^\d]/g, '');
    if (!soloDigitos || soloDigitos.length === 0) {
      await interaction.editReply({ content: '❌ Formato inválido. Usá un número de placa. Ejemplos: `777`, `-777`, `- 777`.' });
      return;
    }
    const placa = parseInt(soloDigitos, 10);
    if (isNaN(placa) || placa < 1 || placa > 9999) {
      await interaction.editReply({ content: '❌ Número de placa fuera de rango. Debe ser entre 1 y 9999.' });
      return;
    }
    const placaTxt = String(placa).padStart(3, '0');

    // Cargar todos los miembros del server
    try {
      await interaction.guild.members.fetch();
    } catch (e) { console.error('Error fetch members /check:', e.message); }

    // Buscar quién tiene esa placa en su nick — formatos aceptados:
    //   "[LOW] Nombre - 123", "[LOW] Nombre - 007", ".pelon (Sub Jefe/a - 007)" etc
    // Reglas: extraer NÚMEROS de la parte final del nombre, después de " - " o dentro del último paréntesis
    const encontrados = [];
    for (const [, m] of interaction.guild.members.cache) {
      if (m.user.bot) continue;
      const nick = m.displayName || m.nickname || m.user.username || '';
      // Extraer todos los números de al menos 1 dígito del nick
      // pero priorizando los que vengan después de " - " o al final entre paréntesis
      const matches = nick.match(/(?:\s-\s|\(.*?)(\d{1,4})(?:\)|$)/);
      if (matches) {
        const num = parseInt(matches[1], 10);
        if (num === placa) encontrados.push({ id: m.id, nick });
      } else {
        // Fallback: buscar cualquier número aislado en el nick
        const allNums = nick.match(/\b(\d{1,4})\b/g) || [];
        for (const n of allNums) {
          if (parseInt(n, 10) === placa) {
            encontrados.push({ id: m.id, nick });
            break;
          }
        }
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('🔍 Chequeo de placa #' + placaTxt)
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Sistema de Placas' });

    if (encontrados.length === 0) {
      embed.setColor(0x22AA44).setDescription('✅ La placa **#' + placaTxt + '** está **DISPONIBLE**.\nNadie en el server la tiene registrada en su apodo.');
    } else {
      embed.setColor(0xCC2222);
      const lista = encontrados.slice(0, 5).map(e => '• <@' + e.id + '> _(' + e.nick + ')_').join('\n');
      const extra = encontrados.length > 5 ? '\n_...y ' + (encontrados.length - 5) + ' más._' : '';
      embed.setDescription('❌ La placa **#' + placaTxt + '** está **OCUPADA**.\n\n**Personas con esa placa:**\n' + lista + extra);
    }
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // ==================== /reportbug (abre modal) ====================
  if (interaction.commandName === 'reportbug') {
    const categoria = interaction.options.getString('categoria');
    const modal = new ModalBuilder()
      .setCustomId('REPORTBUG_MODAL_' + categoria)
      .setTitle('Reportar — ' + ({
        bug_bot: 'Bug del bot',
        problema_server: 'Problema del server',
        sugerencia: 'Sugerencia',
        otro: 'Otro'
      })[categoria]);
    const titulo = new TextInputBuilder()
      .setCustomId('titulo')
      .setLabel('Título breve del reporte')
      .setStyle(TextInputStyle.Short)
      .setMinLength(3)
      .setMaxLength(100)
      .setRequired(true)
      .setPlaceholder('Ej: /facturar no suma kcoins');
    const descripcion = new TextInputBuilder()
      .setCustomId('descripcion')
      .setLabel('Descripción detallada')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setMaxLength(1000)
      .setRequired(true)
      .setPlaceholder('Contá qué pasa, qué esperabas y qué está pasando en cambio.');
    const reproducir = new TextInputBuilder()
      .setCustomId('reproducir')
      .setLabel('Cómo reproducirlo (opcional)')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(0)
      .setMaxLength(500)
      .setRequired(false)
      .setPlaceholder('Pasos para que otro pueda replicar el problema.');
    modal.addComponents(
      new ActionRowBuilder().addComponents(titulo),
      new ActionRowBuilder().addComponents(descripcion),
      new ActionRowBuilder().addComponents(reproducir)
    );
    await interaction.showModal(modal);
    return;
  }

  // ==================== /reportinfo (ver reportes, solo HEAD) ====================
  if (interaction.commandName === 'reportinfo') {
    if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
      await interaction.reply({ content: '❌ Solo HEAD PFA puede ver los reportes.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const filtro = interaction.options.getString('filtro') || 'todos';
    let filtrados = reportesBugs.slice();
    if (filtro === 'abiertos') filtrados = filtrados.filter(r => !r.resuelto);
    else if (filtro === 'resueltos') filtrados = filtrados.filter(r => r.resuelto);
    // Ordenar del más reciente al más viejo
    filtrados.sort((a, b) => b.ts - a.ts);

    if (filtrados.length === 0) {
      await interaction.editReply({ content: '_No hay reportes que coincidan con el filtro._' });
      return;
    }

    const catEmoji = { bug_bot: '🐛', problema_server: '🖥️', sugerencia: '💡', otro: '📌' };
    const catNombre = { bug_bot: 'Bug del bot', problema_server: 'Problema del server', sugerencia: 'Sugerencia', otro: 'Otro' };

    // Mostrar los últimos 10 (para no explotar el embed)
    const mostrar = filtrados.slice(0, 10);
    const embed = new EmbedBuilder()
      .setTitle('📋 Reportes de bugs · ' + ({ todos: 'Todos', abiertos: 'Sin resolver', resueltos: 'Resueltos' })[filtro])
      .setColor(0x2266CC)
      .setDescription('Mostrando **' + mostrar.length + '** de **' + filtrados.length + '** reportes.\n_Se muestran los 10 más recientes._')
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Sistema de reportes' });

    for (const r of mostrar) {
      const emo = catEmoji[r.categoria] || '📌';
      const catTxt = catNombre[r.categoria] || r.categoria;
      const estado = r.resuelto ? '✅ RESUELTO' : '🔴 ABIERTO';
      let valor = '**Categoría:** ' + emo + ' ' + catTxt + ' · ' + estado + '\n' +
        '**Autor:** <@' + r.userId + '>\n' +
        '**Fecha:** <t:' + Math.floor(r.ts / 1000) + ':F>\n' +
        '**Descripción:** ' + (r.descripcion.length > 300 ? r.descripcion.slice(0, 297) + '...' : r.descripcion);
      if (r.reproducir) {
        const rep = r.reproducir.length > 200 ? r.reproducir.slice(0, 197) + '...' : r.reproducir;
        valor += '\n**Reproducir:** ' + rep;
      }
      if (valor.length > 1000) valor = valor.slice(0, 990) + '\n_..._';
      embed.addFields({ name: '#' + r.id + ' · ' + r.titulo, value: valor, inline: false });
    }
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // ==================== /proponer-sancion (abre modal) ====================
  if (interaction.commandName === 'proponer-sancion') {
    // Solo se puede usar en canal específico
    if (interaction.channelId !== CANAL_SUP_SANCIONES) {
      await interaction.reply({ content: '❌ Este comando solo se puede usar en <#' + CANAL_SUP_SANCIONES + '>.', ephemeral: true });
      return;
    }
    // Permisos
    const puedeUsar = interaction.member.roles.cache.has(ROL_SANCIONES) ||
                      interaction.member.roles.cache.has(ROL_AUX_SANCIONES) ||
                      interaction.member.roles.cache.has(ROL_HEAD_PFA);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo Encargado de Sanciones, Auxiliar de Sanciones o HEAD PFA pueden proponer sanciones.', ephemeral: true });
      return;
    }
    const oficial = interaction.options.getUser('oficial');
    const tipo = interaction.options.getString('tipo');

    // Modal con: motivo (aplicado si se aprueba), justificación, link prueba, nombre IC, Discord ID
    const modal = new ModalBuilder()
      .setCustomId('PROPONER_SAN_MOD_' + oficial.id + '_' + tipo)
      .setTitle('Proponer sanción a ' + (oficial.username || 'oficial').slice(0, 20));

    const nombreIC = new TextInputBuilder()
      .setCustomId('nombreIC')
      .setLabel('Nombre IC del sancionado')
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(100)
      .setRequired(true)
      .setPlaceholder('Ej: Chorizo Bondiola');

    const discordIdF = new TextInputBuilder()
      .setCustomId('discordId')
      .setLabel('Discord ID del sancionado')
      .setStyle(TextInputStyle.Short)
      .setMinLength(15)
      .setMaxLength(30)
      .setRequired(true)
      .setValue(oficial.id)
      .setPlaceholder(oficial.id);

    const motivo = new TextInputBuilder()
      .setCustomId('motivo')
      .setLabel('Motivo (se aplica textual si se aprueba)')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(5)
      .setMaxLength(300)
      .setRequired(true)
      .setPlaceholder('Ej: Insultos a un compañero durante servicio.');

    const justificacion = new TextInputBuilder()
      .setCustomId('justificacion')
      .setLabel('Justificación (contexto para el HEAD)')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setMaxLength(600)
      .setRequired(true)
      .setPlaceholder('Explicá qué pasó, cuándo y por qué proponés esta sanción.');

    const prueba = new TextInputBuilder()
      .setCustomId('prueba')
      .setLabel('Link de prueba (Medal, Streamable, etc.)')
      .setStyle(TextInputStyle.Short)
      .setMinLength(5)
      .setMaxLength(300)
      .setRequired(true)
      .setPlaceholder('https://medal.tv/...');

    modal.addComponents(
      new ActionRowBuilder().addComponents(nombreIC),
      new ActionRowBuilder().addComponents(discordIdF),
      new ActionRowBuilder().addComponents(motivo),
      new ActionRowBuilder().addComponents(justificacion),
      new ActionRowBuilder().addComponents(prueba)
    );
    await interaction.showModal(modal);
    return;
  }

  // ==================== /cerrar-canal ====================
  if (interaction.commandName === 'cerrar-canal') {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_DUENOS);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Dueños pueden cerrar canales.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const motivo = interaction.options.getString('motivo') || 'Sin motivo especificado.';
    const canal = interaction.channel;

    try {
      // Bloquear a @everyone (no puede enviar mensajes)
      await canal.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: false,
        AddReactions: false,
        SendMessagesInThreads: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false
      }, { reason: 'Canal cerrado por ' + interaction.user.tag + ' — ' + motivo });

      // Asegurar que HEAD y Dueños sí puedan escribir explícitamente
      await canal.permissionOverwrites.edit(ROL_HEAD_PFA, {
        SendMessages: true,
        AddReactions: true,
        SendMessagesInThreads: true
      }, { reason: 'Permitir HEAD PFA en canal cerrado' });

      await canal.permissionOverwrites.edit(ROL_DUENOS, {
        SendMessages: true,
        AddReactions: true,
        SendMessagesInThreads: true
      }, { reason: 'Permitir Dueños en canal cerrado' });
    } catch (e) {
      console.error('Error cerrar canal:', e.message);
      await interaction.editReply({ content: '⚠️ Error al cerrar el canal: ' + e.message + '\nVerificá que el bot tenga permiso **Manage Channels** y esté arriba en la jerarquía.' });
      return;
    }

    // Publicar embed
    try {
      const embed = new EmbedBuilder()
        .setTitle('🔒 CANAL CERRADO')
        .setColor(0xCC2222)
        .addFields(
          { name: 'Cerrado por', value: '<@' + interaction.user.id + '>', inline: true },
          { name: 'Motivo', value: motivo, inline: false }
        )
        .setDescription('_Este canal fue cerrado. Solo HEAD PFA y Dueños pueden escribir. Se abrirá con `/abrir-canal`._')
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Gestión de Canales' });
      await canal.send({ embeds: [embed] });
    } catch (e) { console.error('Publicar embed cierre canal:', e.message); }

    await interaction.editReply({ content: '✅ Canal cerrado. Solo HEAD PFA y Dueños pueden escribir.' });
    return;
  }

  // ==================== /abrir-canal ====================
  if (interaction.commandName === 'abrir-canal') {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_DUENOS);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Dueños pueden reabrir canales.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const motivo = interaction.options.getString('motivo') || 'Sin motivo especificado.';
    const canal = interaction.channel;

    try {
      // Restablecer permisos de @everyone (borrar el override específico)
      await canal.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: null,
        AddReactions: null,
        SendMessagesInThreads: null,
        CreatePublicThreads: null,
        CreatePrivateThreads: null
      }, { reason: 'Canal reabierto por ' + interaction.user.tag + ' — ' + motivo });
    } catch (e) {
      console.error('Error abrir canal:', e.message);
      await interaction.editReply({ content: '⚠️ Error al abrir el canal: ' + e.message + '\nVerificá que el bot tenga permiso **Manage Channels**.' });
      return;
    }

    // Publicar embed
    try {
      const embed = new EmbedBuilder()
        .setTitle('🔓 CANAL REABIERTO')
        .setColor(0x22AA44)
        .addFields(
          { name: 'Reabierto por', value: '<@' + interaction.user.id + '>', inline: true },
          { name: 'Motivo', value: motivo, inline: false }
        )
        .setDescription('_El canal volvió a estar disponible para todos._')
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Gestión de Canales' });
      await canal.send({ embeds: [embed] });
    } catch (e) { console.error('Publicar embed apertura canal:', e.message); }

    await interaction.editReply({ content: '✅ Canal reabierto. Todos pueden volver a escribir.' });
    return;
  }

  // ==================== /anular-adv ====================
  if (interaction.commandName === 'anular-adv') {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_DUENOS);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo HEAD PFA o Dueños pueden anular advertencias.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const oficial = interaction.options.getUser('oficial');
    const motivoAnul = interaction.options.getString('motivo') || 'Advertencia mal aplicada.';
    const oid = oficial.id;

    let member;
    try { member = await interaction.guild.members.fetch(oid); }
    catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al usuario en el servidor.' }); return; }

    const estado = advertenciasFichaje[oid];
    if (!estado || !estado.historial || estado.historial.length === 0) {
      await interaction.editReply({ content: '❌ <@' + oid + '> no tiene advertencias registradas.' });
      return;
    }

    // Encontrar la última entrada del historial
    const ultimaEntrada = estado.historial[estado.historial.length - 1];
    const eraLaTercera = (ultimaEntrada.numeroEnCiclo === 3);

    let warnAnulado = false;
    let cantidadWarnsAnulados = 0;

    // Caso especial: si era la 3ra (que aplicó warn automático), revertir también el warn
    if (eraLaTercera) {
      // El warn automático se aplicó justo al mismo tiempo. Buscarlo en sanciones.historial
      // por origen 'adv_fichaje' y ts cercano
      if (sanciones[oid] && sanciones[oid].historial) {
        // Filtrar solo entradas de tipo 'warn' o 'escalada_strike' que vengan del sistema de adv
        // Recorrer de más nuevo a más viejo, buscando el warn originado por adv
        for (let i = sanciones[oid].historial.length - 1; i >= 0; i--) {
          const sancEntry = sanciones[oid].historial[i];
          if (sancEntry.origen === 'adv_fichaje' && sancEntry.tipo === 'warn') {
            cantidadWarnsAnulados = sancEntry.cantidad || 1;
            // Restar los warns (revertir contadores)
            for (let j = 0; j < cantidadWarnsAnulados; j++) {
              if (sanciones[oid].warns > 0) {
                sanciones[oid].warns--;
              } else if (sanciones[oid].strikes > 0) {
                // Se había escalado a strike, revertir
                sanciones[oid].strikes--;
                sanciones[oid].warns = 2; // Volver a 2 warns pre-escalación
              }
            }
            // Marcar como anulada
            sanciones[oid].historial[i].anulada = true;
            sanciones[oid].historial[i].anuladaTs = Date.now();
            sanciones[oid].historial[i].anuladaPor = interaction.user.id;
            warnAnulado = true;
            break;
          }
        }
        await guardarSanciones();
        // Actualizar rol de sanción
        try {
          for (const r of ROLES_SANCION) {
            if (member.roles.cache.has(r)) await member.roles.remove(r, 'Anulación de warn por adv mal aplicada');
          }
          let rolFinal = null;
          if (sanciones[oid].strikes >= 2) rolFinal = ROL_STRIKE_2;
          else if (sanciones[oid].strikes === 1) rolFinal = ROL_STRIKE_1;
          else if (sanciones[oid].warns === 2) rolFinal = ROL_WARN_2;
          else if (sanciones[oid].warns === 1) rolFinal = ROL_WARN_1;
          if (rolFinal) await member.roles.add(rolFinal, 'Actualización de sanción tras anulación de adv');
        } catch (e) { console.error('Error rol sancion tras anulacion:', e.message); }
      }
      // Restaurar el estado de advertencias: como era la 3ra que reseteó, hay que volver ciclo -1 y count = 2
      if (estado.ciclo > 0) estado.ciclo--;
      estado.count = 2;
      // Marcar la última entrada como anulada, no eliminarla (para trazabilidad)
      estado.historial[estado.historial.length - 1].anulada = true;
      estado.historial[estado.historial.length - 1].anuladaTs = Date.now();
      estado.historial[estado.historial.length - 1].anuladaPor = interaction.user.id;
    } else {
      // Caso normal: bajar el contador
      if (estado.count > 0) estado.count--;
      // Marcar como anulada
      estado.historial[estado.historial.length - 1].anulada = true;
      estado.historial[estado.historial.length - 1].anuladaTs = Date.now();
      estado.historial[estado.historial.length - 1].anuladaPor = interaction.user.id;
    }

    await guardarAdvertenciasFichaje();

    // Publicar en canal de supervisión de advertencias
    try {
      const cSup = await interaction.guild.channels.fetch(CANAL_ADV_SUPERVISION);
      const embed = new EmbedBuilder()
        .setTitle('🔄 ADVERTENCIA ANULADA')
        .setColor(0x22AA44)
        .setThumbnail(member.displayAvatarURL())
        .addFields(
          { name: '👮 Oficial', value: '<@' + oid + '>', inline: true },
          { name: '🔨 Anulada por', value: '<@' + interaction.user.id + '>', inline: true },
          { name: '📝 Motivo de la anulación', value: motivoAnul, inline: false },
          { name: '📊 Estado actual', value: '⚠️ Advertencias: **' + estado.count + '/3**\n📌 Ciclo: **#' + (estado.ciclo + 1) + '**', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Sistema de Advertencias' });
      if (warnAnulado) {
        embed.addFields({ name: '⚠️ Sanción también revertida', value: cantidadWarnsAnulados + ' WARN' + (cantidadWarnsAnulados > 1 ? 'S' : '') + ' anulado/s automáticamente. Estado sanciones: ⚠️ ' + (sanciones[oid]?.warns || 0) + ' warns · ⛔ ' + (sanciones[oid]?.strikes || 0) + ' strikes.', inline: false });
      }
      await cSup.send({ content: '<@' + oid + '>', embeds: [embed] });
    } catch (e) { console.error('Log anular adv supervisión:', e.message); }

    // DM al oficial
    try {
      await member.send({ content: '🔄 **Advertencia anulada**\n\nUna advertencia que se te había aplicado fue **anulada**.\n**Anulada por:** <@' + interaction.user.id + '>\n**Motivo:** _' + motivoAnul + '_\n' + (warnAnulado ? '\n⚠️ También se te revirtieron **' + cantidadWarnsAnulados + ' WARN' + (cantidadWarnsAnulados > 1 ? 'S' : '') + '** que se habían aplicado automáticamente.' : '') + '\n\n_— PFA Kilombo RP_' });
    } catch (e) { /* DM cerrado */ }

    let respuesta = '✅ Advertencia anulada para <@' + oid + '>. Contador actual: **' + estado.count + '/3**.';
    if (warnAnulado) {
      respuesta += '\n⚠️ También se revirtieron **' + cantidadWarnsAnulados + ' WARN' + (cantidadWarnsAnulados > 1 ? 'S' : '') + '** que se habían aplicado automáticamente.';
    }
    respuesta += '\n📍 Ver <#' + CANAL_ADV_SUPERVISION + '>.';
    await interaction.editReply({ content: respuesta });
    return;
  }

  if (interaction.commandName === 'secuestro') {
    if (!await enH50()) { await interaction.reply({ content: '❌ Solo podés usar este comando desde el canal **H-50**.', ephemeral: true }); return; }
    await interaction.deferReply({ ephemeral: true });
    const todos = interaction.guild.voiceStates.cache
      .filter(vs => vs.channelId !== CANAL_H50 && vs.channelId !== CANAL_SECUESTRO && vs.member && !vs.member.user.bot)
      .map(vs => vs.member);
    if (todos.length === 0) { await interaction.editReply({ content: '❌ No hay personal disponible.' }); return; }
    const movidos = [], errores = [];
    for (const p of todos) { try { await p.voice.setChannel(CANAL_SECUESTRO); movidos.push(p); } catch (e) { errores.push(p.displayName); } }
    const embed = new EmbedBuilder().setTitle('🚨 SECUESTRO — TODO EL PERSONAL')
      .setDescription('Se movió a todo el personal al canal de Secuestro.')
      .addFields({ name: '👮 Personal movilizado', value: movidos.map(m => '<@' + m.id + '>').join('\n') || 'Ninguno', inline: false }, { name: '📊 Total', value: movidos.length + ' agentes', inline: true }, { name: '👮 Ejecutado por', value: '<@' + interaction.user.id + '>', inline: true })
      .setColor(0xCC0000).setTimestamp().setFooter({ text: 'H50 Bot • Sistema de Asignación' });
    if (errores.length > 0) embed.addFields({ name: '⚠️ No se pudieron mover', value: errores.join(', '), inline: false });
    await enviarLog(interaction.guild, embed);
    await interaction.editReply({ content: '🚨 Secuestro activado. Ver <#' + CANAL_LOGS + '>.' });
    return;
  }

  // /patrullar
  if (interaction.commandName === 'patrullar') {
    if (!await enH50()) { await interaction.reply({ content: '❌ Solo podés usar este comando desde el canal **H-50**.', ephemeral: true }); return; }
    await interaction.deferReply({ ephemeral: true });
    const enEspera = interaction.guild.voiceStates.cache
      .filter(vs => vs.channelId === CANAL_ESPERANDO && vs.member && !vs.member.user.bot).map(vs => vs.member);
    if (enEspera.length < 2) { await interaction.editReply({ content: '❌ Se necesitan al menos **2** personas en Esperando Asignación.' }); return; }
    const shuffled = enEspera.sort(() => Math.random() - 0.5);
    const maxCanales = Math.min(Math.floor(shuffled.length / 2), CANALES_PATRULLA.length);
    const canalesAUsar = CANALES_PATRULLA.slice(0, maxCanales);
    const base = Math.floor(shuffled.length / maxCanales), extras = shuffled.length % maxCanales;
    const grupos = []; let idx = 0;
    for (let i = 0; i < maxCanales; i++) { const n = base + (i < extras ? 1 : 0); grupos.push(shuffled.slice(idx, idx + n)); idx += n; }
    const movidos = [], errores = [];
    for (let i = 0; i < grupos.length; i++) for (const p of grupos[i]) { try { await p.voice.setChannel(canalesAUsar[i]); movidos.push(p); } catch (e) { errores.push(p.displayName); } }
    const descripcion = grupos.map((g, i) => '**Patrulla ' + (i+1) + '** (' + g.length + '): ' + g.map(m => '<@' + m.id + '>').join(', ')).join('\n');
    const embed = new EmbedBuilder().setTitle('🚔 PATRULLA ASIGNADA').setDescription(descripcion)
      .addFields({ name: '📊 Total', value: movidos.length + ' agentes en ' + maxCanales + ' grupos', inline: true }, { name: '👮 Ejecutado por', value: '<@' + interaction.user.id + '>', inline: true })
      .setColor(0x2266CC).setTimestamp().setFooter({ text: 'H50 Bot • Sistema de Asignación' });
    if (errores.length > 0) embed.addFields({ name: '⚠️ No se pudieron mover', value: errores.join(', '), inline: false });
    await enviarLog(interaction.guild, embed);
    await interaction.editReply({ content: '✅ Patrulla asignada. Ver <#' + CANAL_LOGS + '>.' });
    return;
  }

  // /liberar
  if (interaction.commandName === 'liberar') {
    if (!await enH50()) { await interaction.reply({ content: '❌ Solo podés usar este comando desde el canal **H-50**.', ephemeral: true }); return; }
    await interaction.deferReply({ ephemeral: true });
    const roboKey = interaction.options.getString('robo');
    const canalALiberar = roboKey === 'secuestro_canal' ? CANAL_SECUESTRO : ROBOS[roboKey]?.canal;
    const nombreALiberar = roboKey === 'secuestro_canal' ? 'Secuestro' : ROBOS[roboKey]?.nombre;
    const enCanal = interaction.guild.voiceStates.cache.filter(vs => vs.channelId === canalALiberar && vs.member && !vs.member.user.bot).map(vs => vs.member);
    if (enCanal.length === 0) { await interaction.editReply({ content: '❌ No hay nadie en el canal de **' + nombreALiberar + '**.' }); return; }
    const movidos = [], errores = [];
    for (const p of enCanal) { try { await p.voice.setChannel(CANALES_INDIVIDUALES[0]); movidos.push(p); } catch (e) { errores.push(p.displayName); } }
    delete origenPersonal[canalALiberar];
    // Borrar el estado del canal
    try { const ch = await interaction.guild.channels.fetch(canalALiberar); await ch.setStatus(''); } catch (e) {}
    const embed = new EmbedBuilder().setTitle('✅ LIBERADOS — ' + nombreALiberar.toUpperCase())
      .setDescription('Personal devuelto a **Esperando Asignación**.')
      .addFields({ name: '👮 Personal liberado', value: movidos.map(m => '<@' + m.id + '>').join('\n') || 'Ninguno', inline: false }, { name: '👮 Ejecutado por', value: '<@' + interaction.user.id + '>', inline: true })
      .setColor(0x00CC66).setTimestamp().setFooter({ text: 'H50 Bot • Sistema de Asignación' });
    if (errores.length > 0) embed.addFields({ name: '⚠️ No se pudieron mover', value: errores.join(', '), inline: false });
    await enviarLog(interaction.guild, embed);
    await interaction.editReply({ content: '✅ Personal liberado. Ver <#' + CANAL_LOGS + '>.' });
    return;
  }

  // /cancelar
  if (interaction.commandName === 'cancelar') {
    if (!await enH50()) { await interaction.reply({ content: '❌ Solo podés usar este comando desde el canal **H-50**.', ephemeral: true }); return; }
    await interaction.deferReply({ ephemeral: true });
    const roboKey = interaction.options.getString('robo');
    const canalALiberar = roboKey === 'secuestro_canal' ? CANAL_SECUESTRO : ROBOS[roboKey]?.canal;
    const nombreALiberar = roboKey === 'secuestro_canal' ? 'Secuestro' : ROBOS[roboKey]?.nombre;
    const enCanal = interaction.guild.voiceStates.cache.filter(vs => vs.channelId === canalALiberar && vs.member && !vs.member.user.bot).map(vs => vs.member);
    if (enCanal.length === 0) { await interaction.editReply({ content: '❌ No hay nadie en el canal de **' + nombreALiberar + '**.' }); return; }
    const origenes = origenPersonal[canalALiberar] || {};
    const movidos = [], errores = [];
    for (const p of enCanal) {
      const orig = origenes[p.id] || CANALES_INDIVIDUALES[0];
      try { await p.voice.setChannel(orig); movidos.push({ p, orig }); } catch (e) { errores.push(p.displayName); }
    }
    delete origenPersonal[canalALiberar];
    // Borrar el estado del canal
    try { const ch = await interaction.guild.channels.fetch(canalALiberar); await ch.setStatus(''); } catch (e) {}
    const embed = new EmbedBuilder().setTitle('↩️ CANCELADO — ' + nombreALiberar.toUpperCase())
      .setDescription('Robo cancelado. Personal devuelto a su canal de origen.')
      .addFields({ name: '👮 Personal devuelto', value: movidos.map(({ p, orig }) => '<@' + p.id + '> → <#' + orig + '>').join('\n') || 'Ninguno', inline: false }, { name: '👮 Ejecutado por', value: '<@' + interaction.user.id + '>', inline: true })
      .setColor(0xFFAA00).setTimestamp().setFooter({ text: 'H50 Bot • Sistema de Asignación' });
    if (errores.length > 0) embed.addFields({ name: '⚠️ No se pudieron mover', value: errores.join(', '), inline: false });
    await enviarLog(interaction.guild, embed);
    await interaction.editReply({ content: '↩️ Personal devuelto. Ver <#' + CANAL_LOGS + '>.' });
    return;
  }

  // ==================== /inactivos ====================
  if (interaction.commandName === 'inactivos') {
    if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
      await interaction.reply({ content: '❌ Solo HEAD PFA puede ver el listado de inactivos.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    await guild.members.fetch();

    // Agrupar inactivos por rango
    const grupos = {};
    let totalInactivos = 0;

    for (const [, member] of guild.members.cache) {
      if (member.user.bot) continue;
      const rango = detectarRango(member);
      if (!rango) continue;
      const uid = member.id;

      const horasMs = (semanaFichajes[uid] || {}).totalMs || 0;
      const antec = semanaAntecedentes[uid] || 0;
      const facturas = (semanaFacturas[uid] || {}).totalCount || 0;
      const tickets = (registroTickets[uid] || {}).total || 0;
      const tieneFichajeAbierto = !!fichajesActivos[uid];

      // Inactivo: cero en todo, Y no tiene ausencia aprobada activa
      if (horasMs === 0 && antec === 0 && facturas === 0 && tickets === 0 && !tieneFichajeAbierto && !tieneAusenciaActiva(uid)) {
        const key = rango.categoria + '-' + rango.indice;
        if (!grupos[key]) grupos[key] = { rango, miembros: [] };
        const dias = diasDesdeUltimoAscenso(uid);
        const desdeTxt = dias === Infinity ? 'sin registro' : 'hace ' + dias + 'd';
        grupos[key].miembros.push({ uid, desdeTxt });
        totalInactivos++;
      }
    }

    if (totalInactivos === 0) {
      await interaction.editReply({ content: '✅ **Sin inactivos** — todos los PFAs registrados tuvieron actividad esta semana.' });
      return;
    }

    const inicioStr = semanaFichajesInicio.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });
    const hoyStr = new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });

    const embedLow = new EmbedBuilder()
      .setTitle('🚫 PFAs Inactivos — LOW')
      .setColor(0xCC2222)
      .setDescription('Sin fichajes, antecedentes, facturas ni tickets en la semana.\n📅 Período: ' + inicioStr + ' → ' + hoyStr)
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Control de Actividad' });

    const embedHigh = new EmbedBuilder()
      .setTitle('🚫 PFAs Inactivos — HIGH')
      .setColor(0xCC2222)
      .setDescription('Sin fichajes, antecedentes, facturas ni tickets en la semana.\n📅 Período: ' + inicioStr + ' → ' + hoyStr)
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Control de Actividad' });

    const lineaMiembro = (m) => '<@' + m.uid + '> _(último ascenso: ' + m.desdeTxt + ')_';

    let countLow = 0, countHigh = 0;
    for (let i = RANGOS_LOW.length - 1; i >= 0; i--) {
      const key = 'low-' + i;
      if (!grupos[key]) continue;
      let valor = grupos[key].miembros.map(lineaMiembro).join('\n');
      if (valor.length > 1024) valor = valor.slice(0, 1021) + '...';
      embedLow.addFields({ name: '👮 ' + RANGOS_LOW[i].nombre + ' (' + grupos[key].miembros.length + ')', value: valor, inline: false });
      countLow += grupos[key].miembros.length;
    }
    for (let i = RANGOS_HIGH.length - 1; i >= 0; i--) {
      const key = 'high-' + i;
      if (!grupos[key]) continue;
      let valor = grupos[key].miembros.map(lineaMiembro).join('\n');
      if (valor.length > 1024) valor = valor.slice(0, 1021) + '...';
      embedHigh.addFields({ name: '🎖️ ' + RANGOS_HIGH[i].nombre + ' (' + grupos[key].miembros.length + ')', value: valor, inline: false });
      countHigh += grupos[key].miembros.length;
    }

    const embeds = [];
    if (countLow > 0) embeds.push(embedLow);
    if (countHigh > 0) embeds.push(embedHigh);

    await interaction.editReply({ content: '⚠️ **' + totalInactivos + ' inactivos** detectados (' + countLow + ' LOW · ' + countHigh + ' HIGH).', embeds });
    return;
  }

  // ==================== /semana ====================
  if (interaction.commandName === 'semana') {
    const puede = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_HIGH) || interaction.member.roles.cache.has(ROL_DUENOS);
    if (!puede) { await interaction.reply({ content: '❌ Solo HIGH, HEAD o Dueños pueden ver la semana cerrada.', ephemeral: true }); return; }
    await interaction.deferReply({ ephemeral: true });
    try {
      if (!haySemanaCerrada()) {
        await interaction.editReply({ content: 'Todavía no hay una semana cerrada registrada. Aparece después del primer cierre semanal (viernes 23:59).' });
        return;
      }
      const guild = interaction.guild;
      await guild.members.fetch();
      const uids = new Set();
      if (semanaAnteriorFull && semanaAnteriorFull.datos) Object.keys(semanaAnteriorFull.datos).forEach(u => uids.add(u));
      Object.keys(semanaAnteriorFichajes).forEach(u => uids.add(u));

      const grupos = {};
      const sinRango = [];
      let totHs = 0, totFact = 0, totPaga = 0, totTickets = 0, totAntec = 0;
      for (const uid of uids) {
        const m = metricasSemanaCerrada(uid);
        totHs += m.horasMs; totFact += m.monto; totPaga += Math.floor(m.monto * 0.5); totTickets += m.tickets; totAntec += m.antec;
        const member = guild.members.cache.get(uid);
        const rango = member ? detectarRango(member) : null;
        const nombre = member ? '<@' + uid + '>' : ('ID ' + uid);
        const linea = nombre + ' — ⏱️ ' + formatDuracion(m.horasMs) + ' · 📄 ' + m.antec + ' · 🎫 ' + m.tickets + ' · 💰 ' + formatMonto(m.monto);
        if (!rango) { sinRango.push({ linea, horasMs: m.horasMs }); continue; }
        const key = rango.categoria + '-' + String(rango.indice).padStart(2, '0');
        if (!grupos[key]) grupos[key] = { rango, lineas: [] };
        grupos[key].lineas.push({ linea, horasMs: m.horasMs });
      }

      let periodo = '';
      if (semanaAnteriorFull && semanaAnteriorFull.inicioISO) {
        const i = new Date(semanaAnteriorFull.inicioISO).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit' });
        const f = new Date(semanaAnteriorFull.finISO).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit' });
        periodo = i + ' → ' + f;
      }
      const soloHoras = !(semanaAnteriorFull && semanaAnteriorFull.datos);

      const embed = new EmbedBuilder()
        .setTitle('📅 SEMANA CERRADA — PFA' + (periodo ? ' · ' + periodo : ''))
        .setColor(0x1F3A5F)
        .setFooter({ text: 'H-50 Bot · Datos de la semana pasada · formato: ⏱️ horas · 📄 antec · 🎫 tickets · 💰 facturado' })
        .setTimestamp();
      if (soloHoras) embed.setDescription('⚠️ De esta semana cerrada solo se guardaron las **horas** (antec/tickets/facturado figuran en 0 hasta recuperarlos o hasta el próximo cierre).');

      // Orden: HIGH primero (rango más alto arriba), después LOW; dentro, por índice desc
      const keys = Object.keys(grupos).sort((a, b) => {
        const [ca, ia] = a.split('-'); const [cb, ib] = b.split('-');
        if (ca !== cb) return ca === 'high' ? -1 : 1;
        return parseInt(ib) - parseInt(ia);
      });
      let charCount = (embed.data.description || '').length + 200;
      let fields = 0;
      let omitidos = 0;
      for (const key of keys) {
        const g = grupos[key];
        g.lineas.sort((a, b) => b.horasMs - a.horasMs);
        let val = g.lineas.map(l => l.linea).join('\n');
        if (val.length > 1024) val = val.slice(0, 1000) + '\n… (recortado)';
        const nombreCampo = g.rango.nombre.toUpperCase() + ' (' + g.lineas.length + ')';
        if (fields >= 23 || charCount + val.length + nombreCampo.length > 5600) { omitidos++; continue; }
        embed.addFields({ name: nombreCampo, value: val || '—', inline: false });
        fields++; charCount += val.length + nombreCampo.length;
      }
      if (sinRango.length && fields < 24) {
        let val = sinRango.map(l => l.linea).join('\n'); if (val.length > 1024) val = val.slice(0, 1000) + '\n… (recortado)';
        embed.addFields({ name: 'SIN RANGO (' + sinRango.length + ')', value: val, inline: false });
      }
      embed.addFields({ name: 'TOTALES', value: '⏱️ ' + formatDuracion(totHs) + ' · 📄 ' + totAntec + ' antec · 🎫 ' + totTickets + ' · 💰 ' + formatMonto(totFact) + ' (paga 50%: ' + formatMonto(totPaga) + ')' + (omitidos ? '\n_(' + omitidos + ' rango(s) no entraron por límite de Discord)_' : ''), inline: false });
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      console.error('[SEMANA] error:', e);
      await interaction.editReply({ content: 'Error mostrando la semana cerrada: ' + e.message });
    }
    return;
  }

  // ==================== /ascensos ====================
  if (interaction.commandName === 'ascensos') {
    if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
      await interaction.reply({ content: '❌ Solo HEAD PFA puede ver candidatos a ascenso.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });

    try {
      const guild = interaction.guild;
      // Fetch con timeout para evitar que se cuelgue si hay muchos miembros
      console.log('[ASCENSOS] Fetching members...');
      const fetchStart = Date.now();
      await Promise.race([
        guild.members.fetch(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch de miembros excedió 30s')), 30000))
      ]);
      console.log('[ASCENSOS] Fetched ' + guild.members.cache.size + ' miembros en ' + (Date.now() - fetchStart) + 'ms');

      // Estructura: { categoria-indice: { rango, miembros: [{member, eval, horasMs, antec, monto, tickets}] } }
      const grupos = {};
      // /ascensos evalúa la SEMANA CERRADA (la que ya terminó). Si no hay semana cerrada, usa la actual.
      const _usarCerrada = haySemanaCerrada();
      const _ignorarAntecAsc = _usarCerrada ? !antecDisponibleSemanaCerrada() : false;

      for (const [, member] of guild.members.cache) {
        if (member.user.bot) continue;
        const rango = detectarRango(member);
        if (!rango) continue;
        const uid = member.id;
        if (tieneAusenciaActiva(uid)) continue;
        const _mc = _usarCerrada ? metricasSemanaCerrada(uid) : { horasMs: (semanaFichajes[uid] || {}).totalMs || 0, antec: semanaAntecedentes[uid] || 0, monto: (semanaFacturas[uid] || {}).totalMonto || 0, tickets: (registroTickets[uid] || {}).total || 0 };
        const horasMs = _mc.horasMs;
        const antec = _mc.antec;
        const monto = _mc.monto;
        const tickets = _mc.tickets;
        const ev = evaluarPFA(rango.categoria, uid, horasMs, antec, monto, tickets, { ignorarAntec: _ignorarAntecAsc });
        // Si ingresó hace menos de 7 días, no se le aplica downgrade (protección de recién ingresados)
        const ingresoData = ingresosPFA[uid];
        const diasDesdeIngreso = ingresoData ? (Date.now() - ingresoData.ts) / (1000 * 60 * 60 * 24) : Infinity;
        if (ev.downgrade && diasDesdeIngreso < 7) {
          ev.downgrade = false;
          ev.recienIngresado = true;
        }
        const key = rango.categoria + '-' + rango.indice;
        if (!grupos[key]) grupos[key] = { rango, miembros: [] };
        grupos[key].miembros.push({ member, ev, horasMs, antec, monto, tickets });
      }
      console.log('[ASCENSOS] Procesados ' + Object.keys(grupos).length + ' grupos');

      let _periodoAsc = 'semana en curso';
      if (_usarCerrada && semanaAnteriorFull && semanaAnteriorFull.inicioISO) {
        const _i = new Date(semanaAnteriorFull.inicioISO).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit' });
        const _f = new Date(semanaAnteriorFull.finISO).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit' });
        _periodoAsc = 'semana cerrada ' + _i + ' → ' + _f;
      } else if (_usarCerrada) {
        _periodoAsc = 'semana cerrada';
      }
      const _notaAsc = '\n\n📅 Evaluando: **' + _periodoAsc + '**' + (_ignorarAntecAsc ? '\n⚠️ Antecedentes NO se consideran esta semana (sin datos por el bug ya corregido).' : '');

      const embedLow = new EmbedBuilder()
        .setTitle('🎖️ Ascensos y Downgrades — LOW PFA')
        .setColor(0x2266CC)
        .setDescription('**Mínima:** 8h · 3 antec.\n**Promote:** 12h · 4 antec.\n**Doble:** 22h · 6 antec.\n**Ciclo:** 7 días' + _notaAsc)
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Sistema de Ascensos' });

      const embedHigh = new EmbedBuilder()
        .setTitle('🎖️ Ascensos y Downgrades — HIGH PFA')
        .setColor(0xAA2266)
        .setDescription('**Mínima:** 7h · 2 antec. · 10 tickets\n**Promote:** 15h · 2 antec. · 20 tickets\n**Ciclo:** 14 días' + _notaAsc)
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Sistema de Ascensos' });

      const lineaAscenso = (m) => {
        const nombre = '<@' + m.member.id + '>';
        const isHigh = m.member.roles.cache.has(ROL_HIGH);
        if (m.ev.doble) {
          return '🔥 ' + nombre + ' → **DOBLE** · ' + m.ev.horas.toFixed(1) + 'h · ' + m.antec + 'a · ' + formatMonto(m.monto);
        }
        return '✅ ' + nombre + ' → **ASCIENDE** · ' + m.ev.horas.toFixed(1) + 'h · ' + m.antec + 'a · ' + (isHigh ? m.tickets + 't' : formatMonto(m.monto));
      };
      const lineaDowngrade = (m) => {
        const nombre = '<@' + m.member.id + '>';
        return '⬇️ ' + nombre + ' · ' + m.ev.horas.toFixed(1) + 'h · ' + m.antec + 'a' + (m.member.roles.cache.has(ROL_HIGH) ? ' · ' + m.tickets + 't' : '');
      };

      // Función para agregar fields por rango, respetando límites de Discord
      const addFieldsSafe = (embed, rangosArr, catPrefix) => {
        let totalChars = (embed.data.title || '').length + (embed.data.description || '').length + 200;
        let fieldsAdded = 0;
        let mantienenSinCambio = 0;
        for (let i = 0; i < rangosArr.length; i++) {
          const key = catPrefix + '-' + i;
          if (!grupos[key]) continue;
          const ascienden = grupos[key].miembros.filter(m => m.ev.elegible).sort((a, b) => {
            if (a.ev.doble !== b.ev.doble) return a.ev.doble ? -1 : 1;
            return b.horasMs - a.horasMs;
          });
          const downgrades = grupos[key].miembros.filter(m => m.ev.downgrade).sort((a, b) => a.horasMs - b.horasMs);
          const mantienen = grupos[key].miembros.filter(m => !m.ev.elegible && !m.ev.downgrade);
          mantienenSinCambio += mantienen.length;

          if (ascienden.length === 0 && downgrades.length === 0) continue; // No mostrar si no hay cambios

          let valor = '';
          if (ascienden.length > 0) {
            valor += '**🎖️ ASCIENDEN:**\n' + ascienden.map(lineaAscenso).join('\n');
          }
          if (downgrades.length > 0) {
            if (valor) valor += '\n\n';
            valor += '**⬇️ DOWNGRADE:**\n' + downgrades.map(lineaDowngrade).join('\n');
          }
          if (valor.length > 1000) valor = valor.slice(0, 990) + '\n_..._';
          const fieldName = '👮 ' + rangosArr[i].nombre + ' (' + ascienden.length + '↑ · ' + downgrades.length + '↓)';
          const fieldChars = fieldName.length + valor.length + 10;
          if (totalChars + fieldChars > 4800 || fieldsAdded >= 20) {
            embed.addFields({ name: '⚠️ Más rangos no mostrados', value: 'Ver detalle específico por rango con `/pfa info @oficial`.', inline: false });
            break;
          }
          embed.addFields({ name: fieldName, value: valor, inline: false });
          totalChars += fieldChars;
          fieldsAdded++;
        }
        return { fieldsAdded, mantienenSinCambio };
      };

      const resLow = addFieldsSafe(embedLow, RANGOS_LOW, 'low');
      const resHigh = addFieldsSafe(embedHigh, RANGOS_HIGH, 'high');

      if (resLow.mantienenSinCambio > 0) {
        embedLow.addFields({ name: '_Otros_', value: '_' + resLow.mantienenSinCambio + ' oficiales cumplen mínima pero no ascienden. Ver /pfa info._', inline: false });
      }
      if (resHigh.mantienenSinCambio > 0) {
        embedHigh.addFields({ name: '_Otros_', value: '_' + resHigh.mantienenSinCambio + ' oficiales cumplen mínima pero no ascienden. Ver /pfa info._', inline: false });
      }

      console.log('[ASCENSOS] LOW fields: ' + resLow.fieldsAdded + ' · HIGH fields: ' + resHigh.fieldsAdded);

      const embeds = [];
      if (resLow.fieldsAdded > 0 || resLow.mantienenSinCambio > 0) embeds.push(embedLow);
      if (resHigh.fieldsAdded > 0 || resHigh.mantienenSinCambio > 0) embeds.push(embedHigh);

      if (embeds.length === 0) {
        await interaction.editReply({ content: '_No hay PFA con rango detectable en el servidor._' });
        return;
      }

      let totalElegibles = 0;
      let totalDowngrades = 0;
      for (const key of Object.keys(grupos)) {
        for (const m of grupos[key].miembros) {
          if (m.ev.elegible) totalElegibles++;
          if (m.ev.downgrade) totalDowngrades++;
        }
      }

      const componentes = [];
      const botones = [];
      if (totalElegibles > 0) {
        botones.push(new ButtonBuilder()
          .setCustomId('ASCENSOS_APROBAR_MASIVO')
          .setLabel('APROBAR ASCENSOS (' + totalElegibles + ')')
          .setEmoji('🎖️')
          .setStyle(ButtonStyle.Success));
      }
      if (totalDowngrades > 0) {
        botones.push(new ButtonBuilder()
          .setCustomId('ASCENSOS_APLICAR_DOWNGRADES')
          .setLabel('APLICAR DOWNGRADES (' + totalDowngrades + ')')
          .setEmoji('⬇️')
          .setStyle(ButtonStyle.Danger));
      }
      if (botones.length > 0) componentes.push(new ActionRowBuilder().addComponents(botones));

      await interaction.editReply({ embeds, components: componentes });
      console.log('[ASCENSOS] Enviado exitosamente. Ascensos: ' + totalElegibles + ' · Downgrades: ' + totalDowngrades);
    } catch (e) {
      console.error('[ASCENSOS] ERROR:', e.message, e.stack);
      try {
        await interaction.editReply({ content: '⚠️ Error al procesar ascensos: `' + e.message + '`\nRevisar logs del bot.' });
      } catch (e2) { console.error('[ASCENSOS] También falló editReply:', e2.message); }
    }
    return;
  }

  // ==================== /cerrar-semana ====================
  if (interaction.commandName === 'cerrar-semana') {
    const puedeUsar = interaction.member.roles.cache.has(ROL_HIGH) || interaction.member.roles.cache.has(ROL_HEAD_PFA);
    if (!puedeUsar) {
      await interaction.reply({ content: '❌ Solo HIGH o HEAD PFA pueden ejecutar el cierre semanal.', ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    const res = await cerrarSemanaCompletaAuto(interaction.client);
    if (res.ok) {
      await interaction.editReply({ content: '✅ Cierre semanal ejecutado. **' + res.oficiales + '** oficiales · Facturado: **' + formatMonto(res.totalFacturado) + '** · Paga total: **' + formatMonto(res.totalPaga) + '**. Resumen publicado en <#' + CANAL_ASCENSOS + '>.' });
    } else {
      await interaction.editReply({ content: '❌ Error al cerrar la semana: ' + (res.error || 'desconocido') });
    }
    return;
  }

  // ==================== /facturar ====================
  if (interaction.commandName === 'facturar') {
    const uid = interaction.user.id;

    // Validar rol PFA
    if (!interaction.member.roles.cache.has(ROL_PFA)) {
      await interaction.reply({ content: '❌ Solo personal con el rol **PFA** puede usar este comando.', ephemeral: true });
      return;
    }

    // Validar canal
    if (!CANALES_FACTURAS.includes(interaction.channelId)) {
      await interaction.reply({ content: '❌ Este comando solo se usa en los canales de **multas** o **dinero en negro**.', ephemeral: true });
      return;
    }

    // Validar foto
    const foto = interaction.options.getAttachment('foto');
    if (!foto.contentType || !foto.contentType.startsWith('image/')) {
      await interaction.reply({ content: '❌ El archivo adjuntado debe ser una imagen.', ephemeral: true });
      return;
    }

    const monto = interaction.options.getNumber('monto');
    const tipo = interaction.channelId === CANAL_FACT_MULTAS ? 'multa' : 'negro';
    const tipoTxt = tipo === 'multa' ? '🚓 Multa' : '💸 Dinero en negro';
    const tipoColor = tipo === 'multa' ? 0x2266CC : 0x22AA44;

    // Inicializar registro del usuario si no existe
    if (!semanaFacturas[uid]) {
      semanaFacturas[uid] = {
        totalMonto: 0, totalCount: 0,
        multasMonto: 0, multasCount: 0,
        negroMonto: 0, negroCount: 0,
        facturas: []
      };
    }

    // Numero correlativo por PFA (compartido entre multas y negro)
    const numero = (semanaFacturas[uid].totalCount || 0) + 1;

    // Actualizar contadores
    semanaFacturas[uid].totalCount = numero;
    semanaFacturas[uid].totalMonto = (semanaFacturas[uid].totalMonto || 0) + monto;
    if (tipo === 'multa') {
      semanaFacturas[uid].multasCount = (semanaFacturas[uid].multasCount || 0) + 1;
      semanaFacturas[uid].multasMonto = (semanaFacturas[uid].multasMonto || 0) + monto;
    } else {
      semanaFacturas[uid].negroCount = (semanaFacturas[uid].negroCount || 0) + 1;
      semanaFacturas[uid].negroMonto = (semanaFacturas[uid].negroMonto || 0) + monto;
    }

    // Guardar registro detallado
    semanaFacturas[uid].facturas.push({
      n: numero,
      monto,
      tipo,
      fotoUrl: foto.url,
      ts: Date.now()
    });
    await guardarSemanaFacturas();

    // ==================== SISTEMA DE KCOINS ====================
    let kcoinsInfoTxt = '';
    let jackpotTxt = '';
    let topeAgotadoAhora = false;

    if (kcoinsData.sistemaActivo) {
      // Sistema ACTIVO: sumar kcoins de verdad
      if (kcoinsData.totalSemana >= KCOINS_TOPE_SEMANAL_GLOBAL) {
        kcoinsInfoTxt = '\n\n⚠️ **Los Kcoins semanales de la PFA se agotaron.** Tu factura se registró pero no suma Kcoins esta semana. Volvé el próximo viernes.';
      } else {
        const calc = calcularKcoinsFactura(tipo);
        // Verificar si al sumar se pasa del tope y capar
        let kcoinsAplicados = calc.kcoins;
        const disponibles = KCOINS_TOPE_SEMANAL_GLOBAL - kcoinsData.totalSemana;
        if (kcoinsAplicados > disponibles) kcoinsAplicados = disponibles;

        kcoinsData.kcoinsSemana[uid] = (kcoinsData.kcoinsSemana[uid] || 0) + kcoinsAplicados;
        kcoinsData.totalSemana += kcoinsAplicados;
        if (calc.jackpot) {
          kcoinsData.jackpotsSemana[uid] = (kcoinsData.jackpotsSemana[uid] || 0) + 1;
        }
        try { await guardarKcoins(); } catch (e) { console.error('Error guardando kcoins en factura:', e.message); }

        const totalUser = kcoinsData.kcoinsSemana[uid];
        if (calc.jackpot) {
          jackpotTxt = '\n\n🎰 **¡JACKPOT!** Ganaste el DOBLE de Kcoins en esta factura: **+' + kcoinsAplicados + ' kc** ⭐';
        }
        kcoinsInfoTxt = '\n\n🪙 **Kcoins ganados:** +' + kcoinsAplicados + ' kc' + (calc.jackpot ? ' _(jackpot)_' : '') + '\n📊 **Kcoins semana:** ' + totalUser + ' kc ($' + totalUser + ')';

        // Chequear si se agotó justo ahora
        if (kcoinsData.totalSemana >= KCOINS_TOPE_SEMANAL_GLOBAL) {
          topeAgotadoAhora = true;
        }
      }
    } else {
      // Sistema INACTIVO: preview "próximamente"
      const calc = calcularKcoinsFactura(tipo);
      kcoinsInfoTxt = '\n\n🪙 **PRÓXIMAMENTE — Sistema de Kcoins**\nEsta factura habría ganado: **+' + calc.kcoins + ' kc**' + (calc.jackpot ? ' 🎰 _(¡jackpot!)_' : '') + '\n_(El sistema se activa oficialmente el sábado post-reunión.)_';
    }

    // Embed publico en el canal
    const embed = new EmbedBuilder()
      .setTitle('🧾 Factura #' + numero)
      .setColor(tipoColor)
      .addFields(
        { name: '💵 Monto', value: '**' + formatMonto(monto) + '**', inline: true },
        { name: '📂 Tipo', value: tipoTxt, inline: true },
        { name: '👮 Emitido por', value: '<@' + uid + '>', inline: true },
        { name: '📊 Total facturado (semana)', value: formatMonto(semanaFacturas[uid].totalMonto) + ' en ' + semanaFacturas[uid].totalCount + ' facturas', inline: false }
      )
      .setImage(foto.url)
      .setTimestamp()
      .setFooter({ text: 'H-50 Bot · Sistema de Facturación' });

    // Si el sistema kcoins está activo, agregar campo con kcoins
    if (kcoinsData.sistemaActivo && kcoinsData.kcoinsSemana[uid]) {
      const kcTotal = kcoinsData.kcoinsSemana[uid];
      const jackpots = kcoinsData.jackpotsSemana[uid] || 0;
      const jTxt = jackpots > 0 ? ' 🎰x' + jackpots : '';
      embed.addFields({ name: '🪙 Kcoins semana', value: '**' + kcTotal + ' kc** ($' + kcTotal + ')' + jTxt, inline: true });
    } else if (!kcoinsData.sistemaActivo) {
      embed.addFields({ name: '🪙 Kcoins', value: '_Sistema próximamente_', inline: true });
    }

    await interaction.reply({ embeds: [embed], content: jackpotTxt + kcoinsInfoTxt || undefined });

    // Log administrativo de la factura (nueva emisión)
    try {
      const cLog = await interaction.guild.channels.fetch(CANAL_LOG_FACT_EDIT);
      const logEmbed = new EmbedBuilder()
        .setTitle('🧾 FACTURA emitida #' + numero)
        .setColor(tipoColor)
        .addFields(
          { name: '👮 Emitida por', value: '<@' + uid + '>', inline: true },
          { name: '💵 Monto', value: formatMonto(monto), inline: true },
          { name: '📂 Tipo', value: tipoTxt, inline: true },
          { name: '📊 Total semanal del oficial', value: formatMonto(semanaFacturas[uid].totalMonto) + ' (' + semanaFacturas[uid].totalCount + ' facturas)', inline: false }
        )
        .setThumbnail(foto.url)
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Log de facturación' });
      await cLog.send({ embeds: [logEmbed] });
    } catch (e) { console.error('Log factura emitida:', e.message); }

    // Aviso de tope agotado (SOLO cuando se agota, no repetir)
    if (topeAgotadoAhora) {
      try {
        const cLow = await interaction.guild.channels.fetch(CANAL_CHAT_LOW);
        await cLow.send({ content: '<@&' + ROL_LOW_PFA + '> ⚠️ **Se agotaron los Kcoins semanales de la PFA.** Hasta la próxima semana no se acredita más. Buen trabajo a todos los que aportaron. 🪙' });
      } catch (e) { console.error('Aviso tope kcoins:', e.message); }
    }
    return;
  }

  // ==================== /pfa ====================
  if (interaction.commandName === 'pfa') {
    const sub = interaction.options.getSubcommand();
    const uid = interaction.user.id;

    // Validar rol PFA
    if (!interaction.member.roles.cache.has(ROL_PFA)) {
      await interaction.reply({ content: '❌ Solo personal con el rol **PFA** puede usar este comando.', ephemeral: true });
      return;
    }

    // /pfa on
    if (sub === 'on') {
      if (!CANALES_FICHAJE.includes(interaction.channelId)) {
        await interaction.reply({ content: '❌ Este comando solo se usa en los canales de fichaje.', ephemeral: true });
        return;
      }
      if (fichajesActivos[uid]) {
        const desde = new Date(fichajesActivos[uid].inicio);
        const llevaMs = Date.now() - desde.getTime();
        await interaction.reply({ content: '⚠️ Ya tenés un fichaje abierto desde hace **' + formatDuracion(llevaMs) + '**. Usá `/pfa off` para cerrarlo.', ephemeral: true });
        return;
      }
      const ahoraISO = new Date().toISOString();
      fichajesActivos[uid] = { inicio: ahoraISO, canalId: interaction.channelId, multiplicador: multiVigente() };
      try {
        await guardarFichajesActivos();
      } catch (errGuardar) {
        // Si falla el guardado tras 3 intentos, revertir el fichaje y avisar al user
        delete fichajesActivos[uid];
        console.error('[PFA ON] No se pudo guardar fichaje de ' + uid + ':', errGuardar.message);
        await interaction.reply({ content: '⚠️ **Hubo un problema técnico al registrar tu fichaje.**\nEl bot no pudo guardar los datos en este momento. Por favor, **esperá unos segundos e intentá de nuevo** con `/pfa on`. Si el problema persiste, avisá a un staff para que revise los logs.', ephemeral: true });
        return;
      }

      const embedLog = new EmbedBuilder()
        .setTitle('🟢 FICHAJE ABIERTO')
        .setDescription('<@' + uid + '> inició su turno.')
        .addFields(
          { name: '👮 Oficial', value: interaction.member.displayName, inline: true },
          { name: '🕐 Inicio', value: '<t:' + Math.floor(Date.now() / 1000) + ':F>', inline: true },
          { name: '📍 Canal', value: '<#' + interaction.channelId + '>', inline: true }
        )
        .setColor(0x22AA44).setTimestamp().setFooter({ text: 'H-50 Bot · Sistema de Fichaje' });
      try { const c = await interaction.guild.channels.fetch(CANAL_LOGS_FICHAJE); await c.send({ embeds: [embedLog] }); } catch (e) { console.error('Log fichaje on:', e.message); }

      await interaction.reply({ content: '✅ Fichaje iniciado a las <t:' + Math.floor(Date.now() / 1000) + ':t>. Suerte en el turno.', ephemeral: true });
      return;
    }

    // /pfa off
    if (sub === 'off') {
      if (!CANALES_FICHAJE.includes(interaction.channelId)) {
        await interaction.reply({ content: '❌ Este comando solo se usa en los canales de fichaje.', ephemeral: true });
        return;
      }
      if (!fichajesActivos[uid]) {
        await interaction.reply({ content: '❌ No tenés ningún fichaje abierto. Usá `/pfa on` para iniciar uno.', ephemeral: true });
        return;
      }
      const inicio = new Date(fichajesActivos[uid].inicio);
      const fin = new Date();
      const msReal = fin.getTime() - inicio.getTime();
      const multiUsado = fichajesActivos[uid].multiplicador || 1;
      const ms = Math.floor(msReal * multiUsado);

      // Info sobre transiciones por estelares (para mostrar tiempo real de apertura)
      const inicioOriginalStr = fichajesActivos[uid].inicioOriginal;
      const huboTransiciones = !!inicioOriginalStr && inicioOriginalStr !== fichajesActivos[uid].inicio;
      const inicioOriginal = huboTransiciones ? new Date(inicioOriginalStr) : inicio;
      const msTotalDesdeApertura = fin.getTime() - inicioOriginal.getTime();

      // Registrar en la semana (en memoria). Guardado SEGURO: primero se persisten las HORAS
      // y solo si eso funciona se cierra el fichaje activo. Si algo falla, se revierte todo
      // y el turno queda ABIERTO para no perder horas.
      if (!semanaFichajes[uid]) semanaFichajes[uid] = { totalMs: 0, sesiones: [] };
      semanaFichajes[uid].sesiones.push({ inicio: inicio.toISOString(), fin: fin.toISOString(), msReal, multiplicador: multiUsado, ms });
      semanaFichajes[uid].totalMs = (semanaFichajes[uid].totalMs || 0) + ms;
      const _backupFichaje = fichajesActivos[uid];
      delete fichajesActivos[uid];
      try {
        await guardarSemanaFichajes();   // 1) lo importante: las horas
        await guardarFichajesActivos();  // 2) recién ahora el cierre del activo
      } catch (errGuardar) {
        // Revertir para no perder horas: se reabre el fichaje y se saca la sesión agregada.
        fichajesActivos[uid] = _backupFichaje;
        semanaFichajes[uid].sesiones.pop();
        semanaFichajes[uid].totalMs = Math.max(0, (semanaFichajes[uid].totalMs || 0) - ms);
        console.error('[PFA OFF] No se pudo guardar el cierre de ' + uid + ':', errGuardar.message);
        await interaction.reply({ content: '⚠️ **Hubo un problema técnico al cerrar tu fichaje.**\nTu turno sigue **ABIERTO** y no perdiste horas. Esperá unos segundos y volvé a hacer `/pfa off`.', ephemeral: true });
        return;
      }
      // Si había break activo, limpiarlo también (ya con el cierre guardado)
      if (breaksActivos[uid]) {
        delete breaksActivos[uid];
        try { await guardarBreaks(); } catch (e) { console.error('[PFA OFF] guardar breaks:', e.message); }
      }

      const estelarTxt = multiUsado > 1 ? ' (🌟 x' + multiUsado + ' aplicado)' : '';
      const duracionTxt = multiUsado > 1 ? formatDuracion(msReal) + ' \u2192 **' + formatDuracion(ms) + '** _(x' + multiUsado + ')_' : formatDuracion(ms);

      const embedLog = new EmbedBuilder()
        .setTitle('🔴 FICHAJE CERRADO' + estelarTxt)
        .setDescription('<@' + uid + '> cerró su turno.')
        .addFields(
          { name: '👮 Oficial', value: interaction.member.displayName, inline: true },
          { name: '⏱️ Duración', value: duracionTxt, inline: true },
          { name: '📊 Total semanal', value: formatDuracion(semanaFichajes[uid].totalMs), inline: true },
          { name: '🕐 Inicio', value: '<t:' + Math.floor((huboTransiciones ? inicioOriginal : inicio).getTime() / 1000) + ':F>', inline: false },
          { name: '🕐 Cierre', value: '<t:' + Math.floor(fin.getTime() / 1000) + ':F>', inline: false }
        )
        .setColor(0xCC2222).setTimestamp().setFooter({ text: 'H-50 Bot · Sistema de Fichaje' });
      if (huboTransiciones) {
        embedLog.addFields({ name: '🌟 Nota', value: 'Este fichaje se reabrió automáticamente por cambio de estelares. El total del día del oficial está correcto en su acumulado semanal.', inline: false });
      }
      try { const c = await interaction.guild.channels.fetch(CANAL_LOGS_FICHAJE); await c.send({ embeds: [embedLog] }); } catch (e) { console.error('Log fichaje off:', e.message); }

      let mensaje = '✅ Turno cerrado. ';
      if (huboTransiciones) {
        mensaje += 'Trabajaste en total **' + formatDuracion(msTotalDesdeApertura) + '** desde que abriste el fichaje _(tu turno fue reabierto automáticamente por cambio de estelares; usá `/pfa horas` para el detalle)_. ';
      } else {
        mensaje += 'Trabajaste **' + formatDuracion(msReal) + '**' + (multiUsado > 1 ? ' que cuenta como **' + formatDuracion(ms) + '** (x' + multiUsado + ')' : '') + '. ';
      }
      mensaje += '(Acumulado semanal: **' + formatDuracion(semanaFichajes[uid].totalMs) + '**).';
      await interaction.reply({ content: mensaje, ephemeral: true });
      return;
    }

    // /pfa horas
    if (sub === 'horas') {
      const datos = semanaFichajes[uid] || { totalMs: 0, sesiones: [] };
      let msAcumulado = datos.totalMs || 0;
      const desglose = calcularEstelares(datos.sesiones);

      // Sumar el fichaje en curso si existe (aplicando su multi)
      let textoAbierto = '_Sin fichaje abierto._';
      let msEnCursoReal = 0, msEnCursoContado = 0, multiEnCurso = 1;
      if (fichajesActivos[uid]) {
        msEnCursoReal = Date.now() - new Date(fichajesActivos[uid].inicio).getTime();
        multiEnCurso = fichajesActivos[uid].multiplicador || 1;
        msEnCursoContado = Math.floor(msEnCursoReal * multiEnCurso);
        msAcumulado += msEnCursoContado;
        const tagMulti = multiEnCurso > 1 ? ' 🌟 **x' + multiEnCurso + '**' : '';
        textoAbierto = '🟢 Abierto desde <t:' + Math.floor(new Date(fichajesActivos[uid].inicio).getTime() / 1000) + ':R> (' + formatDuracion(msEnCursoReal) + ' real' + (multiEnCurso > 1 ? ' = ' + formatDuracion(msEnCursoContado) + ' contado' : '') + ')' + tagMulti;
      }

      // Desglose total con fichaje abierto sumado
      const msRealTotal = desglose.msReal + msEnCursoReal;
      const msEstelarBonusTotal = desglose.msEstelarBonus + (msEnCursoContado - msEnCursoReal);
      const tieneEstelares = msEstelarBonusTotal > 0 || multiEnCurso > 1;

      const inicioSemana = semanaFichajesInicio.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });
      const hoyStr = new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });

      // Calcular facturacion del usuario
      const fact = semanaFacturas[uid] || { totalMonto: 0, totalCount: 0, multasMonto: 0, multasCount: 0, negroMonto: 0, negroCount: 0 };
      const pagaEstimada = Math.floor((fact.totalMonto || 0) * 0.5);
      const facturacionTxt = fact.totalCount > 0
        ? '**Total: ' + formatMonto(fact.totalMonto) + '** (' + fact.totalCount + ' facturas)\n🚓 Multas: ' + formatMonto(fact.multasMonto) + ' (' + fact.multasCount + ')\n💸 Negro: ' + formatMonto(fact.negroMonto) + ' (' + fact.negroCount + ')'
        : '_Sin facturas registradas esta semana._';

      // Campo de horas: con o sin desglose estelar
      const horasField = tieneEstelares
        ? '**' + formatDuracion(msAcumulado) + '** _contadas_\n⏱️ Reales: ' + formatDuracion(msRealTotal) + '\n🌟 Bonus estelar: **+' + formatDuracion(msEstelarBonusTotal) + '**'
        : '**' + formatDuracion(msAcumulado) + '**';

      const embed = new EmbedBuilder()
        .setTitle('⏱️ Resumen de la semana — ' + (interaction.member.displayName || interaction.user.username))
        .setColor(tieneEstelares ? 0xFFD700 : 0x1F3A5F)
        .addFields(
          { name: '📅 Período', value: inicioSemana + ' → ' + hoyStr, inline: false },
          { name: '⏱️ Horas trabajadas', value: horasField, inline: true },
          { name: '📋 Sesiones cerradas', value: String((datos.sesiones || []).length) + (desglose.sesionesEstelares > 0 ? '\n🌟 con estelar: ' + desglose.sesionesEstelares : ''), inline: true },
          { name: '🟢 Fichaje actual', value: textoAbierto, inline: false },
          { name: '🧾 Facturación', value: facturacionTxt, inline: false },
          { name: '💰 Paga estimada (50%)', value: '**' + formatMonto(pagaEstimada) + '**\n_Se confirma al cierre del viernes._', inline: false }
        )
        .setTimestamp().setFooter({ text: 'H-50 Bot · Sistema de Fichaje' + (horasEstelares.activas ? ' · 🌟 estelares activas (x' + horasEstelares.multiplicador + ')' : '') });

      // Agregar campo Kcoins
      const misKcoins = kcoinsData.kcoinsSemana[uid] || 0;
      const misJackpots = kcoinsData.jackpotsSemana[uid] || 0;
      if (kcoinsData.sistemaActivo) {
        const jTxt = misJackpots > 0 ? ' · 🎰x' + misJackpots : '';
        embed.addFields({ name: '🪙 Kcoins semana', value: '**' + misKcoins + ' kc** ($' + misKcoins + ')' + jTxt + '\n_Se pagan el sábado post-reunión._', inline: false });
      } else {
        embed.addFields({ name: '🪙 Kcoins semana', value: '_Sistema PRÓXIMAMENTE_ · Estén atentos al anuncio.', inline: false });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // /pfa ranking
    if (sub === 'ranking') {
      // Fetch miembros para poder filtrar por rol
      try { await interaction.guild.members.fetch(); } catch (e) { console.error('Fetch members pfa ranking:', e.message); }
      const filas = [];
      const usuariosActivos = new Set([
        ...Object.keys(semanaFichajes),
        ...Object.keys(semanaFacturas),
        ...Object.keys(registroTickets),
        ...Object.keys(semanaAntecedentes)
      ]);
      for (const uidR of usuariosActivos) {
        // Excluir HEAD y Dueños del ranking (solo prueban comandos)
        const m = interaction.guild.members.cache.get(uidR);
        if (m && (m.roles.cache.has(ROL_HEAD_PFA) || m.roles.cache.has(ROL_DUENOS))) continue;
        const horasMs = (semanaFichajes[uidR] || {}).totalMs || 0;
        const fact = semanaFacturas[uidR] || { totalMonto: 0, totalCount: 0 };
        const antec = semanaAntecedentes[uidR] || 0;
        const tickets = (registroTickets[uidR] || {}).total || 0;
        const paga = Math.floor((fact.totalMonto || 0) * 0.5);
        const score = paga + (horasMs / (1000 * 60 * 60)) * 1000 + antec * 5000 + tickets * 2000;
        filas.push({ uid: uidR, horasMs, fact, antec, tickets, paga, score });
      }
      filas.sort((a, b) => b.score - a.score);

      const top = filas.slice(0, 10);
      const miPos = filas.findIndex(f => f.uid === uid);

      const medalla = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '`#' + (i + 1) + '`';
      const linea = (f, i) => medalla(i) + ' <@' + f.uid + '> \u2014 \u23F1\uFE0F ' + formatDuracion(f.horasMs) + ' \u00B7 \uD83D\uDCC4 ' + f.antec + ' \u00B7 \uD83E\uDDFE ' + formatMonto(f.fact.totalMonto) + ' \u00B7 \uD83C\uDFAB ' + f.tickets + ' \u00B7 \uD83D\uDCB0 **' + formatMonto(f.paga) + '**';

      let desc = top.length === 0 ? '_Nadie tuvo actividad esta semana._' : top.map((f, i) => linea(f, i)).join('\n');
      if (miPos >= 10) {
        desc += '\n\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n' + linea(filas[miPos], miPos) + ' \u2190 vos';
      }

      const inicioSem = semanaFichajesInicio.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit' });
      const hoyR = new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit' });

      const embed = new EmbedBuilder()
        .setTitle('🏆 RANKING SEMANAL — PFA')
        .setDescription(desc)
        .setColor(0xFFD700)
        .setFooter({ text: 'H-50 Bot · Semana ' + inicioSem + ' → ' + hoyR + ' · ⏱️ horas · 📄 antec · 🧾 facturado · 🎫 tickets · 💰 paga' });

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // /pfa ajustar
    if (sub === 'ajustar') {
      if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
        await interaction.reply({ content: '❌ Solo HEAD PFA puede ajustar valores manualmente.', ephemeral: true });
        return;
      }
      const oficial = interaction.options.getUser('oficial');
      const tipo = interaction.options.getString('tipo');
      const cantidad = interaction.options.getNumber('cantidad');
      const oid = oficial.id;

      let resumen = '';

      if (tipo === 'horas' || tipo === 'minutos') {
        const ms = tipo === 'horas' ? cantidad * 3600000 : cantidad * 60000;
        if (!semanaFichajes[oid]) semanaFichajes[oid] = { totalMs: 0, sesiones: [] };
        semanaFichajes[oid].totalMs = Math.max(0, (semanaFichajes[oid].totalMs || 0) + ms);
        semanaFichajes[oid].sesiones.push({ ajuste: true, ms, motivo: 'Ajuste manual por <@' + interaction.user.id + '>', ts: new Date().toISOString() });
        await guardarSemanaFichajes();
        resumen = (cantidad >= 0 ? '+' : '') + cantidad + ' ' + tipo + ' \u2192 nuevo total: **' + formatDuracion(semanaFichajes[oid].totalMs) + '**';
      } else if (tipo === 'monto') {
        if (!semanaFacturas[oid]) semanaFacturas[oid] = { totalMonto: 0, totalCount: 0, multasMonto: 0, multasCount: 0, negroMonto: 0, negroCount: 0, facturas: [] };
        semanaFacturas[oid].totalMonto = Math.max(0, (semanaFacturas[oid].totalMonto || 0) + cantidad);
        semanaFacturas[oid].facturas.push({ ajuste: true, monto: cantidad, motivo: 'Ajuste manual por <@' + interaction.user.id + '>', ts: Date.now() });
        await guardarSemanaFacturas();
        const nuevaPaga = Math.floor(semanaFacturas[oid].totalMonto * 0.5);
        resumen = (cantidad >= 0 ? '+' : '') + formatMonto(cantidad) + ' \u2192 nuevo total: **' + formatMonto(semanaFacturas[oid].totalMonto) + '** (paga 50%: ' + formatMonto(nuevaPaga) + ')';
      } else if (tipo === 'antec') {
        semanaAntecedentes[oid] = Math.max(0, (semanaAntecedentes[oid] || 0) + Math.floor(cantidad));
        await guardarAntecedentes();
        resumen = (cantidad >= 0 ? '+' : '') + Math.floor(cantidad) + ' antecedentes \u2192 nuevo total: **' + semanaAntecedentes[oid] + '**';
      } else if (tipo === 'tickets') {
        if (!registroTickets[oid]) registroTickets[oid] = { total: 0 };
        registroTickets[oid].total = Math.max(0, (registroTickets[oid].total || 0) + Math.floor(cantidad));
        await guardarTickets();
        resumen = (cantidad >= 0 ? '+' : '') + Math.floor(cantidad) + ' tickets \u2192 nuevo total: **' + registroTickets[oid].total + '**';
      }

      await interaction.reply({ content: '✅ Ajuste aplicado a <@' + oid + '>: ' + resumen, ephemeral: true });

      // Log administrativo
      try {
        const c = await interaction.guild.channels.fetch(CANAL_LOG_AJUSTES);
        const tipoTxt = { horas: '⏱️ Horas', minutos: '⏱️ Minutos', monto: '💵 Monto', antec: '📜 Antecedentes', tickets: '🎟️ Tickets' }[tipo] || tipo;
        const embed = new EmbedBuilder()
          .setTitle('⚙️ AJUSTE MANUAL aplicado')
          .setColor(0xE67E22)
          .addFields(
            { name: 'Oficial ajustado', value: '<@' + oid + '>', inline: true },
            { name: 'Ajustado por', value: '<@' + interaction.user.id + '>', inline: true },
            { name: 'Tipo', value: tipoTxt, inline: true },
            { name: 'Resumen del ajuste', value: resumen, inline: false }
          )
          .setTimestamp()
          .setFooter({ text: 'H-50 Bot · Log de administración' });
        await c.send({ embeds: [embed] });
      } catch (e) { console.error('Log ajuste:', e.message); }

      return;
    }

    // /pfa relevo
    if (sub === 'relevo') {
      if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
        await interaction.reply({ content: '❌ Solo HEAD PFA puede ejecutar el relevo general.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      const ahora = new Date();
      const cerrados = [];
      for (const oid of Object.keys(fichajesActivos)) {
        const inicio = new Date(fichajesActivos[oid].inicio);
        const msReal = ahora.getTime() - inicio.getTime();
        const multiUsado = fichajesActivos[oid].multiplicador || 1;
        const ms = Math.floor(msReal * multiUsado);
        if (!semanaFichajes[oid]) semanaFichajes[oid] = { totalMs: 0, sesiones: [] };
        semanaFichajes[oid].sesiones.push({ inicio: inicio.toISOString(), fin: ahora.toISOString(), msReal, multiplicador: multiUsado, ms, relevoGeneral: true });
        semanaFichajes[oid].totalMs = (semanaFichajes[oid].totalMs || 0) + ms;
        cerrados.push({ uid: oid, ms });
      }
      fichajesActivos = {};
      await guardarFichajesActivos();
      await guardarSemanaFichajes();

      if (cerrados.length === 0) {
        await interaction.editReply({ content: '_No había ningún fichaje abierto para cerrar._' });
        return;
      }

      // Log al canal de fichajes
      try {
        const c = await interaction.guild.channels.fetch(CANAL_LOGS_FICHAJE);
        const lineas = cerrados.map(cc => '<@' + cc.uid + '> \u2014 ' + formatDuracion(cc.ms)).join('\n');
        const embedLog = new EmbedBuilder()
          .setTitle('🚨 RELEVO GENERAL')
          .setDescription('Cierre forzoso de todos los fichajes activos ejecutado por <@' + interaction.user.id + '>.')
          .addFields({ name: 'Oficiales relevados (' + cerrados.length + ')', value: lineas, inline: false })
          .setColor(0xFFAA00).setTimestamp().setFooter({ text: 'H-50 Bot · Sistema de Fichaje' });
        await c.send({ embeds: [embedLog] });
      } catch (e) { console.error('Log relevo:', e.message); }

      await interaction.editReply({ content: '✅ Relevo general ejecutado. **' + cerrados.length + '** fichajes cerrados. Ver <#' + CANAL_LOGS_FICHAJE + '>.' });
      return;
    }

    // /pfa abiertos
    if (sub === 'abiertos') {
      const puedeUsar = interaction.member.roles.cache.has(ROL_HIGH) ||
                        interaction.member.roles.cache.has(ROL_HEAD_PFA) ||
                        interaction.member.roles.cache.has(ROL_ENCARGADO_FICHAJE) ||
                        interaction.member.roles.cache.has(ROL_AUX_FICHAJE);
      if (!puedeUsar) {
        await interaction.reply({ content: '❌ Solo HIGH, HEAD PFA, Encargado o Auxiliar de Fichaje puede ver los fichajes abiertos.', ephemeral: true });
        return;
      }
      const abiertos = Object.entries(fichajesActivos);
      if (abiertos.length === 0) {
        await interaction.reply({ content: '_No hay ningún fichaje abierto en este momento._', ephemeral: true });
        return;
      }
      const ahoraMs = Date.now();

      // Separar entre trabajando y en break
      const trabajando = [];
      const enBreak = [];
      for (const [oid, data] of abiertos) {
        const inicio = new Date(data.inicio);
        const llevaMs = ahoraMs - inicio.getTime();
        const entry = { oid, inicioTs: Math.floor(inicio.getTime() / 1000), llevaMs };
        if (breaksActivos[oid]) {
          entry.breakMs = ahoraMs - breaksActivos[oid].inicioBreakMs;
          entry.breakInicioTs = Math.floor(breaksActivos[oid].inicioBreakMs / 1000);
          enBreak.push(entry);
        } else {
          trabajando.push(entry);
        }
      }

      // Ordenar por tiempo (más tiempo primero)
      trabajando.sort((a, b) => b.llevaMs - a.llevaMs);
      enBreak.sort((a, b) => b.breakMs - a.breakMs);

      // Construir descripción
      const partes = [];
      if (trabajando.length > 0) {
        const lineasTrabaja = trabajando
          .map(l => '🟢 <@' + l.oid + '> · ⏱️ **' + formatDuracion(l.llevaMs) + '** _(desde <t:' + l.inicioTs + ':t>)_')
          .join('\n');
        partes.push('**🟢 En servicio (' + trabajando.length + ')**\n' + lineasTrabaja);
      }
      if (enBreak.length > 0) {
        const lineasBreak = enBreak
          .map(l => '☕ <@' + l.oid + '> · 🛑 **En break hace ' + formatDuracion(l.breakMs) + '** _(desde <t:' + l.breakInicioTs + ':t>)_')
          .join('\n');
        partes.push('**☕ En break (' + enBreak.length + ')**\n' + lineasBreak);
      }

      const embed = new EmbedBuilder()
        .setTitle('🟢 Fichajes Abiertos — ' + trabajando.length + ' en servicio · ' + enBreak.length + ' en break')
        .setDescription(partes.join('\n\n'))
        .setColor(0x22AA44)
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Sistema de Fichaje · Total: ' + abiertos.length });
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // /pfa info
    if (sub === 'info') {
      const puedeUsar = interaction.member.roles.cache.has(ROL_HIGH) || interaction.member.roles.cache.has(ROL_HEAD_PFA);
      if (!puedeUsar) {
        await interaction.reply({ content: '❌ Solo HIGH o HEAD PFA puede consultar info de otros oficiales.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      const oficial = interaction.options.getUser('oficial');
      const oid = oficial.id;
      let member;
      try { member = await interaction.guild.members.fetch(oid); }
      catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar a ese usuario en el servidor.' }); return; }

      const rango = detectarRango(member);
      const rangoTxt = rango ? (rango.categoria === 'low' ? '👮 ' : '🎖️ ') + rango.nombre + ' (' + rango.categoria.toUpperCase() + ')' : '_Sin rango PFA detectado_';

      let horasMs = ((semanaFichajes[oid] || {}).totalMs) || 0;
      let abiertoTxt = '_Sin fichaje abierto._';
      let msEnCursoR = 0, msEnCursoC = 0, multiAbierto = 1;
      if (fichajesActivos[oid]) {
        msEnCursoR = Date.now() - new Date(fichajesActivos[oid].inicio).getTime();
        multiAbierto = fichajesActivos[oid].multiplicador || 1;
        msEnCursoC = Math.floor(msEnCursoR * multiAbierto);
        horasMs += msEnCursoC;
        const tagAb = multiAbierto > 1 ? ' 🌟 **x' + multiAbierto + '**' : '';
        abiertoTxt = '🟢 Abierto <t:' + Math.floor(new Date(fichajesActivos[oid].inicio).getTime() / 1000) + ':R> (' + formatDuracion(msEnCursoR) + ')' + tagAb;
      }
      const sesiones = ((semanaFichajes[oid] || {}).sesiones) || [];
      const desgloseInfo = calcularEstelares(sesiones);
      const msEstelarBonusInfo = desgloseInfo.msEstelarBonus + (msEnCursoC - msEnCursoR);
      const tieneEstelaresInfo = msEstelarBonusInfo > 0;

      const fact = semanaFacturas[oid] || { totalMonto: 0, totalCount: 0, multasMonto: 0, multasCount: 0, negroMonto: 0, negroCount: 0 };
      const antec = semanaAntecedentes[oid] || 0;
      const tickets = (registroTickets[oid] || {}).total || 0;
      const paga = Math.floor((fact.totalMonto || 0) * 0.5);

      const dias = diasDesdeUltimoAscenso(oid);
      const ultAsc = ascensosHistorial[oid];
      const ultAscTxt = ultAsc ? '<t:' + Math.floor(new Date(ultAsc.ultimaFecha).getTime() / 1000) + ':R>' : '_Sin registro_';

      let evalTxt = '_Sin rango detectado._';
      if (rango) {
        const ev = evaluarPFA(rango.categoria, oid, horasMs, antec, fact.totalMonto || 0, tickets);
        if (ev.elegible && ev.doble) evalTxt = '🔥 **CANDIDATO A DOBLE ASCENSO**';
        else if (ev.elegible) evalTxt = '✅ **CANDIDATO A ASCENSO**';
        else evalTxt = '❌ Falta: ' + ev.faltantes.join(', ');
      }

      const horasField = tieneEstelaresInfo
        ? '**' + formatDuracion(horasMs) + '** · ' + sesiones.length + ' sesiones\n⏱️ Reales: ' + formatDuracion(desgloseInfo.msReal + msEnCursoR) + '\n🌟 Bonus: **+' + formatDuracion(msEstelarBonusInfo) + '**'
        : '**' + formatDuracion(horasMs) + '** · ' + sesiones.length + ' sesiones';

      // Info de quién ingresó al oficial (/new o /return)
      const ingresoInfo = ingresosPFA[oid];
      let ingresoTxt = '_Sin registro (ingresó antes de la implementación del sistema)_';
      if (ingresoInfo) {
        const comandoTxt = ingresoInfo.comando === 'new' ? '📝 `/new`' : '🔄 `/return`';
        const rangoInicial = ingresoInfo.rangoInicial + (ingresoInfo.categoria ? ' _(' + ingresoInfo.categoria.toUpperCase() + ')_' : '');
        ingresoTxt = '<@' + ingresoInfo.ingresadoPor + '>\n' + comandoTxt + ' · Rango inicial: **' + rangoInicial + '**\n<t:' + Math.floor(ingresoInfo.ts / 1000) + ':F>';
      }

      const embed = new EmbedBuilder()
        .setTitle('📋 Info PFA — ' + (member.displayName || oficial.username))
        .setThumbnail(member.displayAvatarURL())
        .setColor(0x1F3A5F)
        .addFields(
          { name: '🎖️ Rango actual', value: rangoTxt, inline: false },
          { name: '👤 Ingresado por', value: ingresoTxt, inline: false },
          { name: '⏱️ Horas (semana)', value: horasField, inline: true },
          { name: '🟢 Fichaje actual', value: abiertoTxt, inline: true },
          { name: '📄 Antecedentes', value: '**' + antec + '**', inline: true },
          { name: '🧾 Facturado', value: '**' + formatMonto(fact.totalMonto) + '**\n🚓 Multas: ' + formatMonto(fact.multasMonto) + ' (' + fact.multasCount + ')\n💸 Negro: ' + formatMonto(fact.negroMonto) + ' (' + fact.negroCount + ')', inline: false },
          { name: '🎫 Tickets', value: '**' + tickets + '**', inline: true },
          { name: '💰 Paga 50%', value: '**' + formatMonto(paga) + '**', inline: true },
          { name: '📅 Último ascenso', value: ultAscTxt, inline: true },
          { name: '🎯 Evaluación', value: evalTxt, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Info Semanal' });
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // /pfa reset
    if (sub === 'reset') {
      if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
        await interaction.reply({ content: '❌ Solo HEAD PFA puede resetear oficiales.', ephemeral: true });
        return;
      }
      const oficial = interaction.options.getUser('oficial');
      const oid = oficial.id;

      const horasAntes = ((semanaFichajes[oid] || {}).totalMs) || 0;
      const factAntes = ((semanaFacturas[oid] || {}).totalMonto) || 0;
      const antecAntes = semanaAntecedentes[oid] || 0;
      const ticketsAntes = (registroTickets[oid] || {}).total || 0;
      const teniaAbierto = !!fichajesActivos[oid];

      delete semanaFichajes[oid];
      delete semanaFacturas[oid];
      delete semanaAntecedentes[oid];
      delete registroTickets[oid];
      delete fichajesActivos[oid];

      await guardarSemanaFichajes();
      await guardarSemanaFacturas();
      await guardarAntecedentes();
      await guardarTickets();
      await guardarFichajesActivos();

      await interaction.reply({
        content: '✅ Semana reseteada para <@' + oid + '>.\n' +
          '**Valores anteriores:** ⏱️ ' + formatDuracion(horasAntes) + ' · 📄 ' + antecAntes + ' · 🧾 ' + formatMonto(factAntes) + ' · 🎫 ' + ticketsAntes + (teniaAbierto ? '\n⚠️ Tenía un fichaje abierto que también fue cancelado.' : ''),
        ephemeral: true
      });

      // Log administrativo — RESET es una acción crítica que casi nunca debería ejecutarse
      try {
        const c = await interaction.guild.channels.fetch(CANAL_LOG_AJUSTES);
        const embed = new EmbedBuilder()
          .setTitle('🚨 RESET SEMANAL aplicado')
          .setDescription('_Esta acción borra toda la actividad semanal del oficial. Debería usarse solo en casos excepcionales._')
          .setColor(0xC0392B)
          .addFields(
            { name: 'Oficial reseteado', value: '<@' + oid + '>', inline: true },
            { name: 'Reseteado por', value: '<@' + interaction.user.id + '>', inline: true },
            { name: '⏱️ Horas borradas', value: formatDuracion(horasAntes), inline: true },
            { name: '🧾 Facturación borrada', value: formatMonto(factAntes), inline: true },
            { name: '📄 Antecedentes borrados', value: String(antecAntes), inline: true },
            { name: '🎫 Tickets borrados', value: String(ticketsAntes), inline: true },
            { name: 'Fichaje abierto', value: teniaAbierto ? '⚠️ Sí (cancelado)' : 'No', inline: false }
          )
          .setTimestamp()
          .setFooter({ text: 'H-50 Bot · Log de administración' });
        await c.send({ embeds: [embed] });
      } catch (e) { console.error('Log reset:', e.message); }

      return;
    }

    // /pfa sancionar
    if (sub === 'sancionar') {
      const puedeUsar = interaction.member.roles.cache.has(ROL_SANCIONES) || interaction.member.roles.cache.has(ROL_AUX_SANCIONES) || interaction.member.roles.cache.has(ROL_HEAD_PFA);
      if (!puedeUsar) {
        await interaction.reply({ content: '❌ Solo el Encargado de Sanciones, Auxiliar de Sanciones o HEAD PFA puede aplicar sanciones.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      const oficial = interaction.options.getUser('oficial');
      const tipoRaw = interaction.options.getString('tipo'); // "warn_3", "strike_2", etc.
      const motivo = interaction.options.getString('motivo');
      const oid = oficial.id;
      let member;
      try { member = await interaction.guild.members.fetch(oid); }
      catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al usuario en el servidor.' }); return; }

      const [tipoBase, cantStr] = tipoRaw.split('_');
      const cantidad = parseInt(cantStr, 10) || 1;

      if (!sanciones[oid]) sanciones[oid] = { warns: 0, strikes: 0, historial: [] };

      // Aplicar incremento cantidad veces, respetando escalación de warn → strike
      for (let i = 0; i < cantidad; i++) {
        if (tipoBase === 'warn') {
          sanciones[oid].warns++;
          // Escalación: 3 warns → 1 strike, resetea warns
          if (sanciones[oid].warns >= 3) {
            sanciones[oid].warns = 0;
            sanciones[oid].strikes++;
            sanciones[oid].historial.push({ tipo: 'escalada_strike', motivo: 'Auto-escalación por 3er warn (' + motivo + ')', sancionadoPor: interaction.user.id, ts: Date.now() });
          }
        } else {
          sanciones[oid].strikes++;
        }
      }

      // Registrar en historial (una sola entrada con cantidad aplicada)
      sanciones[oid].historial.push({ tipo: tipoBase, cantidad, motivo, sancionadoPor: interaction.user.id, ts: Date.now() });

      // Verificar demote auto por 3er strike
      let demoteAuto = null;
      if (sanciones[oid].strikes >= 3) {
        sanciones[oid].historial.push({ tipo: 'pre_demote_auto', motivo: 'Llegó al 3er strike — demote automático', sancionadoPor: interaction.user.id, ts: Date.now() });
        // Aplicar demote: saca todos los roles PFA pero NO le pone blacklist
        demoteAuto = await aplicarDemote(member, '3er strike alcanzado — ' + motivo, interaction.user.id, interaction.guild);
        await guardarSanciones();
        await interaction.editReply({ content: '⬇️ **Demote automático** aplicado a <@' + oid + '> por 3er strike. Queda como civil. Puede volver en 1 mes (<t:' + Math.floor(demoteAuto.puedeVolverFecha.getTime() / 1000) + ':D>). Ver <#' + CANAL_UPDATES + '>.' });
        return;
      }

      // Aplicar/cambiar roles de sanción según estado actual
      try {
        for (const r of ROLES_SANCION) {
          if (member.roles.cache.has(r)) await member.roles.remove(r, 'Actualización de sanción');
        }
        let rolFinal = null;
        if (sanciones[oid].strikes === 2) rolFinal = ROL_STRIKE_2;
        else if (sanciones[oid].strikes === 1) rolFinal = ROL_STRIKE_1;
        else if (sanciones[oid].warns === 2) rolFinal = ROL_WARN_2;
        else if (sanciones[oid].warns === 1) rolFinal = ROL_WARN_1;
        if (rolFinal) await member.roles.add(rolFinal, 'Sanción aplicada');
      } catch (e) { console.error('Error aplicando rol sanción:', e.message); }

      await guardarSanciones();

      // Embed al canal de sanciones
      const tipoEmoji = tipoBase === 'warn' ? '⚠️' : '⛔';
      const tipoTxt = (cantidad > 1 ? cantidad + ' ' : '') + (tipoBase === 'warn' ? (cantidad > 1 ? 'WARNS' : 'WARN') : (cantidad > 1 ? 'STRIKES' : 'STRIKE'));
      const embed = new EmbedBuilder()
        .setTitle(tipoEmoji + ' SANCIÓN APLICADA — ' + tipoTxt)
        .setColor(tipoBase === 'warn' ? 0xFFAA00 : 0xCC2222)
        .setThumbnail(member.displayAvatarURL())
        .addFields(
          { name: '👮 Sancionado', value: '<@' + oid + '>', inline: true },
          { name: '🔨 Sancionado por', value: '<@' + interaction.user.id + '>', inline: true },
          { name: '📝 Motivo', value: motivo, inline: false },
          { name: '📊 Estado actual', value: '⚠️ Warns: **' + sanciones[oid].warns + '/2**\n⛔ Strikes: **' + sanciones[oid].strikes + '/2**', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Sistema de Sanciones' });
      try { const c = await interaction.guild.channels.fetch(CANAL_SANCIONES); await c.send({ content: '<@' + oid + '>', embeds: [embed] }); } catch (e) { console.error('Log sanción:', e.message); }

      await interaction.editReply({ content: '✅ ' + tipoTxt + ' aplicado/s. Ver <#' + CANAL_SANCIONES + '>.' });
      return;
    }

    // /pfa sanciones (ver historial)
    if (sub === 'sanciones') {
      const oficial = interaction.options.getUser('oficial');
      const oid = oficial.id;
      const data = sanciones[oid];
      if (!data || data.historial.length === 0) {
        await interaction.reply({ content: '✅ <@' + oid + '> no tiene sanciones registradas.', ephemeral: true });
        return;
      }
      const ultimas = data.historial.slice(-15).reverse();
      const lineas = ultimas.map(h => {
        const t = '<t:' + Math.floor(h.ts / 1000) + ':d>';
        const cant = h.cantidad && h.cantidad > 1 ? h.cantidad + ' ' : '';
        if (h.tipo === 'warn') return '⚠️ **' + cant + 'Warn' + (h.cantidad > 1 ? 's' : '') + '** · ' + t + ' · por <@' + h.sancionadoPor + '>\n_' + h.motivo + '_';
        if (h.tipo === 'strike') return '⛔ **' + cant + 'Strike' + (h.cantidad > 1 ? 's' : '') + '** · ' + t + ' · por <@' + h.sancionadoPor + '>\n_' + h.motivo + '_';
        if (h.tipo === 'escalada_strike') return '⬆️ Escalada a strike · ' + t + '\n_' + h.motivo + '_';
        if (h.tipo === 'demote_auto') {
          const volverTxt = h.puedeVolverTs ? ' · vuelve <t:' + Math.floor(h.puedeVolverTs / 1000) + ':R>' : '';
          return '⬇️ **DEMOTE** · ' + t + volverTxt + '\n_' + h.motivo + '_';
        }
        if (h.tipo === 'pre_demote_auto') return null;
        if (h.tipo === 'blacklist') return '⚫ **BLACKLIST** · ' + t + ' · por <@' + h.sancionadoPor + '>\n_' + h.motivo + '_';
        if (h.tipo === 'pre_blacklist_auto') return null;
        return '· ' + h.tipo + ' · ' + t;
      }).filter(Boolean).join('\n\n');
      const embed = new EmbedBuilder()
        .setTitle('📋 Historial de Sanciones — ' + oficial.username)
        .setColor(0x886622)
        .addFields(
          { name: '📊 Estado actual', value: '⚠️ Warns: **' + (data.warns || 0) + '/2**  ·  ⛔ Strikes: **' + (data.strikes || 0) + '/2**', inline: false },
          { name: '🕐 Últimas ' + Math.min(15, data.historial.length) + ' entradas', value: lineas.length > 4000 ? lineas.slice(0, 3997) + '...' : lineas, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Sistema de Sanciones' });
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // /pfa ausencia
    if (sub === 'ausencia') {
      if (!interaction.member.roles.cache.has(ROL_PFA)) {
        await interaction.reply({ content: '❌ Solo personal con el rol PFA puede pedir ausencia.', ephemeral: true });
        return;
      }
      const dias = interaction.options.getInteger('dias');
      const motivo = interaction.options.getString('motivo');
      await interaction.deferReply({ ephemeral: true });
      const ahora = new Date();
      const hasta = new Date(ahora.getTime() + dias * 24 * 60 * 60 * 1000);
      const ausenciaId = 'A' + Date.now() + '_' + interaction.user.id.slice(-4);
      ausencias[ausenciaId] = {
        uid: interaction.user.id,
        motivo,
        desdeISO: ahora.toISOString(),
        hastaISO: hasta.toISOString(),
        dias,
        estado: 'pendiente',
        ts: Date.now()
      };
      await guardarAusencias();

      const embed = new EmbedBuilder()
        .setTitle('🏖️ Solicitud de Ausencia — PENDIENTE')
        .setColor(0xFFAA00)
        .setThumbnail(interaction.member.displayAvatarURL())
        .addFields(
          { name: '👮 Solicitante', value: '<@' + interaction.user.id + '>', inline: true },
          { name: '📅 Período', value: '<t:' + Math.floor(ahora.getTime() / 1000) + ':d> → <t:' + Math.floor(hasta.getTime() / 1000) + ':d>', inline: true },
          { name: '⏳ Días', value: '**' + dias + '** días', inline: true },
          { name: '📝 Motivo', value: motivo, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'H-50 Bot · Requiere aprobación de HIGH o HEAD · ID: ' + ausenciaId });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('AUS_OK_' + ausenciaId).setLabel('✅ Aprobar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('AUS_NO_' + ausenciaId).setLabel('❌ Rechazar').setStyle(ButtonStyle.Danger)
      );

      try {
        const c = await interaction.guild.channels.fetch(CANAL_AUSENCIAS);
        await c.send({ embeds: [embed], components: [row] });
      } catch (e) { console.error('Log ausencia:', e.message); }

      await interaction.editReply({ content: '✅ Solicitud enviada. Esperá aprobación en <#' + CANAL_AUSENCIAS + '>.' });
      return;
    }

    // /pfa blacklist
    if (sub === 'blacklist') {
      if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
        await interaction.reply({ content: '❌ Solo HEAD PFA puede aplicar blacklist.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      const oficial = interaction.options.getUser('oficial');
      const motivo = interaction.options.getString('motivo');
      const categoria = interaction.options.getString('categoria');
      const tiempoDias = interaction.options.getInteger('tiempo'); // null = permanente
      const categoriaTxt = categoria ? ({
        'troll': 'Troll',
        'no_apto': 'No apto'
      }[categoria] || categoria) : null;
      const oid = oficial.id;
      let member;
      try { member = await interaction.guild.members.fetch(oid); }
      catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al usuario en el servidor.' }); return; }

      await aplicarBlacklist(member, motivo, interaction.user.id, interaction.guild, false, categoriaTxt);

      // Persistir el BL con la duración (si aplica)
      const ahoraMs = Date.now();
      const expiraMs = tiempoDias ? ahoraMs + tiempoDias * 24 * 60 * 60 * 1000 : null;
      blacklistsActivas[oid] = {
        ts: ahoraMs,
        expira: expiraMs,
        motivo,
        categoria: categoriaTxt,
        aplicadoPor: interaction.user.id,
        dias: tiempoDias || null,
        notificado: false
      };
      try { await guardarBlacklists(); } catch (e) { console.error('Guardar BL:', e.message); }

      // Publicar log detallado en canal dedicado
      try {
        const cLog = await interaction.guild.channels.fetch(CANAL_LOG_BL);
        const embed = new EmbedBuilder()
          .setTitle('⛔ BLACKLIST APLICADO')
          .setColor(0xCC2222)
          .setThumbnail(member.displayAvatarURL())
          .addFields(
            { name: '👮 Usuario', value: '<@' + oid + '>', inline: true },
            { name: '🔨 Aplicado por', value: '<@' + interaction.user.id + '>', inline: true },
            { name: '⏱️ Duración', value: tiempoDias ? '**' + tiempoDias + ' días**' : '**PERMANENTE**', inline: true },
            { name: '📌 Categoría', value: categoriaTxt || '_Sin categoría_', inline: true },
            { name: '📅 Fecha inicio', value: '<t:' + Math.floor(ahoraMs / 1000) + ':F>', inline: true },
            { name: '📅 Expira', value: expiraMs ? '<t:' + Math.floor(expiraMs / 1000) + ':F>' : '_Nunca_', inline: true },
            { name: '📝 Motivo', value: motivo, inline: false }
          )
          .setTimestamp()
          .setFooter({ text: 'H-50 Bot · Log de Blacklists' });
        await cLog.send({ embeds: [embed] });
      } catch (e) { console.error('Log BL:', e.message); }

      const sufijo = categoriaTxt ? ' **(' + categoriaTxt + ')**' : '';
      const tiempoTxt = tiempoDias ? ' por **' + tiempoDias + ' días**' : ' de forma **permanente**';
      await interaction.editReply({ content: '⛔ Blacklist' + sufijo + tiempoTxt + ' aplicado a <@' + oid + '>. Log publicado en <#' + CANAL_LOG_BL + '> y updates en <#' + CANAL_UPDATES + '>.' });
      return;
    }

    // /pfa demote (manual)
    if (sub === 'demote') {
      if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
        await interaction.reply({ content: '❌ Solo HEAD PFA puede aplicar demote manual.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      const oficial = interaction.options.getUser('oficial');
      const motivo = interaction.options.getString('motivo');
      const oid = oficial.id;
      let member;
      try { member = await interaction.guild.members.fetch(oid); }
      catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al usuario en el servidor.' }); return; }

      const res = await aplicarDemote(member, motivo, interaction.user.id, interaction.guild);
      await interaction.editReply({ content: '⬇️ **Demote manual** aplicado a <@' + oid + '>. Queda como civil. Puede volver en 1 mes (<t:' + Math.floor(res.puedeVolverFecha.getTime() / 1000) + ':D>). Ver <#' + CANAL_UPDATES + '>.' });
      return;
    }

    // /pfa adicional (horas estelares)
    if (sub === 'adicional') {
      if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
        await interaction.reply({ content: '❌ Solo HEAD PFA puede activar o desactivar horas estelares.', ephemeral: true });
        return;
      }
      const accion = interaction.options.getString('accion');

      if (accion === 'info') {
        if (!horasEstelares.activas) {
          await interaction.reply({ content: 'ℹ️ Las **horas estelares están inactivas** actualmente. El multiplicador vigente es x1.', ephemeral: true });
          return;
        }
        const restanteMs = horasEstelares.finMs - Date.now();
        const restanteTxt = restanteMs > 0 ? formatDuracion(restanteMs) : 'vencidas (se apagan ya)';
        await interaction.reply({
          content: '🌟 **Estelares activas**\n' +
            'Multiplicador: **x' + horasEstelares.multiplicador + '**\n' +
            'Activadas por: <@' + horasEstelares.activadoPor + '>\n' +
            'Inicio: <t:' + Math.floor(horasEstelares.inicioMs / 1000) + ':F>\n' +
            'Finalizan: <t:' + Math.floor(horasEstelares.finMs / 1000) + ':F> (<t:' + Math.floor(horasEstelares.finMs / 1000) + ':R>)\n' +
            'Tiempo restante: **' + restanteTxt + '**',
          ephemeral: true
        });
        return;
      }

      if (accion === 'off') {
        if (!horasEstelares.activas) {
          await interaction.reply({ content: '⚠️ Las horas estelares ya están desactivadas.', ephemeral: true });
          return;
        }
        await interaction.deferReply({ ephemeral: true });
        const res = await desactivarEstelares(interaction.client, interaction.guild, 'Desactivación manual por <@' + interaction.user.id + '>');
        await interaction.editReply({ content: '⭐ Horas estelares **desactivadas**. ' + (res.afectados.length > 0 ? '**' + res.afectados.length + '** fichaje(s) reiniciados con x1.' : 'No había fichajes abiertos.') + ' Aviso publicado en <#' + CANAL_GENERAL + '>.' });
        return;
      }

      // accion === 'on'
      const multiplicador = interaction.options.getNumber('multiplicador');
      const horas = interaction.options.getNumber('horas');
      if (!multiplicador || !horas) {
        await interaction.reply({ content: '❌ Para activar tenés que indicar `multiplicador` y `horas`. Ej: `/pfa adicional accion:Activar multiplicador:2 horas:3`.', ephemeral: true });
        return;
      }
      if (horasEstelares.activas) {
        await interaction.reply({ content: '⚠️ Las horas estelares ya están activas (x' + horasEstelares.multiplicador + ' hasta <t:' + Math.floor(horasEstelares.finMs / 1000) + ':R>). Desactivá primero con `/pfa adicional accion:Desactivar`.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      const res = await activarEstelares(interaction.client, interaction.guild, multiplicador, horas, interaction.user.id);
      await interaction.editReply({
        content: '🌟 Horas estelares **activadas** con multiplicador **x' + multiplicador + '** durante **' + horas + 'h** (hasta <t:' + Math.floor(res.finMs / 1000) + ':F>).' +
          (res.afectados.length > 0 ? '\nFichajes reiniciados: **' + res.afectados.length + '**.' : '\nNo había fichajes abiertos.') +
          '\nAviso publicado en <#' + CANAL_GENERAL + '>.'
      });
      return;
    }

    // /pfa apelar
    if (sub === 'apelar') {
      if (!interaction.member.roles.cache.has(ROL_PFA)) {
        await interaction.reply({ content: '❌ Solo personal con el rol PFA puede apelar sanciones.', ephemeral: true });
        return;
      }
      const data = sanciones[uid];
      if (!data || !data.historial || data.historial.length === 0) {
        await interaction.reply({ content: '✅ No tenés sanciones registradas.', ephemeral: true });
        return;
      }

      // Filtrar entradas elegibles para apelar
      const apelables = data.historial.filter(entradaEsApelable);
      const pendientes = data.historial.filter(h => h.apelacionPendiente && !h.apelacionAprobada);
      const aunNoCumple = data.historial.filter(h => (h.tipo === 'warn' || h.tipo === 'strike') && !h.apelacionPendiente && !h.apelacionAprobada && !entradaEsApelable(h));

      if (apelables.length === 0) {
        let txt = '_No tenés sanciones elegibles para apelar en este momento._';
        if (pendientes.length > 0) txt += '\n\n⏳ Tenés **' + pendientes.length + '** apelación(es) **pendiente(s)** de revisión.';
        if (aunNoCumple.length > 0) {
          const lineas = aunNoCumple.slice(0, 5).map(h => {
            const diasMin = h.tipo === 'warn' ? 15 : 30;
            const dias = (Date.now() - h.ts) / (1000 * 60 * 60 * 24);
            const faltan = Math.ceil(diasMin - dias);
            return '• ' + (h.tipo === 'warn' ? '⚠️ Warn' : '⛔ Strike') + ' del <t:' + Math.floor(h.ts / 1000) + ':d> — faltan **' + faltan + ' días**';
          }).join('\n');
          txt += '\n\n⏰ Sanciones que aún no podés apelar (necesitan más tiempo):\n' + lineas;
        }
        await interaction.reply({ content: txt, ephemeral: true });
        return;
      }

      // Construir select menu con sanciones elegibles (máx 25)
      const opciones = apelables.slice(-25).reverse().map(h => {
        const cant = h.cantidad && h.cantidad > 1 ? h.cantidad + ' ' : '';
        const tipoTxt = cant + (h.tipo === 'warn' ? (h.cantidad > 1 ? 'Warns' : 'Warn') : (h.cantidad > 1 ? 'Strikes' : 'Strike'));
        const fecha = new Date(h.ts).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });
        let motivoCorto = h.motivo || '_Sin motivo_';
        if (motivoCorto.length > 80) motivoCorto = motivoCorto.slice(0, 77) + '...';
        return {
          label: tipoTxt + ' — ' + fecha,
          value: String(h.ts),
          description: motivoCorto,
          emoji: h.tipo === 'warn' ? '⚠️' : '⛔'
        };
      });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('APEL_SEL_' + uid)
        .setPlaceholder('Seleccioná la sanción que querés apelar')
        .addOptions(opciones);

      const row = new ActionRowBuilder().addComponents(menu);

      let aviso = '';
      if (pendientes.length > 0) aviso += '\n⏳ Tenés **' + pendientes.length + '** apelación(es) **pendiente(s)** de revisión.';
      if (aunNoCumple.length > 0) aviso += '\n⏰ Tenés **' + aunNoCumple.length + '** sanción(es) que aún no cumplen el tiempo mínimo para apelar.';

      await interaction.reply({
        content: '📋 **Sanciones elegibles para apelar** (Warn: 15 días · Strike: 30 días):' + aviso,
        components: [row],
        ephemeral: true
      });
      return;
    }

    // /pfa hoy — ver horas del día actual de un PFA
    if (sub === 'hoy') {
      const oficial = interaction.options.getUser('oficial');
      const oid = oficial.id;
      const ahoraMs = Date.now();
      const inicioDiaMs = ahoraMs - (24 * 60 * 60 * 1000);

      // Sesiones cerradas en las últimas 24h
      const sesionesHoy = ((semanaFichajes[oid] || {}).sesiones || []).filter(s => {
        const finMs = new Date(s.fin).getTime();
        return finMs > inicioDiaMs && finMs <= ahoraMs;
      });

      let msTotal = 0;
      let huboEstelar = false;
      for (const s of sesionesHoy) {
        msTotal += s.ms || 0;
        if ((s.multiplicador || 1) > 1) huboEstelar = true;
      }

      // Fichaje activo en este momento (si está abierto)
      let activoTxt = '_Sin fichaje abierto._';
      let msActivo = 0;
      if (fichajesActivos[oid]) {
        const inicio = new Date(fichajesActivos[oid].inicio);
        const multi = fichajesActivos[oid].multiplicador || 1;
        const msReal = ahoraMs - inicio.getTime();
        msActivo = Math.floor(msReal * multi);
        msTotal += msActivo;
        activoTxt = '🟢 **Abierto hace ' + formatDuracion(msReal) + '**' + (multi > 1 ? ' (🌟 x' + multi + ' → contando ' + formatDuracion(msActivo) + ')' : '');
        if (multi > 1) huboEstelar = true;
      }

      // Detalle de sesiones
      let detalleSesiones = '_Sin sesiones cerradas hoy._';
      if (sesionesHoy.length > 0) {
        detalleSesiones = sesionesHoy.slice(-10).map((s, i) => {
          const horaIni = new Date(s.inicio).toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit' });
          const horaFin = new Date(s.fin).toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit' });
          const multi = s.multiplicador || 1;
          const flag = s.cierreDiario ? ' _(cierre diario auto)_' : (s.autoCloseBreak ? ' _(auto-cierre break)_' : (s.cerradoPor ? ' _(cerrado por staff)_' : ''));
          return '`' + horaIni + ' → ' + horaFin + '` · **' + formatDuracion(s.ms) + '**' + (multi > 1 ? ' (🌟 x' + multi + ')' : '') + flag;
        }).join('\n');
      }

      const fechaTxt = new Date(ahoraMs).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric', month: 'long', year: 'numeric' });

      const embed = new EmbedBuilder()
        .setTitle('⏱️ Actividad de Hoy — ' + (oficial.username || ''))
        .setColor(huboEstelar ? 0xFFD700 : 0x22AA44)
        .setThumbnail(oficial.displayAvatarURL())
        .setDescription('Resumen de las últimas 24 horas de <@' + oid + '>.')
        .addFields(
          { name: '📅 Fecha', value: fechaTxt, inline: true },
          { name: '📊 Total contabilizado HOY', value: msTotal > 0 ? '**' + formatDuracion(msTotal) + '**' + (huboEstelar ? ' 🌟' : '') : '_0h 0m_', inline: true },
          { name: '🔔 Estado actual', value: activoTxt, inline: false },
          { name: '📋 Sesiones del día (últimas 10)', value: detalleSesiones, inline: false }
        )
        .setTimestamp().setFooter({ text: 'H-50 Bot · Sistema de Fichaje' });

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // /pfa cerrar (forzar cierre de fichaje de otro PFA)
    if (sub === 'cerrar') {
      const puedeUsar = interaction.member.roles.cache.has(ROL_ENCARGADO_FICHAJE) || interaction.member.roles.cache.has(ROL_AUX_FICHAJE) || interaction.member.roles.cache.has(ROL_HEAD_PFA);
      if (!puedeUsar) {
        await interaction.reply({ content: '❌ Solo el Encargado de Fichaje, Auxiliar de Fichaje o HEAD PFA puede cerrar fichajes ajenos.', ephemeral: true });
        return;
      }
      const oficial = interaction.options.getUser('oficial');
      const oid = oficial.id;

      // Protección: si el oficial es HEAD, solo Dueños pueden cerrarle el fichaje
      try {
        const memberVerif = await interaction.guild.members.fetch(oid);
        if (memberVerif.roles.cache.has(ROL_HEAD_PFA) && !interaction.member.roles.cache.has(ROL_DUENOS)) {
          await interaction.reply({ content: '❌ Solo los **Dueños** pueden cerrar el fichaje a un HEAD PFA.', ephemeral: true });
          return;
        }
      } catch (e) { /* si no se puede verificar, continúa */ }

      if (!fichajesActivos[oid]) {
        await interaction.reply({ content: '_<@' + oid + '> no tiene fichaje abierto._', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      const inicio = new Date(fichajesActivos[oid].inicio);
      const fin = new Date();
      const msReal = fin.getTime() - inicio.getTime();
      const multiUsado = fichajesActivos[oid].multiplicador || 1;
      const ms = Math.floor(msReal * multiUsado);

      if (!semanaFichajes[oid]) semanaFichajes[oid] = { totalMs: 0, sesiones: [] };
      semanaFichajes[oid].sesiones.push({ inicio: inicio.toISOString(), fin: fin.toISOString(), msReal, multiplicador: multiUsado, ms, cerradoPor: interaction.user.id });
      semanaFichajes[oid].totalMs = (semanaFichajes[oid].totalMs || 0) + ms;

      delete fichajesActivos[oid];
      if (breaksActivos[oid]) {
        delete breaksActivos[oid];
        await guardarBreaks();
      }
      await guardarFichajesActivos();
      await guardarSemanaFichajes();

      const estelarTxt = multiUsado > 1 ? ' (🌟 x' + multiUsado + ')' : '';
      try {
        const c = await interaction.guild.channels.fetch(CANAL_LOGS_FICHAJE);

        // Armar resumen completo de la semana del oficial
        const sesionesSem = (semanaFichajes[oid] || {}).sesiones || [];
        const desglose = calcularEstelares(sesionesSem);
        const fact = semanaFacturas[oid] || { totalMonto: 0, totalCount: 0, multasMonto: 0, multasCount: 0, negroMonto: 0, negroCount: 0 };
        const antec = semanaAntecedentes[oid] || 0;
        const tickets = (registroTickets[oid] || {}).total || 0;
        const paga = Math.floor((fact.totalMonto || 0) * 0.5);
        const tieneEstelaresEmb = desglose.msEstelarBonus > 0;

        let memberCl = null;
        try { memberCl = await interaction.guild.members.fetch(oid); } catch (e) { /* puede no estar */ }
        const rango = memberCl ? detectarRango(memberCl) : null;
        const rangoTxt = rango ? (rango.categoria === 'low' ? '👮 ' : '🎖️ ') + rango.nombre + ' (' + rango.categoria.toUpperCase() + ')' : '_Sin rango detectado_';

        let evalTxt = '_Sin rango_';
        if (rango) {
          const ev = evaluarPFA(rango.categoria, oid, semanaFichajes[oid].totalMs, antec, fact.totalMonto || 0, tickets);
          if (ev.elegible && ev.doble) evalTxt = '🔥 **CANDIDATO A DOBLE ASCENSO**';
          else if (ev.elegible) evalTxt = '✅ **CANDIDATO A ASCENSO**';
          else evalTxt = '❌ Falta: ' + ev.faltantes.join(', ');
        }

        const horasField = tieneEstelaresEmb
          ? '**' + formatDuracion(semanaFichajes[oid].totalMs) + '** contadas\n⏱️ Reales: ' + formatDuracion(desglose.msReal) + '\n🌟 Bonus estelar: **+' + formatDuracion(desglose.msEstelarBonus) + '**'
          : '**' + formatDuracion(semanaFichajes[oid].totalMs) + '**';

        const sesionTxt = multiUsado > 1
          ? formatDuracion(msReal) + ' real \u2192 **' + formatDuracion(ms) + '** _(x' + multiUsado + ')_'
          : '**' + formatDuracion(ms) + '**';

        const embedLog = new EmbedBuilder()
          .setTitle('🔒 FICHAJE CERRADO POR STAFF' + estelarTxt + ' — Resumen de Actividad')
          .setColor(tieneEstelaresEmb ? 0xFFD700 : 0xCC6622)
          .setThumbnail(memberCl ? memberCl.displayAvatarURL() : oficial.displayAvatarURL())
          .setDescription('<@' + oid + '> tenía el fichaje abierto y fue cerrado por <@' + interaction.user.id + '>.')
          .addFields(
            { name: '🎖️ Rango', value: rangoTxt, inline: false },
            { name: '⏱️ Sesión cerrada', value: sesionTxt, inline: true },
            { name: '📊 Horas totales (semana)', value: horasField, inline: true },
            { name: '📋 Sesiones (semana)', value: String(sesionesSem.length) + (desglose.sesionesEstelares > 0 ? '\n🌟 con estelar: ' + desglose.sesionesEstelares : ''), inline: true },
            { name: '📄 Antecedentes', value: '**' + antec + '**', inline: true },
            { name: '🎫 Tickets', value: '**' + tickets + '**', inline: true },
            { name: '💰 Paga estimada (50%)', value: '**' + formatMonto(paga) + '**', inline: true },
            { name: '🧾 Facturación', value: '**Total:** ' + formatMonto(fact.totalMonto) + ' (' + fact.totalCount + ' fact.)\n🚓 Multas: ' + formatMonto(fact.multasMonto) + ' (' + fact.multasCount + ')\n💸 Negro: ' + formatMonto(fact.negroMonto) + ' (' + fact.negroCount + ')', inline: false },
            { name: '🎯 Evaluación de ascenso', value: evalTxt, inline: false }
          )
          .setTimestamp().setFooter({ text: 'H-50 Bot · Sistema de Fichaje · Cerrado por Staff' });

        await c.send({ embeds: [embedLog] });
      } catch (e) { console.error('Log /pfa cerrar:', e.message); }

      await interaction.editReply({ content: '✅ Fichaje de <@' + oid + '> cerrado. Contabilizó **' + formatDuracion(ms) + '**' + estelarTxt + '. Resumen completo publicado en <#' + CANAL_LOGS_FICHAJE + '>.' });

      // DM al oficial avisándole que le cerraron el fichaje
      try {
        const memberDm = await interaction.guild.members.fetch(oid);
        await memberDm.send({ content: '🔒 **Tu fichaje fue cerrado por staff**\n<@' + interaction.user.id + '> cerró tu fichaje.\nContabilizó **' + formatDuracion(ms) + '**' + estelarTxt + '.\nSi querés seguir trabajando, hacé `/pfa on` de nuevo.' });
      } catch (e) { /* DM cerrado, ignorar */ }
      return;
    }

    // /pfa factura-editar (editar factura propia)
    if (sub === 'factura-editar') {
      const data = semanaFacturas[uid];
      if (!data || !data.facturas || data.facturas.length === 0) {
        await interaction.reply({ content: '_No tenés facturas registradas esta semana._', ephemeral: true });
        return;
      }
      // Filtrar las que NO son ajustes manuales
      const facturasReales = data.facturas.filter(f => !f.ajuste && f.ts);
      if (facturasReales.length === 0) {
        await interaction.reply({ content: '_No tenés facturas editables esta semana._', ephemeral: true });
        return;
      }
      const opciones = facturasReales.slice(-25).reverse().map(f => {
        const fecha = new Date(f.ts).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit' });
        const hora = new Date(f.ts).toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit' });
        const tipoTxt = f.tipo === 'multas' ? '🚓 Multa' : '💸 Negro';
        return {
          label: 'Factura #' + (f.n || '?') + ' · ' + formatMonto(f.monto) + ' · ' + tipoTxt,
          value: String(f.ts),
          description: fecha + ' ' + hora,
          emoji: f.tipo === 'multas' ? '🚓' : '💸'
        };
      });
      const menu = new StringSelectMenuBuilder()
        .setCustomId('EDITAR_FACT_SEL_' + uid)
        .setPlaceholder('Seleccioná la factura a editar')
        .addOptions(opciones);
      await interaction.reply({ content: '📝 **Editar factura propia** — Seleccioná cuál querés corregir:', components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
      return;
    }

    // /pfa factura-head-editar (HEAD edita factura de otro)
    if (sub === 'factura-head-editar') {
      if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
        await interaction.reply({ content: '❌ Solo HEAD PFA puede editar facturas ajenas.', ephemeral: true });
        return;
      }
      const oficial = interaction.options.getUser('oficial');
      const oid = oficial.id;
      const data = semanaFacturas[oid];
      if (!data || !data.facturas || data.facturas.length === 0) {
        await interaction.reply({ content: '_<@' + oid + '> no tiene facturas esta semana._', ephemeral: true });
        return;
      }
      const facturasReales = data.facturas.filter(f => !f.ajuste && f.ts);
      if (facturasReales.length === 0) {
        await interaction.reply({ content: '_<@' + oid + '> no tiene facturas editables._', ephemeral: true });
        return;
      }
      const opciones = facturasReales.slice(-25).reverse().map(f => {
        const fecha = new Date(f.ts).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit' });
        const hora = new Date(f.ts).toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit' });
        const tipoTxt = f.tipo === 'multas' ? '🚓 Multa' : '💸 Negro';
        return {
          label: 'Factura #' + (f.n || '?') + ' · ' + formatMonto(f.monto) + ' · ' + tipoTxt,
          value: String(f.ts),
          description: fecha + ' ' + hora,
          emoji: f.tipo === 'multas' ? '🚓' : '💸'
        };
      });
      const menu = new StringSelectMenuBuilder()
        .setCustomId('EDITAR_FACT_SEL_' + oid)
        .setPlaceholder('Factura de ' + oficial.username + ' a editar')
        .addOptions(opciones);
      await interaction.reply({ content: '📝 **HEAD edita factura de <@' + oid + '>** — Seleccioná cuál corregir:', components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
      return;
    }

    // /pfa editar-sanciones (editar motivo o anular)
    if (sub === 'editar-sanciones') {
      const oficial = interaction.options.getUser('oficial');
      const oid = oficial.id;
      const data = sanciones[oid];
      if (!data || !data.historial || data.historial.length === 0) {
        await interaction.reply({ content: '_<@' + oid + '> no tiene sanciones registradas._', ephemeral: true });
        return;
      }
      // Solo warns y strikes (no escaladas internas), no apeladas ya
      const editables = data.historial.filter(h => (h.tipo === 'warn' || h.tipo === 'strike') && !h.apelacionAprobada);
      if (editables.length === 0) {
        await interaction.reply({ content: '_No hay sanciones editables (ya anuladas o no aplicables)._', ephemeral: true });
        return;
      }
      // Permisos: HEAD o el sancionador original (validamos al seleccionar)
      const esHead = interaction.member.roles.cache.has(ROL_HEAD_PFA);
      const opciones = editables.slice(-25).reverse().map(h => {
        const fecha = new Date(h.ts).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' });
        const cant = h.cantidad && h.cantidad > 1 ? h.cantidad + ' ' : '';
        const tipoTxt = cant + (h.tipo === 'warn' ? (h.cantidad > 1 ? 'Warns' : 'Warn') : (h.cantidad > 1 ? 'Strikes' : 'Strike'));
        let motivoCorto = h.motivo || '_Sin motivo_';
        if (motivoCorto.length > 80) motivoCorto = motivoCorto.slice(0, 77) + '...';
        return {
          label: tipoTxt + ' — ' + fecha,
          value: String(h.ts),
          description: motivoCorto,
          emoji: h.tipo === 'warn' ? '⚠️' : '⛔'
        };
      });
      if (!esHead) {
        // Si no es HEAD, filtrar solo las propias (no se puede hacer en options ya, filtramos antes)
        const propias = editables.filter(h => h.sancionadoPor === interaction.user.id);
        if (propias.length === 0) {
          await interaction.reply({ content: '❌ No aplicaste ninguna de las sanciones activas de <@' + oid + '>. Solo HEAD puede editar las de otros sancionadores.', ephemeral: true });
          return;
        }
      }
      const menu = new StringSelectMenuBuilder()
        .setCustomId('EDITAR_SAN_SEL_' + oid)
        .setPlaceholder('Sanción a editar')
        .addOptions(opciones);
      await interaction.reply({ content: '✏️ **Editar sanción de <@' + oid + '>** — Seleccioná cuál:\n_Después podrás cambiar el motivo o anularla escribiendo `ANULAR` como nuevo motivo._', components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
      return;
    }

    // /pfa ascendido
    if (sub === 'ascendido') {
      if (!interaction.member.roles.cache.has(ROL_HEAD_PFA)) {
        await interaction.reply({ content: '❌ Solo HEAD PFA puede registrar ascensos.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      const oficial = interaction.options.getUser('oficial');
      const oid = oficial.id;
      let member;
      try { member = await interaction.guild.members.fetch(oid); }
      catch (e) { await interaction.editReply({ content: '❌ No se pudo encontrar al usuario en el servidor.' }); return; }

      const rangoActual = detectarRango(member);
      if (!rangoActual) {
        await interaction.editReply({ content: '❌ <@' + oid + '> no tiene ningún rango PFA detectado. Verificá que tenga uno de los roles de rango antes de ascender.' });
        return;
      }

      // Calcular siguiente rango
      let nuevoRango = null;
      if (rangoActual.categoria === 'low') {
        if (rangoActual.indice < RANGOS_LOW.length - 1) {
          nuevoRango = { ...RANGOS_LOW[rangoActual.indice + 1], categoria: 'low' };
        } else {
          // Último LOW: sube al primer HIGH
          nuevoRango = { ...RANGOS_HIGH[0], categoria: 'high' };
        }
      } else if (rangoActual.categoria === 'high') {
        if (rangoActual.indice < RANGOS_HIGH.length - 1) {
          nuevoRango = { ...RANGOS_HIGH[rangoActual.indice + 1], categoria: 'high' };
        } else {
          await interaction.editReply({ content: '❌ <@' + oid + '> ya está en el rango máximo (' + rangoActual.nombre + ').' });
          return;
        }
      }

      // Aplicar cambios de roles: quitar rango actual, agregar nuevo. Si pasa de LOW a HIGH, agrega ROL_HIGH.
      try {
        await member.roles.remove(rangoActual.id, 'Ascenso por ' + interaction.user.tag);
        await member.roles.add(nuevoRango.id, 'Ascenso por ' + interaction.user.tag);
        if (rangoActual.categoria === 'low' && nuevoRango.categoria === 'high') {
          await member.roles.add(ROL_HIGH, 'Promoción a HIGH');
        }
      } catch (e) {
        console.error('Error ascendido roles:', e.message);
        await interaction.editReply({ content: '⚠️ Error al cambiar roles: ' + e.message + '\nVerificá que el bot esté arriba en la jerarquía.' });
        return;
      }

      // Registrar en historial
      ascensosHistorial[oid] = { ultimaFecha: new Date().toISOString(), registradoPor: interaction.user.id, rangoAnterior: rangoActual.nombre, rangoNuevo: nuevoRango.nombre };
      await guardarAscensosHistorial();

      // Publicar en canal de ascensos
      try {
        const c = await interaction.guild.channels.fetch(CANAL_ASCENSOS);
        const embed = new EmbedBuilder()
          .setTitle('🎖️ ASCENSO REGISTRADO')
          .setDescription('<@' + oid + '> asciende a **' + nuevoRango.nombre + '**.')
          .addFields(
            { name: 'Rango anterior', value: rangoActual.nombre, inline: true },
            { name: 'Rango nuevo', value: nuevoRango.nombre + (nuevoRango.categoria === 'high' && rangoActual.categoria === 'low' ? ' _(pasa a HIGH)_' : ''), inline: true },
            { name: 'Registrado por', value: '<@' + interaction.user.id + '>', inline: false }
          )
          .setColor(0xFFD700).setTimestamp().setFooter({ text: 'H-50 Bot · Sistema de Ascensos' });
        await c.send({ content: '🎉 ¡Felicitaciones <@' + oid + '>!', embeds: [embed] });
      } catch (e) { console.error('Log ascendido:', e.message); }

      await interaction.editReply({ content: '✅ <@' + oid + '> ascendió de **' + rangoActual.nombre + '** a **' + nuevoRango.nombre + '**. Roles actualizados y ciclo reiniciado. Ver <#' + CANAL_ASCENSOS + '>.' });
      return;
    }

    // /pfa historial
    if (sub === 'historial') {
      const puedeUsar = interaction.member.roles.cache.has(ROL_HIGH) || interaction.member.roles.cache.has(ROL_HEAD_PFA);
      if (!puedeUsar) {
        await interaction.reply({ content: '❌ Solo HIGH o HEAD PFA puede ver historiales.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });
      const oficial = interaction.options.getUser('oficial');
      const oid = oficial.id;
      let member = null;
      try { member = await interaction.guild.members.fetch(oid); } catch (e) { /* puede no estar en el server */ }

      const rangoActual = member ? detectarRango(member) : null;
      const data = sanciones[oid] || { warns: 0, strikes: 0, historial: [] };

      // Buscar última salida (blacklist o demote)
      const ultimoEgreso = [...(data.historial || [])].reverse().find(h => h.tipo === 'blacklist' || h.tipo === 'demote_auto');

      // Estado actual del oficial
      let estadoTxt;
      if (rangoActual) {
        estadoTxt = '🟢 **Activo** — ' + (rangoActual.categoria === 'low' ? '👮 ' : '🎖️ ') + rangoActual.nombre + ' (' + rangoActual.categoria.toUpperCase() + ')';
      } else if (member && member.roles.cache.has(ROL_BLACKLIST)) {
        estadoTxt = '⚫ **Blacklist** — Removido definitivamente del PFA';
      } else if (member && member.roles.cache.has(ROL_CIVIL)) {
        estadoTxt = '⬇️ **Demoteado** — Fuera del PFA (puede volver)';
      } else if (!member) {
        estadoTxt = '👻 **Ya no está en el servidor**';
      } else {
        estadoTxt = '❓ Sin rango PFA detectado';
      }

      // Info del último egreso (cómo y por qué se fue)
      let egresoTxt = '_No hay registro de salida del PFA._';
      if (ultimoEgreso) {
        const t = '<t:' + Math.floor(ultimoEgreso.ts / 1000) + ':F>';
        const tipo = ultimoEgreso.tipo === 'blacklist' ? '⚫ **BLACKLIST**' : '⬇️ **DEMOTE**';
        const auto = ultimoEgreso.auto ? ' _(automático por 3er strike)_' : '';
        const rangoEra = ultimoEgreso.rangoAnterior || '_desconocido_';
        const volverTxt = (ultimoEgreso.tipo === 'demote_auto' && ultimoEgreso.puedeVolverTs)
          ? '\n🔄 Puede volver: <t:' + Math.floor(ultimoEgreso.puedeVolverTs / 1000) + ':D>'
          : (ultimoEgreso.tipo === 'blacklist' ? '\n🚫 Salida permanente' : '');
        egresoTxt = tipo + auto + '\n📅 ' + t + '\n📌 Rango cuando se fue: **' + rangoEra + '**\n📝 Motivo: ' + (ultimoEgreso.motivo || '_Sin motivo_') + '\n🔨 Aplicado por: <@' + ultimoEgreso.sancionadoPor + '>' + volverTxt;
      }

      // Contadores de sanciones históricas
      let totalWarns = 0, totalStrikes = 0, totalBlacklists = 0, totalDemotes = 0, totalApeladasOK = 0, totalResigns = 0;
      for (const h of (data.historial || [])) {
        if (h.tipo === 'warn') totalWarns += (h.cantidad || 1);
        else if (h.tipo === 'strike') totalStrikes += (h.cantidad || 1);
        else if (h.tipo === 'blacklist') totalBlacklists++;
        else if (h.tipo === 'demote_auto') totalDemotes++;
        else if (h.tipo === 'resign') totalResigns++;
        if (h.apelacionAprobada) totalApeladasOK++;
      }

      // Historial completo (las 25 más recientes)
      const ultimas = (data.historial || []).slice(-25).reverse();
      const lineas = ultimas.map(h => {
        const t = '<t:' + Math.floor(h.ts / 1000) + ':d>';
        const apelTag = h.apelacionAprobada ? ' ↩️ _apelada_' : '';
        const cant = h.cantidad && h.cantidad > 1 ? h.cantidad + ' ' : '';
        if (h.tipo === 'warn') return '⚠️ **' + cant + 'Warn' + (h.cantidad > 1 ? 's' : '') + '** · ' + t + apelTag + '\n_' + h.motivo + '_';
        if (h.tipo === 'strike') return '⛔ **' + cant + 'Strike' + (h.cantidad > 1 ? 's' : '') + '** · ' + t + apelTag + '\n_' + h.motivo + '_';
        if (h.tipo === 'escalada_strike') return '⬆️ Escalada a strike · ' + t;
        if (h.tipo === 'demote_auto') return '⬇️ **DEMOTE** · ' + t + '\n_' + h.motivo + '_';
        if (h.tipo === 'blacklist') return '⚫ **BLACKLIST** · ' + t + '\n_' + h.motivo + '_';
        if (h.tipo === 'resign') return '👋 **RESIGN** · ' + t + '\n_' + h.motivo + '_';
        if (h.tipo === 'pre_demote_auto' || h.tipo === 'pre_blacklist_auto') return null;
        return '· ' + h.tipo + ' · ' + t;
      }).filter(Boolean).join('\n\n');

      const ultAsc = ascensosHistorial[oid];
      const ultAscTxt = ultAsc ? '<t:' + Math.floor(new Date(ultAsc.ultimaFecha).getTime() / 1000) + ':R>' : '_Sin registro de ascenso_';

      // Info de ingreso (quién lo trajo)
      const ing = ingresosPFA[oid];
      let ingresoTxt = '_Sin registro (ingresó antes de la implementación del sistema)_';
      if (ing) {
        const comandoTxt = ing.comando === 'new' ? '📝 `/new`' : '🔄 `/return`';
        const rangoInicial = ing.rangoInicial + (ing.categoria ? ' _(' + ing.categoria.toUpperCase() + ')_' : '');
        ingresoTxt = '<@' + ing.ingresadoPor + '> · ' + comandoTxt + '\nRango inicial: **' + rangoInicial + '**\n<t:' + Math.floor(ing.ts / 1000) + ':F>';
      }

      // Info de advertencias por farmeo
      const advF = advertenciasFichaje[oid];
      let advTxt = '⚠️ Sin advertencias';
      if (advF && (advF.count > 0 || advF.ciclo > 0)) {
        const historialAdv = (advF.historial || []).filter(h => !h.anulada);
        advTxt = '⚠️ **' + advF.count + '/3** advertencias activas · Ciclo #**' + ((advF.ciclo || 0) + 1) + '**\n_Total histórico (no anuladas):_ ' + historialAdv.length;
      }

      // Ausencia activa
      let ausenciaTxt = '_Sin ausencia activa_';
      const ausActiva = tieneAusenciaActiva(oid) ? (ausencias[oid] || []).find(a => a.aprobada && !a.finalizada) : null;
      if (ausActiva) {
        const finTs = new Date(ausActiva.hasta).getTime();
        ausenciaTxt = '🏥 **Activa hasta:** <t:' + Math.floor(finTs / 1000) + ':D>\n_Motivo:_ ' + (ausActiva.motivo || '_sin motivo_');
      }

      // BL activo con expiración
      let blActivoTxt = null;
      const blAct = blacklistsActivas[oid];
      if (blAct) {
        const expTxt = blAct.expira ? '<t:' + Math.floor(blAct.expira / 1000) + ':F>' : '**Nunca (permanente)**';
        blActivoTxt = '⚫ **BL activo**\nAplicado: <t:' + Math.floor(blAct.ts / 1000) + ':D>\nDuración: ' + (blAct.dias ? blAct.dias + ' días' : 'permanente') + '\nExpira: ' + expTxt + '\nMotivo: _' + blAct.motivo + '_';
      }

      const embed = new EmbedBuilder()
        .setTitle('📜 Historial — ' + ((member && member.displayName) || oficial.username))
        .setThumbnail((member && member.displayAvatarURL()) || oficial.displayAvatarURL())
        .setColor(0x6B4F8C)
        .addFields(
          { name: '📍 Estado actual', value: estadoTxt, inline: false },
          { name: '👤 Ingresado por', value: ingresoTxt, inline: false },
          { name: '⚠️ Advertencias por farmeo', value: advTxt, inline: false },
          { name: '🏥 Ausencia', value: ausenciaTxt, inline: false }
        );

      if (blActivoTxt) {
        embed.addFields({ name: '⚫ Blacklist activo', value: blActivoTxt, inline: false });
      }

      embed.addFields(
        { name: '🚪 Último egreso del PFA', value: egresoTxt, inline: false },
        { name: '📅 Último ascenso', value: ultAscTxt, inline: true },
        { name: '📊 Estado activo de sanciones', value: '⚠️ Warns: **' + data.warns + '/2** · ⛔ Strikes: **' + data.strikes + '/2**', inline: false },
        { name: '📈 Totales históricos', value: '⚠️ ' + totalWarns + ' warns · ⛔ ' + totalStrikes + ' strikes · ⬇️ ' + totalDemotes + ' demotes · ⚫ ' + totalBlacklists + ' blacklists · 👋 ' + totalResigns + ' resigns · ↩️ ' + totalApeladasOK + ' apeladas', inline: false }
      );
      embed.setTimestamp().setFooter({ text: 'H-50 Bot · Historial completo' });

      if (lineas.length > 0) {
        const valor = lineas.length > 1024 ? lineas.slice(0, 1021) + '...' : lineas;
        embed.addFields({ name: '📋 Últimas entradas (máx 25)', value: valor, inline: false });
      } else {
        embed.addFields({ name: '📋 Historial', value: '_Sin sanciones registradas._', inline: false });
      }

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // /pfa reiniciar
    if (sub === 'reiniciar') {
      const puedeUsar = interaction.member.roles.cache.has(ROL_DUENOS) || interaction.member.roles.cache.has(ROL_DEVELOPER);
      if (!puedeUsar) {
        await interaction.reply({ content: '❌ Solo Dueños o Developer puede reiniciar el bot.', ephemeral: true });
        return;
      }
      await interaction.deferReply({ ephemeral: true });

      // Guardar TODO antes de reiniciar
      const guardados = [];
      try { await guardarFichajesActivos(); guardados.push('fichajes activos'); } catch (e) { console.error('Reinicio: fichajesActivos:', e.message); }
      try { await guardarSemanaFichajes(); guardados.push('semana fichajes'); } catch (e) { console.error('Reinicio: semanaFichajes:', e.message); }
      try { await guardarSemanaFacturas(); guardados.push('semana facturas'); } catch (e) { console.error('Reinicio: semanaFacturas:', e.message); }
      try { await guardarAntecedentes(); guardados.push('antecedentes'); } catch (e) { console.error('Reinicio: antecedentes:', e.message); }
      try { await guardarTickets(); guardados.push('tickets'); } catch (e) { console.error('Reinicio: tickets:', e.message); }
      try { await guardarTicketsActivos(); guardados.push('tickets activos'); } catch (e) { console.error('Reinicio: ticketsActivos:', e.message); }
      try { await guardarAscensosHistorial(); guardados.push('ascensos'); } catch (e) { console.error('Reinicio: ascensos:', e.message); }
      try { await guardarSanciones(); guardados.push('sanciones'); } catch (e) { console.error('Reinicio: sanciones:', e.message); }
      try { await guardarAusencias(); guardados.push('ausencias'); } catch (e) { console.error('Reinicio: ausencias:', e.message); }
      try { await guardarApelaciones(); guardados.push('apelaciones'); } catch (e) { console.error('Reinicio: apelaciones:', e.message); }
      try { await guardarEstelares(); guardados.push('estelares'); } catch (e) { console.error('Reinicio: estelares:', e.message); }
      try { await guardarBreaks(); guardados.push('breaks'); } catch (e) { console.error('Reinicio: breaks:', e.message); }

      console.log('[REINICIO] Iniciado por ' + interaction.user.tag + ' (' + interaction.user.id + ') a ' + new Date().toISOString());
      console.log('[REINICIO] Guardados: ' + guardados.join(', '));

      await interaction.editReply({
        content: '🔄 **Bot reiniciándose...**\n\n' +
          '✅ Datos guardados: **' + guardados.length + '** archivos\n' +
          '_(' + guardados.join(', ') + ')_\n\n' +
          'Railway lo va a levantar de nuevo en ~10-30 segundos. Cuando vuelva, los fichajes abiertos van a seguir activos sin perder tiempo.'
      });

      // Esperar 2 segundos para que el mensaje se envíe, después salir
      setTimeout(() => {
        console.log('[REINICIO] Saliendo del proceso...');
        process.exit(0);
      }, 2000);
      return;
    }

    return;
  }

  // ==================== /encuesta ====================
  if (interaction.isChatInputCommand() && interaction.commandName === 'encuesta') {
    const esHeadDueno = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_DUENOS);
    if (!esHeadDueno) { await interaction.reply({ content: '❌ Solo HEAD PFA o Dueños pueden crear encuestas.', ephemeral: true }); return; }
    // La encuesta se puede usar en cualquier canal (restricción de canal removida).
    await interaction.deferReply();

    const pregunta = interaction.options.getString('pregunta');
    const duracion = interaction.options.getString('duracion');
    const opciones = [
      interaction.options.getString('opcion1'),
      interaction.options.getString('opcion2'),
      interaction.options.getString('opcion3'),
      interaction.options.getString('opcion4'),
      interaction.options.getString('opcion5')
    ].filter(o => o && o.trim().length > 0);

    const duracionesMs = { '1h': 3600000, '6h': 21600000, '24h': 86400000, '3d': 259200000, '7d': 604800000 };
    const duracionMs = duracionesMs[duracion];
    const expiraEn = Date.now() + duracionMs;

    const emojisNumeros = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    const descOpciones = opciones.map((o, i) => `${emojisNumeros[i]} **${o}**\n\`▱▱▱▱▱▱▱▱▱▱\` 0 votos (0%)`).join('\n\n');

    const embed = new EmbedBuilder()
      .setTitle('📊 ENCUESTA')
      .setDescription(`**${pregunta}**\n\n${descOpciones}`)
      .addFields(
        { name: '⏱️ Cierra', value: `<t:${Math.floor(expiraEn / 1000)}:R>`, inline: true },
        { name: '👤 Creada por', value: `<@${interaction.user.id}>`, inline: true },
        { name: '🗳️ Votos totales', value: '**0**', inline: true }
      )
      .setColor(0x3498DB)
      .setFooter({ text: 'H-50 Bot · Voto único · No se puede cambiar' })
      .setTimestamp();

    // Botones (hasta 5 por fila, máximo 5 botones)
    const row = new ActionRowBuilder();
    for (let i = 0; i < opciones.length; i++) {
      row.addComponents(new ButtonBuilder()
        .setCustomId(`ENCUESTA_VOTO_${i}`)
        .setLabel(opciones[i].length > 20 ? opciones[i].slice(0, 17) + '...' : opciones[i])
        .setEmoji(emojisNumeros[i])
        .setStyle(ButtonStyle.Secondary));
    }

    const rowVotantes = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ENCUESTA_VOTANTES').setLabel('Ver votantes').setStyle(ButtonStyle.Primary)
    );
    const msg = await interaction.editReply({ content: '<@&' + ROL_PFA + '>', embeds: [embed], components: [row, rowVotantes], allowedMentions: { roles: [ROL_PFA] } });
    encuestasActivas[msg.id] = {
      pregunta, opciones, canalId: interaction.channelId, expiraEn,
      votos: {}, creadaPor: interaction.user.id
    };
    guardarEncuestas().catch(e => console.error('Save encuestas:', e.message));
    programarCierreEncuesta(msg.id, duracionMs);
    return;
  }

  // ==================== /votantes ====================
  if (interaction.isChatInputCommand() && interaction.commandName === 'votantes') {
    const esHeadDueno = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_DUENOS);
    if (!esHeadDueno) { await interaction.reply({ content: '❌ Solo HEAD PFA o Dueños pueden ver los votantes.', ephemeral: true }); return; }
    const ref = (interaction.options.getString('mensaje') || '').trim();
    const encontrados = ref.match(/(\d{15,25})/g) || [];
    const msgId = encontrados.length ? encontrados[encontrados.length - 1] : null; // último número largo = ID del mensaje (sirve con ID o link)
    if (!msgId) { await interaction.reply({ content: '❌ Pasá el ID o el link del mensaje de la encuesta. (En Discord: click derecho sobre la encuesta → Copiar ID del mensaje, o Copiar enlace del mensaje.)', ephemeral: true }); return; }
    const enc = encuestasActivas[msgId];
    if (!enc) { await interaction.reply({ content: '❌ No encontré una encuesta activa con ese mensaje. Puede haber cerrado ya o haberse creado antes de un redeploy.', ephemeral: true }); return; }
    await interaction.reply({ content: encuestaVotantesTexto(enc), ephemeral: true, allowedMentions: { parse: [] } });
    return;
  }

  // ==================== /sorteo ====================
  if (interaction.isChatInputCommand() && interaction.commandName === 'sorteo') {
    const esHeadDueno = interaction.member.roles.cache.has(ROL_HEAD_PFA) || interaction.member.roles.cache.has(ROL_DUENOS);
    if (!esHeadDueno) { await interaction.reply({ content: '❌ Solo HEAD PFA o Dueños pueden crear sorteos.', ephemeral: true }); return; }
    if (interaction.channelId !== CANAL_ENCUESTAS_SORTEOS) {
      await interaction.reply({ content: '❌ Este comando solo se puede usar en <#' + CANAL_ENCUESTAS_SORTEOS + '>.', ephemeral: true });
      return;
    }
    await interaction.deferReply();

    const premio = interaction.options.getString('premio');
    const duracion = interaction.options.getString('duracion');
    const ganadores = interaction.options.getInteger('ganadores');
    const descripcion = interaction.options.getString('descripcion') || '';
    const minHoras = interaction.options.getInteger('min_horas') || 0;

    const duracionesMs = { '1h': 3600000, '6h': 21600000, '24h': 86400000, '3d': 259200000, '7d': 604800000 };
    const duracionMs = duracionesMs[duracion];
    const expiraEn = Date.now() + duracionMs;

    const requisitos = minHoras > 0
      ? `**⚠️ Requisitos para participar:**\n• Ser oficial PFA activo (LOW / HIGH / HEAD)\n• Tener **mínimo ${minHoras} horas** trabajadas esta semana`
      : `**Requisitos:** Ser oficial PFA activo (LOW / HIGH / HEAD)`;

    const embed = new EmbedBuilder()
      .setTitle('🎉 SORTEO OFICIAL — PFA')
      .setDescription(`## 🏆 ${premio}\n${descripcion ? `\n_${descripcion}_\n` : ''}\n${requisitos}`)
      .addFields(
        { name: '🎁 Cantidad de ganadores', value: `**${ganadores}**`, inline: true },
        { name: '⏱️ Cierra', value: `<t:${Math.floor(expiraEn / 1000)}:R>`, inline: true },
        { name: '👤 Organiza', value: `<@${interaction.user.id}>`, inline: true },
        { name: '👥 Participantes', value: '**0**', inline: true }
      )
      .setColor(0xE67E22)
      .setFooter({ text: 'H-50 Bot · Presioná el botón para participar' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('SORTEO_PARTICIPAR').setLabel('PARTICIPAR').setEmoji('🎉').setStyle(ButtonStyle.Success)
    );

    const msg = await interaction.editReply({ embeds: [embed], components: [row] });
    sorteosActivos[msg.id] = {
      premio, descripcion, ganadores, minHoras, canalId: interaction.channelId,
      expiraEn, participantes: [], creadoPor: interaction.user.id
    };
    guardarSorteos().catch(e => console.error('Save sorteos:', e.message));
    programarCierreSorteo(msg.id, duracionMs);
    return;
  }

  // Robos normales
  const roboKey = interaction.commandName;
  const robo = ROBOS[roboKey];
  if (!robo) return;
  if (!await enH50()) { await interaction.reply({ content: '❌ Solo podés usar este comando desde el canal **H-50**.', ephemeral: true }); return; }
  const cantidad = interaction.options.getInteger('cantidad');
  const ubicacion = TIENDAS.includes(roboKey) ? interaction.options.getString('ubicacion') : robo.nombre;
  await interaction.deferReply({ ephemeral: true });
  await asignarPersonal(interaction, roboKey, robo, cantidad, ubicacion);
});

// ==================== ENCUESTAS Y SORTEOS — CIERRE AUTOMÁTICO ====================
async function cerrarEncuesta(msgId) {
  const enc = encuestasActivas[msgId];
  if (!enc) return;
  delete encuestasActivas[msgId];
  guardarEncuestas().catch(e => console.error('Save encuestas:', e.message));

  try {
    const canal = await client.channels.fetch(enc.canalId);
    const msg = await canal.messages.fetch(msgId);

    const emojisNumeros = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    const totalVotos = Object.keys(enc.votos).length;
    const conteos = enc.opciones.map((_, i) => Object.values(enc.votos).filter(v => v === i).length);
    const maxVotos = Math.max(...conteos);
    const ganadoresIdx = conteos.map((c, i) => c === maxVotos && c > 0 ? i : -1).filter(i => i >= 0);

    const descOpciones = enc.opciones.map((o, i) => {
      const votos = conteos[i];
      const pct = totalVotos === 0 ? 0 : Math.round((votos / totalVotos) * 100);
      const llenos = Math.round(pct / 10);
      const barra = '▰'.repeat(llenos) + '▱'.repeat(10 - llenos);
      const trofeo = ganadoresIdx.includes(i) ? ' 🏆' : '';
      return `${emojisNumeros[i]} **${o}**${trofeo}\n\`${barra}\` ${votos} voto${votos === 1 ? '' : 's'} (${pct}%)`;
    }).join('\n\n');

    let resultado;
    if (totalVotos === 0) {
      resultado = '_Nadie votó en esta encuesta._';
    } else if (ganadoresIdx.length === 1) {
      resultado = `🏆 **Ganó:** ${enc.opciones[ganadoresIdx[0]]}`;
    } else {
      resultado = `🤝 **Empate entre:** ${ganadoresIdx.map(i => enc.opciones[i]).join(', ')}`;
    }

    const nuevoEmbed = new EmbedBuilder()
      .setTitle('📊 ENCUESTA CERRADA')
      .setDescription(`**${enc.pregunta}**\n\n${descOpciones}\n\n${resultado}`)
      .addFields(
        { name: '🗳️ Votos totales', value: `**${totalVotos}**`, inline: true },
        { name: '👤 Creada por', value: `<@${enc.creadaPor}>`, inline: true }
      )
      .setColor(0x95A5A6)
      .setFooter({ text: 'H-50 Bot · Encuesta finalizada' })
      .setTimestamp();

    await msg.edit({ embeds: [nuevoEmbed], components: [] });
  } catch (err) { console.error('Cerrar encuesta:', err.message); }
}

async function cerrarSorteo(msgId) {
  const sor = sorteosActivos[msgId];
  if (!sor) return;
  delete sorteosActivos[msgId];
  guardarSorteos().catch(e => console.error('Save sorteos:', e.message));

  try {
    const canal = await client.channels.fetch(sor.canalId);
    const msg = await canal.messages.fetch(msgId);

    // Elegir ganadores aleatorios
    const totalPart = sor.participantes.length;
    const cantGanadores = Math.min(sor.ganadores, totalPart);
    const pool = [...sor.participantes];
    const ganadores = [];
    for (let i = 0; i < cantGanadores; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      ganadores.push(pool.splice(idx, 1)[0]);
    }

    let ganadoresTxt;
    if (totalPart === 0) {
      ganadoresTxt = '_Nadie participó en el sorteo._';
    } else {
      ganadoresTxt = ganadores.map((uid, i) => `${i + 1}. <@${uid}>`).join('\n');
    }

    const nuevoEmbed = new EmbedBuilder()
      .setTitle('🎉 SORTEO FINALIZADO — PFA')
      .setDescription(`## 🏆 ${sor.premio}\n${sor.descripcion ? `\n_${sor.descripcion}_\n` : ''}\n**🎊 ${cantGanadores === 1 ? 'Ganador' : 'Ganadores'}:**\n${ganadoresTxt}`)
      .addFields(
        { name: '👥 Total de participantes', value: `**${totalPart}**`, inline: true },
        { name: '👤 Organizó', value: `<@${sor.creadoPor}>`, inline: true }
      )
      .setColor(0xF1C40F)
      .setFooter({ text: 'H-50 Bot · Sorteo finalizado' })
      .setTimestamp();

    await msg.edit({ content: totalPart > 0 ? '🎉 ' + ganadores.map(uid => `<@${uid}>`).join(' ') : '', embeds: [nuevoEmbed], components: [] });

    // DM a los ganadores
    for (const uid of ganadores) {
      try {
        const guild = client.guilds.cache.first();
        const member = await guild.members.fetch(uid);
        await member.send({
          content: `🎉 **¡Fuiste elegido ganador del sorteo!**\n\n🏆 **Premio:** ${sor.premio}\n${sor.descripcion ? `\n_${sor.descripcion}_\n` : ''}\nContactate con <@${sor.creadoPor}> para reclamar tu premio.\n\n_— PFA Kilombo RP_`
        });
      } catch (e) { /* DM cerrado */ }
    }
  } catch (err) { console.error('Cerrar sorteo:', err.message); }
}

function programarCierreEncuesta(msgId, duracionMs) {
  setTimeout(() => cerrarEncuesta(msgId).catch(e => console.error('Cierre encuesta:', e.message)), duracionMs);
}
function programarCierreSorteo(msgId, duracionMs) {
  setTimeout(() => cerrarSorteo(msgId).catch(e => console.error('Cierre sorteo:', e.message)), duracionMs);
}

function restaurarTimersEncuestasSorteos() {
  const ahora = Date.now();
  for (const [msgId, enc] of Object.entries(encuestasActivas)) {
    const restante = enc.expiraEn - ahora;
    if (restante <= 0) cerrarEncuesta(msgId).catch(e => console.error(e));
    else programarCierreEncuesta(msgId, restante);
  }
  for (const [msgId, sor] of Object.entries(sorteosActivos)) {
    const restante = sor.expiraEn - ahora;
    if (restante <= 0) cerrarSorteo(msgId).catch(e => console.error(e));
    else programarCierreSorteo(msgId, restante);
  }
  console.log('Timers de encuestas/sorteos restaurados:', Object.keys(encuestasActivas).length + Object.keys(sorteosActivos).length);
}

// ==================== HEALTHCHECK HTTP SERVER ====================
// Endpoint público para monitoreo externo (UptimeRobot, etc.)
// Devuelve 200 OK si el bot está conectado a Discord, 503 si no.
const http = require('http');
const HEALTH_PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  const url = req.url || '/';
  if (url === '/healthcheck' || url === '/health' || url === '/') {
    const conectado = client.isReady();
    const uptime = process.uptime();
    const memMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const status = conectado ? 200 : 503;
    const body = JSON.stringify({
      status: conectado ? 'OK' : 'DISCONNECTED',
      botOnline: conectado,
      uptime_seconds: Math.floor(uptime),
      memory_mb: memMB,
      timestamp: new Date().toISOString()
    });
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(body);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}).listen(HEALTH_PORT, () => {
  console.log('[HEALTH] Servidor HTTP en puerto ' + HEALTH_PORT + ' (endpoint /healthcheck)');
});

// ==================== WATCHDOG DE AUTO-RECUPERACIÓN ====================
// Si el bot está desconectado por más de 3 minutos, mata el proceso.
// Railway lo va a reiniciar automáticamente.
let desconectadoDesde = null;
const WATCHDOG_INTERVALO_MS = 30 * 1000;              // chequear cada 30 seg
const WATCHDOG_TOLERANCIA_MS = 3 * 60 * 1000;         // esperar 3 min antes de matar
const WATCHDOG_ARRANQUE_MS = 60 * 1000;               // ignorar los primeros 60 seg de arranque

setInterval(() => {
  if (process.uptime() * 1000 < WATCHDOG_ARRANQUE_MS) return; // dar tiempo al arranque

  const conectado = client.isReady();
  if (conectado) {
    if (desconectadoDesde !== null) {
      console.log('[WATCHDOG] Reconectado tras haber estado caído.');
      desconectadoDesde = null;
    }
    return;
  }

  if (desconectadoDesde === null) {
    desconectadoDesde = Date.now();
    console.warn('[WATCHDOG] Bot detectado como desconectado. Iniciando conteo de tolerancia (3 min).');
    return;
  }

  const tiempoDesconectado = Date.now() - desconectadoDesde;
  if (tiempoDesconectado > WATCHDOG_TOLERANCIA_MS) {
    console.error('[WATCHDOG] Bot desconectado por más de 3 minutos. Matando proceso para que Railway lo reinicie.');
    process.exit(1);
  } else {
    const restanteSeg = Math.round((WATCHDOG_TOLERANCIA_MS - tiempoDesconectado) / 1000);
    console.warn('[WATCHDOG] Bot sigue desconectado. Reinicio en ' + restanteSeg + ' segundos si no se recupera.');
  }
}, WATCHDOG_INTERVALO_MS);

// Handlers de eventos de desconexión del cliente Discord
client.on('shardDisconnect', (event, shardId) => {
  console.warn('[DISCORD] Shard ' + shardId + ' desconectado. Código: ' + event.code);
});
client.on('shardError', (err, shardId) => {
  console.error('[DISCORD] Error en shard ' + shardId + ':', err.message);
});
client.on('error', (err) => {
  console.error('[DISCORD] Error general del cliente:', err.message);
});

// Handlers de errores globales del proceso (por si algún error async no capturado)
process.on('unhandledRejection', (err) => {
  console.error('[GLOBAL] Unhandled promise rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('[GLOBAL] Uncaught exception:', err);
});

// Verificar token antes del login
if (!process.env.TOKEN) {
  console.error('[FATAL] La variable de entorno TOKEN no está definida en Railway. Configurala y redeployá.');
  process.exit(1);
}
console.log('[LOGIN] Iniciando conexión a Discord con token (longitud: ' + process.env.TOKEN.length + ' caracteres, empieza con: ' + process.env.TOKEN.slice(0, 5) + '...)');

client.login(process.env.TOKEN)
  .then(() => {
    console.log('[LOGIN] client.login() resuelto correctamente. Esperando evento "ready"...');
  })
  .catch((err) => {
    console.error('[LOGIN] ERROR CRÍTICO al conectarse a Discord:');
    console.error('[LOGIN] Mensaje:', err.message);
    console.error('[LOGIN] Código:', err.code);
    if (err.message && err.message.includes('TOKEN_INVALID')) {
      console.error('[LOGIN] >>> El TOKEN es inválido. Andá al Developer Portal, reseteá el token y actualizalo en Railway.');
    } else if (err.message && err.message.includes('DisallowedIntents')) {
      console.error('[LOGIN] >>> Faltan Privileged Intents. Andá al Developer Portal → Bot → activá "Server Members" y "Message Content".');
    } else {
      console.error('[LOGIN] >>> Error desconocido. Puede ser rate limit de Discord (esperar 30 min) o problema de red de Railway.');
    }
    // No salimos inmediatamente - dejamos que el watchdog haga su trabajo por si es un error temporal
  });
