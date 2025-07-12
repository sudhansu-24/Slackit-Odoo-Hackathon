# SlackIt - Q&A Platform

A modern, dark-themed Q&A platform built with Next.js, TypeScript, Tailwind CSS, and Supabase. Think Stack Overflow but with a sleek, modern interface designed for developers and tech enthusiasts.

![SlackIt Platform](https://img.shields.io/badge/Platform-Next.js-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## 🌟 Features

### Core Functionality
- **📝 Ask Questions**: Rich text editor with markdown support, tag management, and character limits
- **💬 Answer Questions**: Submit detailed answers with formatting and real-time updates
- **🗳️ Voting System**: Upvote/downvote questions and answers with mail-inspired icons
- **🏷️ Tag Management**: Organize questions with custom tags for better categorization
- **🔍 Search & Filter**: Advanced search with filters (newest, unanswered, popular)
- **📱 Mobile Responsive**: Fully responsive design with hamburger menu navigation

### User Experience
- **🌙 Dark Theme**: Beautiful dark theme throughout the entire application
- **🔐 Authentication**: Secure user registration and login with Supabase Auth
- **👤 User Profiles**: Display author information and avatars
- **⚡ Real-time Updates**: Live updates when new answers or votes are submitted
- **🚀 Fast Performance**: Optimized with Next.js 13 App Router and server-side rendering

### Technical Features
- **📊 Database Integration**: Complete CRUD operations with Supabase PostgreSQL
- **🛡️ Security**: Row Level Security (RLS) policies and protected routes
- **📝 Logging**: Comprehensive Winston-based logging for debugging and monitoring
- **🎨 Modern UI**: Clean interface with Lucide React icons and smooth animations
- **📱 PWA Ready**: Web app manifest and service worker support

## 🏗️ Architecture

### Frontend
- **Next.js 13+** with App Router for modern React development
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for utility-first styling and responsive design
- **Lucide React** for consistent, beautiful icons
- **Client-side routing** with protected routes and middleware

### Backend
- **Supabase** for database, authentication, and real-time features
- **PostgreSQL** database with proper relationships and constraints
- **Row Level Security (RLS)** for data protection
- **API routes** for server-side operations and authentication

### Database Schema
```
profiles (users)
├── id (UUID, primary key)
├── username (unique)
├── email (unique)
├── avatar_url
└── created_at

questions
├── id (UUID, primary key)
├── title (string, max 200 chars)
├── description (text, max 10,000 chars)
├── tags (string array, max 5 tags)
├── author_id (foreign key → profiles.id)
├── votes (integer, default 0)
├── created_at
└── updated_at

answers
├── id (UUID, primary key)
├── question_id (foreign key → questions.id)
├── content (text)
├── author_id (foreign key → profiles.id)
├── votes (integer, default 0)
├── is_accepted (boolean, default false)
├── created_at
└── updated_at

votes
├── id (UUID, primary key)
├── user_id (foreign key → profiles.id)
├── target_id (UUID - question or answer ID)
├── target_type (enum: 'question' | 'answer')
├── vote_type (enum: 'upvote' | 'downvote')
└── created_at
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0 or later
- **npm** or **yarn** package manager
- **Supabase account** for database and authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/slackit.git
   cd slackit
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key_here
   ```

4. **Database Setup**
   
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
   ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

   -- Create profiles table (extends auth.users)
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     username TEXT UNIQUE NOT NULL,
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create questions table
   CREATE TABLE questions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL CHECK (length(title) <= 200),
     description TEXT NOT NULL CHECK (length(description) <= 10000),
     tags TEXT[] DEFAULT '{}' CHECK (array_length(tags, 1) <= 5),
     author_id UUID REFERENCES profiles(id) NOT NULL,
     votes INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create answers table
   CREATE TABLE answers (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
     content TEXT NOT NULL,
     author_id UUID REFERENCES profiles(id) NOT NULL,
     votes INTEGER DEFAULT 0,
     is_accepted BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create votes table
   CREATE TABLE votes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id) NOT NULL,
     target_id UUID NOT NULL,
     target_type TEXT CHECK (target_type IN ('question', 'answer')) NOT NULL,
     vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, target_id, target_type)
   );

   -- RLS Policies
   CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

   CREATE POLICY "Questions are viewable by everyone" ON questions FOR SELECT USING (true);
   CREATE POLICY "Authenticated users can create questions" ON questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   CREATE POLICY "Users can update own questions" ON questions FOR UPDATE USING (auth.uid() = author_id);

   CREATE POLICY "Answers are viewable by everyone" ON answers FOR SELECT USING (true);
   CREATE POLICY "Authenticated users can create answers" ON answers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   CREATE POLICY "Users can update own answers" ON answers FOR UPDATE USING (auth.uid() = author_id);

   CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
   CREATE POLICY "Authenticated users can vote" ON votes FOR ALL USING (auth.uid() = user_id);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
