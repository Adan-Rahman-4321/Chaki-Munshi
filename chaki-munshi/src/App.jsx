import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import CustomerHistory from './pages/CustomerHistory';
import WheatEntry from './pages/WheatEntry';
import EditWheatEntry from './pages/EditWheatEntry';
import AttaIssue from './pages/AttaIssue';
import EditAttaIssue from './pages/EditAttaIssue';
import Transactions from './pages/Transactions';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import InvoiceDetail from './pages/InvoiceDetail';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customer/add" element={<AddCustomer />} />
              <Route path="/customer/history/:id" element={<CustomerHistory />} />
              <Route path="/wheat-entry" element={<WheatEntry />} />
              <Route path="/entry/wheat" element={<WheatEntry />} />
              <Route path="/wheat-entry/edit/:id" element={<EditWheatEntry />} />
              <Route path="/atta-issue" element={<AttaIssue />} />
              <Route path="/entry/flour" element={<AttaIssue />} />
              <Route path="/atta-issue/edit/:id" element={<EditAttaIssue />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/invoice/:id" element={<InvoiceDetail />} />
              <Route path="/invoice/:type/:id" element={<InvoiceDetail />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
