const max_jump_data = {
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 2,
  7: 3,
  8: 4,
  9: 5,
  10: 6,
  11: 7,
  12: 8,
  13: 8,
  14: 9,
  15: 10,
  16: 11,
  17: 12,
  18: 13,
  19: 13,
  20: 14,
  21: 15,
  22: 16,
  23: 17,
  24: 18,
  25: 18,
  26: 19,
  27: 20,
  28: 21,
  29: 22,
  30: 23,
  31: 24,
  32: 25,
  33: 25,
  34: 26,
  35: 27,
  36: 28,
  37: 29,
  38: 30,
  39: 30,
  40: 31,
  41: 31,
  42: 32,
  43: 33,
  44: 34,
  45: 35,
  46: 36,
  47: 37,
  48: 38,
  49: 39,
  50: 40,
};

/**
* returns an array of max jumps from the current rank
* @param {*} rank 
*/
let maxJump = (rank) => {
  let array = [];
  return recursion(rank, array);

  function recursion(rank, arr) {
      if(rank == 1) return arr;
      const new_rank = max_jump_data[rank];
      arr.push(new_rank);
      return recursion(new_rank, arr);
  };
};

module.exports = {maxJump};