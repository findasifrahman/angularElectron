#!/bin/bash

(
  flock -n 9 || exit 1
  # ... commands executed under lock ...
  cd /home/pi/Desktop/angularElectron   && npm start
) 9>/var/lock/mylockfile

#lockfile -r 0 /tmp/the.lock || exit 1
#cd /home/pi/Desktop/angularElectron   && npm start
#rm -f /tmp/the.lock 
