module.exports = createParser

var codes = require('./character/codes')
var initializeContent = require('./initialize/content')
var initializeFlow = require('./initialize/flow')
var initializeText = require('./initialize/text')
var attention = require('./tokenize/attention')
var atxHeading = require('./tokenize/atx-heading')
var autolink = require('./tokenize/autolink')
var characterEscape = require('./tokenize/character-escape')
var characterReference = require('./tokenize/character-reference')
var codeFenced = require('./tokenize/code-fenced')
var codeIndented = require('./tokenize/code-indented')
var codeSpan = require('./tokenize/code-span')
var definition = require('./tokenize/definition')
var hardBreakEscape = require('./tokenize/hard-break-escape')
var htmlFlow = require('./tokenize/html-flow')
var htmlSpan = require('./tokenize/html-span')
var labelEnd = require('./tokenize/label-end')
var labelImage = require('./tokenize/label-start-image')
var labelLink = require('./tokenize/label-start-link')
var thematicBreak = require('./tokenize/thematic-break')
var whitespace = require('./tokenize/whitespace')

var createTokenizer = require('./util/create-tokenizer')

function createParser() {
  var contentInitial = {}
  var flowInitial = {}
  var flow = {}
  var string = {}
  var text = {}
  var parser

  contentInitial[codes.leftSquareBracket] = definition

  flowInitial[codes.ht] = codeIndented
  flowInitial[codes.space] = codeIndented

  flow[codes.numberSign] = atxHeading
  flow[codes.asterisk] = thematicBreak
  flow[codes.dash] = thematicBreak
  flow[codes.lessThan] = htmlFlow
  flow[codes.underscore] = thematicBreak
  flow[codes.graveAccent] = codeFenced
  flow[codes.tilde] = codeFenced

  string[codes.ampersand] = characterReference
  string[codes.backslash] = characterEscape

  text[codes.cr] = whitespace
  text[codes.lf] = whitespace
  text[codes.crlf] = whitespace
  text[codes.ht] = whitespace
  text[codes.space] = whitespace
  text[codes.exclamationMark] = labelImage
  text[codes.ampersand] = characterReference
  text[codes.asterisk] = attention
  text[codes.lessThan] = [autolink, htmlSpan]
  text[codes.leftSquareBracket] = labelLink
  text[codes.backslash] = [hardBreakEscape, characterEscape]
  text[codes.rightSquareBracket] = labelEnd
  text[codes.underscore] = attention
  text[codes.graveAccent] = codeSpan

  parser = {
    hooks: {
      contentInitial: contentInitial,
      flowInitial: flowInitial,
      flow: flow,
      string: string,
      text: text
    },
    content: create(initializeContent),
    flow: create(initializeFlow),
    string: create(initializeText.string),
    text: create(initializeText.text)
  }

  return parser

  function create(initializer) {
    return creator
    function creator(from) {
      return createTokenizer(parser, initializer, from)
    }
  }
}