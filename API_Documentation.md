# API Documentation

## 1. Base URL

- Global prefix: `/api/cg`
- Super admin prefix: `/api/cg/superadmin/t1`
- Health check: `GET /`
- Protected endpoints require `Authorization: Bearer <token>`
- Upload endpoints use `multipart/form-data` with the field `file`

---

## 2. Authentication and Account

| Method | Path                               | Auth | Role                   | Summary                           |
| ------ | ---------------------------------- | ---: | ---------------------- | --------------------------------- |
| POST   | `/api/cg/auth/register`            |   No | Public                 | Register a new student or teacher |
| POST   | `/api/cg/auth/login`               |   No | Public                 | Login and get JWT                 |
| POST   | `/api/cg/auth/refresh-token`       |   No | Public                 | Refresh access token              |
| POST   | `/api/cg/auth/logout`              |  Yes | Any authenticated user | Logout current session            |
| GET    | `/api/cg/auth/profile`             |  Yes | Any authenticated user | Get authenticated user profile    |
| POST   | `/api/cg/auth/forgot-password`     |   No | Public                 | Request password reset            |
| POST   | `/api/cg/auth/reset-password`      |   No | Public                 | Reset password with token         |
| PATCH  | `/api/cg/auth/change-password`     |  Yes | Any authenticated user | Change password                   |
| POST   | `/api/cg/auth/verify-email`        |  Yes | Any authenticated user | Verify email                      |
| POST   | `/api/cg/auth/resend-verification` |  Yes | Any authenticated user | Resend verification email         |

### Example: Register

Request:

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

Response:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "64...",
    "email": "jane.doe@example.com",
    "role": "student"
  }
}
```

### Example: Login

Request:

```json
{
  "email": "jane.doe@example.com",
  "password": "Str0ngP@ssword!"
}
```

Response:

```json
{
  "accessToken": "<jwt-access-token>",
  "refreshToken": "<jwt-refresh-token>",
  "user": {
    "id": "64...",
    "email": "jane.doe@example.com",
    "role": "student"
  }
}
```

---

## 3. Super Admin

| Method | Path                          | Auth | Role   | Summary           |
| ------ | ----------------------------- | ---: | ------ | ----------------- |
| POST   | `/api/cg/superadmin/t1/login` |   No | Public | Super admin login |

### Example: Super admin login

Request:

```json
{
  "email": "example@gmail.com",
  "password": "Example@123",
  "secretKey": "secrete@123"
}
```

Response:

```json
{
  "accessToken": "<super-admin-token>"
}
```

---

## 4. Admin

| Method | Path                                 | Auth | Role  | Summary                  |
| ------ | ------------------------------------ | ---: | ----- | ------------------------ |
| GET    | `/api/cg/admin/dashboard`            |  Yes | ADMIN | Admin dashboard overview |
| GET    | `/api/cg/admin/users`                |  Yes | ADMIN | List users               |
| PUT    | `/api/cg/admin/users/:userId/status` |  Yes | ADMIN | Update user status       |

### Example: Update user status

Request:

```json
{
  "status": "active"
}
```

Response:

```json
{
  "message": "User status updated successfully"
}
```

---

## 5. Users

| Method | Path                     | Auth | Role                   | Summary                     |
| ------ | ------------------------ | ---: | ---------------------- | --------------------------- |
| GET    | `/api/cg/users/profile`  |  Yes | Any authenticated user | Get current user profile    |
| PATCH  | `/api/cg/users/profile`  |  Yes | Any authenticated user | Update current user profile |
| DELETE | `/api/cg/users/account`  |  Yes | Any authenticated user | Delete account              |
| GET    | `/api/cg/users/settings` |  Yes | Any authenticated user | Get user settings           |
| PATCH  | `/api/cg/users/settings` |  Yes | Any authenticated user | Update user settings        |
| POST   | `/api/cg/users/avatar`   |  Yes | Any authenticated user | Upload avatar               |

### Example: Upload avatar

Request:

```http
POST /api/cg/users/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

Form field:

- `file`: image file

Response:

```json
{
  "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg"
}
```

---

## 6. Teachers

