# Joy Hacks

A cross-platform social media app specifically for coders and programmers, inspired by the reels/shorts format. The app allows users to create, view, and interact with short-form videos where each video displays code on one side and its execution result/output on the other.

## Core Features

### User Authentication
- Secure sign-up, login, and logout using email and social logins (Google, GitHub)
- Password reset and email verification

### User Profiles
- Customizable profiles with avatar, bio, programming languages
- Followers/following functionality
- Display of user's posted videos

### Content Creation
- Record or upload short videos (up to 60 seconds) showing code and output side by side
- Integrated code editor with syntax highlighting (Python, JavaScript, C++)
- Code execution sandbox for safe, real-time output rendering
- Add captions, hashtags, and select programming language
- Automatic thumbnail generation

### Feed & Discovery
- Main feed showing latest and trending videos
- Personalized recommendations
- Search by language, hashtag, user, or code topic
- Explore section for trending tags and top creators

### Interaction & Social Features
- Like, comment, and share functionality
- Copy code button
- Follow/unfollow users
- Save videos to collections
- Notifications system

### Moderation & Security
- Automated content moderation
- Report/block functionality
- Secure sandboxed code execution

## Tech Stack

### Frontend
- Expo with reat native (for cross-platform mobile/web)

### Backend
- Node.js with Express
- MongoDB for database
- Docker containers for code execution sandboxing

### Services
- Firebase Authentication
- AWS S3 for media storage
- Firebase Cloud Messaging for notifications

### Optional AI Enhancements(do this at the last when every thing is ready and working fine)
- AI-powered code suggestions
- AI moderation
- Personalized content recommendations

## Project Structure

```
joy-hacks/
├── client/                 # expo frontend application
├── server/                 # Node.js backend application
├── docker/                 # Docker configuration for code execution
└── docs/                   # Documentation
```

## Getting Started

Instructions for setting up the development environment will be added as the project progresses.

## License

This project is licensed under the MIT License - see the LICENSE file for details.