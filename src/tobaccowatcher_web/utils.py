# -*- coding: utf-8 -*-

from __future__ import division
import copy
from collections import Counter
from datetime import datetime
import logging
import re
import urllib

import bson.json_util
from django.conf import settings
from django.utils.encoding import smart_str
import gevent
from gevent import Timeout
import memcache

from .constants import *
from pysolr import Solr
from solr.solr_mongo_searcher import SolrMongoSearcher
from solr.solr_query import Query


logger = logging.getLogger(__name__)

# <http://lucene.apache.org/core/4_0_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#Escaping_Special_Characters>
# Excludes quotation marks, since we have special handling for those.
LUCENE_SPECIAL_CHARACTERS = re.compile(
    r'\+|&&|\|\||!|\{|\}\[|\]|\^|~|\?|:|\\|/')


DEFAULT_LIMIT = 10

__all__ = (
    'sanitize_search_params',
    'extract_search_params_from_json',
    'extract_search_params',
    'build_search_url',
    'get_counts',
    'get_filtered_news',
    'get_single_article',
    'update_articles_for_template',
    'get_data_statistics',
)

FILTER_SOLR_KEYS = [
    '_id',
    '_ts',
    '_version_',
    'ns',
    'type',
]


def get_memcached():
    return memcache.Client(settings.MEMCACHED_SERVERS)


def hash_memcached_key(key):
    import hashlib
    hash_object = hashlib.md5(key)
    return hash_object.hexdigest()


def get_solr():
    return Solr(settings.SOLR_URL, auth=(settings.SOLR_USERNAME, settings.SOLR_PASSWORD))


def get_solr_meta():
    return Solr(settings.SOLR_META_URL, auth=(settings.SOLR_USERNAME, settings.SOLR_PASSWORD))


def solr_mongo_searcher():
    return SolrMongoSearcher(None, get_solr)


def extract_search_params(data):
    search_for = {
        'terms': data.get('t', ''),
        'categories': data.getlist('c', []),
        'regions': data.getlist('r', []),
        'countries': data.getlist('co', []),
        'languages': data.getlist('la', []),
        'start': data.get('st', None),
        'end': data.get('e', None),
        'limit': data.get('l', DEFAULT_LIMIT),
        'skip': data.get('s', 0),
        'include_duplicates': data.get('dups', False),
        'importance': data.get('i')
    }

    return search_for


def extract_search_params_from_json(data):
    search_for = {
        'terms': data.get('t', ''),
        'categories': data.get('c', []),
        'regions': data.get('r', []),
        'countries': data.get('co', []),
        'languages': data.get('la', []),
        'start': data.get('st', None),
        'end': data.get('e', None),
        'limit': data.get('l', DEFAULT_LIMIT),
        'skip': data.get('s', 0),
        'include_duplicates': data.get('dups', False),
        'importance': data.get('i')
    }

    return search_for


def parse_language_section(words):
    lang, section = None, None
    remove_these = []

    for word in words:
        if word.startswith('lang:'):
            lang = word[5:]
            remove_these.append(word)
        elif word.startswith('section:'):
            section = word[8:]
            remove_these.append(word)

    return lang, section, remove_these


def parse_phrases(words):
    temp = []
    remove_these = []
    phrases = []

    for word in words:
        if word[0] == '"':
            temp.append(word)
            remove_these.append(word)
        elif word[-1] == '"':
            temp.append(word)
            phrases.append(' '.join(temp))
            remove_these.append(word)
            temp = []
            continue
        elif temp:
            temp.append(word)
            remove_these.append(word)

    return phrases, remove_these

def parse_ors(words, connector='or'):
    prev = ''
    or_words = []
    is_or = False
    remove_these = []
    for word in words:
        # Parse out pairs connected by `connector`
        if word.lower() == connector:
            or_words.append(prev)
            remove_these.append(prev)
            remove_these.append(word)
            is_or = True
        elif is_or:
            or_words.append(word)
            remove_these.append(word)
            is_or = False

        prev = word

    return or_words, remove_these


