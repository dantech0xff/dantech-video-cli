import json,urllib.parse,subprocess,sys
from PIL import Image
name=sys.argv[1];extra=sys.argv[2] if len(sys.argv)>2 else ''
lay=json.loads(open('lay.json').read())
h="obj=plate&w=540&h=960&fov=34&cx=0&cy=5.6&cz=8&ly=-0.6&lay="+urllib.parse.quote(json.dumps(lay))+extra
subprocess.run(['./shot.sh',name,h])
im=Image.open(f'out/{name}.png');bg=Image.new('RGBA',im.size,(8,8,10,255));bg.alpha_composite(im);bg.convert('RGB').save(f'out/{name}_bg.png')
