# 🎓 Exam Portal

A comprehensive online examination management system built with Next.js, featuring AI-powered proctoring, real-time progress tracking, and detailed analytics.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [👥 User Roles](#-user-roles)
- [🎨 UI Components](#-ui-components)
- [🔒 Security Features](#-security-features)
- [📊 Data Management](#-data-management)
- [🛠️ Development](#️-development)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Overview

The Exam Portal is a modern, full-stack web application designed to facilitate secure online examinations with advanced monitoring capabilities. It provides educational institutions with a complete solution for creating, conducting, and managing examinations while ensuring academic integrity through AI-powered proctoring.

### Key Problems Solved

- **Secure Exam Environment**: AI proctoring prevents cheating through multiple detection mechanisms
- **Scalable Management**: Handle hundreds of concurrent examinations efficiently
- **Real-time Analytics**: Track student progress and performance in real-time
- **Academic Organization**: Manage complex educational hierarchies (departments, years, sections)
- **Comprehensive Reporting**: Detailed result analysis with export capabilities

## ✨ Features

### 🎯 Core Features

#### For Administrators

- **Exam Creation**: Create comprehensive exams with multiple question types
- **Question Management**: Organize questions by sections with proper ordering
- **Academic Management**: Manage departments, academic years, and student sections
- **Results Analysis**: View detailed performance analytics and comparisons
- **SEB Integration**: Safe Exam Browser configuration for enhanced security
- **User Management**: Admin account management and access control

#### For Students

- **Live Exam Interface**: Intuitive exam-taking experience with progress tracking
- **Section Navigation**: Navigate between different exam sections easily
- **Answer Review**: Mark questions for review and change answers before submission
- **Real-time Progress**: Track completion status per section and overall exam
- **Violation Awareness**: Get notified of proctoring violations in real-time

### 🔒 Security & Proctoring

- **AI-Powered Proctoring**: Intelligent monitoring of student behavior
- **Tab Switching Detection**: Alerts when students leave the exam window
- **Copy/Paste Prevention**: Blocks unauthorized content transfer
- **Fullscreen Enforcement**: Requires fullscreen mode during exams
- **Context Menu Blocking**: Prevents right-click menu access
- **Violation Tracking**: Logs all security violations with timestamps
- **Cooldown Period**: Prevents rapid violation spamming

### 📊 Analytics & Reporting

- **Section-wise Performance**: Detailed breakdown by exam sections
- **Answer Comparison**: Side-by-side comparison of student vs correct answers
- **Export Functionality**: Export results to Excel for further analysis
- **Time Analysis**: Track time spent per question and section
- **Violation Reports**: Comprehensive security violation logs

## 🏗️ Architecture

### Technology Stack

#### Frontend

- **Next.js 16.1.6**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Modern icon library

#### UI Components

- **shadcn/ui**: High-quality, accessible component library
- **Radix UI**: Unstyled, accessible component primitives
- **Theme Support**: Dark/light mode with CSS variables

#### State Management

- **Redux Toolkit**: Centralized state management
- **React Hooks**: Local state management and side effects

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │   Student Exam  │    │   Results View  │
│                 │    │                 │    │                 │
│ • Exam Creation │    │ • Live Proctor  │    │ • Analytics     │
│ • User Management│   │ • Progress Track │    │ • Export Data   │
│ • Academic Setup│    │ • Violation Log │    │ • Comparisons   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Core System    │
                    │                 │
                    │ • Redux Store   │
                    │ • API Layer     │
                    │ • Utils         │
                    │ • Components    │
                    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20.x)
- npm, yarn, pnpm, or bun package manager
- Git for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Exam-Portal
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment template
   cp .env.example .env.local

   # Configure your environment variables
   # See Configuration section below
   ```

4. **Run development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📁 Project Structure

```
Exam-Portal/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard routes
│   │   ├── academic/            # Academic management
│   │   │   └── page.tsx         # Department/Year/Section management
│   │   ├── create-exam/         # Exam creation interface
│   │   │   └── page.tsx
│   │   ├── dashboard/           # Admin home page
│   │   │   └── page.tsx
│   │   ├── exam/               # Exam management
│   │   │   └── page.tsx
│   │   ├── results/             # Results viewing
│   │   │   └── [examId]/
│   │   │       └── page.tsx    # Detailed results with dialog
│   │   ├── sections/            # Section templates
│   │   │   └── page.tsx
│   │   ├── seb/                # SEB configuration
│   │   │   └── page.tsx
│   │   └── manage-admins/       # Admin user management
│   │       └── page.tsx
│   ├── exam/                    # Student exam routes
│   │   └── [examId]/
│   │       ├── live/           # Live exam taking
│   │       │   └── page.tsx    # Main exam interface
│   │       └── result/         # Student result display
│   │           └── page.tsx
│   ├── globals.css              # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # Reusable components
│   ├── ui/                     # Base UI components
│   │   ├── dialog.tsx          # Dialog component (width-fixed)
│   │   ├── sidebar.tsx         # Sidebar components
│   │   └── ...                 # Other shadcn/ui components
│   └── pageComponents/         # Page-specific components
│       ├── AppSidebar.tsx      # Main navigation sidebar
│       ├── DashboardProvider.tsx # Layout wrapper
│       ├── NavMain.tsx         # Navigation items
│       └── ...                 # Other page components
├── lib/                        # Utilities and configurations
│   ├── utils.ts               # General utilities
│   └── ...                    # Other utility files
├── store/                      # Redux store configuration
│   ├── slices/                # Redux slices
│   └── index.ts              # Store setup
├── public/                     # Static assets
│   ├── logo.webp              # Application logo
│   └── ...                    # Other static files
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="your_database_connection_string"

# Authentication
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# API Configuration
API_BASE_URL="http://localhost:3000/api"

# File Upload Configuration
MAX_FILE_SIZE="10485760"  # 10MB in bytes

# Proctoring Settings
VIOLATION_COOLDOWN="30000"  # 30 seconds in milliseconds
```

## 👥 User Roles

### Administrator

- **Full Access**: Complete system administration
- **Exam Management**: Create, edit, and delete exams
- **User Management**: Manage admin accounts
- **Academic Setup**: Configure departments, years, and sections
- **Results Access**: View all student results and analytics
- **System Configuration**: SEB settings and security parameters

### Student

- **Exam Access**: Take assigned examinations
- **Progress Tracking**: View real-time exam progress
- **Answer Management**: Save and review answers
- **Result Viewing**: Access personal examination results

## 🎨 UI Components

### Core Components

#### Dialog System

- **Location**: `components/ui/dialog.tsx`
- **Features**:
  - Responsive width management
  - Custom styling support
  - Accessibility features
- **Fixed Issue**: Removed restrictive max-width constraints

#### Sidebar Navigation

- **Location**: `components/pageComponents/AppSidebar.tsx`
- **Features**:
  - Collapsible design with animations
  - Active state indicators
  - Badge support for new features
  - Centered logo in expanded state
  - Mobile-responsive behavior

#### Dashboard Layout

- **Location**: `components/pageComponents/DashboardProvider.tsx`
- **Features**:
  - Breadcrumb navigation
  - Responsive header
  - Theme toggle integration
  - User profile integration

## 🔒 Security Features

### AI Proctoring System

#### Detection Mechanisms

1. **Tab Switching**: Monitors when students leave the exam window
2. **Copy/Paste Prevention**: Blocks clipboard operations during exams
3. **Fullscreen Enforcement**: Requires and maintains fullscreen mode
4. **Context Menu Blocking**: Disables right-click functionality
5. **Keyboard Monitoring**: Prevents forbidden keyboard shortcuts

#### Violation Management

- **Cooldown Period**: 30-second cooldown between violation notifications
- **Violation Logging**: Comprehensive log with timestamps and details
- **Progress Impact**: Violations may affect exam progress tracking
- **Admin Alerts**: Real-time notification system for administrators

## 📊 Data Management

### Academic Configuration

#### Data Structures

```typescript
// Academic Configuration
interface Department {
  id: string;
  name: string;
  code: string;
  hod?: string; // Head of Department
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AcademicYear {
  id: string;
  name: string; // e.g., "2023-2024", "Fall 2023"
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  order: number;
}

interface Section {
  id: string;
  name: string; // e.g., "A", "B", "C" or "A, B, C"
  departmentId: string;
  yearId: string;
  order: number;
  capacity?: number;
  currentStrength?: number;
}
```

#### Features

- **Departments**: Hierarchical organization of academic departments
- **Years**: Academic year and semester management
- **Sections**: Student section allocation with proper sorting
- **Bulk Operations**: Import/export academic data via Excel
- **Validation**: Ensure data integrity and prevent duplicates

### Exam Data Structure

```typescript
interface Exam {
  id: string;
  title: string;
  description: string;
  instructions: string;
  duration: number; // in minutes
  startDate: Date;
  endDate: Date;
  maxAttempts: number;
  passingMarks: number;
  totalMarks: number;
  sections: ExamSection[];
  settings: ExamSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExamSection {
  id: string;
  name: string;
  description?: string;
  order: number;
  timeLimit?: number; // optional time limit per section in minutes
  isMandatory: boolean;
  questions: Question[];
}

interface Question {
  id: string;
  type: "multiple-choice" | "true-false" | "fill-blank" | "essay";
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | number | string[];
  explanation?: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  section: string;
  order: number;
  hasNegativeMarking: boolean;
  negativeMarks?: number;
}
```

### Student Response & Progress

```typescript
interface StudentResponse {
  id: string;
  examId: string;
  studentId: string;
  answers: Record<string, Answer>;
  sectionProgress: Record<string, SectionProgress>;
  timeSpent: Record<string, number>; // time per question in seconds
  totalTimeSpent: number; // total time in seconds
  violations: Violation[];
  startedAt: Date;
  submittedAt: Date;
  status: "in-progress" | "submitted" | "graded" | "expired";
}

interface SectionProgress {
  sectionId: string;
  totalQuestions: number;
  answeredQuestions: number;
  markedForReview: number;
  notVisited: number;
  timeSpent: number; // seconds
}
```

### Results and Analytics

#### Analytics Dashboard

```typescript
interface ExamAnalytics {
  examId: string;
  totalParticipants: number;
  completedParticipants: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  averageTimeSpent: number;
  sectionAnalytics: SectionAnalytics[];
  questionAnalytics: QuestionAnalytics[];
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  violationStats: {
    totalViolations: number;
    violationsByType: Record<string, number>;
    averageViolationsPerStudent: number;
  };
}
```

#### Features

- **Performance Metrics**: Section-wise and overall performance
- **Answer Analysis**: Detailed comparison with correct answers
- **Time Tracking**: Time spent per question and section
- **Export Capabilities**: Excel export for further analysis
- **Statistical Analysis**: Discrimination index, difficulty ratings
- **Real-time Monitoring**: Live exam progress tracking

## 🔌 API Documentation

### Authentication Endpoints

```typescript
// Login
POST /api/auth/login
{
  "email": string,
  "password": string
}
Response: {
  "user": User,
  "token": string,
  "expiresIn": number
}

// Logout
POST /api/auth/logout
Headers: Authorization: Bearer <token>

// Refresh Token
POST /api/auth/refresh
{
  "refreshToken": string
}
```

### Academic Management

```typescript
// Departments
GET /api/academic/departments
POST /api/academic/departments
PUT /api/academic/departments/:id
DELETE /api/academic/departments/:id

// Academic Years
GET /api/academic/years
POST /api/academic/years
PUT /api/academic/years/:id
DELETE /api/academic/years/:id

// Sections
GET /api/academic/sections
POST /api/academic/sections
PUT /api/academic/sections/:id
DELETE /api/academic/sections/:id
```

### Exam Management

```typescript
// Exams
GET /api/exams
GET /api/exams/:id
POST /api/exams
PUT /api/exams/:id
DELETE /api/exams/:id

// Questions
GET /api/exams/:examId/questions
POST /api/exams/:examId/questions
PUT /api/questions/:questionId
DELETE /api/questions/:questionId

// Exam Sessions
POST /api/exams/:examId/start
POST /api/exams/:examId/submit
GET /api/exams/:examId/session/:sessionId
```

### Results & Analytics

```typescript
// Results
GET /api/results/exam/:examId
GET /api/results/student/:studentId
GET /api/results/session/:sessionId

// Analytics
GET /api/analytics/exam/:examId
GET /api/analytics/performance/:studentId
GET /api/analytics/violations/:examId

// Export
GET /api/export/excel/:examId
GET /api/export/pdf/:sessionId
```

## 🧪 Testing

### Unit Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure

```typescript
// Example test structure
describe("Exam Portal", () => {
  describe("Exam Creation", () => {
    it("should create a new exam with valid data", async () => {
      const examData = {
        title: "Test Exam",
        duration: 60,
        sections: [
          /* ... */
        ],
      };

      const result = await createExam(examData);
      expect(result.success).toBe(true);
      expect(result.exam.id).toBeDefined();
    });

    it("should reject exam creation with invalid data", async () => {
      const invalidData = { title: "" };
      await expect(createExam(invalidData)).rejects.toThrow();
    });
  });

  describe("Proctoring System", () => {
    it("should detect tab switching violations", () => {
      const proctor = new AIProctor();
      proctor.start();

      // Simulate tab switch
      document.visibilityState = "hidden";
      document.dispatchEvent(new Event("visibilitychange"));

      expect(proctor.getViolations()).toContainEqual(
        expect.objectContaining({ type: "tab-switch" }),
      );
    });
  });
});
```

### E2E Testing

```typescript
// Playwright E2E tests
import { test, expect } from "@playwright/test";

test.describe("Exam Flow", () => {
  test("student can complete exam successfully", async ({ page }) => {
    await page.goto("/exam/exam-123/live");

    // Start exam
    await page.click('[data-testid="start-exam"]');

    // Answer questions
    await page.click('[data-testid="answer-option-0"]');
    await page.click('[data-testid="next-question"]');

    // Submit exam
    await page.click('[data-testid="submit-exam"]');

    // Verify results
    await expect(page.locator('[data-testid="exam-score"]')).toBeVisible();
  });

  test("proctoring detects violations", async ({ page }) => {
    await page.goto("/exam/exam-123/live");
    await page.click('[data-testid="start-exam"]');

    // Try to switch tabs (should be blocked)
    await page.evaluate(() => {
      window.open("https://google.com", "_blank");
    });

    // Verify violation is logged
    await expect(page.locator('[data-testid="violation-alert"]')).toBeVisible();
  });
});
```

## 🔧 Advanced Configuration

### Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/exam_portal"
DATABASE_POOL_SIZE="20"
DATABASE_TIMEOUT="30000"

# Redis Configuration (for caching and sessions)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your_redis_password"

# Authentication
NEXTAUTH_SECRET="your_super_secret_key_here"
NEXTAUTH_URL="http://localhost:3000"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
FROM_EMAIL="noreply@examportal.com"

# File Storage
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="exam-portal-uploads"

# Proctoring Settings
VIOLATION_COOLDOWN="30000"
MAX_VIOLATIONS_PER_EXAM="10"
WEBCAM_RECORDING_ENABLED="true"
SCREEN_RECORDING_ENABLED="true"

# Performance
NODE_ENV="production"
LOG_LEVEL="info"
ENABLE_METRICS="true"
RATE_LIMIT_WINDOW="900000"  # 15 minutes
RATE_LIMIT_MAX="100"

# Features
ENABLE_AI_PROCTORING="true"
ENABLE_SEB_INTEGRATION="true"
ENABLE_BULK_OPERATIONS="true"
ENABLE_ADVANCED_ANALYTICS="true"
```

### Database Schema

```sql
-- Core Tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  hod VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  duration INTEGER NOT NULL, -- minutes
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  max_attempts INTEGER DEFAULT 1,
  passing_marks INTEGER,
  total_marks INTEGER,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  options JSONB, -- for multiple choice questions
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  difficulty VARCHAR(20) DEFAULT 'medium',
  tags TEXT[],
  section VARCHAR(255),
  "order" INTEGER NOT NULL,
  has_negative_marking BOOLEAN DEFAULT false,
  negative_marks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id),
  student_id UUID REFERENCES users(id),
  answers JSONB NOT NULL DEFAULT '{}',
  section_progress JSONB NOT NULL DEFAULT '{}',
  time_spent JSONB NOT NULL DEFAULT '{}',
  total_time_spent INTEGER DEFAULT 0,
  violations JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'in-progress',
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_exam_sessions_exam_id ON exam_sessions(exam_id);
CREATE INDEX idx_exam_sessions_student_id ON exam_sessions(student_id);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_users_email ON users(email);
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Dialog Width Not Increasing

**Problem**: Dialog components don't respect custom width settings
**Solution**:

- Check `components/ui/dialog.tsx` for restrictive max-width classes
- Remove `sm:max-w-lg` and `max-w-[calc(100%-2rem)]` from base component
- Add custom width classes to specific dialog instances

#### 2. Progress Tracking Not Working

**Problem**: Section progress doesn't update when answering questions
**Solution**:

- Verify `answers` state is properly updated in QuestionCard component
- Check `getSectionProgress` function logic
- Ensure `sectionGroups` memo is correctly calculated
- Add debug logging to track state changes

#### 3. Academic Data Sorting Error

**Problem**: "Cannot assign to read only property" error
**Solution**:

- Create array copy before sorting: `[...array].sort()`
- Check if data comes from immutable Redux state
- Use `immer` or similar for immutable updates

#### 4. Sidebar Logo Not Centered

**Problem**: Logo appears off-center in expanded sidebar
**Solution**:

- Remove `min-w-0` constraint from logo container
- Add `w-full` to allow proper flex centering
- Check parent container flex properties

### Performance Issues

#### 1. Slow Exam Loading

**Solutions**:

- Implement lazy loading for questions
- Add pagination for large question sets
- Optimize Redux state updates
- Use React.memo for expensive components

#### 2. Memory Leaks in Live Exam

**Solutions**:

- Clean up event listeners in useEffect cleanup
- Remove unnecessary re-renders with useMemo/useCallback
- Clear intervals and timeouts properly
- Monitor component unmounting

### Debug Mode

Enable debug mode by setting environment variable:

```env
DEBUG_MODE=true
LOG_LEVEL=debug
```

This will enable:

- Detailed console logging
- Performance metrics
- State change tracking
- API request/response logging

## 🛠️ Development

### Code Style and Standards

#### TypeScript Configuration

- **Strict Mode**: Enabled for type safety
- **Path Aliases**: Clean import paths with `@/` prefix
- **ESLint**: Code quality and consistency checks

#### Component Patterns

- **Functional Components**: Modern React with hooks
- **Type Safety**: Full TypeScript integration
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Memoization and optimization patterns

### Performance Optimization

#### React Performance

```typescript
// Memoization Examples
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveCalculation(item));
  }, [data]);

  const handleClick = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);

  return <div>{/* component content */}</div>;
});

