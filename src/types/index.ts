export type UserRole = 'resident' | 'admin' | 'superAdmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  unit?: string; 
  condoId?: string;
  avatar?: string;
}

export interface Condo {
  id: string;
  name: string;
  address: string;
  cnpj?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: 'maintenance' | 'suggestion' | 'complaint' | 'other';
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  userName: string;
  userUnit: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  createdAt: Date;
}

export interface Bill {
  id: string;
  month: string;
  year: number;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  pdfUrl?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: 'regulation' | 'policy' | 'minutes' | 'other';
  fileUrl: string;
  uploadedAt: Date;
}

export type LicenseStatus = 'active' | 'expired' | 'trial' | 'suspended' | 'cancelled';
export type PlanType = 'basic' | 'premium' | 'enterprise';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type ContractType = 'new' | 'renewal' | 'upgrade' | 'downgrade';
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'active' | 'expired' | 'cancelled';

export interface License {
  id: string;
  condoId: string;
  residentEmails?: string[];
  syndicEmail?: string;
  licenseKey: string;
  contractNumber: string;
  planType: PlanType;
  maxUnits: number;
  maxUsers: number;
  startDate: Date;
  expiryDate: Date;
  isActive: boolean;
  isTrial: boolean;
  trialDays?: number;
  autoRenew: boolean;
  paymentStatus: PaymentStatus;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  amount: number;
  currency: string;
  downloadLink?: string;
  downloadLinkExpiry?: Date;
  downloadCount: number;
  maxDownloads: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  notes?: string;
  status: LicenseStatus;
}

export interface Contract {
  id: string;
  licenseId: string;
  condoId: string;
  contractType: ContractType;
  status: ContractStatus;
  contractPdfUrl?: string;
  signedAt?: Date;
  signedBy?: string;
  terms: {
    duration: number;
    price: number;
    features: string[];
    restrictions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DownloadLink {
  id: string;
  licenseId: string;
  condoId: string;
  linkToken: string;
  downloadUrl: string;
  platform: 'ios' | 'android' | 'both';
  expiresAt: Date;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}
