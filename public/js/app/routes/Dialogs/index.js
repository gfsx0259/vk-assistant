module.exports = {
  path: 'dialogs',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./components/Dialogs'))
    })
  }
}
