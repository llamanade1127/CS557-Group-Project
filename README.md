This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

**COMPSCI-557: Group 2**

# Setup

## Database Setup
To get started, you will first need a MySQL server running. There are 2 options, [docker](#docker) or [MySQL Workbench](#MySQLWorkbench)
### Docker
To use docker, you will need to have a docker container running. To do this, first install docker desktop. The install can be found below:
- [Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- [MacOS](https://docs.docker.com/desktop/setup/install/mac-install/)
- [Linux](https://docs.docker.com/desktop/setup/install/linux/)

Once that is installed, you need to setup the container that will run the MySQL server. Enter this command in a terminal: 
```bash
docker run --name mysql-anime_tracker -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=animedb -p 3306:3306 -d mysql:8
```

This will install all required images and run the container on `port 3306`. Verify its running in docker desktop. You should see a `mysql-anime_tracker` container running.

*Note: If you have MySQL running, it will take port 3306 and cause the docker container to fail, if that is the case you can use the MySQL steps below instead. Otherwise, stop the MySQL process, and retry the above command*

### MySQL Workbench
If you already have MySQL installed, you can use the instance running for this database instead. Just verify that the MySQL service is running and you can access your local instance.

## ENV File Setup
You will now need to create a `.env` file in the root directory. This will store the setup variables for the database. An example is below:

```env
DATABASE_URL="mysql://root:password@localhost:3306/animedb?allowPublicKeyRetrieval=true&ssl=false"
DATABASE_USER="YOUR_DB_USER"
DATABASE_PASSWORD="YOUR_DB_PASSWORD"
DATABASE_NAME="animedb"
DATABASE_HOST="localhost"
DATABASE_PORT=3306
```

If you used the docker container, the default username is `root` and default password is `password`. 


## Initialize the database
To initialize the database, you will need to run the `Group_2_Database_Script.sql` file to create all the tables and default data. Steps can be found below depending on the previous setup. 

*Note: If you are using docker, but still have MySQL installed, you can do the MySQL section instead of the docker command. Just connect to the docker container in MySQL Workbench*

### Docker
Connect to the running MySQL container and run the SQL script:

```bash
docker exec -i -e MYSQL_PWD=MY_SQL_PASSWORD mysql-anime_tracker mysql -u root < PATH_TO_SCRIPT/Group_2_Database_Script.sql
```
*Note: If you are using powershell, you must do the following command*

```powershell
Get-Content Group_2_Database_Script.sql | docker exec -i -e MYSQL_PWD=password mysql-anime_tracker mysql -u root
```

### MySQL Workbench
1. Open MySQL Workbench and connect to your MySQL server.
2. Go to **File > Open SQL Script** and select `Group_2_Database_Script.sql`.
3. Click the **lightning bolt** icon to execute the script.

## Installing NPM Packages

npm comes bundled with Node.js and is required to run this app. If you don't have it installed, download it from [nodejs.org](https://nodejs.org/) and follow the installer for your OS. Verify the install by running:

```bash
node -v
npm -v
```

Once Node.js is installed, run the following in the project root to install all dependencies:

```bash
npm install
```

# Running the app
Run `npm run dev` inside of the terminal, and it will host it at a default `localhost:3000`. You can access the app via any browser

