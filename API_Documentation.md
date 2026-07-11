**API Documentation**

Base URL / Global prefix: `/api/cg`

Super Admin URL / Prefix: `/api/cg/superadmin/t1`


Super Admin Start:

-POST /api/cg/superadmin/t1/login

- Auth: no
  -Body example (LoginDTO):

```json
{
  "email": "example@gmail.com",
  "password": "Example@123",
  "Secrete Key": "secrete@123"
}
```
Super Admin End:


Auth USER Start

- POST /api/cg/auth/register
  - Auth: no
  - Body example (RegisterDto):

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

- POST /api/cg/auth/login
  - Auth: no
  - Body example (LoginDto):

```json
{
  "email": "jane.doe@example.com",
  "password": "Str0ngP@ssword!"
}
```

- POST /api/cg/auth/refresh-token
  - Auth: no
  - Body example (RefreshTokenDto):

```json
{
  "refreshToken": "<your-refresh-jwt-token>"
}
```

- POST /api/cg/auth/logout
  - Auth: yes (JWT)
  - Body: none

- GET /api/cg/auth/profile
  - Auth: yes (JWT)
  - Body: none

Users

- POST /api/cg/users/avatar
  - Auth: yes (JWT)
  - Body: multipart/form-data with file field `file`
  - Response example:

```json
{
  "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg"
}
```

KYC

- POST /api/cg/kyc
  - Auth: yes (JWT)
  - Body example (SubmitKycDto):

```json
{
  "documentType": "passport",
  "documentUrl": "https://res.cloudinary.com/.../kyc-doc.jpg"
}
```

- POST /api/cg/kyc/upload
  - Auth: yes (JWT)
  - Body: multipart/form-data with file field `file`
  - Response example:

```json
{ "documentUrl": "https://res.cloudinary.com/.../kyc-doc.jpg" }
```

- GET /api/cg/kyc
  - Auth: yes (JWT)

- GET /api/cg/kyc/admin
  - Auth: yes (JWT)

- PUT /api/cg/kyc/:kycId/review
  - Auth: yes (JWT)
  - Body example (ReviewKycDto):

```json
{
  "status": "approved",
  "adminNote": "Verified"
}
```

Bookings

- POST /api/cg/bookings
  - Auth: yes (JWT)
  - Body example (CreateBookingDto):

```json
{
  "teacherId": "6412f9...",
  "subject": "Mathematics",
  "hourlyRate": 15,
  "notes": "Prefer evenings"
}
```

- GET /api/cg/bookings
  - Auth: yes (JWT)

- PUT /api/cg/bookings/:bookingId/status eg: (http://localhost:3000/api/cg/bookings/6a4ba546af42c751c576c945/status)
  - Auth: yes (JWT)
  - Body example (UpdateBookingStatusDto):

```json
{ "status": "accepted" }
```

Chat

- POST /api/cg/chat/messages
  - Auth: yes (JWT)
  - Body example (CreateMessageDto):

```json
{
  "recipientId": "<teacher-user-id>",
  "content": "Hi, are you available tomorrow?"
}
```

- GET /api/cg/chat/conversations
  - Auth: yes (JWT)

- GET /api/cg/chat/messages/:conversationId
  - Auth: yes (JWT)

Teachers

- POST /api/cg/teachers/profile
  - Auth: yes (JWT)
  - Body example (CreateTeacherProfileDto):

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

- GET /api/cg/teachers/profile/:userId

- GET /api/cg/teachers?subject=&page=&limit=
  - Query: `subject`, `page`, `limit`

Packages

- POST /api/cg/packages
  - Auth: yes (JWT)
  - Body example (CreatePackageDto):

```json
{
  "name": "Starter Pack",
  "description": "Five sessions of 1 hour each",
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
