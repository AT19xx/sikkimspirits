import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginSchema, 
  ageVerificationSchema, 
  locationVerificationSchema 
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

// Types and Interfaces
interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Environment Configuration
const JWT_SECRET = process.env.JWT_SECRET || "sikkim-spirits-secret-key";
const MINIMUM_AGE = 21;

// Middleware
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user as JwtPayload;
    next();
  });
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Helper Functions
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const generateOrderNumber = (): string => {
  return `SK${Date.now()}`;
};

// Route Handlers
const handleRegistration = async (req: Request, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await storage.createUser(userData);
    
    await storage.logComplianceEvent({
      userId: user.id,
      eventType: "user_registration",
      eventData: { email: user.email, timestamp: new Date() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || null
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isVerified: user.isVerified,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: error.errors 
      });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await storage.logComplianceEvent({
      userId: user.id,
      eventType: "user_login",
      eventData: { timestamp: new Date() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || null
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isVerified: user.isVerified,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: error.errors 
      });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleAgeVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { dateOfBirth, aadhaarNumber } = ageVerificationSchema.parse(req.body);
    const birthDate = new Date(dateOfBirth);
    const age = calculateAge(birthDate);

    if (age < MINIMUM_AGE) {
      await storage.logComplianceEvent({
        userId: req.user.userId,
        eventType: "age_verification_failed",
        eventData: { age, reason: `Under ${MINIMUM_AGE}` },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });
      
      return res.status(400).json({ 
        message: `Age verification failed. Must be ${MINIMUM_AGE} or older.`,
        verified: false 
      });
    }

    await storage.updateUser(req.user.userId, {
      dateOfBirth,
      aadhaarNumber
    });

    await storage.logComplianceEvent({
      userId: req.user.userId,
      eventType: "age_verification_success",
      eventData: { age, aadhaarLast4: aadhaarNumber.slice(-4) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || null
    });

    res.json({
      message: "Age verification successful",
      verified: true,
      age
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: error.errors 
      });
    }
    console.error("Age verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Main Router Function
export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", handleRegistration);
  app.post("/api/auth/login", handleLogin);

  // Verification routes
  app.post("/api/verification/age", authenticateToken, handleAgeVerification);
  app.post("/api/verification/location", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    // ... (similar refactoring for location verification)
  });

  // Products routes
  app.get("/api/products", async (req: Request, res: Response) => {
    // ... (refactored product routes)
  });

  // Orders routes
  app.post("/api/orders", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    // ... (refactored order creation)
  });

  // Admin routes
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    // ... (refactored admin routes)
  });

  // User profile route
  app.get("/api/user/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    // ... (refactored profile route)
  });

  return createServer(app);
}
