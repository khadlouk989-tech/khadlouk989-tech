# SmartGym Backend

Backend API for the SmartGym website built with Node.js, Express.js, PostgreSQL, Prisma, JWT authentication and secure middleware.

## Installation

1. Copy `.env.example` to `.env`
2. Set your `DATABASE_URL`, `JWT_SECRET` and `PORT`
3. Run `npm install`
4. Run `npx prisma generate`
5. Run `npx prisma migrate dev --name init`
6. Run `npm run prisma:seed`
7. Start the development server with `npm run dev`

## Available Scripts

- `npm install`
- `npm run dev`
- `npm start`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `PUT /api/auth/profile/password`

### Members
- `GET /api/members`
- `GET /api/members/:id`
- `POST /api/members`
- `PUT /api/members/:id`
- `DELETE /api/members/:id`

### Coaches
- `GET /api/coaches`
- `GET /api/coaches/:id`
- `POST /api/coaches`
- `PUT /api/coaches/:id`
- `DELETE /api/coaches/:id`

### Activities
- `GET /api/activities`
- `GET /api/activities/:id`
- `POST /api/activities`
- `PUT /api/activities/:id`
- `DELETE /api/activities/:id`

### Courses
- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`

### Reservations
- `GET /api/reservations`
- `GET /api/reservations/:id`
- `POST /api/reservations`
- `PUT /api/reservations/:id/cancel`

### Payments
- `GET /api/payments`
- `GET /api/payments/:id`
- `POST /api/payments`
- `PUT /api/payments/:id`
- `DELETE /api/payments/:id`

### Subscriptions
- `GET /api/subscriptions`
- `GET /api/subscriptions/:id`
- `POST /api/subscriptions`
- `PUT /api/subscriptions/:id`
- `DELETE /api/subscriptions/:id`

### Gallery
- `GET /api/gallery`
- `GET /api/gallery/:id`
- `POST /api/gallery`
- `PUT /api/gallery/:id`
- `DELETE /api/gallery/:id`

### News
- `GET /api/news`
- `GET /api/news/:id`
- `POST /api/news`
- `PUT /api/news/:id`
- `DELETE /api/news/:id`

### Testimonials
- `POST /api/testimonials`
- `GET /api/testimonials`
- `GET /api/testimonials/:id`
- `PUT /api/testimonials/:id`
- `PUT /api/testimonials/:id/approve`
- `DELETE /api/testimonials/:id`

### Contacts
- `POST /api/contacts`

### Stats
- `GET /api/stats`

## Notes

- Uploads are stored in `uploads/` and served statically from `/uploads`
- Use the `Authorization: Bearer <token>` header for protected routes
- Passwords are hashed with bcrypt
- JWT tokens are signed with `JWT_SECRET`
