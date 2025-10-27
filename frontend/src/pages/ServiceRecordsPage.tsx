import { useState, useEffect } from 'react';
import { serviceRecordApi, vehicleApi } from '../services/api';
import type { ServiceRecord, CreateServiceRecord, Vehicle } from '../types';
import ServiceRecordForm from '../components/serviceRecords/ServiceRecordForm';
import './CustomersPage.css';

export default function ServiceRecordsPage() {
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordsData, vehiclesData] = await Promise.all([
        serviceRecordApi.getAll(),
        vehicleApi.getAll(),
      ]);
      setServiceRecords(recordsData);
      setVehicles(vehiclesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service records');
    } finally {
      setLoading(false);
    }
  };

  const getVehicleInfo = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCreate = async (record: CreateServiceRecord) => {
    await serviceRecordApi.create(record);
    await loadData();
    setShowForm(false);
  };

  const handleUpdate = async (record: CreateServiceRecord) => {
    if (editingRecord) {
      await serviceRecordApi.update(editingRecord.id, record);
      await loadData();
      setEditingRecord(undefined);
      setShowForm(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this service record?')) {
      try {
        await serviceRecordApi.delete(id);
        await loadData();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete service record');
      }
    }
  };

  const handleEdit = (record: ServiceRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRecord(undefined);
  };

  if (loading) {
    return <div className="loading">Loading service records...</div>;
  }

  if (showForm) {
    return (
      <div className="customers-page">
        <ServiceRecordForm
          serviceRecord={editingRecord}
          onSubmit={editingRecord ? handleUpdate : handleCreate}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Service Records</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Add Service Record
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {serviceRecords.length === 0 ? (
        <div className="empty-state">
          <p>No service records yet. Add your first service record to get started!</p>
        </div>
      ) : (
        <div className="customers-grid">
          {serviceRecords.map((record) => (
            <div key={record.id} className="customer-card">
              <div className="customer-header">
                <h3>{record.serviceType}</h3>
                <span style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '1.1rem' }}>
                  ${record.totalCost.toFixed(2)}
                </span>
              </div>
              <div className="customer-details">
                <div className="detail-row">
                  <span className="label">Vehicle:</span>
                  <span>{getVehicleInfo(record.vehicleId)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Service Date:</span>
                  <span>{formatDate(record.serviceDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Description:</span>
                  <span>{record.description}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Labor Cost:</span>
                  <span>${record.laborCost.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Parts Cost:</span>
                  <span>${record.partsCost.toFixed(2)}</span>
                </div>
                {record.mileageAtService && (
                  <div className="detail-row">
                    <span className="label">Mileage:</span>
                    <span>{record.mileageAtService.toLocaleString()} miles</span>
                  </div>
                )}
                {record.technicianName && (
                  <div className="detail-row">
                    <span className="label">Technician:</span>
                    <span>{record.technicianName}</span>
                  </div>
                )}
                {record.notes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span>{record.notes}</span>
                  </div>
                )}
              </div>
              <div className="customer-actions">
                <button onClick={() => handleEdit(record)} className="btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(record.id)} className="btn-danger">
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
