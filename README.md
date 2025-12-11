# Student Orders Frontend

A web app for managing students and their orders. Built with Angular 20 and designed to be fully responsive.

## What's Inside

This is built with Angular 20.1 using the new standalone components and signals API. I'm using TypeScript 5.8 for type safety, RxJS for reactive programming, and SCSS for styling. The whole thing is pretty well tested with 139 unit tests.

## Getting Started

You'll need Node.js 18+ and npm 9+ installed. Make sure the backend is running on `http://localhost:8080` before starting the frontend.

```bash
npm install
npm start
```

The app will be available at `http://localhost:4200`.

Other useful commands:
- `npm build` - Production build
- `npm test` - Run all tests
- `npm run watch` - Build and watch for changes

## How It Works

The app has a two-column layout on desktop. On the left, you see all students displayed as cards. Click on a student to see their orders on the right side in a table format. You can add new students and create orders for them.

### Main Components

**Student List**
Shows all students in a scrollable grid. When you click a student, it highlights and shows their orders. There's a + button to add new students.

**Order List**
Displays orders for the selected student in a table. Shows the total amount, status (pending or paid), and when each order was created. There's also a grand total at the bottom.

**Forms**
Both student and order forms have validation. You can't create an order without selecting a student first. Student names, grades, and schools are required. Orders need a total amount (at least $0.01) and a status.

### Project Structure

```
src/app/
├── components/
│   ├── student-list/
│   ├── student-form/
│   ├── order-list/
│   ├── order-form/
│   └── add-button/
├── services/
│   ├── student.service.ts
│   └── order.service.ts
├── models/
│   ├── student.model.ts
│   └── order.model.ts
└── app.ts
```

## Data Models

Students have a name, grade, and school. Orders belong to a student and have a total amount and status (pending or paid).

```typescript
// Student
{
  id?: number;
  name: string;        // max 100 chars
  grade: string;       // max 20 chars
  school: string;      // max 150 chars
  createdAt?: string;
}

// Order
{
  id?: number;
  studentId: number;
  total: number;       // min $0.01
  status: 'pending' | 'paid';
  createdAt?: string;
}
```

## API Integration

The app talks to a REST API on `localhost:8080`:

- `GET /students` - Get all students
- `POST /students` - Create a new student
- `GET /orders?studentId={id}` - Get orders for a student
- `POST /orders` - Create a new order

## Responsive Design

The layout adapts to different screen sizes. On mobile/tablet (under 768px), the two columns stack vertically. I'm using CSS `clamp()` for dynamic font sizing, so everything scales smoothly.

The viewport is fixed at 100vh - no page scrolling. Instead, the student grid and order table scroll internally. This works better on devices with small heights like landscape phones.

Some breakpoints:
- Below 768px: Stacked layout
- Below 700px height: More compact spacing
- Below 500px height: Even more compact

## Testing

There are 139 tests covering all the services and components. They test things like HTTP calls, error handling, form validation, currency formatting, and user interactions.

```bash
npm test                                # Run tests in watch mode
npm test -- --browsers=ChromeHeadless   # Headless mode
```

## What's Missing

This is a pretty basic CRUD app right now. Here's what it doesn't have yet:

- No way to edit students or orders once created
- No delete functionality
- No search or filtering
- Everything loads at once (no pagination)
- No sorting options
- Single page app with no routing
- If you refresh the page, you lose the selected student
- Error messages show inline, no fancy toast notifications

## Ideas for Improvements

Some things that would make this better:

**Most Important:**
- Add edit and delete - basic CRUD stuff
- Search students by name or school
- Filter orders by status or date range
- Toast notifications so you know when things work
- Save the selected student in localStorage

**Would Be Nice:**
- Order overview page - see all orders from all students in one place
- Pagination for when there are lots of students
- Sorting (by name, date, amount, etc.)
- Proper routing with deep links
- A dashboard showing stats like total revenue
- ESLint for code quality and consistency

**If I Had More Time:**
- Export orders to CSV or PDF
- Offline support with service workers
- Better keyboard navigation

## Tech Notes

I'm using Angular's newest features - standalone components instead of NgModules, and signals for state management. The testing setup uses the new provider-based approach instead of the deprecated HttpClientTestingModule.

Prettier is configured for consistent code formatting, and TypeScript is running in strict mode.
