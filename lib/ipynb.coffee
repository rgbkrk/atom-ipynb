IpynbView = require './ipynb-view'

combo = require './IPython/combined.js'
IPython = combo.IPython

# Solely sticking this in for debugging and console tomfoolery
atom.IPython = IPython

kernel = new IPython.Kernel()

host = "127.0.0.1:8888"
kernel_id = '765eee73-71bb-49c8-b824-7bde1a7a1112'

kernel.ws_url = "ws://" + host
kernel.kernel_url = "/api/kernels" + kernel_id
kernel.kernel_id = kernel_id

kernel.start_channels()

kernel.execute('x = 2')

atom.my_kernel = kernel

module.exports =
  ipynbView: null

  activate: (state) ->
    console.log "hi"
    @ipynbView = new IpynbView(state.ipynbViewState)

  deactivate: ->
    @ipynbView.destroy()

  serialize: ->
    ipynbViewState: @ipynbView.serialize()
