# Turso + Drizzle ORM Setup Guide

## 1. Install Dependencies
```bash
npm install @libsql/client drizzle-orm drizzle-kit
```

## 2. Create Turso Database
```bash
# Install Turso CLI (if not already installed)
curl -sSfL https://get.turso.io | sh

# Login to Turso
turso auth login

# Create a new database
turso db create msqexam

# Get database URL
turso db show --url msqexam

# Create auth token
turso db tokens create msqexam
```

## 3. Environment Variables
Create a `.env` file in your project root:
```
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
```

## 4. Database Operations
```bash
# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## 5. Project Structure
```
lib/
├── turso.ts          # Turso client configuration
├── db/
│   ├── schema.ts     # Database schema definitions
│   └── index.ts      # Drizzle ORM setup
drizzle.config.ts     # Drizzle configuration
```

## 6. Usage Examples

### API Route (app/api/users/route.ts)
- GET: Fetch all users
- POST: Create a new user

### Page (app/users/page.tsx)
- Displays list of users from database

## 7. Database Schema
Current schema includes:
- `users` table (id, name, email, timestamps)
- `posts` table (id, title, content, authorId, timestamps)

## Testing the Setup
1. Set up your Turso database and get credentials
2. Create `.env` file with your credentials
3. Run `npm run db:push` to create tables
4. Visit `/users` page to see the data
5. Use API endpoints to interact with the database
