{View} = require 'atom'

module.exports =
class IpynbView extends View
  @content: ->
    @div class: 'ipynb overlay from-top', =>
      @div "The Ipynb package is Alive! It's ALIVE!", class: "message"

  initialize: (serializeState) ->
    atom.workspaceView.command "ipynb:toggle", => @toggle()

  # Returns an object that can be retrieved when package is activated
  serialize: ->

  # Tear down any state and detach
  destroy: ->
    @detach()

  toggle: ->
    console.log "IpynbView was toggled!"
    if @hasParent()
      @detach()
    else
      atom.workspaceView.append(this)
