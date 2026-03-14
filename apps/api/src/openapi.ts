import type { JsonObject } from 'swagger-ui-express';

export const openApiSpec: JsonObject = {
  openapi: '3.0.3',
  info: {
    title: 'Astronote API',
    version: '0.0.0',
    description: 'REST API for the Astronote note-taking application.',
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Basic auth with an API key',
      },
    },
  },
  security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
  paths: {
    '/auth': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '400': { description: 'Missing email or password' },
          '401': { description: 'Invalid credentials' },
        },
      },
      get: {
        tags: ['Auth'],
        summary: 'Get current user from token',
        responses: {
          '200': { description: 'Current user info' },
          '401': { description: 'Authentication required or invalid token' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'New access token' },
          '400': { description: 'Missing refresh token' },
          '401': { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '204': { description: 'Logged out' },
        },
      },
    },
    '/notes': {
      get: {
        tags: ['Notes'],
        summary: 'List notes',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search query' },
          { name: 'tags', in: 'query', schema: { type: 'string' }, description: 'Comma-separated tag filter' },
          { name: 'collectionId', in: 'query', schema: { type: 'integer' }, description: 'Filter by collection' },
        ],
        responses: {
          '200': { description: 'List of notes' },
        },
      },
      post: {
        tags: ['Notes'],
        summary: 'Create a note',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'body'],
                properties: {
                  title: { type: 'string' },
                  body: { type: 'string' },
                  collectionId: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Note created' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/notes/export': {
      get: {
        tags: ['Notes'],
        summary: 'Export all notes as a ZIP archive',
        responses: {
          '200': {
            description: 'ZIP file containing all notes',
            content: { 'application/zip': {} },
          },
        },
      },
    },
    '/notes/{id}': {
      get: {
        tags: ['Notes'],
        summary: 'Get a note by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'The note' },
          '404': { description: 'Note not found' },
        },
      },
      patch: {
        tags: ['Notes'],
        summary: 'Update a note',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  body: { type: 'string' },
                  collectionId: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated note' },
          '400': { description: 'Validation error' },
          '404': { description: 'Note not found' },
        },
      },
      delete: {
        tags: ['Notes'],
        summary: 'Delete a note',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '204': { description: 'Note deleted' },
          '404': { description: 'Note not found' },
        },
      },
    },
    '/notes/{id}/tags': {
      post: {
        tags: ['Notes'],
        summary: 'Add a tag to a note',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tag'],
                properties: {
                  tag: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated note with new tag' },
          '400': { description: 'Validation error' },
          '404': { description: 'Note not found' },
        },
      },
    },
    '/notes/{id}/tags/{tag}': {
      delete: {
        tags: ['Notes'],
        summary: 'Remove a tag from a note',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'tag', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Updated note without the tag' },
          '404': { description: 'Note not found' },
        },
      },
    },
    '/tags': {
      get: {
        tags: ['Tags'],
        summary: 'List tags',
        parameters: [
          { name: 'collectionId', in: 'query', schema: { type: 'integer' }, description: 'Filter by collection' },
        ],
        responses: {
          '200': { description: 'List of tags' },
        },
      },
    },
    '/collections': {
      get: {
        tags: ['Collections'],
        summary: 'List collections',
        responses: {
          '200': { description: 'List of collections' },
        },
      },
      post: {
        tags: ['Collections'],
        summary: 'Create a collection',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Collection created' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/collections/{id}': {
      delete: {
        tags: ['Collections'],
        summary: 'Delete a collection',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '204': { description: 'Collection deleted' },
          '404': { description: 'Collection not found' },
        },
      },
    },
    '/collections/{id}/default': {
      post: {
        tags: ['Collections'],
        summary: 'Set a collection as default',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Updated list of collections' },
          '404': { description: 'Collection not found' },
        },
      },
    },
    '/keys': {
      get: {
        tags: ['API Keys'],
        summary: 'List API keys',
        responses: {
          '200': { description: 'List of API keys' },
        },
      },
      post: {
        tags: ['API Keys'],
        summary: 'Create an API key',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'API key created' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/keys/{id}': {
      delete: {
        tags: ['API Keys'],
        summary: 'Delete an API key',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'API key deleted' },
          '404': { description: 'API key not found' },
        },
      },
    },
    '/settings': {
      get: {
        tags: ['Settings'],
        summary: 'Get settings',
        security: [],
        responses: {
          '200': { description: 'Current settings' },
        },
      },
      patch: {
        tags: ['Settings'],
        summary: 'Update settings',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          '200': { description: 'Updated settings' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/settings/reset': {
      post: {
        tags: ['Settings'],
        summary: 'Reset all settings to defaults',
        security: [],
        responses: {
          '200': { description: 'Default collection after reset' },
        },
      },
    },
  },
};
