const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ClinicBook API",
      version: "1.0.0",
      description: "API documentation for ClinicBook backend"
    },
    servers: [
      { url: process.env.API_BASE_URL || "http://localhost:3000"
}
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
    schemas: {
  User: {
    type: "object",
    properties: {
      id: { type: "integer" },
      name: { type: "string" },
      email: { type: "string" },
      role: { type: "string" }
    }
  },

  LoginRequest: {
    type: "object",
    properties: {
      email: { type: "string" },
      password: { type: "string" }
    }
  },

  RegisterRequest: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      password: { type: "string" }
    }
  },

  Specialty: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1
      },
      name: {
        type: "string",
        example: "Cardiology"
      }
    }
  },

  CreateSpecialtyRequest: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        example: "Cardiology"
      }
    }
  }
}
    }
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};