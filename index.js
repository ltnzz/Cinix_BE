import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Server Berjalan!');
})

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
})