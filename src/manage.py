#!/usr/bin/env python

from gevent import monkey
monkey.patch_all()

import os
import sys

from psycogreen.gevent import patch_psycopg

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tobaccowatcher.settings")
    patch_psycopg()

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)