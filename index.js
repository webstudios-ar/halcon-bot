require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const CANAL_RESULTADO = '1493454727680364584';
const CANAL_UPDATES = '1493446131663896626';
const ROL_MIEMBRO_HALCON = '1459343074378387591';

const ROLES_AUTORIZADOS = ['1474197418890362911','1460348058888830976','1466331349945155615'];

client.once('ready', async () => {
  console.log('Bot conectado: ' + client.user.tag);
  const commands = [new SlashCommandBuilder().setName('nuevo').setDescription('Ingresa un nuevo miembro al Grupo Halcon').addUserOption(o => o.setName('usuario').setDescription('El usuario a ingresar').setRequired(true))].map(c => c.toJSON());
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try { await rest.put(Routes.applicationCommands(client.user.id), { body: commands }); console.log('Comandos registrados.'); }
  catch (err) { console.error('Error registrando comandos:', err); }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'nuevo') {
    const tieneRol = ROLES_AUTORIZADOS.some(r => interaction.member.roles.cache.has(r));
    if (!tieneRol) { await interaction.reply({ content: '❌ No tenés permisos para usar este comando.', ephemeral: true }); return; }
    const usuario = interaction.options.getUser('usuario');
    const miembro = await interaction.guild.members.fetch(usuario.id);
    const revisor = interaction.member?.displayName || interaction.user.username;
    try {
      await miembro.roles.add(ROL_MIEMBRO_HALCON);
      const canalUpdates = await client.channels.fetch(CANAL_UPDATES);
      const embedIngreso = new EmbedBuilder()
        .setTitle('🦅 NUEVO INGRESO — GRUPO HALCÓN')
        .setDescription('<@' + usuario.id + '> ha sido ingresado oficialmente al **Grupo Halcón**.\n¡Bienvenido, Agente!')
        .addFields({ name: '👮 Ingresado por', value: revisor, inline: true }, { name: '🔸 Rango asignado', value: 'Miembro Halcón', inline: true })
        .setColor(0xFFD700).setThumbnail(usuario.displayAvatarURL()).setTimestamp()
        .setFooter({ text: 'Grupo Halcón  •  Sistema de Ingresos' });
      await canalUpdates.send({ content: '<@' + usuario.id + '>', embeds: [embedIngreso] });
      await interaction.reply({ content: '✅ **' + miembro.displayName + '** fue ingresado como Miembro Halcón y se anunció en updates.', ephemeral: true });
    } catch (err) { console.error('Error en /nuevo:', err); await interaction.reply({ content: '❌ Error al ingresar al miembro.', ephemeral: true }); }
    return;
  }

  if (!interaction.isButton()) return;
  const tieneRol = ROLES_AUTORIZADOS.some(r => interaction.member.roles.cache.has(r));
  if (!tieneRol) { await interaction.reply({ content: '❌ No tenés permisos para aprobar o rechazar postulaciones.', ephemeral: true }); return; }
  await interaction.deferUpdate();
  const parts = interaction.customId.split('_');
  const accion = parts[0], nombre = parts[2], discordId = parts[3];
  const mencion = discordId ? '<@' + discordId + '>' : '**' + nombre + '**';
  const fecha = new Date().toLocaleString('es-AR');
  const revisor = interaction.member?.displayName || interaction.user.username;
  try {
    const canal = await client.channels.fetch(CANAL_RESULTADO);
    if (accion === 'ap') {
      const embedAp = new EmbedBuilder().setTitle('POSTULANTE APROBADO').setDescription(mencion + ' fue **APROBADO** en el Grupo Halcón.').addFields({ name: '👮  Revisado por', value: revisor, inline: true }).setColor(0x00CC66).setTimestamp().setFooter({ text: 'Grupo Halcón  •  ' + fecha });
      await canal.send({ embeds: [embedAp] });
      const rowDone = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('done1').setLabel('APROBADO por ' + revisor).setStyle(ButtonStyle.Success).setDisabled(true), new ButtonBuilder().setCustomId('done2').setLabel('RECHAZAR').setStyle(ButtonStyle.Danger).setDisabled(true));
      await interaction.editReply({ components: [rowDone] });
    } else {
      const embedRe = new EmbedBuilder().setTitle('POSTULANTE RECHAZADO').setDescription(mencion + ' fue **RECHAZADO** en el Grupo Halcón.').addFields({ name: '👮  Revisado por', value: revisor, inline: true }).setColor(0xCC2222).setTimestamp().setFooter({ text: 'Grupo Halcón  •  ' + fecha });
      await canal.send({ embeds: [embedRe] });
      const rowDone = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('done1').setLabel('APROBAR').setStyle(ButtonStyle.Success).setDisabled(true), new ButtonBuilder().setCustomId('done2').setLabel('RECHAZADO por ' + revisor).setStyle(ButtonStyle.Danger).setDisabled(true));
      await interaction.editReply({ components: [rowDone] });
    }
  } catch (error) { console.error('Error:', error); }
});

