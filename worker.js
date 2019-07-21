const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (error0, connection) => {
        if (error0) {
            throw error0;
        }
        connection.createChannel((error1, channel) => {
            if(error1) {
                throw error1;
            }
            let queue = 'task_queue';

            channel.assertQueue(queue, {
                durable: false
            });

            console.log('[*] Waiting for messages in %s.', queue);
            channel.consume(queue, (msg) => {
                let secs = msg.content.toString().split('.').length - 1;
                
                console.log(" [x] Received %s", msg.content.toString());

                setTimeout(function() {
                    console.log(" [x] Done");
                }, secs * 1000);
            }, {
                noAck: true
            });
        });
    });