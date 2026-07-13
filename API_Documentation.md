# API Documentation

## Base URL
- Global prefix: `/api/cg`
- Super admin prefix: `/api/cg/superadmin/t1`
- Health check: `GET /`

## Authentication

### Register user
- `POST /api/cg/auth/register`
- Auth: none
- Body (RegisterDto):
  - `firstName` (string)
  - `lastName` (string)
  - `email` (string)
  - `password` (string)
  - `role` (`student` | `teacher`)
  - `phone` (string)
  - `gender` (`male` | `female` | `other`)

Example:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "password": "Str0ngP@ssword!",
  "role": "student",
  "phone": "+9779812345678",
  "gender": "female"
}
```

### Login user
- `POST /api/cg/auth/login`
- Auth: none
- Body (LoginDto):
  - `email` (string)
  - `password` (string)

Example:
```json
{
  "email": "jane.doe@example.com",
  "password": "Str0ngP@ssword!"
}
```

### Refresh token
- `POST /api/cg/auth/refresh-token`
- Auth: none
- Body (RefreshTokenDto):
  - `refreshToken` (JWT string)

Example:
```json
{
  "refreshToken": "<your-refresh-jwt-token>"
}
```

### Logout
- `POST /api/cg/auth/logout`
- Auth: yes (JWT)
- Body: none

### Get profile
- `GET /api/cg/auth/profile`
- Auth: yes (JWT)

## Super Admin

### Super admin login
- `POST /api/cg/superadmin/t1/login`
- Auth: none
- Body (SuperAdminLoginDto):
  - `email` (string)
  - `password` (string)
  - `secretKey` (string)

Example:
```json
{
  "email": "example@gmail.com",
  "password": "Example@123",
  "secretKey": "secrete@123"
}
```

## Admin

### Dashboard
- `GET /api/cg/admin/dashboard`
- Auth: yes (JWT)
- Role: `ADMIN`

### List users
- `GET /api/cg/admin/users`
- Auth: yes (JWT)
- Role: `ADMIN`

### Update user status
- `PUT /api/cg/admin/users/:userId/status`
- Auth: yes (JWT)
- Role: `ADMIN`
- Body:
  - `status` (string)

Example:
```json
{ "status": "active" }
```

## Users

### Upload avatar
- `POST /api/cg/users/avatar`
- Auth: yes (JWT)
- Body: multipart/form-data with `file`
- Response:
```json
{ "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg" }
```

## Teachers

### Create or update teacher profile
- `POST /api/cg/teachers/profile`
- Auth: yes (JWT)
- Body (CreateTeacherProfileDto):
  - `subjects` (string[])
  - `education` (string[])
  - `experience` (string[])
  - `availability` (string[])
  - `hourlyRate` (number)
  - `bio` (string)

Example:
```json
{
  "subjects": ["Math", "Physics"],
  "education": ["BSc Mathematics"],
  "experience": ["3 years teaching"],
  "availability": ["Mon-Fri 6-9pm"],
  "hourlyRate": 20,
  "bio": "Enthusiastic math teacher"
}
```

### Get teacher profile
- `GET /api/cg/teachers/profile/:userId`
- Auth: no

### Search teachers
- `GET /api/cg/teachers`
- Auth: no
- Query params:
  - `subject` (optional)
  - `page` (optional)
  - `limit` (optional)

## Students

### Create or update student profile
- `POST /api/cg/students/profile`
- Auth: yes (JWT)
- Body (CreateStudentProfileDto):
  - `preferredSubjects` (string[])
  - `learningGoals` (string[])
  - `interests` (string[])
  - `bio` (string)

### Get student profile
- `GET /api/cg/students/profile/:userId`
- Auth: no

## Packages

### Create package
- `POST /api/cg/packages`
- Auth: yes (JWT)
- Body (CreatePackageDto):
  - `name` (string)
  - `description` (string)
  - `price` (number)
  - `durationInHours` (optional number)
  - `sessions` (optional number)
  - `isActive` (optional boolean)

Example:
```json
{
  "name": "Starter Pack",
  "description": "Five sessions of 1 hour each",
  "price": 120,
  "durationInHours": 5,
  "sessions": 5,
  "isActive": true
}
```

### Get packages for teacher
- `GET /api/cg/packages/teacher/:teacherId`
- Auth: no

### Get package details
- `GET /api/cg/packages/:packageId`
- Auth: no

## Bookings

### Create booking
- `POST /api/cg/bookings`
- Auth: yes (JWT)
- Body (CreateBookingDto):
  - `teacherId` (string)
  - `subject` (string)
  - `hourlyRate` (optional number)
  - `notes` (optional string)

Example:
```json
{
  "teacherId": "6412f9...",
  "subject": "Mathematics",
  "hourlyRate": 15,
  "notes": "Prefer evenings"
}
```

### Get bookings for current user
- `GET /api/cg/bookings`
- Auth: yes (JWT)

### Update booking status
- `PUT /api/cg/bookings/:bookingId/status`
- Auth: yes (JWT)
- Body (UpdateBookingStatusDto):
  - `status` (enum)

Example:
```json
{ "status": "accepted" }
```

## Chat

### Send message
- `POST /api/cg/chat/messages`
- Auth: yes (JWT)
- Body (CreateMessageDto):
  - `recipientId` (string)
  - `content` (string)

Example:
```json
{
  "recipientId": "6412f9...",
  "content": "Hi, are you available tomorrow?"
}
```

### Get conversations
- `GET /api/cg/chat/conversations`
- Auth: yes (JWT)

### Get messages for a conversation
- `GET /api/cg/chat/messages/:conversationId`
- Auth: yes (JWT)

## Payments

### Create payment
- `POST /api/cg/payments`
- Auth: yes (JWT)
- Body (CreatePaymentDto):
  - `packageId` (string)
  - `amount` (number)
  - `transactionId` (optional string)

Example:
```json
{
  "packageId": "6412f9...",
  "amount": 120,
  "transactionId": "txn_12345"
}
```

### Get payments for current user
- `GET /api/cg/payments`
- Auth: yes (JWT)

### Update payment status
- `PUT /api/cg/payments/:paymentId/status`
- Auth: yes (JWT)
- Body:
  - `status` (string)

Example:
```json
{ "status": "completed" }
```

## KYC

### Submit KYC
- `POST /api/cg/kyc`
- Auth: yes (JWT)
- Body (SubmitKycDto):
  - `documentType` (string)
  - `documentUrl` (string)

Example:
```json
{
  "documentType": "passport",
  "documentUrl": "https://res.cloudinary.com/.../kyc-doc.jpg"
}
```

### Upload KYC document
- `POST /api/cg/kyc/upload`
- Auth: yes (JWT)
- Body: multipart/form-data with `file`
- Response:
```json
{ "documentUrl": "https://res.cloudinary.com/.../kyc-doc.jpg" }
```

### Get current user's KYC
- `GET /api/cg/kyc`
- Auth: yes (JWT)

### Get all KYC records (admin)
- `GET /api/cg/kyc/admin`
- Auth: yes (JWT)

### Review KYC
- `PUT /api/cg/kyc/:kycId/review`
- Auth: yes (JWT)
- Body (ReviewKycDto):
  - `status` (string)
  - `adminNote` (string)

Example:
```json
{
  "status": "approved",
  "adminNote": "Verified"
}
```

## UI Feature Mapping

These backend endpoints support the teacher dashboard and related UI screens:

- Dashboard / home data: `GET /api/cg/auth/profile` and data from teacher profile, bookings, payments, packages, chat.
- My Students: `GET /api/cg/bookings` plus `GET /api/cg/students/profile/:userId` for student details.
- My Packages: `GET /api/cg/packages/teacher/:teacherId`
- Requests: `GET /api/cg/bookings`
- Earnings: `GET /api/cg/payments`
- Schedule: `GET /api/cg/bookings`
- Messages: `GET /api/cg/chat/conversations` and `GET /api/cg/chat/messages/:conversationId`
- Profile: `GET /api/cg/teachers/profile/:userId` and `POST /api/cg/teachers/profile`
- Notifications: backend does not expose a dedicated notification endpoint in the current source.

## Notes

- All protected endpoints require `Authorization: Bearer <token>`.
- File uploads must use `multipart/form-data` with the field name `file`.
- The current backend has no dedicated `/teacher/dashboard` or `/teacher/my-student` path; UI features are mapped to the above REST endpoints.
  "price": 50,
  "durationInHours": 5,
  "sessions": 5,
  "isActive": true
}
```

