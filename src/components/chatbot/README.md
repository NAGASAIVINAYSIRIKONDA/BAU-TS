# BAU/OKR Chatbot

A fully custom chatbot for the BAU/OKR management system that provides role-based responses and data fetching from Supabase.

## Features

- **Role-based responses**: Different behavior for Admin, HR, Team Lead, and Team Member roles
- **Real-time data fetching**: Fetches live data from Supabase database
- **No external AI dependencies**: Uses custom logic with if/else and switch statements
- **Rich UI**: Beautiful chat interface with data cards and statistics
- **Contextual responses**: Understands natural language queries
- **User-specific FAQs**: Shows personalized frequently asked questions
- **Global FAQs**: Provides common question suggestions

## Usage

The chatbot is automatically available throughout the application as a floating chat button in the bottom-right corner.

### Example Queries

#### Tasks & BAU
- "What are my tasks?"
- "Show me my assigned work"
- "What BAU tasks do I have?"

#### Templates & OKRs
- "Show me BAU templates"
- "What OKRs are available?"
- "List all templates"

#### Team & Check-ins
- "Show me team members"
- "What are the check-ins?"
- "HR check-in status"

#### Questionnaires
- "Show my questionnaire responses"
- "How do I complete the questionnaire?"
- "What questionnaires do I have?"

#### Statistics
- "Show me stats"
- "Give me an overview"
- "What's the progress?"

#### Departments (Admin/HR only)
- "List departments"
- "Show all teams"

## Role-based Permissions

### Admin
- Can view all data across all departments
- Full access to tasks, templates, check-ins, departments, team members, and questionnaires
- Can access questionnaire administration

### HR
- Can view data within their assigned department
- Access to team members, check-ins, department information, and questionnaires
- Cannot view other departments' data

### Team Lead
- Can view data within their assigned department
- Access to tasks, templates, team members, and questionnaires in their department
- Cannot view other departments' data

### Team Member
- Can only view their own assigned tasks
- Can view check-ins they're involved in
- Limited access to team member information
- Can access and complete questionnaires

## Technical Implementation

### Components
- `Chatbot.tsx`: Main chat interface component
- `chatbotService.ts`: Core logic for processing messages and fetching data
- `types.ts`: TypeScript interfaces for chat messages and responses
- `faqs.ts`: Global frequently asked questions

### Database Tables
- `user_question_stats`: Tracks user-specific question frequency
- `questionnaire_questions`: Stores predefined and custom questions
- `questionnaire_responses`: Stores user responses to questions

### Features
- **Personalized FAQs**: Each user sees their most frequently asked questions
- **Global FAQs**: Common questions available to all users
- **Question tracking**: Monitors which questions users ask most often
- **Role-based filtering**: Responses are filtered based on user role
- **Real-time updates**: Data is fetched live from the database 