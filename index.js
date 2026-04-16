require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const CANAL_RESULTADO   = '1493454727680364584';
const CANAL_UPDATES     = '1493446131663896626';
const ROL_MIEMBRO       = '1459343074378387591';

const ROLES_AUTORIZADOS = [
  '1474197418890362911',
  '1460348058888830976',
  '1466331349945155615'
];

// Rangos de Halcon en orden ascendente
const RANGOS_HALCON = [
  { nombre: 'Miembro Halcón',      id: '1459343074378387591' },
  { nombre: 'Teniente Halcón',     id: '1459343200000000001' },
  { nombre: 'Capitán Halcón',      id: '1459343200000000002' },
  { nombre: 'Comandante Halcón',   id: '1459343200000000003' },
  { nombre: 'Jefe Halcón',         id: '1459343200000000004' },
  { nombre: 'Sub Jefe Halcón',     id: '1459343200000000005' },
  { nombre: 'Director/a Halcón',   id: '1459343200000000006' },
];

// Sistema de sanciones en memoria
const sanciones = {}; // { userId: { warns: 0, strikes: 0, historial: [] } }

function getSancion(userId) {
  if (!sanciones[userId]) sanciones[userId] = { warns: 0, strikes: 0, historial: [] };
  return sanciones[userId];
}

client.once('ready', async () => {
  console.log('Bot conectado: ' + client.user.tag);

  const commands = [
    // /nuevo
    new SlashCommandBuilder()
      .setName('nuevo')
      .setDescription('Ingresa un nuevo miembro al Grupo Halcon')
      .addUserOption(o => o.setName('usuario').setDescription('El usuario a ingresar').setRequired(true)),

    // /ascender
    new SlashCommandBuilder()
      .setName('ascender')
      .setDescription('Asciende a un miembro del Grupo Halcon')
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

    // /operativo
    new SlashCommandBuilder()
      .setName('operativo')
      .setDescription('Anuncia un operativo del Grupo Halcon')
      .addStringOption(o => o.setName('tipo').setDescription('Tipo de operativo').setRequired(true)
        .addChoices(
          { name: '🚐 ALFA — Convoy Blindado',          value: 'ALFA' },
          { name: '🛡️ BRAVO — Escolta VIP',              value: 'BRAVO' },
          { name: '🔴 CHARLIE — Control Zona Caliente',  value: 'CHARLIE' },
          { name: '🏦 DELTA — Custodia Bancaria',        value: 'DELTA' },
          { name: '🚗 ECHO — Persecución Alto Riesgo',   value: 'ECHO' },
          { name: '🆘 FOXTROT — Rescate de Rehén',       value: 'FOXTROT' },
          { name: '🌆 GOLF — Patrulla Urbana',           value: 'GOLF' },
          { name: '🚨 HOTEL — Respuesta Robo Banco',     value: 'HOTEL' },
        ))
      .addStringOption(o => o.setName('descripcion').setDescription('Detalles del operativo').setRequired(true))
      .addStringOption(o => o.setName('hora').setDescription('Hora del operativo (ej: 21:00)').setRequired(false)),

    // /sancionar
    new SlashCommandBuilder()
      .setName('sancionar')
      .setDescription('Aplica una sancion a un miembro del Grupo Halcon')
      .addUserOption(o => o.setName('usuario').setDescription('El usuario a sancionar').setRequired(true))
      .addStringOption(o => o.setName('motivo').setDescription('Motivo de la sancion').setRequired(true)),

    // /sanciones
    new SlashCommandBuilder()
      .setName('sanciones')
      .setDescription('Ver el historial de sanciones de un miembro')
      .addUserOption(o => o.setName('usuario').setDescription('El usuario a consultar').setRequired(true)),

  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Comandos registrados.');
  } catch (err) { console.error('Error registrando comandos:', err); }
});

