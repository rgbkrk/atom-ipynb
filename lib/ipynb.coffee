module.exports =
  ipynbView: null

  activate: (state) ->
    @ipynbView = new IpynbView(state.ipynbViewState)

  deactivate: ->
    @ipynbView.destroy()

  serialize: ->
    ipynbViewState: @ipynbView.serialize()
