const Imap = require('imap')
const moment = require('moment')
const { MailParser } = require('mailparser')

function parseMessage(message, callback) {
  const parser = new MailParser()
  let attributes = {}

  parser.on('end', msg => {
    callback(Object.assign({}, msg, attributes))
  })

  message.on('body', (stream) => {
    stream.on('data', chunk => {
      parser.write(chunk.toString('utf8'))
    })

    stream.on('end', () => {
      //
    })
  })

  message.once('attributes', (attrs) => {
    attributes = attrs
  })

  message.once('end', () => {
    parser.end()
  })
}

function parseFetch(fetched, parsedCallback, endCallback) {
  const messages = []
  let nbMails = 0
  let finished = 0

  fetched.on('message', (message) => {
    nbMails++
    parseMessage(message, parsedMessage => {
      finished++
      messages.push(parsedMessage)
      if (nbMails === finished && parsedCallback && typeof parsedCallback === 'function') {
        parsedCallback(messages.sort((a, b) => moment(b.date).diff(moment(a.date))))
      }
    })
  })

  fetched.once('error', err => {
    throw err
  })

  fetched.once('end', () => {
    if (endCallback && typeof endCallback === 'function') {
      endCallback()
    }
  })
}

exports.getMails = (index, number, callback) => {
  const imap = new Imap({
    user: 'mail',
    password: 'pass',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
  })

  imap.once('ready', () => {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) throw err

      const end = box.messages.total - (index * number + index)
      const start = end - number

      const f = imap.seq.fetch(`${start}:${end}`, {
        bodies: [`HEADER.FIELDS (${['FROM', 'TO', 'SUBJECT', 'DATE'].join(' ')})`].concat(['']),
        struct: true,
      })

      parseFetch(f, messages => {
        callback(messages)
      }, () => {
        imap.end()
      })
    })
  })

  imap.on('error', err => {
    console.log(err)
  })

  imap.connect()
}
