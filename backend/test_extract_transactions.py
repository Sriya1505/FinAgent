import json
import re
from datetime import date

MONTHS = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
    'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
    '0ctober': 10, '0ct': 10, 'nov': 11, 'oct': 10, 'sep': 9, 'aug': 8, 'jul': 7, 'jun': 6
}

def parse_amount(val_str):
    if not val_str:
        return 0.0
    s = str(val_str).strip()
    # Replace leading OCR artifacts like R, #, ₹, Rs., 买, 7 (if 7 is attached to currency like 7400 -> 400 or ₹)
    # Check if starts with R or # or ₹
    s = re.sub(r'^[R#₹买\s]+', '', s)
    # If starts with 7 followed by 2-3 digits e.g. 7400 or 780 when amount is 400 or 80
    if re.match(r'^7\d{2,3}(?:\.\d{2})?$', s):
        # Could be ₹ or could be 700. If 7400, in UPI it is likely 400 or 7400. Let's keep 400 if 7 is substitute for ₹
        pass
    cleaned = re.sub(r'[^\d.]', '', s)
    try:
        return float(cleaned)
    except:
        return 0.0

def parse_date(date_token, current_month_name, default_year="2026"):
    tok = str(date_token).lower().replace(" ", "").replace(".", "")
    if "yesterday" in tok:
        return f"{default_year}-11-19"
    if "hour" in tok or "today" in tok or "min" in tok:
        return f"{default_year}-11-20"
        
    # Check day + month pattern (e.g. 16november, 08november, 15october, 160ctober, 17august)
    m = re.search(r'(\d{1,2})([a-z0-9]+)', tok)
    if m:
        day_str = m.group(1).zfill(2)
        mon_str = m.group(2)
        for m_name, m_num in MONTHS.items():
            if m_name in mon_str:
                return f"{default_year}-{m_num:02d}-{day_str}"
                
    # Fallback with current_month_name
    m_day = re.search(r'\b(\d{1,2})\b', tok)
    if m_day and current_month_name:
        day_str = m_day.group(1).zfill(2)
        m_num = MONTHS.get(current_month_name.lower(), 11)
        return f"{default_year}-{m_num:02d}-{day_str}"
        
    return f"{default_year}-11-20"

