const express = require('express');
const router = express.Router();
const auth = require('./Model');

module.exports = router.post('/login',auth.login);
module.exports = router.post('/register',auth.register);
module.exports = router.post('/email-verification',auth.email_verification);
module.exports = router.post('/forgot-password',auth.forgot_password);
module.exports = router.post('/reset-password',auth.reset_password);
module.exports = router.post('/change-password',auth.change_password);
module.exports = router.post('/change-email',auth.change_email);
module.exports = router.post('/update-email',auth.update_email);   
module.exports = router.post('/friend-request',auth.friend_request); 