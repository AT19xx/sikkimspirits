import { 
  users, addresses, products, orders, orderItems, deliveryAgents, complianceLog,
  type User, type InsertUser, type Address, type InsertAddress,
  type Product, type InsertProduct, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type DeliveryAgent, type ComplianceLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  verifyUser(id: number): Promise<boolean>;

  // Address management
  getUserAddresses(userId: number): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, updates: Partial<Address>): Promise<Address | undefined>;
  verifyAddress(id: number): Promise<boolean>;

  // Product management
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined>;
  updateProductStock(id: number, quantity: number): Promise<boolean>;

  // Order management
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Delivery agent management
  getDeliveryAgents(): Promise<DeliveryAgent[]>;
  getAvailableAgents(): Promise<DeliveryAgent[]>;
  assignAgent(orderId: number, agentId: number): Promise<boolean>;
  updateAgentLocation(agentId: number, latitude: number, longitude: number): Promise<boolean>;

  // Compliance logging
  logComplianceEvent(event: Omit<ComplianceLog, 'id' | 'timestamp'>): Promise<ComplianceLog>;
  getComplianceLogs(orderId?: number, userId?: number): Promise<ComplianceLog[]>;

  // Analytics
  getDailyStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    activeDeliveries: number;
    complianceScore: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async verifyUser(id: number): Promise<boolean> {
    const [user] = await db
      .update(users)
      .set({ isVerified: true, kycStatus: "verified", updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return !!user;
  }

  async getUserAddresses(userId: number): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db
      .insert(addresses)
      .values(address)
      .returning();
    return newAddress;
  }

  async updateAddress(id: number, updates: Partial<Address>): Promise<Address | undefined> {
    const [address] = await db
      .update(addresses)
      .set(updates)
      .where(eq(addresses.id, id))
      .returning();
    return address || undefined;
  }

  async verifyAddress(id: number): Promise<boolean> {
    const [address] = await db
      .update(addresses)
      .set({ isVerified: true })
      .where(eq(addresses.id, id))
      .returning();
    return !!address;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(and(eq(products.category, category), eq(products.isActive, true)));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async updateProductStock(id: number, quantity: number): Promise<boolean> {
    const [product] = await db
      .update(products)
      .set({ stock: sql`${products.stock} - ${quantity}` })
      .where(eq(products.id, id))
      .returning();
    return !!product;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order || undefined;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return item;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async getDeliveryAgents(): Promise<DeliveryAgent[]> {
    return await db.select().from(deliveryAgents).where(eq(deliveryAgents.isActive, true));
  }

  async getAvailableAgents(): Promise<DeliveryAgent[]> {
    return await db.select().from(deliveryAgents)
      .where(and(
        eq(deliveryAgents.isActive, true),
        // Add logic for agents not currently on delivery
      ));
  }

  async assignAgent(orderId: number, agentId: number): Promise<boolean> {
    const [order] = await db
      .update(orders)
      .set({ agentId, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return !!order;
  }

  async updateAgentLocation(agentId: number, latitude: number, longitude: number): Promise<boolean> {
    const [agent] = await db
      .update(deliveryAgents)
      .set({ 
        currentLatitude: latitude.toString(),
        currentLongitude: longitude.toString(),
        lastLocationUpdate: new Date()
      })
      .where(eq(deliveryAgents.id, agentId))
      .returning();
    return !!agent;
  }

  async logComplianceEvent(event: Omit<ComplianceLog, 'id' | 'timestamp'>): Promise<ComplianceLog> {
    const [log] = await db
      .insert(complianceLog)
      .values(event)
      .returning();
    return log;
  }

  async getComplianceLogs(orderId?: number, userId?: number): Promise<ComplianceLog[]> {
    let query = db.select().from(complianceLog);
    
    if (orderId) {
      query = query.where(eq(complianceLog.orderId, orderId));
    } else if (userId) {
      query = query.where(eq(complianceLog.userId, userId));
    }
    
    return await query.orderBy(desc(complianceLog.timestamp));
  }

  async getDailyStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    activeDeliveries: number;
    complianceScore: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const todayOrders = await db.select()
      .from(orders)
      .where(and(
        gte(orders.createdAt, today),
        lte(orders.createdAt, tomorrow)
      ));

    // Calculate revenue
    const totalRevenue = todayOrders.reduce((sum, order) => 
      sum + parseFloat(order.totalAmount), 0);

    // Get active deliveries
    const activeDeliveries = await db.select()
      .from(orders)
      .where(eq(orders.status, "out_for_delivery"));

    // Calculate compliance score (simplified)
    const verifiedUsers = await db.select()
      .from(users)
      .where(eq(users.isVerified, true));
    
    const totalUsers = await db.select().from(users);
    const complianceScore = totalUsers.length > 0 ? 
      (verifiedUsers.length / totalUsers.length) * 100 : 100;

    return {
      totalOrders: todayOrders.length,
      totalRevenue,
      activeDeliveries: activeDeliveries.length,
      complianceScore: Math.round(complianceScore * 10) / 10
    };
  }
}

export const storage = new DatabaseStorage();
