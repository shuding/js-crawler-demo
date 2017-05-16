var fs = require('fs')
var url = require('url')

var request = require('request')
var cheerio = require('cheerio')

/**
 * Grab a webpage, parse with jquery and return the jquery object
 * @param  {String}   url      the URL
 * @param  {Function} callback the Callback
 */
function fetchURL (url, callback) {
  console.log('fetching', url, '...')
  request.get(url, function (error, response, body) {
    if (error) {
      console.log(error)
    } else {
      callback(cheerio.load(body), url)
    }
  })
}

/**
 * Append data to a file (create it if not exist)
 * @param  {String} filename the file path
 * @param  {Any}    data     data
 */
function save (filename, data) {
  var dataString = typeof data === 'object' ? JSON.stringify(data) : data.toString()
  dataString += '\n' // append a newline
  fs.appendFile(filename, dataString, function (error) {
    if (error) console.log(error)
  })
}

// ====== the crawler
fetchURL('http://www.thepaper.cn/load_index.jsp?nodeids=25635&pageidx=0', function ($, baseUrl) {
  var list = $('.news_li')
  list.each(function () {
    var item = $(this)
    var title = item.find('h2 a').text()
    var href = url.resolve(baseUrl, item.find('h2 a').prop('href'))

    fetchURL(href, function ($, baseUrl) {
      var title = $('h1').text().trim()
      var content = $('.news_txt').text()
      var zan = $('#zan').text().trim()

      console.log('finish fetching', title)

      save('data.csv', '"' + title + '",' + zan + ',"' + content + '"')
    })
  })
})
