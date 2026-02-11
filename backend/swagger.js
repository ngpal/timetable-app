import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Timetable Management API',
      version: '1.0.0',
      description: 'API documentation for the Timetable Management System',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
          description: 'JWT token stored in cookie',
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  // Path to the API routes files - using absolute paths
  apis: [
    path.join(__dirname, 'routes', '*.js'),
    path.join(__dirname, 'controllers', '*.js')
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