// Custom hooks for performance
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const QuestionList = ({ questions }) => (
  <List
    height={600}
    itemCount={questions.length}
    itemSize={80}
    itemData={questions}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <QuestionCard question={data[index]} />
      </div>
    )}
  </List>
);
```

#### State Management Optimization

```typescript
// Redux Toolkit with Immer
const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    // Using Immer for immutable updates
    updateAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
      state.lastModified = new Date().toISOString();
    },

    // Optimistic updates
    submitAnswerOptimistic: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
      state.submittingAnswers[questionId] = true;
    },

    // Batch updates
    batchUpdateAnswers: (state, action) => {
      Object.assign(state.answers, action.payload);
    },
  },
});

// Selectors with memoization
const selectSectionProgress = createSelector(
  [selectAnswers, selectQuestions],
  (answers, questions) => {
    return calculateSectionProgress(answers, questions);
  },
);
```

## 🔒 Security Best Practices

### Authentication & Authorization

```typescript
// JWT Token Management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";

  static setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static async refreshAccessToken(): Promise<string> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error("No refresh token");

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    this.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  }
}

// Role-based access control
const requireRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    if (!user || user.role !== requiredRole) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};
```

### Data Validation & Sanitization

```typescript
// Input validation with Zod
import { z } from "zod";

const ExamSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000),
  duration: z.number().min(1).max(480), // max 8 hours
  sections: z.array(SectionSchema).min(1),
  settings: ExamSettingsSchema,
});

// SQL Injection Prevention
const queryDatabase = async (query: string, params: any[]) => {
  // Using parameterized queries
  const result = await pool.query(query, params);
  return result.rows;
};

// XSS Prevention
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "strong", "em", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });
};
```

### Rate Limiting

```typescript
// Redis-based rate limiting
import Redis from "ioredis";

class RateLimiter {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async isAllowed(
    identifier: string,
    limit: number,
    windowMs: number,
  ): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, Math.ceil(windowMs / 1000));
    }

    return current <= limit;
  }
}

// Express middleware
const rateLimitMiddleware = (limit: number, windowMs: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.headers["x-forwarded-for"];
    const allowed = await rateLimiter.isAllowed(identifier, limit, windowMs);

    if (!allowed) {
      return res.status(429).json({ error: "Too many requests" });
    }

    next();
  };
};
```

## 📈 Monitoring & Analytics

### Performance Monitoring

```typescript
// Custom performance monitoring
class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(name: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    };
  }

  static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  static getMetrics(name: string): { avg: number; min: number; max: number } {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return { avg: 0, min: 0, max: 0 };

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max };
  }
}

