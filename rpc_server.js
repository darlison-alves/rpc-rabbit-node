var amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', function(error, connection){
    if(error) throw error

    connection.createChannel(function(err, channel){
        if(err) throw err

        var queue = 'rpc_queue'
        channel.assertQueue(queue,{ durable: false })
        channel.prefetch(1)
        console.info('[x] Awaiting RPC requests')
        channel.consume(queue, function(msg){
            var n = parseInt(msg.content.toString())
            console.info('[.] fib(%d)', n)
            
            var r = fibonacci(n)
            
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(r.toString()), { correlationId: msg.properties.correlationId })
            channel.ack(msg)
        })
    })
})

function fibonacci(n) {
    if(n === 0 || n === 1) return n
    else return fibonacci(n - 1) + fibonacci(n - 2)
}