| Method | Path                               | Auth | Role          | Summary                          |
| ------ | ---------------------------------- | ---: | ------------- | -------------------------------- |
| GET    | `/api/cg/teachers`                 |   No | Public        | List teachers                    |
| POST   | `/api/cg/teachers/profile`         |  Yes | Authenticated | Create or update teacher profile |
| PATCH  | `/api/cg/teachers/profile`         |  Yes | Authenticated | Patch teacher profile            |
| PATCH  | `/api/cg/teachers/availability`    |  Yes | Authenticated | Update availability              |
| GET    | `/api/cg/teachers/me`              |  Yes | Authenticated | Get current teacher profile      |
| GET    | `/api/cg/teachers/dashboard`       |  Yes | Authenticated | Get teacher dashboard summary    |
| GET    | `/api/cg/teachers/students`        |  Yes | Authenticated | List teacher's students          |
| GET    | `/api/cg/teachers/reviews`         |  Yes | Authenticated | List teacher reviews             |
| GET    | `/api/cg/teachers/profile/:userId` |   No | Public        | View teacher public profile      |

### Example: Create teacher profile

Request:

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

Response:

```json
{
  "message": "Teacher profile created successfully",
  "profile": {
    "subjects": ["Math", "Physics"],
    "hourlyRate": 20
  }
}
```

---

## 7. Students

| Method | Path                               | Auth | Role          | Summary                          |
| ------ | ---------------------------------- | ---: | ------------- | -------------------------------- |
| POST   | `/api/cg/students/profile`         |  Yes | Authenticated | Create or update student profile |
| PATCH  | `/api/cg/students/profile`         |  Yes | Authenticated | Patch student profile            |
| GET    | `/api/cg/students/me`              |  Yes | Authenticated | Get current student profile      |
| GET    | `/api/cg/students/dashboard`       |  Yes | Authenticated | Get student dashboard summary    |
| GET    | `/api/cg/students/profile/:userId` |   No | Public        | View student public profile      |

### Example: Student profile payload

Request:

```json
{
  "preferredSubjects": ["Math"],
  "learningGoals": ["Exam preparation"],
  "interests": ["Problem solving"],
  "bio": "Interested in mathematics and coding"
}
```

---

## 8. Search

| Method | Path                             | Auth | Role          | Summary                                  |
| ------ | -------------------------------- | ---: | ------------- | ---------------------------------------- |
| GET    | `/api/cg/search?q=`              |  Yes | Authenticated | Global search using BM25-style ranking   |
| GET    | `/api/cg/search/teachers`        |  Yes | Authenticated | Search teachers with BM25-style ranking  |
| GET    | `/api/cg/search/packages`        |  Yes | Authenticated | Search packages                          |
| GET    | `/api/cg/search/recommendations` |  Yes | Authenticated | Get personalized teacher recommendations |

### Example: Search teachers

Request:

```http
GET /api/cg/search/teachers?subject=math&minPrice=10&maxPrice=30&rating=4&page=1&limit=10
Authorization: Bearer <token>
```

Response:

