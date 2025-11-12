# Admin Photo Upload System with Cloudinary

This admin panel allows you to upload photos to Cloudinary with unsigned upload preset.

## Files Created

1. **`.env`** - Contains Cloudinary configuration
2. **`cloudinary-upload.js`** - Standalone JavaScript upload utility
3. **`admin-login.html`** - Admin login page (already existed, uses existing credentials)
4. **`admin-panel.html`** - Updated with Cloudinary integration

## Configuration

### Cloudinary Settings (from .env)
```
CLOUD_NAME=dnpfsfvfv
UPLOAD_PRESET=unsigned_upload
```

## How to Use

### 1. Access Admin Panel

1. Open `admin-login.html` in your browser
2. Login with credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

### 2. Upload Photos

1. Click on "Manage Photos" in the sidebar
2. Select a category (Wedding, Maternity, Portrait, etc.)
3. Drag & drop photos or click to browse
4. Click "Upload Photos" button
5. Photos will be uploaded to Cloudinary and displayed in the gallery

### 3. Features

- **Cloudinary Upload**: All photos are uploaded to your Cloudinary account
- **Category Management**: Organize photos by category
- **Filter Photos**: Filter displayed photos by category
- **Delete Photos**: Remove photos from the gallery (removes from localStorage)
- **LocalStorage Persistence**: Uploaded photo URLs are saved locally
- **Drag & Drop**: Drag files directly to the upload area
- **Multiple Upload**: Upload multiple photos at once

## Photo Organization

Photos are organized in Cloudinary:
- **Folder**: `portfolio/{category}`
- **Tags**: Category name is added as a tag
- **Examples**:
  - Wedding photos: `portfolio/Wedding/`
  - Maternity photos: `portfolio/Maternity/`

## Technical Details

### Upload Function
```javascript
async function uploadToCloudinary(file, category) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_upload');
    formData.append('folder', `portfolio/${category}`);
    formData.append('tags', category);
    
    const response = await fetch(
        'https://api.cloudinary.com/v1_1/dnpfsfvfv/image/upload',
        { method: 'POST', body: formData }
    );
    
    return await response.json();
}
```

### Data Storage
- Photos are stored in browser's localStorage
- Structure:
```json
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "portfolio/Wedding/abc123",
  "category": "Wedding",
  "uploaded_at": "2025-01-08T10:30:00.000Z"
}
```

## Important Notes

1. **Unsigned Upload**: No API keys required, uses unsigned upload preset
2. **File Size**: Maximum 5MB per file (can be adjusted in Cloudinary settings)
3. **Allowed Formats**: JPG, PNG, WEBP, GIF
4. **Security**: For production, implement proper server-side authentication
5. **LocalStorage Limit**: Browser localStorage has size limits (~5-10MB)

## Cloudinary Upload Preset Configuration

Make sure your Cloudinary upload preset `unsigned_upload` is configured:

1. Go to Cloudinary Dashboard → Settings → Upload
2. Find "Upload presets" section
3. Create or edit `unsigned_upload` preset
4. Set:
   - **Signing Mode**: Unsigned
   - **Folder**: (optional) Set a default folder
   - **Tags**: (optional) Add default tags
   - **Upload Control**: Allow unsigned uploads

## Troubleshooting

### Upload Fails
- Check that the upload preset name is correct
- Verify the Cloudinary cloud name
- Check browser console for error messages
- Ensure upload preset is set to "Unsigned"

### Photos Not Showing
- Clear browser cache
- Check browser console for errors
- Verify localStorage is not full
- Make sure photos uploaded successfully to Cloudinary

### Can't Login
- Default credentials: `admin` / `admin123`
- Check browser console for JavaScript errors
- Clear sessionStorage if stuck

## Security Recommendations

For production use:

1. **Change Default Password**: Update credentials in `admin-login.html`
2. **Add .htaccess Protection**: Restrict access to admin pages
3. **Use HTTPS**: Always use secure connection
4. **Server-Side Auth**: Implement proper backend authentication
5. **Signed Uploads**: Consider using signed uploads for production
6. **Rate Limiting**: Add upload rate limiting
7. **File Validation**: Add server-side file validation

## Future Enhancements

- Database integration (MySQL, MongoDB, etc.)
- Batch delete functionality
- Image editing before upload
- Automatic thumbnail generation
- Photo metadata editing
- Search functionality
- Export uploaded photo list
- Integration with main website

## Support

For issues or questions:
- Check browser console for errors
- Verify Cloudinary configuration
- Test with a single small image first
- Ensure internet connection is stable

## Credits

- Cloudinary for image hosting
- Font Awesome for icons
- TJ Clicks Studio
