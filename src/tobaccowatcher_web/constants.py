# -*- coding: utf-8 -*-

from collections import OrderedDict

__all__ = (
    'CATEGORIES',
    'REGIONS',
    'LANGUAGES',
    'category_map',
    'category_styles',
    'category_shorts',
    'reverse_category_map',
    'regions_map',
    'reverse_regions_map',
    'regions_tree',
    'countries_map',
    'feedback_countries',
    'reverse_countries_map',
    'languages_map'
)


CATEGORIES = [
    {
        'id': 'prevalence',
        'name': 'Tobacco Prevalence',
        'class': 'cat-a',
        'short': 'Prevalence',
        'desc': 'Tobacco use prevalence, statistics and trends, including cigarettes and other tobacco products'
    },
    {
        'id': 'smoke-free',
        'name': 'Tobacco Bans',
        'class': 'cat-b',
        'short': 'Smoke-Free',
        'desc': 'Smoking restrictions to reduce secondhand tobacco smoke, environmental or passive smoking'
    },
    {
        'id': 'quitting',
        'name': 'Tobacco Cessation',
        'class': 'cat-c',
        'short': 'Quitting',
        'desc': 'Quitting techniques or cessation products'
    },
    {
        'id': 'warnings',
        'name': 'Tobacco Warnings',
        'class': 'cat-d',
        'short': 'Warnings',
        'desc': 'General warnings about tobacco, including descriptions of anti-smoking campaigns, or descriptions of new or high profile tobacco harms (e.g., cancer)'
    },
    {
        'id': 'advertising',
        'name': 'Tobacco Advertising',
        'class': 'cat-e',
        'short': 'Advertising',
        'desc': 'Strategies used by tobacco industry to promote their products, including descriptions of current advertising strategies and original advertising content'
    },
    {
        'id': 'prices',
        'name': 'Tobacco Prices',
        'class': 'cat-f',
        'short': 'Prices',
        'desc': 'Price changes related to tobacco products, including minimum tobacco prices and taxes on tobacco products'
    },
    {
        'id': 'products',
        'name': 'Tobacco Products',
        'class': 'cat-g',
        'short': 'Products',
        'desc': 'Descriptions of traditional or novel tobacco products, including rare or culturally specific products (e.g. gutka)'
    },
    {
        'id': 'industry',
        'name': 'Tobacco Industry',
        'class': 'cat-h',
        'short': 'Industry',
        'desc': 'Tobacco industry updates, including earning reports, mergers, acquisitions'
    },
    {
        'id': 'other',
        'name': 'Uncategorized',
        'class': 'cat-o',
        'short': 'Uncategorized',
        'desc': 'This includes articles that may fall outside of MPOWER-ED or articles not classified by our automated systems'
    }
]

