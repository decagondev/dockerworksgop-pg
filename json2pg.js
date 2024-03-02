const fs = require("fs");
const { Client } = require("pg");
const directory = "./tables/";


const client = new Client({
    user: "myuser",
    host: "localhost",
    database: "mydatabase",
    password: "mypassword",
    port: 7890
});

client.connect();

let filesProccessed = 0;



fs.readdir(directory, (err, files) => {
    if (err) {
        console.error("Error reading directory", err);
        return;
    }
    const closeDatabase = () => {
        filesProccessed++;
        if (filesProccessed === files.length) {
            client.end().then(() => {
                console.log("Tables have been written to the pg db!");
            }).catch((err) => {
                console.error("Error closing database:", err.message);
            });
        }
    }

    files.forEach(file => {
        const tableName = file.split(".")[0];
        
        fs.readFile(directory + file, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                closeDatabase();
                return;
            }
            let tableContent;
            try {
                tableContent = JSON.parse(data);
            } catch (parseError) {
                console.error("Error parsing JSON data:", parseError);
                closeDatabase();
                return;
            }
            const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (name TEXT PRIMARY KEY, info TEXT)`;
            client.query(createTableQuery)
            .then(() => {
                console.log("Created table:", tableName);
                const insertValues = Object.keys(tableContent).map(key => `('${key}', '${tableContent[key]}')`).join(',');
                const insertQuery = `INSERT INTO ${tableName} (name, info) VALUES ${insertValues}`;
                return client.query(insertQuery);
            })
            .then(() => {
                console.log("Inserted data in to table:", tableName);
                closeDatabase();
            })
            .catch(err => {
                console.error("Error executing query", err);
                closeDatabase();
            });
        });
    });
});




