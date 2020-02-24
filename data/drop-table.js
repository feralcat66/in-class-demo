const pg = require('pg');
const Client = pg.Client;
require('dotenv').config();

run();

async function run() {
    const client = new Client(process.env.DATABASE_URL);

    try {
        console.log(process.env.DATABASE_URL);
        await client.connect();
        await client.query(`
            DROP TABLE IF EXISTS instruments;
            DROP TABLE IF EXISTS types;
        `);

        console.log('drop tables complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
    
}