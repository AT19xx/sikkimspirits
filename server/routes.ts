import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, ageVerificationSchema, locationVerificationSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sikkim-spirits-secret-key";

// Middleware for authentication
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware for admin access
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Log registration event
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
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
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

      // Log login event
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
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Age verification
  app.post("/api/verification/age", authenticateToken, async (req, res) => {
    try {
      const { dateOfBirth, aadhaarNumber } = ageVerificationSchema.parse(req.body);
      
      // Calculate age
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 21) {
        await storage.logComplianceEvent({
          userId: req.user.userId,
          eventType: "age_verification_failed",
          eventData: { age, reason: "Under 21" },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || null
        });
        
        return res.status(400).json({ 
          message: "Age verification failed. Must be 21 or older.",
          verified: false 
        });
      }

      // Update user with age verification data
      await storage.updateUser(req.user.userId, {
        dateOfBirth,
        aadhaarNumber
      });

      // Log successful age verification
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
      console.error("Age verification error:", error);
      res.status(400).json({ message: "Invalid verification data" });
    }
  });

  // Location verification
  app.post("/api/verification/location", authenticateToken, async (req, res) => {
    try {
      const { latitude, longitude, address } = locationVerificationSchema.parse(req.body);
      
      // Basic geofencing check (simplified implementation)
      // In production, this would check against restricted zones database
      const isInRestrictedZone = false; // Implement actual geofencing logic
      
      if (isInRestrictedZone) {
        await storage.logComplianceEvent({
          userId: req.user.userId,
          eventType: "location_verification_failed",
          eventData: { latitude, longitude, reason: "Restricted zone" },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || null
        });
        
        return res.status(400).json({
          message: "Location verification failed. Delivery not available in restricted zones.",
          verified: false
        });
      }

      // Create or update user address
      const userAddresses = await storage.getUserAddresses(req.user.userId);
      if (userAddresses.length === 0) {
        await storage.createAddress({
          userId: req.user.userId,
          addressLine1: address,
          addressLine2: null,
          city: "Gangtok",
          state: "Sikkim",
          pincode: "737101",
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          isVerified: true,
          isDefault: true
        });
      }

      // Log successful location verification
      await storage.logComplianceEvent({
        userId: req.user.userId,
        eventType: "location_verification_success",
        eventData: { latitude, longitude, address },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });

      res.json({
        message: "Location verification successful",
        verified: true
      });
    } catch (error) {
      console.error("Location verification error:", error);
      res.status(400).json({ message: "Invalid location data" });
    }
  });

  // Complete KYC verification
  app.post("/api/verification/complete", authenticateToken, async (req, res) => {
    try {
      const success = await storage.verifyUser(req.user.userId);
      
      if (success) {
        await storage.logComplianceEvent({
          userId: req.user.userId,
          eventType: "kyc_verification_complete",
          eventData: { timestamp: new Date() },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || null
        });

        res.json({
          message: "KYC verification completed successfully",
          verified: true
        });
      } else {
        res.status(500).json({ message: "Verification failed" });
      }
    } catch (error) {
      console.error("KYC completion error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      const products = category 
        ? await storage.getProductsByCategory(category)
        : await storage.getProducts();
      
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Orders routes
  app.post("/api/orders", authenticateToken, async (req, res) => {
    try {
      const { items, deliveryAddressId, deliveryInstructions } = req.body;
      
      // Verify user is KYC verified
      const user = await storage.getUser(req.user.userId);
      if (!user?.isVerified) {
        return res.status(400).json({ message: "KYC verification required" });
      }

      // Calculate order totals
      let subtotal = 0;
      let totalExciseTax = 0;
      let totalGst = 0;
      
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        
        const itemSubtotal = parseFloat(product.basePrice) * item.quantity;
        const itemExcise = parseFloat(product.exciseTax) * item.quantity;
        const itemGst = parseFloat(product.gst) * item.quantity;
        
        subtotal += itemSubtotal;
        totalExciseTax += itemExcise;
        totalGst += itemGst;
      }
      
      const deliveryFee = 50;
      const totalAmount = subtotal + totalExciseTax + totalGst + deliveryFee;
      
      // Generate order number
      const orderNumber = `SK${Date.now()}`;
      
      // Create order
      const order = await storage.createOrder({
        userId: req.user.userId,
        orderNumber,
        status: "pending",
        subtotal: subtotal.toString(),
        totalExciseTax: totalExciseTax.toString(),
        totalGst: totalGst.toString(),
        deliveryFee: deliveryFee.toString(),
        totalAmount: totalAmount.toString(),
        deliveryAddressId,
        deliveryInstructions,
        complianceData: {
          ageVerified: true,
          locationVerified: true,
          timestamp: new Date()
        }
      });
      
      // Add order items
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.addOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.totalPrice,
            totalPrice: (parseFloat(product.totalPrice) * item.quantity).toString()
          });
          
          // Update product stock
          await storage.updateProductStock(item.productId, item.quantity);
        }
      }
      
      // Log order creation
      await storage.logComplianceEvent({
        orderId: order.id,
        userId: req.user.userId,
        eventType: "order_created",
        eventData: { orderNumber, totalAmount },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });
      
      res.status(201).json({
        message: "Order created successfully",
        order
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", authenticateToken, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.user.userId);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:orderNumber", async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const orderItems = await storage.getOrderItems(order.id);
      
      res.json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDailyStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/orders", authenticateToken, requireAdmin, async (req, res) => {
    try {
      // For admin, get all orders (implement pagination in production)
      const orders = await storage.getUserOrders(0); // 0 to get all orders
      res.json(orders);
    } catch (error) {
      console.error("Get admin orders error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/compliance", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const logs = await storage.getComplianceLogs();
      res.json(logs);
    } catch (error) {
      console.error("Get compliance logs error:", error);
      res.status(500).json({ message: "Failed to fetch compliance logs" });
    }
  });

  // User profile route
  app.get("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const addresses = await storage.getUserAddresses(req.user.userId);
      
      res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        addresses
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
