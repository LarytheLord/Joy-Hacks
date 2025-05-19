# Joy Hacks - Server

This directory contains the Node.js/Express backend application for the Joy Hacks social media platform.

## Structure

```
server/
├── src/                    # Source code
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── users/          # User management endpoints
│   │   ├── videos/         # Video content endpoints
│   │   ├── comments/       # Comment endpoints
│   │   └── search/         # Search and discovery endpoints
│   ├── models/             # Database models
│   ├── services/           # Business logic services
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
├── tests/                  # Unit and integration tests
└── scripts/                # Utility scripts
```

## Features

- RESTful API for client application
- User authentication and authorization
- Video storage and retrieval
- Code execution sandbox integration
- Social features (likes, comments, follows)
- Search and recommendation algorithms

## Technologies

- Node.js with Express
- MongoDB for data storage
- JWT for authentication
- AWS S3 integration for media storage
- Docker for code execution sandboxing

## Development

Instructions for setting up the development environment will be added as the project progresses.