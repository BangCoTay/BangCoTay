const express = require('express');
const migrationService = require('../services/migration.service');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /migration/import-localStorage
router.post('/import-localStorage', auth, async (req, res, next) => {
  try {
    const result = await migrationService.importLocalStorage(req.user.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
