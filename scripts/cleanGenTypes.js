const glob = require('glob')
const fs = require('fs')

glob('./packages/*/src/**/__generated__', (err, folders) => {
  if (err) throw err
  folders.forEach(folder =>
    fs.rmdir(folder, { recursive: true }, err => {
      if (err) throw err
    })
  )
})
