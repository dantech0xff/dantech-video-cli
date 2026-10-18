#!/bin/bash
# shot.sh name "hash-params"
cd "$(dirname "$0")"
timeout 120 /opt/google/chrome/chrome --headless=new --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader --allow-file-access-from-files --virtual-time-budget=15000 --dump-dom "file://$(pwd)/render.html#$2" 2>/dev/null | python3 -c "
import sys,re,base64;h=sys.stdin.read();m=re.search(r'data:image/png;base64,([A-Za-z0-9+/=]+)',h)
open('out/$1.png','wb').write(base64.b64decode(m.group(1))) if m else print('NO IMAGE',h[-500:])"
