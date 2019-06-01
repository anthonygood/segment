// Bisect an array into a tuple of two arrays:
//   - first includes all items where fn(region) === true
//   - second array includes all other items
const bisect = (arr, fn) => {
  const yes = []
  const no = []

  arr.forEach(region => {
    const category = fn(region) ? yes : no
    category.push(region)
  })

  return [yes, no]
}

const promise = fn => (...args) =>
  new Promise((resolve, reject) =>
    fn(...args, (err, ...callbackArgs) =>
      err ? reject(err) : resolve(...callbackArgs)
    ))

const precision = prec => num =>
  Math.round(num * prec) / prec

module.exports = {
  bisect, promise, precision
}
