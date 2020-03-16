const fs = require('fs')
const PNG = require('png-js')

const files = fs.readdirSync('.')
const promises = files.filter(file => /\.png$/.test(file)).map(readColor)

Promise.all(promises).then(colors => {
  fs.writeFileSync(
    'result.tsv',
    colors
      .map(([file, color]) => {
        file = file.replace(/\.png$/, '')
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

function colorIndex(rgb) {
  const r = ('0' + rgb.r.toString(16)).slice(-2)
  const g = ('0' + rgb.g.toString(16)).slice(-2)
  const b = ('0' + rgb.b.toString(16)).slice(-2)
  return DecomojiColors_v5.indexOf(`${r}${g}${b}`)
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
