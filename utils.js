/**
 * @module Utils
 */
 const fs = require('fs')

    const loadData = (path) => {
    try {
      return fs.readFileSync(path, 'utf8')
    } catch (err) {
      console.error(err)
      return false
    }
  }
  
  const storeData = (data, path) => {
    try {
      //console.log(data)
      fs.writeFileSync(path, JSON.stringify(data))
    } catch (err) {
      console.error(err)
    }
  }

  module.exports = { loadData,storeData };