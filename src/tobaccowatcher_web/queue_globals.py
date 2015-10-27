#from local_settings import *


LANGUAGES = frozenset(['en', 'es', 'ru', 'zh', 'ar', 'id'])


# Mongo DB information
DB_NAME = 'tabac'
COLL_BLOOMBERG_IDS = 'bloomberg_ids'
COLL_BLOOMBERG = 'bloomberg'
COLL_BING_TOBACCO = 'bing_news'
COLL_GOOGLE_TOBACCO = 'google_news_tobacco'
COLL_BING_HEALTH = 'bing_news_health'
COLL_BING_GUNS = 'bing_news_guns'
COLL_STATS = 'daily_stats'
COLL_BING_EBOLA = 'bing_news_ebola'
COLL_GOOGLE_EBOLA = 'google_news_ebola'
COLL_TWITTER_TOBACCO_ARTICLES = 'twitter_tobacco_articles'
COLL_TWITTER_TOBACCO_RESCUED = 'twitter_tobacco_rescued'
COLL_TWITTER_TOBACCO_USERS_STAGING = 'twitter_tobacco_users_staging'
COLL_TWITTER_TOBACCO_STAGING = 'twitter_tobacco_staging'
COLL_TWITTER_FILES_STATS = 'twitter_files_stats'
MONGO_AUTHENTICATION_DATABASE = 'admin'

API_SOURCE = 'api'
BING_API = 'bing'
GOOGLE_API = 'google'
GOOGLE_ALERTS_API = 'google_alerts'

ARTICLE_COLLECTIONS_TO_PROCESS = [ COLL_BING_EBOLA,
                        COLL_GOOGLE_EBOLA,
                        COLL_BING_TOBACCO,
                        COLL_GOOGLE_TOBACCO,
                        COLL_TWITTER_TOBACCO_ARTICLES,
                        ]

ARTICLE_COLLECTIONS = [ #COLL_BING_EBOLA,
                        #COLL_GOOGLE_EBOLA,
                        COLL_BING_TOBACCO,
                        COLL_GOOGLE_TOBACCO,
                        COLL_TWITTER_TOBACCO_ARTICLES,
                        ]

TWEET_STAGING_COLLECTIONS = [
						COLL_TWITTER_TOBACCO_USERS_STAGING,
						COLL_TWITTER_TOBACCO_STAGING,
						]
TWITTER_ARTICLE_COLLECTIONS = [
							COLL_TWITTER_TOBACCO_ARTICLES,
						]

# Mongo Fields
DOCUMENT_IS_PROCESSED_FIELD = 'is_processed'
DOCUMENT_IS_PROCESSED_CLUSTERING = 'is_processed_clustering'
IS_TOBACCO_RELEVANT = 'is_tobacco_relevant'
IS_RELEVANT = 'is_relevant'
CLEANED_CONTENT = 'cleaned_content'
CLEANED_CONTENT_SHORT_LENGTH = 1000
CLEANED_CONTENT_SHORT = 'cleaned_content_short'
CLEANED_CONTENT_TRANSLATED = 'cleaned_content_translated'
IS_NEEDS_TRANSLATION = 'is_needs_translation'
LOCATION_FIELD = 'extracted_locations'
MPOWER_LABEL = 'mpower_labels'
TIMESTAMP = 'timestamp'
SOLR_YEAR_MONTH_DAY = 'year_month_day'
SOLR_YEAR_WEEK = 'year_week'
SOLR_YEAR_MONTH = 'year_month'
CRAWL_TIMESTAMP = 'crawl_timestamp'
HAS_BEEN_DOWNLOADED = 'has_been_downloaded'
UUID = 'uuid'
ID = 'id'
URL = 'url'
JSON_OBJ = 'json_obj'
NUM_DOWNLOAD_ATTEMPTS = 'num_download_attempts'
CONTENTS = 'contents'
DOWNLOAD_TIMESTAMP = 'download_timestamp'
LANGUAGE = 'language'
TITLE = 'title'
TITLE_TRANSLATED = 'title_translated'
COUNTRIES = 'countries'
REGIONS = 'regions'
CONTINENTS = 'continents'
STATES = 'states'
COUNTIES = 'counties'
CITIES = 'cities'
QUERY = 'query'
EDITION = 'edition'
SUMMARY_DETAIL = 'summary_detail'
PARENT = 'parent'
CHILDREN = 'children'
IS_ORIGINAL_DEDUPED = 'is_original_deduped'
IS_FULLY_DEDUPED = 'is_fully_deduped'
SOLR_IS_CHILD = 'is_child'
CREATED_AT = 'created_at'
EXPIRATION_TIME = 'expiration'
TWEET_IS_PROCESSED_TO_EXTRACT_URL = 'is_processed'
TWEET_IDS = 'tweet_ids'
IS_RESCUED = 'is_rescued'
NUM_PROCESS_ATTEMPTS = 'num_process_attempts'
SOLR_TITLE_FOREIGN = 'title_foreign'
SOLR_CLEANED_CONTENT_FOREIGN = 'cleaned_content_foreign'
SOLR_CLEANED_CONTENT_FOREIGN_SHORT = 'cleaned_content_foreign_short'
RELEVANCE_SCORE = 'relevance_score'
LABEL_SCORES = 'label_scores'
SOLR_BEST_LABEL = 'best_label'
SOLR_BEST_LABEL_SCORE = 'best_label_score'
ALERT = 'alert' # The field to store the Google alert URL
COLLECTION = 'collection'
SOURCE_COLLECTION = 'source_collection'

# Rabbit MQ fields
EXCHANGE_NAME = ''
QUEUE_PROCESS_BLOOMBERG_NAME = "queue_process_bloomberg"
QUEUE_PROCESS_BING_NAME_BEFORE_CLEAN = 'queue_bing_process_before_clean'
QUEUE_PROCESS_BING_NAME_AFTER_CLEAN = 'queue_bing_process_after_clean'

MAX_PROCESS_ATTEMPTS = 3


mpower_label_map = {
		'Tobacco Advertising': 'Advertising',
		'Tobacco Bans': 'Smoke-Free',
		'Tobacco Cessation': 'Quitting',
		'Tobacco Harms': 'Harms',
		'Tobacco Industry': 'Industry',
		'Tobacco Products': 'Products',
		'Tobacco Warnings': 'Warnings',
		'Tobacco Prevalence': 'Prevalence',
}


