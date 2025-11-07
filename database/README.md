# FormD Database Schema

## Overview

This is a comprehensive, production-ready database schema for **FormD**, an AI-powered form builder SaaS platform. The schema is designed for PostgreSQL (via Supabase) with Prisma ORM, emphasizing scalability, security, and performance.

## Architecture

### Database: PostgreSQL (Supabase)

- **Extensions**: UUID generation, full-text search (pg_trgm), query monitoring
- **ORM**: Prisma for type-safe database access
- **Security**: Row Level Security (RLS) policies for multi-tenant data isolation

## Schema Design Principles

### 1. **Scalability**

- Properly indexed columns for fast queries
- JSONB for flexible, schema-less data (themes, settings, metadata)
- Composite indexes for common query patterns
- Full-text search indexes for user-facing search features
- Prepared for horizontal scaling with proper foreign key relationships

### 2. **Security**

- Row Level Security (RLS) enabled on all tables
- Firebase Authentication integration via `firebase_uid`
- Workspace-level isolation for multi-tenancy
- Encrypted sensitive data (passwords, integration configs)
- Audit trail via `activity_logs` table
- IP address tracking for security monitoring

### 3. **Performance**

- Strategic indexes on frequently queried columns
- Composite indexes for complex queries
- GIN indexes for JSONB and array columns
- Partial indexes for common WHERE conditions
- Automatic `updated_at` triggers
- Soft deletes with `deleted_at` column

### 4. **Data Integrity**

- Foreign key constraints with appropriate cascade rules
- NOT NULL constraints on required fields
- UNIQUE constraints for business logic
- CHECK constraints for data validation
- ENUM types for controlled vocabularies

## Core Tables

### Users & Authentication

- **users**: User accounts linked to Firebase Authentication
- **subscriptions**: Stripe subscription management
- **payment_transactions**: Payment history

### Workspaces & Collaboration

- **workspaces**: Team/organization workspaces
- **workspace_members**: Role-based access control (owner, admin, editor, viewer)

### Forms & Questions

- **forms**: Form definitions with settings, themes, and configurations
- **questions**: Individual questions with 25+ question types
- **form_folders**: Hierarchical organization of forms
- **form_folder_items**: Many-to-many relationship for folder contents

### Responses & Analytics

- **responses**: Form submissions with device/location tracking
- **answers**: Individual answers with AI analysis
- **analytics_events**: Granular event tracking for analytics

### Templates & AI

- **templates**: Reusable form templates (public and private)
- **template_ratings**: User ratings and reviews
- **ai_chat_logs**: AI assistant conversation history

### Integrations

- **integrations**: Third-party service connections (Slack, Notion, etc.)
- **webhooks**: Real-time webhook configurations
- **file_uploads**: Media and file storage metadata

### System

- **notifications**: User notifications
- **activity_logs**: Comprehensive audit trail

## Question Types

The schema supports 25+ question types:

**Text Input**

- `short_text`, `long_text`, `email`, `number`, `phone`

**Choice-Based**

- `multiple_choice`, `checkboxes`, `dropdown`, `ranking`, `image_choice`

**Rating**

- `star_rating`, `linear_scale`, `nps`, `emoji_rating`

**Date/Time**

- `date`, `time`, `datetime`

**Advanced**

- `file_upload`, `signature`, `matrix`, `payment`, `location`

**Layout**

- `section_heading`, `text_content`, `divider`

## AI Features

### Sentiment Analysis

- Automatic sentiment detection (positive, neutral, negative, mixed)
- Sentiment scoring (0-100)
- Theme extraction from text responses
- Auto-categorization

### AI Insights

- Response quality scoring
- Automated summarization
- Trend detection
- Anomaly flagging

## Row Level Security (RLS)

All tables have RLS policies ensuring:

1. **Workspace Isolation**: Users can only access data from their workspaces
2. **Role-Based Permissions**: Actions restricted by workspace role
3. **Public Form Access**: Published forms are publicly accessible
4. **Response Privacy**: Respondents can only see their own responses
5. **Owner-Only Actions**: Critical operations restricted to workspace owners

## Indexes & Performance

### Strategic Indexing

- Primary keys (UUID) on all tables
- Foreign keys for relationship navigation
- Timestamp columns for sorting and filtering
- Status/enum columns for filtering
- Composite indexes for complex queries

### Full-Text Search

