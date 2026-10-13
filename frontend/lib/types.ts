export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at?: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  company_id?: string | null;
  position?: string | null;
  source?: string | null;
  status: "lead" | "active" | "vip" | "churned" | string;
  tags?: string[];
  assigned_to?: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  bin_iin?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  industry?: string | null;
  company_type: "customer" | "partner" | "vendor" | string;
  assigned_to?: string | null;
  created_at: string;
}

export interface Deal {
  id: string;
  title: string;
  amount: number;
  currency: string;
  stage: "new" | "qualification" | "proposal" | "negotiation" | "won" | "lost" | string;
  pipeline_id?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  assigned_to?: string | null;
  status: "open" | "won" | "lost" | string;
  priority: "low" | "medium" | "high" | string;
  expected_close_date?: string | null;
  items?: any[];
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  task_type: "call" | "meeting" | "task" | "email" | string;
  priority: "low" | "medium" | "high" | "urgent" | string;
  status: "new" | "in_progress" | "completed" | "overdue" | string;
  due_date?: string | null;
  contact_id?: string | null;
  deal_id?: string | null;
  assigned_to: string;
  created_by?: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  channel: "whatsapp" | "telegram" | "instagram" | "email" | "webchat" | string;
  direction: "inbound" | "outbound";
  status: "queued" | "sent" | "delivered" | "read" | "failed" | string;
  contact_id?: string | null;
  sender_external_id?: string | null;
  recipient_external_id?: string | null;
  text_content?: string | null;
  media_url?: string | null;
  is_ai_generated: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category?: string | null;
  price: number;
  cost_price?: number | null;
  min_stock: number;
  is_active: boolean;
  stock_count?: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  status: "draft" | "issued" | "paid" | "cancelled" | string;
  contact_id?: string | null;
  company_id?: string | null;
  deal_id?: string | null;
  items?: Array<{ name: string; quantity: number; price: number; total: number }>;
  subtotal: number;
  tax_amount: number;
  total: number;
  currency: string;
  invoice_date?: string | null;
  due_date?: string | null;
  paid_at?: string | null;
  created_at: string;
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: "active" | "inactive";
  colorScheme: "blue-cyan" | "green-emerald" | "purple-pink" | "orange-red";
  model: string;
  totalRequests: number;
  maxRequests: number;
  avgLatency: string;
  accuracy: string;
}
