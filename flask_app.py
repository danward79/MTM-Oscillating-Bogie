from flask import Flask
from flask import render_template
from pymongo import MongoClient
##from pymongo import Connection
import json
from bson import json_util
from bson.json_util import dumps

## Tutorial can be found in
## http://adilmoujahid.com/posts/2015/01/interactive-data-visualization-d3-dc-python-mongodb/
## Data sent to MongoDB is from: exceedancesLHR-pres.tsv


app = Flask(__name__)

MONGODB_HOST = 'ds041583.mongolab.com'
MONGODB_PORT = 41583
DBS_NAME = 'mtm'
USER = 'lhr'
PASS = 'ferrari1'
COLLECTION_NAME = 'projects'
FIELDS = {'Analysis Type': True, 'Accelerometer Location': True, 'Speed Bracket': True, 'Route': True, 'Nearest Station': True, 'Exceedence Instance': True, 'Time':True, '_id': False}

##DBS_NAME2 = ''
##DBS_NAME2 = 'experall'
##DBS_NAME2 = 'smallall'
##DBS_NAME2 = 'smallseries'
##DBS_NAME2 = 'smallseriesdays'
##DBS_NAME2 = 'allIndays'
##DBS_NAME2 = 'allIndaysCons'
##DBS_NAME2 = 'allIndaysCons3'
##DBS_NAME2 = 'allIndaysCons3Redu'
##DBS_NAME2 = 'allIndaysCons3Redu2'
##DBS_NAME2 = 'allIndaysCons4'
##DBS_NAME2 = 'AllWerribeeIn4Mongodb'
FIELDS2 = {'Speed': True, 'Speed Bracket': True, 'Nearest Station': True, 'Exceedence Instance': True, 'Time':True, '_id': False}

FIELDS3 = {'Speed': True, 'Analysis Type': True, 'Accelerometer Location': True, 'Speed Bracket': True, 'Route': True, 'Nearest Station': True, 'Exceedence Instance': True, 'Time':True, 'Series':True, 'Date':True, 'id': True}

FIELDS4 = {'Speed': True, 'Analysis Type': True, 'Accelerometer Location': True, 'Speed Bracket': True, 'Route': True, 'Nearest Station': True, 'Exceedence Instance': True, 'Date_Time':True, 'Series':True, 'id': True}
FIELDS5 = {'Speed': True, 'Analysis Type': True, 'Accelerometer Location': True, 'Speed Bracket': True, 'Route': True, 'Nearest Station': True, 'Exceedence Instance': True, 'Series':True, 'Time': True, 'Run': True,}


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

	
## This works alongside @app.route("/experall") & chart7.js
## DBS_NAME2 should be as 'allIndaysCons3'
## FIELDS5 should be used
## Time based. Run column created for filtering instead of date. Speed vs Time in Line Chart and series as per Series column
@app.route("/8")
def index8():
    ##return render_template("MTMdashboardTimeRun_Temp.html")
	return render_template("MTMdashboardTimeRun.html")
	
## This works alongside @app.route("/experall") & chart7.js
## DBS_NAME2 should be as 'allIndaysCons4'
## FIELDS5 should be used
## All widgets in. Database populate with "Normal Data" for blanks in Analysis Type, Accelerometer Location & Speed Bracket.
@app.route("/9")
def index9():
	return render_template("MTMdashboardTimeRun.html")
	
	
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
	
	
@app.route("/g")
def indexg():
    return render_template("multi-scatter&multi-line_for_series_value_non_sum.html")

@app.route("/g2")
def indexg2():
    return render_template("multi-scatter&multi-line_for_series_value_non_sum_mongoDB.html")


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
    ##connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    ##collection = connection[DBS_NAME][COLLECTION_NAME]
    ##collection.the_database.authenticate(USER, PASS, mechanism='SCRAM-SHA-1')
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