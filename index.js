require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Manejo global de errores para que un crash no tumbe el proceso
process.on('unhandledRejection', (err) => {
  console.error('[GLOBAL] Unhandled promise rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('[GLOBAL] Uncaught exception:', err);
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

// ==================== CONSTANTES ====================
const GITHUB_REPO       = 'webstudios-ar/halcon-bot';

const CANAL_PANEL       = '1523848151763783690';   // panel con botón POSTULARSE
const CANAL_APROBACION  = '1523830367889522878';   // donde llegan las postulaciones para aprobar
const CANAL_RESULTADOS  = '1523831102614143187';   // archivo de exámenes con resultado final (privado para roles autorizados)
const CANAL_RESULTADO   = '1523831102614143187';   // resultado final aprobado/rechazado
const CANAL_UPDATES     = '1493446131663896626';
const CANAL_OPERATIVOS  = '1523846077038596197';

const ROL_HALCON_BASE   = '1466327608697290854';   // rol grupal "Halcón"
const ROL_MIEMBRO       = '1459343074378387591';   // rol "Miembro Halcón"
const ROL_CADETE        = '1494247166053449798';   // rol "Cadete Halcón"
const ROL_DUENO_HALCON  = '1474197418890362911';
const ROL_DUENO_GENERAL = '1452149338049613864'; // Dueño general del server (para bypass de testing)

const ROLES_AUTORIZADOS = ['1474197418890362911','1460348058888830976','1466331349945155615'];

// Anti-copia
const TIEMPO_MAX_POSTULACION_MS = 15 * 60 * 1000;      // 15 minutos para completar
const COOLDOWN_POSTULACION_MS   = 24 * 60 * 60 * 1000; // 24 horas post rechazo/timeout

const RANGOS = {
  '1459343074378387591': 'Miembro Halcón',
  '1460777138129998025': 'Teniente Halcón',
  '1476854892181065739': 'Capitán Halcón',
  '1466328471536930846': 'Comandante Halcón',
  '1466331349945155615': 'Jefe Halcón',
  '1466331228864254002': 'Sub Jefe Halcón',
  '1460348058888830976': 'Director/a Halcón',
};

// Lista de robos con la cantidad correcta de latas por cada uno
const ROBOS = [
  { nombre: 'Gasolinera / Tienda', latas: 0 },
  { nombre: 'Bancos Fleeca',       latas: 3 },
  { nombre: 'Facebook',            latas: 3 },
  { nombre: 'Casa Michael',        latas: 2 },
  { nombre: 'Banco Central',       latas: 6 },
  { nombre: 'Maze Bank',           latas: 3 },
  { nombre: 'Humane',              latas: 6 },
  { nombre: 'Joyería',             latas: 2 },
  { nombre: 'Estadio',             latas: 3 },
  { nombre: 'Subte',               latas: 4 },
  { nombre: 'Rancho Abandonado',   latas: 4 },
  { nombre: 'Carnicería',          latas: 8 },
  { nombre: 'Yate',                latas: 3 },
  { nombre: 'Museo',               latas: 3 },
  { nombre: 'Fábrica',             latas: 6 },
];

function elegirRobosAlAzar(cantidad) {
  const copia = [...ROBOS];
  const elegidos = [];
  for (let i = 0; i < cantidad && copia.length > 0; i++) {
    const idx = Math.floor(Math.random() * copia.length);
    elegidos.push(copia.splice(idx, 1)[0]);
  }
  return elegidos;
}

const TODOS_ROLES_HALCON = [
  '1466327608697290854', '1474197418890362911', '1460348058888830976',
  '1466331349945155615', '1466331228864254002', '1466328471536930846',
  '1476854892181065739', '1460777138129998025', '1494247166053449798',
  '1459343074378387591',
];

// ==================== ESTADO EN MEMORIA ====================
const asistentes = {}; // { messageId: [userId, ...] }
// Postulaciones en curso: { userId: { inicio, expiraTs, timeoutId, datos: {...} } }
const postulacionesActivas = {};
// Cooldowns tras rechazo o timeout, persistido: { userId: expiraTs }
let postulacionesCooldown = {};
let botListo = false;

const fecha = () => new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ==================== PERSISTENCIA (asistentes de operativos) ====================
async function guardarAsistentes() {
  try {
    const res = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/asistentes.json', {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    const sha = res.status !== 404 ? (await res.json()).sha : null;
    const content = Buffer.from(JSON.stringify(asistentes, null, 2)).toString('base64');
    const body = { message: 'update asistentes', content };
    if (sha) body.sha = sha;
    await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/asistentes.json', {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) { console.error('Error guardando asistentes:', err.message); }
}

async function cargarAsistentes() {
  try {
    const res = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/asistentes.json', {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    const loaded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    Object.assign(asistentes, loaded);
    console.log('Asistentes cargados:', Object.keys(asistentes).length, 'operativos');
  } catch (err) { console.error('Error cargando asistentes:', err.message); }
}

// Cooldowns de postulaciones
async function guardarCooldowns() {
  try {
    const res = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/postulaciones_cooldown.json', {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    const sha = res.status !== 404 ? (await res.json()).sha : null;
    const content = Buffer.from(JSON.stringify(postulacionesCooldown, null, 2)).toString('base64');
    const body = { message: 'update cooldowns', content };
    if (sha) body.sha = sha;
    await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/postulaciones_cooldown.json', {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) { console.error('Error guardando cooldowns:', err.message); }
}

async function cargarCooldowns() {
  try {
    const res = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/postulaciones_cooldown.json', {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    postulacionesCooldown = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    console.log('Cooldowns cargados:', Object.keys(postulacionesCooldown).length, 'usuarios');
  } catch (err) { console.error('Error cargando cooldowns:', err.message); }
}

// Verifica si un usuario está en cooldown
function estaEnCooldown(userId) {
  const c = postulacionesCooldown[userId];
  if (!c) return null;
  if (Date.now() >= c) {
    delete postulacionesCooldown[userId];
    guardarCooldowns().catch(() => {});
    return null;
  }
  return c;
}

// Iniciar timeout de 15 min para una postulación
function iniciarTimeoutPostulacion(userId) {
  const p = postulacionesActivas[userId];
  if (!p) return;
  if (p.timeoutId) clearTimeout(p.timeoutId);
  const restanteMs = Math.max(0, p.expiraTs - Date.now());
  p.timeoutId = setTimeout(async () => {
    if (!postulacionesActivas[userId]) return;
    delete postulacionesActivas[userId];
    guardarPostulacionesActivas().catch(e => console.error("Save postulaciones:", e.message));
    // Aplicar cooldown de 24hs por no terminar a tiempo
    postulacionesCooldown[userId] = Date.now() + COOLDOWN_POSTULACION_MS;
    guardarCooldowns().catch(e => console.error("Save cooldowns:", e.message));
    // Intentar avisar por DM
    try {
      const guild = client.guilds.cache.first();
      if (guild) {
        const m = await guild.members.fetch(userId).catch(() => null);
        if (m) {
          await m.send({ content: '⏱️ **Se te venció el tiempo del examen de Halcón.**\n\nTenías 15 minutos para completarlo. Podés volver a intentar en **24 horas**.' }).catch(() => {});
        }
      }
    } catch (e) { /* ignorar */ }
  }, restanteMs);
}

// Persistir postulaciones activas (sin timeoutId porque no es serializable)
async function guardarPostulacionesActivas() {
  try {
    const serializable = {};
    for (const [uid, data] of Object.entries(postulacionesActivas)) {
      serializable[uid] = {
        inicio: data.inicio,
        expiraTs: data.expiraTs,
        datos: data.datos
      };
    }
    const res = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/postulaciones_activas.json', {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    const sha = res.status !== 404 ? (await res.json()).sha : null;
    const content = Buffer.from(JSON.stringify(serializable, null, 2)).toString('base64');
    const body = { message: 'update postulaciones activas', content };
    if (sha) body.sha = sha;
    await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/postulaciones_activas.json', {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) { console.error('Error guardando postulaciones activas:', err.message); }
}

async function cargarPostulacionesActivas() {
  try {
    const res = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/postulaciones_activas.json', {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) return;
    const data = await res.json();
    const loaded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    const ahora = Date.now();
    for (const [uid, p] of Object.entries(loaded)) {
      if (p.expiraTs > ahora) {
        // Todavía tiene tiempo, restaurar
        postulacionesActivas[uid] = {
          inicio: p.inicio,
          expiraTs: p.expiraTs,
          timeoutId: null,
          datos: p.datos || {}
        };
        iniciarTimeoutPostulacion(uid);
      }
    }
    console.log('Postulaciones activas restauradas:', Object.keys(postulacionesActivas).length);
  } catch (err) { console.error('Error cargando postulaciones activas:', err.message); }
}

// ==================== READY ====================
client.once('ready', async () => {
  console.log('Bot conectado: ' + client.user.tag);
  await cargarAsistentes();
  await cargarCooldowns();
  await cargarPostulacionesActivas();
  botListo = true;
  console.log('[BOT] Todos los datos cargados. Bot listo para recibir comandos.');

  // Comando maestro /halcon con TODOS los subcomandos
  const halconCmd = new SlashCommandBuilder()
    .setName('halcon')
    .setDescription('Comandos del Grupo Halcón')

    .addSubcommand(s => s.setName('nuevo').setDescription('[HEAD] Ingresa un nuevo miembro al Grupo Halcón')
      .addUserOption(o => o.setName('usuario').setDescription('El usuario a ingresar').setRequired(true)))

    .addSubcommand(s => s.setName('ascender').setDescription('[HEAD] Asciende a un miembro del Grupo Halcón')
      .addUserOption(o => o.setName('usuario').setDescription('El usuario a ascender').setRequired(true))
      .addStringOption(o => o.setName('rango').setDescription('Nuevo rango').setRequired(true)
        .addChoices(
          { name: 'Miembro Halcón',    value: '1459343074378387591' },
          { name: 'Teniente Halcón',   value: '1460777138129998025' },
          { name: 'Capitán Halcón',    value: '1476854892181065739' },
          { name: 'Comandante Halcón', value: '1466328471536930846' },
          { name: 'Jefe Halcón',       value: '1466331349945155615' },
          { name: 'Sub Jefe Halcón',   value: '1466331228864254002' },
          { name: 'Director/a Halcón', value: '1460348058888830976' },
        )))

    .addSubcommand(s => s.setName('operativo').setDescription('[HEAD] Anuncia un operativo del Grupo Halcón'))

    .addSubcommand(s => s.setName('expulsar').setDescription('[HEAD] Expulsa a un miembro del Grupo Halcón')
      .addUserOption(o => o.setName('usuario').setDescription('El usuario a expulsar').setRequired(true))
      .addStringOption(o => o.setName('motivo').setDescription('Motivo de la expulsión').setRequired(true)))

    .addSubcommand(s => s.setName('panel-postulaciones').setDescription('[HEAD] Publica el panel con el botón para postularse'));

  const commands = [halconCmd.toJSON()];

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Comandos registrados.');
  } catch (err) { console.error('Error registrando comandos:', err); }
});

// ==================== INTERACTIONS ====================
client.on('interactionCreate', async (interaction) => {
  const tipoLog = interaction.isChatInputCommand() ? 'SLASH:' + interaction.commandName
    : interaction.isButton() ? 'BUTTON:' + interaction.customId
    : interaction.isModalSubmit() ? 'MODAL:' + interaction.customId
    : 'OTHER';
  console.log('[INTERACTION] ' + tipoLog + ' por ' + interaction.user.tag);

  // Bloquear interacciones hasta que el bot haya cargado todos los datos
  if (!botListo) {
    try {
      if (interaction.isRepliable()) {
        await interaction.reply({ content: '⏳ El bot todavía está cargando datos. Esperá unos segundos e intentá de nuevo.', ephemeral: true });
      }
    } catch (e) { /* ignorar */ }
    return;
  }

  // ==================== MODALES ====================

  // ==================== MODALES DE POSTULACIÓN ====================
  if (interaction.isModalSubmit() && interaction.customId === 'POSTULAR_MODAL_1') {
    const uid = interaction.user.id;
    if (!postulacionesActivas[uid]) {
      await interaction.reply({ content: '❌ Tu postulación se venció. Volvé a arrancar desde el panel.', ephemeral: true });
      return;
    }
    const confirm = interaction.fields.getTextInputValue('m1_confirm').trim().toUpperCase();
    if (confirm !== 'ACEPTO') {
      await interaction.reply({ content: '❌ Debés escribir "ACEPTO" exactamente en el último campo. Volvé a arrancar.', ephemeral: true });
      delete postulacionesActivas[uid];
      return;
    }
    postulacionesActivas[uid].datos.nombre = interaction.fields.getTextInputValue('m1_nombre');
    postulacionesActivas[uid].datos.rango  = interaction.fields.getTextInputValue('m1_rango');
    postulacionesActivas[uid].datos.mic    = interaction.fields.getTextInputValue('m1_mic');
    postulacionesActivas[uid].datos.disp   = interaction.fields.getTextInputValue('m1_disp');
    guardarPostulacionesActivas().catch(e => console.error("Save postulaciones:", e.message));

    const restanteMs = postulacionesActivas[uid].expiraTs - Date.now();
    const minutos = Math.max(0, Math.ceil(restanteMs / 60000));
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('POSTULAR_SIG_LATAS').setLabel('Continuar (2/5) — Robos').setStyle(ButtonStyle.Primary)
    );
    await interaction.reply({ content: '✅ Datos guardados. Te quedan **' + minutos + ' minutos**.\n\nClick en **Continuar** para el examen de **cantidades de robos**.', components: [row], ephemeral: true });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'POSTULAR_MODAL_LATAS') {
    const uid = interaction.user.id;
    if (!postulacionesActivas[uid]) {
      await interaction.reply({ content: '❌ Tu postulación se venció. Volvé a arrancar desde el panel.', ephemeral: true });
      return;
    }
    const robosPreguntados = postulacionesActivas[uid].datos.robosPreguntados || [];
    const respuestas = [];
    for (let i = 0; i < robosPreguntados.length; i++) {
      const raw = interaction.fields.getTextInputValue('lata_' + i).trim();
      const num = parseInt(raw, 10);
      respuestas.push({
        nombre: robosPreguntados[i].nombre,
        correcto: robosPreguntados[i].latas,
        respondio: isNaN(num) ? null : num,
        acierta: !isNaN(num) && num === robosPreguntados[i].latas
      });
    }
    postulacionesActivas[uid].datos.latasResp = respuestas;
    guardarPostulacionesActivas().catch(e => console.error("Save postulaciones:", e.message));

    const aciertos = respuestas.filter(r => r.acierta).length;
    const total = respuestas.length;

    const restanteMs = postulacionesActivas[uid].expiraTs - Date.now();
    const minutos = Math.max(0, Math.ceil(restanteMs / 60000));
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('POSTULAR_SIG_3').setLabel('Continuar (3/5) — Protocolo').setStyle(ButtonStyle.Primary)
    );
    await interaction.reply({ content: '✅ Cantidades registradas: **' + aciertos + '/' + total + ' correctas**. Te quedan **' + minutos + ' minutos**.\n\nClick en **Continuar** para las preguntas de protocolo.', components: [row], ephemeral: true });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'POSTULAR_MODAL_2') {
    const uid = interaction.user.id;
    if (!postulacionesActivas[uid]) {
      await interaction.reply({ content: '❌ Tu postulación se venció. Volvé a arrancar desde el panel.', ephemeral: true });
      return;
    }
    postulacionesActivas[uid].datos.fuga      = interaction.fields.getTextInputValue('m2_fuga');
    postulacionesActivas[uid].datos.disparar  = interaction.fields.getTextInputValue('m2_disparar');
    postulacionesActivas[uid].datos.nvl       = interaction.fields.getTextInputValue('m2_nvl');
    guardarPostulacionesActivas().catch(e => console.error("Save postulaciones:", e.message));

    const restanteMs = postulacionesActivas[uid].expiraTs - Date.now();
    const minutos = Math.max(0, Math.ceil(restanteMs / 60000));
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('POSTULAR_SIG_4').setLabel('Continuar (4/5) — Criterio').setStyle(ButtonStyle.Primary)
    );
    await interaction.reply({ content: '✅ Respuestas de protocolo guardadas. Te quedan **' + minutos + ' minutos**.\n\nClick en **Continuar** para las preguntas de criterio.', components: [row], ephemeral: true });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'POSTULAR_MODAL_3') {
    const uid = interaction.user.id;
    if (!postulacionesActivas[uid]) {
      await interaction.reply({ content: '❌ Tu postulación se venció. Volvé a arrancar desde el panel.', ephemeral: true });
      return;
    }
    postulacionesActivas[uid].datos.punto     = interaction.fields.getTextInputValue('m3_punto');
    postulacionesActivas[uid].datos.superior  = interaction.fields.getTextInputValue('m3_superior');
    postulacionesActivas[uid].datos.patrulla  = interaction.fields.getTextInputValue('m3_patrulla');
    guardarPostulacionesActivas().catch(e => console.error("Save postulaciones:", e.message));

    const restanteMs = postulacionesActivas[uid].expiraTs - Date.now();
    const minutos = Math.max(0, Math.ceil(restanteMs / 60000));
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('POSTULAR_SIG_5').setLabel('Continuar (5/5) — Motivación').setStyle(ButtonStyle.Primary)
    );
    await interaction.reply({ content: '✅ Respuestas de criterio guardadas. Te quedan **' + minutos + ' minutos**.\n\nÚltimo paso: **Motivación y personaje**.', components: [row], ephemeral: true });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'POSTULAR_MODAL_4') {
    const uid = interaction.user.id;
    if (!postulacionesActivas[uid]) {
      await interaction.reply({ content: '❌ Tu postulación se venció. Volvé a arrancar desde el panel.', ephemeral: true });
      return;
    }
    postulacionesActivas[uid].datos.porque    = interaction.fields.getTextInputValue('m4_porque');
    postulacionesActivas[uid].datos.personaje = interaction.fields.getTextInputValue('m4_personaje');

    const d = postulacionesActivas[uid].datos;

    // Helper para valores con default y truncado
    const sf = (v, max = 400) => {
      const s = (v || '_(vacío)_').toString();
      return s.length > max ? s.slice(0, max - 3) + '...' : s;
    };

    // Preparar detalle de latas
    const latasResp = d.latasResp || [];
    const aciertos = latasResp.filter(r => r.acierta).length;
    const total = latasResp.length;
    const detalleLatas = latasResp.map(r => {
      const emoji = r.acierta ? '✅' : '❌';
      const resp = r.respondio === null ? '_vacío_' : r.respondio;
      return emoji + ' **' + r.nombre + ':** respondió `' + resp + '` (correcto: `' + r.correcto + '`)';
    }).join('\n');

    // Embed 1 — Datos personales + Latas + Preguntas 1-4
    const embed1 = new EmbedBuilder()
      .setTitle('🦅 NUEVO EXAMEN DE INGRESO — GRUPO HALCÓN (1/2) 🦅')
      .setColor(0xFFD700)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: '👤 Nombre IC',       value: sf(d.nombre, 60),   inline: true },
        { name: '🎖️ Rango PFA',       value: sf(d.rango, 60),    inline: true },
        { name: '🎙️ Micrófono',       value: sf(d.mic, 60),      inline: true },
        { name: '📅 Disponibilidad',  value: sf(d.disp, 60),     inline: true },
        { name: '🔗 Discord',         value: '<@' + uid + '>',   inline: true },
        { name: '🆔 Discord ID',      value: '`' + uid + '`',    inline: true },
        { name: '🥫 Latas — resultado', value: '**' + aciertos + '/' + total + ' correctas**\n' + (sf(detalleLatas, 800) || '_(sin datos)_'), inline: false },
        { name: '🚗 P1 — Sospechoso en fuga', value: sf(d.fuga), inline: false },
        { name: '🔫 P2 — Disparar primero', value: sf(d.disparar), inline: false },
        { name: '📖 P3 — NVL', value: sf(d.nvl), inline: false },
        { name: '📍 P4 — Cubriendo un punto', value: sf(d.punto), inline: false }
      )
      .setFooter({ text: 'Parte 1/2 • Grupo Halcón' });

    // Embed 2 — Preguntas 5-8
    const embed2 = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🦅 EXAMEN DE INGRESO — GRUPO HALCÓN (2/2) 🦅')
      .addFields(
        { name: '⚠️ P5 — Superior faltando el respeto', value: sf(d.superior), inline: false },
        { name: '🚙 P6 — Solo en patrulla', value: sf(d.patrulla), inline: false },
        { name: '❓ P7 — ¿Por qué Halcón?', value: sf(d.porque), inline: false },
        { name: '🧍 P8 — Personaje IC', value: sf(d.personaje), inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Parte 2/2 • Grupo Halcón • Sistema de Postulaciones' });

    const mencionRoles = ROLES_AUTORIZADOS.map(r => '<@&' + r + '>').join(' ');
    const nombreLimpio = (d.nombre || 'postulante').replace(/[^a-zA-Z0-9]/g, '').slice(0, 30) || 'postulante';
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ap_' + Date.now() + '_' + nombreLimpio + '_' + uid).setLabel('APROBAR').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('re_' + Date.now() + '_' + nombreLimpio + '_' + uid).setLabel('RECHAZAR').setStyle(ButtonStyle.Danger)
    );

    // Intentar enviar los embeds — si falla, NO borrar el estado (el user puede reintentar)
    try {
      const canalAprob = await client.channels.fetch(CANAL_APROBACION);
      await canalAprob.send({
        content: mencionRoles,
        embeds: [embed1, embed2],
        components: [row],
        allowedMentions: { roles: ROLES_AUTORIZADOS }
      });
    } catch (e) {
      console.error('[POSTULAR MODAL 4] Error publicando postulación:', e);
      await interaction.reply({
        content: '❌ **Hubo un error al enviar tu postulación.** Tus respuestas siguen guardadas. Volvé a apretar "🦅 POSTULARSE" del panel para reintentar.\n\n_Error: ' + (e.message || 'desconocido') + '_',
        ephemeral: true
      });
      return;
    }

    // Solo si el envío fue OK, borrar el estado
    if (postulacionesActivas[uid] && postulacionesActivas[uid].timeoutId) clearTimeout(postulacionesActivas[uid].timeoutId);
    delete postulacionesActivas[uid];
    guardarPostulacionesActivas().catch(e => console.error("Save postulaciones:", e.message));

    await interaction.reply({ content: '✅ **Tu postulación fue enviada correctamente.**\n\nLa oficialidad del Halcón revisará tu examen y te avisará por mensaje privado si es aprobada o rechazada.\n\n_— Grupo Halcón_', ephemeral: true });
    return;
  }

  // Modal operativo
  if (interaction.isModalSubmit() && interaction.customId === 'modal_operativo') {
    const tipo        = interaction.fields.getTextInputValue('op_tipo');
    const hora        = interaction.fields.getTextInputValue('op_hora');
    const lugar       = interaction.fields.getTextInputValue('op_lugar');
    const descripcion = interaction.fields.getTextInputValue('op_descripcion');
    const requisitos  = interaction.fields.getTextInputValue('op_requisitos') || 'Toda la unidad';

    const embed = new EmbedBuilder()
      .setTitle('🚨  OPERATIVO — GRUPO HALCÓN')
      .addFields(
        { name: '📋 Tipo',           value: tipo,        inline: true },
        { name: '🕐 Hora',           value: hora,        inline: true },
        { name: '📍 Zona',           value: lugar,       inline: true },
        { name: '👥 Participantes',  value: requisitos,  inline: true },
        { name: '👮 Convocado por',  value: '<@' + interaction.user.id + '>', inline: true },
        { name: '📝 Descripción',    value: descripcion, inline: false }
      )
      .setColor(0xCC2222).setTimestamp()
      .setFooter({ text: 'Grupo Halcón  •  Operaciones' });

    const rowAnota = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ANOTA_placeholder')
        .setLabel('✅  Me anoto')
        .setStyle(ButtonStyle.Success)
    );

    const canalOp = await client.channels.fetch(CANAL_OPERATIVOS);
    const msgEnviado = await canalOp.send({ content: '<@&' + ROL_HALCON + '>', embeds: [embed], components: [rowAnota] });

    const rowReal = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ANOTA_' + msgEnviado.id)
        .setLabel('✅  Me anoto')
        .setStyle(ButtonStyle.Success)
    );
    await msgEnviado.edit({ components: [rowReal] });
    asistentes[msgEnviado.id] = [];

    await interaction.reply({ content: '✅ Operativo anunciado en <#' + CANAL_OPERATIVOS + '>.', ephemeral: true });
    return;
  }

  // ==================== BOTONES ====================
  if (interaction.isButton()) {
    const id = interaction.customId;

    // Botón "Me anoto" a un operativo
    if (id.startsWith('ANOTA_')) {
      const msgId = id.replace('ANOTA_', '');
      if (!asistentes[msgId]) asistentes[msgId] = [];

      if (asistentes[msgId].includes(interaction.user.id)) {
        await interaction.reply({ content: '❌ Ya te anotaste en este operativo.', ephemeral: true });
        return;
      }

      asistentes[msgId].push(interaction.user.id);
      guardarAsistentes().catch(e => console.error("Save asistentes:", e.message));
      const lista = asistentes[msgId].map(uid => '<@' + uid + '>').join('\n');

      const msgOriginal = interaction.message;
      const embedActualizado = EmbedBuilder.from(msgOriginal.embeds[0])
        .setFields(
          ...msgOriginal.embeds[0].fields.filter(f => f.name !== '👥 Asistentes confirmados'),
          { name: '👥 Asistentes confirmados (' + asistentes[msgId].length + ')', value: lista, inline: false }
        );

      await interaction.update({ embeds: [embedActualizado] });
      return;
    }

    // Botón POSTULAR_INICIAR: abre modal 1 (datos personales)
    if (id === 'POSTULAR_INICIAR') {
      const uid = interaction.user.id;

      // Los DUEÑOS pueden postular indefinidamente (modo testing)
      const esDueno = interaction.member.roles.cache.has(ROL_DUENO_HALCON) ||
                      interaction.member.roles.cache.has(ROL_DUENO_GENERAL);
      console.log('[POSTULAR_INICIAR] Usuario:', interaction.user.tag, '· esDueno:', esDueno, '· roles:', interaction.member.roles.cache.map(r => r.id).join(', '));

      // Chequear cooldown (dueños lo saltan)
      if (!esDueno) {
        const cooldownHasta = estaEnCooldown(uid);
        if (cooldownHasta) {
          await interaction.reply({
            content: '⏳ Ya te postulaste recientemente. Podés volver a intentar <t:' + Math.floor(cooldownHasta / 1000) + ':R>.',
            ephemeral: true
          });
          return;
        }
      }

      // Chequear si ya tiene postulación activa (dueños la reinician)
      if (postulacionesActivas[uid]) {
        if (esDueno) {
          // Dueño reinicia su postulación pendiente
          if (postulacionesActivas[uid].timeoutId) clearTimeout(postulacionesActivas[uid].timeoutId);
          delete postulacionesActivas[uid];
          guardarPostulacionesActivas().catch(e => console.error("Save postulaciones:", e.message));
        } else {
          const restanteMs = postulacionesActivas[uid].expiraTs - Date.now();
          const minutos = Math.max(0, Math.ceil(restanteMs / 60000));
          await interaction.reply({
            content: '❌ Ya tenés una postulación en curso. Te quedan **' + minutos + ' minutos** para terminarla. Buscá en tus mensajes el último modal enviado por el bot.',
            ephemeral: true
          });
          return;
        }
      }

      // Chequear si ya es Halcón (dueños lo saltan)
      if (!esDueno && (interaction.member.roles.cache.has(ROL_MIEMBRO) || interaction.member.roles.cache.has(ROL_HALCON_BASE))) {
        await interaction.reply({ content: '❌ Ya sos parte del Grupo Halcón. No podés volver a postularte.', ephemeral: true });
        return;
      }

      // Iniciar postulación
      postulacionesActivas[uid] = {
        inicio: Date.now(),
        expiraTs: Date.now() + TIEMPO_MAX_POSTULACION_MS,
        timeoutId: null,
        datos: {}
      };
      iniciarTimeoutPostulacion(uid);
      guardarPostulacionesActivas().catch(e => console.error("Save postulaciones:", e.message));
      const modal = new ModalBuilder()
        .setCustomId('POSTULAR_MODAL_1')
        .setTitle('Postulación Halcón (1/5) — Datos');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('m1_nombre').setLabel('Nombre IC en el server')
            .setStyle(TextInputStyle.Short).setRequired(true).setMinLength(2).setMaxLength(60)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('m1_rango').setLabel('Rango actual en la PFA')
            .setStyle(TextInputStyle.Short).setRequired(true).setMinLength(2).setMaxLength(60)
            .setPlaceholder('Ej: Sargento, Teniente, Sub-inspector, etc.')
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('m1_mic').setLabel('¿Tenés micrófono? (Sí / No)')
            .setStyle(TextInputStyle.Short).setRequired(true).setMinLength(1).setMaxLength(10)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('m1_disp').setLabel('Días disponibles por semana')
            .setStyle(TextInputStyle.Short).setRequired(true).setMinLength(1).setMaxLength(30)
            .setPlaceholder('Ej: 3-4 días, 5+ días, todos los días')
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('m1_confirm').setLabel('Escribí "ACEPTO" para confirmar que leíste')
            .setStyle(TextInputStyle.Short).setRequired(true).setMinLength(6).setMaxLength(10)
            .setPlaceholder('ACEPTO')
        )
      );
      await interaction.showModal(modal);
      return;
    }

    // Botón para continuar al siguiente modal
    if (id === 'POSTULAR_SIG_LATAS') {
      const uid = interaction.user.id;
      if (!postulacionesActivas[uid]) {
        await interaction.reply({ content: '❌ Tu postulación se venció o no existe. Volvé a arrancar desde el panel.', ephemeral: true });
        return;
      }

      // Elegir 5 robos al azar
      const robosElegidos = elegirRobosAlAzar(5);
      postulacionesActivas[uid].datos.robosPreguntados = robosElegidos;

      const modal = new ModalBuilder()
        .setCustomId('POSTULAR_MODAL_LATAS')
        .setTitle('Postulación Halcón (2/5) — Latas por robo');

      for (let i = 0; i < robosElegidos.length; i++) {
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('lata_' + i)
              .setLabel('Latas permitidas: ' + robosElegidos[i].nombre)
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setMinLength(1)
              .setMaxLength(3)
              .setPlaceholder('Cantidad exacta (número)')
          )
        );
      }
      await interaction.showModal(modal);
      return;
    }

    if (id.startsWith('POSTULAR_SIG_')) {
      const paso = id.replace('POSTULAR_SIG_', '');
      const uid = interaction.user.id;

      if (!postulacionesActivas[uid]) {
        await interaction.reply({ content: '❌ Tu postulación se venció o no existe. Volvé a arrancar desde el panel.', ephemeral: true });
        return;
      }

      if (paso === '3') {
        const modal = new ModalBuilder()
          .setCustomId('POSTULAR_MODAL_2')
          .setTitle('Postulación Halcón (3/5) — Protocolo');
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('m2_fuga').setLabel('Sospechoso se fuga en vehículo — ¿qué hacés?')
              .setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(20).setMaxLength(800)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('m2_disparar').setLabel('¿Cuándo está permitido disparar primero?')
              .setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(20).setMaxLength(800)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('m2_nvl').setLabel('¿Qué es el NVL? Poné un ejemplo')
              .setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(20).setMaxLength(800)
          )
        );
        await interaction.showModal(modal);
        return;
      }

      if (paso === '4') {
        const modal = new ModalBuilder()
          .setCustomId('POSTULAR_MODAL_3')
          .setTitle('Postulación Halcón (4/5) — Criterio');
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('m3_punto').setLabel('40 min cubriendo un punto — ¿qué hacés?')
              .setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(20).setMaxLength(800)
              .setPlaceholder('Tu compañero te dice que te vayas. ¿Qué hacés?')
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('m3_superior').setLabel('Superior falta el respeto a un civil')
              .setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(20).setMaxLength(800)
              .setPlaceholder('Vos estás al lado. ¿Cómo actuás?')
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('m3_patrulla').setLabel('Solo en patrulla, auto sospechoso')
              .setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(20).setMaxLength(800)
              .setPlaceholder('Sin apoyo disponible. ¿Qué hacés paso a paso?')
          )
        );
        await interaction.showModal(modal);
        return;
      }

      if (paso === '5') {
        const modal = new ModalBuilder()
          .setCustomId('POSTULAR_MODAL_4')
          .setTitle('Postulación Halcón (5/5) — Motivación');
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('m4_porque').setLabel('¿Por qué querés ser parte del Grupo Halcón?')
              .setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(30).setMaxLength(1000)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('m4_personaje').setLabel('Describí a tu personaje (mínimo 3 líneas)')
              .setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(50).setMaxLength(1500)
              .setPlaceholder('Quién es, de dónde viene y por qué entró a la PFA.')
          )
        );
        await interaction.showModal(modal);
        return;
      }
      return;
    }

    // Botones de postulaciones (APROBAR / RECHAZAR)
    if (id.startsWith('ap_') || id.startsWith('re_')) {
      const tieneRol = ROLES_AUTORIZADOS.some(r => interaction.member.roles.cache.has(r));
      if (!tieneRol) { await interaction.reply({ content: '❌ No tenés permisos.', ephemeral: true }); return; }

      await interaction.deferUpdate();
      const parts = id.split('_');
      const accion = parts[0], nombre = parts[2], discordId = parts[3];
      const revisor = interaction.member?.displayName || interaction.user.username;

      try {
        if (accion === 'ap') {
          // ==================== APROBAR ====================
          if (!discordId) {
            const rowDone = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('done1').setLabel('APROBADO por ' + revisor + ' (sin ID)').setStyle(ButtonStyle.Success).setDisabled(true),
              new ButtonBuilder().setCustomId('done2').setLabel('RECHAZAR').setStyle(ButtonStyle.Danger).setDisabled(true)
            );
            await interaction.editReply({ components: [rowDone] });
            await interaction.followUp({ content: '⚠️ Aprobado pero no hay Discord ID en la postulación. Asigná los roles manualmente.', ephemeral: true });
            return;
          }

          let miembro;
          try { miembro = await interaction.guild.members.fetch(discordId); }
          catch (e) {
            await interaction.followUp({ content: '⚠️ No pude encontrar al usuario en el server. Verificá que siga adentro.', ephemeral: true });
            return;
          }

          // Agregar los 3 roles Halcón SIN sacar ninguno de los que ya tiene
          try {
            const rolesAAgregar = [ROL_HALCON_BASE, ROL_MIEMBRO, ROL_CADETE];
            for (const r of rolesAAgregar) {
              if (!miembro.roles.cache.has(r)) {
                await miembro.roles.add(r, 'Ingreso al Grupo Halcón por aprobación de postulación');
              }
            }
          } catch (e) {
            console.error('Error asignando roles:', e.message);
            await interaction.followUp({ content: '⚠️ Aprobado pero no pude asignar los roles. Verificá jerarquía del bot.', ephemeral: true });
            return;
          }

          // Publicar embed de ingreso en CANAL_UPDATES (tipo /halcon nuevo)
          const embedIngreso = new EmbedBuilder()
            .setTitle('🦅 NUEVO INGRESO — GRUPO HALCÓN')
            .setDescription('<@' + discordId + '> ha sido ingresado oficialmente al **Grupo Halcón**.\n¡Bienvenido, Agente!')
            .addFields(
              { name: '👮 Ingresado por', value: revisor, inline: true },
              { name: '🔸 Rango asignado', value: 'Cadete Halcón', inline: true }
            )
            .setColor(0xFFD700)
            .setThumbnail(miembro.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Grupo Halcón  •  Sistema de Ingresos' });
          try {
            const canalUp = await client.channels.fetch(CANAL_UPDATES);
            await canalUp.send({ content: '<@' + discordId + '>', embeds: [embedIngreso] });
          } catch (e) { console.error('Publicar ingreso en updates:', e.message); }

          // Guardar el examen completo + resultado APROBADO en CANAL_RESULTADOS
          try {
            const embedsOriginales = interaction.message.embeds.map(e => EmbedBuilder.from(e).setColor(0x2ECC71));
            const embedResultado = new EmbedBuilder()
              .setTitle('✅ RESULTADO — APROBADO')
              .setDescription('Postulación de <@' + discordId + '> **APROBADA**.')
              .addFields(
                { name: '👮 Aprobado por', value: revisor,                                      inline: true },
                { name: '📅 Fecha',        value: '<t:' + Math.floor(Date.now() / 1000) + ':F>', inline: true },
                { name: '🆔 Discord ID',   value: '`' + discordId + '`',                        inline: true }
              )
              .setColor(0x2ECC71)
              .setThumbnail(miembro.displayAvatarURL())
              .setTimestamp()
              .setFooter({ text: 'Grupo Halcón · Archivo de Resultados' });
            const canalResultados = await client.channels.fetch(CANAL_RESULTADOS);
            await canalResultados.send({ embeds: [...embedsOriginales, embedResultado] });
          } catch (e) { console.error('Publicar en resultados (APROBADO):', e.message); }

          // DM al aprobado
          try {
            await miembro.send({ content: '✅ **¡Fuiste APROBADO en el Grupo Halcón!**\n\nBienvenido a la unidad de élite de la PFA. Ya se te asignaron los roles de **Cadete Halcón** y podés participar en los operativos.\n\n**Revisado por:** ' + revisor + '\n\n_— Grupo Halcón · Kilombo RP_' });
          } catch (e) { /* DM cerrado */ }

          // Deshabilitar botones
          const rowDone = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('done1').setLabel('APROBADO por ' + revisor).setStyle(ButtonStyle.Success).setDisabled(true),
            new ButtonBuilder().setCustomId('done2').setLabel('RECHAZAR').setStyle(ButtonStyle.Danger).setDisabled(true)
          );
          await interaction.editReply({ components: [rowDone] });

        } else {
          // ==================== RECHAZAR ====================
          const rowDone = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('done1').setLabel('APROBAR').setStyle(ButtonStyle.Success).setDisabled(true),
            new ButtonBuilder().setCustomId('done2').setLabel('RECHAZADO por ' + revisor).setStyle(ButtonStyle.Danger).setDisabled(true)
          );
          await interaction.editReply({ components: [rowDone] });

          if (!discordId) {
            await interaction.followUp({ content: '⚠️ Rechazado pero no hay Discord ID en la postulación. No se pudo enviar DM.', ephemeral: true });
            return;
          }

          // Aplicar cooldown de 24hs
          postulacionesCooldown[discordId] = Date.now() + COOLDOWN_POSTULACION_MS;
          guardarCooldowns().catch(e => console.error("Save cooldowns:", e.message));

          // Guardar el examen completo + resultado RECHAZADO en CANAL_RESULTADOS
          try {
            const embedsOriginales = interaction.message.embeds.map(e => EmbedBuilder.from(e).setColor(0xE74C3C));
            const embedResultado = new EmbedBuilder()
              .setTitle('❌ RESULTADO — RECHAZADO')
              .setDescription('Postulación de <@' + discordId + '> **RECHAZADA**.')
              .addFields(
                { name: '👮 Rechazado por', value: revisor,                                      inline: true },
                { name: '📅 Fecha',         value: '<t:' + Math.floor(Date.now() / 1000) + ':F>', inline: true },
                { name: '🆔 Discord ID',    value: '`' + discordId + '`',                        inline: true },
                { name: '⏳ Cooldown',      value: '24 horas',                                    inline: true }
              )
              .setColor(0xE74C3C)
              .setTimestamp()
              .setFooter({ text: 'Grupo Halcón · Archivo de Resultados' });
            const canalResultados = await client.channels.fetch(CANAL_RESULTADOS);
            await canalResultados.send({ embeds: [...embedsOriginales, embedResultado] });
          } catch (e) { console.error('Publicar en resultados (RECHAZADO):', e.message); }

          // Enviar DM al postulante rechazado
          try {
            const miembro = await interaction.guild.members.fetch(discordId);
            await miembro.send({
              content: '❌ **Postulación rechazada — Grupo Halcón**\n\nLamentamos informarte que tu postulación al **Grupo Halcón** fue **RECHAZADA**.\n\n**Revisado por:** ' + revisor + '\n**Fecha:** ' + fecha() + '\n\nPodés volver a postularte en **24 horas**.\n\n_— Grupo Halcón · Kilombo RP_'
            });
          } catch (e) {
            console.error('Error DM rechazo:', e.message);
            await interaction.followUp({ content: '⚠️ Rechazado, cooldown aplicado, pero no pude enviarle DM (DMs cerrados).', ephemeral: true });
            return;
          }
        }
      } catch (err) { console.error('Error postulacion:', err); }
      return;
    }

    return;
  }

  // ==================== SLASH COMMANDS ====================
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'halcon') return;

  const sub = interaction.options.getSubcommand();
  const tieneRol = ROLES_AUTORIZADOS.some(r => interaction.member.roles.cache.has(r));
  const revisor = interaction.member?.displayName || interaction.user.username;

  // Todos los subcomandos requieren rol autorizado
  if (!tieneRol) {
    await interaction.reply({ content: '❌ No tenés permisos para usar este comando.', ephemeral: true });
    return;
  }

  // /halcon nuevo
  if (sub === 'nuevo') {
    if (interaction.channelId !== CANAL_UPDATES) {
      await interaction.reply({ content: '❌ Este comando solo puede usarse en <#' + CANAL_UPDATES + '>.', ephemeral: true });
      return;
    }
    const usuario = interaction.options.getUser('usuario');
    const miembro = await interaction.guild.members.fetch(usuario.id);
    try {
      await miembro.roles.add(ROL_MIEMBRO);
      const canalUp = await client.channels.fetch(CANAL_UPDATES);
      const embed = new EmbedBuilder().setTitle('🦅 NUEVO INGRESO — GRUPO HALCÓN')
        .setDescription('<@' + usuario.id + '> ha sido ingresado oficialmente al **Grupo Halcón**.\n¡Bienvenido, Agente!')
        .addFields({ name: '👮 Ingresado por', value: revisor, inline: true }, { name: '🔸 Rango asignado', value: 'Miembro Halcón', inline: true })
        .setColor(0xFFD700).setThumbnail(usuario.displayAvatarURL()).setTimestamp().setFooter({ text: 'Grupo Halcón  •  Sistema de Ingresos' });
      await canalUp.send({ content: '<@' + usuario.id + '>', embeds: [embed] });
      await interaction.reply({ content: '✅ **' + miembro.displayName + '** ingresado como Miembro Halcón.', ephemeral: true });
    } catch (err) { await interaction.reply({ content: '❌ Error al ingresar al miembro.', ephemeral: true }); }
    return;
  }

  // /halcon ascender
  if (sub === 'ascender') {
    if (interaction.channelId !== CANAL_UPDATES) {
      await interaction.reply({ content: '❌ Este comando solo puede usarse en <#' + CANAL_UPDATES + '>.', ephemeral: true });
      return;
    }
    const usuario = interaction.options.getUser('usuario');
    const rolId   = interaction.options.getString('rango');
    const miembro = await interaction.guild.members.fetch(usuario.id);
    const rangoNombre = RANGOS[rolId] || 'Rango desconocido';
    try {
      for (const rid of Object.keys(RANGOS)) { if (miembro.roles.cache.has(rid)) await miembro.roles.remove(rid).catch(() => {}); }
      await miembro.roles.add(rolId);
      const canalUp = await client.channels.fetch(CANAL_UPDATES);
      const embed = new EmbedBuilder().setTitle('🦅 ASCENSO — GRUPO HALCÓN')
        .setDescription('<@' + usuario.id + '> ha sido ascendido en el **Grupo Halcón**.')
        .addFields({ name: '🎖️ Nuevo rango', value: rangoNombre, inline: true }, { name: '👮 Ascendido por', value: '<@' + interaction.user.id + '>', inline: true })
        .setColor(0xFFD700).setThumbnail(usuario.displayAvatarURL()).setTimestamp().setFooter({ text: 'Grupo Halcón  •  Sistema de Ascensos' });
      await canalUp.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ **' + miembro.displayName + '** ascendido a ' + rangoNombre + '.', ephemeral: true });
    } catch (err) { await interaction.reply({ content: '❌ Error al ascender. Verificá que el bot tenga el rol más alto.', ephemeral: true }); }
    return;
  }

  // /halcon operativo
  if (sub === 'operativo') {
    const modal = new ModalBuilder().setCustomId('modal_operativo').setTitle('Nuevo Operativo — Grupo Halcón');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('op_tipo').setLabel('Tipo de operativo')
          .setStyle(TextInputStyle.Short).setPlaceholder('Ej: ALFA — Convoy Blindado, GOLF — Patrulla, etc.')
          .setRequired(true).setMaxLength(60)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('op_hora').setLabel('Hora del operativo')
          .setStyle(TextInputStyle.Short).setPlaceholder('Ej: 21:00').setRequired(true).setMaxLength(20)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('op_lugar').setLabel('Zona / Ubicación')
          .setStyle(TextInputStyle.Short).setPlaceholder('Ej: Banco Central, Zona Norte, etc.').setRequired(true).setMaxLength(80)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('op_descripcion').setLabel('Descripción del operativo')
          .setStyle(TextInputStyle.Paragraph).setPlaceholder('Detallá el objetivo, la táctica y lo que se espera de cada uno.')
          .setRequired(true).setMaxLength(500)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('op_requisitos').setLabel('Requisitos / Quiénes participan')
          .setStyle(TextInputStyle.Short).setPlaceholder('Ej: Toda la unidad, solo Capitanes+, mínimo 4 agentes.')
          .setRequired(false).setMaxLength(100)
      )
    );
    await interaction.showModal(modal);
    return;
  }

  // /halcon panel-postulaciones
  if (sub === 'panel-postulaciones') {
    if (interaction.channelId !== CANAL_PANEL) {
      await interaction.reply({ content: '❌ Este comando solo puede usarse en <#' + CANAL_PANEL + '>.', ephemeral: true });
      return;
    }
    const embedPanel = new EmbedBuilder()
      .setTitle('🦅 GRUPO HALCÓN — POSTULACIONES ABIERTAS')
      .setDescription('Si querés formar parte del **Grupo Halcón**, la unidad de operaciones especiales de la PFA, este es tu lugar.\n\n' +
        '**Requisitos generales:**\n' +
        '• Ser oficial activo de la PFA (rango Sargento en adelante).\n' +
        '• Contar con micrófono funcional.\n' +
        '• Disponibilidad horaria para participar en operativos.\n' +
        '• Mentalidad táctica, criterio y buen desempeño en el rol.\n\n' +
        '**Cómo postularse:**\n' +
        '1. Hacé click en el botón **"🦅 POSTULARSE"** abajo.\n' +
        '2. Vas a completar **5 formularios** con tus datos, cantidades de robos, protocolos, criterio y motivación.\n' +
        '3. **Tenés 15 minutos** para completar todo. Si se te pasa el tiempo, deberás esperar 24 horas para reintentar.\n' +
        '4. Si te rechazan, también deberás esperar 24 horas antes de volver a postularte.\n\n' +
        '**Importante:** Contestá con criterio y honestidad. No sirve copiar respuestas — evaluamos tu forma de pensar y actuar.\n\n' +
        '_— Grupo Halcón · Kilombo RP_')
      .setColor(0xFFD700)
      .setFooter({ text: 'Grupo Halcón  •  Sistema de Postulaciones' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('POSTULAR_INICIAR')
        .setLabel('🦅 POSTULARSE')
        .setStyle(ButtonStyle.Primary)
    );

    try {
      const canalPanel = await client.channels.fetch(CANAL_PANEL);
      await canalPanel.send({ embeds: [embedPanel], components: [row] });
      await interaction.reply({ content: '✅ Panel publicado en <#' + CANAL_PANEL + '>.', ephemeral: true });
    } catch (e) {
      console.error('Panel:', e.message);
      await interaction.reply({ content: '❌ Error al publicar el panel.', ephemeral: true });
    }
    return;
  }

  // /halcon expulsar
  if (sub === 'expulsar') {
    const usuario  = interaction.options.getUser('usuario');
    const motivo   = interaction.options.getString('motivo');
    const miembro  = await interaction.guild.members.fetch(usuario.id);

    try {
      if (miembro.roles.cache.has(ROL_DUENO_HALCON)) {
        await interaction.reply({ content: '❌ No podés expulsar al **Dueño** del Grupo Halcón.', ephemeral: true });
        return;
      }

      for (const id of TODOS_ROLES_HALCON) {
        if (miembro.roles.cache.has(id)) await miembro.roles.remove(id).catch(() => {});
      }

      const canalUp = await client.channels.fetch(CANAL_UPDATES);
      const embed = new EmbedBuilder()
        .setTitle('🚫 EXPULSIÓN — GRUPO HALCÓN')
        .setDescription('<@' + usuario.id + '> ha sido **expulsado** del Grupo Halcón.')
        .addFields(
          { name: '📋 Motivo',        value: motivo,                                  inline: false },
          { name: '👮 Expulsado por', value: '<@' + interaction.user.id + '>',        inline: true }
        )
        .setColor(0x000000).setThumbnail(usuario.displayAvatarURL()).setTimestamp()
        .setFooter({ text: 'Grupo Halcón  •  Sistema de Expulsiones' });

      await canalUp.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ **' + miembro.displayName + '** fue expulsado del Grupo Halcón.', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Error al expulsar al miembro.', ephemeral: true });
    }
    return;
  }
});

client.login(process.env.TOKEN);
