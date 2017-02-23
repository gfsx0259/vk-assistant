module.exports = {
  path: 'photos(/:uid)',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./components/Photos'))
    })
  }
}