- GET /api/cg/packages/teacher/:teacherId

- GET /api/cg/packages/:packageId


User END


Admin

- GET /api/cg/admin/dashboard
  - Auth: yes (JWT + Roles.ADMIN)

- GET /api/cg/admin/users
  - Auth: yes (JWT + Roles.ADMIN)

- PUT /api/cg/admin/users/:userId/status
  - Auth: yes (JWT + Roles.ADMIN)
  - Body example:

```json
{ "status": "active" }
```

Payments

- POST /api/cg/payments
  - Auth: yes (JWT)
  - Body example (CreatePaymentDto):

```json
{
  "packageId": "648a1f...",
  "amount": 50,
  "transactionId": "txn_123456"
}
```

- GET /api/cg/payments
  - Auth: yes (JWT)

- PUT /api/cg/payments/:paymentId/status
  - Auth: yes (JWT)
  - Body example:

```json
{ "status": "completed" }
```

Students

- POST /api/cg/students/profile
  - Auth: yes (JWT)
  - Body example (CreateStudentProfileDto):

```json
{
  "preferredSubjects": ["Math"],
  "learningGoals": ["Improve algebra"],
  "interests": ["Robotics"],
  "bio": "High school student"
}
```

- GET /api/cg/students/profile/:userId

Notes

- Authentication: endpoints using `JwtAuthGuard` require `Authorization: Bearer <token>` header.
- File uploads use `multipart/form-data` with `file` field and are handled via Cloudinary in the codebase.
- DTO names reference files under `src/modules/*/dto` — consult the DTOs for exact schemas.
