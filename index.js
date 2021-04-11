const { Client, MessageEmbed } = require('discord.js');
const config = require('./config');
const commands = require('./help');
const Database = require("./db");

const debug = config.debug || false;

let rankTable;

let rankList = [];

const db = new Database();

let bot = new Client();

let extractVar = (message) => {
  let [userIcon = '', name = '', movement = '', payoutIn = ''] = message.split('`');

  let movedFrom = '', movedTo = '';
  if (movement.includes("is at")) {
    [, , , movedTo = ''] = movement.split(' ');
  } else {
    [, , , movedFrom = '', , movedTo = ''] = movement.split(' ');
  }
  [movedTo] = movedTo.split('.');

  let discordId = '';
  if (userIcon) {
    let array = userIcon.split(">");
    if (array[1]) {
      [discordId, userIcon] = array;
      discordId += '>';
    }
  }

  let rtn = {
    discordId: discordId,
    userIcon: userIcon,
    name: name,
    movedFrom: movedFrom,
    movedTo: movedTo,
    payoutIn: payoutIn,
    timeLastMoved: Date.now()
  };

  return rtn;
}

let updateRankList = (movement_array) => {

  // do nothing if the player is already in that rank. 
  if (rankList[movement_array.movedTo - 1] && rankList[movement_array.movedTo - 1].name == movement_array.name) return;

  // add movement to ranklist
  rankList[movement_array.movedTo - 1] = movement_array;

  // delete previous position.
  if (rankList[movement_array.movedFrom - 1] && rankList[movement_array.movedFrom - 1].name == movement_array.name) delete rankList[movement_array.movedFrom - 1];
};

