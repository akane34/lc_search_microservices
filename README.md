# LC Search Microservises
Estos microservicios fueron desplegados en funciones lambda de AWS, cada microservicio es configurable a través de variables de entorno.

## Microservicios de apoyo

* lc_sqsToLambdaMicroservice: Servicio disparado desde un evento de CloudWatch y lee mensajes desde una serie de colas, los mensajes son enviados a un microservicio encargado de persistir la información en una base de datos.
* lc_searchDataSynchronizationMicroservice: Servicio que recibe mensajes y según su tipo los formatea y envia a persistir a una tabla en DynamoDB que se ajuste al tipo de mensaje.
* lc_simpleSearchMicroservice: Servicio que realiza una búsqueda sobre una tabla de DynamoDB basado en una expresión de filtro de DynamoDB. La tabla y el filtro es configurable por variables de entorno. Este microservicio se despliega en una función lambda por cada tipo de búsqueda que desee realizar.
