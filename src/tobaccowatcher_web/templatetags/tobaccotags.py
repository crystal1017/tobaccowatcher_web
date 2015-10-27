# -*- coding: utf-8 -*-

from django import template

register = template.Library()

@register.inclusion_tag('menu.html', takes_context=True)
def get_menu(context):
    return {'active_elem': context.get('menu_active_elem', ''), 'user': context.get('user') }
