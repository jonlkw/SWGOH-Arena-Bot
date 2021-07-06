const { MessageEmbed } = require("discord.js");

const commands = {
  init: {
    description:
      "(admins only) Initializes the rank table (in the channel the command is typed). If it already exists, the previous ranktable will stop working and this one will replace the old one.",
    format: "init",
  },
  arena: {
    description: "Shows max-jump information from current rank",
    format: "arena [rank]",
  },
  help: {
    description: "Shows the list of commands or help on specified command.",
    format: "help [command-name]",
  },
};

module.exports = (message, args, client) => {
  let embed = new MessageEmbed()
    .setTitle("HELP MENU")
    .setColor("GREEN")
    .setFooter(
      `Requested by: ${
        message.member ? message.member.displayName : message.author.username
      }`,
      message.author.displayAvatarURL()
    )
    .setThumbnail(client.user.displayAvatarURL());
  if (!args[0]) {
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
  } else {
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
        .addField("FORMAT", `\`\`\`${prefix}${commands[command].format}\`\`\``);
    } else {
      embed
        .setColor("RED")
        .setDescription(
          "This command does not exist. Please use the help command without specifying any commands to list them all."
        );
    }
  }
  message.channel.send(embed);
};
