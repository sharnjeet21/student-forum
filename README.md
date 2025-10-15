# Student Forum - Collaborative Learning Platform

A modern full-stack forum where students can discuss problems, share knowledge, and help each other learn. Built with React frontend and Node.js/MongoDB backend.

## Features

### 🔐 Authentication
- User signup and login with Firebase Auth
- Protected routes for authenticated users
- User profiles with reputation system

### 💬 Discussion Forum
- Create discussion threads by category
- Reply to threads with nested comments
- Upvote/downvote system for quality content
- Search and filter discussions
- Tag system for better organization

### 📱 Modern UI/UX
- Responsive design with Tailwind CSS
- Clean, accessible interface
- Real-time updates
- Mobile-friendly navigation

### 👨‍💼 Admin Features
- Admin dashboard for content moderation
- User management
- Reported content review

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS, Headless UI
- **State Management**: React Query
- **Forms**: React Hook Form
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-forum
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

4. **MongoDB Setup**
   
   **Option A: Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   
   **Option B: MongoDB Atlas (Cloud)**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a cluster and get connection string

5. **Configure Environment Variables**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Update `server/.env` with your settings:
   ```env
   MONGODB_URI=mongodb://localhost:27017/student-forum
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```

6. **Seed Database (Optional)**
   ```bash
   cd server
   npm run seed
   ```

7. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

8. **Start Frontend (New Terminal)**
   ```bash
   npm run dev
   ```

9. **Open your browser**
   Navigate to `http://localhost:3000`

## MongoDB Database Structure

### Collections

**users**
```javascript
{
  _id: ObjectId,
  displayName: string,
  email: string,
  password: string (hashed),
  avatar?: string,
  isAdmin: boolean,
  reputation: number,
  isActive: boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**threads**
```javascript
{
  _id: ObjectId,
  title: string,
  content: string,
  category: enum,
  author: ObjectId (ref: User),
  tags: [string],
  upvotes: [{ user: ObjectId }],
  downvotes: [{ user: ObjectId }],
  replyCount: number,
  isResolved: boolean,
  isPinned: boolean,
  views: number,
  createdAt: Date,
  updatedAt: Date
}
```

**replies**
```javascript
{
  _id: ObjectId,
  content: string,
  thread: ObjectId (ref: Thread),
  author: ObjectId (ref: User),
  parentReply?: ObjectId (ref: Reply),
  upvotes: [{ user: ObjectId }],
  downvotes: [{ user: ObjectId }],
  isAccepted: boolean,
  isEdited: boolean,
  editedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── forum/          # Forum-specific components
│   ├── common/         # Shared components
│   └── admin/          # Admin panel components
├── pages/              # Page components
├── contexts/           # React contexts
├── services/           # Firebase service functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── config/             # Configuration files
└── styles/             # Global styles
```

## Features to Implement

### Phase 1 (Current)
- ✅ User authentication
- ✅ Basic forum structure
- ✅ Thread creation and viewing
- ✅ Reply system
- ✅ Voting system
- ✅ User profiles

### Phase 2 (Future)
- [ ] Real-time notifications
- [ ] Advanced search with Algolia
- [ ] File attachments
- [ ] Email notifications
- [ ] Reputation system enhancements
- [ ] Moderation tools
- [ ] Mobile app with React Native

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [your-email] or create an issue in the repository.