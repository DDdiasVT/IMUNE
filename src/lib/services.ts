import { supabase } from './supabase';
import { Client, Service, Sale, Task, Lead } from '@/types';

export const db = {
  clients: {
    async list() {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Client[];
    },
    async create(client: Partial<Client>) {
      const { data, error } = await supabase.from('clients').insert(client).select().single();
      if (error) throw error;
      return data as Client;
    },
    async update(id: string, updates: Partial<Client>) {
      const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Client;
    },
    async delete(id: string) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    }
  },

  services: {
    async list() {
      const { data, error } = await supabase.from('services').select('*');
      if (error) throw error;
      return data as Service[];
    },
    async create(service: Partial<Service>) {
      const { data, error } = await supabase.from('services').insert(service).select().single();
      if (error) throw error;
      return data as Service;
    },
    async delete(id: string) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    }
  },

  sales: {
    async list() {
      const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Sale[];
    },
    async create(sale: Partial<Sale>) {
      const { data, error } = await supabase.from('sales').insert(sale).select().single();
      if (error) throw error;
      return data as Sale;
    },
    async update(id: string, updates: Partial<Sale>) {
      const { data, error } = await supabase.from('sales').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Sale;
    },
    async delete(id: string) {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
    }
  },

  tasks: {
    async list() {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
    async create(task: Partial<Task>) {
      const { data, error } = await supabase.from('tasks').insert(task).select().single();
      if (error) throw error;
      return data as Task;
    },
    async update(id: string, updates: Partial<Task>) {
      const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Task;
    },
    async delete(id: string) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    }
  },

  leads: {
    async list() {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
    async create(lead: Partial<Lead>) {
      const { data, error } = await supabase.from('leads').insert(lead).select().single();
      if (error) throw error;
      return data as Lead;
    },
    async update(id: string, updates: Partial<Lead>) {
      const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Lead;
    },
    async delete(id: string) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    }
  }
};
