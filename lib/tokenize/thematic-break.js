exports.tokenize = tokenizeThematicBreak

var codes = require('../character/codes')
var markdownEnding = require('../character/markdown-ending')
var markdownSpace = require('../character/markdown-space')
var constants = require('../constant/constants')
var types = require('../constant/types')

function tokenizeThematicBreak(effects, ok, nok) {
  var check = this.check
  var multipleRuns
  var size
  var marker

  return start

  function start(code) {
    if (
      code !== codes.asterisk &&
      code !== codes.dash &&
      code !== codes.underscore
    ) {
      return nok(code)
    }

    effects.enter(types.thematicBreak)
    effects.enter(types.thematicBreakSequence)
    marker = code
    multipleRuns = 0
    size = 0
    return sequence(code)
  }

  function sequence(code) {
    if (code === marker) {
      effects.consume(code)
      size++
      return sequence
    }

    effects.exit(types.thematicBreakSequence)

    if (markdownSpace(code)) {
      effects.enter(types.whitespace)
      return whitespace(code)
    }

    return after(code)
  }

  function whitespace(code) {
    if (markdownSpace(code)) {
      effects.consume(code)
      return whitespace
    }

    effects.exit(types.whitespace)

    if (code === marker) {
      multipleRuns++
      effects.enter(types.thematicBreakSequence)
      return sequence(code)
    }

    return after(code)
  }

  function after(code) {
    if (
      size < constants.thematicBreakMarkerCountMin ||
      !markdownEnding(code) ||
      // If this could be a correct setext heading underline too, do not allow
      // interrupting.
      (check && !multipleRuns && marker === codes.dash)
    ) {
      return nok(code)
    }

    effects.exit(types.thematicBreak)
    return ok(code)
  }
}