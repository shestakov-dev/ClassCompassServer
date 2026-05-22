# ClassCompass Server

NestJS modular monolith backend for the ClassCompass platform.

## Core Responsibilities

The backend repository handles the core application business logic, persistence interactions, and data validation rules.

- **Domain Logic**: Processes data and executes validation to catch scheduling conflicts.
- **Multitenancy**: Enforces data isolation between different educational institutions sharing the same database infrastructure.
- **Access Control**: Integrates with the Ory ecosystem to provide a secure access control mechanism.
- **API Specification**: Exposes a structured OpenAPI endpoint layout used to synchronize data contracts with the frontend.

## Local start

Copy over the env example to `.env` and edit the values where needed.

Apply migrations (local dev):

```bash
pnpx prisma migrate dev
```

```bash
pnpm install

pnpm run start:dev
```

## Links

- [ClassCompassFrontend](https://github.com/shestakov-dev/ClassCompassFrontend)
- [ClassCompassServer](https://github.com/shestakov-dev/ClassCompassServer)
- [ClassCompassInfrastructure](https://github.com/shestakov-dev/ClassCompassInfrastructure)
