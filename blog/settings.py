
from pathlib import Path
import os 
import dj_database_url 

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-zpzt&h*!p=_ki^ld4zqxbtmp!^7z1ca77@!@bc-h6nltqa3sjo'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["localhost"]

# Application definition

INSTALLED_APPS = [
    'whitenoise.runserver_nostatic',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'extra.apps.ExtraConfig',
    'forum.apps.ForumConfig',
    'management.apps.ManagementConfig',
    'administration.apps.AdministrationConfig',
    'post.apps.PostConfig',
    'crispy_forms',
    'crispy_bootstrap5',
    'froala_editor',
    'waitress'
]

CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'blog.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR,'blog/templates')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'blog.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': dj_database_url.config(
        default='postgres://nzanzu_lwanzo:1VcBtetKT2KPx7fKWunNGuQZ9UOJOVa2@dpg-co1evb0cmk4c73e9d090-a/mehktub_db',
        conn_max_age=600
    )
}

"""
{
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mehktub_db',
        'HOST':'127.0.0.1',
        'PORT':'3306',
        'USER':'root',
        'PASSWORD':'MUHAYRWA555-DEV',
        'OPTIONS':{
            'charset':'utf8mb4',
            'collation':'utf8mb4_unicode_ci'
        }    
    }
"""

# DATABASE - POSTGRESQL - STUFF - FOR RENDER
DB_PASSWORD = "1VcBtetKT2KPx7fKWunNGuQZ9UOJOVa2"
DB_INTERNAL_URL = "postgres://nzanzu_lwanzo:1VcBtetKT2KPx7fKWunNGuQZ9UOJOVa2@dpg-co1evb0cmk4c73e9d090-a/mehktub_db"
DB_EXTERNAL_URL = "postgres://nzanzu_lwanzo:1VcBtetKT2KPx7fKWunNGuQZ9UOJOVa2@dpg-co1evb0cmk4c73e9d090-a.frankfurt-postgres.render.com/mehktub_db"
PSQL_COMMAND = "PGPASSWORD=1VcBtetKT2KPx7fKWunNGuQZ9UOJOVa2 psql -h dpg-co1evb0cmk4c73e9d090-a.frankfurt-postgres.render.com -U nzanzu_lwanzo mehktub_db"

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'fr-FR'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR,"staticfiles")
STATIC_URL = 'static/'
MEDIA_URL = 'media/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR,'blog/static')
]
MEDIA_ROOT = os.path.join(BASE_DIR,'blog/media')

if not DEBUG:

    STATIC_ROOT = os.path.join(BASE_DIR,'staticfiles')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email sending configuration
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False 
EMAIL_HOST_USER = 'mehktub-center@gmail.com'
EMAIL_HOST_PASSWORD = ''
