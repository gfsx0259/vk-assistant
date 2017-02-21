module.exports = {
  path: 'photos',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./components/Photos'))
    })
  }
}
