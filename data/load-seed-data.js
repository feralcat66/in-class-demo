require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;
// import our seed data:
const instruments = require('../instruments.js');
const types = require('../types.js');

run();

async function run() {
    const client = new Client(process.env.DATABASE_URL);

    try {
        await client.connect();

        const instrumentTypes = await Promise.all(
            types.map(async type => {
                const result = await client.query(`
                    INSERT INTO types (name)
                    VALUES ($1)
                    RETURNING *;
                `,
                [type]);

                return result.rows[0];
            })
        );




        // "Promise all" does a parallel execution of async tasks
        await Promise.all(
            // for every cat data, we want a promise to insert into the db
            instruments.map(instrument => {


                const type = instrumentTypes.find(type => {
                    return type.name === instrument.type;
                });

                // This is the query to insert a cat into the db.
                // First argument is the function is the "parameterized query"
                return client.query(`
                    INSERT INTO instruments (id, instrument, main_strings, bowed, origin, url)
                    VALUES ($1, $2, $3, $4, $5);
                `,
                    // Second argument is an array of values for each parameter in the query:
                [instrument.instrument, type.id, instrument.main_strings, instrument.bowed, instrument.origin, instrument.url]);

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