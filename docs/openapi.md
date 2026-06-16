# Purrfect Match API

Base URL: `http://localhost:8000/api`

## Public

- `GET /traits` — list personality traits
- `GET /stats` — marketplace stats
- `GET /cats` — browse listings (filters: search, gender, breed, max_age_months, max_fee_cents, traits, sort, page)
- `GET /cats/{slug}` — cat detail
- `GET /cats/{slug}/reviews` — listing reviews
- `GET /users/{id}` — public owner profile
- `POST /register` — create account
- `POST /login` — session login
- `POST /forgot-password` — send reset email
- `POST /reset-password` — reset with token

## Authenticated (Sanctum cookie session)

- `GET /user` — current user
- `PATCH /user` — update profile (name, city, avatar)
- `POST /user/password` — change password
- `POST /logout`

### Listings

- `GET /my-listings`
- `POST /cats` — create (multipart: photos[])
- `PATCH /cats/{id}` — update (photos[], delete_photo_ids[])
- `DELETE /cats/{id}`

### Saved

- `GET /saved-cats`
- `POST /cats/{id}/save`
- `DELETE /cats/{id}/save`

### Adoption

- `POST /cats/{id}/apply` — submit application
- `GET /my-applications`
- `GET /cats/{id}/applications` — owner only
- `PATCH /applications/{id}` — approve/reject/withdraw

### Reviews & reports

- `POST /cats/{slug}/reviews`
- `POST /cats/{id}/report`

### Messaging

- `GET /conversations`
- `POST /conversations`
- `GET /conversations/{id}`
- `POST /conversations/{id}/messages`

### Notifications

- `GET /notifications`
- `GET /notifications/unread-count`
- `POST /notifications/mark-all-read`

## Real-time (optional)

Broadcast channel: `private-conversation.{id}`  
Event: `message.sent` (requires Laravel Reverb + `BROADCAST_CONNECTION=reverb`)
