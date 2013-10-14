import re
import sys

cluster = sys.argv[1]

for method in ['glmnet', 'enet', 'oracle']:
    for i in range(600):
        try:
            f = open("output/MiscParams." + str(cluster) + "." + str(i) + "." + method + ".csv", 'r')
            contents = f.read()
            f.close()

            contents = re.sub("c\([\d.,\s-]*,\s*(?P<final>-?[0-9.]+)\n?\)", "\g<final>", contents)

            f = open("output/MiscParams." + str(cluster) + "." + str(i) + "." + method + ".csv", 'w')
            f.write(contents)
            f.close()
        except: pass