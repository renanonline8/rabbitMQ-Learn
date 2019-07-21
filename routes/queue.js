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

router.put('/:queue/task/:message', function(req, res, next) {
    amqp.connect('amqp://localhost', (error0, connection) => {
        if (error0) {
            throw error0;
        }
        
        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1;
            }

            let queue = req.params.queue;
            let message = process.argv.slice(2).join(' ') || req.params.message;

            channel.assertQueue(queue, {
                durable: true
            });

            channel.sendToQueue(queue, Buffer.from(message), {
                persistent: true
            });

            console.log("[x] Sent %s", message);

            res.json({
                message: `Enviado Mensagem ${message}`
            })
        });
    });
});

router.get('/:queue/worker', function(req, res, next) {
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
                let secs = msg.content.toString().split('.').length - 1;
                
                console.log(" [x] Received %s", msg.content.toString());

                setTimeout(function() {
                    res.json({
                        message: "Recebido mensagem... " + msg.content.toString()
                    })
                }, secs * 1000);
            }, {
                noAck: true
            });
        });
    });
});

module.exports = router;