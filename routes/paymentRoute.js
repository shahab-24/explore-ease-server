const { ObjectId } = require('mongodb');
const bookingsRoute = require('./bookingsRoute');
const verifyToken = require('../middlewares/verifyToken');
const express = require('express');
const router = express.Router()

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

module.exports = function (bookingsCollection) {

        router.post('/create-payment-intent', verifyToken, async ( req, res ) => {
        const {price} = req.body;
        const amount  = price * 100;
                const paymentIntent = await stripe.paymentIntents.create({
                        amount,
                        currency: 'usd',
                        payment_method_types: ['card']
                })
                res.json({clientSecret: paymentIntent.client_secret
                })
        })

        // payment success=======
        router.post('/payments', verifyToken, async (req, res) => {
                const {bookingId, transactionId} = req.body;
                const result = await bookingsCollection.updateOne({_id: new ObjectId(bookingId)}, { $set: {
                        paymentStatus: 'paid',
                        status: 'in-review',
                        transactionId,
                }})
                res.json({message:'payment saved and booking updates', result})
        })

        router.post('/bookings/:id/payment-success', verifyToken, async(req, res) => {
                const {id} = req.params;
                const {paymentId} = req.body;

                const result = await bookingsCollection.updateOne({_id: new ObjectId(id)}, {$set: {status: "in-review", paymentId}})
                res.json(result)
        }
        

)

        return router;

}