fs = require "fs"
path = require "path"
threeMathDir = "./Threejs/src/math/"
targetFile = "./common/threeMath.js"
files = fs.readdirSync(threeMathDir)
codes = []
for file in files
    codes.push fs.readFileSync(path.join threeMathDir,file).toString()

code= """
THREE = {}
exports.THREE = THREE;
#{codes.join(';\n')}
"""
fs.writeFileSync(targetFile,code)
