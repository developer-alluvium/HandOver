import zipfile, struct, os

out_dir = 'extracted_v6_samples'
os.makedirs(out_dir, exist_ok=True)

with zipfile.ZipFile('OISPL_Form13_API_Integration_Customer_v6.0.docx') as z:
    for name in sorted(z.namelist()):
        if name.startswith('word/embeddings/') and name.endswith('.bin'):
            data = z.read(name)
            try:
                if b'PK\x03\x04' in data:
                    pk_idx = data.find(b'PK\x03\x04')
                    with open(os.path.join(out_dir, 'Form13_Masters.xlsx'), 'wb') as f:
                        f.write(data[pk_idx:])
                    print('Extracted Form13_Masters.xlsx')
                else:
                    start = data.find(b'{\r\n')
                    if start == -1: start = data.find(b'{\n')
                    if start == -1: start = data.find(b'{"')
                    if start == -1: start = data.find(b'{')
                    
                    end = data.rfind(b'}')
                    if start != -1 and end != -1:
                        json_bytes = data[start:end+1]
                        fn = 'sample.json'
                        for chunk in [b'01_', b'02_', b'03_', b'04_', b'05_', b'06_', b'07_', b'08_', b'09_', b'10_', b'11_', b'12_', b'13_', b'14_', b'15_', b'16_', b'17_']:
                            idx = data.find(chunk)
                            if idx != -1:
                                end_fn = data.find(b'.json', idx)
                                if end_fn != -1:
                                    fn = data[idx:end_fn+5].decode('latin1', errors='ignore')
                                    break
                        with open(os.path.join(out_dir, fn), 'wb') as f:
                            f.write(json_bytes)
                        print(f'Extracted {fn} (len={len(json_bytes)})')
            except Exception as e:
                print(f'Error on {name}: {e}')
