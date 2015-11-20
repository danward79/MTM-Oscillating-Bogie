from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps

## Tutorial can be found in
## http://adilmoujahid.com/posts/2015/01/interactive-data-visualization-d3-dc-python-mongodb/
## Data sent to MongoDB is from: exceedancesLHR-pres.tsv


app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'MTMbogie'
COLLECTION_NAME = 'projects'
FIELDS = {'Analysis Type': True, 'Accelerometer Location': True, 'Speed Bracket': True, 'Route': True, 'Nearest Station': True, 'Exceedence Instance': True, 'Time':True, '_id': False}

##DBS_NAME2 = ''
##DBS_NAME2 = 'experall'
##DBS_NAME2 = 'smallall'
##DBS_NAME2 = 'smallseries'
##DBS_NAME2 = 'smallseriesdays'
##DBS_NAME2 = 'allIndays'
##DBS_NAME2 = 'allIndaysCons'
DBS_NAME2 = 'allIndaysCons3'
FIELDS2 = {'Speed': True, 'Speed Bracket': True, 'Nearest Station': True, 'Exceedence Instance': True, 'Time':True, '_id': False}

FIELDS3 = {'Speed': True, 'Analysis Type': True, 'Accelerometer Location': True, 'Speed Bracket': True, 'Route': True, 'Nearest Station': True, 'Exceedence Instance': True, 'Time':True, 'Series':True, 'Date':True, 'id': True}

FIELDS4 = {'Speed': True, 'Analysis Type': True, 'Accelerometer Location': True, 'Speed Bracket': True, 'Route': True, 'Nearest Station': True, 'Exceedence Instance': True, 'Date_Time':True, 'Series':True, 'id': True}
FIELDS5 = {'Speed': True, 'Analysis Type': True, 'Accelerometer Location': True, 'Speed Bracket': True, 'Route': True, 'Nearest Station': True, 'Exceedence Instance': True, 'Series':True, 'Time': True, 'Run': True,'id': True}


## This works alongside @app.route("/MTMBogieMongo")
@app.route("/")
def index():
    return render_template("MTMdashboardMongoDB.html")
	
## This works alongside @app.route("/experall")
@app.route("/2")
def index2():
    return render_template("MTMdashboardMongoDBall.html")
	
## This works alongside @app.route("/experall") & chart3.js
## DBS_NAME2 should be as 'smallseries'
@app.route("/3")
def index3():
	
    return render_template("MTMdashboardMongoDBsmallscatter.html")
	
## This works alongside @app.route("/experall") & chart4.js
## DBS_NAME2 should be as 'smallseriesdays'
@app.route("/4")
def index4():
	##global DBS_NAME2 = 'smallseriesdays'
    return render_template("MTMdashboardMongoDBsmallscatterdays.html")
	
## This works alongside @app.route("/experall") & chart4.js
## DBS_NAME2 should be as 'allIndays'
@app.route("/5")
def index5():
    return render_template("MTMdashboardMongoDBsmallscatterdays.html")
	
## This works alongside @app.route("/experall") & chart5.js
## DBS_NAME2 should be as 'allIndaysCons'
## FIELDS4 should be used
@app.route("/6")
def index6():
    return render_template("MTMdashboardMongoDBCons.html")

	
## This works alongside @app.route("/experall") & chart6.js
## DBS_NAME2 should be as 'allIndaysCons3'
## FIELDS5 should be used
## Date_Time concept flawed. Run column created for filtering instead of date. Speed vs Time in Line Chart and series as per Series column
@app.route("/7")
def index7():
    return render_template("MTMdashboardMongoDBCons2.html")

@app.route("/MTMBogieMongo")
def MTMBogieMongo():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    projects = collection.find(projection=FIELDS)
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    return json_projects
	
@app.route("/experall")
def experall():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME2][COLLECTION_NAME]
    ##projects = collection.find(projection=FIELDS2, limit=100000)
    projects = collection.find(projection=FIELDS5)
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    return json_projects

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)