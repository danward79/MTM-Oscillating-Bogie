from flask import Flask
from flask import render_template
from pymongo import MongoClient
##from pymongo import Connection
import json
from bson import json_util
from bson.json_util import dumps

## Tutorial can be found in
## http://adilmoujahid.com/posts/2015/01/interactive-data-visualization-d3-dc-python-mongodb/

app = Flask(__name__)

MONGODB_HOST = 'ds041583.mongolab.com'
MONGODB_PORT = 41583
DBS_NAME = 'mtm'
USER = 'lhr'
PASS = 'ferrari1'
COLLECTION_NAME = 'projects'

	
## #############################################
##                                            ##
##  This is the version for MTM presentation  ##
##                                            ##
##                                            ##
## #############################################
## This works alongside @app.route("/experall") & chart7.js
## DBS_NAME2 should be as 'AllWerribeeIn4Mongodb' which came from csv with same name
## DBS_NAME2 was prepared using ipython script: Single_data_file_for_dashboard_acceleration_exceedences-Werribee-2.ipynb in dropbox (note that manual customization was also done)
## FIELDS5 should be used
## All widgets in. Database populate with "GPS" for blanks in Analysis Type, Accelerometer Location & Speed Bracket.
@app.route("/MTMBogie")
def MTMBogie():
	return render_template("MTMdashboardTimeRun.html")

@app.route("/MTMBogie/local")
def MTMBogieLocal():
	return render_template("MTMdashboard2Dbs.html", mode='local')

@app.route("/MTMBogie/cloud")
def MTMBogieCloud():
	return render_template("MTMdashboard2Dbs.html", mode='cloud')
	
	
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