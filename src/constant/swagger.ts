export const constants = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Minto NFT",
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
  },
  apis: ["./routes/**/*"],
};

