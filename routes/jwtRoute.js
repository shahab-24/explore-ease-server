const express = require('express')
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

router.post('/jwt', (req, res) => {
        const {email} = req.body;
        if(!email) {
                return res.status(400).json({message: 'Email is required'})
        }

        const token = jwt.sign({email}, process.env.JWT_SECRET_KEY, {
                expiresIn: '1h'
        })

        res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict',
        });
        res.json({success: true})
})

router.get('/logout', (req, res) => {
        res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
        });
        res.json({success: true})
})

module.exports = router;