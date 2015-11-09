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

@app.route("/")
def index():
    return render_template("MTMdashboardMongoDB.html")


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

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)