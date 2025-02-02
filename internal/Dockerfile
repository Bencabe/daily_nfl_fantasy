FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . /app/

# Install cron
RUN apt-get update && apt-get install -y cron

# Create the log file
RUN touch /var/log/cron.log

# Create crontab file
RUN echo "* * * * * echo 'Cron is running' >> /var/log/cron.log 2>&1" > /etc/cron.d/crontab
RUN echo "*/1 12-23 * * * /usr/local/bin/python /app/update_gameweek_stats.py 1 >> /var/log/cron.log 2>&1" >> /etc/cron.d/crontab
RUN echo "0 2 * * * /usr/local/bin/python /app/update_current_gameweek.py >> /var/log/cron.log 2>&1" >> /etc/cron.d/crontab
RUN echo "0 2 * * * /usr/local/bin/python /app/update_gameweek_stats.py 0 >> /var/log/cron.log 2>&1" >> /etc/cron.d/crontab
RUN echo "0 1 * * * /usr/local/bin/python /app/update_gameweeks.py >> /var/log/cron.log 2>&1" >> /etc/cron.d/crontab
RUN echo "0 3 * * * /usr/local/bin/python /app/update_season_fixtures.py >> /var/log/cron.log 2>&1" >> /etc/cron.d/crontab

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/crontab

# Apply cron job
RUN crontab /etc/cron.d/crontab

EXPOSE 5001

# Create entrypoint script
RUN echo '#!/bin/bash' > /entrypoint.sh
RUN echo 'printenv | grep -v "no_proxy" >> /etc/environment' >> /entrypoint.sh
RUN echo 'service cron start' >> /entrypoint.sh
RUN echo 'tail -f /var/log/cron.log & python fast_api_server.py' >> /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