def sanitize_search_params(_search_for):
    search_for = copy.deepcopy(_search_for)

    if search_for['importance']:
        search_for['importance'] = settings.POPULAR_IMPORTANCE

    # TODO: This can probably be split out into one function which is passed in _search_for['terms']
    lang, section = None, None
    if search_for['terms']:
        # Normalize whitespace.
        words = search_for['terms'].split()
        exclude_keywords = []

        lang, section, remove_these = parse_language_section(words)

        # Parse phrases out. Some of the actions below will reorder the quoted phrases.
        phrases, remove_these_too = parse_phrases(words)

        or_words, tmp = parse_ors(words, 'or')
        and_words, tmp = parse_ors(words, 'and')
        remove_these_too = remove_these_too + tmp

        for word in words:
            if word[0] == '-':
                # Append the keyword without the minus
                exclude_keywords.append(word[1:])


        # Do a symmetric diff of terms to remove any terms that are parsed out for kwargs
        words = set(words) ^ set(remove_these) ^ set(remove_these_too)
        words = ' '.join(words) + ' OR '.join(or_words) + ' '.join(phrases)
        words = words + ' AND '.join(and_words)
        words = LUCENE_SPECIAL_CHARACTERS.sub(r'\\\0', words)

        # If there are an odd number of quotes, escape the last one.
        if '"' in words and words.count('"') % 2 == 1:
            left, sep, right = words.rpartition('"')
            words = left + r'\"' + right

        if section in ['title', 'article', 'beginning'] and (words or exclude_keywords):
            # "article" defaults to keyword search, and that does not need its own kwarg
            if section != 'article':
                # Putting this in a list gets the query builder to surround the
                # value with parentheses instead of quotes.
                if words:
                    search_for[section] = [words]
                if exclude_keywords:
                    search_for['exclude_{}'.format(section)] = [' '.join(exclude_keywords)]

                # At this point you don't need "words" anymore as it is going to be searched in a specific section
                del words
            else:
                # Putting this in a list gets the query builder to surround the
                # value with parentheses instead of quotes.
                if words:
                    search_for['words'] = [words]
                if exclude_keywords:
                    search_for['exclude_keywords'] = [' '.join(exclude_keywords)]
        elif (words or exclude_keywords):
            if words:
                search_for['words'] = [words]
            if exclude_keywords:
                search_for['exclude_keywords'] = [' '.join(exclude_keywords)]


    categories = []
    category_ids = []

    for category in sorted(search_for['categories']):
        if category in category_map:
            name = category_map[category]

            if name not in categories:
                categories.append(name)
                category_ids.append(category)

    search_for['categories'] = categories
    search_for['category_ids'] = category_ids

    regions = []
    region_ids = []

    for region in sorted(search_for['regions']):
        if region in regions_map:
            name = regions_map[region]

            if name not in regions:
                regions.append(name)
                region_ids.append(region)

    search_for['regions'] = regions
    search_for['region_ids'] = region_ids

    countries = []
    country_ids = []

    for country in sorted(search_for['countries']):
        if country in countries_map:
            name = countries_map[country]

            if name not in countries:
                countries.append(name)
                country_ids.append(country)

    search_for['countries'] = countries
    search_for['country_ids'] = country_ids

    languages = []
    language_ids = []

    for language in sorted(search_for['languages']):
        if language in languages_map:
            name = languages_map[language]

            if name not in languages:
                languages.append(name)
                language_ids.append(language)

    if lang and lang not in languages and lang in languages_map:
        name = languages_map[lang]
        languages.append(name)
        language_ids.append(lang)
    elif lang == 'source':
        language_ids = []

    search_for['languages'] = list(set(language_ids))
    search_for['language_ids'] = list(set(language_ids))

    search_for['include_duplicates'] = bool(search_for['include_duplicates'])

    for key in ['start', 'end']:
        value = search_for[key]

        try:
            value = datetime.strptime(value, '%m/%d/%Y')

        except:
            pass

        if isinstance(value, datetime):
            search_for[key] = int(value.strftime('%s'))
            search_for[key + '_text'] = value.strftime('%m/%d/%Y')

        else:
            search_for[key] = None
            search_for[key + '_text'] = ''

    if search_for['end']:
        # The end date should be inclusive. This ensures we get all documents until 11:59:59pm on that date.
        search_for['end'] += 86399

    if search_for['start'] and search_for['end']:
        if search_for['start'] > search_for['end'] or \
           search_for['start'] == search_for['end']:
            search_for['end'] = search_for['start'] + 86399

    for key in ['limit', 'skip']:
        value = search_for[key]

        try:
            value = abs(int(value))

        except:
            pass

        if isinstance(value, int):
            if key == 'limit' and value > 100:
                value = 100

            search_for[key] = value

        else:
            if key == 'limit':
                search_for[key] = DEFAULT_LIMIT

            else:
                search_for[key] = 0

    return search_for


