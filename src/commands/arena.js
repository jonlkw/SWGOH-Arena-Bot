const arena = require("../../arena");

module.exports = (message, args) => {
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
};
