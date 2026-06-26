const BASE_URL = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
}

export const api = {
  // Dashboard
  getDashboard: () => fetch(`${BASE_URL}/dashboard`).then(handleResponse),

  // Customers
  getCustomers: (search = '') => {
    const url = search ? `${BASE_URL}/customers?search=${encodeURIComponent(search)}` : `${BASE_URL}/customers`;
    return fetch(url).then(handleResponse);
  },
  getCustomer: (id) => fetch(`${BASE_URL}/customers/${id}`).then(handleResponse),
  createCustomer: (data) => fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateCustomer: (id, data) => fetch(`${BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteCustomer: (id) => fetch(`${BASE_URL}/customers/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  getCustomerHistory: (id) => fetch(`${BASE_URL}/customers/${id}/history`).then(handleResponse),

  // Wheat Entries
  getWheatEntries: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${BASE_URL}/wheat-entries?${params.toString()}`).then(handleResponse);
  },
  getWheatEntry: (id) => fetch(`${BASE_URL}/wheat-entries/${id}`).then(handleResponse),
  createWheatEntry: (data) => fetch(`${BASE_URL}/wheat-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateWheatEntry: (id, data) => fetch(`${BASE_URL}/wheat-entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteWheatEntry: (id) => fetch(`${BASE_URL}/wheat-entries/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Atta Issues
  getAttaIssues: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${BASE_URL}/atta-issues?${params.toString()}`).then(handleResponse);
  },
  getAttaIssue: (id) => fetch(`${BASE_URL}/atta-issues/${id}`).then(handleResponse),
  createAttaIssue: (data) => fetch(`${BASE_URL}/atta-issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateAttaIssue: (id, data) => fetch(`${BASE_URL}/atta-issues/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteAttaIssue: (id) => fetch(`${BASE_URL}/atta-issues/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Expenses
  getExpenses: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${BASE_URL}/expenses?${params.toString()}`).then(handleResponse);
  },
  createExpense: (data) => fetch(`${BASE_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateExpense: (id, data) => fetch(`${BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteExpense: (id) => fetch(`${BASE_URL}/expenses/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Reports
  getDailyReport: (date) => fetch(`${BASE_URL}/reports/daily?date=${date}`).then(handleResponse),
  getMonthlyReport: (year, month) => fetch(`${BASE_URL}/reports/monthly?year=${year}&month=${month}`).then(handleResponse),
  getYearlyReport: (year) => fetch(`${BASE_URL}/reports/yearly?year=${year}`).then(handleResponse),
};
