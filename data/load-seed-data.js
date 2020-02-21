require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;
// import our seed data:
const instruments = require('../instruments.js');

run();

async function run() {
    const client = new Client(process.env.DATABASE_URL);

    try {
        await client.connect();

        // "Promise all" does a parallel execution of async tasks
        await Promise.all(
            // for every cat data, we want a promise to insert into the db
            instruments.map(instrument => {

                // This is the query to insert a cat into the db.
                // First argument is the function is the "parameterized query"
                return client.query(`
                    INSERT INTO instruments (id, instrument, main_strings, bowed, origin, url)
                    VALUES ($1, $2, $3, $4, $5);
                `,
                    // Second argument is an array of values for each parameter in the query:
                [instrument.instrument, instrument.main_strings, instrument.bowed, instrument.origin, instrument.url]);

            })
        );


        console.log('seed data load complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }

}