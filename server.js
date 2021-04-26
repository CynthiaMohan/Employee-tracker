const express = require('express');
const db = require('./db/connection');

const PORT = process.env.PORT || 3001;
const app = express();


//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

//Start Server
db.connect(err => {
    if (err) throw err;
    console.log('Database Connected.');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});