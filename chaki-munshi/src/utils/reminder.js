export const reminder = {
  // Format local Pakistani phone numbers to standard international format (+92)
  formatPhone: (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('03')) {
      cleaned = '92' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('+') && cleaned.startsWith('92')) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  },

  // Generate WhatsApp Message URL
  getWhatsAppUrl: (name, phone, amount, isUrdu = false) => {
    const formattedPhone = reminder.formatPhone(phone);
    const dateStr = new Date().toLocaleDateString();
    
    const text = isUrdu
      ? `محترم ${name} صاحب،\nآپ کے چکی کھاتہ (چاکی منشی) کا بقایا جات مبلغ ${amount} روپے ہے۔ براہ کرم جلد از جلد اپنی رقم ادا کریں۔ شکریہ۔\nتاریخ: ${dateStr}`
      : `Dear ${name},\nYour outstanding balance with our Flour Mill (Chaki Munshi) is Rs. ${amount}. Kindly clear your pending payments as soon as possible. Thank you!\nDate: ${dateStr}`;

    return `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodeURIComponent(text)}`;
  },

  // Trigger WhatsApp redirection
  sendWhatsApp: (name, phone, amount, isUrdu = false) => {
    const url = reminder.getWhatsAppUrl(name, phone, amount, isUrdu);
    window.open(url, '_blank');
  }
};
