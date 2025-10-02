const { v4: uuidv4 } = require('uuid');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

//Create a SQS client
const sqsClient = new SQSClient({ region: process.env.REGION });

exports.newOrder = async (event) => {
    const orderId = uuidv4();
    console.log('New order received:', orderId);

    let orderDetails;
    try {
        orderDetails = JSON.parse(event.body);
    } catch (error) {
        console.error('Error processing order:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Failed to process order' }),
        };
    }

    console.log('Order details:', orderDetails);
    const order = { orderId, ...orderDetails };

    await sendTessageToSQS(order);
    return {
        statusCode: 200,
        body: JSON.stringify({ message: order }),
    };

}  

exports.getOrder = async (event) => {
    const orderId = event.pathParameters.id;

    const orderDetails = {
        "pizza": 'Hahuawaian',
        "customerId": 1,
        "order_status": "COMPLETED"
    };  

    const order = { orderId, ...orderDetails };

    return {
        statusCode: 200,
        body: JSON.stringify({ message: order }),
    };
}

exports.prepOrder = async (event) => {
   console.log(event); 
return;
}

async function sendTessageToSQS(message) {
    const params = {
        QueueUrl: process.env.PENDING_ORDERS_QUEUE,
        MessageBody: JSON.stringify(message),
    }; 
    console.log('Sending message to SQS:', params);
    try {
        const command = new SendMessageCommand(params);
        const data = await sqsClient.send(command);
        console.log("Success, message sent. MessageID:", data.MessageId);
    } catch (err) {
        console.error("Error", err);
        throw err;
    }
}