def build_search_url(search_for):
    params = {
        't': ' '.join(search_for.get('words', [])),
        'c': search_for.get('category_ids', []),
        'r': search_for.get('region_ids', []),
        'co': search_for.get('country_ids', []),
        'la': search_for.get('language_ids', [])
    }

    return urllib.urlencode(params, True)


def build_query(categories=None, words=None,
                regions=None, countries=None,
                languages=None, include_duplicates=False,
                start=None, end=None, uuid=None, **kwargs):
    # Check that each argument type is valid.
    if categories is not None and type(categories) is not list:
        raise ValueError("categories must be a list")

    if regions is not None and type(regions) is not list:
        raise ValueError("regions must be a list")

    if countries is not None and type(countries) is not list:
        raise ValueError("countries must be a list")

    if languages is not None and type(languages) is not list:
        raise ValueError("languages must be a list")

    if start is not None and type(start) is not int:
        raise ValueError("start timestamp must be an int")

    if end is not None and type(end) is not int:
        raise ValueError("end timestamp must be an int")

    query = Query()
    query.keywords = words
    query.mpower_labels = categories
    query.regions = regions
    query.countries = countries
    query.languages = languages
    query.include_duplicates = include_duplicates
    query.start_timestamp = start
    query.end_timestamp = end
    query.uuid = uuid

    query.title = kwargs.get('title')
    query.exclude_title = kwargs.get('exclude_title')
    query.beginning = kwargs.get('beginning')
    query.exclude_keywords = kwargs.get('exclude_keywords')
    query.exclude_beginning = kwargs.get('exclude_beginning')

    """
    query.foreign_title = None
    query.foreign_exclude_title = None
    query.foreign_keywords = None
    query.foreign_exclude_keywords = None
    query.foreign_beginning = None
    query.foreign_exclude_beginning = None
    """

    return query


ROUNDS_FORMATS = {'day': '%Y-%m-%d:1',
                  'week': '%Y-U%U:%w',
                  'month': '%Y-%m:1'}


def _counts_for_query(query, rounds):
    if rounds == 'day':
        group_field = 'year_month_day'
    elif rounds == 'week':
        group_field = 'year_week'
    elif rounds == 'month':
        group_field = 'year_month'
    else:
        raise ValueError('invalid rounds unit "{}"'.format(rounds))
    counts = Counter()
    # We don't explicitly iterate through all of the result pages, in
    # order to save network accesses.  Instead, we ask for enough rows
    # to cover all the results we expect (2**16 = 65536 days > 175 yr),
    # and assume everything is returned in the first response.
    params = {'group': 'true', 'group.field': group_field, 'rows': 2**16}
    results = get_solr().search(query.query_string(), **params)
    groups = results.grouped[group_field]['groups']
    for group in groups:
        # Reformat the Solr date as an MDY date for the plotting
        # library's use.  The ":1" is a hack to make strptime() use
        # the value of %U when *rounds* is "week".
        date = datetime.strptime(group['groupValue'] + ':1',
                                 ROUNDS_FORMATS[rounds])
        counts[date.strftime('%m/%d/%Y')] += group['doclist']['numFound']
    return counts


