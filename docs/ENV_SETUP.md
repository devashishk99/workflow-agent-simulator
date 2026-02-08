# Environment Setup

## Create .env.local File

Create a file named `.env.local` in the root directory with the following content:

```env
DATABASE_URL="file:./dev.db"
AIRTABLE_TOKEN=pat_your_token_here
AIRTABLE_BASE_ID=app_your_base_id_here
```

## Quick Setup Command

You can create this file manually or use this command in your terminal:

```bash
cat > .env.local << 'EOF'
DATABASE_URL="file:./dev.db"
AIRTABLE_TOKEN=pat...
AIRTABLE_BASE_ID=app...
EOF
```

## After Creating .env.local

Once the file is created, run:

```bash
npm run db:migrate
```

This will create the SQLite database and all the tables.

## Airtable Credentials

For now, you can use placeholder values for Airtable. You'll need to:
1. Create an Airtable base named "Customer Agent Demo"
2. Create the Leads and Bookings tables (see README.md)
3. Get your Personal Access Token from Airtable account settings
4. Get your Base ID from the Airtable API documentation
5. Update the `.env.local` file with your actual credentials

