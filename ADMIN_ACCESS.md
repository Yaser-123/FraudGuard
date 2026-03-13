# 🔐 Admin Dashboard Access Guide

## Secure Admin Access

The admin dashboard is protected with a secure authentication system. Only authorized personnel with the correct access key can view complaint data.

### 🔗 Admin Access Link

**Secure URL:** `http://localhost:5173/?admin=true`

### 🔑 Access Credentials

**Access Key:** `ADMIN_2025_SECURE_KEY_XYZ789`

⚠️ **IMPORTANT**: Keep this access key confidential and share only with authorized personnel.

---

## 🚀 How to Access Admin Dashboard

### Method 1: Direct Link
1. Share this secure link with authorized personnel:
   ```
   http://localhost:5173/?admin=true
   ```
2. They will be prompted to enter the access key
3. Enter: `ADMIN_2025_SECURE_KEY_XYZ789`
4. Click "Access Dashboard"

### Method 2: Navigation Button
1. Go to the main complaint form: `http://localhost:5173/`
2. Click "📊 Admin Access" button in the navigation
3. Enter the access key when prompted

---

## 🛡️ Security Features

- **Access Key Authentication**: Secure key-based authentication
- **Session Management**: 24-hour session timeout
- **IP Logging**: Admin access attempts are logged with IP addresses
- **Session Tokens**: Secure session tokens for API requests
- **Protected Endpoints**: All admin endpoints require authentication

---

## 📊 Admin Dashboard Features

Once authenticated, admins can:

- **View All Complaints**: Complete list of submitted complaints
- **Real-time Statistics**: Total, successful, failed, and pending calls
- **Detailed Information**: Customer details, OCR extracted text, device info
- **API Response Data**: OmniDimension API responses and call status
- **Search & Filter**: Find specific complaints quickly

---

## 🔧 Technical Details

### Session Management
- Sessions expire after 24 hours
- Session tokens are required for all admin API calls
- Sessions are stored server-side (in production, use Redis/database)

### API Endpoints (Admin Only)
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:id` - Get single complaint
- `POST /api/admin/authenticate` - Admin login

### Security Headers
All admin API calls require:
```javascript
headers: {
  'x-admin-session': 'session_token_here'
}
```

---

## 🔄 Changing Access Key

To change the admin access key:

1. Edit `server.js`
2. Find `ADMIN_CONFIG` section
3. Update `ACCESS_KEY` value
4. Restart the server
5. Update this documentation

---

## 🚨 Security Best Practices

1. **Never share access key in public channels**
2. **Use HTTPS in production**
3. **Regularly rotate access keys**
4. **Monitor admin access logs**
5. **Use strong, unique access keys**
6. **Implement IP whitelisting if needed**

---

## 📝 Production Deployment

For production deployment:

1. **Use environment variables** for access keys
2. **Implement proper session storage** (Redis/database)
3. **Add rate limiting** for authentication attempts
4. **Use HTTPS** for all admin communications
5. **Implement audit logging**
6. **Add multi-factor authentication** (optional)

---

## 🔍 Troubleshooting

### Common Issues:

**Invalid Access Key Error:**
- Check that the access key is exactly: `ADMIN_2025_SECURE_KEY_XYZ789`
- Ensure no extra spaces or characters

**Session Expired:**
- Re-authenticate with the access key
- Sessions automatically expire after 24 hours

**Cannot Access Complaints:**
- Ensure you're properly authenticated
- Check browser developer tools for session token errors

---

## 📞 Support

For technical support or access issues, contact the system administrator.

**Server Logs:** Check server console for authentication attempts and errors.
**Browser Console:** Check for JavaScript errors if dashboard doesn't load.

---

**Last Updated:** June 29, 2025
**Version:** 1.0.0
