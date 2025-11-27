# Firebase Configuration for Production

## 🔥 Firebase Console Setup Required

### 1. Update Authorized Domains
Go to: https://console.firebase.google.com/project/finleybook-6120d/authentication/settings

Add these domains to "Authorized domains":
- `finleybook-8294g4yu1-jianwei-chens-projects.vercel.app`
- Any custom domain you plan to use

### 2. Verify Storage Bucket
The environment variable shows:
- Current: `finleybook-6120d.firebasestorage.app` 
- May need: `finleybook-6120d.appspot.com`

Check your Firebase console to confirm the correct storage bucket URL.

### 3. Firestore Security Rules
Your current rules in `firebase/firestore.rules` are production-ready:
- User authentication required
- Data isolation per user
- Proper security boundaries

### 4. CORS Configuration
If needed, configure CORS for your storage bucket to allow requests from your Vercel domain.

## 🔧 CLI Commands for Firebase

Deploy security rules (if needed):
```bash
firebase deploy --only firestore:rules
```

Deploy storage rules (if needed):
```bash
firebase deploy --only storage
```

## ⚠️ Important Notes

1. **API Key Security**: Your Firebase API key is safe to expose in client code
2. **Domain Authorization**: Must add Vercel domain to Firebase authorized domains
3. **Database Rules**: Current rules require user authentication
4. **Storage Access**: Ensure proper CORS settings for file uploads