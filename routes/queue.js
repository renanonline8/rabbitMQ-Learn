var express = require('express');
var router = express.Router();
const amqp = require('amqplib/callback_api');

router.put('/:queue/publisher/:message', function(req, res, next) {
    amqp.connect('amqp://localhost', (error0, connection) => {
        if (error0) {
            throw error0;
        }
        
        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1;
            }

            let queue = req.params.queue;
            let message = req.params.message;

            channel.assertQueue(queue, {
                durable: false
            });

            channel.sendToQueue(queue, Buffer.from(message));
            console.log("[x] Sent %s", message);

            res.json({
                message: `Enviado Mensagem ${message}`
            })
        });
        
        setTimeout(function() { 
            connection.close();
        }, 500);
    });
});

router.get('/:queue/consumer', function(req, res, next) {
    amqp.connect('amqp://localhost', (error0, connection) => {
        if (error0) {
            throw error0;
        }
        connection.createChannel((error1, channel) => {
            if(error1) {
                throw error1;
            }
            let queue = req.params.queue;

            channel.assertQueue(queue, {
                durable: false
            });

            console.log('[*] Waiting for messages in %s.', queue);
            channel.consume(queue, (msg) => {
                res.json({
                    message: "Recebido mensagem... " + msg.content.toString()
                })
            }, {
                noAck: true
            });
        });
    });
    
});

module.exports = router;