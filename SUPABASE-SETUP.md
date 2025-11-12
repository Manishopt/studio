# Supabase Setup Guide

## Prerequisites
- Supabase account (free tier available at https://supabase.com)

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: TJ Clicks Gallery (or your choice)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location
4. Click **"Create new project"** (takes 1-2 minutes)

## Step 2: Create Database Table

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
-- Create gallery table
CREATE TABLE gallery (
  id BIGSERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for uploads)
CREATE POLICY "Allow anonymous inserts" ON gallery
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow public reads (for gallery display)
CREATE POLICY "Allow public reads" ON gallery
  FOR SELECT
  TO anon
  USING (true);
```

4. Click **"Run"** or press `Ctrl+Enter`
5. You should see success message: "Success. No rows returned"

## Step 3: Get Your Credentials

1. Go to **Settings** (gear icon) > **API** in the left sidebar
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key** (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 4: Update .env File

1. Open the `.env` file in your project
2. Replace the placeholder values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

## Step 5: Update db.js

1. Open `db.js`
2. Replace the placeholder values with your actual Supabase credentials:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

3. Save the file

## Step 6: Test the Integration

1. Open `admin-login.html` in your browser
2. Login with credentials (admin/admin123)
3. Go to **Manage Photos**
4. Upload a test image
5. Open browser console (F12) and check for:
   - `Cloudinary upload successful: https://...`
   - `Successfully saved to Supabase`

## Step 7: Verify in Supabase

1. Go back to your Supabase dashboard
2. Click **Table Editor** in the left sidebar
3. Select the `gallery` table
4. You should see your uploaded image URL in the table!

## Troubleshooting

### Error: "Failed to save to Supabase"

**Check:**
- ✅ Supabase URL and Key are correct in `db.js`
- ✅ Table `gallery` exists in your database
- ✅ Row Level Security policies are set correctly
- ✅ Your browser console for detailed error messages

### Error: "saveImage function not found"

**Solution:**
- Make sure `db.js` is loaded in `admin-panel.html`
- Check that the script tag exists: `<script src="db.js"></script>`

### Network Error

**Check:**
- ✅ Internet connection is active
- ✅ Supabase project is running (not paused)
- ✅ CORS is enabled (should be by default)

## Optional: View Data via SQL

To see all uploaded images in Supabase:

1. Go to **SQL Editor**
2. Run:
```sql
SELECT * FROM gallery ORDER BY created_at DESC;
```

## Security Notes

⚠️ **Important:**
- The `anon public key` is safe to use in client-side code
- Never use your `service_role` key in client code
- The current setup allows anonymous uploads (anyone can upload)
- For production, implement proper authentication

## Next Steps

✅ Uploads are now saved to both Cloudinary and Supabase!
✅ Cloudinary stores the actual images
✅ Supabase stores the image URLs for easy retrieval

**Future Enhancements:**
- Add category field to gallery table
- Implement admin authentication in Supabase
- Create a public-facing gallery that fetches from Supabase
- Add image metadata (dimensions, format, etc.)

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
