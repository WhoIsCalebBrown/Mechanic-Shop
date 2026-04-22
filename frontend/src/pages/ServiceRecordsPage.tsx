import { useMemo, useState, useEffect } from 'react';
import { serviceRecordApi, vehicleApi } from '../services/api';
import type { ServiceRecord, CreateServiceRecord, Vehicle, ServiceRecordCustomerSummary } from '../types';
import ServiceRecordForm from '../components/serviceRecords/ServiceRecordForm';
import './CustomersPage.css';

type CustomerRecordGroup = {
  key: string;
  customer: ServiceRecordCustomerSummary | null;
  vehicleLabels: string[];
  records: ServiceRecord[];
};

const RECENT_GROUP_LIMIT = 12;

export default function ServiceRecordsPage() {
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

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

  const getRecordVehicle = (record: ServiceRecord) => record.vehicle ?? vehicles.find((v) => v.id === record.vehicleId);

  const getCustomerName = (customer?: ServiceRecordCustomerSummary | null) => {
    if (!customer) return 'Unknown Customer';
    return `${customer.firstName} ${customer.lastName}`;
  };

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const groups = serviceRecords.reduce<Map<string, CustomerRecordGroup>>((acc, record) => {
      const vehicle = getRecordVehicle(record);
      const customer = vehicle?.customer ?? null;
      const key = customer?.id ? `customer-${customer.id}` : `vehicle-${record.vehicleId}`;
      const existing = acc.get(key);

      const vehicleLabel = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : getVehicleInfo(record.vehicleId);

      if (existing) {
        existing.records.push(record);
        if (!existing.vehicleLabels.includes(vehicleLabel)) {
          existing.vehicleLabels.push(vehicleLabel);
        }
        return acc;
      }

      acc.set(key, {
        key,
        customer,
        vehicleLabels: [vehicleLabel],
        records: [record],
      });
      return acc;
    }, new Map());

    const groupList = Array.from(groups.values()).map((group) => ({
      ...group,
      records: group.records.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()),
    }));

    if (!term) {
      return groupList.sort((a, b) => {
        const aDate = new Date(a.records[0]?.serviceDate ?? 0).getTime();
        const bDate = new Date(b.records[0]?.serviceDate ?? 0).getTime();
        return bDate - aDate;
      });
    }

    return groupList.filter((group) => {
      const customerText = [
        group.customer?.firstName,
        group.customer?.lastName,
        group.customer?.email,
        group.customer?.phone,
        group.customer?.address,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const recordText = group.records
        .map((record) =>
          [
            record.serviceType,
            record.description,
            record.notes,
            record.technicianName,
            record.mileageAtService?.toString(),
            getVehicleInfo(record.vehicleId),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase(),
        )
        .join(' ');

      return customerText.includes(term) || recordText.includes(term);
    });
  }, [searchTerm, serviceRecords, vehicles]);

  const hasSearch = searchTerm.trim().length > 0;
  const visibleGroups = hasSearch ? filteredGroups : filteredGroups.slice(0, RECENT_GROUP_LIMIT);

  const totalCustomers = filteredGroups.length;
  const totalRecords = filteredGroups.reduce((sum, group) => sum + group.records.length, 0);
  const hiddenCustomers = Math.max(totalCustomers - visibleGroups.length, 0);

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
        <div>
          <h1>Service Records</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#5f6b7a' }}>
            Search a customer to review the work history tied to that person and their vehicles.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Add Service Record
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="service-records-toolbar">
        <div className="service-records-search-panel">
          <div className="form-group">
            <label htmlFor="service-record-search">Search customer, vehicle, service, or note</label>
            <input
              id="service-record-search"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Try Alex, RAV4, brake, or coil..."
            />
          </div>
          <div className="stats-grid" style={{ marginTop: '1rem' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#3498db' }}>👥</div>
              <div className="stat-content">
                <div className="stat-value">{totalCustomers}</div>
                <div className="stat-label">Matching Customers</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#27ae60' }}>🧾</div>
              <div className="stat-content">
                <div className="stat-value">{totalRecords}</div>
                <div className="stat-label">Matching Service Records</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f39c12' }}>🔎</div>
              <div className="stat-content">
                <div className="stat-value">{hasSearch ? 'Filtered' : 'Recent'}</div>
                <div className="stat-label">{hasSearch ? 'View Mode' : 'Default View'}</div>
              </div>
            </div>
          </div>
          {!hasSearch && hiddenCustomers > 0 && (
            <div className="service-records-note">
              Showing the {visibleGroups.length} most recent customer histories. Search to find older records.
            </div>
          )}
        </div>
      </div>

      {serviceRecords.length === 0 ? (
        <div className="empty-state">
          <p>No service records yet. Add your first service record to get started!</p>
        </div>
      ) : visibleGroups.length === 0 ? (
        <div className="empty-state">
          <p>No matching customers or service records found.</p>
        </div>
      ) : (
        <div className="customers-grid">
          {visibleGroups.map((group) => {
            const latestRecord = group.records[0];
            return (
              <div key={group.key} className="customer-card">
                <div className="customer-header">
                  <div>
                    <h3>{getCustomerName(group.customer)}</h3>
                    {group.customer?.email && <div style={{ color: '#5f6b7a' }}>{group.customer.email}</div>}
                  </div>
                  <span style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '1rem' }}>
                    {group.records.length} record{group.records.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="customer-details">
                  <div className="detail-row">
                    <span className="label">Vehicles:</span>
                    <span>{group.vehicleLabels.join(', ')}</span>
                  </div>
                  {group.customer?.phone && (
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span>{group.customer.phone}</span>
                    </div>
                  )}
                  {group.customer?.address && (
                    <div className="detail-row">
                      <span className="label">Address:</span>
                      <span>{group.customer.address}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Last Visit:</span>
                    <span>{latestRecord ? formatDate(latestRecord.serviceDate) : 'Unknown'}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
                  {group.records.map((record) => {
                    const vehicle = getRecordVehicle(record);
                    return (
                      <div
                        key={record.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '1rem',
                          background: '#fdfdfd',
                        }}
                      >
                        <div className="customer-header" style={{ marginBottom: '0.75rem' }}>
                          <div>
                            <h3 style={{ marginBottom: 0 }}>{record.serviceType}</h3>
                            <div style={{ color: '#5f6b7a', fontSize: '0.95rem' }}>
                              {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : `Vehicle #${record.vehicleId}`}
                            </div>
                          </div>
                          <span style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '1.05rem' }}>
                            ${record.totalCost.toFixed(2)}
                          </span>
                        </div>

                        <div className="customer-details">
                          <div className="detail-row">
                            <span className="label">Service Date:</span>
                            <span>{formatDate(record.serviceDate)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Description:</span>
                            <span>{record.description}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Labor/Parts:</span>
                            <span>
                              ${record.laborCost.toFixed(2)} / ${record.partsCost.toFixed(2)}
                            </span>
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
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
