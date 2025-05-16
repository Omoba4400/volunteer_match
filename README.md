# Community Action Board

A modern web application that connects volunteers with organizations offering volunteer opportunities. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🌟 Features

### For Volunteers
- **Browse Opportunities**: Search and filter volunteer opportunities by cause, location, and more
- **Application Management**: Track application status (pending, accepted, rejected)
- **Profile Management**: 
  - Update personal information
  - View accepted applications
  - Track volunteer history
- **Communication**: Message organizations directly through the platform
- **Dashboard**: Personal dashboard showing application status and recommended opportunities

### For Organizations
- **Opportunity Management**:
  - Create and edit volunteer opportunities
  - Add images and detailed descriptions
  - Specify causes and requirements
- **Application Processing**:
  - Review volunteer applications
  - Accept or reject applications
  - View list of accepted volunteers
- **Communication**: Direct messaging with volunteers
- **Dashboard**: Organization dashboard with statistics and opportunity management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/community-action-board.git
cd community-action-board
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/         # Reusable UI components
├── contexts/          # React context providers
├── hooks/             # Custom React hooks
├── integrations/      # External service integrations
├── lib/              # Utility functions and configurations
├── pages/            # Page components
└── styles/           # Global styles and Tailwind configuration
```

## 🔑 Key Components

### Authentication
- User registration and login
- Role-based access (volunteer/organization)
- Profile management

### Opportunity Management
- Create, edit, and delete opportunities
- Image upload functionality
- Cause and location tagging

### Application System
- Apply for opportunities
- Application status tracking
- Accept/reject functionality

### Messaging System
- Direct messaging between volunteers and organizations
- Message notifications
- Conversation tracking

## 💻 Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Backend/Database**: Supabase
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **State Management**: React Context
- **Routing**: React Router
- **Build Tool**: Vite

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Set up the following tables:
   - profiles
   - opportunities
   - applications
   - messages

### Database Schema

```sql
-- Profiles table
create table profiles (
  id uuid references auth.users primary key,
  name text,
  role text check (role in ('volunteer', 'organization')),
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Opportunities table
create table opportunities (
  id uuid default uuid_generate_v4() primary key,
  created_by uuid references profiles(id),
  title text not null,
  description text,
  location text,
  causes text[],
  image_url text,
  image_path text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Applications table
create table applications (
  id uuid default uuid_generate_v4() primary key,
  opportunity_id uuid references opportunities(id),
  volunteer_id uuid references profiles(id),
  status text check (status in ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Messages table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id),
  receiver_id uuid references profiles(id),
  content text,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.io/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
