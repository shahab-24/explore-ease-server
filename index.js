require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
const port = process.env.PORT || 7000;

app.use(express.json());
app.use(cookieParser());
app.use(cors())
app.use(morgan('dev'))

app.get('', (req,res) => {
        res.send('ExploreEase is running.......')
})
app.listen(port, () => {
        console.log(`ExploreEase is running on ${port}`)
})