// Usage in components
const ExamComponent = () => {
  useEffect(() => {
    const endTimer = PerformanceMonitor.startTimer("exam-render");

    return () => {
      endTimer();
      console.log(
        "Render metrics:",
        PerformanceMonitor.getMetrics("exam-render"),
      );
    };
  });
};
```

### Error Tracking

```typescript
// Global error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to external service
    this.logErrorToService(error, errorInfo);
  }

  async logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong.</h2>
          <p>We're working on fixing this issue.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Analytics Integration

```typescript
// Google Analytics 4 integration
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

export const analytics = {
  trackEvent: (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, parameters);
    }
  },

  trackPageView: (pagePath: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", {
        page_path: pagePath,
      });
    }
  },

  trackExamStart: (examId: string, examTitle: string) => {
    this.trackEvent("exam_start", {
      exam_id: examId,
      exam_title: examTitle,
    });
  },

  trackExamComplete: (examId: string, score: number, timeSpent: number) => {
    this.trackEvent("exam_complete", {
      exam_id: examId,
      score,
      time_spent: timeSpent,
    });
  },
};
```

## 🌐 Internationalization

### Multi-language Support

```typescript
// i18n configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      exam: {
        start: 'Start Exam',
        submit: 'Submit Exam',
        timeRemaining: 'Time Remaining',
        question: 'Question',
        next: 'Next',
        previous: 'Previous'
      }
    }
  },
  es: {
    translation: {
      exam: {
        start: 'Iniciar Examen',
        submit: 'Enviar Examen',
        timeRemaining: 'Tiempo Restante',
        question: 'Pregunta',
        next: 'Siguiente',
        previous: 'Anterior'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Usage in components
const ExamTimer = () => {
  const { t } = useTranslation();

  return (
    <div>
      <span>{t('exam.timeRemaining')}: {formatTime(timeLeft)}</span>
    </div>
  );
};
```

