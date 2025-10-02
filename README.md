# pizzaApp - Serverless AWS Lambda Functions

Este proyecto utiliza el framework Serverless para desplegar funciones Lambda en AWS usando Node.js 20.x. A continuación se describen las funciones implementadas:

## Funciones Lambda

### 1. newOrder
- **Archivo handler:** `handler.newOrder`
- **Endpoint HTTP:** `POST /order`
- **Descripción:**
  - Recibe una orden de pizza en formato JSON.
  - Genera un `orderId` único usando `uuid`.
  - Devuelve los detalles de la orden junto con el `orderId`.


### 2. getOrder
- **Archivo handler:** `handler.getOrder`
- **Endpoint HTTP:** `GET /order/{id}`
- **Descripción:**
  - Recibe el `orderId` como parámetro de ruta.
  - Devuelve detalles simulados de la orden (pizza, customerId, estado).

### 3. preOrder
- **Archivo handler:** `handler.preOrder`
- **Evento:** SQS (cola `pendingOrdersQueue`)
- **Descripción:**
  - Procesa mensajes recibidos desde la cola SQS `pendingOrdersQueue`.
  - Pensada para manejar órdenes pendientes de forma asíncrona.

## Estructura de archivos
- `handler.js`: Implementación de las funciones Lambda.
- `serverless.yml`: Configuración del servicio, endpoints HTTP API y recursos SQS.
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

## Recursos AWS creados
- Cola SQS: `pendingOrdersQueue` para órdenes pendientes.

## Referencias
- [Serverless Framework](https://www.serverless.com/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
