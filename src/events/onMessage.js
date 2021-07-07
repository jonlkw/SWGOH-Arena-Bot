const { debug = false, prefix } = require("../../config");
const arenaTable = require("../ranktable");
const arena = require("../commands/arena");
const doHelp = require("../commands/help");

const watch = (message, client) => {
  if (
    (message.author.bot || debug) &&
    (message.content.includes("climbed from") ||
      message.content.includes("dropped from") ||
      message.content.includes("is at"))
  ) {
    arenaTable.execUpdateTable(message, client);
  }
};

const command = (message, client) => {
  if (message.content.startsWith(prefix)) {
    let args = message.content.slice(prefix.length).split(" ");
    let command = args.shift().toLowerCase();

    switch (command) {
      case "init":
        arenaTable.execInitTable(message);
        break;

      case "arena":
        arena(message, args);
        break;

      /* Unless you know what you're doing, don't change this command. */
      case "help":
        doHelp(message, args, client);
        break;
    }
  }
};

const onMessage = (message, client) => {
  // stop execution if the message came from the bot.
  if (message.author == client.user) return;

  //   if (debug) console.log(message.member.hasPermission("MANAGE_GUILD"));

  // watch for events
  watch(message, client);

  // Check for commands
  command(message, client);
};

module.exports = onMessage;
