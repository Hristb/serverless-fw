# pizzaApp - Serverless AWS Lambda Functions

Este proyecto utiliza el framework Serverless para desplegar funciones Lambda en AWS usando Node.js 20.x. A continuación se describen las funciones implementadas:

## Funciones Lambda



### 1. newOrder
- **Archivo handler:** `handler.newOrder`
- **Endpoint HTTP:** `POST /order`
- **Descripción:**
  - Recibe una orden de pizza en formato JSON.
  - Genera un `orderId` único usando `uuid`.
  - Guarda la orden en DynamoDB usando AWS SDK (`PutCommand`).
  - Envía la orden a la cola SQS `pendingOrdersQueue` usando AWS SDK (`SendMessageCommand`).
  - Devuelve los detalles de la orden junto con el `orderId`.



### 2. getOrder
- **Archivo handler:** `handler.getOrder`
- **Endpoint HTTP:** `GET /order/{id}`
- **Descripción:**
  - Recibe el `orderId` como parámetro de ruta.
  - Consulta la orden en DynamoDB usando AWS SDK (`GetCommand`).
  - Devuelve los detalles reales de la orden almacenada.
  - Maneja errores como orden no encontrada, formato inválido y límites de throughput.




### 3. prepOrder
- **Archivo handler:** `handler.prepOrder`
- **Evento:** SQS (cola `pendingOrdersQueue`)
- **Descripción:**
  - Procesa mensajes recibidos desde la cola SQS `pendingOrdersQueue`.
  - Actualiza el estado de la orden en DynamoDB a "COMPLETED" usando AWS SDK (`UpdateCommand`).


### 4. sendOrder
- **Archivo handler:** `handler.sendOrder`
- **Evento:** (pendiente de configuración de disparador)
- **Descripción:**
  - Envía mensajes a la cola SQS `ordersToSendQueue` para gestionar órdenes listas para enviar.
  - Utiliza los datos de la orden recibidos en el evento.



## Estructura de archivos
- `handler.js`: Implementación de las funciones Lambda, integración con DynamoDB y SQS, manejo de errores.
- `serverless.yml`: Configuración del servicio, endpoints HTTP API, variables de entorno y recursos AWS (SQS, DynamoDB).
- `package.json`: Dependencias y scripts del proyecto.
- `README.md`: Documentación del proyecto.



## Despliegue
Para desplegar las funciones Lambda y recursos (incluyendo la cola SQS) en AWS, ejecuta:

```powershell
sls deploy
```



## Requisitos
- Node.js 20.x
- AWS CLI configurado
- Serverless Framework instalado globalmente (`npm install -g serverless`)




## Variables de entorno
- `REGION`: Región AWS donde se despliega el servicio.
- `PENDING_ORDERS_QUEUE`: URL de la cola SQS para órdenes pendientes.
- `ORDERS_TO_SEND_QUEUE`: URL de la cola SQS para órdenes listas para enviar.
- `ORDERS_TABLE`: Nombre de la tabla DynamoDB para almacenar órdenes.



## Recursos AWS creados
- Cola SQS: `pendingOrdersQueue` para órdenes pendientes.
- Cola SQS: `ordersToSendQueue` para órdenes listas para enviar.
- Tabla DynamoDB: `Orders` para almacenar y consultar órdenes.

## Referencias
- [Serverless Framework](https://www.serverless.com/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
