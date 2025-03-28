import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tiki Webapp API',
      version: '1.0.0',
      description: 'API documentation for Tiki Webapp',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local server',
      },
      {
        url: 'https://tiki-webapp-backend.onrender.com/api',
        description: 'Production server',
      },
    ],
  },
  // Path to your API route files (where Swagger comments will go)
  apis: ['./src/swagger/*.swagger.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
