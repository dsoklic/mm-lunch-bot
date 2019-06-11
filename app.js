const async = require('async');
const express = require('express');
const rp = require('request-promise');
const $ = require('cheerio');
const TurndownService = require('turndown');
const turndownService = new TurndownService();
const app = express();
const port = process.env.PORT || 8000

app.listen(port, () => console.log(`App listening on port ${port}!`));
app.get('/', (req, res) => getLunchInfo(res));
app.post('/', (req, res) => getLunchInfo(res));

/**
 * The all lunch menus and return them.
 * @param res Response object used to return response.
 */
function getLunchInfo(res) {
    // Execute all menu requests in parallel.
    async.parallel([
        getViaBonaMenu,
        getKurjiTatMenu
    ], (err, results) => {
        if (err != null) {
            // handle error
            console.error(err);
            res.json({'text': err.message});
            return;
        }

        // Concatinate all returned results and return them in the json.
        res.json({'text': results.join("\n")});
    });
}

/**
 * Get the menu from Via Bona.
 * @param callback Callback that is called with the result.
 */
function getViaBonaMenu(callback) {
    let viaBonaUrl = 'https://www.via-bona.com/sl/ponudba-hrane/malice-in-kosila/';

    rp(viaBonaUrl).then((html) => {
        //success!
        let viaBonaMenu = turndownService.turndown($('div.ck-text', html).html());
        let menu = "#Via Bona\n" + viaBonaMenu;

        callback(null, menu);
    }).catch(callback);
}

/**
 * Get the menu from Kurji Tat.
 * @param callback Callback that is called with the result.
 */
function getKurjiTatMenu(callback) {
    let kujiTatUrl = "https://docs.google.com/document/u/1/d/e/2PACX-1vShhBZHuTFuFZxZIS2fnWCZrMuKGHpVtYsWjuik02i_S7CMAYo8zRjS5p3tm9WqsEY3KqssFkHZY-kI/pub?embedded=true";

    rp(kujiTatUrl).then((html) => {
        //success!
        let kurjiTatMenu = turndownService.turndown($('table', html).html());
        let menu = "#Kurji tat\n" + kurjiTatMenu;

        callback(null, menu);
    }).catch(callback);
}