REGIONS = [
    {
        'id': 'north_america',
        'name': 'North America',
        'countries': [
            {
                'id': 'usa',
                'name': 'United States'
            },
            {
                'id': 'canada',
                'name': 'Canada'
            },
            {
                'id': 'mexico',
                'name': 'Mexico'
            }
        ]
    },
    {
        'id': 'central_america',
        'name': 'Central America',
        'countries': [
            {
                'id': 'jamaica',
                'name': 'Jamaica'
            },
            {
                'id': 'dominica',
                'name': 'Dominica'
            },
            {
                'id': 'trinidad_and_tobago',
                'name': 'Trinidad and Tobago'
            },
            {
                'id': 'bahamas',
                'name': 'Bahamas'
            },
            {
                'id': 'grenada',
                'name': 'Grenada'
            },
            {
                'id': 'cuba',
                'name': 'Cuba'
            },
            {
                'id': 'belize',
                'name': 'Belize'
            },
            {
                'id': 'costa_rica',
                'name': 'Costa Rica'
            },
            {
                'id': 'el_salvador',
                'name': 'El Salvador'
            },
            {
                'id': 'guatemala',
                'name': 'Guatemala'
            },
            {
                'id': 'honduras',
                'name': 'Honduras'
            },
            {
                'id': 'nicaragua',
                'name': 'Nicaragua'
            },
            {
                'id': 'panama',
                'name': 'Panama'
            },
            {
                'id': 'dominican_republic',
                'name': 'Dominican Republic'
            }
        ]
    },
    {
        'id': 'south_america',
        'name': 'South America',
        'countries': [
            {
                'id': 'brazil',
                'name': 'Brazil'
            },
            {
                'id': 'chile',
                'name': 'Chile'
            },
            {
                'id': 'argentina',
                'name': 'Argentina'
            },
            {
                'id': 'uruguay',
                'name': 'Uruguay'
            },
            {
                'id': 'colombia',
                'name': 'Colombia'
            },
            {
                'id': 'venezuela',
                'name': 'Venezuela'
            },
            {
                'id': 'peru',
                'name': 'Peru'
            },
            {
                'id': 'ecuador',
                'name': 'Ecuador'
            },
            {
                'id': 'paraguay',
                'name': 'Paraguay'
            },
            {
                'id': 'guyana',
                'name': 'Guyana'
            },
            {
                'id': 'suriname',
                'name': 'Suriname'
            }
        ]
    },
    {
        'id': 'west_asia',
        'name': 'West Asia',
        'countries': [
            {
                'id': 'turkey',
                'name': 'Turkey'
            },
            {
                'id': 'saudi_arabia',
                'name': 'Saudi Arabia'
            },
            {
                'id': 'united_arab_emirates',
                'name': 'United Arab Emirates'
            },
            {
                'id': 'israel',
                'name': 'Israel'
            },
            {
                'id': 'lebanon',
                'name': 'Lebanon'
            },
            {
                'id': 'bahrain',
                'name': 'Bahrain'
            },
            {
                'id': 'jordan',
                'name': 'Jordan'
            },
            {
                'id': 'syria',
                'name': 'Syria'
            },
            {
                'id': 'armenia',
                'name': 'Armenia'
            },
            {
                'id': 'iraq',
                'name': 'Iraq'
            },
            {
                'id': 'qatar',
                'name': 'Qatar'
            },
            {
                'id': 'azerbaijan',
                'name': 'Azerbaijan'
            },
            {
                'id': 'cyprus',
                'name': 'Cyprus'
            },
            {
                'id': 'kuwait',
                'name': 'Kuwait'
            },
            {
                'id': 'oman',
                'name': 'Oman'
            }
        ]
    },
    {
        'id': 'central_asia',
        'name': 'Central Asia',
        'countries': [
            {
                'id': 'india',
                'name': 'India'
            },
            {
                'id': 'pakistan',
                'name': 'Pakistan'
            },
            {
                'id': 'bangladesh',
                'name': 'Bangladesh'
            },
            {
                'id': 'iran',
                'name': 'Iran'
            },
            {
                'id': 'sri_lanka',
                'name': 'Sri Lanka'
            },
            {
                'id': 'kazakhstan',
                'name': 'Kazakhstan'
            },
            {
                'id': 'afghanistan',
                'name': 'Afghanistan'
            },
            {
                'id': 'nepal',
                'name': 'Nepal'
            },
            {
                'id': 'turkmenistan',
                'name': 'Turkmenistan'
            },
            {
                'id': 'kyrgyzstan',
                'name': 'Kyrgyzstan'
            },
            {
                'id': 'uzbekistan',
                'name': 'Uzbekistan'
            },
            {
                'id': 'bhutan',
                'name': 'Bhutan'
            },
            {
                'id': 'tajikistan',
                'name': 'Tajikistan'
            }
        ]
    },
    {
        'id': 'southeastern_asia',
        'name': 'Southeastern Asia',
        'countries': [
            {
                'id': 'indonesia',
                'name': 'Indonesia'
            },
            {
                'id': 'malaysia',
                'name': 'Malaysia'
            },
            {
                'id': 'thailand',
                'name': 'Thailand'
            },
            {
                'id': 'philippines',
                'name': 'Philippines'
            },
            {
                'id': 'singapore',
                'name': 'Singapore'
            },
            {
                'id': 'cambodia',
                'name': 'Cambodia'
            },
            {
                'id': 'myanmar',
                'name': 'Myanmar'
            },
            {
                'id': 'fiji',
                'name': 'Fiji'
            },
            {
                'id': 'viet_nam',
                'name': 'Viet Nam'
            },
            {
                'id': 'samoa',
                'name': 'Samoa'
            }
        ]
    },
    {
        'id': 'east_asia',
        'name': 'East Asia',
        'countries': [
            {
                'id': 'china',
                'name': 'China'
            },
            {
                'id': 'japan',
                'name': 'Japan'
            },
            {
                'id': 'taiwan',
                'name': 'Taiwan'
            },
            {
                'id': 'hong_kong',
                'name': 'Hong Kong'
            },
            {
                'id': 'mongolia',
                'name': 'Mongolia'
            },
            {
                'id': 'korea__south_',
                'name': 'Korea (South)'
            },
            {
                'id': 'korea__north_',
                'name': 'Korea (North)'
            }
        ]
    },
    {
        'id': 'western_europe',
        'name': 'Western Europe',
        'countries': [
            {
                'id': 'united_kingdom',
                'name': 'United Kingdom'
            },
            {
                'id': 'ireland',
                'name': 'Ireland'
            },
            {
                'id': 'france',
                'name': 'France'
            },
            {
                'id': 'spain',
                'name': 'Spain'
            },
            {
                'id': 'sweden',
                'name': 'Sweden'
            },
            {
                'id': 'italy',
                'name': 'Italy'
            },
            {
                'id': 'belgium',
                'name': 'Belgium'
            },
            {
                'id': 'switzerland',
                'name': 'Switzerland'
            },
            {
                'id': 'germany',
                'name': 'Germany'
            },
            {
                'id': 'greece',
                'name': 'Greece'
            },
            {
                'id': 'netherlands',
                'name': 'Netherlands'
            },
            {
                'id': 'austria',
                'name': 'Austria'
            },
            {
                'id': 'norway',
                'name': 'Norway'
            },
            {
                'id': 'finland',
                'name': 'Finland'
            },
            {
                'id': 'denmark',
                'name': 'Denmark'
            },
            {
                'id': 'iceland',
                'name': 'Iceland'
            },
            {
                'id': 'portugal',
                'name': 'Portugal'
            },
            {
                'id': 'malta',
                'name': 'Malta'
            },
            {
                'id': 'luxembourg',
                'name': 'Luxembourg'
            },
            {
                'id': 'andorra',
                'name': 'Andorra'
            },
            {
                'id': 'isle_of_man',
                'name': 'Isle of Man'
            }
        ]
    },
    {
        'id': 'eastern_europe',
        'name': 'Eastern Europe',
        'countries': [
            {
                'id': 'belarus',
                'name': 'Belarus'
            },
            {
                'id': 'ukraine',
                'name': 'Ukraine'
            },
            {
                'id': 'bulgaria',
                'name': 'Bulgaria'
            },
            {
                'id': 'poland',
                'name': 'Poland'
            },
            {
                'id': 'romania',
                'name': 'Romania'
            },
            {
                'id': 'hungary',
                'name': 'Hungary'
            },
            {
                'id': 'estonia',
                'name': 'Estonia'
            },
            {
                'id': 'lithuania',
                'name': 'Lithuania'
            },
            {
                'id': 'czech_republic',
                'name': 'Czech Republic'
            },
            {
                'id': 'serbia',
                'name': 'Serbia'
            },
            {
                'id': 'croatia',
                'name': 'Croatia (Hrvatska'
            },
            {
                'id': 'latvia',
                'name': 'Latvia'
            },
            {
                'id': 'macedonia',
                'name': 'Macedonia'
            },
            {
                'id': 'slovak_republic',
                'name': 'Slovak Republic'
            },
            {
                'id': 'moldova',
                'name': 'Moldova'
            },
            {
                'id': 'montenegro',
                'name': 'Montenegro'
            },
            {
                'id': 'russia',
                'name': 'Russia'
            },
            {
                'id': 'slovenia',
                'name': 'Slovenia'
            },
            {
                'id': 'yugoslavia',
                'name': 'Yugoslavia'
            }
        ]
    },
    {
        'id': 'africa',
        'name': 'Africa',
        'countries': [
            {
                'id': 'nigeria',
                'name': 'Nigeria'
            },
            {
                'id': 'south_africa',
                'name': 'South Africa'
            },
            {
                'id': 'egypt',
                'name': 'Egypt'
            },
            {
                'id': 'ghana',
                'name': 'Ghana'
            },
            {
                'id': 'kenya',
                'name': 'Kenya'
            },
            {
                'id': 'tanzania',
                'name': 'Tanzania'
            },
            {
                'id': 'malawi',
                'name': 'Malawi'
            },
            {
                'id': 'uganda',
                'name': 'Uganda'
            },
            {
                'id': 'morocco',
                'name': 'Morocco'
            },
            {
                'id': 'zambia',
                'name': 'Zambia'
            },
            {
                'id': 'gambia',
                'name': 'Gambia'
            },
            {
                'id': 'algeria',
                'name': 'Algeria'
            },
            {
                'id': 'ethiopia',
                'name': 'Ethiopia'
            },
            {
                'id': 'sudan',
                'name': 'Sudan'
            },
            {
                'id': 'congo',
                'name': 'Congo'
            },
            {
                'id': 'somalia',
                'name': 'Somalia'
            },
            {
                'id': 'tunisia',
                'name': 'Tunisia'
            },
            {
                'id': 'zimbabwe',
                'name': 'Zimbabwe'
            },
            {
                'id': 'angola',
                'name': 'Angola'
            },
            {
                'id': 'cameroon',
                'name': 'Cameroon'
            },
            {
                'id': 'eritrea',
                'name': 'Eritrea'
            },
            {
                'id': 'madagascar',
                'name': 'Madagascar'
            },
            {
                'id': 'namibia',
                'name': 'Namibia'
            },
            {
                'id': 'rwanda',
                'name': 'Rwanda'
            },
            {
                'id': 'senegal',
                'name': 'Senegal'
            },
            {
                'id': 'sierra_leone',
                'name': 'Sierra Leone'
            },
            {
                'id': 'botswana',
                'name': 'Botswana'
            },
            {
                'id': 'lesotho',
                'name': 'Lesotho'
            },
            {
                'id': 'liberia',
                'name': 'Liberia'
            },
            {
                'id': 'mozambique',
                'name': 'Mozambique'
            },
            {
                'id': 'swaziland',
                'name': 'Swaziland'
            }
        ]
    },
    {
        'id': 'south_pacific',
        'name': 'South Pacific',
        'countries': [
            {
                'id': 'australia',
                'name': 'Australia'
            },
            {
                'id': 'new_zealand',
                'name': 'New Zealand'
            }
        ]
    }
]

