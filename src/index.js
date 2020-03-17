const path = require('path')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const mkdirp = require('mkdirp')
const PNG = require('png-js')

const inputDir = argv['input-dir'] || '.'
const output = argv.output || './dist/result.tsv'

const files = fs
  .readdirSync(inputDir)
  .filter(file => /\.png$/.test(file))
  .map(file => path.resolve(inputDir, file))
const promises = files.map(readColor)

Promise.all(promises).then(colors => {
  mkdirp.sync(path.dirname(output))
  fs.writeFileSync(
    output,
    colors
      .map(([file, color]) => {
        file = path.basename(file, '.png')
        return `${file}\t${color}`
      })
      .join('\n')
  )
})

const DecomojiColors_v5 = [
  'dd3b40', // 0
  'c05b2c', // 1
  '9f7e00', // 2
  '688200', // 3
  '008c22', // 4
  '008780', // 5
  '0081b1', // 6
  '477f9b', // 7
  '5d79aa', // 8
  'a156d2', // 9
  'd43892', // 10
  'a36969' // 11
]

function colorIndex({ r, g, b }) {
  const rr = r.toString(16).padStart(2, '0')
  const gg = g.toString(16).padStart(2, '0')
  const bb = b.toString(16).padStart(2, '0')
  return DecomojiColors_v5.indexOf(`${rr}${gg}${bb}`)
}

function readColor(file) {
  return new Promise(resolve => {
    PNG.decode(file, function(buffer) {
      let color
      for (let i = 0; i < buffer.length; i += 4) {
        const r = buffer[i]
        const g = buffer[i + 1]
        const b = buffer[i + 2]
        const a = buffer[i + 3]
        if (a === 255) {
          color = { r, g, b }
          break
        }
      }
      const index = colorIndex(color)
      if (index < 0) {
        resolve([file, `★★★ ${JSON.stringify(color)} ★★★`])
      } else {
        resolve([file, index])
      }
    })
  })
}
