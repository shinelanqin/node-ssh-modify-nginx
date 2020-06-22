const uploadAndReload = require('./lib')

uploadAndReload.prototype.apply = function(compiler) {
  compiler.hooks.done.tapAsync('uploadAndReload', (compilation, callback) => {
    callback()
    this.options.mode ? this.init(this.options) : process.argv.includes('--upload-id') && this.init(this.options)
  })
}

module.exports = uploadAndReload