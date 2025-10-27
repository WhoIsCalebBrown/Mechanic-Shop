import { useState, useEffect } from 'react';
import { vehicleApi, customerApi } from '../services/api';
import type { Vehicle, CreateVehicle, Customer } from '../types';
import VehicleForm from '../components/vehicles/VehicleForm';
import './CustomersPage.css';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, customersData] = await Promise.all([
        vehicleApi.getAll(),
        customerApi.getAll(),
      ]);
      setVehicles(vehiclesData);
      setCustomers(customersData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
  };

  const handleCreate = async (vehicle: CreateVehicle) => {
    await vehicleApi.create(vehicle);
    await loadData();
    setShowForm(false);
  };

  const handleUpdate = async (vehicle: CreateVehicle) => {
    if (editingVehicle) {
      await vehicleApi.update(editingVehicle.id, vehicle);
      await loadData();
      setEditingVehicle(undefined);
      setShowForm(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleApi.delete(id);
        await loadData();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete vehicle');
      }
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVehicle(undefined);
  };

  if (loading) {
    return <div className="loading">Loading vehicles...</div>;
  }

  if (showForm) {
    return (
      <div className="customers-page">
        <VehicleForm
          vehicle={editingVehicle}
          onSubmit={editingVehicle ? handleUpdate : handleCreate}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Vehicles</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Add Vehicle
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <p>No vehicles yet. Add your first vehicle to get started!</p>
        </div>
      ) : (
        <div className="customers-grid">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="customer-card">
              <div className="customer-header">
                <h3>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
              </div>
              <div className="customer-details">
                <div className="detail-row">
                  <span className="label">Owner:</span>
                  <span>{getCustomerName(vehicle.customerId)}</span>
                </div>
                {vehicle.color && (
                  <div className="detail-row">
                    <span className="label">Color:</span>
                    <span>{vehicle.color}</span>
                  </div>
                )}
                {vehicle.licensePlate && (
                  <div className="detail-row">
                    <span className="label">License Plate:</span>
                    <span>{vehicle.licensePlate}</span>
                  </div>
                )}
                {vehicle.vin && (
                  <div className="detail-row">
                    <span className="label">VIN:</span>
                    <span>{vehicle.vin}</span>
                  </div>
                )}
                {vehicle.mileage !== null && vehicle.mileage !== undefined && (
                  <div className="detail-row">
                    <span className="label">Mileage:</span>
                    <span>{vehicle.mileage.toLocaleString()} miles</span>
                  </div>
                )}
              </div>
              <div className="customer-actions">
                <button onClick={() => handleEdit(vehicle)} className="btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(vehicle.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
