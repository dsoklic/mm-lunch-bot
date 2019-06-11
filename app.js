const express = require('express')
const rp = require('request-promise')
const $ = require('cheerio');
var TurndownService = require('turndown')
var turndownService = new TurndownService()
const app = express()
const port = process.env.PORT || 8000

const viaBonaUrl = 'https://www.via-bona.com/sl/ponudba-hrane/malice-in-kosila/'

app.listen(port, () => console.log(`App listening on port ${port}!`))
app.get('/', (req, res) => getLunchInfo(res))
app.post('/', (req, res) => getLunchInfo(res))

function getLunchInfo(res) {
    rp(viaBonaUrl).then((html) => {
        //success!
        let viaBonaMenu = turndownService.turndown($('div.ck-text', html).html())
        let menu = "#Via Bona\n" + viaBonaMenu

        res.json({'text': menu})
    }).catch((err) => {
        // handle error
        console.error(err)
        res.json({'text': err.message})
    });
}
