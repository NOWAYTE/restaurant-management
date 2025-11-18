from flask_mysqldb import MySQL

mysql = MySQL()

def init_db(app):
    app.config["MYSQL_HOST"] = "localhost"
    app.config["MYSQL_USER"] = "root"
    app.config["MYSQL_PASSWORD"] = "password"
    app.config["MYSQL_DB"] = "restaurant_db"
    mysql.init_app(app)

