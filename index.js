require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const CANAL_RESULTADO = '1493454727680364584';

const ROLES_AUTORIZADOS = [
  '1474197418890362911',
  '1460348058888830976',
  '1466331349945155615'
];

client.once('ready', () => { console.log('Bot conectado: ' + client.user.tag); });

client.on('messageCreate', async (message) => {
  if (!message.webhookId) return;
  if (!message.content.includes('NUEVO EXAMEN DE INGRESO')) return;

  const c = message.content;
  await message.delete();

  const get = (pattern) => {
    const m = c.match(pattern);
    return m ? m[1].replace(/\*/g, '').replace(/>/g, '').trim() : 'N/A';
  };

  const nombre = get(/Nombre IC:\s*(.+)/i);
  const rango  = get(/Rango PFA:\s*(.+)/i);
  const mic    = get(/Micrófono:\s*(.+)/i);
  const disp   = get(/Disponibilidad:\s*(.+)/i);

  const discordMatch = c.match(/Discord ID[^0-9]*(\d{15,20})/i);
  const discordId = discordMatch ? discordMatch[1].trim() : null;
  const mencion = discordId ? '<@' + discordId + '>' : nombre;

  const latasMatch = c.match(/(\d+\/\d+\s*correctos)/i);
  const latas = latasMatch ? latasMatch[1] : 'N/A';

  const p2 = get(/PREGUNTA 2[^\n]*\n([^\n]+)/i);
  const p3 = get(/PREGUNTA 3[^\n]*\n([^\n]+)/i);
  const p4 = get(/PREGUNTA 4[^\n]*\n([^\n]+)/i);
  const p5 = get(/PREGUNTA 5[^\n]*\n([^\n]+)/i);
  const p6 = get(/PREGUNTA 6[^\n]*\n([^\n]+)/i);
  const p7 = get(/PREGUNTA 7[^\n]*\n([^\n]+)/i);
  const p8 = get(/PREGUNTA 8[^\n]*\n([^\n]+)/i);
  const p9 = get(/PREGUNTA 9[^\n]*\n([^\n]+)/i);

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
        '**¿Que haces si el sospechoso intenta fugarse en vehiculo durante un operativo?**\n' + (p2||'N/A') + '\n\n' +
        '**¿Cuando esta permitido disparar primero sin provocacion previa?**\n' + (p3||'N/A') + '\n\n' +
        '**¿Que es el NVL (No Valorar la Vida) y pone un ejemplo?**\n' + (p4||'N/A') + '\n\n' +
        '**Estas cubriendo un punto hace 40 minutos sin novedades. Tu companero te dice que te vayas. ¿Que haces?**\n' + (p5||'N/A') + '\n\n' +
        '**Un superior falta el respeto a un civil sin motivo durante un rol. Vos estas al lado. ¿Como actuas?**\n' + (p6||'N/A') + '\n\n' +
        '**Estas solo en patrulla y ves un auto sospechoso mirando un local. Sin apoyo disponible. ¿Que haces paso a paso?**\n' + (p7||'N/A') + '\n\n' +
        '**¿Por que queres ser parte del Grupo Halcon?**\n' + (p8||'N/A') + '\n\n' +
        '**Describi a tu personaje: quien es, de donde viene y por que entro a la PFA**\n' + (p9||'N/A'),
        inline: false }
    )
    .setTimestamp()
    .setFooter({ text: 'Grupo Halcón  •  Sistema de Postulaciones' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ap_' + Date.now() + '_' + nombre + '_' + (discordId || ''))
      .setLabel('APROBAR')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('re_' + Date.now() + '_' + nombre + '_' + (discordId || ''))
      .setLabel('RECHAZAR')
      .setStyle(ButtonStyle.Danger)
  );

  await message.channel.send({ content: mencionRoles, embeds: [embed], components: [row] });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const tieneRol = ROLES_AUTORIZADOS.some(rolId => interaction.member.roles.cache.has(rolId));

  if (!tieneRol) {
    await interaction.reply({ content: '❌ No tenés permisos para aprobar o rechazar postulaciones.', ephemeral: true });
    return;
  }

  await interaction.deferUpdate();

  const parts = interaction.customId.split('_');
  const accion = parts[0];
  const nombre = parts[2];
  const discordId = parts[3];
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
});

client.login(process.env.TOKEN)
