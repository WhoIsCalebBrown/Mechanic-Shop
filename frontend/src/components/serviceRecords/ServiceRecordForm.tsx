import { useState, useEffect } from 'react';
import { vehicleApi } from '../../services/api';
import type { ServiceRecord, CreateServiceRecord, Vehicle } from '../../types';
import '../customers/CustomerForm.css';

interface ServiceRecordFormProps {
  serviceRecord?: ServiceRecord;
  onSubmit: (record: CreateServiceRecord) => Promise<void>;
  onCancel: () => void;
}

export default function ServiceRecordForm({ serviceRecord, onSubmit, onCancel }: ServiceRecordFormProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState<CreateServiceRecord>({
    vehicleId: 0,
    serviceDate: new Date().toISOString().slice(0, 10),
    serviceType: '',
    description: '',
    laborCost: 0,
    partsCost: 0,
    mileageAtService: undefined,
    technicianName: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (serviceRecord) {
      setFormData({
        vehicleId: serviceRecord.vehicleId,
        serviceDate: new Date(serviceRecord.serviceDate).toISOString().slice(0, 10),
        serviceType: serviceRecord.serviceType,
        description: serviceRecord.description,
        laborCost: serviceRecord.laborCost,
        partsCost: serviceRecord.partsCost,
        mileageAtService: serviceRecord.mileageAtService,
        technicianName: serviceRecord.technicianName || '',
        notes: serviceRecord.notes || '',
      });
    }
  }, [serviceRecord]);

  const loadVehicles = async () => {
    try {
      const data = await vehicleApi.getAll();
      setVehicles(data);
    } catch (err) {
      setError('Failed to load vehicles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.vehicleId === 0) {
      setError('Please select a vehicle');
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

  const totalCost = formData.laborCost + formData.partsCost;

  return (
    <form onSubmit={handleSubmit} className="customer-form">
      <h2>{serviceRecord ? 'Edit Service Record' : 'New Service Record'}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="vehicleId">Vehicle *</label>
          <select
            id="vehicleId"
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: parseInt(e.target.value) })}
            required
          >
            <option value={0}>Select a vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="serviceDate">Service Date *</label>
          <input
            type="date"
            id="serviceDate"
            value={formData.serviceDate}
            onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
            required
          />
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
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="laborCost">Labor Cost ($) *</label>
          <input
            type="number"
            id="laborCost"
            value={formData.laborCost}
            onChange={(e) => setFormData({ ...formData, laborCost: parseFloat(e.target.value) || 0 })}
            min={0}
            step={0.01}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="partsCost">Parts Cost ($) *</label>
          <input
            type="number"
            id="partsCost"
            value={formData.partsCost}
            onChange={(e) => setFormData({ ...formData, partsCost: parseFloat(e.target.value) || 0 })}
            min={0}
            step={0.01}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Total Cost</label>
        <div style={{ padding: '0.75rem', backgroundColor: '#ecf0f1', borderRadius: '4px', fontWeight: 'bold' }}>
          ${totalCost.toFixed(2)}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="mileageAtService">Mileage at Service</label>
          <input
            type="number"
            id="mileageAtService"
            value={formData.mileageAtService || ''}
            onChange={(e) => setFormData({ ...formData, mileageAtService: e.target.value ? parseInt(e.target.value) : undefined })}
            min={0}
          />
        </div>

        <div className="form-group">
          <label htmlFor="technicianName">Technician Name</label>
          <input
            type="text"
            id="technicianName"
            value={formData.technicianName}
            onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
          />
        </div>
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
          {loading ? 'Saving...' : serviceRecord ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
