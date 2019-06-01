//shuffle function taken from http://bost.ocks.org/mike/shuffle/
const shuffle = array => {
  var m = array.length, t, i

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--)
    // And swap it with the current element.
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }

  return array
}

const sample = (array, count) =>
  shuffle(array).slice(0, count)

module.exports = {
  sample,
  shuffle
}
