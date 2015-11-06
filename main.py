from flask import Flask, render_template
from flask import Response, jsonify
import json
import collections
app = Flask(__name__)

@app.route("/")
def hello():
    return "Sever running OK! This is to present MTM with a Dashboard of the bogie exceedances"

@app.route('/MTMdashboard')
def Dashboard():
    return render_template("MTMdashboard.html")
	
@app.route('/MTMdashboardnew')
def Dashboardnew():
    return render_template("MTMdashboard - Copy.html")
	
	
	
if __name__ == "__main__":
    app.run()