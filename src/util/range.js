// Inclusive, only positive ranges
const range = (lower, upper) => {
  if (upper < lower) throw new Error(`Invalid range: lower must be less than upper! (${lower}, ${upper})`)

  const variation = upper - lower

  const func = val => {
    const difference = val - lower
    return difference >= 0 && difference <= variation
  }

  func[Symbol.iterator] = function* () {
    for (let i = lower; i <= upper; i++) {
      yield i
    }
  }

  return func
}

module.exports = range
