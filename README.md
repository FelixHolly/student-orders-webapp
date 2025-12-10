# Student Orders Management Application

A modern Angular application for managing students and their orders, built with Angular 20 and standalone components.

## Features

### Student Management
- View all students in an intuitive card layout
- Create new students with validated forms
- Real-time form validation with error messages
- Visual selection highlighting
- Loading states and error handling

### Order Management
- View orders for selected student in a table format
- Create new orders with status (pending/paid)
- Currency formatting ($25.50)
- Date formatting (Jan 15, 2024)
- Total amount calculation across all orders
- Status badges with color coding

### UI/UX Features
- Responsive two-column layout (desktop) / stacked (mobile)
- Beautiful gradient background
- Loading spinners during API calls
- Empty states with helpful messages
- Form validation with inline errors
- Disabled states when appropriate
- Hover effects and visual feedback
- Accessibility features (ARIA labels, keyboard navigation)

## Tech Stack

- **Angular 20** - Latest Angular with standalone components
- **TypeScript 5.8** - Type-safe development
- **RxJS 7.8** - Reactive programming
- **SCSS** - Advanced styling
- **HttpClient** - REST API integration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Backend API running on http://localhost:8080

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:4200
```

### Backend API

Ensure your backend API is running on `http://localhost:8080` with the following endpoints:

- `GET /students` - Get all students
- `POST /students` - Create a student
- `GET /orders?studentId={id}` - Get orders for a student
- `POST /orders` - Create an order

## Available Scripts

- `npm start` - Start development server (http://localhost:4200)
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run watch` - Build in watch mode

## Project Structure

```
src/app/
├── models/
│   ├── student.model.ts      # Student interface
│   └── order.model.ts        # Order interface
├── services/
│   ├── student.service.ts    # Student API service
│   └── order.service.ts      # Order API service
├── components/
│   ├── student-list/         # Student list component
│   ├── student-form/         # Student creation form
│   ├── order-list/           # Order list component
│   └── order-form/           # Order creation form
├── app.ts                    # Main app component
├── app.html                  # Main app template
├── app.scss                  # Main app styles
└── app.config.ts             # App configuration
```

## Form Validation

### Student Form
- **Name**: Required, max 100 characters
- **Grade**: Required, max 20 characters
- **School**: Required, max 150 characters

### Order Form
- **Total**: Required, minimum $0.01
- **Status**: Required (pending or paid)

## Responsive Design

- **Desktop (>768px)**: Two-column grid layout
- **Tablet (768px-1024px)**: Stacked layout
- **Mobile (<768px)**: Single column, optimized spacing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