client.on('messageCreate', async (message) => {
  if (!message.webhookId) return;
  if (!message.content.includes('NUEVO EXAMEN DE INGRESO')) return;
  const c = message.content;
  await message.delete();
  const get = (p) => { const m = c.match(p); return m ? m[1].replace(/\*/g,'').replace(/>/g,'').trim() : 'N/A'; };
  const nombre = get(/Nombre IC:\s*(.+)/i), rango = get(/Rango PFA:\s*(.+)/i), mic = get(/Micrófono:\s*(.+)/i), disp = get(/Disponibilidad:\s*(.+)/i);
  const discordMatch = c.match(/Discord ID[^0-9]*(\d{15,20})/i);
  const discordId = discordMatch ? discordMatch[1].trim() : null;
  const mencion = discordId ? '<@' + discordId + '>' : nombre;
  const latasMatch = c.match(/(\d+\/\d+\s*correctos)/i);
  const latas = latasMatch ? latasMatch[1] : 'N/A';
  const p2=get(/PREGUNTA 2[^\n]*\n([^\n]+)/i),p3=get(/PREGUNTA 3[^\n]*\n([^\n]+)/i),p4=get(/PREGUNTA 4[^\n]*\n([^\n]+)/i),p5=get(/PREGUNTA 5[^\n]*\n([^\n]+)/i),p6=get(/PREGUNTA 6[^\n]*\n([^\n]+)/i),p7=get(/PREGUNTA 7[^\n]*\n([^\n]+)/i),p8=get(/PREGUNTA 8[^\n]*\n([^\n]+)/i),p9=get(/PREGUNTA 9[^\n]*\n([^\n]+)/i);
  const mencionRoles = ROLES_AUTORIZADOS.map(id => '<@&' + id + '>').join(' ');
  const embed = new EmbedBuilder().setTitle('🦅  NUEVO EXAMEN DE INGRESO — GRUPO HALCÓN  🦅').setColor(0xFFD700)
    .addFields({name:'👤  Nombre IC',value:nombre,inline:true},{name:'🎖️  Rango PFA',value:rango,inline:true},{name:'🎙️  Micrófono',value:mic,inline:true},{name:'📅  Disponibilidad',value:disp,inline:true},{name:'🔗  Discord',value:mencion,inline:true},{name:'🥫  Latas',value:latas,inline:true},{name:'\u200B',value:'\u200B',inline:false},
    {name:'📋  Preguntas y Respuestas',value:'**P2:** '+(p2||'N/A')+'\n\n**P3:** '+(p3||'N/A')+'\n\n**P4:** '+(p4||'N/A')+'\n\n**P5:** '+(p5||'N/A')+'\n\n**P6:** '+(p6||'N/A')+'\n\n**P7:** '+(p7||'N/A')+'\n\n**P8:** '+(p8||'N/A')+'\n\n**P9:** '+(p9||'N/A'),inline:false})
    .setTimestamp().setFooter({text:'Grupo Halcón  •  Sistema de Postulaciones'});
  const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ap_'+Date.now()+'_'+nombre+'_'+(discordId||'')).setLabel('APROBAR').setStyle(ButtonStyle.Success),new ButtonBuilder().setCustomId('re_'+Date.now()+'_'+nombre+'_'+(discordId||'')).setLabel('RECHAZAR').setStyle(ButtonStyle.Danger));
  await message.channel.send({ content: mencionRoles, embeds: [embed], components: [row] });
});

client.login(process.env.TOKEN)
