# Supabase Database Setup Instructions

## Problem Solved
Photos were previously stored in `localStorage`, which is device-specific. This meant photos uploaded from one device would only appear on that device. Now photos are stored in Supabase, making them accessible across all devices.

## Required Supabase Table: `portfolio`

You need to create a table called `portfolio` in your Supabase database with the following structure:

### Table Schema

```sql
CREATE TABLE portfolio (
    id BIGSERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    public_id TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    is_main BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    format TEXT,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on category for faster queries
CREATE INDEX idx_portfolio_category ON portfolio(category);

-- Create an index on public_id for faster lookups
CREATE INDEX idx_portfolio_public_id ON portfolio(public_id);
```

### Column Descriptions

- `id`: Auto-incrementing primary key
- `url`: Cloudinary image URL (required)
- `public_id`: Cloudinary public ID (required, unique)
- `category`: Photo category (Wedding, Maternity, Portrait, Commercial, etc.)
- `title`: Photo title
- `description`: Photo description (optional)
- `is_main`: Boolean flag indicating if this is the main/featured photo for its category
- `uploaded_at`: Timestamp when photo was uploaded
- `format`: Image format (jpg, png, etc.) - optional
- `width`: Image width in pixels - optional
- `height`: Image height in pixels - optional
- `created_at`: Timestamp when record was created

## How to Create the Table

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to "SQL Editor"
4. Run the SQL commands above to create the table

## Row Level Security (RLS)

You may want to set up RLS policies:

```sql
-- Enable RLS
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for displaying photos on website)
CREATE POLICY "Allow public read access" ON portfolio
    FOR SELECT USING (true);

-- Allow authenticated users to insert (for admin panel)
CREATE POLICY "Allow authenticated insert" ON portfolio
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update (for admin panel)
CREATE POLICY "Allow authenticated update" ON portfolio
    FOR UPDATE USING (true);

-- Allow authenticated users to delete (for admin panel)
CREATE POLICY "Allow authenticated delete" ON portfolio
    FOR DELETE USING (true);
```

**Note**: The current implementation uses the anon key, so you may want to adjust RLS policies based on your security requirements.

## Testing

After creating the table:

1. Upload a photo from the admin panel
2. Check Supabase dashboard → Table Editor → `portfolio` to see if the photo was saved
3. View the website on a different device - photos should now appear!

## Migration from localStorage

If you have existing photos in localStorage, you can migrate them by:

1. Opening browser console on admin panel
2. Running:
```javascript
const photos = JSON.parse(localStorage.getItem('cloudinaryPhotos') || '[]');
for (const photo of photos) {
    await window.db.savePhotoToSupabase(photo);
}
```

## Files Modified

- `db.js`: Added Supabase functions for photo CRUD operations
- `admin-panel.html`: Updated to save/load photos from Supabase instead of localStorage
- `index.html`: Updated to load photos from Supabase instead of localStorage