client.on('interactionCreate', async (interaction) => {

  // ==================== BOTÓN APELAR ====================
  if (interaction.isButton() && interaction.customId.startsWith('apelar_')) {
    const userId = interaction.customId.split('_')[1];
    const sancion = getSancion(userId);
    const mencionSup = ROLES_AUTORIZADOS.map(id => '<@&' + id + '>').join(' ');

    const embedApelacion = new EmbedBuilder()
      .setTitle('⚖️ APELACIÓN DE SANCIÓN')
      .setDescription('<@' + userId + '> está apelando su última sanción.')
      .addFields(
        { name: '⚠️ Warns actuales', value: String(sancion.warns), inline: true },
        { name: '🔴 Strikes actuales', value: String(sancion.strikes), inline: true },
        { name: '📋 Última sanción', value: sancion.historial[sancion.historial.length - 1]?.motivo || 'N/A', inline: false }
      )
      .setColor(0xFFAA00)
      .setTimestamp();

    await interaction.reply({ content: mencionSup, embeds: [embedApelacion] });
    return;
  }

  // ==================== BOTONES POSTULACIÓN ====================
  if (interaction.isButton() && !interaction.customId.startsWith('apelar_')) {
    const tieneRol = ROLES_AUTORIZADOS.some(r => interaction.member.roles.cache.has(r));
    if (!tieneRol) {
      await interaction.reply({ content: '❌ No tenés permisos para hacer esto.', ephemeral: true });
      return;
    }

    await interaction.deferUpdate();
    const parts = interaction.customId.split('_');
    const accion = parts[0], nombre = parts[2], discordId = parts[3];
    const mencion = discordId ? '<@' + discordId + '>' : '**' + nombre + '**';
    const fecha = new Date().toLocaleString('es-AR');
    const revisor = interaction.member?.displayName || interaction.user.username;

    try {
      const canal = await client.channels.fetch(CANAL_RESULTADO);
      if (accion === 'ap') {
        const embedAp = new EmbedBuilder()
          .setTitle('POSTULANTE APROBADO')
          .setDescription(mencion + ' fue **APROBADO** en el Grupo Halcón.')
          .addFields({ name: '👮  Revisado por', value: revisor, inline: true })
          .setColor(0x00CC66).setTimestamp()
          .setFooter({ text: 'Grupo Halcón  •  ' + fecha });
        await canal.send({ embeds: [embedAp] });
        const rowDone = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('done1').setLabel('APROBADO por ' + revisor).setStyle(ButtonStyle.Success).setDisabled(true),
          new ButtonBuilder().setCustomId('done2').setLabel('RECHAZAR').setStyle(ButtonStyle.Danger).setDisabled(true)
        );
        await interaction.editReply({ components: [rowDone] });
      } else {
        const embedRe = new EmbedBuilder()
          .setTitle('POSTULANTE RECHAZADO')
          .setDescription(mencion + ' fue **RECHAZADO** en el Grupo Halcón.')
          .addFields({ name: '👮  Revisado por', value: revisor, inline: true })
          .setColor(0xCC2222).setTimestamp()
          .setFooter({ text: 'Grupo Halcón  •  ' + fecha });
        await canal.send({ embeds: [embedRe] });
        const rowDone = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('done1').setLabel('APROBAR').setStyle(ButtonStyle.Success).setDisabled(true),
          new ButtonBuilder().setCustomId('done2').setLabel('RECHAZADO por ' + revisor).setStyle(ButtonStyle.Danger).setDisabled(true)
        );
        await interaction.editReply({ components: [rowDone] });
      }
    } catch (error) { console.error('Error:', error); }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const tieneRol = ROLES_AUTORIZADOS.some(r => interaction.member.roles.cache.has(r));
  if (!tieneRol) {
    await interaction.reply({ content: '❌ No tenés permisos para usar este comando.', ephemeral: true });
    return;
  }

  const revisor = interaction.member?.displayName || interaction.user.username;

  // ==================== /nuevo ====================
  if (interaction.commandName === 'nuevo') {
    const usuario = interaction.options.getUser('usuario');
    const miembro = await interaction.guild.members.fetch(usuario.id);
    try {
      await miembro.roles.add(ROL_MIEMBRO);
      const canalUp = await client.channels.fetch(CANAL_UPDATES);
      const embed = new EmbedBuilder()
        .setTitle('🦅 NUEVO INGRESO — GRUPO HALCÓN')
        .setDescription('<@' + usuario.id + '> ha sido ingresado oficialmente al **Grupo Halcón**.\n¡Bienvenido, Agente!')
        .addFields(
          { name: '👮 Ingresado por', value: revisor, inline: true },
          { name: '🔸 Rango asignado', value: 'Miembro Halcón', inline: true }
        )
        .setColor(0xFFD700).setThumbnail(usuario.displayAvatarURL()).setTimestamp()
        .setFooter({ text: 'Grupo Halcón  •  Sistema de Ingresos' });
      await canalUp.send({ content: '<@' + usuario.id + '>', embeds: [embed] });
      await interaction.reply({ content: '✅ **' + miembro.displayName + '** ingresado como Miembro Halcón y anunciado en #updates.', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Error al ingresar al miembro.', ephemeral: true });
    }
  }

  // ==================== /ascender ====================
  else if (interaction.commandName === 'ascender') {
    const usuario = interaction.options.getUser('usuario');
    const rolId   = interaction.options.getString('rango');
    const miembro = await interaction.guild.members.fetch(usuario.id);

    // Buscar nombre del rango elegido
    const rangoNombre = {
      '1459343074378387591': 'Miembro Halcón',
      '1460777138129998025':   'Teniente Halcón',
      '1476854892181065739':    'Capitán Halcón',
      '1466328471536930846': 'Comandante Halcón',
      '1466331349945155615':       'Jefe Halcón',
      '1466331228864254002':    'Sub Jefe Halcón',
      '1460348058888830976':   'Director/a Halcón',
    }[rolId] || 'Rango desconocido';

    try {
      // Quitar todos los roles de Halcon primero
      const todosRoles = ['1459343074378387591','1460777138129998025','1476854892181065739','1466328471536930846','1466331349945155615','1466331228864254002','1460348058888830976'];
      for (const r of todosRoles) {
        if (r !== '1460777138129998025' && r !== '1476854892181065739' && r !== '1466328471536930846' && r !== '1466331349945155615' && r !== '1466331228864254002' && r !== '1460348058888830976') {
          if (miembro.roles.cache.has(r)) await miembro.roles.remove(r).catch(() => {});
        }
      }
      // Asignar nuevo rol
      if (!rolId.includes('_ID')) await miembro.roles.add(rolId);

      const canalUp = await client.channels.fetch(CANAL_UPDATES);
      const embed = new EmbedBuilder()
        .setTitle('🦅 ASCENSO — GRUPO HALCÓN')
        .setDescription('<@' + usuario.id + '> ha sido ascendido en el **Grupo Halcón**.')
        .addFields(
          { name: '🎖️ Nuevo rango',    value: rangoNombre, inline: true },
          { name: '👮 Ascendido por',  value: revisor,     inline: true }
        )
        .setColor(0xFFD700).setThumbnail(usuario.displayAvatarURL()).setTimestamp()
        .setFooter({ text: 'Grupo Halcón  •  Sistema de Ascensos' });
      await canalUp.send({ content: '<@' + usuario.id + '>', embeds: [embed] });
      await interaction.reply({ content: '✅ **' + miembro.displayName + '** ascendido a ' + rangoNombre + ' y anunciado en #updates.', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Error al ascender al miembro. Verificá que el bot tenga el rol más alto.', ephemeral: true });
    }
  }

  // ==================== /operativo ====================
  else if (interaction.commandName === 'operativo') {
    const tipo = interaction.options.getString('tipo');
    const desc = interaction.options.getString('descripcion');
    const hora = interaction.options.getString('hora') || 'A confirmar';

    const infoTipo = {
      'ALFA':    { emoji: '🚐', nombre: 'CONVOY BLINDADO',         nivel: 'ALTO RIESGO',       color: 0xCC2222 },
      'BRAVO':   { emoji: '🛡️', nombre: 'ESCOLTA VIP',             nivel: 'ALTO RIESGO',       color: 0xCC2222 },
      'CHARLIE': { emoji: '🔴', nombre: 'CONTROL ZONA CALIENTE',   nivel: 'MEDIO RIESGO',      color: 0xFFAA00 },
      'DELTA':   { emoji: '🏦', nombre: 'CUSTODIA BANCARIA',       nivel: 'ALTO RIESGO',       color: 0xCC2222 },
      'ECHO':    { emoji: '🚗', nombre: 'PERSECUCIÓN ALTO RIESGO', nivel: 'ALTO RIESGO',       color: 0xCC2222 },
      'FOXTROT': { emoji: '🆘', nombre: 'RESCATE DE REHÉN',        nivel: 'BAJA PELIGROSIDAD', color: 0x2266CC },
      'GOLF':    { emoji: '🌆', nombre: 'PATRULLA URBANA',         nivel: 'PRESENCIA DIARIA',  color: 0x2D6A2D },
      'HOTEL':   { emoji: '🚨', nombre: 'RESPUESTA ROBO BANCO',    nivel: 'ALTO RIESGO',       color: 0xCC2222 },
    }[tipo];

    const mencionRoles = ROLES_AUTORIZADOS.map(id => '<@&' + id + '>').join(' ');

    const embed = new EmbedBuilder()
      .setTitle(infoTipo.emoji + '  OPERATIVO ' + tipo + ' — ' + infoTipo.nombre)
      .addFields(
        { name: '⚠️ Nivel',        value: infoTipo.nivel, inline: true },
        { name: '🕐 Hora',         value: hora,           inline: true },
        { name: '👮 Ordenado por', value: revisor,        inline: true },
        { name: '📋 Descripción',  value: desc,           inline: false }
      )
      .setColor(infoTipo.color).setTimestamp()
      .setFooter({ text: 'Grupo Halcón  •  Operaciones' });

    // Mandar en el canal actual
    await interaction.reply({ content: mencionRoles, embeds: [embed] });
  }

  // ==================== /sancionar ====================
  else if (interaction.commandName === 'sancionar') {
    const usuario = interaction.options.getUser('usuario');
    const motivo  = interaction.options.getString('motivo');
    const sancion = getSancion(usuario.id);

    sancion.warns++;
    let nivel = '';
    let color = 0xFFAA00;
    let expulsado = false;

    if (sancion.warns >= 3) {
      sancion.warns = 0;
      sancion.strikes++;
      nivel = '🔴 STRIKE ' + sancion.strikes;
      color = 0xCC2222;
      if (sancion.strikes >= 3) {
        nivel = '💀 EXPULSIÓN';
        color = 0x000000;
        expulsado = true;
      }
    } else {
      nivel = '⚠️ WARN ' + sancion.warns;
    }

    sancion.historial.push({ motivo, nivel, fecha: new Date().toLocaleString('es-AR') });

    const rowApelar = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apelar_' + usuario.id)
        .setLabel('APELAR')
        .setStyle(ButtonStyle.Secondary)
    );

    const embed = new EmbedBuilder()
      .setTitle('🚨 SANCIÓN — GRUPO HALCÓN')
      .setDescription('<@' + usuario.id + '> ha recibido una sanción.')
      .addFields(
        { name: '📊 Nivel',          value: nivel,             inline: true },
        { name: '⚠️ Warns',          value: String(sancion.warns),   inline: true },
        { name: '🔴 Strikes',        value: String(sancion.strikes), inline: true },
        { name: '📋 Motivo',         value: motivo,            inline: false },
        { name: '👮 Sancionado por', value: revisor,           inline: true }
      )
      .setColor(color).setTimestamp()
      .setFooter({ text: 'Grupo Halcón  •  Sistema de Sanciones' });

    await interaction.reply({ content: '<@' + usuario.id + '>', embeds: [embed], components: [rowApelar] });

    if (expulsado) {
      await interaction.followUp({ content: '⛔ **' + usuario.username + '** llegó a 3 strikes. Se recomienda expulsión inmediata.', ephemeral: false });
    }
  }

  // ==================== /sanciones ====================
  else if (interaction.commandName === 'sanciones') {
    const usuario = interaction.options.getUser('usuario');
    const sancion = getSancion(usuario.id);

    const historial = sancion.historial.length > 0
      ? sancion.historial.slice(-5).map((s, i) => '**' + (i+1) + '.** ' + s.nivel + ' — ' + s.motivo + '\n_' + s.fecha + '_').join('\n\n')
      : 'Sin sanciones registradas.';

    const embed = new EmbedBuilder()
      .setTitle('📋 HISTORIAL DE SANCIONES — ' + usuario.username.toUpperCase())
      .addFields(
        { name: '⚠️ Warns actuales',  value: String(sancion.warns),   inline: true },
        { name: '🔴 Strikes actuales', value: String(sancion.strikes), inline: true },
        { name: '📜 Últimas sanciones', value: historial, inline: false }
      )
      .setColor(0xFFD700).setThumbnail(usuario.displayAvatarURL()).setTimestamp()
      .setFooter({ text: 'Grupo Halcón  •  Sistema de Sanciones' });

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
  const nombre = get(/Nombre IC:\s*(.+)/i), rango = get(/Rango PFA:\s*(.+)/i);
  const mic = get(/Micrófono:\s*(.+)/i), disp = get(/Disponibilidad:\s*(.+)/i);
  const discordMatch = c.match(/Discord ID[^0-9]*(\d{15,20})/i);
  const discordId = discordMatch ? discordMatch[1].trim() : null;
  const mencion = discordId ? '<@' + discordId + '>' : nombre;
  const latasMatch = c.match(/(\d+\/\d+\s*correctos)/i);
  const latas = latasMatch ? latasMatch[1] : 'N/A';
  const p2=get(/PREGUNTA 2[^\n]*\n([^\n]+)/i),p3=get(/PREGUNTA 3[^\n]*\n([^\n]+)/i);
  const p4=get(/PREGUNTA 4[^\n]*\n([^\n]+)/i),p5=get(/PREGUNTA 5[^\n]*\n([^\n]+)/i);
  const p6=get(/PREGUNTA 6[^\n]*\n([^\n]+)/i),p7=get(/PREGUNTA 7[^\n]*\n([^\n]+)/i);
  const p8=get(/PREGUNTA 8[^\n]*\n([^\n]+)/i),p9=get(/PREGUNTA 9[^\n]*\n([^\n]+)/i);

  const mencionRoles = ROLES_AUTORIZADOS.map(id => '<@&' + id + '>').join(' ');

  const embed = new EmbedBuilder()
    .setTitle('🦅  NUEVO EXAMEN DE INGRESO — GRUPO HALCÓN  🦅')
    .setColor(0xFFD700)
    .addFields(
      { name: '👤  Nombre IC',      value: nombre,  inline: true },
      { name: '🎖️  Rango PFA',      value: rango,   inline: true },
      { name: '🎙️  Micrófono',      value: mic,     inline: true },
      { name: '📅  Disponibilidad', value: disp,    inline: true },
      { name: '🔗  Discord',        value: mencion, inline: true },
      { name: '🥫  Latas',          value: latas,   inline: true },
      { name: '\u200B', value: '\u200B', inline: false },
      { name: '📋  Preguntas y Respuestas', value:
        '**¿Que haces si el sospechoso intenta fugarse en vehiculo?**\n'+(p2||'N/A')+'\n\n'+
        '**¿Cuando esta permitido disparar primero?**\n'+(p3||'N/A')+'\n\n'+
        '**¿Que es el NVL?**\n'+(p4||'N/A')+'\n\n'+
        '**Punto sin novedades, companero te dice que te vayas. ¿Que haces?**\n'+(p5||'N/A')+'\n\n'+
        '**Superior falta el respeto a un civil. ¿Como actuas?**\n'+(p6||'N/A')+'\n\n'+
        '**Auto sospechoso, sin apoyo. ¿Que haces paso a paso?**\n'+(p7||'N/A')+'\n\n'+
        '**¿Por que queres ser parte del Grupo Halcon?**\n'+(p8||'N/A')+'\n\n'+
        '**Describi a tu personaje**\n'+(p9||'N/A'),
        inline: false }
    )
    .setTimestamp()
    .setFooter({ text: 'Grupo Halcón  •  Sistema de Postulaciones' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ap_'+Date.now()+'_'+nombre+'_'+(discordId||'')).setLabel('APROBAR').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('re_'+Date.now()+'_'+nombre+'_'+(discordId||'')).setLabel('RECHAZAR').setStyle(ButtonStyle.Danger)
  );

  await message.channel.send({ content: mencionRoles, embeds: [embed], components: [row] });
});

client.login(process.env.TOKEN)
