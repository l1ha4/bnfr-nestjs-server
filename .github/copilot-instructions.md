# AI Coding Rules

## Request Logging Policy

- Every HTTP request must have logs.
- Log request start: method, path, user identifier (if available), and key params.
- Log request completion: method, path, status code, and duration in ms.
- Log request failures with error message and context.

## Implementation Preference

- Prefer global request logging (middleware/interceptor) so all endpoints are covered.
- Add service-level logs for important business actions and external API calls.
- Do not remove existing useful logs.
