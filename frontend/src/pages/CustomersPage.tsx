import { useState, useEffect } from 'react';
import { customerApi } from '../services/api';
import type { Customer, CreateCustomer } from '../types';
import CustomerForm from '../components/customers/CustomerForm';
import './CustomersPage.css';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getAll();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (customer: CreateCustomer) => {
    await customerApi.create(customer);
    await loadCustomers();
    setShowForm(false);
  };

  const handleUpdate = async (customer: CreateCustomer) => {
    if (editingCustomer) {
      await customerApi.update(editingCustomer.id, customer);
      await loadCustomers();
      setEditingCustomer(undefined);
      setShowForm(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerApi.delete(id);
        await loadCustomers();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete customer');
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCustomer(undefined);
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  if (showForm) {
    return (
      <div className="customers-page">
        <CustomerForm
          customer={editingCustomer}
          onSubmit={editingCustomer ? handleUpdate : handleCreate}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Customers</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Add Customer
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {customers.length === 0 ? (
        <div className="empty-state">
          <p>No customers yet. Add your first customer to get started!</p>
        </div>
      ) : (
        <div className="customers-grid">
          {customers.map((customer) => (
            <div key={customer.id} className="customer-card">
              <div className="customer-header">
                <h3>{customer.firstName} {customer.lastName}</h3>
              </div>
              <div className="customer-details">
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span>{customer.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span>{customer.phone}</span>
                </div>
                {customer.address && (
                  <div className="detail-row">
                    <span className="label">Address:</span>
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>
              <div className="customer-actions">
                <button onClick={() => handleEdit(customer)} className="btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(customer.id)} className="btn-danger">
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
