import { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Top Bar & Navigation
    appName: 'Chaki Munshi',
    urduBtn: 'اردو',
    englishBtn: 'English',
    statsTab: 'Stats',
    customersTab: 'Customers',
    entriesTab: 'Entries',
    reportsTab: 'Reports',
    settingsTab: 'Settings',

    // Dashboard
    greeting: 'Saif ur Rehman',
    dashboardSub: "Here is your mill's performance for today.",
    todaysWheat: "TODAY'S WHEAT",
    todaysFlour: "TODAY'S FLOUR",
    totalSales: 'TOTAL SALES',
    pendingPayments: 'PENDING PAYMENTS',
    recentEntries: 'Recent Entries',
    newEntryBtn: 'New Entry',
    viewAllBtn: 'View All',
    grindingTrends: 'Grinding Trends',
    last7Days: 'Last 7 days performance',
    detailsBtn: 'Details',
    avgFlour: 'Avg: {val}kg',
    salesTransCount: 'From {count} Transactions Today',

    // Customers Page
    customersTitle: 'Customers Directory',
    searchPlaceholder: 'Search customer by name or phone...',
    addCustomerBtn: 'Add Customer',
    noCustomers: 'No customers found.',
    addOneNow: 'Add a new customer to get started.',
    phoneLabel: 'Phone',
    addressLabel: 'Address',
    wheatBalance: 'Wheat Bal',
    pendingBalance: 'Pending Bal',
    historyBtn: 'History',
    totalDeposits: 'Total Wheat Deposited',
    totalIssued: 'Total Flour Issued',

    // Add Customer Form
    addCustomerTitle: 'Add New Customer',
    editCustomerTitle: 'Edit Customer Details',
    custName: 'Customer Name',
    custPhone: 'Phone Number',
    custAddress: 'Residential Address',
    saving: 'Saving...',
    saveBtn: 'Save Customer',

    // Customer History Detail
    custHistoryTitle: 'Customer Ledger',
    sinceLabel: 'Registered Since',
    overview: 'Overview',
    totalPaid: 'Total Paid',
    tabWheatEntries: 'Wheat Entries',
    tabFlourIssues: 'Flour Distributions',
    sendReminderBtn: 'Send Reminder',
    noHistory: 'No transaction history found for this customer.',

    // Wheat Entry Form
    wheatEntryTitle: 'Wheat Intake (Gandam)',
    entryStatus: 'ENTRY STATUS',
    newRecordBadge: 'New Record',
    intakeSubText: 'Fill out the details below to log a new wheat intake.',
    selectCustomer: 'Select a Customer',
    selectCustomerPlaceholder: 'Choose a customer...',
    totalWeight: 'Total Weight (kg)',
    cleaningWeight: 'Cleaning Weight (kg)',
    netWeight: 'NET WEIGHT',
    notes: 'Internal Notes (Optional)',
    notesPlaceholder: 'Any specific instructions, bag count, etc.',
    saveAndPrint: 'Save & Print Receipt',
    weightCalculations: 'Precision weighing ensures customer trust.',
    validationWeight: 'Cleaning weight cannot be larger than total weight.',

    // Atta Issue (Flour Distribution) Form
    attaIssueTitle: 'Atta Issue (Flour)',
    attaIssueSub: 'Issue flour from client deposit balance or direct sale.',
    linkWheatEntry: 'Link with Wheat Entry (Optional)',
    linkWheatPlaceholder: 'Select wheat deposit to draw from...',
    flourQty: 'Flour Quantity (kg)',
    ratePerKg: 'Rate per kg (Rs.)',
    totalAmount: 'TOTAL AMOUNT',
    paymentMethod: 'Payment Method',
    paidAmount: 'Paid Amount (Rs.)',
    remainingBalance: 'REMAINING BALANCE',
    cash: 'Cash',
    online: 'Online',
    credit: 'Credit (Udhaar)',
    saveIssueBtn: 'Issue Flour & Print',
    directPurchase: 'Direct Purchase (No linked deposit)',

    // Transactions Page
    transactionsTitle: 'Ledger Records',
    allTab: 'All',
    wheatTab: 'Wheat Intake',
    flourTab: 'Flour Issued',
    filtersTitle: 'Filter Transactions',
    filterByDate: 'Filter by Date',
    filterByInvoice: 'Search Invoice No.',
    clearFilters: 'Clear Filters',
    noTransactions: 'No transaction records found.',

    // Reports Page
    reportsTitle: 'Business Analytics',
    dailyTab: 'Daily',
    monthlyTab: 'Monthly',
    yearlyTab: 'Yearly',
    wheatReceivedVal: 'Wheat Received',
    flourIssuedVal: 'Flour Issued',
    totalEarningsVal: 'Total Sales',
    cleaningLossVal: 'Cleaning Waste',
    expensesVal: 'Operating Expenses',
    netProfitVal: 'Net Profit',
    expensesBreakdown: 'Expenses Breakdown',
    noExpenses: 'No expenses logged in this period.',
    exportReport: 'Export Report',

    // Settings Page
    settingsTitle: 'Mill Settings',
    millInfo: 'Mill Information',
    millNameLabel: 'Flour Mill Name',
    themeLabel: 'Application Theme',
    languageLabel: 'Select Language',
    aboutLabel: 'About Chaki Munshi',
    aboutText: 'Chaki Munshi is a premium management system designed specifically for flour mill operations, featuring bilingual support, offline-ready caching, expense logging, and instant ledger printing.',
    exportData: 'Backup & Export Data',
    exportDataBtn: 'Download Database Backup',
    importDataBtn: 'Restore from Backup',
    systemConfig: 'System Configurations',

    // Expense Page
    expenseTitle: 'Expense Tracker',
    addExpenseBtn: 'Add Expense',
    addExpenseTitle: 'Record Mill Expense',
    expCategory: 'Expense Category',
    expAmount: 'Amount (Rs.)',
    expDescription: 'Description / Remarks',
    expPlaceholder: 'Electricity bill, repair charges, wages...',
    electricity: 'Electricity',
    labor: 'Labor / Wages',
    maintenance: 'Maintenance & Repair',
    fuel: 'Fuel / Diesel',
    other: 'Other Expenses',
    monthlyExpenseTotal: 'Monthly Expenses Total',
    noExpensesLogged: 'No expenses found.',

    // Invoice Detail Page
    invoiceTitle: 'Transaction Receipt',
    dateLabel: 'Date & Time',
    invoiceNoLabel: 'Invoice No',
    verifiedReceipt: 'VERIFIED MILL RECEIPT',
    printBtn: 'Print / Print PDF',
    downloadPdfBtn: 'Download PDF',
    sendWhatsAppReminder: 'WhatsApp Reminder',
    verifyMsg: 'Scan to verify this transaction on Chaki Munshi.',
    remainingAmount: 'Remaining Udhaar',

    // Common Actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    loading: 'Loading...',
    status: 'Status',
    paid: 'PAID',
    udhaar: 'UDHAAR',
    completed: 'COMPLETED',
    kg: 'kg',
    rs: 'Rs.',
  },
  ur: {
    // Top Bar & Navigation
    appName: 'چاکی منشی',
    urduBtn: 'اردو',
    englishBtn: 'English',
    statsTab: 'اعداد و شمار',
    customersTab: 'گاہک',
    entriesTab: 'اندراجات',
    reportsTab: 'رپورٹس',
    settingsTab: 'سیٹنگز',

    // Dashboard
    greeting: 'سیف الرحمن',
    dashboardSub: 'آج آپ کی مل کی کارکردگی درج ذیل ہے۔',
    todaysWheat: 'آج کی گندم',
    todaysFlour: 'آج کا آٹا',
    totalSales: 'کل فروخت',
    pendingPayments: 'بقایا جات (ادھار)',
    recentEntries: 'حالیہ اندراجات',
    newEntryBtn: 'نیا اندراج',
    viewAllBtn: 'سب دیکھیں',
    grindingTrends: 'پیسائی کا رجحان',
    last7Days: 'گزشتہ 7 دنوں کی کارکردگی',
    detailsBtn: 'تفصیلات',
    avgFlour: 'اوسط: {val} کلو',
    salesTransCount: 'آج کی {count} ٹرانزیکشنز سے',

    // Customers Page
    customersTitle: 'گاہکوں کی ڈائریکٹری',
    searchPlaceholder: 'گاہک کا نام یا فون نمبر تلاش کریں...',
    addCustomerBtn: 'گاہک شامل کریں',
    noCustomers: 'کوئی گاہک نہیں ملا۔',
    addOneNow: 'کام شروع کرنے کے لیے نیا گاہک شامل کریں۔',
    phoneLabel: 'فون',
    addressLabel: 'پتہ',
    wheatBalance: 'گندم بقایا',
    pendingBalance: 'ادھار بقایا',
    historyBtn: 'کھاتہ دیکھیں',
    totalDeposits: 'کل جمع شدہ گندم',
    totalIssued: 'کل جاری شدہ آٹا',

    // Add Customer Form
    addCustomerTitle: 'نیا گاہک شامل کریں',
    editCustomerTitle: 'گاہک کی تفصیلات تبدیل کریں',
    custName: 'گاہک کا نام',
    custPhone: 'فون نمبر',
    custAddress: 'رہائشی پتہ',
    saving: 'محفوظ ہو رہا ہے...',
    saveBtn: 'گاہک محفوظ کریں',

    // Customer History Detail
    custHistoryTitle: 'گاہک کا لیجر (کھاتہ)',
    sinceLabel: 'رجسٹریشن کی تاریخ',
    overview: 'خلاصہ',
    totalPaid: 'کل وصول شدہ',
    tabWheatEntries: 'گندم کے اندراجات',
    tabFlourIssues: 'آٹا کی تقسیم',
    sendReminderBtn: 'یاد دہانی بھیجیں',
    noHistory: 'اس گاہک کی کوئی لین دین کی تاریخ نہیں ملی۔',

    // Wheat Entry Form
    wheatEntryTitle: 'گندم کا اندراج',
    entryStatus: 'حیثیت',
    newRecordBadge: 'نیا اندراج',
    intakeSubText: 'گندم کا نیا اندراج کرنے کے لیے نیچے دی گئی تفصیلات درج کریں۔',
    selectCustomer: 'گاہک کا انتخاب کریں',
    selectCustomerPlaceholder: 'گاہک منتخب کریں...',
    totalWeight: 'کل وزن (کلو)',
    cleaningWeight: 'صفائی کا وزن (کلو)',
    netWeight: 'خالص وزن (کلو)',
    notes: 'نوٹس (اختیاری)',
    notesPlaceholder: 'کوئی خاص ہدایات، بوریوں کی تعداد وغیرہ لکھیں',
    saveAndPrint: 'محفوظ کریں اور رسید پرنٹ کریں',
    weightCalculations: 'درست وزن گاہک کے اعتماد اور مل کی کارکردگی کا ضامن ہے۔',
    validationWeight: 'صفائی کا وزن کل وزن سے زیادہ نہیں ہو سکتا۔',

    // Atta Issue (Flour Distribution) Form
    attaIssueTitle: 'آٹا جاری کریں (تقسیم)',
    attaIssueSub: 'جمع شدہ گندم میں سے آٹا جاری کریں یا براہ راست فروخت کریں۔',
    linkWheatEntry: 'جمع شدہ گندم سے لنک کریں (اختیاری)',
    linkWheatPlaceholder: 'گندم کا جمع شدہ کوٹہ منتخب کریں...',
    flourQty: 'آٹے کی مقدار (کلو)',
    ratePerKg: 'ریٹ فی کلو (روپے)',
    totalAmount: 'کل رقم',
    paymentMethod: 'ادائیگی کا طریقہ',
    paidAmount: 'وصول شدہ رقم (روپے)',
    remainingBalance: 'بقایا رقم (ادھار)',
    cash: 'نقد (کیش)',
    online: 'آن لائن',
    credit: 'ادھار (کریڈٹ)',
    saveIssueBtn: 'آٹا جاری کریں اور پرنٹ کریں',
    directPurchase: 'براہ راست خریداری (بغیر جمع شدہ گندم)',

    // Transactions Page
    transactionsTitle: 'روزنامچہ (لیجر)',
    allTab: 'سب',
    wheatTab: 'گندم کی آمد',
    flourTab: 'آٹا کی نکاسی',
    filtersTitle: 'فلٹر ریکارڈز',
    filterByDate: 'تاریخ منتخب کریں',
    filterByInvoice: 'رسید نمبر تلاش کریں',
    clearFilters: 'فلٹر ختم کریں',
    noTransactions: 'کوئی لین دین کا ریکارڈ نہیں ملا۔',

    // Reports Page
    reportsTitle: 'کاروباری رپورٹس',
    dailyTab: 'روزانہ',
    monthlyTab: 'ماہانہ',
    yearlyTab: 'سالانہ',
    wheatReceivedVal: 'موصول شدہ گندم',
    flourIssuedVal: 'جاری شدہ آٹا',
    totalEarningsVal: 'کل فروخت',
    cleaningLossVal: 'صفائی کا کچرا',
    expensesVal: 'اخراجات',
    netProfitVal: 'خالص منافع',
    expensesBreakdown: 'اخراجات کی تفصیل',
    noExpenses: 'اس مدت میں کوئی اخراجات درج نہیں کیے گئے۔',
    exportReport: 'رپورٹ ڈاؤن لوڈ کریں',

    // Settings Page
    settingsTitle: 'مل کی سیٹنگز',
    millInfo: 'مل کی معلومات',
    millNameLabel: 'فلور مل کا نام',
    themeLabel: 'ایپ کا تھیم',
    languageLabel: 'زبان منتخب کریں',
    aboutLabel: 'چاکی منشی کے بارے میں',
    aboutText: 'چاکی منشی ایک جدید فلور مل مینجمنٹ سسٹم ہے جو خاص طور پر آٹا چکی کے لیے تیار کیا گیا ہے۔ اس میں اردو اور انگریزی زبانوں، آف لائن کام کرنے، اخراجات کی تفصیلات اور فوری پرنٹنگ کی سہولت موجود ہے۔',
    exportData: 'ڈیٹا کا بیک اپ',
    exportDataBtn: 'ڈیٹا بیک اپ ڈاؤن لوڈ کریں',
    importDataBtn: 'بیک اپ سے ڈیٹا بحال کریں',
    systemConfig: 'سسٹم کنفیگریشن',

    // Expense Page
    expenseTitle: 'اخراجات کا حساب',
    addExpenseBtn: 'خرچہ درج کریں',
    addExpenseTitle: 'مل کا نیا خرچہ درج کریں',
    expCategory: 'خرچے کی کیٹیگری',
    expAmount: 'رقم (روپے)',
    expDescription: 'تفصیل / ریمارکس',
    expPlaceholder: 'بجلی کا بل، مرمت کا خرچہ، مزدوری وغیرہ...',
    electricity: 'بجلی کا بل',
    labor: 'مزدوری / تنخواہ',
    maintenance: 'مرمت و دیکھ بھال',
    fuel: 'فیول / ڈیزل',
    other: 'دیگر اخراجات',
    monthlyExpenseTotal: 'ماہانہ کل اخراجات',
    noExpensesLogged: 'کوئی اخراجات درج نہیں ملے۔',

    // Invoice Detail Page
    invoiceTitle: 'ٹرانزیکشن رسید',
    dateLabel: 'تاریخ اور وقت',
    invoiceNoLabel: 'رسید نمبر',
    verifiedReceipt: 'تصدیق شدہ چکی رسید',
    printBtn: 'رسید پرنٹ کریں',
    downloadPdfBtn: 'پی ڈی ایف ڈاؤن لوڈ کریں',
    sendWhatsAppReminder: 'واٹس ایپ یاد دہانی',
    verifyMsg: 'چاکی منشی پر اس رسید کی تصدیق کے لیے اسکین کریں۔',
    remainingAmount: 'بقایا ادھار رقم',

    // Common Actions
    save: 'محفوظ کریں',
    cancel: 'منسوخ کریں',
    delete: 'حذف کریں',
    edit: 'تبدیل کریں',
    back: 'واپس',
    loading: 'لوڈنگ ہو رہی ہے...',
    status: 'حیثیت',
    paid: 'ادا شدہ',
    udhaar: 'ادھار',
    completed: 'مکمل',
    kg: 'کلو',
    rs: 'روپے',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('chaki_language');
    return saved === 'ur' ? 'ur' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('chaki_language', language);
    // Apply text direction and class to document root
    if (language === 'ur') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.classList.add('urdu-active');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.classList.remove('urdu-active');
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const isRtl = language === 'ur';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
