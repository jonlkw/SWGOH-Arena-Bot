const { MessageEmbed } = require("discord.js");
const config = require("../config");
const db = require("./db-connect");
const logger = require("./logger");

const debug = config.debug;

let extractVar = (message) => {
  /**
   * Examples.
  `926246141`|`UMakeMeHurl` is at 4. payout in `18:42`
  :flag_us:`LastBossKiller` climbed from 4 to 1. payout in `00:50`
  */
  message = message.replace("  ", " "); // convert double spaces to single spaces

  // rotbot format
  let allyCode = "";
  let a = message.split("|");
  if (a[1]) {
    allyCode = a[0].replace(/`/g, "");
    message = a[1];
  }

  let [userIcon = "", name = "", movement = "", payoutIn = ""] = message.split(
    "`"
  );

  let movedFrom = "",
    movedTo = "";
  if (movement.includes("is at")) {
    [, , , movedTo = ""] = movement.split(" ");
  } else {
    [, , , movedFrom = "", , movedTo = ""] = movement.split(" ");
  }
  [movedTo] = movedTo.split(".");

  let discordId = "";
  if (userIcon) {
    let array = userIcon.split(">");
    if (array[1]) {
      [discordId, userIcon] = array;
      discordId += ">";
    } else if (array[0].includes("<@")) {
      // if no emoji is present.
      [discordId, userIcon] = [userIcon, discordId];
    }
  }

  let convert_payoutIn_to_unix_timestamp = (payoutIn) => {
    let [hour, minute] = payoutIn.split(":");
    return (hour * 3600 + minute * 60) * 1e3;
  };

  let payoutTime = Date.now() + convert_payoutIn_to_unix_timestamp(payoutIn);
  payoutTime = Math.ceil(payoutTime / 1e3 / 60) * 60 * 1e3; // floor the time to the nearest minute

  // console.log(`${name} payout is at ${payoutTime}`);

  let rtn = {
    allyCode,
    discordId,
    userIcon, // emoji
    name,
    movedFrom, // old rank
    movedTo, // new rank
    payoutIn, // probably don't need this.
    payoutTime, // payout time in unix timestamp.
    timeLastMoved: Date.now(),
  };

  console.log(rtn);

  return rtn;
};

let updateRankList = (movement_array, rank_list = []) => {
  // do nothing if the player is already in that rank.
  if (
    rank_list[movement_array.movedTo - 1] &&
    rank_list[movement_array.movedTo - 1].name == movement_array.name &&
    movement_array.movedFrom // movedFrom
  )
    return rank_list;

  // add movement to rank_list
  rank_list[movement_array.movedTo - 1] = movement_array;

  // delete previous position.
  if (
    rank_list[movement_array.movedFrom - 1] &&
    rank_list[movement_array.movedFrom - 1].name == movement_array.name
  )
    delete rank_list[movement_array.movedFrom - 1];

  return rank_list;
};

const getDotggProfile = (allyCode) => {
  return `https://swgoh.gg/p/${allyCode}/`;
};

let createRankTable = (rank_list = []) => {
  let fields = [];
  let msg = "";

  let pushToFields = () => {
    const l = fields.length;
    fields.push({
      name: `${l * 10 + 1}-${l * 10 + 10}`,
      value: msg,
      inline: false,
    });
  };

  if (rank_list.length <= 0) msg = "1. ";

  for (let i = 0; i < rank_list.length; i++) {
    // for every 10 increment, push to the fields array and start fresh
    if (i % 10 == 0 && msg) {
      pushToFields();
      msg = "";
    }

    // stop at rank 50.
    if (i >= 50) break;

    if (!rank_list[i]) {
      msg += i + 1 + ". \n";
      continue;
    }

    let {
      userIcon = "",
      name = "",
      allyCode,
      movedFrom,
      movedTo,
      timeLastMoved,
      payoutTime,
    } = rank_list[i];
    movedFrom = parseInt(movedFrom);
    movedTo = parseInt(movedTo);

    let timeToShowMovement = 9e5; // 15 minutes

    let n;
    // console.log(`Time difference for ${name} is ${Date.now() - timeLastMoved}`);
    if (
      Date.now() - timeLastMoved <= timeToShowMovement &&
      movedFrom != movedTo &&
      movedFrom
    ) {
      if (movedFrom > movedTo) {
        // moved up in the last 15 minutes
        n = config.climb_emoji || ":arrow_up:";
      } else {
        // moved down
        n = config.fall_emoji || ":arrow_down:";
      }
    } else {
      // hasn't moved recently. just show the position number.
      n = i + 1;
    }

    let calculatePayoutAway = (payoutTime) => {
      // console.log(name, payoutTime);
      if (payoutTime < Date.now()) {
        // payout already passed
        payoutTime += 86400e3; // move payout time by 24 hours.
        return calculatePayoutAway(payoutTime);
      }
      let diff = payoutTime - Date.now(); // difference in unix
      diff = Math.floor(diff / 1e3 / 60); // convert the difference to the nearest minute
      let m = diff % 60;
      let h = (diff - m) / 60;
      return h.toString() + ":" + (m < 10 ? "0" : "") + m.toString();
    };

    // make the name bold if payout is within 3 hours.
    if (payoutTime - Date.now() < 108e5 && payoutTime - Date.now() > 0) {
      name = `**${name}**`;
    }

    if (allyCode) {
      name = `[${name}](${getDotggProfile(allyCode)})`;
    }

    const payoutAway = calculatePayoutAway(payoutTime);
    msg += `${n}. ${userIcon} ${name} ${
      payoutTime ? `(${payoutAway})` : ""
    } \n`;
  }

  if (msg != "") pushToFields();

  // console.log(fields);

  let embed = new MessageEmbed()
    .setTitle("Live Ranking Table")
    .setDescription("This is a real-time table of the arena table.")
    .setColor("GREEN")
    .setThumbnail(
      "https://cdn.discordapp.com/attachments/585694214885605389/721040657971675236/PicsArt_06-12-09.35.24.jpg"
    )
    .addFields(fields)
    .addField(
      "-",
      "Bot provided by <@220562478910799872>, GL of [No Name a Guild Has](https://swgoh.gg/g/62012/no-name-a-guild-has/).\nLearn more about our guild at https://discord.gg/c5BxqSVhVS"
    )
    .setTimestamp()
    .setFooter(
      "@Jonnnnn#2088",
      "https://cdn.discordapp.com/avatars/220562478910799872/2652c01cfae2fb2b21978561478a5c5b.jpg"
    );

  return embed;
};

const execInitTable = async (message, args) => {
  // Return if the user is not an admin.
  if (
    message.author.id != "220562478910799872" ||
    !message.member.hasPermission("MANAGE_GUILD")
  ) {
    await message.channel.send(
      `${message.author} You do not have the necesary permissions to run this command. Only admins or users with the "Manage Server" permission can run this command.`
    );
    return;
  }

  const guild_id = message.guild.id;

  // Initialize the rank table.
  let rank_list = [];
  const embded = createRankTable(rank_list);
  rankTable = await message.channel.send(embded);
  // console.log(rankTable);

  // update database
  db.set(guild_id, {
    rank_table_channel_id: rankTable.channel.id,
    rank_table_message_id: rankTable.id,
    rank_list: rank_list,
  });

  console.log("rank table created");
};

const execUpdateTable = async (message, client) => {
  if (debug) console.log(message.content);

  // get data from database.
  const guild_id = message.guild.id;
  let {
    rank_table_channel_id,
    rank_table_message_id,
    rank_list,
  } = await db.get(guild_id);

  logger.log({
    level: "info",
    message: `${guild_id}, ${message.content}`,
  });

  // update rank list
  let messages = message.content.split("\n");
  messages.forEach((element) => {
    const info = extractVar(element);
    // update the list
    rank_list = updateRankList(info, rank_list);
  });

  // add to mongodb
  db.set(guild_id, {
    rank_table_channel_id: rank_table_channel_id,
    rank_table_message_id: rank_table_message_id,
    rank_list: rank_list,
  });

  /**
   * Update the rank table
   */
  if (rank_table_channel_id && rank_table_message_id) {
    let channel = await client.channels.fetch(rank_table_channel_id);
    rankTable = await channel.messages.fetch(rank_table_message_id);
    // console.log(rankTable);

    // Create the Embed.
    let embded = createRankTable(rank_list);

    // update the rankable on discord.
    await rankTable.edit(embded);
  } else {
    console.log(
      `Could not find ranktable from channel id and message id. channel_id: ${rank_table_channel_id}, message_id: ${rank_table_message_id}`
    );
  }
};

module.exports = { execInitTable, execUpdateTable };
