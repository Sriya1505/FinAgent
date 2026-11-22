import sys
import io
import os
import pandas as pd
from PIL import Image

sys.path.insert(0, r'C:\Users\SRIYA\.gemini\antigravity\scratch\FinAgent\backend')
from services.document_parser import DocumentParser

tests = {}

# 1. User PDF
pdf_path = r'C:\Users\SRIYA\.gemini\antigravity\brain\cd17b279-4889-4530-b882-6a9cab33441e\.user_uploaded\media_1795151037362_28d4295b.pdf'
with open(pdf_path, 'rb') as f:
    pdf_bytes = f.read()
tests['User_PDF'] = DocumentParser.parse_document('Login_Printout.pdf', pdf_bytes, [])

# 2. CSV
csv_bytes = b'Date,Description,Amount,Type\n2026-11-20,Grocery Store,1200,expense\n2026-11-20,Freelance Client,15000,income'
tests['CSV'] = DocumentParser.parse_document('bank.csv', csv_bytes, [])

# 3. XLSX
df = pd.DataFrame([{'Date': '2026-11-20', 'Description': 'Office Rent', 'Debit': 25000}])
buf = io.BytesIO()
df.to_excel(buf, index=False)
tests['XLSX'] = DocumentParser.parse_document('accounts.xlsx', buf.getvalue(), [])

# 4. TXT
txt_bytes = b'Acme Cloud Hosting Invoice: Total Rs. 3,450.00 on 2026-11-18'
tests['TXT'] = DocumentParser.parse_document('invoice.txt', txt_bytes, [])

# 5. JSON
json_bytes = b'[{"date":"2026-11-20","description":"Domain Renewal","amount":850,"type":"expense"}]'
tests['JSON'] = DocumentParser.parse_document('export.json', json_bytes, [])

# 6. XML
xml_bytes = b'<root><item><desc>Consulting Payment</desc><amount>12000</amount><date>2026-11-20</date></item></root>'
tests['XML'] = DocumentParser.parse_document('statement.xml', xml_bytes, [])

# 7. Image (PNG)
img = Image.new('RGB', (100, 100), color=(73, 109, 137))
img_buf = io.BytesIO()
img.save(img_buf, format='PNG')
tests['PNG_Image'] = DocumentParser.parse_document('receipt_shot.png', img_buf.getvalue(), [])

print('=== ALL FORMAT TEST RESULTS ===')
for fmt, res in tests.items():
    print(f'Format {fmt:12}: {res["transactions_count"]} txs extracted | Inflow: +Rs.{res["total_inflow"]:,.2f} | Outflow: -Rs.{res["total_outflow"]:,.2f}')

assert all(res['transactions_count'] > 0 for res in tests.values()), "Some format returned 0 transactions!"
print('ALL 7 FORMATS PASSED WITH 100% SUCCESS!')
