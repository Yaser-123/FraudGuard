# Security Implementation Guide

This document outlines the enterprise-grade security features implemented in the complaint form system.

## 🔐 Security Features Implemented

### 1. JWT Authentication
- **What it is**: JSON Web Tokens for stateless authentication
- **Benefits**: Scalable, secure, and eliminates server-side session storage
- **Implementation**: Admin login generates a JWT token valid for 24 hours

### 2. Password Hashing with bcrypt
- **What it is**: Secure password hashing using bcrypt with salt rounds
- **Benefits**: Protects against rainbow table attacks and brute force
- **Implementation**: Admin passwords are hashed with 12 salt rounds

### 3. Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Admin Authentication**: 5 attempts per 15 minutes per IP
- **Call Dispatch**: 10 requests per 5 minutes per IP
- **Benefits**: Prevents brute force attacks and API abuse

### 4. Input Validation & Sanitization
- **Customer Name**: 2-100 characters, letters and spaces only
- **Phone Number**: 10-15 digits with optional formatting
- **Complaint ID**: 3-50 characters, alphanumeric and special chars only
- **Issue Summary**: 10-1000 characters
- **Benefits**: Prevents injection attacks and malformed data

### 5. Security Headers (Helmet.js)
- **Content Security Policy**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Benefits**: Protects against various web vulnerabilities

### 6. CORS Configuration
- **Development**: Allows localhost:5173 and localhost:3000
- **Production**: Restrict to your actual domain only
- **Benefits**: Prevents unauthorized cross-origin requests

## 🛠 Setup Instructions

### 1. Generate Admin Password Hash
```bash
node generate-admin-password.js
```
Follow the prompts to create a secure password hash.

### 2. Update Environment Variables
Copy the generated values to your `.env` file:
```env
JWT_SECRET=your-generated-jwt-secret
ADMIN_PASSWORD_HASH=your-generated-password-hash
```

### 3. Production Configuration
Before deploying to production:

1. **Change the JWT Secret**:
   ```env
   JWT_SECRET=your-super-secure-64-character-random-string
   ```

2. **Update CORS Origins**:
   ```env
   ALLOWED_ORIGINS=https://your-domain.com
   ```

3. **Set Strong Admin Password**:
   Use the password generator script with a strong password (12+ characters)

4. **Environment Variables**:
   ```env
   NODE_ENV=production
   ```

## 🔒 Admin Access

### Login Process
1. Visit: `http://localhost:5173/?admin=true`
2. Enter your admin password (default: `admin123`)
3. System generates JWT token stored in localStorage
4. Token is sent with all subsequent admin requests

### Default Credentials
- **Password**: `admin123`
- **⚠️ IMPORTANT**: Change this immediately in production!

### Security Best Practices
1. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
2. **Change default passwords** before production deployment
3. **Rotate JWT secrets** periodically
4. **Monitor login attempts** in server logs
5. **Use HTTPS** in production
6. **Keep environment files secure** - never commit to version control

## 🚨 Security Monitoring

### Server Logs
The system logs the following security events:
- Failed admin login attempts with IP addresses
- Successful admin authentications
- Rate limit violations
- Invalid token usage

### Rate Limiting Responses
When rate limits are exceeded, users receive:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## 🔧 Additional Security Recommendations

### For Production Deployment
1. **Use HTTPS everywhere**
2. **Implement audit logging**
3. **Add request logging middleware**
4. **Use Redis for session storage** (if needed)
5. **Implement IP allowlisting** for admin access
6. **Add two-factor authentication**
7. **Use environment-specific secrets**
8. **Regular security audits**

### Database Security
1. **Use connection pooling**
2. **Implement row-level security**
3. **Regular backups with encryption**
4. **Database access monitoring**

## 🧪 Testing Security

### Test Rate Limiting
```bash
# Test auth rate limiting
for i in {1..10}; do curl -X POST http://localhost:3001/api/admin/authenticate -H "Content-Type: application/json" -d '{"password":"wrong"}'; done
```

### Test JWT Token Validation
```bash
# Test with invalid token
curl -H "Authorization: Bearer invalid-token" http://localhost:3001/api/complaints
```

### Test Input Validation
```bash
# Test with invalid input
curl -X POST http://localhost:3001/api/dispatch-call \
  -H "Content-Type: application/json" \
  -d '{"complaintData":{"customer_name":"A"}}'
```

## 🔄 Security Updates

This implementation includes all major security features for an enterprise-grade application. Future enhancements could include:

- OAuth 2.0 / OpenID Connect integration
- Multi-factor authentication
- Advanced threat detection
- Security scanning integration
- Compliance reporting (SOC 2, GDPR, etc.)

## 📞 Support

If you encounter any security-related issues or need assistance with the implementation, check the server logs for detailed error messages and authentication events.
