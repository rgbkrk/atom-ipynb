IpynbView = require './ipynb-view'

combo = require './IPython/combined.js'
IPython = combo.IPython

# Solely sticking this in for debugging and console tomfoolery
atom.IPython = IPython

kernel = new IPython.Kernel()

host = "127.0.0.1:8888"
kernel_id = 'e5c06825-dc84-4113-9e32-b95c35b6943f'

kernel.ws_host = "ws://" + host
kernel.kernel_url = "/api/kernels/" + kernel_id
kernel.kernel_id = kernel_id

kernel.start_channels()

testcode = () ->
  kernel.execute('x = 2')

atom.kernel = kernel

# I just want this to run for now
# We'll want to make sure that the channels have started
# in the future
setTimeout testcode, 1000

atom.my_kernel = kernel

module.exports =
  ipynbView: null

  activate: (state) ->
    @ipynbView = new IpynbView(state.ipynbViewState)

  deactivate: ->
    @ipynbView.destroy()

  serialize: ->
    ipynbViewState: @ipynbView.serialize()