def get_counts(search_for, rounds, as_percentage=True):
    """Return the number of articles matching *search_for*, broken down
    by the time period in *rounds*, as a list of dict objects with keys
    ``'date'`` and ``'count'``.  *rounds* is one of ``'day'``,
    ``'week'``, or ``'month'``.  If *as_percentage* is True, each count
    is given as a percentage of the total number of articles in the
    corresponding time period; otherwise, it is the raw article count.
    """
    query = build_query(**search_for)
    counts = _counts_for_query(query, rounds)
    if as_percentage:
        total_query = build_query(start=search_for['start'],
                                  end=search_for['end'])
        total_counts = _counts_for_query(total_query, rounds)

        # `counts` must contain the same keys as `total_counts`
        # if that is not the case, fill in any missing values with 0
        if len(total_counts) > len(counts):
            for key in total_counts.keys():
                if key not in counts.keys():
                    counts[key] = 0

        return [{'date': k, 'count': counts[k] / total_counts[k] * 100}
                for k in counts]
    return [{'date': k, 'count': v} for k, v in counts.iteritems()]


def get_regions_and_countries(article):
    regions, countries = {}, {}
    try:
        t1 = article.get('regions', ['Global/Non-Specific'])
        t2 = article.get('countries', [])

        try:
            t1.remove(None)
            t2.remove(None)

        except:
            pass

        if len(t1) == 0 or 'global' in t1:
            t1 = ['Global/Non-Specific']

        if len(t2) == 0:
            t2 = ['Global/Non-Specific']

        for region in t1:
            regions[region] = reverse_regions_map.get(region, 'global')
        for country in t2:
            countries[country] = reverse_countries_map.get(country, '')

    except:
        regions = {'Global/Non-Specific': ''}
        countries = {'Global/Non-Specific': ''}
    return regions, countries


def get_filtered_news(search_for, limit=DEFAULT_LIMIT, skip=0):
    result = []

    if limit != DEFAULT_LIMIT:
        search_for['limit'] = limit

    if skip != 0:
        search_for['skip'] = skip

    articles, num_results = query_documents(**search_for)

    result = update_articles_for_template(articles, search_for=search_for)

    return result, num_results


def get_single_article(uuid):
    articles, num_results = query_documents(
        uuid=uuid, include_duplicates=True, limit=1)
    if num_results:
        article = next(iter(articles))
        content = article['cleaned_content'].replace('\n', '<br />')
        article = update_articles_for_template([article])[0]
        article['full_content'] = content
        return article
    return None


def update_articles_for_template(articles, search_for=None):
    result = []
    for article in articles:
        article['language_full'] = languages_map.get(article['language'])
        title = article['title'].rstrip(' ')

        if len(title) <= 61:
            short_title = title[0:60]

        else:
            if title[61] != ' ':
                short_title = title[0:60] + '...'

            else:
                short_title = title[0:60]

        content = article.get('cleaned_content') or article.get('cleaned_content_short', '')

        # Work with a subset of the content first then get the first 500/200 characters after replacement
        cleaned_content = '%s...' % content[:500].rstrip(' ').replace('\n', '<br />')
        short_cleaned_content = '%s...' % cleaned_content.replace('<br />', ' ').rstrip(' ')[:200]

        if search_for:
            if article['timestamp'] < search_for['start'] \
               or article['timestamp'] > search_for['end']:
                continue

        d = datetime.fromtimestamp(article['timestamp'])
        hours = (datetime.utcnow() - d).total_seconds() // 3600

        if hours == 0:
            minutes = (datetime.utcnow() - d).total_seconds() // 60
            article['datetime'] = '%s minutes ago' % int(minutes)
        elif hours < 24:
            article['datetime'] = '%s hour%s ago' % (int(hours), 's' if hours > 1 else '')

        elif hours < 48:
            article['datetime'] = 'Yesterday'

        else:
            article['datetime'] = d.strftime('%m/%d/%Y')

        mpower_label = article.get('best_label')
        if mpower_label in reverse_category_map:
            article['category'] = category_styles[reverse_category_map.get(mpower_label)]
            article['category_text'] = category_shorts.get(mpower_label)

        language = ''
        language_id = ''

        if 'language' in article:
            language = languages_map.get(article.get('language'), '')

            if language:
                language_id = article.get('language')

        regions, countries = get_regions_and_countries(article)

        result.append({
            'category': article.get('category', ''),
            'category_text': article.get('category_text', '').replace('Tobacco ', ''),
            'title': title,
            'short_title': short_title,
            'datetime': article.get('datetime'),
            'cleaned_content': cleaned_content,
            'short_cleaned_content': short_cleaned_content,
            'continents': article.get('continents'),
            'countries': countries,
            'regions': regions,
            'language': language,
            'language_id': language_id,
            'url': article.get('url'),
            'uuid': article.get('uuid'),
            'raw_datetime': d.strftime('%b %d, %Y')
        })
    return result


