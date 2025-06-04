# Medical Doc Manager

This project is a React frontend built with Vite.

## Environment Variables

Create a `.env` file in the project root. The frontend expects the following variable:

```
VITE_API_BASE_URL=<URL of your API server>
```

For local development it defaults to `http://localhost:3001`.

## Backend Scripts

Run the backend server with:

```
npm run start:backend
```

This command starts `back-end/server.ts` via `ts-node`. The server imports `db.ts`, so the `migratePatientsTable()` function runs automatically at startup.

To run the migration standalone, use:

```
npm run migrate
```