slackit/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── ask/               # Ask Question page
│   │   ├── auth/              # Authentication pages
│   │   ├── questions/[id]/    # Question detail page
│   │   ├── api/               # API routes
│   │   │   ├── questions/     # Question operations
│   │   │   └── vote/          # Voting operations
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── auth/              # Authentication components
│   │   └── ui/                # UI components
│   ├── lib/                   # Utility libraries
│   │   ├── api.ts             # API functions
│   │   ├── supabase.ts        # Supabase client config
│   │   ├── supabase-admin.ts  # Admin client config
│   │   └── client-logger.ts   # Logging utilities
│   ├── types/                 # TypeScript type definitions
│   │   └── database.ts        # Database types
│   └── middleware.ts          # Route protection
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## 🎨 Design System

### Color Palette
- **Background**: `#111827` (gray-900)
- **Cards**: `#1f2937` (gray-800)
- **Borders**: `#374151` (gray-700)
- **Text Primary**: `#ffffff` (white)
- **Text Secondary**: `#9ca3af` (gray-400)
- **Primary**: `#3b82f6` (blue-500)
- **Success**: `#10b981` (emerald-500)
- **Error**: `#ef4444` (red-500)

### Typography
- **Headings**: Inter font family, various weights
- **Body**: System font stack for optimal performance
- **Code**: Monospace for code snippets

### Components
- **Buttons**: Rounded corners, hover states, focus rings
- **Cards**: Subtle borders, dark backgrounds
- **Forms**: Dark inputs with blue focus states
- **Icons**: Lucide React for consistency

## 🔧 API Reference

### Questions
- `GET /api/questions/[id]` - Get question with answers
- `POST /api/questions/[id]/answers` - Create new answer

### Voting
- `POST /api/vote` - Submit vote (upvote/downvote)

### Authentication
- Uses Supabase Auth with email/password
- Protected routes with middleware
- Session management with cookies

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
The app can be deployed on any platform supporting Next.js:
- **Netlify**: Use `@netlify/plugin-nextjs`
- **Railway**: Direct deployment support
- **Digital Ocean**: App Platform with Docker

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Question creation with validation
- [ ] Answer submission and display
- [ ] Voting functionality (upvote/downvote)
- [ ] Search and filtering
- [ ] Mobile responsiveness
- [ ] Authentication flows

### Automated Testing (Future)
- Unit tests with Jest and React Testing Library
- Integration tests for API routes
- E2E tests with Playwright or Cypress

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing code style and patterns
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Supabase** for the excellent backend-as-a-service
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set
- **Stack Overflow** for inspiration on Q&A platform design

## 📞 Support

If you have any questions or need help:

1. **Check existing issues** on GitHub
2. **Create a new issue** with detailed description
3. **Join our community** discussions
4. **Email support**: your-email@example.com

## 🗺️ Roadmap

### Upcoming Features
- [ ] **User profiles** with activity history
- [ ] **Email notifications** for new answers
- [ ] **Advanced search** with filters and sorting
- [ ] **Question categories** and organization
- [ ] **Reputation system** and badges
- [ ] **Markdown editor** with preview
- [ ] **File attachments** for questions/answers
- [ ] **Dark/light theme toggle**
- [ ] **Internationalization** (i18n) support
- [ ] **API documentation** with OpenAPI/Swagger

### Long-term Vision
- **Real-time collaboration** features
- **AI-powered question suggestions**
- **Advanced analytics** dashboard
- **Mobile app** development
- **Enterprise features** for teams

---

**Built with ❤️ by Team Escrows**