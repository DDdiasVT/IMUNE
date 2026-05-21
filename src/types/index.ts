export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'member' | 'client';
  role_description?: string | null; // Ex: Gestor de Tráfego, CEO, etc.
  client_id?: string | null; // Vincula o usuário a um cliente específico
  updated_at: string;
};

export type Client = {
  id: string;
  name: string;
  logo_url: string | null;
  niche: string | null;
  status: 'active' | 'inactive' | 'paused';
  entry_date: string;
  responsible_id: string | null;
  contract_url: string | null;
  access_info: string | null;
  notes: string | null;
  created_at: string;
};

export type Salesperson = {
  id: string;
  profile?: Profile;
  commission_percentage: number;
  monthly_goal: number;
  revenue: number;
  commission_accumulated: number;
  sales_closed: number;
  ticket_average: number;
  conversion_rate: number;
  ranking: number;
};

export type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
  operational_cost: number;
  margin: number;
  is_recurring: boolean;
  description: string | null;
  operational_responsible_id: string | null;
};

export type Sale = {
  id: string;
  client_id: string | null;
  salesperson_id: string;
  service_id: string;
  value: number;
  discount: number;
  commission_value: number;
  status: 'proposal' | 'negotiation' | 'closed' | 'lost';
  is_recurring: boolean;
  closing_date: string | null;
  created_at: string;
};

export type SaleGoal = {
  id: string;
  salesperson_id: string;
  period_start: string;
  period_end: string;
  target_value: number;
  prize_description: string | null;
  achieved_value: number;
  is_completed: boolean;
};

export type Project = {
  id: string;
  client_id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export type Campaign = {
  id: string;
  client_id: string | null;
  project_id: string | null;
  name: string;
  description: string | null;
  objective: string | null;
  platform: string | null;
  status: string;
  budget: number | null;
  spent: number | null;
  leads_actual: number | null;
  roas_actual: number | null;
  revenue_actual: number | null;
  goal_leads: number | null;
  goal_cpl: number | null;
  goal_roas: number | null;
  goal_revenue: number | null;
  start_date: string | null;
  end_date: string | null;
  manager_url: string | null;
  copy_url: string | null;
  creatives_url: string | null;
  metrics_info: any;
  results_summary: string | null;
  created_at: string;
  updated_at: string | null;
};

export type CampaignMember = {
  id: string;
  campaign_id: string;
  name: string;
  role: string;
  created_at: string;
};

export type Lead = {
  id: string;
  client_id: string | null;
  name: string;
  phone: string | null;
  instagram: string | null;
  source: string | null;
  notes: string | null;
  status: 'new_lead' | 'contact_initiated' | 'qualified' | 'scheduled' | 'closed' | 'lost';
  tags: string[];
  assigned_to: string | null;
  potential_value?: number;
  salesperson_id?: string | null;
  created_at: string;
};

export type ContentItem = {
  id: string;
  client_id: string | null;
  project_id: string | null;
  title: string;
  type: string | null;
  status: string;
  assigned_to: string | null;
  planned_date: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  client_id: string | null;
  project_id: string | null;
  campaign_id: string | null;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  assigned_to: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
};

export type Metric = {
  id: string;
  client_id: string | null;
  period_date: string;
  followers?: number;
  growth_rate?: number;
  leads_count?: number;
  investment?: number;
  cpl?: number;
  cac?: number;
  roas?: number;
  revenue?: number;
  closing_rate?: number;
  content_count?: number;
  active_campaigns?: number;
  created_at: string;
};
