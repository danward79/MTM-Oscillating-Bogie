from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps

app = Flask(__name__)

MONGODB_HOST = 'ds041583.mongolab.com'
MONGODB_PORT = 41583
DBS_NAME = 'mtm'
USER = 'lhr'
PASS = 'ferrari1'
COLLECTION_NAME = 'projects'

	
## #############################################
##                                            ##
##  This is the version for MTM cloud         ##
##  It is an improvement over the presentation##
##  given to them                             ##
##  Deployed to cloud 22 January 2016         ##
## #############################################

@app.route("/MTMDashboard")
def MTMCloud():
	return render_template("MTMdashboard2Dbs.html", mode='cloud')

@app.route("/MTMDashboard/local")
def MTMLocal():
	return render_template("MTMdashboard2Dbs.html", mode='local')


	
	
@app.route("/connect2MongoDbCloud")
def MongoDbCloud():
    FIELDS5 = {'Speed': True, 'Analysis Type': True, 'Accelerometer Location': True, 'Speed Bracket': True, 'Route': True, 'Nearest Station': True, 'Exceedence Instance': True, 'Series':True, 'Time': True, 'Run': True,}
    mongoDBClient = MongoClient(MONGODB_HOST, MONGODB_PORT)
    mongoDB = mongoDBClient[DBS_NAME]
    mongoDB.authenticate(USER, PASS)
    collection = mongoDBClient[DBS_NAME][COLLECTION_NAME]
    projects = collection.find(projection=FIELDS5)
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    mongoDBClient.close()
    return json_projects

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)