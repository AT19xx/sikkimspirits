interface ComplianceEvent {
  id?: string;
  type: 'age_verification' | 'location_check' | 'kyc_completion' | 'order_created' | 'delivery_verification';
  userId?: string;
  orderId?: string;
  data: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed' | 'pending';
}

interface AgeVerificationData {
  dateOfBirth: string;
  aadhaarNumber: string;
  calculatedAge: number;
  verificationMethod: 'aadhaar' | 'manual' | 'video_kyc';
}

interface LocationVerificationData {
  latitude: number;
  longitude: number;
  address: string;
  isRestrictedZone: boolean;
  nearestRestriction?: string;
  deliveryZone?: string;
}

interface KYCCompletionData {
  aadhaarVerified: boolean;
  videoKYCCompleted: boolean;
  documentsUploaded: string[];
  biometricVerified: boolean;
}

interface OrderComplianceData {
  ageVerified: boolean;
  locationVerified: boolean;
  kycCompleted: boolean;
  dailyLimitCheck: boolean;
  exciseTaxCalculated: boolean;
  totalAlcoholVolume: number;
  previousOrdersToday: number;
}

/**
 * Central compliance manager for alcohol delivery
 */
export class ComplianceManager {
  private static instance: ComplianceManager;
  private events: ComplianceEvent[] = [];

  private constructor() {}

  static getInstance(): ComplianceManager {
    if (!ComplianceManager.instance) {
      ComplianceManager.instance = new ComplianceManager();
    }
    return ComplianceManager.instance;
  }

