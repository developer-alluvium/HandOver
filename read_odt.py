import zipfile
import xml.etree.ElementTree as ET

def get_text_from_odt(filepath):
    try:
        zf = zipfile.ZipFile(filepath, 'r')
        content = zf.read('content.xml')
        root = ET.fromstring(content)
        
        result = []
        for elem in root.iter():
            if elem.tag.endswith('}p') or elem.tag.endswith('}h'):
                text = "".join(elem.itertext())
                if text:
                    result.append(text)
            elif elem.tag.endswith('}table'):
                result.append("\n[TABLE START]")
            elif elem.tag.endswith('}table-row'):
                row_text = []
                for cell in elem.findall('.//{urn:oasis:names:tc:opendocument:xmlns:table:1.0}table-cell'):
                    cell_text = "".join(cell.itertext())
                    row_text.append(cell_text)
                if any(row_text):
                    result.append(" | ".join(row_text))
                
        return "\n".join(result)
    except Exception as e:
        return str(e)

with open(r'c:\Users\india\Desktop\projects\HandOver\doc_text.txt', 'w', encoding='utf-8') as f:
    f.write(get_text_from_odt(r'c:\Users\india\Desktop\projects\HandOver\client\src\components\Form13\OISPL_GatePass-F13 API Integration (New) (1) 3 (2) (1).odt'))
