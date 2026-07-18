# API Error Response Rules

When generating or modifying API endpoints, middleware, or mock responses, always format error states explicitly using the standardized, production-ready JSON error response layout outlined below.

## Global Constraints
1. ALWAYS use the correct HTTP Status Code alongside the JSON payload.
2. NEVER leak raw database errors, language stack traces, or internal server logic to the user in a production response.
3. Every error response MUST strictly adhere to the standardized schema outlined below.

## Standard Error Schema
All error responses must return an object with the following structure:

```json
{
  "success": false,
  "error": {
    "code": "STRING_UPPERCASE_ERROR_CODE",
    "message": "A high-level, human-readable summary for developers.",
    "details": [
      {
        "field": "name_of_invalid_input_or_property",
        "issue": "SPECIFIC_REASON_CODE",
        "message": "Contextual error message for this specific field."
      }
    ],
    "timestamp": "ISO-8601 String",
    "traceId": "unique-request-tracking-id"
  }
}
```

## Payload Field Requirements
- `success`: Always false.
- `error.code`: A unique, uppercase, snake_case string (e.g., `INVALID_CREDENTIALS`, `RESOURCE_NOT_FOUND`) that the frontend can use for UI logic or localization lookups.
- `error.message`: A clear summary of what went wrong. Do not display this raw message to end-users.
- `error.details`: An array of objects. Required for validation errors (400/422). If an entire resource fails (e.g., 404 or 500), this can be an empty array `[]`.
- `error.timestamp`: The exact current server time in ISO-8601 format.
- `error.traceId`: A unique string identifier for tracing the error in backend logs.