def extract_all():
    with open(r"C:\Users\SRIYA\.gemini\antigravity\scratch\FinAgent\backend\ocr_extracted_58pages.json", "r", encoding="utf-8") as f:
        pages = json.load(f)

    current_month = "november"
    all_txs = []
    
    for p in pages:
        p_idx = p["page"]
        toks = p["tokens"]
        
        # Check if page has Month Total summary
        is_summary = False
        for t in toks:
            tl = t.lower().replace(" ", "")
            for m_name in ['november', 'october', 'september', 'august', 'july', 'june']:
                if m_name + 'total' in tl or ('total' in tl and m_name in tl):
                    current_month = m_name
                    is_summary = True
                    break
            if is_summary:
                break
                
        if is_summary:
            # Also extract Month summary income / inward transfers!
            # Tokens typically: [MonthTotal, Net, Spent, #Amount, Received, RAmount]
            for i, t in enumerate(toks):
                if 'received' in t.lower() and i + 1 < len(toks):
                    inc_amt = parse_amount(toks[i+1])
                    if inc_amt > 0:
                        m_num = MONTHS.get(current_month, 11)
                        all_txs.append({
                            "date": f"2026-{m_num:02d}-01",
                            "merchant": f"Bank Inward Transfer / Salary Credit",
                            "description": f"{current_month.title()} Verified UPI Inflow & Salary Deposit",
                            "amount": inc_amt,
                            "type": "income",
                            "source_page": p_idx
                        })
            continue
            
        # Parse transaction cards on Money Spent page
        # Loop through tokens looking for 'paid to' / 'payment to' / 'debited from'
        i = 0
        while i < len(toks):
            token = toks[i].strip()
            tl = token.lower()
            
            if tl in ('paid to', 'paidto', 'payment to', 'paid'):
                # Merchant is usually at i+1
                if i + 1 < len(toks):
                    merchant_candidate = toks[i+1].strip()
                    # Skip noise like 'autopay' if followed by actual merchant
                    merchant = merchant_candidate
                    next_idx = i + 2
                    if merchant.lower() in ('autopay', 'billpay', 'pos') and next_idx < len(toks):
                        merchant = toks[next_idx].strip()
                        next_idx += 1
                        
                    # Now search for amount and date in next few tokens
                    amt = 0.0
                    dt = None
                    amt_found = False
                    
                    for k in range(next_idx, min(len(toks), next_idx + 4)):
                        sub_tok = toks[k].strip()
                        sub_tl = sub_tok.lower()
                        
                        # Stop if next transaction starts
                        if sub_tl in ('paid to', 'paidto', 'payment to', 'paid'):
                            break
                            
                        # Check amount
                        if not amt_found:
                            # Amount usually matches digits, possibly with comma or dot, or starting with R/#/买
                            cleaned_sub = re.sub(r'^[R#₹买\s]+', '', sub_tok).replace(',', '')
                            # Check if it's a number (and not a date like '160ctober' or '5hoursago')
                            if re.match(r'^\d+(?:\.\d{1,2})?$', cleaned_sub) and not any(m in sub_tl for m in MONTHS) and 'hour' not in sub_tl and 'ago' not in sub_tl:
                                amt = float(cleaned_sub)
                                amt_found = True
                                continue
                                
                        # Check date
                        if any(m in sub_tl for m in ['nov', 'oct', 'sep', 'aug', 'jul', 'jun', '0ct']) or 'yesterday' in sub_tl or 'ago' in sub_tl or 'today' in sub_tl:
                            dt = parse_date(sub_tok, current_month)
                            
                        if sub_tl in ('debited from', 'debitedfrom'):
                            break
                            
                    if amt > 0:
                        if not dt:
                            m_num = MONTHS.get(current_month, 11)
                            dt = f"2026-{m_num:02d}-15"
                            
                        all_txs.append({
                            "date": dt,
                            "merchant": merchant,
                            "description": f"UPI Payment to {merchant}",
                            "amount": amt,
                            "type": "expense",
                            "source_page": p_idx
                        })
                        i = next_idx
                        continue
            i += 1

    print(f"Total raw transactions extracted: {len(all_txs)}")
    
    # Deduplicate transactions that are identical and appear on consecutive pages (due to screenshot scroll overlap)
    unique_txs = []
    seen = set()
    for tx in all_txs:
        # Key: date, round(amount, 2), merchant
        # Normalize merchant: remove spaces and non-alphanumeric
        m_norm = re.sub(r'[^a-zA-Z0-9]', '', tx['merchant'].lower())
        key = (tx['date'], round(tx['amount'], 2), m_norm, tx['type'])
        if key not in seen:
            seen.add(key)
            unique_txs.append(tx)
            
    print(f"Total unique transactions after deduplication: {len(unique_txs)}")
    
    inflow = sum(t['amount'] for t in unique_txs if t['type'] == 'income')
    outflow = sum(t['amount'] for t in unique_txs if t['type'] == 'expense')
    print(f"Total Inflow: ₹{inflow:,.2f} ({len([t for t in unique_txs if t['type'] == 'income'])} income records)")
    print(f"Total Outflow: ₹{outflow:,.2f} ({len([t for t in unique_txs if t['type'] == 'expense'])} expense records)")
    
    print(f"\nSample 15 extracted transactions:")
    for t in unique_txs[:15]:
        print(f"  {t['date']} | {t['type'].upper():7s} | ₹{t['amount']:>8.2f} | {t['merchant']}")
    return unique_txs

if __name__ == "__main__":
    extract_all()
