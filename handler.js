const { v4: uuidv4 } = require('uuid');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

//Create a SQS client
const sqsClient = new SQSClient({ region: process.env.REGION });

//Create a DynamoDB client
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient,PutCommand,UpdateCommand,GetCommand } = require("@aws-sdk/lib-dynamodb");
const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

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
    // Save order to DynamoDB
    await saveOrderToDynamoDB(order);

    const PENDING_ORDERS_QUEUE_URL = process.env.PENDING_ORDERS_QUEUE;
    await sendTessageToSQS(order, PENDING_ORDERS_QUEUE_URL);
    return {
        statusCode: 200,
        body: JSON.stringify({ message: order }),
    };

}  

exports.getOrder = async (event) => {
    const orderId = event.pathParameters.id;

    try {
        const order = await getOrderFromDynamoDB(orderId);
        return {
            statusCode: 200,
            body: JSON.stringify(order),
        };
    } catch (error) {
        console.error('Error retrieving order:', error);
       if (error.message.includes('not found')) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: error.message }),
            };
        }
        if (error.name === 'ValidationException') {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid order ID format' }),
            };
        }
        if (error.name === 'ProvisionedThroughputExceededException') {
            return {
                statusCode: 503,
                body: JSON.stringify({ message: 'Service unavailable, please try again later' }),
            };
        }
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Internal server error, please try again later' }),
            };
    }
}

exports.prepOrder = async (event) => {
   console.log("prepOrder evet: ",event); 
   const body = JSON.parse(event.Records[0].body);
   const orderId = body.orderId;
   console.log('Preparing body', body);

await updateOrderInDynamoDB(orderId, "COMPLETED");

return;
}

exports.sendOrder = async (event) => {
    console.log(event); 

    if (event.Records[0].eventName === 'MODIFY') {
        const eventBody = event.Records[0].dynamodb;
        console.log('DynamoDB event body:', eventBody);
        const orderDetails = eventBody.NewImage;
        console.log('New image:', newImage);

        const order = {
            orderId: orderDetails.orderId.S,
            pizza: orderDetails.pizza.S,
            customerId: orderDetails.customerId.S,
            order_status: orderDetails.order_status.S
        }
        console.log('order:', order);

    const ORDERS_TO_SEND_QUEUE_URL = process.env.ORDERS_TO_SEND_QUEUE;
    await sendTessageToSQS(order, ORDERS_TO_SEND_QUEUE_URL);
    }
return;
}

async function sendTessageToSQS(message,queueUrl) {
    const params = {
        QueueUrl: queueUrl,
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

async function saveOrderToDynamoDB(order) {
    const params = {
        TableName: process.env.ORDERS_TABLE,
        Item: order
    };
    console.log('Saving order to DynamoDB:', params);   
    try {
        const command = new PutCommand(params);
        const response = await ddbDocClient.send(command);
        console.log("Success, order saved:", response);
    } catch (err) {
        console.error("Error", err);
        throw err;
    }   
}

async function updateOrderInDynamoDB(orderId, estatus) {
    const params = {
        TableName: process.env.ORDERS_TABLE,
        Key: { orderId },
        UpdateExpression: "SET order_status = :status",
        ExpressionAttributeValues: {
            ":status": estatus
        },
        ReturnValues: "ALL_NEW"
    };
    console.log('Updating order in DynamoDB:', params); 

    try {
        const command = new UpdateCommand(params);
        const response = await ddbDocClient.send(command);
        console.log("Success, order updated:", response);
    }   catch (err) {   
        console.error("Error", err);
        throw err;
    }
}

async function getOrderFromDynamoDB(orderId) {
    const params = {
        TableName: process.env.ORDERS_TABLE,
        Key: { orderId }
    };
    console.log('Getting order from DynamoDB:', params);
    try {
        const command = new GetCommand(params);
        const response = await ddbDocClient.send(command);
        if (response.Item) {
             console.log("Success, order retrieved:", response);
             return response.Item;
        }else{
            console.log("Error, order retrieved:", response);
            throw new Error(`Order with ID ${orderId} not found`);
        }

    } catch (err) {
        console.error("Error", err);
        throw err;
    }
}