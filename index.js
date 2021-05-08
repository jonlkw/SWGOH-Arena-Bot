const { Client, MessageEmbed } = require("discord.js");
const dotenv = require("dotenv").config();
const config = require("./config");
const commands = require("./help");
const { createLogger, format, transports } = require("winston");
const arena = require("./arena");
const GuildDatabase = require("./guild-database");
const rank = require("./models/rank");
const { extractVar, updateRankList, createRankTable } = require("./ranktable");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "arena-bot" },
  transports: [
    //
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    //
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/arena-message.log" }),
  ],
});

const { debug = false } = config;

let rankTable;

const dbm = new GuildDatabase(config.database_url, rank);

let bot = new Client();

bot.on("ready", async () => {
  console.log(`Logged in as ${bot.user.tag} on ${new Date(Date.now())}.`);
  logger.log("info", `bot started`);
  // let channel = await bot.channels.fetch('525749396696989699');
  // channel.send('<:jonnnnn:829581695685623829>`Jonnnnn` climbed from 42 to 32. payout in `02:33`');
});

bot.on("message", async (message) => {
  // stop execution if the message came from the bot.
  if (message.author == bot.user) return;

  // if (debug) console.log(message);

  if (
    (((message.author.bot && rankTable) || debug) &&
      message.content.includes("climbed from")) ||
    message.content.includes("dropped from") ||
    message.content.includes("is at")
  ) {
    if (debug) console.log(message.content);

    // get data from database.
    const guild_id = message.guild.id;
    let {
      rank_table_channel_id,
      rank_table_message_id,
      rank_list,
    } = await dbm.get(guild_id);

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
    dbm.set(guild_id, {
      rank_table_channel_id: rank_table_channel_id,
      rank_table_message_id: rank_table_message_id,
      rank_list: rank_list,
    });

    /**
     * Update the rank table
     */
    if (rank_table_channel_id && rank_table_message_id) {
      let channel = await bot.channels.fetch(rank_table_channel_id);
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
  }

  // Check for command
  if (message.content.startsWith(config.prefix)) {
    let args = message.content.slice(config.prefix.length).split(" ");
    let command = args.shift().toLowerCase();

    switch (command) {
      case "init":
        // Return if the user is not an admin.
        if (
          message.author.id != "220562478910799872" ||
          !message.member.hasPermission("manage_guild")
        ) {
          await message.channel.send(
            `${message.author} You do not have the necesary permissions to run this command. Only admins or users with the "Manage Server" permission can run this command.`
          );
          return;
        }

        const guild_id = message.guild.id;

        let rank_list = [];
        const embded = createRankTable(rank_list);
        rankTable = await message.channel.send(embded);
        // console.log(rankTable);

        // update database
        dbm.set(guild_id, {
          rank_table_channel_id: rankTable.channel.id,
          rank_table_message_id: rankTable.id,
          rank_list: rank_list,
        });

        console.log("rank table created");
        break;

      case "arena":
        {
          let rank = args[0];
          const limit = 100;
          if (rank >= 1 && rank <= limit) {
            let max_jump_array = arena.maxJump(rank);
            let msg = `Max Jump information: ${rank} > `;
            max_jump_array.forEach((rank) => {
              if (rank == 1) {
                msg += `${rank}.`;
              } else {
                msg += `${rank} > `;
              }
            });
            const embed = {
              // title: `Max Jump: ${rank}`,
              fields: [
                {
                  name: `From rank __**${rank}**__, it will take you at least __**${max_jump_array.length}**__ battles to get to 1st place.`,
                  value: msg,
                },
              ],
            };
            message.channel.send({ embed });
          } else if (rank > limit) {
            message.channel.send(
              `No max jump data for rank ${rank}. Only top ${limit} ranks are supported currently.`
            );
          } else {
            message.channel.send(`Invalid rank provided.`);
          }
        }
        break;

      /* Unless you know what you're doing, don't change this command. */
      case "help":
        let embed = new MessageEmbed()
          .setTitle("HELP MENU")
          .setColor("GREEN")
          .setFooter(
            `Requested by: ${
              message.member
                ? message.member.displayName
                : message.author.username
            }`,
            message.author.displayAvatarURL()
          )
          .setThumbnail(bot.user.displayAvatarURL());
        if (!args[0])
          embed.setDescription(
            Object.keys(commands)
              .map(
                (command) =>
                  `\`${command.padEnd(
                    Object.keys(commands).reduce(
                      (a, b) => (b.length > a.length ? b : a),
                      ""
                    ).length
                  )}\` :: ${commands[command].description}`
              )
              .join("\n")
          );
        else {
          if (
            Object.keys(commands).includes(args[0].toLowerCase()) ||
            Object.keys(commands)
              .map((c) => commands[c].aliases || [])
              .flat()
              .includes(args[0].toLowerCase())
          ) {
            let command = Object.keys(commands).includes(args[0].toLowerCase())
              ? args[0].toLowerCase()
              : Object.keys(commands).find(
                  (c) =>
                    commands[c].aliases &&
                    commands[c].aliases.includes(args[0].toLowerCase())
                );
            embed.setTitle(`COMMAND - ${command}`);

            if (commands[command].aliases)
              embed.addField(
                "Command aliases",
                `\`${commands[command].aliases.join("`, `")}\``
              );
            embed
              .addField("DESCRIPTION", commands[command].description)
              .addField(
                "FORMAT",
                `\`\`\`${config.prefix}${commands[command].format}\`\`\``
              );
          } else {
            embed
              .setColor("RED")
              .setDescription(
                "This command does not exist. Please use the help command without specifying any commands to list them all."
              );
          }
        }
        message.channel.send(embed);
        break;
    }
  }
});

require("./server")();
bot.login(config.token);
