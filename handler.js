const { v4: uuidv4 } = require('uuid');

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

exports.preOrder = async (event) => {
   console.log('Cola: ',event); 
return;
}