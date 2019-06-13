const async = require('async');
const express = require('express');
const rp = require('request-promise');
const $ = require('cheerio');
const TurndownService = require('turndown');
const turndownService = new TurndownService();
const app = express();
const port = process.env.PORT || 8000

const viaBonaUrl = 'https://www.via-bona.com/sl/ponudba-hrane/malice-in-kosila/';
const kurjiTatUrl = 'https://docs.google.com/document/u/1/d/e/2PACX-1vShhBZHuTFuFZxZIS2fnWCZrMuKGHpVtYsWjuik02i_S7CMAYo8zRjS5p3tm9WqsEY3KqssFkHZY-kI/pub?embedded=true';
const kondorUrl = 'https://restavracijakondor.si/#menu';

app.listen(port, () => console.log(`App listening on port ${port}!`));
app.get('/', (req, res) => res.json({"text": "Hey there! It's me, your MM bot.", 'response_type': 'in_channel'}));
app.post('/', (req, res) => res.json({"text": "Hey there! It's me, your MM bot.", 'response_type': 'in_channel'}));

/**
 * The all lunch menus and return them.
 * @param res Response object used to return response.
 */
function getLunchInfo(res) {
    // Execute all menu requests in parallel.
    async.parallel([
        (callback) => simpleUrlRequest("Via Bona", viaBonaUrl, 'div.ck-text', callback),
        (callback) => simpleUrlRequest("Kurji tat", kurjiTatUrl, 'table', callback),
        (callback) => getKondorMenu(callback)
    ], (err, results) => {
        if (err != null) {
            // handle error
            console.error(err);
            res.json({'text': err.message});
            return;
        }

        // Concatinate all returned results and return them in the json.
        res.json({'text': results.join("\n\n"), 'response_type': 'in_channel'});
    });
}

/**
 * Make a simple HTTP request, select only one element on the page and
 * convert it to Markdown.
 * 
 * @param title Title to add before the menu.
 * @param url URL of page with the menu.
 * @param selector HTML element where the menu is located.
 * @param callback Called when result is ready.
 */
function simpleUrlRequest(title, url, selector, callback) {
    rp(url).then((html) => {
        //success!
        let menu = turndownService.turndown($(selector, html).html());
        let menuWithTitle = "#" + title + "\n" + menu;

        callback(null, menuWithTitle);
    }).catch(callback);
}

/**
 * Get menu of Kondor.
 * 
 * This is a special case because we want to truncate the
 * end of the menu that contains useless text.
 * 
 * @param callback Called when result is ready.
 */
function getKondorMenu(callback) {
    simpleUrlRequest('Kondor', kondorUrl, 'div#malice', (err, result) => {
        if (err != null) {
            callback(err);
            return;
        }

        let endOfMenu = '### Naročite se na tedensko ponudbo malic';
        let indexOfEnd = result.indexOf(endOfMenu);

        callback(null, result.substring(0, indexOfEnd));
    });
}
