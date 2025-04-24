# El Warsha Art Fair - Voting Platform

A full-stack web application for managing art exhibition voting, built with Next.js, Node.js, and MongoDB.

## 🎨 Features

### User Roles
- **Judges**: Log in and vote on artwork
- **Admin**: View voting results and rankings

### Art Categories
- Photography
- Paintings
- Digital Painting
- Drawing

### Key Features
- Gallery-style artwork display
- Voting system with 1-5 ranking criteria
- Image loading from Google Drive
- Admin dashboard with voting statistics
- Responsive design using Tailwind CSS and ShadcN UI

## 🛠 Tech Stack

- **Frontend**: Next.js, Tailwind CSS, ShadcN UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS

## 📁 Project Structure

```
/app
  /api        # API routes
  /components # Reusable UI components
  /lib        # Utility functions and configurations
  /models     # MongoDB models
  /pages      # Application pages
  /public     # Static assets
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd elwarsha-art-fair
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application

## 📄 Pages

- **/login** - Judge authentication
- **/home** - Welcome page and event details
- **/vote** - Artwork voting interface
- **/admin** - Admin dashboard and results

## 💾 Database Collections

### Artworks
```javascript
{
  title: String,
  description: String,
  category: String,
  artistName: String,
  artworkCode: String,
  imageUrl: String
}
```

### Judges
```javascript
{
  email: String,
  name: String,
  role: String
}
```

### Votes
```javascript
{
  judgeId: String,
  artworkId: String,
  scores: {
    creativity: Number,
    technique: Number,
    // other criteria
  },
  category: String
}
```

## 🤝 Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.
