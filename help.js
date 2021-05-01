module.exports = {
  init: {
    description:
      "Initialize the rank table (in the channel the command is typed). If it already exists, the previous ranktable will stop working and this one will replace the old one.",
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