```json
{
  "items": [
    {
      "profile": {
        "userId": "64...",
        "subjects": ["Math"],
        "hourlyRate": 20,
        "rating": 4.8
      },
      "user": {
        "firstName": "Aarav",
        "lastName": "Sharma"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

## 9. Packages

| Method | Path                                  | Auth | Role          | Summary                        |
| ------ | ------------------------------------- | ---: | ------------- | ------------------------------ |
| GET    | `/api/cg/packages`                    |   No | Public        | List all packages              |
| POST   | `/api/cg/packages`                    |  Yes | Authenticated | Create a package               |
| GET    | `/api/cg/packages/me`                 |  Yes | Authenticated | Get current teacher's packages |
| GET    | `/api/cg/packages/teacher/:teacherId` |   No | Public        | Get teacher's public packages  |
| GET    | `/api/cg/packages/:packageId`         |   No | Public        | Get package details            |
| PATCH  | `/api/cg/packages/:packageId`         |  Yes | Authenticated | Update package                 |
| DELETE | `/api/cg/packages/:packageId`         |  Yes | Authenticated | Delete package                 |

### Example: Create package

Request:

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

Response:

```json
{
  "message": "Package created successfully",
  "package": {
    "name": "Starter Pack",
    "price": 120
  }
}
```

---

## 10. Bookings

| Method | Path                                 | Auth | Role          | Summary                       |
| ------ | ------------------------------------ | ---: | ------------- | ----------------------------- |
| POST   | `/api/cg/bookings`                   |  Yes | Authenticated | Create booking                |
| GET    | `/api/cg/bookings`                   |  Yes | Authenticated | Get bookings for current user |
| PUT    | `/api/cg/bookings/:bookingId/status` |  Yes | Authenticated | Update booking status         |

### Example: Create booking

Request:

```json
{
  "teacherId": "6412f9...",
  "subject": "Mathematics",
  "hourlyRate": 15,
  "notes": "Prefer evenings"
}
```

Response:

```json
{
  "message": "Booking created successfully",
  "booking": {
    "teacherId": "6412f9...",
    "subject": "Mathematics",
    "status": "pending"
  }
}
```

---

## 11. Chat

| Method | Path                                    | Auth | Role          | Summary                         |
| ------ | --------------------------------------- | ---: | ------------- | ------------------------------- |
| POST   | `/api/cg/chat/messages`                 |  Yes | Authenticated | Send a message                  |
| GET    | `/api/cg/chat/conversations`            |  Yes | Authenticated | Get conversations               |
| GET    | `/api/cg/chat/messages/:conversationId` |  Yes | Authenticated | Get messages for a conversation |

### Example: Send message

Request:

```json
{
  "recipientId": "6412f9...",
  "content": "Hi, are you available tomorrow?"
}
```

Response:

```json
{
  "message": "Message sent successfully"
}
```

---

## 12. Payments

| Method | Path                                 | Auth | Role          | Summary                       |
| ------ | ------------------------------------ | ---: | ------------- | ----------------------------- |
| POST   | `/api/cg/payments`                   |  Yes | Authenticated | Create payment                |
| GET    | `/api/cg/payments`                   |  Yes | Authenticated | Get payments for current user |
| PUT    | `/api/cg/payments/:paymentId/status` |  Yes | Authenticated | Update payment status         |

### Example: Create payment

Request:

```json
{
  "teacherId": "6412f9...",
  "packageId": "6412f9...",
  "amount": 120,
  "transactionId": "txn_12345"
}
```

Response:

```json
{
  "message": "Payment created successfully",
  "payment": {
    "amount": 120,
    "status": "pending"
  }
}
```

---

## 13. Analytics

| Method | Path                        | Auth | Role          | Summary                     |
| ------ | --------------------------- | ---: | ------------- | --------------------------- |
| GET    | `/api/cg/analytics/student` |  Yes | Authenticated | Student dashboard analytics |
| GET    | `/api/cg/analytics/teacher` |  Yes | Authenticated | Teacher dashboard analytics |
| GET    | `/api/cg/analytics/admin`   |  Yes | ADMIN         | Admin analytics summary     |

---

## 14. KYC

| Method | Path                        | Auth | Role          | Summary                |
| ------ | --------------------------- | ---: | ------------- | ---------------------- |
| POST   | `/api/cg/kyc`               |  Yes | Authenticated | Submit KYC             |
| POST   | `/api/cg/kyc/upload`        |  Yes | Authenticated | Upload KYC document    |
| GET    | `/api/cg/kyc`               |  Yes | Authenticated | Get current user's KYC |
| GET    | `/api/cg/kyc/admin`         |  Yes | ADMIN         | Get all KYC records    |
| PUT    | `/api/cg/kyc/:kycId/review` |  Yes | ADMIN         | Review KYC             |

### Example: Submit KYC

Request:

```json
{
  "documentType": "passport",
  "documentUrl": "https://res.cloudinary.com/.../kyc-doc.jpg"
}
```

Response:

```json
{
  "message": "KYC submitted successfully"
}
```

---

## 15. Categories and Subjects

| Module     | Method | Path                             | Auth | Role                   | Summary            |
| ---------- | ------ | -------------------------------- | ---: | ---------------------- | ------------------ |
| Categories | POST   | `/api/cg/categories`             |  Yes | ADMIN                  | Create category    |
| Categories | GET    | `/api/cg/categories`             |  Yes | Any authenticated user | List categories    |
| Categories | GET    | `/api/cg/categories/:categoryId` |  Yes | Any authenticated user | Get category by id |
| Categories | PATCH  | `/api/cg/categories/:categoryId` |  Yes | ADMIN                  | Update category    |
| Categories | DELETE | `/api/cg/categories/:categoryId` |  Yes | ADMIN                  | Delete category    |
| Subjects   | POST   | `/api/cg/subjects`               |  Yes | ADMIN                  | Create subject     |
| Subjects   | GET    | `/api/cg/subjects`               |  Yes | Any authenticated user | List subjects      |
| Subjects   | GET    | `/api/cg/subjects/:subjectId`    |  Yes | Any authenticated user | Get subject by id  |
| Subjects   | PATCH  | `/api/cg/subjects/:subjectId`    |  Yes | ADMIN                  | Update subject     |
| Subjects   | DELETE | `/api/cg/subjects/:subjectId`    |  Yes | ADMIN                  | Delete subject     |

---

## 16. Notifications

| Method | Path                                         | Auth | Role                   | Summary             |
| ------ | -------------------------------------------- | ---: | ---------------------- | ------------------- |
| GET    | `/api/cg/notifications`                      |  Yes | Any authenticated user | Get notifications   |
| GET    | `/api/cg/notifications/unread-count`         |  Yes | Any authenticated user | Get unread count    |
| PATCH  | `/api/cg/notifications/:notificationId/read` |  Yes | Any authenticated user | Mark one as read    |
| PATCH  | `/api/cg/notifications/read-all`             |  Yes | Any authenticated user | Mark all as read    |
| DELETE | `/api/cg/notifications/:notificationId`      |  Yes | Any authenticated user | Delete notification |

---

## 17. Sessions

| Method | Path                                 | Auth | Role          | Summary                           |
| ------ | ------------------------------------ | ---: | ------------- | --------------------------------- |
| POST   | `/api/cg/sessions`                   |  Yes | Authenticated | Create session                    |
| GET    | `/api/cg/sessions`                   |  Yes | Authenticated | Get all sessions for current user |
| GET    | `/api/cg/sessions/student`           |  Yes | Authenticated | Get student sessions              |
| GET    | `/api/cg/sessions/teacher`           |  Yes | Authenticated | Get teacher sessions              |
| PATCH  | `/api/cg/sessions/:sessionId/start`  |  Yes | Authenticated | Start session                     |
| PATCH  | `/api/cg/sessions/:sessionId/end`    |  Yes | Authenticated | End session                       |
| PATCH  | `/api/cg/sessions/:sessionId/cancel` |  Yes | Authenticated | Cancel session                    |

---

## 18. Reviews

| Method | Path                                 | Auth | Role          | Summary                      |
| ------ | ------------------------------------ | ---: | ------------- | ---------------------------- |
| POST   | `/api/cg/reviews`                    |  Yes | Authenticated | Create review                |
| GET    | `/api/cg/reviews`                    |  Yes | Authenticated | Get reviews for current user |
| GET    | `/api/cg/reviews/teacher/:teacherId` |  Yes | Authenticated | Get teacher reviews          |
| PATCH  | `/api/cg/reviews/:reviewId`          |  Yes | Authenticated | Update review                |
| DELETE | `/api/cg/reviews/:reviewId`          |  Yes | Authenticated | Delete review                |

### Example: Create review

Request:

```json
{
  "teacherId": "6412f9...",
  "rating": 5,
  "comment": "Excellent teaching"
}
```

Response:

```json
{
  "message": "Review created successfully"
}
```

---

## 19. UI Mapping

These backend endpoints support the main dashboard and profile flows:

- Teacher dashboard: `GET /api/cg/teachers/dashboard` + `GET /api/cg/analytics/teacher`
- Student dashboard: `GET /api/cg/students/dashboard` + `GET /api/cg/analytics/student`
- Admin overview: `GET /api/cg/admin/dashboard` + `GET /api/cg/analytics/admin`
- Teacher profile and availability: `POST/PATCH /api/cg/teachers/profile`, `PATCH /api/cg/teachers/availability`
- Student profile: `POST/PATCH /api/cg/students/profile`
- Requests / bookings: `GET /api/cg/bookings`
- Payments: `GET /api/cg/payments`
- Notifications: `GET /api/cg/notifications`
- Messages: `GET /api/cg/chat/conversations`, `GET /api/cg/chat/messages/:conversationId`

---

## 20. Final Swagger-style Summary

This backend exposes a RESTful NestJS API with role-based authorization, JWT authentication, file upload support, and modular feature controllers such as Auth, Users, Teachers, Students, Search, Packages, Booking, Payment, Review, Notification, Session, Analytics, KYC, Category, and Subject management.

All protected endpoints should call the API using:

```http
Authorization: Bearer <token>
```
