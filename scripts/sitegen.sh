#!/bin/bash
SITES="/etc/apache2/sites-available"
cd $SITES
cp /etc/apache2/invtr.co /etc/apache2/sites-available/$1
mkdir /srv/www/invtr.co/$1
cp -r /srv/www/invtr.co/template/* /srv/www/invtr.co/$1

sed -i 's/\%SUBDOMAIN\%/'$1'/g' $SITES/$1

/usr/sbin/a2ensite $1
/etc/init.d/apache2 reload
