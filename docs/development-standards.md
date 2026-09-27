# Development Standards

## General

- Keep features modular.
- Prefer small services over large controllers.
- Validate all external input.
- Keep provider integrations behind interfaces.
- Use explicit types and strict TypeScript.
- Do not duplicate business logic between clients.

## API

- Version routes under `/v1`.
- Separate public and private response models.
- Return consistent error objects.
- Never expose private event, guest, or payment data through public endpoints.

Error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the event details."
  }
}
```

## UI

- Use shared design tokens.
- Build reusable components before feature screens.
- Use mobile-first layouts.
- Keep minimum tap targets at 44px.
- Support English, Hindi, and Gujarati.
- Avoid critical icon-only actions.

## Git

- Use pull requests.
- Require lint, typecheck, and tests before merge.
- Keep commits focused.
- Do not commit secrets or generated build output.
