import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { login } from './src/modules/auth/auth.controller.js';
import { createCompany } from './src/modules/company/company.controller.js';
import companyRoutes from './src/modules/company/company.routes.js';
import driverRoutes from './src/modules/driver/ driver.routes.js';
import roleRoutes from './src/modules/Permission_and_Roles/role.routes.js';
import moduleRoutes from './src/modules/modules/ module.routes.js';
import userRoutes from './src/modules/user/user.routes.js';
import rolePermissionRoutes from './src/modules/Permission_and_Roles/rolePermission.routes.js'
import { authenticate } from './src/middlewares/auth.middleware.js';

// Load environment variables from .env file
dotenv.config();

// Create an Express app
const app = express();
app.use(express.json());

// Enable CORS for all origins (you can customize this)
app.use(cors({ origin:
     'http://localhost:5174', // replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
  

// Parse JSON request bodies
app.use(express.json());
// Routes
app.post('/api/auth/login', login);

app.use(authenticate)

app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/companies', companyRoutes);
app.post('/api/company', createCompany);
// Example route
app.get('/api/message', (req, res) => {
  res.send('✅ Fleet backend API is running');
});

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