REGIONS = sorted(REGIONS, key=lambda x: x['name'])
REGIONS = [dict(id=i['id'], name=i['name'], countries=[j for j in sorted(i['countries'], key=lambda x: x['name'])]) for i in REGIONS]

LANGUAGES = [
    {
        'id': 'en',
        'name': 'English'
    },
    {
        'id': 'ar',
        'name': 'Arabic'
    },
    {
        'id': 'zh',
        'name': 'Chinese'
    },
    {
        'id': 'id',
        'name': 'Indonesian'
    },
    {
        'id': 'ru',
        'name': 'Russian'
    },
    {
        'id': 'es',
        'name': 'Spanish'
    }
]

category_map = OrderedDict([(i['id'], i['name']) for i in CATEGORIES])
category_styles = OrderedDict([(i['id'], i['class']) for i in CATEGORIES])
category_shorts = OrderedDict([(i['name'], i['short']) for i in CATEGORIES])

reverse_category_map = {}

for key, value in category_map.iteritems():
    reverse_category_map[value] = key

# Remapping of previous category names
reverse_category_map['Tobacco Use'] = 'prevalence'
reverse_category_map['Tobacco Harms'] = 'prevalence'

regions_map = OrderedDict([(i['id'], i['name']) for i in REGIONS])
countries_map = OrderedDict([(j['id'], j['name']) for i in REGIONS for j in i['countries']])
languages_map = OrderedDict([(i['id'], i['name']) for i in LANGUAGES])
reverse_regions_map = OrderedDict([(i['name'], i['id']) for i in REGIONS])
reverse_countries_map = OrderedDict([(j['name'], j['id']) for i in REGIONS for j in i['countries']])

feedback_countries = [[j['id'], j['name'],i['id']] for i in REGIONS for j in i['countries']]
feedback_countries = sorted(feedback_countries, key=lambda x: x[1])

regions_map['global'] = 'global'
countries_map['global'] = 'global'

regions_tree = [
    {
        'id': r['id'],
        'name': r['name'],
        'countries': [
            {
                'id': c['id'],
                'name': c['name']
            } for c in r['countries']
        ]
    } for r in REGIONS
]

regions_tree.append({'id': 'global', 'name': 'Global'})
