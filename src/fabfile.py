# -*- coding: utf-8 -*-

import os
import sys
import yaml

from fabric.api import local
from fabric.contrib import files

ROOT = os.path.dirname(os.path.realpath(__file__))
ROOT = os.path.join(ROOT, '..', 'configs')


def prepare_deploy():
    local("./manage.py test my_app")
    local("git add -p && git commit")
    local("git push")


def update_conf(host):
    conf_files = (
        ('nginx.conf.tmpl', 'configs/nginx.conf'),
        ('settings_local.py.tmpl', 'src/tobaccowatcher/settings_local.py'),
        ('uwsgi.ini.tmpl', 'configs/uwsgi.ini'),
    )

    hosts_file = os.path.join(ROOT, '..', 'configs', 'hosts.yaml')
    data = yaml.load(open(hosts_file, 'r+'))
    data = data[host]

    for filename, output_filename in conf_files:
        path = os.path.join(ROOT, filename)
        f = open(path, 'r+')
        template = ''.join([line for line in f])
        f.close()
        output_file = open(os.path.join("/Users/alicjarakowska/Documents/10Clouds/TOBACO/tobaccowatcher_web/",output_filename), 'w+')
        output_file.write(template % data)
        output_file.close()
        
    #apache_graceful()