const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const directory = "./tables/";


const db = new sqlite3.Database('mydb.sqlite');
let filesProccessed = 0;



fs.readdir(directory, (err, files) => {
    if (err) {
        console.error("Error reading directory", err);
        return;
    }
    const closeDatabase = () => {
        filesProccessed++;
        if (filesProccessed === files.length) {
            db.close((err) => {
                if (err) {
                    console.error("Error closing database:", err.message);
                } else {
                    console.log("Tables have been written to the sqlite db!");
                }
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

            db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (name TEXT PRIMARY KEY, info TEXT)`, (err) => {
                if (err) {
                    console.error("Error creating table:", err);
                    closeDatabase();
                    return;
                }
                console.log("Created table:", tableName);
                const statement = db.prepare(`INSERT INTO ${tableName} (name, info) VALUES (?, ?)`)
                Object.keys(tableContent).forEach(key => {
                    statement.run(key.toString(), tableContent[key])
                });
                statement.finalize();

                closeDatabase();
            })
        })
    });
});




