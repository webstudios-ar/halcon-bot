require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const CANAL_RESULTADO   = '1493454727680364584';
const CANAL_UPDATES     = '1493446131663896626';
const ROL_MIEMBRO       = '1459343074378387591';
const CANAL_SANCIONES   = '1492669993958113380';
const CANAL_APELACIONES = '1494145072214839366';
const CANAL_OPERATIVOS  = '1494252679407472720';
const CANAL_GALERIA     = '1494259484783284254';
const ROL_HALCON        = '1466327608697290854';

// Asistentes por operativo: { messageId: [userId, ...] }
const asistentes = {};

// Imagenes temporales para galeria: { userId: imageUrl }
const imagenesPendientes = {};
const GITHUB_REPO       = 'webstudios-ar/halcon-bot';
const GITHUB_FILE       = 'sanciones.json';

const ROLES_AUTORIZADOS = ['1474197418890362911','1460348058888830976','1466331349945155615'];

const RANGOS = {
  '1459343074378387591': 'Miembro Halcón',
  '1460777138129998025': 'Teniente Halcón',
  '1476854892181065739': 'Capitán Halcón',
  '1466328471536930846': 'Comandante Halcón',
  '1466331349945155615': 'Jefe Halcón',
  '1466331228864254002': 'Sub Jefe Halcón',
  '1460348058888830976': 'Director/a Halcón',
};

const fecha = () => new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ==================== PERSISTENCIA ====================
let sanciones = {};
let githubFileSha = null;