let createRankTable = () => {
  let fields = [];
  let msg = '';

  let pushToFields = () => {
    const l = fields.length;
    fields.push({name: `${l*10+1}-${l*10+10}`, value: msg, inline: false});
  }

  if (rankList.length <= 0) msg = '1. ';

  for (let i = 0; i < rankList.length; i++) {

    // for every 10 increment, push to the fields array and start fresh
    if (i % 10 == 0 && msg) {
      pushToFields();
      msg = '';
    }

    // stop at rank 50. 
    if (i >= 50) break;

    if (!rankList[i]) {
      msg += (i + 1) + ". \n";
      continue;
    }

    let { userIcon = '', name = '', movedFrom, movedTo, timeLastMoved } = rankList[i];
    movedFrom = parseInt(movedFrom);
    movedTo = parseInt(movedTo);

    let timeToShowMovement = 9e5; // 15 minutes

    let n;
    // console.log(`Time difference for ${name} is ${Date.now() - timeLastMoved}`);
    if (Date.now() - timeLastMoved <= timeToShowMovement && movedFrom != movedTo && movedFrom) {
       if (movedFrom > movedTo) {
         // moved up in the last 15 minutes
         n = config.climb_emoji || ':arrow_up:';
       } else {
         // moved down
         n = config.fall_emoji || ':arrow_down:';
       }
    } else {
      // hasn't moved recently. just show the position number. 
      n = i+1;
    }

    msg += `${n}. ${userIcon} ${name} \n`;

  }

  if (msg != '') pushToFields();

  // console.log(fields);

  let embed = new MessageEmbed()
    .setTitle('Live Ranking Table')
    .setDescription('This is a real-time table of the arena table.')
    .setColor('GREEN')
    .setThumbnail('https://cdn.discordapp.com/attachments/585694214885605389/721040657971675236/PicsArt_06-12-09.35.24.jpg')
    .addFields(fields)
    .addField('-', "Bot provided by <@220562478910799872>, GL of [No Name a Guild Has](https://swgoh.gg/g/62012/no-name-a-guild-has/).\nLearn more about our guild at https://discord.gg/c5BxqSVhVS")
    .setTimestamp()
    .setFooter('@Jonnnnn#2088', 'https://cdn.discordapp.com/avatars/220562478910799872/2652c01cfae2fb2b21978561478a5c5b.jpg')

  return embed;
};

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.tag}.`);

  let msg_id = await db.get("message_id");
  let channel_id = await db.get("channel_id");
  if (msg_id && channel_id) {
    let channel = await bot.channels.fetch(channel_id);
    rankTable = await channel.messages.fetch(msg_id);
    // console.log(rankTable);
    console.log('rank table loaded from database');
  }

  if (debug) {
    rankList[0] = { name: 'Jonnnnn' };
    rankList[1] = { name: 'Aeschyl' };
    rankList[2] = { name: 'SenseiShNall' };
  }
});

bot.on('message', async message => {
  // stop execution if the message came from the bot. 
  if (message.author == bot.user) return;
  
  // if (debug) console.log(message);

  if (
    (message.author.bot && rankTable || debug) &&
    message.content.includes('climbed from') || 
    message.content.includes('dropped from') ||
    message.content.includes('is at')
    ) {
    let info = {};
    if (debug) console.log(message.content);
    if (message.content.includes('is at')) {
      let messages = message.content.split("\n");
      messages.forEach((element) => {
        info = extractVar(element);
        // update the list
        updateRankList(info);
      });
    } else {
      info = extractVar(message.content);
      console.log(info);
      // update the list
      updateRankList(info);
    }
    // Create the Embed.
    let embded = createRankTable();

    // update the rankable on discord. 
    await rankTable.edit(embded);
  }

  if (message.author.id != '220562478910799872') return;

  // Check for command
  if (message.content.startsWith(config.prefix)) {
    let args = message.content.slice(config.prefix.length).split(' ');
    let command = args.shift().toLowerCase();

    switch (command) {

      case 'init':
        if (!rankTable) {
          let embded = createRankTable();
          rankTable = await message.channel.send(embded);
          // console.log(rankTable);
          db.set("message_id", rankTable.id);
          db.set("channel_id", rankTable.channel.id);
          console.log('rank table created');
        } else {
          console.log('rank table already exists');
        }
        break;

      case 'ping':
        let msg = await message.reply('Pinging...');
        await msg.edit(`PONG! Message round-trip took ${Date.now() - msg.createdTimestamp}ms.`)
        break;

      case 'say':
      case 'repeat':
        if (args.length > 0)
          message.channel.send(args.join(' '));
        else
          message.reply('You did not send a message to repeat, cancelling command.')
        break

      /* Unless you know what you're doing, don't change this command. */
      case 'help':
        let embed = new MessageEmbed()
          .setTitle('HELP MENU')
          .setColor('GREEN')
          .setFooter(`Requested by: ${message.member ? message.member.displayName : message.author.username}`, message.author.displayAvatarURL())
          .setThumbnail(bot.user.displayAvatarURL());
        if (!args[0])
          embed
            .setDescription(Object.keys(commands).map(command => `\`${command.padEnd(Object.keys(commands).reduce((a, b) => b.length > a.length ? b : a, '').length)}\` :: ${commands[command].description}`).join('\n'));
        else {
          if (Object.keys(commands).includes(args[0].toLowerCase()) || Object.keys(commands).map(c => commands[c].aliases || []).flat().includes(args[0].toLowerCase())) {
            let command = Object.keys(commands).includes(args[0].toLowerCase()) ? args[0].toLowerCase() : Object.keys(commands).find(c => commands[c].aliases && commands[c].aliases.includes(args[0].toLowerCase()));
            embed
              .setTitle(`COMMAND - ${command}`)

            if (commands[command].aliases)
              embed.addField('Command aliases', `\`${commands[command].aliases.join('`, `')}\``);
            embed
              .addField('DESCRIPTION', commands[command].description)
              .addField('FORMAT', `\`\`\`${config.prefix}${commands[command].format}\`\`\``);
          } else {
            embed
              .setColor('RED')
              .setDescription('This command does not exist. Please use the help command without specifying any commands to list them all.');
          }
        }
        message.channel.send(embed);
        break;
    }
  }
});

require('./server')();
bot.login(config.token);