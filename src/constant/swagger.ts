export const constants = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Snail-house",
      version: "1.0.0",
    },
    servers: [
      { url: "http://localhost:4000" },
      { url: "http://139.64.237.139:4000" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "apiKey",
          name: "Authorization User 'Bearer {YOUR_TOKEN}'",
          scheme: "Authorization",
          in: "header",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    consumes: ["application/json"],
    produces: ["application/json"],
    paths: {
      "/api/user/login": {
        post: {
          tags: ["Users Authentication"],
          summary: "Login API",
          security: [],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      description: "Email",
                      type: "string",
                    },
                    password: {
                      description: "Password",
                      type: "string",
                    },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          produces: ["application/json"],
          responses: {},
        },
      },
      "/api/user/register": {
        post: {
          tags: ["Users Authentication"],
          summary: "Registration API",
          security: [],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      description: "Email",
                      type: "string",
                    },
                    password: {
                      description: "Password",
                      type: "string",
                    },
                    confirm_password: {
                      description: "Confirm Password",
                      type: "string",
                    },
                  },
                  required: ["email", "password", "confirm_password"],
                },
              },
            },
          },
          produces: ["application/json"],
          responses: {},
        },
      },
      "/api/user/verify": {
        post: {
          tags: ["Users Authentication"],
          summary: "Verification API",
          security: [],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      description: "Email",
                      type: "string",
                    },
                    verification_code: {
                      description: "Verification Code",
                      type: "string",
                    },
                  },
                  required: ["email", "verification_code"],
                },
              },
            },
          },
          produces: ["application/json"],
          responses: {},
        },
      },
      "/api/user/google-login": {
        post: {
          tags: ["Users Authentication"],
          summary: "Google Login API",
          parameters: [],
          security: [],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    fullName: {
                      description: "fullName",
                      type: "string",
                    },
                    email: {
                      description: "Email",
                      type: "string",
                    },
                    googleId: {
                      description: "Google Id",
                      type: "string",
                    },
                    idToken: {
                      description: "Id Token",
                      type: "string",
                    },
                  },
                  required: ["fullName", "email", "googleId", "idToken"],
                },
              },
            },
          },
          produces: ["application/json"],
          responses: {},
        },
      },
      "/api/user/me": {
        get: {
          security: [{ bearerAuth: [] }],

          tags: ["Users Authentication"],
          summary: "Gets details about a logged in user",
          responses: {},
        },
      },
      "/api/user/forgot-password": {
        post: {
          tags: ["Users Authentication"],
          summary: "Forgot Password API",
          security: [],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      description: "Email",
                      type: "string",
                    },
                  },
                  required: ["email"],
                },
              },
            },
          },
          produces: ["application/json"],
          responses: {},
        },
      },
      "/api/user/reset-password": {
        post: {
          tags: ["Users Authentication"],
          summary: "Reset Password API",
          security: [],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reset_password_token: {
                      description: "Reset Password Token",
                      type: "string",
                    },
                    new_password: {
                      description: "New Password",
                      type: "string",
                    },
                    confirm_password: {
                      description: "Confirm Password",
                      type: "string",
                    },
                  },
                  required: [
                    "reset_password_token",
                    "new_password",
                    "confirm_password",
                  ],
                },
              },
            },
          },
          produces: ["application/json"],
          responses: {},
        },
      },
    },
  },
  apis: ["./routes/**/*"],
};