async function cargarSanciones() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`, {
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json' }
    });
    if (res.status === 404) { console.log('sanciones.json no existe todavia.'); return; }
    const data = await res.json();
    githubFileSha = data.sha;
    sanciones = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    console.log('Sanciones cargadas:', Object.keys(sanciones).length, 'usuarios');
  } catch (err) { console.error('Error cargando sanciones:', err.message); }
}

async function guardarSanciones() {
  try {
    const content = Buffer.from(JSON.stringify(sanciones, null, 2)).toString('base64');
    const body = { message: 'update sanciones', content };
    if (githubFileSha) body.sha = githubFileSha;
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.content) githubFileSha = data.content.sha;
  } catch (err) { console.error('Error guardando sanciones:', err.message); }
}

function getSancion(userId) {
  if (!sanciones[userId]) sanciones[userId] = { warns: 0, strikes: 0, historial: [] };
  return sanciones[userId];
}

// ==================== READY ====================
client.once('ready', async () => {
  console.log('Bot conectado: ' + client.user.tag);
  await cargarSanciones();

  const commands = [
    new SlashCommandBuilder().setName('nuevo').setDescription('Ingresa un nuevo miembro al Grupo Halcon')
      .addUserOption(o => o.setName('usuario').setDescription('El usuario a ingresar').setRequired(true)),

    new SlashCommandBuilder().setName('ascender').setDescription('Asciende a un miembro del Grupo Halcon')
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
        )),

    new SlashCommandBuilder().setName('operativo').setDescription('Anuncia un operativo del Grupo Halcon'),

    new SlashCommandBuilder().setName('sancionar').setDescription('Aplica una sancion a un miembro del Grupo Halcon')
      .addUserOption(o => o.setName('usuario').setDescription('El usuario a sancionar').setRequired(true))
      .addStringOption(o => o.setName('sancion').setDescription('Tipo de sancion').setRequired(true)
        .addChoices(
          { name: '⚠️ Warn 1',    value: 'warn1'    },
          { name: '⚠️ Warn 2',    value: 'warn2'    },
          { name: '🔴 Strike 1',  value: 'strike1'  },
          { name: '🔴 Strike 2',  value: 'strike2'  },
          { name: '💀 Expulsión', value: 'expulsion' },
        ))
      .addStringOption(o => o.setName('motivo').setDescription('Motivo de la sancion').setRequired(true)),

    new SlashCommandBuilder().setName('sanciones').setDescription('Ver el historial de sanciones de un miembro')
      .addUserOption(o => o.setName('usuario').setDescription('El usuario a consultar').setRequired(true)),

    new SlashCommandBuilder().setName('galeria').setDescription('Publicar una foto de operativo en la galería del Halcón')
      .addAttachmentOption(o => o.setName('imagen').setDescription('La foto del operativo').setRequired(true)),

    new SlashCommandBuilder().setName('apelar-sancion-halcon').setDescription('Apelá tu última sanción del Grupo Halcón'),

  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Comandos registrados.');
  } catch (err) { console.error('Error registrando comandos:', err); }
});

// ==================== INTERACTIONS ====================
client.on('interactionCreate', async (interaction) => {

  // ===== MODAL SUBMIT =====
  // ===== MODAL GALERIA =====
  if (interaction.isModalSubmit() && interaction.customId === 'modal_galeria') {
    const titulo      = interaction.fields.getTextInputValue('gal_titulo');
    const descripcion = interaction.fields.getTextInputValue('gal_descripcion');
    const imageUrl    = imagenesPendientes[interaction.user.id];
    delete imagenesPendientes[interaction.user.id];

    if (!imageUrl) {
      await interaction.reply({ content: '❌ No se encontró la imagen. Usá /galeria de nuevo.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('📸  ' + titulo)
      .setDescription(descripcion)
      .setImage(imageUrl)
      .addFields(
        { name: '🦅 Publicado por', value: '<@' + interaction.user.id + '>', inline: true },
        { name: '📅 Fecha',         value: fecha(), inline: true }
      )
      .setColor(0xFFD700)
      .setFooter({ text: 'Grupo Halcón  •  Galería de Operativos' });

    const canalGal = await client.channels.fetch(CANAL_GALERIA);
    await canalGal.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Foto publicada en #galeria.', ephemeral: true });
    return;
  }

  // ===== MODAL OPERATIVO =====
  if (interaction.isModalSubmit() && interaction.customId === 'modal_operativo') {
    const tipo        = interaction.fields.getTextInputValue('op_tipo');
    const hora        = interaction.fields.getTextInputValue('op_hora');
    const lugar       = interaction.fields.getTextInputValue('op_lugar');
    const descripcion = interaction.fields.getTextInputValue('op_descripcion');
    const requisitos  = interaction.fields.getTextInputValue('op_requisitos') || 'Toda la unidad';
    const revisorOp   = interaction.member?.displayName || interaction.user.username;

    const embed = new EmbedBuilder()
      .setTitle('🚨  OPERATIVO — GRUPO HALCÓN')
      .addFields(
        { name: '📋 Tipo',           value: tipo,        inline: true },
        { name: '🕐 Hora',           value: hora,        inline: true },
        { name: '📍 Zona',           value: lugar,       inline: true },
        { name: '👥 Participantes',  value: requisitos,  inline: true },
        { name: '👮 Convocado por',  value: '<@' + interaction.user.id + '>', inline: true },
        { name: '📝 Descripción',    value: descripcion, inline: false },
        { name: '⚠️ Importante',     value: 'Una vez anotado **no podés cancelar**. No asistir al operativo habiendo confirmado asistencia conlleva **2 warns automáticos**.', inline: false }
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

    // Actualizar el boton con el messageId real
    const rowReal = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ANOTA_' + msgEnviado.id)
        .setLabel('✅  Me anoto')
        .setStyle(ButtonStyle.Success)
    );
    await msgEnviado.edit({ components: [rowReal] });
    asistentes[msgEnviado.id] = [];

    await interaction.reply({ content: '✅ Operativo anunciado en #operativos.', ephemeral: true });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_apelacion')) {
    const texto = interaction.fields.getTextInputValue('texto_apelacion');
    const userId = interaction.user.id;
    const sancion = getSancion(userId);

    // Extraer el idx del customId del modal: modal_apelacion_ELEG_IDX_USERID
    let sancionFinal = null;
    const partesCid = interaction.customId.split('_');
    // formato: modal_apelacion_ELEG_IDX_USERID => idx esta en posicion 3
    if (partesCid.length >= 5) {
      const idxReal = parseInt(partesCid[3]);
      sancionFinal = sancion.historial[idxReal];
    }
    // Fallback: ultima sancion
    if (!sancionFinal) sancionFinal = sancion.historial.filter(s => !s.nivel.includes('APELAC')).slice(-1)[0];

    if (!sancionFinal) {
      await interaction.reply({ content: '❌ No se encontró la sanción.', ephemeral: true });
      return;
    }

    const mencionSup = ROLES_AUTORIZADOS.map(id => '<@&' + id + '>').join(' ');
    const embed = new EmbedBuilder()
      .setTitle('⚖️ APELACIÓN DE SANCIÓN — GRUPO HALCÓN')
      .setDescription('<@' + userId + '> está apelando su sanción.')
      .addFields(
        { name: '📊 Sanción apelada',        value: sancionFinal.nivel,  inline: true },
        { name: '📋 Motivo original',        value: sancionFinal.motivo, inline: true },
        { name: '👮 Sancionado por',         value: sancionFinal.sancionadorId ? '<@' + sancionFinal.sancionadorId + '>' : 'N/A', inline: true },
        { name: '✍️ Argumento del apelador', value: texto, inline: false }
      )
      .setColor(0xFFAA00).setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp().setFooter({ text: 'Grupo Halcón  •  Sistema de Apelaciones' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('APEL_OK_' + userId).setLabel('ACEPTAR APELACIÓN').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('APEL_NO_' + userId).setLabel('RECHAZAR APELACIÓN').setStyle(ButtonStyle.Danger)
    );

    const canalApel = await client.channels.fetch(CANAL_APELACIONES);
    await canalApel.send({ content: mencionSup, embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Tu apelación fue enviada. El Head del Halcón la revisará a la brevedad.', ephemeral: true });
    return;
  }

  // ===== BOTONES =====
  if (interaction.isButton()) {
    const id = interaction.customId;

    // --- Elegir sancion a apelar ---
    // El customId tiene todo lo necesario: ELEG_IDX_USERID
    // Solo abre el modal — la busqueda del historial se hace en el modal submit
    if (id.startsWith('ELEG_')) {
      const modal = new ModalBuilder()
        .setCustomId('modal_apelacion_' + id) // guarda el customId del boton para recuperar en submit
        .setTitle('Apelación — Grupo Halcón');
      const input = new TextInputBuilder()
        .setCustomId('texto_apelacion')
        .setLabel('Explicá tu caso — única oportunidad')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Describí tu argumento. El Head aprobará o rechazará sin mediación. Única oportunidad.')
        .setMinLength(30).setMaxLength(1000).setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
      return;
    }

    // --- Aceptar apelacion ---
    if (id.startsWith('APEL_OK_')) {
      const tieneRol = ROLES_AUTORIZADOS.some(r => interaction.member.roles.cache.has(r));
      if (!tieneRol) { await interaction.reply({ content: '❌ No tenés permisos.', ephemeral: true }); return; }

      const userId = id.replace('APEL_OK_', '');
      const sancion = getSancion(userId);
      const ultima = sancion.historial.filter(s => !s.nivel.includes('APELAC')).slice(-1)[0];
      if (ultima) {
        if (ultima.nivel.includes('STRIKE')) sancion.strikes = Math.max(0, sancion.strikes - 1);
        else if (ultima.nivel.includes('WARN')) sancion.warns = Math.max(0, sancion.warns - 1);
        sancion.historial = sancion.historial.filter(s => s !== ultima);
      }
      await guardarSanciones();

      const embed = new EmbedBuilder()
        .setTitle('✅ APELACIÓN ACEPTADA')
        .setDescription('<@' + userId + '> — tu apelación fue **ACEPTADA**. La sanción fue revertida.')
        .addFields({ name: '👮 Resuelto por', value: '<@' + interaction.user.id + '>', inline: true })
        .setColor(0x00CC66).setTimestamp().setFooter({ text: 'Grupo Halcón  •  ' + fecha() });

      const rowDone = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('done_a1').setLabel('APELACIÓN ACEPTADA').setStyle(ButtonStyle.Success).setDisabled(true),
        new ButtonBuilder().setCustomId('done_a2').setLabel('RECHAZAR').setStyle(ButtonStyle.Danger).setDisabled(true)
      );
      await interaction.update({ components: [rowDone] });
      await interaction.followUp({ content: '<@' + userId + '>', embeds: [embed] });
      return;
    }

    // --- Rechazar apelacion ---
    if (id.startsWith('APEL_NO_')) {
      const tieneRol = ROLES_AUTORIZADOS.some(r => interaction.member.roles.cache.has(r));
      if (!tieneRol) { await interaction.reply({ content: '❌ No tenés permisos.', ephemeral: true }); return; }

      const userId = id.replace('APEL_NO_', '');
      const sancion = getSancion(userId);
      sancion.historial.push({ nivel: '❌ APELACIÓN RECHAZADA', motivo: 'Rechazada por <@' + interaction.user.id + '>', fecha: fecha() });
      await guardarSanciones();

      const embed = new EmbedBuilder()
        .setTitle('❌ APELACIÓN RECHAZADA')
        .setDescription('<@' + userId + '> — tu apelación fue **RECHAZADA**. La sanción se mantiene.')
        .addFields({ name: '👮 Resuelto por', value: '<@' + interaction.user.id + '>', inline: true })
        .setColor(0xCC2222).setTimestamp().setFooter({ text: 'Grupo Halcón  •  ' + fecha() });

      const rowDone = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('done_r1').setLabel('ACEPTAR').setStyle(ButtonStyle.Success).setDisabled(true),
        new ButtonBuilder().setCustomId('done_r2').setLabel('APELACIÓN RECHAZADA').setStyle(ButtonStyle.Danger).setDisabled(true)
      );
      await interaction.update({ components: [rowDone] });
      await interaction.followUp({ content: '<@' + userId + '>', embeds: [embed] });
      return;
    }

    // --- Boton Me Anoto ---
    if (id.startsWith('ANOTA_')) {
      const msgId = id.replace('ANOTA_', '');
      if (!asistentes[msgId]) asistentes[msgId] = [];

      // Verificar si ya se anotó
      if (asistentes[msgId].includes(interaction.user.id)) {
        await interaction.reply({ content: '❌ Ya te anotaste en este operativo.', ephemeral: true });
        return;
      }

      // Agregar al usuario
      asistentes[msgId].push(interaction.user.id);
      const lista = asistentes[msgId].map(uid => '<@' + uid + '>').join('\n');

      // Actualizar el embed con la lista
      const msgOriginal = interaction.message;
      const embedActualizado = EmbedBuilder.from(msgOriginal.embeds[0])
        .setFields(
          ...msgOriginal.embeds[0].fields.filter(f => f.name !== '👥 Asistentes confirmados'),
          { name: '👥 Asistentes confirmados (' + asistentes[msgId].length + ')', value: lista, inline: false }
        );

      await interaction.update({ embeds: [embedActualizado] });
      return;
    }

    // --- Botones postulacion (APROBAR / RECHAZAR) ---
    if (id.startsWith('ap_') || id.startsWith('re_')) {
      const tieneRol = ROLES_AUTORIZADOS.some(r => interaction.member.roles.cache.has(r));
      if (!tieneRol) { await interaction.reply({ content: '❌ No tenés permisos.', ephemeral: true }); return; }

      await interaction.deferUpdate();
      const parts = id.split('_');
      const accion = parts[0], nombre = parts[2], discordId = parts[3];
      const mencion = discordId ? '<@' + discordId + '>' : '**' + nombre + '**';
      const revisor = interaction.member?.displayName || interaction.user.username;

      try {
        const canal = await client.channels.fetch(CANAL_RESULTADO);
        if (accion === 'ap') {
          const embed = new EmbedBuilder().setTitle('POSTULANTE APROBADO').setDescription(mencion + ' fue **APROBADO** en el Grupo Halcón.').addFields({ name: '👮 Revisado por', value: revisor, inline: true }).setColor(0x00CC66).setTimestamp().setFooter({ text: 'Grupo Halcón  •  ' + fecha() });
          await canal.send({ embeds: [embed] });
          const rowDone = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('done1').setLabel('APROBADO por ' + revisor).setStyle(ButtonStyle.Success).setDisabled(true),
            new ButtonBuilder().setCustomId('done2').setLabel('RECHAZAR').setStyle(ButtonStyle.Danger).setDisabled(true)
          );
          await interaction.editReply({ components: [rowDone] });
        } else {
          const embed = new EmbedBuilder().setTitle('POSTULANTE RECHAZADO').setDescription(mencion + ' fue **RECHAZADO** en el Grupo Halcón.').addFields({ name: '👮 Revisado por', value: revisor, inline: true }).setColor(0xCC2222).setTimestamp().setFooter({ text: 'Grupo Halcón  •  ' + fecha() });
          await canal.send({ embeds: [embed] });
          const rowDone = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('done1').setLabel('APROBAR').setStyle(ButtonStyle.Success).setDisabled(true),
            new ButtonBuilder().setCustomId('done2').setLabel('RECHAZADO por ' + revisor).setStyle(ButtonStyle.Danger).setDisabled(true)
          );
          await interaction.editReply({ components: [rowDone] });
        }
      } catch (err) { console.error('Error postulacion:', err); }
      return;
    }

    // Cualquier otro boton desconocido — ignorar silenciosamente
    return;
  }

  // ===== SLASH COMMANDS =====
  if (!interaction.isChatInputCommand()) return;

  const tieneRol = ROLES_AUTORIZADOS.some(r => interaction.member.roles.cache.has(r));
  const revisor = interaction.member?.displayName || interaction.user.username;

  // /apelar-sancion-halcon — disponible para todos
  if (interaction.commandName === 'apelar-sancion-halcon') {
    const sancion = getSancion(interaction.user.id);
    const historial = sancion.historial.filter(s => !s.nivel.includes('APELAC'));
    if (historial.length === 0) {
      await interaction.reply({ content: '❌ No tenés sanciones registradas para apelar.', ephemeral: true });
      return;
    }

    const ultimas = historial.slice(-5);

    // Construir botones agrupando cadenas de sanciones
    // Logica: recorrer el historial y detectar cadenas de warns que se convirtieron en strike
    // Una cadena es: N warns seguidos + 1 strike con "acumulados" = un solo boton del strike
    // Un warn suelto despues = su propio boton
    // Un strike directo (sin "acumulados") = su propio boton
    const botonesParaMostrar = [];
    for (let i = 0; i < ultimas.length; i++) {
      const s = ultimas[i];
      const idxReal = sancion.historial.indexOf(s);
      // Si es un warn que forma parte de una cadena que ya resulto en strike acumulado, saltarlo
      // (el strike acumulado ya representa a todos los warns de esa cadena)
      if (s.nivel.includes('WARN')) {
        // Buscar si hay un strike acumulado DESPUES de este warn en el historial
        const hayStrikeAcumuladoPosteriror = ultimas.slice(i + 1).some(posterior => posterior.nivel.includes('acumulados'));
        if (hayStrikeAcumuladoPosteriror) continue; // Este warn ya esta representado por el strike acumulado
      }
      let label;
      if (s.nivel.includes('acumulados')) {
        label = 'STRIKE acumulado (3 warns)';
      } else {
        label = s.nivel.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\uFE0F]/gu, '').trim().substring(0, 60);
      }
      botonesParaMostrar.push(
        new ButtonBuilder()
          .setCustomId('ELEG_' + idxReal + '_' + interaction.user.id)
          .setLabel(label)
          .setStyle(ButtonStyle.Secondary)
      );
    }

    const row = new ActionRowBuilder().addComponents(botonesParaMostrar);
    const descripcion = ultimas.map((s, i) =>
      '**' + (i+1) + '.** ' + s.nivel + (s.sancionadorId ? ' — por <@' + s.sancionadorId + '>' : '') + '\n_Motivo: ' + s.motivo + '_ | ' + s.fecha
    ).join('\n\n');

    const embed = new EmbedBuilder()
      .setTitle('⚖️ ¿Cuál sanción querés apelar?')
      .setDescription(descripcion + '\n\n> Elegí una opción para continuar.')
      .setColor(0xFFAA00).setFooter({ text: 'Grupo Halcón  •  Sistema de Apelaciones' });

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    return;
  }

  if (!tieneRol) { await interaction.reply({ content: '❌ No tenés permisos para usar este comando.', ephemeral: true }); return; }

  // /nuevo
  if (interaction.commandName === 'nuevo') {
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
  }

  // /ascender
  else if (interaction.commandName === 'ascender') {
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
        .addFields({ name: '🎖️ Nuevo rango', value: rangoNombre, inline: true }, { name: '👮 Ascendido por', value: revisor, inline: true })
        .setColor(0xFFD700).setThumbnail(usuario.displayAvatarURL()).setTimestamp().setFooter({ text: 'Grupo Halcón  •  Sistema de Ascensos' });
      await canalUp.send({ content: '<@' + usuario.id + '>', embeds: [embed] });
      await interaction.reply({ content: '✅ **' + miembro.displayName + '** ascendido a ' + rangoNombre + '.', ephemeral: true });
    } catch (err) { await interaction.reply({ content: '❌ Error al ascender. Verificá que el bot tenga el rol más alto.', ephemeral: true }); }
  }

  // /operativo — abre modal
  else if (interaction.commandName === 'operativo') {
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
  }

  // /sancionar
  else if (interaction.commandName === 'sancionar') {
    const usuario = interaction.options.getUser('usuario');
    const motivo  = interaction.options.getString('motivo');
    const tipo    = interaction.options.getString('sancion');
    const sancion = getSancion(usuario.id);

    let nivel = '', color = 0xFFAA00, expulsado = false;

    if (tipo === 'warn1' || tipo === 'warn2') {
      // Sumar warns al contador
      const cantidad = tipo === 'warn1' ? 1 : 2;
      sancion.warns += cantidad;
      // Si llega a 3 o mas, convertir en strike automaticamente
      if (sancion.warns >= 3) {
        sancion.warns = 0;
        sancion.strikes += 1;
        nivel = '🔴 STRIKE ' + sancion.strikes + ' (3 warns acumulados)';
        color = 0xCC2222;
        if (sancion.strikes >= 3) { nivel = '💀 EXPULSIÓN'; color = 0x000000; expulsado = true; }
      } else {
        nivel = '⚠️ WARN ' + sancion.warns; color = 0xFFAA00;
      }
    } else if (tipo === 'strike1') {
      sancion.warns = 0; sancion.strikes += 1;
      nivel = '🔴 STRIKE ' + sancion.strikes; color = 0xCC2222;
      if (sancion.strikes >= 3) { nivel = '💀 EXPULSIÓN'; color = 0x000000; expulsado = true; }
    } else if (tipo === 'strike2') {
      sancion.warns = 0; sancion.strikes += 2;
      nivel = '🔴 STRIKE ' + sancion.strikes; color = 0xCC2222;
      if (sancion.strikes >= 3) { nivel = '💀 EXPULSIÓN'; color = 0x000000; expulsado = true; }
    } else if (tipo === 'expulsion') {
      sancion.warns = 0; sancion.strikes = 3;
      nivel = '💀 EXPULSIÓN'; color = 0x000000; expulsado = true;
    }

    sancion.historial.push({ motivo, nivel, fecha: fecha(), sancionadorId: interaction.user.id });
    await guardarSanciones();

    const embed = new EmbedBuilder().setTitle('🚨 SANCIÓN — GRUPO HALCÓN')
      .setDescription('<@' + usuario.id + '> ha recibido una sanción.')
      .addFields(
        { name: '📊 Nivel',          value: nivel,                   inline: true },
        { name: '⚠️ Warns',          value: String(sancion.warns),   inline: true },
        { name: '🔴 Strikes',        value: String(sancion.strikes), inline: true },
        { name: '📋 Motivo',         value: motivo,                  inline: false },
        { name: '👮 Sancionado por', value: '<@' + interaction.user.id + '>', inline: true }
      )
      .setColor(color).setTimestamp().setFooter({ text: 'Grupo Halcón  •  Sistema de Sanciones' });

    const canalSanc = await client.channels.fetch(CANAL_SANCIONES);
    await canalSanc.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Sanción aplicada en #sanciones-halcon.', ephemeral: true });

    if (expulsado) {
      const m = ROLES_AUTORIZADOS.map(id => '<@&' + id + '>').join(' ');
      await canalSanc.send({ content: m + ' ⛔ **' + usuario.username + '** llegó a 3 strikes. Se recomienda expulsión inmediata.' });
    }
  }

  // /galeria
  else if (interaction.commandName === 'galeria') {
    // Verificar que tiene al menos rol de Miembro Halcon
    const todosRolesHalcon = Object.keys(RANGOS);
    const esMiembro = todosRolesHalcon.some(r => interaction.member.roles.cache.has(r));
    if (!esMiembro) {
      await interaction.reply({ content: '❌ Solo los miembros del Grupo Halcón pueden publicar en la galería.', ephemeral: true });
      return;
    }

    const imagen = interaction.options.getAttachment('imagen');

    // Verificar que es una imagen
    if (!imagen.contentType?.startsWith('image/')) {
      await interaction.reply({ content: '❌ Solo se pueden subir imágenes.', ephemeral: true });
      return;
    }

    // Guardar URL en memoria y usar customId simple
    imagenesPendientes[interaction.user.id] = imagen.url;
    const modal = new ModalBuilder()
      .setCustomId('modal_galeria')
      .setTitle('Publicar en Galería — Grupo Halcón');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('gal_titulo')
          .setLabel('Título de la publicación')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ej: Operativo ALFA — Convoy exitoso')
          .setRequired(true).setMaxLength(80)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('gal_descripcion')
          .setLabel('Descripción / Caption')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Contá cómo fue el operativo, quiénes participaron, el resultado...')
          .setRequired(true).setMaxLength(500)
      )
    );

    await interaction.showModal(modal);
  }

  // /sanciones
  else if (interaction.commandName === 'sanciones') {
    const usuario = interaction.options.getUser('usuario');
    const sancion = getSancion(usuario.id);
    const historial = sancion.historial.length > 0
      ? sancion.historial.slice(-5).map((s, i) => '**' + (i+1) + '.** ' + s.nivel + ' — ' + s.motivo + '\n_' + s.fecha + '_').join('\n\n')
      : 'Sin sanciones registradas.';
    const embed = new EmbedBuilder().setTitle('📋 SANCIONES — ' + usuario.username.toUpperCase())
      .addFields({ name: '⚠️ Warns', value: String(sancion.warns), inline: true }, { name: '🔴 Strikes', value: String(sancion.strikes), inline: true }, { name: '📜 Últimas sanciones', value: historial, inline: false })
      .setColor(0xFFD700).setThumbnail(usuario.displayAvatarURL()).setTimestamp().setFooter({ text: 'Grupo Halcón  •  Sistema de Sanciones' });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// ==================== POSTULACIONES ====================
client.on('messageCreate', async (message) => {
  if (!message.webhookId) return;
  if (!message.content.includes('NUEVO EXAMEN DE INGRESO')) return;
  const c = message.content;
  await message.delete();
  const get = (p) => { const m = c.match(p); return m ? m[1].replace(/\*/g,'').replace(/>/g,'').trim() : 'N/A'; };
  const nombre=get(/Nombre IC:\s*(.+)/i), rango=get(/Rango PFA:\s*(.+)/i), mic=get(/Micrófono:\s*(.+)/i), disp=get(/Disponibilidad:\s*(.+)/i);
  const dm=c.match(/Discord ID[^0-9]*(\d{15,20})/i);
  const discordId=dm?dm[1].trim():null;
  const mencion=discordId?'<@'+discordId+'>':nombre;
  const lm=c.match(/(\d+\/\d+\s*correctos)/i);
  const latas=lm?lm[1]:'N/A';
  const p2=get(/PREGUNTA 2[^\n]*\n([^\n]+)/i),p3=get(/PREGUNTA 3[^\n]*\n([^\n]+)/i),p4=get(/PREGUNTA 4[^\n]*\n([^\n]+)/i),p5=get(/PREGUNTA 5[^\n]*\n([^\n]+)/i),p6=get(/PREGUNTA 6[^\n]*\n([^\n]+)/i),p7=get(/PREGUNTA 7[^\n]*\n([^\n]+)/i),p8=get(/PREGUNTA 8[^\n]*\n([^\n]+)/i),p9=get(/PREGUNTA 9[^\n]*\n([^\n]+)/i);
  const mencionRoles=ROLES_AUTORIZADOS.map(id=>'<@&'+id+'>').join(' ');
  const embed=new EmbedBuilder().setTitle('🦅  NUEVO EXAMEN DE INGRESO — GRUPO HALCÓN  🦅').setColor(0xFFD700)
    .addFields({name:'👤  Nombre IC',value:nombre,inline:true},{name:'🎖️  Rango PFA',value:rango,inline:true},{name:'🎙️  Micrófono',value:mic,inline:true},{name:'📅  Disponibilidad',value:disp,inline:true},{name:'🔗  Discord',value:mencion,inline:true},{name:'🥫  Latas',value:latas,inline:true},{name:'\u200B',value:'\u200B',inline:false},
    {name:'📋  Preguntas',value:'**P2:** '+(p2||'N/A')+'\n\n**P3:** '+(p3||'N/A')+'\n\n**P4:** '+(p4||'N/A')+'\n\n**P5:** '+(p5||'N/A')+'\n\n**P6:** '+(p6||'N/A')+'\n\n**P7:** '+(p7||'N/A')+'\n\n**P8:** '+(p8||'N/A')+'\n\n**P9:** '+(p9||'N/A'),inline:false})
    .setTimestamp().setFooter({text:'Grupo Halcón  •  Sistema de Postulaciones'});
  const row=new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ap_'+Date.now()+'_'+nombre+'_'+(discordId||'')).setLabel('APROBAR').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('re_'+Date.now()+'_'+nombre+'_'+(discordId||'')).setLabel('RECHAZAR').setStyle(ButtonStyle.Danger)
  );
  await message.channel.send({content:mencionRoles,embeds:[embed],components:[row]});
});

client.login(process.env.TOKEN)
