require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const pg = require('pg');

console.log(process.env);
// Database Client
const Client = pg.Client;
console.log(process.env.DATABASE_URL);
const client = new Client(process.env.DATABASE_URL);
client.connect();

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(morgan('dev')); // http logging
app.use(cors()); // enable CORS request
app.use(express.static('public')); // server files from /public folder
app.use(express.json()); // enable reading incoming json data
app.use(express.urlencoded({ extended: true }));

// API Routes

app.get('/api/instruments', async(req, res) => {
    try {
        const result = await client.query(`
            SELECT
                instruments.id,
                instrument,
                main_strings,
                bowed,
                origin,
                url,
                t.name as type
            FROM instruments
            JOIN types t
            on instruments.type_id = t.id;
        `);

        console.log(result.rows);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.post('/api/instruments', async (req, res) => {
    // using req.body instead of req.params or req.query (which belong to /GET requests)
    try {
        console.log(req.body);
        // make a new cat out of the cat that comes in req.body;
        const result = await client.query(`
            INSERT INTO instruments (instrument, type_id, main_strings, bowed, origin, url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
        // pass the values in an array so that pg.Client can sanitize them
        [req.body.instrument, req.body.typeId, req.body.main_strings, req.body.bowed, req.body.origin, req.body.url]
        );

        res.json(result.rows[0]); // return just the first result of our query
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.get('/api/instruments/:myInstrumentId', async(req, res) => {
    try {
        const result = await client.query(`
            SELECT *
            FROM instruments
            WHERE instruments.id=$1`, 
            // the second parameter is an array of values to be SANITIZED then inserted into the query
            // i only know this because of the `pg` docs
        [req.params.myInstrumentId]);

        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});



app.get('/api/types', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT *
            FROM types
            ORDER BY name;
        `);

        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});
