Tobacco Watcher
===============

The code for the tobaccowatcher.org website.

## Initial Deployment
1. Clone this repository, preferably into a [virtualenv environment](https://github.com/pypa/virtualenv).
2. Update the configuration files in `configs/` where necessary.
3. Use Fabric to generate the site-specific configuration files, using the appropriate `envname` from `configs/hosts.yaml`:
    * `cd src && fab update_conf:envname`
4. Install all backend dependencies in `src/requirements.txt` with pip:
    * `pip install -r requirements.txt`
5. Install and build all frontend dependencies with npm, bower and grunt.
   Note that `bower` and `grunt` may be located in `node_modules/bower/bin`
   and `node_modules/grunt-cli/bin` for a local package install:
    * `npm install`
    * `bower install`
    * You will need to build the Chosen dependency separately until it gets put in the main grunt file:
        * `cd app/static/bower_components/chosen`
        * `npm install`
        * `grunt build`
    * Go back to the `./src` dir and: `grunt build`
6. Get Django to collect all the new static files
    * (assuming manage.py is your current dir and manage.py is executable) `./manage.py collectstatic [--noinput]`
7. Set up preferred wsgi servers and/or proxies
    * TODO: nginx, uwsgi, gunicorn, etc, setup


## Updating an existing deploy
1. Pull updates in from git
    * `git pull`
2. Go into `src` directory and run frontend tasks via `grunt`
    * `grunt build` or `grunt [--force]`
3. Get Django to collect all the new static files
    * (assuming manage.py is your current dir and manage.py is executable) `./manage.py collectstatic [--noinput]`
4. Sync the database or migrate if there were any data model changes
    * `./manage.py migrate`
    * `./manage.py syncdb`
5. Restart WSGI server if any Python or configurations were changed.
   Note: Check if your wsgi server can reload if code is changed. `gunicorn`, for example,
   has the `--reload` flag that restarts all workers when there are changes.


## Cron jobs
1. For sending out alerts, there is currently one cron for each alert interval. Each command is run with the format:
   `./manage.py sendemails [interval]` where [interval] is one of: daily, weekly, monthly, every_2_weeks
2. Example list of crons:
    * `10 8 * * *     /usr/local/bin/python2.7 /home/twatcher/webapps/tobaccowatcher/tobacco_watcher/src/manage.py send_emails daily`
    * `10 8 * * 5     /usr/local/bin/python2.7 /home/twatcher/webapps/tobaccowatcher/tobacco_watcher/src/manage.py send_emails weekly`
    * `10 8 20 * *    /usr/local/bin/python2.7 /home/twatcher/webapps/tobaccowatcher/tobacco_watcher/src/manage.py send_emails monthly`
    * `10 8 */14 * *  /usr/local/bin/python2.7 /home/twatcher/webapps/tobaccowatcher/tobacco_watcher/src/manage.py send_emails every_2_weeks`


## Patches
* Python2 >= 2.7.9 gevent, ssl.py
    * Python 2.7.9 has introduced breaking changes for gevent. This requires a manual patch after a `pip install -r requirements.txt`
    * GitHub Issue: https://github.com/gevent/gevent/issues/477
    * Patch is in the patches directory


## Config changes
* Previously the file that is used in the fabric config task was not complete with all config values for production.
  This was added in the new `hosts.yaml.dist` file and added into the `settings_local.py.tmpl` file, however, any
  existing configs will need to have the `STATIC_URL` setting manually added into either `settings.py` or `settings_local.py`.



## Setting up local enviroment 
1. Run `./manage.py runserver`

2. Run `grunt watch` for scss file compilation