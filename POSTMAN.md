# Venue API Documentation for Postman

## Setup Authentication

1. First, create a user or login with an existing user to get a JWT token
2. All venue APIs except `GET /venues` and `GET /venues/:id` require authentication

## Setting up Environment Variables

Create the following environment variables in Postman:

- `BASE_URL`: Your API base URL (e.g., `http://localhost:3000`)
- `JWT_TOKEN`: The JWT token received after login

## Authentication Setup

For all protected endpoints, add this to the "Authorization" tab:

- Type: Bearer Token
- Token: `{{JWT_TOKEN}}`

## API Endpoints

### Get All Venues
- **Method**: GET
- **URL**: `{{BASE_URL}}/venues`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search by venue name
  - `category` (optional): Filter by category
  - `isActive` (optional): Filter by active status
  - `sortBy` (optional): Sort by field (default: "created_at")
  - `sortOrder` (optional): "asc" or "desc" (default: "desc")
- **Authentication**: Not required

### Get a Venue by ID
- **Method**: GET
- **URL**: `{{BASE_URL}}/venues/:id`
- **Authentication**: Not required

### Create a Venue
- **Method**: POST
- **URL**: `{{BASE_URL}}/venues`
- **Body**: JSON
```json
{
  "venue_name": "Example Venue",
  "venue_description": "A beautiful venue for events",
  "is_active": true,
  "halls": [
    {
      "hall_name": "Main Hall",
      "hall_description": "Large hall for weddings",
      "hall_capacity": 500,
      "hall_price": 5000,
      "hall_is_active": true
    }
  ],
  "start_price": 5000,
  "end_price": 10000,
  "location": {
    "location_name": "Downtown",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "time_slots": [
    {
      "start_time": "09:00",
      "end_time": "17:00"
    }
  ],
  "contact_info": {
    "name": "John Doe",
    "phone": "1234567890",
    "email": "contact@venue.com",
    "address": "123 Main St, Anytown"
  },
  "amenities": ["WiFi", "Parking", "Catering"],
  "categories": ["Wedding", "Corporate"],
  "images": [
    {
      "image_url": "https://example.com/image1.jpg",
      "is_cover": true
    }
  ]
}
```
- **Authentication**: Required
- **Note**: The `created_by` field will be automatically set based on the authenticated user.

### Update a Venue
- **Method**: PUT
- **URL**: `{{BASE_URL}}/venues/:id`
- **Body**: JSON (same structure as create, but fields are optional)
- **Authentication**: Required

### Delete a Venue
- **Method**: DELETE
- **URL**: `{{BASE_URL}}/venues/:id`
- **Authentication**: Required

### Toggle Venue Status
- **Method**: PUT
- **URL**: `{{BASE_URL}}/venues/:id/toggle-status`
- **Authentication**: Required

## Changes in Response Format

The venue responses now include a `created_by` field that references the user ID who created the venue. If you want to get the user details, you'll need to make a separate request to the users API.

## Tips for Testing

1. First login to get a JWT token and save it to your environment
2. Test the venue endpoints with and without authentication
3. When creating a venue, note that you don't need to provide the `created_by` field as it's set automatically
4. For the toggle status endpoint, it will flip the `is_active` field between true and false 