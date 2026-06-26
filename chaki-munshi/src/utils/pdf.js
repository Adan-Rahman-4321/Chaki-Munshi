import qrcode from 'qrcode';

export const pdf = {
  // Generate QR Code Data URL
  generateQR: async (text) => {
    try {
      return await qrcode.toDataURL(text, { width: 120, margin: 1 });
    } catch (err) {
      console.error('QR code generation failed', err);
      return '';
    }
  },

  // Print Invoice Receipt
  printReceipt: async (invoice, isUrdu = false) => {
    const qrData = `ChakiMunshi-${invoice.invoiceNo}-${invoice.totalAmount || invoice.netWeight}`;
    const qrCodeUrl = await pdf.generateQR(qrData);
    const millName = localStorage.getItem('chaki_mill_name') || 'Chaki Munshi';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is preventing printing. Please allow popups.');
      return;
    }

    const isWheat = invoice.invoiceNo.startsWith('WHT');
    const formattedDate = new Date(invoice.createdAt).toLocaleString();

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${isUrdu ? 'ur' : 'en'}" dir="${isUrdu ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${invoice.invoiceNo}</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            padding: 20px;
            color: #000;
            max-width: 300px;
            margin: 0 auto;
            font-size: 13px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            margin: 5px 0;
          }
          .sub {
            font-size: 11px;
            text-transform: uppercase;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
          .total {
            font-weight: bold;
            font-size: 15px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
            border-top: 1px dashed #000;
            padding-top: 10px;
          }
          .qr-container {
            margin: 15px 0;
            text-align: center;
          }
          .qr-container img {
            width: 100px;
            height: 100px;
          }
          @media print {
            body { padding: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${millName}</div>
          <div class="sub">${isUrdu ? 'تصدیق شدہ چکی رسید' : 'VERIFIED CASH RECEIPT'}</div>
        </div>

        <div class="row">
          <span>${isUrdu ? 'رسیپٹ نمبر:' : 'Invoice No:'}</span>
          <strong>${invoice.invoiceNo}</strong>
        </div>
        <div class="row">
          <span>${isUrdu ? 'تاریخ و وقت:' : 'Date:'}</span>
          <span>${formattedDate}</span>
        </div>
        <div class="row">
          <span>${isUrdu ? 'گاہک کا نام:' : 'Customer:'}</span>
          <strong>${invoice.customerName}</strong>
        </div>
        ${invoice.customerPhone ? `
        <div class="row">
          <span>${isUrdu ? 'فون نمبر:' : 'Phone:'}</span>
          <span>${invoice.customerPhone}</span>
        </div>
        ` : ''}

        <div class="divider"></div>

        ${isWheat ? `
          <div class="row">
            <span>${isUrdu ? 'کل وزن گندم:' : 'Total Wheat Weight:'}</span>
            <span>${invoice.totalWeight} kg</span>
          </div>
          <div class="row">
            <span>${isUrdu ? 'صفائی کی کٹوتی:' : 'Cleaning Deduction:'}</span>
            <span>-${invoice.cleaningWeight} kg</span>
          </div>
          <div class="divider"></div>
          <div class="row total">
            <span>${isUrdu ? 'خالص وزن:' : 'Net Wheat Weight:'}</span>
            <span>${invoice.netWeight} kg</span>
          </div>
        ` : `
          <div class="row">
            <span>${isUrdu ? 'مقدار آٹا:' : 'Flour Quantity:'}</span>
            <span>${invoice.quantity} kg</span>
          </div>
          <div class="row">
            <span>${isUrdu ? 'ریٹ فی کلو:' : 'Rate/kg:'}</span>
            <span>Rs. ${invoice.ratePerKg}</span>
          </div>
          <div class="divider"></div>
          <div class="row total">
            <span>${isUrdu ? 'کل رقم:' : 'Total Amount:'}</span>
            <span>Rs. ${invoice.totalAmount}</span>
          </div>
          <div class="row">
            <span>${isUrdu ? 'ادائیگی کا طریقہ:' : 'Payment Method:'}</span>
            <span>${isUrdu ? (invoice.paymentMethod === 'Cash' ? 'نقد' : invoice.paymentMethod === 'Online' ? 'آن لائن' : 'ادھار') : invoice.paymentMethod}</span>
          </div>
          <div class="row">
            <span>${isUrdu ? 'وصول شدہ رقم:' : 'Paid Amount:'}</span>
            <span>Rs. ${invoice.paidAmount}</span>
          </div>
          <div class="row" style="color: ${invoice.remainingBalance > 0 ? 'red' : 'green'}">
            <span>${isUrdu ? 'بقایا رقم (ادھار):' : 'Udhaar Balance:'}</span>
            <strong>Rs. ${invoice.remainingBalance}</strong>
          </div>
        `}

        <div class="divider"></div>

        ${qrCodeUrl ? `
          <div class="qr-container">
            <img src="${qrCodeUrl}" alt="Verification QR Code">
            <div>${isUrdu ? 'تصدیق کے لیے اسکین کریں' : 'Scan to Verify'}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div>${isUrdu ? 'چاکی منشی ایپ استعمال کرنے کا شکریہ!' : 'Thank you for your business!'}</div>
          <div>Powered by Chaki Munshi</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};
