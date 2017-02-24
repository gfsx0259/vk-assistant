module.exports = {
  path: 'reg',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./components/Registration'))
    })
  }
}
