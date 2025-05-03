# El Warsha Art Fair - Voting Platform

## 🚀 2025 Optimization & Performance Improvements

**This project underwent a comprehensive performance and UX optimization in 2025.**

### Key Improvements
- **Image Optimization:**
  - All artwork images now use Next.js `<Image />` for automatic lazy loading, responsive sizing, and improved performance.
- **Memoization:**
  - All static data (categories, filter options, grouped lists) and derived lists are memoized using `useMemo` for instant UI updates and to prevent unnecessary re-renders.
  - Components like `ArtPreview`, `CategoryTagSelector`, and `BulkCSVUpload` are wrapped in `React.memo` to avoid unnecessary re-renders.
- **Skeleton Loaders:**
  - All major tables, lists, and galleries (artworks, judges, votes, admin dashboard) show animated skeleton loaders while fetching data, improving perceived speed.
- **Efficient Data Fetching:**
  - API data is fetched in parallel where possible (using `Promise.all`). Loading states are managed to minimize UI blocking.
- **UI/UX Improvements:**
  - All select dropdowns and filter controls are now instant and smooth thanks to memoization.
  - Buttons and navigation are responsive, and user flows (judges, admins, voting) are optimized for minimal wait time.
  - Role-based redirects and dynamic home page buttons for a seamless user journey.
- **Code Quality:**
  - Lint errors fixed, code refactored for clarity and maintainability.

### Recommendations for Further Optimization
- Ensure all API endpoints use `.lean()` for MongoDB queries and return only necessary fields.
- For very large lists (artworks, votes), implement pagination or infinite scroll.
- Host static assets (images, PDFs) on a CDN for even faster load times.
- Review ARIA roles and keyboard navigation for accessibility improvements.

---

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
