require('dotenv').config();
const axios = require('axios');

const api = axios.create({
    baseURL: 'https://free.currconv.com/api/v7',
    timeout: process.env.TIMEOUT || 5000,
});

module.exports = {
    convertCurrency: async (from, to) => {
        const response = await api.get(`/convert?q=${from}_${to}&compact=ultra&apiKey=9a468356a68c9a98d913`);
        const  val  = Object.values(response.data)[0];
        return { rate: val};
    }
}
