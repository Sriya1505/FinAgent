import os
import io
import time
import json
import numpy as np
from PIL import Image
import pymupdf
from rapidocr_onnxruntime import RapidOCR

PDF_PATH = r"C:\Users\SRIYA\.gemini\antigravity\brain\cd17b279-4889-4530-b882-6a9cab33441e\.user_uploaded\media_1795180336418_15afb2c8.pdf"
OUTPUT_JSON = r"C:\Users\SRIYA\.gemini\antigravity\scratch\FinAgent\backend\ocr_extracted_58pages.json"

def main():
    print("Initializing RapidOCR...")
    engine = RapidOCR()
    doc = pymupdf.open(PDF_PATH)
    total_pages = len(doc)
    print(f"Total pages: {total_pages}")
    
    all_pages_data = []
    
    t_start = time.time()
    for page_idx in range(total_pages):
        t_page_start = time.time()
        page = doc[page_idx]
        img_list = page.get_images()
        if not img_list:
            print(f"Page {page_idx}: No images found")
            all_pages_data.append({"page": page_idx, "tokens": []})
            continue
            
        xref = img_list[0][0]
        base_img = doc.extract_image(xref)
        img_bytes = base_img["image"]
        
        im = Image.open(io.BytesIO(img_bytes))
        # Downscale if width > 700 to speed up OCR significantly while retaining full text sharpness
        if im.width > 700:
            scale = 700.0 / im.width
            im = im.resize((int(im.width * scale), int(im.height * scale)), Image.Resampling.BILINEAR)
            
        img_np = np.array(im)
        if len(img_np.shape) == 2:
            img_np = np.stack([img_np]*3, axis=-1)
        elif img_np.shape[2] == 4:
            img_np = img_np[:, :, :3]
            
        res, _ = engine(img_np)
        tokens = [r[1] for r in res] if res else []
        page_elapsed = time.time() - t_page_start
        print(f"Page {page_idx+1}/{total_pages}: {len(tokens)} tokens in {page_elapsed:.2f}s")
        
        all_pages_data.append({
            "page": page_idx,
            "tokens": tokens
        })
        
        # Save intermediate every 10 pages
        if (page_idx + 1) % 10 == 0 or (page_idx + 1) == total_pages:
            with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
                json.dump(all_pages_data, f, indent=2, ensure_ascii=False)
                
    total_time = time.time() - t_start
    print(f"All {total_pages} pages OCR completed in {total_time:.2f}s. Saved to {OUTPUT_JSON}")

if __name__ == "__main__":
    main()