  /**
   * Log compliance event
   */
  async logEvent(event: Omit<ComplianceEvent, 'id' | 'timestamp'>): Promise<void> {
    const complianceEvent: ComplianceEvent = {
      ...event,
      id: generateEventId(),
      timestamp: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    };

    this.events.push(complianceEvent);

    // In production, send to backend compliance API
    try {
      await fetch('/api/compliance/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(complianceEvent)
      });
    } catch (error) {
      console.error('Failed to log compliance event:', error);
      // Store locally as backup
      this.storeEventLocally(complianceEvent);
    }
  }

  /**
   * Verify age compliance according to Sikkim Excise Act
   */
  async verifyAge(dateOfBirth: string, aadhaarNumber: string): Promise<{
    isValid: boolean;
    age: number;
    complianceData: AgeVerificationData;
    message: string;
  }> {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const isValid = age >= 21;
    const complianceData: AgeVerificationData = {
      dateOfBirth,
      aadhaarNumber: aadhaarNumber.slice(0, 4) + 'XXXX' + aadhaarNumber.slice(-4), // Masked for privacy
      calculatedAge: age,
      verificationMethod: 'aadhaar'
    };

    await this.logEvent({
      type: 'age_verification',
      data: complianceData,
      status: isValid ? 'success' : 'failed'
    });

    return {
      isValid,
      age,
      complianceData,
      message: isValid 
        ? 'Age verification successful' 
        : 'You must be 21 or older to access alcohol delivery services'
    };
  }

  /**
   * Verify location compliance
   */
  async verifyLocation(latitude: number, longitude: number, address: string): Promise<{
    isValid: boolean;
    canDeliver: boolean;
    complianceData: LocationVerificationData;
    message: string;
  }> {
    // Import geofencing functions
    const { validateLocation } = await import('./geofencing');
    
    const validation = await validateLocation({ latitude, longitude });
    
    const complianceData: LocationVerificationData = {
      latitude,
      longitude,
      address,
      isRestrictedZone: !validation.isValid,
      nearestRestriction: validation.violations[0]?.name,
      deliveryZone: validation.zone?.name
    };

    await this.logEvent({
      type: 'location_check',
      data: complianceData,
      status: validation.canDeliver ? 'success' : 'failed'
    });

    return {
      isValid: validation.isValid,
      canDeliver: validation.canDeliver,
      complianceData,
      message: validation.message
    };
  }

  /**
   * Complete KYC verification process
   */
  async completeKYC(userId: string): Promise<{
    isComplete: boolean;
    complianceData: KYCCompletionData;
    message: string;
  }> {
    // Mock KYC completion data - in production, this would verify actual documents
    const complianceData: KYCCompletionData = {
      aadhaarVerified: true,
      videoKYCCompleted: true,
      documentsUploaded: ['aadhaar_front', 'aadhaar_back', 'selfie'],
      biometricVerified: true
    };

    const isComplete = Object.values(complianceData).every(Boolean);

    await this.logEvent({
      type: 'kyc_completion',
      userId,
      data: complianceData,
      status: isComplete ? 'success' : 'failed'
    });

    return {
      isComplete,
      complianceData,
      message: isComplete 
        ? 'KYC verification completed successfully' 
        : 'KYC verification incomplete. Please complete all required steps.'
    };
  }

  /**
   * Validate order compliance before placement
   */
  async validateOrderCompliance(userId: string, orderData: {
    items: Array<{ volume: number; alcoholContent: number; quantity: number }>;
    totalAmount: number;
  }): Promise<{
    isCompliant: boolean;
    complianceData: OrderComplianceData;
    violations: string[];
    message: string;
  }> {
    const violations: string[] = [];
    
    // Calculate total alcohol volume
    const totalAlcoholVolume = orderData.items.reduce((total, item) => {
      return total + (item.volume * item.quantity);
    }, 0);

    // Check daily limit (2L as per Sikkim Excise Act)
    const dailyLimit = 2000; // 2L in ml
    const previousOrdersToday = await this.getTodayOrderVolume(userId);
    const totalVolumeToday = previousOrdersToday + totalAlcoholVolume;
    
    if (totalVolumeToday > dailyLimit) {
      violations.push(`Daily limit exceeded. Maximum ${dailyLimit}ml per day allowed.`);
    }

    // Check user verification status
    const userVerificationStatus = await this.getUserVerificationStatus(userId);
    
    if (!userVerificationStatus.ageVerified) {
      violations.push('Age verification required');
    }
    
    if (!userVerificationStatus.locationVerified) {
      violations.push('Location verification required');
    }
    
    if (!userVerificationStatus.kycCompleted) {
      violations.push('KYC verification required');
    }

    const complianceData: OrderComplianceData = {
      ageVerified: userVerificationStatus.ageVerified,
      locationVerified: userVerificationStatus.locationVerified,
      kycCompleted: userVerificationStatus.kycCompleted,
      dailyLimitCheck: totalVolumeToday <= dailyLimit,
      exciseTaxCalculated: true,
      totalAlcoholVolume,
      previousOrdersToday
    };

    const isCompliant = violations.length === 0;

    await this.logEvent({
      type: 'order_created',
      userId,
      data: { ...complianceData, violations },
      status: isCompliant ? 'success' : 'failed'
    });

    return {
      isCompliant,
      complianceData,
      violations,
      message: isCompliant 
        ? 'Order compliance validated successfully' 
        : `Compliance violations: ${violations.join(', ')}`
    };
  }

  /**
   * Calculate excise tax according to Sikkim rates
   */
  calculateExciseTax(productType: string, basePrice: number, volume: number): {
    exciseTax: number;
    gst: number;
    totalTax: number;
  } {
    // Sikkim excise tax rates (mock values - use actual rates in production)
    const exciseRates: Record<string, number> = {
      'whiskey': 0.25, // 25% of base price
      'rum': 0.25,
      'vodka': 0.25,
      'gin': 0.25,
      'brandy': 0.25,
      'wine': 0.15, // 15% for wine
      'beer': 0.10  // 10% for beer
    };

    const exciseRate = exciseRates[productType.toLowerCase()] || 0.20;
    const exciseTax = basePrice * exciseRate;
    const gst = (basePrice + exciseTax) * 0.18; // 18% GST
    const totalTax = exciseTax + gst;

    return {
      exciseTax: Math.round(exciseTax * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100
    };
  }

  /**
   * Get compliance report for a specific period
   */
  async getComplianceReport(startDate: Date, endDate: Date): Promise<{
    totalEvents: number;
    successRate: number;
    eventsByType: Record<string, number>;
    violations: ComplianceEvent[];
    recommendations: string[];
  }> {
    const filteredEvents = this.events.filter(event => 
      event.timestamp >= startDate && event.timestamp <= endDate
    );

    const totalEvents = filteredEvents.length;
    const successfulEvents = filteredEvents.filter(event => event.status === 'success').length;
    const successRate = totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0;

    const eventsByType = filteredEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const violations = filteredEvents.filter(event => event.status === 'failed');

    const recommendations = this.generateRecommendations(violations, successRate);

    return {
      totalEvents,
      successRate: Math.round(successRate * 100) / 100,
      eventsByType,
      violations,
      recommendations
    };
  }

  /**
   * Private helper methods
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  private storeEventLocally(event: ComplianceEvent): void {
    const localEvents = JSON.parse(localStorage.getItem('compliance_events') || '[]');
    localEvents.push(event);
    localStorage.setItem('compliance_events', JSON.stringify(localEvents));
  }

  private async getTodayOrderVolume(userId: string): Promise<number> {
    // Mock implementation - in production, fetch from API
    return 750; // 750ml already ordered today
  }

  private async getUserVerificationStatus(userId: string): Promise<{
    ageVerified: boolean;
    locationVerified: boolean;
    kycCompleted: boolean;
  }> {
    // Mock implementation - in production, fetch from API
    return {
      ageVerified: true,
      locationVerified: true,
      kycCompleted: true
    };
  }

  private generateRecommendations(violations: ComplianceEvent[], successRate: number): string[] {
    const recommendations: string[] = [];

    if (successRate < 90) {
      recommendations.push('Consider improving user onboarding process to reduce verification failures');
    }

    const ageVerificationFailures = violations.filter(v => v.type === 'age_verification').length;
    if (ageVerificationFailures > 5) {
      recommendations.push('Enhance age verification UI/UX to reduce user errors');
    }

    const locationFailures = violations.filter(v => v.type === 'location_check').length;
    if (locationFailures > 3) {
      recommendations.push('Review geofencing accuracy and provide clearer location guidance');
    }

    return recommendations;
  }
}

/**
 * Utility functions
 */
function generateEventId(): string {
  return 'comp_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Export singleton instance
 */
export const complianceManager = ComplianceManager.getInstance();

/**
 * Hook for React components to use compliance manager
 */
export function useCompliance() {
  return {
    verifyAge: complianceManager.verifyAge.bind(complianceManager),
    verifyLocation: complianceManager.verifyLocation.bind(complianceManager),
    completeKYC: complianceManager.completeKYC.bind(complianceManager),
    validateOrderCompliance: complianceManager.validateOrderCompliance.bind(complianceManager),
    calculateExciseTax: complianceManager.calculateExciseTax.bind(complianceManager),
    getComplianceReport: complianceManager.getComplianceReport.bind(complianceManager),
    logEvent: complianceManager.logEvent.bind(complianceManager)
  };
}
