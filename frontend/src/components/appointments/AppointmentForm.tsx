import { useState, useEffect } from 'react';
import { customerApi, vehicleApi } from '../../services/api';
import type { Appointment, CreateAppointment, Customer, Vehicle, AppointmentStatus } from '../../types';
import '../customers/CustomerForm.css';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSubmit: (appointment: CreateAppointment) => Promise<void>;
  onCancel: () => void;
}

export default function AppointmentForm({ appointment, onSubmit, onCancel }: AppointmentFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState<CreateAppointment>({
    customerId: 0,
    vehicleId: 0,
    scheduledDate: new Date().toISOString().slice(0, 16),
    serviceType: '',
    description: '',
    status: 'Scheduled' as AppointmentStatus,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (appointment) {
      setFormData({
        customerId: appointment.customerId,
        vehicleId: appointment.vehicleId,
        scheduledDate: new Date(appointment.scheduledDate).toISOString().slice(0, 16),
        serviceType: appointment.serviceType,
        description: appointment.description || '',
        status: appointment.status,
        notes: appointment.notes || '',
      });
    }
  }, [appointment]);

  useEffect(() => {
    if (formData.customerId) {
      const customerVehicles = vehicles.filter((v) => v.customerId === formData.customerId);
      setFilteredVehicles(customerVehicles);
    } else {
      setFilteredVehicles([]);
    }
  }, [formData.customerId, vehicles]);

  const loadData = async () => {
    try {
      const [customersData, vehiclesData] = await Promise.all([
        customerApi.getAll(),
        vehicleApi.getAll(),
      ]);
      setCustomers(customersData);
      setVehicles(vehiclesData);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.customerId === 0 || formData.vehicleId === 0) {
      setError('Please select a customer and vehicle');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="customer-form">
      <h2>{appointment ? 'Edit Appointment' : 'New Appointment'}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="customerId">Customer *</label>
          <select
            id="customerId"
            value={formData.customerId}
            onChange={(e) => {
              setFormData({ ...formData, customerId: parseInt(e.target.value), vehicleId: 0 });
            }}
            required
          >
            <option value={0}>Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.firstName} {customer.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="vehicleId">Vehicle *</label>
          <select
            id="vehicleId"
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: parseInt(e.target.value) })}
            required
            disabled={!formData.customerId}
          >
            <option value={0}>Select a vehicle</option>
            {filteredVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="scheduledDate">Scheduled Date *</label>
          <input
            type="datetime-local"
            id="scheduledDate"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
          >
            <option value="Scheduled">Scheduled</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="NoShow">No Show</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="serviceType">Service Type *</label>
        <input
          type="text"
          id="serviceType"
          value={formData.serviceType}
          onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
          placeholder="e.g., Oil Change, Brake Service, Tire Rotation"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : appointment ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
