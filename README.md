# QR Scanner Full Stack Application

A full-stack QR code scanner application built with React (Vite) frontend and Node.js/Express backend, deployed on Vercel.

## 🚀 Live Demo

- **Frontend**: [https://your-app-name.vercel.app](https://your-app-name.vercel.app)
- **API**: [https://your-app-name.vercel.app/api](https://your-app-name.vercel.app/api)

## 📁 Project Structure

\`\`\`
├── client/                 # React frontend (Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── config/
│   ├── scripts/
│   ├── package.json
│   └── server.js
├── package.json           # Root package.json
├── vercel.json           # Vercel deployment config
└── README.md
\`\`\`

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Git

### Setup

1. **Clone the repository**
\`\`\`bash
git clone <your-repo-url>
cd qr-scanner-app
\`\`\`

2. **Install all dependencies**
\`\`\`bash
npm run install:all
\`\`\`

3. **Environment Variables**
Create a `.env` file in the `server` directory:
\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
NODE_ENV=development
PORT=5000
\`\`\`

4. **Seed the database**
\`\`\`bash
npm run seed
\`\`\`

5. **Start development servers**
\`\`\`bash
npm run dev
\`\`\`

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🚀 Deployment to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
\`\`\`bash
npm i -g vercel
\`\`\`

2. **Login to Vercel**
\`\`\`bash
vercel login
\`\`\`

3. **Deploy**
\`\`\`bash
vercel --prod
\`\`\`

4. **Set Environment Variables**
\`\`\`bash
vercel env add MONGODB_URI
# Enter your MongoDB connection string when prompted
\`\`\`

### Method 2: Using GitHub Integration

1. **Push to GitHub**
\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add `MONGODB_URI` with your MongoDB connection string

## 🔧 Configuration Files

### vercel.json
- Configures both frontend and backend deployment
- Routes API calls to serverless functions
- Serves static files from React build

### Key Features
- **Frontend**: React + Vite with QR scanning
- **Backend**: Express.js with MongoDB
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (both frontend and backend)
- **Features**: 
  - QR code scanning
  - Product management
  - Shopping cart
  - UPI payment integration
  - Invoice generation

## 📱 Usage

1. **Scan QR Codes**: Use camera to scan product QR codes
2. **Manual Entry**: Enter product IDs manually
3. **Shopping Cart**: Add/remove items, adjust quantities
4. **Checkout**: Complete purchase with UPI or demo payment
5. **Invoice**: Download PDF invoice

## 🔍 API Endpoints

- `GET /api/products` - Get all products
- `GET /api/product/:id` - Get product by ID
- `POST /api/products` - Add new product
- `POST /api/orders` - Create new order
- `GET /api/health` - Health check

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Check connection string format
   - Verify environment variables

2. **Build Failures**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Check for missing dependencies

3. **API Not Working**
   - Verify vercel.json configuration
   - Check serverless function logs in Vercel dashboard
   - Ensure environment variables are set

## 📞 Support

If you encounter any issues:
1. Check the Vercel deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check MongoDB Atlas connection

## 🎯 Next Steps

- [ ] Add user authentication
- [ ] Implement real payment gateway
- [ ] Add product categories
- [ ] Mobile app version
- [ ] Analytics dashboard