# TODO test search by languages, countries and words with ""

def query_documents_with_timeout(*args, **kwargs):
    timeout = Timeout(30)
    timeout.start()

    try:
        gevent.sleep(0.0001)
        return query_documents(*args, **kwargs)

    except:
        return [[], 0]

    finally:
        timeout.cancel()


def query_documents(limit=DEFAULT_LIMIT, skip=0,
                    categories=None, words=None,
                    regions=None, countries=None,
                    languages=None, include_duplicates=False,
                    start=None, end=None, id_only=False, uuid=None,
                    importance=None, **kwargs):
    '''
    Get documents from the database to display to the user.
    limit: how many articles to return (max)
    skip: how many articles to skip. Useful for getting the next batch or articles.

    The following are arguments for specifying the query. All arguments are optional. Providing
    no arguments will produce a list of tobacco relevant documents that are in the database.
    categories: a list of category names. Returns documents that match at least one of the categories.
    Valid options are (all lower case): prevalence, smoke-free, quitting, warnings, advertising, prices, products, industry
    keywords: a list of strings, each containing a string to search for. Returns documents matching at least one of the queries.
    start: return documents that occur after this timestamp (inclusive)
    end: return documents that occur before this timestamp (inclusive)
    regions: a list of region names. Returns documents that match at least one of the regions. Valid options are (all lower case):
        North America
        Central America
        South America
        West Asia
        Central Asia
        Southeastern Asia
        East Asia
        Western Europe
        Eastern Europe
        Africa
        Australia

    The return value will a list of articles.

    NOTE: kwarg "keywords" has been changed to "words" as this was the name used previously.
    Any changes that used "keywords" for some reason and rely on this function should be changed.
    '''

    searcher = solr_mongo_searcher()

    query = build_query(categories, words,
                        regions, countries,
                        languages, include_duplicates,
                        start, end, uuid, **kwargs)

    fields_to_include = {
        'title': 1,
        'mpower_labels': 1,
        'cleaned_content': 1,
        'timestamp': 1,
        'url': 1,
        'regions': 1,
        'continents': 1,
        'countries': 1,
        'language': 1,
        'uuid': 1,
        'title_translated': 1,
        'cleaned_content_translated': 1,
    }

    mc = get_memcached()
    # In order to avoid various problems with keys that contain spaces
    # or are too long, we use MD5 to construct a fixed-length key.
    cache_key = hash_memcached_key('query/{}/{:d}/{}/{}/{}'.format(
        smart_str(query.query_string()), id_only, limit, skip, str(importance)))

    cache_result = mc.get(cache_key)
    if cache_result is None:  # cache miss
        result = searcher.search(
            query.query_string(),
            id_only=id_only, fields_to_include=fields_to_include,
            limit=limit, skip=skip, importance=importance,
            **{'q.op': 'AND'}  # default to joining terms with AND
            )
        # The selection of 600 seconds (10 minutes) is arbitrary, and
        # should be tuned according to actual update patterns.
        mc.set(cache_key, bson.json_util.dumps(result), time=600)
    else:
        result = bson.json_util.loads(cache_result)

    num_results = result[0]['total']
    articles = result[1]

    return articles, num_results