## 📚 Additional Resources

### Documentation Links

- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **React Documentation**: [https://react.dev](https://react.dev)
- **TypeScript Handbook**: [https://www.typescriptlang.org/docs](https://www.typescriptlang.org/docs)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Redux Toolkit**: [https://redux-toolkit.js.org](https://redux-toolkit.js.org)

### Recommended Tools

#### Development Tools

- **VS Code Extensions**:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter

#### Browser Extensions

- **React Developer Tools**
- **Redux DevTools**
- **Lighthouse**
- **Accessibility Insights for Web**

#### API Testing

- **Postman** or **Insomnia** for API testing
- **GraphQL Playground** (if using GraphQL)

### Learning Resources

#### Best Practices

- **React Performance**: [React Performance Guide](https://react.dev/learn/render-and-commit)
- **TypeScript Best Practices**: [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- **Accessibility**: [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

#### Security

- **OWASP Top 10**: [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- **JWT Best Practices**: [JWT Handbook](https://jwt.io/introduction)

---

## 🎯 Quick Start Checklist

### For New Developers

- [ ] Set up development environment
- [ ] Install all dependencies
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Start development server
- [ ] Review project structure
- [ ] Read through key components
- [ ] Understand data flow and state management
- [ ] Set up debugging tools

### For Deployment

- [ ] Configure production environment variables
- [ ] Set up database connection
- [ ] Configure Redis for caching
- [ ] Set up file storage (AWS S3)
- [ ] Configure email service
- [ ] Set up SSL certificates
- [ ] Configure monitoring and logging
- [ ] Run performance tests
- [ ] Set up backup procedures

---

**Built with ❤️ for educational institutions worldwide**

## 🚀 Deployment

### Production Build

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

### Deployment Platforms

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run type-check
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for educational institutions worldwide**
