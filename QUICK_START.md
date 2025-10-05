# HumanGlue Database - Quick Start

## 🚀 Get Started in 3 Steps

### 1. Start Docker Desktop
Open Docker Desktop and wait for it to fully start.

### 2. Run Setup
```bash
npm run db:setup
```

### 3. Verify
```bash
npm run db:health
```

---

## 📝 Common Commands

```bash
# Database Management
npm run db:setup      # Full automated setup
npm run db:start      # Start Supabase
npm run db:stop       # Stop Supabase
npm run db:reset      # Reset database
npm run db:status     # Check status

# Verification & Testing
npm run db:verify     # Full verification
npm run db:health     # Quick health check
npm run db:seed       # Seed test data
```

---

## 🔑 Test Credentials

After running `npm run db:seed`:

- **Admin:** admin@humanglue.ai
- **Instructor:** dr.emily@humanglue.ai
- **Student:** student1@test.com

---

## 🌐 Local URLs

- **Supabase Studio:** http://localhost:54323
- **API URL:** http://localhost:54321
- **Database:** postgresql://postgres:postgres@localhost:54322/postgres

---

## 📊 What Gets Created

- **27+ Tables** - Full schema
- **50+ Indexes** - Performance optimized
- **40+ RLS Policies** - Security enforced
- **11+ Functions** - Helper functions
- **10+ Triggers** - Auto-updates
- **Realtime** - 7 tables enabled

---

## 🆘 Troubleshooting

**Docker not running?**
```bash
# Open Docker Desktop app
# Wait for whale icon to be steady
```

**Port conflict?**
```bash
supabase stop
supabase start
```

**Need to reset?**
```bash
npm run db:reset
npm run db:seed
```

---

## 📚 Full Documentation

See [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) for complete details.

---

**That's it! You're ready to develop. 🎉**
