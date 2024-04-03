
#  'default': dj_database_url.config(
#         default='postgres://nzanzu_lwanzo:1VcBtetKT2KPx7fKWunNGuQZ9UOJOVa2@dpg-co1evb0cmk4c73e9d090-a/mehktub_db',
#         conn_max_age=600
#     )

# DATABASE - POSTGRESQL - STUFF - FOR RENDER
DB_PASSWORD = "1VcBtetKT2KPx7fKWunNGuQZ9UOJOVa2"
DB_INTERNAL_URL = "postgres://nzanzu_lwanzo:1VcBtetKT2KPx7fKWunNGuQZ9UOJOVa2@dpg-co1evb0cmk4c73e9d090-a/mehktub_db"
DB_EXTERNAL_URL = "postgres://nzanzu_lwanzo:1VcBtetKT2KPx7fKWunNGuQZ9UOJOVa2@dpg-co1evb0cmk4c73e9d090-a.frankfurt-postgres.render.com/mehktub_db"
PSQL_COMMAND = "PGPASSWORD=1VcBtetKT2KPx7fKWunNGuQZ9UOJOVa2 psql -h dpg-co1evb0cmk4c73e9d090-a.frankfurt-postgres.render.com -U nzanzu_lwanzo mehktub_db"
