import api from './api';
import { Subscription, CreateSubscriptionRequest, UpdateSubscriptionRequest } from '../types/apiTypes';

export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const response = await api.get('/subscriptions');
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

export const getActiveSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const response = await api.get('/subscriptions/active');
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  } catch (error) {
    console.error('Error fetching active subscriptions:', error);
    throw error;
  }
};

export const getSubscription = async (id: string): Promise<Subscription> => {
  try {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
};

export const createSubscription = async (data: CreateSubscriptionRequest): Promise<Subscription> => {
  try {
    const response = await api.post('/subscriptions', data);
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const updateSubscription = async ({ id, data }: { id: string; data: UpdateSubscriptionRequest }): Promise<Subscription> => {
  try {
    const response = await api.patch(`/subscriptions/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const deactivateSubscription = async (id: string): Promise<void> => {
  try {
    await api.delete(`/subscriptions/${id}`);
  } catch (error) {
    console.error('Error deactivating subscription:', error);
    throw error;
  }
};

export const deleteSubscriptionPermanently = async (id: string): Promise<void> => {
  try {
    await api.delete(`/subscriptions/${id}/permanent`);
  } catch (error) {
    console.error('Error permanently deleting subscription:', error);
    throw error;
  }
};

export const reactivateSubscription = async (id: string): Promise<void> => {
  try {
    await api.patch(`/subscriptions/${id}/reactivate`);
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
};