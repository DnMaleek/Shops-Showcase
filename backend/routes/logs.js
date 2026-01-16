const express = require('express');
const { logsStore } = require('../middleware/logs.middleware');

const router = express.Router();

router.get('/', (req, res) => {
    res.json(logsStore);
});

module.exports = router;