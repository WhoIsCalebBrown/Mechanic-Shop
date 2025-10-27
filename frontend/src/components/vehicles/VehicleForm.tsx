import { useState, useEffect } from 'react';
import { customerApi } from '../../services/api';
import { vehicleDataService } from '../../services/vehicleData';
import type { Vehicle, CreateVehicle, Customer } from '../../types';
import '../customers/CustomerForm.css';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (vehicle: CreateVehicle) => Promise<void>;
  onCancel: () => void;
}

export default function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years] = useState<number[]>(vehicleDataService.getYears());
  const [formData, setFormData] = useState<CreateVehicle>({
    customerId: 0,
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    licensePlate: '',
    color: '',
    mileage: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [decodingVin, setDecodingVin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
    loadMakes();
  }, []);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        customerId: vehicle.customerId,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin || '',
        licensePlate: vehicle.licensePlate || '',
        color: vehicle.color || '',
        mileage: vehicle.mileage,
      });
    }
  }, [vehicle]);

  // Load models when make or year changes
  useEffect(() => {
    if (formData.make && formData.year) {
      loadModels(formData.make, formData.year);
    } else {
      setModels([]);
    }
  }, [formData.make, formData.year]);

  const loadCustomers = async () => {
    try {
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (err) {
      setError('Failed to load customers');
    }
  };

  const loadMakes = async () => {
    try {
      const data = await vehicleDataService.getMakes();
      setMakes(data);
    } catch (err) {
      console.error('Failed to load makes:', err);
    }
  };

  const loadModels = async (make: string, year: number) => {
    try {
      const data = await vehicleDataService.getModels(make, year);
      setModels(data);
    } catch (err) {
      console.error('Failed to load models:', err);
      setModels([]);
    }
  };

  const handleDecodeVin = async () => {
    if (!formData.vin || formData.vin.length < 11) {
      setError('VIN must be at least 11 characters');
      return;
    }

    setDecodingVin(true);
    setError(null);

    try {
      const decoded = await vehicleDataService.decodeVIN(formData.vin);

      if (decoded.make || decoded.model || decoded.year) {
        setFormData({
          ...formData,
          make: decoded.make || formData.make,
          model: decoded.model || formData.model,
          year: decoded.year || formData.year,
        });
        setError(null);
      } else {
        setError('Could not decode VIN. Please enter vehicle details manually.');
      }
    } catch (err) {
      setError('Failed to decode VIN');
    } finally {
      setDecodingVin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.customerId === 0) {
      setError('Please select a customer');
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
      <h2>{vehicle ? 'Edit Vehicle' : 'New Vehicle'}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="customerId">Customer *</label>
        <select
          id="customerId"
          value={formData.customerId}
          onChange={(e) => setFormData({ ...formData, customerId: parseInt(e.target.value) })}
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
        <label htmlFor="vin">VIN (Optional - Auto-fill vehicle details)</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            id="vin"
            value={formData.vin}
            onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
            placeholder="Enter VIN to auto-fill make/model/year"
            maxLength={17}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={handleDecodeVin}
            disabled={!formData.vin || formData.vin.length < 11 || decodingVin}
            className="btn-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            {decodingVin ? 'Decoding...' : 'Decode VIN'}
          </button>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="year">Year *</label>
          <select
            id="year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value), model: '' })}
            required
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="make">Make *</label>
          <input
            type="text"
            id="make"
            list="makes-list"
            value={formData.make}
            onChange={(e) => setFormData({ ...formData, make: e.target.value, model: '' })}
            placeholder="Start typing to see suggestions"
            required
          />
          <datalist id="makes-list">
            {makes.map((make) => (
              <option key={make} value={make} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="model">Model *</label>
          <input
            type="text"
            id="model"
            list="models-list"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder={formData.make ? 'Start typing to see models' : 'Select make first'}
            disabled={!formData.make}
            required
          />
          <datalist id="models-list">
            {models.map((model) => (
              <option key={model} value={model} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="color">Color</label>
          <input
            type="text"
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="e.g., Black, White, Silver"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="licensePlate">License Plate</label>
          <input
            type="text"
            id="licensePlate"
            value={formData.licensePlate}
            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
            placeholder="e.g., ABC1234"
          />
        </div>

        <div className="form-group">
          <label htmlFor="mileage">Mileage</label>
          <input
            type="number"
            id="mileage"
            value={formData.mileage || ''}
            onChange={(e) => setFormData({ ...formData, mileage: e.target.value ? parseInt(e.target.value) : undefined })}
            min={0}
            placeholder="Current odometer reading"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : vehicle ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
