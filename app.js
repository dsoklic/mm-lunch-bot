const async = require('async');
const express = require('express');
const rp = require('request-promise');
const $ = require('cheerio');
const TurndownService = require('turndown');
const turndownService = new TurndownService();
const app = express();
const port = process.env.PORT || 8000

const tempText = 'This bot is in the process of being modified to support more restaurants. :poop:';

app.listen(port, () => console.log(`App listening on port ${port}!`));
app.get('/', (req, res) => res.json({"text": tempText, 'response_type': 'in_channel'}));
app.post('/', (req, res) => res.json({"text": tempText, 'response_type': 'in_channel'}));