- Forms: searchable by title and description
- Templates: searchable by title, description, and category
- Answers: searchable text responses

### JSON Indexes

- GIN indexes on JSONB columns for fast JSON queries
- Array indexes for tags and themes

## Data Relationships

```
User
├── Workspaces (owner)
├── Workspace Members
├── Forms (creator)
├── Templates (creator)
├── AI Chat Logs
├── Responses (as authenticated respondent)
└── Subscription

Workspace
├── Members (with roles)
├── Forms
├── Integrations
├── Webhooks
└── Folders

Form
├── Questions
├── Responses
│   └── Answers
├── Analytics Events
├── Integrations
└── Webhooks

Template
├── Ratings
└── Creator (User)
```

## Soft Deletes

Tables with `deleted_at` column support soft deletion:

- `users`
- `workspaces`
- `forms`

Benefits:

- Data recovery capability
- Audit trail preservation
- Referential integrity maintenance

## JSONB Fields

Flexible schema-less storage for:

### Form Settings

```json
{
  "notifications": {
    "email": true,
    "slack": false
  },
  "styling": {
    "customCSS": "..."
  },
  "seo": {
    "og_image": "..."
  }
}
```

### Question Options

```json
{
  "choices": [
    { "id": "1", "label": "Option 1", "value": "opt1" },
    { "id": "2", "label": "Option 2", "value": "opt2" }
  ],
  "randomize": true,
  "allowOther": true
}
```

### Answer JSON (for complex answers)

```json
{
  "selectedOptions": ["opt1", "opt3"],
  "otherText": "Custom response"
}
```

## Usage Limits by Plan

Enforced at application level, tracked in `subscriptions` table:

| Feature         | Free  | Pro      | Business | Enterprise |
| --------------- | ----- | -------- | -------- | ---------- |
| Forms           | 3     | 50       | 200      | Unlimited  |
| Responses/month | 100   | 10,000   | 100,000  | Unlimited  |
| Storage         | 100MB | 10GB     | 100GB    | Custom     |
| AI Analysis     | Basic | Advanced | Advanced | Custom     |
| Team Members    | 1     | 5        | 25       | Unlimited  |

## Setup Instructions

### 1. Create Database

```bash
# Using Supabase CLI
supabase init
supabase start
```

### 2. Run Schema

```bash
# Apply main schema
psql -U postgres -d formd -f database/schema.sql

# Apply RLS policies
psql -U postgres -d formd -f database/rls-policies.sql
```

### 3. Setup Prisma

```bash
# Install Prisma
npm install @prisma/client
npm install -D prisma

# Generate Prisma Client
npx prisma generate

# Optional: Introspect existing database
npx prisma db pull

# Optional: Push schema to database
npx prisma db push
```

### 4. Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/formd"
DIRECT_URL="postgresql://user:password@host:5432/formd" # For Prisma Migrate
```

## Migrations

### Using Prisma Migrate

```bash
# Create a new migration
npx prisma migrate dev --name init

# Apply migrations to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

## Monitoring & Optimization

### Query Performance

```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Index Usage

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

### Table Sizes

```sql
-- View table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Best Practices

### Query Optimization

1. Use Prisma's type-safe queries
2. Select only needed fields
3. Use `include` judiciously
4. Implement pagination for large datasets
5. Use database connection pooling

### Security

1. Never expose database credentials
2. Use Prisma Client in server-side code only
3. Validate all user input
4. Implement rate limiting
5. Regular security audits

### Data Integrity

1. Use transactions for multi-step operations
2. Implement optimistic locking for concurrent updates
3. Regular backups
4. Test RLS policies thoroughly

## Support & Maintenance

### Backup Strategy

- **Continuous**: Point-in-time recovery (Supabase automatic)
- **Daily**: Full database backup
- **Weekly**: Long-term storage backup

### Monitoring

- Query performance
- Connection pool utilization
- Storage growth
- RLS policy violations
- Failed authentication attempts

## Future Enhancements

- [ ] Time-series partitioning for `analytics_events`
- [ ] Read replicas for analytics queries
- [ ] Materialized views for dashboard statistics
- [ ] Database-level encryption for sensitive fields
- [ ] Advanced search with Elasticsearch integration
- [ ] GraphQL API via Hasura or Postgraphile

## License

Proprietary - FormD Database Schema
© 2024 FormD. All rights reserved.
