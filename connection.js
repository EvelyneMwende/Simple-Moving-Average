const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 4000;
const jsonParser = bodyParser.json();
const fileName = 'currencies.json';


let rawData = fs.readFileSync(fileName);
let data = JSON.parse(rawData);

app.set('views', 'views');
app.set('view engine', 'hbs');
app.use(express.static('public'));

const readFile = (
    callback,
    returnJson = false,
    filePath = fileName,
    encoding = 'utf8'
) => {
    fs.readFile(filePath, encoding, (err, data) => {
        if (err) {
            throw err;
        }

        callback(returnJson ? JSON.parse(data) : data);
    });
};

const writeFile = (
    fileData,
    callback,
    filePath = fileName,
    encoding = 'utf8'
) => {
    fs.writeFileSync(filePath, fileData, encoding, err => {
        if (err) {
            throw err;
        }
        callback();
    });
};


//READ DATA
app.get('/', async function (request, response) {
    readFile(data => {
    response.render('home', {
    });
    }, true);
});

app.get('/currencies', (request, response) => {
    readFile(data => {
        // data.sort((a, b) => (a.name > b.name) ? 1 : -1);
        response.send(data);
    }, true);
});

//Adding data using POST
app.post('/currencies', jsonParser, (request, response) => {
    data.push(request.body);
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    let isOkay = false;
    if (isOkay) {
        response.end();
    }
    else {
        return response.status(400).json({
            statusCode: response.statusCode,
            method: request.method,
            message: 'That currency ID has already been entered'
        });
    }
});

//EDITING DATA USING PUT
//Filtering currencies
app.put('/currencies/:currencyId', jsonParser, (request, response) => {
    readFile(data => {
        const currencyName = request.params['currencyId'];
        const currency = data.filter((st) => st.id == currencyName);
        currency[0]["name"] = request.body['name'].toString().replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, " ");
        currency[0]['rate'] = request.body['rate'].toString().replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, " ");
        writeFile(JSON.stringify(data, null, 2), () => {
            response.status(200).send(`currency's name:${currencyName} updated`);
        });
    }, true);
});


//DELETING DATA
app.delete('/currencies/:id', (req, res) => {
    readFile(data => {
        const currencyId = req.params['id'];
        var currencyIndex = data.findIndex(obj => obj.id == currencyId);
        data.splice([currencyIndex], 1)
        writeFile(JSON.stringify(data, null, 2), () => {
            res.status(200).send(`currency's id:${currencyId} removed`);
        });
    }, true);
});
app.listen(port);
console.log('server is listening on port 4000');
